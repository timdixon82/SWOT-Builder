# Work folder 031 — Q27B and Q30A closeout

- Status: archived
- Triage type: 6 — bug fix
- Branch: fix/031-q27b-q30a-closeout
- Mockup mode: D

## Summary

Two outstanding implementation items from Tim's Q27B and Q30A answers in work folder 008.

**Q27B**: Remove the automatic model-download branch. Every WebLLM download must
always show the consent dialog, regardless of model size.

**Q30A**: Wire the coach-tone tweak into the AI prompt. The coach_tone value
("friendly", "concise", "playful") is stored in the tweaks panel but never
passed to aiProcessAnswer or aiOpeningQuestion in swot-engine.jsx.

## Out of scope

Any other changes.

## Risk and rollback

Low — targeted changes across three files. Rollback: revert the PR.

## Definition of done

- [ ] `swot-app.jsx`: `AUTO_DOWNLOAD_THRESHOLD_MB` constant removed.
      `handleRequestModel` always calls `setConsentModel(model)` — no conditional.
- [ ] `swot-app.jsx`: `SwotApp` tracks `coachTone` in state (default "friendly"),
      updated via a `tweakchange` event listener. Passed to `SwotInterview` as a prop.
- [ ] `swot-interview.jsx`: `SwotInterview` accepts `coachTone` prop (default "friendly")
      and forwards it to `aiProcessAnswer` and `aiOpeningQuestion`.
- [ ] `swot-engine.jsx`: `aiProcessAnswer` and `aiOpeningQuestion` accept `coachTone`
      (default "friendly") and include a tone line in their system prompts.
- [ ] Lint clean.

## Approved GitHub actions

Tim approved all six via direct instruction, 2026-05-30.
- Create a branch, commit, push, open a pull request, comment, create an issue.
