/**
 * validateHarmonization.js — §10 acceptance gate for the harmonization_* projection
 * (docs/SPEC-contradictions-605-sweep.md §10). Pure, dependency-light JS/sql.js —
 * no network, no writes.
 *
 * Dual-mode:
 *   (A) Library: require('./.scripts/validateHarmonization').validateProjection(
 *         { rows, quotes, versePairs, consensusByCid }
 *       ) -> { ok, violations: [{ cid, code, message }] }
 *       This is what the (future) baker calls fail-closed on its in-memory
 *       projection before it ever writes contradictions.db.
 *   (B) CLI: `node .scripts/validateHarmonization.js` loads contradictions.db
 *       (sql.js, read-only), runs the same checks over the live baked tables (if
 *       present — they are absent in the pre-bake DB, which is treated as an
 *       empty, zero-violation projection), prints a report, and exits 0/1.
 *
 * Env (CLI only): DB_PATH (default ./contradictions.db).
 *
 * This script never calls db.export() and never writes to any .db file.
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH || './contradictions.db';
const BOOKS_MAP_PATH = path.join(__dirname, '..', 'data', 'harmonization', 'books_map.json');

// ---------------------------------------------------------------------------
// §7 — the single source of truth for pole order. reconcileFirst is true ONLY
// for the two harmonization-leaning consensus levels; every other value (the
// two contradiction levels, genuinely_disputed, null, unmapped) is false
// (discrepancy-first). Mirrors docs/SPEC-contradictions-605-sweep.md §7.
// ---------------------------------------------------------------------------
const RECONCILE_FIRST_LEVELS = new Set(['probable_harmonization', 'apparent_only']);
const reconcileFirstFor = (level) => RECONCILE_FIRST_LEVELS.has(level);

// §3.3 — the locked attribution head parser ("Author (date), Work (year).").
const DOSSIER_ATTR_HEAD_RE = /^(.*?\([^)]*\d[^)]*\))/;

// §10 note/half-line loaded-language blocklist (open list — append as needed).
const BLOCKLIST_WORDS = [
    'attempt', 'explains away', 'contrived', 'forced', 'of course',
    'fatal', 'decisively', 'obviously', 'merely', 'so-called', 'desperate', 'absurd',
];
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const BLOCKLIST_RES = BLOCKLIST_WORDS.map((word) => ({ word, re: new RegExp(`\\b${escapeRegex(word)}\\b`, 'i') }));

/** Returns the first matching blocklisted word/phrase found in `text`, or null. */
function matchesBlocklist(text) {
    if (!text) return null;
    for (const { word, re } of BLOCKLIST_RES) {
        if (re.test(text)) return word;
    }
    return null;
}

// ---------------------------------------------------------------------------
// NORM — mirrors verifyExcerpts.py's norm() (the repo convention is to copy
// this per-script rather than share a module). NFC-normalize, unify curly
// quotes/apostrophes, unify en/em-dash to '-', collapse '--' to '-', strip
// space before punctuation, collapse whitespace, trim. Used ONLY for the
// substring/distinctness comparisons (note_verbatim, vp_distinct) — never for
// the register/length checks, which inspect the raw authored string.
// ---------------------------------------------------------------------------
function norm(s) {
    let out = (s || '').normalize('NFC');
    out = out.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
    out = out.replace(/[–—]/g, '-');
    out = out.replace(/-{2,}/g, '-');
    out = out.replace(/\s+([;:,.!?])/g, '$1');
    out = out.replace(/\s+/g, ' ').trim();
    return out;
}

// ---------------------------------------------------------------------------
// books_map.json — lowercase alias -> bolls (1..66). Loaded lazily + cached
// (validateProjection's signature is fixed by the brief, so this cannot be
// passed in; it is a fixed repo asset resolved __dirname-relative so the
// module behaves the same regardless of the caller's cwd).
// ---------------------------------------------------------------------------
let _aliasToBollsCache = null;
function getAliasToBolls() {
    if (_aliasToBollsCache) return _aliasToBollsCache;
    const raw = JSON.parse(fs.readFileSync(BOOKS_MAP_PATH, 'utf8'));
    const map = new Map();
    for (const [alias, bolls] of Object.entries(raw.aliases || {})) {
        map.set(alias.toLowerCase(), bolls);
    }
    _aliasToBollsCache = map;
    return map;
}

// §4.3 — a single clean "Book chap:verse" citation: optional leading 1/2/3,
// a (possibly multi-word) book name, then chap:verse. No '/', no ','.
const VP_REF_RE = /^(?:[1-3]\s+)?[A-Za-z][A-Za-z.]*(?:\s+[A-Za-z]+)*\s+\d+:\d+$/;
const VP_REF_SPLIT_RE = /^(.*)\s+(\d+):(\d+)$/;

/** Parse a verse-pair `ref` -> {bolls, chapter, verse}, or null if malformed
 * or the book token doesn't resolve via books_map aliases. */
function parseRef(ref, aliasToBolls) {
    if (typeof ref !== 'string' || !VP_REF_RE.test(ref)) return null;
    const m = VP_REF_SPLIT_RE.exec(ref);
    if (!m) return null;
    const bookToken = m[1].trim().toLowerCase();
    const bolls = aliasToBolls.get(bookToken);
    if (!bolls) return null;
    return { bolls, chapter: parseInt(m[2], 10), verse: parseInt(m[3], 10) };
}

function compareTuple(a, b) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return a[i] - b[i];
    }
    return 0;
}

/**
 * Extract candidate author-identifying strings from a quote's `attr`, for the
 * note_lead_source / halfline_opposing_author mechanical proxy. §10: "from
 * each pole quote's attr, extract the author head via DOSSIER_ATTR_HEAD_RE,
 * strip the trailing (...) and trailing punctuation to get the author-name
 * text, and collect surname tokens (each whitespace-separated word of length
 * >= 3 that starts with an uppercase letter; also keep the full head string)."
 * Deliberately literal, not clever.
 */
function authorTokensFromAttr(attr) {
    const m = DOSSIER_ATTR_HEAD_RE.exec(attr || '');
    if (!m || !m[1] || !m[1].trim()) return [];
    const head = m[1].trim();
    const authorNameText = head.replace(/\([^)]*\)\s*$/, '').trim().replace(/[.,;:]+$/, '').trim();
    const tokens = new Set();
    tokens.add(head);
    for (const word of authorNameText.split(/\s+/)) {
        if (word.length >= 3 && /^[A-Z]/.test(word)) tokens.add(word);
    }
    return [...tokens].filter(Boolean);
}

function containsAnyToken(haystack, tokens) {
    const lower = (haystack || '').toLowerCase();
    return tokens.some((t) => t && lower.includes(t.toLowerCase()));
}

function groupQuotesByCidPole(quotes) {
    const map = new Map(); // `${cid}|${pole}` -> quotes sorted by ord
    for (const q of quotes) {
        const key = `${q.contradiction_id}|${q.pole}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(q);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.ord - b.ord);
    return map;
}

function groupVersePairsByCid(versePairs) {
    const map = new Map(); // cid -> sides sorted by ord
    for (const vp of versePairs) {
        if (!map.has(vp.contradiction_id)) map.set(vp.contradiction_id, []);
        map.get(vp.contradiction_id).push(vp);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.ord - b.ord);
    return map;
}

// ---------------------------------------------------------------------------
// The §10 checks
// ---------------------------------------------------------------------------

/** §10 check 1 — every quote's `attr` parses a non-empty dated head. */
function checkAttrHead(quotes, push) {
    for (const q of quotes) {
        const m = DOSSIER_ATTR_HEAD_RE.exec(q.attr || '');
        if (!m || !m[1] || !m[1].trim()) {
            push(q.contradiction_id, 'attr_head',
                `quote (pole=${q.pole}, ord=${q.ord}) attr does not parse a dated head via DOSSIER_ATTR_HEAD_RE: ${JSON.stringify(q.attr)}`);
        }
    }
}

/** §10 check 2 — note<->quotes symmetry + note register (one sentence, ends
 * '.', <=180 chars, no interior '. ', no date/citation tail, blocklist-clean)
 * + note_verbatim (not a copied slice) + note_lead_source (names an author
 * from its own pole's quotes). */
function checkNotes(rows, quoteMap, push) {
    for (const row of rows) {
        const cid = row.contradiction_id;
        for (const pole of ['reconcile', 'discrepancy']) {
            const note = row[`${pole}_note`];
            const poleQuotes = quoteMap.get(`${cid}|${pole}`) || [];

            // §10 note<->quotes present-iff symmetry.
            if (poleQuotes.length > 0) {
                if (note === null || note === undefined || String(note).trim() === '') {
                    push(cid, 'note_present', `${pole} has ${poleQuotes.length} quote(s) but ${pole}_note is null/empty`);
                }
            } else if (note !== null && note !== undefined) {
                push(cid, 'note_present', `${pole} has 0 quotes but ${pole}_note is non-null (should be null — an emptyNote pole always has 0 quotes)`);
            }

            if (note === null || note === undefined) continue;

            // §10 note register — ALL must hold.
            if (!/\.$/.test(note)) {
                push(cid, 'note_register', `${pole}_note does not end with '.': ${JSON.stringify(note)}`);
            }
            if (note !== note.trim()) {
                push(cid, 'note_register', `${pole}_note is not pre-trimmed (leading/trailing whitespace)`);
            }
            if (note.length > 180) {
                push(cid, 'note_register', `${pole}_note exceeds 180 chars (${note.length})`);
            }
            if (note.includes('. ')) {
                push(cid, 'note_register', `${pole}_note has an interior ". " sentence break`);
            }
            if (/\(\d{3,4}\)\s*\.?$/.test(note) || /,\s*on\s+[1-3]?\s*[A-Za-z.]+\s+\d+:\d+\.?$/i.test(note)) {
                push(cid, 'note_register', `${pole}_note has a trailing date/citation tail: ${JSON.stringify(note)}`);
            }
            const blockHit = matchesBlocklist(note);
            if (blockHit) {
                push(cid, 'note_register', `${pole}_note contains loaded language: "${blockHit}"`);
            }

            // note_verbatim — must be a condensation, not a copied slice.
            const normNote = norm(note);
            const isCopiedSlice = poleQuotes.some((q) => norm(q.text).includes(normNote));
            if (isCopiedSlice) {
                push(cid, 'note_verbatim', `${pole}_note appears to be a verbatim slice of one of its pole's quotes, not a condensation`);
            }

            // note_lead_source — the note must name an author from its own pole's quotes.
            if (poleQuotes.length > 0) {
                const tokens = [];
                for (const q of poleQuotes) tokens.push(...authorTokensFromAttr(q.attr));
                if (!containsAnyToken(note, tokens)) {
                    push(cid, 'note_lead_source', `${pole}_note names no author appearing in its pole's quotes[]`);
                }
            }
        }
    }
}

/** §10 count-parity: L = the leaning pole (§7). (a) L is never the emptyNote
 * pole. (b) if M carries an emptyNote, parity is satisfied. (c) else
 * L.count >= M.count. */
function checkParity(rows, quoteMap, consensusByCid, push) {
    for (const row of rows) {
        const cid = row.contradiction_id;
        const level = (consensusByCid && consensusByCid[cid] !== undefined) ? consensusByCid[cid] : null;
        const L = reconcileFirstFor(level) ? 'reconcile' : 'discrepancy';
        const M = L === 'reconcile' ? 'discrepancy' : 'reconcile';
        const Lq = (quoteMap.get(`${cid}|${L}`) || []).length;
        const Mq = (quoteMap.get(`${cid}|${M}`) || []).length;
        const LemptyNote = row[`${L}_empty_note`] !== null && row[`${L}_empty_note`] !== undefined;
        const MemptyNote = row[`${M}_empty_note`] !== null && row[`${M}_empty_note`] !== undefined;

        // §10 count-parity (a) — the leaning pole must never be the emptyNote pole.
        if (LemptyNote) {
            push(cid, 'parity_leaning_is_empty', `leaning pole (${L}, level=${level ?? 'null'}) carries the emptyNote — the leaning pole must never be honest-absence`);
        }
        // §10 count-parity (b)/(c) — if the minority pole is emptyNote, parity is
        // satisfied by honest-absence; otherwise the leaning pole must have >= quotes.
        if (!MemptyNote && !(Lq >= Mq)) {
            push(cid, 'parity_count', `leaning pole (${L}) has ${Lq} quote(s) < minority pole (${M}) ${Mq} quote(s)`);
        }
    }
}

/** §10 check 4 — empty-note attribution is paired: empty_note non-null iff
 * empty_note_attr non-null, for each pole. */
function checkEmptyNoteAttr(rows, push) {
    for (const row of rows) {
        const cid = row.contradiction_id;
        for (const pole of ['reconcile', 'discrepancy']) {
            const emptyNote = row[`${pole}_empty_note`];
            const emptyNoteAttr = row[`${pole}_empty_note_attr`];
            const hasNote = emptyNote !== null && emptyNote !== undefined;
            const hasAttr = emptyNoteAttr !== null && emptyNoteAttr !== undefined;
            if (hasNote !== hasAttr) {
                push(cid, 'empty_note_attr', `${pole}_empty_note and ${pole}_empty_note_attr must both be null or both be non-null`);
            }
        }
    }
}

/** §10/§11 check 5 — half-line: blocklist-clean, and names no author from the
 * OPPOSING pole's quotes (retires the id-3 concessive). */
function checkHalfLines(rows, quoteMap, push) {
    for (const row of rows) {
        const cid = row.contradiction_id;
        for (const pole of ['reconcile', 'discrepancy']) {
            const halfLine = row[`${pole}_half_line`];
            if (halfLine === null || halfLine === undefined) continue;

            const blockHit = matchesBlocklist(halfLine);
            if (blockHit) {
                push(cid, 'halfline_blocklist', `${pole}_half_line contains loaded language: "${blockHit}"`);
            }

            const otherPole = pole === 'reconcile' ? 'discrepancy' : 'reconcile';
            const opposingQuotes = quoteMap.get(`${cid}|${otherPole}`) || [];
            const opposingTokens = [];
            for (const q of opposingQuotes) opposingTokens.push(...authorTokensFromAttr(q.attr));
            if (containsAnyToken(halfLine, opposingTokens)) {
                push(cid, 'halfline_opposing_author', `${pole}_half_line names an author from the opposing (${otherPole}) pole`);
            }
        }
    }
}

/** §4.3/§10 check 6 — verse-pair structural checks: ellipsis, ref format +
 * resolution, distinctness, canonical order, word count. */
function checkVersePairs(versePairMap, push) {
    const aliasToBolls = getAliasToBolls();
    for (const [cid, sides] of versePairMap) {
        // vp_ellipsis — U+2026 only; no ASCII "..." or any run of >=2 dots.
        for (const side of sides) {
            if (/\.{2,}/.test(side.snippet)) {
                push(cid, 'vp_ellipsis', `verse-pair ord=${side.ord} snippet uses ASCII dots instead of U+2026: ${JSON.stringify(side.snippet)}`);
            }
        }

        // vp_ref — format + books_map resolution.
        for (const side of sides) {
            const formatOk = typeof side.ref === 'string' && VP_REF_RE.test(side.ref);
            if (!formatOk) {
                push(cid, 'vp_ref', `verse-pair ord=${side.ord} ref fails the citation format (no '/', no ','): ${JSON.stringify(side.ref)}`);
            } else if (!parseRef(side.ref, aliasToBolls)) {
                push(cid, 'vp_ref', `verse-pair ord=${side.ord} book token does not resolve in books_map aliases: ${JSON.stringify(side.ref)}`);
            }
        }

        // vp_distinct — snippets pairwise distinct after norm().
        const normSnippets = sides.map((s) => norm(s.snippet));
        for (let i = 0; i < normSnippets.length; i++) {
            for (let j = i + 1; j < normSnippets.length; j++) {
                if (normSnippets[i] === normSnippets[j]) {
                    push(cid, 'vp_distinct', `verse-pair sides ord=${sides[i].ord} and ord=${sides[j].ord} have identical snippets after normalization`);
                }
            }
        }

        // vp_order — sides sorted by ord must be a proper 0-based index AND
        // non-decreasing by (bolls, chapter, verse) among resolvable sides.
        for (let i = 0; i < sides.length; i++) {
            if (sides[i].ord !== i) {
                push(cid, 'vp_order', `verse-pair ord=${sides[i].ord} at position ${i} is not the 0-based canonical-order index`);
            }
        }
        let prevTuple = null;
        for (const side of sides) {
            const parsed = parseRef(side.ref, aliasToBolls);
            if (!parsed) continue; // already flagged by vp_ref
            const tuple = [parsed.bolls, parsed.chapter, parsed.verse];
            if (prevTuple && compareTuple(prevTuple, tuple) > 0) {
                push(cid, 'vp_order', `verse-pair ord=${side.ord} (${side.ref}) is out of canonical scripture order`);
            }
            prevTuple = tuple;
        }

        // vp_wordcount — snippet < 40 words.
        for (const side of sides) {
            const wc = (side.snippet || '').trim().split(/\s+/).filter(Boolean).length;
            if (wc >= 40) {
                push(cid, 'vp_wordcount', `verse-pair ord=${side.ord} snippet has ${wc} words (>= 40)`);
            }
        }
    }
}

/**
 * validateProjection — the §10 acceptance gate. Pure function, no I/O other
 * than the lazily-cached books_map.json read.
 *
 * @param {{rows: object[], quotes: object[], versePairs: object[], consensusByCid: object}} projection
 * @returns {{ok: boolean, violations: {cid:number, code:string, message:string}[]}}
 */
function validateProjection({ rows = [], quotes = [], versePairs = [], consensusByCid = {} } = {}) {
    const violations = [];
    const push = (cid, code, message) => violations.push({ cid, code, message });

    const quoteMap = groupQuotesByCidPole(quotes);
    const versePairMap = groupVersePairsByCid(versePairs);

    checkAttrHead(quotes, push);
    checkNotes(rows, quoteMap, push);
    checkParity(rows, quoteMap, consensusByCid, push);
    checkEmptyNoteAttr(rows, push);
    checkHalfLines(rows, quoteMap, push);
    checkVersePairs(versePairMap, push);

    return { ok: violations.length === 0, violations };
}

// ---------------------------------------------------------------------------
// CLI mode
// ---------------------------------------------------------------------------

function execToObjects(db, sql) {
    const res = db.exec(sql);
    if (!res.length) return [];
    const { columns, values } = res[0];
    return values.map((row) => {
        const obj = {};
        columns.forEach((c, i) => { obj[c] = row[i]; });
        return obj;
    });
}

/** Load {rows, quotes, versePairs, consensusByCid} from a live DB, or null if
 * the three harmonization_* tables are not (all) present. */
async function loadCliProjection(dbPath) {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(dbPath));
    try {
        const tableNames = new Set(
            execToObjects(db, "SELECT name FROM sqlite_master WHERE type='table'").map((r) => r.name)
        );
        const required = ['harmonization_row', 'harmonization_quote', 'harmonization_verse_pair'];
        if (!required.every((t) => tableNames.has(t))) return null;

        const rows = execToObjects(db, 'SELECT * FROM harmonization_row');
        const quotes = execToObjects(db, 'SELECT * FROM harmonization_quote');
        const versePairs = execToObjects(db, 'SELECT * FROM harmonization_verse_pair');
        const consensusRows = execToObjects(db,
            'SELECT c.id AS id, l.name AS name FROM contradictions c LEFT JOIN scholarly_consensus_levels l ON c.scholarly_consensus_id = l.id');
        const consensusByCid = {};
        for (const r of consensusRows) consensusByCid[r.id] = r.name === undefined ? null : r.name;

        return { rows, quotes, versePairs, consensusByCid };
    } finally {
        db.close(); // read-only: never db.export(), never written back to disk
    }
}

function printReport({ rows, quotes, versePairs }, violations) {
    if (violations.length) {
        const byCid = new Map();
        for (const v of violations) {
            if (!byCid.has(v.cid)) byCid.set(v.cid, []);
            byCid.get(v.cid).push(v);
        }
        const cids = [...byCid.keys()].sort((a, b) => (a ?? -1) - (b ?? -1));
        console.log('Harmonization validation VIOLATIONS:');
        for (const cid of cids) {
            console.log(`  id ${cid}:`);
            for (const v of byCid.get(cid)) {
                console.log(`    - [${v.code}] ${v.message}`);
            }
        }
    } else {
        console.log('Harmonization validation: clean (0 violations).');
    }
    console.log(`rows=${rows.length} quotes=${quotes.length} versePairs=${versePairs.length} violations=${violations.length}`);
}

async function runCli() {
    if (!fs.existsSync(DB_PATH)) {
        console.log(`validateHarmonization: no DB found at ${DB_PATH} — nothing to validate (0 violations).`);
        process.exit(0);
    }
    const projection = await loadCliProjection(DB_PATH);
    if (!projection) {
        console.log('validateHarmonization: no harmonization tables in contradictions.db yet — nothing to validate (0 violations).');
        process.exit(0);
    }
    const { ok, violations } = validateProjection(projection);
    printReport(projection, violations);
    process.exit(ok ? 0 : 1);
}

module.exports = {
    validateProjection,
    reconcileFirstFor,
    RECONCILE_FIRST_LEVELS,
    norm,
    parseRef,
    getAliasToBolls,
    DOSSIER_ATTR_HEAD_RE,
    BLOCKLIST_WORDS,
};

if (require.main === module) {
    runCli().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
