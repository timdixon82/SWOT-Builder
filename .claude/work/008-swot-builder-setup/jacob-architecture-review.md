# SWOT-Builder Architecture Review and Decision Records

Author: Jacob, architect.
Date: 2026-05-22.
Repository: timdixon82/SWOT-Builder, branch main.
Status: backfill review of an adopted project. The code already exists; this review records the architecture that is in place and judges it.

## Purpose of this document

The team adopted SWOT-Builder on 2026-05-22 from files Tim supplied. No architecture review was done at the time. This document backfills that review. It describes the architecture as built, judges each significant choice, and records the choices as Architecture Decision Records (ADRs) so later work has a baseline to conform to.

This is a review, not a rebuild. Where the architecture is sound, the ADR records it as accepted. Where I have a concern, the review states it plainly and the matching ADR carries the concern as a consequence. Open questions for Tim are gathered at the end.

## What SWOT-Builder is

SWOT-Builder is a browser application. It runs a guided interview that helps a person build a SWOT analysis, which sorts findings into four groups: Strengths, Weaknesses, Opportunities, and Threats. The interview is assisted by artificial intelligence (AI) that runs inside the browser. There is no server, no application programming interface (API) key, and no account. The finished analysis is shown as a four-cell board that the person can print, copy as an image, or download as Markdown.

The whole application is a set of static files served over Hypertext Transfer Protocol (HTTP). The person's data stays on their own machine.

## Summary judgement

The architecture is coherent and well matched to its goal. The goal is a private, install-free tool, and every major choice serves that goal: no server, no build step, browser-local AI, and state kept in the browser. The code is clear and the layering is sensible.

I am recording seven decisions as ADRs. Five I judge sound and record as accepted. Two I judge sound in intent but carrying a real risk that later work should address: the unpinned WebLLM Content Delivery Network (CDN) URL, and the dependence on Content Delivery Networks for the whole framework. Neither blocks adoption. Both are written up so Sonja can put a choice to Tim.

The stack does not match any of the three the team had on record (static front end, PHP with MariaDB, WordPress). It is a fourth: a browser application built from static files with an in-browser compile step. This review recommends recording it as a new named stack.

## Review by area

### 1. How JavaScript XML runs in the browser with no build step

JavaScript XML (JSX) is the syntax React uses to write user-interface markup inside JavaScript. Browsers cannot run JSX directly. It normally must be compiled to plain JavaScript by a build tool before it reaches the browser.

SWOT-Builder skips the build tool. It loads Babel Standalone from a CDN. Babel Standalone is the Babel compiler packaged to run inside the browser itself. The six application files are declared in `index.html` with `type="text/babel"`:

```
<script type="text/babel" src="swot-engine.jsx"></script>
```

The browser does not execute a `text/babel` script. Babel Standalone finds every such script after the page loads, fetches the file, compiles the JSX to plain JavaScript, and runs the result.

Assessment. This is a deliberate and valid way to ship a React application with no build step. It is the right call for a small single-developer project that wants to stay editable with nothing more than a text editor. It removes a whole class of tooling: no Node.js, no bundler, no package lockfile, no compile script. For a project of this size that is a real saving.

It carries three costs, all known and accepted in the README:

- Compilation happens on every page load, in the visitor's browser. For six small files this is a few hundred milliseconds, which is acceptable. It would not scale to a large code base.
- Babel Standalone is itself a large script to download. It is a development-grade tool, not meant for production traffic at scale.
- `text/babel` scripts will not run from a `file://` path because the browser blocks the follow-up fetch of each `.jsx` file. The application must be served over HTTP. The README documents this.

For this project the trade is correct. The cost matters only at a scale this project is not aiming for. I record it as ADR 0002 and judge it accepted, with the note that if the code base grows past roughly a dozen files or load time becomes visible, the team should revisit and add an offline build step.

### 2. Script loading order and module structure

The application does not use JavaScript modules (`import` and `export`). Every file is a classic script. Each file defines its components and helpers, then attaches the parts other files need onto the global `window` object. Later files read those parts back off `window`.

The load order in `index.html` is fixed and matters:

1. Third-party libraries first: React, ReactDOM, Babel Standalone, html2canvas.
2. `tweaks-panel.jsx` puts `TweaksPanel`, `useTweaks`, and the tweak controls on `window`.
3. `swot-engine.jsx` puts `LocalAI`, `BUCKETS`, the storage helpers, and the AI functions on `window`.
4. `swot-intro.jsx`, `swot-interview.jsx`, `swot-board.jsx` each put one screen component on `window`.
5. `swot-app.jsx` last. It reads everything off `window` and calls `ReactDOM.createRoot`.

Babel processes `text/babel` scripts in document order, so the declared order is the run order.

Assessment. The pattern is the conventional one for a no-build React application, and the code applies it consistently. The dependency direction is clean: the engine and the shared shell load before the screens, and the root controller loads last. There are no circular references.

I have one structural caution. Because the wiring is the `window` object and the load order in `index.html`, the dependency graph is implicit. Nothing fails at load time if a file is added in the wrong place; a screen simply finds `undefined` where it expected a component, and the error surfaces later and is harder to trace. Two small habits keep this safe and should be written into the project coding standards:

- Every file states at its top, in a comment, what it reads off `window` and what it puts on `window`. `swot-engine.jsx` already does this well. The others should match it.
- Any new file is added to `index.html` in an order that respects what it depends on, and the order comment in `index.html` is kept accurate.

The README documents the load order clearly, which is good. I record the structure as ADR 0003 and judge it accepted, with those two habits as conditions.

One naming point, not a fault but worth recording. Because all files share one global scope, React hooks are aliased per file to avoid collisions: `useS_A` in the app, `useS_I` in the interview, `useS_B` in the board. This works and is a reasonable response to the single-scope constraint. It is a direct consequence of the no-modules choice and is noted in ADR 0003.

### 3. The artificial-intelligence backends

This is the most interesting part of the architecture and the part that most needs a clear record, because it decides how the person's data is handled.

The design goal is stated plainly: AI assistance with no server, no API key, and no data leaving the machine. The application meets that goal with a three-tier fallback, managed by the `LocalAI` object in `swot-engine.jsx`.

Tier 1: Chrome built-in AI, the Prompt API at `window.ai`. This is an AI model (Gemini Nano) built into Chrome 127 and later and run on the device by the browser itself. There is no download for the application to manage; at most the browser does a one-time model fetch, and the code shows a loading state while that happens. On `LocalAI.init()` the application probes `window.ai.languageModel`, checks its capabilities, and if usable creates a session. This tier is silent and automatic.

Tier 2: WebLLM on WebGPU. WebLLM is a library that runs a full language model inside the browser using WebGPU, the browser standard for general-purpose graphics-processor work. This tier needs a model to be downloaded into the browser cache. The application does not start this automatically. The WebLLM library script is lazy-loaded from the jsDelivr CDN only when the person explicitly picks a model. Three models are offered, from about 620 megabytes to about 2.4 gigabytes.

Tier 3: manual mode. When no AI is available, the application falls back to a fixed list of twelve pre-written interview questions that rotate across the four quadrants. After each answer the person picks the quadrant themselves. This tier needs no AI and works in every browser, including Firefox and Safari.

The tier in use is chosen at startup. `init()` tries Chrome built-in AI; if that is not available it sets the state to manual mode and stops. WebLLM is never auto-started because its download is large. The rest of the application subscribes to `LocalAI.onStatus()` and updates as the state changes.

Assessment of the fallback design. This is well done. The three tiers are ordered correctly: the zero-cost on-device option first, the large-download option second and only on request, the always-works option last. The fallback is graceful: a person on Firefox or Safari is never blocked, they simply get manual mode. The `__MANUAL__` sentinel is a tidy touch. When AI cannot classify an answer, the engine returns `bucket: "__MANUAL__"`, and the interview screen turns that into an unselected bucket picker, so the person is gently required to choose rather than being given a wrong guess. The data-privacy promise holds in all three tiers: every tier runs on the device, and nothing is sent to a server.

Assessment of the size-based download consent. The README states the policy: models of 50 megabytes or less download automatically with a progress bar; models above 50 megabytes show a consent dialog first. The threshold is `AUTO_DOWNLOAD_THRESHOLD_MB = 50` in `swot-app.jsx`. The consent dialog names the model, shows the download size in gigabytes, states that the model runs on the device and that no data leaves the machine, and warns that WebGPU is required.

The intent is right and the consent dialog itself is good. A multi-gigabyte download must never start without an explicit, informed yes, and it does not. I have one observation worth recording, not a fault in today's behaviour: every model in the catalogue is far above the 50 megabyte line, so the automatic-download branch is currently unreachable. It is dormant code waiting for a small model that may never be added. That is fine, but it means the 50 megabyte figure is, in practice, a setting nobody meets. If a small model is ever added, 50 megabytes on a mobile data plan is still a meaningful download to start without asking. I record this in ADR 0004 and raise it as a question for Tim: keep the threshold, lower it, or remove the automatic branch entirely so every model download always asks.

Assessment of the manual-mode fallback for Firefox and Safari. Correct and necessary. Chrome built-in AI is Chrome-only. WebLLM needs WebGPU, which at the time of writing is behind a flag in Firefox and is recent and partial in Safari. Without tier 3 the application would simply not work for a large share of visitors. Tier 3 makes the core promise, building a SWOT, true in every browser. The README's browser table is honest about which tier each browser gets. I record the backend design as ADR 0004 and judge it accepted, with the consent-threshold question attached.

One security-relevant note for Jed, not an architecture fault. AI output is treated as data, not as markup: titles and descriptions are rendered as React text content, and the engine clamps lengths and validates the bucket letter against the fixed set S, W, O, T. The model is local, but its output is still untrusted, and the code is right to sanitise it. The WebLLM script, by contrast, is third-party code loaded from a CDN and runs with full page rights; that is covered in ADR 0007 and is properly Jed's call.

### 4. The dependency-free design and how it is kept so

"Dependency-free" here has a precise meaning. The project installs nothing. There is no `package.json`, no `node_modules`, no lockfile. It is not that the application uses no libraries; it uses five (React, ReactDOM, Babel Standalone, html2canvas, WebLLM). It is that none of them is installed or built locally. Every one is loaded at run time from a CDN.

This is what keeps the project editable with only a text editor and a static file server, and it is the same decision as the no-build-step choice, seen from the dependency side.

How it is kept so:

- React, ReactDOM, and Babel are pinned to exact versions in the `index.html` CDN links, and each carries a Subresource Integrity (SRI) hash and `crossorigin="anonymous"`. SRI means the browser refuses the file if its content does not match the hash, so a tampered or swapped file cannot run. This is good practice and is done correctly for these three.
- html2canvas is pinned to an exact version (1.4.1) but has no SRI hash.
- WebLLM is loaded from a jsDelivr URL that is not pinned to a version. The URL resolves to whatever jsDelivr currently serves as latest, and it has no SRI hash. The code comment even says "Use npm latest; pin to a specific version tag if you need reproducibility."

Assessment. The dependency-free design is a sound fit for this project, for the same reasons as the no-build choice: it keeps the project simple and approachable. But "no install" is not the same as "no supply chain." Five external libraries still load into the page, and three points need attention:

- React, ReactDOM, Babel: pinned and integrity-checked. Good. No action.
- html2canvas: pinned but not integrity-checked. It should get an SRI hash. Low effort, removes a real risk.
- WebLLM: neither pinned nor integrity-checked. This is the weakest point in the whole architecture. An unpinned dependency means the application can change behaviour, or break, with no change to the repository, simply because the CDN now serves a different version. WebLLM's API could change under it. And with no SRI hash, the browser will run whatever bytes arrive. Because WebLLM runs in the page with full rights, a bad delivery is a serious matter. SRI is hard to combine with an unpinned URL, since the content changes; the fix is to pin WebLLM to an exact version and then add the hash.

I record the dependency-free design as ADR 0005 and judge it accepted. I record the CDN-sourcing of dependencies, with the pinning and integrity gaps, as ADR 0007 and judge it accepted-with-risk: the html2canvas hash and the WebLLM pin-plus-hash should both be done in the setup build. ADR 0007 also notes the wider availability point: if any CDN is unreachable, the application degrades or fails, and there is no offline fallback. For a tool sold on privacy and self-containment, hosting the libraries alongside the application is worth considering. That is the question for Tim attached to ADR 0007.

### 5. Hosting and the build step

Hosting. The application is a set of static files: one HTML file, two JavaScript files, two CSS files, six JSX files, and two font files. It needs only a static file server that sends files over HTTP. It needs no application server, no database, no server-side language. It can be hosted on GitHub Pages, on any static host, or on a plain virtual private server. The one hard requirement is HTTP rather than `file://`, because of the `text/babel` script loading described in area 1.

Assessment. Static hosting is the correct and cheapest choice and matches the no-server goal exactly. GitHub Pages is the natural fit, since the project is already a GitHub repository. The team should confirm the hosting target so the wiki can record it and so any path assumptions (the application uses relative paths throughout, which is correct for this) stay valid. That is a question for Tim.

Build step. There is deliberately no build step. The files in the repository are the files served. Compilation happens in the browser. This is the same decision as area 1, viewed from the deployment side.

Assessment. For this project, no build step is the right answer, and it is a deliberate choice rather than an omission. The README is explicit about it. It keeps deployment trivial: copy the files to a host. The cost, again, is browser-side compile time on every load and the weight of Babel Standalone.

There is a tension to record for the team. Two improvements raised in this review, adding an SRI hash to html2canvas and pinning WebLLM, are small and need no build step. But the deeper improvements, dropping Babel Standalone for a one-off compile and self-hosting the libraries, would each introduce a build step or a vendoring step and so would partly reverse this decision. They are not needed now. The position to hold is: keep the no-build design while the project is small; treat a visible load-time cost, or growth past roughly a dozen files, as the trigger to add an offline build. I record hosting and the no-build stance together as ADR 0006 and judge it accepted, with the hosting target left as a question for Tim.

### 6. State, theme, and export (briefly)

These are not in the task's focus list but are part of the architecture and are quickly judged.

State. All application state (step, session, SWOT items, board style) is held in React state in `SwotApp` and saved to `localStorage` under the key `swot-builder-v1` on every change. The storage key carries a version suffix, `v1`, which is good forward thinking: a future change to the saved shape can move to `v2` without misreading old data. The read path is wrapped in try/catch and tolerates corrupt or absent data. This is sound for a single-device, single-user tool. No ADR of its own; it is part of ADR 0001.

Theme. `theme.js` runs first in the document head, before any stylesheet, and sets `data-theme` on the root element synchronously. This avoids a flash of the wrong colour palette. It is a small, correct piece of design and is the standard way to do this. Part of ADR 0001.

Export. Markdown export builds a string and downloads it as a Blob. Image export uses html2canvas and writes to the clipboard, with a download as fallback when the clipboard API is not available. Print uses the browser's own print dialog. All three are client-side and need no server, consistent with the rest of the architecture. Part of ADR 0001.

## Conformance baseline for later work

Sean's setup build and any later change should conform to the ADRs below. The points most likely to be touched:

- New JSX files go in `index.html` in dependency order, and declare their `window` reads and writes in a top comment (ADR 0003).
- The no-build, no-install design holds. Do not add a `package.json` or a bundler without a new ADR superseding ADR 0002 and ADR 0005.
- New third-party libraries are pinned to an exact version and carry an SRI hash (ADR 0007).
- The data-privacy promise is load-bearing. No code may send the person's interview content, answers, or SWOT items off the device (ADR 0004).
- The `localStorage` key changes to `v2`, never silently, if the saved shape changes (ADR 0001).

## Cross-cutting note for Sonja

Three things in this review are not specific to SWOT-Builder and a future browser-application project would benefit from them. Sonja decides whether they go to the global wiki.

- The stack itself. "Browser application: static files plus in-browser compile" is a fourth stack beyond the three on record. It deserves a page under `docs/stacks/` in the global wiki the first time it is used, which is now.
- The browser-local AI pattern. The three-tier fallback (built-in AI, then WebGPU model, then manual) with size-based download consent is a reusable pattern, and a good one. It is a candidate for `docs/patterns/` in the global wiki.
- The dependency rule. "Pin every third-party library to an exact version and add a Subresource Integrity hash" is a general security and reproducibility rule, not specific to this project. It belongs in the global coding standards.

## Architecture Decision Records

The ADRs below are written for the project wiki's `decisions/` folder. Numbering continues the project's own sequence; if the project wiki already holds decision records, Sonja should renumber to fit. Each ADR states context, decision, alternatives considered, and consequences.

---

### ADR 0001: Browser application built from static files, no server

Status: accepted (backfilled 2026-05-22).

Context. SWOT-Builder helps a person build a SWOT analysis with AI assistance. A core goal is privacy: the person's data must not leave their machine. A second goal is that the tool needs no account and no setup.

Decision. Build the whole application as static files (HTML, CSS, JavaScript) that run entirely in the browser. Use no server, no database, and no server-side language. Hold all state in the browser and persist it to `localStorage` under a versioned key, `swot-builder-v1`.

Alternatives considered.

- A client-server application with a backend API. Rejected: a server able to see the person's data breaks the privacy goal, and it adds hosting cost and an account system.
- A desktop application. Rejected: it needs installation, which the no-setup goal rules out, and it is far heavier to build and ship.

Consequences. The privacy goal is met by construction: with no server there is nowhere for data to go. Hosting is cheap and simple (see ADR 0006). The cost is that state lives on one device in one browser; there is no sync across devices and clearing browser data loses the analysis. The versioned storage key lets a future change to the saved shape migrate cleanly.

---

### ADR 0002: JavaScript XML compiled in the browser with Babel Standalone, no build step

Status: accepted (backfilled 2026-05-22).

Context. The application is written in React with JSX. Browsers cannot run JSX directly; it must be compiled to plain JavaScript. The project wants to stay editable with nothing more than a text editor and a static file server.

Decision. Compile JSX in the browser at run time using Babel Standalone, loaded from a CDN. Application files are declared in `index.html` as `type="text/babel"` scripts. There is no build step and no build tooling in the repository.

Alternatives considered.

- A standard build pipeline (Node.js plus a bundler such as Vite). Rejected for now: it adds tooling, a package lockfile, and a compile step the project does not need at its current size.
- Writing the user interface without JSX, using React's `createElement` directly. Rejected: it makes the screen code far harder to read and maintain.

Consequences. The project needs no install and no build; editing a `.jsx` file and reloading is the whole loop. The costs: Babel compiles on every page load in the visitor's browser, which is acceptable for six small files but would not scale; Babel Standalone is a large development-grade download; and the application cannot run from a `file://` path, so it must be served over HTTP. Trigger to revisit: if load time becomes visible to users, or the code base grows past roughly a dozen files, add an offline build step (which would supersede this ADR).

---

### ADR 0003: No JavaScript modules; files wire together through the global window object

Status: accepted (backfilled 2026-05-22).

Context. The application is split into six files: a shared tweaks shell, an engine, three screens, and a root controller. They must share components and helpers. The no-build choice (ADR 0002) rules out a module bundler.

Decision. Use classic scripts, not JavaScript modules. Each file attaches what others need onto the global `window` object and reads its own dependencies back off `window`. The load order in `index.html` is fixed so that a file's dependencies always load before it: libraries, then the tweaks shell and engine, then the screens, then the root controller last.

Alternatives considered.

- Native JavaScript modules with `import` and `export`. Workable in modern browsers without a bundler, but mixing native modules with `text/babel` scripts is awkward, and `import` of `.jsx` would still need compilation. Rejected to keep the loading model uniform.
- A single large file. Rejected: it would be hard to read and to review.

Consequences. The pattern is simple and needs no tooling. The risk is that the dependency graph is implicit: it lives in the `window` object and the `index.html` order, and a file added in the wrong place fails late and quietly. To contain this, two rules apply to all later work: every file declares, in a top comment, what it reads off `window` and what it writes to `window`; and any new file is inserted into `index.html` in dependency order with the order comment kept accurate. A second consequence: because all files share one scope, React hooks are aliased per file (for example `useS_A`, `useS_I`, `useS_B`); this is expected and acceptable.

---

### ADR 0004: Three-tier browser-local AI with size-based download consent

Status: accepted (backfilled 2026-05-22).

Context. The application offers AI help to classify interview answers and suggest questions. It must do this without a server, without an API key, and without sending the person's data off the device. Browser support for on-device AI varies widely.

Decision. Use a three-tier AI design, managed by the `LocalAI` object, chosen at startup with graceful fallback:

1. Chrome built-in AI (the `window.ai` Prompt API, Gemini Nano). Tried automatically; no download for the application to manage.
2. WebLLM on WebGPU. Started only when the person explicitly picks a model. Models are several hundred megabytes to a few gigabytes and are cached in the browser after first download.
3. Manual mode. A fixed rotation of pre-written questions; the person picks the quadrant. Works in every browser.

Apply size-based download consent for tier 2: models of 50 megabytes or less may download automatically with a progress bar; models above 50 megabytes show a consent dialog first that names the model, states the download size, and confirms that the model runs on the device. AI output is treated as untrusted data: it is rendered as text, never as markup, and its fields are length-clamped and the bucket value validated against S, W, O, T.

Alternatives considered.

- A single cloud AI API. Rejected: it needs an API key and sends the person's data to a third party, breaking the privacy goal.
- WebLLM only. Rejected: it would force a large download on every user and would exclude browsers without WebGPU.
- No fallback (AI required). Rejected: it would leave Firefox and Safari users with a broken application.

Consequences. The privacy goal holds in every tier; all AI runs on the device. Every browser can complete a SWOT, because manual mode always works. The design is more code than a single backend, but the `LocalAI` abstraction keeps the rest of the application unaware of which tier is active. Open point: every model currently in the catalogue is well above the 50 megabyte threshold, so the automatic-download branch is unreachable today. The threshold is therefore an effective no-op and should be confirmed, lowered, or removed (see question Q27). The privacy promise is load-bearing: no later change may send interview content, answers, or SWOT items off the device without a new ADR superseding this one.

---

### ADR 0005: Dependency-free project; no install, no lockfile

Status: accepted (backfilled 2026-05-22).

Context. The project wants to stay simple to edit and to host. A standard install step (`package.json`, `node_modules`, a lockfile) adds tooling the project's size does not justify.

Decision. Install nothing locally. Keep no `package.json`, no `node_modules`, and no lockfile. Load every third-party library at run time from a CDN. The repository holds only source files and fonts.

Alternatives considered.

- Install dependencies with a package manager and vendor them into the repository. Rejected for now: it adds an install step and tooling; but note ADR 0007 records a related availability concern.

Consequences. The project stays editable with a text editor and runnable with a static file server. The cost is that "no install" is not "no supply chain": five libraries still load into the page, and their integrity and availability must be managed at the CDN-link level, which ADR 0007 covers. This ADR governs the no-install stance; ADR 0007 governs how the CDN dependencies are pinned and verified.

---

### ADR 0006: Static hosting over HTTP; no build or deploy step

Status: accepted (backfilled 2026-05-22).

Context. The application is a set of static files (ADR 0001) compiled in the browser (ADR 0002). It needs to be served somewhere.

Decision. Host the application on a static file server that serves files over HTTP. Deploy by copying the repository files to the host; there is no build step and no deploy pipeline. The application uses relative paths so it works from any base path. The one hard requirement is HTTP rather than `file://`, because in-browser JSX loading needs it.

Alternatives considered.

- A virtual private server running an application server. Rejected: unnecessary, since there is no server-side code.
- A build-and-deploy pipeline producing a compiled bundle. Rejected for now: it would reverse the no-build choice (ADR 0002) for a project that does not need it.

Consequences. Hosting is cheap and simple, and GitHub Pages is the natural fit since the project is already on GitHub. Deployment is a file copy. The cost is the same browser-side compile cost as ADR 0002. The exact hosting target is not yet recorded and should be confirmed (see question Q28). Trigger to revisit: a build step would only be justified if ADR 0002 is revisited.

---

### ADR 0007: Third-party libraries loaded from Content Delivery Networks; pin and integrity-check them

Status: accepted with risk (backfilled 2026-05-22).

Context. Following ADR 0005, all five third-party libraries (React, ReactDOM, Babel Standalone, html2canvas, WebLLM) load at run time from CDNs. As built: React, ReactDOM, and Babel are pinned to exact versions and carry Subresource Integrity (SRI) hashes; html2canvas is pinned but has no SRI hash; WebLLM is loaded from an unpinned "latest" jsDelivr URL with no SRI hash. WebLLM runs in the page with full page rights.

Decision. Keep loading libraries from CDNs (consistent with ADR 0005), but require every CDN-loaded library to be pinned to an exact version and to carry an SRI hash. Bring the two gaps into line: add an SRI hash to html2canvas, and pin WebLLM to an exact version and then add its SRI hash.

Alternatives considered.

- Leave the gaps as built. Rejected: an unpinned, unverified library can change behaviour or break with no repository change, and WebLLM runs with full page rights, so a bad delivery is a security matter.
- Self-host (vendor) all libraries inside the repository. Not adopted in this ADR, but recorded as the stronger option: it removes the CDN as a dependency and a single point of failure, at the cost of larger repository files and a vendoring step. This is offered to Tim as question Q29.

Consequences. With every library pinned and hashed, the application is reproducible and protected against a tampered or swapped file: the browser refuses any file whose content does not match its hash. A residual risk remains and is accepted for now: the application still depends on the CDNs being reachable, and there is no offline fallback if a CDN is down. Resolving that residual risk fully means self-hosting, which is question Q29 for Tim. Until then this ADR stands as accepted-with-risk, and the pin-and-hash work is a condition on the setup build.

## Questions for Tim

These are gathered for Sonja to put to Tim in one batch. Numbering continues the engagement sequence and starts at Q26.

Q26. The SWOT-Builder stack does not match any of the team's three recorded stacks (static front end, PHP with MariaDB, WordPress). It is a fourth: a browser application built from static files with in-browser JSX compilation. How should the team record it?

- Option A: record it as a new named stack, "Browser application," with its own page under `docs/stacks/` in the global wiki, written now and reusable by future browser-application projects. (Recommended.)
- Option B: treat it as a variant of the static front-end stack and note the differences inline on that stack's page.
- Option C: keep it project-specific for now and decide on a global stack page only if a second browser-application project appears.

Recommendation: Option A. The differences from a plain static site (a framework, an in-browser compile step, browser-local AI) are large enough to deserve their own page, and a clean page now saves work later.

Q27. Every WebLLM model in the catalogue is far larger than the 50 megabyte automatic-download threshold, so the automatic-download branch can never run today. What should happen to the threshold?

- Option A: keep the 50 megabyte threshold as written, so the automatic branch is ready if a small model is ever added.
- Option B: remove the automatic-download branch entirely, so every model download always shows the consent dialog, however small the model. (Recommended.)
- Option C: lower the threshold to a smaller figure (for example 10 megabytes) so only genuinely tiny downloads are automatic.

Recommendation: Option B. Always asking before any download is the clearest, safest behaviour, it matches the privacy-first character of the tool, and it removes dormant code. If a small model is added later this can be revisited.

Q28. Where will SWOT-Builder be hosted? The answer needs recording in the project wiki and confirms that the static-hosting assumptions hold.

- Option A: GitHub Pages, from the existing repository. (Recommended.)
- Option B: another static host (for example Netlify or Cloudflare Pages).
- Option C: a static folder on Tim's existing virtual private server.
- Option D: not decided yet; record hosting as open.

Recommendation: Option A. The project is already a GitHub repository, GitHub Pages serves static files over HTTP at no cost, and it needs no extra account or pipeline.

Q29. The application depends on Content Delivery Networks for all five third-party libraries. ADR 0007 already requires pinning and integrity hashes. Should the team go further and self-host (vendor) the libraries inside the repository?

- Option A: keep loading libraries from CDNs, but apply the ADR 0007 fixes (pin html2canvas and WebLLM, add the missing SRI hashes). (Recommended for now.)
- Option B: self-host all five libraries inside the repository, so the application has no run-time dependency on any CDN and works fully offline once loaded.
- Option C: self-host only WebLLM (the largest risk and the only unpinned one) and keep the rest on CDNs.

Recommendation: Option A for the setup build, with Option B noted as a sound future step. The ADR 0007 fixes remove the urgent risk with very little effort. Self-hosting is a real improvement for a privacy-and-self-containment tool, but it adds repository weight and a vendoring step, so it is better treated as a deliberate later decision than folded into the setup build.
