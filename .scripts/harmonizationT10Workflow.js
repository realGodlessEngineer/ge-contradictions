export const meta = {
  name: 'harmonization-t10',
  description: 'Hand-source verbatim PD critic quotes onto the discrepancy (leaning) pole from the pre-fetched well corpus, via local Sonnet 5 subagents; gate re-verifies verbatim.',
  phases: [
    { title: 'Source', detail: 'Sonnet subagents extract verbatim PD critic quotes from the local well corpus into dossier discrepancy poles', model: 'sonnet' },
  ],
}

// --- inputs (tolerate args as JSON string OR object) ---
const A = typeof args === 'string' ? JSON.parse(args) : (args || {})
const IDS = A.ids || []
const CHUNK = A.chunkSize || 6
if (!IDS.length) { log('args.ids is empty — pass { ids:[...] } from _t10bundles/manifest.json'); return { idsDone: [], flagged: [] } }

const chunks = []
for (let i = 0; i < IDS.length; i += CHUNK) chunks.push(IDS.slice(i, i + CHUNK))
log(`T10 sourcing: ${IDS.length} ids in ${chunks.length} chunk(s) of <=${CHUNK} — local Sonnet 5, offline against the pre-fetched well corpus`)

const RETURN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    authored: { type: 'array', items: { type: 'integer' } },
    honestAbsence: { type: 'array', items: { type: 'integer' } },
    flagged: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { id: { type: 'integer' }, reason: { type: 'string' } }, required: ['id', 'reason'] } },
    webCalls: { type: 'integer' },
    notes: { type: 'string' },
  },
  required: ['authored', 'honestAbsence', 'flagged'],
}

const RULES = `You are hand-sourcing VERBATIM public-domain (PD) critic quotes for T10. For each id in YOUR IDS you place a real critic's own words on the DISCREPANCY pole of its dossier so count-parity holds. This is the #1 red-line task: NEVER fabricate, paraphrase-as-quote, or guess a quote. Every quote is re-fetched from its live PD source by a gate (verifyHandQuotes.py) and any non-verbatim quote is rejected and reverted — a fabricated or "close enough" quote WASTES the row. Copy character-for-character from the local corpus, nothing else.

PER ID:
1. READ its bundle: data/harmonization/curation/_t10bundles/bundle_<id>.json. It has: question, summary, the two verseRefs (the WHAT of the contradiction), parityTarget (how many critic quotes the pole needs — usually 1), machineSkeptic (a STARTING POINT ONLY — usually a modern, non-PD name; do NOT quote it), and well[] = the AVAILABLE PD critic sources, each with {wellKey, author, work, year, pd_edition, source_url, corpusFile, scope}.

2. ROUTE: from the question/summary/verseRefs, choose the 1-2 well sources whose scope best fits (OT numbers/genealogy/law/prophets → paine / troki / ingersoll; Gospels & historical Jesus → strauss / renan-life-of-jesus / renan-the-apostles / schweitzer / cassels / remsburg; whole-Bible → paine / ingersoll).

3. LOCATE (offline): Grep the chosen corpusFile(s) for distinctive terms — the book names in verseRefs (e.g. "Ezra", "Nehemiah"), proper nouns/numbers from the question. Case-insensitive. If NOTHING in any candidate corpus actually engages THIS contradiction, STOP — this is honest-absence (see step 7). Do NOT stretch an unrelated passage to fit.

4. CONFIRM: Read the surrounding lines (Read with offset/limit around the Grep hit) and confirm the critic is really pressing THIS contradiction (the same two verses / the same tension in the question), not merely mentioning a book.

5. EXTRACT verbatim: copy a contiguous run of the critic's prose (or two runs joined by a single U+2026 '…' ellipsis — NEVER "..."), character-for-character from the corpusFile — same spelling, punctuation, capitalization. Keep it focused (roughly <= 70 words). Do NOT normalize, modernize, or "correct" anything (e.g. keep Roman numerals like "xxiv. 16", keep archaic spelling). You are copying from a file you just read, so it is verbatim by construction — do not retype from memory.

5b. SELF-VERIFY (MANDATORY — this is exactly why prior quotes were rejected): after composing your quote, Grep the corpusFile for a distinctive literal ~6-10 word substring of EACH fragment you copied (for '…'-joined quotes, verify BOTH fragments separately). If Grep does not return a hit, you PARAPHRASED or drifted — go back and copy the EXACT words from the file, or drop the quote and mark honest-absence. A quote that is not a literal Grep hit in its corpusFile WILL fail the re-fetch gate and waste the row. Do not author a quote you have not just grep-confirmed.

6. AUTHOR: READ data/harmonization/curation/dossier/<id>.json and REPLACE its entire "discrepancy": { ... } object (leave "reconcile" and "versePair" byte-untouched) with:
   "discrepancy": {
     "note": "<one sentence, <=180 chars, ends '.', no interior '. ', no date/citation tail, names the critic's surname, condenses the objection in YOUR words (NOT a slice of the quote), blocklist-clean>",
     "halfLine": null,
     "emptyNote": null,
     "emptyNoteAttr": null,
     "quotes": [
       {
         "text": "<the verbatim quote from step 5>",
         "attr": "<Author (d. YYYY), Work, Part (year), ch., on <Ref>.>  — MUST contain a parenthesized run with a digit so it parses a dated head; e.g. \\"Thomas Paine (d. 1809), The Age of Reason, Part II (1795), ch. I, on Ezra 2 and Nehemiah 7.\\">",
         "voice": null,
         "href": "<the chosen well source_url>",
         "source": { "kind": "hand", "url": "<same source_url>", "well": "<wellKey>" }
       }
     ]
   }
   Provide EXACTLY parityTarget quotes (>=1). If parityTarget is 0, one quote is still fine. Multiple quotes may come from the same or different well critics; each must be independently verbatim and each needs its own attr/href/source. The blocklist (never, whole-word, case-insensitive, applies to the NOTE only): attempt, explains away, contrived, forced, of course, fatal, decisively, obviously, merely, so-called, desperate, absurd.

7. HONEST-ABSENCE: if no available well critic verifiably engages THIS contradiction, do NOT invent one and do NOT force a modern/non-PD name. Leave the discrepancy pole exactly as the bundle's existingDiscrepancy shows (do not edit the file) and add {id, reason:"no PD well critic engages <verseRefs>"} to flagged and to honestAbsence. This is the correct, honest outcome for the long tail — a deferred parity row is far better than a fake quote.

TOOLS: use Grep + Read on the local corpusFile and Edit on the dossier. You should NOT need WebFetch/WebSearch (the corpus is local and pre-verified); use them ONLY to disambiguate whether a critic engages a passage, never as a quote source. Report webCalls = total WebFetch+WebSearch you made (expected 0).

Return the structured result: authored = ids you gave >=1 verbatim quote; honestAbsence = ids left unquoted; flagged = [{id, reason}] for every honest-absence or problem; webCalls; notes = one line or "".`

phase('Source')
const results = await parallel(chunks.map((chunk) => () =>
  agent(
    `${RULES}\n\nYOUR IDS: ${chunk.join(', ')}`,
    { label: `t10:${chunk[0]}..${chunk[chunk.length - 1]}`, phase: 'Source', schema: RETURN_SCHEMA, agentType: 'biblical-contradiction-scholar-sonnet', model: 'sonnet', effort: 'medium' }
  )
))

const ok = results.filter(Boolean)
const authored = ok.flatMap((r) => r.authored || [])
const honestAbsence = ok.flatMap((r) => r.honestAbsence || [])
const flagged = ok.flatMap((r) => r.flagged || [])
const webCalls = ok.reduce((n, r) => n + (r.webCalls || 0), 0)
const deadChunks = results.length - ok.length
log(`T10 sourcing done: authored ${authored.length}/${IDS.length}; honest-absence ${honestAbsence.length}; flagged ${flagged.length}; web calls ${webCalls}; dead chunks ${deadChunks}`)
return { requested: IDS.length, authored: authored.length, authoredIds: authored, honestAbsence, flagged, webCalls, chunks: chunks.length, deadChunks }
