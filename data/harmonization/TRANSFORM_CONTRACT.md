# Harmonization excerpt TRANSFORM — compact agent contract

> Agent-facing distillation of the **TRANSFORM (machine-excerpt) half** of
> `TRANSFORM_SPEC.md`. Every operative rule is here; the full spec keeps the rationale,
> worked examples, and the separate **T9 dossier** contract. If this file and
> `TRANSFORM_SPEC.md` ever disagree, the full spec wins — flag it in your status output.

You turn raw public-domain commentary notes into **verbatim, attributed, pole-classified
excerpt candidates** for the "In the commentators' own words" surface. You SURFACE what the
commentators said; you do NOT adjudicate whether an argument "works." A separate auditor
samples your output, and a mechanical floor checks EVERY excerpt for verbatim + PD +
traceable — so nothing here is optional.

## Charter (non-negotiable)

1. **Verbatim excerpts.** `excerpt_text` is copied character-for-character from the note's
   `text`. The ONLY allowed deviations: trim to the on-tension sentence(s); join
   non-adjacent sentences with `…` (U+2026) **only when the join preserves the author's
   sense** (never splice to manufacture meaning); typography that does not change words
   (straight↔curly quotes, collapse whitespace runs, `--`→`—`, French-spaced `" :"`→`":"`).
   When you truncate mid-sentence, end with ` …` (U+2026) — **never** add a sentence-final
   period the source lacks. No paraphrase, summary, grammar "clean-up", or added words.
   This governs `excerpt_text` ONLY — `connective` lines are authored prose.
2. **Attribution.** Each excerpt carries `source_code` + the verbatim text + `full_note_ref`
   + `verse_ref` only. Do **not** copy author / work / year / attribution / license onto an
   excerpt — those resolve downstream from `source_code` via the `voices` codebook. A
   **named skeptic** is a free person NOT in the codebook: carry their name / work / year /
   attribution in full.
3. **On-tension or nothing.** Keep only sentence(s) that speak to THIS contradiction's
   specific tension (use `question` + `summary`). A note that only explains the verse
   generally yields **NO excerpt** — that is correct, not a miss. Better empty than padded.
4. **Never manufacture or co-opt a pole.** Do not stretch a harmonizing note into a
   "discrepancy" or vice versa; do not fill a real-contradiction pole with harmonizers.

## Five curation guardrails (the acceptance bar — the auditor checks all five)

1. **On-tension quotes only** (= charter 3).
2. **Count parity.** The `lean` pole's content count must be **≥** the other pole's.
   Count = 1 per verbatim excerpt + 1 if the pole carries a named-skeptic connective. On a
   `discrepancy_first` row this means **cap reconcile excerpts** so they do not exceed the
   discrepancy pole — usually surface the single **strongest** harmonization, not three.
3. **A thin/empty pole is never blank** — the **439 model**: name the strongest *real*
   skeptic who actually engaged the passage and state their real objection as an attributed
   `connective`. Even when the leading skeptic *concedes*, say so, attributed.
4. **Never co-opt a "real contradiction" pole with harmonizers.** On a `discrepancy_first`
   row the discrepancy pole must carry a real critic (439 model) — or, if none can honestly
   be named, set `relabel_flag: true` + `relabel_reason`.
5. **Every filled pole gets a connective half-line** so it argues, not just quotes — one
   authored sentence (≤ ~25 words), accurate to what it introduces, on-tension, no
   overclaiming.

## Pole classification

- **reconcile** — the excerpt treats the passages as compatible / explains the apparent
  conflict away (harmonizes, distinguishes senses, both-true reading).
- **discrepancy** — the excerpt concedes/asserts a genuine conflict. A *verbatim*
  discrepancy excerpt exists ONLY when a gathered note itself concedes (rare); otherwise the
  pole is carried by the **named-skeptic connective** (439 model), which is authored, not a
  verbatim quote.
- Purely descriptive, no stance on the tension → no excerpt.

## Selecting & parity

- Prefer the **fewest** sentences that carry the on-tension point (1–3).
- `reconcile_first` rows: keep the strongest 1–3 reconcile excerpts (distinct voices; no
  near-duplicates).
- `discrepancy_first` rows: **parity-cap reconcile** to the discrepancy pole's count
  (usually 1, the strongest), so the leaning pole is not out-quoted (guardrail 2).
- Emit ≥2 reconcile voices only where they genuinely exist — never fabricate to balance.
- A block-anchored note (`anchor: true`, K&D-style) may hide the on-tension sentence deep
  inside the block.

## Output — one JSON file to `data/harmonization/curation/machine/<id>.json`

```json
{
  "contradiction_id": 425,
  "row": {
    "lean": "discrepancy_first",
    "reconcile": {
      "status": "filled",
      "connective": "Defenders read the two commands as one mission in stages — Israel first, then all nations after the cross.",
      "skeptic": null,
      "empty_note": null
    },
    "discrepancy": {
      "status": "named_skeptic",
      "connective": "The sharpest objection is pressed by D. F. Strauss, who argues the Jews-only command and the universal commission cannot both stand as given.",
      "skeptic": {
        "name": "D. F. Strauss",
        "work": "The Life of Jesus Critically Examined",
        "year": "1846",
        "attribution": "D. F. Strauss (d. 1874), The Life of Jesus Critically Examined (1846)"
      },
      "empty_note": null,
      "relabel_flag": false,
      "relabel_reason": null
    }
  },
  "excerpts": [
    {
      "pole": "reconcile",
      "source_code": "JFB",
      "verse_ref": "Matthew 10:6",
      "excerpt_text": "…verbatim sentence(s) from the note…",
      "full_note_ref": "JFB/40/10/6",
      "on_tension_rationale": "Why this is on-tension (machine note, NOT shipped).",
      "verify_state": "machine"
    }
  ],
  "deeper_learning": {
    "defense": {
      "pd_work": {
        "resource": "John Haley, An Examination of the Alleged Discrepancies of the Bible (1874)",
        "author": "John Haley",
        "year": "1874",
        "note": "Haley treats this passage directly under the harmonizing tradition."
      },
      "link": {
        "url": "https://www.gotquestions.org/...",
        "domain": "gotquestions.org",
        "title": "GotQuestions: …this contradiction…",
        "note": "live apologetic treatment"
      }
    }
  }
}
```

### Field rules

- **Excerpts** — emit `pole`, `source_code`, `verse_ref`, `excerpt_text`, `full_note_ref`,
  `on_tension_rationale`, `verify_state` only. `source_code` / `full_note_ref` come straight
  from the note (`src` / `note_ref`). Do **not** copy author / work / year / attribution /
  license, and do **not** repeat `contradiction_id` per excerpt. `on_tension_rationale` is
  private (not shipped).
- **`lean`** — `reconcile_first` **only** when `consensus` is `probable_harmonization` or
  `apparent_only`; every other value (`genuine_contradiction`, `probable_contradiction`,
  `genuinely_disputed`, null/unmapped) is `discrepancy_first`. This is the §7 rule the
  validator, dossier leg, and baker all use — keep it identical to them (in particular
  `genuinely_disputed` is discrepancy-leaning, so its reconcile pole is parity-capped).
- **Pole `status`:**
  - `filled` — ≥1 verbatim excerpt on this pole. **Must** have a `connective`.
  - `named_skeptic` — no verbatim excerpt, but a real skeptic is named with their objection
    in `connective` + `skeptic` (the 439 model; the thin-pole default).
  - `empty` — genuinely nothing. On a `discrepancy_first` row this is allowed **only** with
    `relabel_flag: true` + a `relabel_reason` (guardrail 4). On a `reconcile_first` row, use
    it only when no skeptic engaged at all (rare; prefer `named_skeptic`) — supply a plain
    `empty_note`.
- **`connective`** — required on every `filled` and every `named_skeptic` pole. One authored
  sentence framing the point, accurate to the excerpts/objection it introduces, on-tension,
  **no overclaiming** (do not say a quote "dissolves the wording difference" if it only
  addresses the label).
- **`skeptic`** — required on `named_skeptic` poles: a *real* person who actually engaged
  this passage, accurately represented. Never invent a critic or a position. If the
  strongest skeptic concedes, say so.
- **`relabel_flag` / `relabel_reason`** — set true only when a `discrepancy_first` row has
  no honestly-nameable skeptic and only harmonizers. It routes the row to a human; it does
  **not** change the DB.

### Deeper-learning defense — `deeper_learning.defense` (backlog #36)

Every "go deeper" exit otherwise serves the critic; you generate the missing defense-side
exit. Two parts:

- **`pd_work` (REQUIRED)** — a **real, attributed** public-domain defense/harmonizing work
  that treats **this specific** contradiction. Canonical default: **John Haley, *An
  Examination of the Alleged Discrepancies of the Bible* (1874)**; a harmonizing commentator
  surfaced on the row, keyed to the passage, also qualifies. Never omit it.
- **`link` (OPTIONAL)** — one **live** apologetics page whose domain is on the allowlist
  (`gotquestions.org`, `carm.org`, `defendinginerrancy.com`). Include it only when you can
  cite a real, on-topic page; otherwise omit `link` / set `url` null. **Never guess or
  fabricate a URL or an off-allowlist domain.**

The auditor verifies both `pd_work` and any `link` are real and on-topic.

## Input — `data/harmonization/gather/by_id/<id>.json`

`question`, `summary`, `consensus`, parsed refs, a `voices` codebook, and a lean `notes[]`.
Each note is `{src, ref, note_ref, cites, text}` (plus `anchor: true` when block-anchored):
`src` = voice code (resolve author/work/year/attribution/license via `voices[src]`);
`ref` = display verse; `note_ref` = the `full_note_ref` to copy verbatim; `cites` = which
cited reference(s) the note answers; `text` = the ONLY place to draw `excerpt_text` from.
Work the **excerpts** only from those notes. The **named skeptic** (439 model) comes from
your own scholarship about who actually pressed this contradiction — name only critics you
are confident are real and are representing fairly; the auditor will check.

## Self-check before you finish

1. Every `excerpt_text` is a verbatim substring of its note (minus the allowed
   normalizations / `…` joins); no truncation adds a period the source lacks.
2. Parity holds: the `lean` pole's content count ≥ the other pole's.
3. Every `filled` / `named_skeptic` pole has a `connective`; no connective overclaims.
4. The discrepancy pole is never blank: `filled`, or `named_skeptic` with a real skeptic, or
   `empty` + `relabel_flag` (discrepancy_first only).
5. No invented critic, no strawmanned objection, no fabricated work or URL.
