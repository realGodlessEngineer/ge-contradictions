---
name: Contradiction enrichment pipeline
description: Structure and purpose of the batch_NN.json enrichment workflow for contradictions.db
type: project
---

Batched JSON enrichment pipeline exports contradictions from `contradictions.db` into `data/json/batch_NN.json` files (31 batches, 20 entries each, IDs ordered by primary key). Each entry has `summary`, `commentary`, `scholarship`, `recommend_delete`, `delete_reason` fields to be filled.

**Why:** The user is piloting a content pipeline to enrich the raw SAB-scraped contradictions database with scholarly framing before it gets surfaced in the db_manager UI and/or the INFALLIBLE game. The raw scrape has data-quality issues (malformed refs, mismatched question/answer pairs) that need human/LLM review before production use.

**How to apply:**
- Preserve the outer JSON shape exactly: `batch`, `batchCount`, `idRange`, `count`, `contradictions`. Never reorder fields or remove original scrape data (`questionUrl`, `answers[]`, `answerExplanation`, `bibleReferences`).
- Write enriched files back to the same path.
- For `recommend_delete=1` entries, still keep the full original record intact — just fill `delete_reason` and leave summary/commentary/scholarship null.
- Include a note inside `scholarship` when you notice malformed Bible references in `bibleReferences[]` (e.g., `"45:21"` missing book prefix), so humans can fix the DB source.
