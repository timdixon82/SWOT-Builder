# Log: 028-swot-builder-blank-screen

This log is chronological and append-only.

## [2026-05-30] open | Work folder scaffolded

Sonja opened work folder 028 for the SWOT Builder blank-screen bug Tim reported (Q244A). The bug was first noted in work folder 025 on 2026-05-29: "when the SWOT Builder loads, the initial screen shows nothing."

Triage: **Bug fix**. SWOT Builder is browser-side only (no backend, no personal data), so the architecture/security conformance check is light — escalate to Jacob or Jed only if the fix touches a sensitive area.

SWOT-Builder repo synced to origin/main (00799cd) before dispatch. Phase 2 accessibility work (025) is complete and merged.

Active work folders: 011 (active), 027 (active), 028 (this folder) = 3 of 3 slots in use.

Tim's instruction: ensure Carol tests the output. Carol's functional and accessibility passes are in the routing plan and run before the merge gate.

Next step: dispatch Sean to investigate the root cause and fix on a feature branch.

## [2026-05-30] sean | Root cause found and fixed — PR 13 open

Root cause: `index.html` CSP `connect-src` directive was missing `'self'`. Babel Standalone fetches every `<script type="text/babel" src="...">` JSX file via XMLHttpRequest, which `connect-src` governs. Without `'self'`, the browser blocked all same-origin XHR, so the six JSX files never ran, `window.loadState` and friends were never defined, `SwotApp` threw `TypeError: window.loadState is not a function`, React unmounted, and `#root` was left empty — blank screen.

The CSP was introduced pre-Phase 2 (commit 63da44c). CI only scans the static HTML shell (no JS render), so it never caught the regression. Likely became visible with stricter `connect-src` enforcement in Chrome 148.

Fix (PR 13, branch `fix/blank-initial-screen`): one line — `connect-src 'self' https://cdn.jsdelivr.net https://timdixon82.goatcounter.com`. No other file changed; all Phase 2 accessibility fixes preserved. Verified via headless Chrome DOM comparison (empty `#root` before, full React tree after). Confidence: high. Lint clean.

PR 13: https://github.com/timdixon82/SWOT-Builder/pull/13

Token count: 135,917 — well above the 80k soft ceiling. Flagged as possible runaway: the headless reproduction (serving, loading, DOM diffing across two CSP states) drove the cost; the brief itself was appropriately scoped and the output is a correct one-line fix. Noted for review, not rework.

Follow-up tasks emitted: (1) input border contrast `--border` token below 3:1 (pre-existing on main); (2) add a CI smoke test that loads the rendered app, not just the static shell, to catch blank-screen regressions.

Next step: Carol functional + accessibility test of PR 13; Jed quick security review of the CSP change (security-sensitive area per the conformance check). Then merge gate — pause for Tim.

## [2026-05-30] carol + jed | PR 13 reviews — Pass / Approved

Carol: **Pass**. Verified in a real browser (Playwright) that the intro screen now renders (heading, subject input, scope select, title input, start button); zero console errors and zero CSP violations on load; dark/light both render; lint clean. Accessibility intact — skip link moves focus to `#root`, `<main>` landmark present, tab order correct, no Phase 2 regression. Pa11y "contrast NaN:1" artefacts are on the `aria-hidden` mini-swot and are pre-existing tool noise, not real failures. Token count ~28k. Review: carol-pr13-review.md.

Jed: **Approved** (no conditions). Diff is exactly the one-line `connect-src 'self'` addition; no other CSP directive changed, no new external origin. Least-privilege fix; does not worsen the pre-existing `script-src 'unsafe-inline'` posture (already tracked in todo.md). Token count ~5k. Review: jed-pr13-review.md.

Pre-existing, non-blocking (noted separately, follow-up tasks filed): input border `--border` contrast below 3:1 (WCAG 1.4.11) in both themes; auto-focus to `#subject` on mount skips the skip link for keyboard users.

**PR 13 is at the merge gate. Both signs-offs in, CI green expected. Pauses for Tim's express merge approval.**
- [2026-05-30 00:46:27] subagent completed
- [2026-05-30 08:32:55] subagent completed

## [2026-05-30] sonja | PR 13 merged to main — bug fixed

Tim gave express merge approval ("merge swot builder in parallel"). All 7 CI checks green (CodeQL, Lint, Pa11y/axe AAA, analyze, dependency-review, semgrep, trivy); mergeable CLEAN. Merge gate satisfied (Carol Pass, Jed Approved). Squash-merged at 2026-05-30T09:05:19Z. The CSP `connect-src 'self'` fix is on main; GitHub Pages will redeploy. Blank-screen bug resolved.

Work folder 028 status: done. Tim to confirm on the live site at his convenience. Two non-blocking follow-ups remain as filed tasks (input border contrast; CI smoke test for rendered app).

## [2026-05-30] sonja + carol | Live site STILL blank after merge — deployment root cause found and fixed

Tim reported the live site was still blank after the merge. Carol's live diagnostic (carol-live-diagnostic.md) found the code fix was correct and on main, but GitHub Pages was serving the pre-fix file (commit 00799cd from 2026-05-29): the live CSP still lacked 'self' and all six JSX files were still CSP-blocked. The "pages build and deployment" never fired for the merge commit (3535146) — only the repo's own CI and Release workflows ran.

Root cause of the non-deployment: the repo's Pages setting was `build_type: workflow` (deploy only via a Pages Actions workflow) but the repo has NO Pages-deploy workflow, while `source` still pointed at branch main. Stranded config → nothing deployed on push. It previously deployed via the built-in branch builder ("pages build and deployment [dynamic]").

Fix (Tim authorised checking/fixing the repo settings): restored Pages to branch deploy — `gh api -X PUT repos/timdixon82/SWOT-Builder/pages` with `build_type: legacy`, `source: {branch: main, path: /}`. An empty commit (cf95abc) then triggered "pages build and deployment" automatically — completed/success — and the github-pages environment updated to cf95abc. Automatic deploy-on-push is restored; Tim no longer needs to touch Pages.

Carol live re-verification: **FIXED on live**. `#root` renders the intro screen; zero CSP violations; served `connect-src` now includes `'self'`; interactive; skip link works. Both http and https variants render.

LESSON (cross-cutting): a merge passing CI does NOT prove the live site updated. Verify the Pages deployment ran for the merge commit, and verify on the live URL, before closing. Carol filed a release-checklist task for a post-merge Pages-deploy smoke check. Possible follow-up: audit other project repos (Periodic-Table, Clock-Practice, etc. on projects.timdixon.net) for the same `build_type: workflow` misconfiguration.

Two empty commits (ddef902, cf95abc) were pushed directly to main to trigger deploys, under Tim's standing pre-approval for non-merge git actions. Bug fully resolved.
- [2026-05-30 10:36:06] subagent completed
- [2026-05-30 10:44:34] subagent completed
- [2026-05-30 10:46:46] subagent completed

## [2026-05-30] sonja | PR 14 merged — SWOT now on standard Actions deploy

Tim approved ("do the merges"). Set SWOT Pages build_type to "workflow", merged PR 14 (squash, commit 5f511c1). The "Deploy" workflow ran and completed/success; github-pages environment now deploys via Actions (5f511c1), matching the other repos. Live check (curl) confirms the served index.html has the correct `connect-src 'self'` CSP and the app shell. SWOT deploy is now consistent with the team standard. Work folder 028 fully closed.
