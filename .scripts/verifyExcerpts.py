#!/usr/bin/env python
"""
verifyExcerpts.py — Independent verbatim + provenance audit of machine excerpts.

For every machine excerpt, re-fetch the source note straight from
bible_reference.db (by its full_note_ref) and confirm the excerpt_text is a
verbatim substring after the ONLY allowed normalizations: Unicode NFC,
curly<->straight quotes, whitespace collapse, and ellipsis (…) splitting into
fragments that must each be present. Also checks: source_code is one of the seven,
license_code is PD, required fields present.

This is the acceptance gate ("every excerpt traces to a PD row; verbatim"). It is
read-only and makes no writes.

  python .scripts/verifyExcerpts.py

Env: REF_DB (./bible_reference.db), MACHINE_DIR (./data/harmonization/curation/machine)
"""
import os
import re
import glob
import json
import sys
import unicodedata
import sqlite3

from harmonLib import load_voices, resolve_attr

REF_DB = os.environ.get("REF_DB", "./bible_reference.db")
MACHINE_DIR = os.environ.get("MACHINE_DIR", "./data/harmonization/curation/machine")
SEVEN = {"GILL", "JFB", "CLARKE", "KD", "MHC", "TYN", "GNV"}
# Lean machine output drops per-excerpt author/work/attribution/license (resolved
# from source_code via the codebook) and contradiction_id (top-level). Only these
# must be authored on each excerpt:
REQUIRED = ["pole", "source_code", "verse_ref", "excerpt_text",
            "full_note_ref", "verify_state"]


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


def main():
    rc = sqlite3.connect(f"file:{REF_DB}?mode=ro", uri=True)
    cur = rc.cursor()
    # license map
    lic = {r[0]: r[1] for r in cur.execute("SELECT code, license_code FROM text_sources")}
    voices = load_voices()

    note_cache = {}

    def note_text(voice, bk, ch, vs):
        key = (voice, bk, ch, vs)
        if key not in note_cache:
            r = cur.execute("SELECT text FROM verse_commentaries WHERE source_code=? AND book=? AND chapter=? AND verse=?",
                            (voice, bk, ch, vs)).fetchone()
            note_cache[key] = r[0] if r else None
        return note_cache[key]

    files = sorted(glob.glob(os.path.join(MACHINE_DIR, "*.json")), key=lambda p: int(re.findall(r"\d+", os.path.basename(p))[0]))
    total = passed = 0
    fails = []
    for f in files:
        data = json.load(open(f, encoding="utf-8"))
        for ex in data.get("excerpts", []):
            total += 1
            cid = ex.get("contradiction_id") or data.get("contradiction_id")
            tag = f"id {cid} [{ex.get('source_code')} {ex.get('verse_ref')}]"
            # field presence
            missing = [k for k in REQUIRED if k not in ex or ex[k] in (None, "")]
            if missing:
                fails.append(f"{tag}: missing fields {missing}"); continue
            # source gate
            if ex["source_code"] not in SEVEN:
                fails.append(f"{tag}: source_code not in the seven"); continue
            # license resolved from codebook (or excerpt, if present) + DB cross-check
            rec_lic = resolve_attr(ex, voices)["license_code"]
            if rec_lic != "PD" or lic.get(ex["source_code"]) != "PD":
                fails.append(f"{tag}: license not PD (record={rec_lic}, db={lic.get(ex['source_code'])})"); continue
            # full_note_ref -> cell
            m = re.match(r"^([A-Z]+)/(\d+)/(\d+)/(\d+)$", ex["full_note_ref"])
            if not m:
                fails.append(f"{tag}: bad full_note_ref {ex['full_note_ref']!r}"); continue
            voice, bk, ch, vs = m.group(1), int(m.group(2)), int(m.group(3)), int(m.group(4))
            if voice != ex["source_code"]:
                fails.append(f"{tag}: full_note_ref voice {voice} != source_code {ex['source_code']}"); continue
            src = note_text(voice, bk, ch, vs)
            if src is None:
                fails.append(f"{tag}: no verse_commentaries row at {ex['full_note_ref']}"); continue
            # verbatim check (split on ellipsis)
            hay = norm(src)
            frags = [p for p in re.split(r"\s*…\s*|\s*\.\.\.\s*", ex["excerpt_text"]) if p.strip()]
            bad = [fr for fr in frags if norm(fr) not in hay]
            if bad:
                fails.append(f"{tag}: NOT VERBATIM — fragment(s) absent: " +
                             " || ".join(norm(b)[:70] for b in bad)); continue
            passed += 1
    rc.close()

    print(f"Excerpts checked: {total}   PASS: {passed}   FAIL: {len(fails)}")
    if fails:
        print("\nFAILURES:")
        for x in fails:
            print("  -", x)
        # Non-zero exit so callers (e.g. buildHarmonizationTables.js gate #2) treat
        # a verbatim/PD/traceability miss as a hard build failure, not a pass.
        sys.exit(1)
    else:
        print("All machine excerpts verified: verbatim, PD-licensed, traceable to a real verse_commentaries row.")


if __name__ == "__main__":
    main()
