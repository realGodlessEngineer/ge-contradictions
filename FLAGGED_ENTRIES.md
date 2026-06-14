# Flagged Entries — DB-side Repair Checklist

30 contradictions were flagged during the enrichment/audit pipeline for **human /
DB-side review**. All 30 are fully enriched and none carry `recommend_delete = 1`
— they are data-quality and editorial review items, not deletions.

Sources: `AUDIT_METRICS.md` (per-batch footnotes), per-entry scholar notes stored
in the entries' own `commentary`/`scholarship` text, and direct DB diagnostics
(malformed references, duplicate answer reference-sets, question/URL-slug
mismatch) run 2026-06-05.

**Separate item — ✅ RESOLVED 2026-06-06:** id **116** ("How should parents be
treated?") was the one entry with `recommend_delete = 1` (broken scrape — both
answers cited only Matthew 23:9). Repaired against the live page: answer 252 → honor
cluster (Exod 20:12, Deut 5:16, Prov 1:8, 23:22, Eph 6:2); answer 253 → forsake
cluster (Matt 23:9, Luke 9:59-60, 14:26, John 2:3-4). Enriched (summary/commentary/
scholarship) and `recommend_delete` cleared. (DB-wide superset adds Mal 4:6 / Luke
2:48-49 / Matt 12:47-49 — left out as optional breadth.)

**How to act on one:** open `db_manager` (`cd db_manager && npm start` →
`http://localhost:3300`) and edit the entry, or patch via
`PATCH /api/contradictions/:id/scholarship`. URL slugs below are the
`skepticsannotatedbible.com/contra/<slug>.html` (or secondary-source) page.

---

## ✅ Resolution status — updated 2026-06-06

Processed through the `exportFlagged.js → biblical-contradiction-scholar →
biblical-scholar-auditor → importFlagged.js` pipeline and imported to
`contradictions.db` (backup: `contradictions.db.bak-2026-06-06T01-47-18-920Z`;
SQL snapshot `db/data.sql` refreshed). The audit pass flagged one inconsistency
(581's prose still quoted the Sower parable after its refs were corrected); that
was fixed and re-verified before import.

- **26 resolved / cleared & imported** via the pipeline — all of Group A (10),
  Group B except 490, Group C's 514, all of Group D (verified accurate, mostly no
  change), and Group E.
- **4 closed via db_manager** (2026-06-06; pre-edit backup `contradictions.db.bak-premanual-*`):
  - **385** — **hard-deleted**: "son of David" vs "Son of God" is a category error, not a
    contradiction; the genuine genealogical version is already entries 386–389.
  - **490** — **repointed** to the genuine same-event conflict: question reframed to the
    Jericho entering-vs-leaving location (and one-vs-two blind men) issue
    (`contra/jericho.html`; Matt 20:29-34 / Mark 10:46-52 vs Luke 18:35-43), with the
    leaked "PRELIM FLAG" summary text removed.
  - **476** — **kept as-is**: a coherent 3-way contradiction (Joseph / Joseph+Nicodemus /
    the Jews in Acts 13); the earlier "split" suggestion was unnecessary.
  - **520** — **kept**: distinct SAB page (`true.html`) from 519 (`Jesus_witness.html`) with
    a different question and answer grouping — not a true duplicate.

**All 30 flagged entries are now resolved.** DB: 605 contradictions / 1329 answers /
2856 references; `db/schema.sql` + `db/data.sql` regenerated.

---

## A · Malformed / wrong Bible references — concrete data fix (10)

- [x] **233** `abiathar` — *Was Abiathar the father or the son of Ahimelech?* — reference `24:6` is missing its book name.
- [x] **236** `amalekites` — *Did Saul and Samuel kill all the Amalekites?* — references `33` and `17` are missing book names.
- [x] **307** `jeconiah` — *Was Jeconiah childless?* — reference `1 Chronicles 3.17-18:` uses a period for the colon and has a trailing colon.
- [x] **317** `jehoiakim_death` — *Did Jehoiakim die in Babylon or near Jerusalem?* — reference `Jeremaih 22:18-19` misspells the book (→ `Jeremiah`).
- [x] **335** `gold` — *How much gold, silver, and clothing did the people give?* — reference `Nehemaih 7:72` misspells the book (→ `Nehemiah`).
- [x] **431** `signs` — *Did Jesus perform many signs and wonders?* — reference `16:4` is missing the `Matthew` prefix.
- [x] **436** `capital` — *Does the Bible approve of capital punishment?* — malformed punctuation in the `bibleReferences` array.
- [x] **443** `jesus-good` — *Is Jesus good?* — reference `14` is missing the `John` prefix.
- [x] **540** `voice` — *Did the men with Paul hear the voice?* — reference `Acts.22:9` uses a period separator (scrape artifact).
- [x] **581** `is-it-okay-to-ask-for-things-while-praying` — *Is it okay to ask for things while praying?* — wrong references (`Luke 8:5`/`8:7` are Parable-of-the-Sower citations); correct proof-texts are `Luke 11:5-13` + `Luke 18:1-8`. The contradiction itself is coherent.

## B · Question/answer join errors — re-scrape or re-title (3)

- [x] **428** `john-recognize` — *Did John the Baptist recognize Jesus as the Son of God?* — answer text garble: `John 7:19` should be `Luke 7:18-20`.
- [x] **433** `parables` — *Did Jesus always speak in parables?* — one answer is an empty "No" (missing answer content).
- [x] **536** `meat` — *Is circumcision required?* — **title/verses mismatch**: the URL slug is `meat.html` and the verses (`1 Cor 8:4-8`, `Acts 15:28-29`) are about food offered to idols. Re-title to "Should Christians eat food offered to idols?" **or** swap the verses (`Gen 17:10-14` vs `Gal 5:2`).

## C · Structural — split or consolidate (4)

- [x] **476** *(kept as-is)* `buried` — *Who buried Jesus?* — Joseph + Nicodemus + `Acts 13:27-29` burial-attribution conflation; **two-entry split** candidate.
- [x] **490** *(repointed → jericho.html)* `bethsaida` — *Where did Jesus cure the blind man?* — conflates Bethsaida (`Mark 8:22-25`) with Siloam (`John 9`) — different events. Suggested replacement: Jericho blind men (`Matt 20:29-34` / `Mark 10:46-52` / `Luke 18:35-43`).
- [x] **514** `Jesus-went` — *Where did Jesus go when he died?* — the "Hell" answer cites only the Apostles' Creed; add the biblical anchor `1 Pet 3:18-20` + `4:6`.
- [x] **520** *(kept — distinct from 519)* `true` — *Was Jesus's witness of himself true?* — functional **duplicate of 519** (`John 5:31` vs `8:14`/`8:18`); consolidation candidate.

## D · Weak / mild harmonization — editorial caveat, likely no fix (11)

> These were flagged so a human could confirm the framing. The audit notes them
> as substantively well-handled in the commentary; review the wording and clear
> the flag if it reads fine.

- [x] **385** *(hard-deleted)* `Son_of_David` — *Was Jesus the son of David?* — scholar note: "weak as stated"; reframe around the genealogical contradiction (already covered in 386–389) or revise.
- [x] **415** `cast_out` — *Is casting out devils a sign of a true Christian?* — rests on the Mark 16 Longer Ending; well-handled in commentary.
- [x] **417** `jews` — *What will happen to Jews when they die?* — "sons of the kingdom" interpretive framing; well-handled in commentary.
- [x] **455** `seejesus` — *Will Jesus's second coming be visible to all?* — weak proof-text framing on `John 14:19` Parousia; already caveated in commentary.
- [x] **477** `dawn` — *When did the women (or woman) arrive at the sepulchre?* — weakest harmonization in the resurrection cluster (30–45 min Greek timing window).
- [x] **551** `tongues` — *Should you speak in tongues?* — Paul's public-vs-private distinction (`1 Cor 14:8-9` critiques uninterpreted tongues, not a blanket ban).
- [x] **555** `burden` — *Should we bear each other's burdens?* — KJV artifact of the `barē`/`phortion` lexical distinction (`Gal 6:2` vs `6:5`).
- [x] **556** `discuss` — *Should believers discuss their faith with non-believers?* — different scenarios in 1 Peter vs the Pastorals/Johannine letters.
- [x] **559** `enoch_die` — *Did Enoch die?* — "these all" in `Heb 11:13` most naturally restricted to the `11:8-12` cluster.
- [x] **565** `the-hydrological-cycle` — *How does the water cycle work according to the Bible?* — genre mismatch (`Eccl 1:7` observational poetry vs `Job 38:22` storehouse cosmology); mild.
- [x] **578** `is-it-okay-to-get-angry` — *Is it okay to get angry?* — `Eph 4:26` quotes `Ps 4:4` LXX as regulation, not endorsement; mild.

## E · Reason not recorded — manual review (2)

- [x] **280** `jehoshaphat` — *Did Jehoshaphat remove the high places?* — no data defect detected; commentary treats it as a genuine Chronicler editorial tension. Confirm whether the flag is still warranted.
- [x] **398** `this_or_thou` — *How did God address Jesus at his baptism?* — no recorded reason and no defect detected; eyeball and clear if fine.

---

### Summary

| Group | Count | Nature |
|---|---|---|
| A. Malformed/wrong references | 10 | Concrete `bibleReferences` fixes |
| B. Question/answer join errors | 3 | Re-scrape or re-title |
| C. Structural | 4 | Split / consolidate / add anchor |
| D. Weak harmonization | 11 | Editorial caveat, likely no change |
| E. Reason not recorded | 2 | Manual review |
| **Total** | **30** | |

All 30 IDs: `233, 236, 280, 307, 317, 335, 385, 398, 415, 417, 428, 431, 433, 436, 443, 455, 476, 477, 490, 514, 520, 536, 540, 551, 555, 556, 559, 565, 578, 581`

---

## ✅ Addendum — DB-wide malformed-reference scan (RESOLVED 2026-06-06)

A full-database scan (after the 30 + 116 were closed) turned up **27 more malformed
`bibleReferences` across 21 contradictions** that were never in the flagged set — same
class as Group A (bare numbers missing a book, trailing colons, period-for-colon). The
original diagnostic only checked the 30 known entries, so these slipped through.

**All 27 fixed** via `exportMalformed.js → biblical-contradiction-scholar (×3) →
biblical-scholar-auditor → importFlagged.js` (auditor verdict CLEAN; backup
`contradictions.db.bak-2026-06-06T02-35-50-853Z`). DB-wide malformed-reference count is
now **0**. Each bare number was recovered from its surrounding cluster + the
`answerExplanation` inline text (only id 126's `-6` needed the live page → `Amos 6:6`).

| Contradiction id | Malformed reference(s) |
|---|---|
| 8 | `45:21` |
| 9 | `9:1`, `9:7`, `35:11` |
| 36 | `7:1` |
| 37 | `20`, `20` |
| 57 | `12:4` |
| 60 | `22` |
| 101 | `48:15`, `50:34` |
| 108 | `16:20` |
| 115 | `18-20` |
| 118 | `13:9` |
| 119 | `20:22` |
| 126 | `-6` |
| 134 | `107:1`, `118:1`, `136:1` |
| 142 | `30` |
| 181 | `Genesis 38:` (trailing colon) |
| 194 | `Judges 1:29:` (trailing colon) |
| 265 | `1 Kings 7.26` (period-for-colon) |
| 346 | `53:1` |
| 347 | `53:3` |
| 379 | `9:3` |
| 486 | `2:1` |

### Note-cleanup pass — ✅ DONE 2026-06-06

A DB-wide scan for embedded data-quality notes found **30 entries**, handled via
`exportNoteCleanup.js → biblical-contradiction-scholar (×5) → biblical-scholar-auditor →
importFlagged.js` (backup `…bak-2026-06-06T02-51-03-992Z`). Per entry the agent either
removed a stale note, or **fixed the still-broken data the note flagged, then removed it**.
The cleanup additionally repaired **9 issues my format-only scan had missed** (book-name
misspellings caught because they contain letters, plus junk strings and a wrong ref):

- Misspelled book in `bibleReferences`: **27** (`2 Chrornicles`→`2 Chronicles`), **123**
  (`Deuteronly`→`Deuteronomy`), **152** (`Ecclesiates`→`Ecclesiastes` ×2, `Jeremaih`→`Jeremiah`),
  **369** (`Revevlation`→`Revelation`).
- Wrong reference: **361** (`2 Timothy 2:6`→`1 Timothy 2:6`, the antilytron verse).
- Non-verse junk removed from a `bibleReferences` array: **38, 183, 371**.
- Duplicated word in the question: **499** (`"when the when the"`→`"when the"`).
- **id 126 deeper fix**: recombined the split `Amos 6:1` + `Amos 6:6` into `Amos 6:1-6`,
  repositioned `Isaiah 5:22`, and deleted the factually-wrong "Isaiah 5:22-6" commentary note.

Kept as legitimate (not notes): **149** (deuterocanonical-scope scholarship), **398**
(analysis of the source's malformed Yes/No labels — the one entry that still matches the
note-scan, by design).

**581 — ✅ resolved 2026-06-06** (the one escalation): its references were already correct
(Luke 11:5-13 / 18:1-8 vs Matthew 6:7-8), but its `summary`/`commentary` still narrated the
old Sower-citation scrape error. Rewritten to present the importunity contradiction
directly; meta-prose removed, all five citations preserved.

**Audit gate.** The 9 data fixes + id 126 were verified by `biblical-scholar-auditor` →
**CLEAN** (each recovered reference real and consistent with its quote/claim; no dangling
fragments or lost citations). Final DB-wide note-scan: only 398 remains (intentional).

Residual (cosmetic, left as raw scrape): for a few entries (e.g. 27, 123, 183, 194, 307,
317, 369) the old malformed/misspelled citation still appears in the **`answerExplanation`
quote text** (verbatim SAB scrape), though the `bibleReferences` arrays are now correct.
