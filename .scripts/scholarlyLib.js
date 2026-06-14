/**
 * scholarlyLib.js — Shared helpers for the step-3 scholarly-consensus batch pipeline.
 *
 * Responsibilities:
 *   - Load CLAUDE_API_KEY from .env via dotenv (never logged) and build the client.
 *   - Read the biblical-contradiction-scholar / biblical-scholar-auditor agent personas
 *     from .claude/agents and compose the generator/auditor system prompts + tool schemas.
 *   - Thin wrappers over the Anthropic Message Batches API (submit / poll / collect).
 *
 * NOTHING here ever prints the API key.
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const AnthropicSDK = require('@anthropic-ai/sdk');
const Anthropic = AnthropicSDK.Anthropic || AnthropicSDK.default || AnthropicSDK;

const AGENTS_DIR = path.join(__dirname, '..', '.claude', 'agents');

const CONSENSUS_NAMES = [
    'genuine_contradiction',
    'probable_contradiction',
    'genuinely_disputed',
    'probable_harmonization',
    'apparent_only',
];

// ---------------------------------------------------------------- key + client
function loadApiKey() {
    const key = process.env.CLAUDE_API_KEY;
    if (!key) {
        throw new Error('CLAUDE_API_KEY is not set. Add it to .env (it is loaded via dotenv; '
            + 'this pipeline never reads or prints the key).');
    }
    return key;
}

function getClient() {
    return new Anthropic({ apiKey: loadApiKey() });
}

// ---------------------------------------------------------------- personas
/** Read an agent .md, strip YAML frontmatter and the harness "# Persistent Agent Memory" tail. */
function readPersona(file) {
    const txt = fs.readFileSync(path.join(AGENTS_DIR, file), 'utf8');
    let body = txt.replace(/^---[\s\S]*?\n---\s*\n/, '');
    const cut = body.indexOf('# Persistent Agent Memory');
    if (cut !== -1) body = body.slice(0, cut);
    return body.trim();
}

const GEN_TASK = `

---

## THIS TASK — scholarly-consensus grading + textual-criticism flags (database batch)

You are NOT writing summary/commentary/scholarship here; those already exist and are given to you as evidence. For each contradiction in the user JSON, assess exactly two things and return them through the \`record_scholarly_assessments\` tool.

1. **scholarly_consensus** — one of: ${CONSENSUS_NAMES.join(', ')}. Grade how MAINSTREAM CRITICAL biblical scholarship weighs whether this is a real, unresolvable contradiction — not your own view, and not the apologetic view. Weigh the supplied summary/commentary/scholarship and the cited verses. If you are genuinely unsure where consensus lands, choose \`genuinely_disputed\` rather than guessing a stronger label.

2. **textual_variant_involved** (boolean) — true ONLY when a KNOWN manuscript / textual-critical variant materially bears on the contradiction (e.g. the long ending of Mark 16:9-20, the pericope adulterae John 7:53-8:11, the Comma Johanneum 1 John 5:7-8, an LXX-vs-MT divergence, a Samuel/Chronicles numeric corruption). When true, also supply:
   - **variant_description**: one sentence on the variant.
   - **critical_apparatus_ref**: the apparatus or critical source that locates it (e.g. "NA28 apparatus at John 7:53"; "BHS apparatus at 2 Sam 24:9"; "Metzger, Textual Commentary, 2nd ed."). Cite ONLY an apparatus/source you are confident exists.
   When false, set variant_description and critical_apparatus_ref to the empty string "".

Also give a one-sentence **reasoning** for the consensus call (the auditor reads it; it is not stored in the DB).

**NO FABRICATION.** Never invent a manuscript variant, an apparatus location, or a scholarly consensus. If you cannot cite a specific apparatus, set textual_variant_involved=false rather than inventing one. Apparatus citations are the single highest-risk field — only assert what you genuinely know.

**If revising:** an entry may include a prior \`assessment\` and \`audit_feedback\` from the auditor. Correct exactly what was flagged and keep what was already correct.

Return EVERY id you are given, exactly once, via the tool.`;

const AUDIT_TASK = `

---

## THIS TASK — audit step-3 assessments for a database batch

Each entry has its source fields (question, summary, commentary, scholarship, answers, references) plus a generated \`assessment\` (scholarly_consensus, textual_variant_involved, variant_description, critical_apparatus_ref, reasoning). Audit ONLY the generated assessment, and return your verdict for every id through the \`record_audit\` tool.

Check, per entry:
- **scholarly_consensus** — is the label defensible for mainstream critical scholarship given the evidence? Flag if it overstates (e.g. labels a widely-harmonized case \`genuine_contradiction\`) or understates a real, well-known contradiction.
- **textual_variant_involved / critical_apparatus_ref** — THE HIGHEST-RISK FIELD. If true, confirm the variant is real AND that the apparatus reference actually locates it. An invented or wrong apparatus citation, or a "variant" that does not actually bear on the contradiction, is a **high**-severity HALLUCINATION. If false but a major relevant variant was clearly missed, flag it.

Do NOT flag mere interpretive preference or denominational difference — only factual errors, fabrications, and indefensible labels.

severity scale: **high** = fabrication / factually wrong / indefensible label; **medium** = an overstated or understated label, or a weak-but-not-fabricated citation; **low** = nitpick or stylistic. Set status='clean' when there are no issues, otherwise status='issues' with the list. For each issue give: field, severity, problem, correction.`;

function genSystem() { return readPersona('biblical-contradiction-scholar.md') + GEN_TASK; }
function auditSystem() { return readPersona('biblical-scholar-auditor.md') + AUDIT_TASK; }

// ---------------------------------------------------------------- tool schemas
const GEN_TOOL = {
    name: 'record_scholarly_assessments',
    description: 'Record the scholarly-consensus grade and textual-variant flags for each contradiction.',
    input_schema: {
        type: 'object',
        properties: {
            assessments: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        scholarly_consensus: { type: 'string', enum: CONSENSUS_NAMES },
                        textual_variant_involved: { type: 'boolean' },
                        variant_description: { type: 'string', description: 'Empty string when no variant is involved.' },
                        critical_apparatus_ref: { type: 'string', description: 'Empty string when no variant is involved.' },
                        reasoning: { type: 'string' },
                    },
                    required: ['id', 'scholarly_consensus', 'textual_variant_involved', 'reasoning'],
                },
            },
        },
        required: ['assessments'],
    },
};

const AUDIT_TOOL = {
    name: 'record_audit',
    description: 'Record audit verdicts for each assessed contradiction.',
    input_schema: {
        type: 'object',
        properties: {
            results: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        status: { type: 'string', enum: ['clean', 'issues'] },
                        issues: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: { type: 'string' },
                                    severity: { type: 'string', enum: ['high', 'medium', 'low'] },
                                    problem: { type: 'string' },
                                    correction: { type: 'string' },
                                },
                                required: ['field', 'severity', 'problem'],
                            },
                        },
                    },
                    required: ['id', 'status'],
                },
            },
        },
        required: ['results'],
    },
};

// ---------------------------------------------------------------- user messages
/** Compact source view of an entry for the model (drops internal bookkeeping). */
function entrySource(e) {
    return {
        id: e.id,
        question: e.question,
        category: e.category,
        contradiction_type: e.contradiction_type,
        testament_scope: e.testament_scope,
        books_in_tension: e.books_in_tension,
        summary: e.summary,
        commentary: e.commentary,
        scholarship: e.scholarship,
        answers: (e.answers || []).map(a => ({
            answer: a.answer,
            answer_explanation: a.answer_explanation,
            references: a.references || [],
        })),
    };
}

function buildGenUser(entries) {
    const payload = entries.map(e => {
        const src = entrySource(e);
        if (e._audit && e._audit.status === 'issues') {
            src.assessment = e.assessment;            // prior attempt
            src.audit_feedback = e._audit.issues;     // what to fix
        }
        return src;
    });
    return 'Assess these contradictions and return all of them via record_scholarly_assessments:\n\n'
        + JSON.stringify(payload, null, 2);
}

function buildAuditUser(entries) {
    const payload = entries.map(e => ({ ...entrySource(e), assessment: e.assessment }));
    return 'Audit the generated `assessment` on each of these and return all of them via record_audit:\n\n'
        + JSON.stringify(payload, null, 2);
}

// ---------------------------------------------------------------- batch helpers
const sleep = ms => new Promise(r => setTimeout(r, ms));

function chunk(arr, n) {
    const out = [];
    for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
    return out;
}

/** Build one batch request. */
function genRequest(customId, entries, model, maxTokens) {
    return {
        custom_id: customId,
        params: {
            model,
            max_tokens: maxTokens,
            system: genSystem(),
            tools: [GEN_TOOL],
            tool_choice: { type: 'tool', name: GEN_TOOL.name },
            messages: [{ role: 'user', content: buildGenUser(entries) }],
        },
    };
}

function auditRequest(customId, entries, model, maxTokens) {
    return {
        custom_id: customId,
        params: {
            model,
            max_tokens: maxTokens,
            system: auditSystem(),
            tools: [AUDIT_TOOL],
            tool_choice: { type: 'tool', name: AUDIT_TOOL.name },
            messages: [{ role: 'user', content: buildAuditUser(entries) }],
        },
    };
}

async function submitBatch(client, requests) {
    const batch = await client.messages.batches.create({ requests });
    return batch.id;
}

/** Poll until processing_status === 'ended' (or timeout). Returns the final batch object. */
async function pollBatch(client, batchId, { intervalMs = 60000, maxMs = 2 * 60 * 60 * 1000, onTick } = {}) {
    const start = Date.now();
    for (;;) {
        const b = await client.messages.batches.retrieve(batchId);
        if (onTick) onTick(b);
        if (b.processing_status === 'ended') return b;
        if (Date.now() - start > maxMs) {
            throw new Error(`Batch ${batchId} still ${b.processing_status} after ${Math.round(maxMs / 60000)} min — re-run to resume.`);
        }
        await sleep(intervalMs);
    }
}

/** Pull tool inputs out of a finished batch, keyed by custom_id. Returns {results, errors}. */
async function collectResults(client, batchId, toolName) {
    const results = {}; // custom_id -> tool input object
    const errors = [];   // { custom_id, reason }
    for await (const item of await client.messages.batches.results(batchId)) {
        const cid = item.custom_id;
        if (item.result.type !== 'succeeded') {
            errors.push({ custom_id: cid, reason: item.result.type, detail: item.result.error || null });
            continue;
        }
        const blocks = item.result.message.content || [];
        const tool = blocks.find(b => b.type === 'tool_use' && b.name === toolName);
        if (!tool) { errors.push({ custom_id: cid, reason: 'no_tool_use' }); continue; }
        results[cid] = { input: tool.input, usage: item.result.message.usage };
    }
    return { results, errors };
}

module.exports = {
    CONSENSUS_NAMES,
    loadApiKey, getClient,
    genSystem, auditSystem, GEN_TOOL, AUDIT_TOOL,
    entrySource, buildGenUser, buildAuditUser,
    sleep, chunk, genRequest, auditRequest,
    submitBatch, pollBatch, collectResults,
};
