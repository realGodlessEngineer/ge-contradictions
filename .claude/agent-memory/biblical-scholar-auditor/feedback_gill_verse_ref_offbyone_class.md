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

- **id 423**: excerpt claims Matthew 9:21 (full_note_ref="GILL/40/9/21"), embedded text is Gill
  on **9:22** ("But Jesus turned him about,.... and the woman was made whole from that hour;
  her disease immediately left her" — the exact "from that hour"="immediately" harmonizing
  gloss this row turns on). Matt 9:21 is the unrelated "if I may but touch his garment" verse.
  Verified via biblestudytools.com Gill archive slug `matthew-9-22.html`. deeper_learning
  stayed **ok** — pd_work.resource independently and correctly says "note on Matthew 9:22."
  → E-line flag only (action note: fix verse_ref/full_note_ref to Matthew 9:22).

- **id 416**: excerpt claims Luke 8:44 (full_note_ref="GILL/42/8/44"), embedded text is Gill on
  **8:45** ("And Jesus said, who touched me?.... This he said, not as ignorant of the person
  that had done it, but in order to discover her to the people, and the cure she had received,
  as well as her faith" — the exact pedagogical-not-ignorant reading this row turns on). Luke
  8:44 is the unrelated "came behind him... touched the border of his garment" verse. Verified
  via biblehub.com/commentaries/gill/luke/8.htm. deeper_learning stayed **ok** — pd_work is
  Haley 1874 (verified via archive.org search-inside, `examinationof00hale`, "Omniscience"
  subsection pp. 111-113, heading "Knew all things. Ignorant of some things." on printed p.111,
  kenosis/two-natures language on printed p.113), which never cites a Luke 8 verse number so
  the offset doesn't propagate. → E-line flag only (action: fix verse_ref/full_note_ref to
  Luke 8:45).

- **id 420**: excerpt claims Matthew 9:8 (full_note_ref="GILL/40/9/8"), embedded text is Gill on
  **9:9** ("And as Jesus passed forth from thence,.... he saw a man named Matthew... The other
  evangelists call him Levi... he went by two names" — the exact Matthew/Levi two-names
  harmonization this row turns on). Matt 9:8 is the unrelated "multitude marvelled" verse from
  the preceding paralytic-healing pericope. Verified via biblehub.com Gill-on-Matthew-9 mirror.
  The mislabel **persists into pd_work** too ("Gill... on Matthew 9:8", even though the pd_work's
  own explanatory note correctly says "Matt 9:9/Mark 2:14 citation forms" — an internal
  self-contradiction confirming 9:8 is the error). → deeper_learning=**flag**. Discrepancy pole
  named_skeptic = D. F. Strauss, confirmed real and confirmed to press exactly this objection in
  *Life of Jesus* §72 "Calling of Matthew" (1846 Eng tr): apostle-catalogues give "many surnames
  and double names" elsewhere but omit "Levi"/"the publican" for Matthew — verified verbatim via
  archive.org full-text search-inside on `lifejesuscritic00eliogoog`.

- **id 414**: excerpt claims Matthew 6:30 (full_note_ref="GILL/40/6/30"), embedded text is Gill
  on **6:31** ("Therefore take no thought,.... That is, for the morrow, as it is explained, Luk
  6:34 for it is lawful to take proper care and thought for present food, drink, and raiment;
  but not to be anxiously concerned for futurity" — the exact lawful-care-vs-anxious-worry
  distinction this row turns on). Matt 6:30 is the unrelated grass-of-the-field/lily argument.
  Verified via biblehub.com/commentaries/gill/matthew/6.htm and biblestudytools.com
  matthew-6-31.html. deeper_learning stayed **ok** — pd_work is Haley 1874 ("Improvidence,"
  p. 281), which pairs Matt 6:19,25,34 with 1 Tim 5:8 and cites no Gill verse number, so the
  offset doesn't propagate; verified verbatim via archive.org fulltext search-inside on
  `examinationof00hale` (printed p. 280 heading "Improvidence.", table headed "Sanctioned. /
  Discouraged." quoting Matt 6:19,25,34 opposite 1 Tim 5:8 "denied the faith...worse than an
  infidel"). Discrepancy pole named_skeptic = Gerd Theissen ("wandering charismatics" /
  "love-patriarchalism" thesis, *The First Followers of Jesus*, trans. Bowden, SCM 1978) —
  confirmed real, work/translator/publisher/year all verified, and the application (itinerant
  radicalism vs. settled household provision as different historical stages) is a fair,
  non-strawmanned extension of his actual three-social-forms framework, not a direct verse
  commentary — acceptable for named_skeptic=ok since sociological-framework skeptics don't need
  a verse-by-verse quote, only a real, fairly-applied engagement with the same tension.

- **id 442**: new sub-case — the excerpt's own verse_ref is correct (Matthew 19:19, verified
  verbatim), but `deeper_learning.defense.pd_work.note` additionally claims "Gill treats the
  commandment-order variation directly at both Matthew 19:19 and **Mark 10:18**." Mark 10:18 is
  "Why callest thou me good?" (the deity/goodness question); the actual commandment-list note
  ("no first nor last in the law" / Rom 13:9 reordering) is Gill on **Mark 10:19**, confirmed via
  WebSearch (biblehub/studylight Gill mirrors). No excerpt exists for the Mark side to check
  against directly — this is a companion-verse citation error inside the pd_work prose itself,
  not an excerpt verse_ref/full_note_ref drift. → deeper_learning=**flag**.

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
