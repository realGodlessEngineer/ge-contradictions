---
name: parity-rules
description: consolidated rules for scholarship/scholar-name parity across both the commentary pipeline and the harmonization pipeline
metadata:
  type: feedback
---

- **Passing-mention parity**: late passes require a scholarship entry for every named scholar in the commentary, even passing mentions — don't skip a name just because it's not the focus of the paragraph.
- **Risk calibration**: don't over-apply the passing-mention rule — avoid manufacturing a scholarship entry with pages/details that can't actually be verified just to satisfy parity; a flag noting the gap is better than a fabricated citation.
- **Multi-name joint-thesis attribution**: when 2-3 scholars are named together as joint authority for one reading (Smith-Cross on early Israelite anthropomorphism; Knohl/Smith/Geller three-name pattern, batch_18 entry 344), ALL named scholars need their own scholarship entries, not just the lead name.
- **Paired-commentary parity**: "Dillard (WBC) and Selman (TOTC)" or similar paired citations for the same passage both need scholarship entries — don't let the second name ride free on the first's entry.
- **commentary_out empty-scholarship gap**: in the commentary_fix pipeline, an empty `scholarship[]` array while the prose still names authorities by name is a medium-severity parity gap — carry the names over from the entry-level scholarship string rather than leaving the array empty.
- **Grudem/Geisler/Peoples/Parry parity**: pass-7 batch_19 added missing scholarship entries for this named quartet — a reminder that apologetics-adjacent names get dropped from parity just as often as academic ones.
