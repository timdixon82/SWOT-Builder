# Brief: 036-workflows-protect

## Summary

The team's template-sync script already supports a per-project protect list (`.claude/workflows-protect`) that stops a sync from overwriting a customised GitHub Actions workflow file. SWOT Builder never created this file, which is why a routine sync silently overwrote its customised `deploy.yml` twice (see work folder 034). Tim approved adding it now.

Preamble fields (optional; used by the status dashboard):

- Status: `active`
- Branch: `fix/workflows-protect-036`
- Mockup mode: (n/a — config file only, no UI)
- Priority: 2
- Blockers: Awaiting Tim's merge approval for PR #57

## Requirements

None needed from Tad — this is applying an existing, documented team mechanism (`scripts/sync-from-template.sh`, the `.claude/workflows-protect` handling around its Pass 1c) to this project. No new mechanism is being built.

## Routing plan

Sean creates `.claude/workflows-protect` in this project, listing `deploy.yml`, with a one-line comment explaining why (points back to work folder 034's regression). Sonja reviews and brings the merge to Tim. No Carol test pass needed — this is not app code, has no functional or accessibility surface, and its only effect is on a future sync run, which can't be exercised in this session.

## Out of scope

- Any change to the sync script itself (`scripts/sync-from-template.sh`) — that already supports this mechanism correctly; nothing there needs fixing.
- Adding any other filename to the protect list beyond `deploy.yml` — no other workflow file in this project has been customised away from the template default.
- Any change to `deploy.yml`'s contents itself (already fixed in work folder 034).

## Risk and rollback

Risk: Protecting `deploy.yml` from sync also means this project won't automatically receive future template improvements to the deploy workflow (e.g. new archetype handling, action-version bumps) — those would need to be applied here manually if ever needed.

Rollback: The change lands on a branch behind a pull request; if not wanted, don't merge. Even after merge, removing the file (or the one line) at any time restores default sync behaviour.

## Definition of done

- [x] `.claude/workflows-protect` exists in the repository root's `.claude/` folder, containing `deploy.yml` (and a comment noting why).
- [x] File format matches what `scripts/sync-from-template.sh` expects: one filename (basename) per line, `#`-prefixed comment lines ignored. Verified against the sync script's exact parse command.
- [x] No other files changed. Confirmed via PR diff — one file only.

## Approved GitHub actions

- [x] Create a branch
- [x] Commit to a branch
- [x] Push a branch other than the main branch
- [x] Open a pull request
- [x] Comment on a pull request or an issue
- [x] Create an issue

## Not pre-approved

These always pause for Tim, whatever is ticked above:

- Merging to the main branch. This always needs Tim's express approval at the time.
- Publishing to a blog or a social media account.

## Never allowed

The hard deny-list from `CLAUDE.md`. These are refused outright, whatever a brief says: force-push, branch deletion, history rewrite, repository deletion, repository visibility change, branch-protection edits, collaborator changes, release deletion, and disabling secret or code scanning.
