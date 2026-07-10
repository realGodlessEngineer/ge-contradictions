---
name: feedback_gill_verse_ref_pattern
description: Systemic harmonization-transform bug — Gill excerpt verse_ref/full_note_ref (and sometimes deeper_learning pd_work) is off by one verse from where the embedded note text actually sits
metadata:
  type: feedback
---

The harmonization TRANSFORM pass mislabels Gill's verse pointer by one verse with
real regularity — the embedded `source_note_text` is genuinely verbatim Gill, but
`verse_ref`/`full_note_ref` (and occasionally `deeper_learning.defense.pd_work`)
point one verse off from where that text actually sits. **18+ confirmed instances**
across the audit: id 160 (Deut 3:25→26, "wroth for your sakes"/Meribah — mislabel
persists into pd_work → flag), id 128 (Prov 27:8→9, ointment note — pd_work
independently correct → E-flag only), id 342 (Job 42:10→11, "comforted him" —
persists into pd_work → flag), id 348 (Ps 18:40→41 — pd_work is Haley, unaffected),
id 351 (Prov 24:16→17, "rejoice not"/enemy-falleth — persists into pd_work → flag),
id 394 (Luke 2:38→39, Bethlehem-Egypt-Nazareth itinerary — pd_work is Haley,
unaffected), id 404 (Matt 4:17→19, "follow me" — E-flag only), id 423 (Matt
9:21→22, "from that hour" — pd_work independently correct), id 416 (Luke 8:44→45,
"who touched me" — pd_work is Haley, unaffected), id 420 (Matt 9:8→9, Matthew/Levi
two-names — persists into pd_work, internally self-contradictory → flag), id 414
(Matt 6:30→31, anxious-care distinction — pd_work is Haley, unaffected), id 442
(pd_work note itself cites companion-verse Mark 10:18 instead of 10:19 — flag,
no excerpt-side error), id 446 (1 Tim 2:5→6 — persists into pd_work → flag), id
456 (Matt 26:33→34, cock-crow prediction — E-flag only), id 467 (Matt 27:27→28,
scarlet/purple robe — pd_work unversed, unaffected), id 471 (Matt 27:43→44,
thieves-revile — E-flag only), id 489 (Luke 8:30→31, "not command them to go" —
persists into pd_work → flag), id 601 (Luke 6:25→26, "when all men shall speak
well of you"/false-prophets woe — persists into pd_work note → flag both).
Counter-example: id 77 Deut 4:26 verse_ref checked
and found CORRECT — errors are real but not universal, always verify rather than
assume either way.

**Why:** likely a chapter/verse-boundary parsing artifact in Gill note ingestion —
Gill's per-verse commentary blocks sometimes open mid-clause or span two adjacent
verses, and the transform pass anchors to the wrong side of the boundary.

**How to apply:** for every Gill excerpt, independently confirm via a live Gill
mirror (biblestudytools.com/commentaries/gills-exposition-of-the-bible/<book>-<ch>-<v>.html,
or biblehub.com/commentaries/gill/<book>/<ch>.htm) that the cited verse_ref's *own*
commentary actually opens with the excerpt's wording — don't just trust the
embedded source_note_text is correctly labeled (it usually IS verbatim Gill; the
mechanical floor already checks authenticity, not the verse pointer).
- excerpt-level checks (in_source/on_tension/pole_label) are unaffected by a
  mislabel — judge the text itself, note the drift in the E-line reason.
- deeper_learning: flag **only if** the same wrong verse also appears in
  `defense.pd_work.resource`/`.note` (the error "persists through"). If pd_work
  independently cites the correct verse (or is a non-Gill source like Haley),
  deeper_learning stays ok and the mislabel is purely an E-line housekeeping note.
