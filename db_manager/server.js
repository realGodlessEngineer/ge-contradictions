const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const initSqlJs = require('sql.js');

const app = express();
const PORT = process.env.PORT || 3300;
const DB_PATH = process.env.DB_PATH || '../contradictions.db';
// Approval/review state is kept in a SEPARATE database so the content DB is never
// mutated by the review workflow. Defaults next to contradictions.db.
const REVIEW_DB_PATH = process.env.REVIEW_DB_PATH || '../reviews.db';

let db = null;
let reviewDb = null;

// 'needs_review' = auto-flagged for human attention (e.g. content merged unverified);
// distinct from 'needs_changes', which is a reviewer's decision that edits are required.
const REVIEW_STATUSES = ['pending', 'needs_review', 'approved', 'rejected', 'needs_changes'];

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
async function initDatabase() {
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
        console.log(`Loaded existing database from ${DB_PATH}`);
    } else {
        db = new SQL.Database();
        createTables();
        console.log('Created new database');
    }

    // Separate review/approval database (never mixed with content).
    if (fs.existsSync(REVIEW_DB_PATH)) {
        reviewDb = new SQL.Database(fs.readFileSync(REVIEW_DB_PATH));
        console.log(`Loaded review database from ${REVIEW_DB_PATH}`);
    } else {
        reviewDb = new SQL.Database();
        console.log(`Creating new review database at ${REVIEW_DB_PATH}`);
    }
    createReviewTables();
    saveReviewDatabase();
}

function createTables() {
    db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id   INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS contradiction_types (
            id   INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS scholarly_consensus_levels (
            id   INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS contradictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            question_url TEXT NOT NULL,
            summary TEXT,
            commentary TEXT,
            scholarship TEXT,
            recommend_delete INTEGER DEFAULT 0,
            delete_reason TEXT,
            category_id INTEGER REFERENCES categories(id),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            testament_scope TEXT,
            books_in_tension TEXT,
            contradiction_type_id INTEGER REFERENCES contradiction_types(id),
            difficulty_level INTEGER,
            notoriety_level INTEGER,
            scholarly_consensus_id INTEGER REFERENCES scholarly_consensus_levels(id),
            textual_variant_involved INTEGER,
            variant_description TEXT,
            critical_apparatus_ref TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contradiction_id INTEGER NOT NULL,
            answer TEXT NOT NULL,
            answer_explanation TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contradiction_id) REFERENCES contradictions(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS bible_references (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            answer_id INTEGER NOT NULL,
            reference TEXT NOT NULL,
            FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE
        )
    `);

    // The three harmonization_* tables are baked/owned by .scripts/buildHarmonizationTables.js;
    // declared here for documentation parity only.
    db.run(`
        CREATE TABLE IF NOT EXISTS harmonization_quote (
            id INTEGER PRIMARY KEY,
            contradiction_id INTEGER NOT NULL,
            pole TEXT NOT NULL,
            ord INTEGER NOT NULL,
            text TEXT NOT NULL,
            attr TEXT NOT NULL,
            voice TEXT,
            href TEXT,
            source_kind TEXT NOT NULL,
            source_code TEXT,
            FOREIGN KEY (contradiction_id) REFERENCES contradictions(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS harmonization_row (
            contradiction_id INTEGER PRIMARY KEY,
            covered INTEGER NOT NULL DEFAULT 1,
            reconcile_note TEXT,
            discrepancy_note TEXT,
            reconcile_half_line TEXT,
            discrepancy_half_line TEXT,
            reconcile_empty_note TEXT,
            reconcile_empty_note_attr TEXT,
            discrepancy_empty_note TEXT,
            discrepancy_empty_note_attr TEXT,
            FOREIGN KEY (contradiction_id) REFERENCES contradictions(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS harmonization_verse_pair (
            id INTEGER PRIMARY KEY,
            contradiction_id INTEGER NOT NULL,
            ord INTEGER NOT NULL,
            ref TEXT NOT NULL,
            snippet TEXT NOT NULL,
            FOREIGN KEY (contradiction_id) REFERENCES contradictions(id)
        )
    `);
}

function saveDatabase() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
}

// --- Review/approval database (separate file) ---------------------------------
function createReviewTables() {
    reviewDb.run(`
        CREATE TABLE IF NOT EXISTS reviews (
            contradiction_id INTEGER PRIMARY KEY,
            status TEXT NOT NULL DEFAULT 'pending',
            note TEXT,
            reviewer TEXT,
            content_hash TEXT,
            updated_at TEXT
        )
    `);
    // Append-only audit trail of every decision.
    reviewDb.run(`
        CREATE TABLE IF NOT EXISTS review_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contradiction_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            note TEXT,
            reviewer TEXT,
            content_hash TEXT,
            created_at TEXT
        )
    `);
}

function saveReviewDatabase() {
    fs.writeFileSync(REVIEW_DB_PATH, Buffer.from(reviewDb.export()));
}

// Short fingerprint of the reviewable content. If the contradiction's text later
// changes, a stored approval whose hash no longer matches is flagged "stale".
function contradictionContentHash(id) {
    const rows = queryToObjects(
        db.exec('SELECT question, summary, commentary, scholarship FROM contradictions WHERE id = ?', [id])
    );
    if (!rows.length) return null;
    const c = rows[0];
    const blob = [c.question, c.summary, c.commentary, c.scholarship].map(x => x || '').join('');
    return crypto.createHash('sha1').update(blob, 'utf8').digest('hex').slice(0, 12);
}

function queryToObjects(results) {
    if (!results || results.length === 0) return [];
    const [result] = results;
    const { columns, values } = result;
    return values.map(row => {
        const obj = {};
        columns.forEach((col, i) => {
            obj[col] = row[i];
        });
        return obj;
    });
}

// API Routes

// Get all categories (lookup table)
app.get('/api/categories', (req, res) => {
    try {
        res.json(queryToObjects(db.exec('SELECT * FROM categories ORDER BY id')));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all contradictions with their answers and references
app.get('/api/contradictions', (req, res) => {
    try {
        const contradictions = queryToObjects(
            db.exec('SELECT * FROM contradictions ORDER BY id')
        );

        for (const contradiction of contradictions) {
            const answers = queryToObjects(
                db.exec('SELECT * FROM answers WHERE contradiction_id = ?', [contradiction.id])
            );

            for (const answer of answers) {
                answer.bibleReferences = queryToObjects(
                    db.exec('SELECT * FROM bible_references WHERE answer_id = ?', [answer.id])
                ).map(ref => ref.reference);
            }

            contradiction.answers = answers;
        }

        res.json(contradictions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get random contradiction
app.get('/api/contradictions/random', (req, res) => {
    try {
        const contradictions = queryToObjects(
            db.exec('SELECT * FROM contradictions ORDER BY RANDOM() LIMIT 1')
        );

        if (contradictions.length === 0) {
            return res.status(404).json({ error: 'No contradictions found' });
        }

        const contradiction = contradictions[0];
        const answers = queryToObjects(
            db.exec('SELECT * FROM answers WHERE contradiction_id = ?', [contradiction.id])
        );

        for (const answer of answers) {
            answer.bibleReferences = queryToObjects(
                db.exec('SELECT * FROM bible_references WHERE answer_id = ?', [answer.id])
            ).map(ref => ref.reference);
        }

        contradiction.answers = answers;
        res.json(contradiction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single contradiction
app.get('/api/contradictions/:id', (req, res) => {
    try {
        const contradictions = queryToObjects(
            db.exec('SELECT * FROM contradictions WHERE id = ?', [req.params.id])
        );

        if (contradictions.length === 0) {
            return res.status(404).json({ error: 'Contradiction not found' });
        }

        const contradiction = contradictions[0];
        const answers = queryToObjects(
            db.exec('SELECT * FROM answers WHERE contradiction_id = ?', [contradiction.id])
        );

        for (const answer of answers) {
            answer.bibleReferences = queryToObjects(
                db.exec('SELECT * FROM bible_references WHERE answer_id = ?', [answer.id])
            ).map(ref => ref.reference);
        }

        contradiction.answers = answers;
        res.json(contradiction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create contradiction
app.post('/api/contradictions', (req, res) => {
    try {
        const {
            question,
            questionUrl,
            summary = null,
            commentary = null,
            scholarship = null,
            recommendDelete = 0,
            deleteReason = null,
            answers = []
        } = req.body;

        if (!question || !questionUrl) {
            return res.status(400).json({ error: 'Question and questionUrl are required' });
        }

        db.run(
            'INSERT INTO contradictions (question, question_url, summary, commentary, scholarship, recommend_delete, delete_reason) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [question, questionUrl, summary, commentary, scholarship, recommendDelete ? 1 : 0, deleteReason]
        );

        const idResult = db.exec('SELECT last_insert_rowid() as id');
        const contradictionId = idResult[0].values[0][0];

        for (const answer of answers) {
            db.run(
                'INSERT INTO answers (contradiction_id, answer, answer_explanation) VALUES (?, ?, ?)',
                [contradictionId, answer.answer, answer.answerExplanation || '']
            );

            const answerIdResult = db.exec('SELECT last_insert_rowid() as id');
            const answerId = answerIdResult[0].values[0][0];

            for (const ref of (answer.bibleReferences || [])) {
                db.run(
                    'INSERT INTO bible_references (answer_id, reference) VALUES (?, ?)',
                    [answerId, ref]
                );
            }
        }

        saveDatabase();
        res.status(201).json({ id: contradictionId, message: 'Contradiction created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update contradiction
app.put('/api/contradictions/:id', (req, res) => {
    try {
        const {
            question,
            questionUrl,
            summary = null,
            commentary = null,
            scholarship = null,
            recommendDelete = 0,
            deleteReason = null,
            answers = []
        } = req.body;
        const contradictionId = req.params.id;

        // Check if exists
        const existing = db.exec('SELECT id FROM contradictions WHERE id = ?', [contradictionId]);
        if (existing.length === 0 || existing[0].values.length === 0) {
            return res.status(404).json({ error: 'Contradiction not found' });
        }

        // Update main record
        db.run(
            'UPDATE contradictions SET question = ?, question_url = ?, summary = ?, commentary = ?, scholarship = ?, recommend_delete = ?, delete_reason = ? WHERE id = ?',
            [question, questionUrl, summary, commentary, scholarship, recommendDelete ? 1 : 0, deleteReason, contradictionId]
        );

        // Delete existing answers and references (cascade will handle references)
        const existingAnswers = queryToObjects(
            db.exec('SELECT id FROM answers WHERE contradiction_id = ?', [contradictionId])
        );
        
        for (const ans of existingAnswers) {
            db.run('DELETE FROM bible_references WHERE answer_id = ?', [ans.id]);
        }
        db.run('DELETE FROM answers WHERE contradiction_id = ?', [contradictionId]);

        // Insert new answers
        for (const answer of answers) {
            db.run(
                'INSERT INTO answers (contradiction_id, answer, answer_explanation) VALUES (?, ?, ?)',
                [contradictionId, answer.answer, answer.answerExplanation || '']
            );

            const answerIdResult = db.exec('SELECT last_insert_rowid() as id');
            const answerId = answerIdResult[0].values[0][0];

            for (const ref of (answer.bibleReferences || [])) {
                db.run(
                    'INSERT INTO bible_references (answer_id, reference) VALUES (?, ?)',
                    [answerId, ref]
                );
            }
        }

        saveDatabase();
        res.json({ message: 'Contradiction updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete contradiction
app.delete('/api/contradictions/:id', (req, res) => {
    try {
        const contradictionId = req.params.id;

        // Delete references first, then answers, then contradiction
        const answers = queryToObjects(
            db.exec('SELECT id FROM answers WHERE contradiction_id = ?', [contradictionId])
        );

        for (const ans of answers) {
            db.run('DELETE FROM bible_references WHERE answer_id = ?', [ans.id]);
        }

        db.run('DELETE FROM answers WHERE contradiction_id = ?', [contradictionId]);
        db.run('DELETE FROM contradictions WHERE id = ?', [contradictionId]);

        saveDatabase();
        res.json({ message: 'Contradiction deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Partial update for scholarship / delete-flag fields only (does not touch answers/references)
app.patch('/api/contradictions/:id/scholarship', (req, res) => {
    try {
        const contradictionId = req.params.id;
        const { summary, commentary, scholarship, recommendDelete, deleteReason } = req.body;

        const existing = db.exec('SELECT id FROM contradictions WHERE id = ?', [contradictionId]);
        if (existing.length === 0 || existing[0].values.length === 0) {
            return res.status(404).json({ error: 'Contradiction not found' });
        }

        const updates = [];
        const values = [];
        if (summary !== undefined)         { updates.push('summary = ?');          values.push(summary); }
        if (commentary !== undefined)      { updates.push('commentary = ?');       values.push(commentary); }
        if (scholarship !== undefined)     { updates.push('scholarship = ?');      values.push(scholarship); }
        if (recommendDelete !== undefined) { updates.push('recommend_delete = ?'); values.push(recommendDelete ? 1 : 0); }
        if (deleteReason !== undefined)    { updates.push('delete_reason = ?');    values.push(deleteReason); }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Provide at least one of: summary, commentary, scholarship, recommendDelete, deleteReason' });
        }

        values.push(contradictionId);
        db.run(`UPDATE contradictions SET ${updates.join(', ')} WHERE id = ?`, values);

        saveDatabase();
        res.json({ message: 'Scholarship fields updated', updated: updates.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export to JSON
app.get('/api/export', (req, res) => {
    try {
        const contradictions = queryToObjects(
            db.exec('SELECT * FROM contradictions ORDER BY id')
        );

        for (const contradiction of contradictions) {
            const answers = queryToObjects(
                db.exec('SELECT * FROM answers WHERE contradiction_id = ?', [contradiction.id])
            );

            for (const answer of answers) {
                answer.bibleReferences = queryToObjects(
                    db.exec('SELECT * FROM bible_references WHERE answer_id = ?', [answer.id])
                ).map(ref => ref.reference);

                // Clean up for export format
                delete answer.id;
                delete answer.contradiction_id;
                delete answer.created_at;
            }

            contradiction.answers = answers;

            // Rename to match original format
            contradiction.questionUrl = contradiction.question_url;
            delete contradiction.question_url;
            delete contradiction.id;
            delete contradiction.created_at;
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="contradictions.json"');
        res.json(contradictions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Database stats
app.get('/api/stats', (req, res) => {
    try {
        const contradictionsCount = db.exec('SELECT COUNT(*) as count FROM contradictions')[0].values[0][0];
        const answersCount = db.exec('SELECT COUNT(*) as count FROM answers')[0].values[0][0];
        const referencesCount = db.exec('SELECT COUNT(*) as count FROM bible_references')[0].values[0][0];

        res.json({
            contradictions: contradictionsCount,
            answers: answersCount,
            references: referencesCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Review / approval API (separate reviews.db) ------------------------------

// Map of contradiction_id -> review state, with a computed `stale` flag when the
// contradiction's content changed since the decision was recorded.
app.get('/api/reviews', (req, res) => {
    try {
        const rows = queryToObjects(reviewDb.exec('SELECT * FROM reviews'));
        const out = {};
        for (const r of rows) {
            const current = contradictionContentHash(r.contradiction_id);
            out[r.contradiction_id] = {
                ...r,
                current_hash: current,
                stale: !!(r.content_hash && current && r.content_hash !== current),
            };
        }
        res.json(out);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Review progress counts.
app.get('/api/reviews/stats', (req, res) => {
    try {
        const total = db.exec('SELECT COUNT(*) FROM contradictions')[0].values[0][0];
        const byStatus = { approved: 0, rejected: 0, needs_changes: 0, needs_review: 0 };
        for (const r of queryToObjects(reviewDb.exec("SELECT status, COUNT(*) AS n FROM reviews WHERE status <> 'pending' GROUP BY status"))) {
            byStatus[r.status] = r.n;
        }
        const decided = byStatus.approved + byStatus.rejected + byStatus.needs_changes;
        let stale = 0;
        for (const r of queryToObjects(reviewDb.exec('SELECT contradiction_id, content_hash FROM reviews'))) {
            const cur = contradictionContentHash(r.contradiction_id);
            if (r.content_hash && cur && r.content_hash !== cur) stale++;
        }
        res.json({ total, decided, pending: total - decided - byStatus.needs_review, stale, ...byStatus });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Decision history for one contradiction (newest first).
app.get('/api/reviews/:id/history', (req, res) => {
    try {
        const rows = queryToObjects(
            reviewDb.exec('SELECT * FROM review_events WHERE contradiction_id = ? ORDER BY id DESC', [Number(req.params.id)])
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Record/replace a review decision. Writes ONLY to reviews.db.
app.put('/api/reviews/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status, note = null, reviewer = null } = req.body || {};
        if (!REVIEW_STATUSES.includes(status)) {
            return res.status(400).json({ error: `status must be one of: ${REVIEW_STATUSES.join(', ')}` });
        }
        const exists = db.exec('SELECT id FROM contradictions WHERE id = ?', [id]);
        if (!exists.length || !exists[0].values.length) {
            return res.status(404).json({ error: 'Contradiction not found' });
        }

        const hash = contradictionContentHash(id);
        const now = new Date().toISOString();

        const has = reviewDb.exec('SELECT 1 FROM reviews WHERE contradiction_id = ?', [id]);
        if (has.length && has[0].values.length) {
            reviewDb.run(
                'UPDATE reviews SET status = ?, note = ?, reviewer = ?, content_hash = ?, updated_at = ? WHERE contradiction_id = ?',
                [status, note, reviewer, hash, now, id]
            );
        } else {
            reviewDb.run(
                'INSERT INTO reviews (contradiction_id, status, note, reviewer, content_hash, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                [id, status, note, reviewer, hash, now]
            );
        }
        reviewDb.run(
            'INSERT INTO review_events (contradiction_id, status, note, reviewer, content_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [id, status, note, reviewer, hash, now]
        );
        saveReviewDatabase();
        res.json({ contradiction_id: id, status, note, reviewer, content_hash: hash, updated_at: now, stale: false });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
});