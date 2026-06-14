---
name: Pass-5 batch_19 substantive drift after pass-4 zero
description: Pass-5 batch_19 broke false-zero with 4 substantive errors after pass-4 = 0
type: feedback
---

Pass-5 of batch_19 returned 4 substantive errors after pass-4 returned 0. The pass-4 zero was structurally analogous to batch_18 pass-4 false zero (0 directly after non-zero, not after a multi-pass plateau).

**Errors found in pass 5**:
1. Hebrew transliteration: "Hinneh oseh chadashah" (Isa 43:19) — should be "Hineni oseh chadashah" (MT: הִנְנִי, not הִנֵּה). The 1cs suffix is the substantive part of the meaning.
2. Chapter-distance arithmetic: "Isaiah 27:4 sitting six chapters away from Isaiah 34:2" — 34-27=7, not 6.
3. Occurrence count drift: chemah has 122 occurrences in MT, not "nearly 100." Also "verb's" wrong — chemah is a noun.
4. Translation claim factual error: NABRE Matthew 12:40 = "whale" (same as KJV), not "sea-monster" as the entry claimed. NRSV/NASB use "sea monster"; ESV/NIV use "great/huge fish."
5. Name spelling: "Heinz-Joseph Fabry" — correct is "Heinz-Josef Fabry."

**Why:** The pass-5 strategy targeting "substantive prose factual drift" (angle 1) and "chapter/verse distance arithmetic" (angle 2) is high-yield when pass-4 is a false zero. The errors are layered: each requires a different verification angle (Hebrew morphology, simple arithmetic, lexicon occurrence count, translation comparison).

**How to apply:** When pass-N returns 0 directly after non-zero (not after a multi-pass plateau), do NOT accept as terminal-clean. Run pass-(N+1) with explicit focus on:
- Hebrew transliteration morphology (especially pronominal suffixes -ni, -nu, -kha)
- Inter-chapter distances (simple subtraction)
- Occurrence counts for technical terms (verify against BibleHub/Strong's)
- Translation comparison claims (verify against actual modern Bibles, not stale impression)
- Scholar name spellings (Heinz-Josef not Heinz-Joseph; Anneli not Anna; etc.)

Pass-5 trajectory: 2,1,3,0,4. Continue pass-6.
