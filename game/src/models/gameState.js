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