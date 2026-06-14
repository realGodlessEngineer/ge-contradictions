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