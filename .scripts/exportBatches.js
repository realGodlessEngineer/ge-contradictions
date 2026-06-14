const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = './contradictions.db';
const OUT_DIR = './data/json';
const BATCH_SIZE = 20;

function rowsToObjects(result) {
    if (!result || result.length === 0) return [];
    const { columns, values } = result[0];
    return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
}

async function main() {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));

    const contradictions = rowsToObjects(
        db.exec('SELECT id, question, question_url, summary, commentary, scholarship, recommend_delete, delete_reason FROM contradictions ORDER BY id')
    );

    for (const c of contradictions) {
        c.questionUrl = c.question_url;
        delete c.question_url;

        const answers = rowsToObjects(
            db.exec('SELECT id, answer, answer_explanation FROM answers WHERE contradiction_id = ? ORDER BY id', [c.id])
        );
        for (const a of answers) {
            a.answerExplanation = a.answer_explanation;
            delete a.answer_explanation;
            a.bibleReferences = rowsToObjects(
                db.exec('SELECT reference FROM bible_references WHERE answer_id = ? ORDER BY id', [a.id])
            ).map(r => r.reference);
        }
        c.answers = answers;
    }
    db.close();

    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
    for (const f of fs.readdirSync(OUT_DIR)) {
        if (/^batch_\d+\.json$/.test(f)) fs.unlinkSync(path.join(OUT_DIR, f));
    }

    const totalBatches = Math.ceil(contradictions.length / BATCH_SIZE);
    const pad = String(totalBatches).length;

    for (let i = 0; i < totalBatches; i++) {
        const start = i * BATCH_SIZE;
        const batch = contradictions.slice(start, start + BATCH_SIZE);
        const filename = `batch_${String(i + 1).padStart(pad, '0')}.json`;
        const payload = {
            batch: i + 1,
            batchCount: totalBatches,
            idRange: [batch[0].id, batch[batch.length - 1].id],
            count: batch.length,
            contradictions: batch
        };
        fs.writeFileSync(path.join(OUT_DIR, filename), JSON.stringify(payload, null, 2), 'utf8');
        console.log(`Wrote ${filename} (ids ${payload.idRange[0]}-${payload.idRange[1]}, ${batch.length} records)`);
    }

    console.log(`\nDone. ${contradictions.length} contradictions -> ${totalBatches} batches of ${BATCH_SIZE} in ${OUT_DIR}/`);
}

main().catch(err => { console.error(err); process.exit(1); });
