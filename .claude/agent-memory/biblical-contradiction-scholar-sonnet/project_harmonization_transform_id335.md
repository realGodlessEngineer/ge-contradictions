---
name: project_harmonization_transform_id335
description: TRANSFORM leg worked id 335 (treasury gold/silver/garments totals, Ezra 2:69 vs Neh 7:72) — Haley page-specific hit, SAB-as-skeptic confirmed, no allowlisted link found
metadata:
  type: project
---

Standalone note (written to avoid an edit race with concurrent workers on
[[project_harmonization_transform_ezra_nehemiah_cluster]], which several other id-workers were
editing simultaneously on 2026-07-02) — fold this into that shared cluster file's "adjacent
id" list next time it's touched serially.

## Id 335 — treasury gold/silver/garments totals, Ezra 2:69 vs Neh 7:72
Question: "How much gold, silver, and clothing did the people give?" Not in the 318-330
clan-total range — the single donation-totals line item (Ezra 2:69's 61,000 darics/5,000
mina/100 garments vs. Neh 7:72's 20,000/2,000/67), confirmed via grep the **only** id citing
this exact ref pair. `gather/by_id/335.json` carries yet another distinct note set (GILL, JFB,
CLARKE, KD, MHC, TYN, GNV on Ezra 2:66-70/Neh 7:70-73/7:5) — no JFB/16/7/5 general note present
here; check per-id, don't assume reuse across this whole Ezra/Nehemiah family.

- **Reconcile excerpt**: `KD/15/2/68` (block-anchored) directly walks the arithmetic —
  Nehemiah's three-part breakdown (Tirshatha 1,000/500/30 + heads 20,000/2,200 + people
  20,000/2,000/67) sums to 41,000 darics/4,200 mina/97 garments; K&D call Ezra's 61,000 a
  copyist's mistake for 41,000 and Ezra's round 5,000/100 rounded figures for 4,700/97.
  Strong, self-contained, verbatim-quotable — the money-quote sentences run from "According to
  this statement, the Tirshatha..." to "...round sum of 5000." (genuine sentence end, no
  ellipsis needed).
- **Discrepancy pole (named_skeptic, 439 model) — SAB confirmed.** WebFetch of
  `skepticsannotatedbible.com/contra/gold.html` confirmed the page title is a **verbatim
  match** to this row's `question`, quotes both verses, and calls them a direct contradiction —
  same scraper-provenance pattern as other SAB-sourced ids in this family (313, 331, 333 per
  [[project_harmonization_transform_ezra_nehemiah_cluster]] and
  [[project_harmonization_machine_pass]]). Used **Steve Wells, Skeptic's Annotated Bible
  (1999)**, attribution `"Steve Wells, Skeptic's Annotated Bible (1999), contra/gold.html"`.
- **`deeper_learning.defense.pd_work`**: **Haley confirmed page-specific**, not just the
  cluster's usual blanket-statement coverage — via curl+Grep of
  `examinationofall00hale_djvu.txt` (`https://ia601508.us.archive.org/10/items/examinationofall00hale/examinationofall00hale_djvu.txt`),
  immediately after his Arah clan-count discussion (pp. 380-382), Haley tabulates Ezra 2:69
  against Neh 7:70-72 line by line and endorses Keil & Bertheau's copyist-error/round-number
  reading — the *same* conclusion as the KD excerpt above. Search anchors that found it:
  `"41,000"` + `"Ezra, ii. 69"` + `"Nehemiah, vii. 70-72"` (a plain grep for `"drams of gold"` /
  `"priests' garments"` / `"61,000"` on the OCR'd text missed it — OCR renders the numeral as
  bare `41000`/`61000` without commas in places, so try both comma and no-comma forms).
  Notably stronger evidence than the clan-list ids' Haley citation (blanket sentence only) —
  Haley's coverage of this chapter is uneven: dedicated treatment for the treasury totals,
  only a blanket extension for the ~20 individual clan-count rows.
- **`deeper_learning.defense.link`**: checked CARM's clan-census page (the cluster's usual
  link) plus both `defendinginerrancy.com` Ezra/Nehemiah pages (`Ezra_2.1ff.php`,
  `Nehemiah_7.1ff.php`, both confirmed via WebFetch) and searched gotquestions.org directly —
  **none** specifically address the gold/silver/garments totals (they only cover per-clan
  population counts). Set `link: null` rather than force a mismatched citation — first
  documented case in this Ezra/Nehemiah family where no allowlisted link could be honestly
  supplied.
- Dry-run bake (`DRY_RUN=1 IDS=335 node .scripts/buildHarmonizationTables.js`) produced exactly
  the two expected pre-T9/T10 violations (`note_present`, `parity_count`) and
  `verifyExcerpts.py` 690/690 PASS — same clean pattern as other worked ids in this family.
