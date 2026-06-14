/**
 * exportCategoryQuestions.js — Dump uncategorised contradictions (id + question)
 * plus the canonical category list into data/category_work.json for the
 * classification agent to read.
 *
 *   node exportCategoryQuestions.js
 *
 * Env: DB_PATH (default ./contradictions.db), OUT (default ./data/category_work.json)
 *      ALL=1 to dump every row regardless of existing category_id.
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH || './contradictions.db';
const OUT = process.env.OUT || './data/category_work.json';
const ALL = process.env.ALL === '1';

function rows(db, sql) {
    const r = db.exec(sql);
    if (!r[0]) return [];
    const { columns, values } = r[0];
    return values.map(v => Object.fromEntries(columns.map((c, i) => [c, v[i]])));
}

(async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));
    const cats = rows(db, 'SELECT id, name, description FROM categories ORDER BY id');
    const where = ALL ? '' : 'WHERE category_id IS NULL';
    const qs = rows(db, `SELECT id, question FROM contradictions ${where} ORDER BY id`);
    db.close();

    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({
        count: qs.length,
        categories: cats,
        contradictions: qs
    }, null, 2), 'utf8');
    console.log(`Wrote ${OUT}: ${qs.length} uncategorised row(s) (ALL=${ALL}); ${cats.length} categories listed`);
})().catch(e => { console.error(e); process.exit(1); });
