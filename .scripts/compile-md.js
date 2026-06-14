#!/usr/bin/env node

/**
 * compile-md.js
 * 
 * Compiles all project files into a single markdown document
 * suitable for use as Claude Project documentation.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    outputFile: 'PROJECT_DOCUMENTATION.md',
    projectName: 'Biblical Contradictions Database',
    
    // Database Editor files (relative to db-editor folder)
    editorFiles: [
        { path: 'package.json', language: 'json', description: 'Project dependencies and scripts' },
        { path: 'server.js', language: 'javascript', description: 'Express server with REST API endpoints' },
        { path: 'public/index.html', language: 'html', description: 'Main HTML page with modal dialogs' },
        { path: 'public/styles.css', language: 'css', description: 'Biblical scholar themed styles' },
        { path: 'public/app.js', language: 'javascript', description: 'Frontend application logic' },
    ],
    
    // Scraper files (relative to project root)
    scraperFiles: [
        { path: 'scrape-contradictions.js', language: 'javascript', description: 'Web scraper for skepticsannotatedbible.com' },
        { path: 'package.json', language: 'json', description: 'Scraper dependencies' },
    ],
    
    // Game application files (relative to game folder)
    gameFiles: [
        { path: 'package.json', language: 'json', description: 'Game dependencies' },
        { path: '.env.example', language: 'bash', description: 'Example environment configuration' },
        { path: 'server.js', language: 'javascript', description: 'Express + WebSocket server' },
        { path: 'src/config.js', language: 'javascript', description: 'Configuration loader with validation' },
        { path: 'src/controllers/gameController.js', language: 'javascript', description: 'Controller layer for game actions' },
        { path: 'src/services/gameService.js', language: 'javascript', description: 'Game business logic and state management' },
        { path: 'src/services/databaseService.js', language: 'javascript', description: 'SQLite database operations' },
        { path: 'src/models/gameState.js', language: 'javascript', description: 'Game state model with phases' },
        { path: 'src/utils/questionSelector.js', language: 'javascript', description: 'Random question selection utility' },
        { path: 'public/control/index.html', language: 'html', description: 'Host control panel HTML' },
        { path: 'public/control/styles.css', language: 'css', description: 'Control panel styles (dark theme)' },
        { path: 'public/control/app.js', language: 'javascript', description: 'Control panel frontend logic' },
        { path: 'public/display/index.html', language: 'html', description: 'OBS Browser Source display HTML' },
        { path: 'public/display/styles.css', language: 'css', description: 'Display styles (dramatic dark theme)' },
        { path: 'public/display/app.js', language: 'javascript', description: 'Display frontend logic' },
        { path: 'scripts/init-sample-db.js', language: 'javascript', description: 'Sample database generator for testing' },
    ]
};

function getFileContent(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        return null;
    }
}

function generateTableOfContents(sections) {
    let toc = '## Table of Contents\n\n';
    sections.forEach((section, index) => {
        const anchor = section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        toc += `${index + 1}. [${section.title}](#${anchor})\n`;
    });
    return toc + '\n';
}

function generateFileSection(file, basePath) {
    const fullPath = path.join(basePath, file.path);
    const content = getFileContent(fullPath);
    
    if (!content) {
        return null;
    }
    
    const displayName = file.rename || path.basename(file.path);
    
    return `### ${displayName}

**Path:** \`${file.path}\`

**Description:** ${file.description}

\`\`\`${file.language}
${content}
\`\`\`
`;
}

function generateDocumentation(projectRoot) {
    const timestamp = new Date().toISOString().split('T')[0];
    
    let doc = `# ${CONFIG.projectName}

> Auto-generated project documentation for Claude Projects
> Generated: ${timestamp}

---

## Project Overview

This project consists of three main components:

1. **Web Scraper** - A Node.js script that scrapes biblical contradictions from the Skeptic's Annotated Bible website
2. **Database Editor** - A web-based CRUD application for managing the scraped data
3. **INFALLIBLE Game** - A streaming quiz game where every answer is correct

### Key Features

- Scrapes 565+ biblical contradictions with answers and Bible references
- Stores data in both JSON and SQLite formats
- Web-based editor with scholarly aesthetic (parchment, burgundy, gold theme)
- Full CRUD operations via REST API
- Sort by answer count to find incomplete entries
- Filter to show only contradictions missing answers
- Export to JSON functionality
- **Quiz game** with real-time WebSocket sync between control and display pages
- **OBS-ready display** for streaming
- **Jesus Mode** - 10% chance for all questions to be about Jesus

### Tech Stack

- **Backend:** Node.js, Express, WebSocket (ws)
- **Database:** SQLite (via sql.js - pure JavaScript implementation)
- **Frontend:** Vanilla JavaScript, CSS3
- **Scraping:** Cheerio for HTML parsing

### Data Structure

\`\`\`typescript
interface Contradiction {
    question: string;
    questionUrl: string;
    answers: Answer[];
}

interface Answer {
    answer: string;
    answerExplanation: string;
    bibleReferences: string[];
}
\`\`\`

### Database Schema

\`\`\`sql
CREATE TABLE contradictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    question_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contradiction_id INTEGER NOT NULL,
    answer TEXT NOT NULL,
    answer_explanation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contradiction_id) REFERENCES contradictions(id)
);

CREATE TABLE bible_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    answer_id INTEGER NOT NULL,
    reference TEXT NOT NULL,
    FOREIGN KEY (answer_id) REFERENCES answers(id)
);
\`\`\`

---

## API Endpoints

### Database Editor API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/contradictions\` | List all contradictions with answers |
| GET | \`/api/contradictions/:id\` | Get single contradiction |
| POST | \`/api/contradictions\` | Create new contradiction |
| PUT | \`/api/contradictions/:id\` | Update contradiction |
| DELETE | \`/api/contradictions/:id\` | Delete contradiction |
| GET | \`/api/stats\` | Get database statistics |
| GET | \`/api/export\` | Export all data as JSON |

### Game API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/state\` | Get current game state |
| GET | \`/api/stats\` | Get database statistics |
| GET | \`/control\` | Host control panel |
| GET | \`/display\` | OBS Browser Source display |

### Game WebSocket Messages

| Type | Payload | Description |
|------|---------|-------------|
| \`START_GAME\` | \`{ jesusMode: boolean }\` | Start new game |
| \`SELECT_ANSWER\` | \`{ answerId: number }\` | Select an answer |
| \`CHOOSE_WRONG\` | - | Choose to be wrong |
| \`NEXT_QUESTION\` | - | Go to next question |
| \`END_GAME\` | - | End game early |
| \`RESET\` | - | Reset to idle |

---

## Usage

### Running the Scraper

\`\`\`bash
npm install
node scrape-contradictions.js
\`\`\`

### Running the Database Editor

\`\`\`bash
cd db-editor
npm install
DB_PATH=../contradictions.db PORT=3300 npm start
\`\`\`

### Running the Game

\`\`\`bash
cd game
npm install

# Use scraped database
DB_PATH=../contradictions.db npm start

# Or create sample data for testing
node scripts/init-sample-db.js
npm start
\`\`\`

**Game URLs:**
- Control Panel: http://localhost:3400/control
- OBS Display: http://localhost:3400/display

---

`;

    // Add table of contents
    const sections = [
        { title: 'Scraper Files' },
        { title: 'Database Editor Files' },
        { title: 'Game Files' }
    ];
    
    doc += generateTableOfContents(sections);
    
    // Add scraper files
    doc += '## Scraper Files\n\n';
    
    for (const file of CONFIG.scraperFiles) {
        const section = generateFileSection(file, projectRoot);
        if (section) {
            doc += section + '\n---\n\n';
        }
    }
    
    // Add editor files
    doc += '## Database Editor Files\n\n';
    
    const editorPath = path.join(projectRoot, 'db-editor');
    for (const file of CONFIG.editorFiles) {
        const section = generateFileSection(file, editorPath);
        if (section) {
            doc += section + '\n---\n\n';
        }
    }
    
    // Add game files
    doc += '## Game Files\n\n';
    doc += `### Game Overview: INFALLIBLE - You Can't Be Wrong!

A quiz game where every answer is correct, because the Bible contradicts itself.

**Game Flow:**
1. Start Game (Random or Jesus Mode)
2. Display shows question with multiple answers
3. Player selects any answer (all are correct!)
4. Reveal shows all answers as correct
5. Repeat for configured number of questions
6. Win/Lose screen with prize message

**Configuration (.env):**
| Variable | Default | Description |
|----------|---------|-------------|
| \`PORT\` | \`3400\` | Server port |
| \`DB_PATH\` | \`./contradictions.db\` | Database path |
| \`JESUS_MODE_CHANCE\` | \`0.10\` | Chance of random Jesus Mode (0-1) |
| \`JESUS_MODE_MIN_QUESTIONS\` | \`10\` | Min questions for Jesus Mode |
| \`QUESTIONS_PER_GAME\` | \`10\` | Questions per session |

**Win Prize:** "You no longer have to believe in God because he violates the law of non-contradiction!"

**Lose Prize:** "How did you lose this? Every answer was a correct answer but you managed to be as useless as your God."

---

`;
    
    const gamePath = path.join(projectRoot, 'game');
    for (const file of CONFIG.gameFiles) {
        const section = generateFileSection(file, gamePath);
        if (section) {
            doc += section + '\n---\n\n';
        }
    }
    
    // Add design notes
    doc += `## Design Notes

### Database Editor - Color Palette (Biblical Scholar Theme)

| Variable | Value | Usage |
|----------|-------|-------|
| \`--parchment\` | \`#f5f0e6\` | Background |
| \`--parchment-dark\` | \`#e8e0d0\` | Secondary background |
| \`--ink\` | \`#2c2416\` | Primary text |
| \`--ink-light\` | \`#4a4035\` | Secondary text |
| \`--burgundy\` | \`#722f37\` | Primary accent |
| \`--gold\` | \`#b8860b\` | Highlight/warning |
| \`--sage\` | \`#5c6b54\` | Success states |

### Game - Color Palette (Dramatic Dark Theme)

| Variable | Value | Usage |
|----------|-------|-------|
| \`--bg-dark\` | \`#1a1a2e\` | Background |
| \`--bg-panel\` | \`#16213e\` | Panel background |
| \`--accent-gold\` | \`#ffd700\` | Primary accent |
| \`--accent-purple\` | \`#8b5cf6\` | Secondary accent |
| \`--accent-red\` | \`#c9184a\` | Danger/wrong |
| \`--accent-green\` | \`#50c878\` | Success/correct |

### Typography

- **Editor Headings:** Crimson Pro (serif)
- **Editor Body:** Source Sans 3 (sans-serif)
- **Game Display:** Cinzel (display serif)
- **Game Body:** Crimson Pro (serif)

### UI Components

**Database Editor:**
- Cards with parchment headers
- Modal dialogs for create/edit
- Answer count badges (gold for missing, sage for present)
- Gold left border on cards missing answers

**Game Control Panel:**
- Dark theme with gold accents
- Progress bar with question count
- Answer cards with selection states
- Jesus Mode banner (purple gradient)

**Game Display (OBS):**
- Dramatic dark background with radial gradients
- Animated title with glow effects
- Answer cards with reveal animations
- Confetti on win, shake animation on wrong choice

---

## Project Structure

\`\`\`
project/
├── scrape-contradictions.js    # Web scraper
├── package.json                # Scraper dependencies
├── contradictions.json         # Scraped data (JSON)
├── contradictions.db           # Scraped data (SQLite)
├── compile-md.js               # Documentation generator
├── db-editor/
│   ├── server.js               # Express API server
│   ├── package.json            # Editor dependencies
│   └── public/
│       ├── index.html          # Main page
│       ├── styles.css          # Styles
│       └── app.js              # Frontend logic
└── game/
    ├── server.js               # Express + WebSocket server
    ├── package.json            # Game dependencies
    ├── .env.example            # Example configuration
    ├── .env                    # Local configuration (create this)
    ├── scripts/
    │   └── init-sample-db.js   # Sample database generator
    ├── src/
    │   ├── config.js           # Configuration loader
    │   ├── controllers/
    │   │   └── gameController.js
    │   ├── services/
    │   │   ├── gameService.js
    │   │   └── databaseService.js
    │   ├── models/
    │   │   └── gameState.js
    │   └── utils/
    │       └── questionSelector.js
    └── public/
        ├── control/            # Host control panel
        │   ├── index.html
        │   ├── styles.css
        │   └── app.js
        └── display/            # OBS Browser Source
            ├── index.html
            ├── styles.css
            └── app.js
\`\`\`

---

*End of documentation*
`;

    return doc;
}

function main() {
    const projectRoot = process.cwd();
    
    console.log('Compiling project documentation...\n');
    console.log(`Project root: ${projectRoot}`);
    
    const documentation = generateDocumentation(projectRoot);
    const outputPath = path.join(projectRoot, CONFIG.outputFile);
    
    fs.writeFileSync(outputPath, documentation, 'utf8');
    
    console.log(`\nDocumentation written to: ${outputPath}`);
    console.log(`File size: ${(documentation.length / 1024).toFixed(2)} KB`);
    console.log(`\nYou can now upload this file to a Claude Project.`);
}

main();