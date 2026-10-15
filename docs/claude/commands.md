# Script command reference

All root scripts live in `.scripts/` and run **from the repo root** as `node .scripts/<name>.js`
(Python gates: `python .scripts/<name>.py`). Every mutating script writes a timestamped backup to
`.archive/` first. Narrative/design for each pipeline is in the sibling docs
(`enrichment-pipelines.md`, `harmonization.md`).

## Scrapers (see `scrapers.md`)

```bash
node .scripts/scrapeContra.js             # SAB scraper; writes contradictions.json + contradictions.db. `npm start` is BROKEN (package.json points at nonexistent scrape-contradictions.js) — run the file directly.
node .scripts/scrapeInfidels.js           # data/infidelscontradictions.html + fetched answer pages -> infidelsContradictions.json
node .scripts/scrapeEvilBible.js          # Same pattern for evilbiblecontradictions.html -> evilBibleContradictions.json
node .scripts/insertNewInfidels.js        # Merge hand-picked NEW_INDICES from infidelsContradictions.json into the DB
node .scripts/insertNewEvilBible.js       # Same, for evilBibleContradictions.json
node .scripts/processInfidels.js          # Reshape infidelsContradictions.json via a hardcoded transforms map
node .scripts/compile-md.js               # Regenerate PROJECT_DOCUMENTATION.md in the CWD (checked-in copy lives in docs/)
```

## Schema migrations (run once; idempotent; mutate contradictions.db in place)

```bash
node .scripts/migrateAddScholarshipFields.js   # summary, commentary, scholarship
node .scripts/migrateAddDeleteFlag.js          # recommend_delete, delete_reason
node .scripts/migrateAddCategory.js            # categories lookup (9 rows) + category_id FK
node .scripts/migrateAddTestamentScope.js      # testament_scope, books_in_tension
node .scripts/migrateAddContradictionType.js   # contradiction_types lookup (10 rows) + contradiction_type_id FK, difficulty_level, notoriety_level
node .scripts/migrateAddScholarlyConsensus.js  # scholarly_consensus_levels lookup (5 rows) + scholarly_consensus_id FK, textual_variant_involved, variant_description, critical_apparatus_ref
```

## SQL snapshot / recreate

```bash
node .scripts/dumpDbToSql.js              # contradictions.db -> db/schema.sql + db/data.sql (id order, diff-friendly; re-run after data changes)
node .scripts/buildDbFromSql.js           # db/schema.sql + db/data.sql -> contradictions.db (backs up existing first). SCHEMA_ONLY=1 for an empty DB.
node .scripts/snapshotDb.js               # Self-contained .archive/snapshot-<ts>/ (db + schema.sql + data.sql + manifest.json). DB_PATH / ARCHIVE_DIR override.
```

## Scholarly enrichment batches (agent-edited)

```bash
node .scripts/exportBatches.js            # All contradictions -> data/json/batch_NN.json (20/batch; WIPES existing batch_*.json first)
node .scripts/mergeBatchesToDb.js         # Merge edited batches back (UPDATE-only, keyed by id, never inserts)
```

## Category classification

```bash
node .scripts/classifyCategories.js       # Via Claude Sonnet API (ANTHROPIC_API_KEY); 50/batch; skips set rows (RECLASSIFY=1 to redo)
node .scripts/exportCategoryQuestions.js  # Agent path: uncategorised {id,question} + 9 categories -> data/category_work.json (ALL=1 every row)
node .scripts/applyCategoryMap.js         # Apply data/category_map.json ([{id, category-name}]) -> category_id
```

## Depth fields

```bash
node .scripts/deriveTestamentScope.js     # Mechanical (no LLM) testament_scope + books_in_tension from cited refs (DRY_RUN=1 previews + lists unrecognized tokens)
node .scripts/exportEnrichmentWork.js     # Rows + type codebook + rubrics -> data/enrichment_work.json (ALL=1, LIMIT=N)
node .scripts/applyEnrichmentMap.js       # Apply data/enrichment_map.json -> contradiction_type_id/difficulty/notoriety (validates names + 1-5). Reasoning done by the biblical-contradiction-scholar-sonnet agent.
```

## Scholarly-consensus batch pipeline (Batch API; CLAUDE_API_KEY in .env)

```bash
node .scripts/exportScholarlyBatches.js       # Ungraded rows -> data/scholarly/batch_NN.json (wipes batch_*.json + _state.json; ALL=1, LIMIT=N)
PING=1 node .scripts/runScholarlyPipeline.js  # Validate key + model reachability, exit
node .scripts/runScholarlyPipeline.js         # Generator -> auditor loop (max 2 audit passes; leftovers -> needs_human in data/scholarly/UNRESOLVED.md). Resumable via _state.json.
node .scripts/mergeScholarlyToDb.js           # Merge clean/clean_low only (FORCE=1 also needs_human)
```

## Commentary-expansion batch pipeline (Batch API; CLAUDE_API_KEY in .env)

```bash
node .scripts/exportCommentaryBatches.js      # -> data/commentary/batch_NN.json (10/batch; wipes first). Default ids 1-200; ID_MIN/ID_MAX/IDS/ALL=1/LIMIT=N; DIR=… output dir
PING=1 node .scripts/runCommentaryPipeline.js
node .scripts/runCommentaryPipeline.js        # Expand commentary ~2x + structured scholarship array; auditor loop (max 2); resumable
node .scripts/auditCommentaryConsistency.js   # READ-ONLY, no LLM: prose vs bible_references drift -> data/consistency_report.{json,md}
node .scripts/mergeCommentaryToDb.js          # Merge clean/clean_low (FORCE=1 also needs_human); then re-run buildScholarshipTables.js
```

## Targeted data-quality fixes (data/flagged/; logged in FLAGGED_ENTRIES.md)

```bash
node .scripts/exportMalformed.js          # Malformed bibleReferences strings -> data/flagged/flagged_M*.json
node .scripts/exportNoteCleanup.js        # Embedded data-quality notes in commentary/scholarship -> flagged_N*.json
node .scripts/exportFlagged.js            # Hardcoded id list + per-entry _resolution guidance (edit the RESOLUTION map)
node .scripts/importFlagged.js            # Apply records whose _resolution.status is resolved/cleared/no-change (FORCE=1 overrides)
```

## Derived scholarship tables

```bash
DRY_RUN=1 node .scripts/buildScholarshipTables.js  # Parse only -> data/scholarship_parse_preview.json
node .scripts/buildScholarshipTables.js            # DROP + rebuild scholarship_sources + contradiction_scholarship
```

## Harmonization (see `harmonization.md`)

```bash
python .scripts/sweepHarmonization.py              # Mechanical gather of PD commentary notes -> data/harmonization/gather/
DRY_RUN=1 node .scripts/buildHarmonizationTables.js   # Assemble + validate + preview (_bake_preview.json); no writes
ALL=1 node .scripts/buildHarmonizationTables.js       # Real bake of the 3 harmonization_* tables (fail-closed gates). Default = 7 pilots only; IDS=… explicit
node .scripts/validateHarmonization.js             # §10 validator over the live baked tables (read-only)
python .scripts/verifyExcerpts.py | verifyVersePairs.py | verifyHandQuotes.py   # verbatim floors
```

## Publish to geBibleApp

```bash
node .scripts/publishDb.js                # -> H:\workspace_web\geBibleApp\data (GEBIBLE_DATA overrides; NO_BACKUP=1 skips rolling backup). Support files in publish/.
```
