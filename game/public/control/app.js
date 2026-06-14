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