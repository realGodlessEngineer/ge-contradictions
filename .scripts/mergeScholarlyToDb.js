/**
 * mergeScholarlyToDb.js — Merge audited step-3 assessments from
 * data/scholarly/batch_*.json back into contradictions.db.
 *
 * UPDATE-only, keyed by id. Writes:
 *   scholarly_consensus_id    (from the consensus name → scholarly_consensus_levels.id)
 *   textual_variant_involved  (1/0)
 *   variant_description        (NULL when blank / no variant)
 *   critical_apparatus_ref     (NULL when blank / no variant)
 *
 * Only merges entries whose audit verdict is clean / clean_low. Entries marked
 * needs_human (a medium-or-higher issue survived the 2 audit passes) are SKIPPED
 * and listed — set FORCE=1 to merge them anyway. Backs up the DB first (timestamped
 * .bak), runs in a transaction (ROLLBACK on error).
 *
 *   node mergeScholarlyToDb.js
 *   FORCE=1 node mergeScholarlyToDb.js      # also merge needs_human entries
 *
 * Env: DB_PATH (default ./contradictions.db), DIR (./data/scholarly), FORCE
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH || './contradictions.db';
const DIR = process.env.DIR || './data/scholarly';
const FORCE = process.env.FORCE === '1';

function rows(db, sql) {
    const r = db.exec(sql);
    if (!r[0]) return [];
    const { columns, values } = r[0];
    return values.map(v => Object.fromEntries(columns.map((c, i) => [c, v[i]])));
}

function mergeable(e) {
    if (!e.assessment) return false;
    const f = e._audit && (e._audit.final || (e._audit.status === 'clean' ? 'clean' : null));
    if (f === 'clean' || f === 'clean_low') return true;
    if (FORCE && f === 'needs_human') return true;
    return false;
}

(async () => {
    const files = fs.readdirSync(DIR).filter(f => /^batch_\d+\.json$/.test(f)).sort();
    if (!files.length) { console.error(`No batch_*.json in ${DIR}.`); process.exit(1); }
    const entries = [];
    for (const f of files) entries.push(...JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')).entries);

    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));

    const consByName = Object.fromEntries(
        rows(db, 'SELECT id, name FROM scholarly_consensus_levels').map(r => [r.name.toLowerCase().trim(), r.id]));
    if (!Object.keys(consByName).length) { console.error('Run migrateAddScholarlyConsensus.js first.'); process.exit(1); }
    const conIds = new Set(rows(db, 'SELECT id FROM contradictions').map(r => r.id));

    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveDir = path.join(path.dirname(DB_PATH), '.archive');
    fs.mkdirSync(archiveDir, { recursive: true });
    const bak = path.join(archiveDir, `${path.basename(DB_PATH)}.bak-${ts}`);
    fs.copyFileSync(DB_PATH, bak);

    const stat = { merged: 0, variants: 0 };
    const skip = { notMergeable: 0, unknownId: 0, unknownConsensus: 0 };
    db.run('BEGIN');
    try {
        for (const e of entries) {
            if (!mergeable(e)) { if (e.assessment) skip.notMergeable++; continue; }
            if (!conIds.has(e.id)) { console.warn(`  unknown id ${e.id} — skipped`); skip.unknownId++; continue; }
            const cid = consByName[String(e.assessment.scholarly_consensus).toLowerCase().trim()];
            if (!cid) { console.warn(`  id ${e.id}: unknown consensus "${e.assessment.scholarly_consensus}"`); skip.unknownConsensus++; continue; }

            const tvi = e.assessment.textual_variant_involved ? 1 : 0;
            const vdesc = tvi && e.assessment.variant_description ? e.assessment.variant_description : null;
            const aref = tvi && e.assessment.critical_apparatus_ref ? e.assessment.critical_apparatus_ref : null;
            db.run(`UPDATE contradictions
                    SET scholarly_consensus_id = ?, textual_variant_involved = ?,
                        variant_description = ?, critical_apparatus_ref = ?
                    WHERE id = ?`, [cid, tvi, vdesc, aref, e.id]);
            stat.merged++;
            if (tvi) stat.variants++;
        }
        db.run('COMMIT');
    } catch (err) { db.run('ROLLBACK'); console.error('ROLLBACK:', err.message); process.exit(1); }

    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));

    // ---- report ----
    console.log(`Backup: ${bak}`);
    console.log(`Merged: ${stat.merged}  (textual_variant_involved=1: ${stat.variants})`);
    console.log(`Skipped — not-clean/needs_human: ${skip.notMergeable}  unknownId: ${skip.unknownId}  unknownConsensus: ${skip.unknownConsensus}`);

    const dist = rows(db, `
        SELECT l.name, COUNT(c.id) AS n
        FROM scholarly_consensus_levels l LEFT JOIN contradictions c ON c.scholarly_consensus_id = l.id
        GROUP BY l.id ORDER BY l.id`);
    const nullN = rows(db, 'SELECT COUNT(*) AS n FROM contradictions WHERE scholarly_consensus_id IS NULL')[0].n;
    const tv = rows(db, 'SELECT COUNT(*) AS n FROM contradictions WHERE textual_variant_involved = 1')[0].n;
    console.log('\nscholarly_consensus distribution:');
    dist.forEach(r => console.log(`  ${String(r.n).padStart(4)}  ${r.name}`));
    console.log(`  ${String(nullN).padStart(4)}  (ungraded)`);
    console.log(`textual_variant_involved = 1: ${tv}`);
    db.close();
})().catch(e => { console.error(e); process.exit(1); });
