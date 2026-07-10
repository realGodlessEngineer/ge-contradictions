---
name: feedback_deeper_learning_pdwork_verse_fabrication
description: Harmonization deeper_learning pd_work notes can be real+on-topic overall but still embed a fabricated/wrong verse citation inside the note text — check the note's specific verse list against the source, not just whether the source treats the tension.
metadata:
  type: feedback
---

On id 557 (1 Thess 4:15-17 imminence vs 2 Thess 2:2-3 "not at hand"), the
`deeper_learning.defense.pd_work` note claimed Haley 1874 "tabulat[es] 1 Thess
4:15-17/5:1-3 against 2 Thess 2:1-3 and 2 Pet 3:7-9." Haley's actual table
(archive.org `examinationof00hale`, pp.134-135, headed "His coming at hand. /
It was far off.") cites 1 Cor 15:51-52, Phil 4:5, **1 Thess 4:15**, and
**1 Pet 4:7** on the "at hand" side against **2 Thess 2:2-3** on the "far off"
side — there is no 2 Peter 3 anywhere near that discussion (confirmed via
archive.org search-inside: zero "Peter"/"2 Pet" hits on pp.148-153). The note's
core claim (Haley treats this exact tension, names Baur's charge, answers via
De Wette/Davidson/Andrew Fuller) was verbatim-verified true — but the specific
verse-citation detail ("2 Pet 3:7-9" for what is actually "1 Pet 4:7", and an
inflated "4:15-17/5:1-3" for what is actually just "4:15") was fabricated/
drifted, likely a citation hallucination bolted onto an otherwise-real note.

**Why:** the deeper_learning guardrail only asks "is pd_work real and
on-topic" — a note can pass that bar while still smuggling in a wrong verse
list that would mislead a reader who trusts the parenthetical citation detail.

**How to apply:** when verifying a deeper_learning pd_work note, don't stop at
confirming the work exists and discusses the tension — check every verse
reference embedded in the note's own description against the primary source
(archive.org search-inside). A real, on-topic work with a fabricated verse
detail inside its note = `deeper_learning: flag`, not `ok`. See also
[[feedback_haley_1874_page_drift_and_ia_search_method]] for the search-inside
technique (metadata -> server/dir -> fulltext/inside.php beats djvu.txt
truncation via WebFetch; full djvu.txt download + local Grep works when the
inside.php snippets aren't enough context).
