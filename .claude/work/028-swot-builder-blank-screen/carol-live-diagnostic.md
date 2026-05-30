# Carol: Live Diagnostic — SWOT Builder Blank Screen

Tester: Carol
Date: 2026-05-30
Live URL tested: http://projects.timdixon.net/SWOT-Builder/ and https://projects.timdixon.net/SWOT-Builder/
Method: Playwright headless Chromium against the live site; curl to fetch the raw index.html; GitHub API to check deployment history.

---

## Root cause (primary finding)

The GitHub Pages deployment was never triggered for the PR 13 squash-merge commit (`3535146`). The live site is still serving the index.html from the previous commit (`00799cd`), which does NOT include the `connect-src 'self'` fix. The fix is on `origin/main` but has not reached the deployed site.

This is a deployment gap, not a code bug. The code fix is correct. The deployment did not happen.

Confidence: high (confirmed by three independent sources: curl of live index.html, Playwright DOM evaluation of live CSP meta tag, and GitHub API deployment and workflow history).

---

## Verbatim console errors (live site, both http and https, with and without cache bypass)

All six identical across every test variant. These are exact browser console strings:

```
[error] Connecting to 'http://projects.timdixon.net/SWOT-Builder/tweaks-panel.jsx' violates the following Content Security Policy directive: "connect-src https://cdn.jsdelivr.net https://timdixon82.goatcounter.com". The action has been blocked.

[error] Connecting to 'http://projects.timdixon.net/SWOT-Builder/swot-engine.jsx' violates the following Content Security Policy directive: "connect-src https://cdn.jsdelivr.net https://timdixon82.goatcounter.com". The action has been blocked.

[error] Connecting to 'http://projects.timdixon.net/SWOT-Builder/swot-intro.jsx' violates the following Content Security Policy directive: "connect-src https://cdn.jsdelivr.net https://timdixon82.goatcounter.com". The action has been blocked.

[error] Connecting to 'http://projects.timdixon.net/SWOT-Builder/swot-interview.jsx' violates the following Content Security Policy directive: "connect-src https://cdn.jsdelivr.net https://timdixon82.goatcounter.com". The action has been blocked.

[error] Connecting to 'http://projects.timdixon.net/SWOT-Builder/swot-board.jsx' violates the following Content Security Policy directive: "connect-src https://cdn.jsdelivr.net https://timdixon82.goatcounter.com". The action has been blocked.

[error] Connecting to 'http://projects.timdixon.net/SWOT-Builder/swot-app.jsx' violates the following Content Security Policy directive: "connect-src https://cdn.jsdelivr.net https://timdixon82.goatcounter.com". The action has been blocked.
```

The error is the same as the original bug: `connect-src` is missing `'self'`. All six JSX files fail to load. `#root` is empty (children count: 0). Blank screen.

---

## Live CSP (exactly as served, 2026-05-30)

```
default-src 'none'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src https://cdn.jsdelivr.net https://timdixon82.goatcounter.com; img-src 'self' blob: data:; worker-src blob:; child-src blob:;
```

The `connect-src` directive reads `connect-src https://cdn.jsdelivr.net https://timdixon82.goatcounter.com`. It is missing `'self'`. This is the unfixed version.

The fixed version on origin/main (commit 3535146) reads:

```
connect-src 'self' https://cdn.jsdelivr.net https://timdixon82.goatcounter.com
```

---

## Network failures on live site

All six JSX requests fail with CSP block (Playwright failure reason: `csp`). The CDN scripts all load successfully:

```
[200] https://unpkg.com/react@18.3.1/umd/react.development.js
[200] https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js
[200] https://unpkg.com/@babel/standalone@7.29.0/babel.min.js
[200] https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js
```

React, ReactDOM, and Babel Standalone all load. The SRI hashes pass. The only failures are the same-origin JSX files, blocked by `connect-src`.

---

## Cache bypass result

A hard reload (Cache-Control: no-cache headers, fresh browser context) produces the same result. This is not a caching issue on the client side. The server is genuinely serving the old file.

---

## HTTPS variant

https://projects.timdixon.net/SWOT-Builder/ produces the same blank screen and the same six CSP errors. The HTTPS certificate is approved (expires 2026-08-17). The site loads over HTTPS but GitHub Pages does not enforce HTTPS (https_enforced: false per the API).

---

## Why the deployment did not happen

The `pages-build-deployment` workflow (workflow ID 285540538) is a GitHub-managed dynamic workflow, not a file in `.github/workflows/`. It has run exactly once, for commit `00799cd` on 2026-05-29T12:42:10Z. It did not run for commit `3535146` (the squash-merge of PR 13 at 2026-05-30T09:05:22Z).

The CI and Release workflows both ran successfully for commit `3535146`. Only the pages build did not trigger.

The most likely cause is that GitHub Pages failed to receive or process the push event for the squash-merge. This can happen with squash-merges via the GitHub web UI in a window where the Pages service does not pick up the event. The repository's Pages `build_type` is `workflow` (confirmed via API), meaning GitHub Pages waits for the dynamic workflow to be triggered by a push to main; if the event is lost or the workflow is skipped, Pages stays on the previous build.

---

## What Sean needs to do

This is a deployment trigger issue, not a code change. The fix is already correct on origin/main.

Sean needs to trigger a new GitHub Pages build for the current main. One of two options will work:

Option 1 (recommended): Push an empty commit or a trivial whitespace change to main to re-trigger the pages build workflow. This is the most reliable way to force the deployment.

Option 2: In the GitHub repository settings (under Pages), there is sometimes a manual redeploy option in the Actions tab for the pages-build-deployment workflow. Re-running the last pages workflow run may or may not pick up the new commit; a new push is safer.

The code fix (CSP `connect-src 'self'`) is confirmed correct by my PR 13 review (local Playwright test, 2026-05-30). Once the deployment triggers and the live site is updated to commit `3535146`, the blank screen will be gone.

---

## Summary table

| Check | Result |
|---|---|
| `#root` children on live site | 0 (blank) |
| CSP `connect-src` on live site | Missing `'self'` (unfixed version) |
| CDN scripts (React, ReactDOM, Babel, html2canvas) | All 200 OK, SRI passes |
| JSX file requests | All 6 blocked by CSP |
| Cache bypass changes anything | No |
| HTTPS variant different | No (same blank page, same CSP) |
| Fix on origin/main | Yes (commit 3535146) |
| Pages deployment for commit 3535146 | Never triggered |
| Root cause | GitHub Pages build was not triggered for the squash-merge |

---

Token count: approximately 18,000 input tokens / 2,500 output tokens.

---

## Live re-verification — 2026-05-30 (post-redeploy for commit cf95abc)

Verdict: **FIXED on live**

Pages was misconfigured and a new "pages build and deployment" run for commit cf95abc completed successfully. This re-verification confirms the fix is now live on both the HTTP and HTTPS variants.

### Method

Playwright headless Chromium, fresh browser context per URL, cache bypass headers (`Cache-Control: no-cache, no-store, must-revalidate` and `Pragma: no-cache`), CSP enforcement left active (not bypassed). Tested 2026-05-30.

### Check 1: Intro screen renders (not blank)

`#root` children: **1** (not 0). The root element contains the full app shell.

The intro heading "Let's map it out together." is present as an H2 element. The app header H1 "SWOT Builder" is also present.

Intro screen form fields confirmed present:
- Subject input: `<input type="text" id="subject" placeholder="e.g. Launching our new podcast">`
- Scope select: `<select id="scope">`
- Title input: `<input type="text" id="title" placeholder="Auto-generated from subject">`

Start button present: yes — button text "Start the interview →".

Both http:// and https:// variants render identically.

### Check 2: Console messages — zero CSP violations, zero errors

Console errors: **0**

Console warnings: **1** — `You are using the in-browser Babel transformer. Be sure to precompile your scripts for production`. This is a development-mode advisory from Babel Standalone, not an error. It was present before the bug and is expected for this architecture.

No CSP violations. No script errors. No network failures.

### Check 3: Live CSP connect-src includes 'self'

Verbatim content of `<meta http-equiv="Content-Security-Policy">` as evaluated from the live DOM:

```
default-src 'none'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' https://cdn.jsdelivr.net https://timdixon82.goatcounter.com; img-src 'self' blob: data:; worker-src blob:; child-src blob:;
```

The `connect-src` directive now reads `connect-src 'self' https://cdn.jsdelivr.net https://timdixon82.goatcounter.com`. The `'self'` token is present. This is the fixed version.

### Check 4: Interactivity and skip link

Start button: present and focusable (button text "Start the interview →").

Theme toggle: present (button with `aria-label="Switch to dark mode"`).

Skip link: present — `<a href="#root">Skip to main content</a>`.

Keyboard focus tab order (first three Tab presses from page load): example-subject buttons are reachable immediately, confirming keyboard navigation is functional.

### Re-verification summary table

| Check | Previous result | New result |
|---|---|---|
| `#root` children | 0 (blank) | 1 (app rendered) |
| Intro heading present | No | Yes: "Let's map it out together." (H2) |
| Subject input present | No | Yes (`id="subject"`) |
| Scope select present | No | Yes (`id="scope"`) |
| Title input present | No | Yes (`id="title"`) |
| Start button present | No | Yes ("Start the interview →") |
| Theme toggle present | No | Yes (aria-label: "Switch to dark mode") |
| Skip link present | No | Yes ("Skip to main content") |
| CSP `connect-src` includes `'self'` | No | Yes |
| CSP violations in console | 6 | 0 |
| Network failures | 6 JSX files blocked | 0 |
| HTTP variant | Blank | Fixed |
| HTTPS variant | Blank | Fixed |

Token count: approximately 4,500 input tokens / 1,200 output tokens (this re-verification pass).
