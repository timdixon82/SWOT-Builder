# SWOT Builder

A guided, AI-assisted SWOT analysis tool that runs entirely in the browser — no server, no API key, no account required.

The app walks you through a structured interview, routes your answers into **Strengths / Weaknesses / Opportunities / Threats**, and builds a clean, shareable board.

---

## Features

- **Guided interview** — one question at a time, AI helps route answers into the right quadrant
- **AI-assisted** — suggests SWOT bucket, rewrites titles, generates tags; you review and edit before saving
- **Browser-local AI** — no data leaves your machine (see AI section below)
- **Four board styles** — Classic coloured 2×2, Executive navy, Bold editorial, Pills compact
- **Export** — Print/PDF, Copy as image (html2canvas), Markdown download
- **Inline editing** — edit any item directly on the board after generation
- **Dark mode** — follows OS preference, manual toggle in header
- **Persistent state** — auto-saves to `localStorage`; refresh keeps your progress
- **WCAG 2.2 AAA** — all colour pairs meet the 7:1 contrast ratio

---

## How to run

The app is a static HTML file — no build step, no Node, no bundler.

Serve it from any HTTP server (browsers block `<script src>` tag loading from `file://`):

```bash
# Python (built-in)
python3 -m http.server 8080

# Node (if you have npx)
npx serve .

# VS Code — install the "Live Server" extension and click "Go Live"
```

Then open `http://localhost:8080` in your browser.

---

## AI backends

The app tries each backend in order, silently, on load:

| Priority | Backend | How it works | Browsers |
|---|---|---|---|
| 1 | **Chrome Prompt API** (`window.ai`) | On-device Gemini Nano — zero download, instant | Chrome 127+ only |
| 2 | **WebLLM** (WebGPU) | User selects a model; downloads to browser cache | Chrome / Edge 113+ |
| 3 | **Manual mode** | Pre-canned questions rotate; user picks the quadrant | All browsers |

### Choosing a WebLLM model

Click the **AI badge** in the header → pick a model:

| Model | Quality | Download size |
|---|---|---|
| Llama 3.2 · 1B | Basic | ~620 MB |
| Llama 3.2 · 3B | Good | ~1.9 GB |
| Phi 3.5 Mini | Best | ~2.4 GB |

Models are cached in the browser after the first download — subsequent loads are instant.

**Download policy:** models ≤ 50 MB start automatically with a progress bar. Models > 50 MB (all current options) show a consent dialog first.

### Manual mode

Works in every browser including Firefox and Safari. Pre-generated questions still guide the interview; after each answer a suggestion card appears pre-filled with your text, and you choose which quadrant it belongs in.

---

## File structure

```
/
├── index.html              # Entry point — loads all scripts
├── theme.js                # Theme bootstrap (sets data-theme before CSS parses, avoids FOUC)
├── colors_and_type.css     # Tim Dixon Design System — colour tokens, type scale, spacing
├── swot-styles.css         # App-specific styles layered on top of the design system
├── tweaks-panel.jsx        # Floating Tweaks panel component (board style, coach tone)
├── swot-engine.jsx         # AI backends (Chrome Prompt API / WebLLM), storage, SWOT helpers
├── swot-intro.jsx          # Step 1 — subject / scope / title form
├── swot-interview.jsx      # Step 2 — guided interview with live tally sidebar
├── swot-board.jsx          # Step 3 — 2×2 board, style picker, export actions
├── swot-app.jsx            # Root controller — AI badge, download consent, state management
└── fonts/
    ├── Roboto-VariableFont.ttf         # Roboto variable font (weight 100–900)
    └── Roboto-Italic-VariableFont.ttf  # Roboto italic variable font
```

### Script loading order

Scripts must load in the order declared in `index.html`:

1. `tweaks-panel.jsx` — exports `TweaksPanel`, `useTweaks`, controls onto `window`
2. `swot-engine.jsx` — exports `LocalAI`, `BUCKETS`, storage helpers, AI functions onto `window`
3. `swot-intro.jsx` — exports `SwotIntro` onto `window`
4. `swot-interview.jsx` — exports `SwotInterview` onto `window`
5. `swot-board.jsx` — exports `SwotBoard` onto `window`
6. `swot-app.jsx` — root; calls `ReactDOM.createRoot`

All files use React 18 + Babel standalone (loaded from CDN in `index.html`). No build step.

---

## Design system

Colours, type, and spacing come from **colors_and_type.css** (Tim Dixon Design System).

Six brand colours — no others used for structural UI:

| Token | Value | Usage |
|---|---|---|
| `--navy` | `#061528` | Primary dark surface, accent in light mode |
| `--orange` | `#FF7C00` | Accent in dark mode |
| `--blue` | `#63D2FF` | Secondary accent in dark mode, muted text |
| `--charcoal` | `#333333` | Body text on light |
| `--black` | `#000000` | Strong text on white / orange / blue |
| `--white` | `#ffffff` | Text on dark, light surfaces |

SWOT quadrant colours are defined in `swot-styles.css` as `--s-*`, `--w-*`, `--o-*`, `--t-*` tokens, with separate light and dark mode values.

---

## Key implementation notes

- **`__MANUAL__` sentinel** — when AI is unavailable, `aiProcessAnswer` returns `bucket: "__MANUAL__"`. The interview UI translates this to `null` so the bucket picker starts unselected, forcing the user to choose. The suggestion card still appears with the user's answer pre-filled.
- **State persistence** — all app state (step, session, swot items, board style) is saved to `localStorage` under key `swot-builder-v1` on every change.
- **AI init** — `LocalAI.init()` runs immediately when `swot-engine.jsx` loads. It probes `window.ai.languageModel` and updates status asynchronously; the rest of the app subscribes via `LocalAI.onStatus()`.
- **WebLLM loading** — the WebLLM UMD script (`@mlc-ai/web-llm`) is lazy-loaded from jsDelivr only when the user explicitly requests a model. Before that, no WebLLM code is fetched.
- **CSS fix** — the prototype had an invalid `selector, @media {}` combo in `swot-styles.css` that caused dark-mode button styles to break in Firefox and Safari. This has been rewritten as two separate valid blocks.
- **Tweaks panel** — `TweakSection` takes a `label` prop (not `title`). This bug existed in the prototype and is fixed in `swot-app.jsx`.

---

## Browser compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| Core app (manual mode) | ✅ | ✅ | ✅ | ✅ |
| Chrome Prompt API | ✅ 127+ | ❌ | ❌ | ❌ |
| WebLLM (WebGPU) | ✅ 113+ | ✅ 113+ | ⚠️ flag | ⚠️ 18+ |
| Copy as image | ✅ | ✅ | ✅ 127+ | ✅ 13.4+ |
| Print / PDF | ✅ | ✅ | ✅ | ✅ |

---

## Dependencies (all CDN, no install)

| Library | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI rendering |
| ReactDOM | 18.3.1 | DOM mounting |
| Babel Standalone | 7.29.0 | JSX compilation in browser |
| html2canvas | 1.4.1 | "Copy as image" export |
| @mlc-ai/web-llm | latest | WebGPU in-browser LLM (lazy-loaded on demand) |
