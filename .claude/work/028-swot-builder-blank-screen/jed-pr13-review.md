# Security Review: PR 13 — fix/blank-initial-screen

Reviewer: Jed (security agent)
Date: 2026-05-30
Work folder: 028-swot-builder-blank-screen
Verdict: **Approved**

## Change under review

A single-line edit to the Content Security Policy (CSP) in
`/Users/timdixon/Code/Github/SWOT-Builder/index.html`.

The `connect-src` directive changes from:

```
connect-src https://cdn.jsdelivr.net https://timdixon82.goatcounter.com
```

to:

```
connect-src 'self' https://cdn.jsdelivr.net https://timdixon82.goatcounter.com
```

No other directive, no other file, and no other origin changed. The diff against
`origin/main` confirms this: only `index.html` appears in `git diff --name-only`.

## Check 1: Scope of the change

The change adds exactly one token — `'self'` — to `connect-src`. Every other
directive (`default-src`, `script-src`, `style-src`, `font-src`, `img-src`,
`worker-src`, `child-src`) is identical to the main-branch version. No new
external origin has been introduced.

Finding: the change is surgically minimal. It adds no new third-party trust.

## Check 2: Correctness and minimal-privilege assessment

`'self'` on `connect-src` allows the page to make XMLHttpRequest (XHR) and
`fetch()` calls back to its own origin — the GitHub Pages host that serves the
app. It does not permit connections to any other host.

The root cause (recorded in the work-folder log by Sean) is that Babel
Standalone loads `<script type="text/babel" src="...">` JSX files via XHR.
`connect-src` governs XHR and Fetch; without `'self'`, the browser blocks every
same-origin XHR, so the JSX files never execute and `#root` is left blank.

This is the correct and minimal fix. The alternative approaches — `data:` URI
inlining of each JSX file, or a build step that bundles everything — are
architectural changes well beyond the scope of a bug-fix PR. Within the
constraint of the current Babel-in-browser architecture, `'self'` on
`connect-src` is the least-privilege token that restores function.

### Exfiltration risk assessment

`'self'` permits the page's own JavaScript to fetch or POST back to the same
origin. For this risk to matter, attacker-controlled JavaScript must already be
running in the page.

The CSP already carries `'unsafe-inline'` on `script-src` (required by
Babel's runtime JSX compilation), which means the CSP as a whole does not
provide a strong XSS-containment guarantee regardless of this change. The
addition of `'self'` to `connect-src` does not meaningfully worsen that
pre-existing posture: an attacker who can inject a script via `'unsafe-inline'`
could already use `fetch` to the same origin under many browser conditions,
because `connect-src 'self'` was effectively moot without it — the JSX files
were not loading at all.

In plain terms: the exfiltration surface added by `'self'` on `connect-src` is
negligible given the existing `'unsafe-inline'` on `script-src`. This PR does
not make the threat model materially worse.

### No personal data exposure

The app is browser-side only with no backend, no authentication, and no personal
data transmission. There is no sensitive data at the same origin that `'self'`
on `connect-src` could be used to exfiltrate.

## Check 3: Residual hardening opportunities (advisory, not blocking)

These are pre-existing items unrelated to this PR. They do not block merge.

1. `script-src 'unsafe-inline'` remains the most significant CSP weakness. The
   correct long-term fix is a build pipeline (Vite or similar) that removes
   the need for Babel's runtime JSX compilation, which would allow
   `'unsafe-inline'` to be dropped and a `nonce-` or `hash-`based policy to
   be used instead. This is an architectural decision tracked in `todo.md`.

2. `connect-src` now permits arbitrary same-origin XHR. If the app ever gains
   a service worker or server-side API, that surface should be re-evaluated.
   No action needed now.

## OWASP mapping

| OWASP category | Relevance to this change |
|---|---|
| A05:2021 Security Misconfiguration | The pre-existing missing `'self'` was a misconfiguration that broke the app. This PR corrects it. No new misconfiguration introduced. |
| A03:2021 Injection | `'unsafe-inline'` posture unchanged. Not worsened by this PR. |

## Verdict

**Approved.** The change is exactly what it claims: one token added to one
directive, correctly justified, minimal in scope, and not a material regression
in the security posture of a browser-only app with no personal data.

No findings require remediation before merge. Advisory hardening items (the
`'unsafe-inline'` architectural debt) are pre-existing and tracked separately.

Token count: approximately 4,200 input tokens / 1,100 output tokens.
