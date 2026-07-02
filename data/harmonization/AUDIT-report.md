# Harmonization excerpt sweep — sampled-audit report

**Posture (owner Decision A, 2026-06-14):** machine-excerpt + sampled audit. The mechanical floor checks *every* excerpt; the auditor agent judges a stratified sample for on-tension relevance and pole-label correctness.

## Mechanical floor (all 50 excerpts)
- verbatim + PD + traceable: **50/50 pass**, 0 fail

## Agent audit (sample: 289/50 excerpts, target 25%)

- overall: pass 285 · flag 4 · fail 0
- on-tension: on_tension 289 · weak 0 · off_tension 0
- pole label: correct 289 · should_flip 0 · no_stance 0

### Flags (ship, human glance)
- `333#0` — Verbatim Gill Neh 7:6 preface (ellipsis before Abendana/copyist-names clause preserves sense); explains the Ezra2-vs-Neh7 numeric-gap mechanism (attrition, late-joiners) underlying this exact 652-vs-642 shortfall; reconcile stance correct. FLAG: reconcile connective's "copying slips" cause is unsupported by this — Gill scopes copyist blame to NAME variants only ("as for difference of names, that may be owing to the carelessness of copiers"), never to the number gap; the excerpt's actual number-mechanisms are attrition/dying-en-route/late-joining only.
- `348#0` — Verbatim vs Gill on Ps 18:41 (confirmed biblehub.com/commentaries/gill/psalms/18.htm, exact wording incl. Sa1 28:6/Pro 1:28); reconcile reading (retaliation vs. wicked, not broken promise to sincere seekers) is on-tension and correct; but verse_ref/full_note_ref are mislabeled "18:40" — should be 18:41.
- `351#0` — Text verbatim in source_note_text (trailing ellipsis is a clean truncation, no sense-distortion); Gill's Psa 58:10 cross-ref directly reconciles this exact pair via public/private-enemy distinction. But verse_ref/full_note_ref mislabeled Prov 24:16 — the real Gill v.16 note ("a just man falleth seven times") is different text; this note opens "Rejoice not when thine enemy falleth," which is KJV Prov 24:17 (confirmed via biblestudytools Gill archive).
- `394#0` — Verbatim Gill harmonization (return to Bethlehem, then magi, then Egypt, then Nazareth) squarely on this itinerary tension, reconcile label correct; but verse_ref/full_note_ref cite Luke 2:38 while the note text ("they returned into Galilee...their own city Nazareth") is confirmed (BibleStudyTools Gill archive) to be his comment on Luke 2:39 - metadata mislabel by one verse.

## Discrepancy pole (Decision B: leave thin — verify thinness is honest)
- honest: 0 contradiction(s)

## Curation guardrails (mechanical scan, all rows)
- lean mislabeled vs consensus: 0
- parity violations (#2): 0
- connective missing (#5): 0
- discrepancy pole blank (#3/#4): 0
- defense PD-work exit missing (#36): 0
- defense live link off-allowlist (#36): 0

## Curation guardrails (agent audit, 288 contradictions reviewed)
- parity (#2): ok 288 · violated 0
- connectives (#5): ok 282 · flag 6
- named skeptic (#3): ok 283 · not_real 0 · strawman 2 · n/a 3
- discrepancy integrity (#4): ok 287 · co_opted 0 · relabel_ok 1 · relabel_missing 0
- deeper learning (#36): ok 283 · flag 5 · missing 0

> guardrail concerns flagged on id(s): 160, 209, 215, 333, 334, 342, 350, 351, 367, 382, 387 (see verdict files for reasons)

