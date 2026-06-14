/**
 * migrateAddScholarlyConsensus.js — Idempotent migration for the step-3 depth
 * fields (scholarly-consensus grading + textual-criticism flags). Populated by the
 * Opus batch pipeline (runScholarlyPipeline.js → mergeScholarlyToDb.js).
 *
 *   scholarly_consensus_levels  (id, name, description)   -- how scholarship weighs the tension
 *
 * Columns added to contradictions:
 *   scholarly_consensus_id    INTEGER → scholarly_consensus_levels(id)
 *   textual_variant_involved  INTEGER   -- 0/1: does a known manuscript variant bear on it?
 *   variant_description        TEXT      -- short note on the variant (nullable)
 *   critical_apparatus_ref     TEXT      -- apparatus / source citation, e.g. "NA28 at John 7:53" (nullable)
 *
 *   node migrateAddScholarlyConsensus.js
 *
 * Env: DB_PATH (default ./contradictions.db)
 */
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH || './contradictions.db';

const CONSENSUS_LEVELS = [
    { id: 1, name: 'genuine_contradiction',  description: 'Mainstream critical scholarship holds this is a real, unresolvable tension.' },
    { id: 2, name: 'probable_contradiction', description: 'Most critical scholars lean toward a genuine contradiction; only minority harmonizations exist.' },
    { id: 3, name: 'genuinely_disputed',     description: 'Credentialed scholars are genuinely divided; both contradiction and reconciliation have serious defenders.' },
    { id: 4, name: 'probable_harmonization', description: 'Most scholars, including critical ones, accept a plausible reconciliation.' },
    { id: 5, name: 'apparent_only',          description: 'The tension dissolves on a careful reading; it survives only in shallow treatments.' },
];

function addColumn(db, table, column, ddl) {
    const cols = db.exec(`PRAGMA table_info(${table})`)[0].values.map(v => v[1]);
    if (!cols.includes(column)) {
        db.run(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
        console.log(`${table}.${column}: added`);
    } else {
        console.log(`${table}.${column}: already exists, skipped`);
    }
}

async function main() {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));

    db.run(`
        CREATE TABLE IF NOT EXISTS scholarly_consensus_levels (
            id   INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL
        )
    `);
    for (const c of CONSENSUS_LEVELS) {
        db.run('INSERT OR IGNORE INTO scholarly_consensus_levels (id, name, description) VALUES (?, ?, ?)',
            [c.id, c.name, c.description]);
    }
    const n = db.exec('SELECT COUNT(*) FROM scholarly_consensus_levels')[0].values[0][0];
    console.log(`scholarly_consensus_levels: ready (${n} rows)`);

    addColumn(db, 'contradictions', 'scholarly_consensus_id', 'scholarly_consensus_id INTEGER REFERENCES scholarly_consensus_levels(id)');
    addColumn(db, 'contradictions', 'textual_variant_involved', 'textual_variant_involved INTEGER');
    addColumn(db, 'contradictions', 'variant_description', 'variant_description TEXT');
    addColumn(db, 'contradictions', 'critical_apparatus_ref', 'critical_apparatus_ref TEXT');

    db.run('CREATE INDEX IF NOT EXISTS idx_contradictions_consensus ON contradictions(scholarly_consensus_id)');
    console.log('idx_contradictions_consensus: ready');

    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
    console.log(`\nSaved → ${DB_PATH}`);
    db.close();
}

main().catch(err => { console.error(err); process.exit(1); });
