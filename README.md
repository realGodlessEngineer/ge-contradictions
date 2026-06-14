# Bible Contradictions

A small monorepo of three loosely-coupled Node.js apps built around a shared SQLite
database of Bible contradictions (originally scraped from the Skeptic's Annotated Bible
and other sources, then enriched with scholarly summary/commentary/citation data):

- **Root scrapers + pipelines** (`.scripts/`) — populate and enrich `contradictions.db`.
- **`db_manager/`** — Express CRUD web UI + JSON API over the DB (port `3300`), plus a
  review/approval workflow backed by a separate `reviews.db`.
- **`game/`** — Express + WebSocket streaming quiz ("INFALLIBLE", port `3400`), read-only
  against the DB.

Each app has its own `package.json` / `node_modules`; there is no root-level workspace
tooling, so dependencies are installed per app.

> Full architecture, the complete database schema, and every script are documented in
> [`CLAUDE.md`](CLAUDE.md) and [`DATABASE.md`](DATABASE.md).

## Prerequisites

- **Node.js 18+** (the game's `npm run dev` uses `node --watch`).
- No native build tools are required — persistence uses **`sql.js`** (pure-JavaScript
  SQLite), not `better-sqlite3`.

## Setup

```bash
# 1. Clone
git clone https://github.com/realGodlessEngineer/ge-contradictions.git
cd ge-contradictions

# 2. Install root dependencies (scrapers + pipelines)
npm install

# 3. Rebuild the database from the checked-in SQL snapshot.
#    The binary contradictions.db is NOT tracked in git; it is reconstructed
#    from db/schema.sql + db/data.sql. (Backs up any existing DB first.)
node .scripts/buildDbFromSql.js
#    SCHEMA_ONLY=1 node .scripts/buildDbFromSql.js   # empty DB, schema only
```

`reviews.db` (the db_manager review/approval store) is **not** in the snapshot — it is
created automatically the first time `db_manager` starts.

### Running the apps

```bash
# CRUD UI  ->  http://localhost:3300        review UI -> http://localhost:3300/review.html
cd db_manager && npm install && npm start

# Game control -> http://localhost:3400/control   OBS display -> http://localhost:3400/display
cd game && npm install && npm start
cd game && node scripts/init-sample-db.js   # optional: build a sample DB for local dev
```

### Environment / API keys

The enrichment and classification scripts call the Anthropic API and read a `.env` file
(not tracked in git — you must create your own):

- **`CLAUDE_API_KEY`** — required by the batch pipelines (scholarly-consensus, commentary
  expansion). Use `PING=1 node .scripts/run*Pipeline.js` to verify connectivity cheaply.
- **`ANTHROPIC_API_KEY`** — required by `classifyCategories.js`.

The scrapers, migrations, mechanical derivations, SQL snapshot/rebuild, and both web apps
need **no** API key.

## Scraping

Helper scripts live in `.scripts/`. Run them from the repo root:

```bash
node .scripts/scrapeContra.js
```

> `npm start` at the repo root is broken — `package.json` `main`/`start` point at
> `scrape-contradictions.js`, which does not exist. Run the script directly.

The scraper writes two files:

1. **`contradictions.json`** — JSON of all scraped data.
2. **`contradictions.db`** — the SQLite database.

## Data Structure

The scraper extracts data in the following shape:

```javascript
// Contradiction
{
  question: string,      // The contradiction question
  questionUrl: string,   // URL to the explanation page
  answers: Answer[]      // Array of answers
}

// Answer
{
  answer: string,            // The answer text (from h3 tag)
  answerExplanation: string, // Explanation text (from blockquote)
  bibleReferences: string[]  // Array of Bible verse references
}
```

### Database Schema

The *original* core schema is shown below. The live database adds several enrichment
columns and lookup/derived tables (categories, contradiction types, scholarly-consensus
levels, scholarship sources, etc.) — see [`DATABASE.md`](DATABASE.md) for the full,
current schema.

```sql
-- Main contradictions table (core columns)
CREATE TABLE contradictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    question_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Answers table (linked to contradictions)
CREATE TABLE answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contradiction_id INTEGER NOT NULL,
    answer TEXT NOT NULL,
    answer_explanation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contradiction_id) REFERENCES contradictions(id)
);

-- Bible references table (linked to answers)
CREATE TABLE bible_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    answer_id INTEGER NOT NULL,
    reference TEXT NOT NULL,
    FOREIGN KEY (answer_id) REFERENCES answers(id)
);
```

## Configuration

Scraper constants at the top of `.scripts/scrapeContra.js`:

- `REQUEST_DELAY` — milliseconds between requests (default: 500)
- `BASE_URL` — base URL of the website
- `SEED_URL` — starting page URL

## Dependencies

- **cheerio** — HTML parsing and DOM manipulation
- **sql.js** — pure-JavaScript SQLite implementation

## Notes

- The scraper rate-limits with a configurable delay between requests.
- Progress is logged to the console during execution.
- Errors are caught and logged so the scraper continues processing other pages.
