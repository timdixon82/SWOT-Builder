# Work Log: 008-swot-builder-setup

This log is chronological and append-only.

## [2026-05-22] setup | Repository created and work folder opened

Tim asked for a new public repository, SWOT-Builder, to be brought under team governance. Sonja created `timdixon82/SWOT-Builder`, public, and pushed the 13 original implementation files as the initial commit on `main`, unchanged, following Tim's setup prompt in the `inputs` folder. Triaged as an adopt-and-backfill job, the same pattern as Periodic-Table, Clock-Practice, and LLBS.

## [2026-05-22] dispatch | Backfill reviews dispatched

Dispatched Tad, Jacob, Jed, and Carol in parallel to backfill the business-analysis, architecture, security, and accessibility reviews. Each writes its report into this work folder. This phase is read-only; the repository is not changed.

## [2026-05-22] consolidate | SWOT-Builder backfill complete

All four backfill reviews are in. SWOT-Builder is a browser application: React with an in-browser Babel transform, no build step, no server, browser-local artificial intelligence, with state kept in the browser.

- Tad: 17 functional and 6 non-functional requirement stories, reverse-engineered from the README and the code.
- Jacob: seven Architecture Decision Records. The architecture is coherent. One record, third-party libraries from content delivery networks, is accepted with risk: html2canvas has no integrity hash and WebLLM is loaded unpinned. Jacob raised four questions: how to record the browser-application stack, the model-download consent threshold, hosting, and whether to self-host the libraries.
- Jed: no high-severity findings. Two medium: no Content Security Policy, and html2canvas without a Subresource Integrity hash. All user data stays in the browser; no UK GDPR server-side concern.
- Carol: conditional fail against WCAG 2.2. 25 findings: 7 critical, 8 high, 6 medium, 4 low. The critical issues, mainly the modals lacking focus management and the toasts lacking a live region, must be fixed before screen-reader testing.

Next: Sonja created the `chore/project-setup` branch and dispatched Tad to consolidate the four reviews into the SWOT-Builder project wiki and compile the open questions for Tim. The security and accessibility findings become a later SWOT-Builder remediation phase, the two-phase shape used for Periodic-Table.

## [2026-05-22] note | SWOT-Builder project wiki built and committed

Tad built the SWOT-Builder project wiki: 13 pages in `docs/` on the `chore/project-setup` branch, consolidating the four backfill reviews. The pages are `index.md`, `log.md`, `glossary.md`, `requirements.md` (17 functional and 6 non-functional requirements), `accessibility.md` (Carol's 25 findings as a Phase 2 remediation list), `security-review.md` (Jed's review; the two medium findings marked as Phase 1 setup conditions), and the seven Architecture Decision Records. The first run was blocked because the SWOT-Builder repository path lacked Write permission; Sonja added a broad `Github/**` Write and Edit permission to `.claude/settings.local.json`, which also clears this friction for every future repository, and re-dispatched Tad. Sonja committed and pushed the wiki.

The five open questions are in `outputs/swot-builder-questions.md` for Tim, Q26 to Q30: how to record the browser-application stack, the model-download consent threshold, hosting, self-hosting the third-party libraries, and wiring the coach-tone setting. Next: the SWOT-Builder setup build, once the open questions that bear on it are answered.

## [2026-05-22] decision | Tim answered SWOT-Builder questions Q27 to Q30

Tim answered four of the five SWOT-Builder questions:

- Q27B: remove the automatic model-download branch, so every WebLLM model download always asks the user for consent. A remediation item.
- Q28A: SWOT-Builder is hosted on GitHub Pages from its own repository. This feeds the setup build.
- Q29A: keep the third-party libraries on content delivery networks for now, applying the Architecture Decision Record 0007 fixes only, that is, pin every library to a version and add a Subresource Integrity hash. Remediation items.
- Q30A: wire the coach-tone setting into the artificial-intelligence prompt. A fix item.

Q26 (how to record the browser-application stack) was sent through a terminal command that errored; Tim's note suggested naming the stack "Browser AI Application", marked tentative. Sonja is asking Tim to confirm Q26 as a normal chat message. The SWOT-Builder setup build can proceed on Q28A; the other answers feed the setup build and the later remediation phase.

## [2026-05-22] decision | Q26 confirmed

Tim confirmed Q26: a new stack page is added to the global wiki for this kind of project, named "Browser AI Application". All five SWOT-Builder questions, Q26 to Q30, are now answered, and the SWOT-Builder setup build is unblocked.
