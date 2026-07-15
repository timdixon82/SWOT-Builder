// Unit tests for the pure SWOT data model, persistence, JSON extraction,
// and markdown export in swot-engine-core.js.
//
// These tests assert against an INDEPENDENT notion of correctness — the
// documented SWOT quadrant model (Strengths, Weaknesses, Opportunities,
// Threats), the standard JSON grammar, and the plain-text markdown the
// export is supposed to produce — not against whatever the module happens
// to return.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  STORAGE_KEY,
  loadState,
  saveState,
  clearState,
  uid,
  BUCKETS,
  BUCKET_BY_KEY,
  newEmptySwot,
  extractJson,
  toMarkdown,
} from '../swot-engine-core.js';

// Minimal in-memory localStorage stub. Node has no built-in Web Storage API,
// and the module under test calls the bare `localStorage` global directly
// (as it does in the browser), so a stand-in is installed before each test.
function makeLocalStorageStub() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

beforeEach(() => {
  globalThis.localStorage = makeLocalStorageStub();
});

describe('newEmptySwot', () => {
  it('returns all four quadrants as empty arrays', () => {
    expect(newEmptySwot()).toEqual({ S: [], W: [], O: [], T: [] });
  });

  it('returns independent arrays on each call (no shared references)', () => {
    const first = newEmptySwot();
    const second = newEmptySwot();
    first.S.push({ title: 'Only in first' });
    expect(second.S).toEqual([]);
  });
});

describe('BUCKETS and BUCKET_BY_KEY', () => {
  it('lists exactly the four SWOT quadrants, in S/W/O/T order', () => {
    expect(BUCKETS.map((b) => b.key)).toEqual(['S', 'W', 'O', 'T']);
  });

  it('labels Strengths and Weaknesses as internal, Opportunities and Threats as external', () => {
    const meta = Object.fromEntries(BUCKETS.map((b) => [b.key, b.meta]));
    expect(meta.S).toMatch(/internal/i);
    expect(meta.W).toMatch(/internal/i);
    expect(meta.O).toMatch(/external/i);
    expect(meta.T).toMatch(/external/i);
  });

  it('indexes every bucket by its key', () => {
    for (const bucket of BUCKETS) {
      expect(BUCKET_BY_KEY[bucket.key]).toBe(bucket);
    }
  });
});

describe('uid', () => {
  it('returns a non-empty alphanumeric string', () => {
    const id = uid();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    expect(id).toMatch(/^[a-z0-9]+$/);
  });

  it('does not return the same value on successive calls', () => {
    const ids = new Set();
    for (let i = 0; i < 200; i++) ids.add(uid());
    // Collisions are astronomically unlikely across 200 draws from
    // base-36 space; a shared counter or constant bug would collapse
    // this set to a handful of values.
    expect(ids.size).toBe(200);
  });
});

describe('extractJson', () => {
  it('parses a plain JSON object', () => {
    expect(extractJson('{"a":1,"b":"two"}')).toEqual({ a: 1, b: 'two' });
  });

  it('parses a plain JSON array', () => {
    expect(extractJson('[1,2,3]')).toEqual([1, 2, 3]);
  });

  it('strips a leading ```json fence and a trailing ``` fence', () => {
    const raw = '```json\n{"item":null,"next_question":"Q?"}\n```';
    expect(extractJson(raw)).toEqual({ item: null, next_question: 'Q?' });
  });

  it('strips a bare ``` fence with no language tag', () => {
    const raw = '```\n{"ok":true}\n```';
    expect(extractJson(raw)).toEqual({ ok: true });
  });

  it('skips leading prose before the first brace', () => {
    const raw = 'Sure, here is the JSON:\n{"ok":true}';
    expect(extractJson(raw)).toEqual({ ok: true });
  });

  it('cuts off trailing prose after the JSON value is balanced', () => {
    const raw = '{"ok":true} — hope that helps!';
    expect(extractJson(raw)).toEqual({ ok: true });
  });

  it('handles nested objects and arrays', () => {
    const raw = '{"item":{"bucket":"S","tags":["a","b"]},"next_question":"Next?"}';
    expect(extractJson(raw)).toEqual({
      item: { bucket: 'S', tags: ['a', 'b'] },
      next_question: 'Next?',
    });
  });

  it('returns null for text with no JSON in it', () => {
    expect(extractJson('just a plain sentence, no braces here')).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    expect(extractJson('{"a": 1,')).toBeNull();
  });

  it('returns null for empty or falsy input', () => {
    expect(extractJson('')).toBeNull();
    expect(extractJson(null)).toBeNull();
    expect(extractJson(undefined)).toBeNull();
  });
});

describe('toMarkdown', () => {
  it('titles the document with the session title, defaulting when absent', () => {
    const withTitle = toMarkdown({ title: 'My Coffee Shop', swot: newEmptySwot() });
    expect(withTitle.split('\n')[0]).toBe('# My Coffee Shop');

    const withoutTitle = toMarkdown({ swot: newEmptySwot() });
    expect(withoutTitle.split('\n')[0]).toBe('# SWOT Analysis');
  });

  it('includes a Subject line only when a subject is given', () => {
    const withSubject = toMarkdown({ subject: 'Acme Ltd', swot: newEmptySwot() });
    expect(withSubject).toContain('**Subject:** Acme Ltd');

    const withoutSubject = toMarkdown({ swot: newEmptySwot() });
    expect(withoutSubject).not.toContain('**Subject:**');
  });

  it('renders all four quadrant headings in S/W/O/T order', () => {
    const md = toMarkdown({ swot: newEmptySwot() });
    const headingOrder = [...md.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
    expect(headingOrder).toEqual(['Strengths', 'Weaknesses', 'Opportunities', 'Threats']);
  });

  it('marks an empty quadrant as none captured', () => {
    const md = toMarkdown({ swot: newEmptySwot() });
    // Four quadrants, all empty.
    expect(md.match(/_\(none captured\)_/g)).toHaveLength(4);
  });

  it('renders an item title, description, tags, and confidence', () => {
    const swot = newEmptySwot();
    swot.S.push({
      title: 'Strong brand',
      description: 'Well known locally.',
      tags: ['brand', 'local'],
      confidence: 'high',
    });
    const md = toMarkdown({ swot });
    expect(md).toContain('- **Strong brand** — Well known locally.');
    expect(md).toContain('_tags: brand, local_');
    expect(md).toContain('_confidence: high_');
  });

  it('omits description, tags, and confidence when not provided', () => {
    const swot = newEmptySwot();
    swot.W.push({ title: 'Small team' });
    const md = toMarkdown({ swot });
    expect(md).toContain('- **Small team**');
    expect(md).not.toContain('Small team** —');
    expect(md).not.toContain('_tags:');
    expect(md).not.toContain('_confidence:');
  });

  it('preserves special characters and unicode in item text unescaped', () => {
    const swot = newEmptySwot();
    swot.O.push({
      title: 'Growth in APAC & EMEA <2026>',
      description: 'Café market up 10% — "huge" opportunity.',
    });
    const md = toMarkdown({ swot });
    expect(md).toContain('Growth in APAC & EMEA <2026>');
    expect(md).toContain('Café market up 10% — "huge" opportunity.');
  });

  it('lists multiple items in a quadrant in insertion order', () => {
    const swot = newEmptySwot();
    swot.T.push({ title: 'First threat' });
    swot.T.push({ title: 'Second threat' });
    const md = toMarkdown({ swot });
    const firstIdx = md.indexOf('First threat');
    const secondIdx = md.indexOf('Second threat');
    expect(firstIdx).toBeGreaterThan(-1);
    expect(secondIdx).toBeGreaterThan(firstIdx);
  });
});

describe('persistence: saveState / loadState / clearState', () => {
  it('returns null when nothing has been saved yet', () => {
    expect(loadState()).toBeNull();
  });

  it('round-trips a full session through save and load', () => {
    const swot = newEmptySwot();
    swot.S.push({ id: 'abc123', title: 'Great location', tags: ['location'] });
    const state = {
      step: 'board',
      session: { subject: 'Corner Cafe', scope: 'business', title: 'Corner Cafe SWOT', history: [] },
      swot,
      boardStyle: 'classic',
    };

    saveState(state);
    const loaded = loadState();

    expect(loaded).toEqual(state);
    // Confirms it went through actual JSON serialisation, not just an
    // in-memory reference, by checking the stored string is valid JSON
    // under the expected key.
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual(state);
  });

  it('round-trips special characters and unicode in saved item text', () => {
    const swot = newEmptySwot();
    swot.W.push({ title: 'Café — "budget" & <risk>', description: '日本語のテスト' });
    saveState({ swot });
    expect(loadState()).toEqual({ swot });
  });

  it('clearState removes the saved session so loadState returns null again', () => {
    saveState({ step: 'intro', session: null, swot: newEmptySwot(), boardStyle: 'classic' });
    expect(loadState()).not.toBeNull();

    clearState();

    expect(loadState()).toBeNull();
  });

  it('returns null rather than throwing when the stored value is corrupted', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    expect(loadState()).toBeNull();
  });

  it('does not throw when the value being saved cannot be serialised', () => {
    const circular = {};
    circular.self = circular;
    expect(() => saveState(circular)).not.toThrow();
  });
});
