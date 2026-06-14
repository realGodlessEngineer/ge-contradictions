---
name: Pass-11 false-zero plateau recurrence
description: pass-11 of batch_24 broke a 2-pass false plateau (passes 9-10 zero) by finding 1 substantive translator-credit bug
type: feedback
---

Pass 11 of batch_24 found 1 substantive bug (Bultmann John translator credit incomplete) after passes 9-10 both returned 0. Trajectory: 5, 2, 4, 2, 2, 2, 0(false), 6, 0, 0, 1.

**Why:** Pass 7 was a false zero broken by pass 8 (6 publisher-metadata bugs). Passes 9-10 returning 0 in same batch then proved to be ANOTHER 2-pass false plateau, broken at pass 11 by a translator-credit class bug. Class-specific extension passes (rotating sweep angles) can still surface bugs even after multiple consecutive zero passes when a new error class is sampled.

**How to apply:** In long-running batches with multiple false zeros (batch_24 had pass 7 false + pass 9-10 false plateau), DO NOT trust a 2-pass plateau as TERMINAL CLEAN. Require 3-pass-zero plateau minimum with rotating sweep angles before declaring convergence. For batch_24 specifically, recommend extension to pass 13+ and watch for: translator/editor credit truncation across all commentaries (Crouch, Bowden, Beasley-Murray team, Marcus+Thackeray pattern).
