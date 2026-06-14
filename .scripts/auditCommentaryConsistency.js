// auditCommentaryConsistency.js
// READ-ONLY mechanical consistency audit of the enrichment prose against the
// structured data. NO LLM, NO DB WRITES — it never calls db.export()/writeFileSync(DB).
//
// This is the cheap "phase 1" pass: it cannot judge whether a Hebrew/Greek claim is
// *true* (that needs a scholar), but it can catch the mechanical inconsistencies —
// prose that cites books its own references never mention, derived fields that have
// drifted from the references they were computed from, and impossible chapters.
//
// For each contradiction it gathers:
//   - structured refs : every bible_references.reference reached via its answers
//   - summary / commentary prose
// and runs these checks:
//
//   HIGH
//     scope_mismatch        stored testament_scope != value recomputed from refs
//     summary_disjoint      summary cites book(s), refs cite book(s), zero overlap
//     impossible_chapter    a prose ref points past a book's real chapter count
//   MEDIUM
//     bit_mismatch          stored books_in_tension != value recomputed from refs
//     commentary_disjoint   commentary cites book(s), refs cite book(s), zero overlap
//   LOW / INFO
//     ref_book_absent       a referenced book is never verse-cited in either prose field
//     summary_no_books      summary names no chapter-anchored book at all
//     no_structured_refs    contradiction has no usable references (can't cross-check)
//
// scope_mismatch / bit_mismatch are DETERMINISTIC recomputations (zero false
// positives by construction). The disjoint / absent checks are heuristics scoped to
// chapter-anchored citations ("Genesis 1:4"), which are far cleaner than bare book
// names ("John said") — narrative mentions without a chapter are intentionally NOT
// counted, so those checks under-report rather than cry wolf.
//
// Outputs: data/consistency_report.json (full per-entry detail) and
//          data/consistency_report.md (human-readable summary). Prints a console digest.
//
// Env: DB_PATH (default ./contradictions.db)

const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const { REF_RE, canonOf, extractBibleRefs, CANON, TESTAMENT, CANON_ORDER } = require('./bibleBooks');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'contradictions.db');
const JSON_OUT = path.join(__dirname, '..', 'data', 'consistency_report.json');
const MD_OUT = path.join(__dirname, '..', 'data', 'consistency_report.md');

// --- canon helpers shared from bibleBooks (same book list/order/testament tags) ---
const CANON_NAMES = CANON.map(([n]) => n);

// ---------------------------------------------------------------------------
// Parity replica of deriveTestamentScope.js's reference recognizer.
// books_in_tension / testament_scope were computed by THAT script, which uses a
// bare-name matcher + a SMALLER alias set than bibleBooks. To test "is the stored
// value still what the canonical deriver would produce", we must recognize books
// exactly the way it does — not with bibleBooks' richer matcher (which would flag
// recognizer differences as false drift). If deriveTestamentScope.js changes its
// recognizer, keep this block in sync.
// ---------------------------------------------------------------------------
const D_ALIASES = new Map([
    ['Psalm', 'Psalms'], ['Song of Songs', 'Song of Solomon'], ['Canticles', 'Song of Solomon'],
    ['Qoheleth', 'Ecclesiastes'], ['Ecclessiastes', 'Ecclesiastes'], ['Revelations', 'Revelation'],
    ['Apocalypse', 'Revelation'], ['Acts of the Apostles', 'Acts'],
    ['Sirach', 'Ecclesiasticus'], ['Ben Sira', 'Ecclesiasticus'], ['Wisdom of Solomon', 'Wisdom'],
    ['1 Machabees', '1 Maccabees'], ['2 Machabees', '2 Maccabees'],
]);
const D_NAME_TO_CANON = new Map([...CANON_NAMES.map(n => [n, n]), ...D_ALIASES]);
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const D_PATTERN = [...D_NAME_TO_CANON.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escapeRe)
    .join('|');
const D_BOOK_RE = new RegExp(`\\b(?:${D_PATTERN})(?![A-Za-z])`, 'gi');
const D_LOOKUP = new Map([...D_NAME_TO_CANON].map(([k, v]) => [k.toLowerCase(), v]));

// Distinct canonical books in one reference string, exactly as deriveTestamentScope does.
function derivedBooksIn(ref) {
    const normalized = (ref || '').replace(/([123])([A-Z][a-z])/g, '$1 $2');
    const found = new Set();
    for (const m of normalized.matchAll(D_BOOK_RE)) {
        const canon = D_LOOKUP.get(m[0].toLowerCase());
        if (canon) found.add(canon);
    }
    return found;
}

function classifyScope(books) {
    const testaments = new Set([...books].map(b => TESTAMENT.get(b)));
    if (testaments.has('OT') && testaments.has('NT')) return 'OT_vs_NT';
    if (testaments.has('OT')) return 'OT_internal';
    if (testaments.has('NT')) return 'NT_internal';
    return null;
}

function orderBooks(books) {
    return [...books].sort((a, b) => CANON_ORDER.get(a) - CANON_ORDER.get(b));
}

// ---------------------------------------------------------------------------
// Prose recognizer: chapter-anchored only (book immediately followed by a chapter),
// via bibleBooks' REF_RE. This deliberately ignores bare "John"/"Mark"/"Job" so a
// person's name or the word "job" never registers as a book.
// ---------------------------------------------------------------------------
function chapterAnchoredBooks(text) {
    const norm = (text || '').replace(/([123])([A-Z][a-z])/g, '$1 $2');
    const set = new Set();
    let m;
    REF_RE.lastIndex = 0;
    while ((m = REF_RE.exec(norm)) !== null) {
        const b = canonOf(m[1]);
        if (b) set.add(b);
    }
    return set;
}

// ---------------------------------------------------------------------------
// Impossible-chapter detection. Protestant chapter counts for the 66-book canon.
// Single-chapter books are EXCLUDED on purpose: "Jude 6" / "Philemon 20" are verse
// references, not chapter 6/20, so they must never be flagged.
// ---------------------------------------------------------------------------
const CHAPTER_COUNTS = {
    Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34,
    Joshua: 24, Judges: 21, Ruth: 4, '1 Samuel': 31, '2 Samuel': 24,
    '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
    Ezra: 10, Nehemiah: 13, Esther: 10, Job: 42, Psalms: 150, Proverbs: 31,
    Ecclesiastes: 12, 'Song of Solomon': 8, Isaiah: 66, Jeremiah: 52,
    Lamentations: 5, Ezekiel: 48, Daniel: 12, Hosea: 14, Joel: 3, Amos: 9,
    Obadiah: 1, Jonah: 4, Micah: 7, Nahum: 3, Habakkuk: 3, Zephaniah: 3,
    Haggai: 2, Zechariah: 14, Malachi: 4,
    Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28, Romans: 16,
    '1 Corinthians': 16, '2 Corinthians': 13, Galatians: 6, Ephesians: 6,
    Philippians: 4, Colossians: 4, '1 Thessalonians': 5, '2 Thessalonians': 3,
    '1 Timothy': 6, '2 Timothy': 4, Titus: 3, Philemon: 1, Hebrews: 13,
    James: 5, '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1,
    '3 John': 1, Jude: 1, Revelation: 22,
};
const NAMES_LONGEST = [...CANON_NAMES].sort((a, b) => b.length - a.length);

// Split a normalized ref ("1 Corinthians 13:4-7") into [book, locus].
function splitRef(ref) {
    for (const name of NAMES_LONGEST) {
        if (ref === name) return [name, ''];
        if (ref.startsWith(name + ' ')) return [name, ref.slice(name.length + 1).trim()];
    }
    return [null, ref];
}

// Chapter numbers a locus touches. extractBibleRefs has already resolved verse-vs-
// chapter context, so a colon means "the number before it is a chapter" and a
// colon-less locus is a chapter (or chapter range).
function chaptersOf(locus) {
    const chs = new Set();
    if (locus.includes(':')) {
        let m;
        const re = /(\d{1,3}):/g;
        while ((m = re.exec(locus)) !== null) chs.add(+m[1]);
    } else {
        let m;
        const re = /(\d{1,3})/g;
        while ((m = re.exec(locus)) !== null) chs.add(+m[1]);
    }
    return chs;
}

function impossibleChapters(text) {
    const issues = [];
    for (const ref of extractBibleRefs(text)) {
        const [book, locus] = splitRef(ref);
        if (!book) continue;
        const max = CHAPTER_COUNTS[book];
        if (!max || max === 1) continue; // unknown (deuterocanon) or single-chapter book
        for (const ch of chaptersOf(locus)) {
            if (ch > max) issues.push({ ref, book, chapter: ch, max });
        }
    }
    return issues;
}

const intersects = (a, b) => [...a].some(x => b.has(x));
const setMinus = (a, b) => [...a].filter(x => !b.has(x));

async function main() {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));

    // base rows
    const cRes = db.exec(
        'SELECT id, summary, commentary, testament_scope, books_in_tension FROM contradictions ORDER BY id'
    );
    const contradictions = cRes.length ? cRes[0].values : [];

    // structured refs grouped by contradiction id
    const refsByCid = new Map();
    const rRes = db.exec(`
        SELECT c.id AS cid, br.reference AS ref
        FROM contradictions c
        JOIN answers a           ON a.contradiction_id = c.id
        JOIN bible_references br ON br.answer_id = a.id
    `);
    if (rRes.length) {
        for (const [cid, ref] of rRes[0].values) {
            if (!refsByCid.has(cid)) refsByCid.set(cid, []);
            refsByCid.get(cid).push(ref || '');
        }
    }
    db.close(); // read-only: done with the DB before any reporting

    const SEVERITY = {
        scope_mismatch: 'HIGH', summary_disjoint: 'HIGH', impossible_chapter: 'HIGH',
        bit_mismatch: 'MEDIUM', commentary_disjoint: 'MEDIUM',
        ref_book_absent: 'LOW', summary_no_books: 'LOW', no_structured_refs: 'LOW',
    };
    const flagCounts = Object.fromEntries(Object.keys(SEVERITY).map(k => [k, 0]));
    const entries = [];

    for (const [id, summary, commentary, storedScope, storedBit] of contradictions) {
        const refStrings = refsByCid.get(id) || [];
        const flags = [];

        // structured ref books — two recognizers, each for its own purpose
        const derivedRefBooks = new Set();          // parity recognizer -> integrity checks
        for (const r of refStrings) for (const b of derivedBooksIn(r)) derivedRefBooks.add(b);
        const refBooks = new Set();                 // chapter-anchored -> prose comparison
        for (const r of refStrings) for (const b of chapterAnchoredBooks(r)) refBooks.add(b);

        const summaryBooks = chapterAnchoredBooks(summary);
        const commentaryBooks = chapterAnchoredBooks(commentary);
        const proseBooks = new Set([...summaryBooks, ...commentaryBooks]);

        // --- deterministic integrity checks ---
        if (!derivedRefBooks.size) {
            flags.push({ type: 'no_structured_refs' });
        } else {
            const recomputedScope = classifyScope(derivedRefBooks);
            const recomputedBit = orderBooks(derivedRefBooks).join(', ');
            if (recomputedScope !== storedScope) {
                flags.push({ type: 'scope_mismatch', stored: storedScope, recomputed: recomputedScope });
            }
            if (recomputedBit !== (storedBit || '')) {
                flags.push({ type: 'bit_mismatch', stored: storedBit, recomputed: recomputedBit });
            }
        }

        // --- prose vs refs heuristics (only when both sides name chapter-anchored books) ---
        if (refBooks.size) {
            if (summaryBooks.size && !intersects(summaryBooks, refBooks)) {
                flags.push({ type: 'summary_disjoint', summaryBooks: [...summaryBooks], refBooks: [...refBooks] });
            }
            if (commentaryBooks.size && !intersects(commentaryBooks, refBooks)) {
                flags.push({ type: 'commentary_disjoint', commentaryBooks: [...commentaryBooks], refBooks: [...refBooks] });
            }
            const absent = setMinus(refBooks, proseBooks);
            if (absent.length) flags.push({ type: 'ref_book_absent', books: absent });
        }
        if (!summaryBooks.size) flags.push({ type: 'summary_no_books' });

        // --- impossible chapters in either prose field ---
        const chapIssues = [...impossibleChapters(summary), ...impossibleChapters(commentary)];
        if (chapIssues.length) flags.push({ type: 'impossible_chapter', issues: chapIssues });

        for (const f of flags) flagCounts[f.type]++;
        if (flags.length) {
            entries.push({
                id,
                severity: Math.min(...flags.map(f => ({ HIGH: 0, MEDIUM: 1, LOW: 2 }[SEVERITY[f.type]]))),
                flags,
            });
        }
    }

    entries.sort((a, b) => a.severity - b.severity || a.id - b.id);

    // ---- report ----
    const sevOf = t => SEVERITY[t];
    const bySeverity = { HIGH: [], MEDIUM: [], LOW: [] };
    for (const t of Object.keys(SEVERITY)) bySeverity[sevOf(t)].push([t, flagCounts[t]]);

    console.log('=== Commentary/summary consistency audit (read-only) ===');
    console.log('contradictions scanned :', contradictions.length);
    console.log('entries with >=1 flag  :', entries.length);
    console.log('');
    for (const sev of ['HIGH', 'MEDIUM', 'LOW']) {
        console.log(`${sev}:`);
        for (const [t, n] of bySeverity[sev]) console.log(`  ${String(n).padStart(4)}  ${t}`);
    }

    // a few HIGH examples inline
    const highs = entries.filter(e => e.flags.some(f => sevOf(f.type) === 'HIGH'));
    if (highs.length) {
        console.log('\nFirst HIGH-severity entries:');
        for (const e of highs.slice(0, 12)) {
            const labels = e.flags.filter(f => sevOf(f.type) === 'HIGH').map(f => f.type).join(', ');
            console.log(`  id ${String(e.id).padStart(3)}  [${labels}]`);
        }
        if (highs.length > 12) console.log(`  …and ${highs.length - 12} more HIGH entries`);
    }

    // ---- artifacts ----
    fs.mkdirSync(path.dirname(JSON_OUT), { recursive: true });
    fs.writeFileSync(JSON_OUT, JSON.stringify({
        generatedAt: new Date().toISOString(),
        db: path.basename(DB_PATH),
        scanned: contradictions.length,
        flagged: entries.length,
        flagCounts,
        severity: SEVERITY,
        entries,
    }, null, 2));

    fs.writeFileSync(MD_OUT, renderMarkdown(contradictions.length, entries, flagCounts, SEVERITY));
    console.log('\nWrote', path.relative(__dirname, JSON_OUT), 'and', path.relative(__dirname, MD_OUT));
    console.log('(no database writes were made)');
}

function renderMarkdown(scanned, entries, flagCounts, SEVERITY) {
    const sevOf = t => SEVERITY[t];
    const idList = (pred, cap = 60) => {
        const ids = entries.filter(e => e.flags.some(pred)).map(e => e.id);
        const shown = ids.slice(0, cap).join(', ');
        return ids.length > cap ? `${shown}, …(+${ids.length - cap})` : (shown || '—');
    };
    const L = [];
    L.push('# Mechanical consistency report');
    L.push('');
    L.push(`Read-only audit of \`summary\`/\`commentary\` prose against structured \`bible_references\`. No DB writes.`);
    L.push('');
    L.push(`- Contradictions scanned: **${scanned}**`);
    L.push(`- Entries with at least one flag: **${entries.length}**`);
    L.push('');
    L.push('## Flag counts');
    L.push('');
    L.push('| Severity | Flag | Count | Meaning |');
    L.push('|---|---|---:|---|');
    const meaning = {
        scope_mismatch: 'stored testament_scope ≠ recomputed from refs',
        summary_disjoint: 'summary names book(s) sharing none with its references',
        impossible_chapter: 'a prose ref points past a book’s real chapter count',
        bit_mismatch: 'stored books_in_tension ≠ recomputed from refs',
        commentary_disjoint: 'commentary names book(s) sharing none with its references',
        ref_book_absent: 'a referenced book is never verse-cited in either prose field',
        summary_no_books: 'summary names no chapter-anchored book (informational)',
        no_structured_refs: 'contradiction has no usable references',
    };
    for (const sev of ['HIGH', 'MEDIUM', 'LOW']) {
        for (const t of Object.keys(SEVERITY).filter(k => sevOf(k) === sev)) {
            L.push(`| ${sev} | \`${t}\` | ${flagCounts[t]} | ${meaning[t]} |`);
        }
    }
    L.push('');

    for (const sev of ['HIGH', 'MEDIUM']) {
        const types = Object.keys(SEVERITY).filter(k => sevOf(k) === sev && flagCounts[k] > 0);
        if (!types.length) continue;
        L.push(`## ${sev}-severity detail`);
        L.push('');
        for (const t of types) {
            L.push(`### \`${t}\` (${flagCounts[t]})`);
            L.push('');
            const hits = entries.filter(e => e.flags.some(f => f.type === t));
            for (const e of hits.slice(0, 40)) {
                const f = e.flags.find(x => x.type === t);
                L.push(`- **id ${e.id}** — ${describe(t, f)}`);
            }
            if (hits.length > 40) L.push(`- …and ${hits.length - 40} more`);
            L.push('');
        }
    }

    L.push('## LOW / informational — affected ids');
    L.push('');
    for (const t of Object.keys(SEVERITY).filter(k => sevOf(k) === 'LOW')) {
        L.push(`- \`${t}\` (${flagCounts[t]}): ${idList(f => f.type === t)}`);
    }
    L.push('');
    return L.join('\n');
}

function describe(type, f) {
    switch (type) {
        case 'scope_mismatch': return `stored \`${f.stored}\` → recomputed \`${f.recomputed}\``;
        case 'bit_mismatch': return `stored \`${f.stored}\` → recomputed \`${f.recomputed}\``;
        case 'summary_disjoint': return `summary books [${f.summaryBooks.join(', ')}] vs refs [${f.refBooks.join(', ')}]`;
        case 'commentary_disjoint': return `commentary books [${f.commentaryBooks.join(', ')}] vs refs [${f.refBooks.join(', ')}]`;
        case 'impossible_chapter': return f.issues.map(i => `${i.ref} (>${i.book} max ${i.max})`).join('; ');
        case 'ref_book_absent': return `referenced but not in prose: [${f.books.join(', ')}]`;
        default: return type;
    }
}

main().catch(err => { console.error(err); process.exit(1); });
