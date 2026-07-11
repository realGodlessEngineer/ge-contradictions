/**
 * fetchWell.js — pre-fetch the vetted PD critic "well" (data/harmonization/pd-critics-well.json)
 * ONCE into a local, greppable text corpus so T10 authoring agents extract verbatim critic
 * quotes from DISK (deterministic, offline, like T9's pre-fetched WEB text) instead of
 * paraphrasing through WebFetch's summarizer — the failure mode the T10 test batch measured
 * at ~29% (agent "verified" against a Cloudflare page / OCR drift).
 *
 * For each well entry it downloads source_url, strips scripts/tags, unescapes entities, and
 * writes a paragraph-per-line text file to data/harmonization/curation/_t10bundles/_well/<key>.txt
 * PLUS _well/status.json (per-key http status + byte size). The text is intentionally light-
 * normalized (case + punctuation preserved) so an agent copies real readable prose that will
 * still substring-match after verifyHandQuotes.py's fetch+norm re-check.
 *
 * An UNFETCHABLE well source (404 / Cloudflare 403 / timeout) is recorded as status!='ok' and
 * carries no text file — the bundle builder must not offer it to agents (a quote from it would
 * fail the gate). Re-run with REFETCH=1 to force re-download of already-cached keys.
 *
 * Read-only w.r.t. every .db; network-dependent; makes no DB writes.
 *   node .scripts/fetchWell.js
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const WELL_JSON = path.join(ROOT, 'data/harmonization/pd-critics-well.json');
const OUT = path.join(ROOT, 'data/harmonization/curation/_t10bundles/_well');
const REFETCH = process.env.REFETCH === '1';

const well = JSON.parse(fs.readFileSync(WELL_JSON, 'utf8'));
fs.mkdirSync(OUT, { recursive: true });

// One Python worker does the fetch + clean (urllib, gzip, tag strip, entity unescape,
// paragraph-line-break) — mirrors verifyHandQuotes.py's fetch/norm so the copy-source the
// agent sees is the same prose the gate will re-verify.
const PY = `
import sys, json, re, gzip, html, unicodedata, urllib.request, urllib.error
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")
def fetch(url):
    for _ in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=45) as r:
                raw = r.read()
                if (r.headers.get("Content-Encoding") or "").lower() == "gzip":
                    raw = gzip.decompress(raw)
                return "ok", raw.decode("utf-8", errors="replace")
        except urllib.error.HTTPError as e:
            return f"http {e.code}", ""
        except Exception as e:
            last = f"unreachable ({type(e).__name__})"
    return last, ""
def clean(s):
    s = re.sub(r"(?is)<(script|style)[^>]*>.*?</\\1>", " ", s)
    # block-level boundaries -> newline so the result is greppable paragraph-per-line
    s = re.sub(r"(?i)<\\s*(br|/p|/div|/h[1-6]|/li|/tr|/blockquote|/td)\\s*/?>", "\\n", s)
    s = re.sub(r"<[^>]*>", " ", s)          # strip remaining tags
    s = html.unescape(s)
    s = unicodedata.normalize("NFC", s)
    lines = []
    for ln in s.split("\\n"):
        ln = re.sub(r"[ \\t\\r\\f\\v]+", " ", ln).strip()
        if ln:
            lines.append(ln)
    return "\\n".join(lines)
key, url = sys.argv[1], sys.argv[2]
status, body = fetch(url)
if status == "ok":
    txt = clean(body)
    sys.stdout.write(json.dumps({"status": "ok", "bytes": len(txt)}))
    open(sys.argv[3], "w", encoding="utf-8").write(txt)
else:
    sys.stdout.write(json.dumps({"status": status, "bytes": 0}))
`;

const status = {};
for (const [key, meta] of Object.entries(well)) {
    const outFile = path.join(OUT, `${key}.txt`);
    if (!REFETCH && fs.existsSync(outFile) && fs.statSync(outFile).size > 0) {
        status[key] = { status: 'cached', bytes: fs.statSync(outFile).size, url: meta.source_url };
        console.log(`  cached  ${key} (${fs.statSync(outFile).size} bytes)`);
        continue;
    }
    try {
        const out = execFileSync('python', ['-c', PY, key, meta.source_url, outFile],
            { cwd: ROOT, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
        const r = JSON.parse(out);
        status[key] = { ...r, url: meta.source_url };
        console.log(`  ${r.status === 'ok' ? 'OK     ' : 'FAIL   '} ${key} — ${r.status} (${r.bytes} bytes) ${meta.source_url}`);
    } catch (e) {
        status[key] = { status: `error ${e.message.slice(0, 60)}`, bytes: 0, url: meta.source_url };
        console.log(`  ERROR  ${key} — ${e.message.slice(0, 80)}`);
    }
}
fs.writeFileSync(path.join(OUT, 'status.json'), JSON.stringify(status, null, 2));
const ok = Object.values(status).filter((s) => s.status === 'ok' || s.status === 'cached').length;
console.log(`\nWell corpus: ${ok}/${Object.keys(well).length} sources available -> ${path.relative(ROOT, OUT)}`);
const bad = Object.entries(status).filter(([, s]) => !(s.status === 'ok' || s.status === 'cached'));
if (bad.length) console.log(`  ⚠ unavailable (agents must NOT cite these — gate would fail): ${bad.map(([k, s]) => `${k} [${s.status}]`).join(', ')}`);
