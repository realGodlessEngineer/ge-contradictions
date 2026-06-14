/**
 * exportScholarlyBatches.js — Dump contradictions needing step-3 enrichment into
 * data/scholarly/batch_NN.json (20 per batch) for the Opus batch pipeline.
 *
 * Each entry carries full source context (question, category, type, scope, the
 * existing summary/commentary/scholarship, and answers with their references) so
 * the scholar model can grade scholarly_consensus and the textual-variant flags.
 *
 * WIPES existing data/scholarly/batch_*.json and _state.json first (fresh run).
 * By default dumps only rows where scholarly_consensus_id IS NULL (incremental);
 * ALL=1 dumps every row; LIMIT=N caps the count (lowest ids first — used for the pilot).
 *
 *   node exportScholarlyBatches.js
 *   LIMIT=20 node exportScholarlyBatches.js      # pilot
 *   ALL=1 node exportScholarlyBatches.js
 *
 * Env: DB_PATH (default ./contradictions.db), OUT_DIR (default ./data/scholarly),
 *      BATCH_SIZE (default 20), ALL, LIMIT
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH || './contradictions.db';
const OUT_DIR = process.env.OUT_DIR || './data/scholarly';
const BATCH_SIZE = Number(process.env.BATCH_SIZE || 20);
const ALL = process.env.ALL === '1';
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

    const where = ALL ? '' : 'WHERE c.scholarly_consensus_id IS NULL';
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
        assessment: null,
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

    console.log(`Wrote ${n} batch file(s) to ${OUT_DIR} — ${entries.length} contradiction(s) `
        + `(ALL=${ALL}${LIMIT ? `, LIMIT=${LIMIT}` : ''}, ${BATCH_SIZE}/batch).`);
    if (!entries.length) console.log('Nothing to do — all rows already have scholarly_consensus_id (use ALL=1 to redo).');
})().catch(e => { console.error(e); process.exit(1); });
