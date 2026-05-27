# Accessibility

This page records the WCAG (Web Content Accessibility Guidelines) 2.2 AAA conformance position for SWOT Builder. It is based on a baseline audit carried out by code inspection on 2026-05-22. It lists the 25 findings from that audit as the starting point for a planned remediation phase.

## Conformance verdict

Conditional fail. The application has several genuine AAA failures and three that affect AA. It cannot claim any level of WCAG 2.2 conformance in its current state. No finding requires a fundamental redesign. Most issues are fixable with moderate effort.

## Two-phase approach

Accessibility remediation follows the same two-phase shape used for the Periodic-Table project.

Phase 1 is the setup build, which is in progress. It includes the fixes required before Tim can test the application at all with VoiceOver and JAWS.

Phase 2 is the accessibility remediation sprint, which follows the setup build. It addresses the remaining findings in priority order. This page tracks all 25 findings as open items until they are resolved in Phase 2 and retested.

## Audit method

The audit was carried out entirely by code inspection, reading the source files directly: `index.html`, `theme.js`, `colors_and_type.css`, `swot-styles.css`, `swot-app.jsx`, `swot-intro.jsx`, `swot-interview.jsx`, `swot-board.jsx`, `tweaks-panel.jsx`, and `swot-engine.jsx`. Contrast ratios were calculated by formula from the hex values in the CSS.

Automated scanners (axe-core and Pa11y) were not available during the baseline audit. Before Tim tests the application, the team should run axe-core against the live application at each of the three steps and with the modal, consent dialog, and Tweaks panel open. Live testing will likely surface additional findings, particularly around focus order at runtime and the behaviour of focus-visible across VoiceOver with Safari and JAWS with Chrome.

## Summary of findings

- Critical (blocks screen reader users): 7 findings
- High (fails AAA, degrades experience): 8 findings
- Medium (fails AAA, manageable workaround exists): 6 findings
- Low (best-practice gaps): 4 findings
- Total findings: 25

---

## Critical findings

### C-01 Modals have no accessible role, no focus management, and no keyboard trap

WCAG criterion: 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A); 2.1.2 No Keyboard Trap (Level A)

The item editor modal and the download consent modal are plain div elements. Neither carries `role="dialog"`, `aria-modal="true"`, nor `aria-labelledby`. When they open, focus is not moved into the modal. Keyboard focus can leave the modal and reach elements behind it. There is no Escape key handler.

Remediation: Add `role="dialog"` `aria-modal="true"` `aria-labelledby` pointing to the heading inside the modal. On open, move focus to the first focusable element. Trap Tab and Shift-Tab within the modal while it is open. Add an Escape key handler. Wrap the backdrop in a button or add a keydown handler for Enter and Space.

### C-02 No page landmark structure

WCAG criterion: 1.3.1 Info and Relationships (Level A); 2.4.1 Bypass Blocks (Level A)

The intro screen renders as a plain div with no `main` landmark. The document has no skip link. The board and interview screens each render a `main` element, but there may be a moment when two `main` elements are present.

Remediation: Wrap the intro content in a `main` element. Ensure only one `main` element is present in the DOM at any time. Add a skip-to-content link as the first focusable element in the body.

### C-03 Stepper dots convey step progress with no text alternative

WCAG criterion: 1.1.1 Non-text Content (Level A); 1.4.1 Use of Colour (Level A)

The stepper renders three empty span elements. Step state is communicated solely through background colour and a transform scale change. The dots have no `aria-label`.

Remediation: Add `aria-hidden="true"` to all dot spans. The visible text "Step N of 3" provides the accessible information.

### C-04 Bucket picker buttons have no accessible name for the AI suggestion state

WCAG criterion: 4.1.2 Name, Role, Value (Level A)

When a bucket button is in the "suggested" state, it receives a visual pseudo-element badge reading "AI". Pseudo-element content is not part of the accessible name. Screen reader users cannot tell which bucket the AI recommended.

Remediation: Add `aria-label` to each bucket button that includes the full name and, where the AI has suggested that bucket, appends "(AI suggestion)".

### C-05 Tag removal buttons are not keyboard operable

WCAG criterion: 2.1.1 Keyboard (Level A); 4.1.2 Name, Role, Value (Level A)

Tag removal is wired to `<span>` elements with onClick handlers. Spans are not keyboard focusable. A keyboard user cannot reach or activate the remove button. The `aria-label` on the span is also missing from one of the two tag editor locations.

Remediation: Change tag removal elements from `span` to `button type="button"`. Add `aria-label="Remove tag {t}"` consistently in both locations.

### C-06 Item edit buttons are invisible on keyboard focus

WCAG criterion: 2.1.1 Keyboard (Level A)

The item actions container is set to `opacity: 0` by default and becomes visible only on hover. There is no CSS rule to show it when a child element receives keyboard focus.

Remediation: Add the CSS rule `.item-card:focus-within .item-actions { opacity: 1; }`.

### C-07 Toast notifications are not announced to screen readers

WCAG criterion: 4.1.3 Status Messages (Level AA)

The toast element has no `role`, no `aria-live`, and no `aria-atomic`. When a toast appears, screen readers are not notified.

Remediation: Add `role="status"` `aria-live="polite"` `aria-atomic="true"` to the toast element.

---

## High findings

### H-01 AI status badge has no accessible name and uses an incorrect ARIA pattern for the dropdown

WCAG criterion: 4.1.2 Name, Role, Value (Level AA)

Critical information about the AI backend is held in the `title` attribute only. The model picker dropdown uses `role="listbox"` but the individual model items use `role="option"` on button elements. Buttons must not carry `role="option"` inside a listbox; the pattern is incorrect per the WAI-ARIA (Web Accessibility Initiative Accessible Rich Internet Applications) specification.

Remediation: Move descriptive text from `title` into a visually hidden span or `aria-describedby`. Replace `role="listbox"` with `role="menu"` and `role="option"` with `role="menuitem"`, or restructure as a true combobox.

### H-02 Tweaks panel section labels and value display fail contrast

WCAG criterion: 1.4.6 Contrast Enhanced (Level AAA)

The Tweaks panel uses rgba opacity to create visual hierarchy. Section headings compute to approximately 2.68:1. Value display computes to approximately 3.07:1. The close button icon computes to approximately 3.54:1. All three fail both AAA and AA. The muted label text computes to approximately 5.90:1, which fails AAA but passes AA.

Remediation: Replace rgba low-opacity colours with solid colour values that achieve at least 7:1 against the panel background for all informative text elements.

### H-03 Executive board style: Strengths quadrant letter fails contrast

WCAG criterion: 1.4.6 Contrast Enhanced (Level AAA)

In the Executive board style, the Strengths letter badge uses #15803d (green) on #061528 (navy), giving 3.65:1. At 20px bold, the AAA large-text threshold of 4.5:1 applies. This fails. The other three quadrants pass.

Remediation: Change the Strengths letter colour in the Executive style to white (#ffffff, giving 18.33:1) or to a lighter green that reaches at least 4.5:1 against navy.

### H-04 Theme toggle button state is not announced to screen readers

WCAG criterion: 4.1.2 Name, Role, Value (Level A)

The theme toggle carries `aria-label="Toggle theme"`. The current state (light or dark) is communicated only by the icon displayed. Screen reader users cannot tell what the toggle will do when activated.

Remediation: Update `aria-label` dynamically to describe the action, for example "Switch to dark mode" when in light mode.

### H-05 Confidence picker and tag input have no programmatic label

WCAG criterion: 1.3.1 Info and Relationships (Level A); 3.3.2 Labels or Instructions (Level A)

The ConfidencePicker has a visible "Confidence" label but no `role="group"` with `aria-labelledby` connecting it to the buttons. The tag input field has placeholder text but no `aria-label`.

Remediation: Wrap the ConfidencePicker buttons in a container with `role="group"` and `aria-labelledby` pointing to the "Confidence" label span. Add `aria-label="Add tag"` to the tag input in both locations.

### H-06 Textarea answer field has no label

WCAG criterion: 1.3.1 Info and Relationships (Level A); 3.3.2 Labels or Instructions (Level A)

The main answer textarea and the suggestion description textarea have placeholder text but no `id`, no associated `label` element, and no `aria-label`. Placeholder text is not a substitute for an accessible label.

Remediation: Add `aria-label` attributes to both textareas, for example `aria-label="Your answer"` and `aria-label="Item description"`.

### H-07 Command symbol may be read incorrectly by screen readers

WCAG criterion: 3.1.4 Abbreviations (Level AAA)

The interview view shows a keyboard shortcut hint using the Unicode command symbol. VoiceOver and JAWS may read this as "place of interest sign" or a character number rather than as "Command".

Remediation: Replace the Unicode command symbol with the plain word "Cmd" or "Command".

### H-08 Dismiss button label does not match its visible text

WCAG criterion: 2.5.3 Label in Name (Level A)

The dismiss button on the AI unavailable nudge banner uses the visible text "x" but carries `aria-label="Dismiss"`. The accessible name and the visible label do not match, which breaks WCAG 2.5.3.

Remediation: Change the button content to the word "Dismiss" with a visually hidden fallback, or use an SVG close icon with `aria-hidden` and keep `aria-label="Dismiss"`.

---

## Medium findings

### M-01 No reduced-motion alternative for the dot-pulse loading animation

WCAG criterion: 2.3.3 Animation from Interactions (Level AAA)

The CSS pulse animation fires during AI loading states. Under `prefers-reduced-motion`, the animation duration is suppressed but not removed, causing a single opacity flash. The dot-pulse spans are not hidden from the accessibility tree.

Remediation: Add `aria-hidden="true"` to all dot-pulse span elements. Ensure the containing paragraph text provides the full status for screen readers. Add `role="status"` `aria-live="polite"` to the loading state paragraph.

### M-02 Draggable Tweaks panel relies on mouse-only drag

WCAG criterion: 2.1.1 Keyboard (Level A); 2.1.3 Keyboard (No Exception, Level AAA)

The Tweaks panel header initiates drag via `mousemove` events. There is no keyboard equivalent for repositioning the panel.

Remediation: Add keyboard arrow-key handling to move the panel position, or provide a way to reset the position from the keyboard. An alternative is to remove drag entirely and use a fixed corner position.

### M-03 Confidence label font size is below the minimum

WCAG criterion: 1.4.1 Use of Colour (Level A)

The confidence label text next to the confidence dots uses `font-size: 10px`, which is below the design system minimum of approximately 12.5px. At 10px the text may be unreadable for low-vision users.

Remediation: Raise the confidence label font-size to at least `var(--text-xs)` (approximately 12.5px).

### M-04 Interview question is not a real heading element

WCAG criterion: 1.3.1 Info and Relationships (Level A); 2.4.10 Section Headings (Level AAA)

The interview question text uses a paragraph element with `className="question"`. CSS styling gives it a heading appearance, but screen readers see a paragraph, not a heading. Screen reader users cannot navigate to the question by heading.

Remediation: Change the question element in `swot-interview.jsx` from a `<p>` to an `<h2>`.

### M-05 Input and textarea focus indicator uses an outline suppression

WCAG criterion: 2.4.13 Focus Appearance (Level AAA)

The `.input:focus` and `.textarea:focus` rules set `outline: none` and replace the outline with a box-shadow. Box-shadow does not form a closed outline as required by WCAG 2.4.13 Focus Appearance.

Remediation: Remove `outline: none` from the input focus rules. Change it to `outline-color: transparent` or remove the override entirely so the global `:focus-visible` rule applies.

### M-06 Scope select field hint paragraph is not linked to the control

WCAG criterion: 3.3.2 Labels or Instructions (Level A)

The scope select field has a visible hint paragraph but it is not programmatically associated with the select element via `aria-describedby`.

Remediation: Add `aria-describedby` to the select element pointing to the id of the hint paragraph. Apply the same pattern to the title input field.

---

## Low findings

### L-01 Logo SVG has no accessible description

WCAG criterion: 1.1.1 Non-text Content (Level A)

The logo container div carries `aria-label="SWOT Builder"`. The SVG inside is exposed to the accessibility tree without `role="img"` or `aria-hidden="true"`, which may cause double announcements.

Remediation: Add `aria-hidden="true"` to the SVG inside the Logo so screen readers skip it.

### L-02 Watermark text is not hidden from the accessibility tree

WCAG criterion: 1.1.1 Non-text Content (Level A)

The watermark div is decorative but has no `aria-hidden="true"`. Screen readers will read it, including the middle dot character which may be read as "middle dot".

Remediation: Add `aria-hidden="true"` to the swot-watermark div.

### L-03 Print styles hide the header, leaving no accessible title in the printed document

WCAG criterion: 2.4.2 Page Titled (Level A)

The print CSS hides `.app-header`, which contains the `<h1>` "SWOT Builder". The printed PDF will have no `<h1>`.

Remediation: Add a print-only `<h1>` with the application name and board title, or change the board `<h2>` to `<h1>` in print CSS.

### L-04 Language of content in languages other than English is not declared

WCAG criterion: 3.1.2 Language of Parts (Level AA)

The html element carries `lang="en-GB"`. If a user analyses a subject in another language and the AI responds in that language, the content will be rendered without a matching `lang` attribute. VoiceOver and JAWS will read it with English pronunciation rules.

This is a structural limitation of the application. It is documented here as a known limitation. See the exceptions folder if a formal exception record is added.

---

## Prioritised remediation list

The following order is based on impact on Tim's ability to use the application and implementation effort. Group 1 fixes must be done before any screen reader testing.

### Group 1: Fix before screen reader testing

1. C-01 Modal accessibility: add role, aria-modal, aria-labelledby, focus management, focus trap, and keyboard dismiss.
2. C-07 Toast live region: add role="status" aria-live="polite" to the toast element.
3. C-05 Tag remove buttons: change span.x to button type="button" with aria-label in both locations.
4. C-06 Item edit button visibility: add .item-card:focus-within .item-actions { opacity: 1; } to CSS.
5. H-06 Interview textarea labels: add aria-label to both textareas in swot-interview.jsx.

### Group 2: Fix before handing to Tim for testing

6. C-02 Landmark structure: add main to intro step; add skip link; verify only one main exists at a time.
7. C-03 Stepper dots: add aria-hidden="true" to dot spans.
8. C-04 Bucket picker AI suggestion state: add aria-label to suggested button including "(AI suggestion)".
9. H-04 Theme toggle state: update aria-label dynamically to describe the action.
10. H-05 Confidence picker group: add role="group" and aria-labelledby; add aria-label to tag input.
11. H-08 Dismiss button label: replace "x" with a visible "Dismiss" label or use an accessible icon pattern.
12. M-01 Dot-pulse aria-hidden: add aria-hidden="true" to dot-pulse spans; add role="status" to loading paragraphs.
13. M-04 Interview question heading: change question paragraph to an h2 element.
14. M-05 Input focus outline: remove "outline: none" from input and textarea focus rules.

### Group 3: Fix in the next sprint

15. H-01 AI badge ARIA pattern: restructure dropdown as a menu or listbox per WAI-ARIA specification.
16. H-02 Tweaks panel contrast: replace rgba low-opacity colours with solid values that meet 7:1.
17. H-03 Executive style Strengths letter: change letter colour to white or a lighter green.
18. H-07 Command symbol: replace Unicode command sign with plain text "Cmd".
19. M-02 Tweaks panel drag: add keyboard reposition or remove drag interaction.
20. M-03 Confidence label font size: raise font-size to at least var(--text-xs).
21. M-06 Scope select aria-describedby: link the hint paragraph to the select and title inputs.
22. L-01 Logo SVG: add aria-hidden="true" to the SVG inside Logo.
23. L-02 Watermark aria-hidden: add aria-hidden="true" to the swot-watermark div.
24. L-03 Print heading: add a print-only h1 or promote the board h2 in print CSS.
25. L-04 Language limitation: document the multi-language limitation in the exceptions folder.
