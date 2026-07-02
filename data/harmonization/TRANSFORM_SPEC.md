# Harmonization excerpt TRANSFORM — agent instructions

> **The machine-transform leg now reads the distilled `TRANSFORM_CONTRACT.md`** — a compact,
> inference-only subset of the "TRANSFORM" half below (~⅓ the tokens). This file stays the
> authoritative human reference AND the contract the **T9 dossier** leg reads (the "Dossier
> sidecar leg — note + verse_pair" section near the end). Keep them in sync: change a
> transform rule here and mirror it in `TRANSFORM_CONTRACT.md`.

You are turning raw public-domain commentary notes into **verbatim, attributed,
pole-classified excerpt candidates** for the "In the commentators' own words"
surface. This is the machine pass over the mechanical sweep's output. Read this
whole file before producing anything.

## Owner decisions (settled 2026-06-14)

- **A — verification posture:** machine-excerpt + **sampled** audit (not human
  sign-off on every excerpt). Your output is the machine pass; a separate auditor
  agent (see `AUDITOR_SPEC.md`) then samples it for on-tension relevance,
  pole-label correctness, connective accuracy, and named-skeptic reality, on top
  of a mechanical floor that checks *every* excerpt for verbatim+PD+traceable.
- **B — discrepancy pole = "leave thin," refined by the curation guardrails:**
  Do **not** hand-source or manufacture verbatim PD critic *excerpts*, and do not
  build a critics corpus. BUT **thin ≠ blank.** A thin discrepancy pole carries
  the **439 model**: name the strongest *real* skeptic who actually engaged the
  passage and state their actual objection as an **attributed connective**
  (paraphrase — NOT a verbatim quote). If, on a real-contradiction row, no real
  skeptic can honestly be named, **flag the row for consensus relabel** — never
  leave a "genuine contradiction" pole filled only by harmonizers.

## The charter (non-negotiable)

This surface is a **faithful, accurate-to-source surface of public-domain
commentary** — NOT a neutral page, NOT an apologetic device. You SURFACE what the
commentators actually said; you do NOT adjudicate whether an argument "works."

1. **Verbatim only (excerpts).** `excerpt_text` must be copied
   character-for-character from the note's `text` field. You may:
   - trim to the on-tension sentence(s);
   - join non-adjacent sentences with an ellipsis `…` (U+2026) **only when the
     join preserves the author's sense** — never splice to manufacture a meaning;
   - normalize typography that does not change the words: straight↔curly quotes,
     collapse whitespace runs, em-dash typeset as `--` → `—`, and a French-spaced
     `" :"` → `":"`. (These are the only allowed deviations; the audit equalizes
     exactly these and nothing else.)
   You may NOT paraphrase, summarize, "clean up" grammar, add words, or write a
   sentence that is not present verbatim in the source note. **This rule governs
   `excerpt_text` only** — `connective` lines are authored prose (see below).
2. **Attributed + dated.** Attribution is resolved from `source_code` via the
   `voices` codebook downstream, so each excerpt carries only `source_code` (plus
   the verbatim text, `full_note_ref`, `verse_ref`); do **not** copy author / work /
   year / attribution / license onto the excerpt. Every **named skeptic**, by
   contrast, is a free person not in the codebook — carry their name / work / year /
   attribution in full.
3. **On-tension or nothing.** Keep only sentence(s) that speak to THIS
   contradiction's specific tension (use `question` + `summary`). A note that only
   explains the verse generally, with nothing about the conflict, yields **NO
   excerpt** — that is correct, not a miss. Better empty than padded.
4. **Never manufacture a pole, never co-opt one.** Do not stretch a harmonizing
   note into a "discrepancy," or vice versa. Do not fill a real-contradiction
   pole with harmonizers (see guardrails 2/4).

## Curation guardrails (must hold at scale)

These five are the acceptance bar. The auditor checks all five.

1. **On-tension quotes only** — not generic verse-notes. (Same as charter rule 3.)
2. **Don't let the leaning pole be out-quoted by the other side (count parity).**
   The `lean` pole's content count must be **≥** the other pole's. Count = one
   per verbatim excerpt + one if the pole carries a named-skeptic connective. On
   a `discrepancy_first` row this means **cap reconcile excerpts** so they do not
   exceed the discrepancy pole — usually surface the single **strongest**
   harmonization, not a wall of three.
3. **A thin/empty pole is never blank** — cite the strongest skeptic who actually
   looked (the **439 model**): name them, give their real objection as an
   attributed connective. (Even when, as in id 439, the leading skeptic *concedes*
   — say so, attributed.)
4. **Never co-opt a "real contradiction" pole with harmonizers.** On a
   `discrepancy_first` row the discrepancy pole must carry a real critic (439
   model) — or, if none can honestly be named, set `relabel_flag` and say why.
5. **Every filled pole gets a short connective half-line** so it *argues*, not
   just quotes — one authored sentence (≤ ~25 words) framing what the quotes do.

## Pole classification

- **reconcile** — the excerpt treats the two passages as compatible / explains the
  apparent conflict away (harmonizes, distinguishes senses, both-true reading).
- **discrepancy** — the excerpt concedes/asserts the passages genuinely conflict.
  A *verbatim* discrepancy excerpt only exists when a **gathered note itself**
  concedes (rare). Otherwise the discrepancy pole is carried by the **named-skeptic
  connective** (439 model), which is authored, not a verbatim quote.
- A note purely descriptive, taking no stance on the tension → no excerpt.

## Scoring, selecting & parity

- Prefer the **fewest** sentences that carry the on-tension point (1–3).
- `reconcile_first` rows: keep the **strongest 1–3** reconcile excerpts (distinct
  voices preferred; no near-duplicates).
- `discrepancy_first` rows: **parity-cap reconcile** — surface only as many
  reconcile excerpts as the discrepancy pole carries (usually 1, the strongest),
  so the leaning pole is not out-quoted (guardrail 2).
- Only emit ≥2 reconcile voices where they genuinely exist — never fabricate to
  balance.
- A note flagged `"anchor_block": true` is block-anchored (e.g. K&D); the
  on-tension sentence may be deep inside the block.

## Output

For each contradiction write **one JSON file** to
`data/harmonization/curation/machine/<id>.json` with exactly this shape:

```json
{
  "contradiction_id": 425,
  "row": {
    "lean": "discrepancy_first",
    "reconcile": {
      "status": "filled",
      "connective": "Defenders read the two commands as one mission in stages — Israel first, then all nations after the cross.",
      "skeptic": null,
      "empty_note": null
    },
    "discrepancy": {
      "status": "named_skeptic",
      "connective": "The sharpest objection is pressed by D. F. Strauss, who argues the Jews-only command and the universal commission cannot both stand as given.",
      "skeptic": {
        "name": "D. F. Strauss",
        "work": "The Life of Jesus Critically Examined",
        "year": "1846",
        "attribution": "D. F. Strauss (d. 1874), The Life of Jesus Critically Examined (1846)"
      },
      "empty_note": null,
      "relabel_flag": false,
      "relabel_reason": null
    }
  },
  "excerpts": [
    {
      "pole": "reconcile",
      "source_code": "JFB",
      "verse_ref": "Matthew 10:6",
      "excerpt_text": "…verbatim sentence(s) from the note…",
      "full_note_ref": "JFB/40/10/6",
      "on_tension_rationale": "Why this is on-tension (machine note, NOT shipped).",
      "verify_state": "machine"
    }
  ],
  "deeper_learning": {
    "defense": {
      "pd_work": {
        "resource": "John Haley, An Examination of the Alleged Discrepancies of the Bible (1874)",
        "author": "John Haley",
        "year": "1874",
        "note": "Haley treats this passage directly under the harmonizing tradition."
      },
      "link": {
        "url": "https://www.gotquestions.org/...",
        "domain": "gotquestions.org",
        "title": "GotQuestions: …this contradiction…",
        "note": "live apologetic treatment"
      }
    }
  }
}
```

Field rules:
- **Excerpts (lean)** — emit `pole`, `source_code`, `verse_ref`, `excerpt_text`,
  `full_note_ref`, `on_tension_rationale`, `verify_state` only. `source_code` and
  `full_note_ref` come straight from the source note (`src` / `note_ref`); do **not**
  copy author / work / year / attribution / license — those resolve from
  `source_code` via the `voices` codebook downstream — and do **not** repeat
  `contradiction_id` per excerpt (it is the file's top-level id).
  `on_tension_rationale` is private (not shipped).
- `lean`: `reconcile_first` **only** when `consensus` is `probable_harmonization` or
  `apparent_only`; every other value (`genuine_contradiction`, `probable_contradiction`,
  `genuinely_disputed`, null/unmapped) is `discrepancy_first` — matching the §7 rule the
  validator/dossier/baker use (so `genuinely_disputed` is discrepancy-leaning and its
  reconcile pole is parity-capped).
- **Pole `status`:**
  - `filled` — ≥1 verbatim excerpt on this pole. **Must** have a `connective`.
  - `named_skeptic` — no verbatim excerpt, but a real skeptic is named with their
    objection in `connective` + `skeptic` (the 439 model). The thin-pole default.
  - `empty` — genuinely nothing. On a `discrepancy_first` row this is **only**
    allowed with `relabel_flag: true` + a `relabel_reason` (guardrail 4). On a
    `reconcile_first` row, use it only when no skeptic engaged at all (rare;
    prefer `named_skeptic`); supply a plain `empty_note`.
- **`connective`** (guardrail 5): required on every `filled` pole and every
  `named_skeptic` pole. One authored sentence framing the point — accurate to the
  excerpts/objection it introduces, on-tension, **no overclaiming** (do not say a
  quote "dissolves the wording difference" if it only addresses the label — that
  is the id-470 failure the auditor catches).
- **`skeptic`** (guardrail 3): required on `named_skeptic` poles — a *real* person
  who actually engaged this passage, accurately represented. Never invent a critic
  or a position. If the strongest skeptic actually *concedes* (439), say so.
- **`relabel_flag` / `relabel_reason`** (guardrail 4 fallback): set true only when
  a `discrepancy_first` row has no honestly-nameable skeptic and only harmonizers.
  You do **not** change the DB — the flag routes the row to a human to decide
  whether the consensus label is overstated.

## Deeper-learning exits — defense side (backlog #36)

Three personas (Dana, Hannah, the Inerrantist) independently flagged that **every
"go deeper" exit on the page serves the critic** — the SAB outbound link and the
skeptic essay sources — with **no apologetic/defense path**. You generate the
missing defense-side exit so the deeper-learning routes are balanced, not
critic-only.

**Owner policy (settled 2026-06-14): PD work + curated live link** — see
`deeper_learning_policy.json`. Emit `deeper_learning.defense` per contradiction
with two parts, mirroring the critic side's essay-source + SAB-outbound pair:

- **`pd_work` (REQUIRED)** — a **real, attributed** public-domain defense/harmonizing
  work that treats **this specific** contradiction. Canonical default: **John
  Haley, *An Examination of the Alleged Discrepancies of the Bible* (1874)** (the
  PD counterpart to the skeptic essays); a harmonizing commentator surfaced on the
  row, keyed to the passage, also qualifies. This is the textual anchor — never
  omit it.
- **`link` (OPTIONAL)** — one **live** apologetics page whose domain is on the
  allowlist (`gotquestions.org`, `carm.org`, `defendinginerrancy.com`; owner edits
  the list in `deeper_learning_policy.json`). Include it only when you can cite a
  real, on-topic page from an allowlisted domain; otherwise omit `link` / set `url`
  null. **Never guess or fabricate a URL or an off-allowlist domain.**

Same reality bar as the named skeptic: the auditor verifies both `pd_work` and any
`link` are real and on-topic; the harness flags a missing `pd_work` or an
off-allowlist link domain.

## Input

Per-contradiction input is `data/harmonization/gather/by_id/<id>.json`:
`question`, `summary`, `consensus`, parsed refs, a `voices` codebook, and a **lean**
`notes[]`. Each note is `{src, ref, note_ref, cites, text}` (plus `anchor: true`
when block-anchored; absent ⇒ false):

- `src` — the voice code. Resolve its author / work / year / attribution / license
  from `voices[src]` in the codebook (this is what feeds the surface's attribution).
- `ref` — the display verse (e.g. `Matthew 10:6`).
- `note_ref` — the `full_note_ref` to copy verbatim onto the excerpt.
- `cites` — which cited reference(s) this note answers.
- `text` — the verbatim note (the only place to draw `excerpt_text` from).

Work the **excerpts** only from those notes. The **named skeptic** (439 model)
comes from your own scholarship about who actually pressed this contradiction —
name only critics you are confident are real and are representing fairly; the
auditor will check.

## Self-check before you finish

1. Every `excerpt_text` is a verbatim substring of its note (minus the allowed
   normalizations / `…` joins).
2. Parity holds: the `lean` pole's content count ≥ the other pole's.
3. Every `filled`/`named_skeptic` pole has a `connective`; no connective overclaims.
4. The discrepancy pole is never blank: `filled`, or `named_skeptic` with a real
   skeptic, or `empty` + `relabel_flag` (discrepancy_first only).
5. No invented critic, no strawmanned objection.

---

## Dossier sidecar leg — note + verse_pair (going forward)

This is a **second, separate agent contract**, layered on top of the machine
transform above. It does not replace anything above — it authors a *sidecar*
file, `data/harmonization/curation/dossier/<id>.json`, in the **SPEC §3.2
camelCase** shape that `.scripts/buildHarmonizationTables.js` reads and
`.scripts/validateHarmonization.js`'s `validateProjection()` gates. Read
`docs/SPEC-contradictions-605-sweep.md` §3.2/§3.3/§7/§10/§11 for the
canonical numbering these rules cite; this section restates every rule you
must satisfy as an authoring instruction, each one traceable to a named check
in `validateHarmonization.js`.

**Naming.** Call this the **"note + verse_pair" leg**, informally **T9**. A
**separate, later** leg — **T10** — hand-sources verbatim discrepancy
(critic) quotes. `buildHarmonizationTables.js`'s header comment currently
labels the whole dossier file generically "T5/T6"; this section's T9/T10
split is the authoritative, more precise breakdown going forward — T9 is
strictly narrower than "the whole dossier."

### THE SCOPE BOUNDARY — read this before writing anything

T9 (this leg) authors **only**:
- `reconcile.note` — always, when the row's machine reconcile pole has ≥1
  excerpt (the near-universal case).
- `discrepancy.note` — **only** if the discrepancy pole already carries
  quotes (in practice this is never true for a fresh T9 pass — T9 never adds
  discrepancy quotes itself; see below). Otherwise `null`.
- `versePair.sides[]` — always, for every id in scope.
- `discrepancy.emptyNote` + `discrepancy.emptyNoteAttr` — the honest-absence
  ("439 model") pairing, authored **only on a reconcile-leaning row** (see
  Lean below). **Never** on a discrepancy-leaning row.
- Optionally `reconcile.halfLine` / `discrepancy.halfLine` per §11.

T9 **never**:
- Writes anything into `reconcile.quotes` or `discrepancy.quotes` — both are
  **always emitted as `[]`** by this leg. Reconcile quotes are supplied
  automatically by the baker from `curation/machine/<id>.json` (you do not
  duplicate them into the dossier). Discrepancy quotes are **T10's job
  exclusively** — hand-sourcing a real, verbatim PD critic quote. T9 does not
  search for, transcribe, or stage discrepancy quotes, even as a draft.
- Touches any `.db` file (`contradictions.db`, `bible_reference.db`,
  `reviews.db`) — read `bible_reference.db` **read-only** for verse text
  only (see Verse-pair sourcing below); never open it for write.
- Touches `curation/machine/<id>.json` — read it, never edit it.
- Fabricates a verse, a snippet, a note, or an attribution. Every fact in a
  dossier file must be independently verifiable: notes condense excerpts you
  can point to in `curation/machine/<id>.json`; verse snippets are queried
  live from `bible_reference.db`; an honest-absence attribution names a real
  person and a real work.

**Consequence you must accept, not fix:** on a **discrepancy-leaning** row
(the machine file's `row.discrepancy.status` is typically `named_skeptic`,
i.e. still awaiting a real hand-sourced critic quote), T9 emits
`reconcile.note` + `versePair` and leaves the **entire discrepancy pole
null** (`note`, `halfLine`, `emptyNote`, `emptyNoteAttr` all `null`,
`quotes: []`). Running `buildHarmonizationTables.js` in `DRY_RUN` over such a
row will report a `parity_count` violation (the leaning discrepancy pole has
0 baked quotes against the reconcile minority's ≥1) — **this is expected and
deferred to T10, not a T9 defect.** Do **not** try to silence it by setting
`discrepancy.emptyNote` on a discrepancy-leaning row — that specific move
trips a *different*, worse violation (`parity_leaning_is_empty`: the
validator's rule that the leaning pole may never be the honest-absence pole,
because a "genuine contradiction" row cannot be quietly waved off as
absence-of-critics). Leave it null and move on; only `reconcile.note` +
`versePair` are this leg's deliverable on such a row.

### Determining the row's lean (§7)

Use the **same rule the validator uses**, not a guess: reconcile-first
(`reconcileFirstFor` in `validateHarmonization.js`) is `true` **only** when
the contradiction's `scholarly_consensus_levels.name` is
`probable_harmonization` or `apparent_only`; every other value
(`genuine_contradiction`, `probable_contradiction`, `genuinely_disputed`,
`null`/unmapped) is discrepancy-first. The `consensus` field already
resolved in `data/harmonization/gather/by_id/<id>.json` is the convenient
read — cross-check it against `curation/machine/<id>.json`'s `row.lean`
(they should agree; `row.lean: "reconcile_first"` should imply
`consensus` ∈ {`probable_harmonization`, `apparent_only`}). If they disagree,
trust the consensus-derived rule (the validator's ground truth), not the
machine file's label, and say so in your own status output.

### `reconcile.note` — authoring rule (checks: `note_present`, `note_register`, `note_verbatim`, `note_lead_source`)

1. Write it whenever `curation/machine/<id>.json`'s `excerpts[]` has ≥1
   entry with `"pole": "reconcile"` (this is true for nearly every row — the
   PD commentary corpus is overwhelmingly harmonizing). **If it has zero
   reconcile excerpts** (the machine file's `row.reconcile.status` is
   `"empty"` or `"named_skeptic"` — rare), set `reconcile.note: null`
   instead of inventing one (`note_present` fails if a 0-quote pole carries a
   non-null note). If this happens on a **reconcile-leaning** row, flag it in
   your status output rather than silently proceeding — a reconcile-leaning
   row with no reconcile content at all is a data anomaly, not a case to
   paper over with an honest-absence note on the leaning pole (forbidden —
   see the scope boundary above).
2. One sentence, ≤180 chars, ends with `.`, no interior `". "` (no second
   sentence), pre-trimmed (no leading/trailing whitespace) (`note_register`).
3. No trailing date/citation tail — do not end the note with a bare
   `(1874).`-style parenthetical year, or a `, on Genesis 1:3.`-style verse
   citation (the regexes the validator runs are literally
   `/\(\d{3,4}\)\s*\.?$/` and `/,\s*on\s+[1-3]?\s*[A-Za-z.]+\s+\d+:\d+\.?$/i`
   — don't just copy the attr's dated tail into the note) (`note_register`).
4. Blocklist-clean — none of these words/phrases, case-insensitive, whole
   word: `attempt`, `explains away`, `contrived`, `forced`, `of course`,
   `fatal`, `decisively`, `obviously`, `merely`, `so-called`, `desperate`,
   `absurd` (`note_register`).
5. **Condense, don't copy.** The note must NOT be a verbatim slice of any of
   the pole's baked quote texts (machine excerpts + any dossier reconcile
   quotes, though the latter is always empty for T9) — write it in your own
   words as a compressed paraphrase of what the excerpt argues
   (`note_verbatim`).
6. **Name a lead author from the pole's own excerpts** (`note_lead_source`).
   Concretely: pick the strongest/most representative reconcile excerpt
   (often `ord`/array position 0 in `curation/machine/<id>.json`'s
   `excerpts[]`, or whichever states the harmonization most directly), read
   its `source_code`, resolve the author's name via the `voices` codebook in
   `gather/by_id/<id>.json` (or `curation/machine/<id>.json`'s own `author`
   field on that excerpt), and use that author's surname (or the source's
   commonly-known short name, e.g. "Clarke", "Gill", "Henry", "Keil &
   Delitzsch", "the Geneva annotators") somewhere in the note's prose. The
   check is a case-insensitive substring match against tokens parsed from the
   baked `attr` head (`DOSSIER_ATTR_HEAD_RE`), so a plain surname mention is
   sufficient — you do not need to reproduce the full attribution string.
   Example (id 4): excerpt from CLARKE → note "Clarke distinguishes the
   diffused day-one light from the sun and stars later constituted as its
   light-bearers on day four."

### `discrepancy.note` — authoring rule

In a fresh T9 pass this is **always `null`**, because T9 never adds
discrepancy quotes and `note_present` requires `note` to be null when the
pole has 0 quotes. Only write a non-null `discrepancy.note` if you are
re-running T9 over a row where a **prior T10 pass has already populated**
`discrepancy.quotes` in the existing dossier file — in that case, apply the
identical rules 2–6 above (register, blocklist, condense-don't-copy,
name-the-lead-author) but against the discrepancy pole's own quotes.

### Honest-absence — the 439 model (checks: `parity_leaning_is_empty`, `empty_note_attr`)

**On a reconcile-leaning row only:** populate
`discrepancy.emptyNote` + `discrepancy.emptyNoteAttr` (both non-null,
paired — `empty_note_attr` fails if only one is set) naming the strongest
**real** skeptic/critic who has actually engaged this specific passage —
even if (especially if) that skeptic ultimately concedes or reconciles it
themselves, as in id 439 (D. F. Strauss "certainly striking"). Treat
`curation/machine/<id>.json`'s `row.discrepancy.skeptic` /
`row.discrepancy.connective` as a **candidate starting point**, not a
transcription source — verify it independently (WebSearch/WebFetch) and feel
free to name a *different*, better-attested critic if your own research
turns up a stronger fit (this is what happened between id 439's machine pass,
which named Steve Wells, and its dossier, which names D. F. Strauss instead —
both real, the dossier's is the more scholarly-load-bearing choice). Never
invent a critic or a position they didn't hold. If, after genuine effort, no
real critic can be honestly named, leave
`discrepancy.emptyNote`/`discrepancy.emptyNoteAttr` both `null` and flag the
row in your status output — do **not** fabricate to fill the pair.

**Never on a discrepancy-leaning row** — `parity_leaning_is_empty` exists
specifically to catch a leaning ("genuine contradiction") pole being quietly
waved off as absence-of-critics; that pole's resolution is T10's real quote,
not an honest-absence shortcut.

**Pairing mechanics:** `emptyNote` is the prose sentence (register rules do
**not** formally apply to `emptyNote` the way they do to `note` — no
150-char/no-blocklist machine check exists for it — but write it in the same
disciplined, one-thought register anyway); `emptyNoteAttr` is that critic's
`Author (date), Work (year).`-shaped attribution (§3.3 head format, so a
later `attr_head`-style parse would succeed on it too, even though
`attr_head` itself only runs over `quotes[]`).

### `versePair.sides[]` — authoring rule (checks: `vp_ellipsis`, `vp_ref`, `vp_distinct`, `vp_order`, `vp_wordcount`, plus the independent `verifyVersePairs.py` verbatim floor)

Always author exactly **two** sides — the two in-tension verses the
contradiction actually cites.

1. **Pick the two verses.** Read `gather/by_id/<id>.json`'s `refs_parsed`
   (each entry: `{ raw, book, bolls, ranges: [[chapter, verseStart,
   verseEnd?]] }`). Most contradictions cite exactly two `refs_raw` entries —
   one per side. For each, pick the **single** chapter:verse within its
   range that most directly states the point of tension (not automatically
   the first verse of the range — id 4 picked Genesis **1:5** from a cited
   1:4-5 range because that is where "day"/"night" are actually named, and
   Genesis **1:16** from a cited 1:16-19 range because that is where the two
   lights are made). If more than two refs are cited, still choose only the
   sharpest, most central pair — the schema is always exactly two sides.
2. **Resolve the book to a bolls number** via
   `data/harmonization/books_map.json`'s `aliases` map (lowercase key →
   1..66; Genesis=1 … Malachi=39, Matthew=40 … Revelation=66). Use the book's
   full canonical name in the emitted `ref` (e.g. `"Genesis"`, `"Matthew"`,
   `"1 Corinthians"`), matching the golden examples' style — abbreviations
   also resolve via aliases but canonical names read better and are what
   every existing dossier uses.
3. **`ref` format** — a single clean `Book chap:verse` citation: no `/`, no
   `,`, no range dash, no trailing period (`vp_ref`'s format regex is
   `^(?:[1-3]\s+)?[A-Za-z][A-Za-z.]*(?:\s+[A-Za-z]+)*\s+\d+:\d+$`). It must
   also **resolve** via the books_map aliases — a well-formed but
   unrecognized book token also fails `vp_ref`.
4. **Fetch the verse text — read-only, from `bible_reference.db`.** Run a
   short read-only query from the repo root (mirrors
   `.scripts/verifyVersePairs.py`'s own approach — stdlib `sqlite3`, no
   sql.js, no full-file load):
   ```
   python -c "
   import sqlite3
   conn = sqlite3.connect('file:./bible_reference.db?mode=ro', uri=True)
   cur = conn.cursor()
   row = cur.execute(
       \"SELECT text FROM translations WHERE version_code='WEB' AND book=? AND chapter=? AND verse=?\",
       (BOOK, CHAPTER, VERSE)).fetchone()
   print(row[0] if row else 'NOT FOUND')
   "
   ```
   substituting the resolved bolls number / chapter / verse. This is the
   **only** source for `snippet` and `verseText` — never paraphrase, never
   quote from memory, never use a different translation.
5. **`verseText`** = the exact full WEB verse text returned by the query,
   copied verbatim (this is `verifyVersePairs.py`'s re-check field: it
   re-fetches the same row and asserts your `verseText` matches after
   `norm()` — whitespace/quote/dash normalization only, no wording changes
   tolerated).
6. **`snippet`** = a verbatim substring of that verse, **< 40 words**
   (`vp_wordcount` fails at ≥40). Often the entire (short) verse verbatim, as
   in both golden examples. If you truncate/elide internally, use **only**
   U+2026 `…` — never ASCII `...` or `..` (`vp_ellipsis` rejects any run of
   ≥2 literal dots). Each fragment either side of an elision must itself be
   a verbatim substring of the verse, in the same order it appears in the
   source (the floor checks presence, not order, but author it honestly
   anyway — never splice fragments out of sequence to manufacture a reading).
7. **Distinctness** — the two sides' snippets must not be identical after
   normalization (curly/straight quotes, dash unification, whitespace
   collapse) (`vp_distinct`). This is essentially automatic once you've
   picked two genuinely different verses.
8. **Canonical order, not lean order** (`vp_order`). Sort the two sides by
   `(bolls, chapter, verse)` ascending — Old Testament before New, lower
   book number first, then chapter, then verse — and set `ord: 0` on the
   earlier one, `ord: 1` on the later one, **regardless of which pole
   (reconcile/discrepancy) either verse supports**. Two verses in the same
   book compare by chapter then verse (id 3: Genesis 1:16 before Job 38:7 —
   different books, Genesis(1) < Job(18); id 4: Genesis 1:5 before Genesis
   1:16 — same book, verse 5 < 16).

### `halfLine` — optional, §11 (checks: `halfline_blocklist`, `halfline_opposing_author`)

Only author a `halfLine` when it adds a genuinely useful one-sentence
descriptive gloss beyond the `note` (most rows should ship `halfLine: null`
on both poles — see how sparingly the golden examples use it: id 4 and 439
ship `null` on both poles; only id 3 uses it, and only because that row
needed a rewritten, self-referential replacement for a previously
opposing-pole-referencing line). If you do author one:
- It describes **only its own pole's** reading — never a comparison,
  concession, or qualifier about the *other* pole. "This pole reads Job's
  morning stars as an angelic host present at creation, not literal stars
  formed on Genesis' fourth day" (id 3, reconcile) is self-contained; it
  does not say anything like "...though the discrepancy pole is stronger."
- Blocklist-clean, same word list as notes (`halfline_blocklist`).
- Must **not** name any author who appears in the **opposing** pole's baked
  quotes (`halfline_opposing_author` — this is the mechanism that retired
  id 3's old "...even though its authors were themselves harmonizers"
  concessive, which named a reconcile-pole author from inside the
  discrepancy half-line).
- A `halfLine` may be authored on a pole even when that pole's `note`/quotes
  are otherwise empty (it is independent of the note/quote-count machinery),
  but per the scope boundary above, T9 still never authors a discrepancy
  `halfLine` on a discrepancy-leaning row — leave that pole fully null and
  defer to T10.

### `covered`

Emit `"covered": 1` unless you have an explicit reason to withhold the row
(there is none in T9's normal path — `covered: 0` is an authored-but-withheld
escape hatch documented in `buildHarmonizationTables.js`'s header, not
something this leg sets proactively).

### Self-check before you finish (T9)

1. `reconcile.quotes` and `discrepancy.quotes` are both `[]` (T9 never
   populates either).
2. `reconcile.note` is non-null iff `curation/machine/<id>.json` has ≥1
   reconcile excerpt; `discrepancy.note` is `null` (unless a prior T10 pass
   already populated discrepancy quotes on this id).
3. On a reconcile-leaning row: `discrepancy.emptyNote` +
   `discrepancy.emptyNoteAttr` are both set (or both `null` with a flagged
   reason), never just one.
4. On a discrepancy-leaning row: the entire `discrepancy` object is null
   fields + `quotes: []` — nothing invented to force a pass.
5. Every note is one sentence, ≤180 chars, blocklist-clean, not a copied
   slice, and names an author present in its own pole's baked quotes.
6. `versePair.sides` has exactly two entries, canonically ordered, distinct,
   each a verbatim WEB substring (< 40 words) with a matching `verseText`,
   `ref` resolvable via `books_map.json`.
7. **Run the gate and fix everything it flags**, except `parity_*` on a
   confirmed discrepancy-leaning row:
   ```
   DRY_RUN=1 IDS=<id>[,<id>,…] node .scripts/buildHarmonizationTables.js
   ```
   Read the `Validator:` section of the output. Resolve every `note_*` /
   `vp_*` / `empty_note_attr` / `halfline_*` violation before considering the
   id done. A `parity_leaning_is_empty` or `parity_count` violation on a row
   you have confirmed is discrepancy-leaning is **expected — deferred to
   T10** — log it as such rather than trying to force it green (see the
   scope boundary above for why forcing it green is actively wrong, not just
   unnecessary).
