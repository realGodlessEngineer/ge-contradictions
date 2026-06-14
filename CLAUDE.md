# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Three loosely-coupled Node.js apps sharing a single SQLite file (`contradictions.db` at repo root):

- **Root scrapers** — standalone scripts that populate/extend `contradictions.db`.
- **`db_manager/`** — Express app (default port `3300`) exposing a CRUD web UI + JSON API over the database, plus a **review/approval workflow** (a second UI at `/review.html`) backed by a *separate* `reviews.db`.
- **`game/`** — Express + WebSocket app (default port `3400`) serving a streaming-friendly quiz ("INFALLIBLE"). Read-only against the DB.

Each of the three has its own `package.json` / `node_modules`; there is no root-level workspace or monorepo tooling. `npm install` must be run separately in `/`, `/db_manager`, and `/game`.

The root helper scripts (scrapers, migrations, enrichment/pipeline scripts, and their shared libs) live in **`.scripts/`**, not at the repo root. **Run them from the repo root as `node .scripts/<name>.js`** — they resolve `contradictions.db`, `data/`, `.claude/agents`, and `publish/` against the repo root (cwd-relative scripts assume cwd = repo root; the few `__dirname`-relative ones use `__dirname/..`). The root itself holds only `package.json`/`node_modules`, the DB files, the scraper JSON outputs, the docs (`*.md`), and the `db/`, `data/`, `db_manager/`, `game/`, `publish/`, `docs/` directories. Timestamped DB backups (`contradictions.db.bak-<ts>`) live in **`.archive/`**. Every mutating script writes its pre-change backup straight into `.archive/` (computed as `<dir-of-DB>/.archive/`, auto-created), so the repo root never accumulates `.bak` files.

Four `.db` files sit at the root, but only two belong to this project: **`contradictions.db`** (the shared scrape/enrichment DB all three apps use) and **`reviews.db`** (the db_manager review/approval store — see *Game app architecture* / *Things to know*). The other two — **`bible_reference.db`** (~415 MB) and **`study-bundle.db`** (~184 MB) — are large external artifacts that **no script in this repo reads or writes**; treat them as unrelated/foreign data that happens to live here, not part of any pipeline below.

## Common commands

```bash
# Root scrapers (from repo root)
node .scripts/scrapeContra.js             # SAB scraper; writes contradictions.json + contradictions.db. NOTE: `npm start` is broken — package.json "main"/"start" point at scrape-contradictions.js, which does not exist. Run the file directly.
node .scripts/scrapeInfidels.js           # Parses data/infidelscontradictions.html, fetches answer pages -> infidelsContradictions.json
node .scripts/scrapeEvilBible.js          # Same pattern for evilbiblecontradictions.html -> evilBibleContradictions.json
node .scripts/insertNewInfidels.js        # Merges hand-picked indices from infidelsContradictions.json into contradictions.db
node .scripts/insertNewEvilBible.js       # Same, for evilBibleContradictions.json
node .scripts/processInfidels.js          # Reshapes infidelsContradictions.json entries using a hardcoded transforms map
node .scripts/compile-md.js               # Regenerates PROJECT_DOCUMENTATION.md in the cwd (concatenated source bundle; checked-in copy lives in docs/)

# Schema migrations (run once from repo root; idempotent, mutate contradictions.db in place)
node .scripts/migrateAddScholarshipFields.js   # Adds summary, commentary, scholarship columns to contradictions
node .scripts/migrateAddDeleteFlag.js          # Adds recommend_delete, delete_reason columns to contradictions
node .scripts/migrateAddCategory.js            # Creates the categories lookup table (9 seeded rows) + adds contradictions.category_id FK
node .scripts/migrateAddTestamentScope.js      # Adds testament_scope, books_in_tension columns to contradictions
node .scripts/migrateAddContradictionType.js   # Creates the contradiction_types lookup table (10 seeded rows) + adds contradictions.contradiction_type_id FK, difficulty_level, notoriety_level
node .scripts/migrateAddScholarlyConsensus.js  # Creates the scholarly_consensus_levels lookup table (5 seeded rows) + adds contradictions.scholarly_consensus_id FK, textual_variant_involved, variant_description, critical_apparatus_ref

# Scholarly enrichment / audit pipeline (DB <-> data/json/batch_NN.json)
node .scripts/exportBatches.js            # Dumps all contradictions to data/json/batch_NN.json (20 records/batch; wipes existing batch_*.json first)
node .scripts/mergeBatchesToDb.js         # Merges enriched/audited batch JSON back into contradictions.db (writes a timestamped .bak first; UPDATE-only, keyed by id — never inserts)

# SQL snapshot / recreate (DB <-> db/schema.sql + db/data.sql)
node .scripts/dumpDbToSql.js              # contradictions.db -> db/schema.sql + db/data.sql (regenerate after data changes; rows emitted in id order, diff-friendly)
node .scripts/buildDbFromSql.js           # db/schema.sql + db/data.sql -> contradictions.db (lossless rebuild; backs up any existing DB first). SCHEMA_ONLY=1 for an empty DB.

# Category classification (assign each contradiction one categories row via category_id)
node .scripts/migrateAddCategory.js       # (run once) creates + seeds the categories table and adds the category_id FK column
node .scripts/classifyCategories.js       # Classify all rows via Claude Sonnet API (needs ANTHROPIC_API_KEY); UPDATE category_id, 50/batch, skips already-set rows (RECLASSIFY=1 to redo)
node .scripts/exportCategoryQuestions.js  # Agent-driven path: dump uncategorised {id,question} + the 9 categories -> data/category_work.json (ALL=1 for every row)
node .scripts/applyCategoryMap.js         # Apply data/category_map.json ([{id,category-name}]) to category_id (UPDATE-only, keyed by id; timestamped .bak; incremental)

# Contradiction depth fields (canonical scope + mechanism type + engagement scores)
node .scripts/migrateAddTestamentScope.js     # (run once) adds testament_scope + books_in_tension columns
node .scripts/deriveTestamentScope.js         # Mechanically set testament_scope (OT_internal/NT_internal/OT_vs_NT) + books_in_tension from each entry's cited bible_references (no LLM; DRY_RUN=1 previews + lists unrecognized tokens)
node .scripts/migrateAddContradictionType.js  # (run once) creates + seeds contradiction_types (10 rows) and adds contradiction_type_id FK + difficulty_level + notoriety_level
node .scripts/exportEnrichmentWork.js         # Dump contradictions (+answers as evidence) with the type codebook + difficulty/notoriety rubrics -> data/enrichment_work.json (ALL=1 every row; LIMIT=N caps the batch)
node .scripts/applyEnrichmentMap.js           # Apply data/enrichment_map.json ([{id, contradiction_type, difficulty_level, notoriety_level}]) -> contradiction_type_id/difficulty/notoriety (UPDATE-only, keyed by id; validates names + 1-5 range; timestamped .bak). Classification reasoning is done by the biblical-contradiction-scholar-sonnet agent (no API key, no audit loop).

# Scholarly-consensus batch pipeline (Claude Message Batches API; needs CLAUDE_API_KEY in .env)
node .scripts/migrateAddScholarlyConsensus.js # (run once) creates + seeds scholarly_consensus_levels (5 rows) and adds scholarly_consensus_id FK + textual_variant_involved + variant_description + critical_apparatus_ref
node .scripts/exportScholarlyBatches.js       # Dump ungraded contradictions (+answers/refs as evidence) -> data/scholarly/batch_NN.json (20/batch; wipes batch_*.json + _state.json first; ALL=1 every row; LIMIT=N for a pilot)
PING=1 node .scripts/runScholarlyPipeline.js  # Validate CLAUDE_API_KEY + model reachability cheaply, then exit
node .scripts/runScholarlyPipeline.js         # Generator (biblical-contradiction-scholar persona) -> auditor (biblical-scholar-auditor persona) loop via the Batch API (Opus 4.8, 50% off). Forced tool-use JSON. Max 2 audit round-trips; medium+ issues left after that -> needs_human, recorded in data/scholarly/UNRESOLVED.md. Resumable via _state.json.
node .scripts/mergeScholarlyToDb.js           # Merge audited assessments -> scholarly_consensus_id/textual_variant_involved/variant_description/critical_apparatus_ref (UPDATE-only, keyed by id; timestamped .bak). Merges clean/clean_low only; FORCE=1 also merges needs_human. (Shared helpers: scholarlyLib.js)

# Commentary-EXPANSION batch pipeline (rewrites contradictions.commentary + regenerates scholarship prose; Batch API, needs CLAUDE_API_KEY in .env)
node .scripts/exportCommentaryBatches.js      # Dump contradictions (+answers/refs + EXISTING summary/commentary/scholarship as context) -> data/commentary/batch_NN.json (10/batch; wipes batch_*.json + _state.json first). Default window is ids 1-200; ID_MIN/ID_MAX/IDS/ALL=1/LIMIT=N override. DIR overrides the output dir.
PING=1 node .scripts/runCommentaryPipeline.js # Validate CLAUDE_API_KEY + model reachability cheaply, then exit
node .scripts/runCommentaryPipeline.js        # Generator (biblical-contradiction-scholar persona + compact inline VOICE directive that REPLACES the docs/ style guide) EXPANDS each commentary to ~2x length, judges harmonization, emits a structured scholarship array -> auditor (biblical-scholar-auditor persona) checks for hallucination/miscitation/strawmanned harmonization. Batch API (Opus 4.8, 50% off), forced tool-use JSON. Max 2 audit passes; medium+ issues left after that -> needs_human in data/commentary/UNRESOLVED.md. Resumable via _state.json.
node .scripts/auditCommentaryConsistency.js   # READ-ONLY mechanical consistency audit (NO LLM, NO DB writes): cross-checks summary/commentary prose against structured bible_references (scope_mismatch, disjoint books, impossible chapters, drifted testament_scope/books_in_tension) -> data/consistency_report.{json,md}
node .scripts/mergeCommentaryToDb.js          # Merge audited expansions -> contradictions.commentary (always) + scholarship prose (only when the structured array is non-empty) (UPDATE-only, keyed by id; timestamped .bak). Merges clean/clean_low only; FORCE=1 also merges needs_human. Re-run buildScholarshipTables.js afterward to rebuild the derived tables. (Shared helpers: commentaryLib.js, which reuses scholarlyLib.js's API plumbing)

# Publish to the geBibleApp data location (H:\workspace_web\geBibleApp\data by default)
node .scripts/publishDb.js                # Overwrites <dest>/contradictions.db + writes <dest>/contradictions_db/{contradictions.sql, buildDbFromSql.js, DATABASE.md}. GEBIBLE_DATA overrides dest; NO_BACKUP=1 skips the rolling dest backup. Source files live in publish/.

# Targeted data-quality fixes (DB <-> data/flagged/flagged_*.json; tracked in FLAGGED_ENTRIES.md)
node .scripts/exportMalformed.js          # Auto-detect + export every entry with a malformed bibleReferences string (bare number / trailing colon / period-for-colon) -> data/flagged/flagged_M*.json
node .scripts/exportNoteCleanup.js        # Auto-detect + export entries whose commentary/scholarship still carry embedded data-quality notes -> data/flagged/flagged_N*.json
node .scripts/exportFlagged.js            # Export a hardcoded id list with per-entry _resolution guidance -> data/flagged/flagged_*.json (edit the RESOLUTION map for a new set)
node .scripts/importFlagged.js            # Merge data/flagged/flagged_*.json into the DB (UPDATE-only, keyed by id; timestamped .bak first; applies only entries whose _resolution.status is resolved/cleared/no-change)

# Normalize the scholarship blurb into separable reference tables (DB -> derived tables)
DRY_RUN=1 node .scripts/buildScholarshipTables.js  # Parse only: write data/scholarship_parse_preview.json + print stats/flags (no DB writes). Inspect before a real run.
node .scripts/buildScholarshipTables.js            # Split each contradictions.scholarship prose blurb into individual citations, dedup into scholarship_sources, link via contradiction_scholarship. DROPs+rebuilds only those two tables (timestamped .bak first; never touches contradictions/answers/bible_references). Parser lives in scholarshipParser.js.

# DB manager
cd db_manager && npm install && npm start         # CRUD UI http://localhost:3300  ·  review UI http://localhost:3300/review.html
DB_PATH=../contradictions.db PORT=8080 npm start  # Override DB path / port
REVIEW_DB_PATH=../reviews.db npm start             # Override the separate review/approval DB path

# Game
cd game && npm install && npm start               # http://localhost:3400/control  (OBS: /display)
npm run dev                                       # node --watch server.js
node scripts/init-sample-db.js                    # Build a sample DB for local dev without the real data
```

No test suite, linter, or build step is configured in any of the three packages.

## Database contract

All three apps agree on this 6-table schema (defined in `scrapeContra.js` `initDatabase()` and re-declared in `db_manager/server.js` `createTables()`):

```
categories (id, name, description)                  -- thematic lookup; 9 seeded rows
contradiction_types (id, name, description)         -- contradiction-mechanism lookup; 10 seeded rows
scholarly_consensus_levels (id, name, description)  -- consensus-grade lookup; 5 seeded rows
  └─ contradictions (id, question, question_url,
                     summary, commentary, scholarship,     -- scholarly enrichment fields
                     recommend_delete, delete_reason,      -- audit/cull flags
                     category_id FK,                       -- → categories(id), one thematic category per row
                     testament_scope, books_in_tension,    -- canonical scope, derived from references (no LLM)
                     contradiction_type_id FK,             -- → contradiction_types(id), the mechanism
                     difficulty_level, notoriety_level,    -- 1-5 engagement scores
                     scholarly_consensus_id FK,            -- → scholarly_consensus_levels(id)
                     textual_variant_involved,             -- 0/1: a known manuscript variant bears on it
                     variant_description, critical_apparatus_ref,  -- the variant + its apparatus citation
                     created_at)
       └─ answers (id, contradiction_id FK, answer, answer_explanation, created_at)
            └─ bible_references (id, answer_id FK, reference)
```

Two further tables are **derived** (not part of the core scrape/enrichment contract) — generated from the `contradictions.scholarship` prose blurb by `buildScholarshipTables.js`, which DROPs and rebuilds only these two on each run:

```
scholarship_sources (id, author, title, publication, year,   -- one row per distinct cited work (deduped)
                     bib_core, dedup_key UNIQUE, raw_example) -- bib_core = display identity; year/author/title best-effort
  └─ contradiction_scholarship (id, contradiction_id FK -> contradictions(id),
                                source_id FK -> scholarship_sources(id),
                                citation_order, pages, note,
                                bible_refs,             -- comma-delimited verse refs the citation points to
                                raw_citation)           -- per-use page range + annotation + verses
```

This normalizes the single free-text `scholarship` field (a prose bibliography) into separable "additional reading" records: `scholarship_sources` is the deduped reference list, `contradiction_scholarship` is the many-to-many junction tying each contradiction to the works it cites (the per-citation `pages`/`note`/`bible_refs` live on the junction, since the same book is cited at different pages — and about different verses — by different entries). `bible_refs` is extracted from each citation's *annotation tail* (the text after the year/pages, e.g. `…, 1966, pp. 620-621, on John 14:2` → `John 14:2`), normalized to canonical book names and comma-delimited; commentary volume-title scopes (`*Genesis 1-15*`, which precede the year) are deliberately excluded. Because these tables are regenerated from `scholarship`, they are **not** declared in the scraper/db_manager DDL and a fresh DB won't have them until `buildScholarshipTables.js` is run. Citation-splitting heuristics live in `scholarshipParser.js`; the Bible book/abbreviation recognizer + verse extractor lives in `bibleBooks.js`; `DRY_RUN=1` previews to `data/scholarship_parse_preview.json`.

The five `summary`/`commentary`/`scholarship`/`recommend_delete`/`delete_reason` columns on `contradictions` are newer than the original scrape and are populated by the enrichment pipeline (see below), not the scrapers. `category_id` is newer still and is set by the classification pass (see *Category classification* commands). Newer again are the *depth* fields: `testament_scope`/`books_in_tension` are derived **mechanically** from each entry's cited references by `deriveTestamentScope.js` (no LLM); `contradiction_type_id` (→ the `contradiction_types` lookup, 10 fixed rows), `difficulty_level`, and `notoriety_level` are set by the Sonnet enrichment pass (see *Contradiction depth fields* commands); and `scholarly_consensus_id` (→ the `scholarly_consensus_levels` lookup, 5 fixed rows) plus `textual_variant_involved`/`variant_description`/`critical_apparatus_ref` are set by the Opus generator→auditor batch pipeline (see *Scholarly-consensus batch pipeline* commands). The three lookup tables are small fixed-row lookups (hand-assigned ids) so apps can join to `.name`/`.description`. Both DDL copies (`scrapeContra.js` and `db_manager/server.js`) now declare all of this, so a fresh scrape or empty DB gets it automatically.

Persistence uses **`sql.js`** (pure-JS SQLite), not `better-sqlite3`. This matters: the DB is loaded into memory from the file buffer and must be explicitly re-exported to disk after writes — see `saveDatabase()` in `db_manager/server.js` and the `db.export()` pattern in `scrapeContra.js:283`. Forgetting to call `saveDatabase()` after a mutation will silently lose changes on restart.

The DDL is `CREATE TABLE IF NOT EXISTS`, so it never alters an *existing* DB. Schema changes to a populated `contradictions.db` are applied by the standalone, idempotent migration scripts at repo root (`migrateAddScholarshipFields.js`, `migrateAddDeleteFlag.js`, `migrateAddCategory.js`, `migrateAddTestamentScope.js`, `migrateAddContradictionType.js`, `migrateAddScholarlyConsensus.js`) — each does a `PRAGMA table_info` check and `ALTER TABLE ... ADD COLUMN` for anything missing (`migrateAddCategory.js`, `migrateAddContradictionType.js`, and `migrateAddScholarlyConsensus.js` also `CREATE TABLE IF NOT EXISTS` their lookup table and seed it via `INSERT OR IGNORE`). When adding a column, add it to **both** DDL copies *and* write a matching migration; don't rely on `IF NOT EXISTS` to backfill.

A text snapshot of the whole database lives in `db/schema.sql` + `db/data.sql` (generated by `dumpDbToSql.js`, rebuilt by `buildDbFromSql.js`). See **`DATABASE.md`** for the full schema reference, recreate steps, and query examples. Note the *live* schema differs slightly from the `db_manager` DDL copy: the real DB's FKs have **no `ON DELETE CASCADE`**, and it carries five indexes (`idx_answers_contradiction`, `idx_references_answer`, `idx_contradictions_category`, `idx_contradictions_type`, `idx_contradictions_consensus`) that the `db_manager` `CREATE TABLE` DDL doesn't declare. `db/schema.sql` reflects the live schema verbatim (dumped from `sqlite_master`).

## Scraper pattern

Three independent scrapers, each targeting a different source, share a consistent shape but don't share code:

- **`scrapeContra.js`** — fetches `skepticsannotatedbible.com` live (seed URL → list → answer pages). Writes both `contradictions.json` and `contradictions.db` directly. Parses `.contra` div with `<h3>` answer + `<blockquote>` explanation (with an h3-only fallback for pages lacking the wrapper).
- **`scrapeInfidels.js` / `scrapeEvilBible.js`** — read a **local** index HTML snapshot from `data/`, then fetch per-question answer pages from `philb61.github.io`. JSON-only output; merging into the DB is a separate manual step. These use a random 1.5–4.5s delay to imitate human browsing; the SAB scraper uses a fixed 500ms delay.

The `insertNew*.js` scripts exist because the secondary sources overlap with the SAB data — only specific, hand-selected indices (hardcoded `NEW_INDICES` arrays) get merged into `contradictions.db`. When adding new merges, update that array rather than inserting everything.

## Scholarly enrichment / audit pipeline

Separate from scraping: a round-trip that adds scholarly fields (`summary`, `commentary`, `scholarship`) and cull flags (`recommend_delete`, `delete_reason`) to existing rows. The DB is the source of truth; JSON batch files are the editable working copy.

```
contradictions.db  --exportBatches.js-->  data/json/batch_NN.json  --(agents edit in place)-->  --mergeBatchesToDb.js-->  contradictions.db
```

- **`exportBatches.js`** dumps every contradiction (with answers + references nested, camelCased) into `data/json/batch_NN.json`, 20 records per batch. It **deletes existing `batch_*.json` first**, so don't keep unmerged hand edits there across a re-export.
- The **`biblical-contradiction-scholar`** and **`biblical-scholar-auditor`** subagents (defined in `.claude/agents/`) read a batch file, validate verse references for coherency, and fill in the scholarly fields. Per-agent notes persist under `.claude/agent-memory/`.
- **`mergeBatchesToDb.js`** writes the edited batches back. It is **UPDATE-only and keyed by `id`** — it never inserts or deletes rows; an `id` in JSON that isn't in the DB is logged as `missing` and skipped. It writes a timestamped `contradictions.db.bak-<ts>` before touching anything, runs inside a single transaction (`ROLLBACK` on error), and rewrites a `bible_references` set only when it actually differs.
- **`AUDIT_METRICS.md`** (repo root) is the running log of auditor results per batch (severity tiers, passes-to-zero, bug trajectory). The auditor's **stopping rule**: keep running passes until a pass returns **0 errors of any class**, or 10 passes elapse. Update `AUDIT_METRICS.md` after each terminal-CLEAN batch.

### Commentary-expansion batch pipeline

A second, **automated** batch pipeline (Anthropic Message Batches API, like the scholarly-consensus one) that *rewrites prose* rather than grading metadata. It takes each contradiction's existing `commentary` and **expands it to roughly double the length** (~550–750 words), explicitly judges harmonization (steel-manned), and emits a structured scholarship array — then regenerates the `scholarship` prose blurb from that array. It **only** touches `commentary` and `scholarship`; it never changes `summary` or any consensus/depth field. The entire corpus (ids 1–605) was expanded this way; the default export window is ids 1–200 (the block the earlier citation audit, which started at 201, never covered).

```
contradictions.db
  --exportCommentaryBatches.js-->  data/commentary/batch_NN.json
  --runCommentaryPipeline.js (generator -> auditor loop, max 2 passes)-->
  --mergeCommentaryToDb.js-->  contradictions.db   (then re-run buildScholarshipTables.js)
```

- Shared helpers live in **`commentaryLib.js`**, which reuses **`scholarlyLib.js`**'s generic Batch-API plumbing (one client, one copy of submit/poll/collect) so there is a single API client. The generator system prompt = the `biblical-contradiction-scholar` persona + a **compact inline VOICE directive that REPLACES the `docs/` style guide** for the run (output cost dominates, so the style spec is kept terse on purpose).
- The pipeline writes into **`data/commentary/`** by default; `DIR=…` re-points it (the repo also carries ad-hoc working copies from prior runs — `data/commentary_fix/`, `data/commentary_med/`, `data/commentary_r2/`). Merge verdicts and `UNRESOLVED.md` mirror the scholarly pipeline: clean/clean_low merge, needs_human is skipped unless `FORCE=1`.
- **`auditCommentaryConsistency.js`** is a separate **read-only, no-LLM** sanity check (not part of the merge loop): it cross-references the `summary`/`commentary` prose against the structured `bible_references` and flags mechanical inconsistencies (a stored `testament_scope`/`books_in_tension` that drifted from the refs, prose citing books the references never mention, impossible chapter numbers) into `data/consistency_report.{json,md}`. Run it any time to spot prose that has drifted from the structured data; it makes no DB writes.

### Targeted data-quality fixes

A lighter-weight variant of the same loop is used to repair specific data defects (malformed/wrong references, broken scrapes, stale embedded notes) rather than enrich whole batches. It writes to **`data/flagged/flagged_*.json`** (separate from `data/json/`), and each record carries a `_resolution` block telling the agents what to fix:

```
contradictions.db
  --exportMalformed.js / exportNoteCleanup.js / exportFlagged.js-->  data/flagged/flagged_*.json
  --(biblical-contradiction-scholar fixes; biblical-scholar-auditor verifies)-->
  --importFlagged.js-->  contradictions.db
```

- `importFlagged.js` is **UPDATE-only, keyed by `id`**, backs up first, and applies a record only when its `_resolution.status` is `resolved`/`cleared`/`no-change` — `pending`/`needs-human` are skipped (use `FORCE=1` to override).
- **`FLAGGED_ENTRIES.md`** (repo root) is the running checklist/log of which entries were flagged, how each was resolved (or escalated to `needs-human`), and the DB-wide scans that found them.

## Game app architecture

`game/` follows a deliberate layered split:

```
server.js  ─►  GameController  ─►  GameService  ─►  DatabaseService
                                        │
                                        └─►  GameState (model) + QuestionSelector (util)
```

- `server.js` owns HTTP, WebSocket connections, and the message routing switch (`handleMessage`, `server.js:81-120`). Two client pools: `clients.control` and `clients.display`, differentiated by `?type=` query param on the WS URL.
- After any state-mutating message, the server broadcasts a `STATE_UPDATE` to all clients — this is the single sync mechanism between the host control panel and the OBS display.
- `GameController` is a thin pass-through to `GameService`. `GameService` owns game rules (phase machine in `GameState.PHASES`, Jesus Mode fallback logic, win/lose conditions).
- Config is loaded once via `src/config.js` (dotenv + validation). `DB_PATH` is resolved relative to `game/`, so `../contradictions.db` points at the repo-root DB.
- "Jesus Mode" filters contradictions by `LOWER(question) LIKE '%jesus%'` (`databaseService.js:80`). If fewer than `JESUS_MODE_MIN_QUESTIONS` match, it silently falls back to the full pool.

## Things to know before editing

- **Ports**: scraper (N/A), db_manager (`3300`), game (`3400`). The game's `.env.example` referenced in `game/README.md` is not checked in — config defaults live in `game/src/config.js`.
- **DB path resolution differs by app**: `db_manager/server.js` defaults to `../contradictions.db` (relative to `db_manager/`); `game/src/config.js` resolves relative to `game/` and defaults to `./contradictions.db` inside `game/`. Only the db_manager points at the shared repo-root DB by default.
- **`db_manager` scholarship endpoint**: `PATCH /api/contradictions/:id/scholarship` (`db_manager/server.js:415`) updates only the enrichment/cull fields (`summary`, `commentary`, `scholarship`, `recommendDelete`, `deleteReason`) without touching answers or references — distinct from the full `PUT /api/contradictions/:id`, which nulls scholarly fields unless they're resupplied. Note: neither the `PUT` nor the scholarship `PATCH` currently writes `category_id`, so editing an entry through db_manager leaves its category untouched. The same is true of the depth fields (`testament_scope`, `books_in_tension`, `contradiction_type_id`, `difficulty_level`, `notoriety_level`, `scholarly_consensus_id`, `textual_variant_involved`, `variant_description`, `critical_apparatus_ref`) — those are only set by their scripts, never the db_manager UI.
- **`db_manager` categories endpoint**: `GET /api/categories` returns the `categories` lookup rows (`id`, `name`, `description`) so a client can resolve a contradiction's `category_id` to its name/descriptor.
- **`db_manager` review/approval subsystem**: a second store, **`reviews.db`** (path via `REVIEW_DB_PATH`, default `../reviews.db`), is opened/created alongside `contradictions.db` and holds two tables — `reviews` (one current decision per `contradiction_id`: `status`, `note`, `reviewer`, `content_hash`, `updated_at`) and `review_events` (append-only audit trail of every decision). Status is one of `pending`/`needs_review`/`approved`/`rejected`/`needs_changes`. Endpoints: `GET /api/reviews` (id→state map with a computed `stale` flag), `GET /api/reviews/stats`, `GET /api/reviews/:id/history`, `PUT /api/reviews/:id` (record/replace a decision). The **`stale`** flag compares a stored sha1 `content_hash` of the contradiction's `question`+`summary`+`commentary`+`scholarship` against the current value, so an approval is auto-flagged when the underlying content later changes. The UI is `db_manager/public/review.html` + `review.js` (CRUD UI is `index.html` + `app.js`). The review API writes **only** to `reviews.db`; it never mutates `contradictions.db`.
- **Publishing to geBibleApp**: `publishDb.js` pushes the DB + a reconstruct bundle to an *external* consumer app at `H:\workspace_web\geBibleApp\data` (override with `GEBIBLE_DATA`). The published support files (`buildDbFromSql.js`, `DATABASE.md`) are version-controlled here under `publish/`; the reconstruct SQL (`contradictions.sql`) is generated fresh from the live DB each publish. publishDb.js overwrites `<dest>/contradictions.db` (rolling `.bak` kept in `contradictions_db/` unless `NO_BACKUP=1`) and removes the older two-file (`schema.sql`/`data.sql`/`dumpDbToSql.js`) bundle it superseded. Re-run after any DB change you want reflected downstream.
- **`docs/`** holds `PROJECT_DOCUMENTATION.md` (generated output from `compile-md.js` — don't edit directly; regenerate if it needs to stay current) and `Godless_Engineer_Style_Guide_v4.md` (voice/style reference used when writing scholarly copy). Note `compile-md.js` writes to its cwd, so re-running it from the repo root creates a new root-level copy rather than overwriting the one in `docs/`.
- **No `.gitignore` / no git**: this directory is not a git repository. `node_modules/`, `contradictions.db`, and its `*.bak-*` snapshots (collected under `.archive/`) sit alongside source.
- **Script & backup layout**: root helper scripts live in `.scripts/` (run as `node .scripts/<name>.js` from the repo root); DB backups live in `.archive/`. See *Repository layout* above.
