# Work folder 032 — Semgrep remediation for PR #24

Status: done
Created: 2026-05-31
Branch: chore/add-next-q-script

## Summary

Semgrep is blocking the merge of PR #24 with four findings in two files.
Neither file was touched by PR #24; both findings are pre-existing.
Jed will assess each finding and either fix it or apply a documented inline
suppression (`# nosemgrep`) with written rationale.

## Findings

### Finding 1 — `index.html` line 41 (suspected false positive)

Rule: `html.security.audit.missing-integrity.missing-integrity`

```html
<link rel="icon" href="data:image/svg+xml,...">
```

A `data:` URI is inline content. It cannot be tampered with by a CDN or
third party. The `integrity` attribute is meaningless here; semgrep's HTML
rule does not distinguish data URIs from external URLs.

### Findings 2, 3, 4 — `tweaks-panel.jsx` lines 171, 196, 202

Rule: `javascript.browser.security.wildcard-postmessage-configuration`

Three calls to `window.parent.postMessage({...}, '*')`. The wildcard origin
means any embedding page could receive these messages. Messages contain only
UI state signals (no personal data, no tokens). The panel is a developer
tool. Jed to assess whether the wildcard is acceptable or should be scoped to
a known origin.

## Out of scope

- Functional or accessibility changes.
- Any file not listed above.
- Changes to the semgrep CI workflow itself.

## Risk and rollback

Low risk: changes are limited to adding inline suppression comments or
scoping postMessage origins. Rollback is `git revert` on the remediation
commit. If Jed scopes the postMessage origin, functional regression is
possible — Carol's smoke test covers the tweaks-panel communication path.

## Definition of done

- Semgrep CI passes on PR #24.
- Each suppression (if used) has a one-line written rationale in the code
  comment.
- Any real fix (scoped postMessage origin) is reviewed by Jed and noted in
  the work log.
- PR #24 is mergeable.

## Approved GitHub actions

(Pending Tim's approval — see session log for Q-number)
