// slimGather.js
// DIAGNOSTIC / ORACLE HARNESS — NOT wired into the pipeline (see finding below).
//
// Hypothesis (2026-07-01): a gather file (data/harmonization/gather/by_id/<id>.json)
// is ~95% `notes`, and only ~6-7% of gathered notes are ever excerpted, so a
// deterministic ref-keyed filter — keep a note when its note_ref
// (SRC/bolls/chapter/verse) sits in the same book+chapter as a cited ref and within
// +/-MARGIN verses — could cut the TRANSFORM/DOSSIER input (~34K tok/call) by ~85%
// at zero quality cost.
//
// FINDING: DISPROVEN as a SAFE filter. The gather step is ALREADY tightly ref-scoped
// (notes only exist in the cited chapters, clustered near the cited verses), and the
// transform legitimately excerpts notes SEVERAL verses from the cited verse (context /
// parallel passages) — e.g. id 160 cites Deut 3:26-27 but uses a note on Deut 3:21;
// id 25 cites Psalm 50:13 but uses 50:7. So no margin is both safe and worthwhile:
// the 318-id oracle sweep shows margin 0 = 71.6% saved but drops 148 used notes;
// margin 10 = only 6.9% saved yet STILL drops 14 used notes. The used and unused
// notes are content-separable, not verse-separable — a mechanical filter can't tell
// them apart. Wiring this in would silently degrade the transform on NEW (uncovered)
// ids where there is no oracle to catch the drops. So it stays a diagnostic only.
//
// Kept because: (1) `--verify` is the reusable oracle harness that produced the
// finding and can re-check if the gather logic ever changes; (2) it documents a
// disproven approach so it isn't re-attempted. The doWrite() path exists but should
// NOT feed the pipeline.
//
// The existing machine files are ground truth for which notes matter — every excerpt
// records the `full_note_ref` it was drawn from. `--verify` asserts filter output
// retains EVERY used note_ref across the covered corpus (and sweeps margins); a real
// MISS (a used note present in the gather file but dropped) exits non-zero. Used refs
// absent from the gather file entirely are reported separately as "not-in-gather"
// (a pre-existing data quirk, not a filter defect).
//
// Read-only on both .db files (it never opens them). Writes only under OUT_DIR.
//
//   node .scripts/slimGather.js --verify         # oracle check + margin sweep, writes NOTHING (the useful mode)
//   MARGIN=3 node .scripts/slimGather.js --verify # try a different verse window
//   node .scripts/slimGather.js                   # (diagnostic) write gather_slim/<id>.json — do NOT feed the pipeline
//
// Env: GATHER_DIR, OUT_DIR, MACHINE_DIR, MARGIN, IDS.
'use strict'
const fs = require('fs')
const path = require('path')

const REPO_ROOT = path.resolve(__dirname, '..')
const GATHER_DIR = process.env.GATHER_DIR ? path.resolve(process.env.GATHER_DIR) : path.join(REPO_ROOT, 'data/harmonization/gather/by_id')
const OUT_DIR = process.env.OUT_DIR ? path.resolve(process.env.OUT_DIR) : path.join(REPO_ROOT, 'data/harmonization/gather_slim')
const MACHINE_DIR = process.env.MACHINE_DIR ? path.resolve(process.env.MACHINE_DIR) : path.join(REPO_ROOT, 'data/harmonization/curation/machine')
const MARGIN = process.env.MARGIN != null ? parseInt(process.env.MARGIN, 10) : 3
const ONLY_IDS = new Set((process.env.IDS || '').split(',').map(s => s.trim()).filter(Boolean))
const VERIFY = process.argv.includes('--verify')

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
const idOf = (p) => { const m = /(\d+)/.exec(path.basename(p)); return m ? parseInt(m[1], 10) : null }
const bytes = (v) => Buffer.byteLength(JSON.stringify(v), 'utf8')

// The contradiction's cited targets: [{bolls, chapter, vstart, vend}] from refs_parsed.
function targetsOf(g) {
  const t = []
  for (const r of (g.refs_parsed || [])) {
    const bolls = String(r.bolls != null ? r.bolls : '').trim()
    let ranges = r.ranges
    if (typeof ranges === 'string') { try { ranges = JSON.parse(ranges) } catch (_) { ranges = [] } }
    for (const rg of (ranges || [])) {
      if (!Array.isArray(rg) || rg.length < 3) continue
      const chapter = Number(rg[0]), vstart = Number(rg[1]), vend = Number(rg[2])
      if ([chapter, vstart, vend].some(Number.isNaN)) continue
      t.push({ bolls, chapter, vstart, vend })
    }
  }
  return t
}

// note_ref "SRC/bolls/chapter/verse" -> {bolls, chapter, verse} | null
function parseNoteRef(nr) {
  const p = String(nr || '').split('/')
  if (p.length < 4) return null
  const bolls = p[1].trim()
  const chapter = parseInt(p[2], 10)
  const verse = parseInt(p[3], 10)
  if (!bolls || Number.isNaN(chapter) || Number.isNaN(verse)) return null
  return { bolls, chapter, verse }
}

function keepNote(note, targets, margin) {
  // Filter ONLY on the note's own location (note_ref = SRC/bolls/chapter/verse).
  // NB: a note's `cites` holds the CONTRADICTION's target ref (why it was gathered),
  // not the note's own verse, so it must NOT be used to filter — every note "cites"
  // a target and that would keep the whole array.
  const nr = parseNoteRef(note.note_ref)
  if (!nr) return true // unparseable note_ref -> keep (conservative; 0 such in the corpus)
  for (const t of targets) {
    if (t.bolls && nr.bolls === t.bolls && nr.chapter === t.chapter &&
        nr.verse >= t.vstart - margin && nr.verse <= t.vend + margin) return true
  }
  return false
}

// Return {kept:[notes], dropped:int, no_targets:bool}
function slim(g, margin) {
  const notes = g.notes || []
  const targets = targetsOf(g)
  if (!targets.length) return { kept: notes.slice(), dropped: 0, no_targets: true } // no resolvable refs -> keep all
  const kept = notes.filter(n => keepNote(n, targets, margin))
  return { kept, dropped: notes.length - kept.length, no_targets: false }
}

function gatherFiles() {
  return fs.readdirSync(GATHER_DIR)
    .filter(f => f.endsWith('.json'))
    .filter(f => !ONLY_IDS.size || ONLY_IDS.has(String(idOf(f))))
    .map(f => path.join(GATHER_DIR, f))
    .sort((a, b) => idOf(a) - idOf(b))
}

// Used note_refs for an id, from its machine file's excerpts (the regression oracle).
function usedRefs(cid) {
  const mf = path.join(MACHINE_DIR, `${cid}.json`)
  if (!fs.existsSync(mf)) return null
  const m = readJson(mf)
  const s = new Set()
  for (const ex of (m.excerpts || [])) if (ex.full_note_ref) s.add(String(ex.full_note_ref).trim())
  return s
}

function doVerify() {
  const files = gatherFiles()
  const sweep = [0, 1, 2, 3, 5, 10]
  const covered = files.filter(f => fs.existsSync(path.join(MACHINE_DIR, `${idOf(f)}.json`)))
  console.log(`gather files: ${files.length} | covered (have a machine file): ${covered.length} | oracle = excerpt full_note_ref`)
  console.log(`\nMARGIN sweep — retention of USED notes + notes-array size reduction over the covered corpus:`)
  console.log(`margin | miss_ids | missed_used | not_in_gather | kept_notes% | notes_bytes_saved%`)
  let chosenMisses = []
  for (const margin of sweep) {
    let missIds = 0, missedUsed = 0, notInGather = 0
    let keptNotes = 0, allNotes = 0, origB = 0, slimB = 0
    const misses = []
    for (const f of covered) {
      const cid = idOf(f)
      const g = readJson(f)
      const used = usedRefs(cid) || new Set()
      const gatherRefs = new Set((g.notes || []).map(n => String(n.note_ref).trim()))
      const { kept } = slim(g, margin)
      const keptRefs = new Set(kept.map(n => String(n.note_ref).trim()))
      allNotes += (g.notes || []).length
      keptNotes += kept.length
      origB += bytes(g.notes || [])
      slimB += bytes(kept)
      let idMissed = false
      for (const r of used) {
        if (!gatherRefs.has(r)) { notInGather++; continue }   // pre-existing: used note absent from gather
        if (!keptRefs.has(r)) { missedUsed++; idMissed = true; misses.push(`${cid}:${r}`) } // real filter miss
      }
      if (idMissed) missIds++
    }
    const keptPct = allNotes ? (100 * keptNotes / allNotes) : 0
    const savedPct = origB ? (100 * (origB - slimB) / origB) : 0
    console.log(`${String(margin).padStart(6)} | ${String(missIds).padStart(8)} | ${String(missedUsed).padStart(11)} | ${String(notInGather).padStart(13)} | ${keptPct.toFixed(1).padStart(11)} | ${savedPct.toFixed(1).padStart(18)}`)
    if (margin === MARGIN) chosenMisses = misses
  }
  console.log(`\nAt the selected MARGIN=${MARGIN}: ${chosenMisses.length} real miss(es)` +
    (chosenMisses.length ? ` -> ${chosenMisses.slice(0, 20).join(', ')}${chosenMisses.length > 20 ? ' …' : ''}` : ' (every used note retained).'))
  console.log(`(not_in_gather = a used note whose note_ref is absent from the gather file entirely — a pre-existing data quirk, NOT a filter defect.)`)
  if (chosenMisses.length) { console.error(`\nFAIL: MARGIN=${MARGIN} drops ${chosenMisses.length} used note(s). Raise MARGIN.`); process.exit(1) }
  console.log(`\nPASS: MARGIN=${MARGIN} retains every used note that exists in the gather files.`)
}

function doWrite() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const files = gatherFiles()
  let origTot = 0, slimTot = 0, noTargets = 0
  for (const f of files) {
    const cid = idOf(f)
    const g = readJson(f)
    const { kept, dropped, no_targets } = slim(g, MARGIN)
    if (no_targets) noTargets++
    const out = Object.assign({}, g, {
      notes: kept,
      _slim: {
        generated_by: 'slimGather.js',
        margin: MARGIN,
        from_notes: (g.notes || []).length,
        kept_notes: kept.length,
        dropped_notes: dropped,
        no_targets_kept_all: no_targets,
        note: 'Notes filtered to the contradiction\'s cited book+chapter within +/-margin verses (deterministic, no LLM). Slice reconcile excerpts ONLY from these note texts; if you need a note that seems missing, fall back to gather/by_id/<id>.json.',
      },
    })
    const op = path.join(OUT_DIR, `${cid}.json`)
    fs.writeFileSync(op, JSON.stringify(out, null, 2))
    origTot += fs.statSync(f).size
    slimTot += fs.statSync(op).size
  }
  const savedPct = origTot ? (100 * (origTot - slimTot) / origTot) : 0
  console.log(`slimmed ${files.length} gather file(s) -> ${OUT_DIR} (MARGIN=${MARGIN})`)
  console.log(`  total bytes: ${origTot} -> ${slimTot}  (${savedPct.toFixed(1)}% smaller, ~${Math.round((origTot - slimTot) / 4)} input tokens saved per full pass)`)
  if (noTargets) console.log(`  ${noTargets} id(s) had no resolvable refs_parsed -> kept ALL notes (no reduction, logged as _slim.no_targets_kept_all=true)`)
  console.log(`  point the transform/dossier prompts at ${path.relative(REPO_ROOT, OUT_DIR)}/<id>.json; re-run with --verify anytime to re-assert the oracle.`)
}

if (VERIFY) doVerify(); else doWrite()
