# ADR 0003: No JavaScript modules; files wire together through the global window object

Status: Accepted (backfilled 2026-05-22)

## Context

The application is split into six files: a shared tweaks shell, an engine, three screens, and a root controller. They must share components and helpers. The no-build choice (ADR 0002) rules out a module bundler.

## Decision

Use classic scripts, not JavaScript modules. Each file attaches what other files need onto the global `window` object and reads its own dependencies back off `window`. The load order in `index.html` is fixed so that a file's dependencies always load before it:

1. Third-party libraries: React, ReactDOM, Babel Standalone, html2canvas.
2. `tweaks-panel.jsx` puts `TweaksPanel`, `useTweaks`, and the tweak controls on `window`.
3. `swot-engine.jsx` puts `LocalAI`, `BUCKETS`, the storage helpers, and the AI functions on `window`.
4. `swot-intro.jsx`, `swot-interview.jsx`, `swot-board.jsx` each put one screen component on `window`.
5. `swot-app.jsx` last: reads everything off `window` and calls `ReactDOM.createRoot`.

Babel processes `type="text/babel"` scripts in document order, so the declared order is the run order.

## Alternatives considered

- Native JavaScript modules with `import` and `export`. Workable in modern browsers without a bundler, but mixing native modules with `type="text/babel"` scripts is awkward. Rejected to keep the loading model uniform.
- A single large file. Rejected: hard to read and to review.

## Consequences

The pattern is simple and needs no tooling.

The risk is that the dependency graph is implicit. It lives in the `window` object and the `index.html` order. A file added in the wrong position fails late and quietly. Two rules apply to all later work to contain this:

- Every file must declare, in a comment at its top, what it reads off `window` and what it writes to `window`. `swot-engine.jsx` does this well already; all other files should match it.
- Any new file is inserted into `index.html` in dependency order, and the order comment in `index.html` is kept accurate.

A secondary consequence: because all files share one global scope, React hooks are aliased per file to avoid collisions. For example: `useS_A` in the app, `useS_I` in the interview, `useS_B` in the board. This is expected and acceptable given the no-modules constraint.
