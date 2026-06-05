# Brief: 028-swot-builder-blank-screen

Status: archived

## Summary

Fix the bug Tim reported: when the SWOT Builder loads, the initial screen shows nothing (blank). Find the root cause, fix it, and verify the app renders its first screen correctly. SWOT Builder is a browser-side static app (HTML, CSS, JavaScript with React) in `timdixon82/SWOT-Builder`.

Preamble fields:

- Status: `done`
- Branch: feature branch off `main`
- Mockup mode: `D` (bug fix to existing UI; no new design)
- Priority: `2`
- Blockers: `None`

## Requirements

Bug report (Tim, 2026-05-29, logged in work folder 025): "When the SWOT Builder loads, the initial screen shows nothing." Expected: the app's first screen (the start/interview screen) renders on load. The Phase 2 accessibility remediation (work folder 025) is complete and merged; this is a separate functional regression to investigate.

## Routing plan

Triage: **Bug fix**.

1. **Sean** — investigate the root cause of the blank initial screen, fix it on a feature branch off `main`, open a pull request. Sean reports the root cause in the work-folder log.
2. **Architecture/security conformance check** — Sonja confirms the fix does not touch an architecture- or security-sensitive area (SWOT is browser-side, no backend, no personal data). Escalate to Jacob or Jed only if it does.
3. **Carol** — functional and accessibility (WCAG 2.2 AAA) testing of the output: confirm the initial screen renders and that no accessibility regression was introduced. Functional and accessibility passes run in parallel.
4. **Sonja** — merge gate; Tim's express approval required to merge.

## Out of scope

- Phase 3 architectural items tracked in `todo.md` on main (cross-origin isolation service worker, WebLLM SRI hash, postMessage origin hardening).
- New features or UX changes unrelated to the blank-screen fix.
- Re-litigating any of the 25 accessibility findings already resolved in work folder 025.

## Risk and rollback

Risk: The blank screen may stem from a JavaScript runtime error during initial render (for example a regression introduced by the Phase 2 accessibility commits, or a module-load or CDN-dependency failure), so the fix could touch the app's entry/render path and must not reintroduce any of the resolved accessibility findings.

Rollback: All work is on a feature branch off `main`; rollback is a revert on `main`. All state is browser-local, so there is no data-layer risk.

## Definition of done

- [ ] Root cause of the blank initial screen identified and recorded in the log
- [ ] Fix applied on a feature branch; the initial screen renders correctly on load
- [ ] No JavaScript console errors on load
- [ ] Carol confirms the initial screen renders (functional pass)
- [ ] Carol confirms no WCAG 2.2 AAA regression; axe-core and Pa11y pass in CI
- [ ] Sean opens a pull request; CI passes on the branch
- [ ] Tim has approved the merge to main

## Approved GitHub actions

Per Tim's standing pre-approval of 2026-05-22, git actions on all repositories may run without pausing. Merges to the main branch always need Tim's express approval given at the time. The hard deny-list always applies.

- [x] Create a branch
- [x] Commit to a branch
- [x] Push a branch other than the main branch
- [x] Open a pull request
- [x] Comment on a pull request or an issue
- [ ] Create an issue

## Not pre-approved

These always pause for Tim, whatever is ticked above:

- Merging to the main branch. This always needs Tim's express approval at the time.
- Publishing to a blog or a social media account.

## Never allowed

The hard deny-list from `CLAUDE.md`. These are refused outright, whatever a brief says: force-push, branch deletion, history rewrite, repository deletion, repository visibility change, branch-protection edits, collaborator changes, release deletion, and disabling secret or code scanning.
