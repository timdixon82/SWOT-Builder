# Log: 036-workflows-protect

## [2026-07-30] Intake | Tim approved (Q: A) — add the missing protect entry

Tim confirmed the team's sync script already supports `.claude/workflows-protect` to stop a sync from overwriting a customised workflow file, and that SWOT Builder never created this file — which is the real reason `deploy.yml` got silently overwritten twice (see work folder 034). Tim chose to add it now. Dispatching Sean for the one-file change.

## [2026-07-30] Implementation | Sean, complete

Sean created `.claude/workflows-protect` (branch `fix/workflows-protect-036`, commit `f419f23`) containing the `deploy.yml` entry plus an explanatory comment referencing work folder 034. Verified the file parses correctly against the sync script's exact parse command (`grep -v '^[[:space:]]*#' ... | grep -v '^[[:space:]]*$' | tr -d '\r'`) — output was exactly `deploy.yml`. No changes to `deploy.yml` itself or to the sync script. No test suite run (config-file-only, no functional surface); noted in the PR per the test-discipline carve-out. PR #57 opened: https://github.com/timdixon82/SWOT-Builder/pull/57. Not merged.

No accessibility or security surface for this change — build-tooling config, not user-facing.
- [2026-07-30 17:12:49] subagent completed
