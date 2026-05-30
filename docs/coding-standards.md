# Coding Standards

This page holds the stack-independent standards for the software team. They apply to every project, whatever the technology stack. Standards that depend on a particular stack live in `stacks/`. There is one standards file per stack, and each one is written the first time that stack is used. The team builds accessible, secure software for Tim Dixon, who is blind, so accessibility and security are not optional extras here. They are part of the definition of done.

## General Principles

These principles guide every line of code the team writes. When a rule below conflicts with a clever trick, the rule wins.

### Write clear code

Code is read far more often than it is written. Write it so the next reader, who may be a teammate or Tim himself, understands it without effort. Choose plain constructs over clever ones. If a piece of code needs a long explanation to be understood, rewrite the code rather than the explanation.

### Keep functions small and focused

Each function should do one thing and have one clear job. A function that fetches data, transforms it, and renders it is really three functions. Split it. Small functions are easier to name, test, and reuse. As a rough guide, if a function does not fit on one screen, look hard for a way to break it up.

### Write comments that explain why, not what

The code already says what it does. A good comment says why it does it: why this approach, why this value, why this exception. Comments that merely restate the code add noise and drift out of date. Remove them. Keep comments that capture intent, trade-offs, links to a ticket, or a warning about a non-obvious side effect.

### Handle errors explicitly

Never let an error pass silently. Every operation that can fail must have a defined behaviour when it does fail: handle it, retry it, or surface it to the user with a clear message. Do not swallow exceptions in an empty catch block. Do not ignore a returned error value. When you cannot handle an error where it occurs, let it travel up to a place that can, and make that path obvious.

### Leave no dead code

Delete code that is no longer used: unused functions, commented-out blocks, unreachable branches, and stale feature flags. Version control keeps the history, so there is no need to keep old code "just in case". Dead code confuses readers and hides bugs.

### Prefer the simple solution

Choose the simplest design that meets the requirement. Do not build for a future that has not been asked for. A smaller, plainer solution is easier to test, easier to secure, and easier to change later. Add complexity only when a real need arrives, and when it does, add the least amount that solves the problem.

### Be consistent within a file

Match the style already present in the file you are editing: its naming, its layout, its patterns. A file that mixes two styles is harder to read than a file that picks one and sticks to it. When a whole file needs a new style, change it in one deliberate commit rather than drifting piece by piece.

## Naming Standards

Good names make code searchable, and they make change history readable. The rules below apply across every stack.

### File names

Name files in kebab-case: lower-case words joined by hyphens, for example `user-profile.css` or `order-summary.php`. Avoid spaces, capital letters, and underscores in file names. Where a stack has a strong convention of its own, for example a WordPress template file, follow that convention and note it in the relevant stack page.

### Identifiers

Give every variable, function, and class a clear, descriptive name that states its purpose. Prefer `unreadMessageCount` over `n` or `tmp`. A reader should understand what an identifier holds without tracing where it came from. Avoid abbreviations unless they are widely understood. Boolean names should read as a yes or no question, for example `isVisible` or `hasConsent`.

### Branch names

Name branches after the work they contain. Use a short type prefix, then a brief description in kebab-case, for example `feature/contact-form-validation`, `fix/heading-order-on-blog`, or `chore/update-dependencies`. A branch name should tell a teammate what the branch is for before they read a single commit.

### Commit messages

Write commit messages in the Conventional Commits style. The first line is a type, an optional scope, then a short summary, for example `feat(forms): add inline error messages to the contact form`. Common types are `feat` for a new feature, `fix` for a bug fix, `docs` for documentation, `chore` for maintenance, `refactor` for a change that does not alter behaviour, and `test` for tests. A breaking change is marked with an exclamation mark after the type or scope, for example `feat!:`, and explained in the commit body.

This style is not just tidy. Releases use release-please, a tool that reads commit messages to work out the next version number and to build the changelog automatically. A `fix` commit triggers a patch release, a `feat` commit triggers a minor release, and a breaking change triggers a major release. If the commit messages are wrong, the version number and the changelog will be wrong too.

## User Interface Standards

Every interface the team builds must be usable by someone who navigates with a keyboard and a screen reader, and by someone who does not. The rules here cover structure and behaviour. The detailed conformance treatment, including the Web Content Accessibility Guidelines (WCAG) success criteria, is in `accessibility.md`. Read that page alongside this section.

### Semantic HyperText Markup Language first

Use the HyperText Markup Language (HTML) element that matches the meaning of the content. A button that performs an action is a `<button>`, a link that goes somewhere is an `<a>`, a list of items is a `<ul>` or `<ol>`, and a data table is a `<table>` with proper headers. Native elements come with keyboard support, focus behaviour, and screen reader roles already built in. Reach for `<div>` and `<span>` only when no meaningful element fits. Use Accessible Rich Internet Applications (ARIA) attributes to fill genuine gaps, never to paper over the wrong element.

### Heading structure

Each page has exactly one H1 that names the page. Headings below it descend in order without skipping a level: an H2 may be followed by an H3, but not directly by an H4. Headings describe the content that follows them, and they form the outline a screen reader user relies on to move around the page. Do not pick a heading level for its visual size; pick it for its place in the outline, and style it with Cascading Style Sheets (CSS).

### Layout and reflow

Build layouts that adapt to the user's window and zoom level. Content must reflow into a single column without loss of information or a need to scroll in two directions, down to a viewport width of 320 pixels and at up to 400 percent zoom. Do not fix dimensions in a way that clips or hides text when the user enlarges it. Respect the user's settings, including reduced-motion and increased-contrast preferences.

### Component states

Every interactive component must make all of its states visible and announced. This includes the default, hover, focus, active, selected, disabled, and error states. A visible focus indicator is mandatory on every focusable element, and it must have strong contrast against its background. Never remove the focus outline without replacing it with something at least as clear. State that is conveyed by colour must also be conveyed by text, shape, or an icon, because colour alone is not enough.

### Interaction patterns

Everything that works with a mouse must work with a keyboard, in a logical order, with no keyboard trap. Use familiar patterns for familiar components so users do not have to relearn them. Do not trigger a significant change of context, such as a new page or a moved focus, simply because an element received focus or a value changed; wait for a deliberate action. Give users enough time, and let them pause, stop, or extend anything that moves, updates, or times out.

### Content structure

Write in plain language and keep sentences short. Break long content into sections with clear headings, lists, and short paragraphs. Put the most important information first. Use descriptive link text that makes sense out of context: "read the accessibility policy" rather than "click here". Provide a text alternative for every image, chart, and diagram that carries meaning, and mark purely decorative images so assistive technology skips them.

### Forms

Every form control has a visible, programmatically associated label. Group related controls, for example a set of radio buttons, with a `<fieldset>` and a `<legend>`. Errors are reported in text, next to the field they concern, and they are announced to screen reader users; do not rely on colour or an icon alone. Tell the user what is required before they submit, explain how to fix a problem in clear words, and for anything legal, financial, or hard to reverse, let the user check and confirm before the change is final.

### Tables

Never use layout tables. A layout table is a `<table>` element used to arrange content visually into columns when the content is not genuinely tabular. Layout tables break the reading order for screen reader users and fail WCAG 1.3.1 (Info and Relationships, Level A) and 1.3.2 (Meaningful Sequence, Level A).

Use real `<table>` elements, with `<caption>`, `<thead>`, `<th scope="col">`, and `<tbody>`, for any data that is genuinely tabular: data with a row-and-column structure where the column header names the meaning of each cell. The project-status grid in `outputs/status.html` (seven named columns, one row per project) is an example of genuinely tabular data and must use a real `<table>`. Wrap any `<table>` in a `<div>` with `overflow-x: auto` so it scrolls horizontally on narrow viewports without requiring two-dimensional scrolling of the whole page (WCAG 1.4.10 Reflow, Level AA).

## Accessibility

The team has one accessibility floor, and it is not negotiable: WCAG 2.2 at conformance level AAA. AAA is the highest of the three WCAG levels, and meeting it means the work is usable for Tim and for a wide range of other users with disabilities.

This section is only a pointer. The full treatment, which lists the relevant WCAG 2.2 success criteria, explains how to test against them, and describes the assistive technologies the team supports, lives in `accessibility.md`. Read that page before starting any user-facing work, and treat its checklist as part of the definition of done.

## Security

Security is built in from the start, not added at the end. The baseline below applies to every stack. Anything specific to a stack, for example how a particular framework escapes output, is recorded in that stack's page.

### The OWASP Top 10

The Open Worldwide Application Security Project (OWASP) publishes the Top 10, a list of the most common and serious web application security risks. The team treats each category as a requirement to defend against.

- Broken access control: check authorisation on the server for every request, deny by default, and never trust a permission decision made in the browser.
- Cryptographic failures: encrypt personal and sensitive data in transit and at rest, use current strong algorithms, and never invent your own cryptography.
- Injection: separate code from data by using parameterised queries and safe Application Programming Interfaces (APIs), and never build a query by joining strings.
- Insecure design: think through threats before writing code, and choose a design that fails safe rather than one that needs perfect operation to stay secure.
- Security misconfiguration: ship with safe defaults, remove sample content and unused features, and keep configuration the same across environments except for genuine secrets.
- Vulnerable and outdated components: keep an inventory of dependencies, update them promptly, and remove any you no longer use.
- Identification and authentication failures: use proven authentication mechanisms, protect against guessing and reuse, and manage sessions safely.
- Software and data integrity failures: verify the source and integrity of code and updates, and do not load dependencies from untrusted places.
- Security logging and monitoring failures: log security-relevant events so that an attack can be detected and investigated, while keeping secrets and personal data out of the logs.
- Server-side request forgery: validate and restrict any URL the server is asked to fetch, and block requests to internal addresses.

### Secrets handling

No secret is ever committed to version control: not an API key, not a database password, not a signing key, not a token. Secrets are stored in 1Password and read at build time or run time from the 1Password command-line tool. Configuration files reference a secret by name; they never contain its value. If a secret is ever committed by mistake, treat it as compromised, rotate it immediately, and then remove it from history.

### Security response headers

Every site the team ships sends a set of security response headers. The example values below are a sensible starting point; tune them to each project and test them before release.

- `Content-Security-Policy: default-src 'self'; object-src 'none'; base-uri 'self'` restricts where scripts, styles, and other resources may load from, which limits the damage of an injection.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` tells browsers to use HyperText Transfer Protocol Secure (HTTPS) for this site, and its subdomains, for a year.
- `X-Content-Type-Options: nosniff` stops the browser guessing a file's type and treating, for example, an upload as a script.
- `Referrer-Policy: strict-origin-when-cross-origin` limits how much of the current URL is sent to other sites.
- `X-Frame-Options: DENY`, or an equivalent `frame-ancestors` rule in the Content Security Policy, stops the site being framed by another, which defends against clickjacking.
- `Permissions-Policy: geolocation=(), camera=(), microphone=()` switches off browser features the site does not need.

### Input validation and output encoding

Treat all input as untrusted: form fields, URL parameters, headers, cookies, uploaded files, and data from other systems. Validate input against a strict allow-list of what is acceptable, in terms of type, length, format, and range, and reject anything else. Validate on the server even when the browser already validates, because browser checks can be bypassed. When data is sent back out, encode it for the exact context it lands in, whether that is HTML, an HTML attribute, JavaScript, a URL, or a Structured Query Language (SQL) query, so that data can never be read as code.

### Authentication

Prefer passkeys for user sign-in. Passkeys use public-key cryptography, cannot be phished or reused across sites, and remove the password as a thing to steal. Where a password must still be supported, never store it in plain text and never store it with a fast or outdated hash. Hash passwords with Argon2id, a current memory-hard algorithm, using parameters tuned for the host. Enforce sensible session handling: a fresh session identifier after sign-in, a reasonable timeout, secure and HttpOnly cookies, and a working sign-out.

### HTTPS everywhere

Serve every page and every API over HTTPS, with no exceptions and no mixed content. Redirect any plain HyperText Transfer Protocol request to HTTPS, and back the redirect with the Strict-Transport-Security header described above. Keep certificates valid and renew them automatically so they never lapse.

### Logging hygiene

Logs help the team find and fix problems, but they are also a target. Never log a secret, a password, a token, a full payment detail, or personal data. Where a record of an event is needed, log an identifier rather than the sensitive value itself. Protect log files with the same care as the system they describe, and keep them only as long as they are useful.

### No paid third-party tokens in CI

No paid external service token is introduced into any repository's continuous integration pipeline. CI must stay self-contained on free tooling. This applies to every project the team creates or adopts.

In practice, this means:

- Semgrep runs as `semgrep scan --config p/default --error` (token-free, self-contained). Never use `semgrep ci`, which silently no-ops or fails without a `SEMGREP_APP_TOKEN`.
- No `SEMGREP_APP_TOKEN`, `SNYK_TOKEN`, `SONAR_TOKEN`, or any other paid scanning service token is added as a repository secret or referenced in a workflow.
- If a tool requires an account or a paid token to function, it is not used in CI. Prefer equivalent free alternatives or skip that specific check.

A future addition of a paid token is treated as a scope change: it requires Tim's explicit approval and a noted exception in the project's `docs/security-review.md`.

### Rate limiting

Limit how often a client can call sensitive endpoints, including sign-in, password reset, contact forms, and search. Rate limiting blunts brute-force attacks, credential stuffing, and abuse, and it protects the service from being overwhelmed. When a limit is reached, respond with a clear status and message, and log the event so a pattern of abuse can be spotted.

### United Kingdom General Data Protection Regulation

The United Kingdom General Data Protection Regulation (UK GDPR) governs how personal data is handled. Every project that touches personal data must meet it, and the points below are the practical minimum.

- Lawful basis: identify and record a lawful basis before collecting any personal data. Common bases are consent, a contract, a legal obligation, and legitimate interests. The basis must be chosen before collection, not justified afterwards.
- Consent: where consent is the basis, it must be a clear, specific, informed, and freely given opt-in. No pre-ticked boxes, no bundling consent with other terms, and withdrawing consent must be as easy as giving it.
- Data minimisation: collect only the personal data the task actually needs. Do not gather extra fields in case they prove useful later. Less data held is less data to protect and less data to lose.
- Retention: decide in advance how long each kind of personal data is kept, write that period down, and delete or anonymise the data when the period ends. Do not keep personal data indefinitely.
- Data subject rights: build in the means to honour individuals' rights, including the right to be informed, the right of access, the right to rectification, the right to erasure, and the right to object. A person must be able to ask what is held about them, correct it, or have it deleted, and the team must be able to act on that request.

When in doubt about a data question, raise it early rather than guessing, because a privacy mistake is hard to undo.

## Repository Standards

These standards apply to every repository the team creates or adopts, whatever the technology stack.

### Version string

Every repository carries a version string so releases can be tracked. The version string lives in two places.

First, a plain-text file named `VERSION` at the repository root. The file contains one line: the current version in semantic versioning format, for example `1.2.3`. No other content. The file is committed to version control and updated on every release.

Second, where the project has a visible interface that a user can see or reach, the version is also shown there in a place the user can find it. For a web page, a small, unobtrusive version note in the footer or on an about page is sufficient. The exact placement is a project decision, but the version must be reachable without knowing where to look.

The release process in `release-process.md` records when and how the version string is updated.

### Expanded README

Every repository has a README that a new reader can use to understand and run the project. A one-line README is not sufficient.

At minimum, every README covers:

- What the project is, in plain language.
- How to run or use it, including any setup steps.
- The file structure, where that is not obvious.
- A link to the live site, where one exists, with descriptive link text.

The README is written in plain language and follows the screen-reader output style: one H1, ordered headings, no skipped levels, descriptive link text, and no emoji. It is updated whenever the project structure, setup steps, or live site change.

### Local git config for project repositories

Every project repository cloned to Tim's machine must have its local git user config set to Tim's GitHub identity. Without this, commit author emails fall through to the macOS system default (for example `timdixon@Tims-MacBook-Pro.local`), which has no GitHub account. Vercel and other continuous integration and deployment services block preview deployments when the commit author cannot be matched to a GitHub account.

Set these two values in every project repository:

- `git -C "/absolute/path/to/repo" config user.email "157529682+timdixon82@users.noreply.github.com"`
- `git -C "/absolute/path/to/repo" config user.name "Tim Dixon"`

This must be done in three situations: when a project repository is first cloned to the machine; when a new repository is created for a project; and as a step in the project setup checklist when any agent runs the initial project scaffold.

## Stack

This project uses the **static browser stack**: HTML, CSS, and vanilla JavaScript running in the browser, with no build step, no Node.js dependency bundler, and no server-side rendering. Babel Standalone handles in-browser JSX compilation. Key decisions behind these choices are recorded in [ADR-0001](decisions/adr-0001-static-browser-application.md) and [ADR-0002](decisions/adr-0002-babel-standalone-in-browser-compile.md).

Stack-specific coding standards for the static browser stack, if they are promoted to a reusable document, belong in `docs/stacks/static-browser.md`. Standards that apply only to this project stay here or in the relevant decision and pattern records.
