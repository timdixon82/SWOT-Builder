# Security Review: SWOT-Builder

Reviewer: Jed (security agent)
Date: 2026-05-22
Repository: timdixon82/SWOT-Builder, branch main
Standards: OWASP Top 10 (2021 edition); UK General Data Protection Regulation (UK GDPR)

---

## Summary

SWOT-Builder is a static browser application with no server, no back-end, and no application programming interface (API) key. All user data stays in the browser. The security surface is small but not zero. Two concerns are rated medium severity. There are no high-severity findings. The data-protection position is straightforward: no personal data is transmitted, so most UK GDPR obligations do not apply. A residual consideration about what users might type is noted below.

---

## 1. OWASP Top 10 Mapping

### A01 Broken Access Control

Not applicable. There is no server, no user account system, and no server-side authorisation. All state is held in the browser's localStorage under the key `swot-builder-v1`. A user cannot access another user's data because there is no shared server store.

### A02 Cryptographic Failures

No cryptographic operations are performed. Data in localStorage is held in plaintext. That is the correct approach for this kind of application: the data is owned by the person using the browser, and encrypting it client-side would not protect it from someone with physical access to that device, which is out of scope for a browser application.

### A03 Injection

The application uses React 18, which escapes all string values before placing them into the Document Object Model (DOM). No use of React's unsafe raw-HTML insertion API, direct DOM property assignment, or dynamic script evaluation was found anywhere in the codebase. User-supplied text (subject, scope, title, answers, tags) flows only into React state and is rendered through JSX, which HTML-encodes all string children. No injection risk is present.

The AI prompt in `swot-engine.jsx` (lines 247 to 274) embeds user-supplied text directly into a string that is sent to the local AI backend. Because that backend is either Chrome's on-device Gemini Nano (`window.ai`) or a locally running WebLLM model, this is not a server-side injection. The AI output is parsed with `extractJson` and every field is capped and validated before use (lines 311 to 319). Prompt injection is a theoretical concern with AI systems, but the worst outcome here is a malformed or misleading suggestion card; the user reviews every suggestion before saving it to the board. The application architecture itself contains this risk.

### A04 Insecure Design

No security-sensitive operations are delegated to the browser in a way that could be bypassed. The AI suggestion is always presented for user review before it is committed to the SWOT board. The consent dialog for large model downloads is implemented in `swot-app.jsx` (lines 62 to 114) and correctly gates any download over 50 MB.

### A05 Security Misconfiguration

The HTML file has no Content Security Policy (CSP) header or meta tag. This is the first medium-severity finding. Without a CSP, the browser applies no restriction on what scripts can load or what origins can be contacted. In a static file served without a web server, HTTP response headers are not available, but a CSP can be delivered as a `<meta http-equiv="Content-Security-Policy">` tag inside `<head>`.

The Referrer-Policy is also absent. Without it, the browser defaults to `strict-origin-when-cross-origin` in modern browsers, which is acceptable, but an explicit declaration is a defence-in-depth measure.

The application also has no Permissions-Policy header. This does not constitute a vulnerability on its own.

### A06 Vulnerable and Outdated Components

All CDN-loaded libraries are pinned to specific versions.

- React 18.3.1 (unpkg, with SHA-384 Subresource Integrity hash)
- ReactDOM 18.3.1 (unpkg, with SHA-384 Subresource Integrity hash)
- Babel Standalone 7.29.0 (unpkg, with SHA-384 Subresource Integrity hash)
- html2canvas 1.4.1 (unpkg, no Subresource Integrity hash)

The html2canvas script at `index.html` line 24 is loaded without a Subresource Integrity (SRI) hash. This is the second medium-severity finding. If unpkg serves a compromised version of html2canvas, the browser will execute it without complaint. html2canvas handles DOM-to-canvas rendering and could, in theory, exfiltrate the rendered SWOT board to a third-party endpoint if maliciously modified.

The WebLLM script (`@mlc-ai/web-llm`) is lazy-loaded from jsDelivr at runtime in `swot-engine.jsx` (lines 156 to 165) without an integrity hash. The README acknowledges this: "Use npm latest; pin to a specific version tag if you need reproducibility." This is a meaningful gap. jsDelivr is a reputable CDN and the risk is low in practice, but the comment itself flags that this is unresolved.

Babel Standalone is worth a separate note. Using it to compile JSX in the browser at runtime is unconventional. It is safe in this application because it compiles only the application's own local `.jsx` files, which are served from the same origin. There is no mechanism by which user input could be fed to the Babel compiler.

### A07 Identification and Authentication Failures

Not applicable. There are no accounts, sessions, or authentication flows.

### A08 Software and Data Integrity Failures

Related to the finding in A06. The html2canvas and WebLLM scripts are loaded from external CDNs without SRI hashes. If the CDN were compromised, the browser would execute the substituted script.

### A09 Security Logging and Monitoring Failures

Not applicable. This is a client-side static application. There is no server-side logging. The application uses `console.error` sparingly (one call at `swot-board.jsx` line 249) and does not log any user content.

### A10 Server-Side Request Forgery

Not applicable. There is no server.

---

## 2. Data Protection Position (UK GDPR)

### What data the application holds

The application collects two categories of data.

The first category is session configuration: the subject of the SWOT analysis, the scope type (business, personal, project, and so on), and the board title. These are free-text fields typed by the user.

The second category is SWOT content: the answers the user gives during the interview, and the items that the user saves to the four quadrants (Strengths, Weaknesses, Opportunities, Threats), including titles, descriptions, tags, and confidence levels.

Both categories are stored in `localStorage` under the key `swot-builder-v1`. The JavaScript functions `saveState` and `loadState` in `swot-engine.jsx` (lines 22 and 23) manage this storage. Neither category is transmitted to any server.

### Does any data leave the browser?

No data entered by the user leaves the browser. The following verifications support that position.

The Chrome Prompt API (`window.ai.languageModel`) is a browser-native interface. Calls to `_session.prompt(prompt)` are handled by the browser itself. Google publishes that the model runs on-device inside the browser process. No network call is made to a remote endpoint by the application when using this backend.

The WebLLM backend calls `CreateMLCEngine(modelId, ...)` from the `@mlc-ai/web-llm` library. The model weights are downloaded once from the mlc.ai model repository (via jsDelivr or a CDN) and cached in the browser's cache. The prompt string is then processed locally by the downloaded model using WebGPU. The application does not make any network requests to a remote endpoint with user content. The WebLLM library itself communicates with the CDN only to download model weights, not to send prompts.

The export functions in `swot-board.jsx` are local: `exportMarkdown` creates a Blob and triggers a browser download (lines 213 to 221); `copyAsImage` uses `html2canvas` to render to a canvas and then calls the clipboard API or triggers a browser download (lines 224 to 252). Neither function sends data to a server.

The `postMessage` call in `tweaks-panel.jsx` (line 171) posts to `window.parent` with the target origin `'*'`. When the application runs standalone in a browser tab, `window.parent` is the same window object, so this message is harmless. If the application were ever embedded in an iframe, this call would post tweak-state changes (board style and coach tone, not user content) to the parent frame, whatever its origin. This is worth noting as a design characteristic, not a vulnerability in the current deployment model.

### Lawful basis and personal data

The information a user types into the subject and answer fields may or may not be personal data, depending on what they type. If a user types their own name or details about an identifiable individual, that is personal data under UK GDPR Article 4(1). In the current design that data never leaves the browser, so the controller (Tim Dixon, as operator of the application) does not process it in the sense of transmitting, storing on a server, or sharing it.

UK GDPR Article 2(2)(c) excludes processing carried out by a natural person in the course of a purely personal or household activity. A user conducting a private SWOT analysis on their own device falls within that exclusion.

If the application were ever served from a server with analytics, telemetry, or error-reporting tools added, this position would need to be revisited.

### Data subject rights

Because no personal data is transmitted or stored server-side, no data subject rights (access, erasure, portability) require an external mechanism. The user can clear their data at any time by clicking Restart, which calls `clearState` and removes the localStorage entry. This constitutes an effective self-serve erasure mechanism.

### Retention

Data persists in localStorage until the user clears it or the browser clears site data. There is no automatic expiry. This is reasonable for a tool the user controls entirely.

---

## 3. Findings and Recommendations

### Finding 1: Absent Content Security Policy (medium severity)

OWASP category: A05 Security Misconfiguration.

The HTML file has no CSP. Without a CSP, if an attacker found a way to inject script into the page (for example, through a cross-site scripting vulnerability introduced in a future change), the browser would execute it without restriction.

How to reproduce: Open the browser developer tools on any page load. The console shows no CSP policy applied.

Recommended fix: Add a `<meta>` CSP to `index.html` immediately after the charset declaration. An appropriate starter policy for this application is:

```
default-src 'none';
script-src 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net;
style-src 'unsafe-inline';
font-src 'self';
connect-src https://cdn.jsdelivr.net;
img-src 'self' blob: data:;
worker-src blob:;
child-src blob:;
```

The `connect-src` directive is the most protective element: it would block any data exfiltration through network requests even if a malicious script loaded. Set `connect-src` to the CDN origin needed for WebLLM model downloads rather than `'none'`, to allow the model weights to download. The `style-src 'unsafe-inline'` exception is required because `tweaks-panel.jsx` injects a `<style>` block at runtime.

Note: `worker-src blob:` and `child-src blob:` are required because WebLLM uses Web Workers loaded from blob URLs.

### Finding 2: Missing Subresource Integrity hash for html2canvas (medium severity)

OWASP category: A06 Vulnerable and Outdated Components; A08 Software and Data Integrity Failures.

The three main CDN scripts carry SHA-384 integrity hashes. html2canvas at line 24 of `index.html` does not. If unpkg serves a compromised version, the browser will execute it silently.

How to reproduce: Compare the four CDN script tags in `index.html`. Three have `integrity` and `crossorigin` attributes; html2canvas does not.

Recommended fix: Generate the SRI hash for html2canvas 1.4.1 and add the `integrity` and `crossorigin` attributes to the tag. The hash can be generated with the command `openssl dgst -sha384 -binary html2canvas.min.js | openssl base64 -A` after downloading the file, or using the SRI Hash Generator at https://www.srihash.org.

### Finding 3: Unpinned WebLLM CDN script (low severity)

OWASP category: A06 Vulnerable and Outdated Components.

The WebLLM script loaded in `swot-engine.jsx` (line 161) uses `npm/@mlc-ai/web-llm` with no version pin and no integrity hash. The README acknowledges this is unresolved.

Recommended fix: Pin to a specific semver version (for example `@mlc-ai/web-llm@0.2.73`) and add an SRI hash once the version is fixed.

### Finding 4: Broad postMessage target origin in TweaksPanel (low severity, informational)

OWASP category: A01 Broken Access Control (design characteristic, not a current vulnerability).

In `tweaks-panel.jsx` line 171, the target origin for `postMessage` is `'*'`. The payload contains only board style and coach tone, not user content. In the current standalone deployment this is not exploitable.

Recommended fix: Change `'*'` to `window.location.origin` or to a specific known host origin if the embedding use case is formalised.

---

## 4. Third-Party Resources and Fonts

All external scripts are loaded from unpkg.com and cdn.jsdelivr.net. Both are well-established public CDNs. The fonts (Roboto variable fonts) are self-hosted inside the `fonts/` directory and served from the same origin. No third-party font service such as Google Fonts is used, which is correct for data-protection hygiene: Google Fonts requests log the visitor's IP address against a font request.

There are no tracking pixels, analytics libraries, or telemetry calls in any of the source files.

---

## 5. Untrusted Input Handling

No use of any unsafe raw-HTML DOM insertion API, dynamic script evaluation, or equivalent was found in any of the JSX or JavaScript files. React's JSX renderer HTML-encodes all string children by default, so user content rendered in the UI is safe.

The `toMarkdown` function in `swot-engine.jsx` (lines 349 to 366) interpolates user content into a Markdown string, but this string is written to a downloaded file and is never inserted into the DOM. No cross-site scripting risk arises from this.

User input passes through the following path: text fields in React state, then as arguments to `aiProcessAnswer`, then as part of a prompt string sent to the local AI, then as JSON parsed by `extractJson`. The output of `extractJson` is validated field by field (bucket whitelist, string-length caps, array bounds) before being placed in React state and rendered. This is a sound pattern.

Tags entered by the user are stored as plain strings and rendered through React's JSX renderer. No further sanitisation is required.

The `uid` function (line 29 of `swot-engine.jsx`) uses `Math.random`, which is not cryptographically secure. These IDs are used only as React list keys and item identifiers within the browser session. They are never used for authentication, session management, or access control, so the use of `Math.random` is appropriate.

---

## 6. Exceptions

No security exceptions are raised for this review. Both medium-severity findings (missing CSP and missing SRI hash for html2canvas) are recommendations for Sean to implement. Neither constitutes a blocking concern that requires Tim's approval to accept as a formal exception. The low-severity findings are noted for future improvement.

---

## 7. Cross-Cutting Note

The pattern of self-hosting fonts rather than loading them from Google Fonts or another third-party service avoids IP-address logging and is worth recording in the global wiki as a standard recommendation for all static projects. The browser-local AI architecture, which sends no user data to a server, is also a strong privacy-preserving pattern worth noting for future AI-assisted projects.

Both items are flagged to Sonja for a decision on whether to promote them to the global wiki.
