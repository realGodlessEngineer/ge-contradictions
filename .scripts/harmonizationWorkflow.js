export const meta = {
  name: 'harmonization-sweep',
  description: 'Local-agent harmonization excerpt sweep, CHUNKED: processes the next N (default 100) unprocessed contradictions per run, so the full 605 is done in ~6 batches at the owner\'s leisure. Transform + auditor on Opus (validated quality); glue/runner steps on Sonnet. READ-ONLY on both .db files; writes only into the harmonization workspace. Optional, OFF-by-default Dossier leg (EMIT_DOSSIER): after a clean floor, local Sonnet subagents (never the Batch API) author the note+verse_pair sidecar (curation/dossier/<id>.json) with a bounded mechanical-gate repair loop; discrepancy-leaning rows are left awaiting a later hand-sourced-critic pass (T10) by design.',
  phases: [
    { title: 'Discover', detail: 'list gather ids + already-done; pick this batch (Sonnet, $0)' },
    { title: 'Transform', detail: 'biblical-contradiction-scholar-sonnet (SONNET) per id -> curation/machine/<id>.json (PAID)', model: 'sonnet' },
    { title: 'Floor', detail: 'verifyExcerpts.py gate (Sonnet runner) + targeted repair (Opus); hard gate' },
    { title: 'Dossier', detail: 'OPT-IN, default OFF (EMIT_DOSSIER=false): biblical-contradiction-scholar-sonnet (SONNET, not Batch API) per id -> curation/dossier/<id>.json note+verse_pair sidecar; buildHarmonizationTables.js DRY_RUN gate + bounded repair loop (max 2); parity_* on a discrepancy-leaning row is expected/deferred to a later hand-sourced-critic pass, not repaired', model: 'sonnet' },
    { title: 'Audit-select', detail: 'auditHarmonization.py MODE=select -> audit/work/*.json (Sonnet runner, $0)' },
    { title: 'Auditor', detail: 'biblical-scholar-auditor (SONNET via model override) over newly-sampled rows lacking a verdict -> verdicts/<id>.ppf (PAID)', model: 'sonnet' },
    { title: 'Report', detail: 'auditHarmonization.py MODE=report -> AUDIT-report.md (Sonnet runner, $0)' },
  ],
}

// ---------------------------------------------------------------------------
// CHUNKED run. Pick the batch with args (all optional):
//   { batch: 1..6 }      -> the fixed id window [(batch-1)*count+1 .. batch*count]
//   { ids: [..] }        -> an explicit id list
//   (no args)            -> auto-advance: the next `count` not-yet-processed ids
//   { count: N }         -> batch size (default 100)
//   { base: "..." }      -> output base (default the REAL data/harmonization)
// "Processed" = a machine/<id>.json already exists in the base, so re-running
// no-arg simply advances through the corpus; six runs cover all 605.
// gather/by_id is always read from the real workspace (read-only input).
//
// MODELS: glue/runner steps (discover, floor-check, select, report) run on
// Sonnet (mechanical — they just shell out to deterministic Python). Per the
// Sonnet-5-default token directive, the two judgement-heavy legs now run on
// Sonnet 5 too: Transform via the biblical-contradiction-scholar-sonnet agent,
// and the Auditor via a { model: 'sonnet' } override on the (Opus-by-default)
// biblical-scholar-auditor agent. The verbatim floor REPAIR deliberately STAYS
// on the Opus scholar — it is rare + gated, and Opus-as-fallback for the hard
// verbatim rescue is exactly the directive's carve-out.
// ---------------------------------------------------------------------------
const GATHER_DIR = 'data/harmonization/gather/by_id'
const base = (args && args.base) || 'data/harmonization'
const count = (args && args.count) || 100
const MACHINE_DIR = `${base}/curation/machine`
const AUDIT_DIR = `${base}/audit`
const DOSSIER_DIR = `${base}/curation/dossier` // Dossier phase output (opt-in, see EMIT_DOSSIER below)
const GLUE = 'sonnet' // model for the mechanical runner steps

// SCOPE LITERALS — set these (then relaunch via scriptPath) to scope a run
// deterministically, regardless of whether the Workflow `args` channel threads.
// (On 2026-06-21 an `{batch:1}` arg did NOT take effect — the run auto-advanced and
// processed a second 100-id batch the owner had not authorized. These literals win
// over args so a scoped run is now guaranteed.)
//   FORCE_BATCH = 3      -> only the id window for batch 3 ([(3-1)*count+1 .. 3*count])
//   FORCE_IDS  = [a,b,..] -> only these explicit ids
//   both null            -> see scope resolution below (FINALIZE-ONLY unless args.auto)
const FORCE_BATCH = null
const FORCE_IDS = null

// PAUSE THE AUDIT: when true, the run stops cleanly right after the verbatim
// floor — Transform machine files + the hard floor gate complete and persist,
// but the PAID Opus auditor leg (Audit-select / Auditor / Report) is skipped.
// MODE=select rebuilds all work files from current machine files on a later run,
// so the audit is fully deferrable: flip this back to false and resume/relaunch
// to run the audit over the already-transformed batch.
const SKIP_AUDIT = false

// OPT-IN, DEFAULT-OFF dossier sidecar leg ("T9" — see TRANSFORM_SPEC.md's
// "Dossier sidecar leg — note + verse_pair (going forward)" section). When
// false (the default), the Dossier phase below is entirely skipped and every
// other phase runs byte-identically to before this leg existed. Flip to true
// (or pass args.dossier) to author curation/dossier/<id>.json sidecars for
// this run's freshly-transformed batch on LOCAL SONNET SUBAGENTS ONLY — never
// the Anthropic Message Batches API, never Opus. Independent of SKIP_AUDIT:
// the dossier leg is local/cheap and runs whether or not the paid Opus audit
// legs are paused.
const EMIT_DOSSIER = false

// ---- schemas (force structured returns) ----
const DISCOVER = { type: 'object', additionalProperties: false, properties: { gather_ids: { type: 'array', items: { type: 'integer' } }, done_ids: { type: 'array', items: { type: 'integer' } } }, required: ['gather_ids', 'done_ids'] }
const TF = { type: 'object', additionalProperties: false, properties: { id: { type: 'integer' }, status: { type: 'string', enum: ['ok', 'error', 'skipped'] }, excerpts: { type: 'integer' }, note: { type: 'string' } }, required: ['id', 'status'] }
const FLOOR = { type: 'object', additionalProperties: false, properties: { checked: { type: 'integer' }, passed: { type: 'integer' }, failed: { type: 'integer' }, failures: { type: 'array', items: { type: 'string' } } }, required: ['checked', 'passed', 'failed'] }
const SELECT = { type: 'object', additionalProperties: false, properties: { sampled_ids: { type: 'array', items: { type: 'integer' } }, work_files: { type: 'integer' }, verdict_ids: { type: 'array', items: { type: 'integer' } } }, required: ['sampled_ids'] }
const AU = { type: 'object', additionalProperties: false, properties: { id: { type: 'integer' }, excerpts: { type: 'integer' }, wrote_ppf: { type: 'boolean' } }, required: ['id', 'wrote_ppf'] }
const REPORT = { type: 'object', additionalProperties: false, properties: { done: { type: 'boolean' }, pass: { type: 'integer' }, flag: { type: 'integer' }, fail: { type: 'integer' }, summary: { type: 'string' } }, required: ['done'] }
// Dossier phase (opt-in, EMIT_DOSSIER) schemas.
const DOSSIER_DISCOVER = { type: 'object', additionalProperties: false, properties: { dossier_ids: { type: 'array', items: { type: 'integer' } } }, required: ['dossier_ids'] }
const DOSSIER_TF = { type: 'object', additionalProperties: false, properties: { id: { type: 'integer' }, status: { type: 'string', enum: ['ok', 'error', 'skipped'] }, note: { type: 'string' } }, required: ['id', 'status'] }
const DOSSIER_GATE = { type: 'object', additionalProperties: false, properties: { checked: { type: 'integer' }, ok_ids: { type: 'array', items: { type: 'integer' } }, deferred_parity_ids: { type: 'array', items: { type: 'integer' } }, violation_ids: { type: 'array', items: { type: 'integer' } }, violations: { type: 'array', items: { type: 'string' } } }, required: ['violation_ids', 'violations'] }

// ---- Phase 1: discover gather inputs + what's already done in this base ----
phase('Discover')
const disc = await agent(
  `Inventory the harmonization workspace. Use the Bash tool from the repo root and report two integer id lists:\n` +
  `  gather_ids: ls ${GATHER_DIR}/*.json | sed 's#.*/##; s#\\.json$##' | sort -n\n` +
  `  done_ids:   ls ${MACHINE_DIR}/*.json 2>/dev/null | sed 's#.*/##; s#\\.json$##' | sort -n   (may be empty if the dir does not exist yet)\n` +
  `Return {gather_ids, done_ids}.`,
  { agentType: 'general-purpose', label: 'discover', phase: 'Discover', model: GLUE, schema: DISCOVER }
)
const gatherIds = [...new Set((disc && disc.gather_ids) || [])].sort((a, b) => a - b)
const doneIds = new Set((disc && disc.done_ids) || [])
const undone = gatherIds.filter(id => !doneIds.has(id))

// Scope resolution: FORCE_* literals win (deterministic even if args don't thread),
// then args, else FINALIZE-ONLY. FINALIZE-ONLY transforms NOTHING new — it just runs
// floor/select/audit/report over existing outputs to finish stragglers. This is the
// safe default so a "continue/finish" relaunch can never silently pull a fresh 100-id
// batch (the 2026-06-21 overshoot). Auto-advance is now strictly OPT-IN (args.auto).
const pickBatch = (b) => { const lo = (b - 1) * count + 1, hi = b * count; return gatherIds.filter(id => id >= lo && id <= hi && !doneIds.has(id)) }
let targetIds
if (Array.isArray(FORCE_IDS) && FORCE_IDS.length) {
  targetIds = FORCE_IDS.filter(id => gatherIds.includes(id) && !doneIds.has(id))
} else if (FORCE_BATCH) {
  targetIds = pickBatch(FORCE_BATCH)
} else if (args && Array.isArray(args.ids)) {
  targetIds = args.ids.filter(id => gatherIds.includes(id) && !doneIds.has(id))
} else if (args && args.batch) {
  targetIds = pickBatch(args.batch)
} else if (args && args.auto) {
  targetIds = undone.slice(0, count) // opt-in auto-advance only
} else {
  targetIds = [] // FINALIZE-ONLY: finish stragglers, transform nothing new
}
targetIds = [...new Set(targetIds)].sort((a, b) => a - b)
const span = targetIds.length ? ` (${targetIds[0]}..${targetIds[targetIds.length - 1]})` : ''
log(`base=${base} | corpus ${gatherIds.length} | done ${doneIds.size} | this batch ${targetIds.length}${span} | remaining after ${Math.max(0, undone.length - targetIds.length)}`)
if (!targetIds.length && doneIds.size === 0) return { base, error: 'no targets and nothing previously processed', corpus: gatherIds.length }

// ---- Phase 2: transform fan-out (PAID, Opus) ----
let tfOk = [], tfErr = []
if (targetIds.length) {
  phase('Transform')
  const tfPrompt = (id) =>
    `Harmonization TRANSFORM pass for contradiction ${id}.\n` +
    `1) Read data/harmonization/TRANSFORM_CONTRACT.md IN FULL (the compact transform contract; read it before producing anything).\n` +
    `2) Read ${GATHER_DIR}/${id}.json (lean notes + voices codebook; a note's "text" is the ONLY source for excerpt_text).\n` +
    `3) Produce the machine excerpt file in EXACTLY the spec's JSON shape and write it to ${MACHINE_DIR}/${id}.json (create parent dirs as needed).\n` +
    `Hard rules: excerpt_text is VERBATIM from the note text (only the spec's allowed typography normalizations / sense-preserving ellipsis joins) — when you truncate mid-sentence end with the elision marker " …" (U+2026), NEVER add a sentence-final period the source lacks; on-tension sentences only (empty is correct, never pad); all 5 curation guardrails; parity-cap reconcile on discrepancy_first rows; a thin discrepancy pole uses the 439 model (name a REAL skeptic who actually engaged this passage, objection as an attributed connective) or set relabel_flag rather than co-opting it with harmonizers; deeper_learning.defense.pd_work is REQUIRED and must be a real PD work that treats THIS passage (prefer a harmonizing commentator already surfaced on the row when Haley's specific-passage coverage can't be confirmed), with an optional link only when it is a real page on an allowlisted domain. NEVER fabricate a critic, work, or URL — verify with WebSearch/WebFetch. Do NOT read or write any .db file.\n` +
    `Return {id, status:'ok'|'error'|'skipped', excerpts:<count written>, note:<short>}.`

  const tfResults = (await parallel(targetIds.map(id => () =>
    agent(tfPrompt(id), { agentType: 'biblical-contradiction-scholar-sonnet', label: `tf:${id}`, phase: 'Transform', schema: TF })
  ))).filter(Boolean)
  tfOk = tfResults.filter(r => r.status === 'ok')
  tfErr = tfResults.filter(r => r.status !== 'ok')
  log(`transform: ${tfOk.length} ok, ${tfErr.length} not-ok`)
  if (tfErr.length) log(`transform issues: ${tfErr.map(r => `${r.id}:${r.status}`).join(', ')}`)
} else {
  log(`no new ids to transform in this batch — running floor/select/audit/report over existing outputs (catch-up/finalize).`)
}

// ---- Phase 3: mechanical verbatim floor — HARD GATE with bounded repair loop ----
// verifyExcerpts.py AND select's internal floor reject any non-verbatim excerpt, so
// the audit must never run on an unclean floor. A floor failure is a generator defect;
// we targeted-fix only the flagged ids (on the Opus scholar) and re-floor, up to 2 passes.
phase('Floor')
const runFloor = () => agent(
  `Run the harmonization verbatim floor (read-only). Use the Bash tool from the repo root:\n` +
  `  MACHINE_DIR=${MACHINE_DIR} REF_DB=./bible_reference.db python .scripts/verifyExcerpts.py\n` +
  `Report the printed "Excerpts checked / PASS / FAIL" numbers and copy every FAILURES line verbatim into failures[].`,
  { agentType: 'general-purpose', label: 'floor', phase: 'Floor', model: GLUE, schema: FLOOR }
)
const failIds = (failures) => [...new Set((failures || [])
  .map(f => { const m = /\bid\s+(\d+)\b/.exec(f); return m ? parseInt(m[1], 10) : null })
  .filter(x => x !== null))]
const fixPrompt = (id, msgs) =>
  `Harmonization VERBATIM FIX for contradiction ${id}. The mechanical floor rejected one or more excerpts in ${MACHINE_DIR}/${id}.json as NOT VERBATIM:\n` +
  msgs.map(m => `  - ${m}`).join('\n') + `\n` +
  `Read ${GATHER_DIR}/${id}.json (a note's "text" is the authoritative verbatim source) and ${MACHINE_DIR}/${id}.json. Correct ONLY the flagged excerpt_text so it is an exact verbatim substring of its source note, applying only the spec's allowed normalizations. In particular: when you truncate mid-sentence, end with the elision marker " …" (U+2026) — do NOT add a sentence-final period the source does not have. Change nothing else (no other excerpts, poles, or connectives). Apply the correction as a targeted Edit to just the flagged excerpt_text value (a surgical string replacement), NOT a full-file Write — a full rewrite re-emits the whole JSON to change one field and is wasted output; fall back to Write only if the change is too pervasive for a surgical edit. Do NOT touch any .db file.\n` +
  `Return {id, status:'ok'|'error', excerpts:<count in file>, note:<what you changed>}.`

let floor = await runFloor()
let repair = 0
while (floor && floor.failed > 0 && repair < 2) {
  repair++
  const ids = failIds(floor.failures)
  log(`floor: ${floor.failed} fail; targeted repair pass ${repair} on ${ids.join(', ')}`)
  await parallel(ids.map(id => () =>
    agent(fixPrompt(id, (floor.failures || []).filter(f => new RegExp(`\\bid\\s+${id}\\b`).test(f))),
      { agentType: 'biblical-contradiction-scholar', label: `fix:${id}`, phase: 'Floor', schema: TF })
  ))
  floor = await runFloor()
}
log(`floor final: ${floor ? `${floor.passed}/${floor.checked} pass, ${floor.failed} fail (${repair} repair pass${repair === 1 ? '' : 'es'})` : 'no result'}`)
if (!floor || floor.failed > 0) {
  log(`ABORT before audit — floor not clean after ${repair} repair pass(es): ${((floor && floor.failures) || []).join(' | ')}`)
  return { base, batch_ids: targetIds, transform: { ok: tfOk.length, not_ok: tfErr.map(r => ({ id: r.id, status: r.status })) }, floor, repair_passes: repair, aborted: 'floor_not_clean' }
}

// ---- Phase 3b: OPT-IN dossier sidecar leg ("T9") — local Sonnet only ----
// Skipped ENTIRELY (zero side effects, zero agent calls) unless EMIT_DOSSIER
// or args.dossier is truthy — every other phase's control flow is unaffected
// either way. Runs only after the hard floor gate above has already passed,
// scoped to THIS run's freshly-transformed batch (targetIds) — mirrors the
// chunked, deliberately-bounded philosophy of the rest of this file (see the
// FORCE_BATCH/FORCE_IDS note above about not auto-widening scope).
if (EMIT_DOSSIER || (args && args.dossier)) {
  phase('Dossier')
  if (!targetIds.length) {
    log(`dossier: no ids transformed this run (targetIds empty) — nothing new to author. Re-run with a batch/ids to author dossiers.`)
  } else {
    const dosDisc = await agent(
      `List already-authored harmonization dossier ids. Use the Bash tool from the repo root:\n` +
      `  ls ${DOSSIER_DIR}/*.json 2>/dev/null | sed 's#.*/##; s#\\.json$##' | sort -n   (may be empty if the dir does not exist yet)\n` +
      `Return {dossier_ids}.`,
      { agentType: 'general-purpose', label: 'dossier-discover', phase: 'Dossier', model: GLUE, schema: DOSSIER_DISCOVER }
    )
    const dossieredIds = new Set((dosDisc && dosDisc.dossier_ids) || [])
    const dossierCandidates = targetIds.filter(id => !dossieredIds.has(id))

    if (!dossierCandidates.length) {
      log(`dossier: all ${targetIds.length} id(s) in this batch already have a dossier file — nothing to author.`)
    } else {
      const dosPrompt = (id) =>
        `Harmonization DOSSIER (note + verse_pair, "T9") pass for contradiction ${id}.\n` +
        `1) Read data/harmonization/TRANSFORM_SPEC.md IN FULL, especially the "Dossier sidecar leg — note + verse_pair (going forward)" section at the end (it is the contract; read it before producing anything).\n` +
        `2) Read ${GATHER_DIR}/${id}.json (question/summary/consensus/refs_parsed/voices) and ${MACHINE_DIR}/${id}.json (the existing reconcile-pole machine excerpts + row.lean/row.discrepancy — READ-ONLY, never edit it).\n` +
        `3) Author the dossier sidecar in EXACTLY the SPEC §3.2 camelCase shape and write it to ${DOSSIER_DIR}/${id}.json (create parent dirs as needed).\n` +
        `Hard rules: reconcile.quotes and discrepancy.quotes are ALWAYS [] (T9 never sources quotes -- hand-sourcing a verbatim discrepancy/critic quote is a separate later task, T10); reconcile.note names a real author present in the machine reconcile excerpts, is one sentence <=180 chars, ends '.', blocklist-clean (no attempt/explains away/contrived/forced/of course/fatal/decisively/obviously/merely/so-called/desperate/absurd), and is a condensation NOT a verbatim slice of any excerpt; determine the row's lean from consensus (reconcile-leaning ONLY when consensus is probable_harmonization or apparent_only; everything else is discrepancy-leaning) -- on a reconcile-leaning row set discrepancy.emptyNote + discrepancy.emptyNoteAttr to a REAL, independently-verified skeptic/critic who actually engaged this passage (never invent one; verify with WebSearch/WebFetch; the machine file's named skeptic is a candidate, not a source of truth); on a discrepancy-leaning row leave the ENTIRE discrepancy object null ({note:null,halfLine:null,emptyNote:null,emptyNoteAttr:null,quotes:[]}) -- that pole awaits T10, do not fabricate to fill it or to force a gate pass; versePair.sides has EXACTLY two verses from the contradiction's cited refs, each a verbatim WEB substring (<40 words, U+2026 for internal elision only) fetched READ-ONLY from bible_reference.db (SELECT text FROM translations WHERE version_code='WEB' AND book=? AND chapter=? AND verse=?, book resolved via data/harmonization/books_map.json aliases to a 1..66 bolls number), sides in canonical (book,chapter,verse) order, with verseText the exact full WEB verse returned by that query. NEVER fabricate a verse, snippet, note, or attribution. Do NOT read or write any .db file except that one read-only SELECT against bible_reference.db. Do NOT edit ${MACHINE_DIR}/${id}.json or any other machine/gather file.\n` +
        `Return {id, status:'ok'|'error'|'skipped', note:<short>}.`

      await parallel(dossierCandidates.map(id => () =>
        agent(dosPrompt(id), { agentType: 'biblical-contradiction-scholar-sonnet', label: `dos:${id}`, phase: 'Dossier', schema: DOSSIER_TF })
      ))

      const runDossierGate = (ids) => agent(
        `Run the harmonization dossier bake-gate (read-only, dry-run) over this batch. Use the Bash tool from the repo root:\n` +
        `  DRY_RUN=1 IDS=${ids.join(',')} node .scripts/buildHarmonizationTables.js\n` +
        `Read the "Validator:" section of the output (a "  id <N>:" header followed by indented "    - [<code>] <message>" lines per id with a violation; no header for a clean id). For each id in ${JSON.stringify(ids)}, classify it as: ok (id has no violation header at all), deferred (every one of its violation codes is parity_leaning_is_empty and/or parity_count -- expected on a discrepancy-leaning row still awaiting a later hand-sourced-critic pass (T10), not a defect), or needs_repair (it has at least one violation whose code is anything else -- e.g. note_present, note_register, note_verbatim, note_lead_source, empty_note_attr, halfline_blocklist, halfline_opposing_author, vp_ellipsis, vp_ref, vp_distinct, vp_order, vp_wordcount, attr_head). Build violations[] as one string per violation line, each formatted "id <N>: [<code>] <message>" (pair each "  id <N>:" header with the bullets beneath it) for every id classified deferred or needs_repair, so a fix pass can act on it.\n` +
        `Return {checked, ok_ids, deferred_parity_ids, violation_ids, violations}.`,
        { agentType: 'general-purpose', label: 'dossier-gate', phase: 'Dossier', model: GLUE, schema: DOSSIER_GATE }
      )
      const dosFixPrompt = (id, msgs) =>
        `Harmonization DOSSIER FIX for contradiction ${id}. The mechanical gate (buildHarmonizationTables.js DRY_RUN) flagged these violations in ${DOSSIER_DIR}/${id}.json:\n` +
        msgs.map(m => `  - ${m}`).join('\n') + `\n` +
        `Re-read the "Dossier sidecar leg — note + verse_pair (going forward)" section of data/harmonization/TRANSFORM_SPEC.md and correct ONLY the fields the flagged codes point at (note content/register, versePair sides, empty_note/empty_note_attr pairing, or half_line) so each violation resolves. Do not touch reconcile.quotes/discrepancy.quotes and do not alter any field not implicated by a flagged code. If any listed message is parity_leaning_is_empty or parity_count, IGNORE it -- it is expected on a discrepancy-leaning row and is not yours to fix; in particular, never set discrepancy.emptyNote/emptyNoteAttr on a discrepancy-leaning row just to silence a parity violation. Apply each correction as a targeted Edit to just the affected field's value (a surgical replacement), NOT a full-file Write of ${DOSSIER_DIR}/${id}.json — a full rewrite re-emits the whole sidecar to change a few fields and is wasted output; fall back to Write only if the changes are too pervasive for surgical edits.\n` +
        `Return {id, status:'ok'|'error', note:<what you changed>}.`

      let dosGate = await runDossierGate(dossierCandidates)
      let dosRepair = 0
      while (dosGate && Array.isArray(dosGate.violation_ids) && dosGate.violation_ids.length && dosRepair < 2) {
        dosRepair++
        const fixIds = dosGate.violation_ids
        log(`dossier gate: ${fixIds.length} id(s) need repair (pass ${dosRepair}): ${fixIds.join(', ')}`)
        await parallel(fixIds.map(id => () => {
          const msgs = (dosGate.violations || []).filter(v => new RegExp(`\\bid\\s+${id}\\b`).test(v))
          return agent(dosFixPrompt(id, msgs), { agentType: 'biblical-contradiction-scholar-sonnet', label: `dosfix:${id}`, phase: 'Dossier', schema: DOSSIER_TF })
        }))
        dosGate = await runDossierGate(dossierCandidates)
      }
      if (dosGate && Array.isArray(dosGate.deferred_parity_ids) && dosGate.deferred_parity_ids.length) {
        log(`dossier: ${dosGate.deferred_parity_ids.length} id(s) show only deferred parity_* violations (awaiting T10 hand-sourced critic quotes) -- not repaired, by design: ${dosGate.deferred_parity_ids.join(', ')}`)
      }
      log(`dossier final: ${dosGate
        ? `${(dosGate.ok_ids || []).length} clean, ${(dosGate.deferred_parity_ids || []).length} deferred (T10), ${(dosGate.violation_ids || []).length} still-flagged after ${dosRepair} repair pass(es)`
        : 'no gate result'}`)
    }
  }
}

// ---- PAUSE point: stop after a clean floor, before the PAID audit legs ----
if (SKIP_AUDIT) {
  const doneAfterTf = doneIds.size + tfOk.length
  log(`SKIP_AUDIT=true — stopping after the clean floor. Transform + floor complete; audit deferred. Flip SKIP_AUDIT=false and resume/relaunch to audit this batch.`)
  return {
    base,
    batch_ids: targetIds,
    progress: { corpus: gatherIds.length, done_before: doneIds.size, done_after: doneAfterTf, remaining: Math.max(0, gatherIds.length - doneAfterTf) },
    transform: { ok: tfOk.length, not_ok: tfErr.map(r => ({ id: r.id, status: r.status })) },
    floor: { passed: floor.passed, checked: floor.checked, failed: floor.failed, repair_passes: repair },
    audit: 'paused (SKIP_AUDIT)',
  }
}

// ---- Phase 4a: stratified audit selection ($0) — only reached on a clean floor ----
phase('Audit-select')
const sel = await agent(
  `Prepare and run the harmonization audit selection. Use the Bash tool from the repo root:\n` +
  `  mkdir -p ${base} && cp -n data/harmonization/deeper_learning_policy.json ${base}/ 2>/dev/null; true\n` +
  `  MACHINE_DIR=${MACHINE_DIR} GATHER_DIR=${GATHER_DIR} AUDIT_DIR=${AUDIT_DIR} HARMON_BASE=${base} REF_DB=./bible_reference.db IDS=${targetIds.join(',')} MODE=select python .scripts/auditHarmonization.py\n` +
  `It should report a clean floor and write ${AUDIT_DIR}/_sample.json plus ${AUDIT_DIR}/work/*.json. Then read ${AUDIT_DIR}/_sample.json for the sampled contradiction ids, and list existing verdicts:\n` +
  `  ls ${AUDIT_DIR}/verdicts/*.ppf ${AUDIT_DIR}/verdicts/*.json 2>/dev/null | sed 's#.*/##; s#\\.[^.]*$##' | sort -nu\n` +
  `Return {sampled_ids, work_files, verdict_ids} (verdict_ids may be empty).`,
  { agentType: 'general-purpose', label: 'select', phase: 'Audit-select', model: GLUE, schema: SELECT }
)
const sampledIds = [...new Set((sel && sel.sampled_ids) || [])].sort((a, b) => a - b)
const verdictIds = new Set((sel && sel.verdict_ids) || [])
const toAudit = sampledIds.filter(id => !verdictIds.has(id))
log(`audit-select: ${sampledIds.length} sampled · ${verdictIds.size} already verdicted · auditing ${toAudit.length} new`)
if (!sampledIds.length) {
  log(`ABORT — select produced no sample (no _sample.json); not dispatching the auditor.`)
  return { base, batch_ids: targetIds, transform: { ok: tfOk.length }, floor, repair_passes: repair, sampled: 0, aborted: 'no_sample' }
}

// ---- Phase 4b: auditor fan-out over NEW sampled rows lacking a verdict (PAID, Opus) ----
phase('Auditor')
const auPrompt = (id) =>
  `Harmonization AUDIT pass for contradiction ${id}.\n` +
  `1) Read data/harmonization/AUDITOR_SPEC.md IN FULL (the verdict checks + the PPF output contract + numeric codebook).\n` +
  `2) Read ${AUDIT_DIR}/work/${id}.json (it embeds question/summary/poles/excerpts with the FULL source_note_text — work ONLY from it; do not fetch the DB).\n` +
  `Judge each excerpt (in_source / on_tension / pole_label / overall / action) and the per-row guardrails (parity, connectives, named_skeptic, discrepancy_integrity, deeper_learning). Verify every named skeptic is a REAL critic who actually engaged this passage and that deeper_learning pd_work + any link are real and on-topic (WebSearch/WebFetch). Be a skeptic — default to flag/fail when genuinely unsure. You diagnose; you do NOT rewrite excerpts.\n` +
  `3) Write the verdict as RAW PPF (no markdown fences, no headers, no prose) EXACTLY per the spec to ${AUDIT_DIR}/verdicts/${id}.ppf — one E line per excerpt + exactly one G line.\n` +
  `Return {id, excerpts:<number of E lines>, wrote_ppf:true}.`

const auResults = toAudit.length
  ? (await parallel(toAudit.map(id => () =>
      agent(auPrompt(id), { agentType: 'biblical-scholar-auditor', model: 'sonnet', label: `au:${id}`, phase: 'Auditor', schema: AU })
    ))).filter(Boolean)
  : []
log(`auditor: ${auResults.filter(r => r.wrote_ppf).length}/${toAudit.length} new verdicts written`)

// ---- Phase 5: cumulative report ($0) ----
phase('Report')
const rep = await agent(
  `Generate the cumulative harmonization audit report. Use the Bash tool from the repo root:\n` +
  `  MACHINE_DIR=${MACHINE_DIR} GATHER_DIR=${GATHER_DIR} AUDIT_DIR=${AUDIT_DIR} HARMON_BASE=${base} REF_DB=./bible_reference.db IDS=${targetIds.join(',')} MODE=report python .scripts/auditHarmonization.py\n` +
  `Then read ${AUDIT_DIR}/audit_summary.json and ${base}/AUDIT-report.md. Return done:true plus the overall pass/flag/fail excerpt counts and a short summary string of the guardrail tallies.`,
  { agentType: 'general-purpose', label: 'report', phase: 'Report', model: GLUE, schema: REPORT }
)

const doneAfter = doneIds.size + tfOk.length
return {
  base,
  batch_ids: targetIds,
  progress: { corpus: gatherIds.length, done_before: doneIds.size, done_after: doneAfter, remaining: Math.max(0, gatherIds.length - doneAfter) },
  transform: { ok: tfOk.length, not_ok: tfErr.map(r => ({ id: r.id, status: r.status })) },
  floor: { passed: floor.passed, checked: floor.checked, failed: floor.failed, repair_passes: repair },
  audit: { sampled: sampledIds.length, already_verdicted: verdictIds.size, new_verdicts: auResults.filter(r => r.wrote_ppf).length },
  report: rep,
}
