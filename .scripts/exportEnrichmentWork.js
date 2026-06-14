/**
 * exportEnrichmentWork.js — Dump contradictions (with their answers) plus the
 * type/resolution codebooks and the difficulty/notoriety rubrics into
 * data/enrichment_work.json for the Sonnet classification agent.
 *
 * By default only dumps rows still needing a contradiction_type (incremental:
 * re-run after each applied batch to get the remainder). ALL=1 dumps every row;
 * LIMIT=N caps the batch size (lowest ids first).
 *
 *   node exportEnrichmentWork.js
 *   LIMIT=40 node exportEnrichmentWork.js     # a first validation batch
 *   ALL=1 node exportEnrichmentWork.js
 *
 * Env: DB_PATH (default ./contradictions.db), OUT (default ./data/enrichment_work.json),
 *      ALL, LIMIT
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH || './contradictions.db';
const OUT = process.env.OUT || './data/enrichment_work.json';
const ALL = process.env.ALL === '1';
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : null;

const DIFFICULTY_RUBRIC = {
    description: 'How hard the contradiction is to spot and understand (1 easiest … 5 hardest).',
    scale: {
        1: 'Obvious on the surface to any reader (e.g. two plainly different numbers).',
        2: 'Noticeable with a careful read of both passages.',
        3: 'Requires cross-referencing passages or some Bible background.',
        4: 'Requires scholarly context — ANE culture, genre conventions, historical setting.',
        5: 'Requires specialist knowledge — textual criticism, original languages, or source criticism.',
    },
};

const NOTORIETY_RUBRIC = {
    description: 'How widely cited / famous this specific contradiction is (1 obscure … 5 iconic).',
    scale: {
        1: 'Obscure; rarely discussed anywhere.',
        2: 'Occasionally mentioned.',
        3: 'Commonly cited in contradiction lists.',
        4: 'Frequently cited; a staple of debates and apologetics.',
        5: 'Iconic, canonical example (e.g. the two creation accounts, Judas’s death, the resurrection-morning discrepancies).',
    },
};

function rows(db, sql) {
    const r = db.exec(sql);
    if (!r[0]) return [];
    const { columns, values } = r[0];
    return values.map(v => Object.fromEntries(columns.map((c, i) => [c, v[i]])));
}

(async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));

    const types = rows(db, 'SELECT name, description FROM contradiction_types ORDER BY id');
    if (!types.length) {
        console.error('Missing taxonomy rows — run "node migrateAddContradictionType.js" first.');
        process.exit(1);
    }

    const where = ALL ? '' : 'WHERE c.contradiction_type_id IS NULL';
    const limit = LIMIT ? `LIMIT ${LIMIT}` : '';
    const cons = rows(db, `
        SELECT c.id, c.question, cat.name AS category,
               c.summary, c.commentary, c.testament_scope, c.books_in_tension
        FROM contradictions c
        LEFT JOIN categories cat ON cat.id = c.category_id
        ${where}
        ORDER BY c.id ${limit}
    `);

    const answersByCon = new Map();
    const ans = rows(db, `
        SELECT id, contradiction_id, answer, answer_explanation
        FROM answers ORDER BY contradiction_id, id`);
    for (const a of ans) {
        if (!answersByCon.has(a.contradiction_id)) answersByCon.set(a.contradiction_id, []);
        answersByCon.get(a.contradiction_id).push({
            id: a.id, answer: a.answer, answer_explanation: a.answer_explanation,
        });
    }

    const contradictions = cons.map(c => ({
        id: c.id,
        question: c.question,
        category: c.category,
        testament_scope: c.testament_scope,
        books_in_tension: c.books_in_tension,
        summary: c.summary,
        commentary: c.commentary,
        answers: answersByCon.get(c.id) || [],
    }));

    db.close();

    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({
        instructions: 'For each contradiction set contradiction_type (one name from contradiction_types) plus '
            + 'difficulty_level and notoriety_level (integers 1-5 per the rubrics). The answers[] are the '
            + 'competing scriptural positions, supplied as evidence — classify the contradiction, not the answers. '
            + 'Use ONLY the listed type names. Write results to data/enrichment_map.json.',
        count: contradictions.length,
        contradiction_types: types,
        difficulty_rubric: DIFFICULTY_RUBRIC,
        notoriety_rubric: NOTORIETY_RUBRIC,
        contradictions,
    }, null, 2), 'utf8');

    console.log(`Wrote ${OUT}: ${contradictions.length} contradiction(s) `
        + `(ALL=${ALL}${LIMIT ? `, LIMIT=${LIMIT}` : ''}); ${types.length} types listed`);
})().catch(e => { console.error(e); process.exit(1); });
