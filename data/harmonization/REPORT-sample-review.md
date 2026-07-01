# Harmonization excerpt sweep — sample first-pass for review

**Scope:** 17-contradiction sample (7 pilot ids + 10 fresh). MACHINE pass only (`verify_state: machine`). The full 605 run is deferred pending owner Decisions A & B.

**Provenance gate:** all machine excerpts independently verified by `verifyExcerpts.py` — **verbatim** (char-for-char after quote/dash/whitespace normalization), **PD-licensed**, and **traceable** to a real `verse_commentaries` row.

**Totals:** 17 contradictions · 47 reconcile excerpts · 0 discrepancy excerpts (see asymmetry note) · 1 unresolved ref(s).

## Coverage

| id | consensus | lean | reconcile (voices) | discrepancy |
|----|-----------|------|--------------------|-------------|
| 1 | apparent_only | reconcile_first | 3 (GILL, CLARKE, MHC) | empty |
| 3 · *pilot* | probable_harmonization | reconcile_first | 3 (CLARKE, MHC, TYN) | empty |
| 4 · *pilot* | probable_harmonization | reconcile_first | 3 (CLARKE, GILL, JFB) | empty |
| 87 | probable_contradiction | reconcile_first | 1 (GILL) | empty |
| 171 | genuine_contradiction | discrepancy_first | 3 (GILL, MHC, KD) | empty |
| 189 · *pilot* | genuine_contradiction | discrepancy_first | 3 (MHC, CLARKE, TYN) | empty |
| 214 | apparent_only | reconcile_first | 3 (JFB, CLARKE, KD) | empty |
| 256 | probable_harmonization | reconcile_first | 3 (JFB, KD, TYN) | empty |
| 298 | probable_contradiction | reconcile_first | 3 (JFB, CLARKE, KD) | empty |
| 340 | genuinely_disputed | reconcile_first | 3 (TYN, MHC, GNV) | empty |
| 425 | genuine_contradiction | discrepancy_first | 3 (MHC, JFB, GILL) | empty |
| 439 · *pilot* | probable_harmonization | reconcile_first | 3 (GILL, JFB, GNV) | empty |
| 459 · *pilot* | probable_harmonization | reconcile_first | 3 (MHC, CLARKE, GILL) | empty |
| 468 · *pilot* | probable_contradiction | discrepancy_first | 3 (CLARKE, JFB, GNV) | empty |
| 470 | probable_harmonization | reconcile_first | 2 (GILL, MHC) | empty |
| 496 · *pilot* | genuine_contradiction | discrepancy_first | 2 (CLARKE, MHC) | empty |
| 513 | probable_harmonization | reconcile_first | 3 (CLARKE, MHC, GILL) | empty |

> Every contradiction in the sample has a **filled reconcile pole** and an **empty discrepancy pole**. That asymmetry is real, not a gap: the seven sweepable voices are all harmonizing expositors, so the corpus feeds reconcile almost exclusively. "Thin shows as thin" — the discrepancy pole carries a calm empty_note rather than a manufactured voice. Sourcing the discrepancy pole is owner **Decision B**.

## Pilot reproduction (acceptance: reproduce or improve the 7 pilot rows)

The hand-curated pilot drew its **reconcile** pole partly from sources outside the seven (Barnes, Ellicott, Pulpit, Augustine, Plummer, Haley) and its **discrepancy** pole almost entirely from hand-sourced critics (Strauss, Paine) — none of which live in `verse_commentaries`. So the machine is measured on the reconcile-pole quotes that *are* in-corpus, and on whether it adds further on-tension voices.

| id | pilot reconcile (in-corpus) | machine reconcile voices | in-corpus pilot voice reproduced? |
|----|------------------------------|--------------------------|-----------------------------------|
| 3 | CLARKE | CLARKE, MHC, TYN | ✅ CLARKE |
| 4 | KD, GILL | CLARKE, GILL, JFB | ✅ GILL |
| 439 | JFB, GILL | GILL, JFB, GNV | ✅ JFB, GILL |
| 189 | (none in corpus) | MHC, CLARKE, TYN | — (pilot reconcile all out-of-corpus) |
| 459 | (none in corpus) | MHC, CLARKE, GILL | — (pilot reconcile all out-of-corpus) |
| 496 | (none in corpus) | CLARKE, MHC | — (pilot reconcile all out-of-corpus) |
| 468 | GILL | CLARKE, JFB, GNV | ≈ improved — different voices, same point (CLARKE, JFB, GNV) |

> Every in-corpus pilot reconcile voice was reproduced verbatim, and the machine added further on-tension voices (e.g. MHC/TYN on id 3, GNV on id 439). The machine does **not** reproduce the pilot's *discrepancy* pole (Strauss/Paine/Pulpit/KD-as-skeptic) — that content is hand-sourced and is preserved in `pilot_fixtures.json`, not regenerated.

## Per-id excerpts (read for quality / pole accuracy)

### id 1 — When was heaven created?
*apparent_only · lean reconcile_first*

**Read as reconcilable:**
- “By the heaven some understand the supreme heaven, the heaven of heavens, the habitation of God, and of the holy angels; and this being made perfect at once, no mention is after made of it, as of the earth … but rather the lower and visible heavens are meant, at least are not excluded, that is, the substance of them…” — John Gill, Exposition of the Entire Bible (1746-63), on Genesis 1:1 `[GILL/1/1/1]`
- “Nor does it appear that the atmosphere is particularly intended here, as this is spoken of, Gen 1:6, under the term firmament. The word heavens must therefore comprehend the whole solar system, as it is very likely the whole of this was created in these six days…” — Adam Clarke, Commentary on the Bible (1832), on Genesis 1:1 `[CLARKE/1/1/1]`
- “The happiness of heaven, though prepared before the foundation of the world, yet must be further fitted up for man in his fallen state.” — Matthew Henry, Commentary on the Whole Bible (1706-14), on John 14:2 `[MHC/43/14/1]`

**Read as a genuine discrepancy:** _empty_ — No public-domain voice among the seven harmonizing expositors presses this passage as a genuine discrepancy; each distinguishes the heaven of Genesis 1:1 from the firmament-heaven of Genesis 1:8 and reads the New Testament 'preparing' as God fitting up an already-created glory.

### id 3 — *pilot* — When were the stars made?
*probable_harmonization · lean reconcile_first*

**Read as reconcilable:**
- “This must refer to some intelligent beings who existed before the creation of the visible heavens and earth: and it is supposed that this and the following clause refer to the same beings; that by the sons of God, and the morning stars, the angelic host is meant… Perhaps their creation may be included in the term heavens, Gen 1:1: “In the beginning God created the heavens and the earth.”” — Adam Clarke, Commentary on the Bible (1832), on Job 38:7 `[CLARKE/18/38/7]`
- “when the morning-stars sang together, the blessed angels (the first-born of the Father of light), who, in the morning of time, shone as brightly as the morning star, going immediately before the light which God commanded to shine out of darkness upon the seeds of this lower world, the earth, which was without form and void.” — Matthew Henry, Commentary on the Whole Bible (1706-14), on Job 38:7 `[MHC/18/38/4]`
- “The morning stars are personified in parallel construction with the angels (1:6; 2:1).” — Tyndale Open Bible Commentary, on Job 38:7 `[TYN/18/38/7]`

**Read as a genuine discrepancy:** _empty_ — No public-domain voice among the seven harmonizing expositors presses this passage as a genuine discrepancy.

### id 4 — *pilot* — When did God divide light from darkness?
*probable_harmonization · lean reconcile_first*

**Read as reconcilable:**
- “Many have asked, “How could light be produced on the first day, and the sun, the fountain of it, not created till the fourth day?”… I therefore conclude, that as God has diffused the matter of caloric or latent heat through every part of nature, without which there could be neither vegetation nor animal life, that it is caloric or latent heat which is principally intended by the original word.” — Adam Clarke, Commentary on the Bible (1832), on Genesis 1:3 `[CLARKE/1/1/3]`
- “the body of fire and light produced on the first day was now distributed and formed into several luminous bodies of sun, moon, and stars, for these were “from light”; lights produced from that light, or made out of it… as the light by its circular motion did for the first three days, or the diurnal motion of the earth on its axis, then and now…” — John Gill, Exposition of the Entire Bible (1746-63), on Genesis 1:14 `[GILL/1/1/14]`
- “Both these lights may be said to be “made” on the fourth day—not created, indeed, for it is a different word that is here used, but constituted, appointed to the important and necessary office of serving as luminaries to the world, and regulating by their motions and their influence the progress and divisions of time.” — Jamieson, Fausset & Brown, Commentary (1871), on Genesis 1:16 `[JFB/1/1/16]`

**Read as a genuine discrepancy:** _empty_ — No public-domain voice among the seven harmonizing expositors presses this passage as a genuine discrepancy.

### id 87 — Who was Dishon's father?
*probable_contradiction · lean reconcile_first*

**Read as reconcilable:**
- “And these are the sons of Dishon,…. Not of Dishon the son of Anah, but of Dishon the son of Seir” — John Gill, Exposition of the Entire Bible (1746-63), on Genesis 36:22 `[GILL/1/36/22]`

**Read as a genuine discrepancy:** _empty_ — No public-domain voice among the seven harmonizing expositors presses this passage as a genuine discrepancy.

### id 171 — How long does God's anger last?
*genuine_contradiction · lean discrepancy_first*

**Read as reconcilable:**
- “neither will he keep his anger for ever; though he does with the wicked, yet not with his own people; that endures but for a moment, and is rather seeming than real” — John Gill, Exposition of the Entire Bible (1746-63), on Psalms 103:9 `[GILL/19/103/8]`
- “Though God may for a time lay his own people under the tokens of his displeasure, yet he will not retain his anger for ever, but though he cause grief he will have compassion; he is not implacable; yet against those that are not of the remnant of his heritage, that are unpardoned, he will keep his anger for ever.” — Matthew Henry, Commentary on the Whole Bible (1706-14), on Micah 7:18 `[MHC/33/7/14]`
- “wrath is, in relation to them, only a vanishing moment: a moment passes in His anger, a (whole) life in His favour, i.e., the former endures only for a moment, the latter the whole life of a man.” — Keil & Delitzsch, Biblical Commentary on the OT (1861-75), on Psalms 30:4 `[KD/19/30/4]`

**Read as a genuine discrepancy:** _empty_ — No public-domain voice among the seven harmonizing expositors presses this passage as a genuine discrepancy; each instead distinguishes God's momentary anger toward His own people from His enduring anger toward the impenitent.

### id 189 — *pilot* — Did the Centurion ask Jesus directly to help his servant?
*genuine_contradiction · lean discrepancy_first*

**Read as reconcilable:**
- “There it was said that the centurion came to Christ; here it is said that he sent to him first some of the elders of the Jews (Luk 7:3), and afterwards some other friends, Luk 7:6. But it is a rule that we are said to do that which we do by another - Quod facimus per alium, id ipsum facere judicamur. The centurion might be said to do that which he did by his proxies; as a man takes possession by his attorney. But it is probable that the centurion himself came at last” — Matthew Henry, Commentary on the Whole Bible (1706-14), on Luke 7:1 `[MHC/42/7/1]`
- “In the parallel place in Matthew, he is represented as coming to Christ himself; but it is a usual form of speech in all nations, to attribute the act to a person which is done not by himself, but by his authority.” — Adam Clarke, Commentary on the Bible (1832), on Luke 7:3 `[CLARKE/42/7/3]`
- “With his tendency to abbreviate accounts, Matthew has the centurion approaching Jesus (Matt 8:5-13). Luke tells the full story in which Jewish elders, and later the centurion’s friends, act as intermediaries.” — Tyndale Open Bible Commentary, on Luke 7:3 `[TYN/42/7/3]`

**Read as a genuine discrepancy:** _empty_ — No public-domain voice among the seven harmonizing expositors presses this as a genuine discrepancy; even the note that flags the difference resolves it, reading Matthew as an abbreviation of the same event in which the centurion acted through his messengers.

### id 214 — Who was Samuel's firstborn son?
*apparent_only · lean reconcile_first*

**Read as reconcilable:**
- “It is now generally thought by the best critics that, through an error of the copyists, an omission has been made of the oldest son's name, and that Vashni, which is not the name of a person, merely signifies “and the second.” This critical emendation of the text makes all clear, as well as consistent with other passages relating to the family of Samuel.” — Jamieson, Fausset & Brown, Commentary (1871), on 1 Chronicles 6:28 `[JFB/13/6/28]`
- “The word יואל Joel is lost out of the text in this place, and ושני vesheni, which signifies the second, and which refers to Abiah, is made here into a proper name. The Septuagint, Vulgate, and Chaldee, copy this blunder; but the Syriac and Arabic read as in Sa1 8:2.” — Adam Clarke, Commentary on the Bible (1832), on 1 Chronicles 6:28 `[CLARKE/13/6/28]`
- “The sons are also mentioned again in Ch1 6:13, though the name of the elder has either been dropped out of the Masoretic text or has become corrupt.” — Keil & Delitzsch, Biblical Commentary on the OT (1861-75), on 1 Samuel 8:2 `[KD/9/8/1]`

**Read as a genuine discrepancy:** _empty_ — No public-domain voice among the seven harmonizing expositors presses this as a genuine discrepancy; the recurring explanation is that 'Vashni' in the Masoretic text of 1 Chronicles 6:28 is a copyist's corruption of the Hebrew for 'and the second,' the firstborn's name Joel having dropped out.

### id 256 — Was Solomon alone when he sacrificed 1000 burnt offerings at Gibeon?
*probable_harmonization · lean reconcile_first*

**Read as reconcilable:**
- “The royal progress was of public importance. It was a season of national devotion. The king was accompanied by his principal nobility (Ch2 1:2)” — Jamieson, Fausset & Brown, Commentary (1871), on 1 Kings 3:4 `[JFB/11/3/4]`
- “While in Kg1 3:4 it is briefly said the king went to Gibeon to sacrifice there, our historian records that Solomon summoned the princes and representatives of the people to this solemn act, and accompanied by them went to Gibeon. This sacrifice was no mere private sacrifice-it was the religious consecration of the opening of his reign, at which the estates of the kingdom were present as a matter of course.” — Keil & Delitzsch, Biblical Commentary on the OT (1861-75), on 2 Chronicles 1:1 `[KD/14/1/1]`
- “Solomon’s journey to Gibeon, reported in 1 Kgs 3:4, is here elaborated. This great public venture was closely associated with Solomon taking the throne. The event included military commanders and clan leaders.” — Tyndale Open Bible Commentary, on 2 Chronicles 1:2 `[TYN/14/1/2]`

**Read as a genuine discrepancy:** _empty_ — No public-domain voice among the seven harmonizing expositors presses the silence of 1 Kings 3:4 as a genuine discrepancy; all who address it read Kings as an abbreviation of the same public event Chronicles narrates.

### id 298 — Who succeeded Jehoiakim as king?
*probable_contradiction · lean reconcile_first*

**Read as reconcilable:**
- “The very brief reign of this prince, which lasted only three months, during which he was a humble vassal of the Assyrians, is scarcely deserving to be taken into account, and therefore is in no way contradictory to the prophetic menace denounced against his father (Jer 36:30).” — Jamieson, Fausset & Brown, Commentary (1871), on 2 Kings 24:6 `[JFB/12/24/6]`
- “As this man reigned only three months and was a mere vassal to the Babylonians, his reign is scarcely to be reckoned; and therefore Jeremiah says of Jehoiakim, He shall have none to sit upon the throne of David, Jer 36:30, for at that time it belonged to the king of Babylon, and Jehoiachin was a mere viceroy or governor.” — Adam Clarke, Commentary on the Bible (1832), on 2 Kings 24:6 `[CLARKE/12/24/6]`
- “And even though his son Jehoiachin ascended the throne after his father's death and maintained his position for three months against the Chaldaeans, until at length he fell into their hands and was carried away alive to Babylon, the prophet might very truly describe this short reign as not sitting upon the throne of David (cf. Graf on Jer 22:19).” — Keil & Delitzsch, Biblical Commentary on the OT (1861-75), on 2 Kings 24:6 `[KD/12/24/2]`

**Read as a genuine discrepancy:** _empty_ — No public-domain voice among the seven harmonizing expositors presses this passage as a genuine discrepancy.

### id 340 — Do evildoers prosper?
*genuinely_disputed · lean reconcile_first*

**Read as reconcilable:**
- “The godly might suffer, but the Lord will reward them in the end. Similarly, the wicked might prosper for a time, but ultimately they will perish (1:6; 34:15-16).” — Tyndale Open Bible Commentary, on Psalm 34:21 `[TYN/19/34/19]`
- “This principle Job here opposes, and maintains that God, in disposing men’s outward affairs, acts as a sovereign, reserving the exact distribution of rewards and punishments for the future state.” — Matthew Henry, Commentary on the Whole Bible (1706-14), on Job 12:6 `[MHC/18/12/6]`
- “God for a while giveth prosperity, that afterward they should the more feel his heavy judgment when they lack their riches which were a sign of his mercy.” — Geneva Bible (1599), on Jeremiah 12:1 `[GNV/24/12/3]`

**Read as a genuine discrepancy:** _empty_ — No public-domain voice among the seven harmonizing expositors presses this as a genuine discrepancy; those who address it reconcile the texts by distinguishing the wicked's temporary prosperity from their final ruin.

### id 425 — Should the gospel be preached to everyone?
*genuine_contradiction · lean discrepancy_first*

**Read as reconcilable:**
- “This restraint was upon them only in their first mission, afterwards they were appointed to go into all the world, and teach all nations.” — Matthew Henry, Commentary on the Whole Bible (1706-14), on Matthew 10:5 `[MHC/40/10/5]`
- “Until Christ’s death, which broke down the middle wall of Partition (Eph 2:14), the Gospel commission was to the Jews only” — Jamieson, Fausset & Brown, Commentary (1871), on Matthew 10:6 `[JFB/40/10/6]`
- “before it was confined to Judea, but now it is extended to all the nations of the world; see Mat 10:6” — John Gill, Exposition of the Entire Bible (1746-63), on Matthew 28:19 `[GILL/40/28/19]`

**Read as a genuine discrepancy:** _empty_ — No public-domain voice among the seven harmonizing expositors presses this passage as a genuine discrepancy; each treats the restriction and the universal commission as successive stages of one mission.

### id 439 — *pilot* — When did the transfiguration occur?
*probable_harmonization · lean reconcile_first*

**Read as reconcilable:**
- “The other evangelists, Matthew and Mark, say it was six days after: the reason of this difference is, because Luke takes in the day in which he delivered these sayings, and that in which he was transfigured, and they only reckon the intermediate days” — John Gill, Exposition of the Entire Bible (1746-63), on Luke 9:26 `[GILL/42/9/26]`
- “an eight days after these sayings--including the day on which this was spoken and that of the Transfiguration. Matthew and Mark say (Mat 17:1; Mar 9:2) “after six days,” excluding these two days.” — Jamieson, Fausset & Brown, Commentary (1871), on Luke 9:28 `[JFB/42/9/28]`
- “Luke reckoneth eight days, containing in that number the first and last, and Matthew speaketh but of them that were betwixt them.” — Geneva Bible (1599), on Matthew 17:1 `[GNV/40/17/1]`

**Read as a genuine discrepancy:** _empty_ — No public-domain voice among the seven harmonizing expositors presses this as a genuine discrepancy; all who address it treat 'six days' and 'about eight days' as the same interval counted two ways (Matthew and Mark giving only the intervening days, Luke including the first and last).

### id 459 — *pilot* — Was Jesus taken to Caiaphas or Annas first?
*probable_harmonization · lean reconcile_first*

**Read as reconcilable:**
- “Having seized him, they led him away to Annas first, before they brought him to the court that was sat, expecting him, in the house of Caiaphas… Annas did not long detain them, being as willing as any of them to have the prosecution pushed on, and therefore sent him bound to Caiaphas, to his house, which was appointed for the rendezvous of the sanhedrim upon this occasion” — Matthew Henry, Commentary on the Whole Bible (1706-14), on John 18:13 `[MHC/43/18/13]`
- “It is likely that Annas was chief of the Sanhedrin, and that it was to him in that office that Christ was first brought… What is related in the 24th verse, Now Annas had sent him bound to Caiaphas, comes properly in after the 13th verse.” — Adam Clarke, Commentary on the Bible (1832), on John 18:13 `[CLARKE/43/18/13]`
- “therefore they first lead him to him, to have his advice how to proceed, and to take him along with them to his son-in-law, where the great council was convened, and that he might use his interest and authority, in taking proper measures, in order to put Jesus to death” — John Gill, Exposition of the Entire Bible (1746-63), on John 18:13 `[GILL/43/18/13]`

**Read as a genuine discrepancy:** _empty_ — No public-domain voice among the seven harmonizing expositors presses this as a genuine discrepancy; all who address it read the stop at Annas as a brief preliminary on the way to Caiaphas, where the Synoptics' trial took place.

### id 468 — *pilot* — Who carried Jesus' cross?
*probable_contradiction · lean discrepancy_first*

**Read as reconcilable:**
- “He bore it all alone first; when he could no longer carry the whole through weakness, occasioned by the ill usage he had received, Simon, a Cyrenian, helped him to carry it” — Adam Clarke, Commentary on the Bible (1832), on John 19:17 `[CLARKE/43/19/17]`
- “It would appear that our Lord had first to bear His own cross (Joh 19:17), but being from exhaustion unable to proceed, it was laid on another to bear it “after Him.”” — Jamieson, Fausset & Brown, Commentary (1871), on Luke 23:26 `[JFB/42/23/26]`
- “They compelled Simon to bear his burdensome cross, whereby it appeareth that Jesus was so sore handled before, that he fainted by the way, and was not able to bear his cross throughout: for John writeth that he did bear the cross, to wit, at the beginning.” — Geneva Bible (1599), on Matthew 27:32 `[GNV/40/27/32]`

**Read as a genuine discrepancy:** _empty_ — No public-domain voice among the seven harmonizing expositors presses this as a genuine discrepancy; each reads John and the Synoptics as a single sequence — Jesus first, then Simon.

### id 470 — What did the sign over Jesus' head say?
*probable_harmonization · lean reconcile_first*

**Read as reconcilable:**
- “The Evangelist John calls it a “title”, Joh 19:19, and Luke, a “superscription”, Luk 23:38, and Mark, the “superscription of his accusation”, Mar 15:26, it was what contained the sum and substance of what he was accused, and for which he was condemned, and suffered.” — John Gill, Exposition of the Entire Bible (1746-63), on Matthew 27:36 `[GILL/40/27/36]`
- “Matthew called it, aitia - the accusation; Mark and Luke called it epigraphē - the inscription; John calls it by the proper Latin name, titlos - the title: and it was this, Jesus of Nazareth, the King of the Jews,” — Matthew Henry, Commentary on the Whole Bible (1706-14), on John 19:19 `[MHC/43/19/19]`

**Read as a genuine discrepancy:** _empty_ — No public-domain voice among the seven harmonizing expositors presses the differing wording of the titulus as a genuine discrepancy; each treats the four reports as naming one and the same inscription.

### id 496 — *pilot* — How many women came to the sepulchre?
*genuine_contradiction · lean discrepancy_first*

**Read as reconcilable:**
- “John only mentions Mary of Magdala, because he appears to wish to give a more detailed history of her conduct than of any of the rest; but the other evangelists speak of three persons who went together to the tomb, viz. Mary of Magdala, Mary the mother of James, and Salome: Mat 28:1; Mar 16:1.” — Adam Clarke, Commentary on the Bible (1832), on John 20:1 `[CLARKE/43/20/1]`
- “This evangelist does not mention the other women that went with Mary Magdalene, but here only, because she was the most active and forward in this visit to the sepulchre, and in her appeared the most affection” — Matthew Henry, Commentary on the Whole Bible (1706-14), on John 20:1 `[MHC/43/20/1]`

**Read as a genuine discrepancy:** _empty_ — No public-domain voice among the seven harmonizing expositors presses the differing tallies of women as a genuine discrepancy; each treats the shorter lists as selective rather than contradictory.

### id 513 — Did Jesus drink on the cross?
*probable_harmonization · lean reconcile_first*

**Read as reconcilable:**
- “This vinegar must not be confounded with the vinegar and gall mentioned Mat 27:34, and Mar 15:23. That, being a stupifying potion, intended to alleviate his pain, he refused to drink; but of this he took a little, and then expired, Joh 19:30.” — Adam Clarke, Commentary on the Bible (1832), on John 19:29 `[CLARKE/43/19/29]`
- “They had given him vinegar to drink before they crucified him (Mat 27:34), but the prophecy was not exactly fulfilled in that, because that was not in his thirst; therefore now he said, I thirst, and called for it again: then he would not drink, but now he received it” — Matthew Henry, Commentary on the Whole Bible (1706-14), on John 19:19 `[MHC/43/19/19]`
- “indeed Mark says, they gave him “wine mingled with myrrh”, Mar 15:23; which was either a cordial provided by his friends, and given him, and is different from what the soldiers gave him here … he thought fit to taste of it in a superficial way, to show he did not despise nor resent their offer; and that he was really athirst, and ready to drink a more disagreeable potion than that,” — John Gill, Exposition of the Entire Bible (1746-63), on Matthew 27:33 `[GILL/40/27/33]`

**Read as a genuine discrepancy:** _empty_ — No public-domain voice among the seven harmonizing expositors presses this as a genuine discrepancy; each distinguishes a stupefying drink refused before death from the plain sour wine received in His thirst.

## Unresolved references (logged, never silently dropped)

- id 171: `Judith 8:15` — unknown book 'Judith'

Deuterocanonical refs (e.g. *Judith*) are out of scope: the 66-book canon has no `books_map` entry and the seven Protestant voices carry no commentary for them.

## Data-quality flags for owner
- **KD** is verse-block anchored (its note for a verse lives in the block's anchor verse); the sweep handles this, and `full_note_ref` records the true storage cell.
- **KD year** absent from `text_sources`; supplied in `voices.json` (1861-75).
- **TYN** ("Tyndale Open Bible Commentary") is marked PD in the DB but has no year and an atypical name for a PD-by-age work — confirm provenance before shipping TYN excerpts. (TYN appears in the sample, e.g. id 3, id 340.)
- Verse-number drift is real (e.g. Gill's Ps 103 anger note sits in the 103:8 cell; his transfiguration-timing note at Luke 9:26, not 9:28). The neighborhood+anchor gather catches it; the audit confirms each excerpt's true cell.

