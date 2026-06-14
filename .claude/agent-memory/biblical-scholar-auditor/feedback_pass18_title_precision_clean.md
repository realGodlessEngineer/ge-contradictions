---
name: Pass-18 title-precision sweep returns clean after pass-17 minor fix
description: pass-18 of batch_18 (entries 341-360) exhaustive title-precision/edition-precision sweep returned 0 errors; another structural false-zero candidate
type: feedback
---

Pass 18 of batch_18 executed an exhaustive title-precision and edition-precision sweep covering: subtitle article precision, subtitle preposition drift, title capitalization, series name precision (singular vs plural), edition-number precision, translator/editor credit, publisher city/year, pagination, and TOC verification. After pass-17 caught a single article-preposition fix in Firth subtitle ("in Individual Complaints" no "the"), pass-18 verified that fix held and performed independent-angle checks on every major work in the batch.

batch_18 trajectory: 4, 1, 2, 0(false), 3, 8, 4, 4, 7, 3, 4, 1, 3, 0(false), 1, 0(false), 1, 0.

Pass-18 zero is the FOURTH zero in batch_18 (after passes 4, 14, 16 false zeros). The trajectory 15=1→16=0→17=1→18=0 forms an oscillating 0-1 pattern around terminal.

**Why:** Pass-18 swept on title-precision/edition-precision class which was the territory of pass-17's single finding. Per pass-14 false-zero pattern, "a 0-error pass that follows a non-zero pass without a 1-1-1 plateau preceding it is structurally suspect." Pass-18 is exactly this kind of pass.

**Verified PASS for pass-18** (independent angles checked):
- Firth title-page subtitle (Google Books title page confirms no "the" before Individual Complaints) — pass-17 fix holds
- Newsom Book of Job (Oxford: OUP 2003 — title page lists both Oxford and New York; acceptable)
- Propp Exodus 1-18 subtitle: TITLE PAGE = "A New Translation with Introduction and Commentary" (matching IA djvu text and Google Books; AbeBooks/Biblio jacket-form "Notes and Comments" is catalog variant only)
- Dunn Partings of the Ways (plural "Partings" verified; no colon matches 1991 SJT review form)
- Allison James ICC (T&T Clark 2013, title correct)
- All HZ Hermeneia Psalms 2/3 page ranges via Project MUSE TOC
- Bovon Luke 2 Hermeneia 2013 (Dec 1, 2013 — Fortress Press product page)
- Goldingay Vols 1=2006, 2=2007
- Achtemeier 1 Peter pp. 229-234 within MUSE body-middle 169-300 range
- Brueggemann Prophetic Imagination 2nd ed = Fortress 2001
- Smith Early History of God 2nd ed = Eerdmans 2002
- Hundley Gods in Dwellings — SBL series name SINGULAR "Supplement" per official SBL series page (catalog records vary)
- Knohl Sanctuary of Silence — Fortress Minneapolis 1995 (Eisenbrauns is reprint)

**How to apply:** Pass-19 needs to break this oscillation with rigorous independent-angle verification on yet-unchecked dimensions. Candidates: (a) verse-locator internal consistency within commentary prose vs bibleReferences arrays, (b) Greek/Hebrew transliteration consistency across entries (e.g., satan/ha-satan, mōre/mōria), (c) chapter-distance arithmetic re-check (which broke pass-14's false zero), (d) summary-field deep re-read (which broke pass-9 batch_16 false zero), (e) primary-source quotation accuracy (Augustinian quotes, Luther's "epistle of straw" — verified appears in Luther's 1522 preface).

Per the stopping rule: a single 0 after a non-zero is provisional. Pass-19 must continue.
