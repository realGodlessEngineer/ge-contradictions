---
name: Pass-17 title-precision minor fix
description: pass-17 of batch_18 caught a single article-preposition fix in Firth subtitle; trajectory implication for converging clean
type: feedback
---

Pass 17 of batch_18 (entries 341-360) returned 1 minor citation-precision error after multiple-angle sweep covering: scholarship-array order coherence, duplicates, commentary-vs-answerExplanation engagement, title precision, primary-source quotation verification, verse-locator internal-to-prose accuracy, cross-entry same-work consistency, translator/editor credit parity, and Hossfeld-Zenger TOC-page validation against verified Project MUSE TOCs.

Single finding: Firth, "Surrendering Retribution in the Psalms" subtitle. Some databases list it as "Responses to Violence in the Individual Complaints" (Logos, Gospel Coalition review); Google Books scan of title page and Amazon catalog list "Responses to Violence in Individual Complaints" (no "the"). Authoritative title-page form prevails — no "the".

**Why:** Late audit passes (12+) routinely surface this kind of minor-preposition or article drift in subtitles; not a substantive scholarship error.

**How to apply:** When two sources differ on subtitle articles or prepositions, default to the title-page form (typically what Google Books displays from its scan); flag if catalog records diverge. The trajectory 14=0(false)→15=1→16=0→17=1 in batch_18 shows that pass-16 zero was also provisional. Pass 18 will need to confirm or break.

**Trajectory of batch_18:**
- 1=4, 2=1, 3=2, 4=0(false), 5=3, 6=8, 7=4, 8=4, 9=7, 10=3, 11=4, 12=1, 13=3, 14=0(false), 15=1, 16=0(provisional), 17=1

This is now the THIRD time a zero in batch_18 has proven non-terminal (pass 4, pass 14, pass 16). Pattern: the batch retains small drifty errors that surface only under fresh-angle sweeps.
