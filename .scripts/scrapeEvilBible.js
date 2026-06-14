const cheerio = require('cheerio');
const fs = require('fs');

const BASE_URL = 'https://philb61.github.io';
const INDEX_HTML = './data/evilbiblecontradictions.html';
const OUTPUT_JSON = './evilBibleContradictions.json';

// Variable delay range (ms) to imitate human browsing
const MIN_DELAY = 1500;
const MAX_DELAY = 4500;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay() {
    return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
}

async function fetchPage(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    return await response.text();
}

function parseIndex(html) {
    const $ = cheerio.load(html);
    const links = [];

    // The file has two tables — first is infidels, second is evil bible.
    // Evil bible links end with "-evil-bible.html"
    $('table.contradictionsTable a').each((i, elem) => {
        const $a = $(elem);
        const href = $a.attr('href');
        const text = $a.text().trim();
        if (href && href.includes('-evil-bible.html')) {
            const question = text.replace(/^\d+\s+/, '');
            links.push({
                question,
                questionUrl: BASE_URL + href,
                relativeUrl: href
            });
        }
    });

    return links;
}

function parseAnswerPage(html) {
    const $ = cheerio.load(html);
    const answers = [];

    // The question/title is in the first h2
    const h2 = $('h2').first();
    const question = h2.clone().children().remove().end().text().trim();

    // Evil bible pages have: <h3>answer label</h3> <h4>Reference</h4> <p>verse text</p>
    // Group verses under their h3 answer headings
    const contraBlock = $('.contra-block');
    let currentAnswer = null;

    contraBlock.children('h3, h4, p').each((i, elem) => {
        const tag = elem.tagName;
        const $el = $(elem);

        if (tag === 'h3') {
            // Start a new answer group
            if (currentAnswer) {
                answers.push(currentAnswer);
            }
            currentAnswer = {
                answer: $el.text().trim(),
                answerExplanation: '',
                bibleReferences: []
            };
        } else if (tag === 'h4' && currentAnswer) {
            const reference = $el.clone().children('a').remove().end().text().trim();
            if (reference) {
                currentAnswer.bibleReferences.push(reference);
            }
        } else if (tag === 'p' && currentAnswer) {
            const text = $el.text().trim();
            // Skip the source attribution paragraph
            if (text.startsWith('This Bible contradiction is from')) return;
            if (currentAnswer.answerExplanation) {
                currentAnswer.answerExplanation += '\n\n' + text;
            } else {
                currentAnswer.answerExplanation = text;
            }
        }
    });

    // Push the last answer group
    if (currentAnswer) {
        answers.push(currentAnswer);
    }

    return { question: question || null, answers };
}

async function main() {
    console.log('Starting EvilBible.com contradictions scraper...\n');

    // Step 1: Parse the local index HTML
    console.log(`Reading index: ${INDEX_HTML}`);
    const indexHtml = fs.readFileSync(INDEX_HTML, 'utf8');
    const entries = parseIndex(indexHtml);
    console.log(`Found ${entries.length} contradictions\n`);

    const contradictions = [];
    let processed = 0;
    let errors = 0;

    for (const entry of entries) {
        const delay = randomDelay();
        try {
            console.log(`[${processed + 1}/${entries.length}] Fetching: ${entry.question} (delay: ${delay}ms)`);

            const html = await fetchPage(entry.questionUrl);
            const { question, answers } = parseAnswerPage(html);

            contradictions.push({
                question: question || entry.question,
                questionUrl: entry.questionUrl,
                answers
            });

            console.log(`  -> Found ${answers.length} answers`);
            processed++;

            // Variable delay to imitate human browsing
            if (processed < entries.length) {
                await sleep(delay);
            }
        } catch (error) {
            console.error(`  -> Error: ${error.message}`);
            errors++;

            contradictions.push({
                question: entry.question,
                questionUrl: entry.questionUrl,
                answers: []
            });
        }
    }

    console.log(`\nProcessed ${processed} pages with ${errors} errors\n`);

    // Save to JSON
    console.log(`Saving to: ${OUTPUT_JSON}`);
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(contradictions, null, 2), 'utf8');

    console.log('\nDone!');
    console.log(`Total contradictions: ${contradictions.length}`);
}

main().catch(console.error);
