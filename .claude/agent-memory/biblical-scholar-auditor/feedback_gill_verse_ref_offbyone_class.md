---
name: gill-verse-ref-offbyone-class
description: Recurring class in the harmonization audit — Gill excerpt verse_ref/full_note_ref (and sometimes deeper_learning pd_work) is off by one verse from where the embedded note text actually sits
metadata:
  type: feedback
---

The harmonization TRANSFORM pass mislabels Gill's verse pointer by one verse with some
regularity — the embedded `source_note_text` is genuinely verbatim Gill, but the
`verse_ref`/`full_note_ref` (and occasionally `deeper_learning.defense.pd_work.resource`)
point at the wrong verse. Three confirmed instances so far:

- **id 160**: excerpt claims Deut 3:25, embedded text is Gill on **3:26** ("wroth with me
  for your sakes" / Meribah). Deut 3:25 is purely geographical. The mislabel **persists into
  pd_work** too ("on Deuteronomy 3:25"). → deeper_learning=**flag**. See [[gill-deut-verse-offset]].
- **id 128**: excerpt claims Prov 27:8, embedded text is Gill on **27:9** (the "ointment and
  perfume" two-oils note). Here pd_work correctly cites 27:9 — only the excerpt-level
  verse_ref drifted. → E-line reason notes the mislabel but deeper_learning stayed **ok**
  (0), since pd_work's own pointer was accurate.
- **id 342**: excerpt claims Job 42:10, embedded text is Gill on **42:11** ("comforted him
  over all the evil that the Lord had brought upon him" — the exact epilogue clause this
  row turns on). Job 42:10 is the unrelated "Lord turned the captivity of Job" verse. The
  mislabel **persists into pd_work** too ("Gill ... on Job 42:10"). → deeper_learning=**flag**.
- **id 348**: excerpt claims Psalms 18:40 (full_note_ref="GILL/19/18/40"), embedded text is
  Gill on **18:41** ("They cried, but there was none to save them... even unto the Lord, but
  he answered them not... Pro 1:28"). Verified verbatim via biblehub.com/commentaries/gill
  /psalms/18.htm, which explicitly attaches this note to Ps 18:41. deeper_learning stayed
  **ok** — pd_work here is Haley (not a Gill citation) and independently, correctly cites
  pp. 70-72 with no verse-number dependency on the Gill mislabel. → E-line flag only
  (action: fix verse_ref to 18:41).

- **id 394**: excerpt claims Luke 2:38 (full_note_ref="GILL/42/2/38"), embedded text is Gill
  on **2:39** ("they returned into Galilee: not that they came from thence to Jerusalem, but
  from Bethlehem... dwelt at Nazareth" — the Bethlehem-then-Egypt-then-Nazareth itinerary
  harmonization). Luke 2:38 is the unrelated Anna-the-prophetess verse. Verified via
  biblestudytools.com Gill archive. deeper_learning stayed **ok** — pd_work is Haley 1874
  (verified via archive.org search-inside, `examinationof00hale` pp. 429-430, "order of
  events"/Strauss objection), independent of the Gill verse number. → E-line flag only
  (action: fix verse_ref/full_note_ref to Luke 2:39).

**Why:** likely a chapter/verse-boundary parsing artifact in the Gill note ingestion — Gill's
per-verse commentary blocks sometimes open mid-clause or span two adjacent verses, and the
transform pass anchors to the wrong side of the boundary.

**How to apply:** for every Gill excerpt, independently confirm via a live Gill mirror
(biblestudytools.com/commentaries/gills-exposition-of-the-bible/<book>-<ch>-<v>.html is
reliable for WebFetch) that the cited verse_ref's *own* commentary actually contains the
excerpt text — don't just trust that the embedded source_note_text is authentic (it usually
is; the floor script already checks that). If the embedded text belongs to an adjacent verse
instead:
- excerpt-level checks (in_source/on_tension/pole_label) are unaffected — judge the text
  itself, not its citation label — but say so in the E-line reason.
- deeper_learning: flag **only if** the same wrong verse also appears in
  `defense.pd_work.resource`/`.note` (the error "persists through" to the cited PD work).
  If pd_work independently cites the correct verse, deeper_learning stays ok and the mislabel
  is purely a housekeeping note on the E line.
