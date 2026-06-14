/**
 * exportFlagged.js — Export ONLY the agent-resolvable flagged contradictions
 * into focused JSON batches for the resolution agents.
 *
 * Pulls each entry in the RESOLUTION map from contradictions.db (answers +
 * references nested and camelCased — same shape as exportBatches.js) and
 * attaches a `_resolution` block telling the agent exactly what to fix. Writes
 * one file per resolution batch into data/flagged/:
 *   flagged_A.json — malformed/wrong reference fixes (mechanical)
 *   flagged_B.json — content/source repair (WebFetch the live page)
 *   flagged_C.json — weak-harmonization review & clear
 *
 *   node exportFlagged.js
 *
 * Excluded on purpose: ids 476 (needs a row SPLIT) and 520 (needs a row
 * CONSOLIDATION) — the UPDATE-only import cannot apply those; handle in db_manager.
 *
 * Env overrides: DB_PATH (default ./contradictions.db), OUT_DIR (default ./data/flagged)
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH || './contradictions.db';
const OUT_DIR = process.env.OUT_DIR || './data/flagged';

// batch: A = reference fix, B = content/source repair, C = review & clear
const RESOLUTION = {
    233: { batch: 'A', group: 'malformed-reference', issue: "bibleReferences contains '24:6' with no book name.", action: "Add the correct book name (the Abiathar/Ahimelech priestly-division context points to '1 Chronicles 24:6'); verify against the questionUrl page before changing." },
    236: { batch: 'A', group: 'malformed-reference', issue: "bibleReferences contains bare '33' and '17' with no book names.", action: "Restore the correct book names from the live SAB page; normalize to 'Book C:V'." },
    307: { batch: 'A', group: 'malformed-reference', issue: "'1 Chronicles 3.17-18:' uses a period for the colon and has a trailing colon.", action: "Normalize to '1 Chronicles 3:17-18'." },
    317: { batch: 'A', group: 'malformed-reference', issue: "'Jeremaih 22:18-19' misspells the book name.", action: "Correct to 'Jeremiah 22:18-19'." },
    335: { batch: 'A', group: 'malformed-reference', issue: "'Nehemaih 7:72' misspells the book name.", action: "Correct to 'Nehemiah 7:72'." },
    431: { batch: 'A', group: 'malformed-reference', issue: "'16:4' is missing the 'Matthew' prefix.", action: "Correct to 'Matthew 16:4' (verify the verse against the questionUrl page)." },
    436: { batch: 'A', group: 'malformed-reference', issue: "malformed punctuation in one bibleReferences entry.", action: "Find the malformed reference and normalize it to standard 'Book C:V' form." },
    443: { batch: 'A', group: 'malformed-reference', issue: "bare '14' is missing the 'John' prefix.", action: "Correct to the proper 'John <chapter:verse>' against the questionUrl page." },
    540: { batch: 'A', group: 'malformed-reference', issue: "'Acts.22:9' uses a period separator between book and chapter.", action: "Correct to 'Acts 22:9'." },
    581: { batch: 'A', group: 'wrong-reference', issue: "references are wrong: 'Luke 8:5'/'8:7' are Parable-of-the-Sower citations, not importunity-in-prayer.", action: "Replace with the correct proof-texts 'Luke 11:5-13' and 'Luke 18:1-8'; verify against the questionUrl page. The contradiction itself is coherent." },

    428: { batch: 'B', group: 'content-garble', issue: "answer/reference garble: 'John 7:19' should be 'Luke 7:18-20'.", action: "WebFetch the questionUrl, correct the reference and any garbled answer text to match the source page." },
    433: { batch: 'B', group: 'missing-answer', issue: "one answer is an empty 'No' with no content (scrape dropped it).", action: "WebFetch the questionUrl and reconstruct the missing answer + answerExplanation + bibleReferences. If the content is unrecoverable, set recommend_delete=1 with a clear delete_reason instead of fabricating." },
    490: { batch: 'B', group: 'event-conflation', issue: "conflates Bethsaida (Mark 8:22-25) with Siloam (John 9) — two different miracles.", action: "SIGNIFICANT CHANGE — verify the source. Either correct the framing so the cited verses actually conflict, or repoint to the Jericho blind-men location conflict (Matt 20:29-34 / Mark 10:46-52 / Luke 18:35-43). Explain the change in commentary. If unsure, set _resolution.status='needs-human'." },
    514: { batch: 'B', group: 'missing-anchor', issue: "the 'Hell/descent' answer cites only the Apostles' Creed, with no biblical anchor.", action: "Add '1 Peter 3:18-20' and '1 Peter 4:6' to that answer's bibleReferences and reference the descent tradition in commentary." },
    536: { batch: 'B', group: 'question-mismatch', issue: "title says 'Is circumcision required?' but the slug is meat.html and the verses (1 Cor 8:4-8, Acts 15:28-29) are about food offered to idols — a scraper join error.", action: "WebFetch the questionUrl; re-title the question to match the page (food offered to idols) and align the verses, OR swap the verses to the circumcision set (Gen 17:10-14 vs Gal 5:2). Note the correction in commentary." },

    280: { batch: 'C', group: 'review', issue: "flagged during enrichment; no data defect found. Commentary treats it as a genuine Chronicler editorial tension.", action: "Re-verify coherency. If the framing is sound, clear the flag (set _resolution.status='cleared'); only edit fields if a real inaccuracy is found." },
    385: { batch: 'C', group: 'review', issue: "scholar note: 'weak as stated'.", action: "Reframe around the genealogical contradiction (cf. ids 386-389) if warranted, or confirm the current framing. Update commentary only if it improves accuracy." },
    398: { batch: 'C', group: 'review', issue: "flagged during enrichment; no recorded reason and no defect detected (God's address at Jesus' baptism — 'this is'/'thou art' wording).", action: "Re-read; confirm the synoptic wording contrast is accurately framed. Clear the flag if fine." },
    415: { batch: 'C', group: 'review', issue: "rests on the Mark 16 Longer Ending; audit says well-handled.", action: "Confirm the commentary flags the textual-variant status of Mark 16:9-20. Clear if accurate." },
    417: { batch: 'C', group: 'review', issue: "'sons of the kingdom' interpretive framing; audit says well-handled.", action: "Confirm the framing is accurate; clear the flag if fine." },
    455: { batch: 'C', group: 'review', issue: "weak proof-text framing on John 14:19 (Parousia vs resurrection appearances); already caveated.", action: "Confirm the caveat is present and accurate; clear if fine." },
    477: { batch: 'C', group: 'review', issue: "weakest harmonization in the resurrection cluster (30-45 min Greek timing window for the women's arrival).", action: "Confirm the timing-window discussion is accurate; clear if fine." },
    551: { batch: 'C', group: 'review', issue: "Paul's public-vs-private distinction (1 Cor 14:8-9 critiques uninterpreted tongues, not a blanket ban).", action: "Confirm the distinction is represented; clear if fine." },
    555: { batch: 'C', group: 'review', issue: "KJV artifact of the bare/phortion lexical distinction (Gal 6:2 vs 6:5).", action: "Confirm the lexical point is accurate; clear if fine." },
    556: { batch: 'C', group: 'review', issue: "different scenarios in 1 Peter vs the Pastorals/Johannine letters.", action: "Confirm the scenario distinction is accurate; clear if fine." },
    559: { batch: 'C', group: 'review', issue: "'these all' in Heb 11:13 most naturally restricted to the 11:8-12 cluster.", action: "Confirm the scope reading is accurate; clear if fine." },
    565: { batch: 'C', group: 'review', issue: "genre mismatch (Eccl 1:7 observational poetry vs Job 38:22 storehouse cosmology); mild.", action: "Confirm the genre point is accurate; clear if fine." },
    578: { batch: 'C', group: 'review', issue: "Eph 4:26 quotes Ps 4:4 LXX as regulation, not endorsement; mild.", action: "Confirm the regulation-vs-endorsement reading is accurate; clear if fine." }
};

function rowsToObjects(result) {
    if (!result || result.length === 0) return [];
    const { columns, values } = result[0];
    return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
}

async function main() {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));

    const ids = Object.keys(RESOLUTION).map(Number).sort((a, b) => a - b);
    const byBatch = {};

    for (const id of ids) {
        const rows = rowsToObjects(db.exec(
            'SELECT id, question, question_url, summary, commentary, scholarship, recommend_delete, delete_reason FROM contradictions WHERE id = ?',
            [id]
        ));
        if (!rows.length) { console.warn(`! id ${id} not found in DB — skipping`); continue; }
        const c = rows[0];
        c.questionUrl = c.question_url;
        delete c.question_url;

        const answers = rowsToObjects(db.exec(
            'SELECT id, answer, answer_explanation FROM answers WHERE contradiction_id = ? ORDER BY id', [id]
        ));
        for (const a of answers) {
            a.answerExplanation = a.answer_explanation;
            delete a.answer_explanation;
            a.bibleReferences = rowsToObjects(db.exec(
                'SELECT reference FROM bible_references WHERE answer_id = ? ORDER BY id', [a.id]
            )).map(r => r.reference);
        }
        c.answers = answers;
        c._resolution = { ...RESOLUTION[id], status: 'pending' };

        const b = RESOLUTION[id].batch;
        (byBatch[b] = byBatch[b] || []).push(c);
    }
    db.close();

    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
    for (const f of fs.readdirSync(OUT_DIR)) {
        if (/^flagged_[A-Z]\.json$/.test(f)) fs.unlinkSync(path.join(OUT_DIR, f));
    }

    const labels = { A: 'reference-fix', B: 'content-repair', C: 'review-and-clear' };
    let total = 0;
    for (const b of Object.keys(byBatch).sort()) {
        const list = byBatch[b];
        const payload = {
            batch: b,
            resolutionType: labels[b] || 'unknown',
            count: list.length,
            ids: list.map(c => c.id),
            contradictions: list
        };
        const filename = `flagged_${b}.json`;
        fs.writeFileSync(path.join(OUT_DIR, filename), JSON.stringify(payload, null, 2), 'utf8');
        console.log(`Wrote ${filename} (${labels[b]}): ${list.length} entries -> ids ${payload.ids.join(', ')}`);
        total += list.length;
    }
    console.log(`\nDone. ${total} agent-resolvable entries exported to ${OUT_DIR}/`);
    console.log('Excluded (need manual db_manager work): 476 (split), 520 (consolidate).');
}

main().catch(err => { console.error(err); process.exit(1); });
