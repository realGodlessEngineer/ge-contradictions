---
name: VT/JBL journal fascicle attribution drift
description: AI drafts assign journal articles to wrong fascicle number; verify against publisher's own classification (Brill for VT, SBL for JBL)
type: feedback
---

For mid-20th-century journal articles in Vetus Testamentum and JBL, AI drafts often invent or randomize the fascicle/issue number (e.g., "VT 12, no. 2" vs the correct "VT 12, no. 1"). The page range may be correct, but the issue number drifts.

**Why:** Discovered in batch_18 pass-3 entry 359: Lindblom's "Lot-Casting in the Old Testament" was cited as "VT 12, no. 2 (1962): 164-178" — Brill's own record explicitly classifies the article as Volume 12, Issue 1. Pagination across fascicles is continuous in VT, so page 164 can fall in either fascicle in some volumes, but the publisher's classification is authoritative.

**How to apply:** When auditing journal article citations, verify the fascicle/issue number against the publisher's record (Brill URL pattern `/journals/vt/{volume}/{issue}/article-pXXX`, or JSTOR's i267527-style fascicle identifiers). Don't accept AI-drafted issue numbers without verification. The page range itself is often correct even when the issue number is wrong, which makes this error subtle.
