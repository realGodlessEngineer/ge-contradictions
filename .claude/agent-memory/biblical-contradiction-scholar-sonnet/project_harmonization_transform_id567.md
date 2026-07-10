---
name: project_harmonization_transform_id567
description: Harmonization TRANSFORM id 567 (Matt 27:9 "Jeremy the prophet" vs actual source Zech 11:12-13) — gathered PD note (K&D) itself concedes the discrepancy (rare "filled" discrepancy pole, no named_skeptic needed); note-ref adjacency miscite pitfall; Haley p.153 exact hit; shared-memory-file concurrent-write contention noted
metadata:
  type: project
---

Companion to [[project_harmonization_machine_pass]] (that file's tail is under heavy concurrent
write contention from parallel agent runs — repeated `Edit` failures with "File has been modified
since read" even immediately after a fresh Read, so this id's notes live in their own file
instead of being appended there).

## The setup
"Who prophesied about the thirty pieces of silver and the potter's field?" — Matthew 27:9
attributes the quotation to "Jeremy the prophet," but the actual wording is from Zechariah
11:12-13; Jeremiah has no thirty-pieces-of-silver material (only tangential potter/field imagery
in Jer 18-19, 32). `consensus: genuine_contradiction` → `discrepancy_first`. One of the classic,
heavily-anthologized NT-internal cruxes — all seven gathered voices (GILL/JFB/CLARKE/KD/MHC/TYN/
GNV) engage it directly and at length (per the id-407/389 "famous passages are usually covered"
pattern).

## Key finding: a gathered PD note can itself concede the discrepancy outright
**Keil & Delitzsch's own note (`KD/38/11/14` — NOT `KD/38/11/12`, see pitfall below) doesn't just
harmonize — it methodically rejects Hengstenberg's and Kliefoth's attempts to link Zechariah's
oracle to Jeremiah 18-19's potter narrative, then concludes in its own words**: "there is no
other course left than to follow the example of Luther, - namely, either to attribute the
introduction of Jeremiah's name in Mat 27:9... to a failure of memory, or to regard it as a very
old copyist's error." **This satisfies the discrepancy pole's `filled` status directly from a
codebook voice's own text** — no need for the 439 model / `named_skeptic` when a gathered
harmonizing commentary itself concedes the difficulty this plainly. This is a concrete worked
instance of the contract's own "rare" case: "a verbatim discrepancy excerpt exists ONLY when a
gathered note itself concedes (rare); otherwise the pole is carried by the named-skeptic
connective." Embedded inside the same KD note is a quoted Luther footnote making essentially the
same concession even more bluntly ("he is not quite correct about the name") — not used as the
excerpt itself (KD's own concluding sentence is cleaner and doesn't require quoting a quote), but
worth knowing it's there if a different excerpt boundary is ever needed.

## Reconcile pole (parity-capped to 1)
Used **TYN** on Matt 27:9 — a clean two-sentence excerpt with no nested quotes, offering both
major standard harmonizations at once (Jewish scroll-naming-by-lead-book convention + conflation
with genuine Jeremiah potter/field material in Jer 18-19/32): "Matthew might merely have been
conforming to the Jewish custom of citing books by referring to the first book in the particular
scroll—the first book in the scroll containing Zechariah would have been Jeremiah. Or, Matthew
might have thought of similar passages in Jeremiah (Jer 19:1-13; 18:2-6; 32:6-15) along with Zech
11:12-13." Preferred over **JFB**'s Lightfoot quote (`JFB/40/27/9`, the identical "order of the
books"/Jeremiah-headed-the-prophetic-division argument, attributed to Lightfoot via David Kimchi)
specifically **because JFB's version has a quote-within-quote that doesn't close within the
on-tension span** — the Lightfoot quotation only actually closes several sentences later, after a
tangential Luke 24:44 aside, so trimming to just the on-tension sentences leaves an orphaned
opening quotation mark. TYN makes the same substantive point without that structural problem.
**Lesson: when two candidate notes make the identical argument, prefer the one without an
unclosed nested quotation mark inside your intended excerpt boundary** — either quote the whole
enclosing quotation (verbose) or pick the cleaner source.

## Pitfall confirmed concretely: adjacent note_ref miscite
A first draft mis-attributed the KD excerpt to `KD/38/11/12` (the note whose `ref` field is
"Zechariah 11:12," matching the row's own cited verse in `refs_parsed`) when the actual sentence
lives in the **adjacent** `KD/38/11/14` note (`ref: "Zechariah 11:14"`) — K&D's extended
discussion of the Matthew-citation problem (including the Luther material) is appended to their
note on the verse *after* the one being cited, not the cited verse itself. A programmatic check
(`note.text.indexOf(excerpt_text) >= 0`) against the guessed `note_ref` came back `-1` even though
a plain-text `Grep` of the whole gather file found the sentence at a different line — the fix was
iterating every note from that `src` (`gather.notes.filter(n => n.src === 'KD')`) to find which
one's `text` actually contains the target phrase, rather than assuming the note whose `ref`
matches the row's cited verse is the right one. **Always run a mechanical verbatim-substring
check (`note.text.indexOf(excerpt_text) >= 0`) AND confirm `note.ref === verse_ref` against the
gather file for every excerpt before finalizing** — a long block-style commentary can carry the
on-tension sentence under a neighboring verse's `note_ref`, and eyeballing alone can silently
miscite it. See also [[project_harmonization_machine_pass]]'s id-563 GILL off-by-one
versification bug for a related but distinct note-mislabeling gotcha (that one was a systematic
whole-chapter shift; this one is a single adjacent-verse spillover in one long note).

## Haley + link
Haley's PD text (curl+`_djvu.txt` of `archive.org/details/examinationof00hale`) has a **direct,
page-specific hit**: under "Doctrinal Discrepancies" (p. 153) a side-by-side "Original" / "Wrongly
referred" table quotes Zech 11:12-13 against Matt 27:9-10 verbatim, opens with "Here is obviously
a mistake, either made by Matthew or by subsequent transcribers. The prophecy was uttered by
Zechariah, not Jeremiah," then surveys Alford's memory-lapse view, Barnes's two theories
(order-of-the-prophets naming + Greek name-abridgment/copyist-confusion, e.g. "Iriou"/"Zriou"),
and Henderson's view that the Greek text itself is corrupted — used as `deeper_learning.defense.
pd_work`. Live allowlisted `link`: `gotquestions.org/Matthew-27-9-Jeremiah-Zechariah.html` —
WebFetch-confirmed exact title match, surveys the same scroll-naming/composite-quotation/
scribal-error options. Ehrman (`Jesus, Interrupted`) and Calvin (memory-slip-via-Jer-18:2 theory,
per WebSearch and Haley's own survey) are both real named voices on this passage too, but weren't
independently pinned down firsthand for this pass since the KD-concedes-it-itself excerpt already
filled the discrepancy pole without needing an external named skeptic.

## Process note: shared-memory-file concurrent-write contention
`project_harmonization_machine_pass.md` grew from ~1500 to 1581+ lines *during this single
session* from other parallel agent runs appending to it — repeated `Edit` calls failed with "File
has been modified since read" even seconds after a fresh `Read`/`wc -l` check. **When the shared
machine-pass memory file is under contention, write the id's notes to their own small
`project_harmonization_transform_id<N>.md` file instead** (a `Write` to a new path has no
read-modify-write race) and link it from `MEMORY.md` — cheaper than retrying the giant file's
Edit in a loop, and avoids interleaving half-written sections from two agents.
