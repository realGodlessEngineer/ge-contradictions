/**
 * applyEnrichmentMap.js — Apply the Sonnet classification map back to the DB.
 *
 * Reads data/enrichment_map.json: an array of
 *   { id, contradiction_type, difficulty_level, notoriety_level }
 *
 * UPDATE-only, keyed by id. Each field is validated independently and applied
 * only when valid (lenient: a bad field is warned and skipped, not fatal):
 *   - contradiction_type must match a contradiction_types name (case-insensitive)
 *   - difficulty_level / notoriety_level must be an integer 1..5
 *   - contradiction ids must exist
 * Backs up the DB first (timestamped .bak), runs in a transaction (ROLLBACK on
 * DB error). Re-runnable and incremental.
 *
 *   node applyEnrichmentMap.js
 *
 * Env: DB_PATH (default ./contradictions.db), MAP (default ./data/enrichment_map.json)
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH || './contradictions.db';
const MAP = process.env.MAP || './data/enrichment_map.json';

function rows(db, sql, p) {
    const r = db.exec(sql, p);
    if (!r[0]) return [];
    const { columns, values } = r[0];
    return values.map(v => Object.fromEntries(columns.map((c, i) => [c, v[i]])));
}

function validLevel(v) {
    return Number.isInteger(v) && v >= 1 && v <= 5;
}

(async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));

    const typeByName = Object.fromEntries(
        rows(db, 'SELECT id, name FROM contradiction_types').map(r => [r.name.toLowerCase().trim(), r.id]));
    if (!Object.keys(typeByName).length) {
        console.error('Missing taxonomy rows — run "node migrateAddContradictionType.js" first.');
        process.exit(1);
    }
    const conIds = new Set(rows(db, 'SELECT id FROM contradictions').map(r => r.id));

    const map = JSON.parse(fs.readFileSync(MAP, 'utf8'));
    const entries = Array.isArray(map) ? map : (map.contradictions || []);

    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveDir = path.join(path.dirname(DB_PATH), '.archive');
    fs.mkdirSync(archiveDir, { recursive: true });
    const bak = path.join(archiveDir, `${path.basename(DB_PATH)}.bak-${ts}`);
    fs.copyFileSync(DB_PATH, bak);

    const stat = { type: 0, difficulty: 0, notoriety: 0 };
    const warn = { unknownConId: 0, unknownType: 0, badLevel: 0 };

    db.run('BEGIN');
    try {
        for (const e of entries) {
            const id = Number(e.id);
            if (!conIds.has(id)) { console.warn(`  Unknown contradiction id ${e.id} — skipped`); warn.unknownConId++; continue; }

            const sets = [], vals = [];
            if (e.contradiction_type != null) {
                const tid = typeByName[String(e.contradiction_type).toLowerCase().trim()];
                if (tid) { sets.push('contradiction_type_id = ?'); vals.push(tid); stat.type++; }
                else { console.warn(`  id ${id}: unknown contradiction_type "${e.contradiction_type}"`); warn.unknownType++; }
            }
            if (e.difficulty_level != null) {
                if (validLevel(e.difficulty_level)) { sets.push('difficulty_level = ?'); vals.push(e.difficulty_level); stat.difficulty++; }
                else { console.warn(`  id ${id}: bad difficulty_level ${e.difficulty_level}`); warn.badLevel++; }
            }
            if (e.notoriety_level != null) {
                if (validLevel(e.notoriety_level)) { sets.push('notoriety_level = ?'); vals.push(e.notoriety_level); stat.notoriety++; }
                else { console.warn(`  id ${id}: bad notoriety_level ${e.notoriety_level}`); warn.badLevel++; }
            }
            if (sets.length) {
                db.run(`UPDATE contradictions SET ${sets.join(', ')} WHERE id = ?`, [...vals, id]);
            }
        }
        db.run('COMMIT');
    } catch (err) {
        db.run('ROLLBACK');
        console.error('ROLLBACK:', err.message);
        process.exit(1);
    }

    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));

    // ---- report ----
    console.log(`Backup: ${bak}`);
    console.log(`Applied — type:${stat.type} difficulty:${stat.difficulty} notoriety:${stat.notoriety}`);
    console.log(`Warnings — unknownConId:${warn.unknownConId} unknownType:${warn.unknownType} badLevel:${warn.badLevel}`);

    const typeDist = rows(db, `
        SELECT t.name, COUNT(c.id) AS n
        FROM contradiction_types t LEFT JOIN contradictions c ON c.contradiction_type_id = t.id
        GROUP BY t.id ORDER BY n DESC`);
    const conNull = rows(db, 'SELECT COUNT(*) AS n FROM contradictions WHERE contradiction_type_id IS NULL')[0].n;

    console.log('\ncontradiction_type distribution:');
    typeDist.forEach(r => console.log(`  ${String(r.n).padStart(4)}  ${r.name}`));
    console.log(`  ${String(conNull).padStart(4)}  (untyped)`);
    db.close();
})().catch(e => { console.error(e); process.exit(1); });
