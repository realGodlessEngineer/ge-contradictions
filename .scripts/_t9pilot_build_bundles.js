/**
 * _t9pilot_build_bundles.js — mechanical (no-LLM) T9 input-bundle builder for the
 * 25-row exploratory pilot. For each target id it emits a compact
 * data/harmonization/curation/_t9pilot/bundle_<id>.json holding EVERYTHING an
 * authoring agent needs (reconcile excerpts + resolved author tokens, machine
 * connectives, candidate refs with PRE-FETCHED WEB verse text, consensus-derived
 * lean) so the agent never opens the 135 KB gather blob or any .db file.
 *
 * Verse text is pulled read-only from bible_reference.db via Python (sqlite3),
 * matching verifyVersePairs.py. Prints a manifest with the lean split + byte totals.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const MACH = path.join(ROOT, 'data/harmonization/curation/machine');
const GATH = path.join(ROOT, 'data/harmonization/gather/by_id');
const OUT = path.join(ROOT, 'data/harmonization/curation/_t9pilot');
const VOICES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/harmonization/voices.json'), 'utf8')).voices || {};

const TARGET = [1, 2, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
const RECONCILE_FIRST = new Set(['probable_harmonization', 'apparent_only']);

fs.mkdirSync(OUT, { recursive: true });

// Batch-fetch WEB verse text for a list of {bolls,chapter,verse} via one Python call.
function fetchWeb(triples) {
    if (!triples.length) return {};
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
    const res = execFileSync('python', ['-c', py], { input: JSON.stringify(triples), cwd: ROOT, encoding: 'utf8' });
    return JSON.parse(res);
}

const manifest = { reconcileFirst: [], discrepancyFirst: [], bytes: {}, notes: [] };
let grandBytes = 0;

for (const id of TARGET) {
    const mach = JSON.parse(fs.readFileSync(path.join(MACH, `${id}.json`), 'utf8'));
    const gath = JSON.parse(fs.readFileSync(path.join(GATH, `${id}.json`), 'utf8'));
    const row = mach.row || {};
    const consensus = gath.consensus || null;
    const reconcileFirst = RECONCILE_FIRST.has(consensus);

    // reconcile excerpts -> author-resolved, trimmed
    const reconcileExcerpts = (mach.excerpts || [])
        .filter((e) => e.pole === 'reconcile' && e.source_code !== 'TYN') // baker drops TYN (SPEC §2a) — lead author must be a BAKED voice
        .map((e, i) => {
            const v = VOICES[e.source_code] || gath.voices?.[e.source_code] || {};
            return {
                ord: i,
                source_code: e.source_code,
                author: v.author || null,
                attribution: v.attribution || null,
                verse_ref: e.verse_ref,
                on_tension_rationale: e.on_tension_rationale,
                excerpt_text: (e.excerpt_text || '').slice(0, 500),
            };
        });

    // candidate refs with pre-fetched WEB verse text (cap 8 verses/range)
    const triples = [];
    const refs = (gath.refs_parsed || []).map((r) => {
        const verses = [];
        for (const [ch, vs, ve] of (r.ranges || [])) {
            for (let v = vs; v <= (ve || vs) && v - vs < 8; v++) {
                triples.push([r.bolls, ch, v]);
                verses.push({ ref: `${r.book} ${ch}:${v}`, bolls: r.bolls, chapter: ch, verse: v });
            }
        }
        return { raw: r.raw, book: r.book, bolls: r.bolls, verses };
    });
    const web = fetchWeb(triples);
    for (const r of refs) for (const vv of r.verses) vv.webText = web[`${vv.bolls}:${vv.chapter}:${vv.verse}`] || null;

    const bundle = {
        contradiction_id: id,
        question: gath.question,
        summary: gath.summary,
        consensus,
        reconcileFirst,
        machineLean: row.lean || null,
        reconcile: {
            connective: row.reconcile?.connective || null,
            excerpts: reconcileExcerpts,
        },
        discrepancyCandidate: {
            status: row.discrepancy?.status || null,
            connective: row.discrepancy?.connective || null,
            skeptic: row.discrepancy?.skeptic || null,
        },
        candidateRefs: refs,
    };

    const p = path.join(OUT, `bundle_${id}.json`);
    const txt = JSON.stringify(bundle, null, 2);
    fs.writeFileSync(p, txt);
    const bytes = Buffer.byteLength(txt);
    grandBytes += bytes;
    manifest.bytes[id] = bytes;
    (reconcileFirst ? manifest.reconcileFirst : manifest.discrepancyFirst).push(id);
    if (reconcileFirst !== (row.lean === 'reconcile_first')) {
        manifest.notes.push(`id ${id}: consensus lean (${reconcileFirst ? 'reconcile' : 'discrepancy'}) != machine lean (${row.lean})`);
    }
}

manifest.totalBytes = grandBytes;
manifest.avgBytes = Math.round(grandBytes / TARGET.length);
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log('T9 pilot bundles written to', path.relative(ROOT, OUT));
console.log('reconcile-leaning (need emptyNote):', manifest.reconcileFirst.join(', '));
console.log('discrepancy-leaning (note+versePair only):', manifest.discrepancyFirst.join(', '));
if (manifest.notes.length) console.log('LEAN MISMATCHES:', manifest.notes);
console.log(`bundle bytes: total=${grandBytes}  avg=${manifest.avgBytes}  (~${Math.round(manifest.avgBytes / 4)} tok/row)`);
