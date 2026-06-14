---
name: Pass-5 multi-volume editor-credit sweep
description: Late audit passes catch missing editor credits for chapters cited in multi-author volumes; NIB and JSOTSup are repeat offenders
type: feedback
---

When pass 4 has caught one editor-credit parity issue (e.g., Grabbe ed. on LHBOTS 421), pass 5 should sweep ALL multi-author volume citations for the same omission. Common repeat-offender citations missing editor credit include:

- The New Interpreter's Bible Vol. 3 (Abingdon, 1999) — chapter cited needs "ed. Leander E. Keck"
- The Chronicler as Historian, JSOTSup 238 (Sheffield, 1997) — needs "ed. M. Patrick Graham, Kenneth G. Hoglund, and Steven L. McKenzie"
- The Chronicler as Theologian, JSOTSup 371 — needs editor credit
- The Chronicler as Author, JSOTSup 263 — needs editor credit
- LHBOTS conference volumes — verify each
- Festschrift volumes — verify each

**Why:** Pass 4 caught Grabbe ed. for LHBOTS 421 on the principle that chapters in multi-author volumes need editor credit. By the parallel principle, every "in [Volume Name]" chapter citation needs the editor credit. AI drafts routinely omit these.

**How to apply:** When auditing pass 5 of any batch, grep for `"in ` and `JSOTSup` and `LHBOTS` and `New Interpreter` and verify each chapter-in-volume citation has editor credit. If editor credit is missing and the chapter cite is otherwise sound, add the editor credit as a Medium-severity fix.
