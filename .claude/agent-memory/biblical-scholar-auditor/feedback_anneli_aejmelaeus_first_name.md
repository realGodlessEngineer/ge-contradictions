---
name: Aejmelaeus first name is Anneli not Anna
description: Septuagintalist Aejmelaeus's first name is Anneli (not Anna); AI drafts persistently get this wrong
type: feedback
---

The Finnish Septuagint scholar whose work on Old Greek of 1 Samuel is widely cited (essays "Corruption or Correction?" in JSJSup 157, "How to Reach the Old Greek in 1 Samuel" in VTSup 148, etc.) is **Anneli Aejmelaeus** (born Anneli Pirjo Marjukka Halonen, 1948-2025), professor emerita at Helsinki and former director of Göttingen Septuaginta-Unternehmen.

**Why:** Pass-3 audit of batch_15 found all 5 instances of "Anna Aejmelaeus" — 2 in commentary text (entries 286, 290) and 3 in scholarship entries (286, 290, 299). The error survived earlier passes (1 and 2) because the surrounding citation metadata (essay title, volume series, page range) was correct, so the editor's attention slid past the first name. This is a classic late-pass discovery: structural fields look right, attribute name is wrong.

**How to apply:** When Aejmelaeus is cited, explicitly verify the first name reads "Anneli" (two n's, ends -eli). The common AI-mistake form "Anna" is a corruption. Likely a name-substitution by token frequency since "Anna" is far more common than "Anneli" in English text. Apply same scrutiny to other Finnish/Scandinavian names where AI may substitute Anglicized forms (e.g., Soisalon-Soininen, Aejmelaeus, Lambdin variants).
