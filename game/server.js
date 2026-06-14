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