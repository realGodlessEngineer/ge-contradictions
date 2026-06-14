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