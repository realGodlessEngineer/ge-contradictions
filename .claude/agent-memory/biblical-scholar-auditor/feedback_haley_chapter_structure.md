---
name: haley_chapter_structure
description: John Haley's "Alleged Discrepancies of the Bible" (1874) has 3 chapters; verify which one a cited note actually falls in before trusting a "Doctrinal Discrepancies" label.
type: feedback
---

Haley's *An Examination of the Alleged Discrepancies of the Bible* (1874,
archive.org id `examinationof00hale`) is structured as three chapters, not
one:

- **Chapter I — Doctrinal Discrepancies** (pp. 55-218)
- **Chapter II — Ethical Discrepancies** (starts ~p. 219; e.g. the "Prayer.
  May be in public. Should be in private." table pairing Matt 6:5-6 against
  1 Kings 8:22-23, 2 Kings 4:33, Dan 6:10-11, 1 Tim 2:8, Luke 6:12, Acts 10:9
  is on **p. 231**, and the reconciling line "It is not publicity, but
  ostentation in prayer, which is prohibited... The motive, not the place,
  is the thing in question" is also p. 231)
- **Chapter III — Historical Discrepancies**

**Why:** id 411 (harmonization audit) had a `deeper_learning.defense.pd_work`
note that quoted this exact prayer table/line verbatim and correctly
(confirmed via archive.org fulltext-search, `/16/items/examinationof00hale`
server `ia600706.us.archive.org`) but mislabeled it as being in the
"Doctrinal Discrepancies" chapter — it's actually ch. II "Ethical
Discrepancies." The quote content was perfect; only the chapter attribution
was wrong. Flagged as a `deeper_learning` guardrail issue even though the
substance was accurate, per the project's general pattern of flagging
citation-attribution errors independent of content accuracy (see
[[feedback_structural_page_overlap_signal]], [[feedback_hess_jericho_ai_volume]]
for the same class of error in other sources).

**How to apply:** Whenever a harmonization/audit work file attributes a
Haley citation to "Doctrinal Discrepancies," verify the actual topic first —
prayer/ethics/duty-of-man topics are ch. II (Ethical), not ch. I. Use the
archive.org fulltext search technique ([[feedback_archive_org_fulltext_search_technique]])
to pull the surrounding page and check the running chapter header
(e.g. "ETHICAL DISCREPANCIES, 231" appears at the top of the matched page).
