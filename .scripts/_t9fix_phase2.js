/**
 * _t9fix_phase2.js — authoring repairs for note_register + vp_wordcount.
 * Condensed reconcile notes (<=180, one sentence, keep the lead surname) and
 * tightened verse-pair snippets (<40 words, still a verbatim WEB substring).
 * Self-verifies every register + verbatim rule before writing; reports failures.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOSS = path.join(ROOT, 'data/harmonization/curation/dossier');
const read = (id) => JSON.parse(fs.readFileSync(path.join(DOSS, `${id}.json`), 'utf8'));
const write = (id, o) => fs.writeFileSync(path.join(DOSS, `${id}.json`), JSON.stringify(o, null, 2) + '\n');

const BLOCK = ['attempt', 'explains away', 'contrived', 'forced', 'of course', 'fatal', 'decisively', 'obviously', 'merely', 'so-called', 'desperate', 'absurd'];

const NOTES = {
    35: "Gill distinguishes sinless righteousness, which Ecclesiastes denies of all but Christ, from the imputed righteousness by which scripture still calls other men just.",
    37: "Gill reads Noah's righteousness as imputed through faith rather than self-earned, so calling him righteous does not conflict with denying anyone is righteous by works.",
    61: "Jamieson, Fausset, and Brown read Exodus's four hundred thirty years as spanning Abraham's whole sojourn from Canaan onward, not just the time actually spent in Egypt.",
    85: "Clarke resolves Anah's shifting identity textually, following the Samaritan, Septuagint, and Syriac readings that render 'son' for the Masoretic 'daughter'.",
    148: "Clarke harmonizes the penalties by intent: Leviticus 15:24's seven-day impurity covers an unwitting encounter, while Leviticus 20:18's karet penalty covers willful intercourse.",
    253: "Jamieson, Fausset & Brown reconcile the totals: Chronicles' Israel figure folds in the army Samuel excluded, and Samuel's Judah figure adds a frontier force Chronicles omitted.",
    261: "Keil & Delitzsch, following Michaelis, read the two overseer totals as one workforce classified differently, since both figures sum to 3,850.",
    262: "Jamieson, Fausset & Brown harmonize the clash by recomputing Josephus's 592-year span through the wilderness, Joshua, Saul, and David to near the Kings figure.",
    399: "Gill argues Matthew's transition markers mark the true chronological order, while Luke's arrangement narrates events without regard to sequence, so no real contradiction results.",
    401: "Matthew Henry reads Matthew 4:10's demand for exclusive worship as governing the soul, while the household codes' call to obey masters concerns only delegated, bodily authority.",
    402: "Matthew Henry distinguishes an earlier acquaintance with Jesus under John the Baptist from the formal call to discipleship that Matthew and Mark record after John's imprisonment.",
    403: "Matthew Henry argues Luke's healing-then-call order is topical, not chronological, since the catch and call in Luke 5 actually preceded the healing, matching Matthew and Mark.",
    404: "Gill reads the Gospel accounts as stages: an initial acquaintance with Jesus through John the Baptist's testimony, then his formal call to discipleship at the Sea of Galilee.",
    492: "Henry reads 'not yet given' as one of degree, not the Spirit's first appearance, distinguishing Pentecost's fuller outpouring from earlier fillings like Zacharias and Elizabeth's.",
    592: "Gill notes the call in Genesis 12:1 named no destination, so Abram's ignorance was at the call itself, before Genesis 12:5 shows him en route with Canaan as his known goal.",
    593: "Clarke ties Romans 4:19's dead-body language to Isaac's birth, then argues Genesis 25's Keturah sons are recorded out of order, born before rather than after that miraculous birth.",
    594: "The Geneva Bible annotators call this a synecdoche: the promise was certain and counted as Abraham's own though his descendants took physical possession long after his death.",
    596: "Gill reads friendship as the status Christ's death produces, not a prior condition, so those John calls friends were, until that death, the enemies Paul describes in Romans.",
    597: "Jamieson, Fausset & Brown and Clarke read the two claims in different domains: Jewish law could pronounce Jesus worthy of death, but only Rome could carry out an execution.",
    598: "Matthew Henry reads Proverbs' earthly recompense as partial, not final, so the incompleteness of temporal justice points forward to the fuller reckoning at the last judgment.",
    599: "Keil and Delitzsch treat Ecclesiastes' silence about the dead as an unfinished stage of Old Testament revelation that the New Testament later clarifies and completes.",
    600: "Matthew Henry and Jamieson, Fausset and Brown read Christ's light burden as inward rest amid genuine hardship, not a promise that discipleship escapes suffering or persecution.",
    601: "Gill limits Jesus's woe to praise bought by compromise with bad men, excepting the good word of good men, leaving the wisdom tradition's esteem for a good name untouched.",
};

// key `id:side` -> new snippet (ellipsis = U+2026)
const SNIPS = {
    '156:0': "there shall no razor come on his head… He shall let the locks of the hair of his head grow long.",
    '207:0': "struck the pin into his temples, and it pierced through into the ground; for he was in a deep sleep; so he swooned and died.",
    '208:1': "if there be dew on the fleece only, and it be dry on all the ground, then shall I know that you will save Israel by my hand",
    '295:1': "Like him was there no king before him… neither after him arose there any like him.",
    '297:0': "Therefore, behold, I will gather you to your fathers, and you shall be gathered to your grave in peace, neither shall your eyes see all the evil which I will bring on this place.",
    '298:1': "He shall have none to sit on the throne of David; and his dead body shall be cast out in the day to the heat, and in the night to the frost.",
    '582:1': "You shall remember that you were a servant in the land of Egypt… therefore Yahweh your God commanded you to keep the Sabbath day.",
    '584:1': "If brothers dwell together, and one of them die, and have no son… her husband's brother shall go in to her, and take her to him as wife, and perform the duty of a husband's brother to her.",
};

const fails = [];

// --- notes ---
for (const [id, note] of Object.entries(NOTES)) {
    const bad = [];
    if (note.length > 180) bad.push(`len ${note.length}`);
    if (!/\.$/.test(note)) bad.push('no final period');
    if (note !== note.trim()) bad.push('untrimmed');
    if (note.includes('. ')) bad.push('interior ". "');
    for (const w of BLOCK) if (new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(note)) bad.push(`blocklist "${w}"`);
    if (bad.length) { fails.push(`note ${id}: ${bad.join('; ')}`); continue; }
    const d = read(id); d.reconcile.note = note; write(id, d);
}

// --- snippets ---
const norm = (s) => (s || '').normalize('NFC').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/-{2,}/g, '-').replace(/\s+([;:,.!?])/g, '$1').replace(/\s+/g, ' ').trim();
for (const [key, snip] of Object.entries(SNIPS)) {
    const [id, si] = key.split(':').map(Number);
    const d = read(id);
    const side = d.versePair.sides[si];
    const wc = snip.trim().split(/\s+/).filter(Boolean).length;
    const hay = norm(side.verseText);
    const frags = snip.split(/\s*…\s*/).filter((f) => f.trim());
    const absent = frags.filter((f) => !hay.includes(norm(f)));
    const bad = [];
    if (wc >= 40) bad.push(`wc ${wc}`);
    if (/\.{2,}/.test(snip)) bad.push('ascii dots');
    if (absent.length) bad.push(`not verbatim: ${absent.map((a) => a.slice(0, 40)).join(' || ')}`);
    if (bad.length) { fails.push(`snip ${key}: ${bad.join('; ')}`); continue; }
    side.snippet = snip; write(id, d);
}

if (fails.length) { console.log('FAILURES (not written):\n' + fails.join('\n')); process.exit(1); }
console.log(`Phase 2 applied: ${Object.keys(NOTES).length} notes + ${Object.keys(SNIPS).length} snippets — all pass register/verbatim self-check.`);
