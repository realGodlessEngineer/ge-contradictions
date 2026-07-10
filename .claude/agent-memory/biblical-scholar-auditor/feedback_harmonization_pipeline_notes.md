---
name: harmonization-pipeline-notes
description: operational notes specific to the harmonization excerpt sweep (data/harmonization/) — source codebook identity, fixed codebook values, source structure, and a discrepancy-connective failure mode
metadata:
  type: feedback
---

- **TYN source code identity**: "TYN" = "Tyndale Open Bible Commentary" (a PD work in bible_ref.db), NOT the reformer William Tyndale. Check `curation/machine/<id>.json` before flagging a TYN attribution (id 446).
- **Clarke 1832 codebook year**: Adam Clarke "(1832)" is a fixed value in the project's `voices.json` codebook — do not flag it as a per-row miscitation; it's intentional and consistent project-wide.
- **Haley chapter structure**: John Haley's *Examination of the Alleged Discrepancies of the Bible* has 3 chapters — I Doctrinal (pp.55-218), II Ethical, III Historical. A pd_work citing a page from the wrong chapter label is a real error (id 411's prayer-table citation is ch.II p.231, was mislabeled "Doctrinal").
- **Harmonization skeptic false-concession**: SAB discrepancy connectives sometimes claim a concession that the live SAB page does NOT actually make — always verify against the live contra page's actual wording, don't trust the connective's paraphrase of what SAB "concedes."
- See [[archive-org-fulltext-search-technique]] for the primary verification method against PD works (esp. Haley); see [[sonnet-named-skeptic-fabrication]] and [[named-skeptic-extra-log]] for the named_skeptic verification track record; see [[gill-commentary-quirks]] for Gill-specific pitfalls; see [[reaudit-clean-log]] for id-level "all clean" confirmations.
