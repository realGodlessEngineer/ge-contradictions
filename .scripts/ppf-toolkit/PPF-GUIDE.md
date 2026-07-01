# PPF Toolkit — Positional Pipe Format for LLM Output Optimization

A token-efficient alternative to JSON for structured LLM responses. Reduces output token usage by 40–70% for fixed-schema responses.

---

## Quick Start

```javascript
const PPF = require('./ppf-parser');

// 1. Define schema
const parser = PPF.create({
  fields: [
    { name: 'speaker', type: 'str' },
    { name: 'sentiment', type: 'enum', enumMap: { 0: 'negative', 1: 'neutral', 2: 'positive' } },
    { name: 'confidence', type: 'float' },
    { name: 'summary', type: 'str' },
  ]
});

// 2. Inject schema into system prompt
const systemPrompt = `You are an analyst.\n\n${parser.toPromptSchema()}`;

// 3. Parse the LLM response
const raw = `John|0|.85|Disagrees with the premise\nAlice|2|.92|Strong agreement`;
const { records, errors } = parser.parse(raw);
// → [{ speaker: 'John', sentiment: 'negative', confidence: 0.85, summary: 'Disagrees...' }, ...]
```

---

## System Prompt Templates

### Template 1: Minimal (best compliance, simple schemas)

```
Respond in PPF. One record per line. Fields separated by |
Schema: speaker|sentiment(0=neg,1=neu,2=pos)|confidence(float)|summary

No headers. No explanation. No markdown fencing. Raw PPF only.
```

### Template 2: Explicit Contract (complex schemas, high reliability)

```
## Output Format: PPF (Positional Pipe Format)

You must respond ONLY in the following format. No prose, no markdown, no wrapping.

FIELDS (in order, separated by |):
1. speaker    — string, the person's name
2. sentiment  — integer: 0=negative, 1=neutral, 2=positive
3. confidence — float 0-1, two decimal places
4. topics     — list separated by ~ (e.g. politics~economy~health)
5. summary    — string, one sentence max

RULES:
- One record per line
- If a field value contains |, escape it as \|
- Empty optional fields: leave blank between pipes (e.g. John||.85|text)
- No headers, no trailing newline, no explanation
```

### Template 3: With Codebook (maximum compression)

```
## Output Format: PPF with Codebook

CODEBOOK (use these codes instead of full values):
  Speakers: J=John, A=Alice, B=Bob, M=Moderator
  Topics: P=politics, E=economy, H=health, T=technology, R=religion

SCHEMA: speaker_code|sentiment(0-2)|confidence|topic_codes(~ sep)|summary

EXAMPLE:
J|0|.85|P~R|Disagrees with premise
A|2|.92|E|Strong agreement on fiscal policy

Respond with raw PPF only. No prose.
```

---

## Schema Patterns

### Pattern 1: Flat Classification

Use for: sentiment analysis, content moderation, intent detection, labeling

```
Schema: label(0=spam,1=ham)|confidence(float)|reasoning
```

```javascript
const parser = PPF.Patterns.classification(['spam', 'ham']);
```

LLM output:
```
1|.97|Normal customer inquiry about shipping
```

→ `{ label: 'ham', confidence: 0.97, reasoning: 'Normal customer inquiry about shipping' }`


### Pattern 2: Multi-Record Batch

Use for: analyzing multiple items in one call, bulk classification, list processing

```
Schema: id|category(0=bug,1=feature,2=question)|priority(int 1-5)|summary
One record per line.
```

LLM output:
```
1042|0|4|Login fails after password reset
1043|1|2|Add dark mode toggle
1044|2|1|How to export CSV
```


### Pattern 3: Nested Lists via Sub-Delimiters

Use for: tags, topics, multi-label classification, entity extraction with multiple values

```
Schema: title|tags(~ separated)|score(float)|pros(~ separated)|cons(~ separated)

Delimiter hierarchy:
  \n = row separator
  |  = field separator
  ~  = list item separator
```

```javascript
const parser = PPF.create({
  fields: [
    { name: 'title', type: 'str' },
    { name: 'tags', type: 'list', listSep: '~' },
    { name: 'score', type: 'float' },
    { name: 'pros', type: 'list', listSep: '~' },
    { name: 'cons', type: 'list', listSep: '~' },
  ]
});
```

LLM output:
```
Acme Widget|durable~affordable~compact|.82|Great price~Solid build|Poor color options~No warranty
```

→ `{ title: 'Acme Widget', tags: ['durable','affordable','compact'], score: 0.82, ... }`


### Pattern 4: Optional Fields

Use for: variable-richness data where some records have more detail than others

```
Schema: name|role|company?|location?|notes?
Fields marked ? are optional. Leave blank between pipes if absent.
```

LLM output:
```
John|engineer|Acme Corp|NYC|Leads backend team
Alice|designer|||Freelance
```

```javascript
const parser = PPF.create({
  fields: [
    { name: 'name', type: 'str' },
    { name: 'role', type: 'str' },
    { name: 'company', type: 'str', optional: true },
    { name: 'location', type: 'str', optional: true },
    { name: 'notes', type: 'str', optional: true },
  ]
});
```


### Pattern 5: Hierarchical (Parent → Children)

Use for: grouped data like chapters→sections, speakers→utterances, categories→items

```
Respond in two-tier PPF:
  PARENT lines start with @: @parent_id|parent_name|parent_score
  CHILD  lines start with >: >parent_id|child_field_1|child_field_2

Example:
@1|Introduction|.95
>1|Sets up the thesis|0
>1|Engaging opening|2
@2|Methods|.70
>2|Missing sample size|0
```

```javascript
// Parse hierarchical PPF
function parseHierarchical(raw, parentSchema, childSchema) {
  const lines = raw.trim().split('\n');
  const tree = [];
  let currentParent = null;

  for (const line of lines) {
    if (line.startsWith('@')) {
      const { record } = parentSchema.parseOne(line.slice(1));
      currentParent = { ...record, children: [] };
      tree.push(currentParent);
    } else if (line.startsWith('>') && currentParent) {
      const { record } = childSchema.parseOne(line.slice(1));
      currentParent.children.push(record);
    }
  }
  return tree;
}
```


### Pattern 6: Key-Value Sparse Output

Use for: extraction tasks where only some fields are present, form filling, metadata extraction

```
Output found fields only, one per line:
field_name|value

Valid fields: title, author, date, isbn, publisher, edition, language
Omit fields not found in the source.
```

LLM output:
```
title|The Great Gatsby
author|F. Scott Fitzgerald
date|1925
language|English
```

```javascript
function parseSparse(raw, validFields = null) {
  const records = {};
  for (const line of raw.trim().split('\n')) {
    const [key, ...rest] = line.split('|');
    const k = key.trim();
    if (validFields && !validFields.includes(k)) continue;
    records[k] = rest.join('|').trim();
  }
  return records;
}
```

---

## Escape Conventions

| Scenario | Convention | System Prompt Instruction |
|----------|-----------|---------------------------|
| Pipe in value | `\|` | "Escape literal pipes as \\|" |
| Newline in value | `\\n` | "Encode newlines as \\n within fields" |
| Empty field | leave blank | "Empty optional fields: leave blank between pipes" |
| Null/unknown | `-` | "Use - for unknown/null values" |

---

## Anti-Drift Techniques

LLMs can sometimes add prose around the PPF output. Mitigations:

1. **End your prompt with the format instruction** (recency bias)
2. **Use a fence instruction**: `Respond between <ppf> and </ppf> tags. Nothing else.`
3. **Provide 1-2 examples** in the system prompt to anchor the format
4. **Post-process**: Strip anything outside `<ppf>` tags or before the first valid row

```javascript
function extractPPF(raw) {
  // Try tag-fenced first
  const tagMatch = raw.match(/<ppf>([\s\S]*?)<\/ppf>/);
  if (tagMatch) return tagMatch[1].trim();
  
  // Fallback: find lines matching expected pipe count
  const expectedPipes = parser.config.fields.length - 1;
  return raw
    .split('\n')
    .filter(line => (line.match(/\|/g) || []).length >= expectedPipes)
    .join('\n');
}
```

---

## Token Savings Reference

Approximate savings vs JSON for common tasks (measured with Claude tokenizer):

| Task | JSON tokens | PPF tokens | Savings |
|------|------------|-----------|---------|
| 1 classification | ~25 | ~8 | 68% |
| 10 classifications | ~220 | ~75 | 66% |
| 5 entity extractions | ~180 | ~70 | 61% |
| Dialogue analysis (10 turns) | ~450 | ~160 | 64% |
| Batch scoring (20 items) | ~600 | ~200 | 67% |

---

## Integration Example: Full Anthropic API Call

```javascript
const Anthropic = require('@anthropic-ai/sdk');
const PPF = require('./ppf-parser');

const client = new Anthropic();

// Define schema
const parser = PPF.create({
  fields: [
    { name: 'claim', type: 'str' },
    { name: 'verdict', type: 'enum', enumMap: { 0: 'false', 1: 'mixed', 2: 'true' } },
    { name: 'confidence', type: 'float' },
    { name: 'evidence', type: 'str' },
  ]
});

async function factCheck(claims) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You are a fact checker.\n\n${parser.toPromptSchema()}`,
    messages: [{ role: 'user', content: `Fact-check these claims:\n${claims.join('\n')}` }],
  });

  const raw = response.content[0].text;
  return parser.parse(raw);
}
```
