# Brief: 008-swot-builder-setup

Status: archived

## Summary

Adopt the new `timdixon82/SWOT-Builder` repository as a team project and bring it under governance. SWOT-Builder is a browser application that runs a guided SWOT analysis interview using browser-local artificial intelligence, with no server and no application programming interface key. The repository was created on 2026-05-22 from files Tim supplied; the original implementation is on `main`. This work backfills the missing reviews, scaffolds the project wiki, and runs the setup build.

- Status: done
- Branch: none
- Priority: 10
- Blockers: None

## Requirements

No formal requirements exist. Tad reverse-engineers them from the README and the code into the project wiki.

## Routing plan

1. Sonja created the repository and pushed the initial commit. Done.
2. Backfill reviews, in parallel: Tad (business analysis), Jacob (architecture), Jed (security governance and code review), Carol (baseline WCAG 2.2 AAA audit).
3. Sonja consolidates, scaffolds the project wiki and the working branch, and surfaces decisions to Tim.
4. Sean carries out the setup build on the branch; Sonja writes the workflow files.
5. Carol verifies; Sonja runs the conformance check and the merge gate; Sean opens the pull request; Sonja merges only on Tim's express approval.

## Approved GitHub actions

Per Tim's standing pre-approval of 2026-05-22, git actions on all repositories may run without pausing. Merges to the main branch always need Tim's express approval given at the time. The hard deny-list always applies.

## Notes

SWOT-Builder is a browser application, more complex than the team's static sites. Its review is fuller, and covers the browser-local artificial-intelligence backends and how they handle the user's data.
