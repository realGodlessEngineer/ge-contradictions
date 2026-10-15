# The two web apps

## db_manager (`db_manager/`, port 3300)

```bash
cd db_manager && npm install && npm start          # CRUD http://localhost:3300 · review /review.html · harmonization /harmonization.html
DB_PATH=../contradictions.db PORT=8080 npm start   # override DB path / port (default ../contradictions.db)
REVIEW_DB_PATH=../reviews.db npm start             # override review store path
```

Three UIs in `public/`: CRUD (`index.html` + `app.js`), review (`review.html` + `review.js`),
harmonization authoring (`harmonization.html` + `harmonization.js`).

- `createTables()` in `server.js` is the second DDL copy. Persist every mutation with
  `saveDatabase()` (sql.js is in-memory).
- **`PUT /api/contradictions/:id`** replaces the entry and **nulls the scholarly fields unless
  resupplied**. **`PATCH /api/contradictions/:id/scholarship`** updates only
  `summary`/`commentary`/`scholarship`/`recommendDelete`/`deleteReason`, leaving answers/refs alone.
  Neither writes `category_id` or any depth/consensus field — those are script-only.
- `GET /api/categories` returns the `categories` lookup rows.
- **Review/approval subsystem** — a separate store `reviews.db` with `reviews` (one current
  decision per `contradiction_id`: `status`, `note`, `reviewer`, `content_hash`, `updated_at`) and
  `review_events` (append-only audit trail). Status ∈ `pending`/`needs_review`/`approved`/
  `rejected`/`needs_changes`. Endpoints: `GET /api/reviews` (id→state map with computed `stale`),
  `GET /api/reviews/stats`, `GET /api/reviews/:id/history`, `PUT /api/reviews/:id`. `stale`
  compares a stored sha1 of `question`+`summary`+`commentary`+`scholarship` with the current
  value, so approvals auto-flag when content changes. The review API never writes
  `contradictions.db`.
- **Harmonization authoring** — `GET /api/harmonization/queue` (honest-absence worklist),
  `GET /api/harmonization/:id`, `PUT /api/harmonization/:id`. Edits the discrepancy-pole editorial
  `emptyNote`/attr/half-line in `data/harmonization/curation/dossier/<id>.json` only (never a
  `.db`); the operator re-bakes with `ALL=1 node .scripts/buildHarmonizationTables.js`. Dossiers
  are written without a trailing newline to keep git diffs minimal. See `harmonization.md`.

## game (`game/`, port 3400)

```bash
cd game && npm install && npm start        # http://localhost:3400/control  (OBS: /display)
npm run dev                                # node --watch server.js
node scripts/init-sample-db.js             # sample DB for local dev without the real data
```

```
server.js  ─►  GameController  ─►  GameService  ─►  DatabaseService
                                        └─►  GameState (model) + QuestionSelector (util)
```

- `server.js` owns HTTP, WebSocket connections, and the `handleMessage` routing switch. Two client
  pools, `clients.control` and `clients.display`, chosen by the `?type=` query param on the WS URL.
- After any state-mutating message the server broadcasts `STATE_UPDATE` to all clients — the single
  sync mechanism between the host control panel and the OBS display.
- `GameController` is a thin pass-through; `GameService` owns the rules (phase machine in
  `GameState.PHASES`, Jesus Mode fallback, win/lose).
- Config: `src/config.js` (dotenv + validation; the `.env.example` the README mentions is not
  checked in). `DB_PATH` resolves relative to `game/` and defaults to `./contradictions.db` inside
  `game/` — use `../contradictions.db` for the shared DB.
- "Jesus Mode" filters by `LOWER(question) LIKE '%jesus%'` (`databaseService.js`); below
  `JESUS_MODE_MIN_QUESTIONS` matches it silently falls back to the full pool. Read-only on the DB.
