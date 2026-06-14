# Mechanical consistency report

Read-only audit of `summary`/`commentary` prose against structured `bible_references`. No DB writes.

- Contradictions scanned: **605**
- Entries with at least one flag: **92**

## Flag counts

| Severity | Flag | Count | Meaning |
|---|---|---:|---|
| HIGH | `scope_mismatch` | 0 | stored testament_scope ≠ recomputed from refs |
| HIGH | `summary_disjoint` | 0 | summary names book(s) sharing none with its references |
| HIGH | `impossible_chapter` | 2 | a prose ref points past a book’s real chapter count |
| MEDIUM | `bit_mismatch` | 0 | stored books_in_tension ≠ recomputed from refs |
| MEDIUM | `commentary_disjoint` | 17 | commentary names book(s) sharing none with its references |
| LOW | `ref_book_absent` | 76 | a referenced book is never verse-cited in either prose field |
| LOW | `summary_no_books` | 5 | summary names no chapter-anchored book (informational) |
| LOW | `no_structured_refs` | 0 | contradiction has no usable references |

## HIGH-severity detail

### `impossible_chapter` (2)

- **id 326** — Nehemiah 655 (>Nehemiah max 13)
- **id 410** — Matthew 64:5 (>Matthew max 28)

## MEDIUM-severity detail

### `commentary_disjoint` (17)

- **id 31** — commentary books [Job, Genesis, Exodus, Hosea, Psalms] vs refs [John, 1 John, Luke, Romans]
- **id 74** — commentary books [Judges, Ezekiel] vs refs [Genesis, Leviticus, Deuteronomy, 2 Kings, 2 Chronicles]
- **id 323** — commentary books [Genesis] vs refs [Ezra, Nehemiah]
- **id 381** — commentary books [Psalms] vs refs [Jonah]
- **id 388** — commentary books [1 Chronicles] vs refs [Matthew]
- **id 442** — commentary books [Ecclesiasticus] vs refs [Matthew, Mark, Luke]
- **id 449** — commentary books [Zechariah] vs refs [Matthew, Luke, Mark, John]
- **id 461** — commentary books [Exodus] vs refs [Matthew, Luke, Mark]
- **id 463** — commentary books [2 Samuel, 2 Maccabees] vs refs [Matthew, Acts]
- **id 465** — commentary books [Isaiah] vs refs [Matthew, Mark, John]
- **id 466** — commentary books [Acts] vs refs [Luke, Matthew, Mark, John]
- **id 469** — commentary books [Psalms, Exodus] vs refs [Matthew, Mark, Luke, John]
- **id 473** — commentary books [Psalms] vs refs [Matthew, Luke, John]
- **id 478** — commentary books [Acts] vs refs [Matthew, Mark, Luke, John]
- **id 489** — commentary books [Revelation] vs refs [Mark, Luke]
- **id 555** — commentary books [Romans] vs refs [Galatians]
- **id 567** — commentary books [Jeremiah] vs refs [Matthew, Zechariah]

## LOW / informational — affected ids

- `ref_book_absent` (76): 31, 74, 442, 8, 20, 24, 25, 27, 28, 34, 35, 37, 38, 48, 49, 51, 58, 60, 63, 64, 81, 85, 87, 98, 101, 108, 110, 116, 117, 121, 126, 134, 142, 145, 149, 152, 156, 163, 174, 176, 178, 187, 190, 201, 215, 250, 266, 268, 271, 285, 352, 361, 367, 371, 384, 390, 401, 406, 424, 425, …(+16)
- `summary_no_books` (5): 442, 116, 441, 443, 462
- `no_structured_refs` (0): —
