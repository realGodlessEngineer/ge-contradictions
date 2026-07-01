#!/usr/bin/env python
"""
sweepHarmonization.py — THE SWEEP (mechanical JOIN only; no LLM, no DB writes).

For each target contradiction, gather every public-domain commentary note that
bears on its cited verses, from the seven PD voices, with attribution + license
pre-attached. The output is the raw material the machine TRANSFORM (a separate
agent pass) excerpts, pole-classifies, and scores. This script never writes to
contradictions.db or bible_reference.db.

Pipeline position:
  contradictions.db + bible_reference.db + books_map.json
    --sweepHarmonization.py-->  data/harmonization/gather/batch_NN.json
    --(biblical-contradiction-scholar agent: excerpt/classify/score)-->
    --> data/harmonization/curation/  (the curation source-of-truth)

Gather strategy (derived from the pilot, see REPORT):
  - Parse each reference: book name -> bolls (via books_map), expand verse ranges,
    handle cross-chapter spans ("Matt 16:28 - 17:2") and comma verse-lists
    ("Luke 24:1, 10").
  - For each (voice, book, chapter, vlo..vhi): pull notes in [vlo-PAD .. vhi+PAD]
    AND, when the cited verse vlo has no direct note, the containing block anchor
    (the greatest verse <= vlo). This catches block-anchored sources like K&D
    (whose Gen 1:3 note lives in the v2 "First Day" block) and verse-anchor drift
    (Gill's transfiguration-timing sentence sits at Luke 9:26, not 9:28).
  - Dedup by (source, book, chapter, verse). Log every unresolved reference.

  python .scripts/sweepHarmonization.py            # the built-in 17-row sample
  IDS=3,4,189 python .scripts/sweepHarmonization.py # explicit ids
  ALL=1 python .scripts/sweepHarmonization.py       # all 605 (the full run)

Env:
  CONTRA_DB   ./contradictions.db
  REF_DB      ./bible_reference.db
  BOOKS_MAP   ./data/harmonization/books_map.json
  VOICES      ./data/harmonization/voices.json
  DIR         ./data/harmonization/gather          (output dir)
  PAD         2                                     (verse neighborhood radius)
  BATCH_SIZE  10                                    (contradictions per batch file)
  IDS / ALL / SAMPLE
"""
import os
import re
import json
import bisect
import sqlite3

from harmonLib import codebook

CONTRA_DB = os.environ.get("CONTRA_DB", "./contradictions.db")
REF_DB = os.environ.get("REF_DB", "./bible_reference.db")
BOOKS_MAP = os.environ.get("BOOKS_MAP", "./data/harmonization/books_map.json")
VOICES = os.environ.get("VOICES", "./data/harmonization/voices.json")
DIR = os.environ.get("DIR", "./data/harmonization/gather")
PAD = int(os.environ.get("PAD", "2"))
BATCH_SIZE = int(os.environ.get("BATCH_SIZE", "10"))
# Cap notes kept per (voice, book, chapter) cell, ranked most-on-tension first
# (direct hits > anchor blocks > nearest PAD neighbors). Deflates the whole-
# chapter / wide-PAD note explosion that dominates input cost, without dropping
# distinct cited points (each chapter keeps its own quota). 0 = no trimming.
TRIM_PER_CELL = int(os.environ.get("TRIM_PER_CELL", "4"))
BIG = 200  # sentinel "to end of chapter" (max real chapter is Psalm 119 = 176)

SEVEN = ["GILL", "JFB", "CLARKE", "KD", "MHC", "TYN", "GNV"]
SAMPLE_IDS = [3, 4, 439, 189, 459, 496, 468, 1, 171, 425, 470, 513, 298, 256, 340, 87, 214]

LOC_CHARS = re.compile(r"^[\d:,\-–\s]+$")


def normalize(s: str) -> str:
    s = (s or "").strip().lower().rstrip(".")
    return re.sub(r"\s+", " ", s)


# ----------------------------------------------------------------------------
# reference parsing
# ----------------------------------------------------------------------------
class RefError(Exception):
    pass


def split_book(raw: str):
    """Return (book_text, locator_text). Non-greedy book so leading ordinals
    ('1 Samuel') aren't mistaken for a chapter."""
    s = raw.strip().replace("–", "-")
    m = re.match(r"^(?P<book>.+?)\s+(?P<loc>\d[\d:,\-\s]*)$", s)
    if not m:
        raise RefError("no locator")
    return m.group("book").strip(), m.group("loc").strip()


def parse_locator(loc: str):
    """-> list of (chapter, vlo, vhi). BIG = to end of chapter."""
    loc = loc.replace("–", "-")
    if not LOC_CHARS.match(loc):
        raise RefError("non-numeric locator")
    out = []
    cur_ch = None
    for part in loc.split(","):
        part = part.strip()
        if not part:
            continue
        try:
            if ":" in part:
                segs = re.split(r"\s*-\s*", part)
                lc_s, lv_s = segs[0].split(":")
                lc, lv = int(lc_s), int(lv_s)
                cur_ch = lc
                if len(segs) == 1:
                    out.append((lc, lv, lv))
                else:
                    right = segs[1].strip()
                    if ":" in right:
                        rc_s, rv_s = right.split(":")
                        rc, rv = int(rc_s), int(rv_s)
                        out.append((lc, lv, BIG))
                        for mid in range(lc + 1, rc):
                            out.append((mid, 1, BIG))
                        out.append((rc, 1, rv))
                        cur_ch = rc
                    else:
                        out.append((lc, lv, int(right)))
            else:
                segs = re.split(r"\s*-\s*", part)
                if cur_ch is None:
                    # whole-chapter reference(s): "5" or "5-7"
                    if len(segs) == 1:
                        ch = int(segs[0]); out.append((ch, 1, BIG)); cur_ch = ch
                    else:
                        for ch in range(int(segs[0]), int(segs[1]) + 1):
                            out.append((ch, 1, BIG))
                        cur_ch = int(segs[1])
                else:
                    if len(segs) == 1:
                        v = int(segs[0]); out.append((cur_ch, v, v))
                    else:
                        out.append((cur_ch, int(segs[0]), int(segs[1])))
        except (ValueError, IndexError):
            raise RefError(f"unparseable segment {part!r}")
    if not out:
        raise RefError("empty locator")
    return out


def parse_reference(raw: str, aliases: dict):
    book_text, loc = split_book(raw)
    bolls = aliases.get(normalize(book_text))
    if bolls is None:
        raise RefError(f"unknown book {book_text!r}")
    return bolls, book_text.strip(), parse_locator(loc)


# ----------------------------------------------------------------------------
# main
# ----------------------------------------------------------------------------
def rows(cur, sql, args=()):
    cur.execute(sql, args)
    cols = [c[0] for c in cur.description]
    return [dict(zip(cols, r)) for r in cur.fetchall()]


def main():
    book_map = json.load(open(BOOKS_MAP, encoding="utf-8"))
    aliases = book_map["aliases"]
    bolls_to_name = {b["bolls"]: b["name"] for b in book_map["books"]}
    voices = json.load(open(VOICES, encoding="utf-8"))["voices"]

    # ---- target set ----
    if os.environ.get("IDS"):
        targets = [int(x) for x in os.environ["IDS"].split(",") if x.strip()]
    elif os.environ.get("ALL") == "1":
        targets = None  # resolved below = every contradiction
    else:
        targets = SAMPLE_IDS

    # ---- contradictions.db ----
    cc = sqlite3.connect(f"file:{CONTRA_DB}?mode=ro", uri=True)
    ccur = cc.cursor()
    if targets is None:
        targets = [r["id"] for r in rows(ccur, "SELECT id FROM contradictions ORDER BY id")]
    meta = {}
    for cid in targets:
        r = rows(ccur, """SELECT ct.id, ct.question, ct.summary, ct.testament_scope,
                   ct.books_in_tension, scl.name AS consensus, ct.scholarly_consensus_id,
                   cat.name AS category, tp.name AS ctype
                FROM contradictions ct
                LEFT JOIN scholarly_consensus_levels scl ON scl.id=ct.scholarly_consensus_id
                LEFT JOIN categories cat ON cat.id=ct.category_id
                LEFT JOIN contradiction_types tp ON tp.id=ct.contradiction_type_id
                WHERE ct.id=?""", (cid,))
        if not r:
            print(f"  WARN id {cid} not in contradictions.db — skipped"); continue
        m = r[0]
        m["refs"] = [x["reference"] for x in rows(ccur,
            """SELECT br.reference FROM bible_references br
               JOIN answers a ON a.id=br.answer_id
               WHERE a.contradiction_id=? ORDER BY br.id""", (cid,))]
        meta[cid] = m
    cc.close()

    # ---- bible_reference.db: license gate + in-memory index of the 7 voices ----
    rc = sqlite3.connect(f"file:{REF_DB}?mode=ro", uri=True)
    rcur = rc.cursor()
    licok = {r["code"]: r["license_code"] for r in rows(rcur,
        f"SELECT code, license_code FROM text_sources WHERE code IN ({','.join('?'*len(SEVEN))})", SEVEN)}
    for v in SEVEN:
        if licok.get(v) != "PD":
            raise SystemExit(f"License gate FAILED: voice {v} license={licok.get(v)} (expected PD). Aborting.")
    print(f"License gate OK: all 7 voices are PD.")

    print("Loading verse_commentaries for the 7 voices into memory...")
    index = {}  # (source_code, book, chapter) -> ([verses_sorted], {verse: text})
    n = 0
    rcur.execute(
        f"SELECT source_code, book, chapter, verse, text FROM verse_commentaries "
        f"WHERE source_code IN ({','.join('?'*len(SEVEN))})", SEVEN)
    for sc, bk, ch, vs, txt in rcur.fetchall():
        key = (sc, bk, ch)
        if key not in index:
            index[key] = ([], {})
        index[key][1][vs] = txt
        n += 1
    for key, (vlist, vmap) in index.items():
        vlist.extend(sorted(vmap.keys()))
    rc.close()
    print(f"  indexed {n} notes across {len(index)} (voice,book,chapter) cells.")

    # ---- gather ----
    def gather_one(bolls, ch, vlo, vhi, voice):
        """Return list of (verse, text, anchor_block_bool, dist). dist = verse
        distance to the cited [vlo..vhi] range (0 = direct hit), used for trimming."""
        cell = index.get((voice, bolls, ch))
        if not cell:
            return []
        vlist, vmap = cell
        lo, hi = max(1, vlo - PAD), vhi + PAD
        picked = {v: False for v in vlist if lo <= v <= hi}
        # block anchor: cited verse vlo has no direct note -> greatest verse <= vlo
        if vlo not in vmap:
            i = bisect.bisect_right(vlist, vlo) - 1
            if i >= 0:
                av = vlist[i]
                if av not in picked:
                    picked[av] = True  # flagged as anchor block

        def dist(v):
            return 0 if vlo <= v <= vhi else min(abs(v - vlo), abs(v - vhi))
        return [(v, vmap[v], anchor, dist(v)) for v, anchor in sorted(picked.items())]

    records = []
    unresolved = []
    for cid in targets:
        if cid not in meta:
            continue
        m = meta[cid]
        parsed = []
        for raw in m["refs"]:
            try:
                bolls, bname, ranges = parse_reference(raw, aliases)
                parsed.append({"raw": raw, "book": bname, "bolls": bolls, "ranges": ranges})
            except RefError as e:
                unresolved.append({"contradiction_id": cid, "reference": raw, "reason": str(e)})

        notes = {}  # (voice,bolls,ch,verse) -> note dict
        for p in parsed:
            for (ch, vlo, vhi) in p["ranges"]:
                for voice in SEVEN:
                    for (verse, text, anchor, d) in gather_one(p["bolls"], ch, vlo, vhi, voice):
                        key = (voice, p["bolls"], ch, verse)
                        vref = f"{bolls_to_name[p['bolls']]} {ch}:{verse}"
                        if key not in notes:
                            vc = voices[voice]
                            notes[key] = {
                                "source_code": voice,
                                "author": vc["author"], "work": vc["work"], "year": vc["year"],
                                "attribution": vc["display"], "license_code": vc["license_code"],
                                "book": p["bolls"], "book_name": bolls_to_name[p["bolls"]],
                                "chapter": ch, "verse": verse, "verse_ref": vref,
                                "full_note_ref": f"{voice}/{p['bolls']}/{ch}/{verse}",
                                "anchor_block": anchor, "dist": d, "matched_refs": [], "text": text,
                            }
                        else:
                            notes[key]["dist"] = min(notes[key]["dist"], d)
                        if p["raw"] not in notes[key]["matched_refs"]:
                            notes[key]["matched_refs"].append(p["raw"])

        note_list = sorted(notes.values(),
                           key=lambda x: (SEVEN.index(x["source_code"]), x["book"], x["chapter"], x["verse"]))

        # ---- trim each (voice, book, chapter) cell to the most on-tension notes ----
        raw_count = len(note_list)
        dropped = 0
        if TRIM_PER_CELL > 0 and raw_count > 0:
            cells = {}
            for nd in note_list:
                cells.setdefault((nd["source_code"], nd["book"], nd["chapter"]), []).append(nd)
            kept = []
            for cn in cells.values():
                cn.sort(key=lambda x: (x["dist"], 0 if x["anchor_block"] else 1, x["verse"]))
                kept.extend(cn[:TRIM_PER_CELL])
                dropped += max(0, len(cn) - TRIM_PER_CELL)
            note_list = sorted(kept, key=lambda x: (SEVEN.index(x["source_code"]), x["book"], x["chapter"], x["verse"]))
        for nd in note_list:
            nd.pop("dist", None)  # internal ranking field, not emitted

        records.append({
            "contradiction_id": cid,
            "question": m["question"], "summary": m["summary"],
            "consensus": m["consensus"], "consensus_id": m["scholarly_consensus_id"],
            "category": m["category"], "contradiction_type": m["ctype"],
            "testament_scope": m["testament_scope"], "books_in_tension": m["books_in_tension"],
            "refs_raw": m["refs"], "refs_parsed": parsed,
            "unresolved_refs": [u for u in unresolved if u["contradiction_id"] == cid],
            "note_count": len(note_list),
            "notes_raw_count": raw_count, "notes_dropped": dropped,
            "voices_present": sorted({nl["source_code"] for nl in note_list}, key=SEVEN.index),
            "notes": note_list,
        })

    # ---- write batches + reports ----
    os.makedirs(DIR, exist_ok=True)
    for f in os.listdir(DIR):
        if re.match(r"^batch_\d+\.json$", f):
            os.remove(os.path.join(DIR, f))
    nb = 0
    for i in range(0, len(records), BATCH_SIZE):
        path = os.path.join(DIR, f"batch_{nb:02d}.json")
        json.dump({"entries": records[i:i + BATCH_SIZE]}, open(path, "w", encoding="utf-8"),
                  ensure_ascii=False, indent=2)
        nb += 1

    # ---- also emit one self-contained, LEAN file per contradiction (by_id) ----
    # The per-record unit the transform agent consumes (TRANSFORM_SPEC.md). Notes
    # are leaned: per-note author/work/year/attribution/license are dropped and
    # resolved from the embedded `voices` codebook (keyed by `src`); book/chapter/
    # verse are dropped (encoded in `ref` + `note_ref`). This is JSON-with-codebook,
    # not strict PPF — verbatim note `text` keeps JSON quoting so embedded newlines/
    # pipes stay safe. Mirrors the batch wipe: stale per-id files are cleared first.
    NOTE_FORMAT = ("lean: src=voice code (resolve author/work/year/attribution/"
                   "license via 'voices'); ref=verse_ref; note_ref=full_note_ref; "
                   "cites=cited refs this note answers; anchor=block-anchored "
                   "(absent=false); text=verbatim note")
    TOP_KEYS = ("contradiction_id", "question", "summary", "consensus", "consensus_id",
                "category", "contradiction_type", "testament_scope", "books_in_tension",
                "refs_raw", "refs_parsed", "unresolved_refs", "note_count",
                "notes_raw_count", "notes_dropped", "voices_present")
    bydir = os.path.join(DIR, "by_id")
    os.makedirs(bydir, exist_ok=True)
    for f in os.listdir(bydir):
        if re.match(r"^\d+\.json$", f):
            os.remove(os.path.join(bydir, f))
    for r in records:
        lean_notes = []
        for nd in r["notes"]:
            ln = {"src": nd["source_code"], "ref": nd["verse_ref"],
                  "note_ref": nd["full_note_ref"], "cites": nd["matched_refs"],
                  "text": nd["text"]}
            if nd.get("anchor_block"):
                ln["anchor"] = True
            lean_notes.append(ln)
        out = {k: r[k] for k in TOP_KEYS}
        out["_note_format"] = NOTE_FORMAT
        out["voices"] = codebook(voices, r["voices_present"])
        out["notes"] = lean_notes
        json.dump(out, open(os.path.join(bydir, f"{r['contradiction_id']}.json"), "w", encoding="utf-8"),
                  ensure_ascii=False, indent=2)

    json.dump(unresolved, open(os.path.join(DIR, "unresolved_refs.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)

    cov = {"pad": PAD, "trim_per_cell": TRIM_PER_CELL, "targets": len(records),
           "total_notes": sum(r["note_count"] for r in records),
           "total_notes_raw": sum(r["notes_raw_count"] for r in records),
           "total_notes_dropped": sum(r["notes_dropped"] for r in records),
           "unresolved": len(unresolved),
           "per_contradiction": [{
               "id": r["contradiction_id"], "consensus": r["consensus"],
               "refs": len(r["refs_raw"]), "notes": r["note_count"],
               "voices": r["voices_present"],
               "by_voice": {v: sum(1 for n in r["notes"] if n["source_code"] == v) for v in r["voices_present"]},
           } for r in records]}
    json.dump(cov, open(os.path.join(DIR, "coverage.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)

    # COVERAGE.md
    lines = ["# Sweep coverage (raw gather — pre-transform)", "",
             f"- targets: **{cov['targets']}**  ·  total notes gathered: **{cov['total_notes']}**  "
             f"·  unresolved refs: **{cov['unresolved']}**  ·  PAD={PAD}", "",
             "| id | consensus | refs | notes | voices present |",
             "|----|-----------|-----:|------:|----------------|"]
    for r in cov["per_contradiction"]:
        vstr = ", ".join("{}:{}".format(v, r["by_voice"][v]) for v in r["voices"])
        lines.append(f"| {r['id']} | {r['consensus']} | {r['refs']} | {r['notes']} | {vstr} |")
    if unresolved:
        lines += ["", "## Unresolved references", ""]
        for u in unresolved:
            lines.append(f"- id {u['contradiction_id']}: `{u['reference']}` — {u['reason']}")
    open(os.path.join(DIR, "COVERAGE.md"), "w", encoding="utf-8").write("\n".join(lines) + "\n")

    print(f"\nWrote {nb} batch file(s) to {DIR}")
    print(f"  targets={cov['targets']}  notes={cov['total_notes']}  unresolved={cov['unresolved']}")
    if TRIM_PER_CELL > 0:
        print(f"  TRIM_PER_CELL={TRIM_PER_CELL}: kept {cov['total_notes']} of "
              f"{cov['total_notes_raw']} notes (dropped {cov['total_notes_dropped']} "
              f"low-relevance neighbors; direct hits + anchors kept first)")
    print(f"  reports: COVERAGE.md, coverage.json, unresolved_refs.json")


if __name__ == "__main__":
    main()
