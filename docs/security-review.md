# Security Review

This page records the security review of SWOT Builder, carried out on 2026-05-22 by Jed (security agent). It covers the OWASP (Open Web Application Security Project) Top 10 (2021 edition) and the data protection position under UK GDPR (UK General Data Protection Regulation). Two medium-severity findings are recorded as remediation items for the setup build phase.

## Summary

SWOT Builder is a static browser application with no server, no back-end, and no API (application programming interface) key. All user data stays in the browser. The security surface is small but not zero.

- High-severity findings: 0
- Medium-severity findings: 2
- Low-severity findings: 2

The data-protection position is straightforward. No personal data is transmitted, so most UK GDPR obligations do not apply.

## Two-phase approach

Security remediation follows the same two-phase shape used for the Periodic-Table project.

Phase 1 is the setup build, which is in progress. It includes the two medium-severity fixes: adding a Content Security Policy and adding the missing SRI hash for html2canvas. Both are conditions on the setup build completing.

Phase 2 addresses the two low-severity findings at an appropriate point after the setup build.

---

## OWASP Top 10 assessment

### A01 Broken Access Control

Not applicable. There is no server, no user account system, and no server-side authorisation. All state is held in the browser's localStorage. A user cannot access another user's data because there is no shared server store.

### A02 Cryptographic Failures

No cryptographic operations are performed. Data in localStorage is held in plaintext. This is correct for this kind of application: encrypting data client-side would not protect it from someone with physical access to the device, which is out of scope for a browser application.

### A03 Injection

No risk found. The application uses React 18, which escapes all string values before placing them into the DOM (document object model). No use of React's unsafe raw-HTML insertion API, direct DOM property assignment, or dynamic script evaluation was found in the codebase. User-supplied text flows only into React state and is rendered through JSX (JavaScript XML), which HTML-encodes all string children.

AI output is treated as untrusted data. Every field returned by the AI is capped to a maximum length and the bucket value is validated against the allowed set S, W, O, T before use.

### A04 Insecure Design

No concerns found. The AI suggestion is always presented for user review before it is committed to the SWOT board. The consent dialog for large model downloads correctly gates any download over 50 MB.

### A05 Security Misconfiguration

Finding 1 (medium severity): absent Content Security Policy. See the Findings section below.

The Referrer-Policy is also absent. Without it, the browser defaults to `strict-origin-when-cross-origin` in modern browsers, which is acceptable, but an explicit declaration is a defence-in-depth measure.

### A06 Vulnerable and Outdated Components

Finding 2 (medium severity): missing SRI hash for html2canvas. See the Findings section below.

React 18.3.1, ReactDOM 18.3.1, and Babel Standalone 7.29.0 are pinned to exact versions and carry SHA-384 SRI (Subresource Integrity) hashes. These are in good shape.

html2canvas 1.4.1 is pinned to an exact version but has no SRI hash.

The WebLLM script is not pinned to a version and has no SRI hash. The README acknowledges this gap. This is a low-severity finding. See the Findings section below.

### A07 Identification and Authentication Failures

Not applicable. There are no accounts, sessions, or authentication flows.

### A08 Software and Data Integrity Failures

Related to A06. The html2canvas and WebLLM scripts are loaded from external CDNs without SRI hashes. If the CDN were compromised, the browser would execute the substituted script.

### A09 Security Logging and Monitoring Failures

Not applicable. This is a client-side static application with no server-side logging. The application uses `console.error` sparingly and does not log any user content.

### A10 Server-Side Request Forgery

Not applicable. There is no server.

---

## Data protection position under UK GDPR

### What data the application holds

The application holds two categories of data.

The first is session configuration: the subject of the SWOT analysis, the scope type, and the board title. These are free-text fields typed by the user.

The second is SWOT content: the answers given during the interview, and the items saved to the four quadrants, including titles, descriptions, tags, and confidence levels.

Both categories are stored in `localStorage` under the key `swot-builder-v1`. Neither category is transmitted to any server.

### Does any data leave the browser?

No. The following verifications support this.

The Chrome Prompt API calls `_session.prompt()`, which is handled by the browser itself. No network call is made to a remote endpoint by the application.

The WebLLM back-end downloads model weights once from a CDN and caches them. The prompt string is then processed locally using WebGPU (web graphics processing unit interface). The application does not make any network requests with user content.

The export functions in `swot-board.jsx` are entirely local: Markdown export creates a Blob and triggers a browser download; image export uses html2canvas to render to a canvas and writes to the clipboard or triggers a download. Neither function sends data to a server.

The `postMessage` call in `tweaks-panel.jsx` posts to `window.parent` with target origin `'*'`. When the application runs standalone in a browser tab, `window.parent` is the same window object and this message is harmless. The payload contains only board style and coach tone, not user content.

### Lawful basis and personal data

The information a user types may or may not be personal data, depending on what they type. If a user types their own name or details about an identifiable individual, that is personal data under UK GDPR Article 4(1). In the current design, that data never leaves the browser, so the controller does not process it in the sense of transmitting, storing on a server, or sharing it.

UK GDPR Article 2(2)(c) excludes processing carried out by a natural person in the course of a purely personal or household activity. A user conducting a private SWOT analysis on their own device falls within that exclusion.

If the application were ever served from a server with analytics, telemetry, or error-reporting tools added, this position would need to be revisited.

### Data subject rights

Because no personal data is transmitted or stored server-side, no data subject rights (access, erasure, portability) require an external mechanism. The user can clear their data at any time by clicking Restart. This constitutes an effective self-serve erasure mechanism.

---

## Findings and remediation items

### Finding 1: Absent Content Security Policy (medium severity)

OWASP category: A05 Security Misconfiguration.

The HTML file has no CSP (Content Security Policy). Without a CSP, if an attacker found a way to inject script into the page, the browser would execute it without restriction.

How to confirm: open the browser developer tools on any page load. The console will show no CSP policy applied.

Recommended fix for Sean: add a `<meta>` CSP to `index.html` immediately after the charset declaration. A suitable starter policy for this application is:

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

The `connect-src` directive is the most protective element: it blocks any data exfiltration through network requests even if a malicious script loaded. The `style-src 'unsafe-inline'` exception is required because `tweaks-panel.jsx` injects a `<style>` block at runtime. The `worker-src blob:` and `child-src blob:` directives are required because WebLLM uses Web Workers loaded from blob URLs.

Phase: setup build.

### Finding 2: Missing SRI hash for html2canvas (medium severity)

OWASP category: A06 Vulnerable and Outdated Components; A08 Software and Data Integrity Failures.

The three main CDN scripts carry SHA-384 integrity hashes. html2canvas at `index.html` line 24 does not. If unpkg serves a compromised version, the browser will execute it without complaint.

How to confirm: compare the four CDN script tags in `index.html`. Three have `integrity` and `crossorigin` attributes; html2canvas does not.

Recommended fix for Sean: generate the SRI hash for html2canvas 1.4.1 and add the `integrity` and `crossorigin` attributes to the script tag. The hash can be generated by running `openssl dgst -sha384 -binary html2canvas.min.js | openssl base64 -A` after downloading the file, or using the SRI Hash Generator tool at srihash.org.

Phase: setup build.

### Finding 3: Unpinned WebLLM CDN script (low severity)

OWASP category: A06 Vulnerable and Outdated Components.

The WebLLM script loaded in `swot-engine.jsx` uses `npm/@mlc-ai/web-llm` with no version pin and no integrity hash.

Recommended fix: pin to a specific semver (semantic versioning) version and add an SRI hash once the version is fixed. See ADR 0007 for the full requirement.

Phase: after setup build, at a suitable point during Phase 2.

### Finding 4: Broad postMessage target origin in TweaksPanel (low severity, informational)

OWASP category: A01 Broken Access Control (design characteristic, not a current vulnerability).

In `tweaks-panel.jsx`, the target origin for `postMessage` is `'*'`. The payload contains only board style and coach tone, not user content. In the current standalone deployment this is not exploitable.

Recommended fix: change `'*'` to `window.location.origin` or to a specific known host origin if the embedding use case is formalised.

Phase: after setup build, at a suitable point during Phase 2.

---

## Third-party resources and fonts

All external scripts are loaded from unpkg.com and cdn.jsdelivr.net, both well-established public CDNs. The fonts (Roboto variable fonts) are self-hosted inside the `fonts/` directory and served from the same origin. No third-party font service is used. This avoids IP-address logging, which a service such as Google Fonts would otherwise produce on every page load.

There are no tracking pixels, analytics libraries, or telemetry calls in any of the source files.
