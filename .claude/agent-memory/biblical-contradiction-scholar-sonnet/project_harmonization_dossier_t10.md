---
name: project_harmonization_dossier_t10
description: T10 dossier leg (hand-source ONE verbatim PD critic quote into discrepancy.quotes[]) — schema, verification workflow, worked examples id 422 (Strauss), id 454 (Schweitzer), id 579 (Renan), id 361 (Troki), id 330 (Paine), id 487 (Ingersoll), id 549 (Spinoza); documented "could not source" case id 301
metadata:
  type: project
---

Companion to [[project_harmonization_dossier_t9]]. T10 is the later leg that
hand-sources a **verbatim** public-domain critic quote into a dossier row's
`discrepancy.quotes[]` (T9 leaves `discrepancy` entirely null on
discrepancy-leaning rows and never stages quotes itself — see T9 memory).

## Schema for the appended quote entry
```json
{
  "text": "<verbatim quote, ~25-60 words, U+2026 for internal elision>",
  "attr": "Author (d. death-year), Work (translation/year), §section.",
  "voice": null,
  "href": "<source_url>",
  "source": { "kind": "hand", "url": "<source_url>", "well": "<short-slug>" }
}
```
`attr` head must parse via `DOSSIER_ATTR_HEAD_RE` (`^(.*?\([^)]*\d[^)]*\))`) —
i.e. end the author segment with a `(...)` parenthetical containing a digit
(`(d. 1874)` works) so the validator's surname-token extraction succeeds.
`well` convention (from ids 189/468/496): `<author-lastname>-<short-work-slug>`
e.g. `cassels-supernatural-religion`, `remsburg-the-christ`, `renan-the-apostles`,
and now `strauss-life-of-jesus`. Note: some *existing* Strauss quotes in the
corpus (ids 189, 459) have `href: null` / bare `source: {"kind":"hand"}` with
no url/well — that's legacy/inconsistent, not the pattern to copy; this task's
own explicit instructions (and the id 468/189/496 majority) want href+url+well
populated whenever you found the quote via WebFetch verification.

Also set `discrepancy.note`: one sentence, <=180 chars, ends `.`, no interior
`". "`, no trailing `(YYYY).`/`, on Book C:V.` tail, blocklist-clean (`attempt,
explains away, contrived, forced, of course, fatal, decisively, obviously,
merely, so-called, desperate, absurd`), condensed in your own words (not a
verbatim slice of the quote), and must name the critic's surname (substring
match against tokens parsed from the quote's `attr` head). Leave `reconcile.*`
and `versePair` untouched — T10 only ever touches the discrepancy pole.

## Verification workflow that actually works (archive.org + Gutenberg)
WebFetch on a Gutenberg `.htm` or archive.org page **summarizes via a small
model** — it will NOT reliably find/quote a specific passage inside a
multi-hundred-KB PD text (tested: WebFetch on gutenberg.org/files/64037's htm
page reported it "could not locate" a passage that was in fact present).
Working pattern instead:
1. `WebSearch`/`WebFetch` to find the PD full text (Gutenberg ebook page,
   archive.org `/details/<id>` page) and confirm author/work/edition.
2. Get the archive.org item's raw server+dir via
   `https://archive.org/metadata/<identifier>` (JSON: `server`, `dir`,
   `files[]` — look for a `_djvu.txt` file), OR just grab the Gutenberg
   `.htm`/`.txt` file directly — both are plain static files.
3. `curl` the raw file straight into the scratchpad directory (NOT WebFetch —
   curl gets the true bytes, no summarization/truncation), then use `Grep`
   locally against the downloaded file to find the passage and read exact
   surrounding lines with `Read`. This is the only reliable way to pull a
   precise verbatim sentence out of a huge PD text.
4. Prefer the **Gutenberg HTML transcription** over an archive.org OCR
   `_djvu.txt` when both exist for the same edition — the OCR text has
   scanno artifacts (e.g. dropped diacritics: "Kuinol" vs the HTML's correct
   "Kuinöl") while Gutenberg's HTML is a proofread transcription. Cross-check
   the two against each other when both are available (line-for-line match
   confirms neither has been silently altered).
5. Delete the downloaded scratch files when done (they're multi-MB).

## Worked example: id 422 (Jairus's daughter, Matt 9:18 "even now dead" vs
Mark 5:23/Luke 8:42 "at the point of death")
Found via targeted WebSearch for "Strauss Life of Jesus Jairus" → confirmed
via Gutenberg ebook #64037 (*The Life of Jesus Critically Examined*, D. F.
Strauss, trans. George Eliot 1846, this edition = 4th German ed. with Otto
Pfleiderer introduction) → curled the `.htm` directly →
`§100 "RESUSCITATIONS OF THE DEAD"` (Part II, Chapter IX) discusses this
**exact** three-way synoptic tension by name and explicitly rejects the
"near death" reading of Matthew's Greek that Kuinöl (and, independently, our
row's own PD reconcile-pole author John Gill) offers as harmonization —
i.e. Strauss's quote is a direct rebuttal of the *specific* linguistic move
this row's `reconcile.note` already cites. Quote is dense (embeds the Greek
verb forms ἄρτι ἐτελεύτησε / ἐσχάτως ἔχει / ἀπέθνησκε and the Latin "est morti
proxima") but that's precisely why it's on-tension — those Greek/Latin
fragments ARE the disputed harmonization move, not decoration. No other
existing dossier quote in the corpus embeds Greek text (checked all files),
but nothing in the schema/validator forbids it — `DRY_RUN=1 IDS=422
node .scripts/buildHarmonizationTables.js` came back 0 violations with it
included, parity satisfied (1 reconcile quote vs 1 discrepancy quote).

## Worked example: id 454 (Matthew 10:23 "before the Twelve finish their
mission tour" vs Matthew 24:14 "gospel preached to all nations, then the
end") — Schweitzer, *Quest of the Historical Jesus*
Confirms a second reliable pattern for **long, chapter-split PD books** where
plain WebFetch on the monolithic Gutenberg file fails differently than the
422 case: it doesn't just "summarize badly," it **silently truncates before
the model ever sees late chapters** (WebFetch on gutenberg.org's full
`.htm`/`.txt` for Schweitzer's ~150k-word book reported ch. XIX "not present
in the excerpt provided" twice, from two different fetch attempts, even
though it demonstrably exists in the real book — this is a harder failure
mode than 422's "could not locate," worth distinguishing: 422's book fit
inside the fetch budget and just needed a keyword nudge; 454's did not fit at
all). Fix: locate a **per-chapter-split PD mirror** instead of the monolith —
`en.wikisource.org/wiki/<Title>/<chapter-number>` (works for any
Wikisource-hosted book split into numbered subpages; confirm the chapter
number first via the Gutenberg edition's own short, fetchable table of
contents) — then WebFetch that single chapter page directly, which is small
enough to actually reach the model. Cross-verified by independently fetching
a **second** site's separate transcription of the same chapter
(`earlychristianwritings.com/schweitzer/chapter19.html`) and confirming
byte-identical wording came back from both — this substitutes for the
curl+Grep approach when the PD text isn't on Gutenberg/archive.org as a
single flat file, or when doing so is overkill for a short quote. Final
quote: the two-sentence passage citing "(Matt. x. 23)" by name and glossing
the Parousia as due before the disciples "completed a hasty journey through
the cities of Israel" — landed at exactly 60 words (the stated ceiling); kept
whole rather than trimmed to preserve the explicit verse citation inside the
quote itself. `attr`: `"Albert Schweitzer (d. 1965), The Quest of the
Historical Jesus (Eng. transl. 1910), ch. XIX."` — confirms a chapter-number
tail (no `§`) parses fine under `DOSSIER_ATTR_HEAD_RE` when the work isn't
section-numbered. Added a `schweitzer-quest-historical-jesus` entry to
`pd-critics-well.json` even though **no script reads that file** (grepped
`.scripts/buildHarmonizationTables.js` for `well`/`pd-critics-well` — zero
hits) — it's a purely hand-maintained bibliographic index per
`TRANSFORM_SPEC.md` §9, and every other hand-sourced quote with a real URL
has a matching well entry, so keep adding to it for consistency even though
nothing enforces it. `DRY_RUN=1 IDS=454 node .scripts/buildHarmonizationTables.js`
→ 0 violations, parity 1/1 (reconcile pole's 1 quote comes from the machine
file's JFB excerpt, baked automatically — the dossier JSON's own
`reconcile.quotes` stays `[]` on disk even when parity is satisfied; judge
parity from the bake summary's printed counts, not the raw JSON array).

## Worked example: id 579 (Matt 5:39 "resist not evil" / Matt 26:52 "put up
thy sword" vs Luke 22:36 "buy a sword" / John 2:15 temple whip) — Renan,
*The Life of Jesus*, ch. 23
Machine curation's `row.discrepancy.skeptic` named S. G. F. Brandon (1967) —
correctly flagged as **not PD**, so it was a starting point only, not a
candidate. Found Renan instead via WebSearch for the Last-Supper "two swords"
scene specifically (not the more commonly-cited Matt 10:34 "I came not to
send peace, but a sword" — Ingersoll's well-known line on that verse was a
tempting first hit but doesn't cite any of this row's four target verses, so
it was rejected as off-tension: verify the critic actually engages the
row's own refs, not just the same broad theme). Renan's *Life of Jesus*
(1863; Eng. transl. Wm. G. Hutchison, 1897, reprinted anonymously on
Wikisource 1927 — PD either way, author died >100 years ago) is chapter-split
on Wikisource (`Life_of_Jesus_(Renan)/Chapter_23`); verified the quote by
fetching that single chapter page **twice independently** (once rendered,
once via `?action=raw` for the literal wikitext) and getting byte-identical
text both times — a lighter-weight substitute for the Schweitzer-style
second-independent-site cross-check when a `?action=raw` fetch is available
(Wikisource always has this; Gutenberg HTML doesn't). Renan is a genuinely
critical (not harmonizing) source here despite being a devotional-sounding
"Life of Jesus": his naturalistic reading treats the sword episode as Jesus
literally weighing real self-defense and abandoning it only because it was
*impractical* (disciples couldn't withstand Jerusalem's armed force), not
because of principled non-resistance — the opposite of this row's
reconcile-pole quote (Clarke: "these swords were neither to be considered as
offensive weapons, nor instruments to propagate the truth"). Good reminder
that a PD "Life of Jesus" can supply the *discrepancy* pole, not just
reconcile — judge a source's pole by what it actually argues, not its genre/
title. `attr`: `"Ernest Renan (1892), The Life of Jesus (1863), ch. 23."`
(death-year form, no `d.` prefix — both forms parse fine under
`DOSSIER_ATTR_HEAD_RE`, which only needs a parenthetical containing a digit).
Added `renan-life-of-jesus` to `pd-critics-well.json` (distinct from the
already-indexed `renan-the-apostles`, a different Renan book). Reconcile pole
here has only 1 quote (from the machine file), so parity needed just 1
discrepancy quote — confirms the general rule: check the bake summary's
printed reconcile-quote count before assuming you need >1 critic.
`DRY_RUN=1 IDS=579 node .scripts/buildHarmonizationTables.js` → 0 violations,
parity 1/1.

## Worked example: id 330 (Ezra 2:35 "children of Senaah, 3,630" vs Nehemiah
7:38 "children of Senaah, 3,930") — Thomas Paine, *The Age of Reason*, Part II
ch. I
Task hint pointed at Colenso as "the natural PD heavy-hitter for the
Ezra/Nehemiah census cluster" — **dead end, don't default to this**: Colenso's
*Pentateuch and Book of Joshua Critically Examined* (all digitized parts
searched, including the "Part VII: compared with the other Hebrew Scriptures"
1879 volume, which never turned up a searchable full text) engages Numbers-book
census figures, not Ezra/Nehemiah. His fame on Biblical-numbers criticism is
specifically Pentateuchal; it doesn't extend to the post-exilic return
registers. Found Paine instead via an untargeted WebSearch (`"Age of Reason"
Paine Ezra Nehemiah census numbers discrepancy`) whose result summary quoted
the actual source sentences verbatim — a useful signal to WebFetch next.
Paine's *Age of Reason* Part II ch. I ("The Old Testament") walks through
**both** registers' internal arithmetic (Ezra's claimed total 42,360 vs. its
own particulars summing to 29,818; Nehemiah's same claimed total vs. its
particulars summing to 31,089) and explicitly states **"The list differs in
several of the particulars from that of Ezra"** — this is a general-purpose
citation for *any* Ezra-2-vs-Nehemiah-7 clan-total mismatch in this corpus
(not Senaah-specific — Paine never names Senaah), which is fine: the row's
`discrepancy.quotes` bar is "actually engaged THIS contradiction," and a
naming-the-phenomenon-and-two-of-its-instances passage from the one PD critic
who worked through this exact list pair counts, even without the specific
clan named. Verified the wording via **two independent PD transcriptions**
(`en.wikisource.org/wiki/The_Age_of_Reason/Part_II/Chapter_I` and
`ushistory.org/paine/reason/reason24.htm`) that agree on every word but differ
on whether the "list differs..." sentence is wrapped in parens — normal
edition/transcription variance, not a red flag; picked wikisource as the
`href` of record (already in `pd-critics-well.json` as `paine-age-of-reason`,
whose `source_url` I updated from the monolithic Gutenberg `pg3743.txt` — too
large to verify against per the workflow note above — to this same
per-chapter Wikisource URL, matching the Schweitzer/Renan precedent of
preferring chapter-split mirrors for long PD works). **Reuse the existing
`well` slug** (`paine-age-of-reason`) rather than minting a new
topic-specific one — `pd-critics-well.json` indexes one entry **per work**,
not per quote/topic (I initially minted `paine-age-of-reason-ezra-nehemiah`
before checking the file already had `paine-age-of-reason`; fixed before
finalizing). `attr`: `"Thomas Paine (d. 1809), The Age of Reason, Part II
(1795), ch. I, on Ezra 2 and Nehemiah 7."` Reconcile pole here has only 1
machine quote (JFB on Neh 7:5), so parity needed just 1 discrepancy quote.
`DRY_RUN=1 IDS=330 node .scripts/buildHarmonizationTables.js` → 0 violations,
parity 1/1.

## Worked example: id 487 (demons/unclean spirits confess Jesus as "the Holy
One of God"/"Son of God" — Mark 1:23-24, 3:11, 5:2-7, Luke 4:34/41 — vs 1
John 4:2/4:15/5:1's confession-test for being "born of God"; James 2:19
"the devils also believe, and tremble") — Robert G. Ingersoll, *The Christian
Religion*, pt. III
This id is a **known parity-debt case by design** (see [[project_harmonization_dossier_t9]]
"Expected... validator output on a discrepancy-leaning row pre-T10"): the
reconcile pole already carries 3 machine-sourced quotes (GILL, MHC, GNV), so
T10 landing exactly 1 verified discrepancy quote is the *correct, expected*
outcome, not a shortfall to fix — report it as "needs N more" (here N=2) in
the STATUS line rather than trying to manufacture 2 more quotes to force
parity in one pass. Two dead ends worth recording so a future pass doesn't
re-walk them: (1) G. W. Foote, *The Book of God* (Gutenberg #38092) — searched,
no relevant passage exists at all; (2) Foote & Ball, *The Bible Handbook for
Freethinkers* (archive.org djvu text) — DOES contain James 2:19 verbatim
under the ironic 2-word heading "Orthodox devils" (BIBLE ABSURDITIES section)
and separately lists 1 John 5:1/3:9 under "Antinomianism" (BIBLE ATROCITIES
section) — real and on-theme, but this whole book is a terse Bible-verse
anthology with one-line ironic headers, not analytical prose, so there's no
25-60-word span of the *editors' own words* engaging the tension (re-quoted
scripture under a caption doesn't satisfy "a critic who actually engaged this
contradiction" — the ABSOLUTE RULE wants the critic's own argument, not
Scripture the critic merely flagged). Found the working source instead via
a WebSearch that hit Ingersoll's complete-Works omnibus (Gutenberg #38813,
~10MB) — grep on the 10MB file (via `curl` into scratchpad, since `WebFetch`
hard-errors above 10MB with `maxContentLength size of 10485760 exceeded`)
turned up the passage at Vol. VI, "The Christian Religion, by Robert G.
Ingersoll" (III.) — his rejoinder to Jeremiah S. Black, orig. *North American
Review* 1881: Ingersoll quotes 1 John 4:15 ("Whosoever shall confess that
Jesus is the Son of God, God dwelleth in him, and he in God") in a cluster of
salvation-by-belief proof-texts, then rebuts with James 2:19's "the very
devils believe" to argue mere belief can't be the meritorious criterion —
a direct hit on this row's own two target verses. **Do not cite the 10MB
omnibus URL** even though the text lives there — Gutenberg also publishes
each volume standalone; found ebook **#38806** ("Vol. 6 (of 12)") at
`https://www.gutenberg.org/cache/epub/38806/pg38806-images.html` (~1MB),
byte-confirmed identical wording via curl+Grep there too, and used that as
`href`/`source.url` instead (smaller, still the real Project Gutenberg
edition, an actually-fetchable size). Note a Gutenberg-ID trap here: ebook
**#38093**, titled simply "The Christian Religion, by R. G. Ingersoll," looks
like the obvious standalone match by title but only contains **Part I**
(Ingersoll's opening paper) — not Part III where this quote lives; always
grep-confirm which Part a same-titled standalone edition actually contains
before trusting it over the full-volume file. WebFetch still failed to find
the passage on the 1MB #38806 page directly (small-model truncation, same
failure mode as other worked examples above) — but *did* succeed reading a
**different**, smaller mirror of the same Part III essay,
`https://infidels.org/library/historical/robert_ingersoll/debate/v_black-christianity_3.html`
(paraphrase-confirmed the same three sentences), which is useful as
independent corroboration when the primary-source curl+Grep match is already
conclusive but a literal WebFetch success is still wanted. `attr`: `"Robert
G. Ingersoll (d. 1899), The Christian Religion, pt. III (1881)."` — added
`ingersoll-christian-religion-rejoinder` to `pd-critics-well.json`. Ingersoll
is a strong go-to PD critic specifically for faith/works and
belief-alone-as-salvation tensions (his controversialist debates vs. Field,
Black, Gladstone, Manning in *Works* Vols. V-VII, "Discussions," are dense
with verse-by-verse rebuttal) even though he's easy to overlook among this
task's example list of PD critics (Strauss/Paine/Ingersoll/Colenso/
Schweitzer/Cassels/Renan/Remsburg/Wellhausen — he IS on it). `DRY_RUN=1
IDS=487 node .scripts/buildHarmonizationTables.js` → exactly 1 violation
(`parity_count`, expected/accepted per above), quotes (discrepancy): 1.

## Worked example: id 361 (Proverbs 21:18 "the wicked is a ransom for the
righteous" vs Mark 10:45 "give his life a ransom for many") — Isaac Troki,
*Faith Strengthened*
Illustrates picking a critic who engages the **underlying theological
question** (does anyone need a vicarious ransom to be saved?) rather than a
critic who cites the exact verse pair by chapter/verse — the dossier's
versePair is just one representative pair drawn from a 4-text SAB cluster
(Prov 21:18/13:8, Job 15:14, Isa 41:26/64:6, Rom 3:10, 1 Tim 2:6, Mark 10:45,
Matt 20:28), and the real skeptical target is the concept, not the specific
citation. Found via WebSearch for the modern SAB question first (turned up
nothing PD), then pivoted to searching PD anti-missionary/Jewish apologetic
works on the Christian ransom/atonement doctrine generally — **Isaac Troki
(d. 1594), Chizzuk Emunah / Faith Strengthened**, trans. Moses Mocatta 1851
(archive.org `faithstrengthene00trok`), is the classic PD candidate for
exactly this genre. Two dead ends worth recording: (1) `archive.org/stream/
<id>/<id>_djvu.txt` via WebFetch **silently returns "no matches"** for words
that are actually present, even for a moderate ~330-page book — only the
archive.org `fulltext/inside.php?item_id=...&doc=...&q=...` JSON endpoint
(needs the item's real `server`/`dir` from `archive.org/metadata/<id>`) gave
trustworthy hits; don't trust a WebFetch "not found" on a djvu.txt, always
curl+Grep or the fulltext-search JSON to verify. (2) juchre.org's HTML
transcription of this same book (a modern, chapter-titled paraphrase edition)
403'd both `curl` and WebFetch, and WebFetch's summarizer only ever surfaced
the first ~13 of 50 Part-I chapters per fetch — its own chapter-title labels
(e.g. "Is the death of Jesus enough to save all believers?" for what it calls
ch. 48) **mislabel the actual chapter number** versus the real 1851 print
edition; the passage used is actually **Part I, Chapter XI** ("The Fall of
Adam" / refutation that OT saints needed Christ's death to be saved), located
by grepping local `CHAPTER` headers in the curled djvu.txt and counting
Roman numerals sequentially (OCR mis-scanned "CHAPTER XI." as "CHAPTER XL")
— **don't trust a third-party site's own chapter numbering/titling without
cross-checking position against the primary PD scan.** Quote (46 words, one
internal elision) is Troki's refutation that OT righteous "secured
everlasting salvation through their own merits, without requiring extraneous
interference to save their souls" — directly denying the premise that any
ransom (wicked, riches, or Christ) is needed at all, which is the discrepancy
pole's real content. `attr`: `"Isaac Troki (d. 1594), Faith Strengthened
(Mocatta transl., 1851), pt. I, ch. XI."` Added `troki-faith-strengthened` to
`pd-critics-well.json`. `DRY_RUN=1 IDS=361 node .scripts/buildHarmonizationTables.js`
→ 0 violations, parity 1/1.

## Worked example: id 549 (2 Timothy 3:16 "all scripture is given by
inspiration of God" vs Paul's own disclaimers in 1 Corinthians 7:6/7:12/7:25
"not the Lord" / "not by commandment") — Baruch Spinoza, *Tractatus
Theologico-Politicus*, ch. XI
A **theological/self-referential-inspiration** contradiction, a category not
previously represented in this file (prior worked examples are all Gospel-
narrative or historical-numeral tensions) — worth knowing Spinoza's TTP ch. XI
("An Inquiry Whether the Apostles Wrote Their Epistles as Apostles and
Prophets, or Merely as Teachers") is the **go-to PD source for this whole
family**: any contradiction pitting a full/verbal-inspiration proof-text
(2 Tim 3:16, 2 Pet 1:21) against a NT author's own disclaimer of direct
revelation. Spinoza names 1 Cor. vii:6, vii:25, and vii:40 **by verse number**
and argues at length that Pauline epistles "were not written by revelation
and Divine command, but merely by the natural powers and judgment of the
authors" — a direct, on-the-nose fit, found via `sacred-texts.com`'s Elwes
translation (`sacred-texts.com/phi/spinoza/treat/tpt17.htm`; note this domain
**403s a bare WebFetch** — worked fine via `curl -A "Mozilla/5.0 ..."`, so add
sacred-texts.com to the curl-not-WebFetch list alongside archive.org
djvu.txt). Quote (38 words) chains three verbatim fragments across the
chapter with two `…` joins: "Paul speaks according to his own opinion" (§5)
+ the verse-25 quote itself, "(1 Cor. vii:25)" citation included verbatim as
Spinoza wrote it (§7) + the chapter's thesis restated later, "the Apostles
wrote their Epistles solely by the light of natural reason" (§41) — a wider
span than most prior worked examples' single-join quotes, but each fragment
is independently verbatim-confirmed and the join doesn't reverse or
manufacture Spinoza's sense (it's literally his chapter's throughline).
`attr`: `"Baruch Spinoza (d. 1677), Tractatus Theologico-Politicus (Elwes
transl., 1883), ch. XI."` Added `spinoza-tractatus-theologico-politicus` well
slug. Two confirmed **dead ends worth recording for this same contradiction
family**: William Henry Burr's *Self-Contradictions of the Bible* (1860) has
a proposition (#144, the book's *last* one) headed "ALL SCRIPTURE IS
INSPIRED" / "SOME SCRIPTURE IS NOT INSPIRED" that juxtaposes exactly 2 Tim
3:16 against 1 Cor 7:6/7:12/2 Cor 11:17 — extremely on-topic by structure,
directly confirmed verbatim via curl — but per the id-487 lesson, Burr's
whole book is bare scripture-vs-scripture juxtaposition with **zero original
prose**, so it fails "the critic's own words engaging the tension," not just
re-quoted Scripture; William S. Bell's *A Handbook of Freethought* (Gutenberg
#45414) independently reproduces this identical Burr proposition verbatim
(same two-heading structure) elsewhere in the same book has an *original*
11-point "reasons the Bible isn't inspired" list whose point 6 discusses
2 Tim 3:16 but argues a different objection (semantic vagueness of
"inspiration"; gospels didn't exist when Paul wrote) — on-topic verse, off-
topic argument, not usable. `DRY_RUN=1 IDS=549 node
.scripts/buildHarmonizationTables.js` → 0 violations, parity 1/1 (reconcile
pole's 1 quote is the machine file's JFB excerpt).

## `buildDiscrepancyQuotes()` never falls back to the machine excerpts
Confirmed by reading `.scripts/buildHarmonizationTables.js` directly: reconcile-pole
quotes bake from **both** `machine.<id>.json`'s `excerpts[pole=reconcile]` **and**
`dossier.reconcile.quotes[]`. Discrepancy-pole quotes come **only** from
`dossier.discrepancy.quotes[]` when a dossier file exists for the id — even if the
machine file has verified `pole:"discrepancy"` excerpts sitting right there (e.g. id
301's machine file has K&D and TYN tagged `pole:"discrepancy"`), those are **not**
auto-baked. T10's job is specifically to hand-add an independently-sourced critic voice,
never to promote/copy the machine file's own discrepancy-pole excerpts into the dossier
as if they were a found T10 source.

## Documented "could not source" case: id 301 (2 Kings 25:8 "seventh day" vs
Jeremiah 52:12 "tenth day" — date the temple burned)
Spent significant search effort (2026-07-01) and found **no** PD critic who
discursively engages this specific 7th-vs-10th-day discrepancy with a quotable
argument — reported `STATUS id=301 critic=NONE verified=no`, left `discrepancy.note`
null and `discrepancy.quotes` `[]` (honest absence), per the task's explicit "could not
source is a valid outcome" clause. Checked and downloaded/grepped full text (**no hit**
on Nebuzaradan / the date variant / "seventh day"+"tenth day" together, in any of these)
for: William Henry Burr's *Self-Contradictions of the Bible* (1859/60); G. W. Foote &
W. P. Ball's *The Bible Handbook* (1888); John E. Remsburg's *The Bible* (1911,
Gutenberg #46737); Thomas Paine's *Age of Reason* Part I (Gutenberg #3743) — Part II
(infidels.org) *does* critique Jer. 52 as a redundant/disordered appendix but never
touches the burning-date numeral itself; Robert Ingersoll's *About the Holy Bible*
(infidels.org, no mention at all); T. K. Cheyne's *Jeremiah: His Life and Times* (1888,
archive.org, narrates the 7th-day date with no discrepancy flag); Abraham Kuenen's
*The Religion of Israel* vol. 2 (wrong period coverage); Julius Wellhausen's
*Prolegomena to the History of Israel* (Gutenberg #4732, wrong scope — Hexateuch source
criticism, not Kings/Jeremiah historical detail); George Adam Smith's *Jerusalem*
(1907, archive.org, zero "Nebuzaradan" hits); *Encyclopaedia Biblica* vol. II E–K
(Cheyne/Black 1901, archive.org — the "Jerusalem" article narrates the burning with no
date-variant footnote; the "Nebuzaradan" entry proper is alphabetically in vol. III,
not checked); John W. Haley's *An Examination of the Alleged Discrepancies of the Bible*
(1874, archive.org — confirms the dossier's own `deeper_learning.defense` citation:
Haley cites **Bähr**'s numeral-confusion explanation for this exact verse pair in his
"HISTORICAL DISCREPANCIES" catalog p.393 — but that's the *harmonizing* side, and
Haley's own catalog entries are bare side-by-side verse listings, not argued skeptic
prose, so neither Haley nor Bähr is usable as a T10 critic here).

**Takeaway for future T10 legs:** dry chronological/numeral minutiae buried in
historical narrative (Kings/Chronicles/Jeremiah day-counts, regnal-year variants, troop
counts) are comparatively under-served by the classic 19th-c. PD "skeptic" canon (Paine,
Ingersoll, Burr, Foote & Ball, Remsburg) — those authors gravitate to theologically or
morally charged contradictions (creation order, genocide commands, resurrection
accounts) rather than granular date/number variants. The critical/text-critical
commentators who *do* discuss these variants at the right grain (K&D, Bähr via Haley,
the Cambridge Bible for Schools "letter-confusion" note) are harmonizers, not skeptics —
they concede the discrepancy exists but explain it away, which is exactly what a
`reconcile` pole already wants; they don't satisfy T10's need for a critic voice. Before
declaring "could not source" on this class of contradiction, it may still be worth
checking Wellhausen/Stade/Duhm-style German source-critical commentaries if an English
translation exists (numeral-corruption-as-genuine-error is closer to their
methodological home turf than the Anglophone popular-skeptic canon) — but budget search
time accordingly and don't over-invest once ~8-10 full-text greps come up empty.
