/**
 * deriveTestamentScope.js — Mechanically classify each contradiction's canonical
 * scope from its cited bible_references. NO LLM — pure string parsing.
 *
 * For every contradiction, we gather all reference strings cited by its answers,
 * extract the canonical book name(s), map each to Old/New Testament, then set:
 *
 *   testament_scope  = 'OT_internal'  (all recognized books are OT)
 *                    | 'NT_internal'  (all recognized books are NT)
 *                    | 'OT_vs_NT'     (both testaments are represented)
 *                    | NULL           (no recognizable book references)
 *   books_in_tension = distinct canonical book names, comma-separated, in canon order
 *
 * Caveat: references are the verses the apologetic *answers* cite, so this is a
 * proxy for the passages in tension — a solid mechanical first pass, not a
 * substitute for the scholarly source-relationship judgment (a later step).
 *
 *   DRY_RUN=1 node deriveTestamentScope.js   # parse + report only, write nothing
 *   node deriveTestamentScope.js             # apply to the DB (timestamped .bak first)
 *
 * Env: DB_PATH (default ./contradictions.db), DRY_RUN
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH || './contradictions.db';
const DRY_RUN = !!process.env.DRY_RUN;

// Canonical 66-book Protestant canon, in canon order, with testament tag.
const CANON = [
    // Old Testament (39)
    ['Genesis', 'OT'], ['Exodus', 'OT'], ['Leviticus', 'OT'], ['Numbers', 'OT'],
    ['Deuteronomy', 'OT'], ['Joshua', 'OT'], ['Judges', 'OT'], ['Ruth', 'OT'],
    ['1 Samuel', 'OT'], ['2 Samuel', 'OT'], ['1 Kings', 'OT'], ['2 Kings', 'OT'],
    ['1 Chronicles', 'OT'], ['2 Chronicles', 'OT'], ['Ezra', 'OT'], ['Nehemiah', 'OT'],
    ['Esther', 'OT'], ['Job', 'OT'], ['Psalms', 'OT'], ['Proverbs', 'OT'],
    ['Ecclesiastes', 'OT'], ['Song of Solomon', 'OT'], ['Isaiah', 'OT'], ['Jeremiah', 'OT'],
    ['Lamentations', 'OT'], ['Ezekiel', 'OT'], ['Daniel', 'OT'], ['Hosea', 'OT'],
    ['Joel', 'OT'], ['Amos', 'OT'], ['Obadiah', 'OT'], ['Jonah', 'OT'],
    ['Micah', 'OT'], ['Nahum', 'OT'], ['Habakkuk', 'OT'], ['Zephaniah', 'OT'],
    ['Haggai', 'OT'], ['Zechariah', 'OT'], ['Malachi', 'OT'],
    // Deuterocanon — not in the Protestant 66, but Old-Covenant-era writings, so
    // tagged OT for testament-scope purposes (a Wisdom-vs-Gospel tension is OT_vs_NT).
    ['Tobit', 'OT'], ['Judith', 'OT'], ['Wisdom', 'OT'], ['Ecclesiasticus', 'OT'],
    ['Baruch', 'OT'], ['1 Maccabees', 'OT'], ['2 Maccabees', 'OT'],
    // New Testament (27)
    ['Matthew', 'NT'], ['Mark', 'NT'], ['Luke', 'NT'], ['John', 'NT'],
    ['Acts', 'NT'], ['Romans', 'NT'], ['1 Corinthians', 'NT'], ['2 Corinthians', 'NT'],
    ['Galatians', 'NT'], ['Ephesians', 'NT'], ['Philippians', 'NT'], ['Colossians', 'NT'],
    ['1 Thessalonians', 'NT'], ['2 Thessalonians', 'NT'], ['1 Timothy', 'NT'], ['2 Timothy', 'NT'],
    ['Titus', 'NT'], ['Philemon', 'NT'], ['Hebrews', 'NT'], ['James', 'NT'],
    ['1 Peter', 'NT'], ['2 Peter', 'NT'], ['1 John', 'NT'], ['2 John', 'NT'],
    ['3 John', 'NT'], ['Jude', 'NT'], ['Revelation', 'NT'],
];

const TESTAMENT = new Map(CANON.map(([name, t]) => [name, t]));
const CANON_ORDER = new Map(CANON.map(([name], i) => [name, i]));

// Spelling variants / alternate names → canonical name.
const ALIASES = new Map([
    ['Psalm', 'Psalms'],
    ['Song of Songs', 'Song of Solomon'],
    ['Canticles', 'Song of Solomon'],
    ['Qoheleth', 'Ecclesiastes'],
    ['Ecclessiastes', 'Ecclesiastes'],          // common misspelling seen in the data
    ['Revelations', 'Revelation'],
    ['Apocalypse', 'Revelation'],
    ['Acts of the Apostles', 'Acts'],
    // Deuterocanon alternate spellings (Douay-Rheims / Septuagint forms).
    ['Sirach', 'Ecclesiasticus'],
    ['Ben Sira', 'Ecclesiasticus'],
    ['Wisdom of Solomon', 'Wisdom'],
    ['1 Machabees', '1 Maccabees'],
    ['2 Machabees', '2 Maccabees'],
]);

// Build a longest-first alternation over every canonical name + alias so that
// "1 John" is preferred over "John", "Judges" over "Jude", etc.
const NAME_TO_CANON = new Map([...CANON.map(([n]) => [n, n]), ...ALIASES]);
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PATTERN = [...NAME_TO_CANON.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escape)
    .join('|');
// Trailing (?![A-Za-z]) instead of \b so "1 Peter3:13" still matches (a digit may
// abut the name) while "Jude" is still rejected inside "Judges".
const BOOK_RE = new RegExp(`\\b(?:${PATTERN})(?![A-Za-z])`, 'gi');

// Case-insensitive lookup back to the canonical spelling.
const LOOKUP = new Map([...NAME_TO_CANON].map(([k, v]) => [k.toLowerCase(), v]));

/** All distinct canonical books mentioned in one reference string. */
function booksInReference(ref) {
    // Repair a missing space between a leading book number and its name
    // ("1Thessalonians" -> "1 Thessalonians") so the matcher can see it.
    const normalized = ref.replace(/([123])([A-Z][a-z])/g, '$1 $2');
    const found = new Set();
    for (const m of normalized.matchAll(BOOK_RE)) {
        const canon = LOOKUP.get(m[0].toLowerCase());
        if (canon) found.add(canon);
    }
    return found;
}

function leadingToken(ref) {
    // Best-effort label for an unrecognized reference (text before the first digit).
    const m = ref.match(/^[^0-9]*/);
    return (m ? m[0] : ref).trim() || ref.trim();
}

function classify(books) {
    const testaments = new Set([...books].map(b => TESTAMENT.get(b)));
    if (testaments.has('OT') && testaments.has('NT')) return 'OT_vs_NT';
    if (testaments.has('OT')) return 'OT_internal';
    if (testaments.has('NT')) return 'NT_internal';
    return null;
}

async function main() {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));

    const totalRow = db.exec('SELECT COUNT(*) FROM contradictions');
    const totalContradictions = totalRow.length ? totalRow[0].values[0][0] : 0;

    // Gather every reference, grouped by contradiction.
    const res = db.exec(`
        SELECT c.id AS cid, br.reference AS ref
        FROM contradictions c
        JOIN answers a            ON a.contradiction_id = c.id
        JOIN bible_references br  ON br.answer_id = a.id
    `);

    const byContradiction = new Map(); // cid -> Set(canonical books)
    const unrecognized = new Map();    // leading token -> count
    let refRows = 0;

    if (res.length) {
        for (const [cid, ref] of res[0].values) {
            refRows++;
            const books = booksInReference(ref || '');
            if (!books.size) {
                const tok = leadingToken(ref || '');
                unrecognized.set(tok, (unrecognized.get(tok) || 0) + 1);
                continue;
            }
            if (!byContradiction.has(cid)) byContradiction.set(cid, new Set());
            const acc = byContradiction.get(cid);
            for (const b of books) acc.add(b);
        }
    }

    // Build the assignments.
    const assignments = []; // { id, scope, books }
    const dist = { OT_internal: 0, NT_internal: 0, OT_vs_NT: 0, undetermined: 0 };
    for (const [cid, books] of byContradiction) {
        const scope = classify(books);
        const ordered = [...books].sort((a, b) => CANON_ORDER.get(a) - CANON_ORDER.get(b));
        assignments.push({ id: cid, scope, books: ordered.join(', ') });
        dist[scope || 'undetermined']++;
    }
    // Contradictions with no usable references at all → undetermined (left NULL).
    const withRefs = byContradiction.size;
    const noUsableRefs = totalContradictions - withRefs;
    dist.undetermined += noUsableRefs;

    // ---- report ----
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no write)' : 'APPLY'}`);
    console.log(`Reference rows scanned: ${refRows}`);
    console.log(`Contradictions total: ${totalContradictions}`);
    console.log(`  with recognizable references: ${withRefs}`);
    console.log(`  with no usable references:    ${noUsableRefs} (left NULL)`);
    console.log('\nScope distribution:');
    for (const k of ['OT_internal', 'NT_internal', 'OT_vs_NT', 'undetermined']) {
        console.log(`  ${String(dist[k]).padStart(4)}  ${k}`);
    }

    if (unrecognized.size) {
        const top = [...unrecognized.entries()].sort((a, b) => b[1] - a[1]);
        console.log(`\nUnrecognized reference tokens (${unrecognized.size} distinct):`);
        for (const [tok, n] of top.slice(0, 30)) {
            console.log(`  ${String(n).padStart(4)}  "${tok}"`);
        }
        if (top.length > 30) console.log(`  …and ${top.length - 30} more`);
    } else {
        console.log('\nUnrecognized reference tokens: none — every reference mapped to a canonical book.');
    }

    if (DRY_RUN) {
        console.log('\nDRY_RUN — nothing written.');
        db.close();
        return;
    }

    // ---- apply ----
    const cols = db.exec('PRAGMA table_info(contradictions)')[0].values.map(v => v[1]);
    if (!cols.includes('testament_scope') || !cols.includes('books_in_tension')) {
        console.error('\nColumns missing — run "node migrateAddTestamentScope.js" first.');
        process.exit(1);
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveDir = path.join(path.dirname(DB_PATH), '.archive');
    fs.mkdirSync(archiveDir, { recursive: true });
    const bak = path.join(archiveDir, `${path.basename(DB_PATH)}.bak-${stamp}`);
    fs.copyFileSync(DB_PATH, bak);
    console.log(`\nBacked up → ${bak}`);

    db.run('BEGIN TRANSACTION');
    try {
        const stmt = db.prepare(
            'UPDATE contradictions SET testament_scope = ?, books_in_tension = ? WHERE id = ?');
        for (const a of assignments) {
            stmt.run([a.scope, a.books, a.id]);
        }
        stmt.free();
        db.run('COMMIT');
    } catch (err) {
        db.run('ROLLBACK');
        throw err;
    }

    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
    console.log(`Applied ${assignments.length} updates → ${DB_PATH}`);
    db.close();
}

main().catch(err => { console.error(err); process.exit(1); });
