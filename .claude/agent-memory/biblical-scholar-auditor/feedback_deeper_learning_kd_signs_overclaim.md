---
name: deeper-learning-kd-signs-overclaim
description: Harmonization deeper_learning pd_work notes can cite a real, on-topic PD commentary but overclaim a reconciling "distinguishing" move the source never actually makes
metadata:
  type: feedback
---

On id-382 (astrology: Gen 1:14 "signs" vs Lev 19:26/Deut 18:10-12 divination ban), the `deeper_learning.defense.pd_work` note claimed: "K&D's note on Genesis 1:14 treats the 'astrological and chronological utility' of the heavenly lights directly, **distinguishing** portents/prognostication of weather and events **from the divinatory abuse condemned in the Law**." Keil & Delitzsch is real and their Gen 1:14 note genuinely discusses the lights as portents of extraordinary events/divine judgments and weather-prognostication signs (verified via three independent fetches: biblehub, worthy.bible, search-snippet). But nowhere — not in the Gen 1:14 note, not in K&D's own Deut 18:10-14 note on the divination prohibition — do they draw any contrast between the two. K&D simply doesn't address the tension; the pd_work note invented the reconciling contrast and attributed it to K&D.

**Why:** AUDITOR_SPEC guardrail 6 (deeper_learning) requires the pd_work to be real AND to actually treat *this* contradiction (i.e., actually engage the tension), not merely be topically adjacent (commentary on the same verse). A commentary that discusses "signs" without ever contrasting it against the Law's divination ban has NOT treated the contradiction — citing it as if it had is a subtler variant of "invented pd_work" that a spec-literal "is this book/author real and on this verse" check would miss.

**How to apply:** For every deeper_learning pd_work claim that says a PD commentator "distinguishes"/"reconciles"/"resolves"/"argues X vs Y," don't stop at confirming the commentator wrote on the cited verse — fetch enough of the actual note text (and, if the claim spans two loci, both loci) to confirm the specific reconciling sentence exists. If the source only discusses one side of the tension (here: the signs function) without ever addressing the other side (here: how that squares with the divination ban), classify deeper_learning=`flag`, not `ok`, even though the work itself is real, on-verse, and on-topic in a loose sense. Related: [[feedback_harmonization_skeptic_false_concession]], [[feedback_keil_delitzsch_parity]].
