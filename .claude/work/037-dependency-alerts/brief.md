# Work folder 037: dependency alerts

Status: active

## Summary

Clear the open Dependabot alert 118 (minimatch, medium, development scope, denial of service via globparts amplification) in the root package-lock.json. The fix version is 11.0.1. The parents (eslint, htmlhint through glob) request minimatch ^10, so a targeted update cannot reach it. A package.json override to ^11.0.1 resolves it to 11.0.4.

## Out of scope

- Feature changes.
- Other work folders.
- Workflow files.
- The open Dependabot pull request for vitest.
- The npm audit advisory for glob (through htmlhint), which has no Dependabot alert and needs a breaking htmlhint downgrade.

## Risk and rollback

Risk is low: minimatch is a development-only dependency used by linting tools. Lint and tests were run after the change. Rollback is to revert the pull request.

## Definition of done

- Alert 118 closes after merge.
- npm ci, lint, and tests pass.
- Pull request opened against main, not merged by Sean.
