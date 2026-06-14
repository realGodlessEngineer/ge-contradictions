---
name: Scholar first-name corruption hallucination
description: AI drafts occasionally corrupt the first name of major scholars; "Reuben Bultmann" for Rudolf Bultmann seen in batch_25 entry 482
type: feedback
---

AI-drafted commentary sometimes corrupts the first name of major scholars while keeping the surname correct. Example: batch_25 entry 482 had "Reuben Bultmann" where the correct name is **Rudolf Bultmann** (1884-1976, German Lutheran NT scholar at Marburg). This is the same class as "Anna Aejmelaeus" for Anneli Aejmelaeus — token frequency / autocomplete corruption.

**Why:** First-name slot is high-variance during AI generation; surname acts as anchor. When the surname is rare (Bultmann, Aejmelaeus) the model is anchored, but the first name can drift to a phonetically/orthographically near token (Rudolf→Reuben).

**How to apply:** When auditing major-scholar references, especially European/German theologians, verify first name explicitly. Watch for: Bultmann (Rudolf, not Reuben/Robert/Rudy), Aejmelaeus (Anneli, not Anna), Käsemann (Ernst), Bornkamm (Günther), Conzelmann (Hans), Cullmann (Oscar), Jeremias (Joachim), von Rad (Gerhard), Noth (Martin), Wellhausen (Julius), Zenger (Erich). Same risk class for any non-Anglo first name where surname is rarer/more distinctive.
