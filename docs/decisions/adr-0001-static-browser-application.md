# ADR 0001: Browser application built from static files, no server

Status: Accepted (backfilled 2026-05-22)

## Context

SWOT Builder helps a person build a SWOT analysis with AI (artificial intelligence) assistance. A core goal is privacy: the person's data must not leave their machine. A second goal is that the tool needs no account and no setup.

## Decision

Build the whole application as static files (Hypertext Markup Language, Cascading Style Sheets, and JavaScript) that run entirely in the browser. Use no server, no database, and no server-side language. Hold all state in the browser and persist it to `localStorage` under a versioned key, `swot-builder-v1`.

## Alternatives considered

- A client-server application with a back-end API (application programming interface). Rejected: a server that can see the person's data breaks the privacy goal, and it adds hosting cost and an account system.
- A desktop application. Rejected: it needs installation, which the no-setup goal rules out, and it is far heavier to build and ship.

## Consequences

The privacy goal is met by construction: with no server there is nowhere for data to go. Hosting is cheap and simple. See ADR 0006 for hosting.

The cost is that state lives on one device in one browser. There is no sync across devices, and clearing browser data loses the analysis. The versioned storage key lets a future change to the saved shape migrate cleanly from `v1` to `v2` without misreading old data.

State management and theme handling are both part of this decision. The theme script `theme.js` runs first in the document head, before any stylesheet, and sets `data-theme` on the root element synchronously to avoid a flash of the wrong colour palette. Export (Markdown download, image copy, print) is entirely client-side, consistent with the no-server goal.
