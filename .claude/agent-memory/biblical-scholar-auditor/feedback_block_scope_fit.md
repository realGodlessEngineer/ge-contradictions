---
name: Daniel Block scope-fit pattern (Vector D)
description: Daniel Block is repeatedly miscited for commentaries on books he has not written; this is now the dominant Vector D pattern in batch_10
type: feedback
---

Daniel I. Block has written commentaries on a narrow set of OT books. AI-drafted commentary repeatedly miscites him as the author of commentaries he did NOT write, or names the wrong commentary series for the volumes he DID write. This is the most common Vector D scope-mismatch / attribution-inversion error in batch_10 (entries 182, 194, 197, 198 all involved Block errors in pass 3 alone).

**Block's actual published commentaries (verified):**
- *The Book of Ezekiel, Chapters 1-24* (NICOT, Eerdmans, 1997)
- *The Book of Ezekiel, Chapters 25-48* (NICOT, Eerdmans, 1998)
- *Judges, Ruth* (NAC 6, Broadman & Holman, 1999) — NAC, NOT NICOT
- *Deuteronomy* (NIVAC, Zondervan, 2012) — NIVAC, NOT NAC

**Block has NO commentary on:** Joshua, Chronicles, Genesis, the Pentateuch generally, Numbers, Leviticus, Exodus, Samuel, Kings, Isaiah, Jeremiah, Daniel, Minor Prophets, or any New Testament book. He has written monographs (e.g., *The Gods of the Nations*, *For the Glory of God*) but those are topical works, not commentaries.

**Why:** Block is a recognized evangelical OT scholar whose name is plausibly slotted into any conservative-leaning commentary attribution. AI drafts confidently name him for Joshua harmonizations (entry 197 pre-pass-3), Chronicles harmonizations (entry 198 pre-pass-3), and conflate his actual NAC Judges/Ruth volume with NICOT (entries 182, 194 pre-pass-3) or with NIVAC Judges (batch_09 id=172 — that's actually Younger). The NICOT Judges is by Barry Webb (Eerdmans 2012); the NIVAC Judges/Ruth is by K. Lawson Younger Jr. (Zondervan 2002).

**Audit checklist when Block appears in any entry:**
1. Is the book Ezekiel, Judges, Ruth, or Deuteronomy? If not, treat as scope-mismatch unless verified.
2. If Ezekiel: which volume? Vol 1 = chs 1-24 (1997); Vol 2 = chs 25-48 (1998). Match the verse range.
3. If Judges/Ruth: series should be NAC 6 (1999), NOT NICOT and NOT NIVAC.
4. If Deuteronomy: series is NIVAC (2012), NOT NAC. (NAC Deut is by Eugene Merrill.)
5. If named in a Joshua, Chronicles, Pentateuch, or NT context: this is a Vector D scope-mismatch — drop Block, find the actual relevant scholar (Hess/Howard for Joshua; Japhet/Braun/Knoppers for Chronicles).

**Cross-reference rule:** Block's NAC Judges/Ruth or NIVAC Deuteronomy may be cited for cross-references when the entry treats a Judges-Joshua or Deuteronomy-Numbers harmonization, since any Judges commentator addresses parallel Joshua passages, and any Deuteronomy commentator addresses parallel Pentateuch material. Block being named for Joshua 24:9 in service of Judges 11:25 commentary (entry 200) is acceptable; Block being named as the source of a Joshua 10:33 reading independently of Judges (entry 194 pre-pass-3) is not.

**How to apply:** On every pass through any batch, run a Block sweep: grep for "Block" prose attributions, check the cited verse/book against Block's actual works, and verify series names exactly. Suspect any Block attribution that doesn't fit Ezekiel/Judges-Ruth/Deuteronomy.
