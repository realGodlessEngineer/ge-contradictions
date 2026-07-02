---
name: feedback_id336_iddo_zechariah_clean
description: Harmonization audit id 336 (Zechariah son or grandson of Iddo) verified clean end-to-end — reference case for single-excerpt discrepancy_first parity ties.
metadata:
  type: feedback
---

Contradiction 336 ("Was Zechariah Iddo's son or grandson?" — Ezra 5:1/6:14
"son of Iddo" vs Zechariah 1:1 "son of Berechiah, the son of Iddo") audited
clean on first pass, all guardrails ok.

- Only one excerpt sampled (336#0, reconcile pole): Adam Clarke's Ezra 5:1
  note, verbatim match confirmed against embedded `source_note_text`
  ("The son of Iddo - That is, the grandson of Iddo; for Zechariah was the
  son of Barachiah, the son of Iddo. See his prophecy, Zac 1:1 (note).").
  On-tension, correctly reconciling.
- Discrepancy pole is `named_skeptic`: Steve Wells / Skeptic's Annotated
  Bible, `contra/iddo.html` — confirmed real, live, and directly presses
  this exact 3-passage tension.
- **Parity tie is valid**: on a `discrepancy_first` row, lean(discrepancy)=1
  (named-skeptic connective counts as 1) vs reconcile=1 (single excerpt) —
  the rule is lean **≥** other, so a 1-vs-1 tie passes; don't flag ties as
  violations.
- `deeper_learning.defense.pd_work` reused the row's own Clarke excerpt as
  the PD anchor (policy-sanctioned fallback when Haley 1874 has no entry —
  verified Haley has no Iddo/Berechiah/Barachiah hit). Link
  `gotquestions.org/prophet-Zechariah.html` confirmed live and on-topic via
  WebFetch (explicitly resolves the son-vs-grandson tension via "son" =
  "descendant").

See also [[feedback_clarke_1832_codebook_year]] for why the "(1832)" Clarke
date on this row is not a miscitation.
