---
name: feedback_clarke_1832_codebook_year
description: Adam Clarke "Commentary on the Bible (1832)" year is a fixed project-wide codebook convention in the harmonization pipeline, not a per-row miscitation to flag.
metadata:
  type: feedback
---

In the harmonization excerpt sweep (`data/harmonization/`), every Adam Clarke
citation uses the year **1832** — this is hardcoded in `voices.json`'s CLARKE
entry (`display`/`full_name`: "Adam Clarke, Commentary on the Bible (1832)")
and propagates identically across `curation/sample_machine.json`,
`gather/batch_*.json`, and every `audit/work/<id>.json` that cites Clarke
(confirmed uniform across id 102, id 336, and others).

Clarke's actual commentary was published serially 1810-1826 (completed before
his 1832 death — 1832 appears to be a conflation of publication year with his
death year, or reflects a specific later reprint edition). This is a real,
minor citation imprecision, but it is **baked into the shared codebook**, not
an error introduced by any single row's transform pass.

**Why:** flagging it per-row in [[audit trajectory]] entries would be
inconsistent (it appears in every Clarke-citing row across the whole 605-row
corpus) and is out of scope for the sampled audit's per-row guardrails
(AUDITOR_SPEC's checks are in_source/on_tension/pole_label + the 5
guardrails — none of them is "citation-year precision").

**How to apply:** when auditing a harmonization row that cites Adam Clarke,
do NOT flag the "(1832)" year as a miscitation/hallucination — it is a known,
uniform codebook value. If the codebook year itself ever needs correcting,
that's a `voices.json` edit, not a per-id audit fix.
