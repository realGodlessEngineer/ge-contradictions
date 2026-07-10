---
name: haley-citation-conflation-with-excerpt-footnote
description: deeper_learning pd_work notes sometimes borrow a parallel-verse citation from the excerpt's own footnote and misattribute it to the PD work, inflating apparent rigor
type: feedback
---

Harmonization id 571 ("How long was Jesus in the tomb?", Matt 12:40 vs the
Fri-afternoon-to-Sun-morning passion timeline). `deeper_learning.defense.pd_work`
cited Haley 1874 as treating this under "Christ's entombment three days and
nights... A less time... Buried Friday; rose on Sunday," reconciling via
Oriental/Jewish inclusive day-counting, and claimed Haley supports this
"citing 1 Sam 30:12-13 **and Esth 4:16/5:1** as parallels, plus a modern
analogy from Edward Robinson's own quarantine experience."

**Verified via Internet Archive full-text search** (item
`examinationofall00hale`, server `ia601508.us.archive.org`, dir
`/10/items/examinationofall00hale`, `fulltext/inside.php` API — this scan IS
indexed, unlike the `examinationof00hale` scan noted in
[[haley-1874-page-drift-and-ia-search-method]]) that everything in the note
is real **except** the Esther half: Haley's actual footnote at p.414 reads
only "Compare 1 Sam. xxx. 12, 13." — a full-text search of the *entire book*
for "Esther" and "Esth" returns **zero matches**, so Haley never cites Esther
anywhere in this work. The Esth 4:16/5:1 citation is real, but it belongs to
the *excerpt's own* source_note_text (the JFB note on Matt 12:40 in the same
work file closes with "(See Sa1 30:12-13; Est 4:16; Est 5:1; Mat 27:63-64,
&c.)") — it appears the drafting pass cross-pollinated a citation from the
reconcile-pole excerpt's footnote into the deeper_learning pd_work note,
making Haley look like he cites a parallel he never mentions.

**Why:** This is a distinct fabrication mode from simple page drift or an
invented work — the *work* and the *topic-match* and *most* of the citation
detail are all genuinely real (heading, Robinson quarantine anecdote, and the
1 Sam 30:12-13 half all verified verbatim), which makes the single planted
detail easy to wave through on a skim. It reads as extra-rigorous precisely
because it cites two parallels instead of one.

**How to apply:** When a `pd_work.note` lists multiple supporting
cross-references (e.g. "citing X and Y"), verify **each one independently**
against the PD work's own full text — don't accept the pair just because one
half full-text-searches true. Also cross-check whether a suspicious added
reference actually appears in the *excerpt*'s own `source_note_text` in the
same work file; if so, the drafting pass likely borrowed it from there rather
than from the cited PD work itself. Verdict: `deeper_learning=flag` (not
`missing` — pd_work itself is real/on-topic), full diagnosis in the reason.
