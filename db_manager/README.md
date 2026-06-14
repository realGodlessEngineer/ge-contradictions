# Biblical Contradictions Database Editor

A web-based SQLite database editor for managing biblical contradictions data. Features a scholarly, minimalist design with full CRUD functionality.

## Features

- **View** all contradictions with their answers and Bible references
- **Create** new contradictions via modal dialog
- **Edit** existing entries with full answer management
- **Delete** with confirmation dialog
- **Search** through all contradictions
- **Export** to JSON format
- **Statistics** dashboard showing database counts

## Installation

```bash
npm install
```

## Usage

### Start the server

```bash
npm start
```

The editor will be available at `http://localhost:3000`

### Configuration

Set environment variables to customize:

- `PORT` - Server port (default: 3000)
- `DB_PATH` - Path to SQLite database file (default: ./contradictions.db)

Example:
```bash
DB_PATH=./my-database.db PORT=8080 npm start
```

### Using with existing database

If you've already scraped data using the scraper script, simply copy the `contradictions.db` file to the editor directory, or specify its path:

```bash
DB_PATH=/path/to/contradictions.db npm start
```

## Design

The interface uses a **biblical scholar** aesthetic featuring:

- **Color palette**: Parchment backgrounds, burgundy accents, gold highlights
- **Typography**: Crimson Pro (serif) for headings, Source Sans for body text
- **Layout**: Clean, minimalist card-based design

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contradictions` | List all contradictions with answers |
| GET | `/api/contradictions/:id` | Get single contradiction |
| POST | `/api/contradictions` | Create new contradiction |
| PUT | `/api/contradictions/:id` | Update contradiction |
| DELETE | `/api/contradictions/:id` | Delete contradiction |
| GET | `/api/stats` | Get database statistics |
| GET | `/api/export` | Export all data as JSON |

## Data Structure

```javascript
// Request/Response format
{
  "question": "When was heaven created?",
  "questionUrl": "https://example.com/contra/heaven.html",
  "answers": [
    {
      "answer": "In the beginning",
      "answerExplanation": "Genesis states that...",
      "bibleReferences": ["Genesis 1:1", "John 1:1"]
    }
  ]
}
```

## Project Structure

```
db-editor/
├── server.js           # Express server with API routes
├── package.json        # Dependencies
└── public/
    ├── index.html      # Main HTML page
    ├── styles.css      # Scholar-themed styles
    └── app.js          # Frontend JavaScript
```

## Dependencies

- **express** - Web server framework
- **sql.js** - Pure JavaScript SQLite implementation