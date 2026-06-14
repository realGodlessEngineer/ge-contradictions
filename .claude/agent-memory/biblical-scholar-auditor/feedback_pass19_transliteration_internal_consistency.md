---
name: Pass-19 transliteration internal consistency fix
description: pass-19 of batch_18 caught Greek transliteration macron inconsistency within single entry; fifth oscillation 1 after a zero
type: feedback
---

Pass 19 of batch_18 (entries 341-360) executed the fresh-angles sweep recommended by pass-18 across seven dimensions: verse-locator internal consistency, Greek/Hebrew transliteration re-verification, chapter-distance arithmetic, summary-field deep re-read, primary-source quotation accuracy, scholarly-consensus-claim precision, and pass-17 fix verification.

Single finding: Entry 343 commentary used "moria" (no macron) in the first mention and "mōria" (with macron) in the second mention of the same Greek word μωρία (1 Cor 1:21). Both reference the same word; Greek omega requires the macron. Fixed to "mōria" in both instances.

batch_18 trajectory through pass 19: 4, 1, 2, 0(false), 3, 8, 4, 4, 7, 3, 4, 1, 3, 0(false), 1, 0(false), 1, 0(false), 1.

**Why:** Pass-18 was the FOURTH false zero (after passes 4, 14, 16). The Greek transliteration class had been visited in pass-5 (German technical-term garbling pattern), but pass-19's fresh-angles directive specifically called for Greek consistency across multiple instances within a single entry. AI drafts can transliterate the SAME Greek word inconsistently within the same paragraph — using macron in one instance and bare letter in another. This is a new finding class.

**How to apply:** When a single entry mentions the same Greek/Hebrew word multiple times, verify all instances use identical transliteration (same diacritics, same macrons, same breathing marks). The pattern is especially common with words containing omega (ω) since the diacritic distinguishes it from omicron (ο). Sweep both summary and commentary together — AI drafts often introduce inconsistency at the paragraph boundary.

The 0-1-0-1-0-1 oscillation through passes 14-19 in batch_18 indicates the batch has converged structurally but still admits sub-error-class drift on each fresh-angle sweep. No multi-pass plateau of 1 errors; instead, alternating 0-1 with each pass discovering a slightly different sub-class.
