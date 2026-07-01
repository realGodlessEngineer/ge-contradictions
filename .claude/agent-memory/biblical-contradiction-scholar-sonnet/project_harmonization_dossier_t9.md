---
name: project_harmonization_dossier_t9
description: T9 "note + verse_pair" dossier sidecar leg (data/harmonization/curation/dossier/<id>.json) — schema quirks, bible_reference.db artifact, lean-mismatch handling
metadata:
  type: project
---

Contract lives in `data/harmonization/TRANSFORM_SPEC.md`'s final section, "Dossier
sidecar leg — note + verse_pair (going forward)" (informally **T9**). Separate from
the earlier machine "excerpt" pass (T5/T6, `curation/machine/<id>.json`, read-only
input for T9) and from **T10** (later leg that hand-sources verbatim discrepancy/critic
quotes — T9 never touches `discrepancy.quotes`).

**Why this matters:** worked id 487 (2026-07-01) end to end; the gotchas below aren't
obvious from a single read of the spec.

## Dossier sides have no explicit `ord` field
Despite the spec prose talking about `ord: 0` / `ord: 1`, every real dossier file
(`data/harmonization/curation/dossier/{3,4,439,189,468}.json`) has `versePair.sides`
as a plain 2-element array with fields `ref`, `snippet`, `verseVersion`, `verseText`
only — canonical order is expressed by **array position**, not a keyed `ord` int.
Don't add an `ord` field; it isn't part of the shape the baker/validator actually reads.

## bible_reference.db WEB text has a literal backslash-quote artifact
Quoted dialogue in the `translations` table (version_code='WEB') is stored with a
**literal backslash character followed by a literal `"` character** around quote
marks — e.g. Luke 4:41's text contains `...saying, \"You are the Christ...\" Rebuking...`
where `\"` is two real characters (0x5C 0x22), not an escaped-JSON artifact that
disappears on read. Confirmed present across many verses with reported speech (Mark
1:24, Mark 3:11, Luke 4:34, John 19:17, etc.) — it's a systemic data-quality quirk of
this DB column, not a one-off.
- `verifyVersePairs.py`'s `norm()` does NOT strip backslashes (it only unifies
  curly/straight quotes, dashes, whitespace) — so `verseText` must reproduce the
  backslash-quote sequence **verbatim** to match `norm(hay)`. Existing dossier id 468
  does exactly this for John 19:17's `verseText`.
- Prefer, when a genuinely equivalent verse pair exists, to **pick sides that don't
  contain reported speech** (no embedded quote marks) so the snippet/verseText stay
  clean prose — id 487 used James 2:19 + 1 John 5:1 (both plain statements) instead of
  a demon-confession verse like Luke 4:41/Mark 3:11 specifically to avoid this. When
  the on-tension verse unavoidably contains dialogue, id 468's move — truncate the
  `snippet` to end just before the quoted portion while still setting `verseText` to
  the full artifact-laden verbatim text — is the established fallback.

## Consensus-vs-machine-lean mismatch: trust the consensus rule, not `row.lean`
Per SPEC §7, reconcile-leaning is `true` **only** when `scholarly_consensus_levels.name`
is `probable_harmonization` or `apparent_only`; `genuinely_disputed` (like every other
non-listed value) is **discrepancy-leaning**, even though the older machine-pass file's
`row.lean` may say `reconcile_first` (machine passes used a looser/older heuristic).
When they disagree, the consensus-derived rule wins — and on a discrepancy-leaning row
T9 must NOT populate `discrepancy.emptyNote`/`emptyNoteAttr` even though the machine
file already named a real skeptic in `row.discrepancy.skeptic` — leave the entire
`discrepancy` object null (`note`, `halfLine`, `emptyNote`, `emptyNoteAttr` all null,
`quotes: []`) and defer to T10. Worked example: id 487, machine said `reconcile_first`
(citing Steve Wells/SAB as the discrepancy skeptic), but `consensus: "genuinely_disputed"`
→ treated as discrepancy-leaning; `reconcile.note` was still authored (machine reconcile
pole had 3 excerpts) but the whole `discrepancy` object shipped null.

## Expected, not-a-bug validator output on a discrepancy-leaning row pre-T10
`DRY_RUN=1 IDS=<id> node .scripts/buildHarmonizationTables.js` will report exactly one
violation — `[parity_count] leaning pole (discrepancy) has 0 quote(s) < minority pole
(reconcile) N quote(s)` — on any discrepancy-leaning row T9 authors before T10 adds a
real critic quote. This is the deferred-to-T10 state the spec explicitly predicts; do
not try to silence it (setting `discrepancy.emptyNote` to force parity trips the worse
`parity_leaning_is_empty` violation instead — see TRANSFORM_SPEC.md's "Consequence you
must accept, not fix").

## `reconcile.note` authoring is independent of the row's lean
Rule from the scope boundary: `reconcile.note` is written whenever the machine file's
reconcile pole has ≥1 excerpt — **regardless of whether the row is reconcile- or
discrepancy-leaning**. Only `discrepancy.emptyNote`/`emptyNoteAttr` are lean-gated
(reconcile-leaning only). Don't skip `reconcile.note` just because the row turned out
to be discrepancy-leaning.
