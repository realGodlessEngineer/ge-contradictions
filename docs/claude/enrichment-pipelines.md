# Enrichment pipelines (pre-harmonization)

Commands for everything here are in `commands.md`. The DB is always the source of truth; JSON
files under `data/` are the editable working copies. Every merge-back script is **UPDATE-only,
keyed by `id`** (never inserts/deletes; unknown ids are logged as `missing` and skipped), backs up
to `.archive/` first, and runs in one transaction (`ROLLBACK` on error).

## Which pipeline sets which columns

| Columns | Set by |
|---|---|
| `summary`, `commentary`, `scholarship`, `recommend_delete`, `delete_reason` | scholarly enrichment batches (agents) |
| `category_id` | category classification |
| `testament_scope`, `books_in_tension` | `deriveTestamentScope.js` — mechanical, no LLM |
| `contradiction_type_id`, `difficulty_level`, `notoriety_level` | Sonnet enrichment pass |
| `scholarly_consensus_id`, `textual_variant_involved`, `variant_description`, `critical_apparatus_ref` | Opus generator→auditor batch pipeline |
| `commentary` (expanded), `scholarship` (regenerated) | commentary-expansion pipeline |

None of these are writable from the db_manager UI.

## Scholarly enrichment / audit batches

```
contradictions.db --exportBatches.js--> data/json/batch_NN.json --(agents edit)--> --mergeBatchesToDb.js--> contradictions.db
```

- `exportBatches.js` **deletes existing `batch_*.json` first** — don't keep unmerged edits there
  across a re-export.
- The `biblical-contradiction-scholar` and `biblical-scholar-auditor` subagents
  (`.claude/agents/`) validate verse references and fill in the scholarly fields. Per-agent notes
  persist under `.claude/agent-memory/`.
- `mergeBatchesToDb.js` rewrites a `bible_references` set only when it actually differs.
- **`AUDIT_METRICS.md`** is the running per-batch auditor log. **Stopping rule:** keep running
  audit passes until a pass returns **0 errors of any class**, or 10 passes elapse. Update
  `AUDIT_METRICS.md` after each terminal-CLEAN batch.

## Scholarly-consensus and commentary-expansion batch pipelines

Both use the Anthropic Message Batches API (Opus, 50% off) with forced tool-use JSON, a generator
(`biblical-contradiction-scholar` persona) → auditor (`biblical-scholar-auditor` persona) loop,
max 2 audit passes, resumable via `_state.json`. Medium+ issues left after that become
`needs_human` in `UNRESOLVED.md`; merges take clean/clean_low only unless `FORCE=1`.
`commentaryLib.js` reuses `scholarlyLib.js`'s Batch-API plumbing — keep a single API client.

Commentary expansion specifics:
- **Expands** each `commentary` to ~2× (~550–750 words), judges harmonization (steel-manned), emits
  a structured scholarship array, and regenerates the `scholarship` prose blurb from it. It never
  touches `summary` or any consensus/depth field. The whole corpus (ids 1–605) has been expanded;
  the default export window is ids 1–200.
- Generator system prompt = scholar persona + a **compact inline VOICE directive that REPLACES the
  `docs/` style guide** for the run (output cost dominates).
- Writes `data/commentary/` by default; `DIR=…` re-points it. `data/commentary_fix/`,
  `_med/`, `_r2/` are ad-hoc working copies from prior runs.
- After merging, re-run `buildScholarshipTables.js`.
- `auditCommentaryConsistency.js` is a separate read-only, no-LLM sanity check (drifted
  `testament_scope`/`books_in_tension`, prose citing books the refs never mention, impossible
  chapters).

Note: the owner now prefers running LLM legs **locally as Sonnet subagents** rather than via the
Batch API where possible; Opus only as sign-off fallback.

## Targeted data-quality fixes

```
contradictions.db --exportMalformed / exportNoteCleanup / exportFlagged--> data/flagged/flagged_*.json
  --(scholar fixes; auditor verifies)--> --importFlagged.js--> contradictions.db
```

Each record carries a `_resolution` block; `importFlagged.js` applies only
`resolved`/`cleared`/`no-change` (`pending`/`needs-human` skipped unless `FORCE=1`).
**`FLAGGED_ENTRIES.md`** is the running log of what was flagged and how each was resolved.

## Derived scholarship tables

`buildScholarshipTables.js` splits each `contradictions.scholarship` prose blurb into citations,
dedups them into `scholarship_sources`, and links them via the `contradiction_scholarship` junction
(per-use `pages`/`note`/`bible_refs` live on the junction because the same book is cited at
different pages about different verses). It DROPs and rebuilds only those two tables.

- `bible_refs` is extracted from each citation's *annotation tail* (text after year/pages, e.g.
  `…, 1966, pp. 620-621, on John 14:2` → `John 14:2`), normalized to canonical book names.
  Commentary volume-title scopes (`*Genesis 1-15*`, before the year) are deliberately excluded.
- Heuristics: `scholarshipParser.js`. Book/abbreviation recognizer + verse extractor:
  `bibleBooks.js`.
- Not declared in either DDL copy, so a fresh DB lacks them until this script runs.
