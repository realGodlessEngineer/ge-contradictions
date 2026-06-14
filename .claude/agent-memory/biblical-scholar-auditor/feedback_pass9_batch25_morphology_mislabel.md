---
name: Pass-9 batch_25 morphology mislabel — indicative vs participle
description: AI drafts can mislabel finite-aorist-indicative main verbs as "aorist participles" within the same clause; pass-9 batch_25 caught apekulisen mislabel in Matt 28:2
type: feedback
---

Pass-9 of batch_25 caught a Greek morphology mislabel: entry 497 commentary called apekulisen ('rolled back', Matt 28:2) an "aorist participle." It is actually V-AIA-3S (aorist indicative active 3rd singular) — the main finite verb of its clause. The actual aorist participles in Matt 28:2 are katabas ("having come down") and proselthōn ("having approached"), both modifying the angel.

**Why:** AI drafts conflate participial syntax with the temporal "perfective" feel of aorist. When a sentence has multiple aorist forms (participles + indicative), the AI may pick the indicative finite verb but label it as participle, especially when an English participial-style phrase ("the angel having rolled the stone") feels syntactically natural to the AI's surface translation.

**How to apply:** When a Greek verb form is grammatically labeled (participle / indicative / subjunctive) in commentary prose, verify the actual parsing. The label "aorist participle X" is a high-risk class — confirm against biblehub.com/text or any morphological parser. Even when the gloss in scare quotes is correct ('rolled back'), the morphological label may be wrong.

Extends pass-8 batch_25 finding (anastasai → anestēsan) into a broader Greek-morphology-precision class: pass 8 caught lexical form, pass 9 caught grammatical category. Together, late passes on Synoptic batches should sweep all Greek-grammatical labels.
