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

## [2026-07-29] Dispatch | Carol, attempt 1, failed on transient server error

Carol's dispatch terminated early on a transient API 500 error (not a spend limit), partway through her functional pass. Before stopping she had confirmed: theme toggle works (light to dark), the interview flow advances to step 2 with the guided question rendering, and no console errors — consistent with Sean's fix. She had not yet reached the board, export/download, or her accessibility checks. Retrying the dispatch to complete the pass.

## [2026-07-29] Dispatch | Carol, attempt 2, failed on transient server error

Second attempt also terminated early, this time on an API 529 "Overloaded" error — again transient infrastructure, not a finding about the fix. Retrying a third time.

## [2026-07-29] Test | Carol, attempt 3, passed — sign-off for merge gate

Third attempt completed. Carol independently verified the workflow file (every referenced root file has an anchored `--include`, fail-safe `--exclude='*'` last, customisation comment preserved and now names commit `4c8eede` as the regression), reproduced the rsync dry run herself (12 files plus `fonts/` and `assets/analytics/count.js`, nothing unwanted), served the artifact locally and confirmed the app mounts, the interview flow completes, the board renders, export buttons are present, theme toggle works, and no missing-script console errors (one pre-existing CSP-blocked sourcemap fetch, harmless). Ran Pa11y WCAG2AAA against the rendered artifact and found two pre-existing findings unrelated to this diff: contrast on the intro screen's `.mini-cell` quadrant swatches, and five tweak-panel form fields missing id/name. Logged both as follow-up TASK items (owner Sean, plus a low-priority CI-coverage task for Jed), not blockers — this PR changes only `deploy.yml`. Agreed with Sean's call to skip the full accessibility regression suite for a workflow-only diff.

Verdict: pass on all five review items, signed off for the merge gate. Definition-of-done items in brief.md ticked. Status remains active, blocked only on Tim's merge approval for PR #54.

## [2026-07-29] Merge | Tim approved, PR #54 merged, live site confirmed fixed

Tim approved the merge. Sonja merged PR #54 (squash, branch deleted). GitHub Pages redeployed automatically; confirmed live by curling the previously-404 paths directly: theme.js, colors_and_type.css, swot-styles.css, swot-engine-core.js, and swot-app.jsx all now return 200 on https://projects.timdixon.net/SWOT-Builder/. Status set to done.

Two follow-up TASK items remain open from Carol's pass (intro-screen contrast, tweaks-panel form field labelling) — logged in the task substrate, not tracked further in this folder. The template-sync process gap (silently overwriting a project's customised deploy.yml) is also still open as a cross-cutting item for a team-root session; not addressed here.
- [2026-07-29 20:42:29] subagent completed
- [2026-07-29 20:43:01] subagent completed
- [2026-07-29 20:43:33] subagent completed
- [2026-07-29 20:44:04] subagent completed
- [2026-07-29 20:44:36] subagent completed
- [2026-07-29 20:45:07] subagent completed
- [2026-07-29 20:45:10] subagent completed
- [2026-07-29 20:46:22] subagent completed
- [2026-07-29 20:46:54] subagent completed
- [2026-07-29 20:51:15] subagent completed
- [2026-07-29 20:52:04] subagent completed
- [2026-07-29 20:52:40] subagent completed
- [2026-07-29 21:30:32] subagent completed
- [2026-07-29 21:49:33] subagent completed
- [2026-07-29 21:50:06] subagent completed
- [2026-07-29 21:50:38] subagent completed
- [2026-07-29 21:51:10] subagent completed
- [2026-07-29 21:51:42] subagent completed
- [2026-07-29 21:52:14] subagent completed
- [2026-07-29 21:52:47] subagent completed
- [2026-07-29 21:53:19] subagent completed
- [2026-07-29 21:53:51] subagent completed
- [2026-07-29 21:54:02] subagent completed
- [2026-07-29 21:57:54] subagent completed
- [2026-07-29 23:14:37] subagent completed
- [2026-07-30 16:44:54] subagent completed
- [2026-07-30 16:45:26] subagent completed
- [2026-07-30 16:47:25] subagent completed
- [2026-07-30 16:47:57] subagent completed
