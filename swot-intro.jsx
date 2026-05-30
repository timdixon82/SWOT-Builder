/* swot-intro.jsx — first-screen: pick subject, scope, title.
 * Exports <SwotIntro> to window. */

const { useState, useRef, useEffect } = React;

const SCOPE_OPTIONS = [
  { id: "business",  label: "Business / product strategy" },
  { id: "career",    label: "Personal / career" },
  { id: "project",   label: "Project or initiative" },
  { id: "team",      label: "Team or organisation" },
  { id: "decision",  label: "A decision I'm weighing" },
  { id: "generic",   label: "Something else" },
];

const SUBJECT_EXAMPLES = [
  "Launching our mobile app",
  "My career at 35",
  "Moving to Berlin",
  "Adopting AI internally",
  "Our Q3 marketing push",
];

// ── AI status line for intro card ────────────────────────────────────────────
// Shows a plain-English sentence and coloured dot so users know AI readiness
// before they start. The live region announces changes without a page reload.
// eslint-disable-next-line no-unused-vars -- used as JSX tag inside SwotIntro
function AiStatusLine({ aiState = {} }) {
  const { status } = aiState;

  let dotColor, text;

  if (status === 'starting') {
    dotColor = "var(--border)";
    text = "Checking for AI support…";
  } else if (status === 'ready') {
    dotColor = "var(--pass)";
    text = "AI-powered analysis is enabled.";
  } else if (status === 'loading') {
    dotColor = "#FF7C00";
    text = "AI model loading…";
  } else {
    // unavailable or anything else
    dotColor = "var(--border)";
    text = "Running in manual mode — AI not loaded. You can load an AI model from the header.";
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        padding: "var(--space-2) 0",
        fontSize: "var(--text-sm)",
        color: "var(--fg-muted)",
        marginTop: "var(--space-3)",
      }}
    >
      <span aria-hidden="true" style={{
        width: 9,
        height: 9,
        borderRadius: "50%",
        background: dotColor,
        flexShrink: 0,
        display: "inline-block",
      }} />
      <span>{text}</span>
    </div>
  );
}

function SwotIntro({ onStart, aiState = {} }) {
  const [subject, setSubject] = useState("");
  const [scope, setScope] = useState("business");
  const [title, setTitle] = useState("");
  const subjectRef = useRef(null);

  useEffect(() => { subjectRef.current?.focus(); }, []);

  const computedTitle = title || (subject ? `SWOT: ${subject}` : "SWOT Analysis");
  const canStart = subject.trim().length > 1;

  return (
    <main id="main-content" className="intro">
      <div className="intro-card fade-in">
        <p className="intro-eyebrow">SWOT Builder · Guided interview</p>
        <h2>Let&rsquo;s map it out together.</h2>
        <p className="lede">
          Tell me what you want to analyse. I&rsquo;ll ask a few warm questions,
          sort your answers into <strong>S</strong>trengths, <strong>W</strong>eaknesses,{" "}
          <strong>O</strong>pportunities, and <strong>T</strong>hreats — and build a clean board you can share.
        </p>

        <div className="mini-swot" aria-hidden="true">
          <div className="mini-cell s">Strengths</div>
          <div className="mini-cell w">Weaknesses</div>
          <div className="mini-cell o">Opportunities</div>
          <div className="mini-cell t">Threats</div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="subject">What are we analysing?</label>
          <input
            id="subject" className="input" ref={subjectRef}
            placeholder="e.g. Launching our new podcast"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && canStart) onStart({ subject: subject.trim(), scope, title: computedTitle });
            }}
          />
          <div className="subject-suggestions">
            {SUBJECT_EXAMPLES.map(ex => (
              <button key={ex} className="chip" type="button" onClick={() => setSubject(ex)}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="scope">What kind of subject is this?</label>
          <select
            id="scope" className="input"
            value={scope}
            onChange={e => setScope(e.target.value)}
            style={{ appearance: "auto", cursor: "pointer" }}
            aria-describedby="scope-hint"
          >
            {SCOPE_OPTIONS.map(o => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
          <p className="field-hint" id="scope-hint">Helps me tailor the questions.</p>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="title">Title for the finished board <span id="title-hint" style={{fontWeight: 400, color: "var(--fg-muted)"}}>(optional)</span></label>
          <input
            id="title" className="input"
            placeholder={subject ? `SWOT: ${subject}` : "Auto-generated from subject"}
            value={title}
            onChange={e => setTitle(e.target.value)}
            aria-describedby="title-hint"
          />
        </div>

        {/* AI status line — announces changes to screen readers */}
        <AiStatusLine aiState={aiState} />

        <div style={{display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-2)"}}>
          <button
            className="button btn-primary"
            disabled={!canStart}
            onClick={() => onStart({ subject: subject.trim(), scope, title: computedTitle })}
          >
            Start the interview →
          </button>
        </div>
      </div>
    </main>
  );
}

window.SwotIntro = SwotIntro;
window.SCOPE_OPTIONS = SCOPE_OPTIONS;
