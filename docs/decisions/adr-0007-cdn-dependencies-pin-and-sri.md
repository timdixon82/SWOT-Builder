# ADR 0007: Third-party libraries loaded from CDNs; pin and integrity-check them

Status: Accepted with risk (backfilled 2026-05-22)

## Context

Following ADR 0005, all five third-party libraries load at run time from CDNs (content delivery networks). As built, three are in good shape and two are not:

- React 18.3.1 (unpkg): pinned to an exact version, SRI (Subresource Integrity) hash present.
- ReactDOM 18.3.1 (unpkg): pinned to an exact version, SRI hash present.
- Babel Standalone 7.29.0 (unpkg): pinned to an exact version, SRI hash present.
- html2canvas 1.4.1 (unpkg): pinned to an exact version, but no SRI hash.
- WebLLM (jsDelivr): not pinned to a version, no SRI hash. The code comment acknowledges this: "Use npm latest; pin to a specific version tag if you need reproducibility."

WebLLM is lazy-loaded only when the person picks a model, but it runs in the page with full page rights.

## Decision

Keep loading libraries from CDNs (consistent with ADR 0005), but require every CDN-loaded library to be pinned to an exact version and to carry an SRI hash. Remediate the two gaps: add an SRI hash to html2canvas 1.4.1, and pin WebLLM to an exact version then add its SRI hash.

## Alternatives considered

- Leave the gaps as built. Rejected: an unpinned, unverified library can change behaviour or break with no repository change. WebLLM runs with full page rights, so a bad delivery is a security matter.
- Self-host (vendor) all libraries inside the repository. Not adopted in this ADR but recorded as the stronger option: it removes the CDN as a dependency and a single point of failure, at the cost of larger repository files and a vendoring step. This is offered to Tim as question Q29.

## Consequences

With every library pinned and hashed, the application is reproducible and protected against a tampered or swapped file. The browser refuses any file whose content does not match its declared hash.

A residual risk remains and is accepted for now: the application still depends on the CDNs being reachable. There is no offline fallback if a CDN is down. Resolving this fully means self-hosting, which is question Q29 for Tim.

Until then this ADR stands as accepted-with-risk. The pin-and-hash work for html2canvas and WebLLM is a condition of the setup build phase.

New third-party libraries added in any future phase must follow this rule from the start: pinned to an exact version and carrying an SRI hash before merging.
