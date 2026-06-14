---
name: Chapter-distance numerical drift
description: AI prose drafts get inter-chapter distance arithmetic wrong; verify every "N chapters later/earlier" claim
type: feedback
---

AI-drafted prose commentary contains numerical errors in inter-chapter distance phrases. Discovered in batch_18 pass 6:

1. Entry 346: "twenty chapters later in Matthew 23:17" — actually Matt 5:22 → Matt 23:17 is 18 chapters (corrected).
2. Entry 348: "Luke 13:24, twelve chapters later" — Luke 11:9-10 → Luke 13:24 is 2 chapters (corrected).

**Pattern:** AI drafts generate plausible-sounding round numbers ("twelve," "twenty") for chapter distances without computing them. The error is silent unless explicitly checked.

**Why:** Pass-5 substantive drift class extends to numerical claims about textual structure, not just translation/quotation accuracy. These are easy to miss because they sound natural.

**How to apply:** When prose says "X chapters later/earlier" or "N verses after," compute the actual chapter difference. Flag round numbers especially. Common drift forms:
- "two/twelve" confusion (one digit off)
- "ten/twenty" rounding inflation
- Cross-gospel mixed counting (Matthew chapter span used while comparing Luke verses)
