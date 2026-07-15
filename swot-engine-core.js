/* swot-engine-core.js — pure, DOM-light SWOT data model and persistence.
 *
 * Extracted from swot-engine.jsx so this logic can be unit tested
 * independently of the browser-local AI backends (Chrome Prompt API,
 * WebLLM), which need a real browser to run. Everything in this file is
 * either a pure function or a thin wrapper around localStorage.
 *
 * Loaded in the browser as a native ES module (see index.html), one script
 * before the Babel-compiled *.jsx files. Loading it as a module — rather
 * than a Babel-transformed classic script — means it finishes executing
 * before DOMContentLoaded, which is when Babel Standalone transforms and
 * runs the "text/babel" scripts, so window.extractJson and friends are
 * already in place by the time swot-engine.jsx and the screen components
 * read them.
 *
 * Exposes on window: STORAGE_KEY, loadState, saveState, clearState, uid,
 *   BUCKETS, BUCKET_BY_KEY, newEmptySwot, extractJson, toMarkdown
 */

// ---------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------
const STORAGE_KEY = "swot-builder-v1";
function loadState() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch(_e) { return null; }
}
function saveState(s) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch(_e) {} }
function clearState() { try { localStorage.removeItem(STORAGE_KEY); } catch(_e) {} }

// ---------------------------------------------------------------------
// Defaults & utilities
// ---------------------------------------------------------------------
function uid() { return Math.random().toString(36).slice(2, 9); }

const BUCKETS = [
  { key: "S", name: "Strengths",     short: "Strength",    meta: "Internal · helpful" },
  { key: "W", name: "Weaknesses",    short: "Weakness",    meta: "Internal · harmful" },
  { key: "O", name: "Opportunities", short: "Opportunity", meta: "External · helpful" },
  { key: "T", name: "Threats",       short: "Threat",      meta: "External · harmful" },
];
const BUCKET_BY_KEY = Object.fromEntries(BUCKETS.map(b => [b.key, b]));

function newEmptySwot() { return { S: [], W: [], O: [], T: [] }; }

// ---------------------------------------------------------------------
// Robust JSON extractor — pulls a JSON object/array out of a raw LLM
// completion, tolerating markdown code fences and trailing prose.
// ---------------------------------------------------------------------
function extractJson(raw) {
  if (!raw) return null;
  let text = raw.trim()
    .replace(/^```(?:json)?/i, "").replace(/```\s*$/i, "").trim();
  const firstBrace = text.search(/[\{\[]/);
  if (firstBrace > 0) text = text.slice(firstBrace);
  try { return JSON.parse(text); } catch(_e) {}
  let depth = 0, end = -1;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "{" || c === "[") depth++;
    else if (c === "}" || c === "]") { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end > 0) { try { return JSON.parse(text.slice(0, end)); } catch(_e) {} }
  return null;
}

// ---------------------------------------------------------------------
// Markdown export
// ---------------------------------------------------------------------
function toMarkdown(state) {
  const { subject, title, swot } = state;
  const lines = [`# ${title || "SWOT Analysis"}`];
  if (subject) lines.push(`**Subject:** ${subject}`);
  lines.push("");
  for (const b of BUCKETS) {
    lines.push(`## ${b.name}`);
    const items = swot[b.key] || [];
    if (!items.length) lines.push("_(none captured)_");
    else items.forEach(it => {
      lines.push(`- **${it.title}**${it.description ? " — " + it.description : ""}` +
        (it.tags?.length ? `  \n  _tags: ${it.tags.join(", ")}_` : "") +
        (it.confidence   ? `  \n  _confidence: ${it.confidence}_` : ""));
    });
    lines.push("");
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------
// Expose to window for the Babel-compiled classic scripts that follow.
// ---------------------------------------------------------------------
if (typeof window !== "undefined") {
  Object.assign(window, {
    STORAGE_KEY, loadState, saveState, clearState,
    uid, BUCKETS, BUCKET_BY_KEY, newEmptySwot,
    extractJson, toMarkdown,
  });
}

export {
  STORAGE_KEY, loadState, saveState, clearState,
  uid, BUCKETS, BUCKET_BY_KEY, newEmptySwot,
  extractJson, toMarkdown,
};
