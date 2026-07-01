---
name: harmonization-textual-variant-forty-four
description: TRANSFORM pass — textual-corruption reconcile family ("forty"→"four"), worked id 245 Absalom's rebellion 2 Sam 15:7 vs 2 Sam 5:4
metadata:
  type: project
---

TRANSFORM-pass handling for the **textual-corruption reconcile family** — rows where
the dominant PD harmonization is "the MT number is a copyist error; read the versions
instead." Split into its own file because the main [[harmonization-transform]] file is
frequently rewritten by concurrent runs and Edits there lose the race (same reason as
[[harmonization-zero-notes]] / [[harmonization-relabel-flag-no-skeptic]]).

**Why:** these rows lean `reconcile_first` (consensus `probable_harmonization`) and the
reconcile pole is carried by text-critical notes that flatly call the MT reading
corrupt and adopt a versional reading — a distinct excerpt-selection pattern worth
recognizing (lead with the note that names the variant + the witnesses).

**How to apply — worked example id 245, "When did Absalom rebel against David?"
(2 Sam 15:7 "after forty years" vs 2 Sam 5:4 David reigned only forty years total),
probable_harmonization → reconcile_first:**
- Dominant move: "forty" (MT) = copyist error for "four," read with the Syriac, Arabic,
  and Josephus. reconcile_first ⇒ NO parity cap; surfaced 3 distinct text-critical
  voices, all on 2 Sam 15:7:
  - **JFB/10/15/7** — "It is generally admitted that an error has here crept into the
    text... we should read with the Syriac and Arabic versions, and JOSEPHUS, 'four
    years'..." (em-dash `--`→`—`; full sentence ends on a real source period, no marker).
  - **KD/10/15/7** — the chronological argument that engages the 2 Sam 5:4 datum head-on:
    "The number forty is altogether unsuitable... David only reigned forty years and a
    half in all..." joined (sense-preserving ellipsis) to "Consequently the reading
    adopted by the Syriac, Arabic, and Vulgate... 'four years' must certainly be the
    correct one"; the second clause is truncated mid-sentence → " …".
  - **CLARKE/10/15/7** — "There is no doubt that this reading is corrupt... But the Syriac
    has arba shanin, Four years; the Arabic the same... and Josephus has the same"; second
    sentence truncated → " …".
  - TYN/10/15/7 and MHC/10/15/7 (MHC instead dates the 40 yrs from Israel's *request for
    a king*, not David's reign) are also-rans, not needed.
- Named skeptic = **Steve Wells / SAB, page absalom_rebel.html**
  (skepticsannotatedbible.com/contra/absalom_rebel.html) — VERIFIED live as the EXACT
  verbatim upstream (title is the row's question word-for-word; cites 2 Sam 15:7-10 vs
  2 Sam 5:4, quotes the NOAB "four years" note). **Slug TRAP:** absalom.html is the
  SEPARATE id-247 row ("How many sons did Absalom have?", 2 Sam 14:27 vs 18:18) — don't
  grab it; this row's live slug is absalom_rebel.html. Giants (Paine/Strauss/DiMattei)
  never pressed this minor textual-variant chronology pair → Wells honest fit.
- pd_work anchored to **JFB on 2 Sam 15:7** (Haley specific coverage unconfirmed →
  row-surfaced commentator per the id-13 lesson in [[harmonization-transform]]).
- **Allowlist MISS — link omitted, never guessed:** gotquestions forty-years-Absalom.html
  404s; defendinginerrancy 2_Samuel_15.7.php 404s; no on-topic page on the three
  allowlisted domains treats the forty-vs-four difficulty → null link with note.
- NOTE for a downstream scholarly pass: textual_variant_involved is clearly TRUE for this
  row (a real MT-vs-versions variant; the apparatus witnesses are Syriac, Arabic, Josephus,
  some LXX/Vulgate MSS, Theodoret).
