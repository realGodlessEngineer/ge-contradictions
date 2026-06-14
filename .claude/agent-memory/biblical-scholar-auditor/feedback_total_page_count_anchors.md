---
name: Total-page-count anchor list for major commentaries
description: Verified page-totals for common commentaries; any citation exceeding upper bound is hallucinated
type: feedback
---

For citations with numerical page ranges, verify the upper bound does not exceed the volume's total pages. This anchor technique surfaced the Tsumura NICOT 2 Sam pp. 326-330 hallucination (book = 320pp).

**Why:** AI drafts often overproject page numbers beyond the actual volume. Page overflow is verifiable structural impossibility (High severity).

**How to apply:** Before accepting any specific page citation, cross-check against this anchor list. If a citation exceeds the upper bound, treat as hallucinated and either substitute correct pages (if known) or convert to bare-volume.

**Verified page totals (main matter, not including front matter / appendices):**

OT commentaries:
- Tsumura NICOT 2 Sam (Eerdmans, 2019) = **320 pp**
- Tsumura NICOT 1 Sam (Eerdmans, 2007) = 698 pp
- Knoppers AB 12 (1 Chr 1-9, Doubleday 2003) = **pp. 1-514** (continuous pagination)
- Knoppers AB 12A (1 Chr 10-29, Doubleday 2004) = **pp. 515-1045** (continuous with AB 12); ~530 pp
- Klein Hermeneia 1 Chr (Fortress 2006) = 539 pp
- Klein Hermeneia 2 Chr (Fortress 2012) = 559 pp
- Cogan AB 10 (1 Kings, Doubleday 2001) = 556 pp
- Cogan-Tadmor AB 11 (2 Kings, Doubleday 1988) = 393 pp
- Holladay Hermeneia Jer Vol 1 (chs 1-25, Fortress 1986) = ~682 pp
- Holladay Hermeneia Jer Vol 2 (chs 26-52, Fortress 1989) = ~542 pp
- Lundbom AB 21A (Jer 1-20, Doubleday 1999) = ~934 pp
- Lundbom AB 21B (Jer 21-36, Doubleday 2004) = ~772 pp
- Lundbom AB 21C (Jer 37-52, Doubleday 2004) = **624 pp** (not 640)
- Propp AB 2 (Exod 1-18, Doubleday 1999) = ~688 pp
- Levine AB 4A (Num 21-36, Doubleday 2000) = ~624 pp

NT commentaries:
- Davies-Allison ICC Matt Vol I (T&T Clark 1988, chs 1-7) = 731 pp
- Davies-Allison ICC Matt Vol II (T&T Clark 1991, chs 8-18) = ~810 pp
- Davies-Allison ICC Matt Vol III (T&T Clark 1997, chs 19-28) = **789 pp**
- Luz Hermeneia Matt 1-7 rev (Fortress 2007) = ~457 pp
- Luz Hermeneia Matt 8-20 (Fortress 2001) = ~615 pp
- Luz Hermeneia Matt 21-28 (Fortress 2005) = ~683 pp
- Brown Birth of Messiah (Doubleday 1993 new updated ed.) = ~752 pp
- Brown Death of the Messiah Vol 1 + 2 (Doubleday 1994) = 1608 pp total (2 vols)

Monographs / Reference:
- Schniedewind, How the Bible Became a Book (Cambridge 2004) = **xiv + 257 pp**
- Pagels, Origin of Satan (Random House 1995) = **xxiii + 214 pp**
- Wilson, Genealogy and History (Yale 1977) = **222 pp**
- Day, An Adversary in Heaven, HSM 43 (Scholars 1988) = **xi + 177 pp**
- Johnson, Purpose of Biblical Genealogies 2nd ed. (Cambridge 1988/1989) = x + 310 pp
- Grabbe LSTS 47, History Jews Second Temple Vol 1 (T&T Clark 2004) = **xxi + 471 pp**
- Grabbe Ezra-Nehemiah (Routledge 1998, OT Readings) = **220 pp**
- Klein Textual Criticism (Fortress 1974, Guides to Biblical Scholarship) = ~84 pp

**Critical structural insight: AB 12 + 12A have CONTINUOUS PAGINATION.** This means AB 12A page numbers correctly START at p. 515, not p. 1. Citations like "AB 12A pp. 740-757" are valid (not overflow) because 12A = pp. 515-1045. Do not flag 12A page numbers as overflow without checking against the continuous pagination scheme.

**Reference verification sources:** Eerdmans, Yale, Fortress, Doubleday/AB publisher catalogs; Internet Archive; JTS, JSS, CBQ, JSOT review records; Amazon listings; Cambridge Core; Brill, Routledge product pages.
