/**
 * runCommentaryPipeline.js — Generator → auditor loop over data/commentary/batch_*.json
 * using the Anthropic Message Batches API (50% cost discount).
 *
 *   PING=1 node runCommentaryPipeline.js    # validate CLAUDE_API_KEY + model, then exit (cheap)
 *   node runCommentaryPipeline.js           # run the loop (THIS is the paid step)
 *
 * Generator EXPANDS each contradiction's commentary (persona + compact VOICE), judges
 * harmonization, and emits a structured scholarship array. Auditor checks the expansion for
 * hallucination / miscitation / strawmanned harmonization.
 *
 * Loop (capped at MAX_AUDIT_PASSES, default 2):
 *   pass 1: GENERATE every entry  → AUDIT every entry
 *   pass 2: re-GENERATE flagged entries (with auditor feedback) → re-AUDIT them
 *   stop. Any entry still carrying a medium-or-higher issue is marked needs_human and
 *   recorded in data/commentary/UNRESOLVED.md.
 *
 * Resumable: the in-flight batch id is persisted to data/commentary/_state.json. Results are
 * matched back to entries by the `id` inside each tool output (not by request position).
 *
 * Env: DIR (./data/commentary), MODEL (claude-opus-4-8), MAX_TOKENS (32000 — the ~2x-length
 *      commentary target is output-heavy; a generous cap is free since you pay for actual
 *      tokens, and it keeps a 10-entry request from truncating mid-tool-call, which would void
 *      the whole request), BATCH_SIZE (10 — smaller than the consensus pipeline so one truncated
 *      request loses fewer entries), MAX_AUDIT_PASSES (2), POLL_SECONDS (30)
 */
const fs = require('fs');
const path = require('path');
const lib = require('./commentaryLib');

const DIR = process.env.DIR || './data/commentary';
const MODEL = process.env.MODEL || 'claude-opus-4-8';
const MAX_TOKENS = Number(process.env.MAX_TOKENS || 32000);
const BATCH_SIZE = Number(process.env.BATCH_SIZE || 10);
const MAX_AUDIT_PASSES = Number(process.env.MAX_AUDIT_PASSES || 2);
const POLL_MS = Number(process.env.POLL_SECONDS || 30) * 1000;
const STATE = path.join(DIR, '_state.json');

// ---- batch file IO ----
function loadBatches() {
    const files = fs.readdirSync(DIR).filter(f => /^batch_\d+\.json$/.test(f)).sort();
    const batches = files.map(f => ({ file: path.join(DIR, f), data: JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')) }));
    const entries = [];
    for (const b of batches) for (const e of b.data.entries) entries.push(e);
    return { batches, entries };
}
function saveBatches(batches) {
    for (const b of batches) fs.writeFileSync(b.file, JSON.stringify(b.data, null, 2), 'utf8');
}
function readState() { try { return JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch { return { completedAuditPasses: 0, inFlight: null }; } }
function writeState(s) { fs.writeFileSync(STATE, JSON.stringify(s, null, 2), 'utf8'); }

// ---- apply results back onto entries (matched by id) ----
function applyGen(results, byId) {
    let n = 0;
    for (const cid of Object.keys(results)) {
        for (const r of (results[cid].input.records || [])) {
            const e = byId.get(r.id);
            if (!e) continue;
            e.commentary_out = {
                commentary: r.commentary || '',
                harmonization_status: r.harmonization_status || '',
                harmonization_basis: r.harmonization_basis || '',
                scholarship: Array.isArray(r.scholarship) ? r.scholarship : [],
                change_summary: r.change_summary || '',
            };
            e._audit = null; // freshly (re)generated — prior audit is stale
            n++;
        }
    }
    return n;
}
function applyAudit(results, byId, pass) {
    let n = 0;
    for (const cid of Object.keys(results)) {
        for (const r of (results[cid].input.results || [])) {
            const e = byId.get(r.id);
            if (!e) continue;
            e._audit = { status: r.status, issues: r.issues || [], pass };
            n++;
        }
    }
    return n;
}

function usageTotals(results) {
    let inT = 0, outT = 0;
    for (const cid of Object.keys(results)) {
        const u = results[cid].usage || {};
        inT += u.input_tokens || 0; outT += u.output_tokens || 0;
    }
    return { inT, outT };
}

async function runPhase(client, kind, entries, pass, state, batches, byId) {
    const chunks = lib.chunk(entries, BATCH_SIZE);
    const reqs = chunks.map((c, i) => (kind === 'gen' ? lib.genRequest : lib.auditRequest)(
        `${kind}-p${pass}-c${i}`, c, MODEL, MAX_TOKENS));
    console.log(`  [${kind}] pass ${pass}: submitting ${reqs.length} request(s) for ${entries.length} entr(ies)…`);
    const batchId = await lib.submitBatch(client, reqs);
    state.inFlight = { batchId, kind, pass };
    writeState(state);
    await lib.pollBatch(client, batchId, {
        intervalMs: POLL_MS,
        onTick: b => process.stdout.write(`\r    batch ${batchId} ${b.processing_status} `
            + `(done ${b.request_counts?.succeeded || 0}/${reqs.length}, err ${b.request_counts?.errored || 0})   `),
    });
    process.stdout.write('\n');
    const toolName = kind === 'gen' ? lib.GEN_TOOL.name : lib.AUDIT_TOOL.name;
    const { results, errors } = await lib.collectResults(client, batchId, toolName);
    const applied = kind === 'gen' ? applyGen(results, byId) : applyAudit(results, byId, pass);
    const { inT, outT } = usageTotals(results);
    saveBatches(batches);
    state.inFlight = null;
    if (kind === 'audit') state.completedAuditPasses = pass;
    writeState(state);
    console.log(`  [${kind}] applied ${applied} entr(ies); usage in=${inT} out=${outT}; errors=${errors.length}`);
    if (errors.length) console.log('    request errors:', JSON.stringify(errors.slice(0, 5)));
    return { applied, errors };
}

async function ping(client) {
    const r = await client.messages.create({ model: MODEL, max_tokens: 16, messages: [{ role: 'user', content: 'Reply with the single word: ok' }] });
    const txt = (r.content.find(b => b.type === 'text') || {}).text || '';
    console.log(`Ping OK — model "${MODEL}" reachable. Reply: ${txt.trim()}  (in=${r.usage.input_tokens} out=${r.usage.output_tokens})`);
}

function finalize(entries) {
    const unresolved = [];
    for (const e of entries) {
        if (e._audit && e._audit.status === 'issues') {
            const medHigh = (e._audit.issues || []).filter(i => i.severity === 'high' || i.severity === 'medium');
            e._audit.final = medHigh.length ? 'needs_human' : 'clean_low';
            if (medHigh.length) unresolved.push({ id: e.id, issues: medHigh });
        } else if (e.commentary_out) {
            if (e._audit) e._audit.final = 'clean';
        }
    }
    return unresolved;
}

function writeUnresolvedReport(batches, unresolved) {
    const byId = new Map();
    for (const b of batches) for (const e of b.data.entries) byId.set(e.id, b.data.batch);
    const lines = ['# Unresolved commentary expansions (medium-or-higher issues after 2 audit passes)', ''];
    if (!unresolved.length) {
        lines.push('None — every entry cleared (or only low-severity nitpicks remain).');
    } else {
        lines.push(`${unresolved.length} entr(ies) still carry a medium+ issue and were NOT merged (needs_human):`, '');
        const grouped = {};
        for (const u of unresolved) { const b = byId.get(u.id); (grouped[b] = grouped[b] || []).push(u); }
        for (const b of Object.keys(grouped).sort((a, c) => a - c)) {
            lines.push(`## batch_${String(b).padStart(2, '0')}`);
            for (const u of grouped[b]) {
                lines.push(`- **id ${u.id}**`);
                for (const i of u.issues) lines.push(`  - [${i.severity}] ${i.field}: ${i.problem}${i.correction ? ` → ${i.correction}` : ''}`);
            }
            lines.push('');
        }
    }
    fs.writeFileSync(path.join(DIR, 'UNRESOLVED.md'), lines.join('\n'), 'utf8');
}

(async () => {
    const client = lib.getClient();

    if (process.env.PING === '1') { await ping(client); return; }

    if (!fs.existsSync(DIR)) { console.error(`No ${DIR} — run exportCommentaryBatches.js first.`); process.exit(1); }
    const { batches, entries } = loadBatches();
    if (!entries.length) { console.error('No batch entries found.'); process.exit(1); }
    const byId = new Map(entries.map(e => [e.id, e]));
    const state = readState();

    // resume an in-flight batch from a prior crashed run
    if (state.inFlight) {
        const { batchId, kind, pass } = state.inFlight;
        console.log(`Resuming in-flight ${kind} batch ${batchId} (pass ${pass})…`);
        await lib.pollBatch(client, batchId, { intervalMs: POLL_MS });
        const toolName = kind === 'gen' ? lib.GEN_TOOL.name : lib.AUDIT_TOOL.name;
        const { results, errors } = await lib.collectResults(client, batchId, toolName);
        if (kind === 'gen') applyGen(results, byId); else applyAudit(results, byId, pass);
        saveBatches(batches);
        state.inFlight = null;
        if (kind === 'audit') state.completedAuditPasses = pass;
        writeState(state);
        if (errors.length) console.log(`  resume errors: ${errors.length}`);
    }

    while (state.completedAuditPasses < MAX_AUDIT_PASSES) {
        const pass = state.completedAuditPasses + 1;
        console.log(`\n=== Pass ${pass} of ${MAX_AUDIT_PASSES} ===`);

        const toGen = entries.filter(e => !e.commentary_out || (e._audit && e._audit.status === 'issues'));
        if (toGen.length) await runPhase(client, 'gen', toGen, pass, state, batches, byId);
        else console.log('  [gen] nothing to generate this pass.');

        const toAudit = entries.filter(e => e.commentary_out && (!e._audit || e._audit.status === 'issues'));
        if (!toAudit.length) { console.log('  [audit] nothing to audit — stopping.'); break; }
        await runPhase(client, 'audit', toAudit, pass, state, batches, byId);

        const stillIssues = entries.filter(e => e._audit && e._audit.status === 'issues');
        console.log(`  pass ${pass} complete: ${stillIssues.length} entr(ies) still flagged.`);
        if (!stillIssues.length) break;
    }

    const unresolved = finalize(entries);
    saveBatches(batches);
    writeUnresolvedReport(batches, unresolved);

    // ---- summary ----
    const have = entries.filter(e => e.commentary_out);
    const clean = entries.filter(e => e._audit && (e._audit.final === 'clean' || e._audit.status === 'clean'));
    const lowOnly = entries.filter(e => e._audit && e._audit.final === 'clean_low');
    const needsHuman = entries.filter(e => e._audit && e._audit.final === 'needs_human');
    const noOut = entries.filter(e => !e.commentary_out);
    console.log('\n========== PIPELINE SUMMARY ==========');
    console.log(`entries: ${entries.length}`);
    console.log(`  expanded: ${have.length}`);
    console.log(`  clean (audit passed): ${clean.length}`);
    console.log(`  clean_low (only low-severity nitpicks left): ${lowOnly.length}`);
    console.log(`  needs_human (medium+ issue after ${MAX_AUDIT_PASSES} passes): ${needsHuman.length}`);
    if (noOut.length) console.log(`  NO expansion (batch errors): ${noOut.length} -> ${noOut.map(e => e.id).join(', ')}`);
    console.log(`Mergeable now: clean + clean_low = ${clean.length + lowOnly.length}.  Recorded in ${path.join(DIR, 'UNRESOLVED.md')}.`);
    console.log('Next: node mergeCommentaryToDb.js');
})().catch(e => { console.error('\nPIPELINE ERROR:', e.message); process.exit(1); });
