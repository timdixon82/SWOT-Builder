# Brief: 034-root-file-structure

## Summary

Tim reported that the live site (https://projects.timdixon.net/SWOT-Builder/) looked wrong and guessed it was because resource files sit flat at the site root. Investigation found the flat root layout is correct and intentional (ADR 0001, 0002, 0003, 0006) — but the live site is genuinely broken: `theme.js`, `colors_and_type.css`, `swot-styles.css`, `swot-engine-core.js`, `models.json`, and all five `.jsx` files 404 on the live host, so React never mounts (blank/non-functional page).

Root cause found: `.github/workflows/deploy.yml` uses a fail-safe rsync ALLOW-list to build the GitHub Pages artifact. PR #41 (16 Jul 2026) correctly customised that list to SWOT Builder's real root-level file layout. Commit `4c8eede` ("chore: sync template to v1.9.2", 23 Jul 2026) overwrote deploy.yml with the generic template ALLOW-list (`styles/`, `scripts/`, `data/`, `assets/`), silently dropping every one of SWOT Builder's root-level includes. Since then, only `index.html` and `assets/**` (e.g. `assets/analytics/count.js`) have actually deployed; every other runtime file 404s on the live site.

This is a deploy-configuration regression, not an architecture problem. No ADR needs to change; the fix restores the project-specific customisation that a template sync clobbered.

Preamble fields (optional; used by the status dashboard):

- Status: `active`
- Branch: `fix/deploy-allowlist-034` (Sean to create)
- Mockup mode: (n/a — not a UI change)
- Priority: 1 (live site is broken)
- Blockers: None

## Requirements

None needed from Tad — this is a configuration restoration with a known-correct prior state (the PR #41 include list), verified against the current root file listing.

## Routing plan

Sean (restore/extend the rsync ALLOW-list in `deploy.yml` to cover every current root-level runtime file) -> Carol (confirm the deployed artifact — or a local rsync dry run — includes every referenced file, and do a functional + accessibility pass once deployed) -> Sonja (review, merge gate, Tim's approval).

## Out of scope

- Any change to the flat, root-level file layout itself (ADR 0001, 0002, 0003, 0006 stand; the earlier idea of moving files into folders is dropped now the real cause is known).
- Any visual or functional change to the SWOT Builder app itself.
- Changing the CDN-hosted dependencies (React, Babel, html2canvas) or their Subresource Integrity hashes.
- Fixing the template sync process itself so it cannot clobber a project's customised deploy.yml again — that is a separate, global process question for a team-root session, noted to Tim separately.

## Risk and rollback

Risk: An incomplete ALLOW-list still omits a file the app needs, leaving some part of the live site broken after the fix.

Rollback: The change lands on a branch behind a pull request; Carol verifies the artifact contents before merge, and the current live site (already broken) is not made worse by leaving the branch unmerged if a problem is found.

## Definition of done

- [ ] `deploy.yml`'s rsync ALLOW-list includes every root-level runtime file: `index.html`, `theme.js`, `colors_and_type.css`, `swot-styles.css`, `swot-engine-core.js`, `swot-app.jsx`, `swot-board.jsx`, `swot-engine.jsx`, `swot-interview.jsx`, `swot-intro.jsx`, `tweaks-panel.jsx`, `models.json`, plus `fonts/***` and `assets/***`.
- [ ] A local dry run (or the workflow's own run log) confirms every one of those files lands in the `_site` artifact.
- [ ] Carol confirms the app loads and functions (interview flow, board, export/download, theme) on the live URL with no console errors, and accessibility checks still pass.
- [ ] The customisation comment in `deploy.yml` is preserved so a future template sync is less likely to silently drop it again (or a stronger safeguard is proposed to Tim).

## Approved GitHub actions

- [x] Create a branch
- [x] Commit to a branch
- [x] Push a branch other than the main branch
- [x] Open a pull request
- [x] Comment on a pull request or an issue
- [x] Create an issue

## Not pre-approved

These always pause for Tim, whatever is ticked above:

- Merging to the main branch. This always needs Tim's express approval at the time.
- Publishing to a blog or a social media account.

## Never allowed

The hard deny-list from `CLAUDE.md`. These are refused outright, whatever a brief says: force-push, branch deletion, history rewrite, repository deletion, repository visibility change, branch-protection edits, collaborator changes, release deletion, and disabling secret or code scanning.
