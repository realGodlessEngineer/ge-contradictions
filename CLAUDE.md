# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Detail docs — read only when the task touches that area

| Doc | Read when |
|---|---|
| `docs/claude/commands.md` | You need the exact command/env flags for any `.scripts/` script |
| `docs/claude/enrichment-pipelines.md` | Touching scholarly enrichment, category/depth/consensus fields, commentary expansion, flagged-entry fixes, or the derived scholarship tables |
| `docs/claude/harmonization.md` | Anything `harmonization_*`, `data/harmonization/`, dossiers, PD critic quotes, or the baker/validator |
| `docs/claude/apps.md` | Editing `db_manager/` (CRUD, review, harmonization UIs + API) or `game/` |
| `docs/claude/scrapers.md` | Editing or running the scrapers / `insertNew*.js` |
| `DATABASE.md` | Full column-level schema, recreate steps, query examples |

## Repository layout

Three loosely-coupled Node.js apps sharing one SQLite file, `contradictions.db` at the repo root:

- **Root scripts** (`.scripts/`) — scrapers, migrations, enrichment/harmonization pipelines, and
  their shared libs. **Run from the repo root as `node .scripts/<name>.js`** (some gates are
  `python .scripts/<name>.py`); they resolve `contradictions.db`, `data/`, `.claude/agents`, and
  `publish/` against the repo root.
- **`db_manager/`** — Express CRUD UI + JSON API (port `3300`), plus review/approval and
  harmonization-authoring UIs.
- **`game/`** — Express + WebSocket streaming quiz "INFALLIBLE" (port `3400`), read-only on the DB.

Each has its own `package.json`/`node_modules` (no workspace tooling; `npm install` in `/`,
`/db_manager`, `/game` separately). **No test suite, linter, or build step exists** in any package.
Root `npm start` is broken (points at a nonexistent file) — run scripts directly.

Root `.db` files: **`contradictions.db`** (the shared DB), **`reviews.db`** (db_manager review
store), **`bible_reference.db`** (~415 MB; PD commentaries + WEB text, **read-only** input to the
harmonization sweep/verbatim gates), and **`study-bundle.db`** (~184 MB; foreign data, unused by
any script).

## Database contract

Core schema (both DDL copies — `scrapeContra.js` `initDatabase()` and `db_manager/server.js`
`createTables()` — declare all of it):

```
categories / contradiction_types / scholarly_consensus_levels   -- fixed-row lookups (9 / 10 / 5 rows, hand-assigned ids)
  └─ contradictions (id, question, question_url, summary, commentary, scholarship,
                     recommend_delete, delete_reason, category_id FK, testament_scope, books_in_tension,
                     contradiction_type_id FK, difficulty_level, notoriety_level,
                     scholarly_consensus_id FK, textual_variant_involved, variant_description,
                     critical_apparatus_ref, created_at)
       └─ answers (id, contradiction_id FK, answer, answer_explanation, created_at)
            └─ bible_references (id, answer_id FK, reference)
```

**Derived tables** (DROPped and rebuilt by their builder, not in either DDL, absent from a fresh DB):
`scholarship_sources` + `contradiction_scholarship` (`buildScholarshipTables.js`) and
`harmonization_row` / `harmonization_quote` / `harmonization_verse_pair`
(`buildHarmonizationTables.js`). Never hand-edit them — change the source and rebuild.

- **Persistence is `sql.js`** (in-memory, pure JS), not `better-sqlite3`. After writes you must
  export to disk (`saveDatabase()` in db_manager; `fs.writeFileSync(path, db.export())` in
  scripts) or changes are silently lost.
- DDL is `CREATE TABLE IF NOT EXISTS`, so it never alters an existing DB. **To add a column:**
  add it to *both* DDL copies *and* write an idempotent `migrateAdd*.js` (`PRAGMA table_info`
  check → `ALTER TABLE ADD COLUMN`; lookup tables via `CREATE TABLE IF NOT EXISTS` +
  `INSERT OR IGNORE`).
- The live DB differs from the db_manager DDL: FKs have **no `ON DELETE CASCADE`**, and it carries
  indexes the DDL doesn't declare. `db/schema.sql` reflects the live schema verbatim.
- `contradictions.db` is **not tracked in git**; it is rebuilt from `db/schema.sql` + `db/data.sql`
  (`buildDbFromSql.js`). After data changes, regenerate them with `dumpDbToSql.js`.

## Conventions every mutating script follows

- Writes a timestamped backup to `<dir-of-DB>/.archive/` (auto-created) before touching anything —
  never leave `.bak` files at the root.
- Merge-back scripts are **UPDATE-only, keyed by `id`** (never insert/delete; unknown ids logged as
  `missing`), run in a single transaction with `ROLLBACK` on error.
- Export scripts that write `batch_*.json` **wipe existing batch files first** — don't leave
  unmerged edits there.
- The DB is the source of truth for enrichment; JSON under `data/` is the editable working copy.
  For harmonization it is the reverse: curation JSON is the input, the DB tables are output.
- LLM work is done by the subagents in `.claude/agents/` (`biblical-contradiction-scholar[-sonnet]`
  generates, `biblical-scholar-auditor` audits). Audit loops run until a pass returns **0 errors
  of any class** (or 10 passes); log per-batch results in `AUDIT_METRICS.md`. Data-defect fixes
  are logged in `FLAGGED_ENTRIES.md`.

## Common commands

```bash
node .scripts/buildDbFromSql.js     # rebuild contradictions.db from db/*.sql (SCHEMA_ONLY=1 for empty)
node .scripts/dumpDbToSql.js        # contradictions.db -> db/schema.sql + db/data.sql
node .scripts/publishDb.js          # push DB + reconstruct bundle to H:\workspace_web\geBibleApp\data (GEBIBLE_DATA overrides; files in publish/)
cd db_manager && npm start          # http://localhost:3300
cd game && npm start                # http://localhost:3400/control  (OBS: /display)
```

Everything else: `docs/claude/commands.md`.

## Other things to know

- `docs/PROJECT_DOCUMENTATION.md` is generated by `compile-md.js` — don't edit it. That script
  writes to its **cwd**, so running it from the root creates a new root copy instead of updating
  `docs/`.
- `docs/Godless_Engineer_Style_Guide_v4.md` is the voice/style reference for scholarly copy.
- `.gitignore` excludes `node_modules/`, `__pycache__/`, all `*.db`, `.archive/`, and `.env`
  (which holds `CLAUDE_API_KEY` / `ANTHROPIC_API_KEY` for the API-based scripts).
- `publishDb.js` feeds an **external** consumer (geBibleApp); re-run it after any DB change that
  should reach it. The `harmonization_*` tables are the shared interface with that app — their
  schema is fixed by `docs/SPEC-contradictions-605-sweep.md` §4.
