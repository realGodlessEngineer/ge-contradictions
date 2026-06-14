---
name: project-enrichment-classification
description: Schema and patterns for the enrichment_map.json classification task (contradiction_type, difficulty/notoriety levels, resolution_category per answer)
metadata:
  type: project
---

The enrichment pipeline has a classification layer stored in `data/enrichment_map.json`. Input is `data/enrichment_work.json` which contains codebooks and contradiction records.

## Key schema insight: answers[] are raw biblical positions, not harmonizations

The `answers[]` in `enrichment_work.json` are the competing biblical statements that constitute the contradiction — they are scraped positions from the source site, NOT apologetic reconciliation attempts. Because they make no reconciliation argument, virtually all of them will receive `resolution_category: "concedes_difficulty"`. The exception arises only when an answer_explanation explicitly deploys a harmonization strategy (e.g., id 7 in contradiction 2, where 1 Cor 8:6 splits creation "from" the Father/"through" the Son, which functions as `contextual_harmonization`).

**Why:** The source data is structured as "here are the competing Bible answers," not "here are apologist responses." Apply `concedes_difficulty` as the default; override only when the answer_explanation text itself makes a recognizable harmonization move.

**How to apply:** Before assigning any non-`concedes_difficulty` category to an answer, confirm the answer_explanation text contains an actual reconciliation strategy, not just a verse citation.

## Precedence rules for contradiction_type (confirmed in practice)

- `compositional` wins when the tension is a P/J or other source-critical doublet — even when the surface looks chronological or factual. IDs 5, 6, 7 are all compositional despite having concrete factual conflicts because the mechanism is two independent traditions spliced together.
- `chronological` is correct for timing/sequence conflicts that are NOT reducible to source seams (IDs 1, 3, 4 — even ID 4 lives entirely within P).
- `theological` for God-nature and Christological conflicts (IDs 2, 8).
- `ethical_legal` for dietary and purity-law conflicts (IDs 9, 10, 11).
- `genealogical` for name/lineage discrepancies (ID 12).

## Observed difficulty patterns

- Pure within-chapter Genesis conflicts (same day/different day): difficulty 2
- Cross-chapter or two-book conflicts requiring background: difficulty 3
- Conflicts requiring ANE culture, Hebrew terminology (chatat, lebaddi), or divine council scholarship: difficulty 4
- Source-critical conflicts (P/J seam) that are otherwise obvious: difficulty 2-3 depending on how widely taught the seam is

## Notoriety patterns

- Genesis 1 vs. 2 creation order (humans before/after animals): 5 — canonical DH example
- Dietary laws across canon: 4 — staple of debates
- Monotheism vs. divine council, creator attribution: 4 — frequent in Christology and monotheism debates
- Within-Genesis cosmological minutiae (light divided when, stars when): 2-3
- Obscure genealogical discrepancies (Timna): 1

## Full-dataset type distribution (605-entry pass, June 2026)

factual_historical: 132 | theological: 126 | ethical_legal: 102 | numerical: 76 | compositional: 70 | genealogical: 46 | chronological: 40 | geographical: 13 | translational: 0 | textual_variant: 0

Difficulty: 1→53, 2→337, 3→206, 4→9, 5→0
Notoriety: 1→112, 2→269, 3→159, 4→51, 5→14

## ID-gap note
id 385 does not exist in contradictions.db (confirmed absent from enrichment_work.json). Classification maps cover 1–606 skipping 385 for a total of 605 entries.

## Compositional usage patterns confirmed at scale

All Synoptic divergent-parallel accounts (Passion narrative, birth narrative, calling of disciples, healing accounts) are `compositional`. These include:
- Matthew vs Luke Nativity (ids 391-394)
- Four-gospel Passion sequence (ids 456-485)
- Synoptic healing parallels (ids 422-423, 447, 490, 509)
- P/J creation doublets (ids 4-7, 10, 14-17, 19, 26, 88-89)

Use `factual_historical` (not `compositional`) for single-author inconsistencies, even inside Samuel-Kings-Chronicles parallels where the surface looks like two-source.

## Ezra-Nehemiah numerical cluster (ids 318-335)
All eighteen "how many of X's offspring returned from Babylon?" questions are `numerical` difficulty 1 notoriety 1 — pure number disagreements between Ezra 2 and Nehemiah 7 lists.

## Related memories
[[project-audit-metrics-log]]
