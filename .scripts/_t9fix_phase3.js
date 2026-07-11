/**
 * _t9fix_phase3.js — fix note_lead_source on the 20 JFB rows. The validator
 * tokenizes the baked attr "Jamieson, Fausset & Brown (1871), ..." into
 * {"Jamieson," (with comma), "Fausset", "Brown", full-head}; a bare "Jamieson"
 * in the note matches none. Use the full attribution (contains clean tokens
 * "Fausset"/"Brown"), condensed to <=180. Self-verifies before writing.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DOSS = path.join(ROOT, 'data/harmonization/curation/dossier');
const read = (id) => JSON.parse(fs.readFileSync(path.join(DOSS, `${id}.json`), 'utf8'));
const write = (id, o) => fs.writeFileSync(path.join(DOSS, `${id}.json`), JSON.stringify(o, null, 2) + '\n');
const BLOCK = ['attempt', 'explains away', 'contrived', 'forced', 'of course', 'fatal', 'decisively', 'obviously', 'merely', 'so-called', 'desperate', 'absurd'];

const NOTES = {
    337: "Jamieson, Fausset & Brown treat the chains as Satan's final doom, already decreed but only gradually carried out, leaving him free to roam until then.",
    338: "Jamieson, Fausset & Brown read Ezekiel's threat to cut off both righteous and wicked as the outward calamity of exile, discipline for one and punishment for the other.",
    341: "Jamieson, Fausset & Brown treat the wicked's long life as only apparent, since against eternity even a long life is short, so Job and the wisdom maxims agree.",
    345: "Jamieson, Fausset & Brown note Isaiah, as a faithful historian, simply records the Assyrian officer's crude taunt, not presenting it as God's own pure speech.",
    349: "Jamieson, Fausset & Brown distinguish the law's moral blamelessness, matching Psalm 19:7, from the salvific inadequacy Hebrews 8:7 calls faulty.",
    352: "Jamieson, Fausset & Brown read Paul and James as combating different errors: Paul countering self-justifiers, James countering antinomians who twist faith into inaction.",
    389: "Jamieson, Fausset & Brown concede the third division has only thirteen names, not Matthew's stated fourteen, moving the boundary from Jeconiah to Josiah.",
    421: "Jamieson, Fausset & Brown read 'treat him as a publican' as invoking the Jews' own convention for outsiders, not Jesus's personal verdict on tax collectors.",
    427: "Jamieson, Fausset & Brown argue the exception lies in the sinner's settled rejection, not sin's nature, since Matthew 12:31 itself calls all sin forgivable.",
    443: "Jamieson, Fausset & Brown argue Jesus was not disclaiming his goodness but redirecting the rich young ruler to recognize the divine identity behind that title.",
    453: "Jamieson, Fausset & Brown read Matthew 10:23's coming of the Son of man as the imminent AD70 judgment on Jerusalem, not the final end, parallel with 24:14.",
    457: "Jamieson, Fausset & Brown read John 12:27 as a genuine plea paralleling Gethsemane's, resolved in the same verse into submission, not a rejection of the prayer.",
    505: "Jamieson, Fausset & Brown deny any basis for identifying Luke's unnamed sinful woman with a named figure, keeping her distinct from John's Mary of Bethany.",
    507: "Jamieson, Fausset & Brown read Jesus's reply as ranking spiritual blessedness above Mary's motherhood, not stripping the honor Gabriel and Elisabeth gave her.",
    508: "Jamieson, Fausset & Brown confine Luke's \"wiser\" to shrewd self-interest that never touches eternity, unlike the God-ward wisdom James commends.",
    523: "Jamieson, Fausset & Brown distinguish Hebrews' apostates, only partly renewed, from the truly elect whom John 10:28 says can never finally fall away.",
    525: "Jamieson, Fausset & Brown read Jesus's remark as faulting insufficient follow-up questioning, not denying Peter and Thomas had spoken up earlier.",
    571: "Jamieson, Fausset & Brown read the three days and nights as inclusive Jewish reckoning, where any part of a day counts whole, so Friday through Sunday fits.",
    578: "Jamieson, Fausset & Brown distinguish righteous, other-directed indignation, even Christlike, from the self-indulgent passion the wisdom books and James condemn.",
    581: "Jamieson, Fausset & Brown read Matthew 6:7's ban on vain repetitions as targeting hollow, mechanical babbling, not the faith-filled asking Luke's parables commend.",
};

const fails = [];
for (const [id, note] of Object.entries(NOTES)) {
    const bad = [];
    if (note.length > 180) bad.push(`len ${note.length}`);
    if (!/\.$/.test(note)) bad.push('no final period');
    if (note !== note.trim()) bad.push('untrimmed');
    if (note.includes('. ')) bad.push('interior ". "');
    for (const w of BLOCK) if (new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(note)) bad.push(`blocklist "${w}"`);
    // note_lead_source proxy: must contain a clean surname token from the JFB attr.
    if (!/\bFausset\b/.test(note) && !/\bBrown\b/.test(note)) bad.push('no recognized author token');
    if (bad.length) { fails.push(`note ${id}: ${bad.join('; ')}  [${note.length}c]`); continue; }
    const d = read(id); d.reconcile.note = note; write(id, d);
}
if (fails.length) { console.log('FAILURES (not written):\n' + fails.join('\n')); process.exit(1); }
console.log(`Phase 3 applied: ${Object.keys(NOTES).length} JFB notes — all <=180, register-clean, carry a recognized author token.`);
