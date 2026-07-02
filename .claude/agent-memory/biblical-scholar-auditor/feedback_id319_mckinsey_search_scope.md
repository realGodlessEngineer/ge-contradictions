---
name: id319-mckinsey-search-scope-lesson
description: id 319 (Ezra 2:6 vs Neh 7:11 Pahath-moab) — self-correction lesson, ALWAYS search for a topic-specific tektonics rebuttal page before defaulting McKinsey to not_real
metadata:
  type: feedback
---

Audit id 319 (How many of Pahath-moab, Jeshua, and Joab's offspring returned from
Babylon? Ezra 2:6 2,812 vs Neh 7:11 2,818), 2026-07-02 — extends
[[sonnet-named-skeptic-fabrication]] and [[mckinsey-ezra-nehemiah-verified]] and
[[archive-org-fulltext-search-technique]].

**Self-correction, log the lesson.** My first pass searched only the general
tektonics EBE rebuttal index (`tektonics.org/af/ebestart.php`) and generic WebSearch
queries, found nothing Ezra/Neh-specific, and nearly shipped `named_skeptic=not_real` +
`deeper_learning=flag`. Before writing the verdict I checked sibling memory
([[mckinsey-ezra-nehemiah-verified]], id 329, same cluster) and found this EXACT
pairing already has a **dedicated tektonics rebuttal page**:
`tektonics.org/af/eznehnumb.php` ("Ezra 2 vs Nehemiah 7"), which opens by directly
quoting McKinsey: *"out of approximately thirty-five subclans listed over half of the
numbers are in disagreement"* — near-verbatim to this row's connective. named_skeptic
= ok, not not_real. I also independently re-ran the archive.org search-inside API
(`https://<server>/fulltext/inside.php?item_id=examinationof00hale&doc=examinationof00hale&path=<dir>&q=<term>`,
server/dir from `archive.org/metadata/examinationof00hale`) and got fresh, direct hits
confirming the Haley pd_work quote verbatim: p.396 "Most probably the difference is due
to copyists' blunders" (the Arah variant) and p.397 "The other cases, some twenty in
number, which appear from a comparison of Ezra ii. 6-60, with Neh. vii. 11-67, are to be
explained in the same manner." deeper_learning = ok, not flag. Full verdict: E pass /
G all-0.

**How to apply — before defaulting ANY McKinsey (or other cataloged skeptic) to
not_real:** (1) search `tektonics.org/af/<topic-slug>.php` guesses / WebSearch
`site:tektonics.org <topic>` for a DEDICATED rebuttal page, not just the general
chapter index — tektonics has topic-specific pages the index alone won't surface.
(2) For any Ezra-2-vs-Nehemiah-7 clan-count row specifically, McKinsey is CONFIRMED
real via `eznehnumb.php` — do not re-flag him as not_real for this cluster (ids
320/329/319 and likely siblings 333/334/338/344/346/350 etc. share this same
McKinsey attribution). (3) For a Haley pd_work quote on this same book
(`examinationof00hale`), ALWAYS try the search-inside API with 2-3 short exact-phrase
queries before flagging as unconfirmable — it has repeatedly recovered verbatim
confirmations that djvu.txt/HathiTrust/Google Books all failed to surface (see
[[archive-org-fulltext-search-technique]] for the full method + the leaf-vs-page
offset of 16 for this item).

**Note on [[mckinsey-ezra-nehemiah-verified]] (id 329) apparent inconsistency:** that
entry confirmed McKinsey real but still flagged the Haley quote as "unconfirmed" despite
[[archive-org-fulltext-search-technique]] already documenting the same p.396/397 hits
from id 320. That looks like an oversight in that audit pass, not a real discrepancy —
re-run the search-inside queries yourself rather than trusting a prior "flagged" verdict
at face value when the confirming technique is already on record.
