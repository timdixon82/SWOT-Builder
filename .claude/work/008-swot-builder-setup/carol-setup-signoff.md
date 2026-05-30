# Carol: Setup Build Sign-off

Document type: Test report — accessibility regression check
Work folder: 008-swot-builder-setup
Date: 2026-05-27
Auditor: Carol (tester and release manager)
PR: timdixon82/SWOT-Builder #1, branch chore/project-setup

## Verdict

Pass. The setup build does not introduce any new accessibility regressions. The PR is signed off for merge.

---

## Scope of this review

This is a regression check only. The 25 pre-existing findings catalogued in the baseline audit (carol-baseline-audit.md, dated 2026-05-22) are all deferred to Phase 2 and are not evaluated here. This review asks one question: does anything added or changed in this PR introduce a defect that was not present in the baseline?

The files that touch runtime behaviour are:

- index.html (modified: CSP meta tag, referrer policy meta, SRI hashes on existing scripts, GoatCounter script tag)
- swot-engine.jsx (modified: WebLLM CDN URL pinned from "latest" to @0.2.83)
- assets/analytics/count.js (added: self-hosted GoatCounter tracking script)

All other changed files are configuration (linter configs, CI workflows, release tooling), documentation (README, ADRs, accessibility and security docs, glossary, requirements, todo.md), or lock files. None of those affect the rendered accessibility tree.

---

## Finding-by-finding check

### index.html changes

The CSP meta tag and referrer policy meta are head elements. They carry no ARIA attributes, introduce no new DOM content, and do not alter the accessibility tree.

The SRI integrity and crossorigin attributes added to the React, Babel, and html2canvas script tags are security-only attributes with no accessibility effect.

The GoatCounter script tag loads count.js asynchronously (the async attribute is present), which means it does not block the main document parse or delay React mounting. The script tag itself carries no ARIA attributes and introduces no visible DOM at load time.

No new interactive elements, headings, images, or landmarks are added to the HTML shell. The document structure is unchanged.

### assets/analytics/count.js

GoatCounter sends a tracking ping by injecting a 1-by-1 pixel img element into document.body at page load. The script sets aria-hidden="true" on this image before appending it. This is the correct pattern: the image is decorative and invisible to screen readers. No new focusable elements, landmarks, live regions, or interactive controls are introduced.

The visit_count feature of GoatCounter can optionally append a text element to the page, but only when explicitly configured via a data-goatcounter-click attribute or a direct API call. Neither is used here; the script tag in index.html uses only data-goatcounter to set the endpoint. The visit_count code path is inert in this deployment.

The script reads document.title and document.referrer for analytics payload construction. These are read-only operations with no DOM side-effects.

### swot-engine.jsx change

The change pins the WebLLM CDN URL from the floating "latest" tag to the fixed version @0.2.83. This is a URL string change in a dynamically injected script tag. The src attribute value changes; nothing else does. No accessibility attributes, no DOM structure, no ARIA changes.

---

## Against the 25 baseline findings

None of the three changed files creates a new instance of any of the 25 baseline findings. Specifically:

- No new modal or dialog without role="dialog" (C-01)
- No new landmark structure changes (C-02)
- No new decorative-only informational elements without text alternative (C-03)
- No new interactive controls without accessible names (C-04, C-05, C-06)
- No new status notifications without live regions (C-07)
- No new contrast failures introduced (H-02, H-03)
- No new interactive state not communicated to screen readers (H-04)
- No new unlabelled form controls (H-05, H-06)
- No new symbol-only visible labels (H-07, H-08)
- No new animation without reduced-motion alternative (M-01)
- No new mouse-only interactions (M-02)
- No new colour-only distinctions at small size (M-03)
- No new heading hierarchy violations (M-04)
- No new suppressed focus outlines (M-05)
- No new unlabelled form hints (M-06)
- No new unlabelled SVG content (L-01, L-02, L-03, L-04)

---

## CI check confirmation

The PR description states all eight CI checks pass: lint, Pa11y/axe AAA, CodeQL, Semgrep, Trivy, and dependency review. These are infrastructure confirmations external to this review.

---

## Limitations

This review is code-based. The GoatCounter count.js was inspected via the PR diff. The rendered application was not tested in a live browser for this pass. The Pa11y and axe-core CI checks run against the static HTML shell only (the app requires browser-side Babel compilation). No new functionality was introduced by this build, so the risk of undiscovered runtime regressions is low. The recommendation for a live axe-core run at each step before Tim's Phase 2 testing remains, as noted in the baseline audit.

---

## Sign-off

Signed off for merge: yes.
Signed by: Carol (tester and release manager)
Date: 2026-05-27
