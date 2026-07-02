---
name: feedback_ezra_neh_kd_animal_count_slip
description: Harmonization audit id 334 (singers 200 vs 245) — generator connective/deeper_learning note misidentified K&D's "245 of the following verse" as camels; K&D's own next verse gives mules=245, camels=435
metadata:
  type: feedback
---

In the harmonization sweep (`data/harmonization/audit/work/`, `AUDITOR_SPEC.md`), id 334
("How many singing men and women returned from Babylon?", Ezra 2:65 vs Neh 7:67, 200 vs 245)
has a clean, verbatim K&D excerpt (334#0) attributing the gap to a scribe's eye jumping to
"the 245 of the following verse." Both the reconcile `connective` and the `deeper_learning.
defense.pd_work.note` editorialize this as "245 **camels**" — but K&D's own embedded text at
Ezr 2:66-67 lists "mules, 245; camels, 435." The animal is a mule, not a camel. Flagged under
Guardrail 5 (connectives must be accurate to what they introduce) — G line `connectives=1`.

**Why:** the generator sometimes adds a specific plausible-sounding detail (an animal name,
a number) to a connective/note that goes beyond what the cited excerpt itself states, and that
added detail can be checked — and can be wrong — against the *same* source_note_text embedded
in the work file. This is a distinct failure mode from in_source verbatim-drift: the excerpt
text itself was 100% verbatim and correctly attributed; only the connective's paraphrase
introduced the error.

**How to apply:** when a connective or deeper_learning note adds a specific fact (an animal,
a number, a name) not present in the `excerpt_text` itself, cross-check that fact against the
full embedded `source_note_text` (which often contains adjacent verses/data, e.g. Ezra
2:66-67's beast-count table) before passing the connective. Don't assume accuracy just because
the underlying excerpt is verbatim — verify every added editorial detail too. Relates to
[[feedback_gill_1tim32_office_qualification]] (connective must not overclaim beyond the cited
text) and general Guardrail 5 practice logged in [[project_harmonization_sweep]].
