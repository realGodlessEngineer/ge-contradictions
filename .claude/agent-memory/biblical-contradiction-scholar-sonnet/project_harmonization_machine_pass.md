---
name: project_harmonization_machine_pass
description: T5/T6 machine-excerpt TRANSFORM leg (data/harmonization/curation/machine/<id>.json) — schema drift vs TRANSFORM_CONTRACT.md, Haley-verification-via-curl+grep applies here too (incl. WebSearch-only false negatives, Grep -B/-C line-number pitfall, roman-numeral citation style, partial/adjacent-coverage judgment calls, bare-phrase-vs-proper-noun grep retries), SAB precedent for thin genealogical/theological entries, data/json's questionUrl field for fast SAB-slug lookup, carm.org/universalism link source, mega-entry (huge multi-verse thematic gather file) selection strategy, Ehrman named-skeptic precedent for afterlife/hell AND Matthew-genealogy-generation-count contradictions, Strauss named-skeptic precedent for the genealogy-vs-virgin-birth family (id 390)
metadata:
  type: project
---

Companion to [[project_harmonization_dossier_t9]] / [[project_harmonization_dossier_t10]], but
for the **earlier** leg: producing `data/harmonization/curation/machine/<id>.json` straight from
`data/harmonization/gather/by_id/<id>.json`, per `data/harmonization/TRANSFORM_CONTRACT.md`
(worked id 313, 2026-07-02).

## Schema drift: most of the 348 existing machine/*.json files do NOT match the current contract
`TRANSFORM_CONTRACT.md`'s own worked example (and `TRANSFORM_SPEC.md` lines ~50-53, which the
contract explicitly defers to on conflict) say excerpt objects carry **only** `pole`,
`source_code`, `verse_ref`, `excerpt_text`, `full_note_ref`, `on_tension_rationale`,
`verify_state` — explicitly "do NOT copy author / work / year / attribution / license onto an
excerpt" and "do not repeat contradiction_id per excerpt." But sampling ~5 real files across the
corpus (ids 87, 171, 298, 459, 470 — both old-order and recently-modified-by-mtime) shows **every
one** adds `contradiction_id`, `author`, `work`, `year`, `attribution`, `license_code` to each
excerpt (the current contract's own worked example omits these). **Decision made for id 313:
dropped `author`/`work`/`year`/`attribution`/`license_code` from excerpts and the repeated
`contradiction_id`, matching the compact contract literally** — confirmed correct: id 326 (a
file from the Ezra/Nehemiah cluster memory below) already uses this same minimal excerpt shape,
so the compact shape is in fact the live/current convention, not a stale example; the older
verbose-excerpt files (87, 171, 298, 459, 470) are earlier-draft drift, not the target to copy.
`relabel_flag`/`relabel_reason` on the **reconcile** sub-object, however, IS the universal
corpus convention even though the contract's abbreviated example only shows it on
`discrepancy` — every sampled file (87, 171, 298, 326, 459, 470) sets it `false`/`null` on
both poles, so match that (added it to reconcile on 313 after first omitting it). Confirmed the
resulting 313.json parses and bakes cleanly: `DRY_RUN=1 IDS=313
node .scripts/buildHarmonizationTables.js` → exactly the two expected pre-T9/T10 violations
(`note_present`, `parity_count` — see below), `verifyExcerpts.py` 646/646 PASS including the
new excerpt. **Running the dry-run bake is a cheap, worthwhile sanity check on every future
machine-pass file** — it confirms the JSON shape round-trips through the real baker/validator,
not just that it matches a doc's prose description.

## Haley-verification-via-curl+grep applies to the machine leg too, not just T10
The [[project_harmonization_dossier_t10]] workflow (WebSearch/WebFetch to find the PD text,
then `curl` the raw `archive.org` `_djvu.txt` or Gutenberg `.htm` into scratch and `Grep`
locally — WebFetch's small-model summarizer unreliably "finds" or fails to find text inside
large PD works) is equally the right tool for the machine pass's **required**
`deeper_learning.defense.pd_work` field, which defaults to John Haley's *An Examination of the
Alleged Discrepancies of the Bible* (1874, archive.org id `examinationofall00hale`,
`_djvu.txt` at `https://ia601508.us.archive.org/10/items/examinationofall00hale/examinationofall00hale_djvu.txt`).
For id 313 ("sons of Heman," 1 Chr 25:4 vs 2 Chr 29:14) a full-text `Grep` for `Heman` inside
the curled djvu.txt came back **zero hits** — confirms Haley doesn't treat this passage at all
(consistent with the T10 memory's observation that dry genealogical/numeral minutiae are
under-served by the classic PD skeptic/harmonizer canon). Fell back correctly to the contract's
explicit alternative: "a harmonizing commentator already surfaced on the row, keyed to the
passage" — here Matthew Henry's own note on 2 Chronicles 29:12, which was already the row's
reconcile-pole excerpt author and treats this exact verse pair directly.

## Steve Wells / Skeptic's Annotated Bible is the default 439-model skeptic for obscure
## genealogical/name-list "contradictions"
For granular genealogy-cluster entries (bare name-list mismatches with no real theological
stakes — e.g. id 313's "sons of Heman," and by the pattern seen in ids 87/171/298/459/470
already in the corpus), no 19th-century PD polemicist (Paine, Ingersoll, Burr, Foote & Ball,
Remsburg) engages the specific pairing — these authors gravitate to theologically/morally
charged tensions, not bare genealogical rosters. **Steve Wells's Skeptic's Annotated Bible**
(skepticsannotatedbible.com, launched 1999; print edition 2013) is the real, verifiable,
directly-on-point source for this whole class: confirmed via direct `WebFetch` of
`skepticsannotatedbible.com/contra/<slug>.html` that the exact verse pairing is catalogued
there (id 313's page is `contra/sons_of_heman.html`, filed under "Fathers, Sons, and
Genealogies"). This is not a fallback-of-last-resort — it's the established, already-used
precedent across the corpus for this contradiction sub-type, and this repo's own scrapers
(`scrapeContra.js`) source from SAB directly, so these `contradiction_id` rows plausibly
originated from that exact SAB page. Attribution format used consistently: `name: "Steve
Wells"`, `work: "Skeptic's Annotated Bible"`, `year: "1999"`, `attribution: "Steve Wells,
Skeptic's Annotated Bible (1999), contra/<slug>.html"`.

## Parity-cap mechanics worked concretely (id 313)
`discrepancy_first` row, discrepancy pole = `named_skeptic` only (0 verbatim excerpts + 1 for
the connective = count 1) → reconcile pole capped to exactly **1** excerpt (the single
strongest — here Matthew Henry's note on 2 Chr 29:12, which explains the Levites named per
family in the cleansing account were zealous volunteers picked for the task, not an exhaustive
sons-roster) even though 2-3 other notes existed that were merely descriptive/off-tension and
were correctly excluded rather than padded in. Same mechanics confirmed again on id 325
(Ezra/Nehemiah Bigvai cluster; see [[project_harmonization_transform_ezra_nehemiah_cluster]]).

## Steve Wells/SAB default extends beyond genealogy to thin theological/pastoral tensions (id 364)
"If God likes you, will everyone else like you too?" (Prov 16:7 "even his enemies to be at
peace with him" vs 2 Tim 3:12 "all that will live godly ... shall suffer persecution") —
`WebFetch` of `skepticsannotatedbible.com/contra/no_enemies.html` confirmed the DB question text
is a **verbatim SAB page title/framing**, so Steve Wells is the correct 439-model named skeptic
here too, even though this is a theological aphorism-vs-doctrine pairing, not a genealogy list.
The reconcile pole's single verbatim excerpt was tiny and exact: JFB's entire note on Prov 16:7
is just `"Persecutions, of course, excepted."` (JFB/20/16/7) — a 5-word gloss that is itself the
full on-tension content, no trimming needed. Haley's PD text (`examinationofall00hale_djvu.txt`)
was curl+grepped for `"enemies to be at peace"`, `"his enemies"`, `"suffer persecution"`, `"2
Tim. iii. 12"` — zero hits on all four, confirming (per the `project_harmonization_transform_ezra_nehemiah_cluster`
caution) a real absence, not a WebSearch-only false negative. Fell back correctly to the
contract's named alternative: JFB itself (already the reconcile excerpt's author) as `pd_work`,
since its "Persecutions, of course, excepted" gloss treats this exact passage. Found a **new**
allowlisted link source for this pairing: `defendinginerrancy.com/bible-solutions/2_Timothy_3.12.php`
("2 Timothy 3:12—Are all who live godly lives persecuted, or only some?"), which explicitly
quotes Prov 16:7 against 2 Tim 3:12 and argues neither is a universal absolute — worth checking
defendinginerrancy.com's `bible-solutions/<Book>_<ch>.<vs>.php` URL pattern directly (via
WebFetch, not just WebSearch) for other thin NT-doctrine-vs-OT-proverb pairs, since its per-verse
page naming convention is guessable. Dry-run bake (`DRY_RUN=1 IDS=364 node
.scripts/buildHarmonizationTables.js`) came back with exactly the two expected pre-T9/T10
violations (`note_present`, `parity_count`) and 695/695 `verifyExcerpts.py` PASS — same clean
pattern as id 313, reconfirming that outcome is normal/expected for a TRANSFORM-only file, not a
bug to chase.

## Grep's `-B`/`-C` line numbers on a huge curled PD .txt can mismatch `sed`'s (id 325)
On a large PD full-text file pulled via `curl` (~1.3MB archive.org djvu.txt, ~42k lines,
`examinationof00hale_djvu.txt` — note a *second*, distinct archive.org identifier for the same
Haley book alongside the `examinationofall00hale` one already noted above; both are valid
mirrors), a `Grep` call with `-C 15` around a matched line reported a **line number range that
did not correspond to that content** when later checked with `sed -n '<range>p'` on the same
file (off by ~2700 lines, pointing at a wholly different section of the book). A second `Grep`
call on the *same* pattern **without** `-B`/`-C` reported the correct line number, which then
matched `sed`. Workaround: don't trust a single `-B`/`-C` grep's printed line numbers at face
value on a large downloaded PD text — suspect them if a subsequent plain-pattern grep or `sed`
at that line number shows different content, and prefer re-querying with a longer, more unique
literal substring (found via a first narrow grep, then re-run with `-B`/`-A` on that exact
substring) over trusting `-B N` context math off a fuzzier first hit.

## data/json/batch_NN.json's `questionUrl` field is the fastest way to identify the exact SAB
## page for the 439-model skeptic — check it before guessing a slug (id 348)
For "Does God listen to and answer prayers?" (Prov 2:3-5/8:17/Matt 7:8/Luke 11:9-10 "seek and
find" vs. Ps 18:41/Prov 1:28/Lam 3:8,44/Luke 13:24 "seek and not find"), `Grep`-ing
`data/json/batch_*.json` (root scrape/enrichment export, NOT the gather file) for `"id": 348`
turned up a `questionUrl` field — `https://www.skepticsannotatedbible.com/contra/found.html` —
giving the exact SAB slug directly, no guessing needed. `WebFetch` of that URL confirmed the
page title ("Can God be found?") and both "Yes"/"No" verse groupings match this row's refs
exactly. **Check `data/json/batch_*.json` for a `questionUrl` on the target id before doing any
WebFetch/WebSearch guessing of an SAB slug** — the gather file (`data/harmonization/gather/by_id/
<id>.json`) does not carry this field, but the root enrichment export does, and since
`scrapeContra.js` sourced the whole corpus from SAB, most `contradiction_id` rows will have one.

## Haley's "Doctrinal Discrepancies" chapter (pp. 70-72) has a 3-heading cluster covering this
## entire prayer-promise-vs-refusal family — check it before defaulting elsewhere (id 348)
curl+Grep of the Haley djvu.txt for `Lam\. iii` (his citation style, roman numerals with periods
— NOT `Lamentations 3:8`/chapter:verse) found three consecutive paired headings directly on
this contradiction's whole verse family: **"Inaccessibility"** (Ps 34:18/145:18, Jas 4:8 vs.
Lam 3:44 + Isa 45:15 + Ezek 20:3), **"All seekers find. / Some do not find."** (1 Chr 28:9,
Matt 7:8 vs. Luke 13:24, John 7:34, Isa 65:1), and **"Early seekers successful. / Some fail to
find."** (Prov 8:17 vs. Prov 1:28, quoted verbatim — this row's own "intra-Proverbial" pair).
Haley's harmonization for the Proverbs pair is the textbook "different class of person" move:
Prov 8:17 addresses genuine/youthful seekers, Prov 1:28 addresses "obstinate and hardened
transgressors" who rejected Wisdom's earlier call — "there is not the slightest collision
between the two texts." **Lesson: when a row's `question`/`summary` echoes a well-known
theological aphorism-pair (prayer, seeking God, judgment timing), search Haley by the OT-style
citation format he actually uses (`Prov. i. 28`, `Lam. iii. 44`, roman numerals + periods) or by
a short verbatim verse phrase, not just the book name** — a plain `Lamentations 3:8` grep had
come back zero hits earlier in the same pass and would have wrongly suggested no coverage.

## gotquestions.org search results can synthesize a plausible-sounding but URL-less answer —
## verify the actual page before citing it (id 348)
`WebSearch` for a specific gotquestions.org page on the Prov 1:28/8:17 or Lam 3:8/Matt 7:7 pairs
returned a confident prose synthesis ("According to GotQuestions.org...") that read like a real
citation but was **not tied to any single fetched URL** — the tool assembled it from multiple
unrelated hits (a different verse-pair page, bibleref.com, biblehub.com). Don't cite from a
WebSearch summary alone; if no single on-topic URL is confirmed, either keep searching with
narrower queries or set `link: null`. In this case a **broader, still-real and on-topic** page
was found and `WebFetch`-verified directly: `gotquestions.org/prayer-conditions.html` ("Are
there any conditions to answered prayer?") — doesn't cite this row's specific verses, but
argues the exact same "prayer is conditional, not a blank check" harmonization, so it's a
legitimate `link` with an honest `note` disclosing it doesn't name-check the row's verses.

## WebSearch-only Haley checks can false-negative on blanket-statement coverage (id 325)
The "Haley doesn't treat this passage" conclusion above (id 313, confirmed by a **full-text
Grep** coming back zero hits) is a different, stronger check than a **WebSearch-only** check —
and a WebSearch-only check can wrongly conclude "no coverage" when Haley's coverage is a
**blanket statement extending one named example to an unnamed class** rather than naming the
passage itself. Worked case: for the Ezra-2/Nehemiah-7 census cluster, an earlier pass (ids
326/330) used a WebSearch-only check, concluded Haley's coverage "could not be confirmed," and
fell back to Keil & Delitzsch as `pd_work` — but a subsequent curl+Grep full-text pass (id 325)
found Haley names the Arah variant explicitly, then adds "the other cases, some twenty in
number... are to be explained in the same manner," which licenses Haley for every clan in the
list. **Always prefer the curl+Grep full-text check over WebSearch alone before writing off
Haley's coverage** — see [[project_harmonization_transform_ezra_nehemiah_cluster]] for the full
correction and which not-yet-processed cluster ids still need it applied.

## Haley can have real but PARTIAL/adjacent coverage — a third outcome besides "confirmed" /
## "zero hits" (id 363)
For "Does God want some to go to hell?" (1 Tim 2:4 + 2 Pet 3:9 "God wills all saved" vs. Prov
16:4 + John 12:40 + Rom 9:18/22 + 2 Thess 2:11-12 "hardens/prepares for wrath"), curl+Grep of
the Haley djvu.txt for `vessels of wrath`, `strong delusion`, `believe a lie`, `will have all
men`, `not willing that any` all came back **zero hits** — but a broader grep for `hardeneth`
found Haley's real "Hardens men's hearts. / They harden their own hearts." doctrinal-discrepancy
heading (pp. 90-92), which explicitly quotes **John 12:40 and Romans 9:18** (two of this row's
four discrepancy-side refs) with real harmonizing exposition (Barnes, Alford, Keil, Delitzsch,
Stuart quotes reading hardening as withdrawal-of-grace, not positive causation). This is neither
"Haley covers this passage" (id 325's blanket-Arah pattern) nor "Haley doesn't treat this at
all" (id 313/364's zero-hit pattern) — it's **partial/adjacent coverage**: real, on-topic, but
of only half the verse cluster, and missing the specific 1 Tim 2:4/2 Pet 3:9 "wills all saved"
side entirely. Judgment call: didn't use Haley as `pd_work` here (his chapter argues a related
but distinct question — who does the hardening, God or man — not the will-to-save-all tension
this row's `question`/`summary` centers on); used the row's own reconcile-pole author (Keil &
Delitzsch, on Proverbs 16:4, which explicitly rejects predestinatio ad malum and cross-references
Rom 9:22) instead, with an honest `pd_work.note` disclosing Haley's adjacent-but-not-quite
coverage rather than silently omitting it. **When Haley's grep hits land on a differently-labeled
but clearly-related doctrinal heading, read that heading before deciding fit/no-fit — don't just
count hits on the row's own verse list.**

## CARM's `/universalism/` section is a good allowlisted link for "does God really will all
## saved" pairs (id 363)
`carm.org/universalism/1-tim-24-2-pet-39-and-universalism/` ("1 Tim. 2:4, 2 Pet. 3:9, and
Universalism") directly reconciles **both** universal-will texts (1 Tim 2:4 AND 2 Pet 3:9
together) against Reformed/particular-grace theology, citing Rom 9:22-23 vessels-of-wrath
language by name — confirmed live via WebFetch, exact title match. Good default `link` for any
row pairing 1 Tim 2:4 and/or 2 Pet 3:9 against a hardening/election text; CARM's URL pattern
`carm.org/universalism/<slug>` is worth checking directly (like `defendinginerrancy.com`'s
`bible-solutions/<Book>_<ch>.<vs>.php`) whenever a row's tension is "does God's stated will
apply to literally everyone."

## `questionUrl` tip re-confirmed after the fact (id 363) — check it FIRST, not as a check
Ran a manual WebSearch → WebFetch chain to find and verify `skepticsannotatedbible.com/contra/
all_saved.html` as the 439-model source for id 363, *then* separately grepped `data/json/
batch_*.json` for `"id": 363` and found a `questionUrl` field already pointing at the exact same
URL. The WebSearch/WebFetch chain wasn't wasted (it also surfaced the live CARM link and
confirmed the SAB page's verse-groupings match this row's refs exactly, which `questionUrl`
alone wouldn't have), but the id-348 lesson holds: **grep `data/json/batch_*.json` for the
target id's `questionUrl` before spending WebSearch calls guessing an SAB slug** — it would have
given the answer in one read instead of two searches plus a fetch.

## William Wrede is a real, verifiable named skeptic for the "Son of David" pericope (id 372)
For "Will the Messiah be a descendant of David?" (Isa 11:1 / Jer 23:5-6 vs Mark 12:35-37, David
calling the Messiah "Lord"), **Wilhelm Wrede** is a genuine, well-documented critical scholar who
read this exact pericope as Mark's own denial of Jesus's Davidic descent — confirmed via two
WebSearches (a Project MUSE review of Max Botner's *Jesus Christ as the Son of David in the
Gospel of Mark* states "William Wrede and others were wrong to read the son of David pericope in
Mark 12:35–37 as a denial of the Davidic descent of the Messiah, according to recent
scholarship") and a WebFetch of `syndicate.network`'s symposium introduction, which states
Wrede's actual position precisely: "the reason that Jesus asks how the messiah can be David's son
if he appears as his 'lord' in Psalm 110 is that Jesus himself was not a Davidide." The specific
real, citable work: William Wrede, "Jesus als Davidssohn," in *Vorträge und Studien* (Tübingen:
Mohr Siebeck, 1907), 147–77 — confirmed by a separate WebSearch (not just inferred). Bultmann is
also named in the literature as influential on this reading but Wrede is the originating,
specifically-attributable voice — use Wrede, not Bultmann, when a single named skeptic is needed
for this passage-family (any "Son of David" / Ps 110:1 pericope in Matt 22:41-46 / Mark 12:35-37
/ Luke 20:41-44).

Haley's PD text was curl+grepped (`examinationofall00hale_djvu.txt`) for `David's son`, `son of
David`, `David's Lord`, `calleth him Lord`, `call him Lord`, and `Mark xii`/`Mark 12` — **zero
hits** on the Son-of-David/Ps-110 question specifically (confirms real absence, not a
WebSearch-only false negative, per the id-325 caution above). Fell back correctly to a
harmonizing commentator already surfaced on the row: **Matthew Henry** (`MHC/41/12/35`), whose
note treats this exact pericope directly ("They told the people that the Messiah was to be the
Son of David... and they were in the right... yet they could not tell them how... it was very
proper for David, in spirit, to call him Lord"). Also found a live, on-topic `gotquestions.org`
link via WebFetch confirmation: `gotquestions.org/Jesus-son-of-David.html` ("What does it mean
that Jesus is the son of David?") explicitly poses and answers this same Ps-110-vs-Davidic-descent
puzzle — good default allowlisted link for this whole passage-family too.

## Mega-entry strategy: a 49-ref/745-note gather file still yields exactly ONE reconcile excerpt
## (id 367, "Does hell exist?")
Some gather files are enormous thematic clusters, not a single verse-pair — id 367 (four
"mutually incompatible afterlife schemes": eternal torment, annihilation, universalism,
Sheol-only-oblivion) had `refs_raw` of 49 verses and 745 notes across 7 PD voices (all
harmonizing commentators: GILL/JFB/CLARKE/KD/MHC/TYN/GNV — none concede a real contradiction).
**Don't try to represent all four strands** — the parity-cap rule still bites exactly as hard as
on a 2-verse row: `discrepancy_first` + `named_skeptic` (no verbatim discrepancy quote, since no
PD voice concedes) caps reconcile to **1** excerpt regardless of how many strands or how many
notes exist. Selection method that worked: group `notes` by `cites` (`node` one-liner counting
`n.cites.join('|')` frequency) to find the most heavily-annotated verse groups, then grep the
`text` fields for topic-specific keywords (`annihilat`, `everlasting punishment`, `conscious`) to
find a note that explicitly *argues against* the rival reading rather than merely explaining the
verse — GILL and CLARKE both had notes on 2 Thessalonians 1:9 ("everlasting destruction")
explicitly denying it means annihilation ("It is not annihilation, for their being continues...");
picked CLARKE's as cleaner/more explicit. This single sub-tension (destruction-language ≠
annihilation) is representative enough of the row's `genuine_contradiction` consensus to carry
the excerpt without needing to cover Sheol/universalism too.

## D. F. Strauss is the right named skeptic for "Joseph wasn't the real father, so how is Jesus of
## David's seed" (id 390) — and Haley's genealogy chapter treats the identical mechanism
For "Was Joseph the father of Jesus?" (Acts 2:30/13:23, Rom 1:3, 2 Tim 2:8, Heb 2:16, Rev 22:16
"seed of David according to the flesh" vs Matt 1:18-25/Luke 1:31-35 virgin conception), Strauss's
§27 "RETROSPECT OF THE GENEALOGIES" (Gutenberg #64037, curl+grep of the `.txt` mirror, not just
WebSearch) makes this **exact** argument almost verbatim: "The very design of these tables is to
prove Jesus to be of the lineage of David through Joseph; but what do they prove, if indeed
Joseph was not the father of Jesus? The assertion that Jesus was the son of David ... is
altogether annulled by the subsequent denial of his conception by means of the Davidical
Joseph." Confirms Strauss (already the corpus's default Life-of-Jesus critic per id 422/454) also
covers the genealogy-vs-virgin-birth family, not just synoptic-detail tensions. Reconcile pole
used a short, clean GILL excerpt (`GILL/44/2/30`, on Acts 2:30) that names the mechanism
apologists actually use: "even the Virgin Mary, who was of the house and lineage of David" — i.e.
the "according to the flesh" descent runs through Mary, not Joseph's paternity. **Haley's own
genealogy chapter (curl+grep of `examinationofall00hale_djvu.txt` for "genealog") independently
argues the identical reconciliation at length** — a full page-and-a-half under the heading
"Christ's Genealogy — one form. A diverse form." (Matt 1:16 vs Luke 3:23), concluding Luke
records **Mary's** descent through Heli, so Jesus is David's descendant "not only legally,
through his reputed father, but actually, by direct personal descent, through his mother" — used
verbatim in `pd_work.note`. Live allowlisted link found and WebFetch-confirmed on-topic:
`gotquestions.org/Mary-lineage.html` ("What was Mary's lineage?") — directly argues Luke 3:23-38
is Mary's genealogy, not Joseph's second genealogy. Good default trio (Strauss / GILL on Acts
2:30 or 13:22-23 / Haley's genealogy chapter + this gotquestions link) for any row in the
Davidic-descent-via-Joseph-vs-virgin-birth family (Matt 1, Luke 1-3, Rom 1:3, 2 Tim 2:8, Acts
2:30/13:23, Heb 2:16, Rev 22:16). Dry-run bake (`DRY_RUN=1 IDS=390`) came back with the same two
standard pre-T9/T10 violations (`note_present`, `parity_count`) and 723/723 `verifyExcerpts.py`
PASS — normal/expected, not a bug.

**Bart D. Ehrman, *Heaven and Hell: A History of the Afterlife* (Simon & Schuster, 2020)** is a
real, well-documented, mainstream-critical named-skeptic source for this whole contradiction
class ("the Bible contains multiple, historically-conditioned, non-harmonizable afterlife
views") — confirmed via WebSearch + WebFetch of `ehrmanblog.org` posts (his own summaries): OT
largely presents death as universal finality ("When it is over, it is over... for everyone,
equally"), he reads Jesus/much of the NT as teaching annihilation rather than eternal conscious
torment, and he treats Revelation as depicting real eternal (conscious) punishment — i.e. he
himself locates the internal plurality/tension. Caution: he doubts Pauline authorship of 2
Thessalonians and a search snippet suggested he doesn't deeply engage that specific verse, so the
discrepancy connective was written to state his **general, well-confirmed thesis** (OT finality /
NT annihilationist strand / Revelation's conscious torment) rather than pinning an unverified
specific claim about 2 Thess 1:9 onto him — the connective only needs to be on-tension for the
row, not a point-by-point rebuttal of the specific reconcile excerpt.

Haley's PD text (curl+grep of `examinationofall00hale_djvu.txt`) has a **very strong, extensive
match** here: a whole subsection titled "Future Punishment — Its Nature" (~pp. 203-212) that
quotes and rebuts the annihilationist reading of 2 Thess 1:9, Daniel 12:2, Matthew 13:41-42,
22:13, 25:41, Mark 9:43-48 (44/46/48), Revelation 14:10-11, and 20:15 — i.e. nearly the row's
entire eternal-torment-vs-annihilation verse set — arguing at length that Hebrew/Greek
"perish/destroy/consume/cut off" terms never entail extinction of consciousness (reductio: the
same words are used of the Messiah, of the righteous, of recoverable lost objects). This is a
model case of Haley being the single best `pd_work` for a doctrinal (not genealogical) mega-entry
— worth checking `examinationofall00hale_djvu.txt` for "Future Punishment" / "annihilat" /
"everlasting" on any afterlife/hell contradiction before looking elsewhere.
`gotquestions.org/annihilationism.html` ("Is annihilationism biblical?") is a live, confirmed,
on-topic allowlisted `link` for this whole afterlife/hell contradiction family.

## Bart Ehrman ("Jesus, Interrupted", 2009) is a real, on-point 439-model skeptic for Matthew's
## genealogy generation-count (id 389) — and Haley DOES cover it (bare-phrase grep false negative)
"How many generations were between the Babylonian captivity and Jesus?" (Matt 1:17's "fourteen
generations" from exile to Christ vs. the 1:12-16 list, which is only 13 distinct names once
Jeconiah isn't double-counted at the section boundary) — `WebFetch` of
`ehrmanblog.org/a-numerical-puzzle-in-matthews-genealogy/` confirmed Ehrman treats this exact
issue directly, calling the shortfall "a pure slip" when asked if it was gematria-intentional or
a calculation error; the same point is made in his book *Jesus, Interrupted* (HarperOne, 2009).
Used as the discrepancy pole's `named_skeptic` (no gathered PD note itself concedes an
irreconcilable error, so no verbatim discrepancy excerpt existed — correct per the contract).
Reconcile pole: JFB's note on Matt 1:17 explicitly names the "only thirteen distinct names"
shortfall and offers its own resolution (shift the David-style double-count from Jeconiah to
Josiah/Jeconiah at the 2nd/3rd boundary), plus cites LANGE's alternative (Mary as the implicit
13th link) — richer and more self-contained than TYN's shorter gematria-angle note on the same
verse, so JFB was picked as the single parity-capped excerpt (discrepancy pole count = 1
named-skeptic connective, so reconcile capped to 1 excerpt too).

**Haley DOES treat this passage directly** (correcting the general "thin genealogical entries
under-served by Haley" pattern from id 313 above) — a bare-phrase curl+Grep for
`"fourteen generations"` came back **zero hits** (OCR/wording mismatch), but retrying with the
passage's proper-noun anchors (`Jechonias`/`Salathiel`/`genealog`) found it immediately: under
"Historical Discrepancies," heading "Generations, forty-two. / A different number." (Matt 1:17
vs Matt 1:2-16), Haley surveys the inclusive-boundary reading (Alford, Robinson, Gardiner
double-count both David and Jeconiah), Ebrard's alternative division, Dr. Mill on the Jewish
convention of arranging genealogies by mystical numbers, and — most decisively — the observation
that "Jehoiakim" and "Jehoiachin" differ in Greek by a single letter, so "Jechonias" in Matt 1:11
vs 1:12 may denote two different individuals, removing the deficiency without any double-counting
at all. **Lesson: when a bare-phrase grep fails, retry with proper-noun anchors from the passage
itself before concluding Haley is silent** — this is a well-known, heavily-engaged NT-internal
numerical crux (unlike the obscure OT genealogical rosters that genuinely lack Haley coverage),
so his apparent silence should have been treated as suspicious from the start, not accepted at
face value.

`gotquestions.org/14-generations.html` ("Is there an error in the counting of the 14 generations
in Matthew chapter 1?") is a dedicated, on-topic allowlisted link for this exact question — good
default for any Matt 1:17 generation-count row. Dry-run bake (`DRY_RUN=1 IDS=389 node
.scripts/buildHarmonizationTables.js`) came back with exactly the two expected pre-T9/T10
violations (`note_present`, `parity_count`) and 716/716 `verifyExcerpts.py` PASS — same clean
pattern as every other worked TRANSFORM-only id in this file.

## Haley's "Doctrinal Discrepancies" chapter has a dedicated "Forms of report. Different." heading
## covering Synoptic wording variants directly — and Ehrman engages the baptism-voice case by name
## (id 398)
"How did God address Jesus at his baptism?" (Mark 1:11/Luke 3:22 second-person "Thou art my
beloved Son" vs Matthew 3:17 third-person "This is my beloved Son") — curl+Grep of
`examinationof00hale_djvu.txt` for `beloved` found Haley lists all three verses **verbatim,
side by side**, under the heading "Forms of report. Different." (pp. 153-154, in the same
"Doctrinal Discrepancies" chapter as the id-348 prayer cluster above), immediately followed by a
second example of the same phenomenon (the titulus on the cross, "This is Jesus the King of the
Jews" vs "The King of the Jews" vs "Jesus of Nazareth, the King of the Jews"). Haley's
harmonization is a blanket one covering the whole "different forms of the same saying" class:
"it is beyond question that in each the fundamental idea is preserved under all the various
forms. And this, we think, is all, and precisely what, the sacred writers intended." **This
heading is the right first stop for ANY row whose tension is that two/three Gospels report the
same spoken words with different grammatical person, different verb tense, or different phrasing
of an otherwise-identical utterance** (the titulus example he pairs with it is a second, already
gathered-verse-family candidate worth checking if it recurs as its own row). Reconcile pole used
Matthew Henry's own version of the identical harmonization on Luke 3:21 (`MHC/42/3/21`): "Here,
and in Mark, it is expressed as spoken to Christ; in Matthew as spoken of him... It comes all to
one; it was intended to be a notification to John... and likewise an answer to his prayer" — MHC
picked over Haley for the excerpt itself since Haley's own sentence here is a summary judgment
rather than a quotable single-passage exposition, but Haley's page was still the correct
`deeper_learning.defense.pd_work` citation (real, on-passage, more authoritative than defaulting
to MHC twice).

Named skeptic: **Bart D. Ehrman**, *Jesus, Interrupted* (HarperOne, 2009), pp. 39-40, treats this
**exact** discrepancy by name (confirmed via WebSearch snippets of a hostile third-party review
quoting the book directly, not just a paraphrase): Matthew's "This is my beloved son" reads as
addressed to the crowd/John, Mark's "You are my son" reads as addressed to Jesus privately —
i.e. Ehrman independently makes the identical grammatical-person observation Haley and MHC both
harmonize, which is a clean case of the same textual fact supporting both a skeptic's "these
can't both be the verbatim utterance" reading and a harmonizer's "one substance, two functions"
reading. No allowlisted apologetics link (`gotquestions.org`/`carm.org`/`defendinginerrancy.com`)
was found specifically on the "This is"/"Thou art" wording difference — a CARM page
(`carm.org/about-the-bible/did-early-christians-change-the-words-to-luke-322/`) surfaced on
search but is actually about a **different** discrepancy at the same verse (the Western-text
"today I have begotten you" reading of Luke 3:22 that Ehrman discusses elsewhere) and was
correctly rejected as off-topic rather than cited loosely. **Lesson: a search hit at the right
verse reference is not the same as a hit on the right discrepancy — read enough of the page to
confirm it argues the specific tension this row states, not just any tension at that address.**
