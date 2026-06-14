/**
 * Biblical Contradictions Database Editor
 * Frontend Application
 */

// State
let contradictions = [];
let editingId = null;
let deleteId = null;
let answerCount = 0;
let currentSort = 'id-asc';
let filterNoAnswers = false;

// DOM Elements
const contradictionsList = document.getElementById('contradictions-list');
const modalOverlay = document.getElementById('modal-overlay');
const deleteModalOverlay = document.getElementById('delete-modal-overlay');
const modalTitle = document.getElementById('modal-title');
const form = document.getElementById('contradiction-form');
const answersContainer = document.getElementById('answers-container');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadContradictions();
    loadStats();
});

// API Functions
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Request failed');
        }

        return response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function loadContradictions() {
    try {
        contradictionsList.innerHTML = '<p class="loading">Loading contradictions...</p>';
        contradictions = await apiRequest('/api/contradictions');
        updateMissingCount();
        renderContradictions();
    } catch (error) {
        contradictionsList.innerHTML = `<p class="loading">Error loading data: ${error.message}</p>`;
    }
}

async function loadStats() {
    try {
        const stats = await apiRequest('/api/stats');
        document.getElementById('stat-contradictions').textContent = stats.contradictions;
        document.getElementById('stat-answers').textContent = stats.answers;
        document.getElementById('stat-references').textContent = stats.references;
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Sorting and Filtering
function handleSortChange() {
    currentSort = document.getElementById('sort-select').value;
    renderContradictions();
}

function handleFilterChange() {
    filterNoAnswers = document.getElementById('filter-no-answers').checked;
    renderContradictions();
}

function updateMissingCount() {
    const missingCount = contradictions.filter(c => c.answers.length === 0).length;
    const countEl = document.getElementById('missing-count');
    if (missingCount > 0) {
        countEl.textContent = `${missingCount} missing`;
    } else {
        countEl.textContent = '';
    }
}

function sortContradictions(items) {
    const sorted = [...items];
    
    switch (currentSort) {
        case 'id-asc':
            sorted.sort((a, b) => a.id - b.id);
            break;
        case 'id-desc':
            sorted.sort((a, b) => b.id - a.id);
            break;
        case 'answers-asc':
            sorted.sort((a, b) => a.answers.length - b.answers.length);
            break;
        case 'answers-desc':
            sorted.sort((a, b) => b.answers.length - a.answers.length);
            break;
        case 'question-asc':
            sorted.sort((a, b) => a.question.localeCompare(b.question));
            break;
        case 'question-desc':
            sorted.sort((a, b) => b.question.localeCompare(a.question));
            break;
    }
    
    return sorted;
}

// Render Functions
function renderContradictions() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    let filtered = contradictions.filter(c => 
        c.question.toLowerCase().includes(searchTerm) ||
        c.answers.some(a => 
            a.answer.toLowerCase().includes(searchTerm) ||
            a.answer_explanation?.toLowerCase().includes(searchTerm)
        )
    );
    
    // Apply "no answers" filter
    if (filterNoAnswers) {
        filtered = filtered.filter(c => c.answers.length === 0);
    }
    
    // Apply sorting
    filtered = sortContradictions(filtered);

    if (filtered.length === 0) {
        contradictionsList.innerHTML = `
            <div class="empty-state">
                <h3>No contradictions found</h3>
                <p>${contradictions.length === 0 
                    ? 'Add your first contradiction to get started.' 
                    : filterNoAnswers 
                        ? 'All contradictions have answers! 🎉'
                        : 'Try adjusting your search terms.'}</p>
            </div>
        `;
        return;
    }

    contradictionsList.innerHTML = filtered.map(c => renderCard(c)).join('');
}

function renderCard(contradiction) {
    const answerCountBadge = contradiction.answers.length === 0
        ? '<span class="answer-count-badge missing">0 answers</span>'
        : `<span class="answer-count-badge">${contradiction.answers.length} answer${contradiction.answers.length !== 1 ? 's' : ''}</span>`;

    const isFlagged = !!contradiction.recommend_delete;
    const deleteFlagBadge = isFlagged
        ? `<span class="delete-flag-badge" title="${escapeHtml(contradiction.delete_reason || 'Flagged by agent')}">⚠ Recommend delete</span>`
        : '';
    const deleteReasonBlock = isFlagged && contradiction.delete_reason
        ? `<div class="delete-reason"><strong>Agent recommends delete:</strong> ${escapeHtml(contradiction.delete_reason)}</div>`
        : '';

    const answersHtml = contradiction.answers.length > 0
        ? `<ul class="answers-list">
            ${contradiction.answers.map(a => `
                <li class="answer-item">
                    <div class="answer-text">${escapeHtml(a.answer)}</div>
                    ${a.answer_explanation
                        ? `<div class="answer-explanation">${escapeHtml(a.answer_explanation)}</div>`
                        : ''}
                    ${a.bibleReferences?.length > 0
                        ? `<div class="answer-references">
                            ${a.bibleReferences.map(ref =>
                                `<span class="reference-tag">${escapeHtml(ref)}</span>`
                            ).join('')}
                           </div>`
                        : ''}
                </li>
            `).join('')}
           </ul>`
        : '<p class="no-answers">No answers recorded</p>';

    const cardClasses = [
        'contradiction-card',
        contradiction.answers.length === 0 ? 'missing-answers' : '',
        isFlagged ? 'flagged-delete' : ''
    ].filter(Boolean).join(' ');

    return `
        <article class="${cardClasses}" data-id="${contradiction.id}">
            <header class="card-header">
                <div class="card-title-row">
                    <h3>${escapeHtml(contradiction.question)}</h3>
                    ${answerCountBadge}
                    ${deleteFlagBadge}
                </div>
                <div class="card-actions">
                    <button class="btn btn-small btn-secondary" onclick="openEditModal(${contradiction.id})">
                        Edit
                    </button>
                    <button class="btn btn-small btn-text" onclick="openDeleteModal(${contradiction.id})">
                        Delete
                    </button>
                </div>
            </header>
            <div class="card-url">
                <a href="${escapeHtml(contradiction.question_url)}" target="_blank" rel="noopener">
                    ${escapeHtml(contradiction.question_url)}
                </a>
            </div>
            <div class="card-body">
                ${deleteReasonBlock}
                ${answersHtml}
            </div>
        </article>
    `;
}

// Modal Functions
function openCreateModal() {
    editingId = null;
    modalTitle.textContent = 'New Contradiction';
    document.getElementById('submit-btn').textContent = 'Create';
    form.reset();
    answersContainer.innerHTML = '';
    answerCount = 0;
    addAnswerField();
    modalOverlay.classList.add('active');
    document.getElementById('form-question').focus();
}

function openEditModal(id) {
    const contradiction = contradictions.find(c => c.id === id);
    if (!contradiction) return;

    editingId = id;
    modalTitle.textContent = 'Edit Contradiction';
    document.getElementById('submit-btn').textContent = 'Save Changes';

    document.getElementById('form-id').value = id;
    document.getElementById('form-question').value = contradiction.question;
    document.getElementById('form-url').value = contradiction.question_url;

    answersContainer.innerHTML = '';
    answerCount = 0;

    if (contradiction.answers.length > 0) {
        contradiction.answers.forEach(answer => {
            addAnswerField(answer);
        });
    } else {
        addAnswerField();
    }

    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
    editingId = null;
    form.reset();
}

function handleOverlayClick(event) {
    if (event.target === modalOverlay) {
        // Don't close on overlay click - only close button
        // This prevents accidental data loss
    }
}

function openDeleteModal(id) {
    const contradiction = contradictions.find(c => c.id === id);
    if (!contradiction) return;

    deleteId = id;
    document.getElementById('delete-preview').textContent = `"${contradiction.question}"`;
    deleteModalOverlay.classList.add('active');
}

function closeDeleteModal() {
    deleteModalOverlay.classList.remove('active');
    deleteId = null;
}

async function confirmDelete() {
    if (!deleteId) return;

    try {
        await apiRequest(`/api/contradictions/${deleteId}`, { method: 'DELETE' });
        closeDeleteModal();
        await loadContradictions();
        await loadStats();
    } catch (error) {
        alert('Failed to delete: ' + error.message);
    }
}

// Form Functions
function addAnswerField(existingAnswer = null) {
    answerCount++;
    const index = answerCount;

    const fieldHtml = `
        <div class="answer-field" data-answer-index="${index}">
            <div class="answer-field-header">
                <span>Answer ${index}</span>
                <button type="button" class="btn btn-text remove-answer" onclick="removeAnswerField(${index})">
                    Remove
                </button>
            </div>
            <div class="form-group">
                <label for="answer-text-${index}">Answer</label>
                <input 
                    type="text" 
                    id="answer-text-${index}"
                    name="answer-text-${index}"
                    placeholder="e.g., In the beginning"
                    value="${existingAnswer ? escapeHtml(existingAnswer.answer) : ''}"
                    required
                >
            </div>
            <div class="form-group">
                <label for="answer-explanation-${index}">Explanation</label>
                <textarea 
                    id="answer-explanation-${index}"
                    name="answer-explanation-${index}"
                    placeholder="Detailed explanation of this answer..."
                >${existingAnswer ? escapeHtml(existingAnswer.answer_explanation || '') : ''}</textarea>
            </div>
            <div class="form-group references-input-group">
                <label for="answer-refs-${index}">Bible References</label>
                <input 
                    type="text" 
                    id="answer-refs-${index}"
                    name="answer-refs-${index}"
                    placeholder="e.g., Genesis 1:1, John 1:1"
                    value="${existingAnswer?.bibleReferences ? existingAnswer.bibleReferences.join(', ') : ''}"
                >
                <p class="references-hint">Separate multiple references with commas</p>
            </div>
        </div>
    `;

    answersContainer.insertAdjacentHTML('beforeend', fieldHtml);
}

function removeAnswerField(index) {
    const field = document.querySelector(`.answer-field[data-answer-index="${index}"]`);
    if (field) {
        field.remove();
    }

    // Ensure at least one answer field
    if (answersContainer.children.length === 0) {
        addAnswerField();
    }
}

function collectAnswers() {
    const answers = [];
    const fields = document.querySelectorAll('.answer-field');

    fields.forEach(field => {
        const index = field.dataset.answerIndex;
        const answerText = document.getElementById(`answer-text-${index}`).value.trim();
        const explanation = document.getElementById(`answer-explanation-${index}`).value.trim();
        const refsInput = document.getElementById(`answer-refs-${index}`).value.trim();

        if (answerText) {
            const bibleReferences = refsInput
                ? refsInput.split(',').map(r => r.trim()).filter(r => r)
                : [];

            answers.push({
                answer: answerText,
                answerExplanation: explanation,
                bibleReferences,
            });
        }
    });

    return answers;
}

async function handleSubmit(event) {
    event.preventDefault();

    const question = document.getElementById('form-question').value.trim();
    const questionUrl = document.getElementById('form-url').value.trim();
    const answers = collectAnswers();

    const data = { question, questionUrl, answers };

    try {
        if (editingId) {
            await apiRequest(`/api/contradictions/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
        } else {
            await apiRequest('/api/contradictions', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        }

        closeModal();
        await loadContradictions();
        await loadStats();
    } catch (error) {
        alert('Failed to save: ' + error.message);
    }
}

// Search
function filterContradictions() {
    renderContradictions();
}

// Export
async function exportJson() {
    try {
        const response = await fetch('/api/export');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contradictions.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        alert('Export failed: ' + error.message);
    }
}

// Random Contradiction
async function showRandomContradiction() {
    try {
        const contradiction = await apiRequest('/api/contradictions/random');
        const section = document.getElementById('random-section');
        const content = document.getElementById('random-content');
        content.innerHTML = renderCard(contradiction);
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert('Failed to load random contradiction: ' + error.message);
    }
}

function closeRandomSection() {
    document.getElementById('random-section').style.display = 'none';
}

// Utilities
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}