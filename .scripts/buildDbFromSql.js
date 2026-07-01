/**
 * buildDbFromSql.js — Recreate contradictions.db from the SQL text in db/.
 *
 * Loads db/schema.sql then db/data.sql into a fresh in-memory sql.js database
 * and exports the result to disk. Use this to rebuild the DB from source control
 * or on a machine that only has the SQL files.
 *
 *   node buildDbFromSql.js                 # writes ./contradictions.db (backs up any existing file)
 *   OUT_PATH=./fresh.db node buildDbFromSql.js
 *   SCHEMA_ONLY=1 node buildDbFromSql.js   # create an empty schema with no rows
 *
 * Env overrides: IN_DIR (default ./db), OUT_PATH (default ./contradictions.db),
 *                SCHEMA_ONLY (default unset), CHUNK (default 500 — statements per
 *                db.run() batch; the SQL is applied in bounded batches so sql.js
 *                does not overflow wasm memory on the full-size DB)
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const IN_DIR = process.env.IN_DIR || './db';
const OUT_PATH = process.env.OUT_PATH || './contradictions.db';
const SCHEMA_ONLY = !!process.env.SCHEMA_ONLY;
const CHUNK = parseInt(process.env.CHUNK || '500', 10);

function readSql(name) {
    const p = path.join(IN_DIR, name);
    if (!fs.existsSync(p)) throw new Error(`Missing SQL file: ${p} (run "node dumpDbToSql.js" first)`);
    return fs.readFileSync(p, 'utf8');
}

// Split a SQL script into individual statements on top-level `;`, correctly
// skipping `;` inside single-quoted string literals (with '' escapes) and `--`
// line comments — so a text value that itself contains a newline or `;` is never
// mis-split. Applied in bounded batches because sql.js's db.run() allocates wasm
// memory proportional to the input string, and the full DB (~10k INSERTs) overflows
// it in one call ("memory access out of bounds"). Statements share one connection,
// so the file's BEGIN/COMMIT still wrap them in a single transaction.
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

function rowCount(db, table) {
    try {
        return db.exec(`SELECT COUNT(*) FROM ${table}`)[0].values[0][0];
    } catch {
        return 'n/a';
    }
}

async function main() {
    const SQL = await initSqlJs();
    const db = new SQL.Database();

    const nSchema = runSqlChunked(db, readSql('schema.sql'), CHUNK);
    console.log(`Applied schema.sql (${nSchema} statements)`);

    if (!SCHEMA_ONLY) {
        const nData = runSqlChunked(db, readSql('data.sql'), CHUNK);
        console.log(`Applied data.sql (${nData} statements, chunk ${CHUNK})`);
    } else {
        console.log('SCHEMA_ONLY set — skipping data.sql');
    }

    for (const t of ['categories', 'contradiction_types', 'scholarly_consensus_levels', 'contradictions', 'answers', 'bible_references']) {
        console.log(`  ${t}: ${rowCount(db, t)} rows`);
    }

    if (fs.existsSync(OUT_PATH)) {
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        const archiveDir = path.join(path.dirname(OUT_PATH), '.archive');
        fs.mkdirSync(archiveDir, { recursive: true });
        const backup = path.join(archiveDir, `${path.basename(OUT_PATH)}.bak-${stamp}`);
        fs.copyFileSync(OUT_PATH, backup);
        console.log(`Backed up existing DB -> ${backup}`);
    }

    fs.writeFileSync(OUT_PATH, Buffer.from(db.export()));
    db.close();
    console.log(`Wrote ${OUT_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
