const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = './contradictions.db';
const NEW_COLUMNS = [
    { name: 'recommend_delete', ddl: 'INTEGER DEFAULT 0' },
    { name: 'delete_reason',    ddl: 'TEXT' }
];

async function main() {
    const SQL = await initSqlJs();
    const buffer = fs.readFileSync(DB_PATH);
    const db = new SQL.Database(buffer);

    const info = db.exec('PRAGMA table_info(contradictions)');
    const existing = info[0].values.map(row => row[1]);
    const toAdd = NEW_COLUMNS.filter(col => !existing.includes(col.name));

    if (toAdd.length === 0) {
        console.log('All delete-flag columns already present. No migration needed.');
        db.close();
        return;
    }

    for (const col of toAdd) {
        db.run(`ALTER TABLE contradictions ADD COLUMN ${col.name} ${col.ddl}`);
        console.log(`Added column: contradictions.${col.name} (${col.ddl})`);
    }

    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
    db.close();
    console.log(`Migration complete. Wrote ${DB_PATH}.`);
}

main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
