/**
 * _t10_revert_failed.js — deterministic rollback for T10 hand quotes that FAIL the
 * verifyHandQuotes.py gate (non-verbatim / unfetchable). For each id in IDS it resets the
 * dossier's DISCREPANCY pole to clean pre-T10 honest-absence — quotes:[], note:null,
 * emptyNote/emptyNoteAttr:null — so no unverified critic quote can survive into the bake.
 * (A discrepancy-leaning row reverted this way becomes a deferred parity_count row, which is
 * the correct, honest outcome; NEVER keep a quote the gate could not confirm verbatim.)
 * Leaves reconcile + versePair byte-untouched. Idempotent.
 *
 *   IDS=549,361 node .scripts/_t10_revert_failed.js
 */
const fs = require('fs');
const path = require('path');
const DOSS = path.join(__dirname, '..', 'data/harmonization/curation/dossier');
const ids = (process.env.IDS || '').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
if (!ids.length) { console.log('IDS empty — nothing to revert'); process.exit(0); }

const log = [];
for (const id of ids) {
    const f = path.join(DOSS, `${id}.json`);
    if (!fs.existsSync(f)) { log.push(`${id}: NO dossier`); continue; }
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    const before = ((d.discrepancy || {}).quotes || []).length;
    d.discrepancy = { note: null, halfLine: null, emptyNote: null, emptyNoteAttr: null, quotes: [] };
    fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
    log.push(`${id}: reverted (${before} quote(s) -> honest-absence)`);
}
console.log(log.join('\n'));
