---
name: project_harmonization_transform_ezra_nehemiah_cluster
description: TRANSFORM (machine-excerpt) leg reusable pattern for the Ezra 2 / Nehemiah 7 census-list contradiction cluster (ids ~318-330); worked ids 326 (Adin), 325 (Bigvai) — Haley coverage correction
metadata:
  type: project
---

Companion to [[project_harmonization_dossier_t9]] and [[project_harmonization_dossier_t10]],
but for the **earlier TRANSFORM leg** (`data/harmonization/curation/machine/<id>.json`,
governed by `data/harmonization/TRANSFORM_CONTRACT.md`) rather than the dossier legs.

## The cluster
A run of contradiction ids in the ~318-330 range (confirmed via grep on
`data/harmonization/gather/by_id/*.json` for `"Ezra 2:1[0-9]"|"Nehemiah 7:1[0-9]"`:
318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, plus 192) are each **one clan-total
row** from the same Ezra 2 vs. Nehemiah 7 returnee-census comparison (Parosh, Shephatiah,
Arah, Pahath-Moab, Elam, Zattu, Bani, Bebai, Azgad, Adonikam, Bigvai, **Adin (326)**, Ater,
Bezai, Hashum, Bethel/Ai, ... — the same 33-row table K&D lay out side by side). Each id's
`gather/by_id/<id>.json` carries the **same shared commentary notes** (GILL, JFB, CLARKE, KD,
MHC, TYN, GNV on Ezra 2:1-6 / Nehemiah 7:5-6, block-anchored), because the PD commentators
wrote ONE general note covering the whole list, not one per clan — only the specific
verse/clan-number differs per id.

## Reusable TRANSFORM pattern (worked id 326, Adin, 454 vs. 655)
- **Reconcile excerpt**: `JFB/16/7/5` ("GENEALOGY OF THOSE WHO CAME AT THE FIRST OUT OF
  BABYLON") is the single best on-tension verbatim excerpt for **any** clan in this
  cluster — it explicitly says "the discrepancy is sufficiently accounted for from the
  different circumstances in which the two registers were taken... The lapse of so many
  years might well be expected to make a difference appear in the catalogue, through death
  or other causes; in particular, one person being... called by different names." This
  sentence pair is clan-agnostic (never names a specific clan), so the **identical verbatim
  excerpt_text** is legitimately reusable across every id in the cluster — id 330 (Senaah)
  used it first, id 326 (Adin) reused it verbatim. Only the row-level `connective` needs to
  name the id's specific clan/gap ("Adin's 201-person increase" vs. "Senaah's 300-person
  gap").
- **Discrepancy pole (named_skeptic, 439 model)**: **C. Dennis McKinsey, The Encyclopedia
  of Biblical Errancy (Prometheus Books, 1995)** — confirmed real via WebSearch, and a
  reasonable general-purpose citation for the whole cluster: it treats the Ezra/Nehemiah
  return registers as a set of numerical errors (per id 330's already-audited connective:
  "more than half of roughly thirty-five matched clan totals disagree"). Reuse this same
  citation per-id, swapping in that id's own gap number (e.g. "Adin's 201-person gap",
  "Senaah's 300-person gap"). This is a **TRANSFORM-leg** choice, not PD — the TRANSFORM
  contract's 439-model skeptic has no PD requirement (only `deeper_learning.defense.pd_work`
  does); PD verification only becomes mandatory later, at **T10**, if/when a dossier
  `discrepancy.quotes[]` verbatim critic quote is hand-sourced for one of these ids (id 330's
  own T10 pass used **Thomas Paine, The Age of Reason, Part II ch. I** instead — a real PD
  critic who discusses this exact list's internal-arithmetic problems generally, not
  clan-specific either; see [[project_harmonization_dossier_t10]] worked example id 330).
- **`deeper_learning.defense.pd_work`**: ids 326/330 used **Keil & Delitzsch, on Ezra 2:3
  (1861-75)** (the row's own harmonizing commentator) because a **WebSearch-only** check for
  Haley's coverage came back empty. **Correction, found working id 325 (2026-07-02):**
  Haley's *Examination of the Alleged Discrepancies* DOES cover this cluster — not via
  WebSearch (too shallow to surface it) but via curl+Grep of the full archive.org djvu text
  (`examinationof00hale_djvu.txt`): Haley names the **Arah** variant explicitly (Ezra 2:5
  "775" vs Neh 7:10 "652"), then adds a **blanket** sentence extending the same verdict to
  "the other cases, some twenty in number, which appear from a comparison of Ezra ii. 6-60,
  with Neh. vii. 11-67... to be explained in the same manner" (copyists' blunders) — this
  licenses Haley as `pd_work` for **every** clan in the list (Bigvai included), not just
  Arah, since the contract prefers Haley whenever his coverage can be confirmed. Going
  forward, use **Haley** (with a `note` honestly describing the blanket, non-clan-specific
  nature of his coverage, worded as id 325's file does) rather than K&D for any
  not-yet-processed id in this cluster (319, 320, 324, 327, 328, 329 as of 2026-07-02) —
  don't repeat the WebSearch-only check that missed this. (326/330 were shipped before this
  correction and were not revisited/re-audited as part of this note.)
- **`deeper_learning.defense.link`**: `https://carm.org/bible-difficulties/why-are-the-statistics-in-ezra-2-and-nehemiah-7-different/`
  — a live, general (not clan-specific) CARM apologetics page covering the whole
  Ezra-2-vs-Nehemiah-7 variance; reusable across every id in the cluster, confirmed live via
  WebSearch result listing both for id 330 and again independently for id 326.

## Parity outcome for this cluster
Pre-T9/T10, `DRY_RUN=1 IDS=<id> node .scripts/buildHarmonizationTables.js` on any of these
ids reports exactly the two **expected, not-a-bug** violations documented in
[[project_harmonization_dossier_t9]] (`note_present` on the reconcile pole, `parity_count`
discrepancy 0 < reconcile 1) — both defer to the later T9 (reconcile.note in the dossier)
and T10 (discrepancy.quotes[] verbatim critic quote) legs, not something to fix at the
TRANSFORM stage. `verifyExcerpts.py` should PASS (verbatim/PD/traceable floor) for the
single JFB excerpt every time, since it's copied byte-for-byte from the gather note.
