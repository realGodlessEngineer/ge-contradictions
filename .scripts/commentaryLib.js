/**
 * commentaryLib.js — Shared helpers for the COMMENTARY-EXPANSION batch pipeline.
 *
 * Generator (biblical-contradiction-scholar persona + a compact VOICE directive that
 * REPLACES the docs/ style guide) takes each contradiction's EXISTING `commentary` and
 * expands/enriches it, states whether the tension is harmonized and on what (steel-manned)
 * basis, and emits a structured `scholarship` array shaped to the scholarship_sources /
 * contradiction_scholarship tables. Auditor (biblical-scholar-auditor persona) checks the
 * expansion for hallucination / miscitation / strawmanned harmonization. Runs over the
 * Anthropic Message Batches API (50% discount).
 *
 * Distinct from scholarlyLib.js: that pipeline GRADES scholarly_consensus + textual-variant
 * flags and never rewrites prose. This one ONLY rewrites `commentary` and regenerates the
 * `scholarship` prose from the structured array — it never touches summary or the consensus
 * fields. The generic API plumbing (client, chunk, submit/poll/collect) is reused from
 * scholarlyLib so there is a single client and one copy of the batch helpers.
 *
 * NOTHING here ever prints the API key.
 */
const fs = require('fs');
const path = require('path');
const lib = require('./scholarlyLib');

const AGENTS_DIR = path.join(__dirname, '..', '.claude', 'agents');

const HARMONIZATION = ['harmonized', 'partially_harmonized', 'not_harmonized', 'disputed'];

/** Read an agent .md, strip YAML frontmatter and the harness "# Persistent Agent Memory" tail. */
function readPersona(file) {
    const txt = fs.readFileSync(path.join(AGENTS_DIR, file), 'utf8');
    let body = txt.replace(/^---[\s\S]*?\n---\s*\n/, '');
    const cut = body.indexOf('# Persistent Agent Memory');
    if (cut !== -1) body = body.slice(0, cut);
    return body.trim();
}

// ---------------------------------------------------------------- compact VOICE directive
// ~230 tokens. This REPLACES the full docs/ style guide for the batch run: a critical but
// neutralized, data-driven register. Kept terse on purpose (the dominant cost is output,
// not this prompt — see the cost analysis), so it is the entire style spec the model gets.
const VOICE = `## VOICE & TONE — apply to every commentary you write

Write as a critical biblical scholar for an informed general reader. Lead with the textual
and historical data and let the evidence carry the argument. The register is analytical,
measured, and data-driven — confident but never polemical, snarky, or contemptuous of
belief. State the tension plainly; steel-man the strongest harmonization (never a strawman);
then show, with specific evidence — manuscript variants, original-language terms, genre,
source criticism — why it does or does not hold. Prefer concrete citations (verses,
Hebrew/Greek terms, named scholars) over rhetoric. No sermonizing, no mockery, no
rhetorical-question filler. Third person; past tense for historical claims. Where the
tension genuinely resolves, say so plainly and explain the basis rather than manufacturing
a contradiction the evidence dissolves. Close with a one-line verdict (e.g. "Verdict:
genuine contradiction / scribal corruption / harmonizable / overstated").`;

// ---------------------------------------------------------------- task appendices
const GEN_TASK = `

---

## THIS TASK — expand & enrich the critical commentary (database batch)

For each contradiction in the user JSON you are given its source fields (question, summary,
the EXISTING \`commentary\`, the existing \`scholarship\`, and the answers + verse references
as evidence). Your job is to **improve, expand, and enrich the existing commentary** and
return it — plus a structured scholarship list — through the \`record_commentary\` tool.
That tool is your ONLY output channel: do NOT write files, do NOT edit JSON, do NOT emit a
summary, do NOT add coherency flags. Ignore Step 1 of your persona about reading an external
style guide — the VOICE directive above is your complete and only style spec.

For each entry:

1. **Expand the commentary on the contradiction itself.** Take what is already there and
   deepen it: add the historical, literary, textual, and source-critical context a reader
   needs to understand *why* the tension exists and how serious it is. Preserve every claim
   in the current commentary that is correct, correct anything that is wrong, and add
   genuinely new information. **Aim to roughly DOUBLE the length of the existing commentary**
   — for most entries that means landing around 550-750 words (the current corpus average is
   ~300 words). Go longer only where the material genuinely supports it. Use the added room
   for real depth: the manuscript/versional evidence, the original-language detail, the
   source-critical or redactional history, the specific apologetic counter-cases and why they
   hold or fail, and the scholarly debate. Never pad — every added sentence must carry new
   evidence, context, or analysis, not filler or restatement. The returned \`commentary\`
   REPLACES the existing one, so it must stand on its own and contain everything worth keeping.

2. **Address harmonization explicitly and fairly.** Set \`harmonization_status\` to one of:
   harmonized, partially_harmonized, not_harmonized, disputed.
   - **Steel-man, never strawman.** Present the STRONGEST form of the apologetic /
     harmonizing argument before you weigh it. If you cannot state it in a form its own
     defenders would accept, you have not understood it well enough yet.
   - When the tension **is** appropriately harmonized (harmonized / partially_harmonized),
     say so plainly in the commentary AND record the basis in \`harmonization_basis\`: name
     the specific mechanism that resolves it (a translation artifact, a genre convention,
     two compatible vantage points, a textual variant, a chronological scheme, etc.). Do not
     manufacture a contradiction the evidence actually dissolves.
   - When it is **not** harmonized, give the apologetic case its fair hearing and then show,
     with specific evidence, why it fails. Set \`harmonization_basis\` to "".

3. **Capture the scholarship as a structured array.** For every work you cite in the
   commentary, add one item to \`scholarship\` with the fields that feed our reference tables:
   citation_order, author, title, publication, year, pages, note, bible_refs, raw_citation.
   \`raw_citation\` is the full citation as it should read in prose, with any verse pointer
   placed in the annotation tail AFTER the year/pages (e.g. "…, 1966, pp. 620-621, on John
   14:2"). Mix critical and apologetic/traditional sources where you engage both. Only cite
   works you are confident exist — NEVER fabricate an author, title, year, page, or apparatus
   reference. If you have nothing to cite, return an empty array; do not invent filler.

Also give a one-sentence \`change_summary\` (what you expanded or added — the auditor reads
it; it is not stored).

**If revising:** an entry may include a \`prior_expansion\` and \`audit_feedback\`. Fix exactly
what was flagged and keep what was already sound.

Return EVERY id you are given, exactly once, via the tool.`;

const AUDIT_TASK = `

---

## THIS TASK — audit an expanded commentary for a database batch

Each entry carries its source fields (question, summary, the prior \`commentary\`, answers,
references) plus an \`expanded\` object the generator produced: commentary,
harmonization_status, harmonization_basis, and a scholarship array. Audit ONLY the
\`expanded\` content and return a verdict for every id through the \`record_commentary_audit\`
tool.

Check, per entry:
- **Scripture & language** — every verse reference, quotation, and Hebrew/Greek claim in the
  expanded commentary is correct and actually says what the commentary asserts. A fabricated
  verse, misquotation, or invented etymology is **high** severity.
- **Citations (HIGHEST RISK)** — every work in the scholarship array, and every author /
  title / year / page / apparatus reference in the commentary, must be real and correctly
  attributed. An invented or wrong citation is a **high**-severity hallucination.
- **Harmonization integrity** — is \`harmonization_status\` defensible, and is the apologetic /
  harmonizing argument **steel-manned rather than strawmanned**? Flag (medium) a label that
  overstates (calls a well-harmonized case unresolved) or understates (waves a real
  contradiction away), and flag (medium) any harmonization knocked down in a weak form its
  defenders would not accept.
- **Factual/historical claims** — flag anything contradicting mainstream critical scholarship
  (not mere interpretive or denominational preference).

Do NOT flag style, tone, or voice as a pass/fail issue (low at most) — accuracy is your
mandate. severity: **high** = fabrication / factually wrong / strawman presented as the real
argument; **medium** = overstated/understated label or weak-but-not-fabricated citation;
**low** = nitpick. Set status='clean' when there are no issues, otherwise status='issues'
with the list. For each issue give: field, severity, problem, correction.`;

function genSystem() { return readPersona('biblical-contradiction-scholar.md') + '\n\n---\n\n' + VOICE + GEN_TASK; }
function auditSystem() { return readPersona('biblical-scholar-auditor.md') + AUDIT_TASK; }

// ---------------------------------------------------------------- tool schemas
const SCHOLARSHIP_ITEM = {
    type: 'object',
    properties: {
        citation_order: { type: 'integer', description: '1-based order this work is cited in the commentary.' },
        author: { type: 'string', description: 'Author(s) as cited, e.g. "Raymond E. Brown". "" if genuinely none.' },
        title: { type: 'string', description: 'Work title, no markdown asterisks, e.g. "The Gospel According to John".' },
        publication: { type: 'string', description: 'Series / publisher block, e.g. "Anchor Bible 29; Doubleday". "" if none.' },
        year: { type: 'integer', description: 'Publication year as an integer. Use 0 only if genuinely unknown.' },
        pages: { type: 'string', description: 'Page range for THIS citation, e.g. "pp. 620-621". "" if none.' },
        note: { type: 'string', description: 'Short annotation for this use, e.g. "on the eschatological mansions". "" if none.' },
        bible_refs: { type: 'string', description: 'Comma-delimited canonical verses this citation points to, e.g. "John 14:2". "" if none.' },
        raw_citation: {
            type: 'string',
            description: 'The FULL citation as it should read in prose, with any verse pointer in the annotation tail '
                + 'after the year/pages, e.g. "Raymond E. Brown, *The Gospel According to John* (AB 29; Doubleday, 1966), '
                + 'pp. 620-621, on John 14:2".',
        },
    },
    required: ['citation_order', 'title', 'year', 'raw_citation'],
};

const GEN_TOOL = {
    name: 'record_commentary',
    description: 'Record the expanded commentary, harmonization assessment, and structured scholarship for each contradiction.',
    input_schema: {
        type: 'object',
        properties: {
            records: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        commentary: { type: 'string', description: 'The full expanded commentary (replaces the existing one). Roughly DOUBLE the source length — typically 550-750 words.' },
                        harmonization_status: { type: 'string', enum: HARMONIZATION },
                        harmonization_basis: { type: 'string', description: 'When harmonized/partially_harmonized: the steel-manned basis on which the tension resolves. "" when not_harmonized.' },
                        scholarship: { type: 'array', items: SCHOLARSHIP_ITEM, description: 'Every work cited in the commentary, in citation order. [] if none.' },
                        change_summary: { type: 'string', description: 'One sentence: what you expanded/added. The auditor reads this; it is not stored.' },
                    },
                    required: ['id', 'commentary', 'harmonization_status', 'change_summary'],
                },
            },
        },
        required: ['records'],
    },
};

const AUDIT_TOOL = {
    name: 'record_commentary_audit',
    description: 'Record audit verdicts for each expanded commentary.',
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
function buildGenUser(entries) {
    const payload = entries.map(e => {
        const src = lib.entrySource(e); // question/category/type/scope/summary/commentary/scholarship/answers
        if (e.commentary_out && e._audit && e._audit.status === 'issues') {
            src.prior_expansion = e.commentary_out;   // what to fix
            src.audit_feedback = e._audit.issues;
        }
        return src;
    });
    return 'Expand and enrich the `commentary` on each of these contradictions and return ALL of them '
        + 'via record_commentary:\n\n' + JSON.stringify(payload, null, 2);
}

function buildAuditUser(entries) {
    const payload = entries.map(e => ({ ...lib.entrySource(e), expanded: e.commentary_out }));
    return 'Audit the `expanded` commentary + scholarship on each (against the source verses, for hallucination / '
        + 'miscitation / strawmanned harmonization) and return ALL via record_commentary_audit:\n\n'
        + JSON.stringify(payload, null, 2);
}

// ---------------------------------------------------------------- batch requests
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

/** Compose the scholarship prose blurb from the structured array (multiline = the shape
 *  scholarshipParser.splitCitations handles most reliably). Returns '' when nothing to write. */
function composeScholarshipProse(scholarship) {
    if (!Array.isArray(scholarship) || !scholarship.length) return '';
    return [...scholarship]
        .sort((a, b) => (a.citation_order || 0) - (b.citation_order || 0))
        .map(c => (c.raw_citation || '').trim())
        .filter(Boolean)
        .join('\n');
}

module.exports = {
    HARMONIZATION, VOICE,
    genSystem, auditSystem, GEN_TOOL, AUDIT_TOOL,
    buildGenUser, buildAuditUser, genRequest, auditRequest,
    composeScholarshipProse,
    // re-exported generic plumbing (single client + one copy of the batch helpers)
    getClient: lib.getClient, chunk: lib.chunk, sleep: lib.sleep,
    submitBatch: lib.submitBatch, pollBatch: lib.pollBatch, collectResults: lib.collectResults,
};
