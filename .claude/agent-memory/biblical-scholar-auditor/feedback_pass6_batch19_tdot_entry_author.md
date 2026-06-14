---
name: Pass-6 batch_19 TDOT entry author misattribution
description: Pass-6 batch_19 caught Fabry misattributed as author of TDOT chemah entry that Schunck actually wrote
type: feedback
---

Pass-6 of batch_19 returned 1 substantive error after pass-5 returned 4. Continues post-false-zero trajectory: 2,1,3,0,4,1.

**Error found**: TDOT Volume 4 entry on חֵמָה (chemah) was misattributed to Heinz-Josef Fabry. The actual author per the volume's table of contents is **K.-D. Schunck** (Klaus-Dietrich Schunck). Also the page range was overstated: actual entry is pp. 462-464 (next entry chmôr starts p. 465), not 462-471 as cited.

Verification source: Internet Archive scan of TDOT Vol 4 contents page confirms "chemäh [héma] wrath (Schunck) ... 462" with next entry "chmôr [hmör] ass (In der Smitten) ... 465."

**Why:** This is a high-prestige citation pattern where AI drafts attribute TDOT entries to the most familiar editor name (Fabry) rather than the actual entry author. Schunck was the original German ThWAT author of the chemah entry, but AI generation defaulted to the most visible editor name attached to TDOT. Pass-5 already caught the Fabry name spelling (Heinz-Joseph → Heinz-Josef) but failed to verify the entry attribution itself.

**How to apply:** For TDOT/ThWAT, TDNT/ThWNT, NIDOTTE, ABD, and other dictionary citations, verify the actual entry author against the volume's table of contents — do NOT default to the editor name. Common misattributions:
- TDOT chemah = Schunck (not Fabry)
- TDOT entries on Pentateuchal lexemes often Botterweck/Bergman/Ringgren
- TDNT entries depend on Kittel/Friedrich era

For TDOT specifically, the canonical form is:
"[Entry Author]. \"[Hebrew lemma].\" In Theological Dictionary of the Old Testament, edited by G. Johannes Botterweck and Helmer Ringgren [add Fabry from vol. 5+], translated by [Green/Willis/Stott], [Vol]:[start]-[end]. Grand Rapids: Eerdmans, [year]."

Pass-6 trajectory now: 2,1,3,0,4,1. Continue pass-7 — still above zero, false-zero pattern has not re-emerged.
