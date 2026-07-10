---
name: Luther strawy epistle quote source
description: Luther has TWO distinct 1522 prefaces (NT vs James/Jude) — quotes routinely get attributed to the wrong one
type: feedback
---

Luther wrote two separate 1522 prefaces that both get cited (and confused) for his anti-James polemic:
- **Preface to the New Testament** (LW 35: 357-362) — home of the "right strawy epistle" (*eyn rechte stroern Epistel*) line.
- **Preface to the Epistles of St. James and St. Jude** (LW 35: 395-398) — home of "it is flatly against St. Paul and all the rest of Scripture in ascribing justification to works" (confirmed verbatim via pristinegrace.org, "Preface to the Epistle of James").

**Why:** Encountered twice now. batch_28 entry 542: commentary quoted the "strawy" phrase but scholarship cited only the James/Jude preface (should be the NT preface). Harmonization id 560 (Rahab faith-vs-works, discrepancy pole named_skeptic=Luther): the "ascribing justification to works" quote was mislabeled `skeptic.work = "Preface to the New Testament (1522 ed.)"` when it's actually from the James/Jude preface — the mirror-image error.

**How to apply:** Whenever a Luther quote about James is cited, check WHICH of the two prefaces the specific wording is from before trusting the `work`/`attribution` field — don't assume; the two are frequently swapped in either direction. "Strawy epistle" → NT preface. "Flatly against St. Paul...ascribing justification to works" → James/Jude preface. See [[project_harmonization_producer_seam]].
