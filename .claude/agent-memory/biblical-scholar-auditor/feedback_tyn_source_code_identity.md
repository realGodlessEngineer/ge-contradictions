---
name: feedback_tyn_source_code_identity
description: source_code "TYN" in harmonization excerpts = "Tyndale Open Bible Commentary" (PD, per bible_reference.db text_sources), NOT the 16th-c. reformer William Tyndale — don't flag as fabricated on that basis
type: feedback
---

Audited id 446 ("ransom for many or all"): the reconcile connective says
"Tyndale reads Mark's 'many' as Isaiah 53's idiom for 'all.'" My first
instinct was to WebSearch whether the historical Reformation-era William
Tyndale ever wrote an exposition of Mark 10:45 or Isaiah 53 — he didn't (his
completed OT work stopped at Jonah/2 Chronicles; Isaiah was never reached
before his 1536 execution), so this read as a likely fabricated attribution.

**It wasn't.** `TYN` is one of the harmonization corpus's seven core PD
commentary sources (`GILL`, `JFB`, `CLARKE`, `KD`, `MHC`, `TYN`, `GNV` — see
`.scripts/verifyExcerpts.py`'s `SEVEN` set and `data/harmonization/gather/
COVERAGE.md`, where TYN appears in nearly every row alongside the other six).
`bible_reference.db`'s `text_sources` table defines it explicitly:
`('TYN', 'commentary', 'Tyndale Open Bible Commentary', 'English', 'PD', ...)`
— a distinct, project-catalogued PD source, not the reformer's own writings.
(I could not independently corroborate "Tyndale Open Bible Commentary" as a
real-world title via WebSearch — it may be a lesser-known/obscure work, or a
labeling quirk baked in when the reference DB itself was built — but that
question is upstream of the harmonization sweep and out of scope for a
per-entry audit; treat the reference-DB attribution as authoritative at this
layer.)

**Why it mattered here:** id 446's audit *work file* only sampled the Gill
excerpt (446#0); the TYN excerpt for the same row lives in the un-sampled
`data/harmonization/curation/machine/446.json` ("The expression for many is
probably an allusion to Isa 53:12, where many means all (cp. Rom 5:15,
18-20)."), which matches the connective's claim exactly.

**How to apply:** (1) Don't flag a connective naming "Tyndale" as
skeptic-fabrication-style over-attribution without first checking whether it's
this project's `TYN` PD source, not the historical reformer. (2) When a
connective references a pole's *second* harmonizer/skeptic that isn't in your
sampled `excerpts[]`, it's fair game (and useful) to open
`data/harmonization/curation/machine/<id>.json` for the full unsampled row —
this is a local pipeline artifact, not "the DB," and checking it can resolve
what would otherwise be an unverifiable claim. Cross-reference
[[feedback_sonnet_named_skeptic_fabrication]] for the discrepancy-side
analogue of this same discipline.
