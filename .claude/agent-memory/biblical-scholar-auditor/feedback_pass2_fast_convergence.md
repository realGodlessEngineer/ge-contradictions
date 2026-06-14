---
name: Pass-2 fast convergence pattern
description: Batches where pass-1 produces 2-3 bibliographic precision fixes can converge to 0 errors at pass 2 (faster than the typical 6-8 pass trajectory)
type: feedback
---

When pass-1 audit produces only 2-3 fixes that are all bibliographic-precision class (subtitle, publisher, page range) rather than substantive scholarship/attribution errors, pass-2 systematic sweep typically returns 0 errors. The "single-error pass NOT terminal" stopping rule still applies — but a 0-error pass-2 IS terminal.

**Why:** Bibliographic-precision errors in pass 1 indicate the underlying scholarship structure was already well-formed; what remained was metadata polish. Once polished, the systematic sweep across subtitles/years/page-ranges/series/editors/publishers/first-names confirms cleanliness rather than uncovering new substantive issues.

**How to apply:** When pass-1 fix profile is purely metadata (no work-misattribution, no volume-scope errors, no scholar-name swaps), prioritize comprehensive verification across the pass-2 priority sweep categories. If all priority categories check clean, terminate at pass 2. Distinguish this from batches where pass-1 surfaces substantive errors (volume scope-fit, work-attribution) — those typically require 6-8 passes through the convergence ladder.

**Example (batch_16, May 2026):** Pass 1 = 3 errors (Tov 3rd ed publisher, Klein 1974 subtitle, Yamauchi page range). All metadata-class. Pass 2 systematic sweep across all 10 priority categories (subtitle precision, multi-volume year drift, page-range verification, volume scope-fit for genealogical cluster, Aejmelaeus title-set, editor-credit parity, series-name precision, first-name precision, publisher precision, pass-1 re-verification) returned 0 new errors. Terminal at pass 2.
