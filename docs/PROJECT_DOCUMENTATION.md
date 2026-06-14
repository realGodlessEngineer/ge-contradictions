# Biblical Contradictions Database

> Auto-generated project documentation for Claude Projects
> Generated: 2026-01-29

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

```typescript
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
```

### Database Schema

```sql
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
```

---

## API Endpoints

### Database Editor API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contradictions` | List all contradictions with answers |
| GET | `/api/contradictions/:id` | Get single contradiction |
| POST | `/api/contradictions` | Create new contradiction |
| PUT | `/api/contradictions/:id` | Update contradiction |
| DELETE | `/api/contradictions/:id` | Delete contradiction |
| GET | `/api/stats` | Get database statistics |
| GET | `/api/export` | Export all data as JSON |

### Game API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/state` | Get current game state |
| GET | `/api/stats` | Get database statistics |
| GET | `/control` | Host control panel |
| GET | `/display` | OBS Browser Source display |

### Game WebSocket Messages

| Type | Payload | Description |
|------|---------|-------------|
| `START_GAME` | `{ jesusMode: boolean }` | Start new game |
| `SELECT_ANSWER` | `{ answerId: number }` | Select an answer |
| `CHOOSE_WRONG` | - | Choose to be wrong |
| `NEXT_QUESTION` | - | Go to next question |
| `END_GAME` | - | End game early |
| `RESET` | - | Reset to idle |

---

## Usage

### Running the Scraper

```bash
npm install
node scrape-contradictions.js
```

### Running the Database Editor

```bash
cd db-editor
npm install
DB_PATH=../contradictions.db PORT=3300 npm start
```

### Running the Game

```bash
cd game
npm install

# Use scraped database
DB_PATH=../contradictions.db npm start

# Or create sample data for testing
node scripts/init-sample-db.js
npm start
```

**Game URLs:**
- Control Panel: http://localhost:3400/control
- OBS Display: http://localhost:3400/display

---

## Table of Contents

1. [Scraper Files](#scraper-files)
2. [Database Editor Files](#database-editor-files)
3. [Game Files](#game-files)

## Scraper Files

### package.json

**Path:** `package.json`

**Description:** Scraper dependencies

```json
{
  "name": "bible-contradictions-scraper",
  "version": "1.0.0",
  "description": "Scrapes Bible contradictions from skepticsannotatedbible.com",
  "main": "scrape-contradictions.js",
  "scripts": {
    "start": "node scrape-contradictions.js"
  },
  "dependencies": {
    "cheerio": "^1.0.0",
    "sql.js": "^1.10.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## Database Editor Files

## Game Files

### Game Overview: INFALLIBLE - You Can't Be Wrong!

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
| `PORT` | `3400` | Server port |
| `DB_PATH` | `./contradictions.db` | Database path |
| `JESUS_MODE_CHANCE` | `0.10` | Chance of random Jesus Mode (0-1) |
| `JESUS_MODE_MIN_QUESTIONS` | `10` | Min questions for Jesus Mode |
| `QUESTIONS_PER_GAME` | `10` | Questions per session |

**Win Prize:** "You no longer have to believe in God because he violates the law of non-contradiction!"

**Lose Prize:** "How did you lose this? Every answer was a correct answer but you managed to be as useless as your God."

---

### package.json

**Path:** `package.json`

**Description:** Game dependencies

```json
{
  "name": "infallible-game",
  "version": "1.0.0",
  "description": "INFALLIBLE - You Can't Be Wrong! A quiz game where every answer is correct.",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "sql.js": "^1.10.0",
    "ws": "^8.16.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

### server.js

**Path:** `server.js`

**Description:** Express + WebSocket server

```javascript
/**
 * INFALLIBLE Game Server
 * Express + WebSocket server for real-time game state synchronization
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const { config, logConfig } = require('./src/config');
const GameController = require('./src/controllers/gameController');
const DatabaseService = require('./src/services/databaseService');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize services
let gameController;

// WebSocket connection handling
const clients = {
    control: new Set(),
    display: new Set()
};

function broadcast(message, targetType = 'all') {
    const data = JSON.stringify(message);
    
    if (targetType === 'all' || targetType === 'control') {
        clients.control.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }
    
    if (targetType === 'all' || targetType === 'display') {
        clients.display.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }
}

wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const clientType = url.searchParams.get('type') || 'display';
    
    clients[clientType]?.add(ws);
    console.log(`${clientType} client connected`);
    
    // Send current game state on connection
    ws.send(JSON.stringify({
        type: 'STATE_UPDATE',
        payload: gameController.getState()
    }));
    
    ws.on('message', (message) => {
        try {
            const { type, payload } = JSON.parse(message);
            handleMessage(type, payload, ws);
        } catch (error) {
            console.error('Invalid message:', error);
        }
    });
    
    ws.on('close', () => {
        clients.control.delete(ws);
        clients.display.delete(ws);
        console.log(`${clientType} client disconnected`);
    });
});

function handleMessage(type, payload, sender) {
    let result;
    
    switch (type) {
        case 'START_GAME':
            result = gameController.startGame(payload?.jesusMode);
            break;
            
        case 'SELECT_ANSWER':
            result = gameController.selectAnswer(payload.answerId);
            break;
            
        case 'CHOOSE_WRONG':
            result = gameController.chooseWrong();
            break;
            
        case 'NEXT_QUESTION':
            result = gameController.nextQuestion();
            break;
            
        case 'END_GAME':
            result = gameController.endGame();
            break;
            
        case 'RESET':
            result = gameController.reset();
            break;
            
        default:
            console.log('Unknown message type:', type);
            return;
    }
    
    if (result) {
        broadcast({
            type: 'STATE_UPDATE',
            payload: gameController.getState()
        });
    }
}

// REST API endpoints
app.get('/api/state', (req, res) => {
    res.json(gameController.getState());
});

app.get('/api/stats', (req, res) => {
    res.json(gameController.getStats());
});

// Page routes
app.get('/control', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'control', 'index.html'));
});

app.get('/display', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'display', 'index.html'));
});

app.get('/', (req, res) => {
    res.redirect('/control');
});

// Initialize and start server
async function initialize() {
    try {
        logConfig();
        console.log('');
        
        console.log('Loading database from:', config.dbPath);
        const dbService = new DatabaseService(config.dbPath);
        await dbService.initialize();
        
        gameController = new GameController(dbService);
        
        const stats = dbService.getStats();
        console.log(`Database loaded: ${stats.totalContradictions} contradictions, ${stats.totalAnswers} answers`);
        
        if (stats.jesusContradictions < config.game.jesusMinQuestions) {
            console.log(`Warning: Only ${stats.jesusContradictions} Jesus questions (need ${config.game.jesusMinQuestions} for Jesus Mode)`);
        }
        
        server.listen(config.port, () => {
            console.log(`\n🎮 INFALLIBLE Game Server running on port ${config.port}`);
            console.log(`   Control: http://localhost:${config.port}/control`);
            console.log(`   Display: http://localhost:${config.port}/display`);
        });
    } catch (error) {
        console.error('Failed to initialize:', error);
        process.exit(1);
    }
}

initialize();
```

---

### config.js

**Path:** `src/config.js`

**Description:** Configuration loader with validation

```javascript
/**
 * Configuration Module
 * Loads settings from .env file with sensible defaults
 */

require('dotenv').config();
const path = require('path');

// Project root is one level up from src/
const PROJECT_ROOT = path.join(__dirname, '..');

const config = {
    // Server settings
    port: parseInt(process.env.PORT, 10) || 3400,
    
    // Database settings
    dbPath: process.env.DB_PATH 
        ? (path.isAbsolute(process.env.DB_PATH) 
            ? process.env.DB_PATH 
            : path.join(PROJECT_ROOT, process.env.DB_PATH))
        : path.join(PROJECT_ROOT, 'contradictions.db'),
    
    // Game settings
    game: {
        // Chance of random Jesus Mode (0.0 to 1.0)
        jesusModeChance: parseFloat(process.env.JESUS_MODE_CHANCE) || 0.10,
        
        // Minimum questions needed for Jesus Mode
        jesusMinQuestions: parseInt(process.env.JESUS_MODE_MIN_QUESTIONS, 10) || 10,
        
        // Questions per game session
        questionsPerGame: parseInt(process.env.QUESTIONS_PER_GAME, 10) || 10,
    }
};

// Validate configuration
function validateConfig() {
    const errors = [];
    
    if (config.port < 1 || config.port > 65535) {
        errors.push(`Invalid PORT: ${config.port}. Must be between 1 and 65535.`);
    }
    
    if (config.game.jesusModeChance < 0 || config.game.jesusModeChance > 1) {
        errors.push(`Invalid JESUS_MODE_CHANCE: ${config.game.jesusModeChance}. Must be between 0.0 and 1.0.`);
    }
    
    if (config.game.questionsPerGame < 1) {
        errors.push(`Invalid QUESTIONS_PER_GAME: ${config.game.questionsPerGame}. Must be at least 1.`);
    }
    
    if (errors.length > 0) {
        console.error('Configuration errors:');
        errors.forEach(err => console.error(`  - ${err}`));
        process.exit(1);
    }
}

validateConfig();

// Log configuration on startup (excluding sensitive data)
function logConfig() {
    console.log('Configuration:');
    console.log(`  Port: ${config.port}`);
    console.log(`  Database: ${config.dbPath}`);
    console.log(`  Jesus Mode Chance: ${(config.game.jesusModeChance * 100).toFixed(0)}%`);
    console.log(`  Questions Per Game: ${config.game.questionsPerGame}`);
}

module.exports = { config, logConfig };
```

---

### gameController.js

**Path:** `src/controllers/gameController.js`

**Description:** Controller layer for game actions

```javascript
/**
 * GameController
 * Controller layer that delegates to GameService
 * Provides a clean API for the server
 */

const GameService = require('../services/gameService');

class GameController {
    constructor(databaseService) {
        this.gameService = new GameService(databaseService);
    }
    
    /**
     * Start a new game
     * @param {boolean} jesusMode - Force Jesus-only questions
     * @returns {boolean} Success status
     */
    startGame(jesusMode = false) {
        return this.gameService.startGame(jesusMode);
    }
    
    /**
     * Select an answer
     * @param {number} answerId - Selected answer ID
     * @returns {boolean} Success status
     */
    selectAnswer(answerId) {
        return this.gameService.selectAnswer(answerId);
    }
    
    /**
     * Choose to be wrong
     * @returns {boolean} Success status
     */
    chooseWrong() {
        return this.gameService.chooseWrong();
    }
    
    /**
     * Move to next question
     * @returns {boolean} Success status
     */
    nextQuestion() {
        return this.gameService.nextQuestion();
    }
    
    /**
     * End the current game
     * @returns {boolean} Success status
     */
    endGame() {
        return this.gameService.endGame();
    }
    
    /**
     * Reset to idle state
     * @returns {boolean} Success status
     */
    reset() {
        return this.gameService.reset();
    }
    
    /**
     * Get current game state
     * @returns {Object} Serialized game state
     */
    getState() {
        return this.gameService.getState();
    }
    
    /**
     * Get database statistics
     * @returns {Object} Stats object
     */
    getStats() {
        return this.gameService.getStats();
    }
}

module.exports = GameController;
```

---

### gameService.js

**Path:** `src/services/gameService.js`

**Description:** Game business logic and state management

```javascript
/**
 * GameService
 * Handles game business logic and state management
 */

const GameState = require('../models/gameState');
const QuestionSelector = require('../utils/questionSelector');
const { config } = require('../config');

class GameService {
    constructor(databaseService) {
        this.dbService = databaseService;
        this.state = new GameState();
        this.questionSelector = new QuestionSelector();
    }
    
    /**
     * Start a new game session
     * @param {boolean} forceJesusMode - Force Jesus-only questions
     * @returns {boolean} Success status
     */
    startGame(forceJesusMode = false) {
        const questionsNeeded = config.game.questionsPerGame;
        
        // Determine if this should be a Jesus-themed game
        // Based on configured chance, or forced
        const jesusMode = forceJesusMode || (Math.random() < config.game.jesusModeChance);
        
        let availableQuestions;
        
        if (jesusMode) {
            availableQuestions = this.dbService.getJesusContradictions();
            // Fall back to regular mode if not enough Jesus questions
            if (availableQuestions.length < config.game.jesusMinQuestions) {
                availableQuestions = this.dbService.getContradictionsWithAnswers();
                this.state.jesusMode = false;
            } else {
                this.state.jesusMode = true;
            }
        } else {
            availableQuestions = this.dbService.getContradictionsWithAnswers();
            this.state.jesusMode = false;
        }
        
        // Select random questions
        const selectedQuestions = this.questionSelector.selectRandom(availableQuestions, questionsNeeded);
        
        if (selectedQuestions.length < questionsNeeded) {
            console.error(`Not enough questions available (need ${questionsNeeded}, got ${selectedQuestions.length})`);
            return false;
        }
        
        this.state.questions = selectedQuestions;
        this.state.currentQuestionIndex = 0;
        this.state.score = 0;
        this.state.wrongChoices = 0;
        this.state.phase = GameState.PHASES.QUESTION;
        this.state.selectedAnswerId = null;
        this.state.isRevealed = false;
        this.state.gameOver = false;
        this.state.gameResult = null;
        
        return true;
    }
    
    /**
     * Select an answer for the current question
     * @param {number} answerId - The ID of the selected answer
     * @returns {boolean} Success status
     */
    selectAnswer(answerId) {
        if (this.state.phase !== GameState.PHASES.QUESTION) {
            return false;
        }
        
        const currentQuestion = this.getCurrentQuestion();
        if (!currentQuestion) return false;
        
        // Verify the answer belongs to this question
        const validAnswer = currentQuestion.answers.find(a => a.id === answerId);
        if (!validAnswer) return false;
        
        this.state.selectedAnswerId = answerId;
        this.state.isRevealed = true;
        this.state.score++;
        this.state.phase = GameState.PHASES.REVEALED;
        
        return true;
    }
    
    /**
     * Player chooses to be wrong (refuses all correct answers)
     * @returns {boolean} Success status
     */
    chooseWrong() {
        if (this.state.phase !== GameState.PHASES.QUESTION) {
            return false;
        }
        
        this.state.wrongChoices++;
        this.state.selectedAnswerId = null;
        this.state.isRevealed = true;
        this.state.phase = GameState.PHASES.REVEALED;
        
        return true;
    }
    
    /**
     * Progress to the next question
     * @returns {boolean} Success status
     */
    nextQuestion() {
        if (this.state.phase !== GameState.PHASES.REVEALED) {
            return false;
        }
        
        this.state.currentQuestionIndex++;
        
        // Check if game is complete
        if (this.state.currentQuestionIndex >= this.state.questions.length) {
            this.endGame();
            return true;
        }
        
        // Reset for next question
        this.state.selectedAnswerId = null;
        this.state.isRevealed = false;
        this.state.phase = GameState.PHASES.QUESTION;
        
        return true;
    }
    
    /**
     * End the game and determine result
     * @returns {boolean} Success status
     */
    endGame() {
        this.state.gameOver = true;
        this.state.phase = GameState.PHASES.GAME_OVER;
        
        // Determine win/lose based on wrong choices
        // If they chose wrong even once, they "lose"
        if (this.state.wrongChoices > 0) {
            this.state.gameResult = 'lose';
        } else {
            this.state.gameResult = 'win';
        }
        
        return true;
    }
    
    /**
     * Reset game to initial state
     * @returns {boolean} Success status
     */
    reset() {
        this.state = new GameState();
        return true;
    }
    
    /**
     * Get the current question
     * @returns {Object|null} Current question or null
     */
    getCurrentQuestion() {
        if (this.state.currentQuestionIndex < 0 || 
            this.state.currentQuestionIndex >= this.state.questions.length) {
            return null;
        }
        return this.state.questions[this.state.currentQuestionIndex];
    }
    
    /**
     * Get the complete game state for broadcasting
     * @returns {Object} Serialized game state
     */
    getState() {
        const currentQuestion = this.getCurrentQuestion();
        
        return {
            phase: this.state.phase,
            jesusMode: this.state.jesusMode,
            currentQuestionIndex: this.state.currentQuestionIndex,
            totalQuestions: this.state.questions.length,
            score: this.state.score,
            wrongChoices: this.state.wrongChoices,
            selectedAnswerId: this.state.selectedAnswerId,
            isRevealed: this.state.isRevealed,
            gameOver: this.state.gameOver,
            gameResult: this.state.gameResult,
            currentQuestion: currentQuestion ? {
                id: currentQuestion.id,
                question: currentQuestion.question,
                questionUrl: currentQuestion.questionUrl,
                answers: currentQuestion.answers.map(a => ({
                    id: a.id,
                    answer: a.answer,
                    explanation: a.explanation,
                    references: a.references
                }))
            } : null
        };
    }
    
    /**
     * Get game statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        const dbStats = this.dbService.getStats();
        return {
            ...dbStats,
            config: {
                jesusModeChance: config.game.jesusModeChance,
                questionsPerGame: config.game.questionsPerGame
            }
        };
    }
}

module.exports = GameService;
```

---

### databaseService.js

**Path:** `src/services/databaseService.js`

**Description:** SQLite database operations

```javascript
/**
 * DatabaseService
 * Handles all database operations using sql.js
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

class DatabaseService {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null;
    }
    
    async initialize() {
        const SQL = await initSqlJs();
        
        if (fs.existsSync(this.dbPath)) {
            const buffer = fs.readFileSync(this.dbPath);
            this.db = new SQL.Database(buffer);
        } else {
            throw new Error(`Database not found at: ${this.dbPath}`);
        }
    }
    
    /**
     * Get all contradictions with their answers
     * @returns {Array} Array of contradiction objects
     */
    getAllContradictions() {
        const contradictions = this.db.exec(`
            SELECT id, question, question_url 
            FROM contradictions 
            ORDER BY id
        `);
        
        if (!contradictions.length) return [];
        
        return contradictions[0].values.map(([id, question, questionUrl]) => ({
            id,
            question,
            questionUrl,
            answers: this.getAnswersForContradiction(id)
        }));
    }
    
    /**
     * Get contradictions that have at least one answer
     * @returns {Array} Array of contradiction objects with answers
     */
    getContradictionsWithAnswers() {
        const contradictions = this.db.exec(`
            SELECT DISTINCT c.id, c.question, c.question_url 
            FROM contradictions c
            INNER JOIN answers a ON c.id = a.contradiction_id
            ORDER BY c.id
        `);
        
        if (!contradictions.length) return [];
        
        return contradictions[0].values.map(([id, question, questionUrl]) => ({
            id,
            question,
            questionUrl,
            answers: this.getAnswersForContradiction(id)
        }));
    }
    
    /**
     * Get contradictions about Jesus
     * @returns {Array} Array of Jesus-related contradiction objects
     */
    getJesusContradictions() {
        const contradictions = this.db.exec(`
            SELECT DISTINCT c.id, c.question, c.question_url 
            FROM contradictions c
            INNER JOIN answers a ON c.id = a.contradiction_id
            WHERE LOWER(c.question) LIKE '%jesus%'
            ORDER BY c.id
        `);
        
        if (!contradictions.length) return [];
        
        return contradictions[0].values.map(([id, question, questionUrl]) => ({
            id,
            question,
            questionUrl,
            answers: this.getAnswersForContradiction(id)
        }));
    }
    
    /**
     * Get answers for a specific contradiction
     * @param {number} contradictionId 
     * @returns {Array} Array of answer objects
     */
    getAnswersForContradiction(contradictionId) {
        const answers = this.db.exec(`
            SELECT id, answer, answer_explanation 
            FROM answers 
            WHERE contradiction_id = ?
        `, [contradictionId]);
        
        if (!answers.length) return [];
        
        return answers[0].values.map(([id, answer, explanation]) => ({
            id,
            answer,
            explanation,
            references: this.getReferencesForAnswer(id)
        }));
    }
    
    /**
     * Get Bible references for a specific answer
     * @param {number} answerId 
     * @returns {Array} Array of reference strings
     */
    getReferencesForAnswer(answerId) {
        const refs = this.db.exec(`
            SELECT reference 
            FROM bible_references 
            WHERE answer_id = ?
        `, [answerId]);
        
        if (!refs.length) return [];
        
        return refs[0].values.map(([ref]) => ref);
    }
    
    /**
     * Get a single contradiction by ID
     * @param {number} id 
     * @returns {Object|null} Contradiction object or null
     */
    getContradictionById(id) {
        const result = this.db.exec(`
            SELECT id, question, question_url 
            FROM contradictions 
            WHERE id = ?
        `, [id]);
        
        if (!result.length || !result[0].values.length) return null;
        
        const [cId, question, questionUrl] = result[0].values[0];
        return {
            id: cId,
            question,
            questionUrl,
            answers: this.getAnswersForContradiction(cId)
        };
    }
    
    /**
     * Get database statistics
     * @returns {Object} Stats object
     */
    getStats() {
        const totalContradictions = this.db.exec('SELECT COUNT(*) FROM contradictions')[0].values[0][0];
        const totalAnswers = this.db.exec('SELECT COUNT(*) FROM answers')[0].values[0][0];
        const contradictionsWithAnswers = this.db.exec(`
            SELECT COUNT(DISTINCT contradiction_id) FROM answers
        `)[0].values[0][0];
        const jesusContradictions = this.db.exec(`
            SELECT COUNT(DISTINCT c.id) 
            FROM contradictions c
            INNER JOIN answers a ON c.id = a.contradiction_id
            WHERE LOWER(c.question) LIKE '%jesus%'
        `)[0].values[0][0];
        
        return {
            totalContradictions,
            totalAnswers,
            contradictionsWithAnswers,
            jesusContradictions
        };
    }
}

module.exports = DatabaseService;
```

---

### gameState.js

**Path:** `src/models/gameState.js`

**Description:** Game state model with phases

```javascript
/**
 * GameState
 * Data model for game state
 */

class GameState {
    static PHASES = {
        IDLE: 'idle',
        QUESTION: 'question',
        REVEALED: 'revealed',
        GAME_OVER: 'game_over'
    };
    
    constructor() {
        this.phase = GameState.PHASES.IDLE;
        this.jesusMode = false;
        this.questions = [];
        this.currentQuestionIndex = -1;
        this.score = 0;
        this.wrongChoices = 0;
        this.selectedAnswerId = null;
        this.isRevealed = false;
        this.gameOver = false;
        this.gameResult = null; // 'win' or 'lose'
    }
    
    /**
     * Create a copy of the state
     * @returns {Object} Plain object copy
     */
    toJSON() {
        return {
            phase: this.phase,
            jesusMode: this.jesusMode,
            questions: this.questions,
            currentQuestionIndex: this.currentQuestionIndex,
            score: this.score,
            wrongChoices: this.wrongChoices,
            selectedAnswerId: this.selectedAnswerId,
            isRevealed: this.isRevealed,
            gameOver: this.gameOver,
            gameResult: this.gameResult
        };
    }
}

module.exports = GameState;
```

---

### questionSelector.js

**Path:** `src/utils/questionSelector.js`

**Description:** Random question selection utility

```javascript
/**
 * QuestionSelector
 * Utility for selecting and shuffling questions
 */

class QuestionSelector {
    /**
     * Select random questions from a pool
     * @param {Array} questions - Array of questions to select from
     * @param {number} count - Number of questions to select
     * @returns {Array} Selected questions
     */
    selectRandom(questions, count) {
        if (!questions || questions.length === 0) {
            return [];
        }
        
        // Filter to only questions with at least 2 answers for better gameplay
        const validQuestions = questions.filter(q => q.answers && q.answers.length >= 2);
        
        if (validQuestions.length < count) {
            // If not enough with 2+ answers, include those with 1 answer
            const singleAnswerQuestions = questions.filter(q => q.answers && q.answers.length === 1);
            validQuestions.push(...singleAnswerQuestions);
        }
        
        // Shuffle using Fisher-Yates algorithm
        const shuffled = this.shuffle([...validQuestions]);
        
        // Take the first 'count' questions
        return shuffled.slice(0, count);
    }
    
    /**
     * Fisher-Yates shuffle algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    /**
     * Shuffle answers within a question
     * @param {Object} question - Question object with answers
     * @returns {Object} Question with shuffled answers
     */
    shuffleAnswers(question) {
        return {
            ...question,
            answers: this.shuffle([...question.answers])
        };
    }
}

module.exports = QuestionSelector;
```

---

### index.html

**Path:** `public/control/index.html`

**Description:** Host control panel HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>INFALLIBLE - Game Control</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/control/styles.css">
</head>
<body>
    <div class="control-panel">
        <header class="header">
            <h1>INFALLIBLE</h1>
            <p class="subtitle">Game Control Panel</p>
        </header>
        
        <!-- Connection Status -->
        <div class="connection-status" id="connectionStatus">
            <span class="status-dot"></span>
            <span class="status-text">Connecting...</span>
        </div>
        
        <!-- Game Phase Indicator -->
        <div class="phase-indicator" id="phaseIndicator">
            <span class="phase-label">Phase:</span>
            <span class="phase-value" id="phaseValue">IDLE</span>
        </div>
        
        <!-- Start Screen -->
        <section class="panel start-panel" id="startPanel">
            <h2>Start New Game</h2>
            <div class="stats-display" id="statsDisplay">
                <p>Loading database...</p>
            </div>
            <div class="start-options">
                <button class="btn btn-primary btn-large" id="btnStartRandom">
                    🎲 Start Random Game
                </button>
                <button class="btn btn-secondary btn-large" id="btnStartJesus">
                    ✝️ Start Jesus Mode
                </button>
            </div>
        </section>
        
        <!-- Game Control -->
        <section class="panel game-panel" id="gamePanel" style="display: none;">
            <!-- Progress -->
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
                <span class="progress-text" id="progressText">0 / 10</span>
            </div>
            
            <!-- Jesus Mode Banner -->
            <div class="jesus-banner" id="jesusBanner" style="display: none;">
                ✝️ JESUS MODE ACTIVATED ✝️
            </div>
            
            <!-- Score Display -->
            <div class="score-display">
                <div class="score-item">
                    <span class="score-label">Correct</span>
                    <span class="score-value" id="scoreValue">0</span>
                </div>
                <div class="score-item wrong">
                    <span class="score-label">Chose Wrong</span>
                    <span class="score-value" id="wrongValue">0</span>
                </div>
            </div>
            
            <!-- Current Question -->
            <div class="question-section">
                <h3>Current Question</h3>
                <div class="question-text" id="questionText">
                    No question loaded
                </div>
                <a class="question-link" id="questionLink" href="#" target="_blank">View Source</a>
            </div>
            
            <!-- Answers -->
            <div class="answers-section">
                <h3>Answers</h3>
                <div class="answers-list" id="answersList">
                    <!-- Answers populated dynamically -->
                </div>
            </div>
            
            <!-- Control Buttons -->
            <div class="control-buttons">
                <button class="btn btn-danger" id="btnChooseWrong" disabled>
                    ❌ Choose To Be Wrong
                </button>
                <button class="btn btn-primary" id="btnNextQuestion" disabled>
                    Next Question →
                </button>
                <button class="btn btn-secondary" id="btnEndGame">
                    End Game
                </button>
            </div>
        </section>
        
        <!-- Game Over Panel -->
        <section class="panel gameover-panel" id="gameoverPanel" style="display: none;">
            <h2 id="gameoverTitle">Game Complete!</h2>
            <div class="final-score">
                <p>Correct Answers: <span id="finalScore">0</span> / 10</p>
                <p>Wrong Choices: <span id="finalWrong">0</span></p>
            </div>
            <div class="result-message" id="resultMessage"></div>
            <button class="btn btn-primary btn-large" id="btnPlayAgain">
                🔄 Play Again
            </button>
        </section>
    </div>
    
    <script src="/control/app.js"></script>
</body>
</html>
```

---

### styles.css

**Path:** `public/control/styles.css`

**Description:** Control panel styles (dark theme)

```css
/**
 * INFALLIBLE Game Control Panel Styles
 */

:root {
    /* Colors - Dark theme for control panel */
    --bg-dark: #1a1a2e;
    --bg-panel: #16213e;
    --bg-card: #0f3460;
    --text-primary: #eee;
    --text-secondary: #aaa;
    --accent-gold: #e6a919;
    --accent-blue: #0077b6;
    --accent-red: #c9184a;
    --accent-green: #38b000;
    --accent-purple: #7b2cbf;
    
    /* Typography */
    --font-display: 'Cinzel', serif;
    --font-body: 'Crimson Pro', serif;
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    
    /* Border radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: var(--font-body);
    background: var(--bg-dark);
    color: var(--text-primary);
    min-height: 100vh;
    line-height: 1.6;
}

/* Header */
.header {
    text-align: center;
    padding: var(--spacing-xl);
    background: linear-gradient(135deg, var(--bg-panel) 0%, var(--bg-card) 100%);
    border-bottom: 3px solid var(--accent-gold);
}

.header h1 {
    font-family: var(--font-display);
    font-size: 2.5rem;
    color: var(--accent-gold);
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    letter-spacing: 0.2em;
}

.header .subtitle {
    color: var(--text-secondary);
    font-size: 1rem;
    margin-top: var(--spacing-xs);
}

/* Connection Status */
.connection-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: var(--bg-panel);
}

.status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--accent-red);
    animation: pulse 2s infinite;
}

.connection-status.connected .status-dot {
    background: var(--accent-green);
    animation: none;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* Phase Indicator */
.phase-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: var(--bg-card);
    font-size: 1.1rem;
}

.phase-label {
    color: var(--text-secondary);
}

.phase-value {
    font-family: var(--font-display);
    color: var(--accent-gold);
    font-weight: 600;
}

/* Panels */
.panel {
    padding: var(--spacing-xl);
    margin: var(--spacing-md);
    background: var(--bg-panel);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(255,255,255,0.1);
}

.panel h2 {
    font-family: var(--font-display);
    color: var(--accent-gold);
    margin-bottom: var(--spacing-lg);
    text-align: center;
}

.panel h3 {
    font-family: var(--font-display);
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
    font-size: 1.1rem;
}

/* Stats Display */
.stats-display {
    background: var(--bg-card);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-lg);
    text-align: center;
}

.stats-display p {
    margin: var(--spacing-xs) 0;
}

/* Start Options */
.start-options {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

/* Buttons */
.btn {
    font-family: var(--font-display);
    font-size: 1rem;
    padding: var(--spacing-md) var(--spacing-lg);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-large {
    font-size: 1.2rem;
    padding: var(--spacing-lg) var(--spacing-xl);
}

.btn-primary {
    background: linear-gradient(135deg, var(--accent-blue) 0%, #0096c7 100%);
    color: white;
}

.btn-secondary {
    background: linear-gradient(135deg, var(--accent-purple) 0%, #9d4edd 100%);
    color: white;
}

.btn-danger {
    background: linear-gradient(135deg, var(--accent-red) 0%, #ff4d6d 100%);
    color: white;
}

.btn-success {
    background: linear-gradient(135deg, var(--accent-green) 0%, #70e000 100%);
    color: white;
}

/* Progress Bar */
.progress-bar {
    position: relative;
    height: 30px;
    background: var(--bg-card);
    border-radius: var(--radius-md);
    overflow: hidden;
    margin-bottom: var(--spacing-lg);
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-gold) 0%, #ffc300 100%);
    transition: width 0.3s ease;
    width: 0%;
}

.progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: var(--font-display);
    font-weight: 600;
    color: var(--text-primary);
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

/* Jesus Banner */
.jesus-banner {
    background: linear-gradient(135deg, #7b2cbf 0%, #c77dff 100%);
    color: white;
    text-align: center;
    padding: var(--spacing-md);
    font-family: var(--font-display);
    font-size: 1.2rem;
    margin-bottom: var(--spacing-lg);
    border-radius: var(--radius-md);
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
}

/* Score Display */
.score-display {
    display: flex;
    justify-content: center;
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-lg);
}

.score-item {
    text-align: center;
    padding: var(--spacing-md);
    background: var(--bg-card);
    border-radius: var(--radius-md);
    min-width: 100px;
}

.score-item.wrong {
    border: 2px solid var(--accent-red);
}

.score-label {
    display: block;
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xs);
}

.score-value {
    font-family: var(--font-display);
    font-size: 2rem;
    color: var(--accent-gold);
}

.score-item.wrong .score-value {
    color: var(--accent-red);
}

/* Question Section */
.question-section {
    background: var(--bg-card);
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-lg);
}

.question-text {
    font-size: 1.2rem;
    line-height: 1.6;
    margin-bottom: var(--spacing-md);
}

.question-link {
    color: var(--accent-blue);
    font-size: 0.9rem;
}

/* Answers Section */
.answers-section {
    margin-bottom: var(--spacing-lg);
}

.answers-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.answer-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--bg-card);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
}

.answer-item:hover:not(.revealed) {
    border-color: var(--accent-blue);
    background: rgba(0, 119, 182, 0.2);
}

.answer-item.selected {
    border-color: var(--accent-gold);
    background: rgba(230, 169, 25, 0.2);
}

.answer-item.revealed {
    border-color: var(--accent-green);
    background: rgba(56, 176, 0, 0.2);
}

.answer-item.revealed.selected {
    border-color: var(--accent-gold);
    border-width: 3px;
}

.answer-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: var(--accent-purple);
    color: white;
    border-radius: 50%;
    font-family: var(--font-display);
    font-weight: 600;
    flex-shrink: 0;
}

.answer-content {
    flex: 1;
}

.answer-text {
    font-weight: 600;
    margin-bottom: var(--spacing-xs);
}

.answer-explanation {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-style: italic;
}

.answer-refs {
    font-size: 0.8rem;
    color: var(--accent-blue);
    margin-top: var(--spacing-xs);
}

.answer-badge {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-family: var(--font-display);
    text-transform: uppercase;
}

.badge-correct {
    background: var(--accent-green);
    color: white;
}

.badge-selected {
    background: var(--accent-gold);
    color: var(--bg-dark);
}

/* Control Buttons */
.control-buttons {
    display: flex;
    gap: var(--spacing-md);
    flex-wrap: wrap;
}

.control-buttons .btn {
    flex: 1;
    min-width: 150px;
}

/* Game Over Panel */
.gameover-panel {
    text-align: center;
}

.final-score {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-lg);
}

.final-score span {
    color: var(--accent-gold);
    font-weight: 600;
}

.result-message {
    padding: var(--spacing-lg);
    background: var(--bg-card);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-lg);
    font-size: 1.1rem;
    line-height: 1.8;
}

.result-message.win {
    border: 2px solid var(--accent-green);
}

.result-message.lose {
    border: 2px solid var(--accent-red);
}

/* Responsive */
@media (max-width: 600px) {
    .header h1 {
        font-size: 1.8rem;
    }
    
    .panel {
        padding: var(--spacing-md);
        margin: var(--spacing-sm);
    }
    
    .score-display {
        flex-direction: column;
        gap: var(--spacing-md);
    }
    
    .control-buttons {
        flex-direction: column;
    }
}
```

---

### app.js

**Path:** `public/control/app.js`

**Description:** Control panel frontend logic

```javascript
/**
 * INFALLIBLE Game Control Panel
 * Frontend application for host control
 */

class GameControl {
    constructor() {
        this.ws = null;
        this.state = null;
        this.elements = {};
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.connect();
        this.loadStats();
    }
    
    cacheElements() {
        this.elements = {
            // Status
            connectionStatus: document.getElementById('connectionStatus'),
            phaseValue: document.getElementById('phaseValue'),
            statsDisplay: document.getElementById('statsDisplay'),
            
            // Panels
            startPanel: document.getElementById('startPanel'),
            gamePanel: document.getElementById('gamePanel'),
            gameoverPanel: document.getElementById('gameoverPanel'),
            
            // Start
            btnStartRandom: document.getElementById('btnStartRandom'),
            btnStartJesus: document.getElementById('btnStartJesus'),
            
            // Game
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            jesusBanner: document.getElementById('jesusBanner'),
            scoreValue: document.getElementById('scoreValue'),
            wrongValue: document.getElementById('wrongValue'),
            questionText: document.getElementById('questionText'),
            questionLink: document.getElementById('questionLink'),
            answersList: document.getElementById('answersList'),
            btnChooseWrong: document.getElementById('btnChooseWrong'),
            btnNextQuestion: document.getElementById('btnNextQuestion'),
            btnEndGame: document.getElementById('btnEndGame'),
            
            // Game Over
            gameoverTitle: document.getElementById('gameoverTitle'),
            finalScore: document.getElementById('finalScore'),
            finalWrong: document.getElementById('finalWrong'),
            resultMessage: document.getElementById('resultMessage'),
            btnPlayAgain: document.getElementById('btnPlayAgain')
        };
    }
    
    bindEvents() {
        // Start buttons
        this.elements.btnStartRandom.addEventListener('click', () => this.startGame(false));
        this.elements.btnStartJesus.addEventListener('click', () => this.startGame(true));
        
        // Game control buttons
        this.elements.btnChooseWrong.addEventListener('click', () => this.chooseWrong());
        this.elements.btnNextQuestion.addEventListener('click', () => this.nextQuestion());
        this.elements.btnEndGame.addEventListener('click', () => this.endGame());
        
        // Play again
        this.elements.btnPlayAgain.addEventListener('click', () => this.reset());
    }
    
    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}?type=control`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            this.elements.connectionStatus.classList.add('connected');
            this.elements.connectionStatus.querySelector('.status-text').textContent = 'Connected';
        };
        
        this.ws.onclose = () => {
            this.elements.connectionStatus.classList.remove('connected');
            this.elements.connectionStatus.querySelector('.status-text').textContent = 'Disconnected';
            // Attempt reconnect after 3 seconds
            setTimeout(() => this.connect(), 3000);
        };
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };
    }
    
    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            const stats = await response.json();
            this.elements.statsDisplay.innerHTML = `
                <p><strong>${stats.contradictionsWithAnswers}</strong> questions available</p>
                <p><strong>${stats.totalAnswers}</strong> total answers</p>
                <p><strong>${stats.jesusContradictions}</strong> Jesus-related questions</p>
            `;
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }
    
    handleMessage(message) {
        switch (message.type) {
            case 'STATE_UPDATE':
                this.updateState(message.payload);
                break;
        }
    }
    
    updateState(state) {
        this.state = state;
        this.render();
    }
    
    render() {
        if (!this.state) return;
        
        // Update phase indicator
        this.elements.phaseValue.textContent = this.state.phase.toUpperCase();
        
        // Show appropriate panel
        this.elements.startPanel.style.display = 'none';
        this.elements.gamePanel.style.display = 'none';
        this.elements.gameoverPanel.style.display = 'none';
        
        switch (this.state.phase) {
            case 'idle':
                this.elements.startPanel.style.display = 'block';
                break;
            case 'question':
            case 'revealed':
                this.elements.gamePanel.style.display = 'block';
                this.renderGame();
                break;
            case 'game_over':
                this.elements.gameoverPanel.style.display = 'block';
                this.renderGameOver();
                break;
        }
    }
    
    renderGame() {
        const state = this.state;
        
        // Progress
        const progress = ((state.currentQuestionIndex + 1) / state.totalQuestions) * 100;
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressText.textContent = `${state.currentQuestionIndex + 1} / ${state.totalQuestions}`;
        
        // Jesus mode banner
        this.elements.jesusBanner.style.display = state.jesusMode ? 'block' : 'none';
        
        // Scores
        this.elements.scoreValue.textContent = state.score;
        this.elements.wrongValue.textContent = state.wrongChoices;
        
        // Question
        if (state.currentQuestion) {
            this.elements.questionText.textContent = state.currentQuestion.question;
            this.elements.questionLink.href = state.currentQuestion.questionUrl || '#';
            
            // Answers
            this.elements.answersList.innerHTML = state.currentQuestion.answers
                .map((answer, index) => this.renderAnswer(answer, index, state))
                .join('');
            
            // Bind answer clicks
            this.elements.answersList.querySelectorAll('.answer-item').forEach(item => {
                item.addEventListener('click', () => {
                    if (state.phase === 'question') {
                        const answerId = parseInt(item.dataset.answerId);
                        this.selectAnswer(answerId);
                    }
                });
            });
        }
        
        // Button states
        this.elements.btnChooseWrong.disabled = state.phase !== 'question';
        this.elements.btnNextQuestion.disabled = state.phase !== 'revealed';
    }
    
    renderAnswer(answer, index, state) {
        const isSelected = state.selectedAnswerId === answer.id;
        const isRevealed = state.isRevealed;
        
        let classes = 'answer-item';
        if (isSelected) classes += ' selected';
        if (isRevealed) classes += ' revealed';
        
        let badges = '';
        if (isRevealed) {
            badges += '<span class="answer-badge badge-correct">✓ Correct</span>';
            if (isSelected) {
                badges += ' <span class="answer-badge badge-selected">Your Answer</span>';
            }
        }
        
        return `
            <div class="${classes}" data-answer-id="${answer.id}">
                <span class="answer-number">${String.fromCharCode(65 + index)}</span>
                <div class="answer-content">
                    <div class="answer-text">${this.escapeHtml(answer.answer)}</div>
                    ${answer.explanation ? `<div class="answer-explanation">${this.escapeHtml(answer.explanation)}</div>` : ''}
                    ${answer.references?.length ? `<div class="answer-refs">📖 ${answer.references.join(', ')}</div>` : ''}
                    ${badges}
                </div>
            </div>
        `;
    }
    
    renderGameOver() {
        const state = this.state;
        
        this.elements.finalScore.textContent = state.score;
        this.elements.finalWrong.textContent = state.wrongChoices;
        
        if (state.gameResult === 'win') {
            this.elements.gameoverTitle.textContent = '🎉 Congratulations! 🎉';
            this.elements.resultMessage.className = 'result-message win';
            this.elements.resultMessage.innerHTML = `
                <p><strong>YOUR PRIZE:</strong></p>
                <p>"You no longer have to believe in God because he violates the law of non-contradiction!"</p>
            `;
        } else {
            this.elements.gameoverTitle.textContent = '😱 Unbelievable! 😱';
            this.elements.resultMessage.className = 'result-message lose';
            this.elements.resultMessage.innerHTML = `
                <p><strong>YOUR PRIZE:</strong></p>
                <p>"How did you lose this? Every answer was a correct answer but you managed to be as useless as your God."</p>
            `;
        }
    }
    
    // WebSocket actions
    send(type, payload = {}) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, payload }));
        }
    }
    
    startGame(jesusMode) {
        this.send('START_GAME', { jesusMode });
    }
    
    selectAnswer(answerId) {
        this.send('SELECT_ANSWER', { answerId });
    }
    
    chooseWrong() {
        this.send('CHOOSE_WRONG');
    }
    
    nextQuestion() {
        this.send('NEXT_QUESTION');
    }
    
    endGame() {
        this.send('END_GAME');
    }
    
    reset() {
        this.send('RESET');
    }
    
    // Utility
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.gameControl = new GameControl();
});
```

---

### index.html

**Path:** `public/display/index.html`

**Description:** OBS Browser Source display HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>INFALLIBLE - Display</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/display/styles.css">
</head>
<body>
    <div class="display-container">
        <!-- Idle Screen -->
        <section class="screen idle-screen" id="idleScreen">
            <div class="logo-container">
                <h1 class="game-title">INFALLIBLE</h1>
                <p class="game-tagline">You Can't Be Wrong!</p>
            </div>
            <div class="waiting-text">
                <span class="pulse">Waiting for game to start...</span>
            </div>
        </section>
        
        <!-- Jesus Mode Intro -->
        <section class="screen jesus-intro-screen" id="jesusIntroScreen" style="display: none;">
            <div class="jesus-intro">
                <div class="cross-icon">✝️</div>
                <h2>SPECIAL ROUND</h2>
                <h1>ALL QUESTIONS ABOUT JESUS</h1>
                <p class="jesus-subtitle">Because even the Son of God contradicts himself</p>
            </div>
        </section>
        
        <!-- Question Screen -->
        <section class="screen question-screen" id="questionScreen" style="display: none;">
            <!-- Header -->
            <header class="game-header">
                <div class="title-small">INFALLIBLE</div>
                <div class="progress-display">
                    <span class="question-number" id="questionNumber">1</span>
                    <span class="question-total">/ 10</span>
                </div>
                <div class="score-badge" id="scoreBadge">
                    <span class="score-label">Score:</span>
                    <span class="score-value" id="displayScore">0</span>
                </div>
            </header>
            
            <!-- Jesus Mode Banner -->
            <div class="jesus-mode-banner" id="jesusBanner" style="display: none;">
                ✝️ JESUS MODE ✝️
            </div>
            
            <!-- Question Card -->
            <div class="question-card">
                <div class="question-label">THE QUESTION</div>
                <div class="question-text" id="questionText">
                    Loading question...
                </div>
            </div>
            
            <!-- Answers Grid -->
            <div class="answers-grid" id="answersGrid">
                <!-- Answers populated dynamically -->
            </div>
            
            <!-- Wrong Choice Indicator -->
            <div class="wrong-indicator" id="wrongIndicator" style="display: none;">
                <span class="wrong-icon">❌</span>
                <span class="wrong-text">CHOSE TO BE WRONG</span>
            </div>
        </section>
        
        <!-- Win Screen -->
        <section class="screen result-screen win-screen" id="winScreen" style="display: none;">
            <div class="result-container">
                <div class="confetti-container" id="confetti"></div>
                <div class="trophy">🏆</div>
                <h1 class="result-title">CONGRATULATIONS!</h1>
                <div class="prize-card">
                    <div class="prize-label">YOUR PRIZE</div>
                    <p class="prize-text">
                        "You no longer have to believe in God because he violates the law of non-contradiction!"
                    </p>
                </div>
                <div class="final-stats">
                    <span class="stat">Score: <strong id="winScore">10</strong>/10</span>
                </div>
            </div>
        </section>
        
        <!-- Lose Screen -->
        <section class="screen result-screen lose-screen" id="loseScreen" style="display: none;">
            <div class="result-container">
                <div class="fail-icon">🤦</div>
                <h1 class="result-title fail-title">UNBELIEVABLE!</h1>
                <div class="prize-card fail-card">
                    <div class="prize-label">YOUR PRIZE</div>
                    <p class="prize-text">
                        "How did you lose this? Every answer was a correct answer but you managed to be as useless as your God."
                    </p>
                </div>
                <div class="final-stats">
                    <span class="stat">Score: <strong id="loseScore">0</strong>/10</span>
                    <span class="stat wrong">Wrong Choices: <strong id="loseWrong">0</strong></span>
                </div>
            </div>
        </section>
    </div>
    
    <script src="/display/app.js"></script>
</body>
</html>
```

---

### styles.css

**Path:** `public/display/styles.css`

**Description:** Display styles (dramatic dark theme)

```css
/**
 * INFALLIBLE Game Display Styles
 * Optimized for OBS Browser Source
 */

:root {
    /* Colors - Dramatic dark theme */
    --bg-gradient-start: #0a0a1a;
    --bg-gradient-end: #1a1a3a;
    --card-bg: rgba(20, 20, 40, 0.9);
    --card-border: rgba(255, 255, 255, 0.1);
    
    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.7);
    --text-muted: rgba(255, 255, 255, 0.5);
    
    --gold: #ffd700;
    --gold-dark: #b8860b;
    --crimson: #dc143c;
    --emerald: #50c878;
    --purple: #8b5cf6;
    --purple-light: #a78bfa;
    
    /* Typography */
    --font-display: 'Cinzel', serif;
    --font-body: 'Crimson Pro', serif;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: var(--font-body);
    background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
    color: var(--text-primary);
    min-height: 100vh;
    overflow: hidden;
}

.display-container {
    width: 100vw;
    height: 100vh;
    position: relative;
}

/* Screens */
.screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;
}

.screen.active {
    opacity: 1;
    pointer-events: auto;
}

/* ========================================
   IDLE SCREEN
   ======================================== */
.idle-screen {
    justify-content: center;
    align-items: center;
    background: radial-gradient(ellipse at center, #1a1a3a 0%, #0a0a1a 100%);
}

.logo-container {
    text-align: center;
    animation: float 3s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.game-title {
    font-family: var(--font-display);
    font-size: 6rem;
    font-weight: 900;
    color: var(--gold);
    text-shadow: 
        0 0 20px rgba(255, 215, 0, 0.5),
        0 0 40px rgba(255, 215, 0, 0.3),
        4px 4px 0 var(--gold-dark);
    letter-spacing: 0.2em;
}

.game-tagline {
    font-family: var(--font-display);
    font-size: 2rem;
    color: var(--text-secondary);
    margin-top: 1rem;
    letter-spacing: 0.3em;
}

.waiting-text {
    margin-top: 4rem;
    font-size: 1.5rem;
    color: var(--text-muted);
}

.pulse {
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
}

/* ========================================
   JESUS INTRO SCREEN
   ======================================== */
.jesus-intro-screen {
    justify-content: center;
    align-items: center;
    background: radial-gradient(ellipse at center, #2a1a4a 0%, #0a0a1a 100%);
}

.jesus-intro {
    text-align: center;
    animation: zoomIn 0.5s ease-out;
}

@keyframes zoomIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.cross-icon {
    font-size: 8rem;
    margin-bottom: 2rem;
    animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
    0%, 100% { 
        filter: drop-shadow(0 0 20px var(--purple));
    }
    50% { 
        filter: drop-shadow(0 0 40px var(--purple-light));
    }
}

.jesus-intro h2 {
    font-family: var(--font-display);
    font-size: 2rem;
    color: var(--purple-light);
    letter-spacing: 0.3em;
    margin-bottom: 1rem;
}

.jesus-intro h1 {
    font-family: var(--font-display);
    font-size: 4rem;
    color: var(--gold);
    text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
    letter-spacing: 0.1em;
}

.jesus-subtitle {
    font-size: 1.5rem;
    color: var(--text-secondary);
    margin-top: 2rem;
    font-style: italic;
}

/* ========================================
   QUESTION SCREEN
   ======================================== */
.question-screen {
    padding: 2rem;
}

.game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.title-small {
    font-family: var(--font-display);
    font-size: 1.5rem;
    color: var(--gold);
    letter-spacing: 0.2em;
}

.progress-display {
    font-family: var(--font-display);
    font-size: 2rem;
}

.question-number {
    color: var(--gold);
    font-weight: 700;
}

.question-total {
    color: var(--text-muted);
}

.score-badge {
    background: var(--card-bg);
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    border: 2px solid var(--gold);
}

.score-label {
    color: var(--text-secondary);
    margin-right: 0.5rem;
}

.score-value {
    font-family: var(--font-display);
    font-size: 1.5rem;
    color: var(--gold);
    font-weight: 700;
}

/* Jesus Mode Banner */
.jesus-mode-banner {
    background: linear-gradient(90deg, var(--purple) 0%, var(--purple-light) 50%, var(--purple) 100%);
    background-size: 200% 100%;
    animation: shimmer 2s linear infinite;
    color: white;
    text-align: center;
    padding: 0.75rem;
    font-family: var(--font-display);
    font-size: 1.2rem;
    letter-spacing: 0.2em;
    margin-bottom: 1rem;
    border-radius: 8px;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* Question Card */
.question-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    text-align: center;
}

.question-label {
    font-family: var(--font-display);
    font-size: 0.9rem;
    color: var(--gold);
    letter-spacing: 0.3em;
    margin-bottom: 1rem;
}

.question-text {
    font-size: 2rem;
    line-height: 1.5;
    color: var(--text-primary);
}

/* Answers Grid */
.answers-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    flex: 1;
}

.answer-card {
    background: var(--card-bg);
    border: 3px solid var(--card-border);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    transition: all 0.3s ease;
}

.answer-card.selected {
    border-color: var(--gold);
    background: rgba(255, 215, 0, 0.1);
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
    transform: scale(1.02);
}

.answer-card.revealed {
    border-color: var(--emerald);
    background: rgba(80, 200, 120, 0.1);
}

.answer-card.revealed.selected {
    border-color: var(--gold);
    box-shadow: 
        0 0 30px rgba(255, 215, 0, 0.3),
        inset 0 0 30px rgba(80, 200, 120, 0.2);
}

.answer-letter {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--purple) 0%, var(--purple-light) 100%);
    color: white;
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    border-radius: 50%;
    flex-shrink: 0;
}

.answer-card.revealed .answer-letter {
    background: linear-gradient(135deg, var(--emerald) 0%, #70e000 100%);
}

.answer-content {
    flex: 1;
}

.answer-text {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.answer-explanation {
    font-size: 1rem;
    color: var(--text-secondary);
    font-style: italic;
}

.answer-refs {
    font-size: 0.9rem;
    color: var(--purple-light);
    margin-top: 0.5rem;
}

.answer-badges {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
    flex-wrap: wrap;
}

.badge {
    padding: 0.25rem 0.75rem;
    border-radius: 50px;
    font-family: var(--font-display);
    font-size: 0.8rem;
    letter-spacing: 0.1em;
}

.badge-correct {
    background: var(--emerald);
    color: white;
}

.badge-selected {
    background: var(--gold);
    color: #1a1a1a;
}

/* Wrong Indicator */
.wrong-indicator {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: var(--crimson);
    padding: 1rem 2rem;
    border-radius: 50px;
    display: flex;
    align-items: center;
    gap: 1rem;
    animation: shake 0.5s ease-in-out;
}

@keyframes shake {
    0%, 100% { transform: translateX(-50%) rotate(0); }
    25% { transform: translateX(-50%) rotate(-5deg); }
    75% { transform: translateX(-50%) rotate(5deg); }
}

.wrong-icon {
    font-size: 2rem;
}

.wrong-text {
    font-family: var(--font-display);
    font-size: 1.5rem;
    letter-spacing: 0.1em;
}

/* ========================================
   RESULT SCREENS
   ======================================== */
.result-screen {
    justify-content: center;
    align-items: center;
}

.result-container {
    text-align: center;
    max-width: 800px;
    animation: zoomIn 0.5s ease-out;
}

/* Win Screen */
.win-screen {
    background: radial-gradient(ellipse at center, #1a3a1a 0%, #0a1a0a 100%);
}

.trophy {
    font-size: 8rem;
    margin-bottom: 2rem;
    animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}

.result-title {
    font-family: var(--font-display);
    font-size: 4rem;
    color: var(--gold);
    text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
    letter-spacing: 0.1em;
    margin-bottom: 2rem;
}

.prize-card {
    background: var(--card-bg);
    border: 3px solid var(--gold);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
}

.prize-label {
    font-family: var(--font-display);
    font-size: 1rem;
    color: var(--gold);
    letter-spacing: 0.3em;
    margin-bottom: 1rem;
}

.prize-text {
    font-size: 1.5rem;
    line-height: 1.8;
    font-style: italic;
}

.final-stats {
    display: flex;
    justify-content: center;
    gap: 2rem;
}

.stat {
    font-size: 1.5rem;
    color: var(--text-secondary);
}

.stat strong {
    color: var(--gold);
}

.stat.wrong strong {
    color: var(--crimson);
}

/* Lose Screen */
.lose-screen {
    background: radial-gradient(ellipse at center, #3a1a1a 0%, #1a0a0a 100%);
}

.fail-icon {
    font-size: 8rem;
    margin-bottom: 2rem;
}

.fail-title {
    color: var(--crimson) !important;
    text-shadow: 0 0 30px rgba(220, 20, 60, 0.5) !important;
}

.fail-card {
    border-color: var(--crimson) !important;
}

/* Confetti (simple CSS version) */
.confetti-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 1200px) {
    .game-title {
        font-size: 4rem;
    }
    
    .question-text {
        font-size: 1.5rem;
    }
    
    .answers-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 800px) {
    .game-title {
        font-size: 3rem;
    }
    
    .result-title {
        font-size: 2.5rem;
    }
    
    .prize-text {
        font-size: 1.2rem;
    }
}
```

---

### app.js

**Path:** `public/display/app.js`

**Description:** Display frontend logic

```javascript
/**
 * INFALLIBLE Game Display
 * Frontend application for OBS Browser Source
 */

class GameDisplay {
    constructor() {
        this.ws = null;
        this.state = null;
        this.previousPhase = null;
        this.jesusIntroShown = false;
        this.elements = {};
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.connect();
    }
    
    cacheElements() {
        this.elements = {
            // Screens
            idleScreen: document.getElementById('idleScreen'),
            jesusIntroScreen: document.getElementById('jesusIntroScreen'),
            questionScreen: document.getElementById('questionScreen'),
            winScreen: document.getElementById('winScreen'),
            loseScreen: document.getElementById('loseScreen'),
            
            // Question screen elements
            questionNumber: document.getElementById('questionNumber'),
            displayScore: document.getElementById('displayScore'),
            jesusBanner: document.getElementById('jesusBanner'),
            questionText: document.getElementById('questionText'),
            answersGrid: document.getElementById('answersGrid'),
            wrongIndicator: document.getElementById('wrongIndicator'),
            scoreBadge: document.getElementById('scoreBadge'),
            
            // Result screen elements
            winScore: document.getElementById('winScore'),
            loseScore: document.getElementById('loseScore'),
            loseWrong: document.getElementById('loseWrong')
        };
        
        // Show idle screen by default
        this.showScreen('idle');
    }
    
    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}?type=display`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('Display connected');
        };
        
        this.ws.onclose = () => {
            console.log('Display disconnected');
            // Attempt reconnect after 3 seconds
            setTimeout(() => this.connect(), 3000);
        };
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };
    }
    
    handleMessage(message) {
        switch (message.type) {
            case 'STATE_UPDATE':
                this.updateState(message.payload);
                break;
        }
    }
    
    updateState(state) {
        const prevState = this.state;
        this.state = state;
        
        // Check for phase transitions
        if (prevState?.phase !== state.phase) {
            this.handlePhaseChange(prevState?.phase, state.phase);
        }
        
        this.render();
    }
    
    handlePhaseChange(fromPhase, toPhase) {
        // Show Jesus intro when starting a Jesus mode game
        if (fromPhase === 'idle' && toPhase === 'question' && this.state.jesusMode) {
            this.showJesusIntro();
        }
    }
    
    showJesusIntro() {
        this.showScreen('jesusIntro');
        
        // Auto-transition to question after 3 seconds
        setTimeout(() => {
            if (this.state?.phase === 'question' || this.state?.phase === 'revealed') {
                this.showScreen('question');
            }
        }, 3000);
    }
    
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.elements).forEach(el => {
            if (el?.classList?.contains('screen')) {
                el.classList.remove('active');
            }
        });
        
        // Remove active class from all screens
        this.elements.idleScreen?.classList.remove('active');
        this.elements.jesusIntroScreen?.classList.remove('active');
        this.elements.questionScreen?.classList.remove('active');
        this.elements.winScreen?.classList.remove('active');
        this.elements.loseScreen?.classList.remove('active');
        
        // Show requested screen
        switch (screenName) {
            case 'idle':
                this.elements.idleScreen?.classList.add('active');
                break;
            case 'jesusIntro':
                this.elements.jesusIntroScreen?.classList.add('active');
                break;
            case 'question':
                this.elements.questionScreen?.classList.add('active');
                break;
            case 'win':
                this.elements.winScreen?.classList.add('active');
                this.createConfetti();
                break;
            case 'lose':
                this.elements.loseScreen?.classList.add('active');
                break;
        }
    }
    
    render() {
        if (!this.state) return;
        
        switch (this.state.phase) {
            case 'idle':
                this.jesusIntroShown = false;
                this.showScreen('idle');
                break;
                
            case 'question':
            case 'revealed':
                // Don't switch if showing Jesus intro
                if (!this.elements.jesusIntroScreen?.classList.contains('active')) {
                    this.showScreen('question');
                }
                this.renderQuestion();
                break;
                
            case 'game_over':
                if (this.state.gameResult === 'win') {
                    this.elements.winScore.textContent = this.state.score;
                    this.showScreen('win');
                } else {
                    this.elements.loseScore.textContent = this.state.score;
                    this.elements.loseWrong.textContent = this.state.wrongChoices;
                    this.showScreen('lose');
                }
                break;
        }
    }
    
    renderQuestion() {
        const state = this.state;
        
        // Progress
        this.elements.questionNumber.textContent = state.currentQuestionIndex + 1;
        
        // Score
        this.elements.displayScore.textContent = state.score;
        
        // Jesus banner
        this.elements.jesusBanner.style.display = state.jesusMode ? 'block' : 'none';
        
        // Question
        if (state.currentQuestion) {
            this.elements.questionText.textContent = state.currentQuestion.question;
            
            // Answers
            this.elements.answersGrid.innerHTML = state.currentQuestion.answers
                .map((answer, index) => this.renderAnswer(answer, index, state))
                .join('');
        }
        
        // Wrong indicator
        if (state.isRevealed && state.selectedAnswerId === null) {
            this.elements.wrongIndicator.style.display = 'flex';
        } else {
            this.elements.wrongIndicator.style.display = 'none';
        }
    }
    
    renderAnswer(answer, index, state) {
        const isSelected = state.selectedAnswerId === answer.id;
        const isRevealed = state.isRevealed;
        
        let classes = 'answer-card';
        if (isSelected) classes += ' selected';
        if (isRevealed) classes += ' revealed';
        
        let badges = '';
        if (isRevealed) {
            badges += '<span class="badge badge-correct">✓ CORRECT</span>';
            if (isSelected) {
                badges += '<span class="badge badge-selected">★ YOUR ANSWER</span>';
            }
        }
        
        const letter = String.fromCharCode(65 + index);
        
        return `
            <div class="${classes}">
                <span class="answer-letter">${letter}</span>
                <div class="answer-content">
                    <div class="answer-text">${this.escapeHtml(answer.answer)}</div>
                    ${answer.explanation ? `<div class="answer-explanation">${this.escapeHtml(answer.explanation)}</div>` : ''}
                    ${answer.references?.length ? `<div class="answer-refs">📖 ${answer.references.join(', ')}</div>` : ''}
                    ${badges ? `<div class="answer-badges">${badges}</div>` : ''}
                </div>
            </div>
        `;
    }
    
    createConfetti() {
        const container = document.getElementById('confetti');
        if (!container) return;
        
        container.innerHTML = '';
        
        const colors = ['#ffd700', '#50c878', '#8b5cf6', '#ff6b6b', '#4ecdc4'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -20px;
                opacity: ${Math.random() * 0.5 + 0.5};
                transform: rotate(${Math.random() * 360}deg);
                animation: fall ${Math.random() * 3 + 2}s linear forwards;
            `;
            container.appendChild(confetti);
        }
        
        // Add keyframes for falling animation
        if (!document.getElementById('confetti-styles')) {
            const style = document.createElement('style');
            style.id = 'confetti-styles';
            style.textContent = `
                @keyframes fall {
                    to {
                        top: 100%;
                        transform: rotate(${Math.random() * 720}deg) translateX(${Math.random() * 200 - 100}px);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Utility
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.gameDisplay = new GameDisplay();
});
```

---

### init-sample-db.js

**Path:** `scripts/init-sample-db.js`

**Description:** Sample database generator for testing

```javascript
/**
 * Initialize Sample Database
 * Creates a test database with sample contradictions
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function createSampleDatabase() {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    
    // Create tables
    db.run(`
        CREATE TABLE contradictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            question_url TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    db.run(`
        CREATE TABLE answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contradiction_id INTEGER NOT NULL,
            answer TEXT NOT NULL,
            answer_explanation TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contradiction_id) REFERENCES contradictions(id)
        )
    `);
    
    db.run(`
        CREATE TABLE bible_references (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            answer_id INTEGER NOT NULL,
            reference TEXT NOT NULL,
            FOREIGN KEY (answer_id) REFERENCES answers(id)
        )
    `);
    
    // Sample contradictions
    const contradictions = [
        {
            question: "Who was Joseph's father?",
            url: "https://skepticsannotatedbible.com/contra/josephsfather.html",
            answers: [
                { answer: "Jacob", explanation: "Matthew says Jacob was Joseph's father", refs: ["Matthew 1:16"] },
                { answer: "Heli", explanation: "Luke says Heli was Joseph's father", refs: ["Luke 3:23"] }
            ]
        },
        {
            question: "How many generations were there from Abraham to Jesus?",
            url: "https://skepticsannotatedbible.com/contra/generations.html",
            answers: [
                { answer: "42 generations", explanation: "Matthew claims 42 generations", refs: ["Matthew 1:17"] },
                { answer: "More than 42", explanation: "Luke lists more than 42 generations", refs: ["Luke 3:23-38"] }
            ]
        },
        {
            question: "Who incited David to count Israel?",
            url: "https://skepticsannotatedbible.com/contra/incited.html",
            answers: [
                { answer: "God (the LORD)", explanation: "Samuel says God incited David", refs: ["2 Samuel 24:1"] },
                { answer: "Satan", explanation: "Chronicles says Satan provoked David", refs: ["1 Chronicles 21:1"] }
            ]
        },
        {
            question: "How old was Ahaziah when he began to reign?",
            url: "https://skepticsannotatedbible.com/contra/ahaziah.html",
            answers: [
                { answer: "22 years old", explanation: "Kings says he was 22", refs: ["2 Kings 8:26"] },
                { answer: "42 years old", explanation: "Chronicles says he was 42", refs: ["2 Chronicles 22:2"] }
            ]
        },
        {
            question: "How did Judas die?",
            url: "https://skepticsannotatedbible.com/contra/judas.html",
            answers: [
                { answer: "He hanged himself", explanation: "Matthew describes a hanging", refs: ["Matthew 27:5"] },
                { answer: "He fell headlong and burst open", explanation: "Acts describes him falling and his bowels gushing out", refs: ["Acts 1:18"] }
            ]
        },
        {
            question: "What did Jesus say about bearing witness to himself?",
            url: "https://skepticsannotatedbible.com/contra/witness.html",
            answers: [
                { answer: "His witness is true", explanation: "Jesus claims his own witness is valid", refs: ["John 8:14"] },
                { answer: "His witness is not true", explanation: "Jesus says if he bears witness of himself it's not true", refs: ["John 5:31"] }
            ]
        },
        {
            question: "Where was Jesus at the sixth hour on crucifixion day?",
            url: "https://skepticsannotatedbible.com/contra/sixthhour.html",
            answers: [
                { answer: "On the cross", explanation: "Mark says Jesus was crucified at the third hour and darkness came at sixth hour", refs: ["Mark 15:25", "Mark 15:33"] },
                { answer: "Before Pilate", explanation: "John says at the sixth hour Pilate was still presenting Jesus to the crowd", refs: ["John 19:14"] }
            ]
        },
        {
            question: "Did Jesus carry his own cross?",
            url: "https://skepticsannotatedbible.com/contra/cross.html",
            answers: [
                { answer: "Yes, he bore his own cross", explanation: "John says Jesus carried his own cross", refs: ["John 19:17"] },
                { answer: "No, Simon carried it", explanation: "The synoptic gospels say Simon of Cyrene was compelled to carry it", refs: ["Matthew 27:32", "Mark 15:21", "Luke 23:26"] }
            ]
        },
        {
            question: "What were Jesus' last words?",
            url: "https://skepticsannotatedbible.com/contra/lastwords.html",
            answers: [
                { answer: "My God, my God, why hast thou forsaken me?", explanation: "Matthew and Mark record this as Jesus' final cry", refs: ["Matthew 27:46", "Mark 15:34"] },
                { answer: "Father, into thy hands I commend my spirit", explanation: "Luke records these as Jesus' last words", refs: ["Luke 23:46"] },
                { answer: "It is finished", explanation: "John says Jesus said 'It is finished' before dying", refs: ["John 19:30"] }
            ]
        },
        {
            question: "Who first came to Jesus' tomb?",
            url: "https://skepticsannotatedbible.com/contra/tomb.html",
            answers: [
                { answer: "Mary Magdalene alone", explanation: "John says Mary came alone while it was still dark", refs: ["John 20:1"] },
                { answer: "Two Marys", explanation: "Matthew says Mary Magdalene and 'the other Mary' came", refs: ["Matthew 28:1"] },
                { answer: "Three women", explanation: "Mark says three women came including Salome", refs: ["Mark 16:1"] },
                { answer: "At least five women", explanation: "Luke mentions several women including Joanna", refs: ["Luke 24:10"] }
            ]
        },
        {
            question: "When was Jesus crucified?",
            url: "https://skepticsannotatedbible.com/contra/crucified.html",
            answers: [
                { answer: "The third hour (9 AM)", explanation: "Mark says it was the third hour when they crucified him", refs: ["Mark 15:25"] },
                { answer: "After the sixth hour (noon)", explanation: "John says it was about the sixth hour when Pilate said 'Behold your King'", refs: ["John 19:14-16"] }
            ]
        },
        {
            question: "How many angels were at Jesus' tomb?",
            url: "https://skepticsannotatedbible.com/contra/angels.html",
            answers: [
                { answer: "One angel", explanation: "Matthew describes one angel rolling away the stone", refs: ["Matthew 28:2"] },
                { answer: "Two angels", explanation: "John describes two angels sitting where Jesus had lain", refs: ["John 20:12"] }
            ]
        },
        // Jesus-specific contradictions for Jesus mode
        {
            question: "Was Jesus all-knowing (omniscient)?",
            url: "https://skepticsannotatedbible.com/contra/omniscient.html",
            answers: [
                { answer: "Yes, Jesus knew all things", explanation: "John claims Jesus knew all things", refs: ["John 16:30", "John 21:17"] },
                { answer: "No, Jesus did not know the day or hour", explanation: "Jesus himself said he didn't know when the end would come", refs: ["Mark 13:32"] }
            ]
        },
        {
            question: "Is Jesus equal to God the Father?",
            url: "https://skepticsannotatedbible.com/contra/equal.html",
            answers: [
                { answer: "Yes, Jesus and the Father are equal/one", explanation: "Jesus claims equality with God", refs: ["John 10:30", "John 14:9"] },
                { answer: "No, the Father is greater", explanation: "Jesus says the Father is greater than he", refs: ["John 14:28", "John 10:29"] }
            ]
        },
        {
            question: "Did Jesus come to bring peace?",
            url: "https://skepticsannotatedbible.com/contra/peace.html",
            answers: [
                { answer: "Yes, Jesus is the Prince of Peace", explanation: "Isaiah prophesies a Prince of Peace, angels announce peace", refs: ["Isaiah 9:6", "Luke 2:14"] },
                { answer: "No, Jesus came to bring division", explanation: "Jesus says he came not to bring peace but a sword", refs: ["Matthew 10:34", "Luke 12:51"] }
            ]
        },
        {
            question: "Can anyone see Jesus after death?",
            url: "https://skepticsannotatedbible.com/contra/see.html",
            answers: [
                { answer: "Many people saw Jesus after resurrection", explanation: "The Gospels describe multiple appearances", refs: ["Matthew 28:9", "John 20:14", "1 Corinthians 15:6"] },
                { answer: "No one can see Jesus (God)", explanation: "No one has seen God at any time", refs: ["John 1:18", "1 Timothy 6:16"] }
            ]
        },
        {
            question: "Did Jesus say the Pharisees' judgment was wrong?",
            url: "https://skepticsannotatedbible.com/contra/judge.html",
            answers: [
                { answer: "Yes, Jesus judged the Pharisees", explanation: "Jesus frequently condemned and judged the Pharisees", refs: ["Matthew 23:13-33", "John 8:44"] },
                { answer: "No, Jesus came not to judge", explanation: "Jesus says he came not to judge the world", refs: ["John 12:47", "John 3:17"] }
            ]
        },
        {
            question: "Was Jesus the only one to ascend to heaven?",
            url: "https://skepticsannotatedbible.com/contra/ascend.html",
            answers: [
                { answer: "Yes, only Jesus ascended", explanation: "Jesus says no man has ascended to heaven except himself", refs: ["John 3:13"] },
                { answer: "No, others ascended too", explanation: "Elijah was taken up to heaven in a whirlwind", refs: ["2 Kings 2:11", "Genesis 5:24"] }
            ]
        },
        {
            question: "Was Jesus tempted?",
            url: "https://skepticsannotatedbible.com/contra/tempted.html",
            answers: [
                { answer: "Yes, Jesus was tempted", explanation: "The Gospels describe Satan tempting Jesus", refs: ["Matthew 4:1", "Hebrews 4:15"] },
                { answer: "God cannot be tempted", explanation: "James says God cannot be tempted by evil", refs: ["James 1:13"] }
            ]
        },
        {
            question: "Did Jesus always tell the truth?",
            url: "https://skepticsannotatedbible.com/contra/truth.html",
            answers: [
                { answer: "Yes, Jesus is the truth", explanation: "Jesus claims to be the way, truth, and life", refs: ["John 14:6"] },
                { answer: "Jesus said he wasn't going to the feast, then went secretly", explanation: "Jesus told his brothers he wasn't going to the feast, then went in secret", refs: ["John 7:8-10"] }
            ]
        }
    ];
    
    // Insert data
    contradictions.forEach(c => {
        db.run(
            'INSERT INTO contradictions (question, question_url) VALUES (?, ?)',
            [c.question, c.url]
        );
        
        const contradictionId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
        
        c.answers.forEach(a => {
            db.run(
                'INSERT INTO answers (contradiction_id, answer, answer_explanation) VALUES (?, ?, ?)',
                [contradictionId, a.answer, a.explanation]
            );
            
            const answerId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
            
            a.refs.forEach(ref => {
                db.run(
                    'INSERT INTO bible_references (answer_id, reference) VALUES (?, ?)',
                    [answerId, ref]
                );
            });
        });
    });
    
    // Save database
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(path.join(__dirname, '..', 'contradictions.db'), buffer);
    
    console.log('Sample database created successfully!');
    console.log(`Total contradictions: ${contradictions.length}`);
    
    db.close();
}

createSampleDatabase().catch(console.error);
```

---

## Design Notes

### Database Editor - Color Palette (Biblical Scholar Theme)

| Variable | Value | Usage |
|----------|-------|-------|
| `--parchment` | `#f5f0e6` | Background |
| `--parchment-dark` | `#e8e0d0` | Secondary background |
| `--ink` | `#2c2416` | Primary text |
| `--ink-light` | `#4a4035` | Secondary text |
| `--burgundy` | `#722f37` | Primary accent |
| `--gold` | `#b8860b` | Highlight/warning |
| `--sage` | `#5c6b54` | Success states |

### Game - Color Palette (Dramatic Dark Theme)

| Variable | Value | Usage |
|----------|-------|-------|
| `--bg-dark` | `#1a1a2e` | Background |
| `--bg-panel` | `#16213e` | Panel background |
| `--accent-gold` | `#ffd700` | Primary accent |
| `--accent-purple` | `#8b5cf6` | Secondary accent |
| `--accent-red` | `#c9184a` | Danger/wrong |
| `--accent-green` | `#50c878` | Success/correct |

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

```
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
```

---

*End of documentation*
