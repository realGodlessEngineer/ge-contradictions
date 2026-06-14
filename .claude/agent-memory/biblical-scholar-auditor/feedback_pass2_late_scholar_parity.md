---
name: Pass-2 late scholar parity follow-up
description: Pass 2 audits frequently surface missing scholarship entries when pass 1 added new scholar mentions in commentary without parity entries
type: feedback
---

When pass 1 modifies commentary prose (e.g., adding "Kaiser also runs this," "Keil-Delitzsch propose this," "Youngblood agree"), the pass-2 audit must explicitly check for parity. Pass 1's edits to commentary text frequently mention scholars who already exist in some entries' scholarship lists but were not added to the current entry's list.

**Why:** Pass-1 prose edits often borrow phrasing patterns from sibling entries ("Archer, Kaiser, and Tsumura..." or "Keil-Delitzsch repeat this") without simultaneously updating the scholarship array. The error is invisible to a casual reader but the "passing-mention scholarship parity" rule requires every named scholar to have an entry.

**How to apply:** In every late pass, walk through `commentary` text scanning for proper-name scholar mentions (Archer, Kaiser, Keil-Delitzsch, Youngblood, Tsumura, McCarter, etc.), then cross-check each against the `scholarship` array. If missing, add the entry with the standard citation form. The most common offenders in Samuel/Chronicles batches are:
- Kaiser (Hard Sayings of the Bible, IVP 1996) — add when commentary cites him on a Samuel/Saul passage
- Youngblood (1, 2 Samuel, EBC rev. ed. vol. 3, Zondervan 2009) — add when "Youngblood" appears in commentary
- Keil-Delitzsch — Chronicles volume (1872, T&T Clark) when Chronicles passage; Samuel volume (1866) when Samuel passage. Use the right BCOT volume based on the passage discussed
- Archer (Encyclopedia of Bible Difficulties, Zondervan 1982) — default apologetic foil; if commentary names Archer, scholarship must include him
