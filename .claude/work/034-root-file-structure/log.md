# Log: 034-root-file-structure

## [2026-07-29] Intake | Tim reports flat file structure on live site

Tim asked for the live site's resource files to be reorganised into folders instead of sitting flat at the site root, citing https://projects.timdixon.net/SWOT-Builder/.

Sonja fetched the live page and confirmed it matches the repository root exactly (theme.js, colors_and_type.css, swot-styles.css, swot-engine-core.js, and five .jsx files all at root). Checked this against the project wiki and found the flat layout is the recorded architecture, not an oversight:

- ADR 0001: static browser app, no server, relative paths.
- ADR 0002: Babel Standalone compiles JSX in-browser.
- ADR 0003: global `window` wiring, no ES modules for app scripts.
- ADR 0006: static hosting, deploy by file copy, no build step.

The CSP `connect-src 'self'` in index.html exists specifically so Babel Standalone can XHR-fetch the .jsx files same-origin; ADR 0001's consequences section notes a blank screen is the known failure mode if a script path breaks.

Decision: this is architecture-sensitive (touches four recorded ADRs), so per the conformance check this escalates to Jacob rather than going straight to Sean. Before spending Jacob's time, Sonja is taking the ADR conflict back to Tim as Q-SWOT1, since reorganising the layout would need at least one ADR amended or superseded, which counts as a standards change.

Status set to blocked pending Tim's answer. No specialist dispatched yet.
