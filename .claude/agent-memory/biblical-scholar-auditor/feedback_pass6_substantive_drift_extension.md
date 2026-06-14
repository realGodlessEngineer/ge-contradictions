---
name: Pass-6 substantive drift extends beyond pass-5 classes
description: After pass-5 surfaces commentary-array series mismatch and German term garbling, pass-6 catches additional substantive classes
type: feedback
---

Pass-6 of batch_18 caught 8 additional errors after pass-5's 3. Trajectory: 1=4, 2=1, 3=2, 4=0, 5=3, 6=8. This breaks pattern expectation and signals that pass-5's discovery of NEW classes (commentary-array series mismatch; German garbling; three-name parity gap) opens an entire new audit dimension.

**New classes surfaced in pass 6:**

1. **Chapter-distance numerical drift** — AI inserts plausible round numbers ("twelve chapters later") without computing actual distance. Pattern: cross-chapter references in commentary prose.

2. **Hebrew transliteration with spurious particles** — AI inserts non-existent prefix particles. Entry 359: Prov 23:4 transliterated "al-tigh ki-le-ha'ashir" when MT is אַל־תִּיגַע לְהַעֲשִׁיר (no "ki-" present in Hebrew text).

3. **Multi-name parity in 4 separate entries simultaneously** — pass-5 caught 1 instance; pass-6 found 4 more (entries 349, 350, 355, 356, 360). The three-name parity rule applies more aggressively than initial pass-3 discovery suggested.

**Why:** Pass 4's false-zero was followed by pass-5 finding 3, then pass-6 finding 8. This non-monotonic behavior shows that batches with AI-drafted commentary contain layered errors at multiple plausibility-depths. Surface errors (citations) clear first; semi-deep errors (parity, series-name) clear in middle passes; deepest errors (numerical drift, transliteration micro-errors) only surface when explicitly hunted.

**How to apply:**
- After any non-zero pass, expect the NEXT pass to find at LEAST as many errors via cascaded class discovery.
- Do not declare convergence on a single zero-pass unless preceded by a multi-pass plateau of zero or near-zero.
- Specific recurring forms to sweep: chapter-distance, Hebrew/Greek transliteration micro-errors, paired-attribution parity, orphan-prose-claim.
