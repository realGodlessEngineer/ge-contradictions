---
name: project_harmonization_machine_pass
description: T5/T6 machine-excerpt TRANSFORM leg (data/harmonization/curation/machine/<id>.json) — schema drift vs TRANSFORM_CONTRACT.md, Haley-verification-via-curl+grep applies here too (incl. WebSearch-only false negatives, Grep -B/-C line-number pitfall), SAB precedent for thin genealogical entries
metadata:
  type: project
---

Companion to [[project_harmonization_dossier_t9]] / [[project_harmonization_dossier_t10]], but
for the **earlier** leg: producing `data/harmonization/curation/machine/<id>.json` straight from
`data/harmonization/gather/by_id/<id>.json`, per `data/harmonization/TRANSFORM_CONTRACT.md`
(worked id 313, 2026-07-02).

## Schema drift: most of the 348 existing machine/*.json files do NOT match the current contract
`TRANSFORM_CONTRACT.md`'s own worked example (and `TRANSFORM_SPEC.md` lines ~50-53, which the
contract explicitly defers to on conflict) say excerpt objects carry **only** `pole`,
`source_code`, `verse_ref`, `excerpt_text`, `full_note_ref`, `on_tension_rationale`,
`verify_state` — explicitly "do NOT copy author / work / year / attribution / license onto an
excerpt" and "do not repeat contradiction_id per excerpt." But sampling ~5 real files across the
corpus (ids 87, 171, 298, 459, 470 — both old-order and recently-modified-by-mtime) shows **every
one** adds `contradiction_id`, `author`, `work`, `year`, `attribution`, `license_code` to each
excerpt (the current contract's own worked example omits these). **Decision made for id 313:
dropped `author`/`work`/`year`/`attribution`/`license_code` from excerpts and the repeated
`contradiction_id`, matching the compact contract literally** — confirmed correct: id 326 (a
file from the Ezra/Nehemiah cluster memory below) already uses this same minimal excerpt shape,
so the compact shape is in fact the live/current convention, not a stale example; the older
verbose-excerpt files (87, 171, 298, 459, 470) are earlier-draft drift, not the target to copy.
`relabel_flag`/`relabel_reason` on the **reconcile** sub-object, however, IS the universal
corpus convention even though the contract's abbreviated example only shows it on
`discrepancy` — every sampled file (87, 171, 298, 326, 459, 470) sets it `false`/`null` on
both poles, so match that (added it to reconcile on 313 after first omitting it). Confirmed the
resulting 313.json parses and bakes cleanly: `DRY_RUN=1 IDS=313
node .scripts/buildHarmonizationTables.js` → exactly the two expected pre-T9/T10 violations
(`note_present`, `parity_count` — see below), `verifyExcerpts.py` 646/646 PASS including the
new excerpt. **Running the dry-run bake is a cheap, worthwhile sanity check on every future
machine-pass file** — it confirms the JSON shape round-trips through the real baker/validator,
not just that it matches a doc's prose description.

## Haley-verification-via-curl+grep applies to the machine leg too, not just T10
The [[project_harmonization_dossier_t10]] workflow (WebSearch/WebFetch to find the PD text,
then `curl` the raw `archive.org` `_djvu.txt` or Gutenberg `.htm` into scratch and `Grep`
locally — WebFetch's small-model summarizer unreliably "finds" or fails to find text inside
large PD works) is equally the right tool for the machine pass's **required**
`deeper_learning.defense.pd_work` field, which defaults to John Haley's *An Examination of the
Alleged Discrepancies of the Bible* (1874, archive.org id `examinationofall00hale`,
`_djvu.txt` at `https://ia601508.us.archive.org/10/items/examinationofall00hale/examinationofall00hale_djvu.txt`).
For id 313 ("sons of Heman," 1 Chr 25:4 vs 2 Chr 29:14) a full-text `Grep` for `Heman` inside
the curled djvu.txt came back **zero hits** — confirms Haley doesn't treat this passage at all
(consistent with the T10 memory's observation that dry genealogical/numeral minutiae are
under-served by the classic PD skeptic/harmonizer canon). Fell back correctly to the contract's
explicit alternative: "a harmonizing commentator already surfaced on the row, keyed to the
passage" — here Matthew Henry's own note on 2 Chronicles 29:12, which was already the row's
reconcile-pole excerpt author and treats this exact verse pair directly.

## Steve Wells / Skeptic's Annotated Bible is the default 439-model skeptic for obscure
## genealogical/name-list "contradictions"
For granular genealogy-cluster entries (bare name-list mismatches with no real theological
stakes — e.g. id 313's "sons of Heman," and by the pattern seen in ids 87/171/298/459/470
already in the corpus), no 19th-century PD polemicist (Paine, Ingersoll, Burr, Foote & Ball,
Remsburg) engages the specific pairing — these authors gravitate to theologically/morally
charged tensions, not bare genealogical rosters. **Steve Wells's Skeptic's Annotated Bible**
(skepticsannotatedbible.com, launched 1999; print edition 2013) is the real, verifiable,
directly-on-point source for this whole class: confirmed via direct `WebFetch` of
`skepticsannotatedbible.com/contra/<slug>.html` that the exact verse pairing is catalogued
there (id 313's page is `contra/sons_of_heman.html`, filed under "Fathers, Sons, and
Genealogies"). This is not a fallback-of-last-resort — it's the established, already-used
precedent across the corpus for this contradiction sub-type, and this repo's own scrapers
(`scrapeContra.js`) source from SAB directly, so these `contradiction_id` rows plausibly
originated from that exact SAB page. Attribution format used consistently: `name: "Steve
Wells"`, `work: "Skeptic's Annotated Bible"`, `year: "1999"`, `attribution: "Steve Wells,
Skeptic's Annotated Bible (1999), contra/<slug>.html"`.

## Parity-cap mechanics worked concretely (id 313)
`discrepancy_first` row, discrepancy pole = `named_skeptic` only (0 verbatim excerpts + 1 for
the connective = count 1) → reconcile pole capped to exactly **1** excerpt (the single
strongest — here Matthew Henry's note on 2 Chr 29:12, which explains the Levites named per
family in the cleansing account were zealous volunteers picked for the task, not an exhaustive
sons-roster) even though 2-3 other notes existed that were merely descriptive/off-tension and
were correctly excluded rather than padded in. Same mechanics confirmed again on id 325
(Ezra/Nehemiah Bigvai cluster; see [[project_harmonization_transform_ezra_nehemiah_cluster]]).

## Grep's `-B`/`-C` line numbers on a huge curled PD .txt can mismatch `sed`'s (id 325)
On a large PD full-text file pulled via `curl` (~1.3MB archive.org djvu.txt, ~42k lines,
`examinationof00hale_djvu.txt` — note a *second*, distinct archive.org identifier for the same
Haley book alongside the `examinationofall00hale` one already noted above; both are valid
mirrors), a `Grep` call with `-C 15` around a matched line reported a **line number range that
did not correspond to that content** when later checked with `sed -n '<range>p'` on the same
file (off by ~2700 lines, pointing at a wholly different section of the book). A second `Grep`
call on the *same* pattern **without** `-B`/`-C` reported the correct line number, which then
matched `sed`. Workaround: don't trust a single `-B`/`-C` grep's printed line numbers at face
value on a large downloaded PD text — suspect them if a subsequent plain-pattern grep or `sed`
at that line number shows different content, and prefer re-querying with a longer, more unique
literal substring (found via a first narrow grep, then re-run with `-B`/`-A` on that exact
substring) over trusting `-B N` context math off a fuzzier first hit.

## WebSearch-only Haley checks can false-negative on blanket-statement coverage (id 325)
The "Haley doesn't treat this passage" conclusion above (id 313, confirmed by a **full-text
Grep** coming back zero hits) is a different, stronger check than a **WebSearch-only** check —
and a WebSearch-only check can wrongly conclude "no coverage" when Haley's coverage is a
**blanket statement extending one named example to an unnamed class** rather than naming the
passage itself. Worked case: for the Ezra-2/Nehemiah-7 census cluster, an earlier pass (ids
326/330) used a WebSearch-only check, concluded Haley's coverage "could not be confirmed," and
fell back to Keil & Delitzsch as `pd_work` — but a subsequent curl+Grep full-text pass (id 325)
found Haley names the Arah variant explicitly, then adds "the other cases, some twenty in
number... are to be explained in the same manner," which licenses Haley for every clan in the
list. **Always prefer the curl+Grep full-text check over WebSearch alone before writing off
Haley's coverage** — see [[project_harmonization_transform_ezra_nehemiah_cluster]] for the full
correction and which not-yet-processed cluster ids still need it applied.
