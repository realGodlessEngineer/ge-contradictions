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
            WHERE (c.recommend_delete = 0 OR c.recommend_delete IS NULL)
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
              AND (c.recommend_delete = 0 OR c.recommend_delete IS NULL)
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
              AND (c.recommend_delete = 0 OR c.recommend_delete IS NULL)
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