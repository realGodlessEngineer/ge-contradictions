---
name: Pass-8 convergence diagnostic for late audit passes
description: When pass 7 already shifted to cosmetic-only fixes, pass 8 typically returns 0-1 errors and triggers stopping rule
type: feedback
---

When an audit batch reaches the cosmetic-only stage (pass 7 of batch_10 only fixed two minor subtitle/editor issues with no substantive errors), pass 8 generally returns 0-1 errors and the batch is genuinely clean. Trajectory for batch_10: 1, 4, 9, 2, 5, 2, 2, 0 across 8 passes. Trajectory for batch_11: 1, 5, 2, 6, 5, 7, 1, 1 — pass 8 caught a single CBQ first-page off-by-one (Wilson 435 → 436) that pass 7 had flagged but apparently failed to actually edit.

**Why:** Once pass 7 has cleaned subtitle precision and editor formatting, the remaining surface for further error discovery is essentially exhausted. Pass 8 functions as confirmation of convergence rather than further cleanup. However, the same flagged-and-fixed error can resurface if the prior pass's Edit silently didn't persist — pass 8 must re-verify the very fix the prior pass reported.

**How to apply:**
1. If pass N-1 found only cosmetic fixes AND pass N finds zero errors, declare CLEAN and stop.
2. The honest convergence diagnostic is: did the prior pass find substantive Vector A-E errors? If no, expect pass N to confirm clean.
3. CRITICAL: When the prior pass reported a cosmetic fix, pass N MUST re-verify that specific fix is actually present in the file — not just assume the Edit landed.
4. Pass N finding 1 error that exactly matches what pass N-1 reported fixing = signal that the prior Edit failed to persist; verdict is still CLEAN (single cosmetic error).
5. Do NOT continue beyond a clean confirmation pass merely because a "9th pass" is theoretically possible.
6. Final pass should still verify (a) prior pass fixes parsed clean (b) JSON parse OK (c) at least 3-5 random Vector A-E spot-checks of major scholarly citations.

For batch_10: substantive cleanup happened in passes 1-5; passes 6-7 were minor; pass 8 confirmed clean.
For batch_11: substantive cleanup through pass 6; pass 7 cosmetic; pass 8 caught one persistent cosmetic; verdict CLEAN.
