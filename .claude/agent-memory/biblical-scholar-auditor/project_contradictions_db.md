---
name: Contradictions DB project context
description: Project is an audited database of bible contradictions sourced from SAB/Infidels/EvilBible with scholarly commentary
type: project
---

The `contradictionScraper` project builds a SQLite DB of biblical "contradictions" scraped from skepticsannotatedbible.com, infidels, and evilbible. Each contradiction entry has a question, summary, commentary, scholarship (citation list), recommend_delete flag, and answers (with bibleReferences).

Batches are stored in `data/json/batch_NN.json` with ranges of ~20 entries each. Entries are audited/edited iteratively.

**Why:** The user is preparing polished scholarly-toned commentary (often AI-drafted initially) and wants it free of citation hallucinations before it ships into the game/display pipeline.

**How to apply:** When auditing a batch, verify every citation (title, publisher, year, page range when checkable). Default translation in answerExplanation blocks is KJV-style (matches SAB source). Commentary is written from a broadly historical-critical perspective, fair to apologists — preserve that voice. Cross-batch entry IDs (e.g., id=7, id=17 in batch_01) can overlap thematically with newer entries; flag overlaps but don't treat them as errors if the entry explicitly distinguishes itself.
