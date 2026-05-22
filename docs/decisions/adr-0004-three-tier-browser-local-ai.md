# ADR 0004: Three-tier browser-local AI with size-based download consent

Status: Accepted (backfilled 2026-05-22)

## Context

The application offers AI (artificial intelligence) help to classify interview answers and suggest questions. It must do this without a server, without an API (application programming interface) key, and without sending the person's data off the device. Browser support for on-device AI varies widely.

## Decision

Use a three-tier AI design, managed by the `LocalAI` object in `swot-engine.jsx`. The tier is chosen at startup with graceful fallback.

Tier 1: Chrome built-in AI, the Prompt API at `window.ai` (Gemini Nano). Tried automatically on `LocalAI.init()`. No download for the application to manage. Available in Chrome 127 and later.

Tier 2: WebLLM on WebGPU. Started only when the person explicitly picks a model from the AI badge dropdown. Three models are offered: Llama 3.2 1B (620 MB, basic quality), Llama 3.2 3B (1.9 GB, good quality), and Phi 3.5 Mini (2.4 GB, best quality). Models are cached in the browser after first download.

Tier 3: Manual mode. A fixed rotation of twelve pre-written questions covering all four quadrants. The person picks the quadrant for each answer. Works in every browser including Firefox and Safari.

Size-based download consent for Tier 2: models of 50 megabytes or less may download automatically with a progress bar; models above 50 megabytes show a consent dialog first. The consent dialog names the model, states the download size, and confirms that the model runs on the device and that no data leaves the machine.

AI output is treated as untrusted data: it is rendered as text content, never as markup, and its fields are length-clamped. The bucket value is validated against the allowed set S, W, O, T.

## Alternatives considered

- A single cloud AI API. Rejected: it needs an API key and sends the person's data to a third party, breaking the privacy goal.
- WebLLM only. Rejected: it would force a large download on every user and would exclude browsers without WebGPU (graphics processor unit).
- No fallback (AI required). Rejected: it would leave Firefox and Safari users with a broken application.

## Consequences

The privacy goal holds in every tier; all AI runs on the device. Every browser can complete a SWOT, because manual mode always works. The `LocalAI` abstraction keeps the rest of the application unaware of which tier is active.

When AI cannot classify an answer, the engine returns `bucket: "__MANUAL__"` and the interview screen shows an unselected bucket picker, gently requiring the person to choose rather than accepting a wrong guess.

Open point: every model currently in the catalogue is well above the 50 megabyte threshold, so the automatic-download branch is unreachable today. The threshold is an effective no-op and should be confirmed, lowered, or removed (question Q27 for Tim).

The privacy promise is load-bearing. No later change may send interview content, answers, or SWOT items off the device without a new ADR superseding this one.
