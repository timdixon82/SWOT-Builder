# Work folder 030 — Carol follow-ups from PR #18

- Status: archived
- Triage type: 6 — bug fix (minor)
- Branch: fix/030-carol-followups
- Mockup mode: D (no mockup — code only)

## Summary

Two low-priority follow-up items raised by Carol during the PR #18 review:

1. Replace the middle dot (`·`) in AIBadge ready-state labels with an em dash (` — `)
   for more predictable screen reader announcement across VoiceOver, JAWS, and NVDA.
   Affects `swot-app.jsx`: two string literals.

2. Clear `_progressText` back to `''` when `_status` transitions to `'ready'` at the
   end of `loadWebLLM`, so `getStatus()` does not return stale text after download.
   Affects `swot-engine.jsx`: one line added.

## Out of scope

Any other changes.

## Risk and rollback

Minimal — two cosmetic string changes and one variable reset. Rollback: revert the PR.

## Definition of done

- [ ] `swot-app.jsx`: `"AI on · Built-in"` → `"AI on — Built-in"`,
      `"AI on · Browser"` → `"AI on — Browser"`.
- [ ] `swot-engine.jsx`: `_progressText = '';` added immediately before
      `_status = 'ready';` at the end of `loadWebLLM`.
- [ ] Lint clean.

## Approved GitHub actions

Tim approved all six via direct instruction ("deal with carol's now"), 2026-05-30.

- Create a branch
- Commit to a branch
- Push a branch other than main
- Open a pull request
- Comment on a pull request or issue
- Create an issue
