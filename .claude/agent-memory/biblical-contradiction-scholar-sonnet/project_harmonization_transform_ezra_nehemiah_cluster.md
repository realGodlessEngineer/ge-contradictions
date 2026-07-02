---
name: project_harmonization_transform_ezra_nehemiah_cluster
description: TRANSFORM (machine-excerpt) leg reusable pattern for the Ezra 2 / Nehemiah 7 census-list contradiction cluster (ids ~318-330, plus adjacent ids 331/333); worked ids 326 (Adin), 325 (Bigvai) — Haley coverage correction; 333 (Delaiah/Tobiah/Nekoda), 331 (Asaph's singers) — SAB-as-skeptic confirmed, GILL/16/7/6 reconcile excerpt reused
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

## Adjacent id 333 (Delaiah/Tobiah/Nekoda, Ezra 2:60 vs Neh 7:62, 652 vs 642) — worked 2026-07-02
Not in the 318-330 clan-total range (that's the 33-clan list at Ezra 2:3-35); this is the
separate "could not prove Israelite descent" combined-family entry at Ezra 2:59-60/Neh
7:61-62, so its `gather/by_id/333.json` carries a **different** note set (GILL, JFB, CLARKE,
KD, MHC, TYN, GNV on 2:59-62/7:5-6, no JFB general note on Neh 7:5 this time) — don't assume
the 326/330 JFB excerpt is present; check per-id.
- **Reconcile excerpt**: no clan-specific reconciling note existed, but **GILL/16/7/6**
  (Nehemiah 7:6, block-anchored) is a general Ezra-2-vs-Nehemiah-7 harmonization — "with some
  little difference of numbers and names... that list was made in Babylon... but this was made
  when they came to Jerusalem; now some of those that gave in their names changed their minds,
  and tarried in Babylon, and some might die by the way... and others... followed after and
  joined those which were returning" — trimmed to that span with leading+trailing `…` (starts
  and ends mid-sentence, GILL's run-on prose uses semicolons not periods internally). MHC/16/7/5
  had similar general content and would also have worked; only one is needed (parity cap).
- **Discrepancy pole (named_skeptic, 439 model) — SAB confirmed, not just McKinsey guess.**
  Verified via `WebFetch` that `skepticsannotatedbible.com/ezra/2.html?v=60` links a
  contradiction note titled **"How many children of Delaiah, Tobiah, and Nekoda?"** to
  `contra/delaiah.html`, whose question text is a **verbatim match** to this DB row's
  `question` field ("How many of Delaiah, Tobiah, and Nekoda's offspring returned from
  Babylon?") — strong confirmation this DB entry was scraped directly from that exact SAB page
  (consistent with `scrapeContra.js` sourcing from SAB). Used **Steve Wells, Skeptic's
  Annotated Bible (1999)**, attribution `"Steve Wells, Skeptic's Annotated Bible (1999),
  contra/delaiah.html"` — same format as the id-313 "sons of Heman" precedent in
  [[project_harmonization_machine_pass]]. Prefer this WebFetch-confirmation approach (checking
  the live SAB page for the row's own verse before defaulting to McKinsey) whenever a DB
  question's wording looks SAB-flavored — it's strictly stronger evidence than guessing
  McKinsey covers a passage (WebSearch could not confirm McKinsey treats this specific verse
  pair; SAB confirmation made that moot).
- **`deeper_learning.defense.pd_work`**: **Haley** confirmed via the same curl+Grep method as
  325/326 — his blanket sentence reads "The other cases, some twenty in number, which appear
  from a comparison of **Ezra ii. 6-60**, with Neh. vii. 11-67, are to be explained in the same
  manner" — the stated range's upper bound, **v. 60**, is exactly this row's verse, so Haley's
  coverage is textually confirmed to reach it (stronger than the clan-list ids, which are
  merely "within the range," not at its literal boundary).
- **`deeper_learning.defense.link`**: same CARM URL as the 318-330 cluster (still live, still
  on-topic — confirmed again via WebFetch, states "Of 39 entries (verses), 17 do not match").
- Dry-run bake (`DRY_RUN=1 IDS=333 node .scripts/buildHarmonizationTables.js`) produced exactly
  the two expected pre-T9/T10 violations (`note_present`, `parity_count`) and
  `verifyExcerpts.py` 690/690 PASS — same clean pattern as 313/325/326.

## Adjacent id 331 (Asaph's singers, Ezra 2:41 vs Neh 7:44, 128 vs 148) — worked 2026-07-02
Also outside the 318-330 clan-total range — this is the **Levites/singers** sub-list
(2:40-42), not the 33-clan laity list. `gather/by_id/331.json`'s JFB notes are both about
priestly courses (off-tension), so the 326/330 JFB/16/7/5 excerpt is **not available** here —
confirms per-id checking is required, not an assumption. Used the **same GILL/16/7/6** excerpt
already identified for id 333 (see above) — clan/row-agnostic, so it's a second confirmed
reuse of that quote outside the clan-total rows. K&D's own note on this row (`KD/15/2/40`)
contains a side-by-side Ezra/Neh table naming 128 vs. 148 explicitly but is purely
descriptive/taxonomic (identifies who "sons of Asaph" means, no reconciling or conceding
sentence) — correctly excluded as off-tension per charter rule 3 even though it states the
exact numbers. Discrepancy pole: **SAB confirmed directly** (not McKinsey) — `question` field
("How many of Asaph's offspring returned from Babylon?") is a verbatim match to SAB's own page
title at `contra/asaph.html` (found via `ezra/contra_list.html` entry #14) — same
WebFetch-confirmation approach as id 333, attribution `"Steve Wells, Skeptic's Annotated Bible
(1999), contra/asaph.html"`. `pd_work`: Haley's blanket range (`Ezra ii. 6-60` / `Neh. vii.
11-67`) covers verse 41 (inside the range, not at a boundary the way 333's v. 60 is) — Haley
never mentions Asaph/singers by name, only the blanket sentence, so say so honestly in the
note. Re-verifying the Haley quote by curl+Grep surfaced a **gotcha**: the archive.org djvu OCR
double-spaces every word (`"Ezra  ii.  6-60"`), so a tight single-space regex
(`"Ezra ii\. 6-60"`) false-negatives on both known mirrors (`examinationofall00hale` and
`examinationof00hale`) — re-locate by a single-word anchor (e.g. `Arah`, no internal spaces)
first, then read outward with `Read`/`-A`, rather than grepping the multi-word phrase directly.
`link`: same CARM URL, but this fetch's raw HTML only returned the lead paragraphs — the
actual comparison grid is gated behind a Cloudflare Turnstile wall — so item-specific coverage
of Asaph's singers could not be confirmed and the `link.note` says so rather than overclaiming;
the page itself is still real/live/on-topic (confirmed via 200-status curl + WebFetch, title
and intro match). Dry-run bake: `DRY_RUN=1 IDS=331 node .scripts/buildHarmonizationTables.js`
→ same two expected pre-T9/T10 violations, `verifyExcerpts.py` 692/692 PASS.

## Parity outcome for this cluster
Pre-T9/T10, `DRY_RUN=1 IDS=<id> node .scripts/buildHarmonizationTables.js` on any of these
ids reports exactly the two **expected, not-a-bug** violations documented in
[[project_harmonization_dossier_t9]] (`note_present` on the reconcile pole, `parity_count`
discrepancy 0 < reconcile 1) — both defer to the later T9 (reconcile.note in the dossier)
and T10 (discrepancy.quotes[] verbatim critic quote) legs, not something to fix at the
TRANSFORM stage. `verifyExcerpts.py` should PASS (verbatim/PD/traceable floor) for the
single JFB excerpt every time, since it's copied byte-for-byte from the gather note.
