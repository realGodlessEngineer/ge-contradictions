---
name: haley-1874-page-drift-and-ia-search-method
description: Haley "Examination of the Alleged Discrepancies" (1874) page citations in harmonization deeper_learning drift ~15pp; verified via Internet Archive full-text search method
type: feedback
---

Harmonization contradiction id 350 ("Is wealth a sign of righteousness or of
wickedness?") cited John Haley, *An Examination of the Alleged Discrepancies
of the Bible* (1874) as the `deeper_learning` PD `pd_work`, claiming pp.
172-176 for the "worldly prosperity, a reward/a curse" discussion (Ps 112,
Prov 15:6, Mark 10:24-25, Luke 6:20-24, Luke 12:21, James 5:1-3).

**Verified via Internet Archive full-text search** (archive item
`examinationof00hale`, server `ia800706.us.archive.org`, dir
`/16/items/examinationof00hale`) that the actual content — "righteousness
... tends normally to worldly prosperity," "trust in riches," "in the house
of the righteous is much [treasure]" abutting "go to now, ye rich men, weep"
— clusters on **pp. 188-190** (with a related "temporary prosperity of the
wicked" discussion on pp. 196-197), not pp. 172-176. The work IS real and
genuinely on-topic (content match is near word-for-word), only the page
citation drifted (~15-18pp off).

**Why:** This is the same page-citation-drift failure class already
catalogued for modern commentaries ([[feedback_structural_page_overlap_signal]],
[[feedback_total_page_count_anchors]]) but extends it to 19th-c. PD
apologetics works used across the harmonization `deeper_learning` field —
Haley is a very frequently cited PD work in this pipeline (public-domain,
topically organized, exactly the kind of "commentators' own words" source
the sweep favors), so expect repeat citations of it across many ids.

**How to apply:** When auditing a Haley 1874 `pd_work` citation, don't just
confirm topical relevance — verify the page number too. Useful technique:
Internet Archive's full-text search API works even when WebFetch on the
plain `_djvu.txt` gets truncated/summarized by the fetch model:
1. `GET https://archive.org/metadata/<item_id>` → read `server` + `dir`.
2. `GET https://<server>/fulltext/inside.php?item_id=<id>&doc=<id>&path=<dir>&q=<phrase>`
   → returns JSON with exact page numbers per matched phrase (works on
   `examinationof00hale`; the `examinationofall00hale` scan returned
   "not yet indexed"). Search 3-4 short exact phrases from the work file's
   `note` field to triangulate the real page range.
Known-good anchor for future Haley 1874 citations on this specific topic:
worldly-prosperity-as-reward/curse = pp. 188-190 (+196-197 related), NOT
172-176.

**Second confirmed anchor (id 429, "Was John the Baptist Elijah?", audited
2026-07-02):** the "John identical with Elias. He was not Elias." heading
(Matt 17:12-13/Mark 9:13 vs. John 1:21) — with the "figurative, but not...
literal" / "spirit and power of the Tishbite prophet" / "if ye will receive
it" quotes — is on **printed p. 347**; only the closing clause "show that a
literal fulfilment was not intended" spills onto p. 348. A `pd_work` citing
bare "p. 348" for this entry should read **pp. 347-348**. Smaller drift than
the id-350 case (1pp vs ~15-18pp) but same failure class — flag, don't pass,
a single off-page-boundary citation. Verified via the same IA fulltext
technique (query `Elias` and `Tishbite` on `examinationof00hale`) plus a
direct `_djvu.txt` fetch cross-check (grep for "Tishbite" landed at line
20588, with the "347"/"348" running headers immediately bracketing the
entry).
