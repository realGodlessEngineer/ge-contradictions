---
name: Batch 27 terminal-clean trajectory 5,1,7,1,0,0,0,0,0,0,0,0
description: Batch_27 (entries 521-540, Johannine/Acts contradictions cluster) converged at pass-5 zero with 8-pass-zero plateau through pass-12; total 14 fixes; pass-1 produced 1 false-positive (Marcus volume split) caught by pass-2 page-count check.
type: feedback
---

Batch_27 multi-pass audit converged: TERMINAL CLEAN at pass 5 with 8-pass-zero plateau through pass 12.

Trajectory: 5, 1(f), 7, 1, 0, 0, 0, 0, 0, 0, 0, 0
- Pass 1: 5 fixes (3 D-A author-order, 1 Klauck publisher, 1 false-fix on Marcus vol split)
- Pass 2: 1 fix (revert false Marcus vol fix from pass 1)
- Pass 3: 7 fixes (passing-mention parity — Grudem, Morris, Köstenberger, Ehrman, Bruce x2, Geisler, Brown intro, Carson)
- Pass 4: 1 fix (Greek form *Edokei* → *dokousa* in entry 527)
- Passes 5-12: 0 (plateau)

**Why:** Batch_27 was Johannine-heavy with many Acts cross-references. Major fix classes:
1. D-A ICC Vol 3 author-order (Davies first, not Allison first) — 3 occurrences in single batch.
2. Klauck Liturgical Press not Fortress (new pipeline rule documented).
3. Passing-mention parity for paired apologists (Schreiner+Grudem, Carson+Köstenberger, Bruce in 2 different entries).
4. *dokousa* not *Edokei* for John 20:15 — present participle (feminine, of Mary), not imperfect indicative.

**How to apply:**
- Johannine-cluster batches systematically need parity sweep for Carson+Köstenberger+Morris (the standard PNTC+BECNT+NICNT trio).
- D-A author-order is a pervasive single-batch error class (3x in one batch is the norm).
- Multi-Bruce parity: Bruce appears in both Acts entries and Pauline-bio entries; check separately.
- After a self-error in pass 1 (false-fix), pass 2's primary task is reversal verification, not new sweep.
