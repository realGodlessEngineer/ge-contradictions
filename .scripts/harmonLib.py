#!/usr/bin/env python
"""
harmonLib.py — shared helpers for the harmonization sweep pipeline.

Currently: the seven-voice attribution CODEBOOK. The lean by_id gather files and
the lean machine output drop per-note / per-excerpt author/work/year/attribution/
license (they are constant per voice) — they are resolved back from `source_code`
through voices.json here, so verifyExcerpts.py / auditHarmonization.py /
reportHarmonizationSample.py all share one resolver and never diverge.

Read-only; no DB, no writes.
"""
import os
import json

VOICES_PATH = os.environ.get("VOICES", "./data/harmonization/voices.json")

# attribution fields a lean note/excerpt omits and we resolve from the codebook
_ATTR_FIELDS = ("author", "work", "year", "attribution", "license_code")


def load_voices(path=None):
    """source_code -> voice dict (author/work/year/display/license_code/...)."""
    return json.load(open(path or VOICES_PATH, encoding="utf-8"))["voices"]


def codebook(voices, present=None):
    """Compact attribution codebook for embedding in a by_id file. `present`
    limits it to the voices actually used in that record (keeps the file small
    and self-contained). Maps source_code -> {author, work, year, attribution,
    license_code}."""
    keys = present if present is not None else list(voices.keys())
    out = {}
    for k in keys:
        v = voices.get(k)
        if not v:
            continue
        out[k] = {"author": v.get("author"), "work": v.get("work"),
                  "year": v.get("year"), "attribution": v.get("display"),
                  "license_code": v.get("license_code")}
    return out


def resolve_attr(rec, voices):
    """Return the five attribution fields for an excerpt/note, preferring values
    already present on the record (back-compat with the old fat schema) and
    falling back to the voices codebook keyed by source_code. Returns a dict with
    author/work/year/attribution/license_code (any may be None if unknown)."""
    sc = rec.get("source_code")
    v = voices.get(sc, {}) if sc else {}
    return {
        "author": rec.get("author") or v.get("author"),
        "work": rec.get("work") or v.get("work"),
        "year": rec.get("year") if rec.get("year") is not None else v.get("year"),
        "attribution": rec.get("attribution") or v.get("display"),
        "license_code": rec.get("license_code") or v.get("license_code"),
    }
