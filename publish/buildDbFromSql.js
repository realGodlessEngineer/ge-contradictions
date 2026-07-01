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
 * Env overrides: IN_SQL (default ./contradictions.sql), OUT_PATH (default ../contradictions.db),
 *                CHUNK (default 500 — statements per db.run() batch; the SQL is applied
 *                in bounded batches so sql.js does not overflow wasm memory on a large DB)
 *
 * NOTE: This folder is published by the upstream `contradictionScraper` project
 * (publishDb.js). Do not hand-edit — changes are overwritten on the next publish.
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const IN_SQL = process.env.IN_SQL || path.join(__dirname, 'contradictions.sql');
const OUT_PATH = process.env.OUT_PATH || path.join(__dirname, '..', 'contradictions.db');
const CHUNK = parseInt(process.env.CHUNK || '500', 10);

function rowCount(db, table) {
    try { return db.exec(`SELECT COUNT(*) FROM ${table}`)[0].values[0][0]; }
    catch { return 'n/a'; }
}

// Split a SQL script into statements on top-level `;`, skipping `;` inside
// single-quoted string literals (with '' escapes) and `--` line comments, so a
// text value that contains a newline or `;` is never mis-split. Applied in bounded
// batches because sql.js's db.run() allocates wasm memory proportional to the input
// string, and a large DB overflows it in one call ("memory access out of bounds").
// Statements share one connection, so the file's BEGIN/COMMIT still wrap them in a
// single transaction.
function splitSqlStatements(sql) {
    const stmts = [];
    let cur = '';
    let inStr = false, inComment = false;
    for (let i = 0; i < sql.length; i++) {
        const ch = sql[i];
        if (inComment) { cur += ch; if (ch === '\n') inComment = false; continue; }
        if (inStr) {
            cur += ch;
            if (ch === "'") { if (sql[i + 1] === "'") { cur += "'"; i++; } else inStr = false; }
            continue;
        }
        if (ch === '-' && sql[i + 1] === '-') { cur += '--'; i++; inComment = true; continue; }
        if (ch === "'") { cur += ch; inStr = true; continue; }
        if (ch === ';') { cur += ch; stmts.push(cur); cur = ''; continue; }
        cur += ch;
    }
    if (cur.trim()) stmts.push(cur);
    return stmts;
}

function runSqlChunked(db, sql, chunk) {
    const stmts = splitSqlStatements(sql);
    for (let i = 0; i < stmts.length; i += chunk) db.run(stmts.slice(i, i + chunk).join(''));
    return stmts.length;
}

async function main() {
    if (!fs.existsSync(IN_SQL)) throw new Error(`Missing SQL file: ${IN_SQL}`);
    const SQL = await initSqlJs();
    const db = new SQL.Database();

    const nStmts = runSqlChunked(db, fs.readFileSync(IN_SQL, 'utf8'), CHUNK);
    console.log(`Applied ${path.basename(IN_SQL)} (${nStmts} statements, chunk ${CHUNK})`);
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
