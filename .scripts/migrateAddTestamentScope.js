/**
 * migrateAddTestamentScope.js — Idempotent migration adding canonical-scope fields.
 *
 * Adds two nullable columns to `contradictions`:
 *   testament_scope   TEXT  -- 'OT_internal' | 'NT_internal' | 'OT_vs_NT' (NULL = undetermined)
 *   books_in_tension  TEXT  -- comma-separated distinct canonical book names driving the scope
 *
 * Both are populated mechanically by deriveTestamentScope.js (no LLM). The
 * column is left NULL when no recognizable book references exist for an entry.
 *
 *   node migrateAddTestamentScope.js
 *
 * Env: DB_PATH (default ./contradictions.db)
 */
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH || './contradictions.db';

const NEW_COLUMNS = [
    { name: 'testament_scope', ddl: 'testament_scope TEXT' },
    { name: 'books_in_tension', ddl: 'books_in_tension TEXT' },
];

async function main() {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));

    const cols = db.exec('PRAGMA table_info(contradictions)')[0].values.map(v => v[1]);
    let changed = false;
    for (const col of NEW_COLUMNS) {
        if (!cols.includes(col.name)) {
            db.run(`ALTER TABLE contradictions ADD COLUMN ${col.ddl}`);
            console.log(`contradictions.${col.name}: added`);
            changed = true;
        } else {
            console.log(`contradictions.${col.name}: already exists, skipped`);
        }
    }

    if (changed) {
        fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
        console.log(`\nSaved → ${DB_PATH}`);
    } else {
        console.log('\nNo changes — DB untouched.');
    }
    db.close();
}

main().catch(err => { console.error(err); process.exit(1); });
