---
name: Pass-8 batch_25 broke pass-7 false zero — D-A anchor + Greek verb form
description: Pass-8 of batch_25 caught two real bugs after pass-7 returned provisional zero; confirms false-zero pattern
type: feedback
---

Batch 25 trajectory: 1, 11, 6, 1, 1, 1, 0, 2.

Pass-7 returned a provisional zero but flagged entry 485's D-A pp. 666-689 as "borderline." Independent pass-8 sweep confirmed two substantive errors:

1. **Entry 485** D-A ICC Matt Vol 3 cited "pp. 666-689" for Matt 28:16 Galilee mountain appearance / Great Commission. Per the established anchor table, Empty Tomb 28:1-15 = pp. 659-675, Great Commission section LXXXIX = pp. 676-694. The cited range started 10 pages too early, spanning the end of the Empty Tomb section. Fixed to pp. 676-689.

2. **Entry 498** Greek transliteration "anastasai" used as "they stood up" (3rd plural aorist active of anistēmi). The correct form is `anestēsan` (3rd plural aorist), parallel to the contrasting `epestēsan` in the same sentence. "anastasai" is not a valid Greek form for the intended meaning.

**Why:** Pass-7 had directed verification of D-A anchors but stopped at "borderline" without committing to fix. Pass-7 also performed Greek transliteration spot-checks but missed the anastasai/anestēsan error in entry 498 (possibly because anastasai resembles "anastasis"/"anastasia" so passed surface plausibility but fails morphological parsing).

**How to apply:** When a prior pass marks a citation "borderline," pass-N+1 must resolve it (commit fix or accept) rather than punt. For Greek transliterations, do not just spot-check by recognition; parse the morphology required by the surrounding English gloss ("they stood up" requires 3pl aorist active = anestēsan; infinitive = anastēnai). Confirms batch_25 false-zero behavior matches batch_24 pattern: single 0 after multi-pass plateau is provisional, not terminal.
