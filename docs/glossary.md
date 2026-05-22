# Glossary

This page defines terms specific to SWOT Builder. General team terms are in the global wiki glossary at `docs/glossary.md` in the AgentTeam repository.

## A

**ADR (Architecture Decision Record)**: a short document recording one significant architectural choice. It states the context, the decision made, the alternatives considered, and the consequences. SWOT Builder has seven ADRs in the `docs/decisions/` folder.

**AI (artificial intelligence)**: the technology used to suggest SWOT items and generate interview questions. SWOT Builder uses browser-local AI only; no data is sent to a remote server.

**API (application programming interface)**: a defined way for one piece of software to talk to another. SWOT Builder requires no API key.

## B

**Babel Standalone**: the Babel JavaScript compiler packaged to run inside the browser. SWOT Builder uses it to compile JSX to plain JavaScript at page load time, removing the need for a build step.

**board style**: one of four visual layouts for the SWOT board. The four styles are Classic, Executive, Bold, and Pills.

**browser-local AI**: AI that runs inside the browser on the user's own device, using either the Chrome Prompt API (tier 1) or WebLLM via WebGPU (tier 2). No user data leaves the machine.

**bucket**: the quadrant a SWOT item belongs to. The four buckets are Strength (S), Weakness (W), Opportunity (O), and Threat (T).

## C

**CDN (content delivery network)**: a network of servers that serves files to users from a location close to them. SWOT Builder loads React, ReactDOM, Babel Standalone, html2canvas, and WebLLM from CDNs.

**Chrome Prompt API**: a browser API (application programming interface) built into Chrome 127 and later that provides access to Gemini Nano, an AI model that runs on the device.

**coach note**: a short piece of contextual guidance returned by the AI alongside a suggestion card. It appears in italic below the interview question.

**coach tone**: a user preference for how the AI frames its interview questions. The three options are Friendly, Concise, and Playful. Note: as of the initial backfill, the coach tone setting is stored but not yet read by the AI prompt. See the known gaps section of the requirements.

**confidence level**: a rating attached to a SWOT item by the user. The three levels are low, medium, and high. Displayed as filled dots with an accessible text label.

**CSP (Content Security Policy)**: an HTTP response header or HTML meta tag that tells the browser which resources it is allowed to load. A CSP is a medium-severity finding in the baseline security review.

## D

**data-theme**: an HTML attribute set on the `<html>` element by `theme.js`. Its value is either `"light"` or `"dark"`.

**DOM (document object model)**: the browser's internal representation of the HTML structure of a page.

## F

**FR (functional requirement)**: a requirement that describes a specific behaviour the application must have. SWOT Builder has 17 functional requirements.

## G

**Gemini Nano**: Google's on-device AI model built into Chrome. Available via the Chrome Prompt API (tier 1 AI backend).

## H

**html2canvas**: a JavaScript library (version 1.4.1) that renders the visible DOM to a canvas element, allowing the board to be copied or downloaded as a PNG image.

## J

**JAWS (Job Access With Speech)**: a screen reader application for Windows. Tim uses JAWS on Windows.

**JSX (JavaScript XML)**: the syntax React uses to write user-interface markup inside JavaScript. Browsers cannot run JSX directly; it must be compiled to plain JavaScript. SWOT Builder uses Babel Standalone to do this at run time in the browser.

## L

**LocalAI**: the object in `swot-engine.jsx` that manages the three-tier AI backend. It handles detection, initialisation, and status broadcasting.

**localStorage**: the browser's built-in key-value store for persistent data. SWOT Builder stores all application state under the key `swot-builder-v1` and the theme preference under `td-theme`.

## M

**manual mode**: the third and lowest AI tier. When no AI backend is available, the application shows a fixed rotation of twelve pre-written interview questions. The user picks the quadrant for each answer.

## N

**NFR (non-functional requirement)**: a requirement that describes a quality the application must have, such as accessibility, performance, or security. SWOT Builder has six non-functional requirements.

## O

**OWASP (Open Web Application Security Project)**: a non-profit organisation that publishes guidance on web application security. SWOT Builder's security review is mapped against the OWASP Top 10 (2021 edition).

## P

**postMessage**: a browser API that allows a page to send a message to another window or iframe. SWOT Builder uses postMessage to communicate between the Tweaks panel and the parent window.

**Prompt API**: see Chrome Prompt API.

## Q

**quadrant**: one of the four sections of the SWOT board. The four quadrants are Strengths, Weaknesses, Opportunities, and Threats.

## R

**React**: a JavaScript library for building user interfaces. SWOT Builder uses React 18.3.1, loaded from a CDN.

## S

**scope**: the category of subject being analysed. The six scope options are Business / product strategy, Personal / career, Project or initiative, Team or organisation, A decision I'm weighing, and Something else.

**SRI (Subresource Integrity)**: a browser security mechanism that verifies a file has not been tampered with by checking its cryptographic hash against the value declared in the HTML tag.

**SWOT**: Strengths, Weaknesses, Opportunities, and Threats. A structured analytical framework.

**swot-builder-v1**: the localStorage key under which SWOT Builder stores all application state (step, session, items, and board style). The `v1` suffix allows a future change to the stored shape to migrate cleanly.

## T

**td-theme**: the localStorage key under which SWOT Builder stores the user's light or dark mode preference.

**Tweaks panel**: a floating, draggable panel that provides controls for board style and coach tone. It is hidden by default and activated by a `__activate_edit_mode` window message.

## U

**UK GDPR (UK General Data Protection Regulation)**: data protection law in the United Kingdom. SWOT Builder's data-protection position is assessed in the security review. No personal data is transmitted by the application.

## V

**VoiceOver**: a screen reader built into macOS and iOS. Tim uses VoiceOver on macOS.

## W

**WCAG (Web Content Accessibility Guidelines)**: the international standard for web accessibility, published by the W3C (World Wide Web Consortium). SWOT Builder targets WCAG 2.2 at AAA conformance.

**WebGPU**: a browser API that provides access to the device's graphics processor for general-purpose computation. Used by WebLLM to run AI models.

**WebLLM**: a library that runs large language AI models inside the browser using WebGPU. It is the tier 2 AI backend in SWOT Builder.

**window object**: the global object in a browser's JavaScript environment. SWOT Builder uses it as the shared namespace between its six script files, since it does not use JavaScript modules.
