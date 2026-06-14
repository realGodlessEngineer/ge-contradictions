---
name: Summary/commentary substantive factual drift
description: Both summary AND commentary fields can contain garbled biblical-textual claims (genealogical relationships, what-verse-says claims) that prior passes miss by focusing on scholarship-list metadata
type: feedback
---

Summary and commentary prose fields are often skimmed by audit passes because the bulk of audit attention falls on scholarship-list citations and citation metadata. Two confirmed instances in batch_16:

**Pass 7 — entry 312 summary**: contained "Levi and Ephraim were brothers' nephews of the same generation, both grandsons of Jacob" — wrong on two counts:
- Levi is Jacob's SON (Gen 29:34), not grandson
- Ephraim is Jacob's GRANDSON via Joseph (Gen 41:50-52, 46:20), not in same generation as Levi
- "Brothers' nephews" is grammatically garbled

**Pass 8 — entry 308 commentary**: contained "Chronicles itself lists Shealtiel's own sons in the preceding verse (3:17) — so on Chronicles' own telling, Shealtiel was not childless" — wrong on two counts:
- 1 Chr 3:17 names Shealtiel AS Jeconiah's son; it doesn't list Shealtiel's sons
- v. 18's names (Malchiram, Pedaiah, etc.) are most commonly read by Knoppers/Williamson/Japhet as additional sons of Jeconiah, not sons of Shealtiel
- The argument was unnecessary to the rebuttal of the levirate harmonization; removing the false textual claim while preserving the argumentative thrust suffices

**Why:** Summary and commentary fields are long-form prose and look "context-setting" rather than substantive; passes 1-7 of batch_16 all missed both these substantive errors because attention focused on citation-list metadata.

**How to apply:** In late audit passes (especially after metadata-precision passes have settled), do a dedicated deep-read of summary and commentary prose. Specifically test:
- Any genealogical relationship claim ("X is son of Y", "X and Y are brothers", "in the preceding verse") against the actual biblical genealogies
- Any claim of the form "the text/Chronicles/Hebrew explicitly says X" against the cited verse text
- Cross-generation relationships (brothers vs uncles vs nephews) are commonly confused in AI-drafted prose
- Verse-citation correctness for biblical-textual rebuttals embedded in commentary (e.g., "in v. 17" — verify v. 17 actually says what's claimed)
