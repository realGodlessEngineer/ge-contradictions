/**
 * buildDbFromSql.js — Rebuild contradictions.db from contradictions.sql.
 *
 * Pure-JS (sql.js) — no native build tools required. Run from inside this
 * `contradictions_db/` folder:
 *
 *   node buildDbFromSql.js                 # writes ../contradictions.db (backs up any existing copy)
 *   OUT_PATH=./fresh.db node buildDbFromSql.js
 *
 * Requires the `sql.js` package on the path (`npm i sql.js` if it isn't already
 * available in the app's node_modules). If you have the `sqlite3` CLI instead,
 * you don't need this script at all — just run, from this folder:
 *   sqlite3 ../contradictions.db < contradictions.sql
 *
 * Env overrides: IN_SQL (default ./contradictions.sql), OUT_PATH (default ../contradictions.db)
 *
 * NOTE: This folder is published by the upstream `contradictionScraper` project
 * (publishDb.js). Do not hand-edit — changes are overwritten on the next publish.
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const IN_SQL = process.env.IN_SQL || path.join(__dirname, 'contradictions.sql');
const OUT_PATH = process.env.OUT_PATH || path.join(__dirname, '..', 'contradictions.db');

function rowCount(db, table) {
    try { return db.exec(`SELECT COUNT(*) FROM ${table}`)[0].values[0][0]; }
    catch { return 'n/a'; }
}

async function main() {
    if (!fs.existsSync(IN_SQL)) throw new Error(`Missing SQL file: ${IN_SQL}`);
    const SQL = await initSqlJs();
    const db = new SQL.Database();

    db.run(fs.readFileSync(IN_SQL, 'utf8'));
    console.log(`Applied ${path.basename(IN_SQL)}`);
    for (const t of ['categories', 'contradiction_types', 'scholarly_consensus_levels', 'contradictions', 'answers', 'bible_references']) {
        console.log(`  ${t}: ${rowCount(db, t)} rows`);
    }

    if (fs.existsSync(OUT_PATH)) {
        fs.copyFileSync(OUT_PATH, `${OUT_PATH}.bak`);
        console.log(`Backed up existing DB -> ${OUT_PATH}.bak`);
    }
    fs.writeFileSync(OUT_PATH, Buffer.from(db.export()));
    db.close();
    console.log(`Wrote ${OUT_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
