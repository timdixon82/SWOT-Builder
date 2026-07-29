# Brief: 034-root-file-structure

## Summary

Tim reports that the live site (https://projects.timdixon.net/SWOT-Builder/) serves all resource files (JSX, CSS, JS, theme script) flat from the site root rather than organised into folders, and wants this fixed. Investigation confirms the live site matches the repository exactly: `theme.js`, `colors_and_type.css`, `swot-styles.css`, `swot-engine-core.js`, and all five `.jsx` files sit at repository root, deployed as-is (ADR 0006: deploy by copying files, no build step).

This flat layout is the recorded architecture, not an accident: ADR 0001 (static browser app, no server), ADR 0002 (Babel Standalone in-browser compile), ADR 0003 (global `window` wiring, no ES modules for the app scripts), and ADR 0006 (static hosting, no build/deploy pipeline) together produced a deliberately flat, relative-path file layout so the app can be deployed by a plain file copy and so Babel Standalone can fetch `.jsx` sources via same-origin XHR (see the CSP `connect-src 'self'` comment in `index.html`).

Preamble fields (optional; used by the status dashboard):

- Status: `blocked`
- Branch: none
- Mockup mode: (n/a — not a UI change)
- Priority: (not yet assigned)
- Blockers: Awaiting Tim's decision (Q-SWOT1) on whether to proceed given the ADR conflict, before any specialist is dispatched to build.

## Requirements

None written yet. If Tim confirms he wants the reorganisation, Jacob assesses feasibility and produces the folder plan (this doubles as the architecture record); Sean then builds against Jacob's plan.

## Routing plan

Jacob (architecture assessment and folder plan, only once Tim confirms) -> Sean (move files, update all references) -> Carol (functional + accessibility regression pass, since a bad path silently blanks the app per ADR 0001's known failure mode) -> Sonja (review, merge gate, Tim's approval).

## Out of scope

- Changing the no-build, no-server, static-hosting architecture itself (ADR 0001, ADR 0002, ADR 0006 stay in force).
- Converting the app scripts to ES modules (ADR 0003 stays in force unless separately revisited).
- Any visual or functional change to the SWOT Builder app itself.
- Changing the CDN-hosted dependencies (React, Babel, html2canvas) or their Subresource Integrity hashes.

## Risk and rollback

Risk: Moving files into folders changes every relative path referenced in `index.html`, the Content Security Policy meta tag, and the JSX files' own cross-references; a missed path silently blanks the app (React never mounts) with no visible error for a screen-reader user.

Rollback: The change lands on a branch behind a pull request; if Carol's regression pass or Tim's review finds a broken path, do not merge, and the live site (deployed from `main`) is unaffected until merge.

## Definition of done

- [ ] Jacob's folder plan is recorded in the project wiki (`docs/decisions/`) and does not contradict ADR 0001, 0002, 0003, or 0006 without Tim's explicit sign-off on a superseding decision.
- [ ] All resource files referenced in `index.html` resolve correctly from the new paths, on both a root deploy and a sub-path deploy (matching `https://projects.timdixon.net/SWOT-Builder/`).
- [ ] The Content Security Policy meta tag in `index.html` still matches the actual resource origins after the move.
- [ ] Carol confirms the app loads and functions (interview flow, board, export/download, theme) with no console errors, and accessibility checks still pass.
- [ ] The README file tree (`README.md`, lines around 95) is updated to match the new structure.
- [ ] `docs/decisions/adr-0006-static-hosting-no-build-deploy.md` (and any other affected ADR) is annotated or superseded to reflect the new layout.

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
