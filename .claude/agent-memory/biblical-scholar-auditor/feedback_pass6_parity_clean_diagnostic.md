---
name: Pass-6 parity-of-named-work clean diagnostic
description: When prior passes converged on parity-of-named-work errors, exhaustive cross-checking of every work-author pair in pass 6 typically returns 0 errors confirming terminal cleanliness
type: feedback
---

When pass 3-5 surfaces increasingly fine-grained parity errors (wrong edited volume, wrong dual-volume by same author, wrong work-within-author's-corpus), pass 6 conducted as systematic parity-of-named-work cross-check usually returns 0 errors.

**Why:** Once the audit has caught (a) wrong essay-collection volume, (b) wrong companion-volume in a dual-volume series, and (c) wrong work-within-an-author's-corpus, the only remaining precision tier would be intra-pagination errors. AI-drafted scholarship blocks usually do not internally pagination-drift if the work/edition/year are correct, because the AI is sampling plausible page ranges from the actual volume's TOC. So pass 6 functions as a confirmatory clean pass when prior passes have systematically eliminated work-selection errors.

**How to apply:** In trajectory 12→5→1→1→1, after pass 5 fixes the last parity-of-work error, pass 6 should systematically cross-check every (author, work, volume, publisher, year) tuple against external sources. If pass 6 returns 0, the batch is terminal. If pass 6 returns 1+, the new error class is likely either pagination-precision or a missed parity-of-work case from a less-prominent scholar.

**Diagnostic signal:** Pass 6 should specifically verify multi-work authors (Klein WBC vs Hermeneia; McCarter AB 8 vs AB 9; Knoppers AB 12 vs AB 12A; Tsumura 1 Sam NICOT vs 2 Sam NICOT vs *Creation and Destruction*; McKenzie *King David* vs AOTC; Wright RSG vs PFG vs JVG; Allison *Resurrecting* vs ICC Matthew vs *Constructing Jesus*; Niditch *War* vs OTL Judges vs *Underdogs*; Halpern *Demons* vs *First Historians*; Berlin JPS Esther vs JPS Jonah vs *Poetics*; Levenson OTL Esther vs *Death and Resurrection* vs *Sinai and Zion*; Fitzmyer AB Acts vs AB Luke).
