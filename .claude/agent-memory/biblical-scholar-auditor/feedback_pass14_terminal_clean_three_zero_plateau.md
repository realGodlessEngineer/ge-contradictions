---
name: Pass-14 terminal-clean via 3-pass-zero plateau
description: batch_24 pass 14 declared TERMINAL CLEAN after 3-pass-zero plateau (12, 13, 14) given 2 prior false-plateau events
type: feedback
---

When a batch has TWO prior false-plateau events in its trajectory history, the established threshold for declaring TERMINAL CLEAN is a 3-pass-zero plateau (not 2 consecutive zeros).

**Why:** batch_24 trajectory 5, 2, 4, 2, 2, 2, 0(false), 6, 0, 0, 1, 0, 0, 0 demonstrates that 2-pass plateaus are insufficient when the batch has shown a history of multiple false convergences. Pass 7 false-zero was broken by 6 bugs at pass 8; passes 9-10 zero-plateau was broken by 1 bug at pass 11. After 2 false-plateau events, the 3-pass-zero plateau becomes the new operational threshold.

**How to apply:** Track count of false-plateau events in batch history. Standard convergence rule: 2-pass-zero plateau = terminal clean (typical batches). After ONE false-plateau event: provisional, need additional confirmation. After TWO false-plateau events: require 3-pass-zero plateau before declaring TERMINAL CLEAN. This is the same rationale as the multi-pass-1-plateau exception (batch_18) but inverted — escalating zero-streak requirement scales with prior false-positive frequency.

Final batch_24 metrics: 23 bugs found, 14 passes, TERMINAL CLEAN.
