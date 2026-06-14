/**
 * exportNoteCleanup.js — Export entries whose commentary/scholarship still carry
 * embedded "data-quality" notes (about malformed refs, misspellings, typos, etc.)
 * into batches for a cleanup pass. Auto-detects DB-wide.
 *
 * Each entry's `_resolution.candidateNotes` lists the suspect sentence(s) the agent
 * should evaluate: remove if the issue is already fixed, or FIX the data then remove
 * the note if it is still broken, or escalate (needs-human) if it would change meaning.
 *
 * Writes flagged_N*.json into data/flagged/ so importFlagged.js picks them up.
 *   node exportNoteCleanup.js
 *
 * Env overrides: DB_PATH (default ./contradictions.db), OUT_DIR (default ./data/flagged)
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH || './contradictions.db';
const OUT_DIR = process.env.OUT_DIR || './data/flagged';
const BATCH_SIZE = 7;

const MARK = /(malformed|flag(ged)? for (review|the db|db)|db team|db cleanup|db maintainers|db correction|without (a )?book prefix|no book prefix|trailing colon|should read ['"]|coherency_flag|prelim flag|period instead of|period-for-colon|misspell|stray ['"]?-?\d|data note:|data flag:|reference note:|note on data quality|normaliz\w+ (it )?(at )?(the )?(source|db))/i;

function rows(db, sql, p) {
    const r = db.exec(sql, p);
    if (!r[0]) return [];
    const { columns, values } = r[0];
    return values.map(v => Object.fromEntries(columns.map((c, i) => [c, v[i]])));
}

function candidateSentences(text) {
    if (!text) return [];
    return text.split(/(?<=[.!?\]])\s+/).map(s => s.trim()).filter(s => MARK.test(s));
}

async function main() {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));

    const base = rows(db, 'SELECT id FROM contradictions ORDER BY id');
    const records = [];
    for (const { id } of base) {
        const c = rows(db, 'SELECT id, question, question_url, summary, commentary, scholarship, recommend_delete, delete_reason FROM contradictions WHERE id = ?', [id])[0];
        const candComm = candidateSentences(c.commentary);
        const candSch = candidateSentences(c.scholarship);
        if (!candComm.length && !candSch.length) continue;

        c.questionUrl = c.question_url;
        delete c.question_url;
        const answers = rows(db, 'SELECT id, answer, answer_explanation FROM answers WHERE contradiction_id = ? ORDER BY id', [id]);
        for (const a of answers) {
            a.answerExplanation = a.answer_explanation;
            delete a.answer_explanation;
            a.bibleReferences = rows(db, 'SELECT reference FROM bible_references WHERE answer_id = ? ORDER BY id', [a.id]).map(r => r.reference);
        }
        c.answers = answers;
        c._resolution = {
            group: 'note-cleanup',
            candidateNotes: { commentary: candComm, scholarship: candSch },
            instruction: "Each candidate note is an embedded data-quality remark. For each: (1) if the issue it describes is ALREADY fixed in the current data, delete ONLY that note sentence and any now-dangling lead-in, preserving all genuine scholarship; (2) if it is STILL broken AND the fix is an obvious mechanical correction (misspelled book name in bibleReferences e.g. '2 Chrornicles'->'2 Chronicles'; a non-verse string sitting in bibleReferences; an unambiguously wrong ref the note itself identifies e.g. '2 Timothy 2:6'->'1 Timothy 2:6'), FIX the underlying data, then delete the note; (3) if resolving it would change the question's meaning, delete substantive content, or is otherwise a judgment call, set status='needs-human' and LEAVE the note. Never delete real scholarly citations or analysis.",
            status: 'pending'
        };
        if (id === 126) {
            c._resolution.special = "ALSO fix the array defect: answer 1215's bibleReferences has 'Isaiah 5:22' wedged between 'Amos 6:1' and 'Amos 6:6'. The live SAB page cites these as one range 'Amos 6:1-6'. Recombine 'Amos 6:1' + 'Amos 6:6' into a single 'Amos 6:1-6' entry (removing the split) and place 'Isaiah 5:22' in its correct position relative to the other Isaiah refs. Then correct the commentary's factually-wrong 'Isaiah 5:22-6' speculation (the '-6' was the tail of Amos 6:1-6, not Isaiah).";
        }
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
        const fn = `flagged_N${i + 1}.json`;
        fs.writeFileSync(path.join(OUT_DIR, fn), JSON.stringify({
            batch: `N${i + 1}`, resolutionType: 'note-cleanup', count: slice.length,
            ids: slice.map(c => c.id), contradictions: slice
        }, null, 2), 'utf8');
        console.log(`Wrote ${fn}: ${slice.length} entries -> ids ${slice.map(c => c.id).join(', ')}`);
    }
    console.log(`\nDone. ${records.length} entries in ${nBatches} batches -> ${OUT_DIR}/`);
}

main().catch(err => { console.error(err); process.exit(1); });
