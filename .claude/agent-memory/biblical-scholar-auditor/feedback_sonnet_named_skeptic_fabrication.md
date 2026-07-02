---
name: sonnet-named-skeptic-fabrication
description: SONNET-tier harmonization sweep fabricates/strawmans named-skeptic attributions; verify the SPECIFIC engagement, not just that the critic is real
metadata:
  type: feedback
---

In the harmonization excerpt sweep's SONNET pilot, the named_skeptic field is the
highest-risk hallucination vector. The model picks a real critic (McKinsey, Ehrman,
Steve Wells) but attaches them to a contradiction they did not actually engage, or
misstates the SCOPE of the objection they raised.

**Why:** owner Decision A flags Sonnet-tier output for extra scrutiny; the directive
explicitly warns McKinsey is cited on obscure wisdom-literature tensions he likely
never treated, and Ehrman on the unforgivable sin.

**More confirmed not_real (pilot_sonnet batch 221/246/260, 2026-06-14):** McKinsey
attached to three obscure OT verse-pairs he is NOT documented to treat — Haman Agagite
vs Amalekite extermination (221), Amasa's father Ithra/Jether Israelite/Ishmaelite (246),
Solomon-to-Hiram provisions 1 Kgs 5:11 vs 2 Chr 2:10 (260). All not_real (absent from the
tektonics rebuttal index + newsletter searches); the real lister of these is Steve Wells/SAB.
id 246's connective was also a garbled run-on imputing a false "concedes corruption →
undermines inerrancy" strawman → connectives flag. id 158 (Caleb vs Caleb+Joshua, Num
13:30/14:6) correctly cited Wells/SAB and CONFIRMED real (SAB num/13.html lists "Who argued
in favor of occupying Canaan during the Exodus?"). Pattern holds: McKinsey-on-obscure-OT
defaults not_real; Wells/SAB attributions tend to check out.

**How to apply:** for every named_skeptic, WebSearch/WebFetch to confirm the critic
engaged THIS specific pairing. Verified results from pilot_sonnet batch (343/362/395/427):
- **McKinsey (Encyclopedia of Biblical Errancy / Biblical Errancy newsletter)** — real
  critic, but the tektonics.org chapter-by-chapter rebuttal index (tektonics.org/af/ebestart.php)
  is a good topic checklist; it did NOT list either "fool/foolishness is good vs. Psalm 5:5"
  (343) or "believe all things vs. prove all things" (362). Both = not_real.
- **Steve Wells / SAB** — REAL: SAB genuinely lists "Where did John baptize?"
  (skepticsannotatedbible.com/contra/jordan.html), Mt 3:6/Mk 1:5,1:9 'in Jordan' vs
  Jn 1:28 'Bethabara beyond Jordan'. Engagement authentic (395). But "SAB Press, 2012"
  print-imprint metadata is loose — SAB is primarily a website.
- **Bart Ehrman, Jesus, Interrupted (2009)** — real, discusses the unforgivable-sin
  saying, BUT only the tension INTERNAL to the Synoptic saying; NOT documented framing
  it as a contradiction with Acts 10:43/13:39/Col 2:13/1 John 1:9 universal-pardon texts.
  The connective's cross-corpus framing = strawman (427).

**Knock-on rule:** when named_skeptic is not_real/strawman, the discrepancy_integrity
guardrail on a discrepancy_first row goes co_opted (or relabel_missing) and connectives
goes flag, because the surfaced objection rests on the unverified attribution.

**Deeper_learning pd_work:** John Haley, Examination of the Alleged Discrepancies of the
Bible (1874) is the default PD work for ALL four. It is real and genuinely treats the
classic discrepancies (Bethabara/Bethany; unpardonable sin) — pass those. For obscure
topical/wisdom pairings (fool, believe-all/prove-all) I could not confirm Haley contains
the specific entry the note confidently asserts → flag, don't pass.

**Second pilot_sonnet batch (66/117/119/128), 2026-06-14 — confirms + extends:**
- **Ehrman, Jesus, Interrupted (2009) on "law ordained by angels" Gal 3:19 (id 119)** — not_real.
  Internet Archive full-text of the book has NO mention of Gal 3:19 / Acts 7:53 / Heb 2:2 /
  angel-mediation of the law. The book is NT/Gospel-focused; its OT material is creation
  accounts, divine name (Exod 6:3 vs Gen 15:7), plagues, Pentateuch authorship. The
  "degrades Torah's authority" framing is the Betz angels-as-diminishment reading,
  misattributed. (Pattern: Ehrman keeps getting attached to OT-law tensions he never wrote on.)
- **McKinsey, Encyclopedia of Biblical Errancy (1995) on Hosea marriage command (id 117)** —
  not_real (unconfirmed specific engagement; default-to-not_real). defendinginerrancy.com
  Hosea 1:2 page names no skeptic for this objection.
- **Steve Wells / SAB stayed REAL again** — id 66 (Sarah faith Heb 11:11 vs Gen 18) and id
  128 (perfume Prov 27:9 vs Exod 30) are both genuine SAB-listed contradictions (perfume is
  on skepticsannotatedbible.com/pr/contra_list.html + philb61.github.io mirror). Pattern
  holds: SAB/Wells skeptics are trustworthy after a contra_list.html check; named-scholar
  skeptics are the hallucination vector.
- **deeper_learning link slug guessing (NEW failure class)** — id 117 cited
  gotquestions.org/Hosea-wife-prostitute.html → HTTP 404. Real page is
  gotquestions.org/Hosea-marry-prostitute.html. ALWAYS HTTP-verify the exact slug of an
  allowlisted link; the domain being correct is not enough.

**Genesis/creation batch (ids 2/10/15/63), 2026-06-14 — confirms + extends:** all four Gill
reconcile excerpts were clean (verbatim, on-tension, correct pole) — Sonnet risk stayed in
skeptic + deeper_learning.
- **Ehrman, How Jesus Became God (HarperOne, 2014) on creator-Christ vs YHWH-alone, Isa 44:24/
  John 1/Col 1 (id 2)** — REAL this time: the book genuinely frames the Johannine Prologue +
  Colossians hymn as later incarnation-Christology in tension with the strict-monotheist strand
  (Ehrman calls Isaiah's monotheism a minority view). Isaiah-44:24 framing a defensible
  extrapolation → named_skeptic ok. Contrast the id-119/id-427 Jesus-Interrupted not_real/strawman:
  SAME AUTHOR, DIFFERENT BOOK — verify the WORK, not just the name. This is the first verified
  Ehrman PASS, so Ehrman is not auto-not_real; it is book+topic specific.
- **Robert Ingersoll, Some Mistakes of Moses (1879) on Gen 2:4 "in the day" vs six days (id 15)**
  — NOT_REAL: Ingersoll/work real, but his actual text (infidels.org full text) critiques the
  ORDER of creation and literal-day-vs-ages, NOT the one-day/six-day two-timeline objection the
  connective fabricates → not_real, connectives flag, discrepancy_integrity relabel_missing
  (probable_harmonization, beyom idiom accepted, no real skeptic → should set relabel_flag).
  New name in the hallucination set: Ingersoll, attached to a tension he never pressed.
- **Steve Wells / SAB stayed REAL again** — id 10 (Gen 1:29 every-tree vs Gen 2:17) and id 63's
  contrast: McKinsey, Encyclopedia of Biblical Errancy (1995) on Isaac "only son" (Gen 22:2/Heb
  11:17 vs Ishmael+Keturah) is a MAINSTREAM errancy-catalog entry → here McKinsey is ok (vs the
  obscure-OT McKinsey not_real defaults above; mainstream-topic McKinsey can check out).
- **Haley pd_work** — passed for id 2 (Trinitarian creation) and id 63 (Abraham's-sons, a known
  Haley historical-discrepancy topic); FLAGGED for id 10 (tree-grant tension) and id 15 (Gen 2:4
  timeline) where verse-level Haley coverage was unconfirmable.

**pilot_wf audit id 298 (Who succeeded Jehoiakim? 2 Kgs 24:6 vs Jer 36:30), 2026-06-20 — clean
confirmation:** Wells/SAB stayed REAL — SAB contra/jehoiakim.html ("Who succeeded Jehoiakim as
king?") cites exactly 2 Kgs 24:6 vs Jer 36:30; pattern holds, SAB attributions check out. JFB
reconcile excerpt (2 Kgs 24:6, three-month-vassal-reign harmonization) verbatim-confirmed vs
biblehub JFB. NOTE the work-file URL guesser failed once: contra/succeeded_jehoiakim.html → 404;
real slug is contra/jehoiakim.html — always WebSearch the SAB topic, don't guess the slug.
deeper_learning: defendinginerrancy.com/Jeremiah_36.30.php is REAL+on-topic (sources Geisler/Howe
When Critics Ask). Haley 1874 real PD work but specific Jehoiakim/Jehoiachin entry UNCONFIRMABLE
(IA full-text not retrievable) → flagged per default-when-unsure, even though it's a classic
historical-person succession discrepancy squarely in Haley's "Pertaining to Persons" category.

**audit id 12 (Who was Timna? Gen 36:12 concubine vs 1 Chr 1:36 son of Eliphaz), 2026-06-21 — all
clean:** Wells/SAB stayed REAL — SAB contra/timnah.html ("Who was Timnah?") cites exactly Gen 36:12
(concubine) vs 1 Chr 1:36 (son), question text matches the work-file verbatim; pattern holds.
NEW pd_work confirmed: **John Gill, Exposition of the Entire Bible (1746-63)** genuinely treats
1 Chr 1:35-36 directly, arguing Timna is not a man's name but Eliphaz's concubine/Amalek's mother,
citing the Arabic version + Alexandrian Septuagint (verified biblehub Gill 1 Chr 1). Gill is a solid
PD apologetic exit when the reconcile excerpt itself is Gill — link honestly omitted (no allowlisted
page), pd_work alone = deeper_learning ok. Gill reconcile excerpt verbatim-confirmed. All guardrails 0.

**audit id 9 (Is childbearing sinful? Gen 1:28 vs Lev 12:6-7 sin offering), 2026-06-21 — all clean:**
Wells/SAB REAL again — SAB lev/contra_list.html lists entry #11 "Is childbearing sinful?" referencing
Lev 12:6 exactly; gotquestions.org confirms SAB's framing. Pattern holds rock-solid.

**audit id 24 (Does God respect anyone? Gen 4 favoritism vs no-respecter-of-persons stack), 2026-06-21:**
McKinsey (Encyclopedia of Biblical Errancy, 1995) named on a CLASSIC SAB contradiction → not_real. SAB
contra/respect.html lists this exact tension with the exact verse stack (Gen 4:3-5 vs Deut 10:17/Acts
10:34/Rom 2:11/Gal 2:6/Eph 6:9/Col 3:25/1 Pet 1:17) and names NO scholar — the real lister is Wells/SAB,
not McKinsey. tektonics EBE rebuttal index (chs 1-4) doesn't list it; no search confirms McKinsey's
specific engagement. Even though "respecter of persons" is fairly mainstream (cf. McKinsey-ok on Isaac
only-son id 63), unconfirmed specific engagement → default not_real. Row was reconcile_first w/
discrepancy=named_skeptic, so discrepancy_integrity stays ok (NOT co_opted — that's a discrepancy_first
concept; the discrepancy side IS surfaced); but connectives=flag because "pressed by McKinsey" rests on
the unverified attribution. deeper_learning PASSED: Matthew Henry on Acts 10:34 is a real PD work treating
this exact tension — "God, as a benefactor, gives favours arbitrarily and by sovereignty; but he does not,
as a judge, so give sentence" (verbatim-confirmed via biblehub mhc + christianity.com). gotquestions.org/
God-is-no-respecter-of-persons.html is live+on-topic+allowlisted. Soft spot: note's "ties back to Gen 4:7"
sub-claim unconfirmed in Henry's Acts 10 text (over-specification, didn't sink the pass). JFB reconcile
excerpt (Acts 10:34, status-vs-personal-character distinction) verbatim-confirmed + on-tension + correct pole.
- **Gill verse-ref label vs note-content mismatch (NOT an error):** work file labeled the excerpt
  GILL/3/12/5 (Lev 12:5), but the embedded source_note_text + excerpt are actually Gill on Lev 12:**6**
  (where the sin offering is introduced). biblestudytools .../leviticus-12-5.html did NOT contain the
  phrase; .../leviticus-12-6.html DID (verbatim: "But why a sin offering for childbearing? is it sinful
  to bear and bring forth children in lawful marriage…" + Eve "first in the transgression" + "typical
  of the sin offering Christ"). in_source judges the EMBEDDED note, so PASS — but if a Gill excerpt is
  missing from its labeled verse page, check the adjacent verse; Gill discusses a topic under the verse
  that introduces it.
- **deeper_learning pd_work = John Gill, Exposition (1746-63) on Lev 12** — real PD, treats THIS exact
  tension (poses "is it sinful to bear children in lawful marriage" and answers ceremonial/inherited-sin/
  typological). Link gotquestions.org/unclean-daughter-longer-son.html live + on-topic (distinguishes
  ritual uncleanness from sinfulness). Verdict E pass / G all-0. Gill is now confirmed twice (ids 9, 12)
  as a solid PD default for purity/genealogy tensions.

**Ehrman PASS #2 — audit id 18 (Is marriage a good thing? Gen 2:18 vs 1 Cor 7:1,7), 2026-06-21:**
Ehrman, *The New Testament: A Historical Introduction to the Early Christian Writings* (1997) on Paul's
marriage/celibacy teaching = REAL and fairly represented. Ehrman demonstrably argues (blog + textbook,
corroborated by ehrmanblog.org/chastity-within-marriage-paul-taught-that) that Paul treats marriage as a
**concession** to human weakness ("because of sexual immorality"), prefers the celibate/single state as
superior, and frames it under the apocalyptic "present distress"/"time has grown short." Connective's
"diverges from Genesis ideal and mainstream Jewish esteem for marriage" is fair (Ehrman contrasts Paul w/
the apocalyptic-John-the-Baptist unmarried norm, unusual in Judaism). THIRD Ehrman work checked: *How Jesus
Became God* (id 2) PASS, *Jesus Interrupted* (ids 119/427) not_real/strawman, *NT Historical Introduction*
(id 18) PASS. Rule reconfirmed: verify the WORK+TOPIC, not the name — Ehrman is NOT auto-not_real. Matthew
Henry reconcile excerpt clean (ellipsis dropped only "would contradict much of the rest of his discourse",
sense preserved); Henry's commentary also served as the real, on-topic deeper_learning pd_work;
gotquestions.org/marriage-relationship-God.html verified live + engages 1 Cor 7. All guardrails 0.

**audit id 11 (What animals may we eat? Gen 1:29/9:3 vs Lev 11/Deut 14 vs Mark 7:19), 2026-06-21 —
STRAWMAN, new name Thomas Paine:** Paine, The Age of Reason (1794-95) is a REAL deist critic who
genuinely engaged Mosaic law, BUT his documented Leviticus/Pentateuch objections are: (1) Mosaic
authorship doubt (3rd-person style), (2) the law promulgated LATE in the monarchy, (3) commandments
carry no internal evidence of divinity, (4) Num 31 slaughter as biblical immorality. He does NOT press
the specific dietary objection the connective put in his mouth — "an immutable God's binding dietary law
can't be squared with later abolition" + "clean/unclean distinction the text dates only to Moses." The
"dates only to Moses" fragment is a loose echo of his late-promulgation point reframed onto the dietary
distinction; the immutability-vs-abolition argument is not his. Confirmed via two WebSearches +
tektonics.org/lp/painet02.php critique index → named_skeptic=strawman (2), connectives=flag (1).
discrepancy_integrity stayed ok (0): this IS a genuine_contradiction that real skeptics (SAB) press, so
NOT co_opted and NO relabel — the pole is properly named_skeptic/filled; the flaw is the misattribution,
already captured by named_skeptic+connectives. (Extends the Ehrman id-119/427 pattern: real author, real
broad engagement, SPECIFIC objection constructed.) deeper_learning PASSED: Matthew Henry Commentary on
Lev 11 is real PD that directly harmonizes — "give thanks for the liberty granted us by the gospel...
every creature of God is good, and we are to call nothing common or unclean," Acts 10:15 repeal, Rom
14:14 / Matt 15:11 cross-refs (quoted phrase near-verbatim). gotquestions.org/Bible-foods.html live,
on-topic, dispensational, allowlisted. Gill reconcile excerpt (four-dispensation economy, Mt 15:11) clean.

**audit id 28 (Was Enoch sixth or seventh from Adam? Jude 14 vs Genesis 5 count), 2026-06-21 — all
clean:** Wells/SAB stayed REAL — SAB contra/enoch7.html ("Was Enoch the sixth or the seventh from
Adam?") cites Jude 14 vs Genesis 5/1 Chr 1/Luke 3, and the SAB note genuinely CONCEDES "The author
of Jude was quoting from the Book of Enoch, not the Bible" — the connective's concession claim is
exact, not strawmanned (id-439 conceding-skeptic pattern handled correctly). NEW pd_work confirmed:
**Keil & Delitzsch, Biblical Commentary on the OT (1861-75) on Genesis 5** treats this directly —
"In Enoch, the seventh from Adam through Seth, godliness attained its highest point" and links Jude
1:14-15 (verified studylight/biblehub kad Gen 5). K&D is both the reconcile excerpt source AND the
deeper_learning pd_work (self-source pattern, same as Gill ids 9/12) — link honestly omitted, pd_work
alone = ok. Reconcile excerpt verbatim-confirmed; ellipsis is a clean mid-sentence truncation that
preserves sense (cuts before "whilst ungodliness culminated in Lamech"). Verdict E pass / G all-0.

**audit id 45 (Will God curse the earth? Gen 8:21 vs Isaiah 24:1-6 + Malachi 4:6), 2026-06-21 — all
clean:** Wells/SAB stayed REAL — SAB contra/curse_earth.html "Will God curse the earth?" cites EXACTLY
Gen 8:21 ("I will not again curse the ground") vs Isa 24:1-6 ("curse devoured the earth") vs Mal 4:6
("smite the earth with a curse"); verse list matches work-file verbatim. Gill reconcile excerpt (Gen 8:20,
"partial calamities... Sodom and Gomorrah... but not a general deluge, or an universal destruction") clean
verbatim, trailing ellipsis truncates "at least not by water... but by fire" preserving sense — the core
scope-distinction harmonization. NEW pd_work confirmed: **John Gill, Exposition on Malachi 4:6** treats THIS
tension directly — limits "earth" to "only that land, and the people of it... to whom the law of Moses was
given" (= Judea, destroyed by Vespasian/Hadrian), explicitly "not the whole earth" (verified biblehub Gill
Mal 4). Link honestly omitted (no allowlisted page on this pairing), pd_work alone = ok. Gill now confirmed
4x (ids 9, 12, 31, 45). Verdict E pass / G all-0.

**audit id 31 (How many sons? "only begotten Son" vs Adam + Spirit-led believers as sons of God),
2026-06-21 — all clean:** Wells/SAB stayed REAL — SAB contra/sons.html "How many sons does God have?"
cites EXACTLY John 3:18, 1 John 4:9 (only begotten), Luke 3:38 (Adam), Romans 8:14 (believers) —
verbatim framing match to the work-file (also lists Gen 6:2-4, Exod 4:22, Jer 31:9, Job 1:6, Ps 2:7,
2 Sam 7:14, Matt 5:9, John 1:12). Gill on Rom 8:14 verbatim-confirmed (biblehub): believers sons "not
in so high a sense as Christ is; nor in so low a sense as Adam was, and angels are ... but by adoption"
— the exact three-sense reconcile; trailing ellipsis honestly truncates "but by adoption, not national
... but special; and which has some agreement…", sense preserved. GotQuestions only-begotten-son.html
REAL + on-allowlist + on-topic (title "What does it mean that Jesus is God's only begotten son?";
distinguishes monogenes from believers' adoptive sonship, Eph 1:5). Gill is again BOTH the reconcile
excerpt AND the pd_work (self-source), here paired with a curated allowlisted GotQuestions link.
Verdict E pass / G all-0. Gill now confirmed 3x (ids 9, 12, 31) as a rock-solid PD default.

**FRIEDMAN PASS (first verified source-critic skeptic) — audit id 41 (Did everyone die in the flood?
Gen 7:21-23 extinction vs Gen 6:4/Num 13:33 surviving Nephilim), 2026-06-21 — all clean:**
- **Richard Elliott Friedman, The Bible with Sources Revealed (HarperSanFrancisco, 2003)** = REAL, fairly
  represented. He genuinely reads Gen 6:4 + Numbers 13 Anakim/giants as one J-stratum tradition that never
  assumes the flood killed the Nephilim, leaving the extinction notice + surviving giants as an unreconciled
  source seam (corroborated by intertextual.bible/text/genesis-6.4/numbers-13.33). Connective's "unreconciled
  seam between strands" framing is accurate, on-tension, no overclaim → named_skeptic ok (0). Source-critic-
  on-Pentateuch-seam attributions CAN check out — contrast the Ehrman/Ingersoll/Paine SPECIFIC-objection
  misattributions; Friedman's documented method IS exactly this kind of seam-naming, so the fit is genuine.
- **pd_work John Gill, Exposition on Gen 6:4** = REAL, treats THIS exact survival tension and REJECTS it —
  verbatim verified vs biblehub Gill Gen 6: "for this is not to be understood after the flood, as Aben Ezra,
  Ben Melech." Used in place of Haley (Haley's coverage of this discrepancy unconfirmable) — sound substitution.
  Gill now confirmed 4x (ids 9, 12, 31, 41) as a rock-solid PD default.
- **link gotquestions.org/Nephilim.html** = live, on-topic (treats Num 13:33 reappearance + Gen 6:4 "and also
  afterward" clause; offers preserved-genetics harmonization), allowlisted. deeper_learning ok (0).
- Tyndale Open Bible Commentary reconcile excerpt (Gen 6:4) verbatim-confirmed in embedded note; trailing
  Deut 2:11/repa'im parenthetical trimmed with ellipsis, sense preserved ("would be destroyed" intact).
  All guardrails 0.

**audit id 79 (Who was Laban's father? Gen 28:5 Bethuel vs Gen 29:5 Nahor), 2026-06-21 — all clean:**
Wells/SAB stayed REAL — SAB contra/laban.html "Who was Laban's father?" lists EXACTLY Gen 28:5 (son of
Bethuel) vs Gen 29:5 (son of Nahor), verbatim framing match to work-file. NEW pd_work + reconcile self-source
confirmed: **Adam Clarke, Commentary on the Bible (1832) on Gen 29:5** treats this exact pair directly —
"Son is here put for grandson, for Laban was the son of Bethuel the son of Nahor" (verbatim-confirmed vs
studylight + sacred-texts.com Clarke Gen 29). Clarke is BOTH the reconcile excerpt AND the deeper_learning
pd_work (self-source pattern, same as Gill ids 9/12/31/41/45, K&D id 28) — used in place of Haley (Haley's
coverage of this specific pair unconfirmable); a row-surfaced harmonizing commentator keyed to the passage
qualifies as PD exit. Link honestly omitted (gotquestions/Laban-in-the-Bible.html does not engage the
Bethuel-vs-Nahor genealogy; on-topic hits off-allowlist), pd_work alone = ok. Row reconcile_first w/
discrepancy=named_skeptic, so discrepancy_integrity ok (surfaced). Verdict E pass / G all-0. Adam Clarke now
joins Gill/K&D as a confirmed PD default for genealogy/idiom (son=grandson) tensions.

**HUPFELD PASS + self-corroborating-harmonizer pattern — audit id 106 (How many days unleavened bread?
Deut 16:8 six days vs seven-day rule of Exod 12/13/23, Lev 23:6, Deut 16:3), 2026-06-21 — all clean:**
- **Hermann Hupfeld (1796-1866), De primitiva et vera festorum apud Hebraeos ratione (Halle, 1851-64)** =
  REAL named_skeptic, fairly represented. Foundational documentary-hypothesis source critic (Wikipedia
  "See also" → Priestly source / Documentary hypothesis; his 1853 Quellen der Genesis established the
  independent Elohist). Festival work genuinely treats Hebrew festal law source-critically. Connective
  ("Deut 16's festal law reflects a different, originally independent legislative source whose six-day count
  cannot be smoothed into the Priestly seven-day rule") is an accurate read of his method.
- **NEW STRONGEST corroboration vector: the harmonizer's own note names the skeptic.** The K&D reconcile
  source_note_text itself says Bachmann "exploded the contradictions ... between this chapter and the earlier
  festal laws, and which Hupfeld has revived in his comments upon the feasts." So the 19th-c. harmonizer
  explicitly attests Hupfeld pressed THIS exact Deut-16-vs-earlier-festal-law contradiction — internal
  self-corroboration, stronger than external search. When a K&D/Gill/Clarke reconcile note rebuts a named
  critic BY NAME, that critic's engagement is confirmed by the note itself.
- discrepancy_first lean: discrepancy pole = named_skeptic (Hupfeld), parity 1>=1 vs single capped reconcile
  excerpt; discrepancy_integrity ok (surfaced, not co_opted).
- **pd_work = K&D on Deut 16:1-8 (1861-75)** = real PD, treats this directly (IS the reconcile source —
  self-source pattern, cf. Gill 9/12/31/41/45, K&D 28, Clarke 79). Link honestly omitted. Verdict E pass /
  G all-0. K&D excerpt verbatim-confirmed vs studylight/sacred-texts kad Deu 16.

**audit id 107 (Did God kill all the Egyptian cattle? Ex 9:6 "all cattle died" vs 9:19 surviving
field-cattle), 2026-06-21 — STRAWMAN via scope-overclaim:** McKinsey (Encyclopedia of Biblical
Errancy, 1995) is a REAL critic who genuinely engaged the broad plague-cattle problem, BUT his
DOCUMENTED engagement is the NARROWER horses-of-Pharaoh's-pursuit point (Ex 9:3 horses die in murrain
vs Ex 14:7 chariot-horses at the sea), cited Biblical Errancy newsletter 181:4 (1998) — verified via
apologeticspress.org/cattle-contradiction-2302. That same apologetic page explicitly attributes the
CORE 9:6-vs-9:19 surviving-cattle wording-tension (the tension that DEFINES this row) to **Steve
Wells/SAB**, not McKinsey. The work-file connective made McKinsey "press the plain wording" of the
9:6/9:19 cattle survival — over-attributing the row's defining tension to him → named_skeptic=strawman
(2), connectives=flag (1). Same texture as id-427 (Ehrman) / id-11 (Paine): real author, real broad
engagement, the SPECIFIC objection-as-framed is constructed/misassigned. discrepancy_integrity stayed
ok (0): genuine probable_contradiction, discrepancy pole IS surfaced (named_skeptic/filled), so NOT
co_opted + no relabel — flaw is misattribution only. NEW lesson: when a plague/multi-verse tension has
TWO documented skeptics with DIFFERENT scopes (Wells on the cattle-survival wording, McKinsey on the
horses), check which one actually pressed THE ROW'S defining verse-pair before crediting it. tektonics
EBE rebuttal index (chs 1-4) has NO Exodus-9 cattle/horses entry. deeper_learning PASSED: Haley 1874 is
real + the Ex 9 cattle/hail case is a classic mainstream Historical Discrepancy in his scope (exact
entry not verbatim-confirmable — archive.org djvu returned only front-matter — but in-scope, not obscure);
defendinginerrancy.com/bible-solutions/Exodus_9.19-21.php VERIFIED live + on-topic (title "If all the
cattle died, then how did some survive?" matches work-file) + allowlisted. JFB reconcile excerpt (Ex 9:6,
"not absolutely every beast...Exo 9:19,9:21...still some left") verbatim-confirmed vs biblehub JFB.

**audit id 63 RE-RUN (How many sons did Abraham have? Gen 22:2 "only son" vs Ishmael+Keturah),
2026-06-21 — all clean, NEW attributions vs the 2026-06-14 version:** the work file CHANGED —
named_skeptic is now **Julius Wellhausen, Prolegomena (Eng. trans. 1885)** (was McKinsey), and pd_work
is now **Adam Clarke, Commentary (1832) on Gen 22:2** (was Haley). Both verified:
- **Wellhausen / documentary-hypothesis seam reading = ok (0).** FIRST verified Wellhausen named_skeptic
  pass. Source critics genuinely read Gen 22 as E, with "only son" creating a seam vs the Ishmael co-heir
  tradition of another stratum (P) — exactly the documented source-critical method, of which Wellhausen
  is the foundational name. Connective ("seam in a composite text rather than harmonizable status term")
  accurate, on-tension, no overclaim. Like Friedman (id 41), source-critic-on-Pentateuch-seam attributions
  CAN check out when the documented method fits the passage.
- **Adam Clarke pd_work = ok (0).** bibletools.org Clarke Gen 22:2 (sVerseID/550) verbatim-confirms
  "Only son - All that he had by Sarah his legal wife" — the exact gloss the note quotes; treats this
  contradiction directly. (sacred-texts + studylight Clarke pages 403'd; biblehub had no Clarke section;
  bibletools sVerseID worked — useful fallback for Clarke verse notes.)
- **link defendinginerrancy.com/bible-solutions/Genesis_22.2_(2).php = ok (0)** — live, on-topic (timing,
  covenantal status, yachid semantic range), allowlisted.
- Gill reconcile excerpt (Gen 22:2, "only legitimate son by Sarah... son of promise") verbatim-confirmed
  in embedded note; trailing ellipsis clean (truncates ":" before "whom thou lovest"). Verdict E pass /
  G all-0. NOTE the transform re-roll swapped a mainstream-errancy skeptic (McKinsey) for a source-critic
  (Wellhausen) and Haley→Clarke — both still pass, but always re-verify when the attribution set has changed.

**audit id 96 (What were the twelve tribes? six differing lists Gen49/Num1/Num13/Deut33/Ezek48/Rev7),
2026-06-21 — McKinsey not_real on a mainstream-SOUNDING topic:** McKinsey (Encyclopedia of Biblical Errancy,
1995) named on the differing-tribal-lists tension. The topic FEELS mainstream-errancy (like Isaac only-son
id 63 where McKinsey was ok), but tektonics EBE rebuttal index (tektonics.org/af/ebestart.php) has NO entry
for tribal lists / number of tribes / fourteen names, and no search confirms McKinsey's specific engagement
-> default not_real (1). Knock-on: connectives flag (1) ("McKinsey presses six-lists-fourteen-tribes" rests
on the unverified attribution). Row is reconcile_first w/ discrepancy SURFACED as named_skeptic, so
discrepancy_integrity stays ok (0) — co_opted/relabel are discrepancy_first concepts (same handling as ids
24, 79). deeper_learning PASSED: **Adam Clarke, Commentary (1832) on Rev 7:5** is real PD treating THIS exact
tension — "tribe of Levi... had no inheritance... now belonged to the spiritual priesthood... tribe of Dan...
omitted; as also Ephraim... Joseph... added in place of Ephraim. Ephraim and Dan, being the principal promoters
of idolatry, are left out" (verbatim-confirmed biblehub Clarke Rev 7). Clarke is the reconcile self-source +
pd_work (note discloses Haley unconfirmable; pattern = Gill/K&D/Clarke ids 79/63). Link gotquestions.org/
tribe-Dan-missing-144000.html live+on-topic (Dan omission + Manasseh/Joseph substitution Rev 7)+allowlisted.
Lesson: "differing twelve-tribe lists" SOUNDS like a flagship contradiction but is a Steve Wells/SAB-style
multi-verse catalog entry, NOT a documented McKinsey EBE chapter — verify, don't assume mainstream feel =
McKinsey coverage. Reconcile excerpt (Clarke Rev 7:5) verbatim-confirmed in embedded note, on-tension, correct
pole -> E pass. G: parity 0, connectives 1, named_skeptic 1, discrepancy_integrity 0, deeper_learning 0.

**audit id 109 (Is dancing a sin? Exod 32 calf-dancing killed vs Exod 15 Miriam praised), 2026-06-21 —
all clean:** Wells/SAB stayed REAL — SAB contra/dancing.html "Is dancing a sin?" lists EXACTLY the
Exod 32 golden-calf dancing vs Exod 15:20 Miriam-with-timbrels tension (also David's dancing); SAB's own
note even concedes "perhaps not the dancing in itself, but that the dance was in honour of the calf" — so the
connective's no-single-verdict framing is fair. NEW pd_work + reconcile self-source confirmed: **Geneva Bible
(1599), marginal note on Exodus 15:20** is a genuine annotation, verbatim-confirmed vs bible-history.com/gnv +
biblegateway GNV: "Signifying their great joy: which custom the Jews observed in certain solemnities, Judg.
11:34 and 11:21, but it ought not to be a cloak to cover our wanton dances." It treats THIS exact tension
(distinguishes joyful praise-dancing from sinful "wanton dances" = act-vs-object harmonization) and is BOTH the
reconcile excerpt AND the deeper_learning pd_work (self-source pattern, like Gill/K&D/Clarke). excerpt_text ==
source_note_text exactly (no ellipsis). Link gotquestions.org/Christian-dance.html live + on-topic (contrasts
Exod 32 idolatrous revelry w/ Exod 15 worshipful dancing) + allowlisted. Row reconcile_first w/
discrepancy=named_skeptic → discrepancy_integrity ok (surfaced, NOT co_opted). Verdict E pass / G all-0. Geneva
Bible joins Gill/K&D/Clarke as a confirmed PD self-source default for verse-keyed marginal-note harmonizations.

**SANDERS PASS (new verified named-skeptic name) — audit id 116 (How should parents be treated? honor-parents
Decalogue/Proverbs/Eph 6 vs Gospel "hate father and mother" / "let the dead bury their dead"), 2026-06-21 —
all clean:**
- **E. P. Sanders (d. 2022), Jesus and Judaism (Philadelphia: Fortress, 1985), 252-255** = REAL, fairly
  represented. Sanders genuinely argues "let the dead bury their dead" (Mt 8:21-22/Lk 9:59-60) required a
  follower to violate the binding Jewish duty to bury/honor a parent — a rare point where Jesus contravened the
  Mosaic law (corroborated via biblearchaeology.org "Let The Dead Bury Their Own Dead," which cites "Sanders
  1985: 252-255" for exactly this objection). Work-file page cite (252-255) + death date (2022) both correct.
  Connective accurate, on-tension, no overclaim → named_skeptic ok (0). NOTE the discrepancy connective engages
  the "let the dead bury" sub-facet while the reconcile excerpt is on "hate father and mother" — both are
  legitimately within this contradiction's verse stack (the summary names "leave a father unburied"), so the
  different sub-tension is NOT a mismatch. Sanders joins Friedman/Wellhausen/Ehrman(book-specific) as a verified
  named-scholar skeptic (vs the McKinsey/Ingersoll/Paine misattribution defaults).
- **pd_work Adam Clarke, Commentary (1832) on Luke 14:26** = REAL, treats this exact tension and harmonizes
  ("hate" = Hebrew idiom for loving less; Matt 10:37, Gen 29:30-31 Leah-hated/Rachel-loved-more) — verbatim
  excerpt + idiom reading confirmed via studylight/biblehub Clarke Luke 14:26. Clarke is BOTH the reconcile
  excerpt source AND the pd_work (self-source pattern, like Gill/K&D/Geneva). Clarke now confirmed 4x (ids 79,
  63, 96, 116) as a PD default for "hate"=love-less / idiom tensions.
- **link gotquestions.org/hate-father-mother.html** = live, on-topic (Luke 14:26 vs fifth commandment,
  "hate"=preference-not-emotion harmonization), allowlisted. deeper_learning ok (0).
- Row reconcile_first w/ discrepancy=named_skeptic → discrepancy_integrity ok (surfaced, not co_opted). excerpt
  in_source pass (verbatim note opening, no ellipsis). Verdict E pass / G all-0.

**audit id 122 (How should we treat our enemies? Exod 23:4 return-enemy's-ox vs Ps 35:6-8 imprecation),
2026-06-21 — all clean:** Wells/SAB stayed REAL — SAB contra/enemies.html "How should we treat our enemies?"
cites EXACTLY Exod 23:4 (return enemy's stray ox/ass) vs Ps 35:6-8 (let the angel of the LORD persecute them)
AND sets these against Jesus' "love your enemies" (Matt 5:44) — connective ("orders active kindness vs prays
God's angel hound them to ruin, set against love-your-enemies as flatly inconsistent") is exact, not strawmanned.
Verified verbatim against the page. NEW pd_work confirmed: **Jamieson, Fausset & Brown (1871) on Psalm 35** is
real PD defending the imprecations directly — "Their imprecations on impenitent rebels against God need no
vindication; His justice and wrath are for such; His mercy for penitents" (verbatim biblehub jfb Ps 35), i.e.
appeals to God's justice not personal vengeance. JFB now joins Gill/K&D/Clarke/Geneva as a confirmed PD default.
Link gotquestions.org/imprecatory-psalms.html live + on-topic (harmonizes Ps 35 w/ Matt 5:44 via divine-justice
+ spiritual-enemies framework) + allowlisted. Tyndale Open Bible Commentary reconcile excerpt (Ps 35:4)
verbatim-confirmed in embedded note (sentences 2-3, no ellipsis); TYN-specific note didn't surface in search but
broader scholarly consensus corroborates the vindictive-language-but-desire-for-justice reading, not fabricated.
Row reconcile_first w/ discrepancy=named_skeptic → discrepancy_integrity ok (surfaced). Verdict E pass / G all-0.

**CURTIS & MADSEN PASS (first verified text-critical-commentary named_skeptic) — audit id 105 (Who was
Libni's father? Gershon line Ex 6:17/Num 3:18/1 Chr 6:17 vs Merari line 1 Chr 6:29), 2026-06-21 — all clean:**
- **Edward L. Curtis & Albert A. Madsen, A Critical and Exegetical Commentary on the Books of Chronicles
  (ICC, T&T Clark, 1910)** = REAL, the foundational early-20thC CRITICAL commentary on Chronicles, built on
  textual criticism + detailed genealogy (Madsen specialized in the genealogical sections per preface; IA
  criticalexegetic11curtuoft). Connective ("read these Levitical lists as textually disturbed, treating the
  Merari-line Libni as scribal duplication") = FAIR representation of the ICC method on a GENUINE text-critical
  crux: Libni+Shimei (Gershon's sons, 6:17) reappear in the Merari line (6:29 MT Mahli/Libni/Shimei/Uzzah), yet
  1 Chr 23:21 gives Merari's real sons as Mahli+Mushi (Mahli's sons Eleazar+Kish) — so Merari-line Libni IS
  widely read as displaced/duplicated Gershonite material. named_skeptic=ok (0). CAVEAT: could NOT pull exact
  verse-note wording — WebFetch on IA djvu.txt returns only front-matter (truncation); verse-level sites (K&D,
  Pulpit, biblehub) do NOT treat the Libni duplication. Passed on real-critical-work + documented-method +
  passage fit, NOT a quoted note; a strict reviewer may want the page (1 Chr 6 commentary ~pp. 125-145). Like
  Friedman (41)/Wellhausen (63) source-critic-seam passes: text-critical/source-critic commentaries CAN check
  out when the documented method matches the passage, vs McKinsey/Ehrman/Paine specific-objection misfits.
- **pd_work Matthew Henry, Commentary on 1 Chronicles 6** = REAL, treats THIS exact tension (verbatim-confirmed
  blueletterbible/christianity.com mhc): "One of the families of Gershom (that of Libni)... One of the families
  of Merari (that of Mahli)..." distinguishes the two branches, shared name = two men. Henry is BOTH reconcile
  excerpt source AND pd_work (self-source, like Gill/K&D/Clarke/Geneva/JFB). Link honestly omitted (no
  allowlisted page on the Libni two-fathers tension), pd_work alone = ok. Matthew Henry now a confirmed PD
  default for genealogy-name-duplication tensions. Reconcile excerpt trailing ellipsis only drops verse refs
  (6:29-30), sense preserved. Verdict E pass / G all-0.

**DIMATTEI PASS (new verified named-skeptic name; conceding-skeptic) — audit id 154 (How many male Levites
22,000? Num 3:39 total vs 22,300 sum of clan figures Num 3:22/28/34), 2026-06-21 — all clean:**
- **Steven DiMattei, contradictionsinthebible.com #218** = REAL + fairly represented. His site is a verse-by-verse
  contradiction catalog by a PhD biblical scholar; entry "#218. The total number of Levites is 22,300 OR 22,000?
  (Num 3:22, 28, 34 vs Num 3:39)" engages THIS EXACT tension + verse stack. He is a CONCEDING skeptic (id-439
  pattern): WebFetch verbatim-confirmed "a minor textual discrepancy, which I shall nonetheless count as a
  contradiction" + "crept into the manuscript tradition" (proposes a Hebrew 600/300 scribal slip in v.28). The
  connective's "real contradiction, though concedes minor + likely manuscript-tradition not authorial intent" is
  exact, not strawmanned -> named_skeptic ok (0). DiMattei joins Friedman/Wellhausen/Sanders/Ehrman(book-specific)
  as verified named-scholar skeptics; his contradictionsinthebible.com #-entries are a reliable verification index
  for Pentateuch/numerical tensions (like SAB contra_list for Wells).
- **pd_work JFB on Num 3:39 (1871)** = REAL PD, treats this exact 300-gap directly + IS the reconcile self-source
  (Gill/K&D/Clarke/Geneva/Henry pattern); WebFetch biblehub jfb Num 3 verbatim-confirms all three harmonizations
  (firstborn-devoted, round-numbers, Hebrew-letter transcription error). Link honestly omitted (no allowlisted page
  confirmable for this passage), pd_work alone = ok. JFB reconcile excerpt verbatim from embedded note (drops only
  the "twenty and two thousand--The result..." preamble, sense preserved). reconcile_first w/ discrepancy=named_skeptic
  -> discrepancy_integrity ok (surfaced). Verdict E pass / G all-0.

**audit id 132 (Did Moses see God face to face? Exod 33:11/Deut 34:10 vs Exod 33:20-23), 2026-06-21 —
all clean, discrepancy_first:** Wells/SAB stayed REAL — SAB contra/face.html "Did Moses see God face to
face?" cites EXACTLY Exod 33:11/Deut 34:10 (face to face) vs Exod 33:20-23 (no man can see God's face and
live; only back parts) — same-chapter flat-conflict framing in the connective is exact, not strawmanned.
Row lean = discrepancy_first w/ discrepancy=named_skeptic (Wells), reconcile capped to single strongest K&D
excerpt → parity 1>=1 ok, discrepancy_integrity ok (named_skeptic surfaced, NOT co_opted). pd_work =
**Keil & Delitzsch on Exod 33:7-23 (1861-75)** — real PD, IS the reconcile self-source (pattern Gill/Clarke/
Geneva/Henry, K&D ids 28/106), explicitly raises the 33:11/33:20 objection (quoting Calvin) and resolves via
manifestation-form-vs-essential-glory distinction. K&D excerpt verbatim-confirmed in embedded note (Calvin
quotation, no ellipsis): "If any one objects to this... He never appeared in His own essential glory, but only
in such a mode as human weakness could bear." Link gotquestions.org/God-Moses-face-to-face.html live + exact
title match + on-topic (idiomatic face-to-face vs full-glory face) + allowlisted. Verdict E pass / G all-0.

**audit id 139 (What if you sin through ignorance? Lev 4:3-4 bullock vs Lev 5:15-16 ram vs Num 15:27-28 female
goat), 2026-06-21 — all clean, discrepancy_first:** Wells/SAB stayed REAL — SAB lev/contra_list.html entry #5
"What should you do if you sin through ignorance?" [5:17] matches the work-file question verbatim (also #3 "What
must a congregation do if it sins through ignorance?" [4:13]); SAB lists the differing-animal-for-inadvertent-sin
tension. pd_work = **Keil & Delitzsch on Leviticus 4 (1861-75)** treats this passage DIRECTLY, grading animals by
offerer's rank — verbatim-confirmed (biblehub/studylight kad Lev 4): ritual "differed, with regard to the animals
sacrificed... according to the position which the person presenting them happened to occupy in the kingdom of God"
(4 classes: anointed priest / whole congregation / prince / common people). K&D now a confirmed PD default for
Levitical-ritual-gradation tensions too (Levitical 4/Exod 33 ids 139/132; joins Gill/Clarke/Geneva/JFB/Henry).
Link gotquestions.org/sin-offering.html live + on-topic (treats Lev 4 + Num 15 together; animal varies by rank:
bull=high priest, male goat=king/prince, female goat/lamb=common) + allowlisted. Tyndale Open Bible Commentary
reconcile excerpt (Lev 4:3 note) verbatim-confirmed in embedded note; 3-fragment ellipsis join preserves sense
(skips blood/burning/eating procedural detail; keeps the rank-gradation harmonization). Row discrepancy_first w/
discrepancy=named_skeptic → discrepancy_integrity ok (surfaced, NOT co_opted); reconcile capped to single strongest
excerpt vs named_skeptic, parity 1>=1. Verdict E pass / G all-0.

**RYREN CADORA / ATHEIST PAPERS PASS (new verified blog-skeptic name) — audit id 138 (Does God desire
animal sacrifices? Lev 17:11 + Num 15/29 blood-atonement vs Heb 10:4,11 powerless), 2026-06-21 — all clean,
discrepancy_first:**
- **Ryren Cadora, "Bible Contradictions #43: Does sacrificing an animal take away sins?", The Atheist Papers
  (2014)** = REAL named_skeptic, fairly represented. Live at atheistpapers.com/2014/07/17/bible-contradictions-43-
  does-sacrificing-an-animal-take-away-sins/. The post genuinely cites Lev 4/5/17:11 + Num 15:27-28/29:5 (blood
  takes away sins) AGAINST Heb 10:4,11 ("it is impossible" for animal sacrifice to affect the soul) — EXACT verse-
  set + objection of the work file ("both cannot be true"). Atheist-blog-series skeptics CAN check out (like
  Wells/SAB); verify the specific post exists + presses this pairing. named_skeptic ok (0).
- **pd_work Matthew Henry on Lev 17:10-11** = REAL, treats this exact tension via type-vs-fulfilment — verbatim
  confirmed vs biblegateway MHC (biblehub MHC returns a MODERNIZED PARAPHRASE, not the verbatim 1706-14 text;
  prefer biblegateway/blueletterbible for exact MHC wording). Henry is BOTH the reconcile excerpt source AND the
  pd_work (self-source, like Gill/K&D/Clarke/Geneva/JFB). Note honestly discloses Haley's coverage unconfirmable →
  anchored to a row-surfaced harmonizer keyed to the passage = sound substitution.
- **link gotquestions.org/animal-sacrifices.html** = live, on-topic ("Why did God require animal sacrifices in the
  OT?"; temporary-covering/foreshadowing-of-Christ harmonization), allowlisted. Cites Heb 9:22 not 10:4 — the note
  honestly discloses this; not a flag. deeper_learning ok (0).
- discrepancy_first lean: discrepancy pole = named_skeptic (Cadora), reconcile capped at 1 strongest excerpt; parity
  ok, discrepancy_integrity ok (surfaced, not co_opted). Reconcile excerpt ellipsis joins two non-adjacent MHC
  sentences (fig-type clause + "figuratively now really and effectually" clause), sense preserved. Verdict E pass /
  G all-0.

**audit id 172 (How should the Moabites be treated? Deut 2:9 peace vs Judges 3 slay 10,000 + Jer 48 cut off),
2026-06-21 — all clean, discrepancy_first:** Wells/SAB stayed REAL — SAB contra/moab2.html "How should the
Moabites be treated?" cites EXACTLY Deut 2:9 ("Distress not the Moabites") vs Jdg 3:28-30 (slay 10,000, subdue
Moab); SAB Moab framing also engages the destroy-Moab prophetic texts, so the connective's Jer 48 cut-off
addition is fair, not strawmanned. NEW pd_work confirmed: **John Gill, Exposition on Deuteronomy 2:9** treats
THIS exact tension directly with the TEMPORARY-prohibition harmonization — "at least not as yet, the measure of
their sins not being fully up, and the time of their punishment not come; otherwise in David's time they were
subdued, and became tributaries to him" (verbatim-confirmed biblestudytools + christianity.com Gill Deut 2). Gill
now confirmed 6x (ids 9, 12, 31, 41, 45 + 172) as a rock-solid PD default; here he treats a peace-vs-later-judgment
tension via "their sins not yet full / subdued under David." Link honestly omitted (no allowlisted page confirmable
for this pairing), pd_work alone = ok. Matthew Henry reconcile excerpt (Jdg 3:12, time-bound dispensation: God
shielded Moab when Israel stronger, "yet now he suffered the Moabites to distress Israel") verbatim-confirmed in
embedded note; trailing ellipsis truncates before "Thy judgments, O God! are a great deep", sense preserved.
Row discrepancy_first w/ discrepancy=named_skeptic (Wells), reconcile capped to single strongest excerpt, parity
1>=1; discrepancy_integrity ok (surfaced, NOT co_opted). SOFT SPOT (didn't sink pass): Gill/Henry harmonization
engages the Judges-war facet (David's later subjugation) more than Jer 48's national-destruction prophecy, but the
temporal-bounding principle reaches both directions. Verdict E pass / G all-0.

**audit id 147 (How should homosexuals be treated? Lev 20:13 death vs 1 Kgs 15:11-12 Asa removes/exiles
sodomites), 2026-06-21 — all clean, reconcile_first:** Wells/SAB stayed REAL — SAB contra/homosexuals.html
"How should homosexuals be treated?" cites EXACTLY Lev 20:13 under "They should be killed" vs 1 Kgs 15:11-12
under "They should be exiled" (Asa "took away the sodomites out of the land"); verbatim framing match to the
discrepancy connective's flat penalty-conflict (killed vs exiled). NEW pd_work topic for Clarke: **Adam Clarke,
Commentary (1832) on 1 Kings 15:12** glosses "The sodomites - הקדשים hakkedeshim; literally, the holy or
consecrated ones" — the qedeshim/CULT-PROSTITUTE recategorization that makes Asa's removal a DIFFERENT offense
from the act Lev 20:13 makes capital (verified via studylight acc/1-kings-15.html search; verse-page 403'd but
search returned exact wording verbatim). Clarke is BOTH the reconcile excerpt AND the deeper_learning pd_work
(self-source, like Gill/K&D/Geneva/JFB/Henry); used in place of Haley (note discloses Haley's coverage of this
exact pair unconfirmable). Clarke now confirmed many times (ids 79, 63, 96, 116, 147). Link
gotquestions.org/King-Asa.html VERIFIED live + on-topic + allowlisted ("Who was King Asa" — reads removal of
"male shrine prostitutes" tied to Asherah idolatry, the cult-prostitute reading that resolves the tension).
Row reconcile_first w/ discrepancy=named_skeptic → discrepancy_integrity ok (surfaced, not co_opted). Verdict
E pass / G all-0. LESSON: a row whose reconcile MOVE is a lexical/word-meaning recategorization (qedeshim =
consecrated cult figures, not the homosexual act) is correctly labeled reconcile, NOT should_flip — it
genuinely denies the two texts address the same offense rather than conceding the penalty conflict.

**DIMATTEI PASS (new verified web source-critic name) — audit id 161 (Where did Aaron die? Mount Hor (Num
20/33) vs Moserah (Deut 10:6)), 2026-06-21 — all clean, discrepancy_first:**
- **Steven DiMattei, Contradictions in the Bible (contradictionsinthebible.com), "Where/When Did Aaron Die?"
  (2013)** = REAL named_skeptic, fairly represented. Dr. Steven DiMattei (real PhD biblical scholar) runs the
  verse-by-verse site; entry #339 "Where did Aaron die: Hor OR Moserah? (Num 33:38 vs Deut 10:6)" treats THIS
  EXACT pairing, reading Hor vs Moserah as the Priestly vs Deuteronomic source-traditions stitched together —
  precisely the connective's "two genuinely contradictory death-traditions from rival priestly sources, only
  later stitched together." Source-critic-on-Pentateuch-seam attribution that CHECKS OUT (like Friedman id 41,
  Wellhausen id 63, Hupfeld id 106): when a documented source critic's actual method = naming a J/E/P/D seam,
  and the site demonstrably presses the row's exact verse-pair, named_skeptic = ok (0). DiMattei joins the
  verified web-skeptic roster alongside Wells/SAB and Ryren Cadora/Atheist Papers — verify the specific entry
  exists + presses this pairing (his site is indexed by numbered entries, searchable).
- **pd_work John Gill, Exposition on Deut 10:6 (1746-63)** = REAL, IS the reconcile self-source, treats this
  directly — verbatim-confirmed vs biblehub Gill Deut 10: cites Aben Ezra that "Mosera is the name of the desert
  of Mount Hor" + "it is certain that Aaron died on Mount Hor, Num 20:23, or there died and was buried when in
  the desert of Mosera." Self-source pattern (Gill/K&D/Clarke/Geneva/Henry). Gill now confirmed 6x (ids 9, 12,
  31, 41, 45, 161).
- **link defendinginerrancy.com/bible-solutions/Deuteronomy_10.6.php** = VERIFIED live, on-allowlist, EXACT
  title match ("Deuteronomy 10:6—Did Aaron die at Moserah, or did he die at the top of Mount Hor?"), on-topic
  (Moserah = broader district, Mount Hor = specific site within it; Sinai-within-Horeb analogy). deeper_learning
  ok (0).
- discrepancy_first lean: discrepancy pole = named_skeptic (DiMattei), reconcile capped at 1 strongest excerpt;
  parity ok (1>=1), discrepancy_integrity ok (surfaced, not co_opted). Reconcile excerpt ellipsis join drops the
  middle station-distance argument (Moseroth=27th vs Mosera=34th station) but PRESERVES sense — the harmonizing
  claim (Mosera = desert of Mount Hor → one death-site, two names) sits in both surviving clauses. in_source pass.
  Verdict E pass / G all-0.

**audit id 158 RE-RUN (Who argued in favor of occupying Canaan? Num 13:30 Caleb alone vs 14:6-9 Joshua+Caleb),
2026-06-21 — all clean, attribution CHANGED from prior pass:** the 2026-06-14 work file cited Wells/SAB (confirmed
real then); the re-rolled work file now names **Steven DiMattei, Contradictions in the Bible #238
(contradictionsinthebible.com)** — VERIFIED REAL + fairly represented. Page at
contradictionsinthebible.com/caleb-or-caleb-and-joshua/, numbered #238 (dated March 10, 2014), genuinely argues
the J/P doublet: Yahwist (Judah-centered) has Caleb alone (Num 13:30, 14:24); the Priestly writer adds Joshua of
Ephraim for a "unified Israel" (14:6-9), citing Friedman, Bible with Sources Revealed pp. 262-265. Connective's
"seam, not a sequence" framing is exact → named_skeptic ok (0). MINOR: work file dates it "2013" vs page 2014,
off by one, did not sink the pass. LESSON: when a transform re-roll SWAPS the skeptic (Wells -> DiMattei), re-verify
from scratch; do not trust the prior pass's finding (reconfirms id 63 re-run). pd_work = **K&D on Numbers 13:30**
— real PD self-source (IS the reconcile excerpt), treats this exact pair, verbatim-confirmed biblehub kad Num 13;
link honestly omitted (GotQuestions Joshua-and-Caleb.html quotes both verses but never addresses why Caleb appears
alone). Verdict E pass / G all-0.

**DIMATTEI PASS (re-audit, new verified entry #311) — audit id 125 (What animals must you sacrifice each day?
Exo 29:36-39 bullock+two-lambs vs Num 28:1-4 two-lambs-only tamid), 2026-06-23 — all clean, discrepancy_first:**
- **Steven DiMattei, Contradictions in the Bible (contradictionsinthebible.com)** = REAL named_skeptic, fairly
  represented. Entry **#311 "Was the regular burnt-offering (tamid) performed at Sinai OR not? (Num 28:6 vs Ex
  24:3-7, 32:5-6; Lev 8-9)"** presses THIS exact tension. Live page (WebFetch) confirms the connective near
  verbatim: "Numbers 28:6 claims this is 'the continual burnt offering that was performed at Mount Sinai' ...
  there is no record of this in the Torah" + "the book of Leviticus as a whole ... do not mention the tamid" +
  "Some have even suggested that the instructions for the tamid mentioned in **Exodus 29:38-42** were added later
  to buttress the claims made in **Numbers 28**." Connective's Sinai-claim / Lev-silent / Ex29:38-42-Priestly-
  insertion framing is EXACT (even the verse range Ex 29:38-42 + the word "buttress" match). DiMattei joins his
  own verified roster (ids 154, 158, 161). MINOR off-by-one: work file dates it "2014", page is posted Aug 13
  2015 (same off-by-one pattern as id 158); did not sink the pass.
- **pd_work John Gill, Exposition on Exodus 29:36 (1746-63)** = REAL, IS the reconcile self-source, treats this
  directly — verbatim-confirmed (biblestudytools Gill Exo 29:36): "That is, every day of the seven days of
  consecration", limiting the daily bullock to the consecration week so the perpetual order is the two lambs of
  Num 28. Self-source pattern (Gill/K&D/Clarke/Geneva/Henry). Link honestly omitted (url null) — pd_work alone =
  deeper_learning ok. Gill confirmed yet again (now ids 9, 12, 31, 41, 45, 161, 172, 185, 125).
- discrepancy_first lean: discrepancy = named_skeptic (DiMattei), reconcile capped at 1 strongest (consecration-
  rite) excerpt; parity 1>=1, discrepancy_integrity ok (surfaced, not co_opted). Reconcile excerpt ellipsis
  truncates the rest of Gill's sentence + typological remainder but PRESERVES sense. in_source pass. Verdict E
  pass / G all-0.

**KRÜGER PASS (first verified Qoheleth-commentator named_skeptic) — audit id 159 (Should we follow our own
hearts? Eccl 11:9 walk-in-ways-of-heart vs Num 15:39 / Prov 28:26), 2026-06-21 — all clean, reconcile_first:**
- **Thomas Krüger, Qoheleth: A Commentary (Hermeneia, Fortress Press, 2004), 196** = REAL, fairly represented.
  Krüger genuinely calls Eccl 11:9 a "provocative allusion" to Num 15:39 that inverts/contradicts the older
  command — verified VERBATIM: intertextual.bible/text/numbers-15.39-ecclesiastes-11.9 attributes the exact
  phrase to "Thomas Krüger (2004, 196)" (via Will Kynes's discussion) and says Eccl 11 "inverts" Num 15 / the
  rabbis saw it "blatantly contradicts" Numbers. Work-file page cite (196) + quoted phrase match the source
  word-for-word. Connective ("'provocative allusion'... blatantly inverts and contradicts the older command")
  does NOT overclaim. Qoheleth-commentator-on-intertextual-allusion is the documented method (like Friedman/
  Wellhausen/Hupfeld/Curtis-Madsen source-critic passes, vs McKinsey/Ehrman/Paine specific-objection misfits).
  named_skeptic ok (0). NEW corroboration vector: **intertextual.bible attributes named scholar + page
  directly** — a fast external confirmation channel for OT intertextual-allusion skeptics.
- Row reconcile_first w/ discrepancy=named_skeptic → discrepancy_integrity ok (surfaced, NOT co_opted).
- **pd_work Matthew Henry on Numbers 15:37-41 (1706-14)** = REAL, treats THIS exact phrase directly (verified
  studylight/blueletterbible mhc Num 15): "nothing is more contrary to God's honour... than to walk in the way
  of our heart and in the sight of our eyes; for the imagination of the heart is evil, and so is the lust of
  the eyes" — harmonizes the Numbers command as moral-not-absolute (idolatry-preservative). SOFT
  over-specification: note says Henry reads it "as compatible with Ecclesiastes' qualified... call to rejoice,"
  but Henry's Num 15 note does NOT explicitly cross-ref Eccl 11:9 (same texture as id-24 "ties back to Gen
  4:7"); didn't sink the pass.
- **link defendinginerrancy.com/bible-solutions/Ecclesiastes_11.9.php** = VERIFIED live, on-allowlist, EXACT
  title match ("Ecclesiastes 11:9—Should a young man follow his own way or God's way?"), treats THIS tension
  w/ BOTH the irony reading AND the judgment-qualified reading (matches reconcile connective). dl ok (0).
- JFB reconcile excerpt (Eccl 11:9, "Rejoice--not advice, but warning. So Kg1 22:15, is irony") verbatim-
  confirmed vs biblehub jfb Eccl 11; em-dash conversion + trailing ellipsis truncates cleanly at the semicolon
  (before "; if thou dost rejoice"), sense preserved. on_tension (irony defuses the follow-your-heart license),
  correct reconcile pole. Verdict E pass / G all-0. LESSON: a reconcile MOVE that reads the offending verse as
  IRONY/warning (so it never licenses what Numbers forbids) is correctly reconcile, NOT should_flip — it denies
  the verse commands self-trust rather than conceding the conflict (cf. the qedeshim lexical-recategorization
  reconcile, id 147).

**audit id 192 (Did the city of Ai exist after Joshua destroyed it? Josh 8:28 'heap for ever' vs Neh 7:32
men of Ai among returnees), 2026-06-21 — all clean, discrepancy_first:** Wells/SAB stayed REAL — SAB
contra/ai.html "Did the city of Ai exist after Joshua destroyed it?" cites EXACTLY Josh 8:28 ("made it an
heap for ever") vs Neh 7:32 ("men of Bethel and Ai, 123"), verbatim framing match to work-file. pd_work =
**John Gill, Exposition on Joshua 8:28 (1746-63)** treats THIS exact pair directly — glosses "an heap for
ever" as "for a long time" + grants Ai "appears to have been rebuilt, and to have been inhabited by the Jews,
after their return from their Babylonish captivity, Neh 11:31" (verbatim-confirmed biblehub Gill Josh 8). Gill
is BOTH the reconcile self-source AND the pd_work (self-source pattern; Gill now 7x: ids 9,12,31,41,45,172,192);
note honestly discloses Haley unconfirmable, anchors to row-surfaced harmonizer = sound substitution. Link
defendinginerrancy.com/bible-solutions/Nehemiah_7.32.php VERIFIED live + on-allowlist + EXACT title match
("Nehemiah 7:32—If Ai was destroyed earlier, why is it still inhabited here?") + on-topic (cites both Josh 8:28
and Neh 7:32, resettlement harmonization). Reconcile excerpt verbatim, clean trailing ellipsis truncates before
"even a desolation unto this day", sense preserved. discrepancy_first w/ discrepancy=named_skeptic (Wells),
reconcile capped to single strongest excerpt, parity 1>=1; discrepancy_integrity ok (surfaced, NOT co_opted).
Verdict E pass / G all-0.

**BULTMANN STRAWMAN-BY-INVERSION (first verified Bultmann named_skeptic audit) — audit id 151 (eye for eye,
Lev 24:19-20 vs Matt 5:38-39 turn-the-other-cheek), 2026-06-21 — reconcile_first:**
- **Rudolf Bultmann, Jesus and the Word (1934 Eng.; German Jesus 1926; cf. History of the Synoptic Tradition
  1921), d. 1976** — name NOT corrupted (cf. the "Reuben Bultmann" risk), all metadata correct, and he DID
  genuinely treat THIS retaliation antithesis: it is one of the six "But I say unto you" passages he explicitly
  quotes + analyzes in the "Will of God" chapter (full text verified via media.sabda.org PDF + religion-online.org).
  So NOT not_real. BUT named_skeptic=STRAWMAN (2) + connectives=flag (1): the connective claimed Bultmann pressed
  "a genuine ANNULMENT, NOT a mere reinterpretation" of the Mosaic law. Bultmann's ACTUAL text says the OPPOSITE —
  Jesus "does not set up a better law in opposition to a less good law"; the antitheses are "a peculiar
  INTERPRETATION of the Old Testament which evidently aims to establish its true meaning"; the break is destroying
  the "FORMAL authority of Scripture" (legalism), and "true obedience can exist in FULFILLMENT of the law."
  Scholarly summary corroborates: "the divergence of Jesus from Judaism is in thinking out obedience radically to
  the end, NOT in setting it aside." So the connective inverts his own word ("interpretation" -> "not a
  reinterpretation") and recasts radical-obedience as law-annulment. Same class as Ehrman id-427 / Paine id-11 /
  McKinsey id-107 (real author, real broad engagement, SPECIFIC objection constructed) — but a uniquely CLEAN
  inversion: it uses the skeptic's exact antonym. LESSON: a real form-critic with a "radical" reputation can still
  be strawmanned on annulment-vs-radicalization; read the actual chapter, don't infer the objection from his fame.
- discrepancy_integrity ok (0): reconcile_first row, discrepancy pole IS surfaced as named_skeptic (co_opted/relabel
  are discrepancy_first concepts; same handling as ids 24/79/96/107/147).
- **deeper_learning PASSED (0):** Matthew Henry, Commentary (1706-14) on Lev 24:19-20 = REAL, treats Lev 24 WITH
  Matt 5 directly, verbatim-confirmed (blueletterbible/biblestudytools mhc): "our Saviour has set aside this law
  (Mt 5:38,39), not to restrain magistrates from executing public justice, but to restrain us all from returning
  personal injuries." Link gotquestions.org/eye-for-an-eye.html = live + EXACT title match + on-topic
  (judicial-policy-for-magistrates vs personal-conduct-for-believers two-sphere harmonization) + allowlisted.
- Gill reconcile excerpt (Mt 5:38: Jesus faults "the false gloss of the Scribes and Pharisees," not "the law of
  retaliation as delivered by Moses," which "did not allow of a retaliation... by private persons... but by the
  civil magistrate only") verbatim in embedded note; ellipsis drops the pecuniary-mulcts clause, sense preserved.
  E pass. G: parity 0, connectives 1, named_skeptic 2, discrepancy_integrity 0, deeper_learning 0.

**audit id 200 (Did Balak fight with Israel? Josh 24:9 'warred against Israel' vs Judg 11:25 Jephthah's
expected-no rhetorical Q), 2026-06-21 — all clean, discrepancy_first:** Wells/SAB stayed REAL — SAB Joshua
contra_list.html entry 17 "Did Balak fight with Israel?" is genuine (cited there at Josh 23:9, a versification
variant for the same Balak-warred verse; the tension is identical); connective accurately presses plain reading
(Josh 24:9 "warred" vs Jephthah's expected-no). NEW pd_work + reconcile self-source: **Adam Clarke, Commentary
(1832) on Josh 24:9** treats this exact pair directly — "This circumstance is not related in Numbers 22:1-41,
nor does it appear in that history that the Moabites attacked the Israelites; and probably the warring here
mentioned means no more than his attempts to destroy them by the curses of Balaam, and the wiles of the
Midianitish women" (verbatim-confirmed biblehub Clarke Josh 24; StudyLight 403'd — biblehub is the reliable
Clarke fallback). Clarke is BOTH the reconcile excerpt AND the pd_work (self-source, like Gill/K&D/Henry/Geneva);
link honestly omitted, pd_work alone = ok. Clarke now confirmed many times (ids 79, 63, 96, 116, 147, 200).
Row discrepancy_first w/ discrepancy=named_skeptic (Wells), reconcile capped to single strongest excerpt, parity
1>=1; discrepancy_integrity ok (surfaced, NOT co_opted). Excerpt verbatim (no ellipsis; drops only the verse-lemma
prefix). Verdict E pass / G all-0.

**audit id 180 (Does God prefer castrated men? Deut 23:1 eunuch-exclusion vs Matt 19:12 self-made-eunuchs),
2026-06-21 — all clean, reconcile_first:** Wells/SAB stayed REAL — SAB contra/castrated.html "Does God prefer
castrated men?" cites EXACTLY Deut 23:1 (No side: "wounded in the stones... shall not enter") vs Matt 19:12
(Yes side: "made themselves eunuchs for the kingdom of heaven"), verbatim framing match to the work-file.
pd_work = **Keil & Delitzsch on Deut 23:1 (1861-75)** — real PD self-source (IS the reconcile excerpt), treats
this exact tension directly: eunuch-exclusion "one of the ordinances intended for the period of infancy, and
has lost its significance with the spread of the kingdom of God over all the nations of the earth (Isa 56:4)" —
verbatim-confirmed vs biblehub kad Deut 23 (final sentence of the note, no ellipsis). Self-source pattern
(Gill/K&D/Clarke/Geneva/Henry; K&D ids 28/132/139). Link honestly omitted (url null), pd_work alone = ok. Row
reconcile_first w/ discrepancy=named_skeptic → discrepancy_integrity ok (surfaced, not co_opted); parity 1>=1.
Verdict E pass / G all-0. K&D now confirmed as a PD default for OT-ceremonial-ordinance-superseded tensions too.

**audit id 175 (Did the Israelites see God face to face on Mount Horeb? Deut 5:4 vs Deut 4:12), 2026-06-21 —
Wells real, Haley pd_work FLAG (discrepancy_first):** Wells/SAB stayed REAL — SAB dt/contra_list.html **Entry 10
"Did the Israelites see God face to face on Mount Horeb?" cites Deut 5:4** (against 4:12 "saw no similitude");
work-file question title matches the SAB entry VERBATIM. Direct parallel to verified id 132 (Moses face to face,
contra/face.html) — the Israelites-variant of the same seeing-God tension. Connective ("plainest reading: 4:12
saw no form, 5:4 face to face, same author can't have it both ways") accurate, on-tension, no overclaim →
named_skeptic ok (0). JFB reconcile excerpt (Deut 5:4) verbatim-confirmed vs biblehub jfb Deut 5: "not in a
visible and corporeal form, of which there was no trace (Deu 4:12, Deu 4:15), but freely, familiarly..." —
reads face-to-face as directness-of-speech not visual perception, cites 4:12/4:15, exact-tension harmonization,
correct pole, E pass. discrepancy_first: discrepancy pole = named_skeptic (Wells), reconcile capped to single
JFB excerpt, parity 1>=1, discrepancy_integrity ok (surfaced, not co_opted). **deeper_learning FLAG (1):** link
gotquestions.org/seen-God.html VERIFIED live + allowlisted + on-topic ("Has anyone ever seen God?"; explicitly
distinguishes face-to-face communion from seeing God's form/glory, engages Exod 33:20) — link is solid; flag is
SOLELY on Haley 1874 pd_work, whose specific seeing-God entry was UNCONFIRMABLE (IA examinationof00hale djvu
returns front-matter only, Google Books id vAAVAAAAYAAJ snippet view blocked, Michigan quod.lib TOC HTTP 403).
It IS in-scope — Haley's Doctrinal Discrepancies "Concerning God" section (Part II, begins p. 55) is exactly
where a seeing-God/face-to-face harmonization sits — but per the standing default-when-unsure rule for
unverifiable verse-level Haley coverage (cf. ids 10/15/298), flag not pass. Verdict E pass / G 0,0,0,0,1.

**ALBRIGHT PASS (first verified Albright named_skeptic; town-list-vs-boundary-list source critic) — audit id 197
(To whom were Eshtaol and Zoreah given? Josh 15:20,33 Judah vs Josh 19:40-41 Dan), 2026-06-21 — all clean,
discrepancy_first:**
- **W. F. Albright (d. 1971), "The Administrative Divisions of Israel and Judah," Journal of the Palestine
  Oriental Society 5 (1925): 17-54** = REAL + fairly represented. The seminal study in the Alt-Albright lineage
  that reads the Joshua town-lists (15:21-62 etc.) as administrative-district registers DISTINCT in date/origin
  from the tribal-boundary framework — so a town like Eshtaol/Zorah can stand in BOTH the Judah town-list and the
  Dan list because the two documents never represented one coherent distribution. Connective's "Judah town-list
  is a separate administrative document of a different date... lists never represented one coherent distribution"
  is an accurate read of his documented method (corroborated: town lists widely dated to a monarchy-era district
  register later than Solomon, following Alt; boundary list reflects a different period). Source-critic-on-Joshua-
  seam attribution that CHECKS OUT — same class as Friedman id 41, Wellhausen id 63, Hupfeld id 106, Curtis &
  Madsen id 105 (documented method matches the passage), vs the McKinsey/Ehrman/Paine specific-objection misfits.
  named_skeptic ok (0). Albright joins the verified named-scholar skeptic roster.
- **pd_work Adam Clarke, Commentary (1832) on Josh 15:33 / 19:41** = REAL, treats this exact double-assignment —
  "These places though first given to Judah, afterwards fell to the lot of Dan, Jos 19:41" (+ Samson buried there,
  Jdg 16:31). Verbatim-confirmed via WebSearch (StudyLight/sacred-texts 403'd, the standing Clarke-page block;
  biblehub had no Clarke section here — search-snippet was the working fallback). Clarke is BOTH the reconcile
  self-source AND the pd_work (self-source pattern; Clarke now many times: ids 79,63,96,116,147,200,197). Link
  honestly omitted (no allowlisted page on the specific Eshtaol/Zorah Judah-vs-Dan overlap), pd_work alone = ok.
- discrepancy_first lean: discrepancy pole = named_skeptic (Albright), reconcile capped to single strongest Clarke
  excerpt, parity 1>=1; discrepancy_integrity ok (surfaced, NOT co_opted). Excerpt verbatim (contiguous substring,
  no ellipsis). Summary verse refs verified (KJV Josh 15:20 "inheritance of Judah", 15:33 "Eshtaol, and Zoreah").
  Verdict E pass / G all-0. NOTE this is the SAME passage class as the Levitical-cities conjecture memory (Josh 21/
  1 Chr 6 Dan-lacuna) — but here the double-assignment is in the SAME book four chapters apart, a genuine list-vs-
  list tension Albright presses, not a conjectural emendation.

**audit id 205 (Can God stop iron chariots? Judges 1:19 iron-chariot limit vs Judges 4:13-16 Sisera routed),
2026-06-21 — all clean, discrepancy_first:** Wells/SAB stayed REAL — SAB contra/iron.html "Can God stop iron
chariots?" pits EXACTLY Judges 1:19 (could not drive out valley, chariots of iron) vs Judges 4:13-16 (Lord
routed Sisera + 900 iron chariots) — verbatim framing match to work-file question. Gill reconcile excerpt
(Judges 1:19, "but this was no reason why they could not drive them out, if God was with them... but is the
reason why they were afraid to fight with them") verbatim-confirmed vs biblehub Gill Judges 1 — on-tension
(iron chariots = Judah's fear, not divine limit), correct reconcile pole. pd_work = **Matthew Henry on
Judges 1:9-20 (1706-14)** real PD, treats this exact tension — BOTH quoted phrases verbatim-confirmed
(biblegateway/wikisource/blueletterbible MHC): "before whom these iron chariots would be but as stubble to
the fire" + "suffered their fears to prevail against their faith." NOTE biblehub MHC returned an INCOMPLETE/
modernized rendering MISSING "stubble to the fire" — prefer biblegateway/wikisource for verbatim MHC (same
lesson as id 138). Link carm.org/bible-difficulties/is-the-lord-omnipotent-or-not VERIFIED live + on-topic
(title "Is the Lord God omnipotent or not?"; treats Judges 1:19 directly — "Judah's failure does not mean God
could not, God works through human agents") + allowlisted. Row discrepancy_first w/ discrepancy=named_skeptic
(Wells), reconcile capped to single strongest excerpt, parity 1>=1; discrepancy_integrity ok (surfaced, NOT
co_opted). Verdict E pass / G all-0.

**McKinsey FLAGSHIP PASS (first verified McKinsey named_skeptic on a mainstream numeric-census topic) — audit
id 328 (How many of Bethlehem and Netophah's offspring returned? Ezra 2:21-22 separate 123+56=179 vs Neh 7:26
merged 188), 2026-07-01 — all clean, discrepancy_first:**
- **C. Dennis McKinsey, The Encyclopedia of Biblical Errancy (Prometheus Books, 1995)** = REAL + this time
  NEAR-VERBATIM confirmed. tektonics.org/af/eznehnumb.php directly quotes him: "we have a listing of the
  subclans that returned from the Captivity... In the KJV, out of approximately thirty-five subclans listed
  over half of the numbers are in disagreement" — matches the connective's "more than half of roughly
  thirty-five matched clan totals disagree" almost word for word. Bethlehem/Netophah (123+56=179 vs 188,
  verified via biblehub Ezra 2:21-22 / Neh 7:26) is objectively one of those mismatched subclan pairs, so
  tying it to McKinsey's documented general census-discrepancy critique is a fair instantiation, NOT a
  strawman/misattachment — even though tektonics' own rebuttal happens to name other examples (Seenah, Azgad,
  Zattu, Bethel-and-Ai, Hashum, Arah, Adin) rather than this one. CONTRASTS the obscure-OT McKinsey not_real
  defaults (ids 221/246/260/343/362/24/96) — this is the flagship census-discrepancy chapter itself, verified
  by a directly quoted excerpt, not an inferred "sounds mainstream" guess. named_skeptic ok (0).
- **pd_work John Haley, Examination of the Alleged Discrepancies (1874)** = ok (0) on an HONEST-DISCLOSURE
  basis (cf. id 107/175 pattern): the note discloses Haley names the Arah variant (Ezra 2:5 vs Neh 7:10,
  confirmed 775 vs 652 via biblehub) explicitly, then extends "the other cases, some twenty in number... from
  a comparison of Ezra ii. 6-60, with Neh. vii. 11-67" as "explained in the same manner" (copyists' blunders)
  — coverage is blanket, not name-specific to Bethlehem/Netophah. Verse-range check corroborates: Ezra 2:21-22
  and Neh 7:26 both structurally fall inside those cited ranges. Exact IA djvu text unconfirmable (front-matter
  only, same recurring Haley-fetch limitation as ids 175/298), but the specific, internally-consistent verse-
  range citation is a strong authenticity signal → pass, not flag.
- **link carm.org/bible-difficulties/why-are-the-statistics-in-ezra-2-and-nehemiah-7-different/** = VERIFIED
  live, on-allowlist, on-topic (confirmed via WebFetch: "Ezra 2 and Nehemiah 7 are listings of numbered people
  from different families... not identical," "Of 39 entries (verses), 17 do not match").
- discrepancy_first lean: discrepancy=named_skeptic (McKinsey) counts 1, reconcile capped to single JFB
  excerpt counts 1 → parity 1>=1 ok. discrepancy_integrity ok (surfaced, NOT co_opted).
- JFB reconcile excerpt (Neh 7:5, "the discrepancy is sufficiently accounted for from the different
  circumstances... registers were taken... Babylon... Judea... lapse of years... different names") verbatim
  in embedded note (no ellipsis); explicitly labels the Ezra/Neh registry variance "the discrepancy" →
  on_tension, correct reconcile pole. Verdict E pass / G all-0.

**EHRMAN PASS on his own flagship topic — audit id 389 (How many generations, Babylonian captivity to
Jesus? Matt 1:17 stated 14 vs Matt 1:12-16's 13-name third division), 2026-07-02 — all clean,
discrepancy_first:**
- **Bart D. Ehrman, Jesus, Interrupted (HarperOne, 2009)** = REAL + STRONGLY confirmed, this is one of his
  signature genealogy examples (contrast the SAME-BOOK not_real/strawman misattachments at ids 119 Gal 3:19
  and 427 unforgivable-sin — verify WORK+TOPIC, not just title). Archive.org full-text of Jesus, Interrupted
  verbatim-confirms: "the problem is that the fourteen-fourteen-fourteen schema doesn't actually work... in
  the third set of fourteen there are in fact only thirteen generations." His blog (ehrmanblog.org, member
  comment Nov 2020 + "A Numerical Puzzle in Matthew's Genealogy") states outright **"It looks like a pure
  slip"** — exact match to the connective "treats the shortfall as a genuine slip in Matthew's own
  arithmetic, not a deliberate literary pattern." named_skeptic ok (0).
- **pd_work John Haley, Examination of the Alleged Discrepancies (1874), pp. 404-405** = ok (0), UNUSUALLY
  well corroborated via archive.org search-inside (ia800706.us.archive.org/fulltext/inside.php?item_id=
  examinationof00hale&doc=examinationof00hale&path=/16/items/examinationof00hale&q=<term>; server/dir pulled
  from archive.org/metadata/examinationof00hale) — bypasses the usual djvu.txt front-matter-only truncation.
  Confirmed on p.404-405: "...nias to Christ, inclusive in each case. So Alford, Robinson," (inclusive-
  boundary reading) + Gardiner also matches p.405 + "Dr. Mill shows that it was a common practice among the
  Jews to distribute their genealogies into divisions according to some favorite or mystical number" (p.405,
  verbatim) + Ebrard's alternative division ("the second begin with Solomon and end with Jechonias, the third
  begin with Salathiel," p.405) + the Jehoiakim/Jeconiah distinction ("Jechonias in Matt. i. 11 denotes the
  former, in vs. 12 the latter, individual," p.405). Every named authority in the work-file note (Alford,
  Robinson, Gardiner, Ebrard, Dr. Mill, Jehoiakim/Jehoiachin) checks out verbatim at the SAME two pages —
  a rare full match, not just topic-fit. Only "forty-two generations" as an exact phrase didn't hit (0
  matches), but the concept (14x3) is the page's subject; not a red flag.
- **link gotquestions.org/14-generations.html** = live, EXACT title match ("Is there an error in the counting
  of the 14 generations in Matthew chapter 1?"), on-topic (Jehoiakim omission + literary-structure framing).
  deeper_learning ok (0).
- discrepancy_first lean: discrepancy=named_skeptic (Ehrman) counts 1, reconcile capped to single JFB excerpt
  counts 1 -> parity 1>=1 ok. discrepancy_integrity ok (surfaced, NOT co_opted). JFB reconcile excerpt (Mt
  1:17, "last division...only thirteen distinct names"... boundary moved to end 2nd division at Josiah, begin
  3rd at Jeconiah) verbatim in embedded note (only -- to — conversion), on-tension, correct pole. Verdict E
  pass / G all-0.
- **NEW TECHNIQUE note:** the archive.org search-inside endpoint can be queried per-term (not just once) to
  triangulate a cluster of named authorities onto the same page pair — much stronger corroboration than a
  single snippet, and worth the extra round-trips when a deeper_learning note lists 4+ named scholars.
