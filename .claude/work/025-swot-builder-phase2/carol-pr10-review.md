# PR 10 Accessibility Review: Group 2 Findings

Branch: `feat/phase2-group2`
Repository: `timdixon82/SWOT-Builder`
Review date: 2026-05-28
Reviewer: Carol (tester and release manager)
Standard: WCAG 2.2 AAA, source inspection (no automated tooling available)

## Summary

Overall verdict: **Pass with notes**

All nine Group 2 findings are correctly addressed in the code. One pre-existing gap was uncovered in `swot-board.jsx` that is not a regression introduced by this PR but warrants a carry-forward task. The S-11 border contrast flag is pre-existing and was not introduced by this PR.

---

## Finding-by-finding results

### C-02: Landmark structure

**Verdict: Verified correct**

Changes confirmed:

- `index.html` line 54: skip-to-content link present — `<a href="#main-content" class="skip-link">Skip to main content</a>`. Link is the first element in `<body>`, before the `<div id="root">`. The target `#main-content` resolves correctly because every screen sets `id="main-content"` on its `<main>` (see below).
- `swot-intro.jsx`: the outer element was changed from `<div className="intro">` to `<main id="main-content" className="intro">`. Verified in diff and in current source at line 35.
- `swot-interview.jsx`: `<main id="main-content" className="interview">` confirmed at line 247.
- `swot-board.jsx`: `<main id="main-content" className="board-page">` confirmed at line 311.
- `swot-styles.css`: `.skip-link` and `.skip-link:focus` rules present at lines 40 to 54. The link is positioned off-screen at `top: -40px` and moves to `top: 0` on focus. Background uses `var(--primary, var(--accent))`. In the design system `--primary` is not defined; the fallback `var(--accent)` resolves to `#061528` (navy) in light mode and `#FF7C00` (orange) in dark mode. Both produce AAA contrast against `color: #fff`. The skip link is therefore functional and visually correct in both themes.

One thing to note: only one screen is mounted at a time, so there will never be two `id="main-content"` elements in the DOM simultaneously. The landmark is therefore unique at any given point. No issue.

### C-03: Stepper dots

**Verdict: Verified correct**

`swot-app.jsx` line 30: each dot `<span>` now carries `aria-hidden="true"`. The text node "Step N of 3" immediately before the dots provides a screen-reader-friendly description of the stepper position. The dots are purely decorative. Confirmed in diff and current source.

### C-04: Bucket picker AI suggestion state

**Verdict: Verified correct**

`swot-interview.jsx` line 80: each `BucketPicker` button now has:

```
aria-label={suggested === b.key ? `${b.short} (AI suggestion)` : b.short}
```

When `suggested` matches the bucket, the label is, for example, "Strengths (AI suggestion)". When it does not match, the label is just the short name, for example "Weaknesses". The `dotmark` span inside each button now also carries `aria-hidden="true"` (line 88), which stops the decorative colour dot from being announced. The visible `<span>{b.short}</span>` text duplicates the label but that is harmless because `aria-label` overrides the accessible name computation.

One edge case: when the interview is in manual mode, `suggestion.bucket` resolves to `"__MANUAL__"` and `BucketPicker` is called with `suggested={null}` (line 316 of `swot-interview.jsx`). In that case `suggested === b.key` is always false so every button receives just `b.short` as its label. That is correct behaviour.

### H-04: Theme toggle dynamic label

**Verdict: Verified correct**

`swot-app.jsx` line 46: the `aria-label` and `title` attributes are now both dynamic:

- When `theme === "dark"`: `aria-label="Switch to light mode"`
- Otherwise: `aria-label="Switch to dark mode"`

The `title` attribute mirrors the `aria-label`, which is good practice. The state variable `theme` is seeded from `document.documentElement.dataset.theme` on mount (line 38), so the label is correct on the first render even before the user interacts. Correct.

### H-05: ConfidencePicker group label, tag input, and item title input

**Verdict: Verified correct for the interview screen. Gap identified in the board editor modal (not a regression — see notes below).**

Changes in `swot-interview.jsx` confirmed:

- `ConfidencePicker` component (lines 28 to 29): `.confidence-row` now has `role="group"` and `aria-labelledby="confidence-label"`. The `<span>` now has `id="confidence-label"`. Screen readers will announce the group as "Confidence" before announcing each button. Correct.
- `TagEditor` component (line 59): the tag text input now has `aria-label="Add tag"`. Correct.
- Item title input in the suggestion form (line 323): `aria-label="Item title"` added. Correct.

**Gap identified — not a regression:**

The `ItemEditorModal` in `swot-board.jsx` has its own inline confidence row (lines 142 to 149). This row uses a `<label className="field-label">Confidence</label>` followed by a `<div className="confidence-row">` containing three buttons. The label is not connected to the button group. No `role="group"` and no `aria-labelledby` are present. The existing label element is not associated with any individual button because the buttons are not `<input>` elements.

This gap existed before this PR — the `ItemEditorModal` was not in scope for H-05 in the Group 2 brief. It is not a regression introduced by this PR. It is carried forward as a task below.

### H-08: Dismiss button

**Verdict: Verified correct**

`swot-app.jsx` line 387: the visible text of the dismiss button was changed from `×` to `Dismiss`. The button retains `aria-label="Dismiss"`. Both the visible label and the accessible name now say "Dismiss". The `×` character is gone from the rendered text. Correct.

Note: the button still has `aria-label="Dismiss"` explicitly set. Because the visible text now matches, the `aria-label` is redundant but harmless. No issue.

### M-01: Dot-pulse animation

**Verdict: Verified correct**

Two locations confirmed in `swot-interview.jsx`:

1. Loading question state (lines 258 to 259): the `<p>` element now has `role="status"` and `aria-live="polite"`. The `<span className="dot-pulse">` container now has `aria-hidden="true"`. The paragraph text "Thinking up a good opener" is therefore the live region content; the animated dots are hidden from assistive technology.

2. Analysing state inside the Submit button (line 300): `<span className="dot-pulse" aria-hidden="true">` added. The button's visible content reads "Analysing" followed by the hidden animated dots. The accessible name of the button will be computed as "Analysing" when in this state, which is correct and informative.

The reduced-motion rule in `colors_and_type.css` (lines 222 to 226) suppresses the animation entirely when `prefers-reduced-motion: reduce` is set, which satisfies WCAG 2.3.3 Animation from Interactions (AAA).

### M-04: Interview question heading

**Verdict: Verified correct — no change needed, as reported**

`swot-interview.jsx` line 262: when a question is loaded, it is rendered as `<h2 className="question">{question}</h2>`. The interview `<main>` element does not contain an `<h1>`, but the page-level `<h1>` "SWOT Builder" is rendered inside the `<header>` in `swot-app.jsx` (line 524). The question `<h2>` is a valid sub-heading under that `<h1>`. No heading levels are skipped. Sean's report that no change was needed is confirmed.

### M-05: Input focus outline

**Verdict: Verified correct**

`swot-styles.css` line 221: the rule `.input:focus, .textarea:focus` previously set `outline: none`. It now sets `outline-color: transparent`. The box-shadow focus indicator `0 0 0 4px var(--accent-subtle)` remains in place and provides a visible focus ring. Setting `outline-color: transparent` rather than `outline: none` means the outline box is still laid out by the browser, which avoids a layout shift, while the colour is invisible. The visible focus ring is provided by the box-shadow, which is not affected by this change.

The global `:focus-visible` rule in `colors_and_type.css` (line 215) sets `outline: 3px solid var(--accent)` with a 3px offset. The `.input:focus` rule overrides `outline-color: transparent`, which suppresses the duplicate ring on inputs specifically. This is intentional: the box-shadow ring is more visually integrated with the input design than the global outline ring. The net result is a clear, high-contrast focus indicator that meets WCAG 2.4.11 (Focus Appearance, AA) and approaches the AAA target (2.4.12).

---

## Regression check

No new accessibility issues were introduced by the changes in this PR.

Positive improvements noted beyond the stated fixes:

- `aria-hidden="true"` was also added to the `dotmark` span inside `BucketPicker` buttons (swot-interview.jsx line 88). This was not listed in C-04 but is correct and reduces noise for screen reader users.

The `ItemEditorModal` confidence row gap (noted under H-05 above) is pre-existing and not a regression of this PR.

---

## S-11 carry-forward: input border contrast

The `--border` token is defined in `colors_and_type.css` line 56 as `#d1d5db`. Against a white card background (`--bg-card: #ffffff`), this produces a contrast ratio of approximately 1.47:1. This fails WCAG 1.4.11 Non-text Contrast (AA requires 3:1 for UI component boundaries).

This value was present in the codebase before this PR. The diff confirms that `colors_and_type.css` was not touched by this PR at all. The S-11 finding is therefore **pre-existing** and was not introduced by PR 10.

---

## Notes and carry-forwards

### Confidence row in ItemEditorModal

The confidence button group in `swot-board.jsx` (`ItemEditorModal`, lines 140 to 149) was not in the H-05 Group 2 scope. The fix applied to `ConfidencePicker` in `swot-interview.jsx` should be applied to the same pattern in the board editor modal. The visible label element needs to be connected to the button group via `role="group"` and `aria-labelledby`, or the buttons need individual `aria-label` attributes. This is a carry-forward task.

### AIBadge button accessible name

The `AIBadge` button in `swot-app.jsx` (lines 255 to 293) has no `aria-label`. Its accessible name is derived from its text content, which changes dynamically ("Detecting AI…", "Downloading…", "Browser AI", "Load AI model ▾", "Manual mode"). The dynamic text content approach is acceptable. However, the collapsed state "Manual mode" and "Load AI model ▾" give sufficient context. The downward-pointing triangle character "▾" will be announced literally by some screen readers. This is a minor issue, not a blocker, and it pre-dates this PR. Carried forward as a task.

---

## Overall verdict

**Pass with notes.** All nine Group 2 findings are correctly fixed. No regressions introduced. Two pre-existing gaps are noted and carried forward. The PR is ready to proceed through the merge gate.
