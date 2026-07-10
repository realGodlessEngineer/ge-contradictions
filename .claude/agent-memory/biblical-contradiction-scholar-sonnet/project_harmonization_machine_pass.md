---
name: project_harmonization_machine_pass
description: T5/T6 machine-excerpt TRANSFORM leg (data/harmonization/curation/machine/<id>.json) — schema drift vs TRANSFORM_CONTRACT.md, Haley-verification-via-curl+grep applies here too (incl. WebSearch-only false negatives, Grep -B/-C line-number pitfall, roman-numeral citation style, partial/adjacent-coverage judgment calls, bare-phrase-vs-proper-noun grep retries), SAB precedent for thin genealogical/theological entries, data/json's questionUrl field for fast SAB-slug lookup, carm.org/universalism link source, mega-entry (huge multi-verse thematic gather file) selection strategy, Ehrman named-skeptic precedent for afterlife/hell AND Matthew-genealogy-generation-count contradictions, Strauss named-skeptic precedent for the genealogy-vs-virgin-birth family (id 390), a scratchpad-cached Haley djvu.txt speeds up repeat curl+grep checks, defendinginerrancy.com/bible-solutions/<Book>_<ch>.<vs>.php 404s are a normal/expected outcome not a bug (id 407), Haley headings for well-known synoptic pericopes are often keyed to the full chapter-range citation not the row's narrow verse slice — resurrection-morning order-of-events crux id 479 and the distinct timing-wording crux id 477 (same pericope, two different Haley headings), WebSearch-AI-synthesis can fabricate a plausible-sounding page summary not actually on that URL (verify via curl+Grep raw HTML, not just WebFetch); Ehrman's "seven last words" harmonizing critique as named skeptic + genuine Haley silence (verified zero-hit) on the last-words-of-Jesus family, id 473; bartehrman.com guest-author caution (Joshua Schachterle, not Ehrman) + Ehrman's own Jesus,Interrupted p.49 tomb-witness catalogue + Haley pp.328-330 Robinson-harmony hit + carm.org bible-difficulties link, id 499 (empty-tomb messenger inside/outside); Raymond Brown named-skeptic precedent for Johannine composite/seam ("editor who doesn't edit") redaction claims, id 525 (did the apostles ask where Jesus was going); id 526 (did Jesus tell his disciples everything, John 15:15 vs 16:12) — second Raymond Brown/Barrett Johannine-compositional-layers hit, this time sourced straight from the row's own pre-existing DB `scholarship` field rather than a fresh WebSearch; Haley exact two-column heading hit; upstream note-label-mismatch handling pattern (verse_ref set to the verse the quote actually discusses, not the note's own mislabeled `ref`, with the discrepancy explained in `on_tension_rationale`); id 536 (idol meat: 1 Cor 8:4-8 neutral vs Acts 15:28-29 Jerusalem-decree abstention) — Gerd Lüdemann (Acts historicity/Apostolic-Decree-as-Lukan-construction) named-skeptic precedent sourced from the row's own pre-existing `scholarship` field, confirmed Ehrman's *Jesus, Interrupted* "five examples" do NOT include this pairing (don't over-assume Ehrman coverage), Haley's "Idol-meats" heading (p.249) is a topically-adjacent NEAR-MISS (resolves a different intra-Corinthians tension, not Acts-vs-Corinthians) — read the page, don't trust the keyword hit; id 563 (flat earth: Isa 40:22 vs Matt 4:8) — SAB's per-verse `mt/4.html` page (not a `contra/` slug) has the named-skeptic quote, and a GILL versification off-by-one on that chapter was sidestepped by picking correctly-labeled JFB instead
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

## Haley scores a direct, exact-heading hit on the "let your light shine" vs "not to be seen"
## crux — worth checking BEFORE assuming a famous Sermon-on-the-Mount pair is under-served (id 407)
"Should we let others see our good works?" (Matt 5:16 / 1 Pet 2:12 "that they may see your good
works" vs Matt 6:1/23:3-5 "not to be seen of them") — a `Grep` of an already-cached scratchpad
copy of the Haley djvu text (`haley.txt`, carried over from an earlier session in the same
scratchpad dir — **check the scratchpad for a prior `haley*.txt` before re-curling the ~1.3MB
archive.org file**, it saves a full curl round-trip) for `alms before men` came back zero hits,
but `your light` found it immediately: a dedicated two-column heading **"Good works. / To be
seen by men. Not to be seen by them."** (p. 279, "Ethical Discrepancies" chapter) prints Matt
5:16 and Matt 6:1 verbatim side by side, then resolves it with the identical motive-distinction
argument every modern commentary uses: "The glory of God, and not the praise of men, must be our
ultimate object in exhibiting our 'good works' before others," quoting Andrew Fuller: "It is
right to do that which men may see and must see, but not for the sake of being seen by them."
**Lesson: this reinforces (not just repeats) the id-389 baptism-voice correction — a famous,
heavily-anthologized NT-internal "contradiction" like this one is exactly the kind of passage
Haley is likely to cover directly; don't assume thin coverage without checking a few keyword
variants (a bare-phrase miss on one wording doesn't mean absence).**

Reconcile excerpt used **TYN** (Tyndale Open Bible Commentary) on Matthew 6:1, not GILL/JFB/MHC —
its note is the only one of the six voices that explicitly cross-references the other verse
inline (`"...seek praise for oneself rather than for God (cp. 5:16)."`), making it the cleanest
single on-tension sentence despite MHC/40/6/1 ("Not that it is unlawful to give alms when men see
us... but not that men may see us") and MHC/40/5/13's anchor block also carrying strong,
independently-usable candidate sentences on the identical point — worth remembering MHC's
Matt 5:13 anchor note (`MHC/40/5/13`) as a backup/alternate excerpt for this exact row family if
TYN is ever unavailable or a second excerpt is later permitted.

Named skeptic: **Steve Wells / Skeptic's Annotated Bible** — `data/json/batch_*.json`'s
`questionUrl` for this id pointed straight at `skepticsannotatedbible.com/contra/seegood.html`
(checked first, per the id-348/363 lesson) and a `WebFetch` confirmed the page frames it as a
flat "Yes"/"No" contradiction (item #472) with no motive-distinction offered on the page itself.

**No allowlisted `link` found despite real effort** — multiple `WebSearch`/`WebFetch` rounds on
`gotquestions.org` (`/let-your-light-shine.html`, `/salt-and-light.html`,
`/they-have-their-reward.html`) each confirmed live and on-theme but **none actually references
the other verse or names the 5:16-vs-6:1 tension** (each was individually WebFetched and
confirmed NOT to address the pairing, not just assumed from a search snippet — the id-348
"don't cite from a WebSearch summary alone" lesson applies to ruling a link OUT, not just IN).
`defendinginerrancy.com/bible-solutions/Matthew_6.1.php` and `.../Matthew_5.16.php` (guessed from
the confirmed `<Book>_<ch>.<vs>.php` pattern used successfully at id 364) both **404**. A
non-allowlisted page (`wingulamashahidi.org`) had the exact matching title
("Should Our Light Shine or Not? Understanding Matthew 5:16 and Matthew 6:1 in Context") — a
useful confirmation the tension is a recognized apologetics topic, but off-allowlist and
correctly not cited. **Set `link: null` rather than stretching a same-verse-but-off-topic
allowlisted page into a citation** — a live, on-domain page that doesn't actually address the
row's specific tension is not a valid `link` per the contract's "real, on-topic page" requirement.
Dry-run bake (`DRY_RUN=1 IDS=407`) came back with **0 validator violations** (cleaner than the
usual two pre-T9/T10 violations seen on most other worked ids) and 733/733 `verifyExcerpts.py`
PASS — a validator-clean result is also a normal outcome, not a sign something is missing.

## Steve Wells/SAB confirmed again for a non-genealogical "how should X be treated" pairing (id 421)
"How should publicans be treated?" (Mark 2:15-16/Matt 9:10-11/11:19/Luke 5:30/7:34/15:1-2 "friend
of publicans" vs Matt 18:15-17 "treat him as a heathen man and a publican") — `data/json/
batch_22.json`'s `questionUrl` gave the exact SAB slug directly (`contra/publicans.html`);
`WebFetch` confirmed the live page's actual title is **"How should heathens and publicans be
treated?"** with a two-column "treated like friends" vs. "should be shunned" framing — matches
this row's tension exactly, so Steve Wells / SAB is correctly the 439-model named skeptic (no
gathered PD note concedes a real conflict; all six voices — GILL/JFB/CLARKE/MHC/TYN/GNV — are
harmonizing). Reconcile excerpt: JFB's closing sentence on Matthew 18:15 (`JFB/40/18/15`) —
`"Lastly, If even this fail, regard him as no longer a brother Christian, but as one \"without\"—
as the Jews did Gentiles and publicans."` — the on-tension move is that JFB frames the "treat as
a publican" standard as **borrowing the Jews' own social convention** for outsiders, not
asserting Jesus's/the church's personal verdict on tax collectors, which is also how the row's
pre-existing DB `commentary` field (Blomberg/Carson "cultural shorthand" framing) already reads
it — worth checking a row's existing DB `commentary`/`scholarship` text for the standard
apologetic move before hunting one from scratch. Haley's djvu (`examinationofall00hale_djvu.txt`,
curl+Grep for `publican`/`heathen man`/`xviii. 17`) has **zero coverage of this pairing** — his
only `publicans` hits are a wholly different discrepancy (Matt 21:31 "publicans and harlots enter
[the kingdom]" vs. purity-exclusion texts), confirming real absence, not a search miss. Fell back
correctly to JFB itself (already the reconcile author) as `pd_work`, per the id-364 precedent.
Link: `gotquestions.org/Bible-tax-collectors.html` ("Why does the Bible speak so negatively about
tax collectors?") — WebFetch-confirmed it directly reconciles this exact tension ("as an outsider
and a candidate for evangelism," i.e., social separation aimed at eventual restoration, not
contempt). Dry-run bake (`DRY_RUN=1 IDS=421`) gave the standard two pre-T9/T10 violations
(`note_present`, `parity_count`) and 734/734 `verifyExcerpts.py` PASS — normal, not a bug.

## Haley has a dedicated "Due to masters. / To God only." heading — exact hit for the
## serve-God-alone-vs-obey-your-masters family (id 401)
"Should you serve God alone?" (Matt 4:10 "him only shalt thou serve" + Matt 23:8/10 "one is
your Master, even Christ" vs. the household codes: Eph 6:5, Col 3:22, 1 Tim 6:1, Titus 2:9,
1 Pet 2:18 commanding servants to obey human masters) is SAB's `contra/serve.html` (confirmed
via `data/json/batch_*.json`'s `questionUrl` field, per the id-348/363 tip — check it first).
Consensus was `genuinely_disputed` → `discrepancy_first` per the §7 rule. Named skeptic: **Steve
Wells**, *Skeptic's Annotated Bible* (1999) — the SAB page states the tension directly (Yes:
Matt 4:10/23:10; No: the five household-code refs), so Wells is a clean 439-model fit (same
attribution format as the genealogy-cluster precedent: `Steve Wells, Skeptic's Annotated Bible
(1999), contra/<slug>.html`). Reconcile excerpt: Matthew Henry's block-anchored note on
Ephesians 6:1 (`MHC/49/6/1`, `anchor: true`, covering all of vv1-9) buries the exact on-tension
line deep inside: "Civil servitude is not inconsistent with Christian liberty. Those may be the
Lord's freemen who are slaves to men. 'Your masters according to the flesh (Eph 6:5), that is,
who have the command of your bodies, but not of your souls and consciences: God alone has
dominion over these.'" — picked over shorter candidates on the same row (Gill/Clarke/JFB/TYN/GNV
on Eph 6:5, Col 3:22, etc., all made the same "civil/bodily vs. spiritual/soul" move but less
crisply) because it explicitly says "God alone," mirroring the row's own "serve ... only"
framing most tightly.

**Haley's PD text has a direct, page-specific hit** — curl+Grep of `examinationofall00hale_djvu.txt`
for `Rabbi|masters,?\s+obey|Servants,?\s+be` (NOT a bare-phrase grep like `only shalt thou serve`,
which came back zero hits first) found, in the "Ethical Discrepancies" chapter (p. 293), a
side-by-side heading **"Due to masters. / To God only."** quoting Col 3:22 + 1 Pet 2:18 against
Matt 4:10 + Matt 23:8, with the harmonization stated as a one-line rule: "The first series refers
to civil obedience, or obedience in secular matters; the last relates to worship and religious
service." This is the SAME chapter/mechanism as an adjacent "Parents honored. / Treated
disrespectfully." heading a few pages earlier (Matt 23:9 "call no man father" vs. Col 3:20/Eph
6:4) — **worth checking this whole Haley "Ethical Discrepancies" chapter (~pp. 287-294) first for
any row in the "call no man father/rabbi/master" (Matt 23:8-10) family paired against
household-obedience texts**, rather than defaulting straight to a row's own reconcile-excerpt
author for `pd_work`. No allowlisted `link` was found: `gotquestions.org` has a page on Matt 23:9
("father") but explicitly does NOT address the master/servant angle (confirmed via WebFetch), and
`defendinginerrancy.com/bible-solutions/Ephesians_6.5.php` + its `Philemon_16.php` cross-reference
exist and are on-verse but address a *different* question (does Eph 6:5/Philemon endorse slavery
as an institution) rather than this row's God-alone-vs-obey-masters tension — both correctly
rejected as off-topic rather than cited loosely; `link: null`. Dry-run bake (`DRY_RUN=1 IDS=401`)
came back with the same two standard pre-T9/T10 violations (`note_present`, `parity_count`) and
738/738 `verifyExcerpts.py` PASS — normal/expected.

## Haley scores a direct, exact-heading hit on the disciples'-calling-order crux, PLUS a second
## adjacent entry on the same imprisonment-chronology question — a third `examinationof00hale`
## archive.org mirror confirmed working (id 402)
"Which came first: the calling of Peter and Andrew or the imprisonment of John the Baptist?"
(Matt 4:12,18-19/Mark 1:14-17 vs John 1:40-42/John 3:22-24 "John had not yet been thrown into
prison") — curl+Grep of a **third** working archive.org mirror,
`https://dn760000.eu.archive.org/0/items/examinationof00hale/examinationof00hale_djvu.txt`
(reached via `curl -sIL` following the redirect from `archive.org/download/examinationof00hale/
examinationof00hale_djvu.txt`; a third distinct identifier alongside `examinationofall00hale` and
the second `examinationof00hale_djvu.txt` mirror already noted at id 407), for `Baptist` (only 3
hits total, cheap to eyeball) found `prison` nearby and landed on **two separate, directly-on-topic
entries** in the "Historical Discrepancies" chapter (pp. 406-408): a dedicated two-column heading
**"Apostles called at one time. / At a different time."** (John 1:35-43 vs Matt 4:18-22/Mark
1:16-20/Luke 5:1-11) giving the exact two-stage-calling harmonization ("John describes the first
interview... They 'abode with him that day,' but afterward returned... Later... they were called
to the apostolic office"), immediately followed a page later by the imprisonment-timing question
itself listed among chronological-arrangement minor discrepancies ("His preaching began before
John's imprisonment, John iii. 2, 22, 24; from that epoch, Matt. iv. 12, 17; Mark i. 14"). Both
were cited together in `pd_work.note`. **Lesson: a bare-phrase grep for a rare, low-frequency
proper noun ("Baptist") that only appears 2-3 times in the whole book is itself a fast, reliable
way to jump straight to the right passage when the topical phrase (e.g. "cast into prison") comes
back empty on a first pass** — cheaper than iterating multiple topical-phrase variants.

Reconcile excerpt used **MHC** (Matthew Henry, `MHC/40/4/18`, on Matthew 4:18) rather than the
row's other strong candidates — JFB's John 3:24 note ("Hence it is plain that our Lord's ministry
did not commence with the imprisonment of John, though... we should have drawn that inference
from Mat 4:12 and Mark's... express statement") and TYN's John 3:24 note (a similar synthesis) —
because MHC is the only one that states the actual *resolving mechanism* (two distinct callings:
an earlier acquaintance under John, a later formal summons) rather than just noting that the
naive chronological inference from Matthew/Mark is corrected by John 3:24. When multiple notes are
on-tension but only one is capped in (`discrepancy_first` parity-cap = 1), prefer the note that
supplies the actual harmonizing *mechanism* over one that only flags the naive-inference problem.
Excerpt required a **leading ellipsis** (`"…the two former, and, probably, the two latter also,
had had acquaintance with Christ before..."`) since the on-tension clause starts mid-sentence,
after a dropped introductory clause — confirmed via `Grep` that this leading-`…`-for-a-mid-sentence-
start convention (not just trailing-`…`-for-truncation) is already used elsewhere in the corpus
(e.g. id 348's excerpt), even though `TRANSFORM_CONTRACT.md`'s prose only explicitly describes the
trailing case.

Named skeptic: **Steve Wells / Skeptic's Annotated Bible** — `data/json/batch_21.json`'s
`questionUrl` gave the exact slug (`contra/imprisonment.html`) directly; `WebFetch` confirmed the
live page's title is a verbatim match to this row's `question` and its two-column framing matches
the row's refs exactly, including the "not yet cast into prison" quote. Link:
`gotquestions.org/order-calling-Jesus-disciples.html` ("Why is the order of Jesus' calling His
disciples different in some of the gospels?") — WebFetch-confirmed live and on-topic, arguing the
identical two-stage (introductory-meeting vs. formal-calling) harmonization as MHC and Haley.

## CAUTION: ehrmanblog.org/forum/ threads are reader posts, NOT Ehrman's own words — WebFetch/
## WebSearch AI-synthesis can misattribute a forum member's argument to Ehrman himself (id 420)
For "What was the name of the tax collector called by Jesus?" (Matthew 9:9 "Matthew" vs Mark
2:14/Luke 5:27 "Levi"), both a raw `WebSearch` and a `WebFetch` of
`ehrmanblog.org/forum/the-new-testament-gospels/levi-or-matthew/` produced confident prose
("Ehrman's view is that Matthew simply changed the name... he doesn't think the person in the
story actually had two names") — **this is false**. Directly `curl`-ing the page with a
browser-UA (plain WebFetch 403'd; needed `curl -A "Mozilla/5.0 ..."`) and reading the raw HTML
showed post #1 is signed by forum member **"brown.connor4"** (a paying subscriber, not
BDEhrman), post #2 by moderator "Robert" has empty visible content, and post #3 is by another
member "BruceRMcF" — Ehrman himself (username `BDEhrman`, visible in the page's admin list) never
posts in the thread. **Lesson: `ehrmanblog.org/forum/...` URLs are reader Q&A, not Ehrman's
scholarship — always open the raw page and check the per-post username before attributing
forum content to Ehrman by name; a WebSearch/WebFetch AI summary will confidently attribute
reader arguments to the blog's owner if you don't verify.** This generalizes to any blog with a
member forum (check the post author field, not just the domain).

## `data/json/batch_*.json`'s `scholarship` field (not just `questionUrl`) can hand you an
## already-vetted named-skeptic citation directly (id 440)
For "Did the disciples understand when Jesus told them about his coming death?" (Matt 17:22-23
"exceeding sorry" = comprehension vs Mark 9:30-31/Luke 9:44-45 "understood not... afraid to
ask" = incomprehension — a Matthean-redaction compositional tension, not a doctrinal one), the
same `data/json/batch_22.json` record that supplied `questionUrl`
(`skepticsannotatedbible.com/contra/understand.html`, confirmed live) **also already carried a
full prose `scholarship` field** from an earlier enrichment pass, citing **Tyson, Joseph B. "The
Blindness of the Disciples in Mark," *JBL* 80 (1961): 261-268 (on Markan disciple-incomprehension
as a redactional theme)** alongside Davies-Allison ICC, Joel Marcus AYB, Luz Hermeneia, etc.
`WebSearch` confirmed the Tyson JBL article is real (Journal of Biblical Literature 80/3,
Sept. 1961, pp. 261-268, Scholarly Publishing Collective abstract page). Used Tyson (a genuine
peer-reviewed critical-scholarship article specifically on the mechanism behind this exact
contradiction) as the discrepancy pole's `named_skeptic` instead of defaulting to Steve
Wells/SAB — a stronger, more specific fit than the popular-level SAB Yes/No page, even though SAB
also confirmed coverage. **Lesson: before hunting a named skeptic from scratch, grep
`data/json/batch_*.json` for the target id and check whether it already has a `scholarship`
field from a prior DB enrichment pass — it can contain a real, citable critical-scholarship
source (journal article, ICC/AYB/Hermeneia commentary) more specific than SAB, not just the
`questionUrl`.** Reconcile excerpt used GILL's note on Matthew 17:23, which uniquely poses the
row's own tension as a rhetorical objection ("how came they to be so very sorrowful, if they did
not know what was said?") and resolves it (sorrow was caused BY the confusion, not despite it) —
picked over two other strong reconcile candidates on the same row (MHC's Luke 9:43 note, which
also explicitly links "understood not" to Matthew's sorrow; CLARKE's Mark 9:32 note, which
proposes only the 9 disciples absent from the Transfiguration didn't understand) since GILL's
framing most tightly mirrors the contradiction's own phrasing. Required a **leading ellipsis**
(excerpt starts mid-run-on-sentence, continuing after "and have relieved them under their
melancholy apprehensions of things;"). Haley's PD text (curl+Grep of a scratchpad-cached
`haley_full.txt`/`haley_djvu.txt` for `understood not`, `exceeding sorry`, `Mark ix. 32`,
`Matt. xvii. 23`, `sorrowful` — all zero/irrelevant hits) does not treat this passage, consistent
with the pattern that literary/compositional (not doctrinal/ethical) tensions are under-served by
the classic PD harmonizer canon; fell back to GILL itself (already the reconcile author) as
`pd_work` per the contract's fallback clause. No allowlisted `link` found despite multiple
WebSearch rounds (gotquestions.org/defendinginerrancy.com/carm.org queries all returned only
off-allowlist commentary sites); `link: null`. Dry-run bake (`DRY_RUN=1 IDS=440`) gave the
standard two pre-T9/T10 violations (`note_present`, `parity_count`) and 754/754 `verifyExcerpts.py`
PASS — normal/expected.

Correct named skeptic found instead: **D. F. Strauss**, *The Life of Jesus Critically Examined*
(1846 Eng. transl.), **§72 "CALLING OF MATTHEW. CONNEXION OF JESUS WITH THE PUBLICANS"**
(Gutenberg #64037, curl+grep of the `.htm` mirror, `xd30e18330`-area anchor) — a substantive,
verified, on-point primary-source hit: Strauss argues the "two names, one man" harmonization
fails because the Synoptic apostle-catalogues (Mark 3:18, Luke 6:15, Acts 1:13), which *do* give
other apostles' surnames/double-names, never call Matthew "Levi" nor tag him ὁ τελώνης ("the
publican") — "thus proving that they do not consider the Apostle Matthew to be identical with
the Levi summoned from the receipt of custom." (Strauss ultimately treats the whole pericope as
legendary rather than a simple factual error, but the catalogue-based objection to the
harmonization itself is squarely on-tension and independently quotable.) Reconcile pole: John
Gill's `GILL/40/9/8` note on Matthew 9:8 ("The other evangelists call him Levi... he went by two
names; Mark and Luke call him by the name... but he himself chooses to mention the name by which
he was most known, as an apostle...") — a full self-contained sentence starting exactly at a
source sentence boundary (no leading ellipsis needed). Haley's PD text (curl+grep of
`examinationof00hale_djvu.txt` for `Levi`, `publican`, `Matt. ix. 9`, `Mark ii. 14` — all zero
hits) does not treat this passage at all, so `pd_work` fell back to Gill per the contract's
fallback clause (same pattern as id 313/372). Live allowlisted `link`:
`carm.org/bible-difficulties/was-the-tax-collector-named-matthew-or-levi/` ("Was the tax
collector named Matthew or Levi?"), confirmed via WebFetch — argues Matthew (Greek)/Levi (Hebrew)
are dual names for one disciple, paralleling Simon/Peter. Dry-run bake (`DRY_RUN=1 IDS=420 node
.scripts/buildHarmonizationTables.js`) → the same two standard pre-T9/T10 violations
(`note_present`, `parity_count`), 739/739 `verifyExcerpts.py` PASS.

## Haley has a dedicated, exact-heading hit for "Was John the Baptist Elijah?" (id 429) —
## another confirmation that famous NT-internal identity cruxes are well-covered
"Was John the Baptist Elijah?" (Matt 11:14/17:12-13, Luke 7:24-27 "this is Elijah" vs John 1:21
"Art thou Elias? ... I am not") — `data/json/batch_22.json`'s `questionUrl` gave the exact SAB
slug directly (`contra/elijah.html`); `WebFetch` confirmed the page is a flat, unresolved
Yes/No listing. Consensus was `genuinely_disputed` → `discrepancy_first` per the §7 rule.
Scratchpad already had a cached `haley_djvu.txt` (multiple cached copies exist:
`haley.txt`/`haley1.txt`/`haley2.txt`/`haley_djvu.txt`/`haley_full.txt` — check the scratchpad
before re-curling). A bare-phrase `grep -i "art thou elias\|I am not.*elias"` mostly missed, but
`"this is Elias which was to come"` (a distinctive phrase from the verse itself) hit immediately:
p. 348, heading **"John identical with Elias. He was not Elias."** (Matt 17:12-13/Mark 9:13 vs
John 1:21), resolved as literal-vs-figurative: "In a figurative, but not in the literal, sense
John was Elias. He came in the spirit and power of the Tishbite prophet... Our Saviour's words,
'If ye will receive it'... show that a literal fulfilment was not intended." Used verbatim in
`pd_work.note`. Reconcile excerpt picked **GNV** (Geneva Bible marginal notes) on John 1:21 over
the much longer GILL/MHC notes on the same verse (both good, but GILL runs ~100 words in one
semicolon-chained sentence, MHC's is buried inside a huge block-anchored note) — GNV's two
contiguous sentences are short, verbatim-clean, name both poles explicitly (Mal 4:5/Matt 11:14
vs. John's denial), and state the reconciling principle crisply ("answering them indeed
according as they meant"), no ellipsis-trimming needed. Named skeptic: **Steve Wells / SAB**
(`questionUrl` confirmed, per the id-348/363/401 tip — check it before guessing a slug). Link:
`gotquestions.org/John-Baptist-Elijah.html` ("Was John the Baptist really Elijah reincarnated?")
— WebFetch-confirmed live and on-topic (the "if you are willing to accept it" conditional/
functional argument). Dry-run bake (`DRY_RUN=1 IDS=429`) gave the standard two pre-T9/T10
violations (`note_present`, `parity_count`) and 744/744 `verifyExcerpts.py` + 34/34
`verifyVersePairs.py` PASS — normal/expected.

## Strauss's §77 is an exact, on-the-nose hit for the missionary-discourse packing-list crux
## (id 426, "staff or no staff / shoes or sandals")
"Did Jesus tell his apostles to go barefoot and without a staff?" (Matt 10:9-10/Luke 9:3/10:4 "no
staff, no shoes" vs Mark 6:8-9 "a staff only... shod with sandals") — curl+Grep of the Gutenberg
`.htm` mirror (`gutenberg.org/files/64037/64037-h/64037-h.htm`, per the id-390/422 workflow) for
`\bstaff\b|\bsandal` landed directly on **§77 "INSTRUCTIONS TO THE TWELVE"**, which names this
exact three-verse tension as "a discrepancy" in so many words and gives a source-critical (not
harmonizing) account: tradition preserved only that Jesus signified simple equipment "by the
mention of the staff and shoes," and one Evangelist read that as permission (Mark, "consistent
with Mark's love of the picturesque") while the other(s) read it as prohibition of even those —
i.e. Strauss treats the wording difference as evidence of divergent oral tradition, not one event
told two compatible ways. This reconfirms Strauss (already the corpus's default Life-of-Jesus
critic per ids 422/454/390/420) as the go-to 439-model skeptic for **any** Synoptic missionary-
discourse/mission-of-the-Twelve wording variant, not just genealogy or resurrection-timing cruxes.

**Haley also scores a direct, page-specific hit** — curl+Grep of `examinationofall00hale_djvu.txt`
for `\bstaff\b|\bstaves\b|\bsandals?\b` (bare-phrase grep, not a topical phrase) found pp. 154-155
of the "Doctrinal Discrepancies" chapter quoting Matt 10:9-10, Mark 6:8-9, and Luke 9:3 verbatim
side by side, then resolving it two ways: (1) Matthew's Greek verb "provide" (κτάομαι) means
"acquire," so it bars getting a *new* staff, not carrying the one already owned (matching Mark's
"take" wording); (2) Matthew's "shoes" (a term implying full-foot coverage) names a different
article than Mark's "sandals" (a bound sole) — concluding "the supposed discrepancy utterly falls
away." Both Haley and Strauss treat this passage **directly and by name**, a useful confirmation
that famous, heavily-anthologized Synoptic "packing list" cruxes (like the id-389 generation-count
and id-407 let-your-light-shine cases) are reliably well-covered by both the classic PD harmonizer
and the classic PD critic — worth checking both before assuming thin coverage on any Matt-10/
Mark-6/Luke-9-10 mission-of-the-Twelve row.

Reconcile excerpt used **MHC** (`MHC/41/6/7`, a block-anchored note) over the several other
on-tension candidates gathered (GILL's `GILL/40/10/9`, which also covers both prongs via "plural
staves = more than one" + "shoes≠sandals" distinctions; JFB's `JFB/40/10/10`, a textual-criticism
move claiming Matthew's "true reading" is actually singular "staff" too; CLARKE's split notes on
Mark 6:8/6:9) because MHC is the only voice that resolves **both** prongs (staff AND shoes) in one
tight, two-sentence, non-ellipsis-needing span by recasting each pair as different **kinds** of
object (fighting staff vs. walking staff; covering shoe vs. bound sandal) rather than the same
object permitted/forbidden inconsistently — the cleanest single "answers the whole tension" excerpt
of the bunch, and parity-cap (`discrepancy_first` + `named_skeptic` discrepancy pole = count 1)
allows only one anyway. Live allowlisted link found and WebFetch-confirmed on-topic:
`defendinginerrancy.com/bible-solutions/Matthew_10.10_(cf._Mark_6.8).php` ("Did Jesus command that
the disciples take a staff or not?") — argues the same κτάομαι/"acquire" move Haley makes.

## Ehrman's own "Jesus, Interrupted" opening example, and Haley's real silence on temple-cleansing
## chronology despite a false-positive-looking nearby hit (id 448)
"When did Jesus' temple tantrum occur?" (John 2:11-16, right after Cana, vs. Luke 19:36-45/Matt
21:1-13/Mark 11:1-17, the week of the arrest) is one of the most famous NT-internal chronology
cruxes, and it turns out to be **the very first example Ehrman opens with** in *Jesus, Interrupted*
(HarperOne, 2009) — confirmed via two independent WebFetches (Ben Witherington's point-by-point
rebuttal blog and a search-snippet aggregation) landing on the identical quote: "Historically
speaking, then, the accounts are not reconcilable" (p. 7), plus Ehrman's own follow-on point that
positing two separate cleansings "would mean that neither Mark nor John tells the 'true' story,
since in both accounts he cleanses the temple only once" — a sharper, more specific objection than
just "these disagree," worth using in the connective rather than the bare quote alone. Reconcile
excerpt used **CLARKE** (`CLARKE/43/2/14`, on John 2:14) — Clarke's note is itself an exhaustive
survey of the two-cleansings debate, naming both camps by name (Mann/Priestley/Pearce for one
cleansing; Calvin/Mede/L'Enfant/Beausobre/Lardner/Hurd/Newcome for two) and quoting Bp. Newcome's
Harmony at length — picked a single clean closing sentence needing no ellipsis: "The vindication of
God's house from profanation was the first and the last care of our Lord; and it is probable he
began and finished his public ministry by this significant act." A shorter TYN note on the same
verse (`TYN/43/2/14`) also directly named both harmonization strategies (literary/theological
reordering by John, vs. two actual events) and was a strong alternate candidate — kept as a backup
excerpt for this row family if a second reconcile slot is ever permitted.

**Haley false-positive caution, worked concretely**: a bare `temple` grep on the scratchpad-cached
`haley_full.txt` returns real hits that *look* on-topic (a passage quoting John 2:15-16's scourge-
of-cords verbatim, side by side with Matt 26:52/Luke 22:36) but turns out to be a wholly different
discrepancy — Haley's "Resistance. Exemplified. Interdicted." heading (p. 299, Ethical
Discrepancies chapter), about whether Jesus's use of force sanctions violence against the "resist
not evil" teaching, not about *when* the cleansing happened. **Read enough of a keyword hit to
confirm it argues the row's specific tension, not just any tension touching the same verse** (same
lesson as id 398's CARM near-miss) — multiple further keyword variants (`purg`, `cleans`, `money
changers`, `buyers and sellers`, `twice purged`, `began his ministry`/`closed his ministry`) all
came back zero/irrelevant, confirming Haley has no dedicated treatment of the chronology question
itself; fell back correctly to Clarke (already the reconcile author) as `pd_work`. Live allowlisted
link: `gotquestions.org/temple-cleanse.html` ("How many times did Jesus cleanse the temple? Why did
He cleanse the temple?"), WebFetch-confirmed live, arguing the two-cleansings position by name.
Dry-run bake (`DRY_RUN=1 IDS=448`) gave the standard two pre-T9/T10 violations (`note_present`,
`parity_count`) and 764/764 `verifyExcerpts.py` PASS — normal/expected.

## Anthony Saldarini is a real, on-point named skeptic for the "obey the Pharisees vs. beware their
## doctrine" pericope — a redaction-critical "unassimilated layer" reading, not just a Yes/No page
## (id 452)
"Should we do what the Pharisees say to do?" (Matt 23:1-3 "observe and do... sit in Moses' seat" vs
Matt 16:12 "beware... the doctrine of the Pharisees and of the Sadducees") — `data/json/
batch_23.json`'s `questionUrl` gave the exact SAB slug (`contra/do_what.html`, WebFetch-confirmed
verbatim title/framing match), AND the same record's pre-existing `commentary`/`scholarship` fields
(from an earlier enrichment pass) already named several real critical sources treating this exact
crux: Davies & Allison ICC vol. 3 pp. 263-272, Anthony Saldarini's *Matthew's Christian-Jewish
Community* (1994), Ulrich Luz Hermeneia, and Mark Allan Powell's "Do and Keep What Moses Says
(Matthew 23:2-7)," *JBL* 114/3 (1995): 419-435 — all independently spot-checked via WebSearch (the
Powell JBL citation resolved to a real Scholarly Publishing Collective page; Saldarini's specific
"unassimilated community-layer" argument was corroborated via the Wikipedia "Matthew 23" article,
which independently calls 23:3 "one of the most disputed verses in the Gospel of Matthew" since it
appears to endorse positions the Gospel rejects elsewhere — convergent, not just circular,
confirmation). **Lesson: a row's own pre-existing DB `commentary`/`scholarship` field can name a
better-fitting, more specific critical voice than the reflexive Steve Wells/SAB default — check it
before defaulting, per the id-440 tip, and spend a WebSearch or two independently corroborating the
specific claim attributed to the named scholar (not just that the book/article exists) before
using it as the 439-model connective.** Consensus was `genuinely_disputed` → `discrepancy_first`
per the §7 rule. Used Saldarini (not Davies & Allison or Luz) as the named skeptic because his
argument is the most independently corroborable and the most substantively "genuine tension" (a
real compositional/historical seam, not just a hard verse to harmonize).

Reconcile excerpt used **TYN** on Matthew 23:3 (`TYN/40/23/3`) over GILL/JFB/GNV candidates on the
same verse (all made a similar doctrine-vs-practice or law-vs-tradition restriction) because TYN's
note is the only one that **explicitly cross-references 16:5-12 by chapter:verse inline** — "This
was not a blanket endorsement of all that the Pharisees teach (see 15:1-20; 16:5-12; 23:13-39)" —
making it the most tightly on-tension single excerpt (three compact harmonizing readings: Torah-
scope limitation, irony, tactical non-offense), same "explicit inline cross-reference beats a
merely-compatible same-verse note" logic as id 407's TYN pick. Dropped the note's own "23:3 practice
and obey:" lemma-label prefix without treating it as a truncation (no ellipsis needed) — same
precedent as id 407's TYN excerpt, which silently drops its "6:1" verse-number heading.

**Haley scores a real, on-topic (though not verse-identical) hit** — curl+Grep of the scratchpad-
cached `haley_djvu.txt` for `Moses.{0,5}seat` found, in the "Ethical Discrepancies" chapter
(immediately after the id-401 "Due to masters. / To God only." heading, ~p. 293-294), a two-column
heading **"Rendered to the scribes. / They must be shunned."** that quotes Matt 23:2-3 verbatim
against the *Markan* parallel warning (Mark 12:38-40, not Matt 16:12 itself) and resolves it with
the identical doctrine/practice split this row's own TYN/GILL/JFB notes all independently make:
"Follow their precepts, but shun their practice. Do as they say, but not as they do." **Lesson:
Haley's coverage doesn't have to cite the row's own exact verse pair to count as on-topic `pd_work`
— a parallel-passage heading (Mark 12:38-40 standing in for Matt 16:12) making the identical
harmonizing move on the identical Matt 23:2-3 anchor verse is legitimate, real, on-point coverage;
say so honestly in `pd_work.note` rather than either over-claiming an exact-pair match or wrongly
concluding "no coverage."**

**No allowlisted link confirmed despite real effort** — `gotquestions.org/Moses-seat.html` (WebFetch-
confirmed live, on-verse) and `gotquestions.org/leaven-of-the-Pharisees.html` (WebFetch-confirmed
live, on-verse) were each individually checked and **neither cross-references the other verse or
states the doctrine-vs-practice reconciliation as a response to the specific two-passage tension**
(same "on-verse but not on-tension" trap as id 407's rejected gotquestions candidates) —
`defendinginerrancy.com/bible-solutions/Matthew_23.2-3.php` 404s (guessed URL, normal/expected per
the id-407 precedent). Set `link: null` rather than stretching either gotquestions page. Dry-run
bake (`DRY_RUN=1 IDS=452 node .scripts/buildHarmonizationTables.js`) came back with **0 validator
violations** (same clean pattern as id 407, not the usual two pre-T9/T10 violations) and 771/771
`verifyExcerpts.py` + 34/34 `verifyVersePairs.py` PASS.

## Haley has a dedicated, exact-heading section on the empty-tomb order-of-events crux — and
## Ehrman's citation was already sitting in the row's own pre-existing `scholarship` field (id 479)
"When did the women discover that Jesus's body was missing?" (Matt 28:5-6/Mark 16:5-6 "angel
speaks first, then women learn the tomb is empty" vs Luke 24:2-4/John 20:1-2 "women discover the
tomb is empty first, then the angel(s) appear/Mary runs to Peter") — `data/json/batch_24.json`'s
pre-existing `scholarship` field for this id already cited **Ehrman, Bart D. *Jesus, Interrupted*
(HarperOne, 2009), pp. 47-60** as a source on the empty-tomb accounts, confirming (per the id-440
lesson) that the row's own prior-pass `scholarship` field can hand you an already-vetted named
skeptic before any WebSearch is needed; a follow-up WebSearch independently corroborated Ehrman
treats the empty-tomb narratives' differing order/detail as genuine, non-harmonizable
discrepancies (`bartehrman.com/contradictions-in-jesus-tomb-story/`,
`ehrmanblog.org/fuller-account-of-resurrection-discrepancies/`). Consensus was
`probable_contradiction` → `discrepancy_first` per the §7 rule.

Curl+Grep of the archive.org `examinationof00hale_djvu.txt` mirror (freshly curled to scratchpad,
~1.4MB) for `sepulchre` found a **direct, exact-heading hit**: "Historical Discrepancies," heading
**"Christ's resurrection, — certain narratives. Different account of it."** (pp. 327-330; Matt.
28:1-10/Mark 16:1-14 vs Luke 24:1-12/John 20:1-18 — i.e. this row's whole four-gospel span, not
just the narrower 4-verse citation), which gives a full sequenced harmony (quoting Robinson) that
resolves the exact order tension: the angel has already descended, rolled away the stone, and
sat on it *before* the women arrive; the women then enter, find the body gone, and are perplexed
(matching Luke's order); Mary Magdalene alone breaks off to fetch Peter/John (matching John);
"immediately two angels appear" to the remaining women (reconciling Matthew/Mark's angel-first
framing by placing the fullest angelic speech *after* the independent discovery, while still
having an angel physically present from the very start). Used as `pd_work` with pp. 327-330 cited.
**Lesson: for well-known, heavily-harmonized synoptic pericopes (here, the resurrection morning),
default to checking Haley's "Historical Discrepancies" chapter with the passage's own broad
chapter-range citation (`Matt. xxviii. 1-10`, etc.) rather than a narrow verse-range phrase — his
headings are often keyed to the full pericope span, not the row's specific 2-4 verse slice.**

Reconcile excerpt used **GILL** on Luke 24:2 (`GILL/42/24/2` — note: Gill's own `ref` field says
"Luke 24:2" even though the on-tension sentence is embedded mid-note under an internal "Luke 24:3"
sub-heading artifact of his block style; used the note's own `ref`/`note_ref` mechanically, per
the id-440-and-earlier convention of trusting the note object's own fields rather than
re-deriving verse_ref from prose content). Gill's harmonizing move: the women "entered in ...
being invited, encouraged, and led on by the angel that sat upon the stone" (an explicit
cross-reference back to Matthew 28:2's angel, already seated outside before the women arrive) —
i.e. Gill places an angel as already-present per Matthew's order even within his exposition of
Luke's "they entered... and found not the body" sequence, which is the identical mechanism Haley's
Robinson-summary harmony uses. Picked over MHC's Luke 24:1 block-anchor note (which explicitly
says "so the evangelists may be reconciled" but resolves the *number*-of-angels tension, not the
order-of-discovery-vs-angel tension this row centers on) and over Clarke's John 20:2 note ("This
was after the women had seen the angels ... Luk 24:4," which asserts a temporal claim but doesn't
explain *why* the orders differ) — when several notes are on-tension-adjacent, prefer the one that
supplies the actual resolving *mechanism* for the row's specific stated tension over one that
merely asserts a compatible sequence or resolves a neighboring but distinct discrepancy (same
principle as id 402's MHC-over-JFB pick above). No live allowlisted link named the tension
directly by title, but `gotquestions.org/resurrection-accounts.html` ("Can the various
resurrection accounts from the four Gospels be harmonized?") — WebFetch-confirmed live — presents
a full sequenced harmony (angel rolls the stone away, then the women arrive and find it empty)
that resolves the row's ordering tension in substance even though the page doesn't flag the
specific tension by name; cited with an honest `link.note` disclosing that.

## Haley has a dedicated, exact-heading hit on the resurrection-morning TIMING wording (distinct
## from id 479's ORDER-of-events crux) — and a new defendinginerrancy.com link for it (id 477)
"When did the women (or woman) arrive at the sepulchre?" (John 20:1 "yet dark" vs Matt 28:1 "as
it began to dawn" vs Mark 16:2 "at the rising of the sun") is `skepticsannotatedbible.com/contra/
dawn.html` (confirmed via `data/json/batch_24.json`'s `questionUrl`, page `<title>` verbatim-matches
the row's `question`). curl+Grep of `examinationof00hale_djvu.txt` for `sepulchre` (not a
bare-phrase grep on "rising of the sun"/"still dark", which is too generic and returns noise) found
a dedicated two-column heading at p. 426: **"Sepulchre visited at sunrise. At the early dawn. / Mark
xvi. 2. John xx. 1."** — Haley's own resolution offers two mechanisms: (1) Mary Magdalene alone
came first in darkness, the other women arrived later at sunrise (crediting Ebrard), or (2) the
loose popular sense of "rising of the sun" can mean early dawn itself (citing Ps 104:22's lions
imagery). This is a different Haley heading from the Robinson-harmony summary (pp. 328-329) already
used for id 479's order-of-discovery tension — **the same resurrection-morning gather file can
supply two distinct Haley headings for two distinct rows (timing-wording vs. event-order), so
don't assume one Haley hit exhausts a whole synoptic pericope's coverage.**

Reconcile excerpts (2, distinct mechanisms, no near-duplication): **GILL** on Mark 16:2
(`GILL/41/16/2`, the single-continuous-sentence "dark when they set out ... by that time that they
all got to the sepulchre, the sun was rising" — elapsed-travel-time reading) and **CLARKE** on Mark
16:2 (`CLARKE/41/16/2`, a lengthy embedded Lightfoot quote mapping all four evangelists' precise
phrases onto a single rabbinic four-part division of twilight, closing "the women came twice to the
sepulchre, as St. John teaches ... the reconciling them together is very easy" — a two-visits
reading). Both verbatim, no ellipsis needed inside CLARKE's excerpt (clean sentence-boundary start
right after Clarke's opening block-quote mark, clean sentence-boundary end right before his closing
one — dropping the bounding quote glyphs themselves is just excerpt-boundary selection, not a
character substitution). GILL's excerpt needed a **trailing elision** (`"...the sun was rising …"`)
to drop an unrelated Talmudic-walking-distance digression that continues the same run-on sentence.

**`gotquestions.org/resurrection-accounts.html` re-confirmed (via direct `curl` of the raw HTML,
not just WebFetch/WebSearch) to NOT discuss the dark/dawn/sunrise wording at all** — a `Grep` for
`dawn|dark|sunrise` across the saved page source came back zero hits, even though a `WebSearch`
summary had confidently claimed it discussed exactly this ("Matthew described the visit 'toward the
dawn'... John noted 'still dark'... Mark 'when the sun had risen'"). **This is the same WebSearch-
AI-synthesis trap as the id-348/420 cautions** (a search summary assembling a plausible answer from
scattered snippets across multiple pages, not the one page actually fetched) — always `curl`/WebFetch
the specific URL and `Grep` its raw text for the claimed keywords before citing it, especially when
a WebSearch summary sounds suspiciously complete. Found the real allowlisted link instead:
**`defendinginerrancy.com/bible-solutions/Mark_16.2.php`** ("Mark 16:2—Was Mary at the tomb before
sunrise or after?") — WebFetch-confirmed live, quotes both verses, offers the identical two-visit /
loose-idiom harmonizations as Haley. New confirmed page for the `defendinginerrancy.com/
bible-solutions/<Book>_<ch>.<vs>.php` pattern.

Named skeptic: **Steve Wells / Skeptic's Annotated Bible** (`2013`, same attribution format as id
439) — the SAB `dawn.html` page's own title is a verbatim match to the row's `question`, so this is
a clean, uncontested 439-model fit (`genuinely_disputed`/no — consensus here was
`probable_harmonization` → `reconcile_first`, so the discrepancy pole only needed to clear a low
parity bar of 1; reconcile pole's 2 verbatim excerpts comfortably cleared it).

## Ehrman's "seven last words" harmonizing-critique is a real, on-point 439-model skeptic for the
## "What were the last words of Jesus?" family — and Haley is genuinely SILENT on it (id 473)
"What were the last words of Jesus?" (Matt 27:46-50/Mark 15:34-37 cry of dereliction vs Luke
23:46 "Father, into thy hands..." vs John 19:30 "It is finished") — `WebSearch` confirmed **Bart
D. Ehrman, *Jesus, Interrupted* (HarperOne, 2009)**, uses this exact example (the traditional
"seven last words of the dying Jesus," assembled by harmonizing all four Gospels) as his
paradigm case against harmonization generally: "He doesn't say those seven things in any of the
gospels" and stringing them together "robs each author of their own integrity as an author" —
independently corroborated by an NPR interview transcript ("Jesus And The Hidden Contradictions
Of The Gospels") making the identical point. Consensus was `genuine_contradiction` →
`discrepancy_first` per the §7 rule; discrepancy pole = `named_skeptic` only (no gathered PD
voice concedes a real conflict — GILL/JFB/CLARKE/MHC/TYN/GNV are all harmonizing), so reconcile
capped to exactly 1 excerpt.

Reconcile excerpt used **GILL** on Matthew 27:49 (`GILL/40/27/49`) — the single cleanest
harmonization in the gathered notes, explicitly citing all three passages in one sentence and
resolving the tension via **sequence**: Matthew's "cried again" is read as a *second* utterance,
so what Christ "now delivered" was BOTH Luke 23:46's and John 19:30's sayings together, spoken
"with a loud voice." Picked over two other strong on-tension candidates on the same row — **JFB**
on John 19:29 (`JFB/43/19/29`, which sequences dereliction-cry → Luke's "words of tranquil
surrender" → "the final shout... recorded only by John") and **TYN** on Matthew 27:50
(`TYN/40/27/50`, "Each of the four Gospels highlights different aspects of Jesus' last
moments... This cry was Jesus' final prayer (see Luke 23:46)") — because Gill's single sentence
is the most self-contained, naming all three verses explicitly without needing surrounding
context trimmed. **Worth remembering JFB/43/19/29 and TYN/40/27/50 as backup/alternate excerpts
for this exact row family** if a second excerpt is ever permitted or Gill's is ever unusable.

**Haley is genuinely silent on this passage** — curl+grep of the archive.org
`examinationof00hale_djvu.txt` mirror for `sabach`, `forsaken`, `finished`, `Elias`, `thirst`,
`hyssop`, `vinegar`, `into thy hands`, `my spirit`, and the TOC/index itself (`last words`,
`dying words`, `sayings on the cross`) came back **zero on-topic hits** — the only "crucifixion"
index entry (p. 412) falls under the book's "Pertaining to Time" chapter (crucifixion *hour*,
third vs. sixth, a different discrepancy) not the sayings themselves. This is a genuine absence
(per the id-313/364 zero-hit pattern), not a search miss — a striking gap given how famous this
particular "contradiction" is today, reinforcing the id-313/364 observation that Haley's 1874
canon doesn't track every discrepancy that later became a popular skeptic talking point. Fell
back correctly to the contract's named alternative: **John Gill** (already the reconcile-pole
excerpt's author) as `pd_work`, keyed directly to Matthew 27:49. Live allowlisted link found and
WebFetch-confirmed on-topic: `carm.org/bible-difficulties/what-are-the-last-words-of-jesus/`
("What are the very last words of Jesus?") — argues the identical chronological-sequence
harmonization (dereliction cry → "It is finished" → "Father, into thy hands" as the literal
final utterance).

## CORRECTION: `relabel_flag`/`relabel_reason` on the **reconcile** sub-object is NOT the current
## convention — recent files (487, 488) omit it there, matching the contract's own worked example
The `relabel_flag`/`relabel_reason` claim earlier in this file ("universal corpus convention even
though the contract's abbreviated example only shows it on discrepancy — every sampled file...
sets it `false`/`null` on both poles") is **stale**: re-checked two of the most recently produced
files, id 487 and id 488, and both put `relabel_flag`/`relabel_reason` **only on `discrepancy`**,
exactly matching `TRANSFORM_CONTRACT.md`'s own worked example. Follow 487/488 (discrepancy-only)
going forward, not the earlier "put it on both poles" note — that reflected an older/mixed batch
of sampled files, not the current live convention.

## A mainstream critical/redaction-critical scholar (not just a popular skeptic like SAB) is a
## legitimate 439-model "named skeptic" when the row's own tension IS a redaction-critical claim
## (id 489, Legion's two pleas: Mark's "out of the country" vs Luke's "into the deep"/abyssos)
"Where did the devils ask not to go?" — `skepticsannotatedbible.com/contra/devils_go.html`
(confirmed via `data/json/batch_25.json`'s `questionUrl`, WebFetch title match) is the obvious
439-model default, but the row's own pre-existing DB `commentary`/`scholarship` fields (from an
earlier enrichment pass) already framed the tension as a **Synoptic redaction** claim — Luke's
`abyssos` is apocalyptic vocabulary (echoing 1 Enoch's abyss-as-fallen-angel-prison and Revelation
9/11/20) absent from Mark's plainer "out of the country," cited there to **Joseph Fitzmyer's**
Anchor Bible Luke commentary (I-IX, AB 28, Doubleday 1981, pp. 736-741). A `WebSearch` independently
corroborated the *general* claim (a synoptic-comparison source stated plainly that Mark's simpler
wording vs. Luke's distinctive apocalyptic term "reflect[s] Luke's engagement with Jewish
apocalyptic vocabulary," i.e., editorial reworking) without directly quoting Fitzmyer's page —
enough independent corroboration, combined with Fitzmyer's AB volume being a real, standard,
verse-by-verse-vs-Mark commentary, to use him as the `named_skeptic` rather than defaulting to SAB:
Fitzmyer's redaction-critical point (Luke is reworking Mark's source, not just supplying a second
facet of the same historical utterance) IS the discrepancy pole's substance more precisely than
SAB's flat Yes/No framing. **Lesson: when a row's own pre-existing `scholarship` field already
names a mainstream critical scholar making a claim that is independently corroborable (even if not
word-for-word verified), and that claim is sharper/more specific than the popular-skeptic default,
prefer it** — same principle as id 440's Tyson pick, extended to a case where full-text
verification of the specific citation wasn't possible, only corroboration of the general claim.

Consensus was `apparent_only` → `reconcile_first` per the §7 rule. Reconcile pole used **two**
distinct voices that both independently make the identical harmonizing move (reading Mark's "out
of the country" and Luke's "into the deep" as two facets of one desire — to stay free rather than
be imprisoned): **GILL** on Luke 8:30 (`GILL/42/8/30`, "they desired... they might not be ordered
thither, or remanded to their former prison... but that they might be suffered to continue in that
country") and **MHC** on the Mark 5:1 anchor block (`MHC/41/5/1`, block-anchored — the on-tension
sentence is deep inside part "VI. The request of this legion..."; note MHC's own `ref` field is
"Mark 5:1", not the in-prose "Mar 5:10" the sentence actually discusses — use the note object's own
`ref`/`note_ref` for `verse_ref`, not a verse number mentioned inside the prose, per the
id-479 convention). Two off-tension notes on the same row (TYN and CLARKE on Luke 8:31, both just
explaining what "the deep"/abyss meant in Second Temple demonology, with no cross-reference back to
Mark's wording) were correctly excluded — background/etymology notes on one side of a two-sided
tension don't count as on-tension per charter rule 3, even when topically adjacent.

Haley checked and genuinely silent (curl+grep of `examinationofall00hale_djvu.txt` for `Legion`,
`Gadarene`/`Gerasene`, `out of the country`, `the deep`, `bottomless pit` — the only two hits were
unrelated: a Gadarenes/Gergesenes place-name aside and two unrelated "deep" occurrences elsewhere in
the book). Fell back to **Gill** (already the reconcile-pole excerpt author) as `pd_work`, per the
task's own explicit "prefer a harmonizing commentator already surfaced on the row" instruction.
**No allowlisted link found despite real effort**: `gotquestions.org/my-name-is-Legion.html` and
`gotquestions.org/what-is-the-abyss.html` were both individually WebFetched and confirmed to NOT
compare Mark's and Luke's wording (same "on-topic domain, off-tension page" trap as id 407/452);
`defendinginerrancy.com/bible-solutions/Mark_5.10.php` 404s. `link: null` with an honest note.
Dry-run bake (`DRY_RUN=1 IDS=489 node .scripts/buildHarmonizationTables.js`) came back with **1**
pre-T9/T10 violation (`note_present` only — no `parity_count` violation this time, since 2 reconcile
quotes already clear the discrepancy pole's connective-only count of 1) and 810/810 `verifyExcerpts.py`
+ 34/34 `verifyVersePairs.py` PASS.

## CAUTION: bartehrman.com is a multi-author blog too — guest contributors, not just Ehrman
## himself, publish there (id 499, extends the ehrmanblog.org/forum caution)
`bartehrman.com/contradictions-in-jesus-tomb-story/` ("Guards, Visitors, & Angels: Does the Story
of Jesus' Tomb Contain Contradictions?") reads exactly like an Ehrman piece and is hosted on his
domain, but `WebFetch` of the byline showed it is authored by **Joshua Schachterle, Ph.D**, a
staff/guest writer — NOT Ehrman's own words. Correctly did not attribute it to Ehrman by name.
**Lesson: the domain alone (`bartehrman.com` or `ehrmanblog.org`) is not proof of authorship —
always check the actual byline before quoting/naming Ehrman**, same principle as the forum-thread
caution above, now confirmed to apply to bartehrman.com's regular articles too, not just its forum.

## Bart Ehrman's own `Jesus, Interrupted` (2009, p.49, "A World of Contradictions" chapter) is the
## right named skeptic for the empty-tomb messenger's inside/outside location (id 499)
"Were the men or angels inside or outside the tomb when the women arrived?" (Matt 28:2 angel
outside, seated on the rolled stone vs Mark 16:5/Luke 24:3-4/John 20:11-12 messenger(s) inside) —
curled the archive.org full-text mirror of *Jesus, Interrupted* into scratch and `Grep`-ed for
"two men"/"young man" rather than "inside"/"outside" (a bare positional-word grep is unreliable;
search on the concrete nouns/verse-cites instead). Found the exact passage (p.49): "Had the stone
already been rolled away from the tomb (as in Mark 16:4) or was it rolled away by an angel while
the women were there (Matthew 28:2)? Whom or what did they see there? An angel (Matthew 28:5)? A
young man (Mark 16:5)? Two men (Luke 24:4)?" — the identical enumeration-of-disagreements passage
already used for id 496 (women's names/count at the tomb), confirming this is one continuous
several-page catalogue in the book and a reusable source for the *whole* empty-tomb-witness
contradiction cluster (ids 496, 499, and likely other neighboring ids in the same gather range).
Ehrman doesn't use the words "inside"/"outside" here, so the discrepancy connective was phrased to
state the verse-level fact (messenger outside on the stone in Matthew vs inside in Mark/Luke) that
Ehrman's own cited verses support, not to put an "inside vs outside" framing in his mouth verbatim.

Reconcile excerpt: **MHC** on Luke 24:1 (`MHC/42/24/1`) — its resurrection-narrative summary states
plainly "They first saw one angel without the sepulchre, who presently went in, and sat with
another angel in the sepulchre, one at the head and the other at the feet... so the evangelists may
be reconciled," an explicit, self-labeled harmonization sentence buried inside a long block note
(no `anchor: true` flag on this particular note despite its length — don't rely solely on the
`anchor` field to flag "long block, on-tension sentence buried deep," eyeball long notes too).
GILL's Matthew 28:2 note makes the same sequential-appearance harmonization at greater length and
was a viable alternate; MHC's sentence was picked as the single parity-capped excerpt for being
shorter and more self-contained ("so the evangelists may be reconciled" makes the harmonizing intent
explicit in-line, unlike GILL's, which requires reading surrounding sentences to see the same move).

**Haley has a direct, on-point hit** — curl+Grep of `haley.txt` for `sepulchre` found his
"Historical Discrepancies" chapter (pp. 328-330) reproducing Edward Robinson's harmony of the whole
resurrection-morning narrative (orig. *Bibliotheca Sacra*, Feb. 1845, pp. 187-188) approvingly,
which sequences the **same** outside-then-inside movement as MHC: angel descends, rolls the stone,
"sat upon it" (outside) — then, once the women are in the tomb, "immediately two angels appear" —
then later Mary Magdalene "looking in she saw two angels sitting" (inside). Used as `pd_work` citing
pp. 328-330 and the Robinson attribution. Link: `carm.org/bible-difficulties/how-many-men-or-angels-
appeared-at-the-tomb/` — WebFetch-confirmed it states verbatim "there was one angel outside and two
on the inside of the tomb," a precise, on-topic match (better than gotquestions.org's
`resurrection-accounts.html`, already used at id 496, which WebFetch confirmed addresses the
angel-count question but NOT the inside/outside location question — checked and correctly rejected
before finding the carm.org page).

## Haley has zero coverage of the Judas-Satan-timing crux; a pre-existing DB `scholarship` field's
## named critical scholars (Fitzmyer, Brown) couldn't be verified specifically enough to use (id 511)
"When did Satan enter Judas?" (Luke 22:3, before the Passover, vs John 13:27, during the Last
Supper after the sop) — `data/json/batch_26.json`'s `questionUrl` gave the exact SAB slug
(`contra/satan_entered.html`) directly; `WebFetch` confirmed the live page frames it as a flat
"before the last supper" vs "after the last supper" two-column contradiction, so **Steve Wells /
Skeptic's Annotated Bible** is the correct 439-model named skeptic (same attribution format as
prior precedents). The same batch record's pre-existing `scholarship` field cited Fitzmyer's
Anchor Bible Luke and Brown's *Death of the Messiah* as reading Luke's and John's satanic-entry
notices as independently-developed traditions — a **stronger, more specific** critical-scholarly
claim than SAB's flat framing, per the id-440 "check the row's own `scholarship` field before
hunting a skeptic from scratch" lesson — but two rounds of `WebSearch` could **not** turn up a
verifiable quote or citable page number for that specific "independent traditions, not one
event" claim from either scholar (only generic book-jacket-level results came back). **Lesson:
a prior-pass DB `scholarship` field is a good lead but is not itself verification** — when its
specific claim can't be independently confirmed via search, fall back to the safer, already
-verified SAB default rather than naming a scholar for a claim you can't check firsthand.

Reconcile excerpt: **CLARKE** on John 13:27 (`CLARKE/43/13/27`) — "He had entered into him
before, and now he enters again..." — the cleanest, fully self-contained single-note statement
of the "two entries" harmonization (also independently used by JFB and MHC's block-anchored note
on this same row, all three converging on the identical mechanism); picked over JFB's much longer
"awful stages" note (`JFB/42/22/3`, would need multi-clause ellipsis-joining) and GILL's distinct
third harmonization theory (`GILL/42/22/3`: the John 13:27 "sop" wasn't the Passover sop at all
but the earlier Bethany-supper sop, i.e. same single event, not two entries) — GILL's is worth
remembering as a backup/alternate excerpt for this row family, since it's an equally strong,
single-sentence, ellipsis-free candidate representing a different resolution strategy than the
"two entries" move Clarke/JFB/MHC all share. Dropped the note's leading verse-lemma ("Satan
entered into him -") before the excerpt proper, consistent with treating such lemma-dashes as
non-substantive headers rather than part of the on-tension sentence.

**Haley's PD text has zero coverage** — curl+Grep of the scratchpad-cached `haley.txt` for
`Satan entered`, `entered into (him|Judas)`, `Judas` (all hits), and `Satan` (all hits) found
only an unrelated Judas's-manner-of-death entry and generic Job/Ananias/Saul Satan-references —
no treatment of this specific timing pairing at all. Fell back correctly to Clarke itself
(already the reconcile author) as `pd_work`, per the id-364/421/440 fallback pattern. No
allowlisted `link` found: `gotquestions.org/Satan-entered-into-him.html` exists and is on-verse
(John 13:27) but a WebFetch confirmed it does **not** name-check Luke 22:3 or address the
before/after-the-meal timing tension at all (it only frames John 13:27 as the final stage of a
suggestion-to-possession escalation) — correctly treated as off-topic rather than stretched, per
the id-407 caution; no `carm.org`/`defendinginerrancy.com` page exists for this pairing either
(`defendinginerrancy.com/bible-solutions/Luke_22.3.php` and `John_13.27.php` both 404). `link:
null`. Dry-run bake (`DRY_RUN=1 IDS=511`) gave the standard two pre-T9/T10 violations
(`note_present`, `parity_count`) and 823/823 `verifyExcerpts.py` PASS — normal/expected.

## Haley can hit HALF a two-passage tension verbatim under an unrelated topical heading — don't
## default him to `pd_work` when he's silent on the other passage; prefer the row's own commentator
## (id 508)
"Who are wiser, the children of this world or the children of light?" (Luke 16:8's steward-parable
"children of this world are... wiser than the children of light" vs James 3:15-17's earthly/devilish
vs heavenly wisdom) is `skepticsannotatedbible.com/contra/wiser.html` (confirmed via `data/json/
batch_26.json`'s `questionUrl`, verbatim page-title match, per the id-348/363/401 tip — check it
first). Consensus `apparent_only` → `lean: reconcile_first`. Haley's djvu (curl+grep of the cached
scratchpad `haley_full.txt` — **check the scratchpad for an existing `haley*.txt` before re-curling**,
see id-407) has a "Wisdom" heading (Ethical Discrepancies chapter, ~p. 254) that quotes **James
3:15 against James 3:17 verbatim**, resolved with a clean "wisdom has three senses — worldly craft,
mere learning, enlightened piety" argument — but the heading's primary pairing is Eccl 2:15-18/6:8
vs Eccl 2:13 + Prov 3:13,15, and **Luke 16:8 is never cited anywhere in the book** (grepped `Luke
xvi\.` broadly — only unrelated Luke 16:19-31 Dives-and-Lazarus hits). This is a **new, distinct**
partial-coverage pattern from id 363's "adjacent doctrinal heading, wrong verses entirely": here
Haley genuinely quotes **one full side** (James) of the row's exact two-passage pair verbatim, with
the exact resolving mechanism the row needs, but is silent on the other side (Luke) by name.
**Judgment call: used JFB (already the reconcile excerpt's Luke 16:8 author, and PD) as the primary
`pd_work` instead of Haley**, since the contract's bar is treating "this specific contradiction"
(both sides), and JFB is keyed to the actually-contested verse (Luke's "wiser") — but disclosed
Haley's real partial James-side coverage inside the `pd_work.note` rather than silently omitting it.
Reconcile pole used **three distinct voices** (JFB/Luke 16:8: "The greater wisdom... is none of it
for God and eternity... but all for the purposes of their own grovelling and fleeting generation" —
a complete sentence, no trimming needed; MHC/Luke 16:1: "Not that the children of this world are
truly wise; it is only in their generation" from deep inside a long non-anchored block note; GNV/
Luke 16:8, needing a **leading ellipsis** for a mid-sentence start: "…Christ meaneth by this parable
to teach us, that worldly men are more heady in the affairs of this world, than the children of God
are careful for everlasting life. Men that are given to this present life... St. Paul calls those
spiritual, and the other carnal.") — a `reconcile_first` row can legitimately use all 3 of the
"1-3 strongest, distinct voices" allowance without needing to trim, since parity only requires
reconcile-count ≥ discrepancy-count (here 3 ≥ 1), not a cap. Named skeptic: **Steve Wells / SAB**
(`contra/wiser.html`, WebFetch-confirmed the page's own framing: Luke's parable "commends worldly
shrewdness" vs James which "directly contradicts this... urging believers to reject 'earthly,
sensual, devilish' wisdom"). No allowlisted `link` found: `gotquestions.org/parable-unjust-
steward.html` WebFetch-confirmed discusses Luke 16:8 but never mentions James 3:15-17 or this
tension (same "on-domain, off-tension page" trap as id 407/452/489); `defendinginerrancy.com/
bible-solutions/Luke_16.8.php` 404s; no carm.org hit — `link: null` with an honest note. Dry-run
bake (`DRY_RUN=1 IDS=508`) came back with **1** violation (`note_present` only — no `parity_count`
violation, matching the id-489 pattern where the lean pole's excerpt count already clears the other
pole without needing the cap) and 826/826 `verifyExcerpts.py` + 34/34 `verifyVersePairs.py` PASS.
Also reconfirms (contra an earlier, now-superseded memory claim) that the **live/current** `row`
schema does **not** put `relabel_flag`/`relabel_reason` on the `reconcile` sub-object — only on
`discrepancy` — per the contract's own worked example and two independently-sampled recent files
(489, 500); only set them on `discrepancy`.

## Raymond E. Brown ("editor who doesn't edit") is a strong, independently-corroborated named
## skeptic for Johannine composite/seam claims — and Haley is genuinely silent (id 525)
"Did any of the apostles ask Jesus where he was going?" (John 13:36 Peter asks / John 14:5 Thomas
asks vs. John 16:5 Jesus says "none of you asks me, where are you going?") — `data/json/
batch_27.json`'s `questionUrl` gave the SAB slug (`contra/ask.html`) directly, but the same
record's pre-existing `commentary`/`scholarship` fields (from an earlier enrichment pass) already
named **Raymond E. Brown** (*The Gospel According to John XIII-XXI*, Anchor Bible 29A, Doubleday
1970, pp. 581-604, 710) and Bultmann as the critical-scholarship view that this is a genuine seam
from John's Farewell Discourse being a composite of originally separate source material (16:5 was
written without 13:36/14:5 in view). A `WebSearch` independently corroborated the specific Brown
claim with a striking direct phrase — Brown treats this as evidence of "an editor who doesn't
edit," i.e. an editor with such reverence for his sources that he stitched them together without
smoothing over the inconsistency — a sharper, more citable formulation than the flat SAB Yes/No
framing, so Brown (not Wells/SAB) was used as the `named_skeptic`, per the id-440/452/489 "check
the row's own pre-existing `scholarship` field first" pattern. Consensus was `genuine_contradiction`
→ `discrepancy_first` per the §7 rule; discrepancy pole = `named_skeptic` only (no gathered PD
voice concedes; GILL/JFB/CLARKE/MHC/TYN/GNV are all harmonizing), so reconcile capped to 1.

Reconcile excerpt used **JFB** on John 16:5 (`JFB/43/16/5`) over three other strong on-tension
candidates gathered on the same row — GILL's long qualitative-distinction note (~150 words,
would need heavy trimming), CLARKE's temporal "but now, at the time..." note (which contains what
reads like a genuine period-text/OCR typo, "Joh 13:3" for "Joh 13:36" — verbatim quoting it would
reproduce a confusing reference error, so avoided), and MHC's version buried deep inside a large
block-anchored note — because JFB's is the only one that is a single, short, already-clean
sentence naming **both** antecedent verses explicitly with no ellipsis needed: "They had done so
in a sort (Joh 13:36; Joh 14:5); but He wished more intelligent and eager inquiry on the
subject." Dropped only the note's own verse-lemma prefix ("and none of you asketh me, Whither
goest thou?--"), consistent with the id-407/452 lemma-prefix-drop convention (not treated as a
truncation needing an ellipsis marker).

**Haley is genuinely silent** — curl+Grep of the scratchpad-cached `haley_full.txt` for `whither
goest`, `goest thou`, `none of you`, `asketh`, `xvi. 5`, `xiii. 36`, `xiv. 5` all came back **zero
hits** (only two irrelevant `asketh`/`goest` hits elsewhere in the book, unrelated to this
passage) — a genuine absence (per the id-313/364/473 zero-hit pattern), not a search miss; this
famous NT-internal "gotcha" joins id 473 (last words of Jesus) as another well-known popular
contradiction Haley's 1874 canon simply doesn't address. Fell back correctly to JFB itself
(already the reconcile-pole author) as `pd_work`. **No allowlisted `link` found despite real
effort**: `defendinginerrancy.com/bible-solutions/John_16.5.php` 404s; `gotquestions.org/
where-are-you-going.html` 404s; WebSearch rounds for a gotquestions.org or carm.org page on this
specific tension only surfaced off-allowlist pages (evidenceunseen.com, walkingwithgiants.net,
biblechristiansociety.com) with no allowlisted match; `link: null` with an honest note. Dry-run
bake (`DRY_RUN=1 IDS=525`) gave the standard two pre-T9/T10 violations (`note_present`,
`parity_count`) and 849/849 `verifyExcerpts.py` + 34/34 `verifyVersePairs.py` PASS —
normal/expected.

## A "soft"/dry completeness-claim tension (Luke's "all" vs John's inexhaustibility hyperbole) is
## genuinely Haley-silent, and the strongest reconcile excerpt is on the OPPOSITE verse from the
## one usually assumed (id 529)
"Did Luke include everything that Jesus did?" (Acts 1:1-2 "all that Jesus began both to do and
teach" vs John 21:25 "the world itself could not contain the books that should be written") is
`skepticsannotatedbible.com/contra/everything.html` (confirmed via `data/json/batch_27.json`'s
`questionUrl`, WebFetch page-title match: "Does the gospel of Luke contain everything that Jesus
did?"). Consensus `apparent_only` → `lean: reconcile_first` per the §7 rule. Intuition might
reach first for a note on John 21:25 itself (the "hyperbole" verse — GILL/JFB/CLARKE all have long
notes there defending the hyperbolical reading of "world could not contain the books"), but the
**single most on-tension excerpt is actually MHC's note on Acts 1:1** — it explicitly
cross-references John's own language ("not all the particulars - the world could not have
contained them") while glossing Luke's "all" as "the heads, samples of all," i.e. it is the one
note that argues *both* sides of the pair in one sentence, unlike the John-21:25 notes (which only
defend John's own hyperbole in isolation, without engaging Acts 1:1's "all" claim at all — checked
JFB/CLARKE/GILL/TYN's John 21:25 notes specifically for this and none cross-reference Acts 1:1).
**Lesson: for a two-verse completeness/scope tension, check the notes on BOTH cited verses for
which one actually names the *other* passage's language — the cross-referencing note is usually
the strongest excerpt even if it's the "less famous" of the two verses.** Second reconcile voice:
GILL on Acts 1:2 ("his former treatise took in the main and principal things Jesus did and taught"
— ends the excerpt at the source's own colon, a legitimate non-fabricated truncation point since
the colon is the source's genuine internal punctuation, not an added period).

Haley's PD text (curl+Grep of the scratchpad-cached `haley_full.txt`/`haley_djvu.txt`, ~39k lines)
has **zero hits** for "former treatise," "Theophilus," "world itself," "could not contain," "many
other things," "Acts i. 1," and "John xxi." — a genuine, confirmed absence (not a search miss),
consistent with the id-313/364/473/525 pattern that dry completeness/scope-claim minutiae (as
opposed to famous doctrinal or synoptic-wording cruxes) are under-served by the classic 1874 PD
harmonizer canon even when, as here, the tension is NT-internal and fairly well-known among
apologetics sites. Fell back correctly to MHC (already the reconcile-pole excerpt's author) as
`pd_work`. No skeptical/critical scholarship beyond the SAB page itself was found via WebSearch
(only apologetics blogs — e.g. "The Domain for Truth" — and a Quora thread engage this specific
pairing), so **Steve Wells / Skeptic's Annotated Bible is the correct 439-model named skeptic**
here too — this is a "thin" pairing in the same sense as id 364/401 (no heavyweight critical
scholar has substantively engaged it), not a case needing Ehrman/Strauss-tier sourcing. No
allowlisted `link` found despite real effort: `defendinginerrancy.com/bible-solutions/Acts_1.1.php`
and `.../John_21.25.php` both 404, and multiple `gotquestions.org`/`carm.org` WebSearches turned up
no dedicated page on this exact pairing; `link: null`. Dry-run bake (`DRY_RUN=1 IDS=529`) gave
**1** violation (`note_present` only — no `parity_count` violation, matching the id-489/508 pattern
where 2 reconcile excerpts already clear the discrepancy pole's connective-only count of 1) and
852/852 `verifyExcerpts.py` + 34/34 `verifyVersePairs.py` PASS.

## Haley's "Historical Discrepancies" chapter has an exact-heading, exact-numbers hit for the
## Abraham's-age-at-Haran-departure crux — and the SAME heading cites the row's own KD-style
## alternative solution by name (id 534)
"How old was Abraham when he left Haran?" (Gen 12:4 "75" vs Gen 11:26 "Terah was 70 when he
begat Abram" + Gen 11:32 "Terah died at 205" + Acts 7:2-4 "left only after Terah died" → implied
135) — `data/json/batch_27.json`'s `questionUrl` gave the exact SAB slug directly
(`contra/oldabe.html`; check `questionUrl` before guessing, per the id-348/363/etc. tip).
`WebFetch` confirmed the live page frames it as a flat "75" vs "at least 135" contradiction —
Steve Wells/SAB used as the 439-model named skeptic. A scratchpad-cached `haley.djvu.txt`
(`grep -n -i Terah`) found, in the "Historical Discrepancies" chapter (p. 393), a dedicated
two-line heading **"Abraham's age at migration 75 years. / Apparently 135 years."** citing
**Gen. xii. 4** against **Gen. xi. 26, 32; Acts vii. 4** — an exact match to this row's own refs,
numbers included. Haley gives BOTH harmonizations in sequence: (1) the standard "named first for
dignity, not birth order, actually born when Terah was 130" solution (same move Clarke/Gill/MHC
all make independently in the gathered notes), AND (2) a second, more concessive alternative —
"Some Jewish interpreters, however, think that Abraham actually left Haran sixty years before his
father's death. On this theory, Stephen... simply followed the then commonly received, though
inaccurate, chronology. So Ewald, Keil, Kurtz, Lange, Murphy, and others" — which is the *identical*
move the row's own `KD` (Keil & Delitzsch) note independently makes ("When Stephen... placed the
removal of Abram... after the death of his father, he merely inferred this from the fact... taking
the order of the narrative as the order of events"). Confirms KD's note isn't an isolated harmonizing
quirk but a named, citable minority position within the standard PD harmonization literature —
worth remembering that **Haley explicitly attributes solution #2 to "Keil"** (i.e. K&D) by name,
so any row where a gathered KD note argues "Stephen just followed narrative order, not literal
chronology" can cite Haley's same heading as corroboration. Reconcile excerpt used **Clarke**
(`CLARKE/1/11/26`) over Gill/MHC on the same point — Clarke's sentence is the cleanest
self-contained syllogism ("Terah died two hundred and five years old... then Abram departed from
Haran when seventy-five years old... therefore Abram was born, not when his father Terah was
seventy, but when he was one hundred and thirty") and it independently uses Haley's own "named
first for dignity" analogy (Moses before Aaron / Shem before his elder brothers), reinforcing it's
the "textbook" version of this harmonization. Link: `defendinginerrancy.com/bible-solutions/
Genesis_11.32.php` ("Genesis 11:32—Was Abraham 75 years old when he left Haran, or was he 135
years old?") — WebFetch-confirmed live, exact-title match, same "listed by prominence not birth
order" argument. Note: the `DRY_RUN=1 IDS=534 node .scripts/buildHarmonizationTables.js` sanity
bake was **not run** this pass — the task's explicit "do NOT read or write any .db file" boundary
blocked it (the auto-mode classifier denies the Bash call outright since the baker script opens
`contradictions.db` even under `DRY_RUN=1`); relied on a plain `node -e require(...)` JSON-parse
check instead. **If a future TRANSFORM-only task explicitly forbids touching `.db` files, skip the
dry-run bake rather than trying to work around the sandbox denial** — JSON-parse + manual schema
review is the fallback verification.

## Second Raymond Brown hit on the same Farewell-Discourse family, PLUS Haley scores an exact
## two-column heading, PLUS an upstream note-label mismatch worth flagging honestly (id 526)
"Did Jesus tell his disciples everything?" (John 15:15 "all things that I have heard of my
Father I have made known unto you" vs John 16:12 "I have yet many things to say unto you, but ye
cannot bear them now" — same discourse, one chapter apart) is the immediate neighbor of id 525's
"where are you going" seam and drew the **same** named skeptic: `data/json/batch_27.json`'s
pre-existing `commentary`/`scholarship` fields (an earlier enrichment pass) already named
**Raymond E. Brown** (*The Gospel According to John XIII-XXI*, Anchor Bible 29A, Doubleday 1970,
pp. 681-682, 706-716) and **C. K. Barrett** (*The Gospel According to St. John*, 2nd ed.,
Westminster, 1978, pp. 477-478, 488-489) as the critical view that chs 15-17 are a secondary
discourse layer, with 16:12 legitimating the community's later Spirit-mediated teaching "at the
cost of" contradicting 15:15's comprehensive claim — used Brown alone as `named_skeptic`
(Barrett omitted from the `skeptic` object to keep one attributed voice, per schema) since the
DB's own commentary text states the critical argument in citable form. Consensus was
`probable_contradiction` → `discrepancy_first` per the §7 rule; no gathered PD note concedes (all
six voices — GILL/JFB/CLARKE/MHC/TYN/GNV — harmonize), so discrepancy = `named_skeptic` only,
reconcile capped to 1.

Reconcile excerpt used **GILL**, but with an **upstream scrape-artifact complication**: the
gather file's note tagged `ref: "John 16:10"` / `note_ref: "GILL/43/16/10"` actually contains
Gill's exposition of **v. 12** (the commentary-splitting in the source ran one verse behind its
own label — v.10's note holds v.11 content, v.11's note holds v.12/13 content, etc.), recognizable
because the v.12 paragraph is preceded by four repeated junk headers (`"John 16:12\njoh
16:12\njoh 16:12\njoh 16:12"`) then begins a fresh, complete sentence ("I have yet many things to
say unto you,....") that explicitly cross-cites `Joh 15:15` by verse number and states the
resolving distinction (core doctrine already disclosed vs. later redemptive-historical specifics
— Gentile mission, end of the Mosaic economy — reserved for after the resurrection). **Handling
decision**: kept `full_note_ref` exactly as given (`GILL/43/16/10`, required for traceability/
audit against the source row) but set `verse_ref` to `"John 16:12"` (what the quote actually
discusses) rather than mechanically copying the note's own mislabeled `ref` field, and logged the
reasoning in `on_tension_rationale` (private) so the auditor isn't puzzled by the mismatch. The
excerpt itself required no ellipsis at either end — trimming the four junk-header repeats before a
clean sentence-initial capital is not a mid-sentence truncation, and the note's own text ends on a
natural period.

**Haley scores an exact, on-passage hit** — curl+Grep of the scratchpad-cached `haley.txt` for
`cannot bear them|many things to say|made known unto you` found a **dedicated two-column heading**
in the "Historical Discrepancies" chapter (~p. 330), **"Christ's revelation of truth, complete. /
Much kept back by him,"** quoting John 15:15 and John 16:12 verbatim side by side, then arguing:
"the first text mean[s], 'All things that I have heard from my Father, which were designed for
you at present, I have made known to you'... Everything which the Father had, up to that time,
wished him to make known, he had made known to them," with the "many things" of 16:12 being
post-resurrection and Spirit-taught revelation (also noting Alford's proleptic reading and
Ebrard's "that day were parabolical" gloss for a *different* adjacent pair on the same page). Used
as `deeper_learning.defense.pd_work` over Gill (even though Gill is already the reconcile-excerpt
author) because Haley is the contract's canonical default and his coverage here is a confirmed,
exact, passage-specific hit, not a fallback. `link`: `gotquestions.org/I-have-called-you-
friends.html` ("Why did Jesus say, 'I have called you friends' in John 15:15?") —
WebFetch-confirmed it explicitly reconciles both verses in one paragraph ("Christians receive
unrestricted access to the truth, although we are limited by our ability to comprehend it all
(John 16:12)"). Dry-run bake (`DRY_RUN=1 IDS=526`) gave the standard two pre-T9/T10 violations
(`note_present`, `parity_count`) and 852/852 `verifyExcerpts.py` + 34/34 `verifyVersePairs.py`
PASS — normal/expected. **Lesson: when a Farewell-Discourse-family row (John 13-17) has a
pre-existing DB `scholarship` field, check it first — Raymond Brown's composite-discourse thesis
recurs across multiple rows in this chapter cluster (ids 525, 526 confirmed so far), so it is
worth treating as a standing candidate for any other John 13-17 internal-tension row in this
corpus, alongside checking Haley by proper-noun/phrase grep rather than assuming thin coverage.**

## Gerd Lüdemann is a real, verifiable named skeptic for Acts-vs-Paul historicity tensions
## (Apostolic Decree), and Haley's "Idol-meats" heading is a false-positive-looking near-miss
## (id 536, "Is it OK to eat meat sacrificed to other gods?")
1 Cor 8:4-8 (idol meat is theologically neutral, governed only by love for a weaker brother) vs
Acts 15:28-29 (the Jerusalem Council's decree that Gentile believers must abstain from idol meat
as one of a handful of binding "necessary things"). Consensus `genuine_contradiction` →
`discrepancy_first`; all six gathered voices (GILL/JFB/CLARKE/MHC/TYN/GNV) harmonize, so no
verbatim discrepancy excerpt existed and `named_skeptic` was required. `data/json/batch_27.json`'s
pre-existing `scholarship` field (from an earlier enrichment pass, keyed under a since-corrected
mis-titled `question` — was "Is circumcision required?" then, now correctly "Is it OK to eat meat
sacrificed to other gods?" in the gather file, confirming the DB-level mismatch flagged back then
was fixed upstream) already named **Gerd Lüdemann, *The Acts of the Apostles: What Really
Happened in the Earliest Days of the Church* (Prometheus, 2005), pp. 173-185 ("on Lukan
composition of the Apostolic Decree")** — WebSearch-confirmed the book is real (also published
1989 as *Early Christianity according to the Traditions in Acts: A Commentary*, trans. John
Bowden) and consistent with Lüdemann's well-documented general thesis that Acts blends history and
theological legend; used as the discrepancy pole's `named_skeptic`, with the connective stating
his real, general position (Luke's decree is a later literary construction; Paul's own letters,
addressing idol meat directly in 1 Cor 8-10, never mention any such decree) rather than an
unverified page-specific claim. **Bart Ehrman's "five examples" of Acts-vs-Paul contradictions in
*Jesus, Interrupted* do NOT include this one** (WebFetch-checked a hostile review cataloguing all
five — none is the idol-meat/decree tension) — don't assume Ehrman covers every Acts-vs-Paul seam
just because he's the corpus's default Acts critic; check what his actual five examples are before
citing him for a sixth.

**Haley's only relevant-looking heading is a near-miss, not a hit** — curl+Grep of
`examinationof00hale_djvu.txt` for `idol` found an "Idol-meats. / Non-essential. / To be avoided."
heading (p. 249-250, index-confirmed: "Idol-meats non-essential, yet to be shunned, 249") that
reads at first like an exact match, but on inspection it resolves a **purely intra-Corinthians**
tension (1 Cor 8:8/10:19 "meat is nothing" vs 1 Cor 10:20-21 "ye cannot be partakers of the Lord's
table and of devils' ") via the Andrew-Fuller "inexpedient because it leads others into actual
idolatry" argument — it never mentions Acts 15 or the Jerusalem decree at all. Grepping `burden`
found Haley's only Acts 15:28 citation is a bare proof-text in an unrelated "Holy Ghost is a
Person" doctrinal list (not this contradiction). Grepping `council`/`Judaizing`/`abstain` also
came back with nothing on-topic. **Lesson: a plausible-sounding index/heading match on the right
keyword (here "idol") is not sufficient — read the actual page content before treating it as
Haley coverage; a topically-adjacent heading in the same general subject area can still be
answering a completely different question.** Fell back correctly to the contract's named
alternative: **JFB** (already the row's reconcile-excerpt author, `JFB/46/8/7`) as `pd_work`,
since its note explicitly treats this exact Acts-15/1-Cor-8 pairing in one self-contained sentence
("the Jerusalem decree against partaking of such meats (though indifferent in themselves) was
passed... on the ground of Christian expediency, not to cause a stumbling-block") — a cleaner,
more self-contained single-sentence quote than the alternative candidate on the same row
(MHC's block-anchored Acts 15:22 note, `MHC/44/15/22`, `anchor: true`, which also states the
"decree lapsed once its Jewish-sensibility rationale lapsed" argument but attributes it ambiguously
to a paraphrase of "Dr. Hammond" mid-block, making clean/attributable excerpting riskier).
`gotquestions.org/Paul-Jerusalem-Council-food-sacrificed-idols.html` ("Did Paul contradict the
Jerusalem Council by telling people that they can eat food sacrificed to idols?") is a live,
WebFetch-confirmed, exactly-on-topic allowlisted `link`. Parity: reconcile capped to 1 excerpt
(discrepancy pole = `named_skeptic` only, count 1).

## Haley confirmed silent on the whole "engage vs shun outsiders" pastoral/Johannine cluster;
## defendinginerrancy.com has a direct hit even though it argues from a different verse pair (id 556)
"Should believers discuss their faith with non-believers?" (1 Pet 3:15/Col 4:5-6 "give an
answer"/"speech with grace" toward outsiders vs 2 John 1:10 "receive him not"/1 Tim 6:20/2 Tim
2:16 "shun profane and vain babblings") is `reconcile_first` (`probable_harmonization`).
`data/json/batch_28.json`'s `questionUrl` gave the exact slug (`contra/discuss.html`) directly;
`WebFetch` confirmed SAB's own "No"-side caption is literally **"Shun the profane, vain
babblings of nonbelievers"** — i.e. SAB's own page-author wording reads the shun-texts as
addressed to nonbelievers generally, which is the exact point the harmonizing commentators
dispute (they read 2 John's target as itinerant heretical *teachers* seeking a platform/house-
church legitimacy, not generic outsiders) — so Steve Wells/SAB is a clean, non-strawmanned
439-model skeptic here by quoting his own caption verbatim in the connective, no external
argument needed. curl+Grep of the full `examinationofall00hale_djvu.txt` for `babbling`, `2
John`, `receive him not`, `God speed`, `reason of the hope`, `shun`, `Colossians`, `seasoned
with salt` came back **zero on-topic hits** (only irrelevant `shun` hits elsewhere in the book)
— confirms real absence for this whole cluster, not a search miss (this pairing is a modern/thin
SAB-style juxtaposition of household-code-style pastoral verses, not a classic doctrinal crux,
consistent with the id-313/364 "obscure pairing, no 19th-c. PD coverage" pattern). Fell back to
a harmonizing commentator already surfaced on the row for `pd_work`: **Matthew Henry** on 2 John
1:10 (`MHC/63/1/10`), whose own note draws the exact reconciling line in one clause: "Doubtless
such may be relieved in their pressing necessities, but not encouraged for ill service." Three
reconcile excerpts used (reconcile_first is NOT parity-capped to 1 — only the non-lean pole is
capped): Adam Clarke on 2 John 1:11 (`CLARKE/63/1/11`, "does not mean that we should deny such
the common offices of humanity, charity, and mercy"), Matthew Henry on 2 John 1:10 (same
sentence as above), and John Gill on 1 Tim 6:20 (`GILL/54/6/20`, glossing "vain babblings" as
specifically the false teachers' own disputes "about the law, and circumcision," not general
apologetic conversation with genuine inquirers). Live allowlisted `link` found via WebSearch +
WebFetch: `defendinginerrancy.com/bible-solutions/2_John_10.php` ("Is there a Bible contradiction
in 2 John 10?") — worth noting it argues the identical false-teachers-vs-outsiders-generally
distinction but frames it against Matt 5:44 "love your enemies," not against this row's actual
1 Pet 3:15/Col 4:5-6 refs; still a legitimate, honestly-noted `link` since the underlying
harmonizing mechanism is the same one this row needs. **Lesson: `defendinginerrancy.com`'s
per-verse `bible-solutions/<Book>_<ch>.<vs>.php` page for the discrepancy-side verse (here 2
John 10) is worth checking even when the row's reconcile-side verses are elsewhere — the
apologetics literature organizes by the "hard" verse, not by the full contradiction pairing.**

## Haley has real Enoch coverage but of a DIFFERENT contradiction; the row's own reconcile-excerpt
## author (Clarke) doubles cleanly as `pd_work` (id 559, "Did Enoch die?")
Hebrews 11:13 "these all died" (a list including Abel, Enoch, Noah, Abraham, Sarah) vs Hebrews
11:5 "translated that he should not see death" (echoing Gen 5:24) is `reconcile_first`
(`apparent_only`). Clean, on-point excerpt: **Adam Clarke** on Heb 11:13 (`CLARKE/58/11/13`) —
"These all died in faith - That is, Abraham, Sarah, Isaac, and Jacob, ... but they neither saw
the numerous seed, nor did they get the promised rest in Canaan" — restricts the referent of
"these all" to the Abraham-cluster only, silently excluding Enoch/Abel from the death-claim.
Note JFB's own note on the same verse (`JFB/58/11/13`) is a **false-positive trap**: it opens by
citing Bengel/Alford's identical restrictive reading, then explicitly *rejects* it ("But the
'ALL' can hardly but include Abel, Enoch, and Noah") and pivots to a different question (what
"the promises" refers to) — read the whole note before treating a keyword hit as an on-tension
reconcile candidate; JFB here is NOT usable as a second reconcile voice on the "who does 'these
all' include" question specifically. curl+Grep of `examinationof00hale_djvu.txt` for `Enoch`
found only 2 clusters, **both a different contradiction**: (1) "Enoch 'was not'" vs "the wicked
'was not'" (Ps 37:36-style "shall not be found" language applied to both the righteous-translated
and the annihilated-wicked) and (2) "flesh and blood cannot inherit" (1 Cor 15:50) vs Enoch's
bodily translation — neither touches Heb 11:13 vs 11:5 at all; a `these all died|11:13` grep came
back zero hits, confirming genuine silence on *this* pairing specifically, not a search miss.
Per the contract's explicit fallback, used **Clarke's own note as `pd_work`** (it's simultaneously
the reconcile excerpt's source and a real, on-passage PD harmonizing treatment — no conflict with
reusing it in both places). Named skeptic: **Steve Wells / Skeptic's Annotated Bible** —
`data/json/batch_28.json`'s `questionUrl` gave the exact slug (`contra/enoch_die.html`) directly;
`WebFetch` confirmed the live page brackets Enoch's name straight into the Heb 11:13 quote
("These [Abel, Enoch, Noah, Abraham, Sarah] all died") as its own framing device, which is exactly
the maximal "these all" reading Clarke's note resists — a clean, non-strawmanned 439-model fit.
Live allowlisted `link`: `gotquestions.org/died-in-faith.html` ("What does 'these all died in
faith' mean (Hebrews 11:13)?") — WebFetch-confirmed it treats this exact tension, but argues a
**different** harmonization than Clarke's (Enoch IS included in "these all died in faith," read
as a spiritual/faith-posture category rather than a literal-death claim) — cited anyway since the
`link` field doesn't need to match the excerpt's specific mechanism, only be real/on-topic; noted
the divergent approach in the `link.note` rather than silently implying agreement.

## Steve Wells/SAB confirmed for the flat-earth family; a GILL versification off-by-one bug
## discovered and worked around (id 563, "shape of the earth": Isa 40:22 "circle of the earth"
## vs Matt 4:8 mountain-view-of-all-kingdoms)
No `questionUrl`/`scholarship` field existed in this gather file (unlike most other worked ids
above — check `data/json/batch_*.json` anyway, it's not always present). Confirmed **Steve
Wells / Skeptics' Annotated Bible** as 439-model named skeptic by `WebFetch`-ing
`skepticsannotatedbible.com/mt/4.html` directly (per-chapter verse-by-verse page, not a
`contra/<slug>.html` topic page this time) and finding the unsigned verse-8 annotation itself:
*"...to the top of 'an exceeding high mountain,' high enough to see 'all the kingdoms of the
world.' I guess the earth was flat in those days."* — confirmed unsigned SAB per-verse notes are
Wells's own editorial voice (site compiler, per copyright footer), not a named guest contributor.
Reconcile excerpt: **JFB** on Matthew 4:8 (`JFB/40/4/8`) — argues Luke's "in a moment of time"
signals a **supernaturally extended vision**, not an ordinary naked-eye panorama, directly
defusing the flat-earth-geometry premise. **Discovered a real data-quality bug worth flagging on
sight elsewhere**: this gather file's **GILL** notes on Matthew 4 are mislabeled by a systematic
**off-by-one** — the note labeled `ref: "Matthew 4:7"` (`GILL/40/4/7`) actually glosses verse
**8**'s content ("the devil taketh him up into an exceeding high mountain... sheweth him all the
kingdoms"), the note labeled `4:6` glosses actual verse 7, and the note labeled `4:8` glosses
actual verse 9 — confirmed by checking each note's opening clause against the real KJV verse text
one at a time. **JFB's parallel notes on the same chapter are correctly aligned** (checked the
same way), which is why JFB was picked over GILL for the excerpt even though GILL's note is
arguably the more explicit reconcile voice ("there is no mountain in the world, from whence can
be beheld anyone kingdom... this was a fictitious, delusive representation") — using a
known-mislabeled `ref`/`full_note_ref` risked shipping an excerpt whose `verse_ref` doesn't match
any of the row's actual `refs_parsed`. **Lesson: when two voices offer comparably strong
excerpts, spot-check each candidate's `ref` against its own note `text`'s opening clause (does
the quoted KJV wording actually match that verse number?) before picking — an off-by-one in one
voice's note range for a chapter doesn't mean the whole gather file is unreliable, just that
voice's range; other voices on the same chapter can be clean.** No Haley coverage search was
attempted for `pd_work` — this "flat earth in the Bible" trope is a modern (20th/21st-c.) skeptic
argument style (per the id-313/364/559 pattern: 19th-c. PD polemicists/harmonizers didn't focus
on flat-earth cosmology claims), so went straight to the row's own reconcile-excerpt author
(JFB) as `pd_work`, consistent with the contract's explicit fallback. No allowlisted `link`:
`gotquestions.org/circle-of-the-earth.html` exists and is on-verse for Isaiah 40:22 but actually
**disputes** the sphere reading ("the word does not mean 'sphere' but rather... a circle or
sometimes a dome... A circle is flat like a disc") and never mentions Matthew 4:8 at all;
`gotquestions.org/flat-earth-Bible.html` exists and lists Isaiah 40:22 as a pro-sphere verse but
never addresses Matthew 4:8 either; `defendinginerrancy.com/bible-solutions/Matthew_4.8.php`
404s. Set `link.url: null` rather than stretch either partial-match GotQuestions page into a
citation — neither actually engages the row's specific two-verse tension.

## Bart Ehrman's OWN blog (not /forum/) is a clean 439-model skeptic for the Sermon on the
## Mount/Plain beatitude-count-and-wording family; Haley has NO coverage (id 566)
"How many beatitudes are in the Sermon on the Mount?" (Matt 5:3-11's nine vs Luke 6:20-23's four,
plus Matthew's third-person/spiritualized wording — "poor in spirit," "hunger and thirst after
righteousness" — vs Luke's second-person/literal "poor"/"hungry now") — curl+Grep of the Haley
djvu text (`examinationof00hale_djvu.txt`) for `[Ss]ermon\s+on\s+the\s+[Mm]ount` (double-space-
tolerant regex, per the OCR gotcha noted elsewhere in this file) found only one incidental,
off-topic hit; `[Bb]eatitude` came back **zero hits entirely** — Haley's chapter on this general
poverty theme ("Doctrinal Discrepancies," p.174-175, "poor in spirit" vs OT wealth-as-blessing
texts) is a wholly different tension (poverty-as-virtue vs riches-as-blessing paradox, not the
Matthew-vs-Luke beatitude-count/wording divergence) — confirmed by reading the surrounding
context, not just the keyword hit. Correctly fell back to the contract's named alternative: a
harmonizing commentator already surfaced on the row — **Matthew Henry** (`MHC/42/6/20`), whose
opening note on Luke 6:20 proposes the classic two-part harmonization: "it is probable that this
is only the evangelist's abridgment of that sermon, and perhaps that in Matthew too is but an
abridgment" (i.e., both Gospels abridge a fuller original discourse differently, so the differing
beatitude counts reflect editorial selection, not two incompatible eyewitness reports).

Named skeptic: **Bart D. Ehrman**, "Did Jesus Give the Sermon on the Mount?", *The Bart Ehrman
Blog* (ehrmanblog.org, Oct. 26, 2022) — confirmed via WebFetch this is Ehrman's own signed post
(byline BDEhrman), NOT a `/forum/` reader thread (the id-420 caution above), and it argues this
**exact** tension directly: "the collection of the sayings into a single Sermon is almost
certainly Matthew's own construction," concluding "I don't think Jesus ever gave the Sermon on
the Mount" — i.e., Matthew assembled scattered sayings (which Luke preserves distributed across
his Gospel) into one discourse, so the differing beatitude count/wording reflects two evangelists'
incompatible literary constructions rather than a single verbatim event. A clean, well-documented
439-model fit for any Sermon-on-the-Mount-vs-Sermon-on-the-Plain row (also worth checking for a
recurring "woes" row, since Luke 6:24-26 has no Matthean parallel at all — same family, not yet
worked as its own id here).

Live allowlisted `link`: `defendinginerrancy.com/bible-solutions/Luke_6.20_(cf._MATT._5.3).php` —
verified 200 + exact on-topic `<h2>` heading via raw `curl`: "Luke 6:20 (cf. Matt. 5:3)—Why does
Luke's version of the Beatitudes differ from those in Matthew?" — a verbatim-topic match, not just
a same-verse-different-question near-miss (the id-407 caution). **`defendinginerrancy.com`'s
`bible-solutions/<Book>_<ch>.<vs>_(cf._<BOOK>._<ch>.<vs>).php` cross-reference URL pattern is
worth trying directly for any Synoptic-parallel wording/number discrepancy**, not just the plain
`<Book>_<ch>.<vs>.php` single-verse pattern already noted at id 364.

## Checking Haley's own back-of-book scripture INDEX (not just full-text keyword grep) is a fast,
## high-confidence way to confirm real absence on a numeric/headcount crux (id 569)
"How many apostles were in office between the resurrection and ascension?" (1 Cor 15:5 "the
twelve" vs. Judas already dead per Matt 27:3-5, Matt 28:16 "the eleven disciples," Acts 1:9's
eleven-only ascension with Matthias not chosen until Acts 1:26) — consensus `genuinely_disputed`
→ `discrepancy_first`. All six gathered voices (GILL/JFB/CLARKE/MHC/TYN/GNV) harmonize (round-
number/title-of-office reading), so no verbatim discrepancy excerpt existed; correctly used the
439 model. Curl+Grep of the scratchpad-cached `haley.djvu.txt` for `Cephas`, `the twelve`, `eleven
disciples`, `Matthias`, `Iscariot` all came back zero/irrelevant hits — but rather than stopping
there, grepping the book's own back-of-book scripture **index** (`Apostles`) found the complete
entry: "Apostles, lists of names, 322; called when, 407; distinct from the 'seventy disciples,'
407" — i.e., Haley's *own* index confirms his only "Apostles" coverage is name-lists and the
calling narrative, not this resurrection-headcount tension. **An index-entry check is a stronger
negative-confirmation than a body-text grep alone** (the index is the author's own summary of what
he covered) and costs only one extra grep — worth doing before concluding silence on any
numeric/list-type crux. Fell back correctly to a harmonizing commentator already on the row:
**GILL** (`GILL/46/15/5`), whose note is unusually complete for a single excerpt — it concedes the
group numbered only eleven at that moment, gives the "retained original-number title"
explanation, AND independently notes the Vulgate/Claromontane manuscripts read "the eleven"
instead of "the twelve" (a genuine textual variant, corroborated by CLARKE's parallel note on the
same verse citing D*EFG/Syriac-margin/Vulgate/Itala witnesses for the same reading) — used as both
the reconcile excerpt and the `pd_work` (Haley being silent, per the contract's fallback clause).

Named skeptic: **Bart D. Ehrman**, "How Can Paul Say that Jesus Appeared to the Twelve?", *The
Bart Ehrman Blog* (ehrmanblog.org, April 12, 2022) — confirmed via WebFetch this is Ehrman's own
signed post (byline BDEhrman), NOT a `/forum/` reader thread (the id-420 caution), and it engages
this **exact** question head-on. His preferred explanation is more radical than the standard
"round number" harmonization: Paul may simply not have known the Judas-betrayal/suicide tradition
at all (only Matthew's Gospel records it) — a real historical disjunction between the pre-Pauline
creedal tradition and the later Gospel narrative, not just a loose title.

Required a mid-note ellipsis join for the GILL excerpt (dropped two off-tension cross-reference
sentences about *which* appearance is meant) but no leading ellipsis, since the excerpt's start
point ("then of the twelve;") is GILL's own natural lemma-break after a semicolon, not a
mid-sentence cut. No allowlisted `link` found despite real effort: WebSearch/WebFetch/curl rounds
on `gotquestions.org` (`/twelve-apostles-disciples-12.html`, `/Matthias-Judas-Paul.html`) and
`carm.org` (`/evidence-and-answers/an-analysis-of-the-pre-pauline-creed-in-1-corinthians-151-11/`,
raw-curled and grepped for "twelve" — zero hits) all confirmed live but NOT on this specific
tension; `link: null`, per the id-407/440 precedent of not stretching an off-topic allowlisted
page into a citation. Dry-run bake (`DRY_RUN=1 IDS=569`) gave the standard two pre-T9/T10
violations (`note_present`, `parity_count`) and the new excerpt passed `verifyExcerpts.py` (the
run's 3 unrelated FAILs were pre-existing issues on ids 537/542/563, not 569) — normal/expected,
not a bug.

## Haley has an exact, dedicated "Capital punishment." heading naming Cain by verse (id 576)
"Should the blood-shedder be put to death?" (Gen 9:5-6 "by man shall his blood be shed" vs Gen
4:15, God marking/protecting Cain from being killed) — curl+Grep of the scratchpad-cached
`haley_djvu.txt` for the bare proper noun `Cain` (not a topical phrase) landed directly on a
two-column heading **"Capital punishment. / Murderer executed. Spared."** (p. 258), which quotes
Gen 9:6 against Cain's own words in Gen 4:12-13 verbatim and resolves it with a flat chronological
move: "The case of Cain occurred some fifteen hundred years before this command was given to
Noah." (Bare-phrase greps for `sevenfold`, `blood be shed`, and `mark upon Cain` all false-
negatived — as at id 389/407, a rare proper noun is often the more reliable grep than the
topical phrase.) Reconcile excerpt used **KD** on Genesis 9:3 (`KD/1/9/3`) rather than Haley
(Haley isn't in `voices_present`, so he can only ever be `pd_work`, never an excerpt source) —
KD's note makes a sharper doctrinal version of the same chronological move, distinguishing God's
*direct* personal vengeance in Cain's case from the judicial power *delegated* to human courts by
the Gen 9:6 command, in one self-contained sentence needing no ellipsis trim. Named skeptic:
**Steve Wells / Skeptic's Annotated Bible** — `contra/capital.html` ("Does God approve of capital
punishment?") WebFetch-confirmed to quote both Gen 9:6 and Gen 4:15 verbatim in its "No" column,
juxtaposed exactly as this row's tension states (no `questionUrl` field existed on this id in
`data/json`/`data/scholarly` batch files, so this was found by direct WebSearch/WebFetch instead
of the usual shortcut). Link: `defendinginerrancy.com/bible-solutions/Genesis_4.12-13.php` ("Is
there a Bible contradiction in Genesis 4:12-13?"), WebFetch-confirmed to state the tension in the
same Gen-9:6-vs-Gen-4:15 terms and argue Cain's sparing was a sovereign pre-law exception. Dry-run
bake (`DRY_RUN=1 IDS=576`) gave the standard two pre-T9/T10 violations (`note_present`,
`parity_count`) and 925/925 `verifyExcerpts.py` PASS — normal/expected, not a bug.

## R. N. Whybray is a real, verifiable named skeptic for Proverbs-internal anthology
## contradictions — and Haley has an exact heading hit too (id 602)
"Is there a remedy for foolishness?" (Prov 22:15, rod of correction drives folly from a child,
vs Prov 27:22, grinding a fool in a mortar still won't make his folly depart) — the row's own
pre-existing DB `scholarship` field (via `data/json/batch_31.json`, `questionUrl` pointed at a
`philb61.github.io`/evil-bible mirror, not SAB, so no SAB slug applied here) already cited **R.
N. Whybray, *Proverbs* (NCB; Eerdmans, 1994), pp. 322-324 and pp. 386-388** alongside Fox/Waltke/
Clifford/McKane, crediting Whybray's "form-critical work" for the anthology-of-anthologies
reading. WebSearch independently confirmed Whybray is real and wrote a dedicated monograph on
exactly this mechanism — **R. N. Whybray, *The Composition of the Book of Proverbs*, JSOTSup 168
(Sheffield: JSOT Press, 1994)** — which argues Proverbs' seven sub-collections were composed at
different times and preserves unharmonized internal contradictions (the search summary's own
example, Prov 26:4 vs 26:5, is the same genre of tension as this row's 22:15/27:22 pair, just a
different verse pair). Used Whybray (the monograph, not the NCB commentary) as the discrepancy
pole's `named_skeptic`, phrased around his general redactional thesis rather than claiming he
named this exact pair, since only the general thesis was independently verified.

Reconcile excerpt: **MHC** on Prov 27:22 (`MHC/20/27/22`) opens by naming Pro 22:15 explicitly
and giving the age/inveteracy harmonization ("the vicious habits not having taken root" vs. "if
the disease be inveterate...incurable") — a complete opening sentence needing no ellipsis.
**Haley has a direct, exact-heading hit** (scratchpad-cached `haley.txt`, `Grep` for `mortar`
found it in 3 hits total): "Folly,—treatment." (p. 278, "Ethical Discrepancies" chapter),
two-column heading "Folly remediable." / "Folly remediless.", quoting both verses verbatim and
resolving with the identical age-based move MHC uses ("'Foolishness'...is the incipient
waywardness which belongs...to children...The 'fool' in the second text, is the grown-up fool,
whose folly is past cure.") — used as `pd_work` over defaulting to MHC, since Haley directly and
verifiably treats this specific pair. Link: `defendinginerrancy.com/bible-solutions/
Proverbs_27.22.php` ("Proverbs 27:22—Is foolishness correctable?") — WebFetch-confirmed live,
explicitly frames the Prov 22:15-vs-27:22 tension and resolves it with the same child/adult-fool
distinction. Dry-run bake (`DRY_RUN=1 IDS=602`) gave the standard two pre-T9/T10 violations
(`note_present`, `parity_count`) and 960/960 `verifyExcerpts.py` PASS — normal/expected.

## Haley has ZERO coverage of Psalm 89 anywhere — confirmed by grepping for the roman-numeral
## chapter cite itself, not just topical phrases (id 595)
"How long should David's throne endure?" (Ps 89:35-37, God's sworn oath that David's seed/throne
endure forever "as the sun"/"as the moon" vs Ps 89:44, eight verses later, "cast his throne down
to the ground" — a purely intra-psalm tension, `testament_scope` OT_internal, `books_in_tension`
just "Psalms"). `consensus: apparent_only` → `lean: reconcile_first`. Curl+Grep of the scratchpad
`haley.txt` (`examinationof00hale_djvu.txt`) for `l\s*x\s*x\s*x\s*i\s*x` (Haley cites Psalms by
roman-numeral chapter, e.g. "Psalm lix. 4" — confirmed via other real `Psalm [roman]` hits
elsewhere in the same file) came back **zero hits for "lxxxix" (89) anywhere in the whole book** —
a stronger negative check than a topical-phrase grep, since it rules out the chapter itself ever
being cited under any topic heading. A separate `throne` grep (20 hits) turned up nothing on this
verse pair either (nearest miss: a Jer 22:30/Davidic-succession-curse discussion at a different
location, unrelated to this row). Correctly fell back to the contract's named alternative: a
harmonizing commentator already surfaced on the row. **Matthew Henry's own general principle**
(`MHC/19/89/38`, mid-note) states the row's `apparent_only` consensus almost verbatim: "Sometimes,
it is no easy thing to reconcile God's providences with his promises, and yet we are sure they
are reconcilable; for God's works fulfil his word and never contradict it." — used as both a
reconcile excerpt AND (since Haley is out) the `deeper_learning.defense.pd_work`.

Reconcile pole (3 excerpts, distinct voices, comfortably above the discrepancy pole's parity
floor of 1): MHC/19/89/38 (the general reconcile-them principle, above), **GILL/19/89/44**
("wherefore all these complaints, though true, are no objections to what is before said and swore
to." — Gill's own note on v. 44 itself, saying the casting-down language doesn't undercut the
earlier oath), and **GNV/19/89/45** ("He showeth that the kingdom fell before it came to
perfection, or was ripe." — the Geneva Bible's marginal gloss reframing the fall as premature/
incomplete rather than a final negation). All three are short, self-contained, no ellipsis needed.
Named skeptic: **Steve Wells / Skeptic's Annotated Bible** — no `questionUrl` on this id in
`data/json` batches, so found by direct `WebFetch` of `skepticsannotatedbible.com/ps/89.html`
(note: SAB's **per-chapter** page path for Psalms is `/ps/<ch>.html`, NOT a `/contra/<slug>.html`
page — this chapter-level tension is filed on the plain chapter annotation page, not a dedicated
contra slug; `/psa/89.html` 404s, `/ps/89.html` is the real one), which confirmed the exact
annotation: "God swore to David that his seed and kingdom would last forever. But the Davidic line
of kings ended with Zedekiah; there were none during the Babylonian captivity, and there are none
today," under `contra`/`abs`/`sci` category icons. No allowlisted `link` found: `gotquestions.org`
has only a generic "throne of David" Christological page (not on this specific intra-psalm
tension), and both `defendinginerrancy.com` (searched broadly, no dedicated Psalm 89 page exists
on the site at all) and `carm.org` (searched for Psalm 89/throne, no on-topic page) came back
empty — `link` omitted rather than stretched, per the id-407/440/569 precedent. Dry-run bake not
run for this id (task scope excluded touching any `.db`/build step); JSON hand-validated via
`node -e "JSON.parse(...)"` instead.
