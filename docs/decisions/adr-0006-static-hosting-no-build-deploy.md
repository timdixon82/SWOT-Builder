# ADR 0006: Static hosting over HTTP; no build or deploy step

Status: Accepted (backfilled 2026-05-22)

## Context

The application is a set of static files (ADR 0001) compiled in the browser (ADR 0002). It needs to be served somewhere over HTTP. The one hard requirement is HTTP rather than `file://`, because in-browser JSX (JavaScript XML) loading needs it.

## Decision

Host the application on a static file server that serves files over HTTP. Deploy by copying the repository files to the host. There is no build step and no deploy pipeline. The application uses relative paths so it works from any base path.

## Alternatives considered

- A virtual private server running an application server. Rejected: unnecessary, since there is no server-side code.
- A build-and-deploy pipeline producing a compiled bundle. Rejected for now: it would reverse the no-build choice in ADR 0002 for a project that does not need it.

## Consequences

Hosting is cheap and simple. GitHub Pages is the natural fit since the project is already on GitHub. Deployment is a file copy. The cost is the same browser-side compile cost as ADR 0002.

The exact hosting target is not yet recorded. Question Q28 is open for Tim to decide whether to use GitHub Pages, another static host, or a virtual private server.

Trigger to revisit: a build step would only be justified if ADR 0002 is revisited. The two decisions are coupled.
