const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = './contradictions.db';
const JSON_PATH = './evilBibleContradictions.json';

// Indices of the NEW contradictions (not already in contradictions.db or infidels)
const NEW_INDICES = [
    11, 12, 20, 21, 27, 30, 31, 34, 35, 37,
    41, 43, 50, 51, 53, 54, 55, 58, 73, 87,
    89, 92, 94, 104, 111, 112, 118, 119, 124,
    129, 131, 133, 134, 136, 137
];

async function main() {
    const SQL = await initSqlJs();
    const fileBuffer = fs.readFileSync(DB_PATH);
    const db = new SQL.Database(fileBuffer);

    const allContradictions = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    const newEntries = NEW_INDICES.map(i => allContradictions[i]);

    console.log(`Inserting ${newEntries.length} new contradictions into ${DB_PATH}...\n`);

    for (const entry of newEntries) {
        db.run(
            `INSERT INTO contradictions (question, question_url) VALUES (?, ?)`,
            [entry.question, entry.questionUrl]
        );
        const cIdResult = db.exec(`SELECT last_insert_rowid() as id`);
        const contradictionId = cIdResult[0].values[0][0];

        for (const answer of entry.answers) {
            db.run(
                `INSERT INTO answers (contradiction_id, answer, answer_explanation) VALUES (?, ?, ?)`,
                [contradictionId, answer.answer, answer.answerExplanation]
            );
            const aIdResult = db.exec(`SELECT last_insert_rowid() as id`);
            const answerId = aIdResult[0].values[0][0];

            for (const ref of answer.bibleReferences) {
                db.run(
                    `INSERT INTO bible_references (answer_id, reference) VALUES (?, ?)`,
                    [answerId, ref]
                );
            }
        }

        console.log(`  Inserted: "${entry.question}" (${entry.answers.length} answers)`);
    }

    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    db.close();

    console.log(`\nDone! Inserted ${newEntries.length} new contradictions.`);
}

main().catch(console.error);
