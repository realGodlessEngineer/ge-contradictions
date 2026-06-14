# Contradictions Database — usage guide

This folder (`data/contradictions_db/`) holds everything needed to **read,
understand, and rebuild** the Bible-contradictions database that ships with
geBibleApp. The live database itself is the sibling file `../contradictions.db`.

> **Published artifact — do not hand-edit.** These files are generated and
> overwritten by the upstream `contradictionScraper` project's `publishDb.js`.
> Edit the data at the source, then re-publish.

---

## Files

| File | What it is |
|---|---|
| `../contradictions.db` | The live SQLite database (binary). This is what the app reads. |
| `contradictions.sql` | A single, self-contained SQL script that recreates the entire database (schema + every row). |
| `buildDbFromSql.js` | Node/`sql.js` helper that rebuilds `../contradictions.db` from `contradictions.sql`. |
| `DATABASE.md` | This document. |

`contradictions.sql` is a complete, text-diffable snapshot. Rebuilding from it is
lossless — schema, indexes, and every row come back identically.

---

## Rebuilding the database

### Option A — `sqlite3` CLI (no Node needed)
From this folder:
```bash
sqlite3 ../contradictions.db < contradictions.sql
```
The script drops and recreates every table, so it is safe to run over an
existing file.

### Option B — Node (`sql.js`, no native build tools)
From this folder:
```bash
node buildDbFromSql.js          # writes ../contradictions.db (backs up any existing copy to .bak)
OUT_PATH=./fresh.db node buildDbFromSql.js
```
Requires the `sql.js` package (`npm i sql.js` if it isn't already in the app's
`node_modules`).

---

## Persistence model (read this if you write to the DB from the app)

The contradictions data was produced with **`sql.js`** (SQLite compiled to
WebAssembly). If geBibleApp also reads it with `sql.js`:

- The database is loaded entirely into memory from the file buffer. Writes happen
  in memory and **only reach disk when you call `db.export()` and write the buffer
  back**. A mutation that is never exported is silently lost on restart.
- **Foreign keys are not enforced by default** — `sql.js` does not enable
  `PRAGMA foreign_keys` automatically. The FK columns below are declarative.

(If you read it with a native driver such as `better-sqlite3`, writes persist
normally and you can enable `PRAGMA foreign_keys = ON`.)

---

## Schema

```
categories                 ──┐
contradiction_types        ──┤
scholarly_consensus_levels ──┴─< contradictions ──< answers ──< bible_references
                                       │
                                       └─< contradiction_scholarship >── scholarship_sources

rows (2026-06-12):  categories 9 · contradiction_types 10 · scholarly_consensus_levels 5 · contradictions 605 · answers 1329 · bible_references 2861 · scholarship_sources 1555 · contradiction_scholarship 3877
```

`scholarship_sources` + the `contradiction_scholarship` junction normalize the
free-text `contradictions.scholarship` blurb into separable "additional reading"
records — use them to render a per-contradiction reading list.

### `categories`
Lookup table of the thematic category each contradiction belongs to.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Stable `1`–`9` (hand-assigned, not AUTOINCREMENT). |
| `name` | TEXT NOT NULL UNIQUE | Display name, e.g. *"Jesus & the Gospels"*. |
| `description` | TEXT NOT NULL | One-line descriptor you can surface in the UI. |

The nine categories: **Creation & Cosmology**, **God: Nature & Character**,
**Jesus & the Gospels**, **Salvation, Sin & Afterlife**, **Law, Morality &
Ethics**, **Genealogy & Identity**, **Numbers & Measurements**, **Chronology &
Sequence**, **History & Narrative Events**. Every contradiction is assigned
exactly one.

### `contradiction_types`
Lookup table of the *mechanism* by which a contradiction arises (orthogonal to
the thematic `categories`). Referenced by `contradictions.contradiction_type_id`.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Stable `1`–`10` (hand-assigned). |
| `name` | TEXT NOT NULL UNIQUE | e.g. `chronological`, `theological`, `compositional`. |
| `description` | TEXT NOT NULL | One-line descriptor you can surface in the UI. |

The ten types: **numerical**, **chronological**, **genealogical**, **geographical**,
**theological**, **ethical_legal**, **factual_historical**, **translational**,
**textual_variant**, **compositional**. Every contradiction is assigned exactly one.

### `scholarly_consensus_levels`
Lookup grading how mainstream critical scholarship weighs whether the tension is
a real contradiction. Referenced by `contradictions.scholarly_consensus_id`.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Stable `1`–`5` (hand-assigned). |
| `name` | TEXT NOT NULL UNIQUE | `genuine_contradiction` … `apparent_only`. |
| `description` | TEXT NOT NULL | One-line descriptor you can surface in the UI. |

The five levels (strongest → weakest contradiction): **genuine_contradiction**,
**probable_contradiction**, **genuinely_disputed**, **probable_harmonization**,
**apparent_only**.

### `contradictions`
The top-level question and the scholarly fields attached to it.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `question` | TEXT NOT NULL | The contradiction question, e.g. *"When was heaven created?"* |
| `question_url` | TEXT NOT NULL | Source URL (skepticsannotatedbible.com or a merged source). |
| `summary` | TEXT | Short scholarly summary of the contradiction. |
| `commentary` | TEXT | Longer scholarly commentary / analysis. |
| `scholarship` | TEXT | Citations / secondary-source references backing the commentary. |
| `recommend_delete` | INTEGER DEFAULT 0 | Audit cull flag (`0`/`1`). |
| `delete_reason` | TEXT | Free-text justification when `recommend_delete = 1`. |
| `category_id` | INTEGER | → `categories(id)`. The entry's single thematic category. |
| `testament_scope` | TEXT | `OT_internal` / `NT_internal` / `OT_vs_NT` (NULL if undetermined). Which testament(s) the tension spans. |
| `books_in_tension` | TEXT | Comma-separated canonical book names driving the scope, in canon order (e.g. `Genesis, Isaiah, John`). |
| `contradiction_type_id` | INTEGER | → `contradiction_types(id)`. The mechanism by which the contradiction arises. |
| `difficulty_level` | INTEGER | `1`–`5`: how hard to spot/understand (1 surface … 5 specialist). |
| `notoriety_level` | INTEGER | `1`–`5`: how widely cited/famous (1 obscure … 5 iconic). |
| `scholarly_consensus_id` | INTEGER | → `scholarly_consensus_levels(id)`. How critical scholarship weighs the tension. |
| `textual_variant_involved` | INTEGER | `0`/`1`: does a known manuscript variant materially bear on it? |
| `variant_description` | TEXT | One-sentence note on the variant (NULL when none). |
| `critical_apparatus_ref` | TEXT | Apparatus/source locating the variant, e.g. `"NA28 apparatus at John 7:53"` (NULL when none). |
| `created_at` | DATETIME | Defaults to `CURRENT_TIMESTAMP`. |

### `answers`
One or more apologetic answers per contradiction.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `contradiction_id` | INTEGER NOT NULL | → `contradictions(id)` |
| `answer` | TEXT NOT NULL | The answer/position headline. |
| `answer_explanation` | TEXT | Supporting explanation. |
| `created_at` | DATETIME | Defaults to `CURRENT_TIMESTAMP`. |

### `bible_references`
Scripture references cited by a given answer.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `answer_id` | INTEGER NOT NULL | → `answers(id)` |
| `reference` | TEXT NOT NULL | A single reference string, e.g. `"Genesis 1:1"`. |

### `scholarship_sources`
One row per distinct cited work (deduped), parsed from the prose `scholarship` text.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `author` | TEXT | Best-effort; present for many entries, NULL where the citation style made it ambiguous. |
| `title` | TEXT | Best-effort (as above). |
| `publication` | TEXT | Publisher/series/year block when present. |
| `year` | INTEGER | Publication year (NULL for undated/ancient works). |
| `bib_core` | TEXT NOT NULL | The citation minus pages/note — the display identity. Use this to render a source. |
| `dedup_key` | TEXT NOT NULL UNIQUE | Internal merge key. |
| `raw_example` | TEXT | One representative full citation string. |

### `contradiction_scholarship`
Junction tying each contradiction to the works it cites, with per-use detail.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `contradiction_id` | INTEGER NOT NULL | → `contradictions(id)` |
| `source_id` | INTEGER NOT NULL | → `scholarship_sources(id)` |
| `citation_order` | INTEGER | 1-based order to render the list in. |
| `pages` | TEXT | Per-use page range, e.g. `"pp. 71-79"` (NULL when none). |
| `note` | TEXT | Per-use annotation, e.g. `"on the raqia and Priestly cosmology"`. |
| `bible_refs` | TEXT | Comma-delimited verse refs the citation points to, e.g. `"John 14:2"` (NULL when none). |
| `raw_citation` | TEXT NOT NULL | The full original citation string. |

### Indexes
```sql
CREATE INDEX idx_answers_contradiction   ON answers(contradiction_id);
CREATE INDEX idx_references_answer       ON bible_references(answer_id);
CREATE INDEX idx_contradictions_category  ON contradictions(category_id);
CREATE INDEX idx_contradictions_type      ON contradictions(contradiction_type_id);
CREATE INDEX idx_contradictions_consensus ON contradictions(scholarly_consensus_id);
CREATE INDEX idx_cs_contradiction ON contradiction_scholarship(contradiction_id);
CREATE INDEX idx_cs_source        ON contradiction_scholarship(source_id);
```

---

## Querying

### `sqlite3` CLI
```bash
sqlite3 ../contradictions.db
sqlite> .headers on
sqlite> .mode column
sqlite> SELECT id, question FROM contradictions LIMIT 5;
```

A full contradiction with its category, answers, and references:
```sql
SELECT c.question,
       cat.name AS category,
       a.answer,
       a.answer_explanation,
       r.reference
FROM contradictions c
JOIN categories cat          ON cat.id = c.category_id
JOIN answers a               ON a.contradiction_id = c.id
LEFT JOIN bible_references r ON r.answer_id = a.id
WHERE c.id = 1;
```

Contradiction counts per category:
```sql
SELECT cat.name, COUNT(c.id) AS n
FROM categories cat
LEFT JOIN contradictions c ON c.category_id = cat.id
GROUP BY cat.id
ORDER BY n DESC;
```

Counts per mechanism type, plus the most iconic / hardest entries:
```sql
SELECT t.name, COUNT(c.id) AS n
FROM contradiction_types t
LEFT JOIN contradictions c ON c.contradiction_type_id = t.id
GROUP BY t.id ORDER BY n DESC;

SELECT id, question, difficulty_level, notoriety_level, testament_scope
FROM contradictions
WHERE notoriety_level = 5 OR difficulty_level >= 4
ORDER BY notoriety_level DESC, difficulty_level DESC;
```

Entries flagged for removal by the audit pass:
```sql
SELECT id, question, delete_reason
FROM contradictions
WHERE recommend_delete = 1;
```

The "additional reading" list for one contradiction:
```sql
SELECT cs.citation_order, s.bib_core, cs.pages, cs.note, cs.bible_refs
FROM contradiction_scholarship cs
JOIN scholarship_sources s ON s.id = cs.source_id
WHERE cs.contradiction_id = 1
ORDER BY cs.citation_order;
```

### From Node (`sql.js`)
```js
const fs = require('fs');
const initSqlJs = require('sql.js');

(async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync('./data/contradictions.db'));

    const res = db.exec(
        `SELECT c.question, cat.name AS category
         FROM contradictions c JOIN categories cat ON cat.id = c.category_id
         WHERE c.id = ?`, [1]);
    console.log(res[0].values);
    db.close();
})();
```
