/**
 * buildT9Bundles.js — mechanical (no-LLM) T9 input-bundle builder for the full run.
 *
 * For every in-scope id it emits data/harmonization/curation/_t9bundles/bundle_<id>.json
 * holding EVERYTHING an authoring agent needs (reconcile excerpts with resolved author
 * tokens — TYN dropped to match the baker — machine connectives, the discrepancy skeptic
 * candidate, and candidate refs with PRE-FETCHED WEB verse text) so the agent never opens
 * the 135 KB gather blob or any .db file. All WEB text is pulled read-only in ONE batched
 * Python call (mirrors verifyVersePairs.py). Writes manifest.json with the lean split.
 *
 * Scope (default): every contradictions.db id with recommend_delete=0 that HAS a machine
 * file and does NOT already have a dossier. Overrides:
 *   IDS=1,2,3   only these ids
 *   FORCE=1     include ids that already have a dossier (rebuild)
 *   ALL=1       every eligible id even if dossier'd (alias for FORCE)
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const MACH = path.join(ROOT, 'data/harmonization/curation/machine');
const GATH = path.join(ROOT, 'data/harmonization/gather/by_id');
const DOSS = path.join(ROOT, 'data/harmonization/curation/dossier');
const OUT = path.join(ROOT, 'data/harmonization/curation/_t9bundles');
const VOICES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/harmonization/voices.json'), 'utf8')).voices || {};
const RECONCILE_FIRST = new Set(['probable_harmonization', 'apparent_only']);
const SINGLE_CHAPTER = new Set([31, 57, 63, 64, 65]); // Obadiah, Philemon, 2 John, 3 John, Jude — a bare "Jude 14" lands the verse in the chapter slot

const has = (dir, id) => fs.existsSync(path.join(dir, `${id}.json`));

// --- scope ---
function eligibleIdsFromDb() {
    const py = `
import sqlite3, json
c = sqlite3.connect('file:./contradictions.db?mode=ro', uri=True)
print(json.dumps([r[0] for r in c.execute("SELECT id FROM contradictions WHERE COALESCE(recommend_delete,0)=0 ORDER BY id")]))
`;
    return JSON.parse(execFileSync('python', ['-c', py], { cwd: ROOT, encoding: 'utf8' }));
}
const FORCE = process.env.FORCE === '1' || process.env.ALL === '1';
let ids;
if (process.env.IDS) {
    ids = process.env.IDS.split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
} else {
    ids = eligibleIdsFromDb().filter((id) => has(MACH, id) && (FORCE || !has(DOSS, id)));
}

fs.mkdirSync(OUT, { recursive: true });

// --- pass 1: assemble bundles WITHOUT verse text, collecting every (bolls,ch,v) triple ---
const drafts = [];
const triples = new Map(); // "b:c:v" -> [b,c,v]
for (const id of ids) {
    const mach = JSON.parse(fs.readFileSync(path.join(MACH, `${id}.json`), 'utf8'));
    const gath = JSON.parse(fs.readFileSync(path.join(GATH, `${id}.json`), 'utf8'));
    const row = mach.row || {};
    const consensus = gath.consensus || null;

    const reconcileExcerpts = (mach.excerpts || [])
        .filter((e) => e.pole === 'reconcile' && e.source_code !== 'TYN') // baker drops TYN (SPEC §2a) — lead must be a BAKED voice
        .map((e, i) => {
            const v = VOICES[e.source_code] || gath.voices?.[e.source_code] || {};
            return {
                ord: i, source_code: e.source_code, author: v.author || null, attribution: v.attribution || null,
                verse_ref: e.verse_ref, on_tension_rationale: e.on_tension_rationale,
                excerpt_text: (e.excerpt_text || '').slice(0, 500),
            };
        });

    const refs = (gath.refs_parsed || []).map((r) => {
        const verses = [];
        for (const [ch, vs, ve] of (r.ranges || [])) {
            let chap = ch, vstart = vs, vend = ve || vs;
            if (SINGLE_CHAPTER.has(r.bolls) && ch > 1) { chap = 1; vstart = ch; vend = ch; } // "Jude 14" -> Jude 1:14
            for (let v = vstart; v <= vend && v - vstart < 8; v++) {
                const key = `${r.bolls}:${chap}:${v}`;
                triples.set(key, [r.bolls, chap, v]);
                verses.push({ ref: `${r.book} ${chap}:${v}`, bolls: r.bolls, chapter: chap, verse: v, _key: key });
            }
        }
        return { raw: r.raw, book: r.book, bolls: r.bolls, verses };
    });

    drafts.push({
        id,
        bundle: {
            contradiction_id: id,
            question: gath.question, summary: gath.summary,
            consensus, reconcileFirst: RECONCILE_FIRST.has(consensus), machineLean: row.lean || null,
            reconcile: { connective: row.reconcile?.connective || null, excerpts: reconcileExcerpts },
            discrepancyCandidate: {
                status: row.discrepancy?.status || null,
                connective: row.discrepancy?.connective || null,
                skeptic: row.discrepancy?.skeptic || null,
            },
            candidateRefs: refs,
        },
    });
}

// --- one batched WEB fetch for every unique triple ---
function fetchWebBatch(triplesArr) {
    const arr = [...triplesArr.values()]; // triplesArr is a Map — .size, not .length
    if (!arr.length) return {};
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
    return JSON.parse(execFileSync('python', ['-c', py], { input: JSON.stringify(arr), cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
}
const web = fetchWebBatch(triples);

// --- pass 2: inject verse text, write bundles + manifest ---
const manifest = { count: 0, ids: [], reconcileFirst: [], discrepancyFirst: [], leanMismatch: [], manualReview: [], droppedVerses: 0, bytes: {}, totalBytes: 0 };
for (const { id, bundle } of drafts) {
    // inject WEB text and DROP any verse that has none — agents only ever see usable candidates
    for (const r of bundle.candidateRefs) {
        r.verses = r.verses.filter((vv) => {
            vv.webText = web[vv._key] ?? null;
            const ok = vv.webText !== null;
            if (!ok) manifest.droppedVerses++;
            delete vv._key;
            return ok;
        });
    }
    // a versePair needs two distinct in-tension verses; rows with <2 usable refs (thin/malformed/
    // Bible-vs-reality) are excluded from the automated batch and listed for manual/editorial handling.
    const usable = bundle.candidateRefs.reduce((n, r) => n + r.verses.length, 0);
    if (usable < 2) { manifest.manualReview.push({ id, usable, question: bundle.question }); continue; }
    const txt = JSON.stringify(bundle, null, 2);
    fs.writeFileSync(path.join(OUT, `bundle_${id}.json`), txt);
    const bytes = Buffer.byteLength(txt);
    manifest.bytes[id] = bytes; manifest.totalBytes += bytes; manifest.count++;
    manifest.ids.push(id);
    (bundle.reconcileFirst ? manifest.reconcileFirst : manifest.discrepancyFirst).push(id);
    if (bundle.reconcileFirst !== (bundle.machineLean === 'reconcile_first')) {
        manifest.leanMismatch.push({ id, consensus: bundle.reconcileFirst ? 'reconcile' : 'discrepancy', machine: bundle.machineLean });
    }
}
manifest.avgBytes = manifest.count ? Math.round(manifest.totalBytes / manifest.count) : 0;
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log(`T9 bundles: ${manifest.count} ids -> ${path.relative(ROOT, OUT)}`);
console.log(`  reconcile-leaning: ${manifest.reconcileFirst.length}  discrepancy-leaning: ${manifest.discrepancyFirst.length}`);
console.log(`  lean mismatches (trust consensus): ${manifest.leanMismatch.length}`);
console.log(`  avg bundle: ${manifest.avgBytes} bytes (~${Math.round(manifest.avgBytes / 4)} tok/row)`);
console.log(`  null-verse candidates dropped: ${manifest.droppedVerses}`);
if (manifest.manualReview.length) console.log(`  ⚠ excluded (<2 usable verses -> manual): ${manifest.manualReview.map((m) => m.id).join(', ')}`);
