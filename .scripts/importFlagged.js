/**
 * importFlagged.js — Merge resolved flagged batches back into contradictions.db.
 *
 * Reads data/flagged/flagged_*.json (produced by exportFlagged.js, edited by the
 * resolution agents) and applies the changes. Like mergeBatchesToDb.js it is:
 *   - UPDATE-only, keyed by id (never inserts/deletes rows)
 *   - backed up first (timestamped .bak), wrapped in one transaction (ROLLBACK on error)
 *   - rewrites a bible_references set only when it actually differs
 *
 * Safety gate: an entry is applied only if its `_resolution.status` is one of
 *   resolved | cleared | no-change.
 * Entries still marked `pending` or `needs-human` are SKIPPED and reported, so a
 * half-finished agent run can't silently land partial edits.
 *
 *   node importFlagged.js              # apply eligible entries
 *   FORCE=1 node importFlagged.js      # apply regardless of _resolution.status
 *
 * Env overrides: DB_PATH (default ./contradictions.db), IN_DIR (default ./data/flagged)
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH || './contradictions.db';
const IN_DIR = process.env.IN_DIR || './data/flagged';
const FORCE = !!process.env.FORCE;
const APPLY_STATUS = new Set(['resolved', 'cleared', 'no-change']);

function eq(a, b) {
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    return String(a) === String(b);
}
function toText(v) {
    if (v == null) return null;
    if (Array.isArray(v)) return v.map(x => x == null ? '' : String(x)).join('\n');
    return String(v);
}
function arrEq(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!eq(a[i], b[i])) return false;
    return true;
}
function listFiles() {
    if (!fs.existsSync(IN_DIR)) throw new Error(`Missing dir: ${IN_DIR} (run "node exportFlagged.js" first)`);
    return fs.readdirSync(IN_DIR).filter(f => /^flagged_.*\.json$/.test(f)).sort();
}

async function main() {
    const SQL = await initSqlJs();

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveDir = path.join(path.dirname(DB_PATH), '.archive');
    fs.mkdirSync(archiveDir, { recursive: true });
    const backupPath = path.join(archiveDir, `${path.basename(DB_PATH)}.bak-${stamp}`);
    fs.copyFileSync(DB_PATH, backupPath);
    console.log(`Backup written: ${backupPath}`);

    const db = new SQL.Database(fs.readFileSync(DB_PATH));
    const files = listFiles();
    console.log(`Found ${files.length} flagged file(s) in ${IN_DIR}`);

    const stats = { files: 0, seen: 0, applied: 0, skipped: 0, missing: 0, answers: 0, refSets: 0 };
    const skipped = [];

    db.run('BEGIN');
    try {
        const selContra = db.prepare('SELECT question, question_url, summary, commentary, scholarship, recommend_delete, delete_reason FROM contradictions WHERE id = ?');
        const updContra = db.prepare('UPDATE contradictions SET question = ?, question_url = ?, summary = ?, commentary = ?, scholarship = ?, recommend_delete = ?, delete_reason = ? WHERE id = ?');
        const selAns = db.prepare('SELECT contradiction_id, answer, answer_explanation FROM answers WHERE id = ?');
        const updAns = db.prepare('UPDATE answers SET answer = ?, answer_explanation = ? WHERE id = ?');
        const delRefs = db.prepare('DELETE FROM bible_references WHERE answer_id = ?');
        const insRef = db.prepare('INSERT INTO bible_references (answer_id, reference) VALUES (?, ?)');
        const selRefs = db.prepare('SELECT reference FROM bible_references WHERE answer_id = ? ORDER BY id');

        for (const file of files) {
            const payload = JSON.parse(fs.readFileSync(path.join(IN_DIR, file), 'utf8'));
            stats.files++;
            for (const c of payload.contradictions) {
                stats.seen++;
                const status = (c._resolution && c._resolution.status) || 'pending';
                if (!FORCE && !APPLY_STATUS.has(status)) {
                    stats.skipped++;
                    skipped.push(`${c.id} (${status})`);
                    continue;
                }

                selContra.bind([c.id]);
                if (!selContra.step()) {
                    stats.missing++;
                    console.warn(`  ! id ${c.id} not in DB (file ${file})`);
                    selContra.reset();
                    continue;
                }
                const cur = selContra.getAsObject();
                selContra.reset();

                const qUrl = c.questionUrl != null ? c.questionUrl : (c.question_url != null ? c.question_url : cur.question_url);
                const recDel = ('recommend_delete' in c) ? (c.recommend_delete == null ? 0 : Number(c.recommend_delete)) : Number(cur.recommend_delete || 0);
                const delReason = ('delete_reason' in c) ? toText(c.delete_reason) : cur.delete_reason;
                const question = toText(c.question);
                const summary = toText(c.summary);
                const commentary = toText(c.commentary);
                const scholarship = toText(c.scholarship);

                const changed =
                    !eq(cur.question, question) || !eq(cur.question_url, qUrl) ||
                    !eq(cur.summary, summary) || !eq(cur.commentary, commentary) ||
                    !eq(cur.scholarship, scholarship) ||
                    Number(cur.recommend_delete || 0) !== recDel || !eq(cur.delete_reason, delReason);
                if (changed) {
                    updContra.run([question, qUrl, summary, commentary, scholarship, recDel, delReason, c.id]);
                }
                stats.applied++;

                for (const a of (c.answers || [])) {
                    selAns.bind([a.id]);
                    if (!selAns.step()) { selAns.reset(); console.warn(`    ! answer ${a.id} not in DB (id ${c.id})`); continue; }
                    const curA = selAns.getAsObject();
                    selAns.reset();

                    const aText = toText(a.answer);
                    const aExp = toText(a.answerExplanation != null ? a.answerExplanation : a.answer_explanation);
                    if (!eq(curA.answer, aText) || !eq(curA.answer_explanation, aExp)) {
                        updAns.run([aText, aExp, a.id]);
                        stats.answers++;
                    }

                    const jsonRefs = Array.isArray(a.bibleReferences) ? a.bibleReferences : [];
                    selRefs.bind([a.id]);
                    const curRefs = [];
                    while (selRefs.step()) curRefs.push(selRefs.getAsObject().reference);
                    selRefs.reset();
                    if (!arrEq(curRefs, jsonRefs)) {
                        delRefs.run([a.id]);
                        for (const ref of jsonRefs) insRef.run([a.id, ref]);
                        stats.refSets++;
                    }
                }
            }
            console.log(`  ${file}: ${payload.contradictions.length} entries`);
        }

        [selContra, updContra, selAns, updAns, delRefs, insRef, selRefs].forEach(s => s.free());
        db.run('COMMIT');
    } catch (err) {
        db.run('ROLLBACK');
        throw err;
    }

    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
    db.close();

    console.log('\nImport complete.');
    console.log(`  Files:            ${stats.files}`);
    console.log(`  Entries seen:     ${stats.seen}`);
    console.log(`  Applied:          ${stats.applied}`);
    console.log(`  Skipped (status): ${stats.skipped}${skipped.length ? '  -> ' + skipped.join(', ') : ''}`);
    console.log(`  Missing in DB:    ${stats.missing}`);
    console.log(`  Answers updated:  ${stats.answers}`);
    console.log(`  Ref sets rewritten:${stats.refSets}`);
    console.log(`  Backup:           ${backupPath}`);
    if (stats.skipped && !FORCE) console.log('\nNote: skipped entries are not yet resolved/cleared. Re-run after the agents finish, or use FORCE=1.');
}

main().catch(err => { console.error(err); process.exit(1); });
