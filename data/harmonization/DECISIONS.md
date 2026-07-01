# Harmonization excerpt sweep — owner decisions

The 17-row sample first-pass cleared the verbatim/PD/traceable bar (47/47), and a
sampled agent audit proved Decision A end-to-end (27 pass / 1 flag / 0 fail). On
the back of that, the owner settled posture, the discrepancy pole, five curation
guardrails, and a deeper-learning balance fix.

## A — verification posture → **machine-excerpt + sampled audit**

1. **Mechanical floor — 100% of excerpts** (`verifyExcerpts.py` /
   `auditHarmonization.py`): verbatim + PD + traceable. Hard gate.
2. **Agent audit — a stratified sample** (`auditHarmonization.py` +
   `AUDITOR_SPEC.md`): on-tension, pole-label, connective accuracy, named-skeptic
   reality, deeper-learning balance. Deterministic, stratified by consensus tier
   and voice, 100% of discrepancy + discrepancy-leaning rows, ≥1 per
   contradiction, target `AUDIT_RATE` (0.25).

## B — discrepancy pole → **leave thin, refined by the guardrails: "439 model + relabel fallback"**

No manufactured verbatim PD critic *excerpts*, no critics corpus. But **thin ≠
blank**: a thin discrepancy pole names the strongest **real** skeptic who actually
engaged the passage and gives their objection as an **attributed connective**
(paraphrase, not a quote — the id-439 model). If a real-contradiction row has no
honestly-nameable skeptic and only harmonizers, set `relabel_flag` (route to a
human to reconsider the consensus) — never co-opt it with harmonizers. The DB is
never auto-relabeled.

## Curation guardrails (the acceptance bar — all five enforced)

Handed down to keep the surface honest; encoded in `TRANSFORM_SPEC.md` /
`AUDITOR_SPEC.md` and scanned mechanically by `auditHarmonization.py`:

1. **On-tension quotes only** — not generic verse-notes. *(auditor: on_tension)*
2. **Leaning pole not out-quoted (parity)** — `lean` pole content count ≥ the
   other; cap reconcile on `discrepancy_first` rows. *(mechanical + auditor)*
3. **Thin/empty pole is never blank** — 439 model: cite the strongest skeptic who
   looked. *(mechanical non-blank + auditor reality)*
4. **Never co-opt a real-contradiction pole with harmonizers** — real critic, or
   honest relabel flag. *(mechanical + auditor)*
5. **Every filled pole gets a connective half-line** so it argues, not just
   quotes; no overclaiming (the id-470 lesson). *(mechanical presence + auditor
   accuracy)*

The harness also flags **lean mislabeled vs consensus** (a wrong `lean` silently
defeats parity — caught 87 and 298 in the pilot sample).

## Deeper-learning exits — defense side (backlog #36)

Dana, Hannah, and the Inerrantist independently flagged that every "go deeper"
exit served the critic (SAB outbound + essay sources) with no defense path. The
transform agent now also emits a `deeper_learning.defense` resource per row — a
real, attributed apologetic/harmonizing treatment of that contradiction, mirroring
the critic exit. **Owner policy (settled 2026-06-14): "PD work + curated live
link"** (`deeper_learning_policy.json`) — `deeper_learning.defense.pd_work` is
REQUIRED (canonical default John Haley, 1874; a harmonizing commentator surfaced on
the row also qualifies, and is preferred when Haley's coverage of the specific
passage can't be confirmed), plus an OPTIONAL `link` whose domain is on the
allowlist (`gotquestions.org`, `carm.org`, `defendinginerrancy.com`). Auditor
verifies both are real and on-topic; the harness flags a missing pd_work or an
off-allowlist link.

## Status of the 17-row sample vs the guardrails — RE-PASS DONE (2026-06-14)

The guardrail-compliant re-pass is **complete and converged to zero**:

- **Mechanical floor:** 36/36 verbatim+PD+traceable (`verifyExcerpts.py` agrees).
- **Mechanical guardrail scan:** lean-wrong 0 · parity 0 · connective-missing 0 ·
  discrepancy-blank 0 · defense-exit-missing 0 · link-offlist 0.
- **Agent audit (17/17 sampled excerpts):** overall pass 17 / flag 0 / fail 0;
  on_tension 17/17; pole_label correct 17/17. Guardrail block: parity 17 ok ·
  connectives 17 ok · named_skeptic 17 ok · discrepancy_integrity 17 ok ·
  deeper_learning 17 ok.
- **What the agent layer caught (and a machine could not):** the first audit pass
  flagged 3 real defects — false-concession **strawman** connectives on 214 and 439
  (claimed the SAB/Wells *conceded* a harmonization it never makes) and an
  **unverifiable** Haley-1874 pd_work on 468. All three were corrected (plain
  discrepancy connectives; 468 pd_work → Adam Clarke on John 19:17) and re-audited
  to all-ok. This is the proof that sampled audit adds judgment the floor cannot.
- **Harness changes this pass:** `select()` now embeds the full reconcile/discrepancy
  pole objects + `deeper_learning` into each work file; `report()` aggregates the
  auditor's per-contradiction `guardrails` block into `AUDIT-report.md`.

Decision A + all 5 guardrails + #36 are now proven end-to-end on the sample, the
way they will run at 605.

## Token-cost optimization (2026-06-15) — built, tested, paid run still held

Input dominates cost (~86%), so the levers target it. Four shipped, all
format-agnostic and back-compatible (old fat files still verify):

1. **Note trimming** (`sweepHarmonization.py`, `TRIM_PER_CELL`, default 4) — caps
   notes per (voice, book, chapter) cell, keeping the most on-tension first (direct
   hits > anchor blocks > nearest PAD neighbors). Dropped 10,167 / 50,959 notes
   (20%); logged, never silent. Tunable down (3/2) to shave the tail further.
2. **Lean by_id + voice codebook** (`sweepHarmonization.py`) — notes drop per-note
   author/work/year/attribution/license (→ embedded `voices` codebook keyed by
   `src`) and book/chapter/verse (encoded in `ref`+`note_ref`). Note `text` stays
   JSON-quoted (verbatim-safe). Codebook resolver: `harmonLib.py`.
3. **PPF auditor verdicts** (`AUDITOR_SPEC.md` → `.ppf`, decoded by `ppf.py` +
   `auditHarmonization.load_verdict`) — enum-heavy verdict in Positional Pipe
   Format (codes, not words) + a reason-length rule (tight on pass/ok, full only on
   flag/fail). `report()` reads `.json` and `.ppf`. Toolkit at `.scripts/ppf-toolkit/`.
4. **Lean machine output** (`TRANSFORM_SPEC.md`) — excerpts emit only pole/
   source_code/verse_ref/excerpt_text/full_note_ref/on_tension_rationale/
   verify_state; attribution/license/contradiction_id resolved downstream
   (`verifyExcerpts.py`, `auditHarmonization.py`, `reportHarmonizationSample.py`).

Result: full-corpus gather **28.0M → 20.4M tok (27% smaller)**; heavy tail cut
(id 37 806k→465k). Est. paid run now **~$300-360 Batch API** (was ~$420-470) /
**~$950-1,200 Claude Code agents**. Bonus: `HARMON_BASE` env added so isolated/pilot
report runs no longer clobber the real `AUDIT-report.md`; UTF-8 stdout on Windows.

## Run order for the full 605 (when greenlit — owner said hold off)

```
ALL=1 python .scripts/sweepHarmonization.py          # gather all 605 LEAN+TRIM (read-only on both DBs)
# transform agents over gather/by_id/<id>.json per the UPDATED TRANSFORM_SPEC.md
#   (lean excerpts + connectives + 439-model skeptic + relabel flags + deeper_learning.defense)
python .scripts/verifyExcerpts.py                    # mechanical verbatim floor (must be 100%)
python .scripts/auditHarmonization.py                # floor + guardrail scan + stratified sample
# auditor agent over audit/work/*.json per AUDITOR_SPEC.md -> writes verdicts/<id>.ppf
MODE=report python .scripts/auditHarmonization.py    # -> AUDIT-report.md + audit_summary.json
```
