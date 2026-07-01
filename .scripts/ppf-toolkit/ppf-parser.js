/**
 * PPF (Positional Pipe Format) Parser Toolkit
 * 
 * A lightweight parser for converting LLM pipe-delimited positional output
 * back into structured JavaScript objects. Designed to maximize output token
 * efficiency by eliminating JSON structural overhead.
 * 
 * Usage:
 *   const parser = PPF.create(schema);
 *   const records = parser.parse(rawLLMOutput);
 */

const PPF = (() => {

  // ─── Schema Types & Coercers ───────────────────────────────────────

  const TYPES = {
    str:   v => v,
    int:   v => { const n = parseInt(v, 10); return isNaN(n) ? null : n; },
    float: v => { const n = parseFloat(v);    return isNaN(n) ? null : n; },
    bool:  v => v === '1' || v === 'true' || v === 'T',
    enum:  (v, field) => {
      if (field.enumMap) {
        // Numeric index → label lookup
        const idx = parseInt(v, 10);
        return isNaN(idx) ? v : (field.enumMap[idx] ?? v);
      }
      return v;
    },
    list: (v, field) => {
      const sep = field.listSep || '~';
      if (!v || v === '') return [];
      const items = v.split(sep);
      if (field.listType && TYPES[field.listType]) {
        return items.map(i => TYPES[field.listType](i.trim(), field));
      }
      return items.map(i => i.trim());
    }
  };


  // ─── Schema Definition ─────────────────────────────────────────────

  /**
   * Define a PPF schema.
   * 
   * @param {Object} config
   * @param {string}   config.delimiter     - Field separator (default: '|')
   * @param {string}   config.rowDelimiter  - Row separator (default: '\n')
   * @param {string}   config.escapeChar    - Escape for delimiters in values (default: '\\')
   * @param {boolean}  config.headerRow     - If true, first row is skipped as a header
   * @param {Array}    config.fields        - Ordered field definitions
   * 
   * Field definition:
   *   { name: string, type: 'str'|'int'|'float'|'bool'|'enum'|'list',
   *     optional: boolean, default: any,
   *     enumMap: {0:'neg',1:'neu',2:'pos'},     // for enum type
   *     listSep: '~', listType: 'str'|'int'     // for list type
   *   }
   */
  function create(config) {
    const {
      delimiter = '|',
      rowDelimiter = '\n',
      escapeChar = '\\',
      headerRow = false,
      fields = [],
    } = config;

    if (!fields.length) throw new Error('PPF schema requires at least one field');

    // ─── Parse a single row ────────────────────────────────────────

    function parseRow(raw, rowIndex) {
      const parts = splitRespectingEscapes(raw, delimiter, escapeChar);
      const record = {};
      const errors = [];

      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const rawVal = (i < parts.length) ? parts[i].trim() : undefined;

        // Handle missing values
        if (rawVal === undefined || rawVal === '') {
          if (field.optional) {
            record[field.name] = field.default ?? null;
            continue;
          }
          if (field.default !== undefined) {
            record[field.name] = field.default;
            continue;
          }
          errors.push({ row: rowIndex, field: field.name, error: 'missing_required' });
          record[field.name] = null;
          continue;
        }

        // Coerce value
        const typeFn = TYPES[field.type || 'str'];
        if (!typeFn) {
          errors.push({ row: rowIndex, field: field.name, error: `unknown_type:${field.type}` });
          record[field.name] = rawVal;
          continue;
        }

        try {
          record[field.name] = typeFn(rawVal, field);
        } catch (e) {
          errors.push({ row: rowIndex, field: field.name, error: `coerce_failed:${e.message}` });
          record[field.name] = rawVal;
        }
      }

      // Capture any extra fields the model output beyond the schema
      if (parts.length > fields.length) {
        record._overflow = parts.slice(fields.length).map(p => p.trim());
        errors.push({ row: rowIndex, error: 'overflow', extra: record._overflow.length });
      }

      return { record, errors };
    }


    // ─── Parse full output ─────────────────────────────────────────

    function parse(raw) {
      if (!raw || typeof raw !== 'string') return { records: [], errors: [{ error: 'empty_input' }] };

      const trimmed = raw.trim();
      let rows = trimmed.split(rowDelimiter);

      // Skip header row if configured
      if (headerRow && rows.length > 0) rows = rows.slice(1);

      // Filter blanks
      rows = rows.filter(r => r.trim() !== '');

      const allRecords = [];
      const allErrors = [];

      rows.forEach((row, idx) => {
        const { record, errors } = parseRow(row, idx);
        allRecords.push(record);
        if (errors.length) allErrors.push(...errors);
      });

      return { records: allRecords, errors: allErrors };
    }


    // ─── Convenience: parse expecting exactly one row ──────────────

    function parseOne(raw) {
      const { records, errors } = parse(raw);
      return { record: records[0] ?? null, errors };
    }


    // ─── Prompt snippet generator ──────────────────────────────────

    function toPromptSchema() {
      const fieldDefs = fields.map(f => {
        let desc = f.name;
        if (f.type === 'enum' && f.enumMap) {
          const vals = Object.entries(f.enumMap).map(([k, v]) => `${k}=${v}`).join(',');
          desc += `(${vals})`;
        } else if (f.type && f.type !== 'str') {
          desc += `(${f.type})`;
        }
        if (f.optional) desc += '?';
        return desc;
      });

      return [
        `Output format: one record per line, fields separated by "${delimiter}"`,
        `Schema: ${fieldDefs.join(delimiter)}`,
        `No headers, no extra text, no markdown fencing.`,
      ].join('\n');
    }


    // ─── Public API ────────────────────────────────────────────────

    return { parse, parseOne, toPromptSchema, config: { delimiter, fields } };
  }


  // ─── Utilities ───────────────────────────────────────────────────

  function splitRespectingEscapes(str, delimiter, escapeChar) {
    const parts = [];
    let current = '';
    let escaped = false;

    for (let i = 0; i < str.length; i++) {
      if (escaped) {
        current += str[i];
        escaped = false;
        continue;
      }
      if (str[i] === escapeChar) {
        escaped = true;
        continue;
      }
      if (str[i] === delimiter) {
        parts.push(current);
        current = '';
        continue;
      }
      current += str[i];
    }
    parts.push(current);
    return parts;
  }


  // ─── Prebuilt Schema Patterns ────────────────────────────────────

  const Patterns = {

    /** Flat classification: label + confidence + reasoning */
    classification: (categories) => create({
      fields: [
        { name: 'label', type: 'enum', enumMap: Object.fromEntries(categories.map((c, i) => [i, c])) },
        { name: 'confidence', type: 'float' },
        { name: 'reasoning', type: 'str', optional: true },
      ]
    }),

    /** Multi-field entity extraction */
    entities: (fieldNames) => create({
      fields: fieldNames.map(name => ({ name, type: 'str', optional: true })),
    }),

    /** Scored items: name + score + optional notes */
    scored: () => create({
      fields: [
        { name: 'item', type: 'str' },
        { name: 'score', type: 'float' },
        { name: 'tags', type: 'list', listSep: '~', optional: true },
        { name: 'notes', type: 'str', optional: true },
      ]
    }),

    /** Transcript / dialogue analysis */
    dialogue: (sentimentLabels = ['negative', 'neutral', 'positive']) => create({
      fields: [
        { name: 'speaker', type: 'str' },
        { name: 'sentiment', type: 'enum', enumMap: Object.fromEntries(sentimentLabels.map((s, i) => [i, s])) },
        { name: 'confidence', type: 'float' },
        { name: 'topics', type: 'list', listSep: '~' },
        { name: 'summary', type: 'str' },
      ]
    }),
  };


  return { create, Patterns, TYPES };

})();


// ─── Export ──────────────────────────────────────────────────────────

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PPF;
}
