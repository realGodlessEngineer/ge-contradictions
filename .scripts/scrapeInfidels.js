const cheerio = require('cheerio');
const fs = require('fs');

const BASE_URL = 'https://philb61.github.io';
const INDEX_HTML = './data/infidelscontradictions.html';
const OUTPUT_JSON = './infidelsContradictions.json';

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

    $('table.contradictionsTable a').each((i, elem) => {
        const $a = $(elem);
        const href = $a.attr('href');
        const text = $a.text().trim();
        if (href) {
            // Strip leading number from text (e.g. "1 God good to all..." -> "God good to all...")
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

    // Verses are in .contra-block, each as h4 (reference) + p (text)
    const contraBlock = $('.contra-block');
    const seen = new Set();

    contraBlock.find('h4').each((i, elem) => {
        const $h4 = $(elem);
        // Get just the reference text (before the <a> button)
        const reference = $h4.clone().children('a').remove().end().text().trim();

        // Get the verse text from the next <p>
        const $p = $h4.next('p');
        const verseText = $p.text().trim();

        // Deduplicate — the page often repeats verses
        const key = reference + '|' + verseText;
        if (seen.has(key)) return;
        seen.add(key);

        if (reference) {
            answers.push({
                answer: reference,
                answerExplanation: verseText,
                bibleReferences: [reference]
            });
        }
    });

    return { question: question || null, answers };
}

async function main() {
    console.log('Starting Infidels.org contradictions scraper...\n');

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

            console.log(`  -> Found ${answers.length} verses`);
            processed++;

            // Variable delay to imitate human browsing
            if (processed < entries.length) {
                await sleep(delay);
            }
        } catch (error) {
            console.error(`  -> Error: ${error.message}`);
            errors++;

            // Still add the entry with empty answers so we don't lose track
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
