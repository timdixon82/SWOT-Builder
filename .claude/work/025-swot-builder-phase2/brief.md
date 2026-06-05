# Brief: 025-swot-builder-phase2

Status: archived

## Summary

Phase 2 remediation for SWOT Builder. Fix the 25 accessibility findings catalogued in Carol's baseline audit (docs/accessibility.md in timdixon82/SWOT-Builder). Work the critical findings first (7), then high (8), then medium (6), then low (4). Also align the accessibility workflow to the team standard pattern (unpin Pa11y, remove jq step, rely on browser-driver-manager).

- Status: `done`
- Status note: all 25 findings resolved; PR 12 merged 2026-05-29
- Branch: feat/phase2-group3 (current sprint)
- Priority: 5
- Blockers: None.
- Progress: Group 1 done (PR 8), CI fix (PR 9), Group 2 done (PR 10), carry-forwards done (commit adba174 by Tim). Group 3 = 11 remaining findings (H-01, H-02, H-03, H-07, M-02, M-03, M-06, L-01, L-02, L-03, L-04).

## Out of scope

- New features or UX changes not related to accessibility.
- Backend changes (SWOT Builder is entirely browser-side).
- Phase 3 architectural items (cross-origin isolation service worker, WebLLM SRI hash, postMessage origin hardening) — these are tracked in todo.md on main.

## Risk and rollback

All changes are on a feature branch. Rollback is a revert on main. No server-side or data-layer risk; all state is browser-local. The critical fixes (modal focus management, landmark structure, accessible names) are well-understood patterns with no side effects beyond the accessibility tree.

## Definition of done

- All 7 critical findings resolved: modals have role="dialog", focus management, keyboard trap, and close affordance; app has landmark structure; interactive controls have accessible names.
- All 8 high findings resolved or accepted with a documented exception.
- Medium and low findings addressed where practical; remainder documented as exceptions in docs/exceptions/.
- Pa11y and axe-core pass in CI.
- Carol signs off functional, accessibility, and visual testing.
- Accessibility workflow aligned to team standard (unpinned Pa11y, browser-driver-manager only).
- Sean opens a pull request; Sonja merges only on Tim's express approval.

## Approved GitHub actions

Per Tim's standing pre-approval of 2026-05-22, git actions on all repositories may run without pausing. Merges to the main branch always need Tim's express approval given at the time. The hard deny-list always applies.

## Mockup mode

D — no mockup phase. Fixes are to existing components; no new UI design required.

## References

- Carol's baseline audit: `.claude/work/008-swot-builder-setup/carol-baseline-audit.md`
- Accessibility findings list: `timdixon82/SWOT-Builder docs/accessibility.md` (on main)
- Phase 2 todo list: `timdixon82/SWOT-Builder todo.md` (on main)
