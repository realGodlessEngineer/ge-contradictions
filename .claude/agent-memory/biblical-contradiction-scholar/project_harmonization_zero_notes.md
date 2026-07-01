---
name: harmonization-zero-notes
description: TRANSFORM-pass handling when a gather/by_id/<id>.json has zero notes (excerpt-less machine file); worked example id 92 Gen 46:15 Leah subtotal
metadata:
  type: project
---

How to TRANSFORM a harmonization row whose gather file carries **no notes**. Companion to [[harmonization-transform]] (the general per-row conventions). Split into its own file because the shared transform file is frequently rewritten by concurrent runs and Edits there lose the race.

**Why:** some gather files come through with `note_count: 0` / `notes: []` / `voices: {}` because the row's bible references were never resolved to locators (they appear under `unresolved_refs` with `reason: "no locator"`). With no note `text`, the only legal source for `excerpt_text` is absent, so no verbatim excerpt can exist.

**How to apply (zero-notes rows):**
- Emit `excerpts: []`. Do NOT manufacture or paraphrase an excerpt — verbatim-from-note is non-negotiable (spec charter rule 1).
- The reconcile pole becomes `status: "empty"` with a populated `empty_note` (NOT `filled` — `filled` requires ≥1 gathered verbatim excerpt). In the `empty_note`, you may describe the standard harmonization in prose (it is a machine note, not a shipped excerpt) and point to the pd_work that carries it.
- The row then leans entirely on the named-skeptic discrepancy pole + the required `pd_work`. Parity still holds trivially: reconcile content count 0 ≤ discrepancy content count 1.
- On a `discrepancy_first` zero-notes row the discrepancy pole MUST still be `named_skeptic` with a real critic (guardrail 4) — `relabel_flag` only if no honest skeptic exists.

**Worked example — id 92, "How many descendants of Jacob and Leah went to Egypt with Jacob?" (Gen 46:9-15a names 32 vs Gen 46:15b states 33), probable_contradiction → discrepancy_first:**
- Named skeptic = **Steve Wells / The Skeptic's Annotated Bible**, page `skepticsannotatedbible.com/contra/jacob-leah.html` (VERIFIED — the row's `question` is verbatim that SAB page title, so Wells is the unambiguous upstream source). Objection = the plain arithmetic: only 32 names are listed, yet v.15b says 33.
- `pd_work` = **John Gill on Genesis 46:15** (verified verbatim: "it seems best therefore to take Jacob himself into the account ... which will make thirty three"; excludes Er & Onan who died in Canaan). Row-surfaced harmonizer used because Haley's coverage of THIS specific subtotal could not be confirmed (per the id-13 lesson). Barnes, Ellicott, K&D, and Poole all run the same "+Jacob himself = 33" math, so the harmonization is solidly attested even though no note was gathered.
- `link` OMITTED (url null): no allowlisted page (gotquestions / carm / defendinginerrancy) engages the 33-vs-32 Leah subtotal.
- **TRAP:** the famous, heavily-blogged Gen 46 number crux is the SEPARATE 70-vs-75 / 66-vs-70 GRAND TOTAL (Gen 46:26-27 / Exod 1:5 / Acts 7:14; DiMattei #76 "Was it 66 OR 70 OR 75…"; defendinginerrancy `Acts_7.14.php`). Do NOT co-opt that skeptic or those allowlist pages for the 33-subtotal row — different contradiction, different verses.
