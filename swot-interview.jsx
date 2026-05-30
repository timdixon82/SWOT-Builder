/* swot-interview.jsx — interview view with sidebar tally.
 * Exports <SwotInterview> to window. */
/* exported SparkleIcon, EditIcon, ConfidencePicker, TagEditor, BucketPicker, TallySidebar, SwotInterview */

const { useState: useS_I, useEffect: useE_I, useRef: useR_I } = React;

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    </svg>
  );
}

function ConfidencePicker({ value, onChange }) {
  const levels = [
    { id: "low",    label: "Low" },
    { id: "med",    label: "Medium" },
    { id: "high",   label: "High" },
  ];
  return (
    <div className="confidence-row" role="group" aria-labelledby="confidence-label">
      <span id="confidence-label" className="label">Confidence</span>
      {levels.map(l => (
        <button key={l.id}
          type="button"
          className={"conf-pill" + (value === l.id ? " active" : "")}
          onClick={() => onChange(l.id)}>{l.label}</button>
      ))}
    </div>
  );
}

function TagEditor({ tags, onChange }) {
  const [draft, setDraft] = useS_I("");
  const addTag = () => {
    const v = draft.trim().replace(/,$/, "");
    if (!v) return;
    if (tags.includes(v)) { setDraft(""); return; }
    onChange([...tags, v].slice(0, 6));
    setDraft("");
  };
  return (
    <div className="tag-row">
      {tags.map((t, i) => (
        <span key={i} className="tag-pill">
          {t}
          <button type="button" className="x" aria-label={`Remove tag ${t}`} onClick={() => onChange(tags.filter((_, j) => j !== i))}>×</button>
        </span>
      ))}
      <input
        className="tag-input"
        aria-label="Add tag"
        placeholder="+ tag"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
          if (e.key === "Backspace" && !draft && tags.length) onChange(tags.slice(0, -1));
        }}
        onBlur={addTag}
      />
    </div>
  );
}

function BucketPicker({ value, suggested, onPick }) {
  return (
    <div className="bucket-pick">
      {window.BUCKETS.map(b => (
        <button
          key={b.key}
          type="button"
          aria-label={suggested === b.key ? `${b.short} (AI suggestion)` : b.short}
          className={
            "b-" + b.key.toLowerCase() +
            (value === b.key ? " selected" : "") +
            (suggested === b.key && value === b.key ? " suggested" : "")
          }
          onClick={() => onPick(b.key)}
        >
          <span className="dotmark" aria-hidden="true"></span>
          <span>{b.short}</span>
        </button>
      ))}
    </div>
  );
}

function TallySidebar({ swot, onJumpToBoard }) {
  const total = window.BUCKETS.reduce((n, b) => n + (swot[b.key]?.length || 0), 0);
  return (
    <aside className="tally">
      <h3>So far · {total} item{total === 1 ? "" : "s"}</h3>
      {window.BUCKETS.map(b => {
        const items = swot[b.key] || [];
        return (
          <div className={`tally-cell ${b.key.toLowerCase()}`} key={b.key}>
            <div className="tally-head">
              <span className="name">{b.name}</span>
              <span className="count">{items.length}</span>
            </div>
            {items.length === 0
              ? <span style={{fontSize: 12, color: "var(--fg-muted)", fontStyle: "italic"}}>Nothing yet.</span>
              : <ul className="tally-list">
                  {items.slice(-4).map(it => (
                    <li key={it.id} title={it.title}>{it.title}</li>
                  ))}
                  {items.length > 4 ? <li>+ {items.length - 4} more</li> : null}
                </ul>
            }
          </div>
        );
      })}
      <button className="button btn-secondary" onClick={onJumpToBoard} disabled={total === 0}
        style={{marginTop: "var(--space-2)"}}>
        Build the board ({total}) →
      </button>
    </aside>
  );
}

function SwotInterview({ session, swot, coachTone = "friendly", onAddItem, onFinish, onBack }) {
  // Interview state
  const [question, setQuestion] = useS_I(session.lastQuestion || "");
  const [loadingQ, setLoadingQ] = useS_I(!session.lastQuestion);
  const [answer, setAnswer] = useS_I("");
  const [analysing, setAnalysing] = useS_I(false);
  const [suggestion, setSuggestion] = useS_I(null);   // {bucket, title, description, tags, sourceQ, sourceA}
  const [coachNote, setCoachNote] = useS_I("");
  const [history, setHistory] = useS_I(session.history || []);  // [{q, a}]
  const [editedTitle, setEditedTitle] = useS_I("");
  const [editedDesc, setEditedDesc] = useS_I("");
  // "__MANUAL__" means AI was unavailable — sentinel that forces user to pick a real bucket
  const [editedBucket, setEditedBucket] = useS_I(null);
  const [editedTags, setEditedTags] = useS_I([]);
  const [confidence, setConfidence] = useS_I("med");
  const answerRef = useR_I(null);

  // Kick off opening question
  useE_I(() => {
    if (!question) {
      setLoadingQ(true);
      window.aiOpeningQuestion({ subject: session.subject, scope: session.scope, coachTone })
        .then(q => { setQuestion(q); setLoadingQ(false); setTimeout(() => answerRef.current?.focus(), 50); });
    } else {
      setTimeout(() => answerRef.current?.focus(), 50);
    }
  }, []);

  function submitAnswer() {
    if (!answer.trim() || analysing) return;
    const trimmed = answer.trim();
    setAnalysing(true);
    const counts = { S: swot.S.length, W: swot.W.length, O: swot.O.length, T: swot.T.length };
    window.aiProcessAnswer({
      subject: session.subject,
      scope: session.scope,
      coachTone,
      history,
      questionAsked: question,
      answerGiven: trimmed,
      existingCounts: counts,
    }).then(res => {
      setAnalysing(false);
      const newHistory = [...history, { q: question, a: trimmed }];
      setHistory(newHistory);
      setCoachNote(res.coach_note || "");
      if (res.item) {
        setSuggestion({ ...res.item, sourceQ: question, sourceA: trimmed, nextQuestion: res.next_question });
        setEditedTitle(res.item.title);
        setEditedDesc(res.item.description);
        // Translate __MANUAL__ sentinel → null so bucket picker starts unselected
        setEditedBucket(res.item.bucket === "__MANUAL__" ? null : res.item.bucket);
        setEditedTags(res.item.tags || []);
        setConfidence("med");
      } else {
        // No item — just advance to next question
        setSuggestion(null);
        setQuestion(res.next_question);
        setAnswer("");
        setTimeout(() => answerRef.current?.focus(), 50);
      }
    });
  }

  function commitSuggestion() {
    if (!suggestion || !editedBucket) return;
    const item = {
      id: window.uid(),
      bucket: editedBucket,
      title: editedTitle.trim() || "Untitled",
      description: editedDesc.trim(),
      tags: editedTags,
      confidence,
      sourceQ: suggestion.sourceQ,
      sourceA: suggestion.sourceA,
      createdAt: Date.now(),
    };
    onAddItem(item);
    // Move on
    const nextQ = suggestion.nextQuestion;
    setSuggestion(null);
    setAnswer("");
    setEditedTitle(""); setEditedDesc(""); setEditedBucket(null); setEditedTags([]);
    setQuestion(nextQ);
    setTimeout(() => answerRef.current?.focus(), 60);
  }

  function discardSuggestion() {
    const nextQ = suggestion?.nextQuestion;
    setSuggestion(null);
    setAnswer("");
    setEditedTitle(""); setEditedDesc(""); setEditedBucket(null); setEditedTags([]);
    if (nextQ) setQuestion(nextQ);
    setTimeout(() => answerRef.current?.focus(), 60);
  }

  function skipQuestion() {
    if (analysing) return;
    const newHistory = [...history, { q: question, a: "" }];
    setHistory(newHistory);
    setAnalysing(true);
    window.aiProcessAnswer({
      subject: session.subject,
      scope: session.scope,
      coachTone,
      history: newHistory,
      questionAsked: question,
      answerGiven: "(user skipped — please ask a different question, ideally a different quadrant)",
      existingCounts: { S: swot.S.length, W: swot.W.length, O: swot.O.length, T: swot.T.length },
    }).then(res => {
      setAnalysing(false);
      setQuestion(res.next_question);
      setAnswer("");
      setTimeout(() => answerRef.current?.focus(), 50);
    });
  }

  const totalCount = window.BUCKETS.reduce((n, b) => n + (swot[b.key]?.length || 0), 0);

  return (
    <main id="main-content" className="interview">
      <div className="interview-main">

        {/* Question card */}
        <section className="coach-card fade-in" key={question}>
          <div className="coach-meta">
            <span>Question {history.length + 1}</span>
            <span>{session.subject}</span>
          </div>
          {loadingQ ? (
            <p className="question-skeleton" role="status" aria-live="polite">
              Thinking up a good opener
              <span className="dot-pulse" aria-hidden="true"><span></span><span></span><span></span></span>
            </p>
          ) : (
            <h2 className="question">{question}</h2>
          )}

          {coachNote && !suggestion ? (
            <p style={{margin: 0, color: "var(--fg-muted)", fontSize: "var(--text-sm)", fontStyle: "italic"}}>
              {coachNote}
            </p>
          ) : null}

          {!suggestion ? (
            <div className="answer-form">
              <textarea
                ref={answerRef}
                className="textarea"
                aria-label="Your answer"
                placeholder={loadingQ ? "I'll be ready in a second…" : "Type your answer — a sentence is plenty."}
                value={answer}
                disabled={loadingQ || analysing}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    submitAnswer();
                  }
                }}
                rows={3}
              />
              <div style={{display: "flex", gap: "var(--space-2)", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap"}}>
                <small style={{color: "var(--fg-muted)"}}>
                  Cmd/Ctrl + Enter to submit
                </small>
                <div style={{display: "flex", gap: "var(--space-2)"}}>
                  <button className="button btn-ghost btn-sm" onClick={skipQuestion} disabled={loadingQ || analysing}>
                    Skip
                  </button>
                  <button className="button btn-primary" onClick={submitAnswer}
                    disabled={!answer.trim() || loadingQ || analysing}>
                    {analysing ? (
                      <>Analysing <span className="dot-pulse" aria-hidden="true"><span></span><span></span><span></span></span></>
                    ) : "Submit answer"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="suggestion fade-in">
              <div className="suggestion-head">
                <SparkleIcon />
                <span>AI suggestion · review &amp; tweak before saving</span>
              </div>

              <div className="suggestion-body">
                <BucketPicker
                  value={editedBucket}
                  suggested={suggestion.bucket === "__MANUAL__" ? null : suggestion.bucket}
                  onPick={setEditedBucket}
                />

                <div className="title-edit-row">
                  <input
                    className="input"
                    aria-label="Item title"
                    value={editedTitle}
                    onChange={e => setEditedTitle(e.target.value)}
                    placeholder="Item title"
                  />
                </div>

                <textarea
                  className="textarea"
                  aria-label="Item description"
                  value={editedDesc}
                  onChange={e => setEditedDesc(e.target.value)}
                  placeholder="One or two sentences expanding the point"
                  rows={2}
                  style={{minHeight: 60}}
                />

                <TagEditor tags={editedTags} onChange={setEditedTags} />
                <ConfidencePicker value={confidence} onChange={setConfidence} />

                <div style={{display: "flex", gap: "var(--space-2)", justifyContent: "flex-end"}}>
                  <button className="button btn-ghost btn-sm" onClick={discardSuggestion}>
                    Discard
                  </button>
                  <button className="button btn-primary" onClick={commitSuggestion} disabled={!editedBucket}>
                    Save to {editedBucket ? window.BUCKET_BY_KEY[editedBucket].name : "…"} →
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Bottom actions */}
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-2)"}}>
          <button className="button btn-ghost btn-sm" onClick={onBack}>
            ← Edit subject
          </button>
          <button className="button btn-secondary"
            onClick={onFinish}
            disabled={totalCount === 0}>
            Done · Build the board →
          </button>
        </div>
      </div>

      <TallySidebar swot={swot} onJumpToBoard={onFinish} />
    </main>
  );
}

window.SwotInterview = SwotInterview;
