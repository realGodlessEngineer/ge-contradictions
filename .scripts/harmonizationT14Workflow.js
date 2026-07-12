export const meta = {
  name: 'harmonization-t14-class',
  description: 'Tier-2: source a VERBATIM general-critic passage about the documented CLASS a residual contradiction instantiates (not the specific verse), with a scope-honest note; a mandatory auditor phase rejects any note that overclaims specific-verse engagement.',
  phases: [
    { title: 'Source', detail: 'Sonnet subagents place a verbatim class/mechanism quote + scoped note on the discrepancy pole', model: 'sonnet' },
    { title: 'Audit', detail: 'Auditor subagents reject any note that overclaims specific-verse engagement the quote does not support', model: 'sonnet' },
  ],
}

// --- inputs (tolerate args as JSON string OR object) ---
const A = typeof args === 'string' ? JSON.parse(args) : (args || {})
const IDS = A.ids || []
const CHUNK = A.chunkSize || 6
if (!IDS.length) { log('args.ids is empty — pass { ids:[...] } from _t14_worklist.json'); return { authored: [], flagged: [] } }

const chunks = []
for (let i = 0; i < IDS.length; i += CHUNK) chunks.push(IDS.slice(i, i + CHUNK))
log(`T14 class-sourcing: ${IDS.length} ids in ${chunks.length} chunk(s) of <=${CHUNK} — local Sonnet 5, offline against the pre-fetched well corpus`)

const SOURCE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    authored: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { id: { type: 'integer' }, cls: { type: 'string' }, well: { type: 'string' } }, required: ['id', 'cls', 'well'] } },
    honestAbsence: { type: 'array', items: { type: 'integer' } },
    flagged: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { id: { type: 'integer' }, reason: { type: 'string' } }, required: ['id', 'reason'] } },
    notes: { type: 'string' },
  },
  required: ['authored', 'honestAbsence', 'flagged'],
}

const CLASS_CODEBOOK = `DOCUMENTED CLASSES (a mechanism a PD critic states as a GENERAL principle; route to the named critic's corpus):
- CHRONICLER — the Chronicler systematically rewrote/idealized the older Samuel-Kings narrative (numbers, genealogies, cultic detail, theology). Critic: Wellhausen (wellhausen-prolegomena, esp. his 'Chronicles'/the-Chronicler sections); also Colenso, De Wette. Use for: any Chronicles-vs-Samuel/Kings/Ezra divergence, or a Chronicles-internal seam.
- CENSUS_NUMBERS — the Pentateuch's census/army/population/tabernacle/Levitical figures are internally impossible or self-contradictory. Critic: Colenso (colenso-pentateuch-examined + vols 2-5 — this IS his method). Use for: Exodus/Numbers population & army counts, priestly arithmetic, encampment logistics.
- DOUBLET — the Pentateuch interweaves two parallel sources (Elohist/Jehovist, Priestly/Jehovist) yielding duplicate and divergent accounts. Critic: Wellhausen; Colenso vol.2. Use for: the two creation accounts, the two flood strands, the wife-sister repetitions, Sinai-vs-Horeb, duplicate namings/etiologies.
- LAW_CODE — the legal/cultic prescriptions differ across the codes (Covenant vs Deuteronomic vs Priestly). Critic: Wellhausen. Use for: divergent festival/sacrifice/priestly/tithe law.
- GENEALOGY_VARIATION — parallel genealogies or name/number lists disagree. Critic: Colenso; Wellhausen. Use for: divergent genealogies, son-vs-grandson, name/spelling/number list conflicts.
- GOSPEL_PARALLEL — the Gospels' parallel accounts diverge by design (nativity, genealogy, miracle order/detail, passion, resurrection). Critic: Strauss (strauss-life-of-jesus); Remsburg; Cassels. Use for: Synoptic-vs-John or inter-Synoptic narrative divergence.`

const SOURCE_RULES = `You are doing TIER-2 "class/mechanism" sourcing for the harmonization discrepancy pole. Tier-1 already tried and FAILED to find a PD critic who presses each of YOUR rows as a SPECIFIC verse-pair contradiction. Your job is different and more subtle: place a VERBATIM general-critic passage about the documented CLASS the contradiction instantiates, with a note that HONESTLY scopes it as a general principle applied to this instance. This is legitimate scholarly synthesis — but it becomes MISATTRIBUTION (the #1 red line) the instant your note or attr implies the critic addressed THIS specific verse pair. A downstream auditor WILL reject any overclaim, and the verbatim gate WILL reject any non-verbatim quote. Both waste the row.

${CLASS_CODEBOOK}

PER ID:
1. READ its bundle: data/harmonization/curation/_t10bundles/bundle_<id>.json (question, summary, the two verseRefs, parityTarget, well[] with each source's corpusFile).
2. CLASSIFY: from the verseRefs + question, decide which ONE documented class above this contradiction is a genuine instance of. If it fits NO documented class (e.g. a one-off NT thematic tension no critic generalizes about), STOP -> honest-absence (step 7). Do NOT force a class.
3. LOCATE (offline): Grep the class's critic corpusFile(s) for the GENERAL statement of the mechanism (e.g. for CHRONICLER: grep wellhausen for "Chronicler", "in Chronicles", numbers/genealogy revision; for CENSUS_NUMBERS: grep colenso for the impossibility of the figures). You are NOT looking for this verse pair — you are looking for the critic stating the CLASS.
4. CONFIRM two things by Reading the surrounding lines: (a) the passage really states the class as a general principle in the critic's own words; (b) THIS row's verse pair is a true instance of that class (same mechanism, same kind of divergence). If either fails, honest-absence.
5. EXTRACT verbatim: copy a contiguous run (or two runs joined by a single U+2026 '…') of the critic's GENERAL statement, character-for-character from the corpusFile (<= 70 words). Keep OCR/spelling exactly as in the file — do NOT "correct" it.
5b. SELF-VERIFY (MANDATORY): Grep the corpusFile for a distinctive literal ~6-10 word substring of EACH fragment. No hit = you drifted; re-copy exactly or drop to honest-absence. A quote that is not a literal Grep hit WILL fail the re-fetch gate.
6. AUTHOR: READ data/harmonization/curation/dossier/<id>.json and REPLACE its entire "discrepancy": { ... } object (leave "reconcile" and "versePair" byte-untouched) with:
   "discrepancy": {
     "note": "<one sentence, <=180 chars, ends '.', no interior '. ', names the critic's surname, and SCOPES the quote as general: state the CLASS and mark this row as an instance, e.g. 'Wellhausen treats the Chronicler's numbers as a systematic revision of the older Samuel-Kings figures, of which this divergence is one instance.' NEVER assert the critic discussed the specific verses.>",
     "halfLine": null, "emptyNote": null, "emptyNoteAttr": null,
     "quotes": [
       {
         "text": "<the verbatim GENERAL-class quote from step 5>",
         "attr": "<Author (d. YYYY), Work (year), on <THE CLASS/TOPIC — NOT the specific verse>.>  MUST contain a parenthesized run with a digit; the 'on ...' tail names the class, e.g. \\"Julius Wellhausen (d. 1918), Prolegomena to the History of Israel (1885), on the Chronicler's revision of the Samuel-Kings numbers.\\">",
         "voice": null,
         "href": "<the chosen well source_url>",
         "source": { "kind": "hand", "url": "<same source_url>", "well": "<wellKey>" }
       }
     ]
   }
   Provide EXACTLY parityTarget quotes (>=1). If parityTarget>1 you may pair the class quote with a second verbatim passage (same or different well critic) that ALSO states the class — each independently verbatim, each with its own class-scoped attr. Blocklist (NOTE only, whole-word, never): attempt, explains away, contrived, forced, of course, fatal, decisively, obviously, merely, so-called, desperate, absurd.
7. HONEST-ABSENCE: if the row fits no documented class, or no critic states the class in verbatim prose, or the class doesn't genuinely cover this instance — leave the dossier UNTOUCHED and add {id, reason} to flagged + id to honestAbsence. This is the correct outcome for genuinely idiosyncratic rows (they route to Tier-3 waive). Honest absence beats a stretched class.

TOOLS: Grep + Read on the local corpusFile, Edit on the dossier. No WebFetch/WebSearch needed (corpus is local). Return: authored=[{id,cls,well}] you gave >=1 verbatim class quote; honestAbsence=[ids]; flagged=[{id,reason}]; notes.`

const AUDIT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          id: { type: 'integer' },
          scopeHonest: { type: 'boolean' },
          classFits: { type: 'boolean' },
          verdict: { type: 'string', enum: ['keep', 'reject'] },
          reason: { type: 'string' },
        },
        required: ['id', 'scopeHonest', 'classFits', 'verdict', 'reason'],
      },
    },
  },
  required: ['verdicts'],
}

const AUDIT_RULES = `You are the SCOPE-HONESTY auditor for Tier-2 "class/mechanism" harmonization sourcing. Each id you receive was just given a VERBATIM general-critic quote about a documented CLASS (e.g. "the Chronicler systematically revised the older numbers"), used to represent the discrepancy pole of a SPECIFIC contradiction the critic did NOT necessarily address by verse. That substitution is LEGITIMATE only if the note honestly presents the quote as a GENERAL principle applied to this instance. Your job is to catch the one failure mode that turns it into MISATTRIBUTION (the project's #1 red line): a note or attr that implies the critic discussed THIS specific verse pair, or a class that does not genuinely cover this row.

PER ID:
1. READ data/harmonization/curation/dossier/<id>.json (the discrepancy note + quote text + attr) AND its bundle data/harmonization/curation/_t10bundles/bundle_<id>.json (question + the two verseRefs).
2. JUDGE two things:
   - scopeHonest: does the NOTE present the quote as a GENERAL/class statement (e.g. "...of which this is one instance", "Wellhausen treats the class of...")? It is DISHONEST (scopeHonest=false) if the note or attr asserts or strongly implies the critic addressed the specific verses/pair (e.g. "Wellhausen shows 2 Chron 8:10 contradicts 1 Kings 9:23"), or if the quote itself actually names the specific verses making it fine — but a GENERAL quote wrapped in a SPECIFIC claim is the violation.
   - classFits: is THIS row's verse pair a genuine instance of the class the quote describes? Reject (classFits=false) if the class is a stretch (e.g. a Gospel-nativity quote used for an OT-numbers row, or "the Chronicler revised numbers" used where neither verse is in Chronicles).
3. VERDICT: 'keep' only if scopeHonest AND classFits are BOTH true; otherwise 'reject' with a one-line reason. When in doubt, REJECT — a rejected row falls back to honest-absence (Tier-3 waive), which is safe; a kept overclaim ships misattribution, which is not.

Do NOT edit any file. Return verdicts=[{id, scopeHonest, classFits, verdict, reason}] for every id you were given.`

// ---------------------------------------------------------------
// Phase 1 — class sourcing
// ---------------------------------------------------------------
phase('Source')
const srcResults = await parallel(chunks.map((chunk) => () =>
  agent(
    `${SOURCE_RULES}\n\nYOUR IDS: ${chunk.join(', ')}`,
    { label: `t14src:${chunk[0]}..${chunk[chunk.length - 1]}`, phase: 'Source', schema: SOURCE_SCHEMA, agentType: 'biblical-contradiction-scholar-sonnet', model: 'sonnet', effort: 'medium' }
  )
))
const srcOk = srcResults.filter(Boolean)
const authored = srcOk.flatMap((r) => r.authored || [])
const authoredIds = authored.map((a) => a.id)
const honestAbsence = srcOk.flatMap((r) => r.honestAbsence || [])
const srcFlagged = srcOk.flatMap((r) => r.flagged || [])
log(`T14 source done: authored ${authoredIds.length}/${IDS.length}; honest-absence ${honestAbsence.length}; source dead chunks ${srcResults.length - srcOk.length}`)

// ---------------------------------------------------------------
// Phase 2 — scope-honesty audit of the authored ids
// ---------------------------------------------------------------
let auditRejected = []
let verdicts = []
if (authoredIds.length) {
  phase('Audit')
  const auditChunks = []
  for (let i = 0; i < authoredIds.length; i += CHUNK) auditChunks.push(authoredIds.slice(i, i + CHUNK))
  const auditResults = await parallel(auditChunks.map((chunk) => () =>
    agent(
      `${AUDIT_RULES}\n\nYOUR IDS: ${chunk.join(', ')}`,
      { label: `t14audit:${chunk[0]}..${chunk[chunk.length - 1]}`, phase: 'Audit', schema: AUDIT_SCHEMA, agentType: 'biblical-scholar-auditor', model: 'sonnet', effort: 'medium' }
    )
  ))
  verdicts = auditResults.filter(Boolean).flatMap((r) => r.verdicts || [])
  auditRejected = verdicts.filter((v) => v.verdict === 'reject').map((v) => v.id)
  log(`T14 audit done: ${verdicts.length} verdicts; rejected ${auditRejected.length} (${auditRejected.join(', ') || 'none'})`)
}

return {
  requested: IDS.length,
  authored,
  authoredIds,
  honestAbsence,
  flagged: srcFlagged,
  auditVerdicts: verdicts,
  auditRejected,
  chunks: chunks.length,
}
