---
name: Pass-14 publisher-metadata convergence
description: Pass-14 of batch_18 returned 0 errors after exhaustive publisher-imprint sweep; trajectory pass 12=1, 13=3, 14=0 suggests publisher class exhausted
type: feedback
---

Pass 14 of batch_18 (after pass 13 caught 3 publisher errors: Geisler-Howe Victor-not-Baker × 2, Dobbs-Allsopp WJK precision) returned 0 errors. Trajectory: pass 12=1, 13=3, 14=0.

**Pass-14 batch_18 sweeps completed**:

Augsburg/Fortress merger (1988): all citations verified:
- Bonhoeffer Psalms (Augsburg 1970, pre-merger) ✓
- Brueggemann Message of Psalms (Augsburg 1984, pre-merger) ✓
- Brueggemann Prophetic Imagination 2nd (Fortress 2001, post-merger) ✓
- Sanders Paul and Palestinian Judaism (Fortress Philadelphia 1977, pre-merger uses Philadelphia) ✓
- Stendahl Paul Among Jews (Fortress Philadelphia 1976, pre-merger) ✓
- Knohl Sanctuary of Silence (Fortress Minneapolis 1995, post-merger) ✓
- Allison New Moses (Fortress Minneapolis 1993, post-merger) ✓
- Wright Paul and Faithfulness of God (Fortress Minneapolis 2013) ✓
- Achtemeier 1 Peter Hermeneia (Fortress Minneapolis 1996) ✓
- Attridge Hebrews Hermeneia (Fortress Philadelphia 1989) ✓
- Hossfeld-Zenger Psalms 2/3 (Fortress Minneapolis 2005/2011) ✓
- Luz Matthew 1-7/8-20 Hermeneia (Fortress Minneapolis) ✓
- Jewett Romans Hermeneia (Fortress Minneapolis 2007) ✓
- Bovon Luke 2 Hermeneia (Fortress Minneapolis 2013) ✓
- Betz Sermon on Mount (Fortress Minneapolis 1995) ✓
- Tov Textual Criticism 3rd ed (Fortress Minneapolis 2012) ✓
- Moxnes Economy of the Kingdom (Fortress Philadelphia 1988) ✓

Westminster/JKP merger (1988): all citations verified:
- Crenshaw Ecclesiastes OTL (Philadelphia: Westminster, 1987 pre-merger) ✓
- Berlin Lamentations OTL (Louisville: WJK 2002) ✓
- Zenger God of Vengeance (Louisville: WJK 1996) ✓
- Dobbs-Allsopp Lamentations Interp (Louisville: WJK Press 2002) ✓ (pass-13 fix verified)
- Nelson Joshua OTL (Louisville: WJK 1997) ✓
- Roberts Nahum/Hab/Zeph OTL (Louisville: WJK 1991) ✓
- Crenshaw OT Wisdom 3rd ed (Louisville: WJK 2010) ✓

AB → AYB transition (2007): all citations verified consistent with publication year:
- Pope Job AB 15 3rd ed (Doubleday 1973) ✓
- Furnish 2 Cor AB 32A (Doubleday 1984) ✓
- Fox Proverbs 1-9 AB 18A (Doubleday 2000) ✓
- Fox Proverbs 10-31 AYB 18B (Yale 2009) ✓
- Seow Ecclesiastes AB 18C (Doubleday 1997) ✓
- Cogan 1 Kings AB 10 (Doubleday 2001) ✓
- Cogan-Tadmor 2 Kings AB 11 (Doubleday 1988) ✓
- Greenberg Ezekiel AB 22A (Doubleday 1997) ✓
- Blenkinsopp Isaiah 56-66 AB 19B (Doubleday 2003) ✓
- Propp Exodus AB 2 (Doubleday 1999) ✓
- Andersen Habakkuk AB 25 (Doubleday 2001) ✓
- Fitzmyer Romans AB 33 (Doubleday 1993) ✓
- Fitzmyer 1 Corinthians AYB 32 (Yale 2008) ✓
- Malherbe Thessalonians AB 32B (Doubleday 2000) ✓
- Koester Hebrews AB 36 (Doubleday 2001) ✓

Reprint-imprint conflation check: Geisler-Howe When Critics Ask (Victor 1992) ✓ pass-13 fixes verified for entries 342 and 345

WBC publisher transitions (Word Books Waco → Word Books Dallas → Thomas Nelson Nashville → Zondervan): all verified:
- Bruce 1&2 Thess WBC 45 1982 (Waco: Word Books) ✓
- Dunn Romans 1-8 WBC 38A 1988 (Dallas: Word Books) ✓
- Lane Hebrews 1-8 WBC 47A 1991 (Dallas: Word Books) ✓
- Lane Hebrews 9-13 WBC 47B 1991 (Dallas: Word Books) ✓
- Murphy Ecclesiastes WBC 23A 1992 (Dallas: Word Books) ✓
- Murphy Proverbs WBC 22 1998 (Nashville: Thomas Nelson) ✓
- Aune Revelation 6-16 WBC 52B 1998 (Nashville: Thomas Nelson) ✓
- Clines Job 21-37 WBC 18A 2006 (Nashville: Thomas Nelson) ✓
- Clines Job 38-42 WBC 18B 2011 (Nashville: Thomas Nelson) ✓

**Why:** When pass-13 catches 3 publisher errors at three distinct merger boundaries (Victor→Baker, JKP→WJK, plus standing concerns), pass-14 systematic verification of every publisher-imprint in the batch typically achieves convergence. The publisher-metadata class is a finite list that, once swept exhaustively, can be confirmed clean.

**How to apply:** Pass-14 trajectory pattern (3 → 0) confirms that systematic publisher-imprint sweep after pass-13's productive catches achieves true zero. When trajectory is N → 0, do not manufacture pseudo-errors; mark batch CLEAN and trust the convergence.

**Confidence level on publisher class for batch_18**: HIGH. Every imprint cross-checked against publisher records (Brill, Mohr Siebeck, OUP, Cambridge, Eerdmans, IVP, Baker, Fortress, WJK, Doubleday, Yale, Thomas Nelson, Word Books, Scholars Press, Bloomsbury T&T Clark).
