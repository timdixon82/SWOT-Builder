/* swot-engine.jsx — Browser-local AI backends, storage, SWOT helpers.
 *
 * AI priority (no installs, no server, no API key):
 *   1. Chrome Prompt API (window.ai.languageModel) — Chrome 127+, zero download
 *   2. WebLLM (WebGPU)  — Chrome/Edge 113+; model downloads to browser cache
 *   3. Manual / offline — always works; user routes answers to quadrants themselves
 *
 * Download policy: models ≤ 50 MB start automatically.
 *                  models > 50 MB require explicit user consent first.
 *
 * Exposes on window: LocalAI, WEBLLM_MODELS, STORAGE_KEY, loadState, saveState,
 *   clearState, uid, BUCKETS, BUCKET_BY_KEY, newEmptySwot,
 *   extractJson, aiProcessAnswer, aiOpeningQuestion, toMarkdown
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
// WebLLM model catalogue — sizeMB is the approximate download size.
// The 50 MB threshold is checked in the app layer; engine doesn't care.
// Pin the CDN URL to a known-good version to avoid surprise API breaks.
// ---------------------------------------------------------------------
const WEBLLM_MODELS = [
  {
    id:      "Llama-3.2-1B-Instruct-q4f32_1-MLC",
    label:   "Llama 3.2 · 1B",
    quality: "Basic",
    sizeMB:  620,
    note:    "Fastest — good for simple SWOT; may miss nuance",
  },
  {
    id:      "Llama-3.2-3B-Instruct-q4f32_1-MLC",
    label:   "Llama 3.2 · 3B",
    quality: "Good",
    sizeMB:  1900,
    note:    "Solid JSON output; recommended starting point",
  },
  {
    id:      "Phi-3.5-mini-instruct-q4f16_1-MLC",
    label:   "Phi 3.5 Mini",
    quality: "Best",
    sizeMB:  2400,
    note:    "Highest quality; better at nuanced questions",
  },
];
window.WEBLLM_MODELS = WEBLLM_MODELS;

// ---------------------------------------------------------------------
// Robust JSON extractor
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
// Pre-canned questions — used when no AI is available.
// Rotates across all four quadrants for balanced coverage.
// ---------------------------------------------------------------------
const OFFLINE_QUESTIONS = [
  "What would you say is the most important strength or advantage you currently have here?",
  "Where do you consistently outperform alternatives or competitors?",
  "What unique resources, skills, or assets do you possess that others don't?",
  "What internal gaps, limitations, or weaknesses slow you down the most?",
  "What resources or capabilities are you currently lacking?",
  "What challenges or pain points come up most often in this area?",
  "What external trends or market shifts could you take advantage of?",
  "What opportunities have you spotted but haven't yet acted on?",
  "Where do you see the greatest potential for growth or improvement?",
  "What external risks or disruptions could negatively impact you?",
  "What competitors or alternatives are gaining ground that concerns you?",
  "What changes in the environment — regulatory, economic, or social — could work against you?",
];

// ---------------------------------------------------------------------
// LocalAI — manages browser-local AI backends
// ---------------------------------------------------------------------
const LocalAI = (function () {
  let _type         = null;        // 'window-ai' | 'webllm' | 'offline'
  let _status       = 'starting';  // 'starting' | 'loading' | 'ready' | 'unavailable'
  let _progress     = 0;           // 0–1 during WebLLM download
  let _progressText = '';          // human-readable phase label from WebLLM callback
  let _session      = null;        // window.ai LanguageModel session
  let _engine       = null;        // WebLLM MLCEngine instance
  let _listeners    = [];
  let _offlineIdx   = 0;

  function emit() {
    const state = { type: _type, status: _status, progress: _progress, progressText: _progressText };
    _listeners.forEach(fn => { try { fn(state); } catch(_e) {} });
  }

  // ── Chrome Prompt API ────────────────────────────────────────────────
  // Available in Chrome 127+. Zero download — uses on-device Gemini Nano.
  async function tryWindowAI() {
    try {
      if (!window.ai?.languageModel) return false;
      const caps = await window.ai.languageModel.capabilities();
      if (caps.available === 'no') return false;
      if (caps.available === 'after-download') {
        // Model needs a one-time device-side download — show loading state.
        _status = 'loading';
        emit();
        _session = await window.ai.languageModel.create({
          monitor(m) {
            m.addEventListener('downloadprogress', e => {
              _progress = e.total ? e.loaded / e.total : 0;
              emit();
            });
          },
        });
      } else {
        _session = await window.ai.languageModel.create();
      }
      return true;
    } catch(_e) { return false; }
  }

  // ── WebLLM (WebGPU) ──────────────────────────────────────────────────
  // Requires WebGPU (Chrome/Edge 113+). Called explicitly by the app
  // after user consent, so this function blocks until ready.
  async function _ensureWebLLMScript() {
    if (window.mlc_llm) return;
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      // Pinned to 0.2.83 (2026-05-24, ADR 0007). SRI hash to be added in Phase 2
      // remediation once the exact CDN file bytes are confirmed by CI (the UMD bundle
      // path is served by jsDelivr and not included in the npm package).
      s.src = 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.83/lib/umd/bundle.js';
      s.onload = resolve;
      s.onerror = () => reject(new Error('WebLLM script failed to load'));
      document.head.appendChild(s);
    });
  }

  async function loadWebLLM(modelId) {
    _type         = 'webllm';
    _status       = 'loading';
    _progress     = 0;
    _progressText = 'Preparing engine…';
    emit();

    await _ensureWebLLMScript();
    _progressText = 'Starting download…';
    const { CreateMLCEngine } = window.mlc_llm;

    _engine = await CreateMLCEngine(modelId, {
      initProgressCallback: (p) => {
        _progress     = typeof p.progress === 'number' ? p.progress : 0;
        _progressText = p.text || '';
        emit();
      },
    });

    _progressText = '';
    _status = 'ready';
    emit();
  }

  // ── Initialise — auto-detect, no blocking prompts ────────────────────
  async function init() {
    _status = 'starting';
    emit();

    if (await tryWindowAI()) {
      _type   = 'window-ai';
      _status = 'ready';
      emit();
      return;
    }

    // WebLLM is user-initiated (large download); don't auto-start it.
    _type   = 'offline';
    _status = 'unavailable';
    emit();
  }

  // ── Unified completion call ──────────────────────────────────────────
  async function complete(prompt) {
    if (_type === 'window-ai' && _session) {
      return await _session.prompt(prompt);
    }
    if (_type === 'webllm' && _engine) {
      const reply = await _engine.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 700,
        temperature: 0.7,
      });
      return reply.choices[0].message.content;
    }
    throw new Error('No AI backend ready');
  }

  // ── Public surface ───────────────────────────────────────────────────
  function onStatus(fn) {
    _listeners.push(fn);
    try { fn({ type: _type, status: _status, progress: _progress, progressText: _progressText }); } catch(_e) {}
  }
  function getStatus() { return { type: _type, status: _status, progress: _progress, progressText: _progressText }; }
  function isReady()   { return _status === 'ready'; }
  function hasWebGPU() { return !!navigator.gpu; }

  function nextOfflineQ() {
    const q = OFFLINE_QUESTIONS[_offlineIdx % OFFLINE_QUESTIONS.length];
    _offlineIdx++;
    return q;
  }

  return { init, complete, loadWebLLM, onStatus, getStatus, isReady, hasWebGPU, nextOfflineQ };
})();

window.LocalAI = LocalAI;
LocalAI.init(); // Fire-and-forget on script load

// ---------------------------------------------------------------------
// AI: process answer → suggested SWOT item + next question
// ---------------------------------------------------------------------
async function aiProcessAnswer({ subject, scope, history, questionAsked, answerGiven, existingCounts }) {
  const sys = [
    "You are a friendly SWOT analysis coach helping the user build a SWOT for a specific subject.",
    "Analyse the user's answer to the last question, then ask the next best question.",
    "Be conversational, warm, and concise. Ask ONE focused question at a time.",
    "Vary the quadrant you probe — try to balance Strengths, Weaknesses, Opportunities, Threats over time.",
    "OUTPUT FORMAT — respond ONLY with a JSON object matching this schema, no prose, no markdown fences:",
    "{",
    '  "item": { "bucket": "S"|"W"|"O"|"T", "title": "<short noun phrase, max 8 words>", "description": "<one or two sentences in user\'s voice>", "tags": ["<1-3 tag words>"] } | null,',
    '  "next_question": "<the next interview question>",',
    '  "coach_note": "<optional, max 16 words, friendly acknowledgement; omit if nothing useful>"',
    "}",
    "Set item to null if the answer is empty or off-topic — still produce a next_question.",
    "Bucket guide: S = internal helpful (assets/skills the subject HAS). W = internal harmful (gaps/limitations). O = external helpful (trends/openings). T = external harmful (risks/competitors).",
    "Reword the title concisely — capture the essence, do not echo the user's full answer.",
  ].join("\n");

  const ctxLines = [];
  ctxLines.push(`Subject of SWOT: ${subject || "(unspecified)"}`);
  if (scope) ctxLines.push(`Scope/type: ${scope}`);
  ctxLines.push(`Current counts → S:${existingCounts.S} W:${existingCounts.W} O:${existingCounts.O} T:${existingCounts.T}`);
  ctxLines.push("", "Recent dialogue (oldest first):");
  history.slice(-6).forEach(h => {
    ctxLines.push(`Coach: ${h.q}`);
    ctxLines.push(`User:  ${h.a || "(skipped)"}`);
  });
  ctxLines.push("", `Coach (just asked): ${questionAsked}`, `User answer: ${answerGiven}`);

  const prompt = sys + "\n\n---\n\n" + ctxLines.join("\n");

  let raw = null;
  if (window.LocalAI.isReady()) {
    try { raw = await window.LocalAI.complete(prompt); } catch(_e) { raw = null; }
  }

  // Offline / error fallback — return user's answer verbatim; user picks bucket.
  if (!raw) {
    const firstSentence = answerGiven.trim().split(/[.!?\n]/)[0].trim();
    return {
      item: {
        bucket: "__MANUAL__",
        title: firstSentence.slice(0, 60) || "Your point",
        description: answerGiven.trim(),
        tags: [],
      },
      next_question: window.LocalAI.nextOfflineQ(),
      coach_note: "AI not loaded — choose which quadrant fits best.",
    };
  }

  const parsed = extractJson(raw);
  if (!parsed) {
    return {
      item: {
        bucket: "__MANUAL__",
        title: answerGiven.trim().slice(0, 60) || "Your point",
        description: answerGiven.trim(),
        tags: [],
      },
      next_question: window.LocalAI.nextOfflineQ(),
      coach_note: "",
    };
  }

  if (parsed.item) {
    const b = (parsed.item.bucket || "").toString().toUpperCase().charAt(0);
    parsed.item.bucket = ["S","W","O","T"].includes(b) ? b : "__MANUAL__";
    parsed.item.title = (parsed.item.title || "").toString().slice(0, 80);
    parsed.item.description = (parsed.item.description || "").toString().slice(0, 400);
    if (!Array.isArray(parsed.item.tags)) parsed.item.tags = [];
    parsed.item.tags = parsed.item.tags.slice(0, 4).map(t => String(t).slice(0, 24));
  }
  parsed.next_question = (parsed.next_question || "What's next on your mind?").toString();
  parsed.coach_note    = (parsed.coach_note    || "").toString();
  return parsed;
}

// ---------------------------------------------------------------------
// AI: opening question
// ---------------------------------------------------------------------
async function aiOpeningQuestion({ subject, scope }) {
  const fallback = `Let's start with what's going well — what do you see as the biggest strength of "${subject || "your subject"}" right now?`;
  if (!window.LocalAI.isReady()) return fallback;

  const prompt = [
    "You are a friendly SWOT analysis coach.",
    "Produce a single warm, encouraging OPENING question that gets them talking. Aim for Strengths first.",
    "Be specific to the subject. One sentence only. No preamble.",
    "Subject: " + (subject || "(unspecified)"),
    scope ? "Scope: " + scope : "",
    "",
    "Output ONLY the question text. No JSON, no markdown.",
  ].filter(Boolean).join("\n");

  try {
    const raw = await window.LocalAI.complete(prompt);
    return (raw || "").trim().replace(/^["']|["']$/g, "") || fallback;
  } catch(_e) { return fallback; }
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
// Expose to window
// ---------------------------------------------------------------------
Object.assign(window, {
  STORAGE_KEY, loadState, saveState, clearState,
  uid, BUCKETS, BUCKET_BY_KEY, newEmptySwot,
  extractJson, aiProcessAnswer, aiOpeningQuestion,
  toMarkdown,
});
