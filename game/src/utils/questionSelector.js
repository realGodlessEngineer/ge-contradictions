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