/* swot-board.jsx — finished SWOT board with edit/export.
 * Exports <SwotBoard> to window. */

const { useState: useS_B, useEffect: useE_B, useRef: useR_B } = React;

const BOARD_STYLES = [
  { id: "classic", label: "Classic",   sub: "Coloured 2×2 quadrants" },
  { id: "exec",    label: "Executive", sub: "Navy headers, clean cells" },
  { id: "bold",    label: "Bold",      sub: "Editorial type, left bars" },
  { id: "pills",   label: "Pills",     sub: "Compact chip layout" },
];

function ConfDots({ level }) {
  const map = { low: 1, med: 2, high: 3 };
  const n = map[level] || 0;
  return (
    <span className="conf-dots" aria-label={`confidence ${level}`}>
      {[0,1,2].map(i => <span key={i} className={"cd" + (i < n ? " on" : "")} />)}
      <span className="conf-dots-label">{level || ""}</span>
    </span>
  );
}

function ItemEditorModal({ item, onClose, onSave, onDelete }) {
  const [title, setTitle] = useS_B(item.title);
  const [description, setDescription] = useS_B(item.description || "");
  const [bucket, setBucket] = useS_B(item.bucket);
  const [tags, setTags] = useS_B(item.tags || []);
  const [conf, setConf] = useS_B(item.confidence || "med");
  const [tagDraft, setTagDraft] = useS_B("");

  const modalRef = useR_B(null);
  const headingId = "item-editor-heading";

  function addTag() {
    const v = tagDraft.trim().replace(/,$/, "");
    if (v && !tags.includes(v)) setTags([...tags, v].slice(0, 6));
    setTagDraft("");
  }

  // Move focus to first focusable element on mount
  useE_B(() => {
    const el = modalRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();
  }, []);

  // Focus trap and Escape key
  function handleKeyDown(e) {
    if (e.key === "Escape") { onClose(); return; }
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
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClose(); }
  }

  return (
    <div
      className="modal-back"
      role="button"
      tabIndex={0}
      aria-label="Close dialog"
      onClick={onClose}
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
        <h3 id={headingId}>Edit item</h3>

        <div className="field">
          <label className="field-label">Quadrant</label>
          <div className="bucket-pick">
            {window.BUCKETS.map(b => (
              <button key={b.key} type="button"
                className={"b-" + b.key.toLowerCase() + (bucket === b.key ? " selected" : "")}
                onClick={() => setBucket(b.key)}>
                <span className="dotmark"></span>
                <span>{b.short}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Title</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div className="field">
          <label className="field-label">Description</label>
          <textarea className="textarea" rows={3} value={description}
            onChange={e => setDescription(e.target.value)} />
        </div>

        <div className="field">
          <label className="field-label">Tags</label>
          <div className="tag-row">
            {tags.map((t, i) => (
              <span key={i} className="tag-pill">
                {t}
                <button type="button" className="x" aria-label={`Remove tag ${t}`} onClick={() => setTags(tags.filter((_, j) => j !== i))}>×</button>
              </span>
            ))}
            <input
              className="tag-input" placeholder="+ tag"
              value={tagDraft}
              onChange={e => setTagDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
              }}
              onBlur={addTag}
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label">Confidence</label>
          <div className="confidence-row">
            {[{id:"low",label:"Low"},{id:"med",label:"Medium"},{id:"high",label:"High"}].map(l => (
              <button key={l.id} type="button"
                className={"conf-pill" + (conf === l.id ? " active" : "")}
                onClick={() => setConf(l.id)}>{l.label}</button>
            ))}
          </div>
        </div>

        {item.sourceQ ? (
          <div style={{fontSize: "var(--text-xs)", color: "var(--fg-muted)", fontStyle: "italic"}}>
            From question: &ldquo;{item.sourceQ}&rdquo;
          </div>
        ) : null}

        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-2)"}}>
          <button className="button btn-ghost btn-sm" style={{color: "var(--fail)"}} onClick={() => { onDelete(item.id); onClose(); }}>
            Delete
          </button>
          <div style={{display: "flex", gap: "var(--space-2)"}}>
            <button className="button btn-ghost" onClick={onClose}>Cancel</button>
            <button className="button btn-primary"
              onClick={() => onSave({ ...item, title: title.trim() || "Untitled", description: description.trim(), bucket, tags, confidence: conf })}>
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddItemModal({ defaultBucket, onClose, onAdd }) {
  return ItemEditorModal({
    item: { id: window.uid(), bucket: defaultBucket, title: "", description: "", tags: [], confidence: "med" },
    onClose,
    onSave: (it) => { onAdd(it); onClose(); },
    onDelete: () => onClose(),
  });
}

function QuadrantCell({ bucket, items, styleId, onEdit, onAdd }) {
  return (
    <div className={`quadrant ${bucket.key.toLowerCase()}`}>
      <div className="quadrant-head">
        <div className="qletter">{bucket.key}</div>
        <div style={{display: "flex", flexDirection: "column", minWidth: 0}}>
          <span className="qname">{bucket.name}</span>
          <span className="qmeta">{bucket.meta}</span>
        </div>
        <span className="qcount">{items.length}</span>
      </div>

      <ul className="quadrant-list">
        {items.length === 0 ? (
          <li className="empty-list">No {bucket.name.toLowerCase()} captured yet.</li>
        ) : items.map(it => (
          <li key={it.id} className="item-card fade-in">
            <div className="item-actions">
              <button className="iconbtn" title="Edit" onClick={() => onEdit(it)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                </svg>
              </button>
            </div>
            <div className="item-title">{it.title}</div>
            {it.description && styleId !== "pills" ? <div className="item-desc">{it.description}</div> : null}
            {styleId !== "pills" ? (
              <div className="item-foot">
                {it.tags && it.tags.map((t,i) => <span key={i} className="item-tag">#{t}</span>)}
                {it.confidence ? <ConfDots level={it.confidence} /> : null}
              </div>
            ) : null}
          </li>
        ))}
        {/* Add slot — hidden in print */}
        <li style={{listStyle: "none"}}>
          <button className="button btn-ghost btn-sm"
            style={{width: "100%", justifyContent: "flex-start", color: "var(--fg-muted)", borderStyle: "dashed", borderWidth: "1.5px", borderColor: "var(--border)"}}
            onClick={() => onAdd(bucket.key)}>
            + Add a {bucket.short.toLowerCase()}
          </button>
        </li>
      </ul>
    </div>
  );
}

function StylePicker({ value, onChange }) {
  return (
    <div style={{display: "inline-flex", gap: 0, background: "var(--neutral-bg)", padding: 4, borderRadius: 10, border: "1px solid var(--border)"}}>
      {BOARD_STYLES.map(s => (
        <button key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          title={s.sub}
          style={{
            appearance: "none",
            border: "none",
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            background: value === s.id ? "var(--bg-card)" : "transparent",
            color: value === s.id ? "var(--fg)" : "var(--fg-muted)",
            boxShadow: value === s.id ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
          }}>
          {s.label}
        </button>
      ))}
    </div>
  );
}

function SwotBoard({ session, swot, onUpdateItem, onDeleteItem, onAddItem, onRestart, onBack, styleId, onStyleChange, showToast }) {
  const [editing, setEditing] = useS_B(null);
  const [adding, setAdding] = useS_B(null); // bucket key
  const paperRef = useR_B(null);

  const totalCount = window.BUCKETS.reduce((n, b) => n + swot[b.key].length, 0);

  function exportMarkdown() {
    const md = window.toMarkdown({ subject: session.subject, title: session.title, swot });
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (session.title || "SWOT") + ".md";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    showToast("Markdown downloaded");
  }

  async function copyAsImage() {
    if (!window.html2canvas) {
      showToast("Image library loading… try again in a sec");
      return;
    }
    try {
      showToast("Rendering image…");
      const canvas = await window.html2canvas(paperRef.current, {
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--bg-card') || "#ffffff",
        scale: 2,
        useCORS: true,
      });
      canvas.toBlob(async blob => {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          showToast("Image copied to clipboard");
        } catch (e) {
          // Fallback: download
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = (session.title || "SWOT") + ".png";
          document.body.appendChild(a); a.click(); a.remove();
          showToast("Image downloaded (clipboard not available)");
        }
      }, "image/png");
    } catch (e) {
      console.error(e);
      showToast("Image export failed");
    }
  }

  function printPdf() {
    window.print();
  }

  return (
    <main className="board-page">
      <div className="board-titlebar">
        <div className="title-block">
          <h2>{session.title || "SWOT Analysis"}</h2>
          <span className="subject-line">Subject · {session.subject}</span>
        </div>
        <div className="actions">
          <StylePicker value={styleId} onChange={onStyleChange} />
          <button className="button btn-secondary btn-sm" onClick={copyAsImage}>Copy image</button>
          <button className="button btn-secondary btn-sm" onClick={exportMarkdown}>Markdown</button>
          <button className="button btn-secondary btn-sm" onClick={printPdf}>Save as PDF</button>
          <button className="button btn-ghost btn-sm" onClick={onBack}>+ Add more via interview</button>
          <button className="button btn-ghost btn-sm" style={{color: "var(--fail)"}} onClick={() => {
            if (confirm("Clear this SWOT and start over?")) onRestart();
          }}>Restart</button>
        </div>
      </div>

      <div className="swot-paper" ref={paperRef}>
        <div className={`swot-grid style-${styleId}`}>
          {window.BUCKETS.map(b => (
            <QuadrantCell
              key={b.key}
              bucket={b}
              items={swot[b.key]}
              styleId={styleId}
              onEdit={(it) => setEditing(it)}
              onAdd={(key) => setAdding(key)}
            />
          ))}
        </div>
        <div className="swot-watermark">Built with SWOT Builder · {totalCount} item{totalCount===1?"":"s"}</div>
      </div>

      {editing ? (
        <ItemEditorModal
          item={editing}
          onClose={() => setEditing(null)}
          onSave={(item) => { onUpdateItem(item); setEditing(null); showToast("Updated"); }}
          onDelete={(id) => { onDeleteItem(id); showToast("Deleted"); }}
        />
      ) : null}

      {adding ? (
        <AddItemModal
          defaultBucket={adding}
          onClose={() => setAdding(null)}
          onAdd={(item) => { onAddItem(item); showToast("Added"); }}
        />
      ) : null}
    </main>
  );
}

window.SwotBoard = SwotBoard;
window.BOARD_STYLES = BOARD_STYLES;
