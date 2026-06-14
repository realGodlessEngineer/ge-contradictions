/**
 * exportMalformed.js — Export every contradiction that has a malformed
 * bibleReferences string into focused batches for the resolution agents.
 *
 * "Malformed" = missing a book name (no letters, e.g. "45:21", "20"), a trailing
 * colon ("Genesis 38:"), or a period-for-colon ("1 Kings 7.26"). Auto-detects
 * DB-wide so nothing is missed. Each entry gets a `_resolution` block listing the
 * exact bad refs per answer. Writes flagged_M*.json into data/flagged/ so the
 * existing importFlagged.js picks them up.
 *
 *   node exportMalformed.js
 *
 * Env overrides: DB_PATH (default ./contradictions.db), OUT_DIR (default ./data/flagged)
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH || './contradictions.db';
const OUT_DIR = process.env.OUT_DIR || './data/flagged';
const BATCH_SIZE = 7;

const isMalformed = (ref) => !/[A-Za-z]/.test(ref) || ref.includes('.') || /:$/.test(ref);

function rows(db, sql, p) {
    const r = db.exec(sql, p);
    if (!r[0]) return [];
    const { columns, values } = r[0];
    return values.map(v => Object.fromEntries(columns.map((c, i) => [c, v[i]])));
}

async function main() {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));

    const refRows = rows(db, 'SELECT br.reference, a.contradiction_id AS cid FROM bible_references br JOIN answers a ON a.id = br.answer_id');
    const cids = [...new Set(refRows.filter(r => isMalformed(r.reference)).map(r => r.cid))].sort((a, b) => a - b);
    console.log(`Contradictions with malformed refs: ${cids.length} -> ${cids.join(', ')}`);

    const records = [];
    for (const id of cids) {
        const c = rows(db, 'SELECT id, question, question_url, summary, commentary, scholarship, recommend_delete, delete_reason FROM contradictions WHERE id = ?', [id])[0];
        c.questionUrl = c.question_url;
        delete c.question_url;

        const answers = rows(db, 'SELECT id, answer, answer_explanation FROM answers WHERE contradiction_id = ? ORDER BY id', [id]);
        const malformed = {};
        for (const a of answers) {
            a.answerExplanation = a.answer_explanation;
            delete a.answer_explanation;
            a.bibleReferences = rows(db, 'SELECT reference FROM bible_references WHERE answer_id = ? ORDER BY id', [a.id]).map(r => r.reference);
            const bad = a.bibleReferences.filter(isMalformed);
            if (bad.length) malformed[a.id] = bad;
        }
        c.answers = answers;
        c._resolution = {
            group: 'malformed-reference',
            issue: `Malformed bibleReferences (missing book name / trailing colon / period-for-colon): ${JSON.stringify(malformed)}`,
            action: "For each malformed reference, recover the correct citation. FIRST use that answer's answerExplanation inline text (it usually shows 'Book Chapter:Verse'); if still ambiguous, WebFetch the questionUrl (live SAB page) to confirm the book. Normalize to 'Book C:V'. Fix ONLY the malformed strings; leave well-formed refs and all prose/enrichment untouched.",
            malformed,
            status: 'pending'
        };
        records.push(c);
    }
    db.close();

    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
    for (const f of fs.readdirSync(OUT_DIR)) {
        if (/^flagged_.*\.json$/.test(f)) fs.unlinkSync(path.join(OUT_DIR, f));
    }

    const nBatches = Math.ceil(records.length / BATCH_SIZE);
    for (let i = 0; i < nBatches; i++) {
        const slice = records.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
        const fn = `flagged_M${i + 1}.json`;
        fs.writeFileSync(path.join(OUT_DIR, fn), JSON.stringify({
            batch: `M${i + 1}`,
            resolutionType: 'malformed-reference',
            count: slice.length,
            ids: slice.map(c => c.id),
            contradictions: slice
        }, null, 2), 'utf8');
        console.log(`Wrote ${fn}: ${slice.length} entries -> ids ${slice.map(c => c.id).join(', ')}`);
    }
    console.log(`\nDone. ${records.length} entries in ${nBatches} batches -> ${OUT_DIR}/`);
}

main().catch(err => { console.error(err); process.exit(1); });
