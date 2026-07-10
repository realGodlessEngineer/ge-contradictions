---
name: commentary-citation-facts
description: consolidated reference of verified academic-commentary volume/scope/page/date facts (from the commentary-expansion batch pipeline audits) — check any pd_work/scholarship citation to these works against this list before flagging or passing
metadata:
  type: feedback
---

Dense reference list, one bullet per verified fact. Organized loosely by scholar/work.

**Volume/scope-fit (which passage a multi-volume set actually covers):**
- Daniel Block miscited for non-Block commentaries — dominant Vector D pattern in batch_10; verify Block is actually the cited author.
- Klein wrote both 1 Samuel WBC and 1 Chronicles Hermeneia — match volume to passage scope.
- Barthelemy: *Critique textuelle* (OBO 50) vs *Story of David and Goliath* (OBO 73) — the MT-priority 1 Sam 17 argument is in OBO 73.
- Knoppers AB 12/12A covers only 1 Chr, never 2 Chr (2 Chr is Klein Hermeneia or others). AB 12A pp.516-575 = 1 Chr 10-11 only; Davidic genealogy (Maachah/Absalom) is in AB 12. AB 12/12A use continuous pagination (12A = pp.515-1045). His actual chapter in *The Chronicler as Theologian* (JSOTSup 371) is "Shem, Ham, and Japheth" pp.13-31, about 1 Chr 1, NOT Solomon.
- Williamson's Chronicles = NCB 1982, not WBC (WBC Chronicles is Braun/Dillard).
- Dillard (WBC) and Selman (TOTC) paired for 2 Chr — both need scholarship entries (parity).
- McKenzie *1 Kings 16 - 2 Kings 16* (2019) is IECOT/Kohlhammer — no AYB 10A exists.
- Cogan AB 10, 1 Kgs 16:31 Ahab/Jezebel/Ethbaal, is pp.418-422, not pp.343-345.
- Holladay Jeremiah: Vol 1 (1986) = chs 1-25; Vol 2 (1989) = chs 26-52.
- Lundbom AB Jeremiah: ch.22 belongs to 21B (Jer 21-36), not 21A (Jer 1-20).
- Tsumura 2 Sam NICOT (Eerdmans 2019) is 320pp total — cites >320 are hallucinated.
- Merrill's NAC is Deuteronomy; his Chronicles commentary is Kregel 2015, not NAC.
- Hess's Jericho/Ai essay is BBR Supp 3 / Eisenbrauns 2008, not Hoffmeier/Millard Eerdmans 2004.
- Goldingay-Payne ICC Psalms: Vol I = 2006, Vol II = 2007.
- Multi-volume sets commonly drift on year: verify each volume year independently (Davies-Allison/Luz/Cogan/Knoppers/Klein/Tsumura/Keener/Aune/Brown all seen drifting).
- Hossfeld-Zenger Hermeneia Psalms Vol 1 (Pss 1-50) exists ONLY in German — English citations for Pss 1-50 are fabricated. Vol 2/3 pagination drifts +3 to +8 from cited ranges (verified anchors exist in the topic file); Ps 89 commentary = pp.399-415 not pp.305-318; Ps 92 also drifts (Hermeneia TOC sweep pass 10).
- Thrall ICC 2 Cor Vol 2 (T&T Clark 2000) is 475pp; NOT continuous pagination with Vol 1.
- Aune Revelation WBC 52A/52B/52C ARE continuously paginated — pp.819-832 = 52B not 52C.
- Betz Hermeneia 2 Cor covers chs 8-9 ONLY — don't cite for any other 2 Cor passage.
- Brown AB John: Vol 29 (I-XII, 1966) = pp.1-538; Vol 29A (XIII-XXI, 1970) = pp.539-1208, continuous — high page numbers for 29A are NOT automatically impossible.
- Brown Death of the Messiah (DM): Vol 1 = pp.1-879; Vol 2 = pp.880-1608 — "Vol.2...pp.<880" is always wrong. DM scope STOPS at the empty tomb — cite Brown's Gospel commentaries (not DM) for post-resurrection appearances. DM Judas: Vol1 pp.209-213/256-259 is Gethsemane prayer NOT Judas — cite §29 (pp.734-761) + Vol2 (pp.1394-1418) for Judas.
- Brown's *Birth of the Messiah* (1977/1993) precedes *Death of the Messiah* (1994); Birth is infancy-only, never resurrection — don't conflate.
- Davies-Allison ICC Matthew Vol 3: Empty Tomb section (Matt 28:1-15) = pp.659-675 (not 663-680, overshoots by 5); Peter denial = pp.540-551 (NOT pp.511-516, which is the arrest section). Standard author-order cite is "Davies, W. D., and Dale C. Allison." — don't invert.
- Marcus Mark: Vol 1 (AB 27, Doubleday 2000 first ed, NOT Yale UP — AB→AYB rebrand was 2007) ends at Mark 8:21 (~p.568); Vol 2 (AYB 27A, 2009) starts at 8:22 (Bethsaida) and uses CONTINUOUS pagination from Vol 1 (~pp.569-1183) — citations above p.700 are NOT impossible. AYB 27A is the correct imprint for Mark 8-16 (not "AB 27A").
- Bovon Luke (Hermeneia): Vol 1 Sermon on Plain/Beatitudes-Woes (Lk 6:20-26) = pp.220-229 (pp.230-245 is the next pericope); full Project Muse TOC anchor table exists in the topic file (book ID 45977). Vol 3 TOC anchor table also exists (book ID 45979, NOT 45975).
- Luz Matthew 8-20 (Hermeneia): three major-section page-range anchors exist in the topic file (Project Muse 45974).
- Hermeneia TOC sweep pass-11 also caught Malherbe pericope-page drift (alongside Bovon/Luz/Betz) — verified anchors exist in the topic files, always check the specific pericope range before citing.
- Jaubert's translator credit is "I. Rafferty," not "Isaac Rafferty" — an initialism-expansion hallucination.
- Carson: Matthew EBC — original 1984 = Vol 8, revised 2010 = Vol 9 (rev. vol 9 spans pp.23-670; pp.671+ belongs to the Mark section, not Carson). Carson's John commentary is PNTC (1991), NOT EBC — recurring error, caught 4x in one batch.
- Köstenberger BECNT John (Baker Academic 2004) often missing from Synoptic-call entries naming the Carson/Köstenberger/Blomberg trio (parity gap).
- Blomberg Matthew NAC systematically missing from batches naming the same apologist trio (parity gap).
- LCL 433 (1965) = Josephus Books XVIII-XX (not XVIII-XIX as in the current re-pagination).
- Pervo Acts pericope anchors: Acts 9 conversion = pp.230-238 (NOT 240-244, which is a source excursus); Acts 26 = pp.623-629.
- Conzelmann Acts is 287pp total; Acts 21:26 ends p.230; trial narratives are pp.231-242.
- Bultmann's John commentary (Westminster 1971) has a 3-person translator team: Beasley-Murray + Hoare + Riches — not Beasley-Murray alone.
- Westcott's *Gospel of St John* = John Murray 1882 (separate ed.); 1880 = Speaker's Commentary; 1908 = Greek-text ed. — don't conflate.
- Calvin's Catholic Epistles commentary: pp.234-238 cover 1 John 4:6-7, not 4:1-3 or 4:15.
- Klauck *Judas: A Disciple of Jesus* (2006) is Liturgical Press Collegeville, not Fortress.
- Lane NICNT Mark 16:9-20 discussion is pp.601-611 (pp.591-595 covers Mark 16:1-8).
- Metzger TCGNT Mark 16:9-20: 1st ed (1971) = pp.102-106; 2nd ed (1994) = pp.102-107.
- Markus Barth's AB Ephesians DEFENDS Pauline authorship — don't group him with the deutero-Pauline camp.
- Dunn's BNTC Galatians is Peabody:Hendrickson or London:A&C Black — never "London:Hendrickson."
- Luther's "strawy epistle" phrase is from the 1522 Preface to the NT (LW 35:357-362), not a James/Jude-specific preface.

**Editor/author-credit and title-precision:**
- Grabbe's *Ahab Agonistes* (LHBOTS 421) is an edited conference volume — cite Grabbe as "ed.," not sole author.
- Series-name precision matters: "Smyth & Helwys Bible Commentary" and "Abingdon OT Commentaries" (plural) get truncated/mis-pluralized by late passes — verify exact series name.
- Translator names need intra-batch consistency (e.g. "James E. Crouch" with initial, used consistently).
- Heth-Wenham has two differently-subtitled editions: Hodder 1984 = "Towards an Evangelical Understanding"; Thomas Nelson 1985 = "Problem with the Evangelical Consensus."
- Geisler-Howe *When Critics Ask* (1992) original is Wheaton: Victor Books, NOT Grand Rapids: Baker (Baker is a later reprint).
- Levenson *Sinai and Zion*: 1985 ed. = Winston Minneapolis (Ch.2 ends p.178); 1987 ed. = Harper SF — don't conflate editions.
- James commentary series-author grid: Blomberg=ZECNT, Moo=Pillar, Davids=NIGTC, Martin=WBC, Johnson=AB37A, Allison=ICC — AI drafts scramble these.
- Loeb Josephus Antiquities Books 5-8 (Vol V, 1934) credits BOTH Thackeray and Marcus as translators, not Marcus alone.

**Journal/fascicle citation drift (merge of several small journal-precision facts):**
- CBQ/journal-article first-page numbers drift +1 in AI drafts — verify against ProQuest/JSTOR.
- AI assigns wrong issue/fascicle number to VT/JBL articles — verify against Brill/JSTOR records.
- Murphy-O'Connor's real RB article is RB 112 (2005) "Sites associated with John the Baptist" — a fabricated "RB 117 (2010) 'Bethany Beyond the Jordan'" was invented (journal title-substitution hallucination).
- Andreasen's Queen Mother article is CBQ 45 (1983), pp.179-194, not JBL.
- Knoppers's BASOR 289 article title is "Treaty, Tribute List, or Diplomatic Letter: KTU 3.1 Reexamined" — uses a colon, not a question mark.
- Aejmelaeus: her Old Greek 1 Samuel essay is in the Helsinki 2010 volume (VTSup 148), not Ljubljana 2007; her Trebolle Festschrift piece ("Corruption or Correction?") is JSJSup 157 (not VTSup 157), pp.1-17; her first name is Anneli, not Anna (AI substitutes "Anna" via token frequency).
- Bowen's gebira article is CBQ 63 (2001) "Quest OF the Historical Gebira" (not "for").

**Miscellaneous:**
- Total verified page-count anchors for several sets live in the topic file (`feedback_total_page_count_anchors.md`) — check before flagging an out-of-range citation as hallucinated.
- Keil-Delitzsch cited as "earlier harmonization" in Samuel/Judges batches needs its own specific BCOT-volume scholarship entry (parity), separate from the general K&D name-drop.
- WBC 2nd editions: Klein 1 Samuel 2nd ed = Thomas Nelson 2000 (not 2008); Butler Joshua 2nd ed = Zondervan 2014 (not Thomas Nelson).
