// bibleBooks.js
// Canonical Bible book recognizer + a reference extractor used to pull verse
// references out of scholarship citation text (notes like "on Eccl 9:5, 10").
//
// Whitelist-based on purpose: only a recognized canonical/deuterocanonical book
// name or standard abbreviation counts, so series/volume noise ("AB 29",
// "WBC 36", "Vol. 2", "PG 48:533", "Anchor Bible 27A") is rejected automatically.

// Canonical 66-book Protestant canon + deuterocanon, in canon order, testament tag.
const CANON = [
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
    ['Tobit', 'OT'], ['Judith', 'OT'], ['Wisdom', 'OT'], ['Ecclesiasticus', 'OT'],
    ['Baruch', 'OT'], ['1 Maccabees', 'OT'], ['2 Maccabees', 'OT'],
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

// Alternate names + standard SBL/common abbreviations -> canonical name.
const ALIASES = new Map([
    // full-name variants
    ['Psalm', 'Psalms'], ['Song of Songs', 'Song of Solomon'], ['Canticles', 'Song of Solomon'],
    ['Qoheleth', 'Ecclesiastes'], ['Ecclessiastes', 'Ecclesiastes'], ['Revelations', 'Revelation'],
    ['Apocalypse', 'Revelation'], ['Acts of the Apostles', 'Acts'],
    ['Sirach', 'Ecclesiasticus'], ['Ben Sira', 'Ecclesiasticus'], ['Wisdom of Solomon', 'Wisdom'],
    ['1 Machabees', '1 Maccabees'], ['2 Machabees', '2 Maccabees'], ['Song', 'Song of Solomon'],
    // OT abbreviations
    ['Gen', 'Genesis'], ['Exod', 'Exodus'], ['Exo', 'Exodus'], ['Lev', 'Leviticus'],
    ['Num', 'Numbers'], ['Deut', 'Deuteronomy'], ['Deu', 'Deuteronomy'], ['Josh', 'Joshua'],
    ['Judg', 'Judges'], ['Jdg', 'Judges'], ['1 Sam', '1 Samuel'], ['2 Sam', '2 Samuel'],
    ['1 Kgs', '1 Kings'], ['2 Kgs', '2 Kings'], ['1 Kg', '1 Kings'], ['2 Kg', '2 Kings'],
    ['1 Chr', '1 Chronicles'], ['2 Chr', '2 Chronicles'], ['1 Chron', '1 Chronicles'],
    ['2 Chron', '2 Chronicles'], ['Neh', 'Nehemiah'], ['Esth', 'Esther'],
    ['Ps', 'Psalms'], ['Pss', 'Psalms'], ['Prov', 'Proverbs'], ['Prv', 'Proverbs'],
    ['Eccl', 'Ecclesiastes'], ['Eccles', 'Ecclesiastes'], ['Qoh', 'Ecclesiastes'],
    ['Isa', 'Isaiah'], ['Jer', 'Jeremiah'], ['Lam', 'Lamentations'], ['Ezek', 'Ezekiel'],
    ['Ezk', 'Ezekiel'], ['Dan', 'Daniel'], ['Hos', 'Hosea'], ['Obad', 'Obadiah'],
    ['Jon', 'Jonah'], ['Mic', 'Micah'], ['Nah', 'Nahum'], ['Hab', 'Habakkuk'],
    ['Zeph', 'Zephaniah'], ['Zep', 'Zephaniah'], ['Hag', 'Haggai'], ['Zech', 'Zechariah'],
    ['Zec', 'Zechariah'], ['Mal', 'Malachi'],
    // NT abbreviations
    ['Matt', 'Matthew'], ['Mt', 'Matthew'], ['Mk', 'Mark'], ['Lk', 'Luke'], ['Jn', 'John'],
    ['Rom', 'Romans'], ['1 Cor', '1 Corinthians'], ['2 Cor', '2 Corinthians'],
    ['Gal', 'Galatians'], ['Eph', 'Ephesians'], ['Phil', 'Philippians'], ['Php', 'Philippians'],
    ['Col', 'Colossians'], ['1 Thess', '1 Thessalonians'], ['2 Thess', '2 Thessalonians'],
    ['1 Thes', '1 Thessalonians'], ['2 Thes', '2 Thessalonians'],
    ['1 Tim', '1 Timothy'], ['2 Tim', '2 Timothy'], ['Tit', 'Titus'], ['Phlm', 'Philemon'],
    ['Phm', 'Philemon'], ['Heb', 'Hebrews'], ['Jas', 'James'], ['1 Pet', '1 Peter'],
    ['2 Pet', '2 Peter'], ['1 Pt', '1 Peter'], ['2 Pt', '2 Peter'], ['Rev', 'Revelation'],
    // deuterocanon abbreviations
    ['Tob', 'Tobit'], ['Jdt', 'Judith'], ['Wis', 'Wisdom'], ['Sir', 'Ecclesiasticus'],
    ['Bar', 'Baruch'], ['1 Macc', '1 Maccabees'], ['2 Macc', '2 Maccabees'],
]);

const NAME_TO_CANON = new Map([...CANON.map(([n]) => [n, n]), ...ALIASES]);
const LOOKUP = new Map([...NAME_TO_CANON].map(([k, v]) => [k.toLowerCase(), v]));

const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Longest-first so "1 Corinthians" beats "1 Cor", "Judges" beats "Judg"/"Jude", etc.
const NAMES_BY_LEN = [...NAME_TO_CANON.keys()].sort((a, b) => b.length - a.length);
const BOOK_ALT = NAMES_BY_LEN.map(escape).join('|');

// A reference: a whitelisted book immediately followed by a chapter (and optional
// verse/locus). The locus atom allows same-chapter ranges ("6:1-4"), cross-chapter
// ranges ("23:56b-24:12"), verse letters ("7:19b"), and comma/and lists ("15:20, 28-29").
const ATOM = `\\d{1,3}(?::\\d{1,3}[a-c]?)?(?:[-–]\\d{1,3}(?::\\d{1,3}[a-c]?)?)?`;
const REF_RE = new RegExp(
    `\\b(${BOOK_ALT})\\.?\\s+(${ATOM}(?:\\s*(?:,|;|and)\\s*${ATOM})*)`,
    'gi'
);

function canonOf(token) {
    return LOOKUP.get(token.toLowerCase().replace(/\s+/g, ' ').trim()) || null;
}

// Parse a locus like "15:20, 28-29" or "1:29 and 9:3" into full refs, carrying the
// current chapter so bare verse-lists ("28-29") attach to the right chapter.
function expandLocus(book, locus) {
    const refs = [];
    let curChapter = null;
    const parts = locus.split(/\s*(?:,|;|\band\b)\s*/i).map(p => p.trim()).filter(Boolean);
    for (const part of parts) {
        // chapter:verse, with optional same- or cross-chapter range ("56b-24:12")
        const colon = part.match(/^(\d{1,3}):(\d{1,3}[a-c]?(?:[-–]\d{1,3}(?::\d{1,3}[a-c]?)?)?)$/);
        if (colon) {
            curChapter = colon[1];
            refs.push(`${book} ${curChapter}:${colon[2]}`);
            continue;
        }
        // no colon: either a verse(-range) of the current chapter, or a chapter-only ref
        if (curChapter && /^\d{1,3}(?:[a-c])?(?:[-–]\d{1,3}[a-c]?)?$/.test(part)) {
            refs.push(`${book} ${curChapter}:${part}`);
        } else if (/^\d{1,3}(?:[-–]\d{1,3})?$/.test(part)) {
            refs.push(`${book} ${part}`); // chapter or chapter-range only
        }
    }
    return refs;
}

// Extract a de-duplicated, in-order list of normalized references from free text.
function extractBibleRefs(text) {
    if (!text) return [];
    const norm = text.replace(/([123])([A-Z][a-z])/g, '$1 $2'); // "1John" -> "1 John"
    const out = [];
    const seen = new Set();
    let m;
    REF_RE.lastIndex = 0;
    while ((m = REF_RE.exec(norm)) !== null) {
        const book = canonOf(m[1]);
        if (!book) continue;
        for (const ref of expandLocus(book, m[2].replace(/–/g, '-'))) {
            if (!seen.has(ref)) { seen.add(ref); out.push(ref); }
        }
    }
    return out;
}

// Bible refs for ONE citation. Verse pointers live in the citation's annotation
// (after the year/pages: "..., 1966, pp. 620-621, on John 14:2"), whereas a
// commentary's volume-title scope ("*Genesis 1-15*") sits BEFORE the year. Scanning
// only the tail (after the last page-range/year) plus the parsed note keeps the
// intentional verse pointers and drops title scopes. Returns [] when none.
const _PAGES = /\b[Pp][Pp]?\.\s*[ivxlcdm\d]+(?:\s*[-–—]\s*[ivxlcdm\d]+)?(?:\s*(?:,|and|&)\s*[ivxlcdm\d]+(?:\s*[-–—]\s*[ivxlcdm\d]+)?)*/g;
const _YEAR = /\b(?:1[4-9]\d\d|20[0-3]\d)\b/g;

function annotationRefs(rawCitation, note) {
    const raw = rawCitation || '';
    let last = 0, m;
    _PAGES.lastIndex = 0; while ((m = _PAGES.exec(raw)) !== null) last = Math.max(last, m.index + m[0].length);
    _YEAR.lastIndex = 0; while ((m = _YEAR.exec(raw)) !== null) last = Math.max(last, m.index + m[0].length);
    const tail = last ? raw.slice(last) : '';
    return extractBibleRefs((note ? note + ' . ' : '') + tail);
}

module.exports = { CANON, TESTAMENT, CANON_ORDER, canonOf, extractBibleRefs, annotationRefs, REF_RE };
