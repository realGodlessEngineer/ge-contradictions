---
name: Hossfeld-Zenger Hermeneia pagination drift
description: AI drafts consistently overshoot Hossfeld-Zenger Psalms 2/3 Hermeneia page ranges by 3-10 pages; verify against Project Muse TOC
type: feedback
---

Hossfeld-Zenger Psalms 2 (Pss 51-100) and Psalms 3 (Pss 101-150) Hermeneia volumes have a consistent AI-drafting drift pattern: cited page ranges are 3-10 pages too high relative to actual TOC.

**Verified TOC anchors** (from Project Muse muse.jhu.edu/book/45967 and book/45968):

Psalms 2 (Fortress 2005, xxvi + 553 pp.):
- Psalm 58: pp. 77-83
- Psalm 92: pp. 434-445

Psalms 3 (Fortress 2011):
- Psalm 121: pp. 315-331
- Psalm 132: pp. 454-468
- Psalm 136: pp. 502-510
- Psalm 143: pp. 569-579

**Pass-9 batch_18 drift pattern observed**:
- Psalm 58 cited 78-86 → actual 77-83 (drift +3)
- Psalm 132 cited 462-471 → actual 454-468 (drift +3 to +8)
- Psalm 136 cited 510-518 → actual 502-510 (drift +8)
- Psalm 143 cited 575-583 → actual 569-579 (drift +6)

**Pass-10 batch_18 additional drift**:
- Psalm 92 cited 437-444 → actual 434-445 (drift +3 start)
- Psalm 121 cited 318-326 → actual 315-331 (drift +3 start, -5 end / narrower sub-range)

**Why:** AI drafting routinely generates plausible-looking but inflated page numbers for HZ Hermeneia volumes, perhaps because the volumes are long (553 + 700+ pp.) so any 6-page range "looks right" — but actual psalm-by-psalm commentary blocks are tightly bounded.

**How to apply:** When auditing any Hossfeld-Zenger Hermeneia page citation, verify against the Project Muse TOC. The cited range is typically a few pages high. Apply same scrutiny to other Hermeneia volumes (Bovon Luke, Attridge Hebrews, Luz Matthew, Malherbe Thessalonians) — long-volume Hermeneia commentaries are systematically vulnerable to this drift class.
