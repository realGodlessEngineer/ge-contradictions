---
name: feedback_gill_prov24_verse_boundary
description: Gill's "Rejoice not when thine enemy falleth" note is KJV Prov 24:17, not 24:16 — verify verse boundary before trusting a supplied verse_ref
type: feedback
---

id 351 ("Should we rejoice when our enemies suffer?", Psa 58:10 vs Prov 24:17): the
work file's excerpt AND its deeper_learning.pd_work both cited this Gill note as
"on Proverbs 24:16." Checked against biblestudytools' Gill archive: the actual
v.16 note is a different text ("This is to be understood of a truly just man...",
on "a just man falleth seven times"). The quoted note ("Rejoice not when thine
enemy falleth... Psa 58:10...") is Gill on **Prov 24:17**.

**Why:** KJV Prov 24:16 and 24:17 are adjacent single-clause verses and Gill's
per-verse note boundaries are easy to mis-slice by one during excerpting; the
error propagated to both the excerpt's verse_ref/full_note_ref and the
deeper_learning pd_work resource string in the same work file, so a repeated
citation isn't independent confirmation.

**How to apply:** For any Gill (or similar per-verse commentary) excerpt, do not
trust the supplied verse_ref at face value — fetch the commentary for the
claimed verse and confirm the opening clause of the note matches that verse's
own KJV wording. If it doesn't, flag both the excerpt E line and, if the same
mislabeled resource is reused in deeper_learning, flag that guardrail too. See
also [[feedback_gill_self_crossref_reconciliation]] and the id-77 "no offset"
counter-example (Deut 4:26 verse_ref was checked and found correct) — verse_ref
errors are real but not universal, so always verify rather than assume either way.
