---
name: fabricated-verbatim-quote-real-skeptic
description: a named_skeptic connective can put a fabricated direct quotation in a REAL, on-topic critic's mouth even when the critic genuinely engaged the passage — verify quoted phrases, not just the critic's existence/topic-fit
metadata:
  type: feedback
---

**id 387 (Who was Jesus's paternal grandfather? Matt 1:16 Jacob vs Luke 3:23 Heli),
2026-07-02:** distinct failure mode from [[sonnet-named-skeptic-fabrication]]'s
not_real/strawman cases. Here **Bart D. Ehrman is real** and **does** substantively
engage this exact genealogy line — archive.org full-text of *Jesus, Interrupted*
(item `jesusinterrupted00ehrm_0`, fetched via the djvu.txt stream URL) confirms he
lays out "In Matthew the family line goes from Joseph to Jacob to Matthan to Eleazar
to Eliud... In Luke it goes from Joseph to Heli to Mathat to Levi to Melchi" and
treats it as a genuine, unreconciled discrepancy. So the topic-fit check alone would
pass him.

**The specific failure:** the connective wrapped a fabricated phrase in quotation
marks and attributed it to him verbatim — `is 'a bridge too far,' leaving Jacob and
Heli irreconcilable`. A full-text search of the book (`bridge` query) found **no such
phrase anywhere**. WebSearch/WebFetch traced the actual phrase to **James Bejon's
Substack** ("Jesus' Genealogies"), a different (non-skeptic, harmonization-analysis)
writer discussing the *same* Matthan/Matthat–Eleazar/Levi reconciliation problem —
Bejon's own words: "Levi is another name for Eleazar, Eliud for Melchi, Achim for
Jannai (etc.), seems a bridge too far." Ehrman never wrote this; it was lifted from
elsewhere and dressed up as his direct quote.

**How to apply:** when a discrepancy connective puts a phrase in quotation marks and
attributes it to the named skeptic, treat that as a load-bearing claim needing its
own verification pass — separate from "is this critic real and on-topic." Try (1)
archive.org's search-inside API (`/fulltext/inside.php`, see
[[archive-org-fulltext-search-technique]]) or the item's `_djvu.txt` full-text stream
for the exact phrase; (2) WebSearch the exact quoted phrase in quotes. If the phrase
doesn't surface inside the named work but surfaces verbatim on an unrelated site, it
is a fabricated/misattributed quote even though the underlying ARGUMENT attributed to
the skeptic may be substantively accurate. Score this `connectives: flag` **and**
`named_skeptic: strawman` (closest available code — "fairly represented" is violated
by inventing testimony, even without distorting the substance) — not `ok`.

**Codebook nuance:** `not_real`/`strawman` were previously used only for (a) invented
critics or (b) critics attached to a tension/objection scope they never pressed. This
extends the family to (c) real critic + real correct topic engagement + a **specific
fabricated verbatim quotation**. Default to `strawman` for (c), same as (b), since the
guardrail language ("fairly represented... no strawmanned objection") covers put-words-
in-mouth fabrication too.

**Same-row deeper_learning was clean and cross-checked the archive.org technique
again:** Haley's *Examination of the Alleged Discrepancies* (1874, item
`examinationof00hale`) genuinely treats Jacob-vs-Heli via the Mary's-genealogy
(daughter of Heli) reading — search-inside hit landed on leaf 342, and per the
established leaf−16 offset for this item ([[archive-org-fulltext-search-technique]]),
342−16=326, matching the pd_work note's cited "pp. 325-326" almost exactly. Good
worked example of the offset trick generalizing across ids.
