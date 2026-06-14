const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = './contradictions.db';
const JSON_PATH = './infidelsContradictions.json';

// Indices of the NEW contradictions (not already in contradictions.db)
const NEW_INDICES = [10, 12, 13, 14, 16, 31, 34, 35, 41, 42, 56];

async function main() {
    const SQL = await initSqlJs();
    const fileBuffer = fs.readFileSync(DB_PATH);
    const db = new SQL.Database(fileBuffer);

    const allContradictions = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    const newEntries = NEW_INDICES.map(i => allContradictions[i]);

    console.log(`Inserting ${newEntries.length} new contradictions into ${DB_PATH}...\n`);

    for (const entry of newEntries) {
        // Insert contradiction
        db.run(
            `INSERT INTO contradictions (question, question_url) VALUES (?, ?)`,
            [entry.question, entry.questionUrl]
        );
        const cIdResult = db.exec(`SELECT last_insert_rowid() as id`);
        const contradictionId = cIdResult[0].values[0][0];

        // Insert answers
        for (const answer of entry.answers) {
            db.run(
                `INSERT INTO answers (contradiction_id, answer, answer_explanation) VALUES (?, ?, ?)`,
                [contradictionId, answer.answer, answer.answerExplanation]
            );
            const aIdResult = db.exec(`SELECT last_insert_rowid() as id`);
            const answerId = aIdResult[0].values[0][0];

            // Insert bible references
            for (const ref of answer.bibleReferences) {
                db.run(
                    `INSERT INTO bible_references (answer_id, reference) VALUES (?, ?)`,
                    [answerId, ref]
                );
            }
        }

        console.log(`  Inserted: "${entry.question}" (${entry.answers.length} answers)`);
    }

    // Save
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    db.close();

    console.log(`\nDone! Inserted ${newEntries.length} new contradictions.`);
}

main().catch(console.error);
