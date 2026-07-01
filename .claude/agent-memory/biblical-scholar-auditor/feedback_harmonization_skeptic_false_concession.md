---
name: harmonization-skeptic-false-concession
description: Harmonization-sweep discrepancy connectives sometimes claim the SAB skeptic "grants/concedes" the harmonizing reply when the live SAB page does not concede
metadata:
  type: feedback
---

On reconcile_first harmonization-sweep rows with a thin named-skeptic discrepancy pole, the TRANSFORM-generated discrepancy connective sometimes claims the skeptic (usually Steve Wells / Skeptic's Annotated Bible) "grants" or "concedes" the standard harmonizing reply. The Skeptic's Annotated Bible contra/* pages almost always present a FLAT contradiction with at most a bare "Christian Responses (External Links)" section and NO concession in their own content.

Example: id-214 (Samuel's firstborn Joel vs Vashni). Connective said SAB "grants the standard reply that the Masoretic 'Vashni' is a scribal corruption." The live contra/sams_son.html page concedes nothing. -> named_skeptic=strawman, connectives=flag.

**Why:** AUDITOR_SPEC guardrail 3 + 5: if the skeptic does not actually concede, the connective must not say so (mirror of the id-439 rule where a skeptic who DOES concede must be reported as conceding). A false concession softens the discrepancy pole and misrepresents the critic.

**How to apply:** Whenever a discrepancy connective attributes a concession/grant/acknowledgment to an SAB row, VERIFY against the live SAB contra page before passing. Default to flag (connectives) + strawman (named_skeptic) if the page is a flat list with no in-content concession. The excerpt itself can still ship if verbatim+on-tension+correctly labeled; the flag is editorial on the pole connective. Recommend: drop the false concession or set relabel_flag. Related: [[feedback_audit_stopping_rule]].
