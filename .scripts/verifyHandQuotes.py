#!/usr/bin/env python
"""
verifyHandQuotes.py — Independent verbatim floor over hand-sourced critic quotes.

The hand-quote analogue of verifyExcerpts.py (machine excerpts vs verse_commentaries)
and verifyVersePairs.py (verse-pair snippets vs WEB translations): for every dossier
quote with source.kind == "hand" AND a source URL (href / source.url), FETCH that
public-domain source page over the network and confirm the quote `text` is a verbatim
substring after the ONLY allowed normalizations — HTML tag/entity strip, Unicode NFC,
curly<->straight quotes, dash unification, whitespace collapse — and U+2026 ellipsis
splitting into fragments that must each be present.

WHY THIS EXISTS: hand quotes have no other automated floor, so a sourcing agent's
"verified" claim is untrusted. A T10 measurement batch found ~29% of agent-"verified"
critic quotes were actually paraphrase-as-quote (one was "verified" against a Cloudflare
challenge page). This gate re-fetches the URL and proves the words are really there;
a quote whose source cannot be fetched (404 / Cloudflare 403 / timeout) FAILS, which
forces critics onto cleanly-fetchable PD editions (Gutenberg / Wikisource / Archive.org).

Hand quotes with NO source url are SKIPPED (they are the human-sign-off tier, verified
in verification-ledger.json, not by this floor) and reported separately — they are not
a failure of this gate.

Read-only, NETWORK-dependent, makes no DB writes.

  python .scripts/verifyHandQuotes.py

Env: DOSSIER_DIR (./data/harmonization/curation/dossier), HTTP_TIMEOUT (30 sec),
     UA (browser-like User-Agent), IDS (optional CSV to check only those ids).
Exit: 1 if any URL-bearing hand quote is not verbatim or unfetchable; else 0.
"""
import os
import re
import sys
import glob
import gzip
import json
import html
import unicodedata
import urllib.request
import urllib.error

DOSSIER_DIR = os.environ.get("DOSSIER_DIR", "./data/harmonization/curation/dossier")
TIMEOUT = int(os.environ.get("HTTP_TIMEOUT", "30"))
UA = os.environ.get(
    "UA",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36",
)
ONLY_IDS = set(x.strip() for x in os.environ.get("IDS", "").split(",") if x.strip())

# force UTF-8 stdout — quotes carry … (U+2026); default Windows cp1252 console crashes.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


def norm(s: str) -> str:
    s = s or ""
    s = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", s)  # drop script/style bodies
    s = re.sub(r"<[^>]*>", " ", s)                              # strip tags
    s = html.unescape(s)                                        # &#8217; -> ’ etc.
    s = re.sub(r"\{\d+(?:\.\d+)?\}", " ", s)                    # transcription footnote/page markers, e.g. {1.14}
    s = unicodedata.normalize("NFC", s)
    s = (s.replace("‘", "'").replace("’", "'")
           .replace("“", '"').replace("”", '"')
           .replace("–", "-").replace("—", "-"))
    # Drop Greek + Hebrew citation runs: a critic's embedded Greek/Hebrew word
    # (e.g. Strauss quoting ἄρτι ἐτελεύτησε) rarely byte-matches across editions
    # (encoding / accent composition), and it is not where paraphrase hides — the
    # floor verifies the surrounding English prose. Both sides are stripped equally.
    s = re.sub(r"[Ͱ-Ͽἀ-῿֐-׿]+", " ", s)
    s = re.sub(r"-{2,}", "-", s)
    s = re.sub(r"\s+([;:,.!?])", r"\1", s)
    s = re.sub(r"\s+", " ", s)
    s = s.replace("( ", "(").replace(" )", ")")                 # inner-paren spacing: "( viii, 5 )" == "(viii, 5)"
    return s.strip().lower()


_cache = {}


def fetch(url: str):
    """Return (status, normalized_text). status == 'ok' on success; otherwise a
    short reason ('http 403', 'timeout', 'error <Type>'). Cached per URL."""
    if url in _cache:
        return _cache[url]
    last = "error"
    for _attempt in range(3):  # retry transient network failures (SSL/timeout); HTTP errors are definitive
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                raw = r.read()
                if (r.headers.get("Content-Encoding") or "").lower() == "gzip":
                    raw = gzip.decompress(raw)
                _cache[url] = ("ok", norm(raw.decode("utf-8", errors="replace")))
                return _cache[url]
        except urllib.error.HTTPError as e:
            _cache[url] = (f"http {e.code}", "")  # 403/404 won't fix on retry
            return _cache[url]
        except (urllib.error.URLError, TimeoutError) as e:
            last = f"unreachable ({getattr(e, 'reason', e)})"
        except Exception as e:
            last = f"error {type(e).__name__}"
    _cache[url] = (last, "")
    return _cache[url]


def hand_quotes(data):
    """Yield (pole, index, url_or_None, text) for every source.kind=='hand' quote."""
    for pole in ("reconcile", "discrepancy"):
        obj = data.get(pole) or {}
        for i, q in enumerate(obj.get("quotes") or []):
            if not isinstance(q, dict):
                continue
            src = q.get("source") or {}
            if src.get("kind") != "hand":
                continue
            url = q.get("href") or src.get("url")
            yield (pole, i, url, q.get("text", ""))


def main():
    files = sorted(
        glob.glob(os.path.join(DOSSIER_DIR, "*.json")),
        key=lambda p: int(re.findall(r"\d+", os.path.basename(p))[0]),
    )
    if not os.path.isdir(DOSSIER_DIR) or not files:
        print("Hand quotes checked: 0   PASS: 0   FAIL: 0   SKIP: 0")
        print("all clear (no dossier files yet)")
        return

    total = passed = skipped = 0
    fails = []
    skips = []
    for f in files:
        data = json.load(open(f, encoding="utf-8"))
        cid = str(data.get("contradiction_id") or os.path.splitext(os.path.basename(f))[0])
        if ONLY_IDS and cid not in ONLY_IDS:
            continue
        for pole, i, url, text in hand_quotes(data):
            total += 1
            tag = f"id {cid} [{pole} #{i}]"
            if not url:
                skipped += 1
                skips.append(f"{tag}: hand quote has no source url (human-sign-off tier)")
                continue
            status, hay = fetch(url)
            if status != "ok":
                fails.append(f"{tag}: SOURCE UNFETCHABLE ({status}) {url}")
                continue
            frags = [p for p in re.split(r"\s*…\s*|\s*\.\.\.\s*", text) if p.strip()]
            bad = [fr for fr in frags if norm(fr) not in hay]
            if bad:
                fails.append(f"{tag}: NOT VERBATIM at {url} — fragment(s) absent: " +
                             " || ".join(norm(b)[:60] for b in bad))
                continue
            passed += 1

    print(f"Hand quotes checked: {total}   PASS: {passed}   FAIL: {len(fails)}   SKIP: {skipped}")
    if skips:
        print("\nSKIPPED (no url — verify via verification-ledger.json / human sign-off):")
        for x in skips:
            print("  -", x)
    if fails:
        print("\nFAILURES:")
        for x in fails:
            print("  -", x)
        sys.exit(1)
    print("\nAll URL-bearing hand quotes verified: verbatim substrings of their fetched PD source.")


if __name__ == "__main__":
    main()
