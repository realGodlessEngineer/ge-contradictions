---
name: feedback_gill_neh76_copyists_names_only
description: Gill's Neh 7:6 preface (reused reconcile excerpt across many Ezra2/Neh7 census rows) scopes "carelessness of copiers" to NAME variants only, never to the NUMBER gaps
metadata:
  type: feedback
---

Gill's Exposition note on Nehemiah 7:6 ("These are the children of the province that went
up...") is a blanket preface explaining ALL divergences between the Ezra 2 (Babylon-departure)
and Nehemiah 7 (Jerusalem-arrival) registries. It gives THREE distinct causal buckets, each
scoped to a different kind of variance:

1. **Numbers** — changed minds and stayed in Babylon, died en route, or joined late
   ("some of those that gave in their names changed their minds, and tarried in Babylon, and
   some might die by the way... others who did not give in their names at first... followed
   after and joined those which were returning, and increased the number of others").
2. **Family/company reassignment** (Abendana) — people counted among non-genealogized
   companies in Ezra, later correctly assigned to their proper families in Nehemiah's register.
3. **Names only** — "as for difference of NAMES, that may be owing to the carelessness of
   copiers, or to the different pronunciation of names, or some men might have two names."

Bucket 3 (copyist carelessness) is explicitly introduced with "as for difference of names" —
Gill never applies it to the headcount/number gaps. A connective that cites "copying slips" as
one of the reasons Gill's note "covers" a NUMBER discrepancy (e.g. Ezra 2:60's 652 vs Neh
7:62's 642) is a Guardrail-5 overclaim — flag `connectives=1`.

**Why:** audit id 333 (Delaiah/Tobiah/Nekoda, 652 vs 642) found exactly this: the reconcile
connective said "attrition, late joiners, copying slips — covers this ten-person shortfall
too," but only the first two are number-scoped in Gill's note; "copying slips" belongs to
bucket 3 (names). The excerpt itself was verbatim/on-topic/correctly-poled (E-line overall
still flagged to `1` for the borderline connective, per the spec's "borderline connective a
human should glance at" flag clause) — this is a connective-only defect, not an excerpt defect.

**How to apply:** this same Gill Neh 7:6 note is very likely reused as the reconcile excerpt
across many other Ezra-2-vs-Nehemiah-7 clan-count rows in this cluster (Haley's own pd_work
count is "some twenty" such cases — see [[feedback_ezra_neh_kd_animal_count_slip]] and
[[feedback_archive_org_fulltext_search_technique]] for the sibling id-334/id-320/id-344 finds
in this same cluster). Whenever this Gill excerpt recurs, re-check the connective's causal
list against this three-bucket split — flag any connective that imports "copying slips"/
"copyist error" into a NUMBER-gap justification via this particular note.
