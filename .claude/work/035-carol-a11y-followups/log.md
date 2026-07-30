# Log: 035-carol-a11y-followups

## [2026-07-30] Intake | Opened to close out Carol's 034 accessibility follow-ups

Tim asked to close out the two accessibility findings Carol surfaced while testing the deploy fix in work folder 034: contrast on the intro screen's quadrant preview swatches, and missing id/name on five tweak-panel form fields. Opened this folder rather than reopening 034, since 034 is done and scoped narrowly to the deploy pipeline. Dispatching contrast-master and forms-specialist in parallel (different files, no shared state) to diagnose before Sean implements.

## [2026-07-30] Diagnosis | forms-specialist, complete

forms-specialist read `tweaks-panel.jsx` in full and confirmed all 5 fields Carol flagged: `TweakSlider` (range, ~line 252), `TweakSelect` (select, ~line 344), `TweakText` (text, ~line 358), `TweakNumber` (number, ~line 391), `TweakColor`'s no-options fallback (color, ~line 430). None has an `id`/`name`/`aria-label`; the visible "label" is always a plain `<span>` with no programmatic association.

Fix (consistent across all five, matching the existing `aria-label` convention already used in `swot-interview.jsx`/`swot-app.jsx` per `docs/accessibility.md` H-05/H-06/M-06): add a per-instance `id` (slugified from the `label` prop, overridable via a new optional `id` prop) plus `aria-label={label}` on each input/select. A slugify helper needs adding to the file. Flagged as important: these components are reusable and can render multiple instances per panel, so a hardcoded id would create duplicate-id violations — the id must be derived per-instance. `TweakNumber`'s visible label span should also get `aria-hidden="true"` once the `aria-label` carries the same text, to avoid double-announcement (mirrors the existing role="img" fix on the logo in swot-app.jsx).

Specialist recommends Simon confirm the aria-label wording matches visible labels, and Carol re-run Chrome's accessibility checker after the fix. Full per-field before/after code is in the specialist's report, ready to hand to Sean.
- [2026-07-30 16:36:52] subagent completed
- [2026-07-30 16:36:59] subagent completed
- [2026-07-30 16:37:24] subagent completed
- [2026-07-30 16:37:31] subagent completed
- [2026-07-30 16:37:31] subagent completed
