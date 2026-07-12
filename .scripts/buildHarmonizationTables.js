// buildHarmonizationTables.js
// Bake the three harmonization_* derived tables into contradictions.db from the
// committed curation source files under data/harmonization/:
//   harmonization_row(contradiction_id PK, covered, reconcile_note, discrepancy_note,
//                      reconcile_half_line, discrepancy_half_line,
//                      reconcile_empty_note, reconcile_empty_note_attr,
//                      discrepancy_empty_note, discrepancy_empty_note_attr)
//   harmonization_quote(id, contradiction_id, pole, ord, text, attr, voice, href,
//                        source_kind, source_code)
//   harmonization_verse_pair(id, contradiction_id, ord, ref, snippet)
//
// This is the harmonization analogue of buildScholarshipTables.js: it DROPs and
// rebuilds ONLY these three tables. contradictions/answers/bible_references and
// the scholarship_* tables are never touched.
//
// Sources (all read-only):
//   data/harmonization/curation/machine/<id>.json   -- gen-1 machine excerpts (reconcile pole)
//   data/harmonization/curation/dossier/<id>.json    -- optional T5/T6 sidecar in the
//                                                        SPEC §3.2 camelCase shape:
//                                                        { contradiction_id, covered?,
//                                                          reconcile:{ note, halfLine,
//                                                            emptyNote, emptyNoteAttr,
//                                                            quotes:[{text,attr,voice?,href?,
//                                                              source?:{kind,code?}}] },
//                                                          discrepancy:{ ...same... },
//                                                          versePair:{ sides:[{ref,snippet,
//                                                            verseVersion,verseText}] } }.
//                                                        Only ref+snippet of a versePair side
//                                                        bake; verseVersion/verseText are the
//                                                        verifyVersePairs.py re-check fields.
//                                                        The dossier carries HAND quotes only
//                                                        (machine quotes come from machine/);
//                                                        it degrades gracefully when absent.
//                                                        NOTE camelCase here (the geBibleApp /
//                                                        verifyVersePairs.py convention), vs the
//                                                        snake_case baked-table columns.
//   data/harmonization/curation/pilot_fixtures.json  -- the 7-pilot hand baseline, used
//                                                        ONLY as a fallback for the 7
//                                                        pilot ids when no dossier exists.
//   data/harmonization/voices.json                   -- the seven-voice attribution codebook.
//   contradictions.db                                -- id membership (recommend_delete=0)
//                                                        and scholarly_consensus_id.
//
// Scoping (which ids to bake):
//   (default)        -> the 7 ratified pilots: 3, 4, 189, 439, 459, 468, 496
//   ALL=1             -> every id with a machine and/or dossier file, intersected with
//                        DB membership (recommend_delete=0)
//   IDS=3,4,189       -> an explicit comma-separated id list
//   Every mode is always intersected with DB membership; ids with no curation source at
//   all are logged and skipped.
//   MAP_CONNECTIVE_HALFLINE=1 -> when a pole has no dossier/pilot-fixture half_line, fall
//                        back to that pole's machine `row.<pole>.connective` as the
//                        half_line. OFF by default so the 7 pilots bake with half_line=null,
//                        exactly matching pilot_fixtures.json (this flag is the deferred
//                        full-corpus behavior, not the pilot behavior).
//
// DRY_RUN=1 -> assemble the full projection, run the validator (.scripts/validateHarmonization.js)
//   and both Python verbatim-floor gates, write a preview JSON to
//   data/harmonization/curation/_bake_preview.json, print a summary, and exit 0.
//   Makes ZERO DB writes and takes no backup. Validator/floor violations are EXPECTED right
//   now (dossier-only fields -- notes, verse pairs, hand-sourced 2nd-pole critics for
//   non-pilot ids -- are authored later by T5/T6) and are reported, not treated as bugs.
//
// (default, real run) fail-closed gates, run BEFORE any write:
//   1. validateProjection() from .scripts/validateHarmonization.js must return ok=true.
//   2. `python .scripts/verifyExcerpts.py` (verbatim + PD + traceability floor over every
//      machine quote) must exit 0.
//   3. `python .scripts/verifyVersePairs.py` (verbatim floor over every dossier verse-pair
//      snippet) must exit 0.
//   4. After the INSERTs, inside the transaction: `PRAGMA foreign_key_check` must return
//      no rows.
//   Any failure -> print specifics, exit 1, NO backup, NO write. A missing `python`
//   executable is fail-closed in a real run; in DRY_RUN it is reported as a warning and the
//   run continues.
//
// Real-run write sequence: backup (.archive/<db>.bak-<stamp>) -> BEGIN -> DROP the 3 tables
//   (child-first: verse_pair, quote, row) -> CREATE x3 + 2 indexes -> prepared INSERTs with
//   explicit sequential ids (ascending contradiction_id; within an id, reconcile-pole quotes
//   then discrepancy-pole quotes by ord; verse pairs by ord) -> PRAGMA foreign_key_check ->
//   COMMIT -> fs.writeFileSync(DB_PATH, db.export()). Any thrown error -> ROLLBACK, log, exit 1.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const initSqlJs = require('sql.js');
const { validateProjection } = require('./validateHarmonization');

const REPO_ROOT = path.join(__dirname, '..');
// DB_PATH env override (matches dumpDbToSql.js / publishDb.js / validateHarmonization.js)
// so the bake can target a scratch copy of contradictions.db for dry-testing the real
// write path without touching the live DB. Defaults to the repo-root DB.
const DB_PATH = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : path.join(REPO_ROOT, 'contradictions.db');
const HARMONIZATION_DIR = path.join(REPO_ROOT, 'data', 'harmonization');
const CURATION_DIR = path.join(HARMONIZATION_DIR, 'curation');
const MACHINE_DIR = path.join(CURATION_DIR, 'machine');
const DOSSIER_DIR = path.join(CURATION_DIR, 'dossier');
const PILOT_FIXTURES_PATH = path.join(CURATION_DIR, 'pilot_fixtures.json');
const VOICES_PATH = path.join(HARMONIZATION_DIR, 'voices.json');
const PREVIEW_PATH = path.join(CURATION_DIR, '_bake_preview.json');

const PILOT_IDS = [3, 4, 189, 439, 459, 468, 496];
// Non-two-pole rows excluded from the harmonization surface (2026-07-11): these are
// Bible-vs-reality claims (scripture vs. observed fact), not verse-vs-verse tensions,
// so they have no reconcile-critic/discrepancy-critic structure to bake. They keep
// no harmonization_row (geBibleApp shows no both-poles surface for them).
const EXCLUDE_IDS = new Set([561, 562, 564]); // 561 rabbits/cud, 562 conception, 564 snakes/dust

const DRY_RUN = process.env.DRY_RUN === '1';
const ALL = process.env.ALL === '1';
const IDS_ENV = process.env.IDS;
const MAP_CONNECTIVE_HALFLINE = process.env.MAP_CONNECTIVE_HALFLINE === '1';

function loadJsonIfExists(p) {
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function listIdsFromDir(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(f => /^\d+\.json$/.test(f))
        .map(f => parseInt(f, 10));
}

function rowsToObjects(result) {
    if (!result || result.length === 0) return [];
    const { columns, values } = result[0];
    return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
}

function stamp() {
    // avoid Date.now()/new Date() concerns — use a process-time based stamp
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

// ---------------------------------------------------------------------------
// Field precedence helpers (dossier -> pilot_fixtures[pilots only] -> default)
// ---------------------------------------------------------------------------

function pickWithPilotFallback(dossierVal, pilotVal, isPilot) {
    if (dossierVal !== undefined && dossierVal !== null) return dossierVal;
    if (isPilot && pilotVal !== undefined && pilotVal !== null) return pilotVal;
    return null;
}

/** Map a dossier quote (SPEC §3.2 camelCase Quote shape: {text, attr, voice?,
 * href?, source?}) to a projection quote. In the bridge, dossier quotes are the
 * pole's HAND quotes (machine quotes come from the gen-1 machine/<id>.json
 * files); source.kind/code are honored when present, defaulting to hand/null.
 * `ord` is assigned by the caller. */
function dossierQuote(id, pole, q) {
    const src = (q && q.source) || {};
    return {
        contradiction_id: id,
        pole,
        text: q.text,
        attr: q.attr,
        voice: q.voice !== undefined ? q.voice : null,
        href: q.href !== undefined ? q.href : null,
        source_kind: src.kind || 'hand',
        source_code: (src.kind === 'machine' && src.code) ? src.code : null,
    };
}

// ---------------------------------------------------------------------------
// Per-id projection builders
// ---------------------------------------------------------------------------

/** Reconcile-pole quotes: machine excerpts (TYN dropped, attr rebuilt from the
 * voices codebook) first, then any dossier reconcile.quotes[] (SPEC §3.2). */
function buildReconcileQuotes(id, machine, dossier, voices) {
    const quotes = [];
    if (machine && Array.isArray(machine.excerpts)) {
        for (const ex of machine.excerpts) {
            if (ex.pole !== 'reconcile') continue;
            if (ex.source_code === 'TYN') continue;
            const voice = voices[ex.source_code];
            if (!voice) {
                throw new Error(`id ${id}: excerpt source_code '${ex.source_code}' is not in voices.json — cannot rebuild attr`);
            }
            quotes.push({
                contradiction_id: id,
                pole: 'reconcile',
                text: ex.excerpt_text,
                // §D.2 canonical head: "Author (year), Work, on verse." — the dated
                // parenthetical must follow the AUTHOR (not the year-at-end shape of
                // voices.display), so validateHarmonization's DOSSIER_ATTR_HEAD_RE head
                // parse yields a clean author name and note_lead_source can match a
                // note that names the author (e.g. "Clarke"). This also matches the
                // author-first-dated shape the pilot hand quotes already use.
                attr: `${voice.author} (${voice.year}), ${voice.work}, on ${ex.verse_ref}.`,
                voice: null,
                href: null,
                source_kind: 'machine',
                source_code: ex.source_code,
            });
        }
    }
    if (dossier && dossier.reconcile && Array.isArray(dossier.reconcile.quotes)) {
        for (const q of dossier.reconcile.quotes) quotes.push(dossierQuote(id, 'reconcile', q));
    }
    quotes.forEach((q, i) => { q.ord = i; });
    return quotes;
}

/** Discrepancy-pole quotes: dossier.discrepancy.quotes[] (SPEC §3.2) if a dossier
 * file exists for this id (even if that list is empty — an authored dossier's
 * silence is not a fallback trigger); else, for pilot ids only, pilot_fixtures.json's
 * discrepancy excerpts; else none (honest absence, handled by *_empty_note). */
function buildDiscrepancyQuotes(id, dossier, isPilot, pilotExcerptsByCidPole) {
    const quotes = [];
    if (dossier) {
        const handQuotes = (dossier.discrepancy && Array.isArray(dossier.discrepancy.quotes))
            ? dossier.discrepancy.quotes
            : [];
        for (const q of handQuotes) quotes.push(dossierQuote(id, 'discrepancy', q));
    } else if (isPilot) {
        const fixtureExcerpts = pilotExcerptsByCidPole.get(`${id}|discrepancy`) || [];
        for (const ex of fixtureExcerpts) {
            quotes.push({
                contradiction_id: id,
                pole: 'discrepancy',
                text: ex.excerpt_text,
                attr: ex.attribution,
                voice: null,
                href: null,
                source_kind: 'hand',
                source_code: null,
            });
        }
    }
    quotes.forEach((q, i) => { q.ord = i; });
    return quotes;
}

/** harmonization_row for one id, per-pole field precedence: dossier -> (pilots
 * only) pilot_fixtures -> default. `note` has no pilot fallback (pilot_fixtures
 * carries no note field at all). */
function buildRow(id, machine, dossier, isPilot, pilotRow) {
    const covered = (dossier && dossier.covered !== undefined && dossier.covered !== null) ? dossier.covered : 1;
    const row = { contradiction_id: id, covered };

    for (const pole of ['reconcile', 'discrepancy']) {
        const dossierPole = dossier ? dossier[pole] : undefined;
        const pilotPole = (isPilot && pilotRow) ? pilotRow[pole] : undefined;
        const machinePole = (machine && machine.row) ? machine.row[pole] : undefined;

        row[`${pole}_note`] = (dossierPole && dossierPole.note !== undefined && dossierPole.note !== null)
            ? dossierPole.note
            : null;

        // Dossier keys are SPEC §3.2 camelCase (halfLine/emptyNote/emptyNoteAttr);
        // pilot_fixtures.json is the legacy snake_case shape (half_line/empty_note/...).
        let halfLine = pickWithPilotFallback(
            dossierPole ? dossierPole.halfLine : undefined,
            pilotPole ? pilotPole.half_line : undefined,
            isPilot
        );
        if (halfLine === null && MAP_CONNECTIVE_HALFLINE && machinePole && machinePole.connective) {
            halfLine = machinePole.connective;
        }
        row[`${pole}_half_line`] = halfLine;

        row[`${pole}_empty_note`] = pickWithPilotFallback(
            dossierPole ? dossierPole.emptyNote : undefined,
            pilotPole ? pilotPole.empty_note : undefined,
            isPilot
        );
        row[`${pole}_empty_note_attr`] = pickWithPilotFallback(
            dossierPole ? dossierPole.emptyNoteAttr : undefined,
            pilotPole ? pilotPole.empty_note_attr : undefined,
            isPilot
        );
    }
    return row;
}

/** harmonization_verse_pair rows for one id: dossier versePair.sides[] (SPEC
 * §3.2 camelCase) only. Only ref + snippet bake; verseVersion/verseText are
 * re-check fields consumed by verifyVersePairs.py, not columns. */
function buildVersePairs(id, dossier) {
    if (!dossier || !dossier.versePair || !Array.isArray(dossier.versePair.sides)) return [];
    return dossier.versePair.sides.map((side, i) => ({
        contradiction_id: id,
        ord: i,
        ref: side.ref,
        snippet: side.snippet,
    }));
}

// ---------------------------------------------------------------------------
// Python verbatim-floor gates
// ---------------------------------------------------------------------------

/** Runs a repo-root-relative python script via execFileSync (cwd=repoRoot).
 * Returns {ranOk, missingExe, output, error}. Never throws — the caller decides
 * whether a non-ranOk result is fatal (real run) or just reported (DRY_RUN). */
function runPythonGate(scriptRelPath) {
    const result = { ranOk: false, missingExe: false, output: '', error: null };
    try {
        result.output = execFileSync('python', [scriptRelPath], { cwd: REPO_ROOT, encoding: 'utf8', stdio: 'pipe' });
        result.ranOk = true;
    } catch (err) {
        if (err.code === 'ENOENT') {
            result.missingExe = true;
            result.error = `python executable not found on PATH — cannot run ${scriptRelPath}`;
        } else {
            result.output = (err.stdout ? err.stdout.toString() : '') + (err.stderr ? err.stderr.toString() : '');
            result.error = `${scriptRelPath} exited non-zero`;
        }
    }
    return result;
}

// ---------------------------------------------------------------------------
// Violation / gate reporting
// ---------------------------------------------------------------------------

function printViolations(violations) {
    const byCid = new Map();
    for (const v of violations) {
        if (!byCid.has(v.cid)) byCid.set(v.cid, []);
        byCid.get(v.cid).push(v);
    }
    const cids = [...byCid.keys()].sort((a, b) => (a ?? -1) - (b ?? -1));
    for (const cid of cids) {
        console.log(`  id ${cid}:`);
        for (const v of byCid.get(cid)) {
            console.log(`    - [${v.code}] ${v.message}`);
        }
    }
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));

    const voicesData = JSON.parse(fs.readFileSync(VOICES_PATH, 'utf8'));
    const voices = voicesData.voices || {};

    const pilotFixtures = loadJsonIfExists(PILOT_FIXTURES_PATH) || { rows: [], excerpts: [] };
    const pilotRowsByCid = new Map();
    for (const r of pilotFixtures.rows || []) pilotRowsByCid.set(r.contradiction_id, r);
    const pilotExcerptsByCidPole = new Map();
    for (const ex of pilotFixtures.excerpts || []) {
        const key = `${ex.contradiction_id}|${ex.pole}`;
        if (!pilotExcerptsByCidPole.has(key)) pilotExcerptsByCidPole.set(key, []);
        pilotExcerptsByCidPole.get(key).push(ex);
    }

    // --- scoping: which ids were requested ---
    let requestedIds;
    let scopeMode;
    if (IDS_ENV) {
        requestedIds = IDS_ENV.split(',').map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n));
        scopeMode = `IDS=${IDS_ENV}`;
    } else if (ALL) {
        requestedIds = [...new Set([...listIdsFromDir(MACHINE_DIR), ...listIdsFromDir(DOSSIER_DIR)])];
        scopeMode = 'ALL=1';
    } else {
        requestedIds = PILOT_IDS.slice();
        scopeMode = 'default (7 pilots)';
    }
    requestedIds = [...new Set(requestedIds)].sort((a, b) => a - b);

    // --- intersect with DB membership (recommend_delete = 0, treat NULL as 0) ---
    const dbRows = rowsToObjects(db.exec('SELECT id, recommend_delete FROM contradictions'));
    const dbState = new Map(dbRows.map(r => [r.id, r.recommend_delete]));

    const skipped = [];
    const dbEligible = [];
    for (const id of requestedIds) {
        if (!dbState.has(id)) { skipped.push({ id, reason: 'not-in-db' }); continue; }
        if (dbState.get(id) === 1) { skipped.push({ id, reason: 'recommend_delete' }); continue; }
        if (EXCLUDE_IDS.has(id)) { skipped.push({ id, reason: 'excluded-non-two-pole' }); continue; }
        dbEligible.push(id);
    }

    // --- further filter: must have SOME curation source ---
    const bakedIds = [];
    for (const id of dbEligible) {
        const isPilot = PILOT_IDS.includes(id);
        const hasMachine = fs.existsSync(path.join(MACHINE_DIR, `${id}.json`));
        const hasDossier = fs.existsSync(path.join(DOSSIER_DIR, `${id}.json`));
        const hasPilotFixture = isPilot && pilotRowsByCid.has(id);
        if (hasMachine || hasDossier || hasPilotFixture) {
            bakedIds.push(id);
        } else {
            skipped.push({ id, reason: 'no-curation-source' });
        }
    }
    bakedIds.sort((a, b) => a - b);

    console.log(`=== Harmonization bake: scope ${scopeMode} ===`);
    console.log('Requested ids:', requestedIds.join(', ') || '(none)');
    console.log('Baked ids    :', bakedIds.join(', ') || '(none)');
    if (skipped.length) {
        console.log('Skipped ids  :');
        for (const s of skipped) console.log(`  - ${s.id}: ${s.reason}`);
    }

    // --- assemble the projection ---
    const rows = [];
    const quotes = [];
    const versePairs = [];
    const perIdCounts = {};

    for (const id of bakedIds) {
        const machine = loadJsonIfExists(path.join(MACHINE_DIR, `${id}.json`));
        const dossier = loadJsonIfExists(path.join(DOSSIER_DIR, `${id}.json`));
        const isPilot = PILOT_IDS.includes(id);
        const pilotRow = pilotRowsByCid.get(id);

        const reconcileQuotes = buildReconcileQuotes(id, machine, dossier, voices);
        const discrepancyQuotes = buildDiscrepancyQuotes(id, dossier, isPilot, pilotExcerptsByCidPole);
        const idRow = buildRow(id, machine, dossier, isPilot, pilotRow);
        const idVersePairs = buildVersePairs(id, dossier);

        rows.push(idRow);
        quotes.push(...reconcileQuotes, ...discrepancyQuotes);
        versePairs.push(...idVersePairs);

        perIdCounts[id] = {
            reconcileQuotes: reconcileQuotes.length,
            discrepancyQuotes: discrepancyQuotes.length,
            versePairs: idVersePairs.length,
            hasMachine: !!machine,
            hasDossier: !!dossier,
            isPilot,
        };
    }

    // explicit sequential ids, in the exact order they will be inserted
    quotes.forEach((q, i) => { q.id = i + 1; });
    versePairs.forEach((vp, i) => { vp.id = i + 1; });

    // --- consensusByCid, resolved for every contradiction (cheap full-table join) ---
    const consensusRows = rowsToObjects(db.exec(
        'SELECT c.id AS id, l.name AS name FROM contradictions c LEFT JOIN scholarly_consensus_levels l ON c.scholarly_consensus_id = l.id'
    ));
    const consensusByCid = {};
    for (const r of consensusRows) consensusByCid[r.id] = r.name === undefined ? null : r.name;

    const projection = { rows, quotes, versePairs, consensusByCid };

    // --- gate 1: validator ---
    const validation = validateProjection(projection);
    console.log(`\nValidator: ${validation.ok ? 'OK (0 violations)' : `${validation.violations.length} violation(s)`}`);
    if (!validation.ok) {
        console.log('Violations:');
        printViolations(validation.violations);
    }

    // --- gates 2 & 3: python verbatim floors (run in both modes; only fatal in a real run) ---
    console.log('\n--- verifyExcerpts.py ---');
    const excerptsGate = runPythonGate('.scripts/verifyExcerpts.py');
    if (excerptsGate.output) console.log(excerptsGate.output.trim());
    if (excerptsGate.error) console.log((excerptsGate.missingExe ? 'WARNING: ' : 'ERROR: ') + excerptsGate.error);

    console.log('\n--- verifyVersePairs.py ---');
    const versePairsGate = runPythonGate('.scripts/verifyVersePairs.py');
    if (versePairsGate.output) console.log(versePairsGate.output.trim());
    if (versePairsGate.error) console.log((versePairsGate.missingExe ? 'WARNING: ' : 'ERROR: ') + versePairsGate.error);

    const reconcileTotal = quotes.filter(q => q.pole === 'reconcile').length;
    const discrepancyTotal = quotes.filter(q => q.pole === 'discrepancy').length;

    console.log('\n=== Harmonization bake summary ===');
    console.log('ids baked          :', bakedIds.length, '->', bakedIds.join(', ') || '(none)');
    console.log('quotes (reconcile) :', reconcileTotal);
    console.log('quotes (discrepancy):', discrepancyTotal);
    console.log('verse pairs        :', versePairs.length);
    console.log('validator          :', validation.ok ? 'OK' : `${validation.violations.length} violation(s)`);
    console.log('verifyExcerpts.py floor   :', excerptsGate.ranOk ? 'PASS' : (excerptsGate.missingExe ? 'SKIPPED (python missing)' : 'FAIL'));
    console.log('verifyVersePairs.py floor :', versePairsGate.ranOk ? 'PASS' : (versePairsGate.missingExe ? 'SKIPPED (python missing)' : 'FAIL'));

    if (DRY_RUN) {
        fs.mkdirSync(path.dirname(PREVIEW_PATH), { recursive: true });
        fs.writeFileSync(PREVIEW_PATH, JSON.stringify({
            scopeMode,
            requestedIds,
            bakedIds,
            skipped,
            perIdCounts,
            rows,
            quotes,
            versePairs,
            consensusByCid,
            validation,
            gates: {
                verifyExcerpts: { ranOk: excerptsGate.ranOk, missingExe: excerptsGate.missingExe, error: excerptsGate.error },
                verifyVersePairs: { ranOk: versePairsGate.ranOk, missingExe: versePairsGate.missingExe, error: versePairsGate.error },
            },
        }, null, 2));
        console.log('\nDRY RUN: wrote', path.relative(REPO_ROOT, PREVIEW_PATH), '- no DB writes made.');
        db.close();
        return;
    }

    // ------------------------------------------------------------------
    // REAL RUN: fail-closed gates, then write.
    // ------------------------------------------------------------------
    if (!validation.ok) {
        console.error('\nBuild failed: validateProjection() reported violations (see above). No backup or write made.');
        db.close();
        process.exit(1);
    }
    if (!excerptsGate.ranOk) {
        console.error('\nBuild failed: verifyExcerpts.py gate did not pass. No backup or write made.');
        db.close();
        process.exit(1);
    }
    if (!versePairsGate.ranOk) {
        console.error('\nBuild failed: verifyVersePairs.py gate did not pass. No backup or write made.');
        db.close();
        process.exit(1);
    }

    const archiveDir = path.join(path.dirname(DB_PATH), '.archive');
    fs.mkdirSync(archiveDir, { recursive: true });
    const bak = path.join(archiveDir, `${path.basename(DB_PATH)}.bak-${stamp()}`);
    fs.copyFileSync(DB_PATH, bak);
    console.log('\nBackup written:', path.basename(bak));

    db.run('BEGIN');
    try {
        db.run('DROP TABLE IF EXISTS harmonization_verse_pair');
        db.run('DROP TABLE IF EXISTS harmonization_quote');
        db.run('DROP TABLE IF EXISTS harmonization_row');

        db.run(`CREATE TABLE harmonization_quote (
            id INTEGER PRIMARY KEY,
            contradiction_id INTEGER NOT NULL,
            pole TEXT NOT NULL,
            ord INTEGER NOT NULL,
            text TEXT NOT NULL,
            attr TEXT NOT NULL,
            voice TEXT,
            href TEXT,
            source_kind TEXT NOT NULL,
            source_code TEXT,
            FOREIGN KEY (contradiction_id) REFERENCES contradictions(id)
        )`);
        db.run(`CREATE TABLE harmonization_row (
            contradiction_id INTEGER PRIMARY KEY,
            covered INTEGER NOT NULL DEFAULT 1,
            reconcile_note TEXT,
            discrepancy_note TEXT,
            reconcile_half_line TEXT,
            discrepancy_half_line TEXT,
            reconcile_empty_note TEXT,
            reconcile_empty_note_attr TEXT,
            discrepancy_empty_note TEXT,
            discrepancy_empty_note_attr TEXT,
            FOREIGN KEY (contradiction_id) REFERENCES contradictions(id)
        )`);
        db.run(`CREATE TABLE harmonization_verse_pair (
            id INTEGER PRIMARY KEY,
            contradiction_id INTEGER NOT NULL,
            ord INTEGER NOT NULL,
            ref TEXT NOT NULL,
            snippet TEXT NOT NULL,
            FOREIGN KEY (contradiction_id) REFERENCES contradictions(id)
        )`);
        db.run('CREATE INDEX idx_hq_cid_pole_ord ON harmonization_quote(contradiction_id, pole, ord)');
        db.run('CREATE INDEX idx_hvp_cid_ord ON harmonization_verse_pair(contradiction_id, ord)');

        const insRow = db.prepare(`INSERT INTO harmonization_row
            (contradiction_id, covered, reconcile_note, discrepancy_note,
             reconcile_half_line, discrepancy_half_line,
             reconcile_empty_note, reconcile_empty_note_attr,
             discrepancy_empty_note, discrepancy_empty_note_attr)
            VALUES (?,?,?,?,?,?,?,?,?,?)`);
        for (const r of rows) {
            insRow.run([
                r.contradiction_id, r.covered, r.reconcile_note, r.discrepancy_note,
                r.reconcile_half_line, r.discrepancy_half_line,
                r.reconcile_empty_note, r.reconcile_empty_note_attr,
                r.discrepancy_empty_note, r.discrepancy_empty_note_attr,
            ]);
        }
        insRow.free();

        const insQuote = db.prepare(`INSERT INTO harmonization_quote
            (id, contradiction_id, pole, ord, text, attr, voice, href, source_kind, source_code)
            VALUES (?,?,?,?,?,?,?,?,?,?)`);
        for (const q of quotes) {
            insQuote.run([q.id, q.contradiction_id, q.pole, q.ord, q.text, q.attr, q.voice, q.href, q.source_kind, q.source_code]);
        }
        insQuote.free();

        const insVp = db.prepare(`INSERT INTO harmonization_verse_pair
            (id, contradiction_id, ord, ref, snippet)
            VALUES (?,?,?,?,?)`);
        for (const vp of versePairs) {
            insVp.run([vp.id, vp.contradiction_id, vp.ord, vp.ref, vp.snippet]);
        }
        insVp.free();

        const fkViolations = db.exec('PRAGMA foreign_key_check');
        if (fkViolations.length && fkViolations[0].values.length) {
            db.run('ROLLBACK');
            console.error('\nBuild failed: PRAGMA foreign_key_check returned violations:');
            console.error(JSON.stringify(rowsToObjects(fkViolations), null, 2));
            db.close();
            process.exit(1);
        }

        db.run('COMMIT');
        console.log(`\nInserted ${rows.length} row(s), ${quotes.length} quote(s), ${versePairs.length} verse-pair side(s).`);
    } catch (err) {
        db.run('ROLLBACK');
        console.error('Build failed, rolled back:', err);
        db.close();
        process.exit(1);
    }

    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
    db.close();
    console.log('Wrote', path.basename(DB_PATH));
}

main().catch(err => { console.error(err); process.exit(1); });
