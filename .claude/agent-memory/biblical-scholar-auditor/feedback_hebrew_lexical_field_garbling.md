---
name: Hebrew lexical-field garbling in late passes
description: AI drafts collapse multiple Hebrew roots within a semantic field into one root incorrectly; verify each verse's actual root
type: feedback
---

When commentary states "the Hebrew word X" covers multiple verses, AI drafts routinely collapse distinct roots that share a semantic field into a single root.

**Pass-9 batch_18 cases**:

1. Entry 345: "The Hebrew word in Psalm 12:7 and Proverbs 30:5 is tahor or its cognates" — WRONG. Psalm 12:7 uses *tehorot* (from *tahor*, ritually pure). Proverbs 30:5 uses *tseruphah* (from *tsaraph*, refined as silver in a furnace). Both belong to the semantic field of purity/refinement, but they are different Hebrew roots.

2. Entry 354: "the same Hebrew word for sleep (yashen) and slumber (num) appears in 1 Kings 18:27" — WRONG. Only *yashen* appears in 1 Kgs 18:27. Both *yashen* and *num* appear together at Psalm 121:4 (the original comparison verse). The AI conflated source vocabulary with target verse.

**Why:** AI drafts copy lexical claims from one verse's analysis and project them onto adjacent verses cited together, without verifying each verse's actual Hebrew.

**How to apply:** Whenever commentary attributes "the same Hebrew word" or "the Hebrew word X" to multiple verses, look up each verse independently in the Hebrew lexicon. Strong's, Biblehub lexicon, and Sefaria are quick verification tools. Especially scrutinize cross-book claims (Psalms vs Proverbs, Psalms vs Kings) where AI is more likely to project vocabulary from one book onto another.
