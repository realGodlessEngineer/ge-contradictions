#!/usr/bin/env python
"""
ppf.py — Positional Pipe Format parser (Python port of .scripts/ppf-toolkit/
ppf-parser.js). A token-efficient alternative to JSON for fixed-schema LLM output:
the schema is declared once (in the prompt), and each record is one delimiter-
separated line, so the per-record key/brace overhead of JSON disappears.

Used by the harmonization sampled-audit: the auditor agent emits PPF verdicts
(enum-heavy: pass/flag/fail + guardrail codes) instead of JSON, and
auditHarmonization.py decodes them back to the same dict shape report() expects.

Faithful to the JS toolkit: escape-aware split on the delimiter, enumMap numeric-
index -> label lookup, optional fields, list sub-delimiter, int/float/bool/str
coercers, and a prompt-schema generator.
"""
import re

__all__ = ["create", "Schema"]


def _coerce(field, v):
    t = field.get("type", "str")
    if t == "str":
        return v
    if t == "int":
        try:
            return int(v)
        except ValueError:
            return None
    if t == "float":
        try:
            return float(v)
        except ValueError:
            return None
    if t == "bool":
        return v in ("1", "true", "T")
    if t == "enum":
        em = field.get("enumMap")
        if em:
            try:
                idx = int(v)
            except ValueError:
                return v
            return em.get(idx, v)
        return v
    if t == "list":
        sep = field.get("listSep", "~")
        if not v:
            return []
        items = [i.strip() for i in v.split(sep)]
        lt = field.get("listType")
        if lt:
            return [_coerce({"type": lt}, i) for i in items]
        return items
    return v


def _split_escaped(s, delim, esc):
    parts, cur, escaped = [], [], False
    for ch in s:
        if escaped:
            cur.append(ch)
            escaped = False
        elif ch == esc:
            escaped = True
        elif ch == delim:
            parts.append("".join(cur))
            cur = []
        else:
            cur.append(ch)
    parts.append("".join(cur))
    return parts


class Schema:
    def __init__(self, fields, delimiter="|", row_delimiter="\n", escape_char="\\",
                 header_row=False):
        if not fields:
            raise ValueError("PPF schema requires at least one field")
        self.fields = fields
        self.delimiter = delimiter
        self.row_delimiter = row_delimiter
        self.escape_char = escape_char
        self.header_row = header_row

    def parse_row(self, raw, row_index=0):
        parts = _split_escaped(raw, self.delimiter, self.escape_char)
        rec, errors = {}, []
        for i, field in enumerate(self.fields):
            rawval = parts[i].strip() if i < len(parts) else None
            if rawval is None or rawval == "":
                if field.get("optional"):
                    rec[field["name"]] = field.get("default")
                    continue
                if "default" in field:
                    rec[field["name"]] = field["default"]
                    continue
                errors.append({"row": row_index, "field": field["name"], "error": "missing_required"})
                rec[field["name"]] = None
                continue
            rec[field["name"]] = _coerce(field, rawval)
        if len(parts) > len(self.fields):
            rec["_overflow"] = [p.strip() for p in parts[len(self.fields):]]
            errors.append({"row": row_index, "error": "overflow", "extra": len(rec["_overflow"])})
        return rec, errors

    def parse(self, raw):
        if not raw or not isinstance(raw, str):
            return [], [{"error": "empty_input"}]
        rows = raw.strip().split(self.row_delimiter)
        if self.header_row and rows:
            rows = rows[1:]
        rows = [r for r in rows if r.strip() != ""]
        records, all_errors = [], []
        for idx, row in enumerate(rows):
            rec, errs = self.parse_row(row, idx)
            records.append(rec)
            all_errors.extend(errs)
        return records, all_errors

    def parse_one(self, raw):
        records, errors = self.parse(raw)
        return (records[0] if records else None), errors

    def prompt_schema(self):
        defs = []
        for f in self.fields:
            d = f["name"]
            if f.get("type") == "enum" and f.get("enumMap"):
                d += "(" + ",".join(f"{k}={v}" for k, v in f["enumMap"].items()) + ")"
            elif f.get("type") and f["type"] != "str":
                d += f"({f['type']})"
            if f.get("optional"):
                d += "?"
            defs.append(d)
        return "\n".join([
            f'Output format: one record per line, fields separated by "{self.delimiter}"',
            f"Schema: {self.delimiter.join(defs)}",
            "No headers, no extra text, no markdown fencing.",
        ])


def create(fields, **kw):
    return Schema(fields, **kw)


if __name__ == "__main__":
    # tiny self-test mirroring ppf-test.js
    s = create([
        {"name": "speaker", "type": "str"},
        {"name": "sentiment", "type": "enum", "enumMap": {0: "negative", 1: "neutral", 2: "positive"}},
        {"name": "confidence", "type": "float"},
        {"name": "summary", "type": "str"},
    ])
    recs, errs = s.parse("John|0|.85|Disagrees with the premise\nAlice|2|.92|Strong agreement")
    assert recs[0] == {"speaker": "John", "sentiment": "negative", "confidence": 0.85,
                       "summary": "Disagrees with the premise"}, recs[0]
    assert recs[1]["sentiment"] == "positive"
    # escaped pipe inside the last (free-text) field
    r2, _ = s.parse_one(r"Bob|1|.5|a \| b")
    assert r2["summary"] == "a | b", r2
    print("ppf.py self-test OK", recs)
