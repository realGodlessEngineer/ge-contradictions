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
        this.sounds = {};
        this.audioUnlocked = false;

        this.init();
    }

    init() {
        this.cacheElements();
        this.initAudio();
        this.setupAudioUnlock();
        this.connect();
    }

    initAudio() {
        // Preload all sound effects
        this.sounds = {
            hit: new Audio('music/hit.mp3'),
            miss: new Audio('music/miss.mp3'),
            win: new Audio('music/win.mp3'),
            lose: new Audio('music/lost.mp3')
        };

        // Preload audio files
        Object.values(this.sounds).forEach(audio => {
            audio.preload = 'auto';
            audio.load();
        });
    }

    setupAudioUnlock() {
        const overlay = document.getElementById('audioOverlay');

        // Try to auto-unlock audio (works in OBS browser sources)
        this.tryAutoUnlock(overlay);

        // Also set up click handler as fallback for regular browsers
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.unlockAudio(overlay);
            });
        }
    }

    tryAutoUnlock(overlay) {
        // Attempt to play a silent sound to check if autoplay is allowed
        const testAudio = this.sounds.hit;
        if (!testAudio) return;

        const originalVolume = testAudio.volume;
        testAudio.volume = 0;

        testAudio.play().then(() => {
            // Autoplay works (OBS browser source or user already interacted)
            testAudio.pause();
            testAudio.currentTime = 0;
            testAudio.volume = originalVolume;
            this.audioUnlocked = true;
            if (overlay) overlay.classList.add('hidden');
            console.log('Audio auto-unlocked (OBS/autoplay allowed)');
        }).catch(() => {
            // Autoplay blocked - need user interaction (regular browser)
            testAudio.volume = originalVolume;
            console.log('Autoplay blocked - waiting for user click');
        });
    }

    unlockAudio(overlay) {
        const unlockPromises = Object.values(this.sounds).map(audio => {
            audio.volume = 0;
            return audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
                audio.volume = 1;
            }).catch(err => {
                console.log('Audio unlock failed:', err);
            });
        });

        Promise.all(unlockPromises).then(() => {
            this.audioUnlocked = true;
            if (overlay) overlay.classList.add('hidden');
            console.log('Audio unlocked via user interaction');
        });
    }

    playSound(soundName) {
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(err => {
                console.log('Audio playback failed:', err);
            });
        }
    }
    
    cacheElements() {
        this.elements = {
            // Screens
            idleScreen: document.getElementById('idleScreen'),
            jesusIntroScreen: document.getElementById('jesusIntroScreen'),
            questionScreen: document.getElementById('questionScreen'),
            correctScreen: document.getElementById('correctScreen'),
            wrongScreen: document.getElementById('wrongScreen'),
            winScreen: document.getElementById('winScreen'),
            loseScreen: document.getElementById('loseScreen'),
            
            // Question screen elements
            jesusBanner: document.getElementById('jesusBanner'),
            questionText: document.getElementById('questionText'),
            answersGrid: document.getElementById('answersGrid'),
            
            // Correct screen elements
            correctQuestionReminder: document.getElementById('correctQuestionReminder'),
            selectedAnswerCard: document.getElementById('selectedAnswerCard'),
            otherAnswersSection: document.getElementById('otherAnswersSection'),
            otherAnswersList: document.getElementById('otherAnswersList'),
            
            // Wrong screen elements
            wrongQuestionReminder: document.getElementById('wrongQuestionReminder'),
            allAnswersList: document.getElementById('allAnswersList'),
            
            // Result screen elements
            winScore: document.getElementById('winScore'),
            winTotal: document.getElementById('winTotal'),
            loseScore: document.getElementById('loseScore'),
            loseTotal: document.getElementById('loseTotal'),
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
        // Show question screen underneath
        this.showScreen('question');
        this.renderQuestion();

        // Show Jesus intro overlay on top
        this.elements.jesusIntroScreen?.classList.add('active');

        // Start fading out after a brief display
        setTimeout(() => {
            this.elements.jesusIntroScreen?.classList.add('fading');
        }, 2000);

        // Fully hide after fade completes
        setTimeout(() => {
            this.elements.jesusIntroScreen?.classList.remove('active');
            this.elements.jesusIntroScreen?.classList.remove('fading');
        }, 3500);
    }
    
    showScreen(screenName) {
        // Hide all screens (except Jesus intro overlay which fades independently)
        const screens = [
            'idleScreen', 'questionScreen',
            'correctScreen', 'wrongScreen', 'winScreen', 'loseScreen'
        ];

        screens.forEach(screen => {
            this.elements[screen]?.classList.remove('active');
        });
        
        // Show requested screen
        switch (screenName) {
            case 'idle':
                this.elements.idleScreen?.classList.add('active');
                break;
            case 'question':
                this.elements.questionScreen?.classList.add('active');
                break;
            case 'correct':
                this.elements.correctScreen?.classList.add('active');
                break;
            case 'wrong':
                this.elements.wrongScreen?.classList.add('active');
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
                // Don't switch if showing Jesus intro
                if (!this.elements.jesusIntroScreen?.classList.contains('active')) {
                    this.showScreen('question');
                }
                this.renderQuestion();
                break;
                
            case 'revealed':
                this.renderReveal();
                break;
                
            case 'game_over':
                if (this.state.gameResult === 'win') {
                    this.elements.winScore.textContent = this.state.score;
                    this.elements.winTotal.textContent = this.state.totalQuestions;
                    this.showScreen('win');
                    this.playSound('win');
                } else {
                    this.elements.loseScore.textContent = this.state.score;
                    this.elements.loseTotal.textContent = this.state.totalQuestions;
                    this.elements.loseWrong.textContent = this.state.wrongChoices;
                    this.showScreen('lose');
                    this.playSound('lose');
                }
                break;
        }
    }
    
    renderQuestion() {
        const state = this.state;
        
        // Jesus banner
        this.elements.jesusBanner.style.display = state.jesusMode ? 'block' : 'none';
        
        // Question
        if (state.currentQuestion) {
            this.elements.questionText.textContent = state.currentQuestion.question;
            
            // Answers (just answer text, no explanations or references)
            this.elements.answersGrid.innerHTML = state.currentQuestion.answers
                .map((answer, index) => this.renderAnswerCard(answer, index))
                .join('');
        }
    }
    
    renderAnswerCard(answer, index) {
        const letter = String.fromCharCode(65 + index);
        
        return `
            <div class="answer-card">
                <span class="answer-letter">${letter}</span>
                <div class="answer-content">
                    <div class="answer-text">${this.escapeHtml(answer.answer)}</div>
                </div>
            </div>
        `;
    }
    
    renderReveal() {
        const state = this.state;
        const question = state.currentQuestion;

        if (!question) return;

        // Determine if player chose wrong or selected an answer
        if (state.selectedAnswerId === null) {
            // Player chose to be wrong
            this.renderWrongScreen(state, question);
            this.showScreen('wrong');
            this.playSound('miss');
        } else {
            // Player selected an answer (correct!)
            this.renderCorrectScreen(state, question);
            this.showScreen('correct');
            this.playSound('hit');
        }
    }
    
    renderCorrectScreen(state, question) {
        // Question reminder
        this.elements.correctQuestionReminder.textContent = question.question;
        
        // Find selected answer and other answers
        const selectedAnswer = question.answers.find(a => a.id === state.selectedAnswerId);
        const otherAnswers = question.answers.filter(a => a.id !== state.selectedAnswerId);
        const selectedIndex = question.answers.findIndex(a => a.id === state.selectedAnswerId);
        
        // Render selected answer (no explanation)
        if (selectedAnswer) {
            const letter = String.fromCharCode(65 + selectedIndex);
            this.elements.selectedAnswerCard.innerHTML = `
                <div class="answer-main">
                    <span class="answer-letter">${letter}</span>
                    <div class="answer-content">
                        <div class="answer-title">${this.escapeHtml(selectedAnswer.answer)}</div>
                    </div>
                </div>
                ${selectedAnswer.references?.length ? `<div class="answer-refs">📖 ${selectedAnswer.references.join(', ')}</div>` : ''}
            `;
        }
        
        // Render other answers (no explanations)
        if (otherAnswers.length > 0) {
            this.elements.otherAnswersSection.style.display = 'block';
            this.elements.otherAnswersList.innerHTML = otherAnswers
                .map((answer, idx) => {
                    const originalIndex = question.answers.findIndex(a => a.id === answer.id);
                    const letter = String.fromCharCode(65 + originalIndex);
                    return `
                        <div class="other-answer-card">
                            <div class="answer-main">
                                <span class="answer-letter">${letter}</span>
                                <div class="answer-content">
                                    <div class="answer-title">${this.escapeHtml(answer.answer)}</div>
                                </div>
                            </div>
                            ${answer.references?.length ? `<div class="answer-refs">📖 ${answer.references.join(', ')}</div>` : ''}
                        </div>
                    `;
                })
                .join('');
        } else {
            this.elements.otherAnswersSection.style.display = 'none';
        }
    }
    
    renderWrongScreen(state, question) {
        // Question reminder
        this.elements.wrongQuestionReminder.textContent = question.question;
        
        // Render all correct answers (no explanations)
        this.elements.allAnswersList.innerHTML = question.answers
            .map((answer, index) => {
                const letter = String.fromCharCode(65 + index);
                return `
                    <div class="all-answer-card">
                        <div class="answer-main">
                            <span class="answer-letter">${letter}</span>
                            <div class="answer-content">
                                <div class="answer-title">${this.escapeHtml(answer.answer)}</div>
                            </div>
                        </div>
                        ${answer.references?.length ? `<div class="answer-refs">📖 ${answer.references.join(', ')}</div>` : ''}
                    </div>
                `;
            })
            .join('');
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