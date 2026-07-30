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
