---
name: project_harmonization_t11_class_sourcing
description: T11 Tier-2 "class/mechanism" discrepancy-pole sourcing — place a verbatim GENERAL-class PD critic passage (Chronicler/census/doublet/law-code/genealogy/Gospel-parallel) honestly scoped as a general principle this row instances, after Tier-1 specific-verse-pair sourcing failed.
metadata:
  type: project
---

Companion to [[project_harmonization_t10_run]] / [[project_harmonization_machine_pass]]. This leg
runs strictly AFTER a Tier-1 verse-pair-specific pass has already failed to find a PD critic
pressing the row's exact pair. Six documented classes route to specific critics (see the
governing prompt): CHRONICLER/CENSUS_NUMBERS/DOUBLET/LAW_CODE/GENEALOGY_VARIATION -> Wellhausen
or Colenso; GOSPEL_PARALLEL (same event told differently across Gospels: nativity, genealogy,
miracle order/detail, passion, resurrection) -> Strauss/Remsburg/Cassels.

Key finding: for GOSPEL_PARALLEL rows, Strauss's *Life of Jesus* very often DOES address the
specific scene directly (not just a class-level generalization) — e.g. id 505 (Luke 7 sinful
woman vs John 12 Mary of Bethany, feet-drying-with-hair) has an exact, extended Strauss passage
comparing the two accounts almost word-for-word ("§ 89. NARRATIVES OF THE ANOINTING OF JESUS BY
A WOMAN", strauss-life-of-jesus.txt lines ~15684-15761). When this happens, it's fine (and
stronger) to use the on-point passage rather than force an artificially general one — just phrase
the discrepancy `note` accurately (it can describe the actual scene) rather than padding with
class-jargon that isn't needed. True general-class passages also exist and work well: Strauss's
resurrection chapter opens with a genuinely general framing sentence about ALL FOUR Evangelists'
divergent witness accounts (§137 "FIRST TIDINGS OF THE RESURRECTION", line 27981, used for id 481
re: Mary Magdalene's recognition) and his passion chapter opens with a general statement about the
death-of-Jesus prodigies (darkness/veil/earthquake) being "very unequally distributed among the
Evangelists" (§133, line 27334-27341, used for id 495 re: veil-tear timing vs Mark/Luke sequence).
Both are legitimately general (not about the specific verse pair) and scope cleanly.

Non-fits (honest-absence, correctly): doctrinal/thematic NT tensions that are NOT one Gospel event
retold differently — id 487 (do demons' belief in Christ satisfy 1 John's confession test — a
theological-criterion problem, not a narrative retelling), id 491 (who can cast out devils in
Jesus' name — Mark 9:38 vs Mark 16:17 longer-ending, a doctrinal/authority tension not a
same-event Gospel-parallel divergence), id 514 (paradise vs Hades/hell — Luke 23:43 vs 1 Peter
3:19, a Gospel-vs-Epistle doctrinal tension, not two Gospels retelling one event). None of the
Chronicler/census/doublet/law-code/genealogy classes apply to NT rows at all — don't stretch OT
classes onto NT material just because Wellhausen/Colenso are in the well.

Mechanical notes: Strauss's PD Gutenberg txt reflows mid-sentence across lines, so Grep single-line
patterns can false-negative on phrases straddling a line break (e.g. "is unanimously stated" /
"by the four Evangelists" split across lines 27982/27983) — read the surrounding block and use
shorter, single-line-contained substrings for the self-verify grep instead of the full phrase.
Also watch for footnote reference numbers (bare digits like " 53 ") embedded mid-sentence in the
PD text — these are not part of the prose; either quote around them by ending/restarting the run
at the number (join with a single … ellipsis) or pick a segment that avoids them. The PD text also
preserves French-style spacing (space before some commas, e.g. "who was a sinner , as,") — keep
that verbatim per the no-OCR-correction rule.

Worked ids (this run): 481 (Mary Magdalene recognition, Strauss §137 general resurrection-witness
framing), 495 (temple veil timing, Strauss §133 general death-prodigies framing), 505 (feet-anointing
identity, Strauss §89 — actually on-point specific passage, used honestly). Honest-absence: 487, 491, 514
(no documented class fits — doctrinal/thematic NT tensions, not Gospel-parallel narrative retellings).
