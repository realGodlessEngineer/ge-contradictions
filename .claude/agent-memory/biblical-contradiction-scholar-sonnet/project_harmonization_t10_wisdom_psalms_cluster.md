---
name: project_harmonization_t10_wisdom_psalms_cluster
description: T10 hand-sourcing leg on ids 340/344/347/348/349/351/353/356/358/360/361/362/364/365/366/369 (Psalms/Proverbs/Ecclesiastes internal-wisdom-literature tensions, plus theodicy/divine-dwelling/moral-depravity outliers) — mostly honest-absence against the standard PD well
metadata:
  type: project
---

Worked ids 340, 344, 347, 348, 349, 351, 353, 356, 358, 360, 361, 362, 364, 365, 366, 369 for [[project_harmonization_t10_run]]
(see also [[project_harmonization_dossier_t10]]). All twelve share the same 18-source `well[]` list
(strauss, paine, remsburg, cassels, renan x2, schweitzer, troki, ingersoll, colenso x5, spinoza
x2, voltaire, wellhausen) — this is the **generic/default well set**, not curated per-topic, and
it skews heavily toward NT-Gospels/historical-Jesus and OT-Pentateuch-numbers. It has **no
critic who engages intra-wisdom-literature tensions** (Psalms-vs-Proverbs, Proverbs-vs-
Ecclesiastes, "does God answer prayer," "is anyone justified," "should we rejoice over
enemies," "does the righteous prosper") as such — these are 19th-c. polemicists focused on
Pentateuch/Gospel contradictions, not close readers of Wisdom-literature aphorism clashes.

**Result: 11 of 16 honest-absence (340, 344, 347, 348, 351, 353, 356, 358, 360, 362, 365),
5 authored (349, 361, 364, 366, 369) — see below for the full per-id detail.**

- **id 349 (is the law of God perfect — Ps 19:7 vs Heb 8:7) — AUTHORED (re-confirmed, quote
  revised).** Troki's *Faith Strengthened* ch. XIX (troki-faith-strengthened.txt, lines
  ~3544-3560) quotes Ps 19:7-9 and argues the law is eternal/unchangeable and cannot be
  superseded — exactly the discrepancy's OT-affirms-perfection pole. **Final quote used**
  (deliberately starts at v.8, not v.7): "the statutes of the Lord are just, rejoicing the
  heart; the commandments of the Lord are pure, enlightening the eyes; the fear of the Lord is
  clean, standing for ever; the judgments of the Lord are true and righteous altogether …
  These verses give satisfactory evidence, that the divine law in its sublime perfection and
  simplicity is not to be enlarged or curtailed, and much less to be abrogated and superseded."
  attr cites "on Psalm 19:7-9". **Two gotchas, both avoided by dropping the v.7 clause
  entirely rather than quoting it:** (1) the v.7 text itself is corrupted by a real OCR misread
  — "The law\nof the Lord is perfect, restoring the soul; the testi-\nmony of the Lord is
  faithful, making **Avise** the foolish ;" (line 3544-3546) — "Avise" is a garbled OCR read of
  "wise", not an archaic spelling, and writing "wise" instead would NOT be a literal Grep hit
  (self-verify would correctly fail); (2) the natural quote continuation after "superseded"
  ("...by any other code.") crosses a page-break artifact (`"92 FAITH STRENGTHENED."` injected
  mid-sentence) — stop at "superseded." to keep the run clean. Net lesson: when a corpus OCR
  artifact sits inside the exact verse you want, prefer quoting an adjacent clean clause from
  the same block (here vv.8-9, part of the critic's own "Ps. xix. 7-9" citation) over either
  reproducing the garbled word or silently "fixing" it to a word that then fails self-verify.

- **id 340 (do evildoers prosper — Job 12:6 vs Ps 34:21)** — honest-absence. Grepped
  "prosper"/"wicked prosper"/"prosperity of the wicked"/"way of the wicked prosper" across the
  whole 22-source well; also "Job xii"/"Job 12" and "Psalm xxxiv"/"slay the wicked" specifically.
  Only unrelated hits (Job xiii:15 in Ingersoll, Job xiii:16 in Wellhausen re Lev 7:20/Matt
  22:11-13, and a Wellhausen messianic "slay the wicked" line from Isa 11 imagery, not Ps 34:21).
  No well critic engages the prosperity-of-the-wicked theodicy tension at all.

- **id 344 (where does God dwell — Ps 9:11 vs Eccl 5:2)** — honest-absence. Troki (ch. on
  messianic proof-texts, troki-faith-strengthened.txt line ~793) quotes Joel 3:17 ("dwelling in
  Zion my holy mountain") verbatim, but only as one item in a long catalog of OT prophetic
  self-designations building his anti-messianic-fulfillment argument — he never juxtaposes it
  against heaven-dwelling language (Ps 123:1/Eccl 5:2), so quoting it here would misrepresent
  him as pressing this specific tension. No hit anywhere in the well for "Ecclesiastes v"/"God is
  in heaven, and thou upon earth"/"let thy words be few".

- **id 347 (does anyone do good — John 5:29 vs Rom 3:12)** — honest-absence. Remsburg's *The
  Christ* appendix has a heading (#550/551, line ~10762) juxtaposing "There is no man that
  sinneth not" (1 Kings 8:46), "There is not a just man upon earth" (Eccl 7:20), and "There is
  none righteous, no, not one" (Rom **3:10**, not the dossier's 3:12) — close but not the exact
  verseRef, and it's about universal sinfulness generally, not the good-works-rewarded tension.
  A separate Remsburg heading (#522, line ~10193) quotes John 5:28-29 verbatim but for a wholly
  different point (bodily resurrection doctrine, not "who does good") — the two headings are NOT
  juxtaposed by Remsburg, so combining them would misrepresent his argument. Spinoza
  (spinoza-theologico-political-1.txt line 1567) and Troki (line 5366) both quote Eccl 7:20 "doeth
  good and sinneth not" but each uses it for an unrelated point (excusing Balaam's/general sin via
  repentance), not this contradiction. No well hit anywhere for "doeth good" tied to Rom 3:12
  itself, or for "he that doeth good"/3 John 11 language. machineSkeptic (Ingersoll, *Heretics and
  Heresies*) is not one of the well corpusFiles, so unusable regardless.

- **id 348 (does God answer prayer — Ps 18:41 vs Prov 8:17)** — honest-absence. Voltaire's
  Philosophical Dictionary has a "PRAYERS" entry (own-words, verbatim-quotable) but it argues
  the philosophical futility of *petitionary* prayer changing God's immutable will — a different
  angle than the seek-and-find-vs-refused tension in the question. Ingersoll's prayer mentions
  are all about Catholic penance-prayer, not on point. No well source engages "ask and ye shall
  find" vs "seek and not find."

- **id 351 (rejoice over enemies — Ps 58:10 vs Prov 24:17)** — honest-absence. Troki
  (ch. XI, ~line 8742) quotes Prov 24:17 verbatim but uses it approvingly to rebut a *different*
  Christian claim (Matt 5:43 "hate thine enemy"); he never engages Ps 58:10's blood-washing
  vengeance imagery, so it's not pressing this contradiction — would be a misuse to quote it here.

- **id 353 (righteous flourish — Ps 92:12 vs Isa 57:1)** — honest-absence, no hits anywhere in
  the well corpus for either verse or the flourish/perish theme.

- **id 356 (is anyone justified — Ps 143:2 vs Matt 12:37, via Rom 3:20)** — honest-absence.
  Troki ch. XCIII (~line 10318-10354) discusses James-vs-Paul on faith/works justification and
  quotes Rom 3:19-20 ("no flesh be justified... by faith without works of the law") but the
  argument is about the faith-vs-works dispute, not the Matt-12:37-vs-Ps-143:2 "is justification
  possible at all" tension specifically — no well critic pairs those two verses. Strauss §145
  (line ~30142) also touches Rom 3:20/Gal 3:10 but only as descriptive orthodox-Christology
  summary, not a polemical press of this contradiction.

- **id 358 (does wisdom bring happiness — Prov 3:13 vs Eccl 1:18)** — honest-absence. Paine
  (Age of Reason, lines 261-266) calls Ecclesiastes the "solitary reflections of a worn-out
  debauchee" — thematically adjacent (Ecclesiastes' melancholy) but not pressing the specific
  Prov-3:13-vs-Eccl-1:18 pairing. Spinoza (Theologico-Political Pt II, ~line 2444) cites the
  Talmudic tradition that the rabbis nearly hid Ecclesiastes (and almost hid Proverbs) for
  containing "words opposed to the law" — interesting but about canonization controversy, not
  this happiness/grief contradiction.

- **id 360 (bad things happen to good people — Prov 12:21 vs Hab 1:13)** — honest-absence. No
  well source mentions Habakkuk at all except a bare TOC-table entry in Paine (dating table, no
  content engagement) and an unrelated Colenso mention. No hit for "wicked prosper"/"innocent
  suffer"/theodicy language tied to these specific verses.

- **id 362 (should we believe everything — 1 Cor 13:7 "believeth all things" vs 1 John 4:1 "try
  the spirits")** — honest-absence, same generic 18-source well (this one's an outlier topic in
  the cluster: a Pauline credulity-vs-verification ethic tension, not strictly Psalms/Proverbs/
  Ecclesiastes). Grepped "try the spirit(s)", "charity/love believeth/beareth/hopeth all things",
  "1 Cor. xiii"/"corinthians xiii", "every spirit", "prove all things" — zero hits engaging either
  verse. Near-misses checked and rejected: Cassels' front-matter epigraph "Credulity is as real...
  a sin as unbelief" is Archbishop Trench's quote, not Cassels' own words (an epigraph, not
  argument). Spinoza Pt I (~line 217-249, "faith has become a mere compound of credulity and
  prejudices"/"credulity is extolled as faith") is his preface's general anti-clericalism, not
  tied to either cited verse. Remsburg line 8034/9701 "Corinthians xiii, 4" is 2 Corinthians
  13:4 (a crucifixion-language catalog entry), not 1 Corinthians 13:7 — false-positive on the
  bare numeral grep. Ingersoll's *Some Mistakes of Moses* closing peroration ("credulity is not
  a virtue," line 4312-4313) is a general summary line, not keyed to 1 Cor 13:7/1 John 4:1.

- **id 361 (ransom for the righteous — Prov 21:18 vs Mark 10:45) — AUTHORED.** Strauss §113
  (strauss-life-of-jesus.txt line ~22624) directly cites **Prov. xxi. 18** alongside Isa. xliii.
  3 and Isa. liii as the Hebrew conceptual background Strauss thinks Matt 20:28's ransom-logion
  draws on — a genuine, precise textual pairing (source-critical, not identical to the
  discrepancy's "four incompatible answers" framing, but a real engagement with exactly this
  verse pair). Quote: "when in the first gospel ( xx. 28 ) Jesus says, he must give his life a
  ransom for many … this is doubtless to be referred to Isa. liii. , where, according to a
  notion current among the Hebrews ( Isa. xliii. 3 ; Prov. xxi. 18 ), the death of the servant
  of God is supposed to have a propitiatory relation to the rest of mankind." (skipped an
  interleaved Greek clause with the ellipsis — both English fragments grep-verified separately).

- **id 364 (God-pleaser has peace with enemies — Prov 16:7 vs 2 Tim 3:12) — AUTHORED (borderline
  format).** Remsburg's *The Christ* "Bible Contradictions" appendix (line ~10716) is a bare
  rhetorical-heading + juxtaposed-verse-citation catalog, not flowing prose argument — closer to
  the "Burr/Bell bare-verse pamphlet" pattern flagged as a dead end elsewhere in this project.
  Used it anyway because (a) 2 Tim 3:12 is quoted verbatim and is one of the two dossier verseRefs,
  (b) the heading Remsburg himself composed ("What is to be the earthly reward of those that
  follow Christ?") is his own authorial framing of the exact discrepancy, even though the
  specific companion verse he juxtaposes is 1 Pet 3:13 rather than Prov 16:7 (same "worldly
  safety/reward for the godly" theme, not a verbatim match to Prov 16:7 itself). Judgment call —
  flag for human spot-check if the bare-list format is later ruled out project-wide.

- **id 365 (is it good to be happy — Eccl 7:3 vs Eccl 8:15)** — honest-absence. No well hit for
  "mirth," "house of mourning," or "eat drink and be merry" tied to Ecclesiastes 7/8 anywhere in
  the 18-source corpus.

- **id 366 (what's new — Eccl 1:9 vs Rev 21:1) — AUTHORED.** Spinoza's *Theologico-Political
  Treatise* Part II ch. VI (spinoza-theologico-political-2.txt line ~570) quotes Eccl 1:9-11
  verbatim ("there is nothing new under the sun") as scriptural proof of a fixed, unchangeable
  natural order, and explicitly concludes "miracles only appear as something new because of
  man's ignorance" — a strong, precise, on-point engagement (own philosophical argument built
  directly from the cited verse, not just an OT/NT-list juxtaposition). Two-fragment quote,
  ellipsis-joined, skipping ~12 intervening lines of the same paragraph; both fragments
  grep-verified.

- **id 369 (who is the first and the last — Isa 48:12 vs Rev 1:17) — AUTHORED.** Troki's *Faith
  Strengthened* Part I ch. XXV (line ~7700-7715) quotes Isaiah 44:6's "I am the first and I am
  the last, and besides me there is no other God" (the same recurring self-designation as
  48:12) and draws the explicit anti-Trinitarian conclusion in his own words: "The one God, and
  his one and only law of Sinai, will be acknowledged by all the inhabitants of the earth; no
  principle of Duality or of Trinity will then prevail." De-hyphenated a genuine page-wrap
  hyphenation ("inha-/bitants" → "inhabitants") when joining lines — a legitimate OCR line-wrap
  artifact, not a spelling change. Note the attr cites Isaiah 44:6 (the verse Troki actually
  quotes) rather than 48:12 (the dossier's verseRef) since both are the same "I am the first...
  the last" formula repeated across Isaiah 41/44/48 — Troki's argument applies equally to either
  occurrence.

**Pattern for future workers**: any Wisdom-literature-internal (Psalms/Proverbs/Ecclesiastes vs
each other, or vs isolated NT one-liners) contradiction bundled with this *generic* 18-source
well is a coin-flip: Troki (best hit rate for OT law/Psalms/Isaiah polemics), Strauss (best hit
rate for NT-doctrine-with-an-OT-prooftext, e.g. ransom/ransom-logion sourcing), and Spinoza
(best hit rate for "fixed order of nature" / scripture-interpretation arguments, e.g.
Ecclesiastes-as-proof-of-unchanging-nature) are the three most productive of the 18 sources for
this cluster — check those three first. Remsburg's "Bible Contradictions" appendix (a bare
heading + verse-citation catalog, not essay prose) is a *lower-confidence* source: usable when
one of the dossier's exact verseRefs is directly quoted under a heading Remsburg himself
composed, but flag mentally as the weakest form of "critic's own words" in this well set — it's
one step above a bare Wells/SAB-style verse list. Don't stretch adjacent-theme PD material
(Voltaire's prayer entry, Paine's Ecclesiastes crack, Strauss's Pauline-doctrine summary,
Remsburg mismatched companion verses) into a false discrepancy quote — verify the *exact* verse
pair or an unmistakably equivalent formula (e.g. Isaiah's recurring "first and last" occurs at
41:4/44:6/48:12 and any one instance legitimately stands for the others) is actually engaged.
