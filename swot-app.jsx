/* swot-app.jsx — top-level controller, AI badge, download consent flow. */
/* exported Logo, Stepper, ThemeToggle, DownloadConsentModal, WebLLMProgressBar, AIBadge, AIUnavailableNudge, AppTweaksPanel, SwotApp */

const { useState: useS_A, useEffect: useE_A, useRef: useR_A } = React;

// ── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="logo" aria-label="SWOT Builder">
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="6"  y="6"  width="24" height="24" rx="3" fill="#FFFFFF"/>
        <rect x="34" y="6"  width="24" height="24" rx="3" fill="#FF7C00"/>
        <rect x="6"  y="34" width="24" height="24" rx="3" fill="#FF7C00"/>
        <rect x="34" y="34" width="24" height="24" rx="3" fill="#FFFFFF"/>
      </svg>
    </div>
  );
}

// ── Stepper ──────────────────────────────────────────────────────────────────
function Stepper({ step }) {
  const dots = ["intro", "interview", "board"];
  const idx = dots.indexOf(step);
  return (
    <div className="stepper">
      <span>Step {Math.max(idx, 0) + 1} of 3</span>
      {dots.map((d, i) => (
        <span key={d} aria-hidden="true" className={"dot" + (i === idx ? " active" : i < idx ? " done" : "")} />
      ))}
    </div>
  );
}

// ── Theme toggle ─────────────────────────────────────────────────────────────
function ThemeToggle() {
  const [theme, setTheme] = useS_A(document.documentElement.dataset.theme || "light");
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("td-theme", next); } catch(_e) {}
    setTheme(next);
  }
  return (
    <button className="button btn-ghost btn-icon" onClick={toggle} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      {theme === "dark" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>
        </svg>
      )}
    </button>
  );
}

// ── Download consent modal ───────────────────────────────────────────────────
// Shown before every WebLLM model download — explicit consent is always required.
function DownloadConsentModal({ model, onConfirm, onCancel }) {
  const sizeLabel = model.sizeMB >= 1000
    ? `${(model.sizeMB / 1000).toFixed(1)} GB`
    : `${model.sizeMB} MB`;

  const modalRef = useR_A(null);
  const headingId = "download-consent-heading";

  // Move focus to first focusable element on mount
  useE_A(() => {
    const el = modalRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();
  }, []);

  // Focus trap and Escape key
  function handleKeyDown(e) {
    if (e.key === "Escape") { onCancel(); return; }
    if (e.key !== "Tab") return;
    const el = modalRef.current;
    if (!el) return;
    const focusable = Array.from(el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(n => !n.disabled);
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }

  function handleBackdropKey(e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onCancel(); }
  }

  return (
    <div
      className="modal-back"
      role="button"
      tabIndex={0}
      aria-label="Close dialog"
      onClick={onCancel}
      onKeyDown={handleBackdropKey}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h3 id={headingId}>Download AI model?</h3>
        <p style={{ margin: 0, color: "var(--fg-muted)", lineHeight: 1.5 }}>
          <strong style={{ color: "var(--fg)" }}>{model.label}</strong> will download ~{sizeLabel}{" "}
          and run fully on your device. No data leaves your machine, and the model
          is cached in your browser — one download only.
        </p>

        {/* Quality indicator */}
        <div style={{
          display: "flex",
          gap: "var(--space-3)",
          padding: "var(--space-3) var(--space-4)",
          background: "var(--neutral-bg)",
          borderRadius: 10,
          fontSize: "var(--text-sm)",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Quality</div>
            <div style={{ color: "var(--fg-muted)" }}>{model.quality}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Size</div>
            <div style={{ color: "var(--fg-muted)" }}>~{sizeLabel}</div>
          </div>
          <div style={{ flex: 2 }}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>What it does</div>
            <div style={{ color: "var(--fg-muted)" }}>{model.note}</div>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--fg-muted)" }}>
          Requires a browser with WebGPU support (Chrome or Edge 113+).
          Download speed depends on your connection.
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
          <button className="button btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="button btn-primary" onClick={onConfirm}>
            Download &amp; use →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── WebLLM progress bar ──────────────────────────────────────────────────────
// Fixed bar along the bottom of the viewport while a model is downloading.
function WebLLMProgressBar({ progress, progressText }) {
  const pct = Math.round(progress * 100);
  const phaseLabel = progressText || (progress > 0 ? 'Downloading…' : 'Preparing…');
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "var(--bg-card)",
      borderTop: "1px solid var(--border)",
      padding: "var(--space-3) var(--space-6)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      zIndex: 80,
    }} role="status" aria-live="polite" aria-label={`AI model: ${phaseLabel}, ${pct}% complete`}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
          {phaseLabel}
        </span>
        <div style={{
          flex: 1,
          height: 6,
          background: "var(--neutral-bg)",
          borderRadius: 999,
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: pct + "%",
            background: "var(--accent)",
            borderRadius: 999,
            transition: "width 400ms ease",
          }} />
        </div>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          color: "var(--fg-muted)",
          whiteSpace: "nowrap",
          flexShrink: 0,
          minWidth: 36,
          textAlign: "right",
        }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

// ── AI Status Badge ──────────────────────────────────────────────────────────
// Shows the active AI backend. When unavailable + WebGPU present, opens a
// model picker dropdown so the user can choose to download one.
function AIBadge({ aiState, onRequestModel }) {
  const [open, setOpen] = useS_A(false);
  const ref = useR_A(null);
  const triggerRef = useR_A(null);
  const menuRef = useR_A(null);

  // Close dropdown on outside click
  useE_A(() => {
    if (!open) return;
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Focus first menu item when dropdown opens
  useE_A(() => {
    if (!open || !menuRef.current) return;
    const first = menuRef.current.querySelector('[role="menuitem"]');
    if (first) first.focus();
  }, [open]);

  // Arrow-key and Escape navigation within the menu
  function onMenuKeyDown(e) {
    if (!menuRef.current) return;
    const items = Array.from(menuRef.current.querySelectorAll('[role="menuitem"]'));
    const idx = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  const { type, status } = aiState;
  const canPick = status === 'unavailable' && window.LocalAI.hasWebGPU();

  let label, dotColor, chipStyle = {};

  if (status === 'starting') {
    label = "Detecting AI…";
    dotColor = "var(--border)";
  } else if (status === 'loading') {
    const pct = aiState.progress > 0 ? ` ${Math.round(aiState.progress * 100)}%` : "…";
    label = type === 'window-ai' ? "Downloading…" : `Loading${pct}`;
    dotColor = "#FF7C00";
  } else if (status === 'ready') {
    label = type === 'window-ai' ? "AI on — Built-in"
          : type === 'webllm'   ? "AI on — Browser"
          : "AI on";
    dotColor = "var(--pass)";
  } else {
    // unavailable
    label = canPick ? "Load AI model" : "Manual mode";
    dotColor = "var(--border)";
    if (canPick) chipStyle.cursor = "pointer";
  }

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button
        ref={triggerRef}
        onClick={() => canPick && setOpen(o => !o)}
        title={
          status === 'ready' && type === 'window-ai' ? "Chrome's on-device AI (Gemini Nano)" :
          status === 'ready' && type === 'webllm'    ? "AI model running in your browser via WebGPU" :
          status === 'unavailable' && !canPick       ? "AI unavailable. You can still build a SWOT manually." :
          ""
        }
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: 999,
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          fontSize: "var(--text-xs)",
          fontFamily: "var(--font-mono)",
          fontWeight: 600,
          letterSpacing: "0.04em",
          color: status === 'ready' ? "var(--fg)" : "var(--fg-muted)",
          cursor: canPick ? "pointer" : "default",
          whiteSpace: "nowrap",
          userSelect: "none",
          ...chipStyle,
        }}
        aria-expanded={open}
        aria-haspopup={canPick ? "menu" : undefined}
        aria-describedby={status === 'ready' ? "ai-badge-desc" : undefined}
      >
        <span aria-hidden="true" style={{
          width: 9, height: 9, borderRadius: "50%",
          background: dotColor,
          flexShrink: 0,
          animation: status === 'loading' || status === 'starting'
            ? "pulse 1.2s infinite ease-in-out" : "none",
        }} />
        {label}{canPick && <span aria-hidden="true"> ▾</span>}
      </button>
      {/* Visually-hidden description for ready state (replaces title-only info) */}
      {status === 'ready' && (
        <span id="ai-badge-desc" style={{
          position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
          overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", borderWidth: 0,
        }}>
          {type === 'window-ai' ? "Chrome's on-device AI (Gemini Nano)" :
           type === 'webllm'    ? "AI model running in your browser via WebGPU" : ""}
        </span>
      )}

      {/* Model picker dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          right: 0,
          top: "calc(100% + 8px)",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "var(--space-4)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          minWidth: 300,
          zIndex: 60,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }} role="menu" aria-label="Choose AI model" ref={menuRef} onKeyDown={onMenuKeyDown}>
          <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--fg)" }}>
            Run AI in your browser
          </p>
          <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--fg-muted)", lineHeight: 1.5 }}>
            Models download once, then run offline — no API key or account needed.
            Requires Chrome or Edge 113+.
          </p>

          {window.WEBLLM_MODELS.map(m => {
            const sizeLabel = m.sizeMB >= 1000
              ? `${(m.sizeMB / 1000).toFixed(1)} GB`
              : `${m.sizeMB} MB`;
            return (
              <button
                key={m.id}
                role="menuitem"
                className="button btn-secondary btn-sm"
                style={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 2,
                  padding: "var(--space-3) var(--space-3)",
                  height: "auto",
                  textAlign: "left",
                  borderRadius: 10,
                }}
                onClick={() => { setOpen(false); onRequestModel(m); }}
              >
                <span style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <span style={{ fontWeight: 700 }}>{m.label}</span>
                  <span style={{ opacity: 0.65, fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {m.quality} · {sizeLabel}
                  </span>
                </span>
                <span style={{ fontWeight: 400, opacity: 0.7, fontSize: 12 }}>{m.note}</span>
              </button>
            );
          })}

          <button className="button btn-ghost btn-sm" role="menuitem"
            style={{ alignSelf: "flex-end", marginTop: 2 }}
            onClick={() => setOpen(false)}>
            Continue without AI
          </button>
        </div>
      )}
    </div>
  );
}

// ── Interview AI nudge ───────────────────────────────────────────────────────
// Shown in the interview when AI is unavailable — non-blocking, easily dismissed.
function AIUnavailableNudge({ hasWebGPU, onLoadModel }) {
  const [dismissed, setDismissed] = useS_A(false);
  if (dismissed) return null;
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      padding: "var(--space-3) var(--space-4)",
      background: "var(--neutral-bg)",
      borderBottom: "1px solid var(--border)",
      fontSize: "var(--text-sm)",
      flexWrap: "wrap",
    }}>
      <span style={{ flex: 1, color: "var(--fg-muted)" }}>
        <strong style={{ color: "var(--fg)" }}>Manual mode</strong> — AI not loaded.
        Questions are pre-generated; you choose which quadrant each answer belongs in.
      </span>
      {hasWebGPU && (
        <button className="button btn-secondary btn-sm" onClick={onLoadModel}>
          Load AI model →
        </button>
      )}
      <button className="button btn-ghost btn-sm" onClick={() => setDismissed(true)}
        aria-label="Dismiss">Dismiss</button>
    </div>
  );
}

// ── Tweaks panel ─────────────────────────────────────────────────────────────
const DEFAULT_TWEAKS = /*EDITMODE-BEGIN*/{
  "board_style": "classic",
  "coach_tone": "friendly",
  "show_source_questions": false
}/*EDITMODE-END*/;

function AppTweaksPanel({ boardStyle, onBoardStyle }) {
  // eslint-disable-next-line no-unused-vars -- used as JSX tags below
  const { TweaksPanel, useTweaks, TweakSection, TweakRadio } = window;
  const [t, setTweak] = useTweaks(DEFAULT_TWEAKS);

  useE_A(() => {
    if (t.board_style !== boardStyle) setTweak("board_style", boardStyle);
  }, [boardStyle]);

  function setStyle(v) { setTweak("board_style", v); onBoardStyle(v); }

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Board look">
        <TweakRadio
          label="Visual variation"
          value={t.board_style}
          onChange={setStyle}
          options={[
            { value: "classic", label: "Classic" },
            { value: "exec",    label: "Executive" },
            { value: "bold",    label: "Bold" },
            { value: "pills",   label: "Pills" },
          ]}
        />
      </TweakSection>
      <TweakSection label="Coach voice">
        <TweakRadio
          label="Tone"
          value={t.coach_tone}
          onChange={(v) => setTweak("coach_tone", v)}
          options={[
            { value: "friendly", label: "Friendly" },
            { value: "concise",  label: "Concise" },
            { value: "playful",  label: "Playful" },
          ]}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

// ── Root App ─────────────────────────────────────────────────────────────────
function SwotApp() {
  const persisted = window.loadState();
  const [step,       setStep]      = useS_A(persisted?.step       || "intro");
  const [session,    setSession]   = useS_A(persisted?.session    || null);
  const [swot,       setSwot]      = useS_A(persisted?.swot       || window.newEmptySwot());
  const [boardStyle, setBoardStyle]= useS_A(persisted?.boardStyle || "classic");
  const [toast,      setToast]     = useS_A(null);
  const [aiState,    setAiState]   = useS_A(window.LocalAI.getStatus());
  const [consentModel, setConsentModel] = useS_A(null); // model pending user consent
  const [coachTone, setCoachTone] = useS_A(DEFAULT_TWEAKS.coach_tone);
  const toastTimer = useR_A(null);

  // Subscribe to AI status changes
  useE_A(() => { window.LocalAI.onStatus(s => setAiState({ ...s })); }, []);

  // Keep coachTone in sync with the tweaks panel
  useE_A(() => {
    function onTweakChange(e) {
      if (e.detail?.coach_tone) setCoachTone(e.detail.coach_tone);
    }
    window.addEventListener('tweakchange', onTweakChange);
    return () => window.removeEventListener('tweakchange', onTweakChange);
  }, []);

  // Persist state
  useE_A(() => { window.saveState({ step, session, swot, boardStyle }); }, [step, session, swot, boardStyle]);

  function showToast(msg) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  // ── Model loading with size-based consent ──────────────────────────────
  async function startModelDownload(model) {
    try {
      await window.LocalAI.loadWebLLM(model.id);
      showToast("AI model ready — reload interview for AI questions!");
    } catch(_e) {
      showToast("Download failed. WebGPU may not be supported in this browser.");
    }
  }

  function handleRequestModel(model) {
    setConsentModel(model); // always require explicit consent before any model download
  }

  function handleConsentConfirm() {
    const model = consentModel;
    setConsentModel(null);
    startModelDownload(model);
  }

  // ── SWOT data handlers ─────────────────────────────────────────────────
  function handleStart({ subject, scope, title }) {
    setSession({ subject, scope, title, lastQuestion: "", history: [] });
    setSwot(window.newEmptySwot());
    setStep("interview");
  }
  function handleBackToIntro()   { setStep("intro"); }
  function handleAddItem(item)   { setSwot(prev => ({ ...prev, [item.bucket]: [...prev[item.bucket], item] })); }
  function handleUpdateItem(updated) {
    setSwot(prev => {
      const next = window.newEmptySwot();
      for (const k of ["S","W","O","T"]) next[k] = prev[k].filter(it => it.id !== updated.id);
      next[updated.bucket] = [...next[updated.bucket], updated];
      return next;
    });
  }
  function handleDeleteItem(id) {
    setSwot(prev => {
      const next = window.newEmptySwot();
      for (const k of ["S","W","O","T"]) next[k] = prev[k].filter(it => it.id !== id);
      return next;
    });
  }
  function handleFinish()          { setStep("board"); }
  function handleRestart()         { setSession(null); setSwot(window.newEmptySwot()); setStep("intro"); window.clearState(); }
  function handleBackToInterview() { setStep("interview"); }

  const totalCount = window.BUCKETS.reduce((n, b) => n + (swot[b.key]?.length || 0), 0);
  const isDownloading = aiState.status === 'loading';
  const aiUnavailable = aiState.status === 'unavailable';

  return (
    <div className="app-shell">
      <header className="app-header">
        <Logo />
        <div className="header-text">
          <h1>SWOT Builder</h1>
          <p className="subline">Guided · AI-assisted · {totalCount} item{totalCount === 1 ? "" : "s"} captured</p>
        </div>
        <div className="header-actions">
          <Stepper step={step} />
          <AIBadge aiState={aiState} onRequestModel={handleRequestModel} />
          <ThemeToggle />
        </div>
      </header>

      {/* AI unavailable nudge — shown above interview only */}
      {step === "interview" && aiUnavailable && (
        <AIUnavailableNudge
          hasWebGPU={window.LocalAI.hasWebGPU()}
          onLoadModel={() => document.querySelector('[aria-haspopup="menu"]')?.click()}
        />
      )}

      {step === "intro" && <SwotIntro onStart={handleStart} aiState={aiState} />}

      {step === "interview" && session && (
        <SwotInterview
          session={session}
          swot={swot}
          coachTone={coachTone}
          onAddItem={handleAddItem}
          onFinish={handleFinish}
          onBack={handleBackToIntro}
        />
      )}

      {step === "board" && session && (
        <SwotBoard
          session={session}
          swot={swot}
          styleId={boardStyle}
          onStyleChange={setBoardStyle}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onAddItem={handleAddItem}
          onRestart={handleRestart}
          onBack={handleBackToInterview}
          showToast={showToast}
        />
      )}

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={toast ? "toast" : "toast toast-hidden"}
      >{toast || ""}</div>

      {/* Download progress bar — fixed to viewport bottom */}
      {isDownloading && <WebLLMProgressBar progress={aiState.progress} progressText={aiState.progressText} />}

      {/* Download consent modal for large models */}
      {consentModel && (
        <DownloadConsentModal
          model={consentModel}
          onConfirm={handleConsentConfirm}
          onCancel={() => setConsentModel(null)}
        />
      )}

      <AppTweaksPanel boardStyle={boardStyle} onBoardStyle={setBoardStyle} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<SwotApp />);
