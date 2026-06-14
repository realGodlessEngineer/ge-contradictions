---
name: Preserve all schema fields when writing batch JSON
description: When using Write tool to overwrite batch_NN.json, every original schema field must be present in the new content
type: feedback
---

When enriching batch_NN.json files via Write (full file replacement), every original schema field MUST be present in the new content: `id`, `question`, `summary`, `commentary`, `scholarship`, `recommend_delete`, `delete_reason`, `questionUrl`, `answers`. Forgetting any of these silently strips them from the file.

**Why:** During batch_10 enrichment I dropped `recommend_delete`, `delete_reason`, `questionUrl`, and `answers` from every entry by writing only the enriched fields, since I was thinking in terms of "the fields I'm enriching" rather than "the full record." Required a recovery script reconstructing originals from the in-conversation context.

**How to apply:**
- Prefer Edit tool entry-by-entry over Write of the whole file when possible — Edit only touches the targeted strings.
- If Write is unavoidable (e.g., bulk enrichment in one pass), include every key from the source record verbatim. Diff the keys before and after writing.
- After every Write to a batch file, run `node -e "console.log(Object.keys(require('PATH').contradictions[0]))"` to verify all 9 expected keys are present.
- The 9 required keys, in order, are: id, question, summary, commentary, scholarship, recommend_delete, delete_reason, questionUrl, answers.
- **Edit-tool comma gotcha:** When replacing `"scholarship": null,` style triples with new string values, *include the trailing comma* in your old_string and new_string. If your old_string stops at `"scholarship": null` (without the comma) and your new_string ends with `"…"`, you'll silently strip the field separator and break JSON parse. Always validate with `node -e "require('PATH')"` after a batch of Edits. Fixable post-hoc with a regex sweep but cleaner to get right the first time.
- **Edit-tool field-dropping gotcha (batch_30):** A common pattern is to old_string-match the block `id, question, summary:null, commentary:null, scholarship:null, recommend_delete:0, delete_reason:null,` because that block is unique per entry. If your new_string only contains the *enriched* fields (id, question, summary, commentary, scholarship) and omits recommend_delete/delete_reason, you silently drop those two fields from every entry. The fix is either (a) include recommend_delete/delete_reason in the new_string verbatim, or (b) shrink the old_string to match ONLY through scholarship and leave recommend_delete/delete_reason untouched. Always run the 9-key verification script after the batch.
