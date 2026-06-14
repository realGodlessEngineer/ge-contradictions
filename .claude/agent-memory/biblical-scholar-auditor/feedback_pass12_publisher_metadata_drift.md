---
name: Pass-12 publisher-metadata drift class
description: After pass-11's terminal-clean Hermeneia sweep, pass-12 still finds publisher/edition metadata errors in non-Hermeneia citations
type: feedback
---

Pass 12 of batch_18 (after passes 1-11 had cleaned all pericope/page-range errors in Hermeneia and AB) found 1 substantive error in a different class: publisher/city metadata for a non-Hermeneia monograph.

**Pass-12 batch_18 found error**: Entry 344 — Levenson, Sinai and Zion, 1985, cited "San Francisco: Harper & Row" when 1985 edition is Minneapolis: Winston Press. Page range 89-184 also extended past Chapter 2 (Zion) end at p. 178.

**Why:** Publisher-city metadata for older works (1980s monographs especially) is vulnerable to AI conflation when a book has multiple editions/printings. The 1987 Harper paperback is more commonly cited in NT studies, so AI defaults to that publisher even when citing the 1985 year.

**How to apply:** In late audit passes (12+), once Hermeneia/AB pericope-level TOC verification has converged to zero, shift focus to publisher/city/year metadata for older standalone monographs. Watch especially for:
- Series-published works where Winston/Seabury/Harper printings overlap
- Reprint pagination drift between hardcover and paperback editions
- Reprinted commentaries where AB/AYB or WBC 2nd-edition years differ from original

**Trajectory note**: Pass 12 returned 1 substantive error, so the contradictions-pipeline auditor stopping rule (0 errors) is not yet satisfied. Need pass 13 confirmation.
