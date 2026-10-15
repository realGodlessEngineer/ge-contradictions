# Scrapers

Three independent scrapers, each targeting a different source. They share a shape but no code.

- **`scrapeContra.js`** — fetches `skepticsannotatedbible.com` live (seed URL → list → answer
  pages). Writes both `contradictions.json` and `contradictions.db` directly. Parses the `.contra`
  div with `<h3>` answer + `<blockquote>` explanation (with an h3-only fallback for pages lacking the
  wrapper). Fixed 500 ms delay. Its `initDatabase()` is one of the two DDL copies (see CLAUDE.md).
- **`scrapeInfidels.js` / `scrapeEvilBible.js`** — read a **local** index HTML snapshot from
  `data/`, then fetch per-question answer pages from `philb61.github.io`. JSON-only output; merging
  into the DB is a separate manual step. Random 1.5–4.5 s delay to imitate human browsing.

The `insertNew*.js` scripts exist because the secondary sources overlap with the SAB data — only
specific, hand-selected indices (hardcoded `NEW_INDICES` arrays) get merged into
`contradictions.db`. When adding new merges, update that array rather than inserting everything.
