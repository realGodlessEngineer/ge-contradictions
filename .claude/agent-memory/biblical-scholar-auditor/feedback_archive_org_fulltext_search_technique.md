---
name: archive-org-fulltext-search-technique
description: working technique to search INSIDE an archive.org scan's full text (e.g. Haley 1874) when djvu.txt only returns front matter
metadata:
  type: feedback
---

Prior audits (ids 10/15/175/298) repeatedly hit a wall verifying John Haley's *An
Examination of the Alleged Discrepancies of the Bible* (1874) on archive.org: fetching
`archive.org/download/<id>/<id>_djvu.txt` truncates to front-matter only, so specific
verse-level Haley coverage was routinely marked "unconfirmable" and defaulted to flag.

**Working alternative (confirmed 2026-07-02, audit id 320):** archive.org exposes a
search-INSIDE-the-book API that returns exact page hits + snippet text:

1. `GET https://archive.org/metadata/<item_id>` -> read `server` and `dir` fields.
2. `GET https://<server>/fulltext/inside.php?item_id=<item_id>&doc=<item_id>&path=<dir>&q=<term>`
   -> JSON `{ia, q, indexed, matches:[{text, page, ...}]}`.

For `examinationof00hale` this located page 396 ("Ezra ii. 5. Neh. vii. 10" +
"Most probably the difference is due to copyists' blunders") and page 397 ("The other
cases, some twenty in number, which appear from a comparison of Ezra ii. 6-60, with
Neh. vii. 11-67, are to be explained in the same manner") — confirming a pd_work note's
claim near-verbatim where djvu.txt had failed on the same book for other ids.

**How to apply:** before flagging a Haley (or any archive.org-scanned PD work) pd_work
as unconfirmable, try the search-inside API with 2-4 short targeted queries (a name, a
verse-citation string, a distinctive phrase) instead of only the djvu.txt dump. Note:
some search terms return `matches: []` even when the word IS in the book (OCR variance,
e.g. "Arah" and "Zattu" both came back empty for id 320 even though the surrounding
"Ezra ii. 5. Neh. vii. 10" context proves the passage is there) — don't treat one empty
query as proof of absence; try adjacent/alternate terms (verse-citation strings worked
better than proper names, likely OCR noise on capitalized Hebrew names).

**id 320 confirmed pass (Zattu Ezra 2:8/Neh 7:13, 945 vs 845):** McKinsey, Encyclopedia
of Biblical Errancy also verified real via tektonics.org/af/eznehnumb.php, which quotes
him directly: "out of approximately thirty-five subclans listed over half of the numbers
are in disagreement" — near-verbatim match to the work-file connective. This is a
mainstream-errancy-catalog McKinsey topic (like id 63 Isaac only-son) that DOES check
out, unlike the obscure-OT McKinsey defaults (ids 96/24/107/117/etc.) — the census/
numbers-list genre is squarely McKinsey's documented wheelhouse. [[sonnet-named-skeptic-fabrication]]

**Leaf-vs-printed-page offset trick (confirmed 2026-07-02, audit id 344, item
`examinationof00hale`):** the `page` field the search-inside API returns is the scan
**leaf** index, NOT the book's printed page number — there's a constant front-matter
offset (title page, preface, TOC, etc.) between them. Don't reject a pd_work citation
just because the API's `page` doesn't match the cited page number; compute the offset
first. Method: search for an early chapter heading whose printed page is visible in the
OCR snippet itself (e.g. "ORIGIN OF THE DISCREPANCIES. 5" — the trailing "5" is the
printed page), compare to the API's leaf number for that hit, and subtract. For
`examinationof00hale` the offset is a constant **16** (leaf 19 = printed p.3, leaf 21 =
p.5, leaf 45 = p.29, all leaf−16). This confirmed id 344's Haley pd_work citation
"Dwells in heaven. Dwells in Zion. (p. 103)" exactly — search-inside put the heading,
the "omnipresent Being may do both — dwell in eternity, and with men too" line, and the
Jer 23:24 quote all on leaf 119 (119−16=103), a 3-for-3 co-located verbatim match. Try
this offset check before flagging a Haley page number as wrong; other archive.org items
will have their own constant (re-derive per item_id, don't assume 16 elsewhere).

**Second confirmation + a near-miss (audit id 346):** searched "opprobrium", "malevolent
contempt", and "Gal. iii. 1" in `examinationof00hale` — all three landed on leaf 293
(the "Epithets of opprobrium" section, Matt 5:22 vs Matt 23:17/Luke 24:25/1 Cor 15:36/
Gal 3:1 — exactly the id-346 fool contradiction). 293−16=277, an exact match to the
pd_work's cited "p. 277". **I almost shipped this as a `deeper_learning: flag`** by
comparing the raw API leaf (293) straight to the cited page (277) without applying the
offset — always re-check this memory file and subtract 16 for `examinationof00hale`
BEFORE concluding a Haley page number is wrong; a 16-page delta on this specific item is
expected, not evidence of miscitation.

**Third confirmation, and a good way to self-verify the offset (audit id 338):** for the
Job 9:22/Ecclesiastes 7:15/Ezekiel 21:3 vs Ezekiel 18/33 cluster, the "Slays the righteous
with the wicked. Spares the righteous." header + "there is no collision between them"
resolution landed on leaf 104 (104−16=88, matching the pd_work's cited "pp. 88-89"), and
the "They surely live. Some of them die." / Eccl 7:15 entry landed on leaf 194 (194−16=178,
matching "p. 178"). Best trick found yet: search the book's own **back-of-book index**
(around leaf 484-490 for this item) for the same distinctive phrase — Haley's index lists
entries with their PRINTED page number already (e.g. "slays the good and spares them, 88"
and "they surely live, yet some die, 178"), so a hit there is a self-contained proof of the
printed page with no arithmetic needed, and cross-checks the leaf−16 formula for free.

**Fifth confirmation + best method found (audit id 388):** for the Matt 1:17 forty-two-
generations pd_work (cited "p. 389"), the inside.php search-inside API for "Generations,
forty-two" returned **leaf 404** — applying the leaf−16 offset gives 388, off by one from
the cited 389, which would have wrongly flagged a correct citation. Instead, `curl`ing the
raw `<id>_djvu.txt` straight to a local scratch file and `Grep`ping it directly for
"Jehoiakim"/"Jechonias" (bypassing both the WebFetch-summarized djvu.txt, which truncates
to front matter, and the inside.php leaf index, which is noisy/off-by-one at times) landed
on the exact paragraph, and the very next OCR line was the book's own running header:
**"HISTORICAL DISCREPANCIES. 389"** — a ground-truth printed page number with zero
arithmetic. **This is now the preferred method**: `curl -s -L
"https://archive.org/download/<id>/<id>_djvu.txt" -o <scratch>/x.txt` then `Grep` for a
few distinctive terms from the pd_work note, then `Read` a ~100-line window around the hit
— the running header (printed on every Haley page) is almost always within a few lines and
gives the page number directly, more reliably than either the leaf−16 formula or the
inside.php API alone. Keep the leaf−16 heuristic as a fallback/sanity-check, not primary.

**Sixth confirmation, exact-match jackpot (audit id 445, item `examinationof00hale`):** the
"Omnipotence" pd_work (Matt 28:18/John 3:35 "had all power" vs Matt 20:23/Mark 6:5 "was not
almighty," cited pp. 110-111) is a **direct djvu.txt line hit** — no leaf-offset arithmetic
needed this time, the plain-text dump itself contains the running headers. Grepping
`examinationof00hale_djvu.txt` for "Omnipotence" lands the section header, "Had all power.
Was not almighty." subheading, all four verse quotes, the exact line "The question is not
one of power at all, but of fitness," the Mark 6:5 "moral … not physical impossibility"
gloss, and closing citations to **Grotius, Chrysostom, Clarke, Barnes, and Alford** — all
five names — running header confirms p.110 ("110 DISCREPANCIES OF THE BIBLE") then p.111
("DOCTRINAL DISCREPANCIES. Ill", OCR misreads "111" as "Ill"). A pd_work note that lists
several classic-commentator names Haley cites (not just the section topic) is a strong
signal the drafting pass actually read the page rather than guessing — treat name-dropped
citation lists as a verifiable, checkable claim, not throwaway color.

**Seventh confirmation (audit id 444, Mark 10:35/Matt 20:20 best-seats):** pd_work cited
Haley p.347, "Historical Discrepancies" chapter, applying "qui facit per alium, facit per
se" (used for the Matt 8:5/Luke 7:8 centurion) to Zebedee's wife. `curl`ing the raw
djvu.txt and grepping "Zebedee" landed directly on leaf text reading "HISTORTCAL
DISCREPANCIES. 347" (OCR-garbled running header) immediately followed by "Upon the above
principle is to be explained the case of Zebedee's wife. She makes a certain request for
her sons, Matt. xx. 20; they make it for themselves, Mark x. 35." — verbatim topic match,
directly preceded on the same page by the centurion "Qui facit per alium, facit per se"
paragraph. The back-of-book index independently confirms: "Zebedee, wife, request, 347."
Two ground-truth proofs (running header + index), no leaf-arithmetic needed — the
raw-djvu.txt-grep method (id 388) is reliably the fastest path when it works.

**Eighth confirmation — one page, three discrepancies (audit id 464, Judas/potter's-field):**
p.347's "facit per alium, facit per se" passage is a **single paragraph chaining several
discrepancies** as parallel examples: centurion (Matt 8:5/Luke 7:8), Zebedee's wife (Matt
20:20/Mark 10:35), David/Uriah (2 Sam 12:9/11:17), Levites/Joshua (Deut 27:14-15/Josh
8:34-35), AND "So the priests bought the potter's field. Matt, xxvii. 6, 7; and Judas
purchased it, that is, furnished the occasion for its purchase. Acts i. 18" — confirmed via
raw djvu.txt grep for "potter" (line ~20558) with the running header "HISTORTCAL
DISCREPANCIES. 347" a few lines above, and the back-of-index line "Potter's  field,
purchasers,  347." Lesson: don't assume a `facit per alium` pd_work citation at p.347 is
wrong just because a prior audit (id 444) confirmed p.347 for a *different* verse pair
(centurion/Zebedee) — Haley genuinely stacks multiple discrepancies under one principle on
one page, so multiple ids can correctly cite the same page for different verse pairs.

**Fourth confirmation + a running-header shortcut (audit id 335):** for the Ezra 2:69/Neh
7:70-72 gold-silver-garments cluster, the pd_work cited "pp. 380-382." Searching "drams" /
"Tirshatha" / "41,000" / "priests' garments" all landed on **leaf 397** (397−16=381, inside
the cited range) with content matching the note almost word-for-word ("Gold, 61000 drams
(a copyist's mis-take)... Gold, from Tirshatha, 1,000 drams," "Silver, 5000 lbs. (a round
number)"). Two independent proofs, no arithmetic assumed: (1) the OCR on leaf 397 itself
picked up the book's own running page-header, **"HISTORICAL DISCREPANCIES. 381"** — Haley
prints the page number in the header of every page, so a search for the exact printed page
string doubles as a check (search `"<candidate-page>"` and see if it lands as a running
header on the same leaf as the content); (2) the back-of-index (leaf 482) has the entry
**"Gifts of returned captives, amount, 381."** — an exact-topic, self-contained proof. Do
NOT skip the offset step and compare a raw leaf number straight to a cited page (I almost
did this on id 335 too and nearly flagged a correct citation as miscited) — always convert
leaf→page (subtract 16 for `examinationof00hale`) or find the printed header/index proof
before concluding a Haley page number is wrong.

**Ninth confirmation (audit id 449, item `examinationof00hale`):** the Matt 21:2 ass-and-colt
/ Zechariah 9:9 triumphal-entry pd_work cited Haley p.155. `curl`ing the raw djvu.txt and
grepping "colt" landed directly on the block printing Matt 21:2-3 / Mark 11:2-3 / Luke
19:30-31 in three parallel columns, with the running header **"DOCTRINAL DISCREPANCIES.
155"** (split across OCR lines) immediately above it, followed by "This is simply an example
of three independent veracious witnesses, each telling his story in his own way." Ground-truth
printed-page match, no leaf-arithmetic needed — the raw-djvu.txt-grep method (id 388) keeps
working reliably on this item.

**Eleventh confirmation — a DIFFERENT archive.org item ID for the same Haley book
(audit id 490, item `examinationofall00hale`, NOT `examinationof00hale`):** a work file
cited this alternate item id (note the "all") for the Matt 20:29-34/Mark 10:46/Luke 18:35
blind-man-or-men + entering/leaving-Jericho pd_work, claimed pp. 386-387. This item has
its own metadata (`server=ia601508.us.archive.org`, `dir=/10/items/examinationofall00hale`)
and its own leaf→page offset — do NOT assume the `examinationof00hale` offset (16) applies.
Method used: `inside.php` search for `"Historical Discrepancies"` (quoted) returns EVERY
running-header hit across the whole chapter in one call, each with its OCR'd printed-page
suffix (e.g. `"HISTORICAL DISCREPANCIES. 385"` at leaf 403, `"...387"` at leaf 405) — from
which the offset falls out directly (**leaf−18** for this item) without needing curl/grep.
A follow-up query for `"departure from it"` landed leaf 404 (→ printed 386), and the
returned snippet was a verbatim match to the pd_work's summary: "some think there were
three blind men healed, — one when Jesus entered the city, the other two when he left it;
others suppose that two were healed, — one in the approach to Jericho, the other in the
departure from it, ... and that Matthew, greatly condensing the narrative, speaks of both
events as if occurring during the departure ... Others give to the Greek verb in Luke the
sense to be nigh or near ... Mark and Luke mentioning only the better known of the two."
Exact 3-for-3 match to the cited "pp. 386-387," three harmonizing options, and "better
known of the two" detail. Lesson: **check the exact item_id string before applying a
previously-derived offset** — `examinationof00hale` and `examinationofall00hale` are two
separate scans of the same book with different offsets (16 vs 18); the quoted-phrase
chapter-header search is a fast, curl-free way to derive a fresh offset from scratch.

**Tenth confirmation (audit id 463, Judas' death — hanging vs bursting, item
`examinationof00hale`):** pd_work cited Haley pp. 349-350, heading "Judas' death, — one
manner. A diverse statement.," the rope/limb-breaking harmonization, citing "Prof. Hackett['s]"
on-site cliff measurements above the valley of Hinnom. A proper-noun search for "Iscariot"
returned **zero** grep hits (OCR/Haley's own prose renders him only as "Judas," never
"Iscariot," in this section) — retried with "Judas" and landed directly on the passage: running
headers **"HISTORICAL DISCREPANCIES. 349"** then "350 DISCREPANCIES OF THE BIBLE." bracket it,
and the body is a near-verbatim match to the pd_work note — "Prof. Hackett, who recently
visited the supposed scene of this tragic event... found by measurement to vary from
twenty-five to forty feet almost perpendicular height." Exact page match, no offset arithmetic
needed. Lesson: if a proper-noun search comes up empty, retry with the more generic/common term
before concluding the topic is absent — this is now a second confirmed case (alongside the
"Arah"/"Zattu" note above) of OCR/authorial-usage dropping the expected search term.
