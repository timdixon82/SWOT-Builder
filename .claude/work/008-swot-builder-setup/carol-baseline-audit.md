# SWOT Builder Baseline Accessibility Audit

Audit date: 2026-05-22
Auditor: Carol (tester and release manager)
Standard: Web Content Accessibility Guidelines (WCAG) 2.2, AAA conformance
Method: Code-based inspection. Automated scanners (axe-core, Pa11y) were not installable in this environment. All findings come from reading the source files directly: index.html, theme.js, colors_and_type.css, swot-styles.css, swot-app.jsx, swot-intro.jsx, swot-interview.jsx, swot-board.jsx, tweaks-panel.jsx, and swot-engine.jsx. Contrast ratios were calculated by formula from the hex values in the CSS. Findings marked "needs live verification" require a running browser to confirm or clear.

## Conformance Verdict

Conditional fail. The application has several genuine AAA failures and three that affect AA. It cannot claim any level of WCAG 2.2 conformance in its current state. The most serious issues are missing landmark structure, missing accessible names on interactive controls, focus management gaps in modals, and contrast failures inside the Tweaks panel. Most issues are fixable with moderate effort. No finding requires a fundamental redesign.

## Summary of Findings by Severity

- Critical (blocks screen reader users): 7 findings
- High (fails AAA, degrades experience): 8 findings
- Medium (fails AAA, manageable workaround exists): 6 findings
- Low (best-practice gaps): 4 findings

Total findings: 25

---

## Critical Findings

These issues will cause VoiceOver or JAWS to misrepresent the interface or prevent a task from being completed.

### C-01 Modals have no accessible role, no focus management, and no keyboard trap

WCAG criterion: 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A); 2.1.2 No Keyboard Trap (Level A)
Severity: Critical
Location: swot-board.jsx, ItemEditorModal and DownloadConsentModal in swot-app.jsx

The item editor modal and the download consent modal are plain div elements with class "modal-back" and "modal". Neither carries role="dialog", aria-modal="true", nor aria-labelledby. When they open, focus is not moved into the modal. When the user tabs, focus can leave the modal and reach elements behind it. There is no Escape key handler to close. The backdrop dismisses on a click handler, which has no keyboard equivalent (pressing Enter or Space on the backdrop is not wired up in the same way because it is a div, not a button).

VoiceOver and JAWS will not announce these as dialogs. A keyboard-only user or screen reader user can interact with content behind the modal while it is open, and cannot reliably dismiss it from the keyboard.

Remediation: Add role="dialog" aria-modal="true" aria-labelledby pointing to the h3 heading inside the modal. On open, move focus to the first focusable element inside the modal. Trap Tab and Shift-Tab within the modal while it is open. Add an Escape key handler. Wrap the backdrop click in a button or add a keydown handler for Enter and Space.

### C-02 No page landmark structure

WCAG criterion: 1.3.1 Info and Relationships (Level A); 2.4.1 Bypass Blocks (Level A)
Severity: Critical
Location: swot-app.jsx (root render), swot-intro.jsx, swot-interview.jsx, swot-board.jsx

The application renders into a div with class "app-shell". The header element is correct semantic HTML. However, the intro screen renders as a div with class "intro". The interview screen is a main element (correct), but the SWOT board screen also renders as a main element, so there are two simultaneous main landmarks when React has finished its step-based rendering. The intro lacks main. The document has no skip link.

Screen reader users who navigate by landmarks will find the structure inconsistent. A user landing on the intro step has no main landmark to jump to. The duplicate main at the board step may confuse JAWS and VoiceOver.

Remediation: Wrap the intro content in a main element. Ensure only one main element is present in the DOM at any time (React renders only one step, so this may already be the case at runtime; verify). Add a skip-to-content link as the first focusable element in the body, pointing to the main element. The aside in swot-interview.jsx is already semantically correct.

### C-03 Stepper dots convey step progress with no text alternative

WCAG criterion: 1.1.1 Non-text Content (Level A); 1.4.1 Use of Colour (Level A)
Severity: Critical
Location: swot-app.jsx, Stepper component

The stepper renders three span elements with class "dot", "dot active", or "dot done". Step state is communicated solely through background colour and a transform scale change. The visible text "Step 1 of 3" is present, which partially addresses this. However, the dots themselves have no aria-label and do not indicate which step each dot represents. The active and done states are not announced to screen readers. JAWS and VoiceOver will read the text "Step 1 of 3" but will skip the dots entirely because they are empty spans.

Remediation: The text "Step 1 of 3" is the meaningful content and should be kept. The dots are decorative and can be given aria-hidden="true" to be explicit. Alternatively, replace the dot group with a visually hidden but screen-reader-visible list of step names with current state markers.

### C-04 Bucket picker buttons have no accessible name

WCAG criterion: 4.1.2 Name, Role, Value (Level A)
Severity: Critical
Location: swot-interview.jsx BucketPicker; swot-board.jsx ItemEditorModal bucket picker

Each bucket picker button renders two children: a decorative span with class "dotmark" (an empty span, coloured by CSS) and a span containing the short label ("Strength", "Weakness", "Opportunity", "Threat"). The short label text is present as a child span, which browsers should surface as the accessible name through the accessible name computation. However, when the button is in the "suggested" state it also receives a ::after pseudo-element with content "AI". Pseudo-element content is not part of the accessible name. The "suggested" state is conveyed solely through a visual badge, with no aria attribute marking which option the AI suggested. A screen reader user cannot tell which bucket the AI recommended.

Remediation: Add aria-label to each bucket button that includes the full name and, where the AI has suggested that bucket, appends "(AI suggestion)". Alternatively, add a visually hidden span inside the button when it is the suggested option.

### C-05 Tag removal buttons are not keyboard operable

WCAG criterion: 2.1.1 Keyboard (Level A); 4.1.2 Name, Role, Value (Level A)
Severity: Critical
Location: swot-interview.jsx TagEditor; swot-board.jsx ItemEditorModal tag editor

Tag removal is wired to a span element with class "x" and an onClick handler. Spans are not keyboard focusable and do not have an implicit button role. A keyboard user cannot reach the remove button with Tab and cannot press Enter or Space to activate it. The aria-label="remove tag {t}" is correctly placed on the span in TagEditor (swot-interview.jsx) but absent from the equivalent span in ItemEditorModal (swot-board.jsx). Even where the label exists, the element is not keyboard operable.

Remediation: Change tag removal elements from span to button type="button". Add aria-label="Remove tag {t}" consistently to both locations. Remove cursor: pointer from CSS on .tag-pill .x and rely on the button's natural cursor.

### C-06 Item edit buttons are visibility-hidden by default and unreachable by keyboard

WCAG criterion: 2.1.1 Keyboard (Level A)
Severity: Critical
Location: swot-board.jsx QuadrantCell; swot-styles.css .item-card .item-actions

The item-actions container is positioned absolutely and set to opacity: 0 by default, becoming visible only on .item-card:hover. The edit button inside it has no focus-state that would reveal it when focused. A keyboard user tabbing through items will reach the edit button but the button will be invisible because the hover state is not triggered by focus. The CSS has a :focus-visible rule for general elements (colors_and_type.css) but there is no .item-card:focus-within .item-actions rule to expose the actions when a child is focused.

Remediation: Add a CSS rule: .item-card:focus-within .item-actions { opacity: 1; }. Consider also always showing the actions at reduced opacity rather than hiding them entirely, so they are discoverable by sighted keyboard users.

### C-07 Toast notifications are not announced to screen readers

WCAG criterion: 4.1.3 Status Messages (Level AA)
Severity: Critical
Location: swot-app.jsx, toast div

The toast element (class "toast") is rendered conditionally. It has no role, no aria-live attribute, and no aria-atomic. When a toast appears (for example "Markdown downloaded", "Updated", "Deleted"), it is injected into the DOM but the announcement is not triggered in JAWS or VoiceOver because there is no live region. A screen reader user will not hear these status messages.

Remediation: Add role="status" aria-live="polite" aria-atomic="true" to the toast element. Alternatively, maintain a persistent live region in the DOM at all times and update its content when a toast message fires, then clear it after the timeout.

---

## High Findings

These issues fail AAA (or in some cases AA) but do not completely prevent task completion.

### H-01 AI status badge has no accessible name and misleading aria-expanded usage

WCAG criterion: 4.1.2 Name, Role, Value (Level AA); 2.4.6 Headings and Labels (Level AA)
Severity: High
Location: swot-app.jsx, AIBadge component

The AI badge is a button that shows text such as "Detecting AI...", "Browser AI", or "Load AI model". The button carries aria-expanded and aria-haspopup="listbox" when the dropdown is available. However, aria-expanded is set to the open state value but the button has no aria-label. When the dropdown is closed (the common case), aria-expanded="false" and aria-haspopup="listbox" are present but the button purpose is the visible label text only. This is acceptable for sighted users but the screen reader will announce "Load AI model, collapsed, has popup listbox button" which is functional. The deeper problem is that when the AI is ready and the button is not a picker, the button still has aria-expanded={open} set to false and aria-haspopup={undefined}, which is correct, but the title attribute is used as a tooltip that a screen reader may or may not read. Critical information ("Chrome's on-device AI") is in title only.

The model picker dropdown carries role="listbox" but the individual model buttons carry role="option". Buttons with role="option" inside a listbox must not be buttons at all according to the WAI-ARIA specification; the option role belongs on a static element that the listbox owns, not on an interactive button descendant. The ARIA pattern for a combobox listbox is different from the pattern used here.

Remediation: For the ready state, move the descriptive text from title into a visually hidden span or aria-describedby. For the dropdown, either replace role="listbox" with role="menu" and role="option" with role="menuitem", which is the correct pattern for a button-triggered list of actions, or restructure as a true combobox. Add aria-label to the outer button describing its purpose (for example "AI backend: Browser AI" or "Select AI model").

### H-02 Tweaks panel section labels and value display fail contrast

WCAG criterion: 1.4.6 Contrast Enhanced (Level AAA)
Severity: High
Location: tweaks-panel.jsx, __TWEAKS_STYLE embedded CSS

The Tweaks panel uses rgba opacity to create its visual hierarchy. The computed contrasts against the panel background (#faf9f7 approximately) are:

- .twk-sect section headings: rgba(41,38,27,0.45) computes to approximately #9b9a94 at 2.68:1. Fails AAA and AA.
- .twk-val value display: rgba(41,38,27,0.5) computes to approximately #918f89 at 3.07:1. Fails AAA and AA.
- .twk-x close button icon: rgba(41,38,27,0.55) computes to approximately #87847e at 3.54:1. Fails AAA and AA.
- .twk-lbl muted label span: rgba(41,38,27,0.72) computes to approximately #636158 at 5.90:1. Fails AAA, passes AA.

These are the colours used when the panel is open. The panel backdrop is semi-transparent (78% opacity), so the actual background depends on content behind it. The calculations above use the approximate solid equivalent colour. Against a white surface, contrasts are slightly lower; against a dark surface they may be higher. The section label and value display failures are the most serious since both are informative text.

Remediation: Replace rgba opacity variants with solid colours that achieve at least 7:1 against the panel background for all informative text elements. For .twk-sect, use approximately #5c5a54 (which is the 7:1 threshold against #faf9f7). For .twk-val, use a similar value. For .twk-x, which is an interactive control, the minimum is also 7:1 for its label text.

### H-03 Executive board style: Strengths quadrant letter fails contrast

WCAG criterion: 1.4.6 Contrast Enhanced (Level AAA)
Severity: High
Location: swot-styles.css, .swot-grid.style-exec

In the Executive board style the quadrant letter badge (the "S", "W", "O", "T" letter in a bordered circle) uses the quadrant's edge colour as text on the navy background. For the Strengths quadrant this is #15803d (green) on #061528 (navy), which gives 3.65:1. At 20px bold this is large text (above 18.67px bold, which is the WCAG large text threshold), so the AAA large-text threshold of 4.5:1 applies. This fails.

The other three quadrants pass: Weaknesses uses #fca5a5 at 9.66:1, Opportunities uses #63D2FF at 10.64:1, Threats uses #FF7C00 at 7.10:1.

Remediation: Change the Strengths letter colour in the exec style from --s-edge (#15803d) to a lighter green that reaches at least 4.5:1 against navy, or use white (#ffffff) which gives 18.33:1 and is consistent with the other three quadrants.

### H-04 Theme toggle button state is not announced to screen readers

WCAG criterion: 4.1.2 Name, Role, Value (Level A)
Severity: High
Location: swot-app.jsx, ThemeToggle component

The theme toggle button carries aria-label="Toggle theme". The current state (light or dark) is communicated only by which SVG icon is displayed. Screen reader users are told the button name but not the current state. A user cannot tell whether the action will switch to dark or switch to light. When the button is pressed, there is no live region announcement confirming what changed.

Remediation: Update aria-label dynamically to include the current and resulting state, for example "Switch to dark mode" when in light mode and "Switch to light mode" when in dark mode. Alternatively, add aria-pressed with true or false if the toggle is treated as a pressed state, and include the current theme name in the visible or accessible label.

### H-05 Confidence picker and inline form controls have no programmatic label

WCAG criterion: 1.3.1 Info and Relationships (Level A); 3.3.2 Labels or Instructions (Level A)
Severity: High
Location: swot-interview.jsx ConfidencePicker; swot-board.jsx ItemEditorModal confidence row; TagEditor

The ConfidencePicker renders a div with a span reading "Confidence" and three buttons. The span is not associated with the button group by any ARIA relationship. There is no role="group" with aria-labelledby on the container. Screen readers will read "Confidence Low Medium High" as a run of unrelated text followed by three unlabelled buttons (the buttons' text is their accessible name, which is correct, but they lack grouping context).

The tag input field in TagEditor has placeholder text "+ tag" but no visible label and no aria-label. Placeholder text does not serve as an accessible label in all screen readers, and it disappears when the user types.

Remediation: Wrap the ConfidencePicker buttons in a div or fieldset with role="group" and aria-labelledby pointing to the "Confidence" span. Add aria-label="Add tag" to the tag input in both TagEditor instances.

### H-06 Textarea answer field has no label

WCAG criterion: 1.3.1 Info and Relationships (Level A); 3.3.2 Labels or Instructions (Level A)
Severity: High
Location: swot-interview.jsx, answer textarea; suggestion textarea

The main answer textarea in the interview view has a placeholder ("Type your answer...") but no id, no label element, and no aria-label. The suggestion section also contains a description textarea with only a placeholder. Placeholder text is not a substitute for an accessible label; it disappears on input and is not reliably announced by all screen reader and browser combinations.

Remediation: Add aria-label attributes to both textareas, for example aria-label="Your answer" and aria-label="Item description". Alternatively, add visible labels with for and id associations.

### H-07 Skip-question keyboard shortcut uses a symbol that may be read literally

WCAG criterion: 3.1.4 Abbreviations (Level AAA)
Severity: High
Location: swot-interview.jsx, small element showing submit hint

The interview view contains a small element with content "Command/Ctrl + Enter to submit". The symbol used in the source is the Unicode command symbol. VoiceOver and JAWS may read this as "place of interest sign", "command sign", or simply as a Unicode character number rather than as "Command". This is a keyboard instruction hint, so a screen reader user who encounters this text may not understand it.

Remediation: Replace the Unicode command symbol with the plain word "Cmd" or "Command" so the text reads "Cmd/Ctrl + Enter to submit". This removes the symbol ambiguity and is consistent with the team's rule against emoji-led or symbol-led content.

### H-08 Dismiss button on AI nudge banner has no accessible name beyond the symbol

WCAG criterion: 4.1.2 Name, Role, Value (Level A)
Severity: High
Location: swot-app.jsx, AIUnavailableNudge component

The dismiss button on the AI unavailable nudge banner uses the text content "x" (a multiplication sign or letter x) as its visible label and aria-label="Dismiss". The aria-label is present and correct, so the accessible name is "Dismiss button". This is technically sufficient for 4.1.2, but the visible label ("x") and the accessible name ("Dismiss") are different. WCAG 2.5.3 Label in Name (Level A) requires that the accessible name includes the visible text. The visible text here is a single character that is not "Dismiss". Voice control users who say "click Dismiss" will find the button, but users who say "click x" will not.

Remediation: Change the button content to the word "Dismiss" with a visually hidden fallback, or use an SVG close icon with aria-hidden and keep aria-label="Dismiss". A single "x" character as visible text with a different accessible name fails WCAG 2.5.3.

---

## Medium Findings

These issues fail AAA criteria but do not completely block task completion for most users.

### M-01 No reduced-motion alternative for the dot-pulse loading animation

WCAG criterion: 2.3.3 Animation from Interactions (Level AAA)
Severity: Medium
Location: swot-styles.css, .dot-pulse animation; swot-interview.jsx loading state

The CSS @keyframes pulse animation runs during AI loading states and on the loading question indicator. The file colors_and_type.css correctly suppresses all animation durations under prefers-reduced-motion. However, the @keyframes pulse affects opacity and transform. When reduced motion is applied, the animation completes almost instantly (0.01ms) but still fires. The result is a single opacity flash that is not meaningful content. The loading indicator loses its visual purpose but no accessible text alternative takes its place for screen reader users.

The deeper issue is that during the loading state (loadingQ is true) the interview view shows a paragraph with text "Thinking up a good opener" followed by the dot-pulse span. The paragraph text is the text alternative, which is correct. The dot-pulse span is decorative and could be given aria-hidden="true" to avoid screen readers reading the empty spans.

Remediation: Add aria-hidden="true" to all .dot-pulse span elements. Verify that the containing paragraph text ("Thinking up a good opener", "Analysing") provides the full status for screen readers. Consider adding a role="status" aria-live="polite" wrapper around the loading state paragraph so the announcement fires automatically when the state changes.

### M-02 Draggable tweaks panel relies on mouse-only drag

WCAG criterion: 2.1.1 Keyboard (Level A); 2.1.3 Keyboard (No Exception, Level AAA)
Severity: Medium
Location: tweaks-panel.jsx, onDragStart, mousemove/mouseup events

The Tweaks panel header carries a "cursor: move" style and a onMouseDown handler that initiates a drag via mousemove events. There is no keyboard equivalent. A keyboard user cannot reposition the panel. The panel is a developer-facing tool (board style and coach voice toggles), so its impact on Tim's daily use is low, but it must be keyboard operable to meet AAA.

Remediation: Add keyboard arrow-key handling to move the panel position, or provide a way to reset the panel position from the keyboard. Alternatively, remove the drag entirely and use a fixed corner position.

### M-03 Color-only distinction for confidence level dots on the board

WCAG criterion: 1.4.1 Use of Colour (Level A)
Severity: Medium
Location: swot-board.jsx ConfDots; swot-styles.css .conf-dots

Confidence is shown as three dots where filled dots (class "on") are set to var(--fg) (dark) and empty dots stay at var(--border) (light grey). The text label (for example "med") is visible next to the dots, and the aria-label="confidence med" is on the containing span. The dots themselves are decorative given the presence of the label. This is acceptable. However, the conf-dots-label span has font-size: 10px, which is below the design system's smallest size (--text-xs at ~12.5px). At 10px the text may be unreadable for low-vision users at normal zoom.

Remediation: Raise the confidence label font-size to at least var(--text-xs) (~12.5px). The dots can stay decorative since the label provides the text alternative.

### M-04 Board title uses h2 when the page already has an h1 in the header

WCAG criterion: 1.3.1 Info and Relationships (Level A); 2.4.10 Section Headings (Level AAA)
Severity: Medium
Location: swot-board.jsx; swot-app.jsx header h1; swot-intro.jsx h2

The header renders an h1 ("SWOT Builder"). The intro card uses an h2 for the main question ("Let's map it out together."). The board view uses an h2 for the board title. Both are correct heading levels below the h1. However, the interview view has no heading at all: the question text is a paragraph (h2 class "question") not an actual heading element. In HTML, className="question" on a p element does not make it a heading; it is styled like one but screen readers see a paragraph.

The interview question is the most important element on the interview screen and should be a real heading so screen reader users can navigate to it.

Remediation: Change the question element in swot-interview.jsx from a p to an h2. Adjust the CSS accordingly. Ensure the heading hierarchy across all three steps is: h1 in the header (always visible), h2 for the primary content of each step.

### M-05 No visible focus indicator on the input and textarea focus state

WCAG criterion: 2.4.13 Focus Appearance (Level AAA)
Severity: Medium
Location: swot-styles.css, .input:focus and .textarea:focus rules

The :focus-visible rule in colors_and_type.css provides a 3px solid outline with 3px offset, which is a solid focus ring. However, the .input:focus and .textarea:focus rules in swot-styles.css suppress outline with "outline: none" and replace it with a box-shadow. A box-shadow does not form a closed outline that surrounds the component boundary in the way WCAG 2.4.13 Focus Appearance requires. The Focus Appearance criterion requires a focus indicator with an area at least as large as a 2px perimeter around the unfocused component, and contrast of at least 3:1 between focused and unfocused states.

The box-shadow approach (0 0 0 4px var(--accent-subtle)) meets the size requirement only if the shadow is large enough, but box-shadow is rendered outside the border and its contrast depends on what is behind the element. Contrast with the page background needs to be verified at runtime.

Remediation: Retain the :focus-visible outline rule from colors_and_type.css by not overriding it to "none" in the input styles. The box-shadow can remain as a supplementary indicator. Change "outline: none" to "outline-color: transparent" or remove it so the global :focus-visible rule applies.

### M-06 Scope select field uses appearance:auto but has no visible arrow in all browsers

WCAG criterion: 3.3.2 Labels or Instructions (Level A)
Severity: Medium
Location: swot-intro.jsx, scope select element

The scope select element applies appearance: auto and cursor: pointer as inline styles. appearance: auto is correct and will show the native browser arrow. The field does have a label ("What kind of subject is this?") correctly associated via for and id. The issue is that the field-hint paragraph ("Helps me tailor the questions.") is not programmatically associated with the select element. Screen readers will read the label but may not read the hint unless it happens to follow the select in DOM order during sequential reading.

Remediation: Add aria-describedby to the select element pointing to the id of the field-hint paragraph. Apply the same pattern to the title input field which also has a field-hint equivalent (the optional label span). This is a minor fix but ensures the hint is always linked.

---

## Low Findings

These issues are best-practice gaps that do not fail a specific WCAG criterion at the level audited, or are unlikely to affect Tim's specific setup, but should be addressed.

### L-01 Logo SVG has no accessible description

WCAG criterion: 1.1.1 Non-text Content (Level A)
Severity: Low
Location: swot-app.jsx, Logo component

The Logo div carries aria-label="SWOT Builder" which gives the logo container an accessible name. The SVG inside is exposed to the accessibility tree as a child element. The SVG has no role="img" and no aria-hidden="true". Some screen readers may announce the SVG as an unlabelled image in addition to the container label, producing a double announcement. The parent div is not a button, so the label is informational.

Remediation: Add aria-hidden="true" to the SVG inside the Logo so screen readers skip it and rely on the parent's aria-label. Alternatively, move aria-label onto the SVG with role="img" and remove it from the div.

### L-02 Watermark text is not hidden from the accessibility tree

WCAG criterion: 1.1.1 Non-text Content (Level A)
Severity: Low
Location: swot-board.jsx, swot-watermark div; swot-styles.css

The watermark div ("Built with SWOT Builder · 5 items") is decorative. It has pointer-events: none and a reduced opacity but no aria-hidden="true". Screen readers will read it. The text is not harmful, but it is noise in the reading order, particularly because it appears at the end of the SWOT grid, after all quadrant content, and interrupts the natural reading flow. The middle dot character (U+00B7) may be read as "middle dot" or skipped, depending on the screen reader.

Remediation: Add aria-hidden="true" to the swot-watermark div.

### L-03 Print styles hide the header but leave no accessible title on the printed document

WCAG criterion: 2.4.2 Page Titled (Level A)
Severity: Low
Location: swot-styles.css, @media print; index.html

The print CSS hides .app-header, which contains the h1 "SWOT Builder". The printed or saved PDF will have the board title (h2) as its first heading but no h1. The document title in the browser tab is "SWOT Builder" (from index.html title element), which should carry over into the PDF title in most browsers. The visual heading hierarchy of the printed output will start at h2, which is a minor heading order issue for any accessibility tool that inspects the PDF.

Remediation: Either add a separate print-only h1 with the application name and board title, or change the board h2 to h1 in print CSS. This is low priority but should be addressed before the product is used to produce PDFs for shared distribution.

### L-04 Language attributes not set for content in other languages

WCAG criterion: 3.1.2 Language of Parts (Level AA)
Severity: Low
Location: index.html; swot-engine.jsx AI prompt strings

The html element carries lang="en-GB" which is correct. The AI prompt strings in swot-engine.jsx are English, which is consistent. However, the application allows a user to analyse any subject in any language. If a French-speaking user types French text and the AI responds in French, the French content will be rendered without a lang attribute change, causing VoiceOver and JAWS to read it with English pronunciation rules. This is a structural limitation of the application rather than a code defect, but it should be documented as a known limitation.

Remediation: Document this as a known limitation in the exceptions folder. If the application is ever internationalised, add dynamic lang attribute management. For the current scope, the limitation is acceptable provided it is recorded.

---

## Prioritised Remediation List

The following list orders fixes by impact on Tim's ability to use the application and by implementation effort. Fixes in group 1 block testing of the application with VoiceOver and JAWS.

### Group 1: Fix before any screen reader testing

1. C-01 Modal accessibility: add role="dialog", aria-modal, aria-labelledby, focus management, focus trap, and keyboard dismiss.
2. C-07 Toast live region: add role="status" aria-live="polite" to the toast element.
3. C-05 Tag remove buttons: change span.x to button type="button" with aria-label in both locations.
4. C-06 Item edit button visibility on focus: add .item-card:focus-within .item-actions { opacity: 1; } to CSS.
5. H-06 Interview textarea labels: add aria-label to both textareas in swot-interview.jsx.

### Group 2: Fix before handoff to Tim for testing

6. C-02 Landmark structure: add main to intro step; add skip link; verify only one main exists at a time.
7. C-03 Stepper dots: add aria-hidden="true" to dot spans; confirm "Step N of 3" text is sufficient.
8. C-04 Bucket picker AI suggestion state: add aria-label to suggested button including "(AI suggestion)".
9. H-04 Theme toggle state: update aria-label dynamically to describe the action and current state.
10. H-05 Confidence picker group: add role="group" and aria-labelledby; add aria-label to tag input.
11. H-08 Dismiss button label in name: replace "x" with a visible "Dismiss" label or use an accessible icon pattern.
12. M-01 Dot-pulse aria-hidden: add aria-hidden="true" to dot-pulse spans; add role="status" to loading paragraphs.
13. M-04 Interview question heading: change question paragraph to an h2 element.
14. M-05 Input focus outline: remove "outline: none" from .input:focus and .textarea:focus rules.

### Group 3: Fix in the next sprint

15. H-01 AI badge ARIA pattern: restructure dropdown as a menu or listbox per WAI-ARIA specification.
16. H-02 Tweaks panel contrast: replace rgba low-opacity colours with solid values that meet 7:1.
17. H-03 Executive style Strengths letter: change letter colour to white or a lighter green meeting 4.5:1 on navy.
18. H-07 Command symbol: replace Unicode command sign with plain text "Cmd".
19. M-02 Tweaks panel drag: add keyboard reposition or remove drag interaction.
20. M-03 Confidence label font size: raise .conf-dots-label from 10px to at least var(--text-xs).
21. M-06 Scope select aria-describedby: link the field-hint paragraph to the select and title inputs.
22. L-01 Logo SVG: add aria-hidden="true" to the SVG inside Logo.
23. L-02 Watermark aria-hidden: add aria-hidden="true" to the swot-watermark div.
24. L-03 Print heading: add a print-only h1 or promote the board h2 in print CSS.
25. L-04 Language limitation: document the multi-language limitation in the project exceptions folder.

---

## Automated Testing Note

This audit was performed entirely by code inspection because automated tools (axe-core, Pa11y) could not be installed in this environment. The findings above are derived from reading the source and calculating contrast ratios mathematically. Live browser testing will likely surface additional issues, particularly around:

- Actual focus order at runtime when React has rendered all components
- Whether the intro step's div.intro is wrapped in a main at render time
- Actual behaviour of :focus-visible across VoiceOver with Safari and JAWS with Chrome
- Runtime contrast of semi-transparent surfaces where the background depends on scroll position

Before Tim tests the application, the team should run axe-core against the live application at each of the three steps (intro, interview, board) and with the modal, consent dialog, and Tweaks panel open.
