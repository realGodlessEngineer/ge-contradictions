# BRIEF — scaling the both-poles surface to all 605 contradictions

**Status:** DRAFT BRIEF (pre-spec). Captures the decided architecture for the owner to confirm and
the **curation-quality acceptance criteria** the 4-persona pilot review produced (2026-06-14). This
is the planning home for the sweep. **The two §4 forks + two template-symmetry calls are RESOLVED
(owner ruling 2026-06-30 — see §4).** Next step: promote to `SPEC-` (seminary-tool-critic folds the
rulings into the build spec). No row is authored until that promotion lands — it is **not** a build
green-light on its own.

**What this scales:** the verbatim-PD both-poles surface specced in
[`SPEC-pd-both-poles-surface.md`](SPEC-pd-both-poles-surface.md) and shipped on the 7 pilot ids
(**3, 4, 189, 439, 459, 468, 496**) — out to the full contradictions corpus (~605 rows, ~598 not yet
paneled). The pilot is the **quality bar**: all four reader/user personas (Dana / lay,
Hannah / student, the deconstructing skeptic, the inerrantist) independently judged the pilot the
right standard to scale to. The job of the sweep is to hit that bar at volume **without** diluting it.

> **Amendment 2026-06-26 (shipped while the sweep is in flight):** the baked harmonization tables now
> feed a **second surface** — the per-verse **Analysis Dossier** (`/analysis/verse/...`, tasks
> #121 / #122), not just the contradiction detail page. That adds **one new per-pole field** to the
> data we generate (`note` — a one-sentence harmonization/tension line) plus **two generation
> criteria** the dossier is load-bearing on (a parseable attribution head, and the note's
> fidelity/register rules). See §3.1, §3.2, and the new acceptance criterion **§5.6**. The data
> generation agent should be fed THIS brief (it now carries the full per-row field list + criteria);
> the canonical per-pole data shape lives in `SPEC-pd-both-poles-surface.md` §G (now including `note`,
> see §G.6 there).

---

## 1. The load-bearing invariant (do not violate)

**Verified curation is a build INPUT, never a hand-edit of the shipped `contradictions.db`.**

The published `contradictions.db` is a build OUTPUT. The harmonization quotes are authored/curated in
a **separate, human-editable curation store** (committed structured text — see §3), and a build step
**bakes** them into `contradictions.db`. Nobody hand-edits the shipped DB to add a quote. This keeps
the surface reproducible, reviewable in diffs, and re-buildable from source. The pilot's
hand-authored `src/content/contradictions-harmonization.js` is the *proof-of-shape*; the sweep
replaces it with DB-baked rows fed from the curation store.

---

## 2. Data sources (decided — confirm)

| store | role in the sweep |
|---|---|
| `contradictions.db` | `contradictions` / `answers` / `bible_references` — the cited verses + the lean (`consensusLevel`, drives `reconcileFirst` / `pairLean`). Also the **OUTPUT** home of the new baked harmonization tables (§3.2). |
| `bible_reference.db` | **the standard verbatim-excerpt source.** `verse_commentaries` (GILL, JFB, CLARKE, KD, MHC, TYN, GNV) + `text_sources` / `licenses`. Chosen over study-bundle because it is richer — it has K&D and Tyndale, which study-bundle lacks. |
| `study-bundle.db` | `books` table only — the name→bolls-number bridge. Recommend baking it to a **static committed JSON map** so the sweep doesn't take a runtime dependency on the 175 MB gitignored bundle. |

> The discrepancy (critic) pole is the gap: `verse_commentaries` is overwhelmingly harmonizing PD
> commentary. Critic voices (Strauss / Paine / Ingersoll, etc.) are NOT in it — they come from the
> curation store by hand. That gap is exactly fork §4.2.

## 3. Shape of the sweep (decided — confirm)

### 3.1 Curation store (build INPUT)
Committed, human-editable structured text, **sharded** (one file per id or per category, not one
monolith) so curation diffs are legible and review is per-row. Holds, per id: the two poles, each
pole's verbatim quotes (text + attribution + optional voice + optional href), the optional
half-line, the empty-note/empty-note-attr for a thin pole, **and (added 2026-06-26 for the dossier,
#122) a one-sentence `note` per non-empty pole** — i.e. the §G data shape from the pilot spec (now
including `note`; see `SPEC-pd-both-poles-surface.md` §G.2 + §G.6), externalized.

### 3.2 Baked tables (build OUTPUT, in `contradictions.db`)
- `harmonization_quote` — one row per verbatim quote (id, pole, text, attr, voice, href, order).
- `harmonization_row` — one row per contradiction that has a panel (id, half-lines, empty-notes,
  **`reconcile_note` + `discrepancy_note`** [added 2026-06-26 for the dossier, #122 — nullable text;
  `null` = no note, which is correct for an empty pole], coverage flag). Presence here is the
  coverage gate (replaces "key present in `HARMONIZATION_PANELS`").

The detail-page route reads these at request time (read-only better-sqlite3), assembles the same
`harmonizationPanel` local the view already consumes, and **graceful-null degrades** to byte-for-byte
the un-paneled layout when a row has no panel. The whole feature stays killable (empty the tables →
no surface).

> **Two consumers (added 2026-06-26).** These baked tables now feed BOTH the contradiction **detail
> page** (the verbatim-quote surface — this brief's original target) AND the per-verse **Analysis
> Dossier** (`/analysis/verse/...`, #121 / #122). They read different fields: the detail page renders
> the verbatim `text` + `halfLine` + `emptyNote`; the dossier renders only the per-pole `note`, the
> `emptyNote`/`emptyNoteAttr`, and a `name (date)` line **derived at request time from each quote's
> `attr`** (it never shows the verbatim `text`). So `harmonization_row.{reconcile,discrepancy}_note`
> and a **parseable `harmonization_quote.attr`** are *dossier-load-bearing* — captured as acceptance
> criterion §5.6. When the tables land, re-point the dossier's `poleSourcesForDossier` (currently
> reading `src/content/contradictions-harmonization.js`) at them, preserving its projection shape
> `{ paneled, reconcileFirst, poles:[{ label, names, note, noteLabel, blankNote, blankAttr }] }` so
> the partial is untouched and graceful-null still degrades to the un-paneled layout.

---

## 4. RESOLVED FORKS — owner ruling 2026-06-30 (baked into §5; no row authored until the SPEC lands)

Both open forks, plus two template-symmetry calls the 2026-06-30 dossier benchmark surfaced, were
ruled by the owner:

1. **Verification posture at scale — TIERED CHAR-FOR-CHAR.** Character-for-character sign-off (the
   pilot's 24/24 standard) on every row surfaced on the per-verse dossier / marquee high-traffic
   verses, every `consensusLevel = genuine_contradiction` row, and every per-pole `note`; machine-
   excerpt + a **sampled** audit pass on the genuinely-thin long tail only. Keeps the verbatim-trust
   guarantee where readers land (one caught misquote dents the site-wide "verbatim" claim) without
   making exhaustive transcription the throughput bottleneck for all ~598 rows. *(Considered and not
   chosen: blanket char-for-char on all 598; blanket machine-excerpt + sampled.)*
2. **Discrepancy-pole sourcing — HEAVY-HITTERS + HONEST-ABSENCE.** Hand-source genuine PD critics
   (Strauss / Paine / Ingersoll / Colenso / etc.) on the marquee + `genuine_contradiction` rows so
   count-parity (§5.2) holds where it is most visible; use the id-439 honest-absence model (§5.3) on
   the genuinely-thin tail. This seeds a PD-critics corpus incrementally rather than commissioning it
   all up front — the corpus can grow the well over time. Serves §5.2 and §5.4 directly. *(Considered
   and not chosen: leave-thin-everywhere, which breaches §5.2 corpus-wide; commission-full-corpus
   up front.)*
3. **Pole ordering — ORDER FOLLOWS THE LEAN.** → new criterion §5.7 below.
4. **Half-line symmetry — SYMMETRIC + DESCRIPTIVE-ONLY.** → folded into criterion §5.5 below.

(The store-format recommendation was already settled — sharded committed structured text, §3.1.)

---

## 5. Curation-quality acceptance criteria (six — the 06-14 persona five + the 06-26 dossier-feed rule)

These are **hard acceptance criteria on the curation data**, enforced per row as the sweep authors
it. They are the input disciplines that protect the pilot's quality at volume. 1 and 3 hold in the
pilot today (reaffirmed here); **2, 4, and 5 are the new guardrails** (re-anchored off the stale
#50 / #51 / #52 task refs, which now collide with the archived Barnes series — they live here as
§5.2 / §5.4 / §5.5, enforced under the #29 SPEC and the #32 sweep); **6 (added 2026-06-26)** folds in
the shipped #121 / #122 dossier surface, which these tables now also feed; **7 (added 2026-06-30)** is
the owner's pole-ordering ruling.

1. **On-tension quotes only.** Every quote must speak to *this* contradiction's specific tension —
   not a generic verse-note that merely mentions the passage. A quote that doesn't engage the
   tension doesn't earn its place in a pole. *(Held in the pilot; existing discipline.)*

2. **Count-parity — the leaning pole is never out-quoted by the other pole.** The pole the lean
   header favors must carry **at least as many** verbatim quotes as the opposing pole. The pilot
   violated this on id 189 (1 critic vs 2 reconcile), id 496, id 468 — the side the page calls
   stronger read as the thinner one. → **#29 SPEC criterion** (re-anchored from stale #50); the §4.2
   heavy-hitters-sourcing ruling is what makes this holdable on the marquee rows. *(New — Dana + skeptic.)*

3. **A thin/empty pole cites the strongest skeptic who actually looked — never goes blank.** The id
   439 model (`emptyNote`: "No major public-domain critic presses this" + Strauss conceding
   "certainly striking"). An empty pole renders its label and an **attributed provenance note**
   showing *why* it is thin, in the surface register — never a blank, never a fabricated quote, never
   a point scored in GEBible's voice. Every persona named this the single most trust-earning element
   of the pilot. *(Pilot model, SPEC §E.1; reaffirmed as a sweep rule.)*

4. **Never co-opt a "real contradiction" pole with harmonizers.** A discrepancy pole must be filled
   by a genuine critic who actually presses the contradiction. If none exists, either **source one**
   or **relabel the pole honestly** (e.g. "literal-stars reading") — do not quote harmonizers
   (K&D/Pulpit on id 3) into a critic slot and rely on a half-line to paper it over at scale. Distinct
   from criterion 3: that is the *honest-absence* case; this is the *mislabeling* case. → **Task #51.**
   *(New — skeptic.)* → **#29 SPEC criterion** (re-anchored from stale #51).

5. **Every reconcile pole gets a connective half-line so it argues, not just quotes — and half-lines
   are symmetric.** Extend the optional `contradiction-pole-halfline` (pilot: id 3 + id 439 only) to
   every reconcile pole — one muted, **descriptive** sentence framing how its quotes cohere into a
   reading. **Owner ruling 2026-06-30 (symmetric + descriptive-only):** any pole's half-line is
   equal-temperature and describes how *that pole's own* quotes cohere; **no half-line may qualify or
   undercut the opposing pole** — this retires the Gen 1:16 "these critics were actually harmonizers"
   half-line, which softened the discrepancy pole (also a criterion-4 co-opt). Closes the
   inerrantist's residual form-asymmetry (the critical essay is the only part that sustains an
   *argument*; the reconcile pole only stacks quotes) AND the skeptic's asymmetric-hedging read in one
   rule. Keep it descriptive-provenance per SPEC §E.2, never a verdict in GEBible's voice, temperature
   symmetric across poles. → **#29 SPEC criterion** (re-anchored from stale #52).
   *(New — inerrantist + skeptic; owner ruling.)*

6. **Dossier-feed fidelity — the per-pole `note` and the attribution head.** The baked rows feed the
   per-verse **Analysis Dossier** (#121 / #122; §3.2), which renders, per pole, a derived `name (date)`
   source line and a one-sentence `note`. Two disciplines per row:
   - **`attr` must lead with `Author (date)`** so the dossier's head-extractor
     (`DOSSIER_ATTR_HEAD_RE = /^(.*?\([^)]*\d[^)]*\))/`) yields a clean token. The locked attribution
     format (SPEC §D.2: `Author (death-year/floruit), Work (year/section).`) already satisfies this —
     hold it for **every** baked quote and validate the whole corpus parses. (The dossier shows the
     **first 3** quote authors per pole **in source order**, so order each pole's most representative
     PD voices first.)
   - **The per-pole `note`** is one sentence, ≤180 chars, ends in a period, no interior `". "`, no
     date/citation tail, **no loaded language on either pole** (no "attempt / explains away /
     contrived / forced / of course / fatal / decisively / obviously…"), and its **lead source must
     be an author that appears in that pole's `quotes[]`** (so the one-liner can never name a voice
     the panel doesn't carry, or contradict it). The reconcile label is "Harmonization", the
     discrepancy "The tension" — those are content constants; **bake only the bare sentence**, never
     the label. An empty pole (the id 439 model) carries `note: null`. Reuse
     `test/contradictions-harmonization-dossier.test.js` as the **per-row acceptance gate** over the
     baked corpus. → **Task #122 (shipped on the 7 pilot ids; this scales it).**
   *(New — folds the shipped dossier surface into the sweep's data contract.)*

7. **Pole ordering follows the lean (owner ruling 2026-06-30).** For
   `consensusLevel = genuine_contradiction` the panel leads with the **discrepancy** pole; genuine
   harmonization / consensus rows lead with the **reconcile** pole; `indeterminate` uses one fixed
   neutral default (discrepancy-first — the tension is the subject). Replaces the pilot's uniform
   reconcile-first order, which at 605-row scale hardened into a site-level apologetic "tell" (the
   2026-06-30 dossier benchmark). Consistent with the charter's surface-a-genuine-lean stance (not
   centered-neutrality). Drive `reconcileFirst` off `consensusLevel` in the baked `harmonization_row`,
   never a fixed constant; the per-verse dossier's `poleSourcesForDossier` projection must honor the
   same order. *(New — owner ruling, from the dossier benchmark.)*

> **Charter note carried from the persona run:** the personas surfaced one genuine charter *fork*,
> not a bug — the critical essay structurally keeps the last word (skeptic: keep it, the #1
> anti-apologetic feature; inerrantist: the one place the scale tips against him). That is an owner
> adjudication, **not** a curation rule, and is deliberately NOT in the five above. The recommended
> read (keep the essay's last word; close the inerrantist gap via criterion 5 + the apologetic-defense
> link, task #36) is logged separately, not baked into the sweep data.

---

## 6. Related backlog (persona-mapped, not part of this brief's data work)
- **#35** zero-scroll both-sides snapshot · **#36** apologetic-defense link (3 of 4 personas flagged
  the deeper-learning exits skew critical — prioritized) · **#38** "Sources for this reading" run-on
  render (will worsen at scale — fix before scaling).
