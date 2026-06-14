---
name: Pass 7 triple-2-plateau break to 0 in batch_24
description: After 3 consecutive passes at 2 errors with new error class each pass, pass 7 systematic class-sweep of named classes returned 0
type: feedback
---

When the trajectory shows 3+ consecutive passes at the same non-zero count (e.g., 2,2,2) and each pass surfaces a new error class, pass-N+1 should be an exhaustive class-sweep: enumerate every named work cited in the batch, verify volume scope, page range, pericope bounds, and chapter membership. If the prior 3 passes' error classes are all class-recurrences (e.g., ICC pericope bounds, Carson EBC volume bound, Bovon pericope anchors), a systematic class-by-class sweep often returns 0.

**Why:** Batch 24 pass 7 received explicit class-sweep directives (Carson EBC vol 9 within pp. 23-670; ICC Vol 3 Empty Tomb pericope 659-675; Marcus AYB 27A Mark 8-16 scope; Brown DM Vol 1/2 boundary at 879/880; Bovon Luke 3 anchor table). All swept clean. Provisional 0 after triple-2 plateau requires pass-8 confirmation per stopping rule.

**How to apply:** When triple-plateau breaks to 0, do NOT declare TERMINAL-CLEAN. Run pass-N+1 to confirm plateau. Trajectory must show at minimum 0,0 (single zero after non-zero is provisional). For batch_24, pass 8 should re-sweep all class anchors plus probe new classes (translator names, journal fascicle numbers, publisher imprint).
