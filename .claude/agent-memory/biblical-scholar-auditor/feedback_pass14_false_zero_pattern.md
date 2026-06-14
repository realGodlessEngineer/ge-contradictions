---
name: Pass-14 false-zero confirmed by pass-15
description: pass-14 zero in batch_18 (after pass-13=3) was a false zero broken by pass-15 finding chapter-arithmetic error
type: feedback
---

batch_18 trajectory: pass 1=4, 2=1, 3=2, 4=0(false), 5=3, 6=8, 7=4, 8=4, 9=7, 10=3, 11=4, 12=1, 13=3, 14=0(false), 15=1.

Pass-14's zero was a false zero, just like pass-4's was. Both zeros happened directly after non-zero passes without a multi-pass 1-error plateau preceding them — the same structural pattern that earlier flagged pass-4 as suspect.

**Why:** Pass 14 swept thoroughly on the publisher-imprint class which had dominated passes 12-13. By exhausting one class without re-sweeping older classes (e.g., chapter-distance arithmetic from pass 6), pass-14 declared zero prematurely. Pass-15's directive to "break out of known-class mode" and sweep numerical claims in prose caught the residual arithmetic error in entry 341.

**How to apply:** A 0-error pass that follows a non-zero pass without a 1-1-1 plateau preceding it is structurally suspect, regardless of how thorough the sweep felt. The rule: terminal-clean requires either (a) two consecutive 0s, OR (b) a multi-pass 1-error plateau followed by a 0. A single 0 after a non-zero is provisional only.

Trajectory test: when pass-N caught error in class X but ignored older classes, pass-(N+1) zero is likely false because it swept on class X only. Pass-(N+2) must re-sweep older classes.
