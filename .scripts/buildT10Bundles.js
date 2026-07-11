/**
 * buildT10Bundles.js — mechanical (no-LLM) T10 input-bundle builder.
 *
 * T10 hand-sources a VERBATIM public-domain critic quote onto the DISCREPANCY (leaning) pole
 * of the Tier-A discrepancy-leaning rows so §10.2 count-parity holds (the leaning pole must
 * carry >= the minority pole's quote count and can never be honest-absence). Tier-A =
 * consensus 'genuine_contradiction' OR notoriety_level >= 4 (SPEC §8, the 232-row marquee).
 *
 * For each in-scope id it emits data/harmonization/curation/_t10bundles/bundle_<id>.json with
 * EVERYTHING an authoring agent needs to work OFFLINE against the pre-fetched well corpus
 * (fetchWell.js) — the question/summary, the two in-tension verse refs (from the T9 dossier),
 * parityTarget (how many critic quotes the leaning pole needs), the machine skeptic candidate
 * (a STARTING POINT — usually a modern, non-PD name; never a transcription source), and the
 * index of AVAILABLE PD critic sources with their local corpus file. No .db is opened by the
 * agent; the builder resolves everything up front.
 *
 * Scope (default): every Tier-A discrepancy-leaning id (recommend_delete=0) that HAS a machine
 * file AND a dossier AND does NOT already carry a source.kind='hand' discrepancy quote.
 * Overrides:  IDS=2,5,6  only these ids    FORCE=1  include ids already hand-sourced (redo)
 *             LIMIT=N    cap the worklist at the first N ids (id order)
 *
 * Read-only w.r.t. every .db; makes no DB writes. Run fetchWell.js first.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const MACH = path.join(ROOT, 'data/harmonization/curation/machine');
const DOSS = path.join(ROOT, 'data/harmonization/curation/dossier');
const OUT = path.join(ROOT, 'data/harmonization/curation/_t10bundles');
const WELL_DIR = path.join(OUT, '_well');
const WELL_JSON = path.join(ROOT, 'data/harmonization/pd-critics-well.json');

const RECONCILE_FIRST = new Set(['probable_harmonization', 'apparent_only']);
// Coarse routing hint so an agent greps the right corpus first (author reasoning still governs).
const WELL_SCOPE = {
    'paine-age-of-reason': 'Whole Bible — Pentateuch, OT history/numbers/genealogy/chronology, prophets, and the Gospels (esp. resurrection/nativity discrepancies).',
    'strauss-life-of-jesus': 'NT Gospels only — the life of Jesus: nativity, miracles, passion, resurrection, Gospel harmonization clashes.',
    'renan-the-apostles': 'NT — Acts / the early church / the apostles after the resurrection.',
    'renan-life-of-jesus': 'NT Gospels — the life of Jesus (single chapter: the crucifixion/death).',
    'schweitzer-quest-historical-jesus': 'NT Gospels — historical-Jesus problems, eschatology, Gospel-source contradictions.',
    'cassels-supernatural-religion': 'NT — Gospels/Acts miracles, authorship, and historical reliability.',
    'remsburg-the-christ': 'NT — the historicity of Jesus; Gospel contradictions in nativity, genealogy, passion, resurrection.',
    'troki-faith-strengthened': 'Jewish polemic — OT messianic proof-texts and OT/NT tensions; strong on OT law, prophecy, genealogy.',
    'ingersoll-christian-religion-rejoinder': 'Whole Bible — wide-ranging: OT atrocities/law/numbers and NT gospel discrepancies.',
    'colenso-pentateuch-examined': 'OT Pentateuch/Joshua ONLY — THE PD critic for OT-number discrepancies: census/army figures, the Exodus population, tabernacle & Levitical logistics, priestly arithmetic, and internal chronology contradictions in Genesis-Joshua.',
    'spinoza-theologico-political-1': 'OT/NT — prophecy, miracles vs natural law, the nature/attributes of God and the divine law; good for God-attribute and miracle-vs-nature contradictions.',
    'spinoza-theologico-political-2': 'OT — interpretation & authorship of the OT books; contradictions among the historical books (Chronicles vs Kings vs Samuel vs Ezra) and the compilation/authorship of the Pentateuch.',
    'voltaire-philosophical-dictionary': 'Whole Bible — wide-ranging alphabetical entries pressing OT law/atrocity/genealogy/chronology contradictions and NT gospel discrepancies.',
};

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const has = (dir, id) => fs.existsSync(path.join(dir, `${id}.json`));

// --- available well index (only sources fetchWell.js actually got) ---
const wellMeta = readJson(WELL_JSON);
const wellStatus = fs.existsSync(path.join(WELL_DIR, 'status.json')) ? readJson(path.join(WELL_DIR, 'status.json')) : {};
const availableWell = Object.entries(wellMeta)
    .filter(([k]) => ['ok', 'cached'].includes((wellStatus[k] || {}).status) && fs.existsSync(path.join(WELL_DIR, `${k}.txt`)))
    .map(([k, m]) => ({
        wellKey: k, author: m.author, work: m.work, year: m.year, pd_edition: m.pd_edition,
        source_url: m.source_url, corpusFile: path.relative(ROOT, path.join(WELL_DIR, `${k}.txt`)).replace(/\\/g, '/'),
        scope: WELL_SCOPE[k] || '',
    }));
if (!availableWell.length) { console.error('No well corpus found — run: node .scripts/fetchWell.js'); process.exit(1); }

// --- DB facts for every candidate id (question/summary/notoriety/consensus) ---
function dbFacts() {
    const py = `
import sqlite3, json
c = sqlite3.connect('file:./contradictions.db?mode=ro', uri=True)
cn = {i:n for i,n in c.execute('SELECT id,name FROM scholarly_consensus_levels')}
out = {}
for id, q, s, noto, cid, rd in c.execute("SELECT id, question, summary, COALESCE(notoriety_level,0), scholarly_consensus_id, COALESCE(recommend_delete,0) FROM contradictions"):
    out[id] = {"question": q, "summary": s, "notoriety": noto, "consensus": cn.get(cid), "recommend_delete": rd}
print(json.dumps(out))
`;
    return JSON.parse(execFileSync('python', ['-c', py], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
}
const facts = dbFacts();

// --- worklist ---
function hasHandDiscrepancy(id) {
    if (!has(DOSS, id)) return false;
    const d = readJson(path.join(DOSS, `${id}.json`));
    const qs = (d.discrepancy || {}).quotes || [];
    return qs.some((q) => q && (q.source || {}).kind === 'hand');
}
const FORCE = process.env.FORCE === '1';
let ids;
if (process.env.IDS) {
    ids = process.env.IDS.split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
} else {
    ids = Object.keys(facts).map(Number).filter((id) => {
        const f = facts[id];
        if (f.recommend_delete) return false;
        const tierA = f.consensus === 'genuine_contradiction' || f.notoriety >= 4;
        const discrepancyLeaning = !RECONCILE_FIRST.has(f.consensus);
        return tierA && discrepancyLeaning && has(MACH, id) && has(DOSS, id) && (FORCE || !hasHandDiscrepancy(id));
    }).sort((a, b) => a - b);
    if (process.env.LIMIT) ids = ids.slice(0, parseInt(process.env.LIMIT, 10));
}

fs.mkdirSync(OUT, { recursive: true });

const manifest = { count: 0, ids: [], availableWell: availableWell.map((w) => w.wellKey), parityTargets: {}, skipped: [] };
for (const id of ids) {
    const f = facts[id];
    if (!f) { manifest.skipped.push({ id, reason: 'not in contradictions.db' }); continue; }
    const mach = readJson(path.join(MACH, `${id}.json`));
    const doss = readJson(path.join(DOSS, `${id}.json`));

    // parityTarget = # reconcile quotes the baker WILL bake = non-TYN reconcile machine excerpts.
    const parityTarget = (mach.excerpts || []).filter((e) => e.pole === 'reconcile' && e.source_code !== 'TYN').length;
    // the two in-tension verse refs the T9 dossier already fixed (the WHAT of the contradiction)
    const verseRefs = ((doss.versePair || {}).sides || []).map((s) => s.ref);
    const skeptic = mach.row?.discrepancy?.skeptic || null;

    const bundle = {
        contradiction_id: id,
        question: f.question,
        summary: f.summary,
        notoriety: f.notoriety,
        consensus: f.consensus,
        lean: 'discrepancy_first',
        parityTarget,                       // how many hand critic quotes the leaning pole needs (>=)
        verseRefs,                          // the two verses already surfaced in the dossier verse-pair
        machineSkeptic: skeptic ? { name: skeptic.name, work: skeptic.work, year: skeptic.year } : null,
        discrepancyConnective: mach.row?.discrepancy?.connective || null,
        existingDiscrepancy: {
            note: doss.discrepancy?.note ?? null,
            emptyNote: doss.discrepancy?.emptyNote ?? null,
            emptyNoteAttr: doss.discrepancy?.emptyNoteAttr ?? null,
            quoteCount: ((doss.discrepancy || {}).quotes || []).length,
        },
        well: availableWell,                // the vetted PD critic corpus (local files) to extract from
    };
    const txt = JSON.stringify(bundle, null, 2);
    fs.writeFileSync(path.join(OUT, `bundle_${id}.json`), txt);
    manifest.count++; manifest.ids.push(id); manifest.parityTargets[id] = parityTarget;
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

const ptHist = {};
for (const id of manifest.ids) { const n = manifest.parityTargets[id]; ptHist[n] = (ptHist[n] || 0) + 1; }
console.log(`T10 bundles: ${manifest.count} ids -> ${path.relative(ROOT, OUT)}`);
console.log(`  available well sources: ${availableWell.length} (${availableWell.map((w) => w.wellKey).join(', ')})`);
console.log(`  parityTarget histogram (quotes needed on the leaning pole): ${JSON.stringify(ptHist)}`);
if (manifest.skipped.length) console.log(`  skipped: ${manifest.skipped.map((s) => `${s.id}(${s.reason})`).join(', ')}`);
