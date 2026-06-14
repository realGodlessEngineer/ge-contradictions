---
name: Pass-3 class-wide sweep produces five-pass-zero tail
description: When pass 3 discovers and systematically sweeps a class-wide error pattern accounting for >80% of latent errors, passes 4-8 typically all return 0 establishing the longest plateau in pipeline
type: feedback
---

Trajectory pattern: **N, M, K, 0, 0, 0, 0, 0(T)** where K is a major spike from systematic class-wide parity sweep.

**Why:** Batch 22 produced trajectory 9, 2, 13, 0, 0, 0, 0, 0 — pass 3 caught 13 paired-apologist parity gaps in a single systematic sweep (every entry that named "Carson + Blomberg" trio needed all named works cited). Once that class was exhausted, the other classes (Greek transliteration, textual claims, Hermeneia page anchors, deep prose) all verified clean across 5 consecutive passes.

**How to apply:** When a single pass produces a major spike via class-wide sweep (rather than discovering N unrelated errors), expect the tail to converge fast. Confidence in a five-pass-zero plateau is HIGHER (not lower) than a 3-pass plateau after a uniformly distributed error profile, because the spike has done the heavy class-wide work. Do not insist on extension passes beyond pass 8 in this regime.

**Companion rule:** This pattern is distinct from the "stubborn-batch oscillation" of batch_18 (20 passes, 47 bugs, 4 false zeros) — in stubborn batches each pass finds 1-3 errors of a different class. In class-wide-sweep batches, the spike pass does most of the work.

**Diagnostic:** If pass 3 catches 10+ errors that all share the same error class (e.g., all "parity gap" or all "page range drift"), expect passes 4+ to converge fast. If pass 3 catches 10+ errors of mixed classes, expect continued non-zero passes.
