# ADR 0005: Dependency-free project; no install, no lockfile

Status: Accepted (backfilled 2026-05-22)

## Context

The project wants to stay simple to edit and to host. A standard install step (`package.json`, `node_modules`, a lockfile) adds tooling the project's size does not justify.

## Decision

Install nothing locally. Keep no `package.json`, no `node_modules`, and no lockfile. Load every third-party library at run time from a CDN (content delivery network). The repository holds only source files and fonts.

## Alternatives considered

- Install dependencies with a package manager and vendor them into the repository. Rejected for now: it adds an install step and tooling. Note that ADR 0007 records a related availability concern that may revisit this.

## Consequences

The project stays editable with a text editor and runnable with a static file server.

The cost is that "no install" is not "no supply chain." Five libraries still load into the page from CDNs, and their integrity and availability must be managed at the CDN-link level. ADR 0007 covers the pinning and verification requirements. This ADR governs the no-install stance; ADR 0007 governs how the CDN dependencies are pinned and verified.
