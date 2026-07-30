# Brief: 035-carol-a11y-followups

## Summary

Two pre-existing accessibility defects surfaced while Carol tested work folder 034 (the deploy fix): (1) Pa11y WCAG 2.2 AAA reports an unresolvable ("NaN:1") contrast ratio on the intro screen's small quadrant-preview swatches (`.mini-cell.s/.w/.o/.t` in `swot-intro.jsx` / `swot-styles.css`), and (2) five form fields on the interview tweak-review panel (`tweaks-panel.jsx`) lack an `id` or `name` attribute, flagged by Chrome's native accessibility checker. Neither is caused by the deploy fix; both simply hadn't been checkable against a working, fully-rendered build since the site broke on 23 July.

Preamble fields (optional; used by the status dashboard):

- Status: `done`
- Branch: main (merged)
- Mockup mode: D (no UI redesign — these are accessibility conformance fixes to existing markup, not a visual change Tim needs to see mocked up first)
- Priority: 2
- Blockers: None

## Requirements

No new requirements from Tad — these are conformance fixes against WCAG 2.2 AAA (contrast, Success Criterion 1.4.6/1.4.11 as applicable) and against basic form-labelling practice (each input needs a programmatic name, WCAG 4.1.2). The project's own `docs/accessibility.md` sets the AAA bar; `docs/coding-standards.md` sets the general forms/markup rules.

## Routing plan

Sonja dispatched contrast-master to read `swot-intro.jsx` / `swot-styles.css` and diagnose why Pa11y can't resolve a contrast ratio for `.mini-cell.s/.w/.o/.t`, and forms-specialist to read `tweaks-panel.jsx` and specify the correct `id`/`name`/label wiring for the five affected fields. Both ran in parallel — different files, no shared state. Both complete; findings recorded in log.md. Next: Sean implements both fixes on one branch -> Simon signs off on the new dark-mode swatch colours (contrast-master's fix changes their visual appearance) -> Carol re-tests (functional + accessibility passes, in parallel; accessibility pass to include dark mode explicitly forced) -> Sonja reviews and brings the merge to Tim.

## Out of scope

- Any change to the deploy pipeline (already fixed in work folder 034).
- Any other accessibility finding not in Carol's two flagged items — a new full audit is not in scope here.
- Any visual redesign beyond what's needed to fix the contrast ratio (e.g. no swatch redesign, just enough colour/token change to clear AAA and make the ratio resolvable).

## Risk and rollback

Risk: A contrast fix to the quadrant swatches could clash with the existing brand palette or the Bold/Classic/Executive/Pills board style variants if not checked against all of them.

Rollback: The change lands on a branch behind a pull request; if Carol's or Simon's review finds a clash, do not merge, and the current (already-live, functioning) site is unaffected.

## Definition of done

- [x] contrast-master's diagnosis for the `.mini-cell` swatches is implemented, and Pa11y WCAG2AAA no longer reports a "NaN:1" or failing ratio for any of `.mini-cell.s/.w/.o/.t`. Confirmed for light and dark theme; contrast-master's own diagnosis established `.mini-cell` is defined once and unaffected by the Classic/Executive/Bold/Pills board-style selectors, so no per-variant check was needed.
- [x] forms-specialist's fix for the five tweak-panel fields is implemented: every field has a proper, collision-safe `id` and an `aria-label` (matching this codebase's existing labelling convention, used in place of literal `<label>` elements elsewhere too).
- [x] Carol's functional pass confirms the interview flow and tweak panel still work exactly as before (no regression from the labelling change), including the number field's drag-to-scrub interaction.
- [x] Carol's accessibility pass (axe-core, Pa11y WCAG2AAA) is clean on both fixed areas, including a specific re-test for the duplicate-id defect found and fixed during rework.
- [x] The two TASK items from work folder 034 (`from:carol-034-root-file-structure`, contrast and form-field items) are resolved by this work.

Note: Carol found during testing that the five fixed tweak-panel fields are not currently reachable in the shipped app (only `TweakRadio` is used in the live interview flow; this component library only opens via an external design-tool integration). The fixes are still correct and worth having, but they don't restore something visibly broken today — logged as a separate low-priority follow-up task, not a blocker to this work.

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
