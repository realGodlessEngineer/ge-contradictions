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
 *                SCHEMA_ONLY (default unset)
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const IN_DIR = process.env.IN_DIR || './db';
const OUT_PATH = process.env.OUT_PATH || './contradictions.db';
const SCHEMA_ONLY = !!process.env.SCHEMA_ONLY;

function readSql(name) {
    const p = path.join(IN_DIR, name);
    if (!fs.existsSync(p)) throw new Error(`Missing SQL file: ${p} (run "node dumpDbToSql.js" first)`);
    return fs.readFileSync(p, 'utf8');
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

    db.run(readSql('schema.sql'));
    console.log('Applied schema.sql');

    if (!SCHEMA_ONLY) {
        db.run(readSql('data.sql'));
        console.log('Applied data.sql');
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
