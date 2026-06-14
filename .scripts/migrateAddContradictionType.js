/**
 * migrateAddContradictionType.js — Idempotent migration adding the contradiction
 * mechanism taxonomy plus the two engagement scores (Sonnet-enrichment step 2).
 *
 * Mirrors the categories design: a normalized lookup table (name + description)
 * referenced by FK, so apps can pull the descriptor.
 *
 *   contradiction_types  (id, name, description)   -- HOW the contradiction arises
 *
 * Columns added to contradictions:
 *   contradiction_type_id  INTEGER → contradiction_types(id)
 *   difficulty_level        INTEGER   -- 1 (surface) … 5 (specialist)
 *   notoriety_level         INTEGER   -- 1 (obscure) … 5 (iconic)
 *
 *   node migrateAddContradictionType.js
 *
 * Env: DB_PATH (default ./contradictions.db)
 */
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH || './contradictions.db';

const CONTRADICTION_TYPES = [
    { id: 1, name: 'numerical',          description: 'Figures, counts, quantities, dimensions, or measurements that disagree.' },
    { id: 2, name: 'chronological',      description: 'Conflicts of timing, dating, duration, or the order in which events occur.' },
    { id: 3, name: 'genealogical',       description: 'Divergences in lineage, parentage, descent, or name lists of family lines.' },
    { id: 4, name: 'geographical',       description: 'Conflicting places, locations, routes, directions, or distances.' },
    { id: 5, name: 'theological',        description: "Incompatible claims about God's nature, attributes, will, or actions, or about doctrine." },
    { id: 6, name: 'ethical_legal',      description: 'Conflicting commands, laws, or moral judgments — what is permitted, forbidden, right, or wrong.' },
    { id: 7, name: 'factual_historical', description: 'Concrete factual or historical details (who/what/where) that conflict with each other or the record.' },
    { id: 8, name: 'translational',      description: 'A tension that exists only in certain translations and dissolves in the original languages.' },
    { id: 9, name: 'textual_variant',    description: 'A discrepancy that tracks a known manuscript / transmission divergence (variant readings, interpolations).' },
    { id: 10, name: 'compositional',     description: 'Tension rooted in the joining of independent sources or parallel traditions (divergent parallel accounts, redaction seams).' },
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
        CREATE TABLE IF NOT EXISTS contradiction_types (
            id   INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL
        )
    `);
    for (const t of CONTRADICTION_TYPES) {
        db.run('INSERT OR IGNORE INTO contradiction_types (id, name, description) VALUES (?, ?, ?)',
            [t.id, t.name, t.description]);
    }
    const n = db.exec('SELECT COUNT(*) FROM contradiction_types')[0].values[0][0];
    console.log(`contradiction_types: ready (${n} rows)`);

    addColumn(db, 'contradictions', 'contradiction_type_id', 'contradiction_type_id INTEGER REFERENCES contradiction_types(id)');
    addColumn(db, 'contradictions', 'difficulty_level', 'difficulty_level INTEGER');
    addColumn(db, 'contradictions', 'notoriety_level', 'notoriety_level INTEGER');

    db.run('CREATE INDEX IF NOT EXISTS idx_contradictions_type ON contradictions(contradiction_type_id)');
    console.log('idx_contradictions_type: ready');

    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
    console.log(`\nSaved → ${DB_PATH}`);
    db.close();
}

main().catch(err => { console.error(err); process.exit(1); });
