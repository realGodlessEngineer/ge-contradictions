#!/usr/bin/env python
"""
buildBooksMap.py — Extract a committed book-name -> bolls-number map (with aliases)
from study-bundle.db's books table.

The harmonization sweep needs to resolve the book NAMES used in
contradictions.db's bible_references ("Genesis 1:16-19") to the integer book
numbers used in bible_reference.db's verse_commentaries. Both foreign DBs share
the same numbering as study-bundle.db books.bolls (verified: 1=Genesis,
40=Matthew, 43=John, 66=Revelation), so this is the single source of truth for
that mapping.

Output: data/harmonization/books_map.json
  {
    "generated_from": "study-bundle.db books",
    "books":   [ {bolls,name,slug,osis,usfm,testament}, ... ],   # 66 canonical
    "aliases": { "<normalized alias>": bolls, ... }               # name lookup
  }

Aliases are normalized with normalize() below (lowercase, collapsed whitespace,
trailing period stripped). The sweep applies the same normalize() at lookup.

  python .scripts/buildBooksMap.py

Env:
  STUDY_DB  source DB (default ./study-bundle.db)
  OUT       output path (default ./data/harmonization/books_map.json)
"""
import os
import re
import json
import sqlite3

STUDY_DB = os.environ.get("STUDY_DB", "./study-bundle.db")
OUT = os.environ.get("OUT", "./data/harmonization/books_map.json")

# Spoken/written forms for the leading ordinal of numbered books.
ORDINALS = {
    "1": ["1", "i", "1st", "first"],
    "2": ["2", "ii", "2nd", "second"],
    "3": ["3", "iii", "3rd", "third"],
}

# Irregular hand aliases that don't fall out of name/slug/osis/usfm mechanically.
# Keyed by bolls number.
HAND_ALIASES = {
    19: ["psalm", "ps", "psa", "pss"],                       # "Psalm 23"
    22: ["song of songs", "canticles", "song", "sng", "cant"],
    20: ["prov", "pr"],
    21: ["eccl", "ecc", "qoheleth", "qoh"],
    5:  ["deut", "dt"],
    2:  ["exod", "exo", "ex"],
    1:  ["gen", "gn"],
    3:  ["lev", "lv"],
    4:  ["num", "nm", "nb"],
    6:  ["josh", "jos"],
    7:  ["judg", "jdg", "jgs"],
    23: ["isa", "is"],
    24: ["jer", "jr"],
    26: ["ezek", "ezk", "eze"],
    40: ["matt", "mt"],
    41: ["mrk", "mk", "mr"],
    42: ["luk", "lk"],
    43: ["jhn", "jn"],
    44: ["acts of the apostles"],
    45: ["rom", "rm"],
    66: ["rev", "apocalypse", "revelation of john", "the revelation"],
    58: ["heb"],
    50: ["phil", "php"],
    57: ["philem", "phlm", "phm"],
}


def normalize(s: str) -> str:
    s = (s or "").strip().lower()
    s = s.rstrip(".")
    s = re.sub(r"\s+", " ", s)
    return s


def variants_for(name: str):
    """Generate alias surface forms for a canonical book name."""
    out = set()
    n = name.strip()
    m = re.match(r"^([123])\s+(.*)$", n)
    if m:
        num, rest = m.group(1), m.group(2)
        for pre in ORDINALS[num]:
            out.add(f"{pre} {rest}")     # "1 samuel", "i samuel", "first samuel"
            out.add(f"{pre}{rest}")      # "1samuel"
            out.add(f"{pre} {rest[:3]}") # "1 sam"  (rough abbr; harmless)
    else:
        out.add(n)
    return {normalize(v) for v in out if v.strip()}


def main():
    con = sqlite3.connect(f"file:{STUDY_DB}?mode=ro", uri=True)
    cur = con.cursor()
    rows = cur.execute(
        "SELECT bolls, name, slug, osis, usfm, testament FROM books ORDER BY bolls"
    ).fetchall()
    con.close()

    books = []
    aliases = {}

    def add(alias, bolls):
        a = normalize(alias)
        if not a:
            return
        if a in aliases and aliases[a] != bolls:
            # Don't let a collision silently overwrite; first writer wins, warn.
            print(f"  alias collision: {a!r} -> {aliases[a]} kept (not {bolls})")
            return
        aliases[a] = bolls

    for bolls, name, slug, osis, usfm, testament in rows:
        books.append({
            "bolls": bolls, "name": name, "slug": slug,
            "osis": osis, "usfm": usfm, "testament": testament,
        })
        add(name, bolls)
        add(slug.replace("-", " "), bolls)
        add(osis, bolls)
        add(usfm, bolls)
        for v in variants_for(name):
            add(v, bolls)
        for v in HAND_ALIASES.get(bolls, []):
            add(v, bolls)

    out = {
        "generated_from": "study-bundle.db books",
        "note": "name->bolls; bolls numbering matches bible_reference.db verse_commentaries.book",
        "books": books,
        "aliases": dict(sorted(aliases.items())),
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"Wrote {OUT}")
    print(f"  {len(books)} books, {len(aliases)} aliases")


if __name__ == "__main__":
    main()
