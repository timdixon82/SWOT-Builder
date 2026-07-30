# Log: 036-workflows-protect

## [2026-07-30] Intake | Tim approved (Q: A) — add the missing protect entry

Tim confirmed the team's sync script already supports `.claude/workflows-protect` to stop a sync from overwriting a customised workflow file, and that SWOT Builder never created this file — which is the real reason `deploy.yml` got silently overwritten twice (see work folder 034). Tim chose to add it now. Dispatching Sean for the one-file change.
