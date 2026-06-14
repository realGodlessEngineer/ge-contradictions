/**
 * mergeCommentaryToDb.js — Merge audited commentary expansions from
 * data/commentary/batch_*.json back into contradictions.db.
 *
 * UPDATE-only, keyed by id. Writes:
 *   commentary   (the expanded text — always, for mergeable entries)
 *   scholarship  (regenerated prose from the structured array — ONLY when the array is
 *                 non-empty; otherwise the existing scholarship blurb is left untouched)
 *
 * Only merges entries whose audit verdict is clean / clean_low. Entries marked needs_human
 * (a medium-or-higher issue survived the 2 audit passes) are SKIPPED and listed — set
 * FORCE=1 to merge them anyway. Backs up the DB first (timestamped .bak), runs in a
 * transaction (ROLLBACK on error). Never touches summary or the consensus fields.
 *
 * After this runs, re-run `node buildScholarshipTables.js` to rebuild the derived
 * scholarship_sources / contradiction_scholarship tables from the updated prose.
 *
 *   node mergeCommentaryToDb.js
 *   FORCE=1 node mergeCommentaryToDb.js      # also merge needs_human entries
 *
 * Env: DB_PATH (./contradictions.db), DIR (./data/commentary), FORCE
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const { composeScholarshipProse } = require('./commentaryLib');

const DB_PATH = process.env.DB_PATH || './contradictions.db';
const DIR = process.env.DIR || './data/commentary';
const FORCE = process.env.FORCE === '1';

function rows(db, sql) {
    const r = db.exec(sql);
    if (!r[0]) return [];
    const { columns, values } = r[0];
    return values.map(v => Object.fromEntries(columns.map((c, i) => [c, v[i]])));
}

function mergeable(e) {
    if (!e.commentary_out) return false;
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
    const conIds = new Set(rows(db, 'SELECT id FROM contradictions').map(r => r.id));

    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveDir = path.join(path.dirname(DB_PATH), '.archive');
    fs.mkdirSync(archiveDir, { recursive: true });
    const bak = path.join(archiveDir, `${path.basename(DB_PATH)}.bak-${ts}`);
    fs.copyFileSync(DB_PATH, bak);

    const stat = { merged: 0, scholarshipRewritten: 0 };
    const skip = { notMergeable: 0, unknownId: 0 };
    db.run('BEGIN');
    try {
        for (const e of entries) {
            if (!mergeable(e)) { if (e.commentary_out) skip.notMergeable++; continue; }
            if (!conIds.has(e.id)) { console.warn(`  unknown id ${e.id} — skipped`); skip.unknownId++; continue; }

            const commentary = e.commentary_out.commentary || '';
            const prose = composeScholarshipProse(e.commentary_out.scholarship);
            if (prose) {
                db.run('UPDATE contradictions SET commentary = ?, scholarship = ? WHERE id = ?', [commentary, prose, e.id]);
                stat.scholarshipRewritten++;
            } else {
                db.run('UPDATE contradictions SET commentary = ? WHERE id = ?', [commentary, e.id]);
            }
            stat.merged++;
        }
        db.run('COMMIT');
    } catch (err) { db.run('ROLLBACK'); console.error('ROLLBACK:', err.message); process.exit(1); }

    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));

    // ---- report ----
    console.log(`Backup: ${bak}`);
    console.log(`Merged commentary: ${stat.merged}  (scholarship prose rewritten: ${stat.scholarshipRewritten})`);
    console.log(`Skipped — not-clean/needs_human: ${skip.notMergeable}  unknownId: ${skip.unknownId}`);
    if (stat.scholarshipRewritten) console.log('\nRe-run `node buildScholarshipTables.js` to rebuild the derived reference tables from the updated prose.');
    db.close();
})().catch(e => { console.error(e); process.exit(1); });
