# Harmonization excerpt sweep — sampled-audit report

**Posture (owner Decision A, 2026-06-14):** machine-excerpt + sampled audit. The mechanical floor checks *every* excerpt; the auditor agent judges a stratified sample for on-tension relevance and pole-label correctness.

## Mechanical floor (all 402 excerpts)
- verbatim + PD + traceable: **402/402 pass**, 0 fail

## Agent audit (sample: 217/402 excerpts, target 25%)

- overall: pass 217 · flag 0 · fail 0
- on-tension: on_tension 217 · weak 0 · off_tension 0
- pole label: correct 217 · should_flip 0 · no_stance 0

## Discrepancy pole (Decision B: leave thin — verify thinness is honest)
- honest: 0 contradiction(s)

## Curation guardrails (mechanical scan, all rows)
- lean mislabeled vs consensus: 0
- parity violations (#2): 0
- connective missing (#5): 0
- discrepancy pole blank (#3/#4): 1
- defense PD-work exit missing (#36): 0
- defense live link off-allowlist (#36): 0

| id | lean | exp.lean | rec | disc | parity | conn-missing | disc-blank | defense-missing |
|----|------|----------|-----|------|--------|--------------|------------|-----------------|
| 23 | reconcile_first | reconcile_first | 3 | 0 | ok | — | yes | — |

## Curation guardrails (agent audit, 216 contradictions reviewed)
- parity (#2): ok 216 · violated 0
- connectives (#5): ok 216 · flag 0
- named skeptic (#3): ok 214 · not_real 0 · strawman 0 · n/a 2
- discrepancy integrity (#4): ok 216 · co_opted 0 · relabel_ok 0 · relabel_missing 0
- deeper learning (#36): ok 215 · flag 1 · missing 0

> guardrail concerns flagged on id(s): 160 (see verdict files for reasons)

