/**
 * exportCommentaryBatches.js — Dump contradictions needing commentary EXPANSION into
 * data/commentary/batch_NN.json for the Opus batch pipeline (runCommentaryPipeline.js).
 *
 * Each entry carries full source context (question, category, type, scope, the EXISTING
 * summary/commentary/scholarship, and answers with their references) so the scholar model
 * can expand the commentary, judge harmonization, and cite scholarship.
 *
 * Default selection is the FIRST 200 entries (ids 1-200) — the block never covered by the
 * prior citation audit (AUDIT_METRICS.md starts at entry 201). Override the window with
 * ID_MIN/ID_MAX, hand-pick with IDS, take everything with ALL=1, or cap with LIMIT.
 *
 * WIPES existing data/commentary/batch_*.json and _state.json first (fresh run).
 *
 *   node exportCommentaryBatches.js                 # ids 1-200 (the default block)
 *   ID_MIN=201 ID_MAX=605 node exportCommentaryBatches.js
 *   IDS=4,17,88 node exportCommentaryBatches.js     # a hand-picked set
 *   ALL=1 node exportCommentaryBatches.js           # every row
 *   LIMIT=10 node exportCommentaryBatches.js        # pilot (first 10 of the window)
 *
 * Env: DB_PATH (./contradictions.db), OUT_DIR (./data/commentary), BATCH_SIZE (10),
 *      ID_MIN (1), ID_MAX (200), IDS (csv), ALL, LIMIT
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH || './contradictions.db';
const OUT_DIR = process.env.OUT_DIR || './data/commentary';
const BATCH_SIZE = Number(process.env.BATCH_SIZE || 10);
const ALL = process.env.ALL === '1';
const ID_MIN = Number(process.env.ID_MIN || 1);
const ID_MAX = Number(process.env.ID_MAX || 200);
const IDS = process.env.IDS
    ? process.env.IDS.split(',').map(s => Number(s.trim())).filter(n => Number.isInteger(n))
    : null;
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : null;

function rows(db, sql) {
    const r = db.exec(sql);
    if (!r[0]) return [];
    const { columns, values } = r[0];
    return values.map(v => Object.fromEntries(columns.map((c, i) => [c, v[i]])));
}

(async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));

    let where;
    if (ALL) where = '';
    else if (IDS && IDS.length) where = `WHERE c.id IN (${IDS.join(',')})`;
    else where = `WHERE c.id BETWEEN ${ID_MIN} AND ${ID_MAX}`;
    const limit = LIMIT ? `LIMIT ${LIMIT}` : '';

    const cons = rows(db, `
        SELECT c.id, c.question, cat.name AS category, t.name AS contradiction_type,
               c.testament_scope, c.books_in_tension, c.summary, c.commentary, c.scholarship
        FROM contradictions c
        LEFT JOIN categories cat          ON cat.id = c.category_id
        LEFT JOIN contradiction_types t   ON t.id = c.contradiction_type_id
        ${where}
        ORDER BY c.id ${limit}
    `);

    // answers + references for the selected contradictions
    const ids = new Set(cons.map(c => c.id));
    const ansById = new Map();
    const ansByCon = new Map();
    for (const a of rows(db, 'SELECT id, contradiction_id, answer, answer_explanation FROM answers ORDER BY contradiction_id, id')) {
        if (!ids.has(a.contradiction_id)) continue;
        const obj = { id: a.id, answer: a.answer, answer_explanation: a.answer_explanation, references: [] };
        ansById.set(a.id, obj);
        if (!ansByCon.has(a.contradiction_id)) ansByCon.set(a.contradiction_id, []);
        ansByCon.get(a.contradiction_id).push(obj);
    }
    for (const r of rows(db, 'SELECT answer_id, reference FROM bible_references ORDER BY answer_id, id')) {
        const a = ansById.get(r.answer_id);
        if (a) a.references.push(r.reference);
    }
    db.close();

    const entries = cons.map(c => ({
        id: c.id,
        question: c.question,
        category: c.category,
        contradiction_type: c.contradiction_type,
        testament_scope: c.testament_scope,
        books_in_tension: c.books_in_tension,
        summary: c.summary,
        commentary: c.commentary,
        scholarship: c.scholarship,
        answers: (ansByCon.get(c.id) || []).map(a => ({
            answer: a.answer, answer_explanation: a.answer_explanation, references: a.references,
        })),
        // pipeline fills these:
        commentary_out: null,
        _audit: null,
    }));

    // fresh run — clear old batch files + state
    fs.mkdirSync(OUT_DIR, { recursive: true });
    for (const f of fs.readdirSync(OUT_DIR)) {
        if (/^batch_\d+\.json$/.test(f) || f === '_state.json') fs.unlinkSync(path.join(OUT_DIR, f));
    }

    let n = 0;
    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        const slice = entries.slice(i, i + BATCH_SIZE);
        const file = path.join(OUT_DIR, `batch_${String(n).padStart(2, '0')}.json`);
        fs.writeFileSync(file, JSON.stringify({ batch: n, count: slice.length, entries: slice }, null, 2), 'utf8');
        n++;
    }

    const sel = ALL ? 'ALL' : IDS && IDS.length ? `IDS=${IDS.length}` : `ids ${ID_MIN}-${ID_MAX}`;
    console.log(`Wrote ${n} batch file(s) to ${OUT_DIR} — ${entries.length} contradiction(s) `
        + `(${sel}${LIMIT ? `, LIMIT=${LIMIT}` : ''}, ${BATCH_SIZE}/batch).`);
    if (!entries.length) console.log('Nothing selected — check ID_MIN/ID_MAX/IDS.');
    else console.log('Next (when you are ready to spend): node runCommentaryPipeline.js  (PING=1 first to pre-flight).');
})().catch(e => { console.error(e); process.exit(1); });
