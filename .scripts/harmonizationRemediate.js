export const meta = {
  name: 'harmonization-remediate',
  description: 'Targeted remediation of the 18 guardrail-flagged harmonization rows from the batch-1+2 sampled audit (named-skeptic strawman/not_real, connective work/year misattribution, deeper-learning pd_work/link). Opus scholar applies the MINIMAL fix the auditor verdict calls for; floor re-gates verbatim; the 18 verdicts are deleted and the rows re-audited by the Opus auditor; report regenerated. READ-ONLY on both .db files. NOT a batch run — fixed id list, no auto-advance, so the 2026-06-21 overshoot class cannot recur.',
  phases: [
    { title: 'Fix', detail: 'biblical-contradiction-scholar (OPUS) per flagged id -> minimal in-place fix (PAID)', model: 'opus' },
    { title: 'Floor', detail: 'verifyExcerpts.py gate (Sonnet runner) + targeted repair (Opus); hard gate' },
    { title: 'Reset', detail: 'MODE=select refresh work files + delete the 18 stale verdicts (Sonnet runner, $0)' },
    { title: 'Re-audit', detail: 'biblical-scholar-auditor (OPUS) over the 18 fixed rows -> fresh verdicts/<id>.ppf (PAID)', model: 'opus' },
    { title: 'Report', detail: 'auditHarmonization.py MODE=report -> AUDIT-report.md (Sonnet runner, $0)' },
  ],
}

// ---------------------------------------------------------------------------
// REMEDIATION — fixed id list, no discovery/auto-advance. The 18 ids the
// batch-1+2 sampled audit flagged (audit_summary.json offenders, minus id 23
// which was an agent-cleared false positive). Each fix-agent reads its OWN
// verdict PPF for the precise defect + direction, then makes the minimal change.
//
//   strawman/not_real (rewrite discrepancy pole, 439 model): 11 24 27 77 96 107 131 145 151 181 202
//   connective work/year misattribution (fix citation):       33 125 163 182
//   deeper-learning pd_work/link:                             19 160 175
//
// id 160 NOTE: the auditor's "Gill is under 3:26 not 3:25" is a versification
// artifact vs biblehub — in OUR source (gather note / bible_reference.db) the
// "for your sakes/Meribah" note IS at GILL/5/3/25 and is verbatim-matched there.
// Re-pointing it to 3:26 would break the floor. The fix-agent is told our gather
// note wins; expect this row to come back clean as a confirmed false positive.
// ---------------------------------------------------------------------------
const FLAG_IDS = [11, 19, 24, 27, 33, 77, 96, 107, 125, 131, 145, 151, 160, 163, 175, 181, 182, 202]
const CLASS = {
  11: 'named_skeptic', 24: 'named_skeptic', 27: 'deeper_learning', 77: 'named_skeptic',
  96: 'named_skeptic', 107: 'named_skeptic', 131: 'named_skeptic', 145: 'named_skeptic',
  151: 'named_skeptic', 181: 'named_skeptic', 202: 'named_skeptic',
  33: 'connective', 125: 'connective', 163: 'connective', 182: 'connective',
  19: 'deeper_learning', 160: 'deeper_learning', 175: 'deeper_learning',
}
// CLASS[27] note: its named_skeptic strawman was fixed in run 1 (now Wells/SAB, clean);
// the re-audit then surfaced a deeper_learning pd_work overstatement (the note inverts
// the thrust of Gill's 1 Tim 3:2 office-qualification reading) — so 27's remaining class
// is deeper_learning.
//
// TARGETED RE-RUN OVERRIDE — set ONLY_IDS to a subset of FLAG_IDS to remediate just
// those (deterministic, independent of the Workflow args channel; null = the full 18).
// (id 160's flag is a confirmed UPSTREAM versification offset in bible_reference.db —
// Gill's Deut "for your sakes" note is canonically 3:26 but our DB keys it 3:25; the floor
// pins us to 3:25. Owner decided 2026-06-23 to LEAVE it at 3:25 + accept the documented
// flag, so it is intentionally NOT remediated.) Run 2 used ONLY_IDS=[27]; reset to null so
// this file is the canonical full-18 remediation tool.
const ONLY_IDS = null
const TARGET = (Array.isArray(ONLY_IDS) && ONLY_IDS.length) ? ONLY_IDS : FLAG_IDS

const base = 'data/harmonization'
const GATHER_DIR = `${base}/gather/by_id`
const MACHINE_DIR = `${base}/curation/machine`
const AUDIT_DIR = `${base}/audit`
const GLUE = 'sonnet'

// ---- schemas ----
const FIX = { type: 'object', additionalProperties: false, properties: { id: { type: 'integer' }, status: { type: 'string', enum: ['fixed', 'no_change', 'error'] }, class: { type: 'string' }, changed: { type: 'string' }, verified: { type: 'string' } }, required: ['id', 'status'] }
const FLOOR = { type: 'object', additionalProperties: false, properties: { checked: { type: 'integer' }, passed: { type: 'integer' }, failed: { type: 'integer' }, failures: { type: 'array', items: { type: 'string' } } }, required: ['checked', 'passed', 'failed'] }
const RESET = { type: 'object', additionalProperties: false, properties: { floor_clean: { type: 'boolean' }, work_files: { type: 'integer' }, deleted_verdicts: { type: 'array', items: { type: 'integer' } }, sampled_count: { type: 'integer' } }, required: ['deleted_verdicts'] }
const AU = { type: 'object', additionalProperties: false, properties: { id: { type: 'integer' }, excerpts: { type: 'integer' }, wrote_ppf: { type: 'boolean' } }, required: ['id', 'wrote_ppf'] }
const REPORT = { type: 'object', additionalProperties: false, properties: { done: { type: 'boolean' }, pass: { type: 'integer' }, flag: { type: 'integer' }, fail: { type: 'integer' }, offenders: { type: 'array', items: { type: 'integer' } }, summary: { type: 'string' } }, required: ['done'] }

// ---- Phase 1: targeted fix fan-out (PAID, Opus) ----
phase('Fix')
const fixPrompt = (id) =>
  `Harmonization REMEDIATION for contradiction ${id}. The batch-1+2 sampled audit flagged ONE guardrail defect on this row. Apply the MINIMAL fix the auditor's verdict calls for — change ONLY the flagged element, nothing else.\n` +
  `1) Read ${base}/TRANSFORM_CONTRACT.md IN FULL (the compact transform contract: the 439 named-skeptic model, the 5 curation guardrails, deeper-learning #36).\n` +
  `2) Read the auditor's verdict ${AUDIT_DIR}/verdicts/${id}.ppf — the single G| line states the defect class + the fix direction in plain prose (the E| lines are per-excerpt and almost always PASS; do not touch excerpts on their account).\n` +
  `3) Read ${MACHINE_DIR}/${id}.json (the file you will edit) and ${GATHER_DIR}/${id}.json (a note's "text" is the ONLY authoritative verbatim source; the voices codebook resolves source attribution).\n` +
  `Apply ONLY the fix the G-line calls for (class hint: ${CLASS[id]}):\n` +
  `  • named_skeptic strawman/not_real — the discrepancy pole names a critic whose ACTUAL documented objection does not fit THIS passage, or who cannot be verified pressing it. Rewrite row.discrepancy.skeptic {name,work,year,attribution} + row.discrepancy.connective so the pole carries the strongest REAL skeptic who genuinely pressed THIS exact contradiction, objection stated as an accurate attributed connective (paraphrase, not a fake quote). The honest lister is very often Steve Wells / The Skeptic's Annotated Bible (cite the specific SAB contra page if it lists this pairing). If the originally-named critic DID engage this tension but only with a narrower/different objection, you may instead KEEP them and rewrite the connective to their ACTUAL objection. Confirm the critic + work + year exist and engaged this passage via WebSearch/WebFetch. NEVER fabricate a critic, work, position, or URL.\n` +
  `  • connective (work/year misattribution) — the critic is real and fairly represented but the cited work/year is wrong. Fix row.discrepancy.skeptic.work / .year / .attribution (and the connective ONLY if it names the wrong work) to the correct, verifiable citation per the G-line. Keep the critic and the substance. For id 125 specifically: the critic (DiMattei) is real but the connective overgeneralizes his thesis onto a tension his cited work does not press — narrow the connective to his ACTUAL documented thesis rather than re-citing.\n` +
  `  • deeper_learning — fix deeper_learning.defense.pd_work and/or .link. When Haley's coverage of THIS exact pair is unconfirmable, swap pd_work to a harmonizing commentator already surfaced on this row, keyed to the passage (per #36). pd_work is REQUIRED and must be a real PD work treating THIS passage. The .link is OPTIONAL — drop it (set url/domain/title null with a short note) or replace it if it is off-topic; only keep a link that is a real, on-topic page on an allowlisted domain (gotquestions.org / carm.org / defendinginerrancy.com). Verify any link is live + on-topic.\n` +
  `HARD RULES:\n` +
  `  - Do NOT alter any excerpt_text.\n` +
  `  - Do NOT change verse_ref / full_note_ref UNLESS our OWN gather note proves the current value points to the wrong note in OUR source. Changing a ref re-points the verbatim floor (it re-fetches that exact ref from bible_reference.db) and will break it. If the auditor's verse-pointer claim conflicts with our gather note (editions versify differently from biblehub), OUR GATHER NOTE WINS — leave the ref, note the discrepancy, and treat the flag as a confirmed false positive (return status:'no_change' with that explanation). [This is the expected outcome for id 160: the "for your sakes/Meribah" note is at GILL/5/3/25 in our source.]\n` +
  `  - Change nothing the G-line did not flag. Preserve JSON shape exactly per TRANSFORM_SPEC.md. Read-only on every .db file.\n` +
  `Apply the fix as a targeted Edit to just the flagged field's value(s) (a surgical replacement), NOT a full-file Write of ${MACHINE_DIR}/${id}.json — a full rewrite re-emits the whole file to change one element and is wasted output; fall back to Write only if the change is too pervasive for a surgical edit. Return {id, status:'fixed'|'no_change'|'error', class:'${CLASS[id]}', changed:<short what you changed>, verified:<critic/work/url you confirmed, or why no change>}.`

const fixResults = (await parallel(TARGET.map(id => () =>
  agent(fixPrompt(id), { agentType: 'biblical-contradiction-scholar', label: `fix:${id}`, phase: 'Fix', schema: FIX })
))).filter(Boolean)
const fixed = fixResults.filter(r => r.status === 'fixed')
const noChange = fixResults.filter(r => r.status === 'no_change')
const fixErr = fixResults.filter(r => r.status === 'error')
log(`fix: ${fixed.length} fixed, ${noChange.length} no_change (false positives), ${fixErr.length} error`)
if (fixErr.length) log(`fix errors: ${fixErr.map(r => r.id).join(', ')}`)

// ---- Phase 2: verbatim floor — HARD GATE with bounded Opus repair loop ----
phase('Floor')
const runFloor = () => agent(
  `Run the harmonization verbatim floor (read-only). Use the Bash tool from the repo root:\n` +
  `  MACHINE_DIR=${MACHINE_DIR} REF_DB=./bible_reference.db python .scripts/verifyExcerpts.py\n` +
  `Report the printed "Excerpts checked / PASS / FAIL" numbers and copy every FAILURES line verbatim into failures[].`,
  { agentType: 'general-purpose', label: 'floor', phase: 'Floor', model: GLUE, schema: FLOOR }
)
const failIds = (failures) => [...new Set((failures || [])
  .map(f => { const m = /\bid\s+(\d+)\b/.exec(f) || /\b(\d+)#\d+\b/.exec(f); return m ? parseInt(m[1], 10) : null })
  .filter(x => x !== null))]
const repairPrompt = (id, msgs) =>
  `Harmonization VERBATIM FIX for contradiction ${id}. The mechanical floor rejected an excerpt in ${MACHINE_DIR}/${id}.json as NOT VERBATIM after the remediation edit:\n` +
  msgs.map(m => `  - ${m}`).join('\n') + `\n` +
  `Read ${GATHER_DIR}/${id}.json (a note's "text" is the authoritative verbatim source) and ${MACHINE_DIR}/${id}.json. The remediation pass should NOT have touched excerpt_text or refs — if it did, REVERT that part so the excerpt_text is again an exact verbatim substring of its source note at its full_note_ref (apply only the spec's allowed normalizations; truncations end with " …" U+2026, never a period the source lacks). Keep the legitimate guardrail fix (skeptic/connective/deeper_learning). Apply the correction as a targeted Edit to just the affected field(s) (a surgical replacement), NOT a full-file Write — a full rewrite re-emits the whole JSON to change one field and is wasted output; fall back to Write only if the change is too pervasive for a surgical edit. Do NOT touch any .db file.\n` +
  `Return {id, status:'fixed'|'error', class:'repair', changed:<what you reverted/fixed>}.`

let floor = await runFloor()
let repair = 0
while (floor && floor.failed > 0 && repair < 2) {
  repair++
  const ids = failIds(floor.failures)
  log(`floor: ${floor.failed} fail; targeted repair pass ${repair} on ${ids.join(', ')}`)
  await parallel(ids.map(id => () =>
    agent(repairPrompt(id, (floor.failures || []).filter(f => new RegExp(`\\b${id}(#\\d+)?\\b`).test(f))),
      { agentType: 'biblical-contradiction-scholar', label: `repair:${id}`, phase: 'Floor', schema: FIX })
  ))
  floor = await runFloor()
}
log(`floor final: ${floor ? `${floor.passed}/${floor.checked} pass, ${floor.failed} fail (${repair} repair pass${repair === 1 ? '' : 'es'})` : 'no result'}`)
if (!floor || floor.failed > 0) {
  log(`ABORT before re-audit — floor not clean after ${repair} repair pass(es): ${((floor && floor.failures) || []).join(' | ')}`)
  return { phase: 'floor', aborted: 'floor_not_clean', fix: { fixed: fixed.map(r => r.id), no_change: noChange.map(r => r.id), error: fixErr.map(r => r.id) }, floor }
}

// ---- Phase 3: refresh work files (MODE=select) + delete the 18 stale verdicts ----
phase('Reset')
const reset = await agent(
  `Refresh the harmonization audit work files and clear the stale verdicts for the remediated rows. Use the Bash tool from the repo root, in order:\n` +
  `  1) MACHINE_DIR=${MACHINE_DIR} GATHER_DIR=${GATHER_DIR} AUDIT_DIR=${AUDIT_DIR} HARMON_BASE=${base} REF_DB=./bible_reference.db MODE=select python .scripts/auditHarmonization.py\n` +
  `     (this re-runs the floor, rebuilds ${AUDIT_DIR}/work/*.json from the now-fixed machine files, and rewrites ${AUDIT_DIR}/_sample.json). Confirm it prints a CLEAN floor.\n` +
  `  2) Delete ONLY these stale verdict files so they get re-audited (leave all other verdicts intact):\n` +
  `     for id in ${TARGET.join(' ')}; do rm -f ${AUDIT_DIR}/verdicts/$id.ppf ${AUDIT_DIR}/verdicts/$id.json; done\n` +
  `  3) Confirm each still has a work file: for id in ${TARGET.join(' ')}; do test -f ${AUDIT_DIR}/work/$id.json || echo "MISSING work/$id.json"; done\n` +
  `  4) Read ${AUDIT_DIR}/_sample.json and report contradictions_with_work as sampled_count.\n` +
  `Return {floor_clean, work_files:<count of ${AUDIT_DIR}/work/*.json>, deleted_verdicts:<ids you removed>, sampled_count}.`,
  { agentType: 'general-purpose', label: 'reset', phase: 'Reset', model: GLUE, schema: RESET }
)
log(`reset: floor_clean=${reset && reset.floor_clean} · work_files=${reset && reset.work_files} · deleted ${(reset && reset.deleted_verdicts || []).length} verdicts`)

// ---- Phase 4: re-audit the 18 fixed rows (PAID, Opus) ----
phase('Re-audit')
const auPrompt = (id) =>
  `Harmonization AUDIT pass for contradiction ${id} (re-audit after a targeted remediation fix).\n` +
  `1) Read ${base}/AUDITOR_SPEC.md IN FULL (the verdict checks + the PPF output contract + numeric codebook).\n` +
  `2) Read ${AUDIT_DIR}/work/${id}.json (it embeds question/summary/poles/excerpts with the FULL source_note_text — work ONLY from it; do not fetch the DB).\n` +
  `Judge each excerpt (in_source / on_tension / pole_label / overall / action) and the per-row guardrails (parity, connectives, named_skeptic, discrepancy_integrity, deeper_learning). Verify every named skeptic is a REAL critic who actually engaged THIS passage and that deeper_learning pd_work + any link are real and on-topic (WebSearch/WebFetch). Be a skeptic — default to flag/fail when genuinely unsure — BUT judge from the embedded source_note_text, not an external edition's versification (e.g. a verse label that matches the embedded note is correct even if biblehub numbers it differently). You diagnose; you do NOT rewrite excerpts.\n` +
  `3) Write the verdict as RAW PPF (no markdown fences, no headers, no prose) EXACTLY per the spec to ${AUDIT_DIR}/verdicts/${id}.ppf — one E line per excerpt + exactly one G line.\n` +
  `Return {id, excerpts:<number of E lines>, wrote_ppf:true}.`

const auResults = (await parallel(TARGET.map(id => () =>
  agent(auPrompt(id), { agentType: 'biblical-scholar-auditor', label: `au:${id}`, phase: 'Re-audit', schema: AU })
))).filter(Boolean)
log(`re-audit: ${auResults.filter(r => r.wrote_ppf).length}/${TARGET.length} fresh verdicts written`)

// ---- Phase 5: cumulative report ($0) ----
phase('Report')
const rep = await agent(
  `Generate the cumulative harmonization audit report. Use the Bash tool from the repo root:\n` +
  `  MACHINE_DIR=${MACHINE_DIR} GATHER_DIR=${GATHER_DIR} AUDIT_DIR=${AUDIT_DIR} HARMON_BASE=${base} REF_DB=./bible_reference.db MODE=report python .scripts/auditHarmonization.py\n` +
  `Then read ${AUDIT_DIR}/audit_summary.json. Return done:true, the overall pass/flag/fail excerpt counts, the guardrails_agent.offenders array (the ids still flagged), and a short summary string of the guardrail tallies. Specifically confirm whether any of these 18 remediated ids are still in offenders: ${FLAG_IDS.join(', ')}.`,
  { agentType: 'general-purpose', label: 'report', phase: 'Report', model: GLUE, schema: REPORT }
)

return {
  remediated_this_run: TARGET,
  full_flag_set: FLAG_IDS,
  fix: { fixed: fixed.map(r => r.id), no_change: noChange.map(r => r.id), error: fixErr.map(r => r.id) },
  floor: { passed: floor.passed, checked: floor.checked, failed: floor.failed, repair_passes: repair },
  reset: { floor_clean: reset && reset.floor_clean, deleted_verdicts: (reset && reset.deleted_verdicts) || [] },
  reaudit: { fresh_verdicts: auResults.filter(r => r.wrote_ppf).length, of: TARGET.length },
  report: rep,
}
