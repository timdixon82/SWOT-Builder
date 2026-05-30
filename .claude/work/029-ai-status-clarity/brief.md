# Work folder 029 — AI status clarity and download progress

- Status: done
- Triage type: 7 — small feature
- Branch: feat/029-ai-status-clarity
- Mockup mode: D (no mockup — UI polish only)

## Summary

Two related UX problems reported by Tim:

1. It is not clear whether AI is enabled. The AI badge in the header is small and easy to miss.
   Users on the intro and interview screens have no prominent indicator of AI status.

2. When a model download is requested, the UI switches to a "loading" state but shows no
   meaningful progress. The WebLLM `initProgressCallback` provides a `text` field (e.g.
   "Fetching param cache…") that is currently discarded. During the initial JS-library-load
   phase, progress stays at 0 with no label. Chrome Prompt API downloads (`type === null`
   while `status === 'loading'`) show no progress bar at all.

## Out of scope

- Changing which AI backends are supported.
- Changing the model catalogue or download consent flow.
- Any changes to the SWOT data model, interview logic, or board.

## Risk and rollback

Low risk — UI-only changes to three JSX files. No data model, no API, no server.
Rollback: revert the PR on GitHub.

## Definition of done

- [ ] `swot-engine.jsx`: `emit()` and `getStatus()` include a `progressText` string field.
      `_progressText` is updated at each phase of `loadWebLLM` (preparing engine, starting
      download, and forwarded from the `initProgressCallback` text field).
- [ ] `swot-app.jsx`: `isDownloading` fires for *any* `status === 'loading'` state, not just
      `type === 'webllm'`.
- [ ] `swot-app.jsx`: `WebLLMProgressBar` shows the `progressText` label below the bar,
      and shows "Preparing…" when `progressText` is empty and progress is 0.
- [ ] `swot-app.jsx`: `AIBadge` shows a clearly readable ready state — the dot is larger and
      the label uses plain English ("AI on" / "AI off" or equivalent) rather than technical
      backend names alone.
- [ ] `swot-intro.jsx`: accepts an `aiState` prop and shows an AI status line near the
      Start button (e.g. "AI-powered analysis enabled" or "Running in manual mode — AI not
      loaded") so users know before they begin.
- [ ] All new elements have appropriate ARIA labels and `aria-live` regions where state
      changes dynamically.
- [ ] No regressions in existing ESLint or Pa11y configuration.

## Approved GitHub actions

- Create a branch
- Commit to a branch
- Push a branch other than main
- Open a pull request
- Comment on a pull request or issue
- Create an issue

## Questions

Q245 — GitHub action pre-approvals. Answer: A (all six pre-approved). 2026-05-30.
