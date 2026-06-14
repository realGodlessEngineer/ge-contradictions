---
name: Pass-10 batch_19 final cap-pass chapter arithmetic + Greek word order + intra-entry consistency
description: Pass-10 batch_19 final pass under 10-pass cap caught 3 residuals after pass-9=5; Greek/Hebrew transliteration class still surfacing
type: feedback
---

Pass-10 of batch_19 returned 3 errors after pass-9 = 5. Final pass under 10-pass cap. Trajectory: 2,1,3,0,4,1,5,4,5,3. Total bugs across 10 passes: 28. Greek/Hebrew transliteration class STILL not fully exhausted at termination.

**Errors found in pass 10**:

1. **Chapter-distance arithmetic** (entry 361): "Then jump three chapters back to Proverbs 13:8" for the 21:18 → 13:8 distance. Actual distance is eight chapters (21 - 13 = 8), not three. Fix: "Then jump eight chapters back to Proverbs 13:8." This is the chapter-arithmetic class which has now persisted through 10 passes (memory pattern `feedback_pass15_chapter_arithmetic_persists.md` extended).

2. **Hebrew transliteration intra-entry consistency** (entry 373): "lo' yireh ge'ut YHWH doesn't admit of partial vision" for Isa 26:10 recap. MT has בַּל־יִרְאֶה גֵּאוּת יְהוָה — "bal-yireh" not "lo' yireh". The entry's own earlier transliteration two paragraphs up correctly has "bal-yireh ge'ut YHWH"; the recap silently substituted "lo'" for "bal-" as if using "lo'" as colloquial English-negation paraphrase. This is the intra-entry transliteration consistency pattern (memory `feedback_pass19_transliteration_internal_consistency.md`). Fix: "bal-yireh ge'ut YHWH doesn't admit of partial vision."

3. **Greek word-order** (entry 363): "thelei pantas anthropous sothenai" for 1 Tim 2:4 — both NA28 and TR have πάντας ἀνθρώπους θέλει σωθῆναι. Object precedes verb, not English SVO. This is the same Greek word-order class that produced 2 errors in pass 8 (1 Thess 5:21, 1 John 4:1) and 1 in pass 9 (Luke 21:11). Fix: "pantas anthropous thelei sothenai".

**Why:** Greek word-order class has now produced 4 errors across passes 8-10 (1 Thess 5:21, 1 John 4:1, Luke 21:11, 1 Tim 2:4). The pattern is consistent: when the author transliterates Greek and includes an English gloss, they sometimes reorder to English SVO. The detection method that works is: for each transliteration with both subject/object/verb visible, check NA28 word order. Hebrew transliteration intra-entry consistency is a related but distinct sub-class. Chapter-distance arithmetic is the longest-standing residual class.

**How to apply:**
- For final cap-passes, do a fresh sweep of EVERY Greek transliteration with subject/object/verb structure — verify each against NA28.
- For Hebrew negation transliterations, verify negation particle matches MT (bal- vs. lo-).
- For chapter-distance claims ("X chapters apart/back/away"), verify arithmetic against actual cited chapters.
- Cap-reached without convergence at 0 is a NORMAL outcome for complex batches with multi-layered transliteration claims.

**Cap-reached assessment:**
- (a) Convergence at 0? NO — 3 residual errors caught and fixed in pass 10.
- (b) Severity? All MEDIUM — chapter arithmetic, Hebrew intra-entry consistency, Greek word order. None affect core theological argument; all are precision errors in transliteration/arithmetic.
- (c) Recommendation? After 28 bugs across 10 passes, the residual rate has stabilized around 3-5 per pass with no monotonic decrease. Further passes likely catch 1-3 more per pass before true convergence. AUDITED (10-pass cap) status appropriate; remaining residuals (if any) are precision-class, not substantive misinformation.

Pass-10 trajectory: 2,1,3,0,4,1,5,4,5,3. 10/10 used. CAP REACHED.
