---
name: Series name precision in late audit passes
description: Late audit passes catch series-name truncation/pluralization errors that earlier passes miss
type: feedback
---

When auditing citations in pass 5+, verify the official series name verbatim:

- "Smyth & Helwys Bible Commentary" — not just "Smyth & Helwys" (the publisher and series share the name but require disambiguation)
- "Abingdon Old Testament Commentaries" — plural (not "Abingdon Old Testament Commentary")
- "Word Biblical Commentary" — singular
- "NIV Application Commentary" — singular
- "Tyndale Old Testament Commentaries" — plural
- "Old Testament Library" — singular
- "International Exegetical Commentary on the Old Testament" (IECOT)
- "Anchor Bible" / "Anchor Yale Bible" — note the rebrand 2008
- "New International Commentary on the Old Testament" (NICOT)
- "New American Commentary" (NAC)

**Why:** Pass-6 audit of batch_15 caught (a) "Smyth & Helwys (Smyth & Helwys, 2000)" — missing "Bible Commentary" after series; (b) "Abingdon Old Testament Commentary" (singular) — should be plural "Commentaries".

**How to apply:** In passes 5+, grep specifically for series name patterns. Verify each is the formal series name from the publisher. Plural/singular distinction matters for series titles. Don't truncate series name into publisher.
