# SWOT Builder: Project Wiki Index

This is the catalogue of all pages in the SWOT Builder project wiki. The wiki lives in the `docs/` folder of this repository.

For global team standards (accessibility law, OWASP defences, coding standards, release process, and agent roles) see the global wiki in the AgentTeam repository.

## Project overview

SWOT Builder is a browser-only application that guides a user through a SWOT (Strengths, Weaknesses, Opportunities, and Threats) analysis via a structured interview. It uses browser-local AI (artificial intelligence) where available. There is no server, no account, and no API (application programming interface) key. All user data stays on the device.

## Wiki pages

### Core documents

- `requirements.md`: 17 functional requirements and 6 non-functional requirements, with acceptance criteria and a list of known gaps. Baseline: 2026-05-22.
- `accessibility.md`: WCAG (Web Content Accessibility Guidelines) 2.2 AAA conformance position. Lists all 25 findings from the 2026-05-22 baseline audit as Phase 2 remediation items.
- `security-review.md`: OWASP Top 10 assessment and UK GDPR (UK General Data Protection Regulation) data-protection position. Lists 2 medium-severity and 2 low-severity findings. Phase 1 conditions: add CSP (Content Security Policy) and add SRI (Subresource Integrity) hash for html2canvas.
- `glossary.md`: terms specific to SWOT Builder, including domain vocabulary, technical abbreviations, and component names.
- `log.md`: chronological, append-only record of all wiki operations and project decisions.

### Architecture Decision Records

All ADRs (Architecture Decision Records) are in the `decisions/` folder. Numbering starts at 0001 to match the convention used in the backfill review.

- `decisions/adr-0001-static-browser-application.md`: the whole application is static files running in the browser. No server, no database. Status: accepted.
- `decisions/adr-0002-babel-standalone-in-browser-compile.md`: JSX (JavaScript XML) is compiled in the browser by Babel Standalone at run time. No build step. Status: accepted.
- `decisions/adr-0003-global-window-wiring-no-modules.md`: files share components and helpers through the global window object. The load order in index.html is fixed. Status: accepted.
- `decisions/adr-0004-three-tier-browser-local-ai.md`: three-tier AI backend (Chrome Prompt API, WebLLM, manual mode) with graceful fallback and size-based download consent. Status: accepted.
- `decisions/adr-0005-dependency-free-no-install.md`: no package.json, no node_modules, no lockfile. All libraries loaded from CDNs at run time. Status: accepted.
- `decisions/adr-0006-static-hosting-no-build-deploy.md`: hosted on a static file server over HTTP. No build or deploy pipeline. Hosting target pending Tim's answer to question Q28. Status: accepted.
- `decisions/adr-0007-cdn-dependencies-pin-and-sri.md`: every CDN-loaded library must be pinned to an exact version and carry an SRI hash. Two gaps (html2canvas, WebLLM) are setup build conditions. Status: accepted with risk.

## Open questions

The following questions are pending Tim's answers (passed to Sonja from the backfill reviews):

- Q26: how to record the new browser-application stack (Jacob's review).
- Q27: what to do with the 50 MB automatic-download threshold for WebLLM models (Jacob's review).
- Q28: where to host SWOT Builder (Jacob's review).
- Q29: whether to self-host the CDN libraries (Jacob's review).

Additional open questions from the requirements backfill:

- Q26 (requirements): whether to wire coach tone into the AI prompt or remove the control.
- Q27 (requirements): how to fix keyboard access for tag removal.
- Q28 (requirements): how to add focus trapping to modals.
- Q29 (requirements): whether to update the page title on step change.

Note: the question numbering above follows the engagement sequence and was set during the backfill. The architecture questions are Q26 to Q29 from Jacob and the requirements questions are also Q26 to Q29 from Tad, both batches compiled at the same time. Sonja holds the canonical sequence.

## Planned pages (not yet created)

The following pages will be added as work progresses.

- `exceptions/accessibility-language-of-parts.md`: formal exception record for the multi-language limitation (finding L-04 in the accessibility audit).
- `patterns/`: reusable patterns discovered during development. Candidates flagged by Jacob: the three-tier browser-local AI pattern; the browser-application stack definition.
