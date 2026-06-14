---
name: Hermeneia TOC sweep findings (pass-10 batch_18 extension)
description: Hermeneia pagination-drift extension beyond HZ Psalms; Attridge Hebrews and HZ Psalms 2 Ps 92 also drift
type: feedback
---

Pass-10 extension of pass-9's Hermeneia pagination-drift discovery: when sweeping ALL Hermeneia citations in a batch against Project Muse TOCs, drift was found in volumes beyond Hossfeld-Zenger.

**Pass-10 batch_18 verified Hermeneia anchors**:

Attridge Hebrews (Fortress 1989, xxviii + 435 pp.):
- Hebrews 8:1-6 ("Sacrifice of Heavenly High Priest"): pp. 216-224
- Hebrews 8:7-13 ("Promise of New Covenant"): pp. 225-229
- Hebrews 12:1-3 ("Endurance of Faith's Perfecter"): pp. 353-358
- Hebrews 12:4-13 ("Suffering as Discipline"): pp. 359-365 [pass-10 fix: was 360-368]

Hossfeld-Zenger Psalms 2 (Fortress 2005):
- Psalm 92: pp. 434-445 [pass-10 fix: was 437-444]

Hossfeld-Zenger Psalms 3 (Fortress 2011):
- Psalm 121: pp. 315-331 [pass-10 fix: was 318-326]

Bovon Luke 2 (Fortress 2013, xliv + 663 pp.)
Betz Sermon on the Mount (Fortress 1995): First Antithesis Matt 5:21-26 begins p. 215
Luz Matthew 1-7 (Fortress rev. 2007, 472 pp.): First Antithesis on Killing 5:21-26 begins p. 233
Achtemeier 1 Peter Hermeneia (Fortress 1996, 464 pp.): Body Middle 2:11-4:11 = pp. 169-300 (granular TOC not available via web; cited p. 243 for 3:13-17 suggested by one secondary source)

**Why:** AI drafts consistently underestimate the start-page or overshoot the end-page of Hermeneia commentary pericope blocks by 2-3 pages. Some pericopes also span two TOC sections (e.g., Hebrews 8:6-7 crosses 8:1-6 / 8:7-13 boundary), which AI may then expand into a too-wide range.

**How to apply:** When auditing Hermeneia citations, especially in batches where pass-9+ has surfaced drift, verify each volume's pericope range against Project Muse TOC at muse.jhu.edu/book/[id]. Established anchors:
- Hermeneia Psalms 2 = book/45967
- Hermeneia Hebrews (Attridge) = book/45989
- Hermeneia Sermon on the Mount (Betz) = book/45975
- Hermeneia 1 Peter (Achtemeier) = book/45991
