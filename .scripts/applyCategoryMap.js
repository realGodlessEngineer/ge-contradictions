/**
 * applyCategoryMap.js — Apply a classification map to contradictions.category_id.
 *
 * Reads data/category_map.json — either an array of {id, category} objects, or an
 * object {"<id>": "<category name>"}. `category` must match a categories.name
 * exactly (case-insensitive). UPDATE-only, keyed by id. Backs up the DB first
 * (timestamped .bak), runs in a transaction (ROLLBACK on error). Re-runnable and
 * incremental — apply one batch at a time if you like.
 *
 *   node applyCategoryMap.js
 *
 * Env: DB_PATH (default ./contradictions.db), MAP (default ./data/category_map.json)
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH || './contradictions.db';
const MAP = process.env.MAP || './data/category_map.json';

function rows(db, sql, p) {
    const r = db.exec(sql, p);
    if (!r[0]) return [];
    const { columns, values } = r[0];
    return values.map(v => Object.fromEntries(columns.map((c, i) => [c, v[i]])));
}

(async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));

    const cats = rows(db, 'SELECT id, name FROM categories');
    if (!cats.length) { console.error('No categories table/rows — run migrateAddCategory.js first.'); process.exit(1); }
    const byName = Object.fromEntries(cats.map(c => [c.name.toLowerCase().trim(), c.id]));
    const validIds = new Set(rows(db, 'SELECT id FROM contradictions').map(r => r.id));

    const raw = JSON.parse(fs.readFileSync(MAP, 'utf8'));
    const entries = Array.isArray(raw)
        ? raw.map(e => ({ id: Number(e.id), category: e.category }))
        : Object.entries(raw).map(([id, category]) => ({ id: Number(id), category }));

    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveDir = path.join(path.dirname(DB_PATH), '.archive');
    fs.mkdirSync(archiveDir, { recursive: true });
    const bak = path.join(archiveDir, `${path.basename(DB_PATH)}.bak-${ts}`);
    fs.copyFileSync(DB_PATH, bak);

    let applied = 0, unknownCat = 0, unknownId = 0;
    db.run('BEGIN');
    try {
        for (const { id, category } of entries) {
            const cid = byName[String(category || '').toLowerCase().trim()];
            if (!cid) { console.warn(`  Unknown category "${category}" (id ${id}) — skipped`); unknownCat++; continue; }
            if (!validIds.has(id)) { console.warn(`  Unknown contradiction id ${id} — skipped`); unknownId++; continue; }
            db.run('UPDATE contradictions SET category_id = ? WHERE id = ?', [cid, id]);
            applied++;
        }
        db.run('COMMIT');
    } catch (e) {
        db.run('ROLLBACK');
        console.error('ROLLBACK:', e.message);
        process.exit(1);
    }

    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));

    const dist = rows(db, `
        SELECT c.name, COUNT(co.id) AS n
        FROM categories c LEFT JOIN contradictions co ON co.category_id = c.id
        GROUP BY c.id ORDER BY c.id`);
    const uncat = rows(db, 'SELECT COUNT(*) AS n FROM contradictions WHERE category_id IS NULL')[0].n;

    console.log(`Backup: ${bak}`);
    console.log(`Applied: ${applied}  Unknown category: ${unknownCat}  Unknown id: ${unknownId}`);
    console.log('\nDistribution:');
    dist.forEach(r => console.log(`  ${String(r.n).padStart(4)}  ${r.name}`));
    console.log(`  ${String(uncat).padStart(4)}  (uncategorised)`);
    db.close();
})().catch(e => { console.error(e); process.exit(1); });
