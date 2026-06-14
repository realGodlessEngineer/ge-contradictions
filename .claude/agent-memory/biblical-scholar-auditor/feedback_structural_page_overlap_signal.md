---
name: Structural page-overlap signal for commentary citations
description: When two scholarship entries cite the same commentary with overlapping page ranges for different passages, that signals an error
type: feedback
---

When two or more scholarship entries cite the SAME single-volume commentary with OVERLAPPING page ranges for DIFFERENT biblical passages, that's a signal of a miscitation.

**Why:** Single-volume commentaries are sequential by biblical passage. A passage X that precedes passage Y in the Bible must have its commentary on pages preceding Y's commentary pages. Overlapping ranges mean at least one is wrong.

**Concrete example from batch_13:** Klein 1 Chr Hermeneia was cited as:
- pp. 422-426 for 1 Chr 20:5 (entry 249)
- pp. 419-435 for 1 Chr 21 (entries 250, 253)

Since 1 Chr 20:5 precedes 1 Chr 21 in the Bible, but the 422-426 range falls INSIDE the 419-435 range, one citation is wrong. The 419-435 range for 1 Chr 21 is corroborated by two independent entries, so the 422-426 range for 1 Chr 20:5 is the corruption.

**Recovery rule:** When the structural conflict is detected and the correct range cannot be externally verified, replace with a bare-volume citation (no page range) rather than guess. This was applied to entry 249 in batch_13 pass 6.

**How to apply:** When auditing a batch with multiple citations of the same commentary, build a monotonicity table: passage → page range. Any range that violates monotonicity (overlaps a range for a later passage, or appears AFTER a range for an earlier passage) is a candidate error. Cross-check by counting how many entries support each range — the more entries that agree on a range, the more likely it's correct.
