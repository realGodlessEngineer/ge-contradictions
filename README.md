# Bible Contradictions Scraper

A Node.js script that scrapes Bible contradictions from the Skeptic's Annotated Bible website.

## Data Structure

The script extracts data in the following format:

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

## Installation

```bash
npm install
```

## Usage

Helper scripts live in `.scripts/`. Run them from the repo root:

```bash
node .scripts/scrapeContra.js
```

> `npm start` is broken — `package.json` `main`/`start` point at `scrape-contradictions.js`, which does not exist. Run the script directly.

## Output

The script generates two files:

1. **contradictions.json** - JSON file containing all scraped data
2. **contradictions.db** - SQLite database with the following schema:

### Database Schema

```sql
-- Main contradictions table
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

You can adjust the following constants at the top of the script:

- `REQUEST_DELAY` - Milliseconds to wait between requests (default: 500)
- `BASE_URL` - Base URL of the website
- `SEED_URL` - Starting page URL

## Dependencies

- **cheerio** - HTML parsing and DOM manipulation
- **sql.js** - Pure JavaScript SQLite implementation

## Notes

- The script respects rate limiting with a configurable delay between requests
- Progress is logged to the console during execution
- Errors are caught and logged, allowing the script to continue processing other pages