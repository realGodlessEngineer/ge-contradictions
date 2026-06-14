---
name: CBQ journal first-page off-by-one pattern
description: AI-drafted CBQ/JBL/ZAW page ranges sometimes start one page late; verify against ProQuest/JSTOR
type: feedback
---

CBQ (and other biblical journal) article citations carry a hidden first-page precision risk: AI-drafted citations sometimes start the page range one off (e.g., 436-456 instead of correct 435-456).

**Why:** Journal article first pages often contain only the title, author, and abstract — body text starts on the next page. A casual scan reads the body-text start as the article start, producing a +1 off-by-one error.

**How to apply:** In late audit passes, verify journal article opening pages against ProQuest or JSTOR records rather than copying from secondary citations. Specifically caught in batch_11 pass 7: Wilson, "Pugnacious Precursors," CBQ 68 (2006) — drafted as 436-456, corrected to 435-456 per ProQuest.
