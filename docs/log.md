# Log

This is the project operations log for SWOT Builder. Entries are appended in chronological order. Entries are never edited.

Each entry starts with the date, the operation type, and the subject.

---

## [2026-05-22] Ingest | Project adoption and backfill reviews

The team adopted the SWOT Builder project from files supplied by Tim. No prior architecture, security, or accessibility review existed. Four backfill reviews were carried out to establish a baseline:

- Tad produced requirements.md: 17 functional requirements (FR-01 to FR-17) and 6 non-functional requirements (NFR-01 to NFR-06), reverse-engineered from the README and source code.
- Jacob produced the architecture review: seven Architecture Decision Records (ADR 0001 to ADR 0007) covering the static browser application design, the in-browser JSX compile with Babel Standalone, the global window wiring pattern, the three-tier browser-local AI design, the dependency-free stance, static hosting, and CDN dependency management.
- Jed produced the security review: no high-severity findings, two medium-severity findings (absent CSP and missing SRI hash for html2canvas), two low-severity findings (unpinned WebLLM and broad postMessage origin).
- Carol produced the baseline accessibility audit: 25 findings across critical, high, medium, and low severity; a conditional fail against WCAG 2.2 AAA.

Open questions Q26 to Q29 were compiled and passed to Sonja for Tim to answer. These cover: how to record the new browser-application stack, the automatic-download threshold for WebLLM models, the hosting target, and whether to self-host the CDN libraries.

## [2026-05-22] Ingest | Project wiki created

The project wiki was written into `docs/` in the SWOT-Builder repository on branch `chore/project-setup`. Files created:

- `docs/index.md`: catalogue of all wiki pages.
- `docs/log.md`: this file.
- `docs/glossary.md`: terms specific to SWOT Builder.
- `docs/requirements.md`: 17 functional requirements and 6 non-functional requirements, with known gaps.
- `docs/accessibility.md`: WCAG 2.2 AAA position from Carol's audit; 25 findings as Phase 2 remediation items.
- `docs/security-review.md`: security review from Jed; two medium findings as Phase 1 setup build conditions.
- `docs/decisions/adr-0001-static-browser-application.md`
- `docs/decisions/adr-0002-babel-standalone-in-browser-compile.md`
- `docs/decisions/adr-0003-global-window-wiring-no-modules.md`
- `docs/decisions/adr-0004-three-tier-browser-local-ai.md`
- `docs/decisions/adr-0005-dependency-free-no-install.md`
- `docs/decisions/adr-0006-static-hosting-no-build-deploy.md`
- `docs/decisions/adr-0007-cdn-dependencies-pin-and-sri.md`

Author: Tad (business analyst and documenter).
