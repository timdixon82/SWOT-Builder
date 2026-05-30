# Security Review: PR 14 — chore/actions-pages-deploy

Reviewer: Jed
Date: 2026-05-30
Verdict: Approved

## Scope

Single new file: `.github/workflows/deploy.yml`.
No application code changes. No dependency or configuration changes.

## Checks

### 1. Workflow injection

Trigger events are `push: branches: [main]` and `workflow_dispatch` only. There is no `pull_request`, `pull_request_target`, `issue_comment`, `issues`, or any other event that exposes untrusted input.

The `Assemble site` step contains no interpolated GitHub context variables (`${{ }}`) in any `run:` block. Every argument to `cp` is a literal, repo-controlled path. No environment variables from the event payload are read. Injection risk: none.

### 2. Least-privilege permissions

Top-level permissions block:

```
contents: read
pages: write
id-token: write
```

This is exactly the minimum set required by the GitHub Pages OIDC (OpenID Connect) deploy pattern. `contents: read` covers checkout. `pages: write` covers the Pages artifact upload and deploy. `id-token: write` is required by `actions/deploy-pages` to obtain the OIDC token for the Pages environment. No additional permissions (such as `pull-requests`, `issues`, `packages`, or `actions`) are present. Pass.

### 3. Action SHA pins

All four actions are pinned to full 40-character commit SHAs. Each SHA was verified live against the GitHub API and matches the tagged release.

| Action | SHA in workflow | Tag comment | API match |
| --- | --- | --- | --- |
| actions/checkout | de0fac2e4500dabe0009e67214ff5f5447ce83dd | v6.0.2 | Confirmed |
| actions/configure-pages | 45bfe0192ca1faeb007ade9deae92b16b8254a0d | v6.0.0 | Confirmed |
| actions/upload-pages-artifact | fc324d3547104276b827a68afc52ff2a11cc49c9 | v5.0.0 | Confirmed |
| actions/deploy-pages | cd2ce8fcbc39b97be8ca5fce6e763baed58fa128 | v5.0.0 | Confirmed |

No shortened SHAs. No mutable tags. Pass.

### 4. Secret exposure and arbitrary code execution

No secrets are referenced (no `${{ secrets.* }}`). The deploy uses the OIDC token model, which is correct: `id-token: write` lets the runner exchange a short-lived OIDC token with the Pages service; no long-lived personal access token (PAT) or deploy key is needed or present.

No `curl | bash`, no `wget`, no external script fetch of any kind. The only code executed at runtime is the `cp` series and the three official GitHub-owned actions. No `pull_request_target` trigger is present. Pass.

### 5. Assemble step scope

Files copied into `_site/`:

- `index.html` — required entry point
- Six `.jsx` source files (all runtime, unbundled Babel pattern)
- Two `.css` files
- `theme.js`, `models.json`
- `assets/` and `fonts/` directories (recursive copy)
- `LICENSE`, `README.md`, `VERSION`

Files confirmed excluded:

- `node_modules/` — not present on the runner after a plain checkout (no install step), so cannot be copied even if accidentally named
- `.github/` — not copied
- `docs/` — not copied
- `package.json`, `package-lock.json`, `release-please-config.json`, `.release-please-manifest.json` — not copied
- `eslint.config.js`, `.stylelintrc.json`, `.htmlhintrc`, `pa11y.json`, `.gitignore` — not copied
- `todo.md` — not copied

The exclusion list is complete. No config file, no dot file, no dev tooling artefact reaches `_site/`. Pass.

## Observations (not blocking)

The `Assemble site` step uses individual `cp` calls rather than a deny-listed exclusion approach. This is intentional for an unbundled site and is safe because the set of runtime files is small and stable. The comment in the file explains the design. If the file list grows, the team should consider whether a script with an explicit allowlist is easier to maintain than adding more `cp` lines.

The `concurrency` block cancels in-progress deploys on new pushes to `main`. This is the correct setting for a static site where a superseded deploy has no value.

## Verdict

Approved. All five checks pass with no findings. The workflow is ready to merge.
