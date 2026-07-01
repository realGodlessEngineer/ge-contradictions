#!/usr/bin/env python
"""
auditHarmonization.py — the SAMPLED-AUDIT harness for the harmonization sweep
(owner Decision A, 2026-06-14: machine-excerpt + sampled audit, not per-excerpt
human sign-off).

Two layers, two modes:

  MODE=select  (default)
    1. MECHANICAL FLOOR over EVERY machine excerpt: re-fetch its cited note from
       bible_reference.db and confirm verbatim + PD + traceable (the same gate as
       verifyExcerpts.py — 100% coverage, no sampling). Floor failures abort the
       audit: fix them before sampling.
    2. STRATIFIED SAMPLE selection for the agent audit (the part a machine can't
       judge: on-tension + pole-label). Deterministic (seeded), stratified by
       consensus tier and voice, with guaranteed inclusion of every discrepancy
       excerpt and every discrepancy_first contradiction, and a per-contradiction
       floor of >=1 audited excerpt. Embeds the FULL source note text in each
       work file so the auditor agent can check in_source without DB access.
    Writes: data/harmonization/audit/work/<id>.json   (agent input, per id)
            data/harmonization/audit/_floor.json        (floor result, all excerpts)
            data/harmonization/audit/_sample.json        (sample manifest + strata)

  MODE=report
    Aggregate the auditor agent's verdicts (audit/verdicts/<id>.json) against the
    sample, plus the mechanical floor, into:
            data/harmonization/audit/audit_summary.json
            data/harmonization/AUDIT-report.md

Read-only against both databases (it never writes to either). The agent audit
itself is dispatched separately (per AUDITOR_SPEC.md) between the two modes.

Env:
  REF_DB        ./bible_reference.db
  MACHINE_DIR   ./data/harmonization/curation/machine
  GATHER_DIR    ./data/harmonization/gather/by_id
  AUDIT_DIR     ./data/harmonization/audit
  AUDIT_RATE    0.25   (target fraction of excerpts sampled for the agent audit)
  AUDIT_SEED    1337   (deterministic stratified pick)

  python .scripts/auditHarmonization.py            # select (floor + sample)
  MODE=report python .scripts/auditHarmonization.py
"""
import os
import re
import sys
import glob
import json
import unicodedata
import sqlite3

from harmonLib import load_voices, resolve_attr
import ppf

# the report/guardrail prints use · and ⚠ — force UTF-8 stdout so the default
# Windows cp1252 console doesn't crash mid-print on them.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

REF_DB = os.environ.get("REF_DB", "./bible_reference.db")
# HARMON_BASE re-points the whole workspace (report's AUDIT-report.md + the policy
# file too, not just AUDIT_DIR) so a pilot/isolated run never clobbers the real
# data/harmonization/AUDIT-report.md.
BASE = os.environ.get("HARMON_BASE", "data/harmonization")
VOICES = load_voices()
MACHINE_DIR = os.environ.get("MACHINE_DIR", f"{BASE}/curation/machine")
GATHER_DIR = os.environ.get("GATHER_DIR", f"{BASE}/gather/by_id")
AUDIT_DIR = os.environ.get("AUDIT_DIR", f"{BASE}/audit")
AUDIT_RATE = float(os.environ.get("AUDIT_RATE", "0.25"))
AUDIT_SEED = int(os.environ.get("AUDIT_SEED", "1337"))
MODE = os.environ.get("MODE", "select").lower()

SEVEN = {"GILL", "JFB", "CLARKE", "KD", "MHC", "TYN", "GNV"}
# SAMPLING risk-tier ONLY (select()'s force-100%-audit set for the strongest
# contradiction claims) — deliberately narrower than, and NOT the same as, the
# §7 expected-lean set in scan_guardrails() below. Do not conflate the two.
DISC_LEAN = {"genuine_contradiction", "probable_contradiction"}


# ---------- shared verbatim normalization (mirrors verifyExcerpts.py) ----------
def norm(s):
    s = unicodedata.normalize("NFC", s or "")
    s = (s.replace("‘", "'").replace("’", "'")
           .replace("“", '"').replace("”", '"')
           .replace("–", "-").replace("—", "-"))
    s = re.sub(r"-{2,}", "-", s)
    s = re.sub(r"\s+([;:,.!?])", r"\1", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def load(p):
    return json.load(open(p, encoding="utf-8"))


# ---- PPF verdict decode (AUDITOR_SPEC.md) -----------------------------------
# The auditor emits enum-heavy verdicts in PPF instead of JSON (40-70% fewer
# output tokens). Two line kinds, prefix-tagged: E| per excerpt, G| guardrails.
# Decoded back to the same dict shape report() consumed from the old JSON files.
_EXC = ppf.create([
    {"name": "excerpt_uid", "type": "str"},
    {"name": "in_source", "type": "enum", "enumMap": {0: "fail", 1: "pass"}},
    {"name": "on_tension", "type": "enum", "enumMap": {0: "off_tension", 1: "weak", 2: "on_tension"}},
    {"name": "pole_label", "type": "enum", "enumMap": {0: "correct", 1: "should_flip", 2: "no_stance"}},
    {"name": "overall", "type": "enum", "enumMap": {0: "fail", 1: "flag", 2: "pass"}},
    {"name": "action", "type": "str", "optional": True},
    {"name": "reason", "type": "str", "optional": True},
])
_GRD = ppf.create([
    {"name": "parity", "type": "enum", "enumMap": {0: "ok", 1: "violated"}},
    {"name": "connectives", "type": "enum", "enumMap": {0: "ok", 1: "flag"}},
    {"name": "named_skeptic", "type": "enum", "enumMap": {0: "ok", 1: "not_real", 2: "strawman", 3: "n/a"}},
    {"name": "discrepancy_integrity", "type": "enum",
     "enumMap": {0: "ok", 1: "co_opted", 2: "relabel_ok", 3: "relabel_missing"}},
    {"name": "deeper_learning", "type": "enum", "enumMap": {0: "ok", 1: "flag", 2: "missing"}},
    {"name": "reason", "type": "str", "optional": True},
])


def decode_verdict(text, cid):
    excerpts, guardrails = [], None
    for line in text.strip().split("\n"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("E|"):
            rec, _ = _EXC.parse_one(line[2:])
            if rec.get("action") in (None, "", "-"):
                rec["action"] = None
            excerpts.append(rec)
        elif line.startswith("G|"):
            guardrails, _ = _GRD.parse_one(line[2:])
    out = {"contradiction_id": cid, "excerpts": excerpts}
    if guardrails:
        out["guardrails"] = guardrails
    return out


def load_verdict(path):
    """Read a verdict file as JSON (.json) or PPF (.ppf), returning the same dict
    shape. The id comes from the filename."""
    cid = int(re.findall(r"\d+", os.path.basename(path))[0])
    if path.endswith(".ppf"):
        return decode_verdict(open(path, encoding="utf-8").read(), cid)
    return load(path)


def machine_files():
    return sorted(glob.glob(os.path.join(MACHINE_DIR, "*.json")),
                  key=lambda p: int(re.findall(r"\d+", os.path.basename(p))[0]))


# deterministic, dependency-free hash for stable sampling (no Math.random / time)
def stable_key(s, seed):
    h = seed & 0xFFFFFFFF
    for ch in s:
        h = (h * 1000003 + ord(ch)) & 0xFFFFFFFF
    return h


def open_ref():
    rc = sqlite3.connect(f"file:{REF_DB}?mode=ro", uri=True)
    return rc, rc.cursor()


def run_floor(cur):
    """Mechanical floor over EVERY excerpt. Returns (records, fails)."""
    lic = {r[0]: r[1] for r in cur.execute("SELECT code, license_code FROM text_sources")}
    note_cache = {}

    def note_text(voice, bk, ch, vs):
        key = (voice, bk, ch, vs)
        if key not in note_cache:
            r = cur.execute(
                "SELECT text FROM verse_commentaries WHERE source_code=? AND book=? AND chapter=? AND verse=?",
                (voice, bk, ch, vs)).fetchone()
            note_cache[key] = r[0] if r else None
        return note_cache[key]

    records, fails = [], []
    for f in machine_files():
        d = load(f)
        cid = d["contradiction_id"]
        for i, ex in enumerate(d.get("excerpts", [])):
            uid = f"{cid}#{i}"
            tag = f"{uid} [{ex.get('source_code')} {ex.get('verse_ref')}]"
            sc = ex.get("source_code")
            ok, why, src = True, None, None
            rec_lic = resolve_attr(ex, VOICES)["license_code"]
            if sc not in SEVEN:
                ok, why = False, "source_code not in the seven"
            elif rec_lic != "PD" or lic.get(sc) != "PD":
                ok, why = False, f"license not PD (rec={rec_lic}, db={lic.get(sc)})"
            else:
                m = re.match(r"^([A-Z]+)/(\d+)/(\d+)/(\d+)$", ex.get("full_note_ref", ""))
                if not m or m.group(1) != sc:
                    ok, why = False, f"bad/mismatched full_note_ref {ex.get('full_note_ref')!r}"
                else:
                    bk, chp, vs = int(m.group(2)), int(m.group(3)), int(m.group(4))
                    src = note_text(sc, bk, chp, vs)
                    if src is None:
                        ok, why = False, f"no verse_commentaries row at {ex['full_note_ref']}"
                    else:
                        hay = norm(src)
                        frags = [p for p in re.split(r"\s*…\s*|\s*\.\.\.\s*", ex["excerpt_text"]) if p.strip()]
                        bad = [fr for fr in frags if norm(fr) not in hay]
                        if bad:
                            ok, why = False, "NOT VERBATIM: " + " || ".join(norm(b)[:60] for b in bad)
            records.append({"uid": uid, "cid": cid, "source_code": sc,
                            "verse_ref": ex.get("verse_ref"), "pole": ex.get("pole"),
                            "full_note_ref": ex.get("full_note_ref"),
                            "floor": "pass" if ok else "fail", "why": why,
                            "source_note_text": src})
            if not ok:
                fails.append(f"{tag}: {why}")
    return records, fails


def pole_count(pole):
    """Content count for parity: excerpts already tallied separately; here count
    the non-excerpt content (a named-skeptic connective counts as 1)."""
    return 1 if (pole or {}).get("status") == "named_skeptic" else 0


def scan_guardrails(records):
    """Mechanical guardrail checks over EVERY machine row (guardrails 2/3/4/5 +
    deeper-learning #36). Semantic quality is the auditor's job; this is structure
    only. Returns a per-contradiction list + violation tallies."""
    exc_by_cid = {}
    for r in records:
        exc_by_cid.setdefault(r["cid"], {"reconcile": 0, "discrepancy": 0})
        exc_by_cid[r["cid"]][r["pole"]] = exc_by_cid[r["cid"]].get(r["pole"], 0) + 1

    # deeper-learning allowlist (#36) from policy file, with a safe fallback
    dl_policy_path = f"{BASE}/deeper_learning_policy.json"
    DL_ALLOWLIST = (load(dl_policy_path).get("live_link_allowlist")
                    if os.path.exists(dl_policy_path)
                    else ["gotquestions.org", "carm.org", "defendinginerrancy.com"])

    # consensus per id (lean is mechanically derived from it).
    # SPEC §7: reconcile-first ONLY for the two harmonization-leaning levels;
    # every other value — the two contradiction levels, genuinely_disputed,
    # null, unmapped — is discrepancy-first (this is the 2026-07 flip that
    # changed shipped behavior).
    RECONCILE_LEAN = {"probable_harmonization", "apparent_only"}
    cons_by_cid = {}
    for f in machine_files():
        cid = load(f)["contradiction_id"]
        gp = os.path.join(GATHER_DIR, f"{cid}.json")
        cons_by_cid[cid] = load(gp).get("consensus") if os.path.exists(gp) else None

    rows = []
    viol = {"lean_wrong": 0, "parity": 0, "connective_missing": 0,
            "discrepancy_blank": 0, "deeper_learning_missing": 0, "deeper_learning_link_offlist": 0}
    for f in machine_files():
        d = load(f)
        cid = d["contradiction_id"]
        row = d.get("row", {}) or {}
        rec, disc = row.get("reconcile", {}) or {}, row.get("discrepancy", {}) or {}
        lean = row.get("lean")
        cons = cons_by_cid.get(cid)
        expected_lean = "reconcile_first" if cons in RECONCILE_LEAN else "discrepancy_first"
        lean_wrong = (lean != expected_lean)
        rcount = exc_by_cid.get(cid, {}).get("reconcile", 0) + pole_count(rec)
        dcount = exc_by_cid.get(cid, {}).get("discrepancy", 0) + pole_count(disc)
        # parity: leaning pole >= other pole
        if lean == "discrepancy_first":
            parity_ok = dcount >= rcount
        else:
            parity_ok = rcount >= dcount
        # connective present on every filled/named_skeptic pole (guardrail 5)
        conn_missing = []
        for name, p, n in (("reconcile", rec, exc_by_cid.get(cid, {}).get("reconcile", 0)),
                           ("discrepancy", disc, exc_by_cid.get(cid, {}).get("discrepancy", 0))):
            filled = (p.get("status") in ("filled", "named_skeptic")) or n > 0
            if filled and not (p.get("connective") or "").strip():
                conn_missing.append(name)
        # discrepancy never blank (guardrails 3/4)
        dstatus = disc.get("status")
        disc_blank = not (dstatus in ("filled", "named_skeptic")
                          or (dstatus == "empty" and disc.get("relabel_flag")))
        # deeper-learning defense exit (#36): pd_work REQUIRED; link optional, allowlist-only
        dl = (d.get("deeper_learning") or row.get("deeper_learning") or {}).get("defense") or {}
        dl_missing = not ((dl.get("pd_work") or {}).get("resource"))
        link_url = (dl.get("link") or {}).get("url")
        link_offlist = bool(link_url) and not any(dom in link_url for dom in DL_ALLOWLIST)

        if lean_wrong:
            viol["lean_wrong"] += 1
        if not parity_ok:
            viol["parity"] += 1
        if conn_missing:
            viol["connective_missing"] += 1
        if disc_blank:
            viol["discrepancy_blank"] += 1
        if dl_missing:
            viol["deeper_learning_missing"] += 1
        if link_offlist:
            viol["deeper_learning_link_offlist"] += 1
        rows.append({"cid": cid, "lean": lean, "consensus": cons,
                     "lean_wrong": lean_wrong, "expected_lean": expected_lean,
                     "reconcile_count": rcount, "discrepancy_count": dcount,
                     "parity": "ok" if parity_ok else "violated",
                     "connective_missing": conn_missing,
                     "discrepancy_blank": disc_blank,
                     "deeper_learning_missing": dl_missing,
                     "deeper_learning_link_offlist": link_offlist})
    return {"rows": rows, "violations": viol, "total": len(rows)}


def select():
    os.makedirs(f"{AUDIT_DIR}/work", exist_ok=True)
    os.makedirs(f"{AUDIT_DIR}/verdicts", exist_ok=True)
    rc, cur = open_ref()
    records, fails = run_floor(cur)
    rc.close()

    floor = {"total": len(records), "passed": sum(1 for r in records if r["floor"] == "pass"),
             "failed": len(fails), "failures": fails,
             "records": [{k: v for k, v in r.items() if k != "source_note_text"} for r in records]}
    json.dump(floor, open(f"{AUDIT_DIR}/_floor.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"FLOOR (mechanical, all excerpts): {floor['passed']}/{floor['total']} pass, {floor['failed']} fail")
    if fails:
        print("  FLOOR FAILURES (fix before sampling):")
        for x in fails:
            print("   -", x)
        print("Aborting sample selection — the floor must be clean first.")
        return

    # ---- mechanical guardrail scan (2/3/4/5 + deeper-learning #36) ----
    g = scan_guardrails(records)
    json.dump(g, open(f"{AUDIT_DIR}/_guardrails.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    v = g["violations"]
    print(f"GUARDRAILS (mechanical, all {g['total']} rows): "
          f"lean-wrong {v['lean_wrong']} · parity {v['parity']} · "
          f"connective-missing {v['connective_missing']} · "
          f"discrepancy-blank {v['discrepancy_blank']} · defense-exit-missing {v['deeper_learning_missing']} · "
          f"link-offlist {v['deeper_learning_link_offlist']}")
    if any(v.values()):
        print("  (structural guardrail gaps above — semantic quality is judged by the agent audit)")

    # gather per-contradiction context + machine row
    by_uid = {r["uid"]: r for r in records}
    metas, rows = {}, {}
    for f in machine_files():
        d = load(f)
        cid = d["contradiction_id"]
        rows[cid] = d.get("row", {})
        g = load(os.path.join(GATHER_DIR, f"{cid}.json"))
        metas[cid] = {"question": g.get("question", ""), "summary": g.get("summary", ""),
                      "consensus": g.get("consensus", "")}

    # ---- stratified deterministic sample ----
    # 1) forced: every discrepancy excerpt; every excerpt of a discrepancy-leaning
    #    contradiction; one per contradiction (the lowest stable_key excerpt).
    pool = list(records)  # all are floor-pass here
    by_cid = {}
    for r in pool:
        by_cid.setdefault(r["cid"], []).append(r)

    sampled = set()
    for cid, exs in by_cid.items():
        cons = metas[cid]["consensus"]
        # per-contradiction floor: at least one audited excerpt
        first = min(exs, key=lambda r: stable_key(r["uid"], AUDIT_SEED))
        sampled.add(first["uid"])
        for r in exs:
            if r["pole"] == "discrepancy":          # rare -> 100%
                sampled.add(r["uid"])
            if cons in DISC_LEAN:                    # highest-risk tier -> 100%
                sampled.add(r["uid"])

    # 2) fill to the target rate, stratified by voice (lowest stable_key first
    #    within each voice bucket) so every voice gets coverage.
    target = max(len(sampled), round(AUDIT_RATE * len(pool)))
    by_voice = {}
    for r in pool:
        if r["uid"] not in sampled:
            by_voice.setdefault(r["source_code"], []).append(r)
    for v in by_voice:
        by_voice[v].sort(key=lambda r: stable_key(r["uid"], AUDIT_SEED))
    # round-robin across voices
    order = sorted(by_voice.keys())
    idx = {v: 0 for v in order}
    progress = True
    while len(sampled) < target and progress:
        progress = False
        for v in order:
            if len(sampled) >= target:
                break
            if idx[v] < len(by_voice[v]):
                sampled.add(by_voice[v][idx[v]]["uid"])
                idx[v] += 1
                progress = True

    # ---- write per-id work files (sampled excerpts only) ----
    work_by_cid = {}
    for f in machine_files():
        d = load(f)
        cid = d["contradiction_id"]
        chosen = []
        for i, ex in enumerate(d.get("excerpts", [])):
            uid = f"{cid}#{i}"
            if uid in sampled:
                rec = by_uid[uid]
                chosen.append({
                    "excerpt_uid": uid, "pole": ex.get("pole"),
                    "source_code": ex.get("source_code"),
                    "attribution": resolve_attr(ex, VOICES)["attribution"],
                    "verse_ref": ex.get("verse_ref"), "full_note_ref": ex.get("full_note_ref"),
                    "excerpt_text": ex.get("excerpt_text"),
                    "on_tension_rationale": ex.get("on_tension_rationale"),
                    "source_note_text": rec["source_note_text"],
                })
        if not chosen:
            continue
        row = d.get("row", {}) or {}
        wf = {"contradiction_id": cid,
              "question": metas[cid]["question"], "summary": metas[cid]["summary"],
              "consensus": metas[cid]["consensus"], "lean": row.get("lean"),
              "reconcile": row.get("reconcile", {}) or {},
              "discrepancy": row.get("discrepancy", {}) or {},
              "deeper_learning": d.get("deeper_learning") or row.get("deeper_learning") or {},
              "excerpts": chosen}
        work_by_cid[cid] = wf
        json.dump(wf, open(f"{AUDIT_DIR}/work/{cid}.json", "w", encoding="utf-8"),
                  ensure_ascii=False, indent=2)

    # strata summary
    def tally(keyfn):
        out = {}
        for r in pool:
            k = keyfn(r)
            out.setdefault(k, {"total": 0, "sampled": 0})
            out[k]["total"] += 1
            out[k]["sampled"] += 1 if r["uid"] in sampled else 0
        return out

    manifest = {
        "rate_target": AUDIT_RATE, "seed": AUDIT_SEED,
        "excerpts_total": len(pool), "excerpts_sampled": len(sampled),
        "contradictions_total": len(by_cid), "contradictions_with_work": len(work_by_cid),
        "by_consensus": tally(lambda r: metas[r["cid"]]["consensus"]),
        "by_voice": tally(lambda r: r["source_code"]),
        "by_pole": tally(lambda r: r["pole"]),
        "sampled_uids": sorted(sampled, key=lambda u: (int(u.split("#")[0]), int(u.split("#")[1]))),
    }
    json.dump(manifest, open(f"{AUDIT_DIR}/_sample.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    print(f"SAMPLE: {len(sampled)}/{len(pool)} excerpts "
          f"({len(sampled)/len(pool):.0%}) across {len(work_by_cid)} contradictions "
          f"-> {AUDIT_DIR}/work/*.json")
    print(f"  next: dispatch the auditor agent over audit/work/*.json per AUDITOR_SPEC.md,")
    print(f"        then: MODE=report python .scripts/auditHarmonization.py")


def report():
    if not os.path.exists(f"{AUDIT_DIR}/_sample.json"):
        print("No _sample.json — run select first."); return
    sample = load(f"{AUDIT_DIR}/_sample.json")
    floor = load(f"{AUDIT_DIR}/_floor.json")
    vfiles = sorted(glob.glob(f"{AUDIT_DIR}/verdicts/*.json") + glob.glob(f"{AUDIT_DIR}/verdicts/*.ppf"),
                    key=lambda p: int(re.findall(r"\d+", os.path.basename(p))[0]))
    verdicts, disc_pole, gverdicts = {}, {}, {}
    for f in vfiles:
        d = load_verdict(f)
        for e in d.get("excerpts", []):
            verdicts[e["excerpt_uid"]] = e
        if "discrepancy_pole" in d:
            disc_pole[d["contradiction_id"]] = d["discrepancy_pole"]
        if isinstance(d.get("guardrails"), dict):
            gverdicts[d["contradiction_id"]] = d["guardrails"]

    expected = set(sample["sampled_uids"])
    got = set(verdicts)
    missing = sorted(expected - got, key=lambda u: (int(u.split("#")[0]), int(u.split("#")[1])))
    extra = sorted(got - expected)

    def count(field, vals):
        return {v: sum(1 for e in verdicts.values() if e.get(field) == v) for v in vals}

    overall = count("overall", ["pass", "flag", "fail"])
    on_tension = count("on_tension", ["on_tension", "weak", "off_tension"])
    pole = count("pole_label", ["correct", "should_flip", "no_stance"])
    fails = [e for e in verdicts.values() if e.get("overall") == "fail"]
    flags = [e for e in verdicts.values() if e.get("overall") == "flag"]
    dishonest = {cid: v for cid, v in disc_pole.items() if v.get("verdict") == "dishonest"}

    summary = {
        "floor": {"total": floor["total"], "passed": floor["passed"], "failed": floor["failed"]},
        "sample": {"target_rate": sample["rate_target"],
                   "expected": len(expected), "received": len(got),
                   "missing": missing, "extra": extra},
        "overall": overall, "on_tension": on_tension, "pole_label": pole,
        "fails": fails, "flags": flags,
        "discrepancy_pole": {"honest": sum(1 for v in disc_pole.values() if v.get("verdict") == "honest"),
                             "dishonest": dishonest},
    }

    # ---- aggregate the auditor's per-contradiction guardrail verdicts (AUDITOR_SPEC) ----
    GDIMS = {
        "parity": ["ok", "violated"],
        "connectives": ["ok", "flag"],
        "named_skeptic": ["ok", "not_real", "strawman", "n/a"],
        "discrepancy_integrity": ["ok", "co_opted", "relabel_ok", "relabel_missing"],
        "deeper_learning": ["ok", "flag", "missing"],
    }
    def gcount(dim, vals):
        return {v: sum(1 for gv in gverdicts.values() if gv.get(dim) == v) for v in vals}
    guardrails_agent = {dim: gcount(dim, vals) for dim, vals in GDIMS.items()}
    bad_vals = {"violated", "flag", "not_real", "strawman", "co_opted", "relabel_missing", "missing"}
    guardrails_agent_offenders = sorted(
        cid for cid, gv in gverdicts.items()
        if any(gv.get(dim) in bad_vals for dim in GDIMS))
    summary["guardrails_agent"] = {"reviewed": len(gverdicts),
                                   "by_dimension": guardrails_agent,
                                   "offenders": guardrails_agent_offenders}
    json.dump(summary, open(f"{AUDIT_DIR}/audit_summary.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)

    L = ["# Harmonization excerpt sweep — sampled-audit report", "",
         "**Posture (owner Decision A, 2026-06-14):** machine-excerpt + sampled audit. "
         "The mechanical floor checks *every* excerpt; the auditor agent judges a stratified sample "
         "for on-tension relevance and pole-label correctness.", "",
         f"## Mechanical floor (all {floor['total']} excerpts)",
         f"- verbatim + PD + traceable: **{floor['passed']}/{floor['total']} pass**, {floor['failed']} fail",
         ""]
    if floor["failed"]:
        L.append("> Floor failures present — these MUST be fixed; they are a hard gate, not a sample.")
        L.append("")
    L += [f"## Agent audit (sample: {len(got)}/{sample['excerpts_total']} excerpts, "
          f"target {sample['rate_target']:.0%})", ""]
    if missing:
        L.append(f"> ⚠ {len(missing)} sampled excerpt(s) have no verdict: {', '.join(missing)}")
        L.append("")
    L += [f"- overall: pass {overall['pass']} · flag {overall['flag']} · fail {overall['fail']}",
          f"- on-tension: on_tension {on_tension['on_tension']} · weak {on_tension['weak']} · off_tension {on_tension['off_tension']}",
          f"- pole label: correct {pole['correct']} · should_flip {pole['should_flip']} · no_stance {pole['no_stance']}", ""]
    if fails:
        L.append("### Fails (must not ship as-is)")
        for e in fails:
            L.append(f"- `{e['excerpt_uid']}` — {e.get('action') or 'fix'}: {e.get('reason','')}")
        L.append("")
    if flags:
        L.append("### Flags (ship, human glance)")
        for e in flags:
            L.append(f"- `{e['excerpt_uid']}` — {e.get('reason','')}")
        L.append("")
    L += ["## Discrepancy pole (Decision B: leave thin — verify thinness is honest)",
          f"- honest: {summary['discrepancy_pole']['honest']} contradiction(s)"]
    if dishonest:
        L.append(f"- ⚠ dishonest: {len(dishonest)}")
        for cid, v in dishonest.items():
            L.append(f"  - id {cid}: {v.get('reason','')}")
    L.append("")
    if os.path.exists(f"{AUDIT_DIR}/_guardrails.json"):
        g = load(f"{AUDIT_DIR}/_guardrails.json")
        gv = g["violations"]
        summary["guardrails_mechanical"] = gv
        L += ["## Curation guardrails (mechanical scan, all rows)",
              f"- lean mislabeled vs consensus: {gv['lean_wrong']}",
              f"- parity violations (#2): {gv['parity']}",
              f"- connective missing (#5): {gv['connective_missing']}",
              f"- discrepancy pole blank (#3/#4): {gv['discrepancy_blank']}",
              f"- defense PD-work exit missing (#36): {gv['deeper_learning_missing']}",
              f"- defense live link off-allowlist (#36): {gv['deeper_learning_link_offlist']}", ""]
        offenders = [r for r in g["rows"] if r["lean_wrong"] or r["parity"] == "violated"
                     or r["connective_missing"] or r["discrepancy_blank"] or r["deeper_learning_missing"]]
        if offenders:
            L.append("| id | lean | exp.lean | rec | disc | parity | conn-missing | disc-blank | defense-missing |")
            L.append("|----|------|----------|-----|------|--------|--------------|------------|-----------------|")
            for r in offenders:
                L.append(f"| {r['cid']} | {r['lean']} | {'⚠'+r['expected_lean'] if r['lean_wrong'] else r['expected_lean']} | "
                         f"{r['reconcile_count']} | {r['discrepancy_count']} | "
                         f"{r['parity']} | {', '.join(r['connective_missing']) or '—'} | "
                         f"{'yes' if r['discrepancy_blank'] else '—'} | "
                         f"{'yes' if r['deeper_learning_missing'] else '—'} |")
            L.append("")
    if gverdicts:
        ga = summary["guardrails_agent"]
        bd = ga["by_dimension"]
        L += [f"## Curation guardrails (agent audit, {ga['reviewed']} contradictions reviewed)",
              f"- parity (#2): ok {bd['parity']['ok']} · violated {bd['parity']['violated']}",
              f"- connectives (#5): ok {bd['connectives']['ok']} · flag {bd['connectives']['flag']}",
              f"- named skeptic (#3): ok {bd['named_skeptic']['ok']} · not_real {bd['named_skeptic']['not_real']} · "
              f"strawman {bd['named_skeptic']['strawman']} · n/a {bd['named_skeptic']['n/a']}",
              f"- discrepancy integrity (#4): ok {bd['discrepancy_integrity']['ok']} · "
              f"co_opted {bd['discrepancy_integrity']['co_opted']} · relabel_ok {bd['discrepancy_integrity']['relabel_ok']} · "
              f"relabel_missing {bd['discrepancy_integrity']['relabel_missing']}",
              f"- deeper learning (#36): ok {bd['deeper_learning']['ok']} · flag {bd['deeper_learning']['flag']} · "
              f"missing {bd['deeper_learning']['missing']}", ""]
        if ga["offenders"]:
            L.append(f"> guardrail concerns flagged on id(s): {', '.join(str(c) for c in ga['offenders'])} "
                     f"(see verdict files for reasons)")
            L.append("")
    open(f"{BASE}/AUDIT-report.md", "w", encoding="utf-8").write("\n".join(L) + "\n")
    print(f"Wrote {AUDIT_DIR}/audit_summary.json and {BASE}/AUDIT-report.md")
    print(f"  floor {floor['passed']}/{floor['total']} · sample overall "
          f"pass {overall['pass']}/flag {overall['flag']}/fail {overall['fail']}")
    if missing:
        print(f"  ⚠ {len(missing)} sampled excerpts missing verdicts")


if __name__ == "__main__":
    (report if MODE == "report" else select)()
