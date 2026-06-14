const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = './contradictions.db';
const IN_DIR = './data/json';

function rowsToObjects(result) {
    if (!result || result.length === 0) return [];
    const { columns, values } = result[0];
    return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
}

function listBatchFiles() {
    return fs.readdirSync(IN_DIR)
        .filter(f => /^batch_\d+\.json$/.test(f))
        .sort();
}

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

async function main() {
    const SQL = await initSqlJs();

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveDir = path.join(path.dirname(DB_PATH), '.archive');
    fs.mkdirSync(archiveDir, { recursive: true });
    const backupPath = path.join(archiveDir, `${path.basename(DB_PATH)}.bak-${stamp}`);
    fs.copyFileSync(DB_PATH, backupPath);
    console.log(`Backup written: ${backupPath}`);

    const db = new SQL.Database(fs.readFileSync(DB_PATH));

    const batchFiles = listBatchFiles();
    console.log(`Found ${batchFiles.length} batch files in ${IN_DIR}`);

    const stats = {
        batches: 0,
        contradictions: { seen: 0, updated: 0, missing: 0 },
        answers: { seen: 0, updated: 0, missing: 0 },
        bibleRefSets: { seen: 0, rewritten: 0 }
    };

    db.run('BEGIN');
    try {
        const selContra = db.prepare(
            'SELECT question, question_url, summary, commentary, scholarship, recommend_delete, delete_reason FROM contradictions WHERE id = ?'
        );
        const updContra = db.prepare(
            'UPDATE contradictions SET question = ?, question_url = ?, summary = ?, commentary = ?, scholarship = ?, recommend_delete = ?, delete_reason = ? WHERE id = ?'
        );
        const selAns = db.prepare('SELECT contradiction_id, answer, answer_explanation FROM answers WHERE id = ?');
        const updAns = db.prepare('UPDATE answers SET answer = ?, answer_explanation = ? WHERE id = ?');
        const delRefs = db.prepare('DELETE FROM bible_references WHERE answer_id = ?');
        const insRef = db.prepare('INSERT INTO bible_references (answer_id, reference) VALUES (?, ?)');
        const selRefs = db.prepare('SELECT reference FROM bible_references WHERE answer_id = ? ORDER BY id');

        for (const file of batchFiles) {
            const payload = JSON.parse(fs.readFileSync(path.join(IN_DIR, file), 'utf8'));
            stats.batches++;
            for (const c of payload.contradictions) {
                stats.contradictions.seen++;

                selContra.bind([c.id]);
                if (!selContra.step()) {
                    stats.contradictions.missing++;
                    console.warn(`  ! contradictions.id=${c.id} not found in DB (file: ${file})`);
                    selContra.reset();
                    continue;
                }
                const cur = selContra.getAsObject();
                selContra.reset();

                const hasUrl = ('questionUrl' in c) || ('question_url' in c);
                const hasRecDel = ('recommend_delete' in c);
                const hasDelReason = ('delete_reason' in c);
                const qUrl = hasUrl ? (c.questionUrl != null ? c.questionUrl : c.question_url) : cur.question_url;
                const recDel = hasRecDel ? (c.recommend_delete == null ? 0 : Number(c.recommend_delete)) : Number(cur.recommend_delete || 0);
                const delReason = hasDelReason ? toText(c.delete_reason) : cur.delete_reason;
                const question = toText(c.question);
                const summary = toText(c.summary);
                const commentary = toText(c.commentary);
                const scholarship = toText(c.scholarship);

                const changed =
                    !eq(cur.question, question) ||
                    (hasUrl && !eq(cur.question_url, qUrl)) ||
                    !eq(cur.summary, summary) ||
                    !eq(cur.commentary, commentary) ||
                    !eq(cur.scholarship, scholarship) ||
                    (hasRecDel && Number(cur.recommend_delete || 0) !== recDel) ||
                    (hasDelReason && !eq(cur.delete_reason, delReason));

                if (changed) {
                    updContra.run([
                        question,
                        qUrl,
                        summary,
                        commentary,
                        scholarship,
                        recDel,
                        delReason,
                        c.id
                    ]);
                    stats.contradictions.updated++;
                }

                if (!('answers' in c)) continue;

                for (const a of (c.answers || [])) {
                    stats.answers.seen++;

                    selAns.bind([a.id]);
                    if (!selAns.step()) {
                        stats.answers.missing++;
                        console.warn(`    ! answers.id=${a.id} not found in DB (contradiction ${c.id}, file: ${file})`);
                        selAns.reset();
                        continue;
                    }
                    const curA = selAns.getAsObject();
                    selAns.reset();

                    if (Number(curA.contradiction_id) !== Number(c.id)) {
                        console.warn(`    ! answers.id=${a.id} contradiction_id mismatch: DB=${curA.contradiction_id} JSON=${c.id} (file: ${file})`);
                    }

                    const aText = toText(a.answer);
                    const aExp = toText(a.answerExplanation != null ? a.answerExplanation : a.answer_explanation);
                    const ansChanged = !eq(curA.answer, aText) || !eq(curA.answer_explanation, aExp);
                    if (ansChanged) {
                        updAns.run([aText, aExp, a.id]);
                        stats.answers.updated++;
                    }

                    stats.bibleRefSets.seen++;
                    const jsonRefs = Array.isArray(a.bibleReferences) ? a.bibleReferences : [];
                    selRefs.bind([a.id]);
                    const curRefs = [];
                    while (selRefs.step()) curRefs.push(selRefs.getAsObject().reference);
                    selRefs.reset();

                    if (!arrEq(curRefs, jsonRefs)) {
                        delRefs.run([a.id]);
                        for (const ref of jsonRefs) insRef.run([a.id, ref]);
                        stats.bibleRefSets.rewritten++;
                    }
                }
            }
            console.log(`  ${file}: ${payload.contradictions.length} entries`);
        }

        selContra.free();
        updContra.free();
        selAns.free();
        updAns.free();
        delRefs.free();
        insRef.free();
        selRefs.free();

        db.run('COMMIT');
    } catch (err) {
        db.run('ROLLBACK');
        throw err;
    }

    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
    db.close();

    console.log('\nMerge complete.');
    console.log(`  Batches processed:      ${stats.batches}`);
    console.log(`  Contradictions seen:    ${stats.contradictions.seen}`);
    console.log(`  Contradictions updated: ${stats.contradictions.updated}`);
    console.log(`  Contradictions missing: ${stats.contradictions.missing}`);
    console.log(`  Answers seen:           ${stats.answers.seen}`);
    console.log(`  Answers updated:        ${stats.answers.updated}`);
    console.log(`  Answers missing:        ${stats.answers.missing}`);
    console.log(`  BibleRef sets seen:     ${stats.bibleRefSets.seen}`);
    console.log(`  BibleRef sets rewritten:${stats.bibleRefSets.rewritten}`);
    console.log(`  Backup:                 ${backupPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
