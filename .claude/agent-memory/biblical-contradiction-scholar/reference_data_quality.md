---
name: Known data quality issues in contradictions.db
description: Recurring scrape artifacts to watch for in every batch
type: reference
---

Common issues observed in SAB-scraped contradictions that require `coherency_flag` or reference notes:

1. **Malformed Bible references** — `bibleReferences[]` sometimes contains chapter:verse strings without book names (e.g., `"45:21"`, `"9:1"`, `"35:11"`). These come from SAB source pages where the same book is referenced multiple times in sequence and only the first mention has the book name. Note in `scholarship` so DB maintainers can fix.

2. **Question/answer mismatch** — e.g., batch_01 id=14 has question "Should we bear each other's burdens?" but the answers are about Genesis creation accounts (questionUrl is `contra/accounts.html`). This looks like a join error at scrape time where the wrong question got paired with creation-account answers. Recommend delete with a clear delete_reason explaining the mismatch so the human can either fix the join or re-scrape.

3. **Answer IDs jumping dramatically** — when answer IDs are way out of sequence with the question ID (e.g., contradiction id=14 having answers id=1203, id=1204 when surrounding contradictions have answers in the 30s-40s range), that's another signal of a data-join problem.

4. **HTML whitespace artifacts** — `answerExplanation` fields contain embedded tab characters and extra whitespace from the source HTML. Leave these as-is in the data; they're the raw scrape output.

5. **SAB question URL format** — `https://www.skepticsannotatedbible.com/contra/*.html` — the URL slug usually indicates the topic, so when the question text seems wrong, cross-check the questionUrl slug (e.g., `accounts.html` for creation accounts).

6. **Wrong question text confirmed via WebFetch** — batch_09 ids 172 and 173 both had question="Who wrote the Pentateuch?" but the URLs (`moab2.html`, `ammonites.html`) and the answer content were about Moabite/Ammonite treatment. The actual SAB questions on those pages are "How should the Moabites be treated?" and "How should the Ammonites be treated?". Pattern: the SAB scrape sometimes pulls in an unrelated question header that appears at the top of the page rather than the page's specific contradiction question. Fix in-place by correcting the question field, note the correction in the commentary, and don't `recommend_delete` if the answers and URL are coherent — just the question text needs repair.
