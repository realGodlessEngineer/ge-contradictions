/**
 * classifyCategories.js — Classify all contradictions into the 9 canonical
 * categories using Claude Sonnet via the Anthropic API, then write category_id
 * back to the DB.
 *
 *   node classifyCategories.js
 *
 * Requires: ANTHROPIC_API_KEY env var.
 * Env overrides: DB_PATH (default ./contradictions.db), BATCH_SIZE (default 50)
 *
 * Re-runnable: already-classified rows are skipped unless RECLASSIFY=1.
 */
const fs = require('fs');
const initSqlJs = require('sql.js');
const Anthropic = require('@anthropic-ai/sdk');

const DB_PATH = process.env.DB_PATH || './contradictions.db';
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '50', 10);
const RECLASSIFY = process.env.RECLASSIFY === '1';

const CATEGORIES = [
    { id: 1, name: 'Creation & Cosmology',       description: 'Origin and order of heaven, earth, stars, light, Eden, and the first humans.' },
    { id: 2, name: 'God: Nature & Character',    description: 'What God is and does in essence — body, omniscience, repenting, desires, partiality, and the number of gods.' },
    { id: 3, name: 'Jesus & the Gospels',        description: 'Anything centred on Jesus — his words, deeds, birth, death, resurrection, genealogy, and messianic prophecy.' },
    { id: 4, name: 'Salvation, Sin & Afterlife', description: 'Soteriology and eschatology — faith vs works, who is saved, heaven and hell, judgment, and the soul.' },
    { id: 5, name: 'Law, Morality & Ethics',     description: 'Permitted, forbidden, right, and wrong — killing, slavery, marriage, diet, the Sabbath, oaths, and "should we…" questions.' },
    { id: 6, name: 'Genealogy & Identity',       description: 'Who is whose son, names, family lines, and personal identities (non-Jesus figures).' },
    { id: 7, name: 'Numbers & Measurements',     description: 'How-many and how-much quantities, dimensions, and counts (non-Jesus figures).' },
    { id: 8, name: 'Chronology & Sequence',      description: 'When events happened and their order — duration, before-after, and sequencing questions (outside creation and the Gospels).' },
    { id: 9, name: 'History & Narrative Events', description: 'Specific episodes and their details — OT patriarchs, Exodus, kings, battles, the ark, and other narrative discrepancies.' },
];

const CATEGORY_NAMES = CATEGORIES.map(c => c.name);
const NAME_TO_ID = Object.fromEntries(CATEGORIES.map(c => [c.name, c.id]));

const SYSTEM = `You are a biblical-studies taxonomy classifier.
You will receive a JSON array of contradiction questions, each with an "id" and "question" field.
Classify EACH into EXACTLY ONE of these 9 categories — use the exact name string shown:

${CATEGORIES.map(c => `  ${c.id}. "${c.name}" — ${c.description}`).join('\n')}

Precedence rules:
- If the question is clearly about Jesus or the Gospels, use "Jesus & the Gospels" even if it could also fit a "how many" or "when" form.
- If the question is about a theological principle (salvation, sin, afterlife), use "Salvation, Sin & Afterlife" over the narrative bucket.
- "History & Narrative Events" is the residual — use it only when no other category fits cleanly.

Return a JSON array only. No prose, no markdown, no explanation. Example:
[{"id":42,"category":"Genealogy & Identity"},{"id":43,"category":"Numbers & Measurements"}]`;

function rows(db, sql, p) {
    const r = db.exec(sql, p);
    if (!r[0]) return [];
    const { columns, values } = r[0];
    return values.map(v => Object.fromEntries(columns.map((c, i) => [c, v[i]])));
}

function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

async function classifyBatch(client, batch) {
    const payload = batch.map(r => ({ id: r.id, question: r.question }));
    const msg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: SYSTEM,
        messages: [{ role: 'user', content: JSON.stringify(payload) }],
    });
    const text = msg.content[0].text.trim();
    // Strip any accidental markdown fences
    const json = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
    return JSON.parse(json);
}

async function main() {
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('ANTHROPIC_API_KEY is not set.');
        process.exit(1);
    }
    const client = new Anthropic();
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));

    const filter = RECLASSIFY
        ? 'SELECT id, question FROM contradictions ORDER BY id'
        : 'SELECT id, question FROM contradictions WHERE category_id IS NULL ORDER BY id';
    const pending = rows(db, filter);
    console.log(`Pending classification: ${pending.length} contradictions (RECLASSIFY=${RECLASSIFY})`);

    if (pending.length === 0) {
        console.log('Nothing to do.');
        db.close();
        return;
    }

    const batches = chunk(pending, BATCH_SIZE);
    let classified = 0;
    let errors = 0;

    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const ids = batch.map(r => r.id).join(', ');
        process.stdout.write(`Batch ${i + 1}/${batches.length} (ids ${ids}) ... `);
        try {
            const results = await classifyBatch(client, batch);
            for (const { id, category } of results) {
                const catId = NAME_TO_ID[category];
                if (!catId) {
                    console.warn(`  Unknown category "${category}" for id ${id} — skipping`);
                    errors++;
                    continue;
                }
                db.run('UPDATE contradictions SET category_id = ? WHERE id = ?', [catId, id]);
                classified++;
            }
            // Distribution snapshot for this batch
            const dist = {};
            results.forEach(r => { dist[r.category] = (dist[r.category] || 0) + 1; });
            console.log('done. ' + Object.entries(dist).map(([k, v]) => `${k}: ${v}`).join(' | '));
        } catch (err) {
            console.error(`  ERROR: ${err.message}`);
            errors++;
        }
    }

    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
    console.log(`\nSaved → ${DB_PATH}`);
    console.log(`Classified: ${classified}  Errors: ${errors}`);

    // Final distribution
    const dist = rows(db, `
        SELECT c.name, COUNT(co.id) AS n
        FROM categories c
        LEFT JOIN contradictions co ON co.category_id = c.id
        GROUP BY c.id ORDER BY c.id
    `);
    console.log('\nFinal distribution:');
    dist.forEach(r => console.log(`  ${String(r.n).padStart(4)}  ${r.name}`));
    const uncategorised = rows(db, 'SELECT COUNT(*) AS n FROM contradictions WHERE category_id IS NULL')[0].n;
    console.log(`  ${String(uncategorised).padStart(4)}  (uncategorised)`);

    db.close();
}

main().catch(err => { console.error(err); process.exit(1); });
