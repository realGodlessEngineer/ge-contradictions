// scholarshipParser.js
// Pure functions for splitting a contradictions.scholarship blurb into individual
// citations and extracting best-effort bibliographic fields. No DB access here so
// it can be unit-tested in isolation. Consumed by buildScholarshipTables.js.
//
// The scholarship field across the corpus comes in four shapes:
//   1. multiline            - one citation per line                      (split on \n)
//   2. single + ';'         - "Author, *Title* (..); Author, *Title* (..)" (split on ';' outside parens)
//   3. single + '*title*'   - period-delimited, markdown title markers   (split after each title)
//   4. single + plain       - Chicago style, no markdown                 (year-anchored split)
//
// Inter-citation periods collide with periods inside initials ("C. K."),
// abbreviations ("pp.", "ed.", "vol."), and parentheticals ("(AB 31; Doubleday, 1998)").
// We therefore build a same-length "masked" copy of the string with those periods/
// semicolons neutralised to '_', compute split indices on the mask, then slice the
// ORIGINAL string so no characters are lost.

const ABBREVS = [
    'pp', 'p', 'ed', 'eds', 'vol', 'vols', 'no', 'nos', 'trans', 'rev', 'repr',
    'esp', 'cf', 'ch', 'chap', 'chaps', 'n', 'nn', 'Jr', 'Sr', 'St', 'Mr', 'Mrs',
    'Ms', 'Dr', 'Prof', 'vss', 'vs', 'al', 'orig', 'suppl', 'Suppl',
];

const YEAR_RE = /\b(1[4-9]\d\d|20\d\d)\b/g;

// Build a same-length mask of `s` with characters that must NOT be treated as
// split points overwritten by '_': interiors of () and *title* markdown, the '.'
// of abbreviations, and the '.' after a single-capital initial. A separator that
// survives in the mask is a candidate inter-citation boundary.
function buildMask(s) {
    const m = s.split('');

    // 1. Mask interior of parentheticals (non-nested () only, which is all we have).
    let depth = 0;
    for (let i = 0; i < s.length; i++) {
        if (s[i] === '(') { depth++; continue; }
        if (s[i] === ')') { if (depth > 0) depth--; continue; }
        if (depth > 0) m[i] = '_';
    }

    // 2. Mask interior of *markdown titles* (titles can contain '.', ';', ':' that
    //    must never count as boundaries, e.g. "*1 Enoch 1: ... 1-36; 81-108*").
    const titleRe = /\*[^*]+\*/g;
    let tm;
    while ((tm = titleRe.exec(s)) !== null) {
        for (let i = tm.index + 1; i < tm.index + tm[0].length - 1; i++) m[i] = '_';
    }

    // 3. Mask the '.' of known abbreviations (case-insensitive, word-boundary).
    const abbrevRe = new RegExp('\\b(' + ABBREVS.join('|') + ')\\.', 'gi');
    let match;
    while ((match = abbrevRe.exec(s)) !== null) {
        const dotIdx = match.index + match[0].length - 1; // index of the trailing '.'
        if (m[dotIdx] === '.') m[dotIdx] = '_';
    }

    // 4. Mask the '.' after a lone capital initial: " C." / "^C." / "(C." etc.
    const initRe = /(^|[^A-Za-z])([A-Z])\./g;
    while ((match = initRe.exec(s)) !== null) {
        const dotIdx = match.index + match[0].length - 1;
        if (m[dotIdx] === '.') m[dotIdx] = '_';
    }

    return m.join('');
}

// Does this text carry a publication year (1450-2035), ignoring page ranges?
function hasYear(text) {
    return /\b(1[4-9]\d\d|20[0-3]\d)\b/.test(text.replace(PAGES_RE, ' '));
}

// Does this text carry a citation "signature" — a markdown title or a
// parenthetical that contains a year (i.e. a publisher/year block)?
function hasTitle(text) {
    return /\*[^*]+\*/.test(text) || /\([^)]*\b(?:1[4-9]\d\d|20[0-3]\d)\b[^)]*\)/.test(text);
}

// Slice s into pieces at the given sorted boundary indices (each index is the
// position of the separator char to drop). Returns trimmed, non-empty pieces.
function sliceAt(s, cutStarts, cutEnds) {
    const pieces = [];
    let start = 0;
    for (let i = 0; i < cutStarts.length; i++) {
        pieces.push(s.slice(start, cutStarts[i]));
        start = cutEnds[i];
    }
    pieces.push(s.slice(start));
    return pieces.map(p => p.replace(/^[\s;.]+|[\s]+$/g, '').trim()).filter(Boolean);
}

// Find boundaries in a single-line, period-delimited string anchored on a marker
// regex (asterisk-close or year). For each anchor (except the last span) the
// boundary is the first ". " / "; " in the MASK at/after the anchor end whose
// following non-space char (in s) is an uppercase letter.
function periodBoundariesAfter(s, mask, anchorEnds) {
    const cutStarts = [], cutEnds = [];
    for (let a = 0; a < anchorEnds.length - 1; a++) {
        const from = anchorEnds[a];
        const limit = anchorEnds[a + 1]; // don't cross into the next anchor
        let found = -1;
        for (let i = from; i < limit - 1; i++) {
            if ((mask[i] === '.' || mask[i] === ';')) {
                // require ". " then an uppercase (next author), tolerating extra spaces
                let j = i + 1;
                while (j < s.length && s[j] === ' ') j++;
                if (j < s.length && /[A-Z“"'(]/.test(s[j])) { found = i; break; }
            }
        }
        if (found !== -1) {
            cutStarts.push(found);
            // consume the separator + following whitespace
            let e = found + 1;
            while (e < s.length && (s[e] === ' ')) e++;
            cutEnds.push(e);
        }
    }
    return { cutStarts, cutEnds };
}

function splitCitations(raw) {
    if (!raw || !raw.trim()) return [];
    const s = raw.trim();

    // 1. MULTILINE: one citation per line (reliable; the scholar agents wrote them that way).
    const lines = s.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    if (lines.length >= 2) return lines.map(stripTrailingSep).filter(Boolean);

    // 2. SINGLE LINE: split on every top-level "." or ";" that precedes a new author,
    //    then re-join fragments until each citation owns a publication year (or two
    //    markdown titles collide). This unifies the asterisk / Chicago / semicolon styles
    //    and tolerates ";" inside titles and "." inside abbreviations/initials/parens.
    const mask = buildMask(s);

    // candidate boundary indices: a "." or ";" in the mask followed by space(s) + an
    // uppercase letter / quote / open-paren (the start of the next author or title).
    // continuation tokens: a separator followed by one of these begins more of the SAME
    // citation (a second volume, a page range), never a new author -> not a boundary.
    const CONT = /^(Vols?|vols?|pp|p|no|nos|n|nn|esp|cf|ed|eds|trans|rev|repr)\b/;

    const cands = [];
    for (let i = 0; i < mask.length; i++) {
        // "." / ";" separators, and " — "/" – " em/en-dash separators (some rows use these
        // between citations). The "followed by a capital" guard keeps en-dashes inside page
        // ranges ("451–455", a digit follows) from ever becoming boundaries.
        const isDash = (mask[i] === '—' || mask[i] === '–') && s[i - 1] === ' ';
        if (mask[i] !== '.' && mask[i] !== ';' && !isDash) continue;
        let j = i + 1;
        while (j < s.length && s[j] === ' ') j++;
        if (j < s.length && /[A-Z“”"'(]/.test(s[j]) && !CONT.test(s.slice(j))) cands.push({ sep: i, next: j });
    }
    if (cands.length === 0) return [stripTrailingSep(s)];

    // Close a citation only once it carries a publication year. Year is the one reliable
    // end-of-citation signal across every style; everything before it (author, title,
    // series, city, publisher) is period-delimited internally and must stay together.
    const citations = [];
    let cutStart = 0;
    for (let k = 0; k < cands.length; k++) {
        const { sep, next } = cands[k];
        if (hasYear(s.slice(cutStart, sep))) {
            citations.push(stripTrailingSep(s.slice(cutStart, sep)));
            cutStart = next;
        }
    }
    const tail = stripTrailingSep(s.slice(cutStart));
    if (tail) {
        if (looksLikeNote(tail)) {
            // an editorial/data-quality note the agents appended -> keep it separate so the
            // caller can drop it; never fold it back into a real citation.
            citations.push(tail);
        } else if (citations.length && !hasYear(tail) && !hasTitle(tail)) {
            // a genuine trailing fragment with no year is a continuation -> fold into previous
            citations[citations.length - 1] += '. ' + tail;
        } else {
            citations.push(tail);
        }
    }
    return citations.filter(Boolean);
}

function stripTrailingSep(c) {
    // also strip a leading list bullet ("- ", "• ") seen on multiline entries; never
    // strip a leading "*" (that would break a citation that opens with a markdown title).
    return c.replace(/^[\s;.]+/, '').replace(/^[-–—•]\s+/, '').replace(/\s*[;]\s*$/, '').trim();
}

// --- field extraction (best-effort) ---

// NOTE: case-sensitive on purpose. The page-number run uses LOWERCASE roman or digits
// only — making it case-insensitive let "John P. Meier" match as pages "P. M" (M read as
// a roman numeral), corrupting pages/note/bib_core. The p/pp prefix is cased explicitly.
const PAGES_RE = /\b[Pp][Pp]?\.\s*[ivxlcdm\d]+(?:\s*[-–—]\s*[ivxlcdm\d]+)?(?:\s*(?:,|and|&)\s*[ivxlcdm\d]+(?:\s*[-–—]\s*[ivxlcdm\d]+)?)*/;

function parseCitation(rawCitation) {
    const raw = rawCitation.trim();
    let work = raw;

    // year: prefer a 4-digit token NOT immediately after "pp."/"p."/a dash (page-like)
    let year = null;
    const maskForYear = buildMask(raw);
    YEAR_RE.lastIndex = 0;
    let ym;
    const yrs = [];
    while ((ym = YEAR_RE.exec(raw)) !== null) {
        // accept years whether inside parens or not; record position
        yrs.push({ val: parseInt(ym[1], 10), idx: ym.index });
    }
    if (yrs.length) {
        // publication year is the largest plausible value <= current era, usually the first
        // that is <= 2030; pick the first one that looks like a real year (>=1450)
        const cand = yrs.find(y => y.val >= 1450 && y.val <= 2035) || yrs[0];
        year = cand.val;
    }

    // pages
    let pages = null;
    const pm = raw.match(PAGES_RE);
    if (pm) pages = pm[0].replace(/\s+/g, ' ').trim();

    // title (only reliable when markdown asterisks present)
    let title = null;
    const tm = raw.match(/\*([^*]+)\*/);
    if (tm) title = tm[1].trim();

    // publication parenthetical (first one)
    let publication = null;
    const pubm = raw.match(/\(([^)]*)\)/);
    if (pubm) publication = pubm[1].trim();

    // author: text before the title marker (asterisk form) or before first " ("
    let author = null;
    if (tm) {
        author = raw.slice(0, tm.index).replace(/[,\s]+$/, '').trim() || null;
    } else if (pubm) {
        const before = raw.slice(0, pubm.index).trim();
        // "Author, Title" or "Surname, First. Title" -- can't reliably split; leave author null,
        // but if there is a clear "Surname, First[ Initials]." prefix, capture up to that.
        const am = before.match(/^([A-Z][A-Za-z'’.-]+,\s+[A-Z][A-Za-z'’.\- ]*?\.)\s/);
        if (am) author = am[1].replace(/\.\s*$/, '').trim();
    }

    // bib_core: raw with pages and any trailing note removed, asterisks stripped.
    let bibCore = raw;
    if (pm) {
        const noteAfter = raw.slice(pm.index + pm[0].length).replace(/^[\s,.;]+/, '').trim();
        bibCore = raw.slice(0, pm.index).trim();
        // note = trailing clause after pages (often "(annihilationist case)" or "on X")
        var note = noteAfter || null;
    } else {
        // no pages: cut after the year if a note clause trails it
        var note = null;
        if (year != null) {
            const yIdx = raw.lastIndexOf(String(year));
            const tail = raw.slice(yIdx + String(year).length);
            // tail like "), on the eschatological mansions..." -> after the ')' a note may live
            const noteMatch = tail.match(/\)\s*,?\s*(.*\S)\s*\.?$/);
            if (noteMatch && /[a-z]/.test(noteMatch[1]) && noteMatch[1].length > 3) {
                note = noteMatch[1].replace(/\.$/, '').trim();
                bibCore = raw.slice(0, yIdx + String(year).length + (tail.indexOf(')') + 1)).trim();
            }
        }
    }
    bibCore = bibCore.replace(/\*/g, '').replace(/[\s,;.]+$/, '').trim();
    if (note) note = note.replace(/\*/g, '').replace(/^[\s,;.]+|[\s,;.]+$/g, '').trim() || null;

    return { raw, author, title, publication, year, pages, note, bibCore, dedupKey: dedupKey({ bibCore }) };
}

const STOPWORDS = new Set(['the', 'a', 'an', 'of', 'and', 'in', 'on', 'to', 'for', 'with', 'by',
    'from', 'at', 'as', 'der', 'die', 'das', 'und', 'zur', 'des']);

// Normalised dedup key from the bibliographic core. Order-independent (a sorted bag of
// significant tokens) so the same work merges across "First Last" vs "Last, First" author
// order and markdown vs plain styles. Volume/edition numbers and distinct title words stay
// in the bag, so different volumes ("Vol. 1" vs "Vol. 2") and different works never collide.
function dedupKey({ bibCore }) {
    const tokens = bibCore
        .toLowerCase()
        .replace(/[“”‘’"'*]/g, '')
        .replace(/&/g, 'and')
        .replace(/\bjr\b|\bsr\b|\bed\b|\beds\b|\btrans\b|\brev\b|\brepr\b/g, ' ')
        .replace(/[^a-z0-9]+/g, ' ')
        .split(/\s+/)
        .filter(t => t && !STOPWORDS.has(t) && t.length > 1);
    return [...new Set(tokens)].sort().join(' ');
}

// A split chunk that is actually an editorial/data-quality note the scholar agents
// left embedded in the scholarship field (not a bibliographic source). These start
// with a note marker and carry no publication year or markdown title.
function looksLikeNote(text) {
    const t = text.trim();
    if (/^(note\b|note on data|note on|on canonical scope|on data\b|caveat\b|n\.b\.)/i.test(t)
        && !hasYear(t) && !/\*[^*]+\*/.test(t)) return true;
    return false;
}

module.exports = { splitCitations, parseCitation, dedupKey, buildMask, looksLikeNote, hasYear };
