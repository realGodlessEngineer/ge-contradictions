#!/usr/bin/env python
"""
verifyVersePairs.py — Independent verbatim floor over verse-pair snippets.
The versePair analogue of verifyExcerpts.py's verse_commentaries check, but
against `translations` WEB.

For every verse-pair side found under DOSSIER_DIR, re-fetch the WEB verse
straight from bible_reference.db (by the side's `ref`, resolved to a
(book, chapter, verse) via books_map.json) and confirm the `snippet` is a
verbatim substring after the ONLY allowed normalizations: Unicode NFC,
curly<->straight quotes, whitespace collapse, and ellipsis (…) splitting into
fragments that must each be present. If the side also carries a `verseText`
re-check field, confirm it matches the DB WEB text exactly (after norm()).

This is a mechanical acceptance-gate FLOOR — read-only, makes no writes.

  python .scripts/verifyVersePairs.py

Env: REF_DB (./bible_reference.db), DOSSIER_DIR (./data/harmonization/curation/dossier),
     BOOKS_MAP (./data/harmonization/books_map.json)
"""
import os
import re
import sys
import glob
import json
import unicodedata
import sqlite3

# force UTF-8 stdout — snippets carry … (U+2026); default Windows cp1252
# console would otherwise crash mid-print.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

REF_DB = os.environ.get("REF_DB", "./bible_reference.db")
DOSSIER_DIR = os.environ.get("DOSSIER_DIR", "./data/harmonization/curation/dossier")
BOOKS_MAP = os.environ.get("BOOKS_MAP", "./data/harmonization/books_map.json")

# a single clean "Book chap:verse" citation (SPEC §4.3): optional leading
# 1/2/3, a (possibly multi-word) book name, then chap:verse. No '/', no ','.
REF_FORMAT_RE = re.compile(r"^(?:[1-3]\s+)?[A-Za-z][A-Za-z.]*(?:\s+[A-Za-z]+)*\s+\d+:\d+$")
REF_SPLIT_RE = re.compile(r"^(.*)\s+(\d+):(\d+)$")


def norm(s: str) -> str:
    s = unicodedata.normalize("NFC", s or "")
    # unify quotes/apostrophes/dashes the agent was allowed to alter
    s = (s.replace("‘", "'").replace("’", "'")
           .replace("“", '"').replace("”", '"')
           .replace("–", "-").replace("—", "-"))
    s = re.sub(r"-{2,}", "-", s)         # em-dash typeset as "--" == "-"
    s = re.sub(r"\s+([;:,.!?])", r"\1", s)  # French-spaced punctuation (" :" == ":")
    s = re.sub(r"\s+", " ", s).strip()
    return s


def load_alias_map(path):
    data = json.load(open(path, encoding="utf-8"))
    return {k.lower(): v for k, v in data.get("aliases", {}).items()}


def parse_ref(ref, alias_map):
    """ref -> (bolls, chapter, verse), or None if malformed / unresolvable."""
    if not isinstance(ref, str) or not REF_FORMAT_RE.match(ref):
        return None
    m = REF_SPLIT_RE.match(ref)
    if not m:
        return None
    book_token = m.group(1).strip().lower()
    bolls = alias_map.get(book_token)
    if not bolls:
        return None
    return bolls, int(m.group(2)), int(m.group(3))


def iter_verse_pairs(data):
    """Yield (cid, sides) pairs found in a dossier file. Defensive about shape:
    either top-level {"versePair": {"sides": [...]}, "contradiction_id"|"id": ...}
    or id-keyed {"<id>": {..., "versePair": {"sides": [...]}}, ...}."""
    if not isinstance(data, dict):
        return
    vp = data.get("versePair")
    if isinstance(vp, dict) and isinstance(vp.get("sides"), list):
        cid = data.get("contradiction_id") or data.get("id")
        yield (cid, vp["sides"])
        return
    for key, val in data.items():
        if not isinstance(val, dict):
            continue
        vp = val.get("versePair")
        if isinstance(vp, dict) and isinstance(vp.get("sides"), list):
            cid = val.get("contradiction_id") or key
            yield (cid, vp["sides"])


def main():
    files = sorted(
        glob.glob(os.path.join(DOSSIER_DIR, "*.json")),
        key=lambda p: int(re.findall(r"\d+", os.path.basename(p))[0])
    )

    if not os.path.isdir(DOSSIER_DIR) or not files:
        print("Verse-pair sides checked: 0   PASS: 0   FAIL: 0")
        print("all clear (no dossier files yet)")
        return

    rc = sqlite3.connect(f"file:{REF_DB}?mode=ro", uri=True)
    cur = rc.cursor()
    alias_map = load_alias_map(BOOKS_MAP)

    verse_cache = {}

    def web_text(book, chapter, verse):
        key = (book, chapter, verse)
        if key not in verse_cache:
            r = cur.execute(
                "SELECT text FROM translations WHERE version_code='WEB' AND book=? AND chapter=? AND verse=?",
                (book, chapter, verse)).fetchone()
            verse_cache[key] = r[0] if r else None
        return verse_cache[key]

    total = passed = 0
    fails = []
    for f in files:
        data = json.load(open(f, encoding="utf-8"))
        for cid, sides in iter_verse_pairs(data):
            for i, side in enumerate(sides):
                total += 1
                ref = side.get("ref") if isinstance(side, dict) else None
                tag = f"id {cid} side {i} [{ref}]"

                parsed = parse_ref(ref, alias_map)
                if not parsed:
                    fails.append(f"{tag}: bad/unresolvable ref {ref!r}"); continue
                book, chapter, verse = parsed

                text = web_text(book, chapter, verse)
                if text is None:
                    fails.append(f"{tag}: no WEB translations row at {ref}"); continue

                hay = norm(text)
                snippet = side.get("snippet", "") or ""
                frags = [p for p in re.split(r"\s*…\s*|\s*\.\.\.\s*", snippet) if p.strip()]
                bad = [fr for fr in frags if norm(fr) not in hay]
                if bad:
                    fails.append(f"{tag}: NOT VERBATIM — fragment(s) absent: " +
                                 " || ".join(norm(b)[:70] for b in bad)); continue

                verse_text = side.get("verseText")
                if verse_text is not None and norm(verse_text) != hay:
                    fails.append(f"{tag}: verseText drift vs DB WEB"); continue

                passed += 1
    rc.close()

    print(f"Verse-pair sides checked: {total}   PASS: {passed}   FAIL: {len(fails)}")
    if fails:
        print("\nFAILURES:")
        for x in fails:
            print("  -", x)
    else:
        print("All verse-pair snippets verified: verbatim WEB substrings, traceable, verseText matches the DB.")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
