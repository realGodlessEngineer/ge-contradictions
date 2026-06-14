// buildScholarshipTables.js
// Parse contradictions.scholarship into normalised tables:
//   scholarship_sources(id, author, title, publication, year, bib_core, dedup_key UNIQUE, raw_example)
//   contradiction_scholarship(id, contradiction_id, source_id, citation_order, pages, note, raw_citation)
//
// DRY_RUN=1  -> parse only; write data/scholarship_parse_preview.json + print stats/flags. No DB writes.
// (default)  -> create tables, dedup sources, insert junction rows. Writes a timestamped .bak first.
//
// Idempotent-ish: a normal run DROPs and rebuilds the two derived tables, so re-running
// after a parser change just regenerates them. The source contradictions.scholarship text
// is never modified.

const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const { splitCitations, parseCitation, looksLikeNote } = require('./scholarshipParser');
const { annotationRefs } = require('./bibleBooks');

const DB_PATH = path.join(__dirname, '..', 'contradictions.db');
const PREVIEW_PATH = path.join(__dirname, '..', 'data', 'scholarship_parse_preview.json');
const DRY_RUN = process.env.DRY_RUN === '1';

function flagsFor(citation, parsed) {
    const f = [];
    if (!parsed.year) f.push('no-year');
    if (citation.length > 320) f.push('very-long');
    if (citation.length < 12) f.push('very-short');
    if ((citation.match(/\*/g) || []).length > 2) f.push('multi-title');
    // a real citation almost always has a comma (author, title) — flag if none
    if (!citation.includes(',')) f.push('no-comma');
    return f;
}

async function main() {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(DB_PATH));

    const res = db.exec(
        "SELECT id, scholarship FROM contradictions WHERE scholarship IS NOT NULL AND TRIM(scholarship) <> '' ORDER BY id"
    );
    const rows = res.length ? res[0].values : [];

    const preview = [];
    const dedup = new Map(); // dedupKey -> {sourceId placeholder, parsed, count}
    let totalCitations = 0;
    let skippedNotes = 0;
    const droppedNotes = [];
    const allFlags = {};
    const flaggedRows = [];

    for (const [id, scholarship] of rows) {
        const citations = splitCitations(scholarship).filter(c => {
            if (looksLikeNote(c)) { skippedNotes++; droppedNotes.push({ id, note: c }); return false; }
            return true;
        });
        const parsedList = citations.map((c, i) => {
            const p = parseCitation(c);
            const flags = flagsFor(c, p);
            for (const fl of flags) allFlags[fl] = (allFlags[fl] || 0) + 1;
            if (!dedup.has(p.dedupKey)) dedup.set(p.dedupKey, { parsed: p, count: 0 });
            dedup.get(p.dedupKey).count++;
            const refs = annotationRefs(p.raw, p.note);
            return { order: i + 1, ...p, bibleRefs: refs.length ? refs.join(', ') : null, flags };
        });
        totalCitations += citations.length;
        const rowFlags = [...new Set(parsedList.flatMap(p => p.flags))];
        if (rowFlags.length) flaggedRows.push({ id, count: citations.length, flags: rowFlags });
        preview.push({ id, citationCount: citations.length, citations: parsedList, original: scholarship });
    }

    const uniqueSources = dedup.size;
    const citationsWithRefs = preview.reduce((n, r) => n + r.citations.filter(c => c.bibleRefs).length, 0);
    console.log('=== Scholarship parse summary ===');
    console.log('rows with scholarship :', rows.length);
    console.log('total citations parsed:', totalCitations);
    console.log('embedded notes skipped:', skippedNotes);
    console.log('avg citations / row   :', (totalCitations / rows.length).toFixed(2));
    console.log('unique sources (dedup):', uniqueSources, `(${(100 * (1 - uniqueSources / totalCitations)).toFixed(1)}% dedup)`);
    console.log('citations w/ bible_refs:', citationsWithRefs);
    console.log('flag counts           :', allFlags);
    console.log('flagged rows          :', flaggedRows.length);

    // distribution of citation counts
    const dist = {};
    for (const p of preview) dist[p.citationCount] = (dist[p.citationCount] || 0) + 1;
    console.log('citations-per-row dist:', dist);

    if (DRY_RUN) {
        fs.mkdirSync(path.dirname(PREVIEW_PATH), { recursive: true });
        fs.writeFileSync(PREVIEW_PATH, JSON.stringify({ summary: { rows: rows.length, totalCitations, uniqueSources, skippedNotes, allFlags }, droppedNotes, flaggedRows, preview }, null, 2));
        console.log('\nDRY RUN: wrote', path.relative(__dirname, PREVIEW_PATH), '- inspect before a real run.');
        db.close();
        return;
    }

    // --- REAL RUN: build tables ---
    const archiveDir = path.join(path.dirname(DB_PATH), '.archive');
    fs.mkdirSync(archiveDir, { recursive: true });
    const bak = path.join(archiveDir, `${path.basename(DB_PATH)}.bak-${stamp()}`);
    fs.copyFileSync(DB_PATH, bak);
    console.log('\nBackup written:', path.basename(bak));

    db.run('BEGIN');
    try {
        db.run('DROP TABLE IF EXISTS contradiction_scholarship');
        db.run('DROP TABLE IF EXISTS scholarship_sources');
        db.run(`CREATE TABLE scholarship_sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT, title TEXT, publication TEXT, year INTEGER,
            bib_core TEXT NOT NULL, dedup_key TEXT NOT NULL UNIQUE, raw_example TEXT
        )`);
        db.run(`CREATE TABLE contradiction_scholarship (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contradiction_id INTEGER NOT NULL,
            source_id INTEGER NOT NULL,
            citation_order INTEGER,
            pages TEXT, note TEXT, bible_refs TEXT, raw_citation TEXT NOT NULL,
            FOREIGN KEY (contradiction_id) REFERENCES contradictions(id),
            FOREIGN KEY (source_id) REFERENCES scholarship_sources(id)
        )`);
        db.run('CREATE INDEX idx_cs_contradiction ON contradiction_scholarship(contradiction_id)');
        db.run('CREATE INDEX idx_cs_source ON contradiction_scholarship(source_id)');

        // insert deduped sources, recording assigned ids by dedupKey
        const idByKey = new Map();
        const insSrc = db.prepare(
            'INSERT INTO scholarship_sources (author, title, publication, year, bib_core, dedup_key, raw_example) VALUES (?,?,?,?,?,?,?)'
        );
        for (const [key, { parsed }] of dedup) {
            insSrc.run([parsed.author, parsed.title, parsed.publication, parsed.year, parsed.bibCore, key, parsed.raw]);
            const rid = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
            idByKey.set(key, rid);
        }
        insSrc.free();

        const insJ = db.prepare(
            'INSERT INTO contradiction_scholarship (contradiction_id, source_id, citation_order, pages, note, bible_refs, raw_citation) VALUES (?,?,?,?,?,?,?)'
        );
        let jCount = 0;
        for (const row of preview) {
            for (const c of row.citations) {
                insJ.run([row.id, idByKey.get(c.dedupKey), c.order, c.pages, c.note, c.bibleRefs, c.raw]);
                jCount++;
            }
        }
        insJ.free();

        db.run('COMMIT');
        console.log(`Inserted ${dedup.size} sources, ${jCount} citation links.`);
    } catch (err) {
        db.run('ROLLBACK');
        console.error('Build failed, rolled back:', err);
        db.close();
        process.exit(1);
    }

    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
    db.close();
    console.log('Wrote', path.basename(DB_PATH));
}

function stamp() {
    // avoid Date.now()/new Date() concerns — use a process-time based stamp
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

main().catch(err => { console.error(err); process.exit(1); });
