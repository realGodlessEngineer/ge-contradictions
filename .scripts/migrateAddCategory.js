/**
 * migrateAddCategory.js — Idempotent migration that adds category support.
 *
 * Creates the `categories` lookup table (if absent), seeds the 9 canonical
 * categories, then adds `category_id INTEGER REFERENCES categories(id)` to
 * `contradictions` and creates an index on it.
 *
 *   node migrateAddCategory.js
 *
 * Env: DB_PATH (default ./contradictions.db)
 */
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH || './contradictions.db';

const CATEGORIES = [
    { id: 1, name: 'Creation & Cosmology',       description: 'Origin and order of heaven, earth, stars, light, Eden, and the first humans.' },
    { id: 2, name: 'God: Nature & Character',    description: 'What God is and does in essence — body, omniscience, repenting, desires, partiality, and the number of gods.' },
    { id: 3, name: 'Jesus & the Gospels',        description: 'Anything centred on Jesus — his words, deeds, birth, death, resurrection, genealogy, and messianic prophecy.' },
    { id: 4, name: 'Salvation, Sin & Afterlife', description: 'Soteriology and eschatology — faith vs works, who is saved, heaven and hell, judgment, and the soul.' },
    { id: 5, name: 'Law, Morality & Ethics',     description: 'Permitted, forbidden, right, and wrong — killing, slavery, marriage, diet, the Sabbath, oaths, and "should we…" questions.' },
    { id: 6, name: 'Genealogy & Identity',       description: 'Who is whose son, names, family lines, and personal identities (non-Jesus figures).' },
    { id: 7, name: 'Numbers & Measurements',     description: 'How-many and how-much quantities, dimensions, and counts (non-Jesus figures).' },
    { id: 8, name: 'Chronology & Sequence',      description: 'When events happened and their order — duration, before-after, and sequencing questions (outside creation and the Gospels).' },
    { id: 9, name: 'History & Narrative Events', description: 'Specific episodes and their details — OT patriarchs, Exodus, kings, battles, the ark, and other narrative discrepancies.' },
];

async function main() {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));

    // 1. Create categories table
    db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id   INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL
        )
    `);
    console.log('categories table: ready');

    // 2. Seed rows (INSERT OR IGNORE so re-runs are safe)
    for (const cat of CATEGORIES) {
        db.run('INSERT OR IGNORE INTO categories (id, name, description) VALUES (?, ?, ?)',
            [cat.id, cat.name, cat.description]);
    }
    const seeded = db.exec('SELECT COUNT(*) FROM categories')[0].values[0][0];
    console.log(`categories rows: ${seeded}`);

    // 3. Add category_id column to contradictions if missing
    const cols = db.exec("PRAGMA table_info(contradictions)")[0].values.map(v => v[1]);
    if (!cols.includes('category_id')) {
        db.run('ALTER TABLE contradictions ADD COLUMN category_id INTEGER REFERENCES categories(id)');
        console.log('contradictions.category_id: added');
    } else {
        console.log('contradictions.category_id: already exists, skipped');
    }

    // 4. Index
    db.run('CREATE INDEX IF NOT EXISTS idx_contradictions_category ON contradictions(category_id)');
    console.log('idx_contradictions_category: ready');

    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
    console.log(`\nSaved → ${DB_PATH}`);
    db.close();
}

main().catch(err => { console.error(err); process.exit(1); });
