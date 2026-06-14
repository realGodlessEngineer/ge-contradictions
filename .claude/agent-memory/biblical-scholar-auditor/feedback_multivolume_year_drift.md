---
name: Multi-volume commentary year drift
description: AI drafts conflate volume years in multi-volume commentaries; verify each volume independently
type: feedback
---

Multi-volume commentaries by the same author(s) frequently have distinct publication years per volume. AI drafts default-conflate dates across volumes. Verify each volume's year independently against the cited passage scope.

**Why:** Pass-4 of batch_14 caught Goldingay-Payne ICC Isaiah 40-55 Vol II miscited as 2006 (Vol I year) instead of 2007. Pattern recurs across multi-volume commentaries.

**How to apply:** For any multi-volume commentary, look up the specific volume covering the cited passage and confirm the year for THAT volume, not the series.

Common multi-volume year pitfalls:
- Davies-Allison ICC Matthew: Vol 1 = 1988, Vol 2 = 1991, Vol 3 = 1997
- Goldingay-Payne ICC Isaiah 40-55: Vol I = 2006, Vol II = 2007
- Luz Hermeneia Matthew: 1-7 = 2007 (rev), 8-20 = 2001, 21-28 = 2005
- Cogan AB 10 (1 Kings) = 2001 vs. Cogan-Tadmor AB 11 (2 Kings) = 1988
- Knoppers AB 12 (1 Chr 1-9) = 2003 vs. AB 12A (1 Chr 10-29) = 2004
- Klein Hermeneia 1 Chronicles = 2006 vs. 2 Chronicles = 2012
- Tsumura NICOT 1 Samuel = 2007 vs. 2 Samuel = 2019
- Keener Acts: Vol 1 = 2012, Vol 2 = 2013, Vol 3 = 2014, Vol 4 = 2015
- Aune WBC Revelation: Vol 1 = 1997, Vol 2 = 1998, Vol 3 = 1998
- Brown AB John: Vol 1 = AB 29 (1966), Vol 2 = AB 29A (1970)
