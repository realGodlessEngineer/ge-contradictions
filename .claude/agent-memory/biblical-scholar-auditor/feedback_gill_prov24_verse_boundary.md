---
name: feedback_gill_prov24_verse_boundary
description: Recurring Gill verse_ref off-by-N drift (ids 160, 351, 404, 456, 446, 467, 471, 489, 506) — always verify a supplied verse_ref against the note's own opening clause
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

**Third confirmed instance (id 404, 2026-07-01):** excerpt 404#0's verse_ref
"Matthew 4:17" and full_note_ref "GILL/40/4/17" are wrong by 2 verses. The
embedded note ("And he saith unto them, follow me,.... These two brethren had
been the disciples of John...") is Gill's note on **Matthew 4:19** (confirmed
via biblestudytools Gill mirror); 4:17 is Jesus' unrelated "Repent, for the
kingdom of heaven is at hand" preaching text. Only the excerpt's own metadata
drifted (not echoed in this row's deeper_learning, which cites an unrelated
Matthew Henry resource) — so per the id-160/351 split, flagged the E line
(overall=1, action "fix verse_ref/full_note_ref") while leaving deeper_learning
clean. Confirms this is a recurring transform-pass bug across at least 3 ids
(160 Deut 3:25→26, 351 Prov 24:16→17, 404 Matt 4:17→19) — always verify the
opening clause against the claimed verse's own KJV wording before trusting
verse_ref.

**Fourth confirmed instance (id 456, 2026-07-02):** excerpt 456#0's verse_ref
"Matthew 26:33" and full_note_ref "GILL/40/26/33" are off by one. The embedded
note ("Jesus said unto him, verily I say unto thee,.... Christ, the more
strongly to asseverate...") opens with Matt 26:34's own KJV wording ("that this
night, before the cock crow, thou shalt deny me thrice"), confirmed via
biblestudytools.com's Gill mirror at matthew-26-34.html; 26:33 is Peter's prior
"though all men shall be offended" line and has no cock-crowing content. Text
itself (the Beza/Ethiopic-variant + second-crowing harmonization) was otherwise
verbatim/on-tension/correctly-labeled, so flagged (overall=1) rather than
failed, action "fix verse_ref". This is now a 4-for-4 pattern in Gill excerpts
across the harmonization audit — treat any Gill verse_ref as unverified until
the opening clause is checked.

**Fifth confirmed instance (id 446, 2026-07-02):** excerpt 446#0's verse_ref
"1 Timothy 2:5" and full_note_ref "GILL/54/2/5" are off by one, AND the same
error is echoed in deeper_learning.pd_work.resource ("on 1 Timothy 2:5"). The
embedded note ("Who gave himself a ransom for all,...") is Gill's note on
**1 Timothy 2:6**, confirmed via biblestudytools.com (1-timothy-2-6.html
contains this text verbatim; 1-timothy-2-5.html is wholly different content,
"one Mediator between God and men"). Per the id-160/351 split (error echoed in
deeper_learning too): E line stayed pass (excerpt itself verbatim/on-tension/
correctly-labeled reconcile), G line deeper_learning=flag for the persisting
pointer error in pd_work. 5-for-5 now — this transform-pass bug is systemic
enough that any Gill full_note_ref should be spot-checked before trusting it.

**Sixth confirmed instance (id 467, 2026-07-07, "What color was Jesus' robe?"):**
excerpt 467#0's verse_ref "Matthew 27:27" and full_note_ref "GILL/40/27/27" are
off by one. The embedded note ("And they stripped him,.... put on him a scarlet
robe... Mark and John say it was 'purple'...") is Gill's note on **Matthew
27:28**, confirmed via biblestudytools.com/matthew-27-28.html and
studylight.org's Gill mirror; 27:27 is the unrelated "took Jesus into the
common hall...gathered...the whole band" verse (no clothing content). The
row's deeper_learning.pd_work resource string is unversed ("John Gill,
Exposition of the Entire Bible (1746-63)", no specific verse cited) so the
error did NOT propagate there — deeper_learning stayed clean. Also verified
(positive control) that Haley's *Alleged Discrepancies* (archive.org
`examinationofall00hale`) has **zero** fulltext hits for "scarlet"/"purple"/
"robe", confirming the pd_work note's claim that Haley is silent on this
passage. Per the id-404/456 split (error only in the excerpt's own metadata):
E line flagged (overall=1, action "fix verse_ref/full_note_ref"), G line
deeper_learning stayed ok. 6-for-6 now.

**Seventh confirmed instance (id 471, 2026-07-07, "Did both thieves revile
Jesus?"):** excerpt 471#0's verse_ref "Matthew 27:43" and full_note_ref
"GILL/40/27/43" are off by one. The embedded note ("The thieves also,.... One
or other of them, not both; an Hebrew way of speaking, as Drusius
observed...") is Gill's note on **Matthew 27:44**, confirmed via
biblestudytools.com/commentaries/gills-exposition-of-the-bible/matthew-27-44.html;
27:43 is the unrelated "He trusted in God...I am the Son of God" mockery line.
7-for-7 now — always spot-check Gill full_note_ref before trusting it.

**Eighth confirmed instance (id 489, 2026-07-07, "Where did the devils ask
not to go?"):** excerpt 489#0's verse_ref "Luke 8:30" and full_note_ref
"GILL/42/8/30" are off by one, AND the same error is echoed in
deeper_learning.pd_work.resource ("... on Luke 8:30"). The embedded note
("And they besought him,.... that he would not command them to go out into
the deep... they desired... to continue in that country...") is Gill's note
on **Luke 8:31**, confirmed via biblestudytools.com/commentaries/
gills-exposition-of-the-bible/luke-8-31.html; 8:30 is the unrelated "What is
thy name?"/"Legion" question-and-answer verse. Per the id-160/351/446 split
(error echoed in deeper_learning too): E line flagged (overall=1, action "fix
verse_ref to Luke 8:31"), G line deeper_learning=flag for the same pointer
error persisting in pd_work. 8-for-8 now — this bug is systemic across the
whole Gill excerpt population; always spot-check full_note_ref's chapter/verse
against the note's own opening clause before trusting it.

**Ninth confirmed instance (id 479):** adds a concatenated-note-blob flavor of
the same bug — always check the excerpt against the embedded verse heading, not
just the claimed verse_ref field, since the embedded text itself can span/blend
adjacent verses in a single blob.

**Tenth confirmed instance (id 506, 2026-07-07, "Did the Samaritans receive
Jesus?" — Luke 9:52-53 vs John 4:39-40):** off by **three**, the largest gap
seen yet. Excerpt 506#0's verse_ref "Luke 9:53" and full_note_ref
"GILL/42/9/53" claim the note is on v.53, but the embedded source_note_text
("...and they went to another village; in Samaria, more civil and courteous,
and less prejudiced...") is Gill's note on **Luke 9:56**, confirmed via
biblehub.com/commentaries/gill/luke/9.htm (which lists Gill's actual v.53 note
as the short "his face was as though he would go to Jerusalem" comment,
wholly different content) and biblestudytools.com's luke-9-56.html mirror.
Text itself was genuine, verbatim, and on-tension (shows a 2nd, welcoming
village after the 1st's rejection) — flagged the E line only (overall=1,
action "correct verse_ref to Luke 9:56"), deeper_learning's pd_work in this
row cites an unrelated Haley resource so no propagation. 10-for-10 now across
the whole harmonization-audit population — this is a systemic transform-pass
bug, not an isolated glitch; always spot-check full_note_ref's chapter/verse
against the note's own opening clause, regardless of how large the apparent
verse gap looks (off-by-1 is the norm but off-by-3 now confirmed possible).
