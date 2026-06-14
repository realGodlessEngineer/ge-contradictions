const cheerio = require('cheerio');
const fs = require('fs');
const initSqlJs = require('sql.js');

const BASE_URL = 'https://www.skepticsannotatedbible.com';
const SEED_URL = `${BASE_URL}/first/contra2_list.html`;

// Rate limiting delay (ms) between requests
const REQUEST_DELAY = 500;

// Data structures matching the user's requirements
// Contradiction { question, questionUrl, answers: Answer[] }
// Answer { answer, answerExplanation, bibleReferences: string[] }

async function fetchPage(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    return await response.text();
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function parseMainPage(html) {
    const $ = cheerio.load(html);
    const contradictions = [];

    // Find all list items containing contradiction links
    // Each contradiction is a numbered list item with format:
    // [link to question page]  [link to bible reference]
    $('ol li, .main-content li').each((i, elem) => {
        const $elem = $(elem);
        const links = $elem.find('a');

        if (links.length >= 1) {
            const firstLink = $(links[0]);
            const href = firstLink.attr('href');

            // Only process links that go to /contra/ pages
            if (href && href.includes('/contra/')) {
                const question = firstLink.text().trim();
                let questionUrl = href;

                // Make URL absolute if relative
                if (!questionUrl.startsWith('http')) {
                    questionUrl = BASE_URL + (questionUrl.startsWith('/') ? '' : '/') + questionUrl;
                }

                contradictions.push({
                    question,
                    questionUrl,
                    answers: []
                });
            }
        }
    });

    return contradictions;
}

function parseAnswerPage(html) {
    const $ = cheerio.load(html);
    const answers = [];

    // Answers are in a div with class "contra"
    // Each answer is in an h3 tag followed by a blockquote
    const contraDiv = $('.contra');

    if (contraDiv.length === 0) {
        // Try alternative structure - look for h3 elements directly
        $('h3').each((i, h3Elem) => {
            const $h3 = $(h3Elem);
            const answer = $h3.text().trim();

            if (!answer) return;

            // Find the next blockquote sibling
            let $blockquote = $h3.next('blockquote');

            // Sometimes there might be other elements between h3 and blockquote
            if ($blockquote.length === 0) {
                $blockquote = $h3.nextAll('blockquote').first();
            }

            let answerExplanation = '';
            const bibleReferences = [];

            if ($blockquote.length > 0) {
                // Get the text content as explanation
                answerExplanation = $blockquote.text().trim();

                // Extract bible references from links within the blockquote
                $blockquote.find('a').each((j, linkElem) => {
                    const $link = $(linkElem);
                    const linkText = $link.text().trim();
                    const href = $link.attr('href') || '';

                    // Bible references typically have book/chapter format in href or text
                    // e.g., "/gen/1.html#1" or "Genesis 1:1"
                    if (linkText && (
                        href.match(/\/[a-z0-9]+\/\d+\.html/) ||
                        linkText.match(/\d+:\d+/) ||
                        linkText.match(/^[1-3]?\s?[A-Z][a-z]+/)
                    )) {
                        bibleReferences.push(linkText);
                    }
                });
            }

            if (answer) {
                answers.push({
                    answer,
                    answerExplanation,
                    bibleReferences
                });
            }
        });
    } else {
        // Process within .contra div
        contraDiv.find('h3').each((i, h3Elem) => {
            const $h3 = $(h3Elem);
            const answer = $h3.text().trim();

            if (!answer) return;

            // Find the next blockquote sibling
            let $blockquote = $h3.next('blockquote');

            if ($blockquote.length === 0) {
                $blockquote = $h3.nextAll('blockquote').first();
            }

            let answerExplanation = '';
            const bibleReferences = [];

            if ($blockquote.length > 0) {
                answerExplanation = $blockquote.text().trim();

                $blockquote.find('a').each((j, linkElem) => {
                    const $link = $(linkElem);
                    const linkText = $link.text().trim();
                    const href = $link.attr('href') || '';

                    if (linkText && (
                        href.match(/\/[a-z0-9]+\/\d+\.html/) ||
                        linkText.match(/\d+:\d+/) ||
                        linkText.match(/^[1-3]?\s?[A-Z][a-z]+/)
                    )) {
                        bibleReferences.push(linkText);
                    }
                });
            }

            if (answer) {
                answers.push({
                    answer,
                    answerExplanation,
                    bibleReferences
                });
            }
        });
    }

    return answers;
}

async function initDatabase() {
    const SQL = await initSqlJs();
    const db = new SQL.Database();

    // Create tables
    db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id   INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS contradiction_types (
            id   INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS scholarly_consensus_levels (
            id   INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS contradictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            question_url TEXT NOT NULL,
            summary TEXT,
            commentary TEXT,
            scholarship TEXT,
            recommend_delete INTEGER DEFAULT 0,
            delete_reason TEXT,
            category_id INTEGER REFERENCES categories(id),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            testament_scope TEXT,
            books_in_tension TEXT,
            contradiction_type_id INTEGER REFERENCES contradiction_types(id),
            difficulty_level INTEGER,
            notoriety_level INTEGER,
            scholarly_consensus_id INTEGER REFERENCES scholarly_consensus_levels(id),
            textual_variant_involved INTEGER,
            variant_description TEXT,
            critical_apparatus_ref TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contradiction_id INTEGER NOT NULL,
            answer TEXT NOT NULL,
            answer_explanation TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contradiction_id) REFERENCES contradictions(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS bible_references (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            answer_id INTEGER NOT NULL,
            reference TEXT NOT NULL,
            FOREIGN KEY (answer_id) REFERENCES answers(id)
        )
    `);

    db.run(`CREATE INDEX IF NOT EXISTS idx_answers_contradiction ON answers(contradiction_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_references_answer ON bible_references(answer_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_contradictions_type ON contradictions(contradiction_type_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_contradictions_consensus ON contradictions(scholarly_consensus_id)`);

    return db;
}

function saveToDatabase(db, contradictions) {
    for (const contradiction of contradictions) {
        db.run(
            `INSERT INTO contradictions (question, question_url) VALUES (?, ?)`,
            [contradiction.question, contradiction.questionUrl]
        );

        // Get the last inserted contradiction ID
        const contradictionIdResult = db.exec(`SELECT last_insert_rowid() as id`);
        const contradictionId = contradictionIdResult[0].values[0][0];

        for (const answer of contradiction.answers) {
            db.run(
                `INSERT INTO answers (contradiction_id, answer, answer_explanation) VALUES (?, ?, ?)`,
                [contradictionId, answer.answer, answer.answerExplanation]
            );

            // Get the last inserted answer ID
            const answerIdResult = db.exec(`SELECT last_insert_rowid() as id`);
            const answerId = answerIdResult[0].values[0][0];

            for (const reference of answer.bibleReferences) {
                db.run(
                    `INSERT INTO bible_references (answer_id, reference) VALUES (?, ?)`,
                    [answerId, reference]
                );
            }
        }
    }
}

function saveDatabaseToFile(db, filePath) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(filePath, buffer);
}

function saveToJson(filePath, contradictions) {
    const jsonData = JSON.stringify(contradictions, null, 2);
    fs.writeFileSync(filePath, jsonData, 'utf8');
}

async function main() {
    console.log('Starting Bible contradictions scraper...\n');

    // Step 1: Fetch the main seed page
    console.log(`Fetching seed page: ${SEED_URL}`);
    const mainPageHtml = await fetchPage(SEED_URL);

    // Step 2: Parse the main page to build list of contradictions (without answers)
    console.log('Parsing main page for contradictions...');
    const contradictions = await parseMainPage(mainPageHtml);
    console.log(`Found ${contradictions.length} contradictions\n`);

    // Step 3: Iterate over contradictions and fetch answer pages
    console.log('Fetching answer pages...');
    let processed = 0;
    let errors = 0;

    for (const contradiction of contradictions) {
        try {
            console.log(`[${processed + 1}/${contradictions.length}] Fetching: ${contradiction.question}`);

            const answerPageHtml = await fetchPage(contradiction.questionUrl);
            contradiction.answers = parseAnswerPage(answerPageHtml);

            console.log(`  -> Found ${contradiction.answers.length} answers`);

            processed++;

            // Rate limiting
            await sleep(REQUEST_DELAY);
        } catch (error) {
            console.error(`  -> Error: ${error.message}`);
            errors++;
        }
    }

    console.log(`\nProcessed ${processed} pages with ${errors} errors\n`);

    // Step 4: Save to JSON
    const jsonPath = './contradictions.json';
    console.log(`Saving to JSON: ${jsonPath}`);
    saveToJson(jsonPath, contradictions);

    // Step 5: Save to SQLite
    const dbPath = './contradictions.db';
    console.log(`Saving to SQLite: ${dbPath}`);
    const db = await initDatabase();
    saveToDatabase(db, contradictions);
    saveDatabaseToFile(db, dbPath);
    db.close();

    console.log('\nDone!');
    console.log(`Total contradictions: ${contradictions.length}`);
    console.log(`JSON file: ${jsonPath}`);
    console.log(`SQLite database: ${dbPath}`);
}

main().catch(console.error);