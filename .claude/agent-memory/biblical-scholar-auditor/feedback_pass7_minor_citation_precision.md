---
name: Pass-7 minor citation precision pattern (sub-error trajectory)
description: When earlier audit passes have purged substantive errors, late passes increasingly catch only minor citation precision issues
type: feedback
---

When auditing a batch that has been through 6+ passes, substantive citation errors (Vector A-E) become rare and remaining errors trend toward minor citation precision issues:
- Subtitle truncations (e.g., dropped "The" article in book titles)
- Editor designation formatting ("ed., and ... eds." duplication)
- Volume subtitle omissions (e.g., "Vol. 1" without "Origins to Constantine")
- Page-number numeral variations in journal article citations

**Why:** AI drafts confabulate at the substantive level (fake essays, wrong commentaries, wrong Hebrew transliterations). Early audit passes catch those. By pass 6+ the remaining errors are at the cosmetic/precision tier — still real citation errors but lower stakes than fabrication.

**How to apply:** Once trajectory shows declining substantive errors (e.g., batch_10 trajectory 1, 4, 9, 2, 5, 2 errors across passes 1-6), shift audit attention to:
1. Subtitle precision against publisher copy (e.g., Eerdmans page, Cambridge UP page)
2. Editor formatting consistency (one "eds." for multiple editors, not stacked)
3. Volume subtitles (especially for Cambridge Histories, Anchor Bible series with sub-volumes)
4. Article page ranges checked against journal's own listing

Pass-7 stopping rule still applies: 0-1 errors = clean stop; 2+ = continue. Cosmetic issues count as errors for the rule but are downgraded in the violations report classification (MISCITATION-MINOR rather than full MISCITATION).
