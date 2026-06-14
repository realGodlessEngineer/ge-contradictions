/**
 * Review & Approve — front end.
 * Reads contradictions from /api/contradictions (content DB, read-only here) and review
 * state from /api/reviews (separate reviews.db). Decisions are written via PUT /api/reviews/:id.
 */

let contradictions = [];
let reviews = {};               // id -> { status, note, reviewer, stale, ... }
let renderLimit = 25;
const PAGE = 25;

const RANGES = { '1-200': [1, 200], '201-9999': [201, 99999] };
const STATUS_LABEL = {
    pending: 'Pending', needs_review: 'Needs review', approved: 'Approved', rejected: 'Rejected', needs_changes: 'Needs changes',
};

document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('reviewer') || '';
    document.getElementById('reviewer-input').value = saved;
    document.getElementById('reviewer-input').addEventListener('input', e => {
        localStorage.setItem('reviewer', e.target.value);
    });
    load();
});

async function api(url, options = {}) {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Request failed');
    return res.json();
}

async function load() {
    try {
        const [cons, revs] = await Promise.all([
            api('/api/contradictions'),
            api('/api/reviews'),
        ]);
        contradictions = cons;
        reviews = revs;
        renderStats();
        render();
    } catch (e) {
        document.getElementById('review-list').innerHTML = `<p class="loading">Error: ${escapeHtml(e.message)}</p>`;
    }
}

function reviewOf(id) {
    return reviews[id] || { status: 'pending', note: '', reviewer: '', stale: false };
}

async function renderStats() {
    try {
        const s = await api('/api/reviews/stats');
        const pct = s.total ? Math.round((s.decided / s.total) * 100) : 0;
        document.getElementById('progress-fill').style.width = pct + '%';
        document.getElementById('progress-counts').innerHTML =
            `<strong>${s.decided}/${s.total}</strong> reviewed (${pct}%) · `
            + `<span class="c-approved">${s.approved} approved</span> · `
            + `<span class="c-needs">${s.needs_changes} needs changes</span> · `
            + `<span class="c-rejected">${s.rejected} rejected</span> · `
            + (s.needs_review ? `<span class="c-review">${s.needs_review} needs review</span> · ` : '')
            + `<span class="c-pending">${s.pending} pending</span>`
            + (s.stale ? ` · <span class="c-stale">${s.stale} stale</span>` : '');
    } catch { /* non-fatal */ }
}

// --- filtering ---------------------------------------------------------------
function currentFilter() {
    return {
        status: document.getElementById('status-filter').value,
        scope: document.getElementById('scope-filter').value,
        search: document.getElementById('search-input').value.toLowerCase().trim(),
    };
}

function matches(c, f) {
    const r = reviewOf(c.id);
    if (f.status === 'stale') { if (!r.stale) return false; }
    else if (f.status !== 'all' && r.status !== f.status) return false;
    if (f.scope !== 'all') {
        const [lo, hi] = RANGES[f.scope];
        if (c.id < lo || c.id > hi) return false;
    }
    if (f.search) {
        const hay = (c.question + ' ' + (c.summary || '') + ' ' + (c.commentary || '')).toLowerCase();
        if (!hay.includes(f.search)) return false;
    }
    return true;
}

function filtered() {
    const f = currentFilter();
    return contradictions.filter(c => matches(c, f)).sort((a, b) => a.id - b.id);
}

function handleFilter() {
    renderLimit = PAGE;
    render();
}

function render() {
    const list = filtered();
    const el = document.getElementById('review-list');
    document.getElementById('result-count').textContent = `${list.length} shown`;

    if (list.length === 0) {
        el.innerHTML = `<div class="empty-state"><h3>Nothing here</h3><p>No contradictions match this filter.</p></div>`;
        document.getElementById('load-more-wrap').style.display = 'none';
        return;
    }

    const slice = list.slice(0, renderLimit);
    el.innerHTML = slice.map(renderCard).join('');

    const remaining = list.length - slice.length;
    const wrap = document.getElementById('load-more-wrap');
    if (remaining > 0) {
        wrap.style.display = 'block';
        document.getElementById('load-more-btn').textContent = `Load more (${remaining} remaining)`;
    } else {
        wrap.style.display = 'none';
    }
}

function loadMore() {
    renderLimit += PAGE;
    render();
}

// --- card -------------------------------------------------------------------
function renderCard(c) {
    const r = reviewOf(c.id);
    const meta = [c.category, c.contradiction_type, c.testament_scope].filter(Boolean).map(escapeHtml).join(' · ');
    const scholarship = (c.scholarship || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);

    const answersHtml = (c.answers || []).map(a => `
        <li class="answer-item">
            <div class="answer-text">${escapeHtml(a.answer)}</div>
            ${a.bibleReferences?.length ? `<div class="answer-references">${a.bibleReferences.map(x => `<span class="reference-tag">${escapeHtml(x)}</span>`).join('')}</div>` : ''}
        </li>`).join('');

    const reviewerLine = r.reviewer || r.updated_at
        ? `<span class="review-meta">${r.reviewer ? escapeHtml(r.reviewer) + ' · ' : ''}${r.updated_at ? new Date(r.updated_at).toLocaleString() : ''}</span>`
        : '';

    return `
    <article class="review-card status-${r.status}${r.stale ? ' is-stale' : ''}" data-id="${c.id}">
        <header class="review-card-header">
            <div class="rc-title">
                <span class="rid">#${c.id}</span>
                <h3>${escapeHtml(c.question)}</h3>
            </div>
            <div class="review-badges">
                <span class="status-badge ${r.status}" id="badge-${c.id}">${STATUS_LABEL[r.status] || r.status}</span>
                ${r.stale ? '<span class="status-badge stale" title="The contradiction text changed after this decision">edited since review</span>' : ''}
            </div>
        </header>
        ${meta ? `<div class="rc-meta">${meta}</div>` : ''}
        <div class="rc-content">
            ${c.summary ? `<h4>Summary</h4><p class="rc-summary">${md(c.summary)}</p>` : ''}
            ${c.commentary ? `<h4>Commentary</h4><div class="rc-commentary">${paras(c.commentary)}</div>` : '<p class="no-answers">No commentary.</p>'}
            ${scholarship.length ? `<details class="rc-extra"><summary>Scholarship (${scholarship.length})</summary><ul class="rc-scholarship">${scholarship.map(s => `<li>${md(s)}</li>`).join('')}</ul></details>` : ''}
            ${answersHtml ? `<details class="rc-extra"><summary>Answers (${c.answers.length})</summary><ul class="answers-list">${answersHtml}</ul></details>` : ''}
        </div>
        <footer class="review-actions">
            <textarea id="note-${c.id}" class="review-note" placeholder="Reviewer note (optional)">${escapeHtml(r.note || '')}</textarea>
            <div class="review-btns">
                <button class="btn btn-approve" onclick="decide(${c.id}, 'approved')">✓ Approve</button>
                <button class="btn btn-needs" onclick="decide(${c.id}, 'needs_changes')">✎ Needs changes</button>
                <button class="btn btn-reject" onclick="decide(${c.id}, 'rejected')">✕ Reject</button>
                ${r.status !== 'pending' ? `<button class="btn btn-text" onclick="decide(${c.id}, 'pending')">reset</button>` : ''}
                <span class="save-hint" id="hint-${c.id}">${reviewerLine}</span>
            </div>
        </footer>
    </article>`;
}

// --- decision ---------------------------------------------------------------
async function decide(id, status) {
    const note = (document.getElementById(`note-${id}`)?.value || '').trim();
    const reviewer = document.getElementById('reviewer-input').value.trim();
    const hint = document.getElementById(`hint-${id}`);
    if (hint) hint.textContent = 'saving…';
    try {
        const saved = await api(`/api/reviews/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status, note: note || null, reviewer: reviewer || null }),
        });
        reviews[id] = { ...saved, stale: false };
        renderStats();

        const f = currentFilter();
        const card = document.querySelector(`.review-card[data-id="${id}"]`);
        const stillMatches = matches(contradictions.find(c => c.id === id), f);
        if (!stillMatches && card) {
            card.classList.add('removing');
            setTimeout(() => { render(); }, 250);
        } else {
            // update in place
            const badge = document.getElementById(`badge-${id}`);
            if (badge) { badge.className = `status-badge ${status}`; badge.textContent = STATUS_LABEL[status] || status; }
            if (card) card.className = `review-card status-${status}`;
            if (hint) hint.textContent = 'saved ✓';
        }
    } catch (e) {
        if (hint) hint.textContent = 'error: ' + e.message;
    }
}

// --- helpers ----------------------------------------------------------------
function escapeHtml(t) {
    if (t === null || t === undefined) return '';
    const d = document.createElement('div');
    d.textContent = String(t);
    return d.innerHTML;
}

// minimal markdown: *italics* (used for *Book Titles*). Escapes first.
function md(t) {
    return escapeHtml(t).replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

// split on blank lines into paragraphs, light markdown each.
function paras(t) {
    return String(t).split(/\n\s*\n/).map(p => `<p>${md(p.trim())}</p>`).join('');
}
