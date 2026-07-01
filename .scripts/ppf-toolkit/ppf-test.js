const PPF = require('./ppf-parser');

console.log('=== PPF Parser Tests ===\n');

// ─── Test 1: Basic dialogue parsing ───────────────────────────────
console.log('▸ Test 1: Dialogue analysis');
const dialogue = PPF.Patterns.dialogue();
console.log('  Prompt schema:', dialogue.toPromptSchema(), '\n');

const raw1 = `John|0|.85|politics~religion|Disagrees with the premise
Alice|2|.92|economy|Strong agreement on fiscal policy
Bob|1|.50|technology~health|Non-committal response`;

const result1 = dialogue.parse(raw1);
console.log('  Records:', JSON.stringify(result1.records, null, 2));
console.log('  Errors:', result1.errors, '\n');


// ─── Test 2: Classification ───────────────────────────────────────
console.log('▸ Test 2: Classification');
const classifier = PPF.Patterns.classification(['spam', 'ham', 'phishing']);

const raw2 = `1|.97|Normal inquiry about returns`;
const result2 = classifier.parseOne(raw2);
console.log('  Record:', result2.record);
console.log('  Errors:', result2.errors, '\n');


// ─── Test 3: Optional fields ─────────────────────────────────────
console.log('▸ Test 3: Optional fields');
const contacts = PPF.create({
  fields: [
    { name: 'name', type: 'str' },
    { name: 'role', type: 'str' },
    { name: 'company', type: 'str', optional: true },
    { name: 'location', type: 'str', optional: true },
    { name: 'notes', type: 'str', optional: true },
  ]
});

const raw3 = `John|engineer|Acme Corp|NYC|Leads backend team
Alice|designer|||Freelance`;

const result3 = contacts.parse(raw3);
console.log('  Records:', JSON.stringify(result3.records, null, 2));
console.log('  Errors:', result3.errors, '\n');


// ─── Test 4: Nested lists ────────────────────────────────────────
console.log('▸ Test 4: Nested lists with sub-delimiters');
const reviews = PPF.create({
  fields: [
    { name: 'product', type: 'str' },
    { name: 'tags', type: 'list', listSep: '~' },
    { name: 'score', type: 'float' },
    { name: 'pros', type: 'list', listSep: '~' },
    { name: 'cons', type: 'list', listSep: '~' },
  ]
});

const raw4 = `Acme Widget|durable~affordable~compact|.82|Great price~Solid build|Poor colors~No warranty`;
const result4 = reviews.parseOne(raw4);
console.log('  Record:', JSON.stringify(result4.record, null, 2));
console.log('  Errors:', result4.errors, '\n');


// ─── Test 5: Escaped pipes ───────────────────────────────────────
console.log('▸ Test 5: Escaped delimiters');
const notes = PPF.create({
  fields: [
    { name: 'title', type: 'str' },
    { name: 'content', type: 'str' },
  ]
});

const raw5 = `Meeting notes|John said "option A \\| option B" are both valid`;
const result5 = notes.parseOne(raw5);
console.log('  Record:', result5.record);
console.log('  Errors:', result5.errors, '\n');


// ─── Test 6: Prompt generation ───────────────────────────────────
console.log('▸ Test 6: Prompt schema generation');
const scorer = PPF.Patterns.scored();
console.log('  Generated prompt:\n ', scorer.toPromptSchema(), '\n');


console.log('=== All tests complete ===');
