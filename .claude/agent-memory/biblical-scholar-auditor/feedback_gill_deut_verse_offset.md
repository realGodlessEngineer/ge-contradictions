---
name: gill-deut-verse-offset
description: Gill's "wroth with me for your sakes" harmonization is under Deut 3:26, not 3:25; harmonization work files mislabel the verse_ref
metadata:
  type: feedback
---

In John Gill's Exposition of the Entire Bible, the comment "But the Lord was wroth with me for your sakes.... Not at this time, and for this prayer of his, but on account of he and Aaron not sanctifying him at the waters of Meribah..." is on **Deuteronomy 3:26**, NOT 3:25. Gill's comment on Deut 3:25 ("let me go over and see the good land") is purely geographical (Canaan, Lebanon, Mount Moriah) and contains none of the Meribah/harmonization material.

Seen in harmonization work file 160.json: excerpt 160#0 has verse_ref="Deuteronomy 3:25" and full_note_ref="GILL/5/3/25", and deeper_learning.defense.pd_work cites "on Deuteronomy 3:25" — both point one verse too low. The embedded source_note_text is correct (it IS Gill on 3:26); only the verse label drifted.

**Why:** AI/transform pass keyed the note to the chapter-3 prayer block but landed on v.25 instead of v.26 where the "for your sakes" lemma actually sits.

**How to apply:** When auditing harmonization rows that cite Gill on Deut 3 "for your sakes", the in_source check still passes (excerpt is verbatim in the embedded note), but flag deeper_learning for the verse-pointer error (3:25→3:26) and note the verse_ref/full_note_ref drift. Verified via biblestudytools.com Gill mirror (deuteronomy-3-25 vs -3-26).

**RE-AUDIT 2026-06-23 (id 160 after "targeted remediation"):** the offset was NOT fixed — verse_ref="Deuteronomy 3:25", full_note_ref="GILL/5/3/25", and pd_work "on Deuteronomy 3:25" all still one verse too low; the embedded source_note_text is still verbatim Gill on 3:26. Re-verified biblestudytools deuteronomy-3-26 (opens "But the Lord was wroth with me for your sakes" + Meribah + Num 20:12) vs -3-25 (geography only). Verdict: E line pass (excerpt verbatim + on-tension + reconcile-correct), G line deeper_learning=flag for the persisting pointer error. Wells/SAB confirmed real on contra/angered-god.html (flat Num 20 vs Deut 3:26 conflict, no concession → named_skeptic ok, connective ok); gotquestions Moses-promised-land.html confirmed to NOT engage "for your sakes" → link correctly omitted per policy.
