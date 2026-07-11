/**
 * _t9fix_phase1.js — deterministic T9 post-run repairs (no LLM). Idempotent.
 *   1. note_present: null reconcile.note on TYN-only reconcile poles (baker drops
 *      TYN -> 0 baked quotes, so a non-null reconcile_note is illegal).
 *   2. note_lead_source: replace leading "JFB " -> "Jamieson " (agent used the
 *      source-code abbreviation; validator needs a recognized surname token).
 *   3. verse-pair verbatim floor: re-verbatimize each side's snippet + verseText
 *      against the live WEB text (restore leading-letter case / \" artifacts).
 *   4. vp_order: reorder id 593's verse-pair sides into canonical scripture order.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DOSS = path.join(ROOT, 'data/harmonization/curation/dossier');
const alias = {};
{
    const bm = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/harmonization/books_map.json'), 'utf8'));
    for (const [k, v] of Object.entries(bm.aliases || {})) alias[k.toLowerCase()] = v;
}
const read = (id) => JSON.parse(fs.readFileSync(path.join(DOSS, `${id}.json`), 'utf8'));
const write = (id, obj) => fs.writeFileSync(path.join(DOSS, `${id}.json`), JSON.stringify(obj, null, 2) + '\n');

const NULL_NOTE_IDS = [41, 62, 139, 176, 382, 391, 406, 407, 409, 452, 461, 531, 567, 587];
const JFB_IDS = [337, 338, 341, 345, 349, 352, 389, 421, 427, 443, 453, 457, 505, 507, 508, 523, 525, 571, 578, 581];
const VERBATIM_IDS = [168, 229, 343, 420, 421, 423, 425, 428, 429];
const VP_ORDER_IDS = [593];

const log = [];

// --- 1. null reconcile.note on TYN rows ---
for (const id of NULL_NOTE_IDS) {
    const d = read(id);
    if (d.reconcile.note !== null) { d.reconcile.note = null; write(id, d); log.push(`null-note   ${id}`); }
}

// --- 2. JFB -> Jamieson ---
for (const id of JFB_IDS) {
    const d = read(id);
    const n = d.reconcile.note;
    if (typeof n === 'string' && /^JFB\b/.test(n)) {
        const fixed = n.replace(/^JFB\b/, 'Jamieson');
        d.reconcile.note = fixed;
        write(id, d);
        log.push(`jfb->jam    ${id} (len ${fixed.length}${fixed.length > 180 ? ' !!OVER180' : ''})`);
    } else {
        log.push(`jfb SKIP    ${id} — does not start "JFB": ${JSON.stringify(n)}`);
    }
}

// --- 3. re-verbatimize verse-pair sides against live WEB ---
function parseRef(ref) {
    const m = /^(.*)\s+(\d+):(\d+)$/.exec(ref || '');
    if (!m) return null;
    const b = alias[m[1].trim().toLowerCase()];
    if (!b) return null;
    return { bolls: b, ch: +m[2], v: +m[3] };
}
// gather triples
const triples = {};
for (const id of VERBATIM_IDS) {
    for (const s of read(id).versePair.sides) {
        const p = parseRef(s.ref);
        if (p) triples[`${p.bolls}:${p.ch}:${p.v}`] = [p.bolls, p.ch, p.v];
    }
}
const py = `
import sqlite3, json, sys
conn = sqlite3.connect('file:./bible_reference.db?mode=ro', uri=True)
cur = conn.cursor()
out = {}
for b,c,v in json.load(sys.stdin):
    r = cur.execute("SELECT text FROM translations WHERE version_code='WEB' AND book=? AND chapter=? AND verse=?", (b,c,v)).fetchone()
    out[f"{b}:{c}:{v}"] = r[0] if r else None
print(json.dumps(out))
`;
const web = JSON.parse(execFileSync('python', ['-c', py], { input: JSON.stringify(Object.values(triples)), cwd: ROOT, encoding: 'utf8' }));

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const addArt = (s) => s.replace(/"/g, '\\"');           // clean quote -> \" artifact
function reverb(snippet, raw) {
    const cands = [snippet, cap(snippet), addArt(snippet), cap(addArt(snippet)), addArt(cap(snippet))];
    for (const c of cands) if (raw.includes(c)) return c;
    return null;
}
for (const id of VERBATIM_IDS) {
    const d = read(id);
    let changed = false;
    d.versePair.sides.forEach((s, i) => {
        const p = parseRef(s.ref);
        const raw = p ? web[`${p.bolls}:${p.ch}:${p.v}`] : null;
        if (!raw) { log.push(`verbatim ${id} side ${i}: NO WEB (${s.ref})`); return; }
        const fixedSnip = reverb(s.snippet, raw);
        if (fixedSnip === null) { log.push(`verbatim ${id} side ${i}: !!UNFIXED ${s.ref}`); return; }
        if (fixedSnip !== s.snippet) { s.snippet = fixedSnip; changed = true; }
        if (s.verseText !== raw) { s.verseText = raw; changed = true; }
    });
    if (changed) { write(id, d); log.push(`verbatim OK ${id}`); }
}

// --- 4. canonical reorder id 593 ---
for (const id of VP_ORDER_IDS) {
    const d = read(id);
    const sides = d.versePair.sides.map((s) => ({ s, p: parseRef(s.ref) }));
    sides.sort((a, b) => (a.p.bolls - b.p.bolls) || (a.p.ch - b.p.ch) || (a.p.v - b.p.v));
    d.versePair.sides = sides.map((x) => x.s);
    write(id, d);
    log.push(`vp_order    ${id} -> ${d.versePair.sides.map((s) => s.ref).join('  |  ')}`);
}

console.log(log.join('\n'));
