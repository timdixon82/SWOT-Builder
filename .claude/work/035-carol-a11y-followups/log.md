# Log: 035-carol-a11y-followups

## [2026-07-30] Intake | Opened to close out Carol's 034 accessibility follow-ups

Tim asked to close out the two accessibility findings Carol surfaced while testing the deploy fix in work folder 034: contrast on the intro screen's quadrant preview swatches, and missing id/name on five tweak-panel form fields. Opened this folder rather than reopening 034, since 034 is done and scoped narrowly to the deploy pipeline. Dispatching contrast-master and forms-specialist in parallel (different files, no shared state) to diagnose before Sean implements.

## [2026-07-30] Diagnosis | forms-specialist, complete

forms-specialist read `tweaks-panel.jsx` in full and confirmed all 5 fields Carol flagged: `TweakSlider` (range, ~line 252), `TweakSelect` (select, ~line 344), `TweakText` (text, ~line 358), `TweakNumber` (number, ~line 391), `TweakColor`'s no-options fallback (color, ~line 430). None has an `id`/`name`/`aria-label`; the visible "label" is always a plain `<span>` with no programmatic association.

Fix (consistent across all five, matching the existing `aria-label` convention already used in `swot-interview.jsx`/`swot-app.jsx` per `docs/accessibility.md` H-05/H-06/M-06): add a per-instance `id` (slugified from the `label` prop, overridable via a new optional `id` prop) plus `aria-label={label}` on each input/select. A slugify helper needs adding to the file. Flagged as important: these components are reusable and can render multiple instances per panel, so a hardcoded id would create duplicate-id violations — the id must be derived per-instance. `TweakNumber`'s visible label span should also get `aria-hidden="true"` once the `aria-label` carries the same text, to avoid double-announcement (mirrors the existing role="img" fix on the logo in swot-app.jsx).

Specialist recommends Simon confirm the aria-label wording matches visible labels, and Carol re-run Chrome's accessibility checker after the fix. Full per-field before/after code is in the specialist's report, ready to hand to Sean.

## [2026-07-30] Diagnosis | contrast-master, complete — real defect, not just a tooling artifact

contrast-master traced the NaN:1 to `.mini-cell.s/w/o/t` (swot-intro.jsx quadrant preview) using `rgba()` background tokens in dark theme (`swot-styles.css` lines 22-35); Pa11y's HTML_CodeSniffer engine can't resolve alpha-blended backgrounds to a ratio at all. Composited by hand against the real dark-mode ancestor background (`--neutral-bg: #1a3050`) and found this is a genuine AAA failure, not just a reporting gap: Strengths 7.03:1 (passes, no margin), Weaknesses 5.17:1 (fails), Opportunities 5.35:1 (fails), Threats 5.80:1 (fails) — all against the 7:1 threshold, since the swatch text is 11px bold (below the AAA large-text exemption). Light theme's flat hex backgrounds all pass comfortably (7.76-8.46:1); no change needed there. Confirmed no per-board-style-variant complication — `.mini-cell` is defined once and unaffected by the Classic/Executive/Bold/Pills selectors.

Recommended fix: add four new dark-theme-only, flat (non-alpha) `.mini-cell.s/w/o/t` background overrides in `swot-styles.css` (specific hex values provided, e.g. `#14301F` for Strengths), leaving the shared `--s-bg` etc. tokens and existing `--*-fg` colours untouched since those tokens are reused elsewhere (quadrant gradients, bucket-pick buttons, Bold-variant text). New ratios: 8.84-10.16:1 across all four, well clear of 7:1. No change to swot-intro.jsx.

Flagged: the darker, opaque dark-mode swatches will look visually different from today's translucent tint (an unavoidable consequence of reaching 7:1 with alpha-blended low-contrast tints) — contrast-master recommends Simon sign off on the new colours before merge, and Carol re-test with dark mode explicitly forced (the earlier default-only Pa11y run missed this because default/light passes).

Added Simon to the routing plan (brief.md) for a quick sign-off on the new dark-mode swatch colours before this goes to Carol/merge.

## [2026-07-30] Implementation | Sean, complete

Implemented both fixes exactly as specified by contrast-master and forms-specialist, on branch `fix/035-a11y-followups-contrast-and-form-labels`.

Fix 1 (`swot-styles.css`): added the four dark-theme-only `.mini-cell.s/w/o/t` background overrides after the existing base rule block. Recomputed contrast by hand against the confirmed dark-theme `-fg` tokens (`#86efac`, `#fca5a5`, `#63D2FF`, `#ffb066` — match the diagnosis) and got S 10.16:1, W 9.15:1, O 9.17:1, T 9.12:1, all comfortably above 7:1 and consistent with contrast-master's numbers (off by ~0.01-0.3 due to rounding in manual composite math, not a discrepancy).

Fix 2 (`tweaks-panel.jsx`): added a `slugify` helper (none existed) and wired `id`/`aria-label` into all five flagged fields (`TweakSlider`, `TweakSelect`, `TweakText`, `TweakNumber`, `TweakColor`'s no-options fallback), each defaulting the id to a slug of the `label` prop with an optional `id` prop override. `TweakNumber`'s visible label and unit spans got `aria-hidden="true"` to avoid double-announcement, per forms-specialist's note.

`npm test` (31 tests, `tests/swot-engine-core.test.js`) passes; that suite covers pure engine logic only, no component rendering, so it doesn't exercise either change — noted in the PR per the test-discipline carve-out (no test harness for component-level rendering in this project). `npm run lint:css` clean. `npm run lint:js` shows the same 6 pre-existing warnings as before the change (confirmed via `git stash`), none introduced by this work.

Ran the accessibility regression suite (global `docs/patterns/accessibility-regression-suite.md`) manually — no `scripts/accessibility-regression.sh` runner is present in this project yet. S-05 (category colour missed in a scheme revision) is the directly relevant entry: confirmed all four dark-mode swatch colours were updated, not just some, and the two mid-line `--*-fg`/`--*-bg` shared tokens were deliberately left untouched per the brief. S-04, S-10, S-11, S-12 not applicable — no opacity-based colours, focus rings, input borders, or modals were touched by this change.

Opened PR, flagged Simon's sign-off on the new dark-mode swatch colours per the routing plan. Returning to Sonja.

## [2026-07-30] Dispatch | Simon, sign-off on dark-mode swatch colours

Dispatched Simon for a narrow sign-off on the four new dark-theme `.mini-cell` colours against `docs/brand.md`, not a full design review. PR #56 is https://github.com/timdixon82/SWOT-Builder/pull/56.

## [2026-07-30] Design sign-off | Simon, approved

Simon checked the four new hex values against `docs/brand.md` and approved with no changes. Reasoning: the new opaque colours sit in the same low-lightness register as the dark theme's `--neutral-bg`, read as a coherent family (darkened/desaturated per-quadrant hue, not a new palette), and are more consistent with the brand's "flat, no gradients/textures" design style than the translucent tint they replace. These are the project's own status-colour system, not the three core brand accent colours, so no accent-pairing or accent-as-small-text rule applies. Did not re-derive contrast ratios (that's contrast-master's and Sean's job, already confirmed). Design pass clear; proceeding to Carol.

## [2026-07-30] Dispatch | Carol, testing PR #56

Dispatched Carol for: dark-mode-specific Pa11y re-run on the intro screen (the gap that let the original defect through), accessibility-tree inspection of the five tweak-panel fields for unique ids and accessible names, functional regression on the tweak panel (including the number field's drag-to-scrub interaction, since aria-hidden was added near it), and a general axe-core pass.

## [2026-07-30] Test | Carol, PR #56 — contrast passes, form-labelling fix has a real gap, rework needed

**Contrast (item 1): pass, clean.** Carol force-set dark theme and ran Pa11y WCAG2AAA against the rendered intro screen: 0 issues on the fix branch (both themes). Sanity-checked her own methodology by running the identical harness against pre-fix `main`, which reproduced all 4 original NaN:1 failures — confirms the test actually catches the defect, not a false negative.

**Scope correction: the five fixed tweak-panel fields are not reachable in the live app.** Carol traced `tweaks-panel.jsx`'s usage and found `AppTweaksPanel` (the only place it's mounted, `swot-app.jsx` line 637) uses exclusively `TweakRadio`, and the whole `TweaksPanel` shell only opens via an external `postMessage` from a design-tool host — there's no in-app button and it isn't part of the interview flow. The "tweak-review panel" phrase in the original dispatch brief was a misreading of unrelated, already-labelled interview-flow fields. Carol tested the five components directly via a standalone harness instead.

**Form labelling (item 2): defect found, not ready to merge.** Single-instance labelling (unique id + aria-label) works correctly for all five field types. But the duplicate-id risk that forms-specialist explicitly flagged in the original diagnosis — `id = id || slugify(label)` only deduplicates when a caller passes an explicit `id` — is still live in the shipped fix. Carol reproduced it concretely: two same-labelled instances of the same field type (e.g. two `TweakColor` calls both labelled "Accent color") get an identical computed id; axe-core flags this as `duplicate-id-active` (serious impact), and Playwright's strict-mode selector resolution throws. Same construction is shared across all five components, so the risk is general, not isolated to one field type.

General axe-core pass (intro screen + first interview question): 0 violations, no other regression.

**Verdict: not signed off. Rework needed on Fix 2 before merge.** Carol recommends either an auto-disambiguating id fallback (append an instance counter on collision) or an enforced-unique-id contract with a dev-time warning. Routing back to Sean.

Logged as a low-priority follow-up (not a blocker): the five components are currently dead code in the shipped app, worth deciding whether to wire them in, remove them, or document them as library-only.

## [2026-07-30] Rework | Sean dispatched, duplicate-id fix, same branch/PR

Dispatched Sean back to the same branch (fix/035-a11y-followups-contrast-and-form-labels) and PR #56 to replace the `id || slugify(label)` fallback with collision-safe id generation, stable across re-renders, across all five affected components. Not opening a new PR.

## [2026-07-30] Rework | Sean, complete — duplicate-id defect fixed on PR #56

Fixed the duplicate-id gap Carol found in the form-labelling fix, on the same branch (`fix/035-a11y-followups-contrast-and-form-labels`), same PR #56.

Root cause: `id = id || slugify(label)` only dedupes when a caller passes an explicit `id`; two same-typed, same-labelled instances got identical computed ids. Added a `useTweakId` hook in `tweaks-panel.jsx`: a module-level id registry appends a numeric suffix on collision, computed once per instance via a ref (not recomputed on every render, so the id is stable across re-renders), with an explicit `id` prop still winning unchanged. Logs a `console.warn` when a collision is auto-resolved. Applied identically to all five affected components (`TweakSlider`, `TweakSelect`, `TweakText`, `TweakNumber`, `TweakColor`'s no-options fallback) — the shared construction Carol flagged.

Also fixed a latent rules-of-hooks issue while implementing: `TweakColor`'s original structure called the id logic inside its early-return branch; moved the `useTweakId` call to run unconditionally at the top of the component so hook call order can't vary across renders.

Verification: `npm test` (31 tests) and `npm run lint` (html/css/js) pass, same 6 pre-existing JS lint warnings as before, none new. No component-rendering test harness exists in this project, so verified manually with a standalone Playwright + axe-core harness: two `TweakColor` instances both labelled "Accent color" got distinct ids (`accent-color`, `accent-color-2`), ids stayed stable across two forced re-renders, the collision warning fired exactly once (not once per render), and axe-core reported 0 `duplicate-id-active` violations for the scenario.

Pushed to PR #56, commented with the fix summary and verification results. Not merged.

Note: a hook-noise stash on `main` from a prior branch-switch conflict (`wip log.md hook noise before branch switch`) has been dropped — its content was just append-only timestamp lines, already reconciled by hand.
- [2026-07-30 16:36:52] subagent completed
- [2026-07-30 16:36:59] subagent completed
- [2026-07-30 16:37:24] subagent completed
- [2026-07-30 16:37:31] subagent completed
- [2026-07-30 16:37:31] subagent completed
- [2026-07-30 16:37:55] subagent completed
- [2026-07-30 16:39:27] subagent completed
- [2026-07-30 16:40:00] subagent completed
- [2026-07-30 16:41:01] subagent completed
- [2026-07-30 16:41:12] subagent completed
- [2026-07-30 16:42:46] subagent completed
- [2026-07-30 16:43:18] subagent completed
- [2026-07-30 16:43:50] subagent completed
- [2026-07-30 16:44:22] subagent completed
- [2026-07-30 16:45:58] subagent completed
- [2026-07-30 16:46:29] subagent completed
- [2026-07-30 16:46:30] subagent completed
- [2026-07-30 16:48:14] subagent completed
- [2026-07-30 16:49:53] subagent completed
- [2026-07-30 16:50:25] subagent completed
- [2026-07-30 16:50:57] subagent completed
- [2026-07-30 16:51:29] subagent completed
- [2026-07-30 16:52:02] subagent completed
- [2026-07-30 16:52:34] subagent completed
- [2026-07-30 16:53:05] subagent completed
- [2026-07-30 16:53:38] subagent completed
- [2026-07-30 16:54:10] subagent completed
- [2026-07-30 16:54:42] subagent completed
- [2026-07-30 16:55:16] subagent completed
- [2026-07-30 16:55:48] subagent completed
- [2026-07-30 16:56:21] subagent completed
- [2026-07-30 16:56:54] subagent completed
- [2026-07-30 16:57:26] subagent completed
- [2026-07-30 16:57:58] subagent completed
- [2026-07-30 16:58:32] subagent completed
- [2026-07-30 16:59:04] subagent completed
- [2026-07-30 16:59:37] subagent completed
- [2026-07-30 17:00:09] subagent completed
- [2026-07-30 17:00:41] subagent completed
- [2026-07-30 17:00:52] subagent completed

## [2026-07-30] Dispatch | Carol, re-testing rework on PR #56

Dispatched Carol to independently re-verify Sean's duplicate-id fix (not trust his report), including re-running everything from her original test report that wasn't superseded.

## [2026-07-30] Test | Carol, PR #56 rework — pass, signed off for merge gate

Reproduced the exact duplicate-id scenario from scratch (two `TweakColor` instances labelled "Accent color", plus two `TweakSlider` instances labelled "Spacing" for breadth): computed ids now correctly disambiguate (`accent-color`/`accent-color-2`, `spacing`/`spacing-2`), 0 `duplicate-id-active` violations (was 1 serious). Confirmed ids stay stable across two forced re-renders and the collision warning fires exactly once per pair, not once per render. Confirmed the `TweakColor` rules-of-hooks fix didn't break either the native-input or chip-picker path. Re-ran dark/light Pa11y (0 issues both), single-instance id/aria-label correctness (all five fields), full functional regression (including drag-to-scrub), and a general axe-core pass. `npm test` (31/31) and lint clean, no new warnings.

One pre-existing, unrelated finding: a moderate axe-core "region" violation (page content not contained by landmarks) on the first interview question screen — confirmed present on `main` too, so not a regression from this PR. Logged as a low-priority follow-up task, not a blocker.

Noted for the team: Carol hit a false failure mid-test when the shared working tree was switched to `main` by a concurrent merge (PR #57), and resolved it by moving to an isolated git worktree. Worth remembering when multiple work folders are active in the same session.

**Verdict: PASS. Signed off PR #56 for the merge gate.** Both fixes (contrast and form labelling, including the rework) are complete and verified independently.

## [2026-07-30] Merge | Tim approved, PR #56 merged

Tim approved the merge. The PR branch had drifted from main's work-folder housekeeping commits (the branch carried its own older log.md/brief.md snapshots from when Sean opened and reworked it), so GitHub reported a conflict on those two files. Resolved locally: merged the branch into main, kept main's log.md/brief.md (a strict superset of the branch's copy — confirmed by diff before resolving), and took the branch's actual code changes (`swot-styles.css`, `tweaks-panel.jsx`) as-is. Verified `npm test` still passes (31/31) post-merge, then pushed to main; GitHub auto-detected the branch's commits were now in main's history and marked PR #56 merged. Status set to done.

This is the same class of issue as work folder 034's merge — a specialist's own housekeeping commit on a long-lived feature branch outpaces main's. Worth a process note: specialists committing to their own branch's copy of `brief.md`/`log.md` (rather than leaving those files untouched on the branch and letting Sonja's main-only housekeeping be the sole source of truth) is what causes this. Not fixed here; flagging for later consideration alongside the template-sync process gap.
