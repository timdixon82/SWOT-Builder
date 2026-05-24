# SWOT Builder

A guided SWOT analysis interview that runs entirely in your browser. No server, no account, no API key. Your data never leaves your device.

SWOT Builder walks you through a structured conversation, routes your answers into Strengths, Weaknesses, Opportunities, and Threats, and builds a clean four-quadrant board you can edit, export, and share.

---

## What makes it different?

The AI coaching feature runs in the browser itself, not on a server. That means:

- Your interview answers never travel over the internet.
- You do not need to trust a third party with your strategic thinking.
- It works in any modern browser, including in offline-first scenarios.

If your browser supports Chrome's on-device AI (Gemini Nano), the coaching starts instantly with no download. If not, you can load a downloadable language model that runs entirely on your own machine using WebGPU. And if neither is available, manual mode kicks in with pre-generated questions that work in every browser.

---

## Features

- Guided interview, one question at a time, with AI routing answers into the right quadrant
- AI coaching in three tiers: Chrome built-in AI, downloadable WebGPU model, or manual mode
- Four board styles: Classic coloured grid, Executive navy, Bold editorial, and Pills compact
- Export: print to PDF, copy as image, or download as Markdown
- Inline editing of any item directly on the board
- Dark mode that follows your operating system preference, with a manual toggle
- State saved automatically to your browser, so a refresh keeps your progress
- Designed to meet WCAG 2.2 AAA accessibility standards

---

## How to run

The app is a set of static files. It needs to be served over HTTP, not opened directly as a file, because the browser-side compilation step makes network requests.

```
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

---

## AI coaching

### How the app picks an AI backend

The app tries each option in order, silently, when it loads.

| Priority | Backend | How it works | Browser support |
|---|---|---|---|
| 1 | Chrome built-in AI | On-device Gemini Nano, no download needed | Chrome 127 and later only |
| 2 | WebLLM on WebGPU | You choose a model; it downloads to your browser cache | Chrome and Edge 113 and later |
| 3 | Manual mode | Pre-generated questions; you choose the quadrant | All browsers |

### Choosing a WebLLM model

Select the AI badge in the header, then choose a model. Every model shows a consent dialog before the download begins, so you always know what is happening and can cancel at any time.

| Model | Quality | Download size |
|---|---|---|
| Llama 3.2, 1 billion parameters | Basic | Around 620 MB |
| Llama 3.2, 3 billion parameters | Good | Around 1.9 GB |
| Phi 3.5 Mini | Best | Around 2.4 GB |

Models are cached after the first download. Subsequent sessions load from cache with no repeat download.

### Manual mode

Manual mode works in every browser, including Firefox and Safari. Pre-generated questions still guide the interview. After each answer, a suggestion card appears with your text pre-filled, and you choose which quadrant it belongs in.

---

## Analytics

SWOT Builder uses GoatCounter, a privacy-respecting analytics tool, to count page views. No user content is collected: not your subject, not your answers, not your SWOT items. GoatCounter counts only page path, referrer, coarse browser profile, and an approximation of country derived briefly from the visitor's IP address. No persistent identifying cookies are set. A Data Processing Agreement is in place with GoatCounter.

---

## File layout

```
/
├── index.html              Entry point; loads all scripts in the correct order
├── theme.js                Theme bootstrap; sets data-theme before CSS loads to prevent flash
├── colors_and_type.css     Tim Dixon Design System: colour tokens, type scale, spacing
├── swot-styles.css         App-specific styles layered on top of the design system
├── tweaks-panel.jsx        Floating Tweaks panel (board style, coach voice)
├── swot-engine.jsx         AI backends, storage helpers, SWOT data functions
├── swot-intro.jsx          Step 1: subject, scope, and title form
├── swot-interview.jsx      Step 2: guided interview with live tally sidebar
├── swot-board.jsx          Step 3: four-quadrant board, style picker, export actions
├── swot-app.jsx            Root controller: AI badge, download consent, state management
├── fonts/
│   ├── Roboto-VariableFont.ttf         Roboto variable font (weight 100 to 900)
│   └── Roboto-Italic-VariableFont.ttf  Roboto italic variable font
└── assets/
    └── analytics/
        └── count.js        Self-hosted GoatCounter analytics script
```

### Script loading order

Scripts must load in the order declared in `index.html`. Changing the order breaks the app.

1. `tweaks-panel.jsx` puts `TweaksPanel`, `useTweaks`, and the tweak controls on `window`
2. `swot-engine.jsx` puts `LocalAI`, `BUCKETS`, storage helpers, and AI functions on `window`
3. `swot-intro.jsx` puts `SwotIntro` on `window`
4. `swot-interview.jsx` puts `SwotInterview` on `window`
5. `swot-board.jsx` puts `SwotBoard` on `window`
6. `swot-app.jsx` reads everything from `window` and calls `ReactDOM.createRoot`

This pattern is the team's Browser AI Application stack convention: each file declares, in a top comment, what it reads from and what it writes to the global window object. See `docs/decisions/adr-0003.md`.

---

## Dependencies

All dependencies load at runtime from CDNs. Nothing is installed. The project has no build step.

| Library | Version | Source | Purpose | Subresource Integrity |
|---|---|---|---|---|
| React | 18.3.1 | unpkg.com | UI rendering | SHA-384 hash present |
| ReactDOM | 18.3.1 | unpkg.com | DOM mounting | SHA-384 hash present |
| Babel Standalone | 7.29.0 | unpkg.com | JSX compilation in browser | SHA-384 hash present |
| html2canvas | 1.4.1 | unpkg.com | Copy-as-image export | SHA-384 hash present |
| WebLLM | 0.2.83 | cdn.jsdelivr.net | WebGPU in-browser model, lazy-loaded | Pin only; SRI hash pending Phase 2 |

Development tooling (linters) is listed in `package.json` and is not served to the browser.

---

## Browser compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| Core app (manual mode) | Yes | Yes | Yes | Yes |
| Chrome Prompt API | Yes, 127 and later | No | No | No |
| WebLLM on WebGPU | Yes, 113 and later | Yes, 113 and later | Flag only | Partial, 18 and later |
| Copy as image | Yes | Yes | Yes, 127 and later | Yes, 13.4 and later |
| Print to PDF | Yes | Yes | Yes | Yes |

---

## Accessibility

SWOT Builder aims to meet WCAG 2.2 at AAA conformance. A baseline audit identified 25 findings, catalogued in `docs/accessibility.md`. The critical findings (modal focus management, toast live regions, tag removal buttons) are scheduled for Phase 2 remediation. All colour pairs in the design system meet the 7:1 contrast ratio required by WCAG 2.2 AAA for normal text.

---

## Licence

MIT. See `LICENSE`.
