# SWOT Builder: Backlog and Phase 2 Items

This file tracks deferred items from the setup build and baseline reviews. It is a living list, not a log. Items move off this list when they are done and into the relevant commit message or ADR.

## Phase 2: Accessibility remediation (25 findings from Carol's baseline audit)

These are catalogued in `docs/accessibility.md`. They are grouped by priority below.

### Group 1: Fix before any screen-reader testing

These block VoiceOver and JAWS from working with the application.

- C-01: Add `role="dialog"`, `aria-modal`, `aria-labelledby`, focus management, focus trap, and keyboard dismiss to all modals.
- C-07: Add `role="status"` and `aria-live="polite"` to the toast notification element.
- C-05: Change tag removal spans to `button type="button"` with `aria-label` in both TagEditor and ItemEditorModal.
- C-06: Add `.item-card:focus-within .item-actions { opacity: 1; }` so item edit buttons are visible on keyboard focus.
- H-06: Add `aria-label` attributes to the answer textarea and the description textarea in swot-interview.jsx.

### Group 2: Fix before handoff to Tim for testing

- C-02: Add `<main>` to the intro step; add a skip-to-content link; verify only one `<main>` exists at any time.
- C-03: Add `aria-hidden="true"` to stepper dot spans.
- C-04: Add `aria-label` to AI-suggested bucket button including "(AI suggestion)".
- H-04: Update theme toggle `aria-label` dynamically to describe the action ("Switch to dark mode" or "Switch to light mode").
- H-05: Wrap ConfidencePicker buttons in a `role="group"` with `aria-labelledby`; add `aria-label="Add tag"` to the tag input.
- H-08: Replace "x" dismiss button text with a visible "Dismiss" label or an accessible icon pattern.
- M-01: Add `aria-hidden="true"` to dot-pulse spans; add `role="status"` to loading paragraphs.
- M-04: Change the interview question paragraph to an `<h2>` element.
- M-05: Remove `outline: none` from `.input:focus` and `.textarea:focus` rules.

### Group 3: Fix in the next sprint

- H-01: Restructure AI badge dropdown as a menu with `role="menu"` and `role="menuitem"` (not `role="listbox"` and `role="option"`).
- H-02: Replace rgba low-opacity colours in Tweaks panel with solid colours that meet 7:1 against the panel background.
- H-03: Change the Executive board style Strengths letter colour to white or a lighter green that meets 4.5:1 on navy.
- H-07: Replace the Unicode command symbol in the submit hint with plain text "Cmd".
- M-02: Add keyboard arrow-key repositioning to the Tweaks panel drag, or remove drag.
- M-03: Raise `.conf-dots-label` font size from 10px to at least `var(--text-xs)`.
- M-06: Add `aria-describedby` to the scope select and title inputs linking to their field-hint paragraphs.
- L-01: Add `aria-hidden="true"` to the SVG inside the Logo component.
- L-02: Add `aria-hidden="true"` to the watermark div.
- L-03: Add a print-only heading for the board title.
- L-04: Document the multi-language limitation in `docs/exceptions/`.

## Phase 2: Security remediation

- ADR 0007 / Jed finding 3: Compute and add the SRI hash for the WebLLM jsDelivr CDN bundle (version 0.2.83). The UMD bundle path is served by jsDelivr and is not in the npm package, so the hash must be computed from the live CDN file.
- ADR 0007 / Jed finding 4: Change the `postMessage` target origin in tweaks-panel.jsx from `'*'` to `window.location.origin`.

## Phase 2: Architecture items (from Q27B and Q30A)

- Q27B: Remove the automatic model-download branch from swot-app.jsx so every model download always shows the consent dialog, however small the model.
- Q30A: Wire the coach-tone setting from the Tweaks panel into the AI prompt in swot-engine.jsx (Friendly, Concise, or Playful).

## Cross-origin isolation check

Determine whether WebLLM 0.2.83 requires `SharedArrayBuffer` (and therefore cross-origin isolation headers) for the inference Web Worker. If it does, implement the service worker approach (as used in ICCC) to inject `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers, since GitHub Pages cannot send custom response headers. Document the outcome in `docs/decisions/`.
