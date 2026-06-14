---
name: Extension-pass zero confirmation
description: When 10-pass cap closes with substantive residuals fixed by the final pass, a short 3-pass extension can confirm terminal-clean
type: feedback
---

When a batch reaches the 10-pass cap with the final pass itself catching N>0 substantive errors (i.e., AUDITED-not-CLEAN status), running a user-authorized 3-pass extension typically confirms terminal-clean if no new error classes surface.

**Why:** Pass 10's catch represents the auditor exhausting the dominant error patterns of the batch. The 3-pass extension (11, 12, 13) tests whether those fixes are durable and whether any unflagged class-of-error remains. Batch 19 (361-380) demonstrated this: pass 10 caught 3 MEDIUM residuals (Prov 21:18→13:8 arithmetic, MT Isa 26:10 transliteration, 1 Tim 2:4 Greek word order); passes 11-13 returned 0, 0, 0 confirming TERMINAL CLEAN at pass 13 under the multi-pass-zero plateau exception.

**How to apply:** If user authorizes a 5-pass extension after 10-pass-cap closure with final-pass residuals, focus passes 11-13 on (a) verifying that pass-10 fixes are correctly in place; (b) systematic re-scan of all 20 entries for new error classes; (c) accepting an early termination as soon as the multi-pass-zero plateau exception is satisfied (current pass = 0 AND prior pass ≤ 1). Three consecutive zeros after a substantive pass-10 catch is reliable terminal — no need to exhaust all 5 extension passes. Contrast with batch 18's stubborn-batch pattern, which oscillated 0-1-0-1-0-1 for 6 passes before terminal.
