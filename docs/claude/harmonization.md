# Harmonization pipeline (verbatim public-domain "both poles")

The current main line of work (branch `harmonization-producer-seam`). For each contradiction it
pairs verbatim public-domain quotes on two **poles**: the *reconcile* pole (commentators
harmonizing the texts) and the *discrepancy* pole (critics who say the tension is real), plus
verse-pair snippets. The output is three **baked** tables consumed by the external geBibleApp.

**Canonical specs — read these before changing behavior, don't restate them:**
- `docs/SPEC-contradictions-605-sweep.md` — the build contract (§3.2 dossier shape, §4 table
  schema = the shared interface with geBibleApp, §7 pole order, §10 acceptance gates).
  `docs/BRIEF-contradictions-605-sweep.md` is the earlier planning/ruling record.
- `data/harmonization/DECISIONS.md` — owner decisions (A: machine excerpt + sampled audit, not
  per-excerpt sign-off; B: the 439 model + relabel; guardrails).
- `data/harmonization/TRANSFORM_SPEC.md`, `TRANSFORM_CONTRACT.md`, `AUDITOR_SPEC.md`.
- `DATABASE.md` — column reference for the baked tables.

## Load-bearing invariant

**Curation JSON is the build INPUT; `contradictions.db` is a build OUTPUT.** Nobody hand-edits the
baked tables — edit the curation files and re-bake.

## Data flow

```
contradictions.db + bible_reference.db + data/harmonization/books_map.json
  --sweepHarmonization.py (mechanical JOIN, no LLM)-->  data/harmonization/gather/
  --transform agent (excerpt / pole-classify / score)-->
      data/harmonization/curation/machine/<id>.json   (gen-1 machine excerpts, reconcile pole)
      data/harmonization/curation/dossier/<id>.json   (SPEC §3.2 camelCase: notes, half-lines,
                                                       emptyNotes, verse pairs, HAND quotes)
  --buildHarmonizationTables.js-->  harmonization_row / harmonization_quote / harmonization_verse_pair
```

- `bible_reference.db` (the large root DB) **is** read here: it is the source of the seven PD
  commentary voices (codebook: `data/harmonization/voices.json`) and the WEB translation used for
  verse pairs. Scripts only read it.
- Discrepancy-pole critic quotes are hand-sourced from the vetted PD "well"
  (`data/harmonization/pd-critics-well.json`): `fetchWell.js` downloads it once into a local text
  corpus (`curation/_t10bundles/_well/`), `buildT10Bundles.js` builds per-id offline bundles, and
  agents extract quotes from disk rather than via WebFetch (WebFetch paraphrase was measured at
  ~29% fake-verbatim).
- Rows with no sourceable quote on a pole carry an **honest-absence editorial `emptyNote`**
  (+ attr) instead. These are authored in the db_manager **harmonization UI**
  (`/harmonization.html`), which writes only the dossier JSON; the operator then re-bakes.
- Workflow scripts (`harmonization*Workflow.js`, `harmonizationRemediate.js`) are Workflow-tool
  orchestration scripts for the T-numbered runs; `_t*` scripts and `curation/_t*.json` files are
  one-off run artifacts kept for provenance. `slimGather.js` is a diagnostic only (its filter
  hypothesis was disproven — do not wire it in).

## The baker (`buildHarmonizationTables.js`)

DROPs and rebuilds only the three `harmonization_*` tables. Scope: default = the 7 ratified pilots
(3, 4, 189, 439, 459, 468, 496); `ALL=1` = every id with a machine/dossier file (∩ DB rows with
`recommend_delete=0`); `IDS=…` explicit. `DRY_RUN=1` writes `curation/_bake_preview.json`, no DB
writes.

A real run is **fail-closed**: before any write, `validateHarmonization.js`'s
`validateProjection()` must pass, and `python .scripts/verifyExcerpts.py` and
`verifyVersePairs.py` must exit 0 (missing `python` fails the run). Then backup → transaction →
`PRAGMA foreign_key_check` → export. `verifyHandQuotes.py` is the network verbatim floor for
hand-sourced critic quotes (`source.kind == "hand"`).

Allowed verbatim normalizations in every floor: Unicode NFC, curly↔straight quotes, dash
unification, whitespace collapse, and `…` splitting into fragments that must each match.
**Never** paraphrase-as-quote; a quote that fails a floor is reverted, not reworded.

`validateHarmonization.js` is also imported by `db_manager/server.js` (blocklist, attr regex,
`reconcileFirstFor`) — keep its exports stable.

## Status / history

Per-task status and measurements (T8–T22, parity waivers, B-bucket triage) live in the commit log
and `data/harmonization/curation/` artifacts; `COVERAGE.md` under `gather/` tracks coverage.
