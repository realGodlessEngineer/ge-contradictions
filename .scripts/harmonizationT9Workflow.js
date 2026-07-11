export const meta = {
  name: 'harmonization-t9',
  description: 'Author T9 dossier note + versePair (+ emptyNote on reconcile-leaning rows) offline from pre-built bundles, via local Sonnet 5 subagents',
  phases: [
    { title: 'Author', detail: 'Sonnet subagents author dossier sidecars from _t9bundles, ~10 ids each (offline)', model: 'sonnet' },
  ],
}

// --- inputs (via Workflow args; tolerate args arriving as a JSON string OR object) ---
const A = typeof args === 'string' ? JSON.parse(args) : (args || {})
const IDS = A.ids || []
const CHUNK = A.chunkSize || 10
const DIR = A.bundleDir || 'data/harmonization/curation/_t9bundles'
if (!IDS.length) { log('args.ids is empty — pass { ids:[...] } from _t9bundles/manifest.json'); return { idsDone: [], flagged: [] } }

const chunks = []
for (let i = 0; i < IDS.length; i += CHUNK) chunks.push(IDS.slice(i, i + CHUNK))
log(`T9 authoring: ${IDS.length} ids in ${chunks.length} chunk(s) of <=${CHUNK} — local Sonnet 5, fully offline`)

const RETURN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    idsDone: { type: 'array', items: { type: 'integer' } },
    flagged: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { id: { type: 'integer' }, reason: { type: 'string' } }, required: ['id', 'reason'] } },
    webCalls: { type: 'integer' },
    notes: { type: 'string' },
  },
  required: ['idsDone', 'flagged'],
}

const RULES = `You are authoring T9 harmonization dossier sidecar files. For each id in YOUR IDS, READ its bundle at ${DIR}/bundle_<id>.json (self-contained — ALL verse text is pre-fetched as candidateRefs[].verses[].webText; do NOT open gather/, contradictions.db, or bible_reference.db) and WRITE data/harmonization/curation/dossier/<id>.json.

Per id you author: reconcile.note + versePair (two sides) ALWAYS. If the bundle's reconcileFirst===true you ALSO author a discrepancy honest-absence pair (emptyNote + emptyNoteAttr). NEVER author any quotes — both quotes arrays are always [].

OUTPUT SCHEMA (pretty JSON, 2-space indent):
{
  "contradiction_id": <id>,
  "covered": 1,
  "reconcile": { "note": "<one sentence>", "halfLine": null, "emptyNote": null, "emptyNoteAttr": null, "quotes": [] },
  "discrepancy": { "note": null, "halfLine": null, "emptyNote": <null OR one sentence>, "emptyNoteAttr": <null OR "Author (date), Work (year).">, "quotes": [] },
  "versePair": { "sides": [ {"ref":"Book c:v","snippet":"<verbatim>","verseVersion":"WEB","verseText":"<exact webText>"}, {"ref":"Book c:v","snippet":"<verbatim>","verseVersion":"WEB","verseText":"<exact webText>"} ] }
}

RULES:
A. reconcile.note (ALWAYS): ONE sentence, ends '.', <=180 chars, no interior '. ', pre-trimmed. Condense the reconcile lead excerpt's argument IN YOUR OWN WORDS — it must NOT be a verbatim substring of any excerpt_text or on_tension_rationale. MUST mention the reconcile lead author's surname from reconcile.excerpts[0].author (e.g. Gill, Henry, Fausset, Clarke, "Keil & Delitzsch"). NO trailing "(1874)." year tail; NO ", on Genesis 1:3." verse tail. Blocklist (never, whole-word, case-insensitive): attempt, explains away, contrived, forced, of course, fatal, decisively, obviously, merely, so-called, desperate, absurd.

B. versePair.sides — exactly TWO: from candidateRefs pick the two verses that most sharply state the two sides of THIS contradiction (read question + summary); pick the single most on-point verse within a range (not automatically the first). ref = "Book chap:verse" (canonical book name, a SINGLE verse; NO '/', NO ',', NO range dash, NO trailing period). snippet = a VERBATIM substring of that verse's webText, <40 words (usually the whole verse copied exactly); if you elide internally use ONLY the character '…' (U+2026), never "..." or "..". verseText = the EXACT webText string copied character-for-character (reproduce any backslash-quote artifacts verbatim). verseVersion = "WEB". ORDER the two sides by canonical scripture position: sort by (bolls, chapter, verse) ascending; array position 0 = the earlier verse, 1 = the later — regardless of which pole each supports. The two snippets must not be identical.

C. Discrepancy pole (branch on bundle.reconcileFirst):
   - reconcileFirst===false: discrepancy = {note:null, halfLine:null, emptyNote:null, emptyNoteAttr:null, quotes:[]}. Do NOT invent a critic — T10 hand-sources the real quote later.
   - reconcileFirst===true: author emptyNote (one disciplined sentence, same clean register/blocklist as the note, naming the strongest REAL critic who has actually engaged this passage — even if they ultimately concede it) + emptyNoteAttr ("Author (date), Work (year)." shape). discrepancyCandidate.skeptic is a STARTING POINT, not a transcription source — confirm the critic AND the work are real. If you are already certain it is a real critic + real work (Paine / The Age of Reason, Bart Ehrman, Steve Wells / Skeptic's Annotated Bible, Julius Wellhausen, D. F. Strauss, etc.) do NOT search. Use WebSearch/WebFetch ONLY when unsure the named work is real. If no real critic can be honestly named, set BOTH emptyNote and emptyNoteAttr null and add {id, reason} to flagged. NEVER fabricate a critic, work, or claim.

D. ALWAYS: covered=1; reconcile.halfLine / reconcile.emptyNote / reconcile.emptyNoteAttr null; both quotes arrays []. Do NOT run any baker/validator script (the gate runs separately). Do NOT edit machine or bundle files. Do NOT fabricate.

Return the structured result: idsDone = ids you wrote; flagged = [{id, reason}] for any emptyNote left null or any problem; webCalls = total WebSearch + WebFetch calls you made (expected 0); notes = one line or "".`

phase('Author')
const results = await parallel(chunks.map((chunk) => () =>
  agent(
    `${RULES}\n\nYOUR IDS: ${chunk.join(', ')}`,
    { label: `t9:${chunk[0]}..${chunk[chunk.length - 1]}`, phase: 'Author', schema: RETURN_SCHEMA, agentType: 'biblical-contradiction-scholar-sonnet', model: 'sonnet', effort: 'medium' }
  )
))

const ok = results.filter(Boolean)
const idsDone = ok.flatMap((r) => r.idsDone || [])
const flagged = ok.flatMap((r) => r.flagged || [])
const webCalls = ok.reduce((n, r) => n + (r.webCalls || 0), 0)
const deadChunks = results.length - ok.length
log(`T9 done: authored ${idsDone.length}/${IDS.length}; flagged ${flagged.length}; web calls ${webCalls}; dead chunks ${deadChunks}`)
return { requested: IDS.length, authored: idsDone.length, idsDone, flagged, webCalls, chunks: chunks.length, deadChunks }
