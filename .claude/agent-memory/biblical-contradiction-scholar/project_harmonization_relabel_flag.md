---
name: harmonization-relabel-flag-no-skeptic
description: TRANSFORM pass — when a discrepancy_first row has no verifiable named skeptic, use empty pole + relabel_flag instead of inventing a critic
metadata:
  type: project
---

On a `discrepancy_first` TRANSFORM row, if no real named skeptic can be verified as
having engaged THAT specific passage (only the anonymous SAB / skeptic tradition lists
it), set the discrepancy pole `status:"empty"`, `relabel_flag:true`, with an
`empty_note` and a `relabel_reason` — NEVER fabricate a 439-model skeptic to fill it.

**Why:** Spec guardrail 4 + charter rule "never invent a critic." Routes the row to a
human to decide if the consensus label (often `probable_contradiction`) overstates a
soluble number/convention case the commentators (JFB/Gill) already dissolve.

**How to apply:** Worked on id 209 (Gideon's seventy sons, Judges 8:30 vs 9:5). Numbers
contradictions with named PD harmonizers but no citable named critic are the typical
trigger. Then: parity-cap reconcile to the single strongest excerpt (don't out-quote an
empty pole), and use a row-surfaced harmonizing commentator (JFB on the exact verse) as
`pd_work` when Haley's specific-passage coverage can't be confirmed. Omit the optional
link when no allowlisted page actually treats the numeric discrepancy (GotQuestions'
Abimelech page does NOT). See [[project_harmonization_transform]],
[[project_harmonization_zero_notes]].
