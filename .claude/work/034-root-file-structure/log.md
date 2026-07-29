# Log: 034-root-file-structure

## [2026-07-29] Intake | Tim reports flat file structure on live site

Tim asked for the live site's resource files to be reorganised into folders instead of sitting flat at the site root, citing https://projects.timdixon.net/SWOT-Builder/.

Sonja fetched the live page and confirmed it matches the repository root exactly (theme.js, colors_and_type.css, swot-styles.css, swot-engine-core.js, and five .jsx files all at root). Checked this against the project wiki and found the flat layout is the recorded architecture, not an oversight:

- ADR 0001: static browser app, no server, relative paths.
- ADR 0002: Babel Standalone compiles JSX in-browser.
- ADR 0003: global `window` wiring, no ES modules for app scripts.
- ADR 0006: static hosting, deploy by file copy, no build step.

The CSP `connect-src 'self'` in index.html exists specifically so Babel Standalone can XHR-fetch the .jsx files same-origin; ADR 0001's consequences section notes a blank screen is the known failure mode if a script path breaks.

Decision: this is architecture-sensitive (touches four recorded ADRs), so per the conformance check this escalates to Jacob rather than going straight to Sean. Before spending Jacob's time, Sonja is taking the ADR conflict back to Tim as Q-SWOT1, since reorganising the layout would need at least one ADR amended or superseded, which counts as a standards change.

Status set to blocked pending Tim's answer. No specialist dispatched yet.

## [2026-07-29] Investigation | Root cause found — deploy allow-list regression, not a structure problem

Tim asked why the page doesn't load if the files really are at root as expected. Sonja curled every resource path referenced in `index.html` against the live site: `index.html` and `assets/analytics/count.js` return 200, but `theme.js`, `colors_and_type.css`, `swot-styles.css`, `swot-engine-core.js`, and all five `.jsx` files return 404 (GitHub Pages' generic 404 page).

Traced `.github/workflows/deploy.yml` history:

- PR #41 (`ff5a2a7`, 16 Jul 2026) correctly customised the rsync ALLOW-list in the deploy workflow to SWOT Builder's real root-level layout (explicit `--include` for each root file, plus `fonts/***` and `assets/***`), replacing the generic template `styles/`, `scripts/`, `data/`, `assets/` list.
- `37a7028` ("sync template to v1.9.1", 19 Jul) correctly re-applied that customisation on top of the synced template.
- `4c8eede` ("sync template to v1.9.2", 23 Jul) overwrote the ALLOW-list with the generic template version again, this time without re-applying the customisation. Every root-level `--include` line was lost. Confirmed via `git show 4c8eede -- .github/workflows/deploy.yml`.
- `37a7028`'s predecessor pattern (manually re-apply after sync) was not repeated for v1.9.2 or the later v1.9.3–v1.9.6 syncs, so the live site has been serving only `index.html` and `assets/**` since 23 Jul.

Conclusion: this is a deploy-configuration regression introduced by an unreviewed template sync, not an architecture or folder-structure problem. Revised the brief: dropped the Jacob escalation and the folder-reorganisation plan, retargeted at restoring the ALLOW-list. Reported to Tim with the option to proceed straight to Sean.

Cross-cutting note for later: a template sync silently overwriting a project's legitimate deploy.yml customisation is a process gap that could hit any project with a customised ALLOW-list. Flagged to Tim as a candidate for a global fix (sync script should diff and warn on customised sections, or the customisation should move to a place the sync never touches), to be raised in a team-root session, not fixed inside this project.

## [2026-07-29] Dispatch | Sean, attempt 1, failed on monthly spend limit

Dispatched Sean to restore the deploy.yml ALLOW-list per the root cause above. The dispatch terminated early: "Agent terminated early due to an API error: You've hit your monthly spend limit." No branch or commit was created; nothing to roll back. Reported to Tim. Retrying on his instruction to resume. Tim confirmed the spend limit was resolved.

## [2026-07-29] Dispatch | Sean, attempt 2, succeeded

Sean opened PR #54 (branch `fix/deploy-allowlist-034`) restoring the twelve root-level `--include` lines plus `fonts/***` and `assets/***`, verified via local rsync dry run and `npm test` (31/31 passing). Dispatched Carol to independently verify the artifact contents, serve it locally, and run a functional + accessibility pass before this goes to the merge gate.
- [2026-07-29 20:42:29] subagent completed
- [2026-07-29 20:43:01] subagent completed
- [2026-07-29 20:43:33] subagent completed
- [2026-07-29 20:44:04] subagent completed
- [2026-07-29 20:44:36] subagent completed
- [2026-07-29 20:45:07] subagent completed
- [2026-07-29 20:45:10] subagent completed
