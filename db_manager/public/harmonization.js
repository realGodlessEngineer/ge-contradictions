// Harmonization editorial-emptyNote authoring UI.
// Reads the honest-absence worklist + per-row context from the server, writes the
// edited emptyNote/attr/half-line back to the dossier JSON. The operator re-bakes.

let QUEUE = [];          // full worklist
let SELECTED = null;     // currently open id
let DETAIL = null;       // loaded detail for SELECTED

const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

async function loadQueue() {
    const res = await fetch('/api/harmonization/queue');
    const data = await res.json();
    QUEUE = data.items || [];
    document.getElementById('pending-count').textContent = data.pendingBake ?? 0;
    applyFilter();
}

function filteredItems() {
    const lean = document.getElementById('filter-lean').value;
    const pend = document.getElementById('filter-pending').value;
    const noto = document.getElementById('filter-notoriety').value;
    const q = document.getElementById('filter-search').value.trim().toLowerCase();
    return QUEUE.filter((it) => {
        if (lean !== 'all' && it.lean !== lean) return false;
        if (pend === 'pending' && !it.pendingBake) return false;
        if (pend === 'clean' && it.pendingBake) return false;
        const n = it.notoriety || 0;
        if (noto === 'hi' && !(n >= 4)) return false;
        if (noto === 'mid' && n !== 3) return false;
        if (noto === 'lo' && !(n <= 2)) return false;
        if (q) {
            const hay = (it.question + ' ' + (it.refs || []).join(' ') + ' ' + it.id).toLowerCase();
            if (!hay.includes(q)) return false;
        }
        return true;
    });
}

function applyFilter() {
    const items = filteredItems();
    const pendTotal = QUEUE.filter((i) => i.pendingBake).length;
    document.getElementById('list-count').textContent =
        `${items.length} shown · ${QUEUE.length} total · ${pendTotal} edited`;
    const list = document.getElementById('harm-list');
    list.innerHTML = items.map((it) => `
        <div class="harm-row ${it.id === SELECTED ? 'active' : ''}" onclick="selectRow(${it.id})">
            <span class="dot ${it.pendingBake ? 'pending' : ''}" title="${it.pendingBake ? 'edited since last bake' : ''}"></span>
            <span class="rid">${it.id}</span>
            <span class="rq">${esc(it.question)}</span>
        </div>`).join('') || '<p style="padding:12px;color:#777;">No rows match.</p>';
}

async function selectRow(id) {
    SELECTED = id;
    applyFilter();
    const editor = document.getElementById('editor');
    editor.innerHTML = '<div class="editor-empty">Loading…</div>';
    const res = await fetch(`/api/harmonization/${id}`);
    if (!res.ok) { editor.innerHTML = `<div class="msg err">Failed to load id ${id}.</div>`; return; }
    DETAIL = await res.json();
    renderEditor(DETAIL);
}

function renderEditor(d) {
    const verses = (d.versePair || []).map((v) => `
        <div class="verse"><span class="ref">${esc(v.ref)}</span> — ${esc(v.snippet)}</div>`).join('');

    const recon = [];
    if (d.reconcileNote) recon.push(`<p class="skeptic"><em>${esc(d.reconcileNote)}</em></p>`);
    for (const q of (d.reconcileQuotes || [])) {
        recon.push(`<div class="recon-quote">${esc(q.text)}<span class="attr">${esc(q.attr)}</span></div>`);
    }
    const reconBlock = recon.length
        ? `<div class="ctx-block"><h3>Reconcile side (what the note must genuinely counter)</h3>${recon.join('')}</div>`
        : '';

    const skeptic = (d.answers || []).map((a) => `
        <p class="skeptic"><strong>${esc(a.answer)}</strong>${a.answer_explanation ? ' — ' + esc(a.answer_explanation) : ''}</p>`).join('');
    const skepticBlock = skeptic
        ? `<details class="skeptic-wrap ctx-block"><summary>Raw skeptic claim(s) for reference</summary>${skeptic}</details>`
        : '';

    const dd = d.discrepancy || {};
    document.getElementById('editor').innerHTML = `
        <div class="ctx-q">${esc(d.question)}</div>
        <div class="ctx-meta">
            <span>id ${d.id}</span>
            <span class="badge lean">${d.lean}-leaning</span>
            <span>consensus: ${esc(d.consensus || '—')}</span>
            <span>notoriety: ${d.notoriety ?? '—'}</span>
            ${d.pendingBake ? '<span class="badge pending">pending bake</span>' : ''}
        </div>
        ${verses}
        ${reconBlock}
        ${skepticBlock}

        <div class="ctx-block"><h3>Discrepancy pole — editorial note (your words)</h3>
            <div class="field">
                <label for="in-emptynote">emptyNote <span class="hint">one sentence stating the mechanism of the tension, in your own voice</span></label>
                <textarea id="in-emptynote" rows="3" oninput="countChars()">${esc(dd.emptyNote)}</textarea>
                <div class="charcount" id="cc-emptynote"></div>
            </div>
            <div class="field">
                <label for="in-attr">emptyNoteAttr <span class="hint">who catalogued it — provenance credit</span></label>
                <input type="text" id="in-attr" value="${esc(dd.emptyNoteAttr)}">
            </div>
            <div class="field">
                <label for="in-halfline">halfLine <span class="hint">optional short connective; leave blank for none</span></label>
                <input type="text" id="in-halfline" value="${esc(dd.halfLine)}">
            </div>
            <div class="editor-actions">
                <button class="btn btn-primary" onclick="saveRow()">Save to dossier</button>
                <button class="btn btn-secondary" onclick="fillTemplate()" title="prefill the cataloguer credit">Attr template</button>
            </div>
            <div id="save-msg"></div>
        </div>`;
    countChars();
}

function countChars() {
    const el = document.getElementById('in-emptynote');
    if (!el) return;
    const n = el.value.trim().length;
    const cc = document.getElementById('cc-emptynote');
    cc.textContent = `${n} chars`;
    cc.className = 'charcount' + (n > 220 ? ' warn' : '');
}

function fillTemplate() {
    const el = document.getElementById('in-attr');
    if (el && !el.value.trim()) el.value = 'Editorial statement of the mechanism; catalogued by <critic>, <work> (<year>).';
    el.focus();
}

async function saveRow() {
    if (!SELECTED) return;
    const body = {
        emptyNote: document.getElementById('in-emptynote').value,
        emptyNoteAttr: document.getElementById('in-attr').value,
        halfLine: document.getElementById('in-halfline').value,
    };
    const msg = document.getElementById('save-msg');
    msg.innerHTML = '<div class="msg">Saving…</div>';
    const res = await fetch(`/api/harmonization/${SELECTED}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || data.ok === false) {
        const errs = (data.errors || [data.error || 'Save failed']).map((e) => `<li>${esc(e)}</li>`).join('');
        msg.innerHTML = `<div class="msg err"><strong>Not saved:</strong><ul>${errs}</ul></div>`;
        return;
    }
    let html = '<div class="msg ok">Saved to dossier. Re-bake to publish into the DB.</div>';
    if (data.warnings && data.warnings.length) {
        html += `<div class="msg warn"><strong>Advisories:</strong><ul>${data.warnings.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></div>`;
    }
    msg.innerHTML = html;
    // reflect the new state locally.
    const it = QUEUE.find((x) => x.id === SELECTED);
    if (it) {
        it.emptyNote = data.saved.emptyNote;
        it.emptyNoteAttr = data.saved.emptyNoteAttr;
        it.halfLine = data.saved.halfLine;
        it.pendingBake = true;
    }
    document.getElementById('pending-count').textContent = QUEUE.filter((x) => x.pendingBake).length;
    applyFilter();
}

loadQueue();
