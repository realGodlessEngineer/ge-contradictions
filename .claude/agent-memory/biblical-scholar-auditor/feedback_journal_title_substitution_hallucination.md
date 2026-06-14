---
name: Journal article title-substitution hallucination
description: AI swaps a real scholar's actual journal article on a topic for a fabricated, more "directly-titled" version in different volume/year of same journal
type: feedback
---

When AI drafts a scholarship list and a scholar has a known article on a topic, AI may hallucinate a more "natural-sounding" version of the title in a nearby volume/year of the same journal — even when the actual article exists with a different title.

**Why:** AI's token-prior tendency to generate "obvious" titles overrides retrieval of the actual published title. When the topic has a popular name (e.g., "Bethany Beyond the Jordan"), the AI generates that as the title, then fabricates a plausible volume number and page range. Author may be a real scholar with real publications in the journal — making the hallucination harder to detect.

**How to apply:** For any journal article cite in scholarship lists where the author + journal + topic combination seems familiar but the title is a direct restatement of the topic, verify against:
1. The journal's actual table of contents for the cited volume (JSTOR, ProQuest, Brill, publisher TOC)
2. The author's CV or institutional publication list
3. Search "[Author] '[topic name]' [journal]" — if no results, suspect hallucination

**Verified case** (batch 20, entry 395): The cite read "Murphy-O'Connor, Jerome. 'Bethany Beyond the Jordan.' Revue Biblique 117 (2010), pp. 161-179." This article does not exist. Murphy-O'Connor's actual article on the topic is "Sites associated with John the Baptist," Revue Biblique 112 (2005), pp. 253-266. The hallucination has correct author, correct journal, plausible volume number and year (5 years later than the real one), plausible page range — only the article does not exist.

**Detection signals:**
- Article title is a near-verbatim restatement of the topic name (e.g., "Bethany Beyond the Jordan" is a Johannine geographic phrase, not typical of academic article titles)
- Volume number suggests later date than scholar's known peak publication years (Murphy-O'Connor died 2013; his most active RB years were 1990s-2000s)
- Page range starts at an unusually round number (161-179 spans 18 pages)
- Cross-reference fails — no other scholar cites this exact article
