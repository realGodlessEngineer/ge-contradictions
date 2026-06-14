---
name: Pass-8 terminal-clean confirmation pattern
description: When pass 8 follows a sequence of progressively finer pass-7 fixes, the typical result is 0 errors; trajectory 7,1,1,3,1,2,1,0 signals true convergence
type: feedback
---

When the audit trajectory has progressively narrower fixes (pass 6 = 2, pass 7 = 1 cosmetic) and pass 7's last correction was an off-by-one page-range fix verified against authoritative chapter-XML, pass 8 typically returns ZERO errors and the batch is terminally clean.

**Why:** By pass 8, the high-frequency error vectors (scope-fit, name inversion, work selection, scholar parity, transliteration) have been exhausted in earlier passes. Pass 7's off-by-one fix targets the finest-grained verifiable layer — journal/chapter pagination — and once that's verified against publisher-authoritative sources (Brill chapter-XML, JSTOR/ProQuest pagination, publisher catalog), there is no finer verifiable layer left.

**How to apply:** When pass 7 produced exactly one cosmetic-precision fix (off-by-one page, subtitle punctuation, editor formatting), spend pass 8 spot-verifying ALL recent corrections plus a systematic monotonicity sweep across multi-cited works. If those pass, declare terminal-clean rather than synthesizing pseudo-errors. The discipline of declaring 0 when 0 is correct is itself a contribution — false-positive corrections in late passes risk introducing drift.

**Trajectory signature for terminal convergence:** start-high, then geometric decay (e.g., 7→1→1→3→1→2→1→0). A non-zero pass-8 against this trajectory suggests either (a) genuine residual error caught late or (b) auditor manufacturing precision. Verify any pass-8 finding twice before applying.
