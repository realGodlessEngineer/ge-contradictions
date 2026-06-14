---
name: Pass-9 batch_19 Greek/Hebrew word-order and transliteration sweep
description: Pass-9 batch_19 caught further Greek/Hebrew transliteration word-order + spelling errors after pass-8 already caught 2 word-order inversions
type: feedback
---

Pass-9 of batch_19 returned 5 errors after pass-8 = 4 (already-2-Greek-word-order). Trajectory: 2,1,3,0,4,1,5,4,5.

**Errors found in pass 9**:

1. **Greek transliteration** (entry 367): "pantes zoiopoiethesontai" for ζῳοποιηθήσονται (1 Cor 15:22) — "zoio-" is wrong; Greek ζῳο- transliterates as "zōo-" (zeta-omega-omikron), not "zōio-." Fix: "pantes zōopoiēthēsontai".

2. **Hebrew transliteration** (entry 376): "ottot ha-shamayim" for אֹתוֹת הַשָּׁמַיִם (Jer 10:2) — doubled "tt" is wrong; MT has single tav with no dagesh forte. Fix: "otot ha-shamayim".

3. **Greek word-order** (entry 376): "sēmeia te megala ap' ouranou" for Luke 21:11 — TR has "σημεῖα ἀπ' οὐρανοῦ μεγάλα" and NA28 has "ἀπ' οὐρανοῦ σημεῖα μεγάλα"; entry's order matches neither. The τε belongs to φόβητρά upstream, not σημεῖα. Fix: "ap' ouranou sēmeia megala" (NA28 order matches the critical-scholarship register of the entry).

4. **Hebrew word-order** (entry 379): "yashuvu mitsrayim" for Hos 8:13 — MT word order is מִצְרַיִם יָשׁוּבוּ ("Egypt they-shall-return"), not יָשׁוּבוּ מִצְרַיִם. Fix: "mitsrayim yashuvu, 'to Egypt they shall return'".

5. **Lexical category error** (entry 367): "Apollymi (perish), phtheiro (destroy), olethros (destruction) — these are destruction-verbs" — ὄλεθρος is a NOUN, not a verb. Fix: "destruction-words" (preserves lexical-field claim).

**Why:** Greek/Hebrew word-order and transliteration class is layered with at least three sublayers — Greek word order matching MT/TR/NA28 (pass-8 caught 2 such, pass-9 caught 1 more for Luke 21:11), Hebrew word order matching MT (pass-9 first for Hosea 8:13), and transliteration of Greek diphthongs/double-letters (pass-8 "Apolymi"→"Apollymi"; pass-9 "zoio-"→"zōo-"). Each sublayer requires fresh verification angle against the underlying source text. Internal consistency within entry isn't a tell because errors can be uniformly applied.

**How to apply:**
- For every Greek transliteration, verify against NA28 (or TR if the SAB-cited verse follows KJV). Confirm both word order AND letter count.
- For every Hebrew transliteration, verify word order against MT — Hebrew VS order vs. NS order matters semantically and the entry must match MT.
- ζῳο- = "zōo-" or "zoo-" not "zoio-". The iota subscript under omega does not get represented in standard transliteration as an "i."
- Hebrew אֹתוֹת = "otot" (singular tav with cholem-vav vowel); doubled-letter forms like "ottot" reflect English orthography habits, not Hebrew morphology.
- Greek nouns (olethros, krisis) versus verbs (apollymi, phtheiro) — verify lexical category before grouping them as a single morphological class.

Pass-9 trajectory: 2,1,3,0,4,1,5,4,5. 9/10 used. One pass remaining (pass-10 final under 10-pass cap). Greek/Hebrew transliteration class STILL not exhausted.
