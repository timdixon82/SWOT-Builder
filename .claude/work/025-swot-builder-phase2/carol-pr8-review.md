# Carol — PR 8 Accessibility Review

PR: feat/phase2-accessibility on timdixon82/SWOT-Builder
Review date: 2026-05-27
Reviewer: Carol (tester and release manager)
Standard: WCAG 2.2, AAA conformance
Method: Full source inspection of swot-app.jsx, swot-board.jsx, swot-interview.jsx, and swot-styles.css against the baseline audit at `.claude/work/008-swot-builder-setup/carol-baseline-audit.md`. All five claimed fixes were checked individually. A regression sweep was conducted across the changed files.

---

## Overall Verdict

Pass with two minor notes.

All five Group 1 fixes are correctly implemented. No new critical or high accessibility issues were introduced. Two low-severity observations are noted below. Neither blocks this PR.

---

## Fix-by-fix Verification

### C-01 — Modal role, focus management, and keyboard trap

Criterion: WCAG 4.1.2 Name, Role, Value (A); 2.1.1 Keyboard (A); 2.1.2 No Keyboard Trap (A)

Both modals pass.

DownloadConsentModal in swot-app.jsx (lines 104–164):
- `role="dialog"` and `aria-modal="true"` are present on the inner `.modal` div.
- `aria-labelledby={headingId}` points to the `h3` with `id="download-consent-heading"` — the reference is valid.
- `useEffect` on mount queries the modal ref for focusable elements and calls `.focus()` on the first. The selector covers buttons, inputs, textareas, anchors, and positive tabindex elements. Implementation is correct.
- `handleKeyDown` traps Tab and Shift-Tab by comparing `document.activeElement` to the first and last focusable elements and calling `preventDefault()` plus `.focus()` on the opposite boundary. Logic is correct.
- `handleKeyDown` also catches Escape and calls `onCancel()`. Correct.
- The backdrop div carries `role="button"` `tabIndex={0}` `aria-label="Close dialog"` and a `handleBackdropKey` handler that fires `onCancel()` on Enter and Space. Keyboard equivalence for the backdrop is present.
- `onClick={e => e.stopPropagation()}` on the inner modal correctly prevents the backdrop click from firing when the user interacts with the dialog contents.

ItemEditorModal in swot-board.jsx (lines 41–81):
- Identical pattern. `role="dialog"` `aria-modal="true"` `aria-labelledby="item-editor-heading"` all present on the inner div.
- `h3 id="item-editor-heading"` content is "Edit item". Reference is valid.
- Same focusable-query and Tab-trap logic. Correct.
- Escape calls `onClose()`. Correct.
- Backdrop has `role="button"` `tabIndex={0}` `aria-label="Close dialog"` with Enter/Space handling. Correct.

One implementation note (not a blocker, recorded under Notes below): the focusable query does not filter out elements with `display:none` or `visibility:hidden`. Under current markup this is not a problem because no focusable element in these modals is hidden via those properties. The note is recorded in case elements are added later.

C-01 verdict: pass.

---

### C-05 — Tag remove buttons keyboard operable

Criterion: WCAG 2.1.1 Keyboard (A); 4.1.2 Name, Role, Value (A)

Both locations pass.

TagEditor in swot-interview.jsx (line 54):
- Remove element is `<button type="button" className="x" aria-label={`Remove tag ${t}`}>`. Native button, keyboard operable, accessible name present. Correct.

ItemEditorModal in swot-board.jsx (line 125):
- Remove element is `<button type="button" className="x" aria-label={`Remove tag ${t}`}>`. Same pattern. Correct.

The CSS for `.tag-pill .x` in swot-styles.css (lines 496–507) retains `cursor: pointer`. This was flagged in the baseline as something to remove when switching from span to button, since buttons have a natural cursor. At `cursor: pointer` on a button this is not an accessibility failure; it is a minor style observation. Not a blocker.

C-05 verdict: pass.

---

### C-06 — Item edit buttons visible on keyboard focus

Criterion: WCAG 2.1.1 Keyboard (A)

Pass.

swot-styles.css line 812:
```
.item-card:focus-within .item-actions { opacity: 1; }
```

The rule is present and correctly placed after the default `opacity: 0` rule on `.item-card .item-actions` (line 809) and the existing `:hover` rule (line 811). CSS cascade order is correct: both hover and focus-within will reveal the actions. A keyboard user who Tabs to the edit button will cause focus-within to fire on the containing `.item-card`, making the action visible before the button is activated.

C-06 verdict: pass.

---

### C-07 — Toast live region

Criterion: WCAG 4.1.3 Status Messages (AA)

Pass.

swot-app.jsx lines 569–574:
```jsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className={toast ? "toast" : "toast toast-hidden"}
>{toast || ""}</div>
```

The element is always in the DOM. When empty it receives class `toast-hidden`, which applies a visually-hidden clip pattern (swot-styles.css lines 994–1007: `position:fixed; width:1px; height:1px; clip; overflow:hidden`). The hidden state uses the standard visually-hidden pattern, not `display:none` or `visibility:hidden`, so the live region remains in the accessibility tree and will announce updates.

When a message is set, the class switches to `toast` and the text content changes. Screen readers with `aria-live="polite"` will queue and read the change. `aria-atomic="true"` ensures the full message is read rather than just the changed text node.

Note: the CSS comment on line 993 explicitly describes the intent ("Live region stays in DOM when empty so screen readers see updates"). The implementation matches the intent.

C-07 verdict: pass.

---

### H-06 — Textarea accessible labels

Criterion: WCAG 1.3.1 Info and Relationships (A); 3.3.2 Labels or Instructions (A)

Both textareas pass.

swot-interview.jsx line 274: main answer textarea carries `aria-label="Your answer"`.
swot-interview.jsx line 328: suggestion description textarea carries `aria-label="Item description"`.

Both are placed correctly on the textarea elements themselves. The labels are concise and descriptive.

Note: the item title input in the suggestion body (swot-interview.jsx line 319) does not yet have an explicit label or aria-label. It has `placeholder="Item title"` only. This was not in the Group 1 fix list (H-06 specified the two textareas). It is carried forward as a note rather than a blocker.

H-06 verdict: pass.

---

## Regression Check

The following areas were checked for new issues introduced by the PR changes.

### Modal focus trap — edge case on Tab with no focusable elements

Both modals include a guard: `if (!focusable.length) return;`. This prevents a crash but leaves the trap inactive if the modal renders with zero focusable elements. In practice, each modal always contains at least two buttons (Cancel and a confirm/save action), so this path will not be reached under current markup. No regression.

### Backdrop as role="button"

The backdrop div is `role="button"` and `tabIndex={0}`. This is included in the focusable query used by the trap: `[tabindex]:not([tabindex="-1"])`. The backdrop sits outside `modalRef` (it is the outer div; `modalRef` is attached to the inner `.modal` div). Therefore the backdrop is not in the trap's focusable list, and Tab from the last element inside the modal correctly wraps to the first element inside the modal, not out to the backdrop. The implementation is correct.

However, a keyboard user who presses Shift-Tab from the first element inside the modal will correctly wrap to the last focusable element inside. They cannot reach the backdrop from within the trap. The only keyboard dismissal path is Escape, which is correctly wired. This is the expected ARIA dialog pattern. No regression.

### focus() called before element is painted (mount timing)

`useEffect` without a layout effect means focus is moved after the browser has painted. For React's render cycle this is standard and accepted. The alternative, `useLayoutEffect`, is not needed here because the element is not positioned relative to focus position. No regression.

### Tag buttons: accessible name template literal

Both tag remove buttons use `` aria-label={`Remove tag ${t}`} ``. When `t` is an empty string, this produces `aria-label="Remove tag "`. In practice, the `addTag` function in both TagEditor and ItemEditorModal guards against empty tags (`if (!v) return`), so an empty-string tag cannot be added. No regression.

### Toast hidden state: animation

When `toast` is null and the element has class `toast-hidden`, the CSS sets `animation: none`. This prevents the `toast-in` keyframe from running on an empty hidden region. When a message appears, the class switches back to `toast` and the animation fires. This is correct and does not cause a flash or false announcement.

### No new issues introduced

The changes are limited to:
- Adding ARIA roles and attributes to modal divs.
- Changing span elements to button elements for tag removal.
- Adding one CSS rule (`:focus-within`).
- Making the toast always present with conditional visibility.
- Adding `aria-label` to two textareas.

No new interactive patterns, landmark changes, heading changes, or color changes were introduced. No regressions identified.

---

## Notes (not blockers)

1. The focusable query in both modal focus traps does not exclude `display:none` or `visibility:hidden` descendants. This is safe under current markup. If future changes add conditionally-hidden focusable elements inside either modal, the trap will need updating.

2. `.tag-pill .x` in swot-styles.css retains `cursor: pointer`. Buttons carry a default cursor; explicit `pointer` is redundant but not harmful.

3. The item title input in the suggestion body of swot-interview.jsx (line 319) has only a placeholder, not an aria-label. The baseline audit did not list this as a Group 1 item, but it will fail at Group 2 review under H-05 (form controls without programmatic labels). Flagged for the next pass.

4. The existing Group 2 and Group 3 findings from the baseline audit (C-02, C-03, C-04, H-01 through H-05, H-07, H-08, M-01 through M-06, L-01 through L-04) remain open. This PR addresses Group 1 only, which is the stated scope. Those findings are unchanged and are not regressions from this PR.

---

## Sign-off

All five Group 1 fixes (C-01, C-05, C-06, C-07, H-06) are correctly implemented and meet the cited WCAG criteria. No new accessibility issues were introduced. PR 8 is ready to proceed to merge.

Verdict: **Pass with minor notes.** Notes 1 through 4 above are carry-forwards for the Group 2 sprint. None block this PR.
