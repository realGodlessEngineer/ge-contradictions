---
name: commentary_out empty scholarship[] parity gap
description: In the commentary_fix pipeline, commentary_out.scholarship is sometimes an empty array while the prose names multiple authorities; flag as medium parity gap
type: feedback
---

In the `data/commentary_fix/batch_NN.json` audit pipeline, each entry's `commentary_out` carries a structured `scholarship[]` array that should have parity with the authorities named in `commentary_out.commentary`.

**Pattern:** Occasionally `commentary_out.scholarship` is left as an empty array `[]` even though the prose names several scholars/commentaries AND the entry-level `scholarship` string field (the prior free-text bibliography) contains fully-formed citations for them. The structured block was simply not populated. This is a real parity defect, not cosmetic.

**Why:** Batch_02 entry 298 (Jer 36:30 / 2 Kings 24:6 Jehoiachin succession) had `commentary_out.scholarship: []` while the commentary named Lundbom (AB), Huey (NAC), Brueggemann, Holladay, Cogan-Tadmor, and the entry-level `scholarship` field listed all six with pages. Flagged medium → needs_human.

**How to apply:**
- When `commentary_out.scholarship` is empty but the commentary names authorities, flag medium (final = needs_human), since the apparatus has zero parity.
- Cross-check the entry-level `scholarship` string field — the verified citations usually already exist there and just need carrying over.
- Enforce volume scope-fit when reconstructing: Holladay on Jer 36 = Hermeneia Vol 2 (chs 26-52, 1989), not Vol 1 (1986); Lundbom on Jer 36:30 = AB 21B (chs 21-36, 2004). See [[feedback_holladay_jeremiah_volume_split]] and [[feedback_lundbom_volume_scope_jer22]].
- A lone `[verify page range]` placeholder left inside a citation's `pages` field (when volume/series/year are correct) is only LOW severity — the conservative section-locus substitution is the right call, not a substantive error.
