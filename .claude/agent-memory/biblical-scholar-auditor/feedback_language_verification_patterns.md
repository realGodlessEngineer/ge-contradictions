---
name: language-verification-patterns
description: recurring Hebrew/Greek/German transliteration, word-order, and lexical-field errors introduced by AI drafting passes — always verify original-language claims letter-by-letter
metadata:
  type: feedback
---

- Hebrew transliteration confuses shin/samekh: "sallisim" is wrong for שָׁלִשִׁים (shalishim) — ש (shin) ≠ ס (samekh).
- German theological compounds get wrong-cognate substitutions (Tat vs Tun, Folge vs Ergehen) — verify each compound against the source.
- Inter-chapter distance arithmetic drifts to plausible round numbers — verify by counting (e.g. Prov 21:18→13:8 is 8 chapters, not 3, caught pass-10 batch_19).
- Hebrew lexical-field garbling: AI collapses distinct Hebrew roots within the same semantic field across verses (tahor/tsaraph; yashen/num).
- Greek word-order/enclitic errors: John 2:15 transliteration must be "ta te probata" not "te ta" (te follows the first word, pass-3 internal check); Luke 21:11 + Hos 8:13 word order also drifted (pass-9 batch_19); 1 Tim 2:4 word order (pass-10 batch_19).
- Greek verb-form drift: zoiopoiethesontai and apolymi→apollymi corrections (pass-8/9 batch_19); olethros is a noun not a verb (pass-9 batch_19); Isa 34:2 Hebrew form/preposition error (pass-7 batch_19).
- Luke 16:8 "wiser" = phronimōteroi (root phronimos), NOT sophroteros (root sophron) — distinct lexical fields, easy AI substitution.
- Hebrew emendation/morphology: bal-yireh intra-entry inconsistency caught pass-10 batch_19; Isa 8:2 has the LONGER form "Jeberechiah," not "Berechiah" as in Zech 1:1/Matt 23:35 — don't collapse the two.
- AI conflates the Synoptic kingdom-child term paidion with the Pauline immaturity term nepios — different Greek roots, don't treat as interchangeable.
- Scholar first-name corruption: AI drafts have produced "Reuben Bultmann" for Rudolf Bultmann — verify European theologians' first names explicitly, don't trust pattern-completion.
