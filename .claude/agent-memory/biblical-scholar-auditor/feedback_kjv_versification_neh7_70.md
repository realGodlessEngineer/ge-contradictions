---
name: KJV vs ESV/BHS versification of Nehemiah 7:70 treasury gift
description: Neh 7:70 governor's gift differs between KJV (530 garments) and ESV/BHS (30 garments + 500 minas silver); audit against the source's own translation
metadata:
  type: feedback
---

Nehemiah 7:70 (the Tirshatha/governor's treasury gift) is rendered differently across translation traditions because of a text-critical decision on the same Hebrew consonants:
- **KJV:** "a thousand drams of gold, fifty basons, **five hundred and thirty priests' garments**" (no silver figure for the governor).
- **ESV / BHS-following:** "1,000 darics of gold, 50 basins, **30 priests' garments and 500 minas of silver**" (splits the 530 into 30 garments + 500 minas silver).

Both are defensible readings of the consonantal text. Do NOT flag a commentary's "530 garments" as a factual error if the source content uses KJV.

batch_03 entry 335 commentary used the KJV figures (governor 1,000 drams gold / 50 basons / 530 garments; heads 20,000 drams gold / 2,200 pounds silver; people 20,000 drams gold / 2,000 pounds silver / 67 garments). Arithmetic rebuttal: gold strata = 41,000 (vs Ezra's 61,000), silver = 4,200 (vs 5,000), garments = 530+67 = 597 (vs 100). All correct under KJV.

**Why:** batch_03 pass-1 audit flagged entry 335's "530 garments" as HIGH "garbled figures" by comparing against ESV/Hebrew versification. False positive — the source consistently uses KJV (the answers quote KJV), so KJV figures are the correct baseline.

**How to apply:** Before flagging treasury/donation figures in Ezra 2:69 // Neh 7:70-72, identify which translation the source uses (check the `answers` / `answer_explanation` quotations). Audit the commentary's numbers against THAT translation, not your default ESV. This is an instance of the general "respect translation differences" rule applied to a versification split.
