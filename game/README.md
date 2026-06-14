# INFALLIBLE: You Can't Be Wrong!

A quiz game where every answer is correct, because the Bible contradicts itself.

## Overview

This is a streaming-friendly quiz game designed to highlight biblical contradictions. Players are presented with questions from a database of contradictions, where every answer option is correct because the Bible provides multiple conflicting answers.

### Key Features

- **Can't Lose**: Every answer is a correct answer
- **Choose to Be Wrong**: Players can refuse all answers to intentionally lose
- **Jesus Mode**: Configurable chance (default 10%) for all questions to be about Jesus
- **Real-time Sync**: Control panel and display stay synchronized via WebSocket
- **OBS Ready**: Display page designed for OBS Browser Source
- **Fully Configurable**: All settings via `.env` file

## Architecture

```
game/
├── server.js                 # Express + WebSocket server
├── package.json              # Dependencies
├── .env                      # Configuration (create from .env.example)
├── .env.example              # Example configuration
├── contradictions.db         # SQLite database (or use parent project's)
├── scripts/
│   └── init-sample-db.js    # Create sample test database
├── src/
│   ├── config.js            # Configuration loader
│   ├── controllers/
│   │   └── gameController.js # Controller layer
│   ├── services/
│   │   ├── gameService.js    # Game business logic
│   │   └── databaseService.js # Database operations
│   ├── models/
│   │   └── gameState.js      # Game state model
│   └── utils/
│       └── questionSelector.js # Question selection utility
└── public/
    ├── control/              # Host control panel
    │   ├── index.html
    │   ├── styles.css
    │   └── app.js
    └── display/              # OBS Browser Source display
        ├── index.html
        ├── styles.css
        └── app.js
```

## Installation

```bash
cd game
npm install
```

## Configuration

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3400` | Server port |
| `DB_PATH` | `./contradictions.db` | Path to SQLite database (absolute or relative) |
| `JESUS_MODE_CHANCE` | `0.10` | Chance of random Jesus Mode (0.0 to 1.0) |
| `JESUS_MODE_MIN_QUESTIONS` | `10` | Minimum Jesus questions needed for Jesus Mode |
| `QUESTIONS_PER_GAME` | `10` | Number of questions per game session |

### Example Configurations

**High Jesus Mode chance (25%):**
```env
JESUS_MODE_CHANCE=0.25
```

**Disable random Jesus Mode (only manual):**
```env
JESUS_MODE_CHANCE=0
```

**Shorter games (5 questions):**
```env
QUESTIONS_PER_GAME=5
```

**Use parent project database:**
```env
DB_PATH=../contradictions.db
```

## Usage

### Using with Main Project Database

```bash
# Set in .env or via command line
DB_PATH=../contradictions.db npm start
```

### Using Sample Database

Create a sample database for testing:

```bash
node scripts/init-sample-db.js
npm start
```

### Access Points

- **Control Panel**: http://localhost:3400/control
- **Display (OBS)**: http://localhost:3400/display

## OBS Setup

1. Add a Browser Source
2. Set URL to `http://localhost:3400/display`
3. Set dimensions (recommended: 1920x1080)
4. Optional: Check "Control audio via OBS"

## Game Flow

1. **Start Game**: Choose Random or Jesus Mode
2. **Question Phase**: Display shows question and answers
3. **Select Answer**: Click any answer (they're all correct!)
4. **Reveal Phase**: Shows all answers as correct, highlights selection
5. **Next Question**: Repeat for configured number of questions
6. **Game Over**: 
   - **Win** (answered all): Prize message about logical contradictions
   - **Lose** (chose wrong): Prize message mocking the choice

## API

### WebSocket Messages (sent from Control)

| Type | Payload | Description |
|------|---------|-------------|
| `START_GAME` | `{ jesusMode: boolean }` | Start new game |
| `SELECT_ANSWER` | `{ answerId: number }` | Select an answer |
| `CHOOSE_WRONG` | - | Choose to be wrong |
| `NEXT_QUESTION` | - | Go to next question |
| `END_GAME` | - | End game early |
| `RESET` | - | Reset to idle |

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/state` | Get current game state |
| GET | `/api/stats` | Get database statistics and config |

## Prize Messages

### Win
> "You no longer have to believe in God because he violates the law of non-contradiction!"

### Lose
> "How did you lose this? Every answer was a correct answer but you managed to be as useless as your God."

## Tech Stack

- **Backend**: Node.js, Express, WebSocket (ws)
- **Database**: SQLite (sql.js)
- **Config**: dotenv
- **Frontend**: Vanilla JavaScript, CSS3
- **Fonts**: Cinzel (display), Crimson Pro (body)

## License

MIT