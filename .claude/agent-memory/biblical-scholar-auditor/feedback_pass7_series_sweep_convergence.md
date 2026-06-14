---
name: Pass-7 series-name sweep convergence pattern
description: When pass 6 caught series-name precision (singular/plural, official name disambiguation), pass 7 systematic series-name sweep across all citations typically converges to 0
type: feedback
---

When pass 6 surfaces series-name precision errors (e.g., "Smyth & Helwys" missing "Bible Commentary"; "Abingdon Old Testament Commentary" singular instead of plural), pass 7's systematic series-name sweep across the official forms of all major commentary series (NICOT/NICNT, OTL, ICC, Hermeneia, WBC, NAC, TOTC, AB/AYB, NIBC, NIVAC, IECOT, BECNT, AOTC, SHBC, Continental Commentary, Berit Olam, FOTL, VTSup, JSJSup, JSOTSup, LHBOTS) typically returns 0 verifiable errors.

**Why:** By pass 7, the series-name layer has been exhaustively patched in pass 6. The remaining precision tier — "A Continental Commentary" vs "Continental Commentaries" (publisher subtitle plural), "I and II Kings" vs "I & II Kings" (ampersand), pre-1988 "Westminster Press" vs continuing "Westminster John Knox" — sits at or below the conservative-threshold mandate: "Don't flag if correct but could be more precise. Only flag verifiable errors." These are conventional citation variants, not errors.

**How to apply:** In pass 7 following a pass-6 series-name sweep, do the systematic walk across all 25+ standard series names AND publisher names AND page-scope verifications. If all pass cleanly, declare 0 and trust the convergence trajectory. Trajectory like 5→3→5→1→3→2→1→0 (geometric decay with one bump) is the signature of true convergence — manufacturing a pass-7 finding to avoid "declaring 0" introduces drift.

**Trajectory signature for batch_15 convergence:** 5→3→5→1→3→2→1→0 across 7 passes. Pass-7 systematic sweep cleanly verified all prior anchors and surfaced no residual errors.
