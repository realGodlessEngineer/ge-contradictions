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