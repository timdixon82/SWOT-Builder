# PR 11 Review — Phase 2 Group 3 Accessibility Fixes

Reviewer: Carol
PR: https://github.com/timdixon82/SWOT-Builder/pull/11
Branch: feat/phase2-group3 (commit 6e61f9a)
Base: main (commit adba174)
Date: 2026-05-28

---

## Finding-by-finding verdict

### H-01 — AI badge ARIA pattern

File: `/Users/timdixon/Code/Github/SWOT-Builder/swot-app.jsx`

Checks:

- Dropdown container has `role="menu"` — **confirmed** (line 322).
- Model buttons have `role="menuitem"` — **confirmed** (line 338).
- Trigger button has `aria-haspopup="menu"` — **confirmed** (line 283).
- "Continue without AI" button has `role="menuitem"` — **confirmed** (line 362).
- Visually-hidden `<span id="ai-badge-desc">` exists with ready-state description — **confirmed** (lines 297–303).
- Trigger button has `aria-describedby="ai-badge-desc"` when status is 'ready' — **confirmed** (line 284).
- Visually-hidden span uses the standard clip pattern (position:absolute, width:1, height:1, overflow:hidden, clip:rect, whiteSpace:nowrap, borderWidth:0) — **confirmed** (lines 298–300). Note: the implementation uses `borderWidth:0` rather than the full `clip:rect(0,0,0,0)` written out — the clip property is present as `clip:"rect(0,0,0,0)"` and the pattern is complete.

**Gap noted — stale selector in AIUnavailableNudge**: Line 550 of `swot-app.jsx` reads:

```javascript
onLoadModel={() => document.querySelector('[aria-haspopup="listbox"]')?.click()}
```

Now that H-01 changed `aria-haspopup` from `"listbox"` to `"menu"`, this selector no longer finds the trigger button. The `?.click()` optional chain means it fails silently: clicking "Load AI model" in the nudge banner does nothing. This is a functional regression introduced by the H-01 fix. The selector must be updated to `[aria-haspopup="menu"]`.

**Verdict: Gap noted — functional regression on line 550 blocks this finding from fully passing.**

---

### H-02 — Tweaks panel contrast

File: `/Users/timdixon/Code/Github/SWOT-Builder/tweaks-panel.jsx`, `__TWEAKS_STYLE`

All four classes now use solid hex values, replacing the original semi-transparent rgba colours. Contrast is calculated against the panel background `#faf9f7` (relative luminance ≈ 0.972).

Threshold for 7:1 AAA: fg luminance must be ≤ (0.972 + 0.05) / 7 − 0.05 = 0.096.

- `.twk-sect` — `color: #5a5854` (line 81). Calculated luminance: 0.0979. **Above 0.096 threshold.** Contrast: (0.972 + 0.05) / (0.0979 + 0.05) = 1.022 / 0.1479 = **6.91:1**. This is below the 7:1 AAA requirement.
- `.twk-val` — `color: #5a5854` (line 78). Same calculation: **6.91:1**. Below 7:1 AAA.
- `.twk-x` — `color: #5a5854` (line 61). Same calculation: **6.91:1**. Below 7:1 AAA.
- `.twk-lbl` — `color: #4d4b45` (line 76). Calculated luminance: 0.0703. Contrast: 1.022 / 0.1203 = **8.50:1**. Passes AAA.

The fix correctly replaced semi-transparent rgba values with solid hex values and eliminated the contrast guessing problem. However, `#5a5854` measures at approximately 6.91:1 rather than the required 7:1. The value is very close — a single step darker (for example `#585652` or `#56544f`) would clear 7:1. As it stands, the three classes using `#5a5854` fall fractionally short.

**Verdict: Gap noted — three classes use #5a5854 which measures ~6.91:1, just below the 7:1 AAA threshold.**

---

### H-03 — Executive style Strengths letter

File: `/Users/timdixon/Code/Github/SWOT-Builder/swot-styles.css`

Checks:

- `.swot-grid.style-exec .quadrant.s .quadrant-head .qletter` rule is present at line 954: `color: #ffffff; border-color: #ffffff` — **confirmed**.
- Previous value `var(--s-edge)` (#15803d on navy #061528 = ~5.55:1) is gone — **confirmed**.
- #ffffff on --navy (#061528) gives approximately 18.33:1 — **confirmed**.

**Verdict: Verified correct.**

---

### H-07 — Command symbol

File: `/Users/timdixon/Code/Github/SWOT-Builder/swot-interview.jsx`

Line 291 reads: `Cmd/Ctrl + Enter to submit`

No Unicode command character (U+2318) present. Plain ASCII text used throughout. **Confirmed.**

**Verdict: Verified correct.**

---

### M-02 — Tweaks panel drag removed

File: `/Users/timdixon/Code/Github/SWOT-Builder/tweaks-panel.jsx`

Checks:

- `onDragStart` function — **absent**. No occurrence in file.
- `dragRef`, `offsetRef`, `clampToViewport` — **absent**. No occurrence in file.
- `onMouseDown={onDragStart}` on header div — **absent**. No occurrence in file.
- `cursor:move` in `.twk-hd` — **absent**. `.twk-hd` CSS (lines 58–59) contains only `display`, `align-items`, `justify-content`, and `padding`. No cursor property.
- Panel has fixed position in CSS — **confirmed**. `.twk-panel` has `position:fixed; top:1rem; right:1rem` (line 50). No dynamic JS positioning.
- `.twk-hd` `user-select:none` — **absent** from `.twk-hd`. Two remaining `user-select:none` occurrences are on `.twk-seg` (line 101, for the drag-to-select radio control — appropriate) and `.twk-num-lbl` (line 121, for the scrub label — appropriate). Neither is on `.twk-hd`.

The panel opens and closes via the `__activate_edit_mode` / `__deactivate_edit_mode` message protocol, and the close button calls `dismiss()`. There is no drag mechanism remaining.

**Verdict: Verified correct.**

---

### M-03 — Confidence label font size

File: `/Users/timdixon/Code/Github/SWOT-Builder/swot-styles.css`

Line 864: `.conf-dots-label { font-size: var(--text-xs); ... }` — **confirmed**. No `font-size: 10px` present on this class.

**Verdict: Verified correct.**

---

### M-06 — Scope select and title input aria-describedby

File: `/Users/timdixon/Code/Github/SWOT-Builder/swot-intro.jsx`

Checks:

- Scope `<select>` has `aria-describedby="scope-hint"` — **confirmed** (line 79).
- Scope field-hint paragraph has `id="scope-hint"` — **confirmed** (line 85). Text: "Helps me tailor the questions." Non-empty.
- Title `<input>` has `aria-describedby="title-hint"` — **confirmed** (line 95).
- Target with `id="title-hint"` exists and is not empty — **confirmed** (line 89). The label contains `<span id="title-hint" ...>(optional)</span>`. The span text "(optional)" is not empty.

Note: `id="title-hint"` is placed on a `<span>` inside the `<label>` element, not on a separate hint paragraph. This is a valid target for `aria-describedby`; the span is in the DOM and has text content. The association is correct.

**Verdict: Verified correct.**

---

### L-01 — Logo SVG aria-hidden

File: `/Users/timdixon/Code/Github/SWOT-Builder/swot-app.jsx`

Line 12: `<svg viewBox="0 0 64 64" ... aria-hidden="true">` — **confirmed**.
Line 11: `<div className="logo" aria-label="SWOT Builder">` — **confirmed**, `aria-label` retained.

**Verdict: Verified correct.**

---

### L-02 — Watermark aria-hidden

File: `/Users/timdixon/Code/Github/SWOT-Builder/swot-board.jsx`

Line 342: `<div className="swot-watermark" aria-hidden="true">` — **confirmed**.

**Verdict: Verified correct.**

---

### L-03 — Print heading

Files: `/Users/timdixon/Code/Github/SWOT-Builder/index.html`, `/Users/timdixon/Code/Github/SWOT-Builder/swot-styles.css`

Checks:

- `index.html` line 55: `<h1 class="print-only">SWOT Builder</h1>` before `<div id="root">` — **confirmed**.
- `swot-styles.css` line 1036: `.print-only { display: none; }` — **confirmed**. This is outside any media query, so it applies to screen.
- `swot-styles.css` line 1042 inside `@media print`: `.print-only { display: block; ... }` — **confirmed**.
- `@media print` block still hides `.app-header` (line 1041: `.app-header, .header-actions, ...{ display: none !important; }`) — **confirmed**.
- Screen layout: `.print-only` is `display:none` on screen, so no layout regression.

`tabindex` is not set on the print-only h1. This is correct: it is not a skip-link target and should not be focusable.

**Verdict: Verified correct.**

---

### L-04 — Language limitation documentation

File: `/Users/timdixon/Code/Github/SWOT-Builder/docs/exceptions/multi-language-limitation.md`

Checks:

- File exists at the required path — **confirmed**.
- Names WCAG 3.1.2 — **confirmed**. The file states "WCAG 3.1.2 Language of Parts (Level AA)".
- Explains the limitation — **confirmed**. The file explains that AI-generated and user-entered content is rendered without dynamic `lang` attribute management.
- States the acceptance rationale — **confirmed**. Single-page app with no server-side rendering; language of session not known at build time; engineering change is substantial.
- Describes the resolution path — **confirmed**. Three steps: language-detection library, wrapping non-English passages in `<span lang="xx">`, updating the exception record once tests confirm tagging.

**Verdict: Verified correct.**

---

## Regression check

### AIBadge — role="menu" and keyboard navigation

The AIBadge dropdown now uses `role="menu"` on the container and `role="menuitem"` on each button. The WAI-ARIA Authoring Practices for a menu widget specify that focus should be managed within the menu using arrow keys, with Home/End support, and focus should move into the menu when it opens.

The current implementation does not implement arrow-key navigation within the menu. The trigger opens the menu, but keyboard users must Tab through the menu items rather than using arrow keys. This is a conformance gap against the WAI-ARIA menu pattern, though not an outright WCAG 2.2 failure (the items are focusable and operable by keyboard).

Per the dispatch instructions, this gap is noted as a carry-forward and does not block the PR. The ARIA roles are present and correct; the missing keyboard behaviour is a progressive enhancement.

Separately, the stale `aria-haspopup="listbox"` selector on line 550 (noted under H-01) does block the PR because it is a functional regression: the "Load AI model" button in `AIUnavailableNudge` no longer works.

### TweaksPanel drag removal

The panel is openable (via `__activate_edit_mode` message) and closable (via the close button which posts `__edit_mode_dismissed`). No keyboard-only regression. The panel position is fixed via CSS at top:1rem, right:1rem.

### Print-only h1

The h1 is hidden on screen (`display:none`), visible only in print. No `tabindex` applied. It is not a skip-link target. No regression.

---

## Overall verdict

**Fail — two issues block merge.**

### Blocking items

1. **H-01 functional regression (swot-app.jsx line 550)**: `AIUnavailableNudge` queries `[aria-haspopup="listbox"]` which no longer matches the AIBadge trigger now that `aria-haspopup` is `"menu"`. The "Load AI model" button in the interview nudge banner silently does nothing. Must be updated to `[aria-haspopup="menu"]`.

2. **H-02 contrast shortfall (tweaks-panel.jsx)**: Three classes (`.twk-sect`, `.twk-val`, `.twk-x`) use `#5a5854`, which measures approximately 6.91:1 against the panel background `#faf9f7`. The 7:1 AAA threshold is not met. A slightly darker value is needed. `.twk-lbl` at `#4d4b45` (8.50:1) passes; only the three classes using `#5a5854` fail.

### Confirmed clean (9 of 11 findings verified correct)

- H-01: ARIA roles and describedby structure correct (blocked only by the line-550 regression)
- H-03: Executive Strengths letter now #ffffff on navy — 18.33:1 — correct
- H-07: Command symbol removed, plain ASCII text used
- M-02: Drag removed, no cursor:move, no user-select on header, fixed CSS position
- M-03: conf-dots-label uses var(--text-xs), not 10px
- M-06: aria-describedby wired for both scope select and title input
- L-01: SVG aria-hidden; parent div aria-label retained
- L-02: Watermark aria-hidden
- L-03: Print-only h1 in HTML, display:none on screen, display:block in print
- L-04: Exception file present, complete, and correctly addresses WCAG 3.1.2

---

## Merge gate summary

**Not ready to merge.**

Blocking:

| ID | File | Line | Issue |
|----|------|------|-------|
| H-01 regression | swot-app.jsx | 550 | Selector `[aria-haspopup="listbox"]` must change to `[aria-haspopup="menu"]` |
| H-02 contrast | tweaks-panel.jsx | 61, 78, 81 | `#5a5854` measures 6.91:1; needs to be darkened to reach 7:1 AAA |

Both fixes are small. Once Sean applies them, the PR can return for re-check of those two points.

---

## Rework verification — commit 6ecf9ff (2026-05-28)

Re-checker: Carol
Commit under review: 6ecf9ff on feat/phase2-group3

This section re-checks the two blocking items only. All other findings remain as recorded above.

### H-01 re-check — stale selector in AIUnavailableNudge

File: `/Users/timdixon/Code/Github/SWOT-Builder/swot-app.jsx`, line 550.

Evidence from source:

```
grep -n "aria-haspopup" swot-app.jsx
283:        aria-haspopup={canPick ? "menu" : undefined}
550:          onLoadModel={() => document.querySelector('[aria-haspopup="menu"]')?.click()}
```

Line 550 now reads `[aria-haspopup="menu"]`. The stale `"listbox"` value is gone.

Full repo scan for any remaining `aria-haspopup="listbox"` references: no results. No file in the repository contains `aria-haspopup="listbox"`.

**H-01 blocker: resolved.**

### H-02 re-check — contrast for .twk-sect, .twk-val, .twk-x

File: `/Users/timdixon/Code/Github/SWOT-Builder/tweaks-panel.jsx`, `__TWEAKS_STYLE`.

Evidence from source:

```
.twk-x{...color:#4d4b45;...}        (line 61)
.twk-val{color:#4d4b45;...}         (line 78)
.twk-sect{...color:#4d4b45;...}     (line 81)
.twk-lbl{...color:#4d4b45}          (line 76)
```

All four classes now use `#4d4b45`. The previous value `#5a5854` is gone from the file.

Contrast calculation for `#4d4b45` on `#faf9f7`:

- Background `#faf9f7` relative luminance: approximately 0.972 (as measured in the first review).
- Foreground `#4d4b45` relative luminance: 0.0703 (as calculated in the first review for `.twk-lbl`, which already used this value).
- Ratio: (0.972 + 0.05) / (0.0703 + 0.05) = 1.022 / 0.1203 = **8.50:1**.

8.50:1 clears the WCAG 2.2 AAA threshold of 7:1 for normal text.

`.twk-lbl` was already `#4d4b45` in the first review and already passed. All four classes are now uniform at `#4d4b45` and all pass at 8.50:1.

**H-02 blocker: resolved.**

### Updated overall verdict

**Pass.**

All 11 findings are now verified correct:

- H-01: ARIA roles, describedby structure, and AIUnavailableNudge selector — all correct.
- H-02: All four tweaks-panel text classes at `#4d4b45`, 8.50:1 against `#faf9f7` — passes AAA.
- H-03: Executive Strengths letter `#ffffff` on navy — 18.33:1 — correct.
- H-07: Command symbol removed, plain ASCII text used.
- M-02: Drag removed, no `cursor:move`, no `user-select` on header, fixed CSS position.
- M-03: `conf-dots-label` uses `var(--text-xs)`, not `10px`.
- M-06: `aria-describedby` wired for both scope select and title input.
- L-01: SVG `aria-hidden`; parent div `aria-label` retained.
- L-02: Watermark `aria-hidden`.
- L-03: Print-only h1 in HTML, `display:none` on screen, `display:block` in print.
- L-04: Exception file present, complete, and correctly addresses WCAG 3.1.2.

The carry-forward note about arrow-key navigation within the AIBadge menu (recorded in the regression check above) remains open as a progressive-enhancement item and does not block merge.

**Merge gate is clear. PR 11 is ready for Sonja to present to Tim for merge approval.**

---

## Second rework verification — commit c069454 (2026-05-29)

Re-checker: Carol
Commit under review: c069454 on feat/phase2-group3

This section re-checks two items only: ESLint warnings and AIBadge keyboard navigation. All 11 Group 3 findings remain verified correct from the previous rework check.

### Check 1 — ESLint warnings

Command run: `npm run lint` from repo root (`/Users/timdixon/Code/Github/SWOT-Builder`).

The lint pipeline runs three sub-commands in sequence:

- `npm run lint:html` — HTMLHint against `index.html`. Result: "Scanned 1 files, no errors found."
- `npm run lint:css` — Stylelint against `*.css`. Result: no output (clean exit).
- `npm run lint:js` — ESLint against `*.jsx` and `*.js`. Result: no output (clean exit).

Exit code: 0. No errors. No warnings.

**Lint verdict: Pass. 0 errors, 0 warnings.**

### Check 2 — AIBadge keyboard navigation (WAI-ARIA menu pattern)

File: `/Users/timdixon/Code/Github/SWOT-Builder/swot-app.jsx`

#### 2.1 triggerRef attached to trigger button

Line 222: `const triggerRef = useR_A(null);`
Line 285: `ref={triggerRef}` on the trigger `<button>`.

**Confirmed.**

#### 2.2 menuRef and onMenuKeyDown attached to the menu div

Line 223: `const menuRef = useR_A(null);`
Line 351: `ref={menuRef} onKeyDown={onMenuKeyDown}` on `<div role="menu" aria-label="Choose AI model">`.

**Confirmed.**

#### 2.3 useEffect focuses first menuitem when open becomes true

Lines 234–238:

```javascript
useE_A(() => {
  if (!open || !menuRef.current) return;
  const first = menuRef.current.querySelector('[role="menuitem"]');
  if (first) first.focus();
}, [open]);
```

When `open` is true and `menuRef.current` is populated, the effect queries the first `[role="menuitem"]` inside the menu ref and calls `.focus()` on it. This correctly implements "focus moves to first item on open" per the WAI-ARIA menu pattern.

**Confirmed.**

#### 2.4 onMenuKeyDown handles arrow keys and Escape

Lines 241–256:

```javascript
function onMenuKeyDown(e) {
  if (!menuRef.current) return;
  const items = Array.from(menuRef.current.querySelectorAll('[role="menuitem"]'));
  const idx = items.indexOf(document.activeElement);
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    items[(idx + 1) % items.length]?.focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    items[(idx - 1 + items.length) % items.length]?.focus();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    setOpen(false);
    triggerRef.current?.focus();
  }
}
```

- ArrowDown: `e.preventDefault()` called before moving focus; advances to `(idx + 1) % items.length` — wraps from last item to first. **Confirmed.**
- ArrowUp: `e.preventDefault()` called before moving focus; retreats to `(idx - 1 + items.length) % items.length` — wraps from first item to last. **Confirmed.**
- Escape: calls `setOpen(false)` and `triggerRef.current?.focus()`, returning focus to the trigger button. **Confirmed.**
- Both arrow keys call `e.preventDefault()` to prevent page scroll. **Confirmed.**

#### 2.5 JSX syntax correctness

The menu `<div>` opens at line 337 and closes at line 396. The outer wrapper `<div>` opens at line 283 and closes at line 398. All JSX tags in the AIBadge component (lines 220–399) are balanced. No unclosed tags or syntax anomalies present.

**Confirmed. No syntax errors.**

#### Keyboard navigation verdict: Pass

All five sub-checks confirmed. The WAI-ARIA menu keyboard pattern is correctly and completely implemented.

---

### Updated overall verdict

**Pass (final).**

All 11 Group 3 findings verified correct. ESLint reports 0 errors and 0 warnings. AIBadge keyboard navigation (WAI-ARIA menu pattern) is fully implemented and correct.

**Merge gate is clear. PR 11 is ready for Sonja to present to Tim for merge approval.**
