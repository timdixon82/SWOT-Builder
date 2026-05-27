# ADR 0002: JSX compiled in the browser with Babel Standalone, no build step

Status: Accepted (backfilled 2026-05-22)

## Context

The application is written in React with JSX (JavaScript XML). Browsers cannot run JSX directly; it must be compiled to plain JavaScript. The project wants to stay editable with nothing more than a text editor and a static file server.

## Decision

Compile JSX in the browser at run time using Babel Standalone, loaded from a CDN (content delivery network). Application files are declared in `index.html` as `type="text/babel"` scripts. There is no build step and no build tooling in the repository.

## Alternatives considered

- A standard build pipeline (Node.js plus a bundler such as Vite). Rejected for now: it adds tooling, a package lockfile, and a compile step the project does not need at its current size.
- Writing the user interface without JSX, using React's `createElement` directly. Rejected: it makes the screen code far harder to read and maintain.

## Consequences

The project needs no install and no build. Editing a `.jsx` file and reloading the browser is the full development loop.

The costs are:
- Babel Standalone compiles on every page load in the visitor's browser. For six small files this is a few hundred milliseconds and is acceptable, but it would not scale.
- Babel Standalone is a large, development-grade download, not intended for production traffic at scale.
- The application cannot run from a `file://` path. It must be served over HTTP because the browser blocks the follow-up fetch of each `.jsx` file from a file path.

Trigger to revisit: if load time becomes noticeable to users, or the codebase grows past roughly a dozen files, add an offline build step. Any such change would require a new ADR superseding this one.
