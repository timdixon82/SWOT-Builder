# Work folder 033 — postMessage origin validation

Status: active
Created: 2026-05-31
Branch: fix/postmessage-origin-validation

## Summary

Jed flagged a low-priority security hygiene issue during the semgrep
remediation (work folder 032): the `onmessage` listener in
`tweaks-panel.jsx` does not validate `e.origin`. Any page that holds a
reference to the panel window can open the tweaks panel by posting
`__activate_edit_mode`. Impact is cosmetic only (opens a UI panel), but
filtering to `window.location.origin` is straightforward good hygiene.

## Scope

File: `tweaks-panel.jsx`
Lines: 190–193 — the `onmessage` listener inside the `useEffect` in
`TweaksPanel`.

Add an `e.origin` check so only messages from the same origin are acted
on. Use `window.location.origin` as the allowed value. The three outgoing
`postMessage` calls (lines 171, 196, 202) already carry nosemgrep
suppressions and are not in scope.

## Out of scope

- Changes to any file other than `tweaks-panel.jsx`.
- Changes to the three outgoing `postMessage` calls.
- Accessibility or styling changes.

## Risk and rollback

Low risk. The panel and its host page always share the same origin in the
current deployment (static single-origin serve). If a future cross-origin
embed is needed, this guard would need revisiting. Rollback is
`git revert` on this commit. Carol does not need a dedicated test pass;
the Pa11y and axe CI check covers the panel's accessibility path.

## Definition of done

- `e.origin !== window.location.origin` check added to the `onmessage`
  listener; messages from other origins are silently ignored.
- All CI checks pass on the PR.
- Sean has not merged — Sonja merges on Tim's approval.

## Approved GitHub actions

- Commit to a branch: yes
- Push a branch (not main): yes
- Open a pull request: yes
