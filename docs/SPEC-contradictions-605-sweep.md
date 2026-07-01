# SPEC — scaling the verbatim-PD both-poles surface to all ~605 contradictions

**Status:** BUILD SPEC. Promotes and **supersedes** `docs/BRIEF-contradictions-605-sweep.md` as the
build document (the brief remains the planning/ruling record). Green-lit architecture + the four
owner rulings (2026-06-30) folded in. This is the buildable contract for **task #32** (the data
sweep) + the machinery that feeds it. **No harmonization row is authored until this SPEC lands —
which it now has, so authoring may begin under the phasing in §12.**

> **Ownership split (owner, 2026-07-01).** The CONTENT is enriched **out-of-band**: an external effort
> produces the three baked `harmonization_*` tables **already populated in `contradictions.db`**. So
> **§3 (curation store), §5 (baker), and §10's gate machinery are the EXTERNAL tool's scope** — it owns
> authoring + validation. **GEBible's in-repo scope (task #32) narrows to §4 (the table schema — the
> shared interface contract both sides MUST match byte-for-byte), §6 (re-point the two consumers), and
> §7 (the `reconcileFirstFor` flip).** Because the §10 validator no longer runs in-repo, GEBible reads
> the tables **defensively** — graceful-null on absent/empty tables, all output ESCAPED — and keeps the
> pilot in-memory map (`HARMONIZATION_PANELS` / `VERSE_PAIR_SNIPPETS`) as a **fallback until the external
> delivery reliably includes all rows** (so nothing blanks before the enriched DB is provisioned). §4 is
> the seam; §3 / §5 / §8 / §10 / §12 below now read as the **external producer's** spec.

**What this scales.** The verbatim public-domain both-poles surface specced in
[`SPEC-pd-both-poles-surface.md`](SPEC-pd-both-poles-surface.md) and shipped on the 7 pilot ids
(**3, 4, 189, 439, 459, 468, 496**), out to the full contradictions corpus (605 rows,
`recommend_delete = 0`; ~598 not yet paneled). The pilot is the quality bar (all four reader
personas ratified it); the sweep must hit that bar at volume without diluting it.

**Companion canonical docs (do not restate — obey):**
- `SPEC-pd-both-poles-surface.md` — the per-pole data shape (§G, incl. `note` at §G.6), the locked
  attribution format (§D.2), the empty-note model (§E.1), the half-line rule (§E.2), the render
  contract, the leak/neutrality guards. **Unchanged except where §7 of THIS spec supersedes its §C
  pole-order tie-break.**
- `src/content/contradictions-harmonization.js` — the pilot proof-of-shape (the 7 ids + the pure
  helpers). This sweep externalizes its DATA to a build store; the pure helpers stay.

---

## 1. The load-bearing invariant

**Verified curation is a build INPUT; `contradictions.db` is a build OUTPUT; nobody hand-edits the
shipped DB.**

Grounded correction to the brief: **`data/contradictions.db` is gitignored** (`.gitignore`
`data/**/*.db`) and provisioned out-of-band from `data/contradictions_db/contradictions.sql` via
`data/contradictions_db/buildDbFromSql.js` (that whole dir is gitignored too). So the baked
harmonization tables *also* ship out-of-band, regenerated on every provision. The **committed,
reviewable, diff-legible source of truth for all harmonization content is the curation store (§3)**,
never the DB. This is the same discipline the science corpus uses (`data/bible_science_db/seed.json`
→ `bible_science.db`) and the same failure it guards against: a hand-edit to the shipped DB is silently
blown away on the next provision (the #77 silent-staleness lesson). The pilot's hand-authored
`HARMONIZATION_PANELS` / `VERSE_PAIR_SNIPPETS` maps are the proof-of-shape; the sweep migrates that
data into the curation store and re-points the consumers at the baked tables.

---

## 2. Data sources (verified 2026-07-01 — corrects the brief)

| store | role | verified state |
|---|---|---|
| `data/contradictions.db` (gitignored) | `contradictions` (605 rows) / `answers` / `bible_references` — the cited verses + the lean. Also the **OUTPUT** home of the baked `harmonization_*` tables (§4). | `contradictions` carries **`scholarly_consensus_id`** (FK → `scholarly_consensus_levels`), NOT a `consensusLevel` string. The route/model resolves it to `scholarly_consensus_levels.name` — the string `reconcileFirstFor` consumes. `notoriety_level` (1–5) and `textual_variant_involved` are present and used below. |
| `data/bible_reference.db` (gitignored) | **the machine-excerpt source** for the reconcile pole. `verse_commentaries` + `text_sources` + `licenses`. | See the two corrections below. |
| `data/study-bundle.db` | Not required. The book-name→number bridge is resolvable offline from the existing `src/data/canon` module; do **not** take a runtime dependency on the 175 MB bundle. | Book numbering in `verse_commentaries` is **KJV 1–66 canonical** (verified: Gen=1, Job=18, Matt=40, Luke=42, John=43 all retrieve the pilot quotes verbatim). |

**Correction 2a — the usable PD English commentary set is six, not seven.** Distinct
`verse_commentaries.source_code` values that are (a) English, (b) public-domain, and (c) within the
locked `ERA_FRAME` ("1600s–1900s"): **GILL, JFB, CLARKE, KD, MHC, GNV**. The brief listed **TYN**,
but `text_sources.TYN` = *"Tyndale Open Bible Commentary"* — a **modern** work. It breaks both the
era frame and the PD-only contract of this surface. **Exclude TYN here** (it is legitimate on other
GEBible commentary surfaces, not on this one). The DB also carries medieval **Jewish CC0** voices
(RASHI, RAMBAN, IBNEZRA, RADAK, SFORNO) — usable content, but their authors (1040–1550) fall *outside*
the "1600s–1900s" era-frame line, so they are **out of scope for this era-framed surface** (widening
`ERA_FRAME` is a separate owner decision, not part of this sweep). All six in-scope sources are `PD`
(`licenses.PD`: attribution not required — we attribute anyway per §D.2).

**Correction 2b — K&D is BLOCK-keyed and sparse; the exact-verse excerptor will miss it.** Verified:
the pilot's K&D "actual stars" text is stored at `verse_commentaries` `KD / Job(18) / 38 / **4**`
(the 38:4–7 block), and its "elementary light" text at `KD / Gen(1) / 1 / **2**` (the "First Day"
block) — **not** at the cited 38:7 / 1:3. KD only holds block-start verses (Gen 1 = {1,2,6,9,14,20,24}).
So a `SELECT … WHERE book=? AND chapter=? AND verse=?` returns **nothing** for K&D at a cited verse.
**Consequence for §5/§8:** the machine-excerptor MUST, for block-commenting sources (KD, and empirically
JFB/MHC comment in ranges too), **scan the chapter and locate the block/passage that contains the cited
verse**, not key on the exact verse. Any quote whose block cannot be located deterministically falls to
the **hand-authored** lane (T1, §8). The brief's "bible_reference.db … has K&D" is true but misleading:
K&D is present, sparse, and block-keyed.

**The discrepancy (critic) pole is not in this DB.** `verse_commentaries` is overwhelmingly
harmonizing PD commentary. PD *critics* (Strauss / Paine / Ingersoll / Colenso …) are hand-sourced
into the curation store — that is ruling #2 (§9).

---

## 3. The curation store (the build INPUT)

### 3.1 Sharding decision — per-CATEGORY JSON shards (justified)

The store is **committed JSON, sharded one file per `categories` row** (9 shards), living in a **new
committed directory `data/contradictions_harmonization/`**:

```
data/contradictions_harmonization/
  schema.sql                 # the 3 baked tables (§4)
  build-harmonization.mjs    # the baker (§5)
  validate-harmonization.mjs # the machine-gate runner reused by the baker + the test (§10)
  rows/
    01-<category-slug>.json   # keyed by contradiction id; one file per categories.id
    02-<category-slug>.json
    … (9 files)
  pd-critics-well.json       # the incrementally-grown PD-critic source index (§9)
  verification-ledger.json   # per-quote human sign-off records (§8)
  DATABASE.md                # provenance + how-to-rebuild
```

**Why per-category, not per-id or monolith:**
- *Per-id* (~605 files) buries real changes in tree noise and does not match how a curator works.
- *Monolith* is unreviewable at 598 rows.
- *Per-category* (≈67 rows/file) gives **legible diffs** (a curator owns a category end-to-end),
  **bounded file size**, and aligns with a **stable, human-meaningful, DB-backed taxonomy**
  (`contradictions.category_id` → `categories.name`). A row's shard is deterministic from its
  `category_id`, so the baker enumerates `rows/*.json` and never needs a hand-maintained manifest.

**Why JSON, not a JS module** (unlike the pilot): the store is pure build INPUT — no logic. JSON
diffs cleanly, cannot smuggle executable code into the data tier, and is read directly by both the
baker and the validator. Provenance that the pilot carried as `//` comments (e.g. the `// WEB:`
source lines) becomes explicit fields (§3.2).

**Path safety:** `data/contradictions_harmonization/` is deliberately NOT `data/contradictions_db/`
(which `.gitignore` line 24 ignores wholesale). Only `data/**/*.db` is ignored under the new dir, so
the `.json`/`.mjs` files commit by default. The developer must confirm no broader ignore rule catches
it before the first commit.

### 3.2 Per-row shape (the authored contract)

Each shard is `{ "<id>": Row, … }`. A `Row` mirrors `SPEC-pd-both-poles-surface.md` §G, externalized:

```jsonc
"189": {
  "reconcile": {                       // the "Read as reconcilable" pole
    "quotes": [ Quote, … ],            // 0+ verbatim quotes, in SOURCE ORDER (most representative first)
    "note": "…",                       // §G.6 dossier one-sentence note (null on a genuinely empty pole)
    "halfLine": null,                  // §E.2 descriptive guard (null on almost all poles)
    "emptyNote": null,                 // §E.1 honest-absence note (null unless the pole is thin)
    "emptyNoteAttr": null              // the emptyNote's attribution (paired; null when emptyNote null)
  },
  "discrepancy": { … same shape … },
  "versePair": {                       // §4 harmonization_verse_pair — the #123 in-tension snippets
    "sides": [ { "ref": "Matt 8:5", "snippet": "…", "verseVersion": "WEB", "verseText": "…" }, … ]
  },
  "verification": { "reconcile": [Signoff…], "discrepancy": [Signoff…] }   // §8 (or in the ledger file)
}

Quote = {
  "text":   "verbatim PD quote, curly-normalized, '…' (U+2026) for internal elision only",
  "attr":   "Author (death-year/floruit), Work (year/section).",   // §D.2 — MUST parse (see 3.3)
  "voice":  null,                      // optional ≤6-word genre/stance tag; ship null (§D.3 symmetry risk)
  "href":   null,                      // optional external source link (SAB-link idiom); null = cite alone
  "source": { "kind": "machine", "code": "JFB", "book": 42, "chapter": 9, "verse": 28 }
           //  or { "kind": "hand", "url": "https://archive.org/…", "well": "strauss-life-of-jesus" }
}
```

- `source` is **build/audit metadata only** — it never renders. `kind:"machine"` means the `text`
  was excerpted from `verse_commentaries` at `code/book/chapter/verse` and the baker will re-validate
  it as a verbatim substring (§5); `kind:"hand"` means a curator transcribed it from the cited PD
  source (always T1, §8). It drives the verification tier and the count-parity/leak provenance.
- The `versePair.sides[].verseText` + `verseVersion` carry the full source verse (the pilot's
  `// WEB:` comment, promoted to data) so the snippet's fidelity is re-checkable at bake time.

### 3.3 The attribution format (locked — `DOSSIER_ATTR_HEAD_RE` must parse every `attr`)

Every `attr` obeys `SPEC-pd-both-poles-surface.md` §D.2: `Author (death-year/floruit), Work
(year/section).` — the leading `Author (date)` head is mandatory so the dossier's
`DOSSIER_ATTR_HEAD_RE = /^(.*?\([^)]*\d[^)]*\))/` yields a clean `name (date)` token. To make this
holdable at volume **and** to cut authoring burden for the six machine-excerpt sources, the store
ships a committed `SOURCE_ATTR` head-lookup keyed by `source_code`, e.g.:

| code | authored attr head (the `, on {ref}.` tail is appended per quote) |
|---|---|
| GILL | `John Gill (d. 1771), Exposition of the Whole Bible` |
| JFB | `Jamieson, Fausset & Brown (1871), Commentary Critical and Explanatory` |
| CLARKE | `Adam Clarke (d. 1832), Commentary on the Bible` |
| KD | `Keil & Delitzsch (Delitzsch d. 1890), Biblical Commentary on the Old Testament` |
| MHC | `Matthew Henry (d. 1714), Commentary on the Whole Bible` |
| GNV | `The Geneva Bible (1599), note` |

Hand-sourced critic `attr`s (§9) are authored per quote to the same §D.2 shape. **The validator
(§10) asserts every `attr` in the corpus parses to a non-empty dated head** — this is the
`dossier-load-bearing` gate carried from the pilot test.

---

## 4. The baked tables (the build OUTPUT, in `contradictions.db`)

`schema.sql` defines **three** tables (the brief named two; the third is the #123 verse-pair
fold-forward the code comment at `contradictions-harmonization.js` L531 already anticipates —
`harmonization_verse_pair`). Presence of a `harmonization_row` with `covered = 1` is the coverage
gate (replaces "key present in `HARMONIZATION_PANELS`").

### 4.1 `harmonization_quote` — one row per verbatim quote

| column | type | notes |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | |
| `contradiction_id` | INTEGER NOT NULL | FK → `contradictions.id` |
| `pole` | TEXT NOT NULL | `'reconcile'` \| `'discrepancy'` |
| `ord` | INTEGER NOT NULL | 0-based source order within the pole (drives "first 3" dossier + count) |
| `text` | TEXT NOT NULL | verbatim, curly-normalized; rendered ESCAPED inside `<blockquote>` |
| `attr` | TEXT NOT NULL | §D.2, parseable head |
| `voice` | TEXT NULL | ≤6-word tag; ships NULL |
| `href` | TEXT NULL | external source link; NULL = cite stands alone |
| `source_kind` | TEXT NOT NULL | `'machine'` \| `'hand'` — verification-tier + audit provenance |
| `source_code` | TEXT NULL | the `verse_commentaries.source_code` when `machine`; NULL when `hand` |

Index `(contradiction_id, pole, ord)`.

### 4.2 `harmonization_row` — one row per paneled contradiction

| column | type | notes |
|---|---|---|
| `contradiction_id` | INTEGER PRIMARY KEY | FK → `contradictions.id` |
| `covered` | INTEGER NOT NULL DEFAULT 1 | 1 = render; 0 = authored-but-withheld (per-row killable) |
| `reconcile_note` | TEXT NULL | dossier one-sentence note; NULL on an empty pole |
| `discrepancy_note` | TEXT NULL | " |
| `reconcile_half_line` | TEXT NULL | §E.2 descriptive guard |
| `discrepancy_half_line` | TEXT NULL | " |
| `reconcile_empty_note` | TEXT NULL | §E.1 honest-absence note |
| `reconcile_empty_note_attr` | TEXT NULL | paired attribution |
| `discrepancy_empty_note` | TEXT NULL | " |
| `discrepancy_empty_note_attr` | TEXT NULL | " |

**No `reconcile_first` column.** Pole order stays **computed at request time** from the live
resolved `consensusLevel` via the single shared helper `harmonization.reconcileFirstFor` (§7) — this
preserves the "single source of truth / never a fixed constant" invariant and keeps the two consumers
in lock-step. (If a denormalized `reconcile_first` is later wanted for querying, the baker must
compute it by *calling* `reconcileFirstFor(level)` and a corpus test must assert
`stored == reconcileFirstFor(level)` for every row — but it is not required and is omitted here.)

### 4.3 `harmonization_verse_pair` — the in-tension snippet sides (#123)

| column | type | notes |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | |
| `contradiction_id` | INTEGER NOT NULL | FK → `contradictions.id` |
| `ord` | INTEGER NOT NULL | 0-based; **canonical scripture order** (OT→NT, book, chapter, verse) — NEVER lean-ordered |
| `ref` | TEXT NOT NULL | single `Book chap:verse` citation (no slash, no comma) |
| `snippet` | TEXT NOT NULL | verbatim WEB fragment, U+2026 for internal elision, < 40 words |

**Coverage semantics.** A contradiction is *paneled* iff it has a `harmonization_row` with
`covered = 1` AND ≥1 `harmonization_quote` on at least one pole (or an `emptyNote` on a pole). An id
absent from `harmonization_row` (or `covered = 0`) → the detail page and the dossier both
graceful-null to the **byte-identical un-paneled layout**. Emptying the three tables kills the entire
surface — the pilot's killability guarantee, preserved.

---

## 5. The build step (the baker)

`data/contradictions_harmonization/build-harmonization.mjs`, run offline:

```
node data/contradictions_harmonization/build-harmonization.mjs [--force]
```

Mirrors the science build-time-transform discipline (`data/bible_science_db/build-database.mjs`):
committed source in → DB out, with a fail-closed validation tripwire and an FK check before write.

**Inputs (all read-only except the write target):** the 9 `rows/*.json` shards; the base
`contradictions.db` (for the 605 ids + resolved `consensusLevel` + `notoriety_level`, to validate
membership + tiering); `bible_reference.db` (for T2 substring re-validation); the WEB text via the
`bible` model or `translations` table (for verse-pair fidelity re-check); `src/data/canon` (book
name↔number). **Engine:** `better-sqlite3` (already a dependency) opened **write-mode offline** on a
COPY/rebuild of `contradictions.db` — never on the live serving path (serving stays read-only). The
bake is **additive + idempotent**: `DROP TABLE IF EXISTS harmonization_quote/_row/_verse_pair;
CREATE …; INSERT …`; the base `contradictions`/`answers`/`scholarship` tables are never touched.

**The baker refuses to write (fail-closed, non-zero exit) on ANY machine-gate violation** — it runs
`validate-harmonization.mjs` (§10) over the shards first. Additional bake-time enforcement:
1. **T2 verbatim substring re-validation (100%).** For every `source_kind:"machine"` quote, resolve
   the source row(s) in `verse_commentaries` (exact `(code,book,chapter,verse)`, else the
   block-scan of the cited chapter per §2b), reverse the documented normalization (curly→straight,
   split on U+2026), and assert every non-elided segment is an **exact substring** of the source
   `text`. A miss → build error naming the id/pole/ord. This makes machine quotes verbatim
   *by construction*, not by trust.
2. **T1 sign-off presence.** For every quote that is T1 (§8), assert a matching signed record exists
   in `verification-ledger.json`. A T1 quote with no sign-off → build error. (This is the
   fail-closed edge of the tiered verification posture.)
3. **Verse-pair fidelity.** For every `versePair.sides[]`, assert each non-elided snippet segment is
   a substring of the stored `verseText`, and that `verseText` equals the live WEB verse.
4. **FK check + integrity** before writing the buffer (as the science build does).

On success it writes the harmonization tables into `contradictions.db`. Because that DB is
out-of-band, the prod provision runs this baker as a post-step after `buildDbFromSql.js` (document in
`DATABASE.md`).

---

## 6. The two consumers + the untouched-partial invariant

Both consumers switch from reading the in-memory `contradictions-harmonization.js` maps to reading
the baked tables via **new read-only model helpers** (add to `src/models/contradictions.js`, opened
at request time, graceful-null on absent DB/table):

- `harmonizationPanelFor(id)` → the detail-page local: both poles' `{quotes[], halfLine, emptyNote,
  emptyNoteAttr}` (notes omitted) + the module copy constants, or `null`.
- `harmonizationForDossier(id, consensusLevel, max=3)` → the dossier projection, **returning the
  byte-identical shape** the partial already consumes:
  `{ paneled:false }` | `{ paneled:true, reconcileFirst, poles:[{ label, names, note, noteLabel,
  halfLine, blankNote, blankAttr }] }`.
- `versePairFor(id)` → `{ pair:false }` | `{ pair:true, sides:[{ref, snippet}] }`.

**What stays in `src/content/contradictions-harmonization.js`:** the pure logic + constants —
`reconcileFirstFor`, `dossierSourceHead`, `DOSSIER_ATTR_HEAD_RE`, `SURFACE_HEADING`/`CAPTION`/
`ERA_FRAME`, the pole labels, the note labels. **What leaves it:** the DATA (`HARMONIZATION_PANELS`,
`VERSE_PAIR_SNIPPETS`) → the curation store → the baked tables. `poleSourcesForDossier` /
`versePairForEntry` are re-pointed to call the new model helpers (or the model helpers subsume them);
the *projection shape is preserved* so the helper stays a thin adapter.

**The invariant (unchanged, now enforced across the whole corpus):**
- The **detail page** (`src/routes/contradictions.js` → `partials/contradiction-harmonization-panel.ejs`)
  renders **verbatim `text` + `halfLine` + `emptyNote`**, and **never the `note`**.
- The **dossier** (`src/models/analysis.js` → `partials/analysis-area-groups.ejs`) renders the derived
  **`name (date)` tokens + the `note` + `emptyNote`/`emptyNoteAttr` + `halfLine`**, and **never the
  verbatim `text`** (hub-and-spoke: verbatim lives on the detail page only).
- **Neither partial changes.** `analysis-area-groups.ejs` and `contradiction-harmonization-panel.ejs`
  stay byte-untouched; only the data *source* behind the same locals swaps. Their unchanged
  shared-surface tests are the scoping proof. The caveat-never-leaks contract holds (none of this
  reaches meta/og/twitter/share).

---

## 7. Pole ordering follows the lean — the consensusLevel → order mapping (ruling #3)

**Verified consensus levels** (`scholarly_consensus_levels`, 5 rows; **there is no `indeterminate`
level** — the brief's/ruling's "indeterminate" maps to `genuinely_disputed` + null/unmapped):

| `consensusLevel` (resolved `.name`) | bucket (ruling #3) | `reconcileFirst` | pole order (top → bottom) | rows |
|---|---|---|---|---|
| `genuine_contradiction` | contradiction-leaning | **false** | **discrepancy** → reconcile | 207 |
| `probable_contradiction` | contradiction-leaning | **false** | **discrepancy** → reconcile | 148 |
| `genuinely_disputed` | indeterminate | **false ⚠ CHANGED** | **discrepancy** → reconcile | 101 |
| `probable_harmonization` | harmonization-leaning | **true** | **reconcile** → discrepancy | 87 |
| `apparent_only` | harmonization-leaning | **true** | **reconcile** → discrepancy | 62 |
| `null` / unmapped | indeterminate default | **false ⚠ CHANGED** | **discrepancy** → reconcile | — |

**This CHANGES shipped behavior.** Today `reconcileFirstFor` returns `true` (reconcile-first) for
`genuinely_disputed`, `null`, and unmapped levels. Ruling #3 ("indeterminate → one fixed neutral
default: discrepancy-first — the tension is the subject") and its rationale (a uniform reconcile-first
default hardened into a site-level apologetic *tell* at 605-row scale — the 2026-06-30 benchmark)
require flipping those to **false**. Implementation:
1. Update `harmonization.reconcileFirstFor` so it returns `true` **only** for `probable_harmonization`
   and `apparent_only`; every other value (the two contradiction levels, `genuinely_disputed`, `null`,
   unmapped) → `false`.
2. Update its unit test in `test/contradictions-harmonization-dossier.test.js` (the current asserts
   `genuinely_disputed`/`null`/unmapped → `true` must flip to `false`).
3. This **supersedes `SPEC-pd-both-poles-surface.md` §C**'s documented reconcile-first tie-break for
   `genuinely_disputed` — note it there.

Because both consumers already call the one shared `reconcileFirstFor`, this single change propagates
to the detail page *and* the dossier identically — the "can never order the poles differently"
invariant is preserved. **✔ CONFIRMED by owner 2026-07-01 — flip the helper in Phase 0 (§12); the two
`*_contradiction` levels, `genuinely_disputed`, `null`, and unmapped all resolve discrepancy-first,
leaving only `probable_harmonization` + `apparent_only` reconcile-first (149 rows vs 456).**

---

## 8. Verification posture — tiered char-for-char (ruling #1)

Verification is tiered **per quote** (determinable, computable from the DB + `source_kind`), because
one caught misquote dents the site-wide "verbatim" claim where readers land, but exhaustive
transcription of ~598 rows is not the throughput the corpus can bear.

**T1 — human char-for-char sign-off required** (recorded in `verification-ledger.json`; the baker
fail-closes without it, §5.2). A quote is T1 iff **any** of:
- `source_kind = "hand"` (a curator transcribed it — highest fabrication risk; always T1), OR
- its row's `consensusLevel = "genuine_contradiction"` (the strongest claim), OR
- its row's `notoriety_level >= 4` (the **marquee / high-traffic** determinable flag; 65 rows —
  chosen over `difficulty_level`, which measures resolvability, not traffic).

**Additionally, always human-signed corpus-wide:** every `note`, every `emptyNote`, and every
`halfLine` (short, authored, dossier-load-bearing; not machine-verifiable for faithfulness).

**T2 — machine-excerpt + automated + sampled** (the genuinely-thin long tail). A quote is T2 iff it
is `source_kind:"machine"` on a row that is neither `genuine_contradiction` nor `notoriety_level >= 4`.
Guarantee = **100% automated exact-substring re-validation** against `verse_commentaries` at bake time
(§5.1) — verbatim *by construction* — **plus a human sampled audit of ≥10% (min 30 rows), stratified
by `source_code`**, checking the two things the machine cannot: (a) the correct block was located for
block-keyed sources (K&D, §2b), and (b) on-tension relevance (criterion §10.1). Sampled-audit results
are recorded in the ledger.

**The ledger** `verification-ledger.json`: `{ "<id>": { "<pole>": [ { "ord", "tier", "signoff",
"auditor", "date", "source_url" } ] } }`. T1 entries carry a `signoff:"verbatim"` record; T2 sampled
rows carry `signoff:"sampled"`. The baker cross-checks T1 coverage and errors on a gap.

Approx. tier sizes (for planning, from the verified distribution): T1 by row =
`genuine_contradiction (207) ∪ notoriety≥4 (65)` = **232 rows** (union; overlap 40), plus every
hand-sourced critic quote wherever it appears; T2 = the remaining machine-excerpted reconcile quotes.

---

## 9. Discrepancy-pole sourcing — heavy-hitters + honest-absence (ruling #2)

The critic pole is not in `verse_commentaries` (§2). **Hand-source genuine PD critics on the marquee
(`notoriety_level >= 4`) + `genuine_contradiction` rows** so count-parity (§10.2) holds where it is
most visible; use the **id-439 honest-absence model** (§10.3) on the genuinely-thin tail. Grow the
well **incrementally**, not a full corpus commissioned up front.

**The PD-critics well** (`pd-critics-well.json`) — a committed index mapping `well-key → { author,
work, pd_edition, year, source_url }`, so a critic's PD edition is transcribed once and reused. Seed
voices (all PD; verify the specific *edition/translation* is PD before use):
- **D. F. Strauss**, *The Life of Jesus Critically Examined* (Eliot transl., 1846) — the pilot's
  gospel-harmony workhorse (§98/§107/§128/§132 already used).
- **Thomas Paine**, *The Age of Reason* I–II (1794–95) — creation/cosmology + resurrection-count.
- **Robert G. Ingersoll**, *Some Mistakes of Moses* (1879) + the Lectures — Pentateuch/OT.
- **John W. Colenso**, *The Pentateuch and Book of Joshua Critically Examined* (1862–79) — census /
  numbers / chronology contradictions (the natural heavy-hitter for the large OT-numbers cluster).
- Candidates as the well grows: **Voltaire** (*Philosophical Dictionary*), **Reimarus** (*Fragments*),
  **Julius Wellhausen** (*Prolegomena*, Eng. transl. 1885 — PD), **Kuenen**. Verify PD per source.

Attribution per §D.2 (`Author (death-year), Work (year/section).`). Sources: Internet Archive / CCEL
/ Project Gutenberg / Wikisource — **PD edition only**, `source_url` recorded in the well + ledger.
Every hand-sourced critic quote is **T1** (§8). Where **no** PD critic presses a tension, use the
honest-absence `emptyNote` (§10.3) — never fabricate, never co-opt a harmonizer into the critic slot
(§10.4).

---

## 10. The acceptance criteria as hard per-row gates (machine-checkable vs human sign-off)

The seven criteria are hard gates on the curation data, enforced per row. **The extended
`test/contradictions-harmonization-dossier.test.js` is the corpus-wide gate** — its existing per-pole
sweeps (which today loop the 7-id map) are re-pointed to loop the whole curation store, and the fixed
counts (`22 quotes`, `13 notes`) become derived, not hard-coded. `validate-harmonization.mjs` runs the
same machine checks inside the baker (§5).

| # | criterion | machine-checkable | human sign-off |
|---|---|---|---|
| §5.1 | **On-tension quotes only** — each quote engages *this* tension | — | ✔ (curator judgment) |
| §5.2 | **Count-parity** — the leaning pole ≥ the minority pole in quote count | ✔ (see rule below) | — |
| §5.3 | **Thin/empty pole = attributed honest-absence, never blank** | ✔ (empty pole ⇒ `emptyNote`+`emptyNoteAttr` non-null; on the *non-leaning* pole only) | ✔ (absence is accurate) |
| §5.4 | **No harmonizer co-opted into a critic slot** | partial (`halfLine` present ⇒ flag for review) | ✔ (is the discrepancy voice a genuine critic?) |
| §5.5 | **Reconcile pole gets a connective half-line; half-lines symmetric + descriptive-only** | ✔ (`halfLine` passes the loaded-language regex; equal-temperature) | ✔ (describes its *own* pole; §11) |
| §5.6 | **Dossier-feed fidelity** — `attr` parses; `note` register | ✔ (see below) | ✔ (note is a faithful condensation) |
| §5.7 | **Order follows the lean** | ✔ (`reconcileFirst` derived per §7 table) | — |

**Machine-checkable set (in `validate-harmonization.mjs` + the corpus test):**
- **attr:** every `attr` parses via `DOSSIER_ATTR_HEAD_RE` to a non-empty dated head; matches the §D.2
  shape.
- **note:** one sentence — ends `.`, no interior `". "`, pre-trimmed, **≤180 chars**, no date/citation
  tail; passes the loaded-language blocklist (`attempt|explains away|contrived|forced|of course|
  fatal|decisively|obviously|…`); **not** a verbatim slice of any of its pole's quotes; its **lead
  source name appears in that pole's `quotes[]`** (via `dossierSourceHead`). `note` present **iff**
  quotes present (symmetry); `emptyNote` pole carries `note:null`.
- **count-parity (reconciles §5.2 with §5.3):** let L = the leaning pole (per §7 `reconcileFirst`),
  M = the minority pole. (a) L must **never** be the `emptyNote` pole. (b) If M carries an `emptyNote`,
  parity is satisfied (honest-absence governs). (c) Else `L.quotes.length >= M.quotes.length`.
- **order:** `reconcileFirst` matches the §7 mapping for the row's resolved `consensusLevel`.
- **verse-pair:** U+2026-only elisions; each side `ref` is a single clean citation (no `/`, no `,`);
  snippets pairwise distinct; sides in canonical scripture order; snippet < 40 words; each snippet a
  substring of its stored `verseText` (§5.3).
- **leak guard:** none of the surface strings (quotes/attr/labels/caption/era/notes) appear in
  `metaDescription`/`og:*`/`twitter:*`/`share.quote` (route-level assertion, unchanged).
- **graceful-null:** an un-paneled id renders the byte-identical un-paneled layout (both consumers).

**Human sign-off set (recorded in the ledger):** on-tension relevance (§5.1); genuine-critic check
(§5.4); half-line describes its own pole without undercutting the other (§5.5 / §11); honest-absence
accuracy (§5.3); note faithfulness (§5.6); T1 verbatim char-for-char (§8); block-location correctness
for K&D-class sources; the T2 sampled audit.

---

## 11. Half-line symmetry — symmetric + descriptive-only (ruling #4)

Any pole's `halfLine` is **equal-temperature**, describes **how THAT pole's own quotes cohere into a
reading**, and **may not qualify or undercut the opposing pole**. This **retires the Gen 1:16 (id 3)
"…even though its authors were themselves harmonizers" clause**, which softened the *discrepancy*
pole (a criterion-§5.4 co-opt as well). Authoring rule: a half-line is `<pole-internal description of
the reading>` — never a comparative or concessive clause about the other side. Validation: (a) machine
— the half-line passes the loaded-language blocklist and contains no opposing-pole author name; (b)
human — a reviewer confirms it is self-referential and equal-temperature across the pair. Keep it one
muted sentence, descriptive-provenance (`SPEC-pd-both-poles-surface.md` §E.2), never a verdict in
GEBible's voice.

> **Pilot consequence:** migrating id 3 into the store requires rewriting its discrepancy `halfLine`
> to drop the "harmonizers" concessive (Phase 1). The re-point is not byte-identical for id 3's
> half-line by design — the golden regression (§12) must expect the rewritten, symmetric half-line.

---

## 12. Sequencing / phasing + the authoring gate

**Gate:** no harmonization row is authored until this SPEC lands. It has. Proceed:

- **Phase 0 — machinery, empty.** Land `schema.sql`, `build-harmonization.mjs`,
  `validate-harmonization.mjs`, the three baked tables, the new read-only model helpers, and the
  re-pointed consumers — **with an empty store**. Every row graceful-nulls to the un-paneled layout;
  the whole corpus is byte-identical to today. Flip `reconcileFirstFor` per §7 (owner-confirmed) and
  update its test. *De-risks the plumbing before any authoring.*
- **Phase 1 — migrate the 7 pilots + golden regression.** Move ids 3/4/189/439/459/468/496 from the
  JS maps into the first curation shards; bake; assert the 7 detail pages **and** their dossiers
  render byte-identically to the pre-migration pilot **except** the two deliberate changes: (a) id 3's
  rewritten symmetric half-line (§11), (b) any pole-order flips from §7 (none among these 7 — all are
  `probable_harmonization`/`genuine_contradiction`, already correctly ordered). **Resolve the pilot
  count-parity debt** (ids 189/468/496 lean discrepancy with 1 critic vs 2 reconcile → §10.2 FAIL):
  **owner ruled 2026-07-01 — source a 2nd PD critic each** (no grandfathering; the ratified exemplars
  pass the same gate as the corpus). This proves the store→bake→render path against a known-good baseline.
- **Phase 2 — the T1 heavy-hitters.** Author `genuine_contradiction` (207) + `notoriety_level >= 4`
  (65) rows: machine-excerpt the reconcile pole (six PD sources, block-aware for K&D), **hand-source
  PD critics** for the discrepancy pole (§9) to hold count-parity, honest-absence where genuinely thin.
  All quotes here are T1 (§8) — full char-for-char sign-off.
- **Phase 3 — the T2 tail.** The remaining `probable_contradiction`/`genuinely_disputed`/
  `probable_harmonization`/`apparent_only` rows below the marquee threshold: machine-excerpt +
  automated substring re-validation + the ≥10% stratified sampled audit.
- **Phase 4 — notes, half-lines, verse-pairs corpus-wide** (or authored inline with each row). All
  human-signed.

Each phase is green only when `validate-harmonization.mjs` + the extended corpus test pass over the
shards authored so far. The surface remains killable at every phase (`covered = 0` / empty tables).

---

## 13. Out of scope

- **Original-language work** (interlinear/Strong's/morphology/lexica) — Lemma's job; this surface
  links out, never builds it in.
- **Any change to the render contract** of `partials/contradiction-harmonization-panel.ejs` or
  `partials/analysis-area-groups.ejs`, and any change to the un-paneled graceful-null layout — only
  the data *source* behind the existing locals swaps.
- **App-serving build steps** — there is no bundler; the only build is the offline data bake.
- **Hand-editing the shipped `contradictions.db`**, or authoring any row before this SPEC lands.
- **The modern critical essay** (`question.commentary`) — existing DB content, not this sweep's data
  work (the id 3 LXX-residue essay dependency was a pilot-scope content task, already handled).
- **Widening `ERA_FRAME`** to admit the medieval Jewish CC0 voices or modern TYN — a separate owner
  decision; excluded here.

---

## 14. Divergences from the brief + residual questions (verify these)

**Verified data divergences (brief was wrong or imprecise; corrected above):**
1. **K&D is block-keyed + sparse** — the exact-verse machine-excerptor misses it; block-scan required
   (§2b). Brief §2 implied verse-keyed availability.
2. **TYN is modern** ("Tyndale Open Bible Commentary") — excluded from this PD/era-framed surface;
   the usable set is six (GILL, JFB, CLARKE, KD, MHC, GNV), not the brief's seven (§2a).
3. **No `indeterminate` consensus level exists** — 5 levels; ruling #3's "indeterminate" =
   `genuinely_disputed` + null/unmapped (§7).
4. **`contradictions.db` is gitignored/out-of-band**; the curation store (committed) is the source of
   truth, not a committed DB (§1). Brief spoke of the DB as if reviewable.
5. **`contradictions` stores `scholarly_consensus_id` (FK)**, resolved to the `.name` string — not a
   `consensusLevel` column (§2).
6. **A third baked table** (`harmonization_verse_pair`) is required (§4.3) — the brief's table list
   named only two.

**Behavior-changing item — RESOLVED (owner confirm 2026-07-01):**
7. **§7 flips `reconcileFirstFor`** for `genuinely_disputed` + null/unmapped from reconcile-first to
   discrepancy-first. **CONFIRMED** — implement in Phase 0. Update the shipped function + its test, and
   note the supersession in `SPEC-pd-both-poles-surface.md` §C when the flip lands.

**Residual questions — RESOLVED (owner 2026-07-01):**
- **A. Pilot count-parity debt (ids 189/468/496).** → **Source a 2nd PD critic each** in Phase 1
  (no grandfathering).
- **B. "Every row surfaced on the per-verse dossier" (ruling #1).** → **Confirmed:** the T1 marquee
  flag is `notoriety_level >= 4` (65 rows) **plus every hand-sourced critic quote** (§8). The literal
  "every paneled row" reading is rejected — it would collapse the tiering ruling #1 depends on.
- **C. Sampled-audit rate.** → **Confirmed ≥10% (min 30 rows), stratified by `source_code`** (§8).

All four owner decisions are folded into §7 / §8 / §12 above. **This SPEC is final; Phase 0 may begin.**
```
