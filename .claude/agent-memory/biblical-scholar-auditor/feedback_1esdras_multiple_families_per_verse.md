---
name: 1 Esdras multiple-families-per-verse false positive
description: In 1 Esdras 5 a single verse lists MANY families; do not flag "same verse for two families" as fabrication
metadata:
  type: feedback
---

A recurring FALSE-POSITIVE pattern: auditors flag commentary citing "1 Esdras 5:13" for one family and "1 Esdras 5:13" for another family as a fabrication ("the same verse cannot supply two different families"). This premise is WRONG.

In 1 Esdras 5 the family roll is compressed so that a **single verse lists several families at once** (just as Ezra 2 lists Bebai/Azgad/Adonikam across consecutive verses, 1 Esdras packs multiple families per verse). Verified against ebible.org RV1895 (eng-rv/1ES05.htm):
- **1 Esd 5:13** lists Bani (648), **Bebai (623)**, AND **Astad/Azgad (1,322** main; footnote variants 3,622 / 3,222) — all in the same verse.
- **1 Esd 5:14** lists **Adonikam (667)**, Bagoi/Bigvai (2,066), Adin (454) — all in the same verse.

So two different families legitimately share a 1 Esdras verse number. This is NOT evidence of fabrication.

Confirmed correct alignments (do not re-flag):
- Bebai: 1 Esd 5:13 = 623, agrees with Ezra 2:11 (623) against Neh 7:16 (628) — two-against-one.
- Azgad: 1 Esd 5:13 = 1,322 main, close to Ezra 2:12 (1,222); Neh 7:17 = 2,322 — genuine three-witness spread.
- Adonikam: 1 Esd 5:14 = 667, agrees with Neh 7:18 (667) against Ezra 2:13 (666) — two-against-one.

**Why:** batch_03 commentary_fix pass-1 audit flagged all three (entries 322/323/324) as HIGH "needs_human" on the false premise that 5:13 / 5:14 could not serve two families. All three were verified correct via RV1895 and cleared in pass 3.

**How to apply:** Before flagging a 1 Esdras verse-and-number citation as fabricated, check ebible.org/eng-rv/1ES05.htm. Verify the SPECIFIC number, not the verse-sharing. Verse-sharing across families is normal in 1 Esdras 5. Pair this with [[1esdras_witness_split_fabrication]] (which catches the opposite error: fabricated "third number in some witnesses").
