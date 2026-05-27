# Requirements

These requirements were reverse-engineered from the README and source code as of 2026-05-22. They describe the application as it exists today and form the baseline for all future work. Requirements are written as user stories with acceptance criteria. Each acceptance criterion can be tested as either true or false.

## Contents

1. Product overview
2. User role
3. Functional requirements
4. Non-functional requirements
5. Known gaps

---

## 1. Product overview

SWOT Builder is a browser-only application that guides a user through a SWOT (Strengths, Weaknesses, Opportunities, and Threats) analysis. It does this through a structured interview. The application routes answers into a four-quadrant board, which the user can edit, style, and export. All processing runs in the browser. No server, no account, and no API (application programming interface) key are required.

---

## 2. User role

The application has a single user role.

User: any person who wants to produce a SWOT analysis for a subject of their choosing. Subjects include business strategy, personal career planning, a specific project, a team or organisation, or a decision under consideration. The user may or may not be comfortable with AI (artificial intelligence) tools. The application must work without AI.

---

## 3. Functional requirements

### FR-01 Load from any HTTP server

As a user, I want the app to load directly in my browser from any HTTP server, so that I do not need to install software or run a build step.

Acceptance criteria:
- [ ] The app runs from a single `index.html` file served over HTTP.
- [ ] No Node.js, no bundler, and no build step are required to run the app.
- [ ] React 18.3.1, ReactDOM 18.3.1, and Babel Standalone 7.29.0 load from the CDN declared in `index.html`.
- [ ] Each CDN script tag carries a `crossorigin="anonymous"` attribute and an integrity hash.
- [ ] The app renders correctly when served from `python3 -m http.server` or any equivalent HTTP server.
- [ ] The page language is declared as British English (`lang="en-GB"`).
- [ ] A favicon is present and renders as a 2x2 SWOT grid in navy and orange.

### FR-02 Load the correct theme immediately

As a user, I want the app to load the correct theme immediately, so that I never see a flash of the wrong colour scheme when the page loads.

Acceptance criteria:
- [ ] `theme.js` is the first script in `<head>`, before any stylesheet.
- [ ] On load, the script reads `localStorage["td-theme"]` and sets `data-theme` on `<html>` synchronously.
- [ ] If no preference is saved, the script reads `prefers-color-scheme` from the operating system.
- [ ] The result is always either `"light"` or `"dark"`.

### FR-03 See current step and item count in the header

As a user, I want to see my current step and total item count in the header at all times, so that I know where I am in the process.

Acceptance criteria:
- [ ] The header shows a step indicator reading "Step N of 3", where N is 1 (intro), 2 (interview), or 3 (board).
- [ ] The header shows the total count of SWOT items captured, updating in real time.
- [ ] The header contains the app name "SWOT Builder" and the logo.
- [ ] The header contains the AI status badge and the theme toggle button.

### FR-04 Describe my subject before the interview starts

As a user, I want to describe what I am analysing before the interview starts, so that the AI can tailor its questions to my subject.

Acceptance criteria:
- [ ] The intro screen shows a subject field, a scope dropdown, and an optional title field.
- [ ] Focus moves automatically to the subject field when the intro screen loads.
- [ ] The subject field accepts free text. The Start button is disabled until the subject contains at least two non-whitespace characters.
- [ ] Five example subject chips appear below the subject field. Selecting a chip fills the field with that example text.
- [ ] The scope dropdown offers six options: "Business / product strategy", "Personal / career", "Project or initiative", "Team or organisation", "A decision I'm weighing", and "Something else". The default is "Business / product strategy".
- [ ] The title field is optional. When left blank, the board title defaults to "SWOT: {subject}".
- [ ] Pressing Enter in the subject field starts the interview if the subject is valid.
- [ ] Clicking "Start the interview" starts the interview if the subject is valid.

### FR-05 Answer one question at a time

As a user, I want to answer one question at a time, so that the interview feels manageable and focused.

Acceptance criteria:
- [ ] The interview shows one question at a time in a question card.
- [ ] The question card shows the question number and the subject name.
- [ ] An answer textarea is present. Focus moves to the textarea when a new question appears.
- [ ] The textarea accepts multi-line text. Pressing Command plus Enter (or Control plus Enter on Windows) submits the answer.
- [ ] A "Submit answer" button submits the answer. The button is disabled when the answer is empty.
- [ ] A "Skip" button advances to the next question without saving an item.
- [ ] A "Done - Build the board" button is available and is disabled until at least one item has been saved.
- [ ] An "Edit subject" back button returns the user to the intro screen.
- [ ] A sidebar tally shows the count of items in each quadrant and the titles of up to four recent items per quadrant. The tally also shows the total item count.
- [ ] A "Build the board (N)" button in the sidebar advances to the board when N is greater than zero.

### FR-06 Opening question tailored to my subject

As a user, I want the app to generate an opening question tailored to my subject, so that the interview starts on a relevant note.

Acceptance criteria:
- [ ] When the interview screen loads for the first time, the app calls `aiOpeningQuestion` with the subject and scope.
- [ ] While the opening question is loading, a "Thinking up a good opener" skeleton with an animated pulse is shown in place of the question.
- [ ] If AI is unavailable, the fallback opening question is: "Let's start with what's going well -- what do you see as the biggest strength of [subject] right now?".

### FR-07 Automatic AI detection

As a user, I want the app to detect an available AI automatically, so that I benefit from AI routing without any setup.

Acceptance criteria:
- [ ] On script load, `LocalAI.init()` runs immediately and without blocking the UI.
- [ ] The app first checks for `window.ai.languageModel` (Chrome Prompt API, available in Chrome 127 and later). If available and ready, it creates a language model session and sets status to "ready".
- [ ] If the Chrome Prompt API reports `available === "after-download"`, the app shows a loading state and tracks download progress before setting status to "ready".
- [ ] If the Chrome Prompt API is absent or unavailable, the app sets type to "offline" and status to "unavailable" without attempting a WebLLM download.
- [ ] All subscribers registered via `LocalAI.onStatus()` receive the current state immediately on registration and on every subsequent change.
- [ ] The AI status badge in the header reflects the current status at each stage: detecting, downloading or loading, ready, and unavailable.

### FR-08 Load a WebLLM model in the browser

As a user, I want to load a WebLLM model in my browser so that I can use AI when the Chrome Prompt API is not available.

Acceptance criteria:
- [ ] When AI status is "unavailable" and WebGPU (graphics processing unit interface) is present, the AI badge shows "Load AI model" with a dropdown indicator.
- [ ] Clicking the badge opens a model picker dropdown listing three models: Llama 3.2 1B (620 MB, basic quality), Llama 3.2 3B (1.9 GB, good quality), and Phi 3.5 Mini (2.4 GB, best quality).
- [ ] Each model entry shows its label, quality rating, download size, and a short description.
- [ ] The WebLLM CDN script is lazy-loaded only when the user selects a model. It is not fetched on initial page load.
- [ ] For any model larger than 50 MB, the app shows a consent modal before starting the download. The consent modal states the model name, size, and that the model runs on-device with no data leaving the machine.
- [ ] The user may cancel the consent modal. Cancelling does not start a download.
- [ ] Confirming the consent modal starts the download.
- [ ] A progress bar fixed to the bottom of the viewport shows the download percentage. The progress bar has `role="status"` and `aria-live="polite"`.
- [ ] After a successful download, the model is cached in the browser. Subsequent loads do not re-download.
- [ ] After a failed download, a toast message reads "Download failed. WebGPU may not be supported in this browser."

### FR-09 AI suggests a SWOT item and follow-up question

As a user, I want the AI to suggest a SWOT item and a follow-up question after each of my answers, so that I do not have to categorise everything myself.

Acceptance criteria:
- [ ] After submitting an answer, the app calls `aiProcessAnswer` with the subject, scope, conversation history (last six turns), the question asked, the answer given, and the current counts for each quadrant.
- [ ] The AI prompt instructs the model to balance coverage across all four quadrants over time.
- [ ] The AI returns a JSON object with three fields: `item` (bucket, title, description, tags), `next_question`, and `coach_note`.
- [ ] The `bucket` field is validated to one of "S", "W", "O", or "T". Any other value is treated as `"__MANUAL__"`.
- [ ] The `title` field is truncated to 80 characters. The `description` field is truncated to 400 characters. Tags are limited to four entries, each truncated to 24 characters.
- [ ] A suggestion card appears showing the AI-suggested bucket, a title input, a description textarea, a tag editor, and a confidence picker.
- [ ] The AI-suggested bucket is pre-selected unless the bucket is `"__MANUAL__"`, in which case no bucket is pre-selected.
- [ ] The user may change the bucket, title, description, tags, and confidence before saving.
- [ ] A "Save to [quadrant]" button is disabled until the user has selected a bucket.
- [ ] A "Discard" button discards the suggestion and advances to the next question without saving an item.
- [ ] When the AI returns `item: null`, the suggestion card does not appear and the interview advances directly.
- [ ] A coach note, when present, appears in italic below the question. It does not appear alongside the suggestion card.

### FR-10 Complete the interview without AI

As a user, I want to complete the interview without AI, so that the app works in any browser including Firefox and Safari.

Acceptance criteria:
- [ ] When AI is unavailable, pre-canned questions from a list of twelve rotate through the interview. The list covers all four quadrants.
- [ ] A non-blocking banner reads "Manual mode -- AI not loaded. Questions are pre-generated; you choose which quadrant each answer belongs in."
- [ ] If the user's browser supports WebGPU, the banner includes a "Load AI model" button.
- [ ] The banner has a dismiss button. Dismissing it hides it for the rest of the session.
- [ ] When AI is unavailable, `aiProcessAnswer` returns the first sentence of the user's answer as the title (up to 60 characters), the full answer as the description, an empty tags array, and the next offline question. The bucket is set to `"__MANUAL__"`.
- [ ] The suggestion card still appears and the user must select a bucket before saving.

### FR-11 See all SWOT items on a four-quadrant board

As a user, I want to see all my SWOT items on a four-quadrant board, so that I can review, share, and export the result.

Acceptance criteria:
- [ ] The board displays four quadrants: Strengths (S), Weaknesses (W), Opportunities (O), and Threats (T).
- [ ] Each quadrant header shows the quadrant letter, name, meta description, and item count.
- [ ] Each item card shows the item title, description, tags prefixed with "#", and a confidence indicator (except in the Pills style).
- [ ] Each quadrant contains an "+ Add a [type]" button that opens the add item modal.
- [ ] The board title and subject name appear above the board.
- [ ] A watermark reading "Built with SWOT Builder - N items" appears below the grid. The watermark is hidden when printing.
- [ ] A board style picker offers four styles: Classic, Executive, Bold, and Pills.
- [ ] An "Add more via interview" button returns the user to the interview.
- [ ] A "Restart" button asks for confirmation, then clears all state and returns to the intro screen.

### FR-12 Choose from four board visual styles

As a user, I want to choose from four board visual styles, so that I can present the result in the way that best fits my audience.

Acceptance criteria:
- [ ] Classic style: coloured 2x2 quadrants.
- [ ] Executive style: navy headers with clean cells.
- [ ] Bold style: editorial typography with left-side colour bars.
- [ ] Pills style: compact chip layout. Item descriptions and tags are hidden in this style.
- [ ] Changing the style updates the board immediately without a page reload.
- [ ] The selected style persists in `localStorage` alongside the rest of the app state.

### FR-13 Edit, move, or delete any item on the board

As a user, I want to edit, move, or delete any item directly on the board, so that I can correct mistakes without restarting the interview.

Acceptance criteria:
- [ ] Each item card has an edit button. Activating it opens the item editor modal.
- [ ] The item editor modal shows the quadrant picker, title field, description textarea, tag editor, confidence picker, and (if present) the source question in italic.
- [ ] The user may change the quadrant, title, description, tags, or confidence, then save. Saving moves the item to the correct quadrant if the quadrant changed.
- [ ] A "Delete" button removes the item after confirmation. A toast message reads "Deleted".
- [ ] A "Cancel" button closes the modal without saving changes.
- [ ] Clicking outside the modal closes it without saving changes.
- [ ] Saving an edit shows a toast message reading "Updated".
- [ ] Adding an item from the board shows a toast message reading "Added".

### FR-14 Export the SWOT board in multiple formats

As a user, I want to export my SWOT board in multiple formats, so that I can include it in reports, presentations, or share it with others.

Acceptance criteria:
- [ ] A "Save as PDF" button calls `window.print()`, which opens the browser's print dialog. The watermark is hidden in the printed output.
- [ ] A "Copy image" button uses html2canvas (version 1.4.1) to render the board at 2x scale and writes a PNG (portable network graphic) to the clipboard. If clipboard write access is denied, the image is downloaded as a PNG file instead. A toast message confirms the outcome.
- [ ] A "Markdown" button generates a Markdown document and downloads it with the board title as the filename. A toast message reads "Markdown downloaded".
- [ ] html2canvas loads asynchronously and the app degrades gracefully if it has not yet loaded.
- [ ] If html2canvas has not loaded when the user clicks "Copy image", the toast reads "Image library loading... try again in a sec".

### FR-15 Floating Tweaks panel for style and coach tone

As a user, I want a floating panel where I can change the board style and coach tone, so that I can adjust the experience without navigating to a settings screen.

Acceptance criteria:
- [ ] The Tweaks panel is a floating panel fixed to the bottom-right corner of the viewport.
- [ ] The panel is draggable. Dragging is constrained to stay within the viewport with a 16-pixel margin on all sides.
- [ ] The panel has two sections: "Board look" and "Coach voice".
- [ ] The Board look section contains a radio control for visual variation with four options: Classic, Executive, Bold, and Pills.
- [ ] The Coach voice section contains a radio control for tone with three options: Friendly, Concise, and Playful.
- [ ] The panel opens when it receives an `__activate_edit_mode` window message and closes on `__deactivate_edit_mode`. Closing the panel posts `__edit_mode_dismissed` to the parent window.
- [ ] The panel is hidden by default and does not appear unless activated.

### FR-16 Progress survives a page refresh

As a user, I want my progress to survive a page refresh, so that I do not lose my work if I accidentally reload the browser.

Acceptance criteria:
- [ ] On every state change, the app writes step, session, SWOT items, and board style to `localStorage` under the key `"swot-builder-v1"`.
- [ ] On load, the app reads `"swot-builder-v1"` from `localStorage` and restores the step, session, SWOT items, and board style.
- [ ] If `localStorage` read or write fails, the app fails silently and continues without persistence.
- [ ] The "Restart" button clears `localStorage` under the key `"swot-builder-v1"` as well as resetting in-memory state.

### FR-17 Switch between light and dark mode

As a user, I want to switch between light and dark mode, so that I can use the app comfortably in different lighting conditions.

Acceptance criteria:
- [ ] The header contains a theme toggle button with an accessible label "Toggle theme".
- [ ] The button shows a sun icon in dark mode and a moon icon in light mode.
- [ ] Clicking the button toggles `data-theme` on `<html>` between `"light"` and `"dark"` and saves the choice to `localStorage["td-theme"]`.
- [ ] Dark mode follows the OS `prefers-color-scheme` on first visit if no preference is saved.
- [ ] All colour pairs in both themes meet WCAG (Web Content Accessibility Guidelines) 2.2 AAA (7:1 contrast ratio for normal text).

---

## 4. Non-functional requirements

### NFR-01 Accessibility

The app must meet WCAG 2.2 at AAA conformance throughout.

Acceptance criteria:
- [ ] All colour pairs used in the design system meet the 7:1 contrast ratio required by WCAG 2.2 AAA for normal text.
- [ ] All interactive elements are reachable and operable by keyboard alone.
- [ ] All icon buttons have accessible labels via `aria-label` or `title`.
- [ ] All form fields have visible, programmatically associated labels.
- [ ] The mini SWOT grid on the intro screen is marked `aria-hidden="true"` because it is decorative.
- [ ] The download progress bar carries `role="status"` and `aria-live="polite"` so screen readers announce progress updates.
- [ ] The confidence indicator dots carry an `aria-label` describing the level.
- [ ] The model picker dropdown carries `role="listbox"` and `aria-label="Choose AI model"`. Each model option carries `role="option"`.
- [ ] The AI badge button carries `aria-expanded` reflecting whether the dropdown is open.
- [ ] The theme toggle carries `aria-label="Toggle theme"`.
- [ ] The page has exactly one `<h1>` element, which reads "SWOT Builder".

### NFR-02 No mouse-only interaction patterns

The app must not use any mouse-only interaction patterns.

Acceptance criteria:
- [ ] All modals can be closed by keyboard via a visible close button or Escape key behaviour.
- [ ] All dropdowns can be operated by keyboard.
- [ ] Tag removal is operable via keyboard.

### NFR-03 Browser compatibility

The core app, running in manual mode, must work in all major evergreen browsers.

Acceptance criteria:
- [ ] The app works in Chrome, Edge, Firefox, and Safari in manual mode.
- [ ] The Chrome Prompt API works only in Chrome 127 and later. The app does not fail in other browsers when this API is absent.
- [ ] WebLLM via WebGPU works in Chrome 113 and later and Edge 113 and later.
- [ ] "Copy as image" works in Chrome, Edge, Firefox 127 and later, and Safari 13.4 and later.
- [ ] Print to PDF works in all four browsers.

### NFR-04 Privacy

The app must not send any user data to a server.

Acceptance criteria:
- [ ] No network requests are made with user content (subject, scope, answers, or SWOT items).
- [ ] All AI processing uses browser-local backends.
- [ ] The app has no server component and requires no API key.
- [ ] All state is stored only in `localStorage` on the user's own device.
- [ ] The WebLLM model download consent dialog explicitly states that no data leaves the machine.

### NFR-05 Performance and loading

The app must load quickly and not trigger unnecessary downloads.

Acceptance criteria:
- [ ] The app loads without a build step. All dependencies are loaded from CDN.
- [ ] The WebLLM CDN script is lazy-loaded only when the user explicitly selects a model.
- [ ] WebLLM models larger than 50 MB require explicit user consent before the download starts.
- [ ] After a model is downloaded, it is cached in the browser. Subsequent sessions do not re-download it.
- [ ] The download progress bar updates smoothly (transition of 400 milliseconds) as the download progresses.

### NFR-06 Resilience

The app must degrade gracefully when AI is unavailable or when optional features fail.

Acceptance criteria:
- [ ] If no AI backend is available, the app runs in manual mode. The full interview and board experience remains available.
- [ ] If `html2canvas` has not yet loaded when the user attempts to copy an image, the app shows a toast rather than throwing an error.
- [ ] If `html2canvas` is loaded but the clipboard write fails, the app downloads the image as a file instead and shows an appropriate toast.
- [ ] If `localStorage` is unavailable, the app continues without state persistence and does not throw errors.
- [ ] If the AI backend returns a response that cannot be parsed as JSON, the app falls back to the manual-mode suggestion card.
- [ ] The script loading order defined in `index.html` must be maintained.

---

## 5. Known gaps

The following gaps were identified during the backfill review. They are recorded here pending Tim's decisions on questions Q26 to Q29.

- Coach tone setting gap: the Coach voice control in the Tweaks panel (Friendly, Concise, Playful) stores its value in state but the AI prompt in `swot-engine.jsx` does not read it. Interview questions are always generated with the same tone regardless of the setting. See question Q26.
- Tag removal keyboard access: tag removal uses `<span>` elements with click handlers. Spans are not natively keyboard-accessible. See question Q27.
- Modal focus trapping: modals do not trap keyboard focus. A keyboard user can tab outside the modal to content behind it. See question Q28.
- Page title not updated on step change: the page title is always "SWOT Builder" and does not change when the user moves between the three steps. See question Q29.
