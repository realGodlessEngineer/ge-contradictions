---
name: gill-job117-truncated-qualifier
description: id 575 pattern — ellipsis truncation (not a join) that cuts the specific proof-text clause a connective relies on, weakening on_tension/connective fit
metadata:
  type: feedback
---

id 575 (Job 11:7 vs Rom 1:20/Isa 40:28, "Can God's attributes be known?"): Gill's Job 11:7
note excerpt is genuinely verbatim (in_source pass) — the ellipsis is a plain truncation at
the end, not a distorting non-adjacent join, so it does not fail in_source. But the excerpt
stops right before Gill's own qualifying sentence ("though some of the perfections of God may
be investigated from the works of nature, such as the power, wisdom, and goodness of God, Rom
1:19; yet not all his perfections...") — the exact clause that would ground the reconcile
connective's claim that "basic attributes" (not just bare existence) are generally revealed.
As quoted, the excerpt instead flatly states "it cannot be found out what God is, his nature,
being, and perfections," which taken alone reads as denying attributes are knowable at all.

**Why:** A truncation can pass in_source (verbatim, no misleading join) while still degrading
on_tension/connectives, because the connective's specific claim (here, "attributes") must be
evidenced by what's actually excerpted, not by the fuller source_note_text the auditor can see
but the reader never will. Don't let "verified in source_note_text" bleed into "therefore the
connective is fully supported" — check the connective's precise wording against the excerpt
window alone.

**How to apply:** When a reconcile/discrepancy connective makes a specific claim (e.g., names
"basic attributes," "power," "existence") verify that claim is actually present in the quoted
excerpt_text, not just somewhere in the embedded full note. If the excerpt only covers part of
the connective's claim, mark on_tension=weak and connectives=flag (not in_source=fail), and
suggest `re-excerpt` to extend the window to the qualifying clause. See also
[[gill_verse_ref_pattern]] for other Gill-specific excerpt-boundary issues.
