import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function clampInt(n, min, max) {
  if (Number.isNaN(n)) return null;
  return Math.max(min, Math.min(max, n));
}

function useToast() {
  const [toast, setToast] = useState(null);
  const tRef = useRef(null);

  const show = (message) => {
    setToast(message);
    window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => () => window.clearTimeout(tRef.current), []);
  return { toast, show };
}

function complexityFor(op) {
  switch (op) {
    case "Insert at start":
    case "Delete start":
      return "O(1)";
    case "Insert at end":
    case "Delete end":
    case "Insert at position":
    case "Delete at position":
    case "Search":
      return "O(n)";
    case "Length":
      return "O(1) (tracked)";
    default:
      return "—";
  }
}

export default function App() {
  const idSeed = useRef(1);
  const [value, setValue] = useState("");
  const [position, setPosition] = useState("");

  const [past, setPast] = useState([]);
  const [nodes, setNodes] = useState(() => []);
  const [future, setFuture] = useState([]);

  const [highlightId, setHighlightId] = useState(null);
  const highlightTimer = useRef(null);
  const { toast, show: showToast } = useToast();

  const [logItems, setLogItems] = useState(() => []);
  const lastOp = logItems[0]?.op ?? "—";

  const length = nodes.length;

  const nodeById = useMemo(() => {
    const m = new Map();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  const valueInputRef = useRef(null);
  const stripRef = useRef(null);

  const commit = (nextNodes, { op, message, kind = "info" }) => {
    setPast((p) => {
      const nextPast = [...p, nodes];
      return nextPast.length > 60 ? nextPast.slice(nextPast.length - 60) : nextPast;
    });
    setFuture([]);
    setNodes(nextNodes);
    setLogItems((items) => [
      { id: crypto.randomUUID(), time: nowTime(), op, message, kind },
      ...items,
    ]);
  };

  const setHighlight = (id) => {
    setHighlightId(id);
    window.clearTimeout(highlightTimer.current);
    highlightTimer.current = window.setTimeout(() => setHighlightId(null), 1600);
  };

  useEffect(() => () => window.clearTimeout(highlightTimer.current), []);

  const parsePosition = () => {
    if (!position.trim()) return null;
    const raw = Number.parseInt(position, 10);
    return clampInt(raw, 0, Math.max(0, nodes.length));
  };

  const requireValue = () => {
    const v = value.trim();
    if (!v) {
      showToast("Enter a value first.");
      return null;
    }
    return v;
  };

  const insertStart = () => {
    const v = requireValue();
    if (v == null) return;
    const newNode = { id: `n${idSeed.current++}`, value: v };
    commit([newNode, ...nodes], { op: "Insert at start", message: `Inserted “${v}” at start.` });
    setValue("");
    setHighlight(newNode.id);
  };

  const insertEnd = () => {
    const v = requireValue();
    if (v == null) return;
    const newNode = { id: `n${idSeed.current++}`, value: v };
    commit([...nodes, newNode], { op: "Insert at end", message: `Inserted “${v}” at end.` });
    setValue("");
    setHighlight(newNode.id);
    requestAnimationFrame(() => {
      stripRef.current?.scrollTo({ left: stripRef.current.scrollWidth, behavior: "smooth" });
    });
  };

  const insertAtPosition = () => {
    const v = requireValue();
    if (v == null) return;
    const pos = parsePosition();
    if (pos == null) {
      showToast("Add a valid position (0 to length).");
      return;
    }
    const newNode = { id: `n${idSeed.current++}`, value: v };
    const next = nodes.slice();
    next.splice(pos, 0, newNode);
    commit(next, { op: "Insert at position", message: `Inserted “${v}” at position ${pos}.` });
    setValue("");
    setHighlight(newNode.id);
  };

  const deleteStart = () => {
    if (!nodes.length) {
      showToast("List is already empty.");
      return;
    }
    const removed = nodes[0];
    commit(nodes.slice(1), { op: "Delete start", message: `Deleted start (“${removed.value}”).` });
  };

  const deleteEnd = () => {
    if (!nodes.length) {
      showToast("List is already empty.");
      return;
    }
    const removed = nodes[nodes.length - 1];
    commit(nodes.slice(0, -1), { op: "Delete end", message: `Deleted end (“${removed.value}”).` });
  };

  const deleteAtPosition = () => {
    if (!nodes.length) {
      showToast("List is empty.");
      return;
    }
    const posRaw = Number.parseInt(position, 10);
    const pos = clampInt(posRaw, 0, nodes.length - 1);
    if (pos == null) {
      showToast(`Enter a position from 0 to ${nodes.length - 1}.`);
      return;
    }
    const removed = nodes[pos];
    const next = nodes.slice();
    next.splice(pos, 1);
    commit(next, { op: "Delete at position", message: `Deleted position ${pos} (“${removed.value}”).` });
  };

  const search = () => {
    const v = requireValue();
    if (v == null) return;
    const idx = nodes.findIndex((n) => n.value === v);
    if (idx === -1) {
      showToast(`“${v}” not found.`);
      setLogItems((items) => [
        { id: crypto.randomUUID(), time: nowTime(), op: "Search", message: `“${v}” not found.`, kind: "warn" },
        ...items,
      ]);
      return;
    }
    const found = nodes[idx];
    setHighlight(found.id);
    setLogItems((items) => [
      { id: crypto.randomUUID(), time: nowTime(), op: "Search", message: `Found “${v}” at position ${idx}.`, kind: "ok" },
      ...items,
    ]);
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-node-id="${found.id}"]`);
      el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  };

  const showLength = () => {
    showToast(`Length: ${nodes.length}`);
    setLogItems((items) => [
      { id: crypto.randomUUID(), time: nowTime(), op: "Length", message: `Length is ${nodes.length}.`, kind: "info" },
      ...items,
    ]);
  };

  const undo = () => {
    if (!past.length) return;
    const prev = past[past.length - 1];
    setPast(past.slice(0, -1));
    setFuture([nodes, ...future].slice(0, 60));
    setNodes(prev);
    setLogItems((items) => [
      { id: crypto.randomUUID(), time: nowTime(), op: "Undo", message: "Undid last change.", kind: "info" },
      ...items,
    ]);
  };

  const redo = () => {
    if (!future.length) return;
    const next = future[0];
    setFuture(future.slice(1));
    setPast([...past, nodes].slice(-60));
    setNodes(next);
    setLogItems((items) => [
      { id: crypto.randomUUID(), time: nowTime(), op: "Redo", message: "Redid change.", kind: "info" },
      ...items,
    ]);
  };

  const clearAll = () => {
    if (!nodes.length) return;
    commit([], { op: "Clear", message: "Cleared the list.", kind: "warn" });
  };

  const shortcutsRef = useRef({ undo: () => {}, redo: () => {}, insertEnd: () => {} });
  useEffect(() => {
    shortcutsRef.current = { undo, redo, insertEnd };
  });

  useEffect(() => {
    const onKeyDown = (e) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        shortcutsRef.current.undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "z" && e.shiftKey) {
        e.preventDefault();
        shortcutsRef.current.redo();
        return;
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        valueInputRef.current?.focus();
        return;
      }
      if (e.key === "Enter" && document.activeElement?.tagName === "INPUT") {
        e.preventDefault();
        shortcutsRef.current.insertEnd();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const opSummary = useMemo(() => {
    const title = lastOp;
    return {
      title,
      complexity: complexityFor(title),
    };
  }, [lastOp]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true" />
            <div className="brand-text">
              <div className="brand-title">LinkedScape</div>
              <div className="brand-subtitle">Interactive Linked List Laboratory</div>
            </div>
          </div>

          <div className="top-actions">
            <div className="chip">
              Length <strong>{length}</strong>
            </div>
            <div className="chip">
              Last <strong>{opSummary.title}</strong>
            </div>
            <div className="chip">
              Big‑O <strong>{opSummary.complexity}</strong>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <h1>
              Build, modify, and debug a singly linked list — with motion, clarity, and control.
            </h1>
            <p>
              Designed like a native app: glassy panels, clean typography, and subtle animations. Use
              the operations panel to mutate the list, watch the structure update in real time, and
              review your full history in the operation log.
            </p>
          </div>

          <div className="hero-card">
            <h3>Shortcuts</h3>
            <div className="kbd" role="list">
              <div className="kbd-row" role="listitem">
                <span>Focus value input</span>
                <code>/</code>
              </div>
              <div className="kbd-row" role="listitem">
                <span>Insert at end</span>
                <code>Enter</code>
              </div>
              <div className="kbd-row" role="listitem">
                <span>Undo</span>
                <code>⌘Z / Ctrl+Z</code>
              </div>
              <div className="kbd-row" role="listitem">
                <span>Redo</span>
                <code>⇧⌘Z / Ctrl+Shift+Z</code>
              </div>
            </div>
          </div>
        </section>

        <section className="grid">
          <div className="card">
            <div className="card-header">
              <h2>Operations</h2>
              <small>Validation + undo/redo</small>
            </div>
            <div className="card-body">
              <div className="field">
                <div className="label">Value</div>
                <input
                  ref={valueInputRef}
                  className="input"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. 42"
                  inputMode="text"
                />
              </div>

              <div className="field">
                <div className="label">Position (optional)</div>
                <input
                  className="input"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder={nodes.length ? `0 … ${Math.max(0, nodes.length)}` : "0 … 0"}
                  inputMode="numeric"
                />
              </div>

              <div className="btn-grid">
                <motion.button whileTap={{ scale: 0.99 }} className="btn primary" onClick={insertStart}>
                  Insert start
                </motion.button>
                <motion.button whileTap={{ scale: 0.99 }} className="btn primary" onClick={insertEnd}>
                  Insert end
                </motion.button>
                <motion.button whileTap={{ scale: 0.99 }} className="btn" onClick={insertAtPosition}>
                  Insert at pos
                </motion.button>
                <motion.button whileTap={{ scale: 0.99 }} className="btn danger" onClick={deleteStart}>
                  Delete start
                </motion.button>
                <motion.button whileTap={{ scale: 0.99 }} className="btn danger" onClick={deleteEnd}>
                  Delete end
                </motion.button>
                <motion.button whileTap={{ scale: 0.99 }} className="btn danger" onClick={deleteAtPosition}>
                  Delete at pos
                </motion.button>
                <motion.button whileTap={{ scale: 0.99 }} className="btn" onClick={search}>
                  Search
                </motion.button>
                <motion.button whileTap={{ scale: 0.99 }} className="btn" onClick={showLength}>
                  Length
                </motion.button>
              </div>

              <div className="btn-grid" style={{ marginTop: 12 }}>
                <motion.button
                  whileTap={{ scale: 0.99 }}
                  className="btn ghost"
                  onClick={undo}
                  disabled={!past.length}
                  style={{ opacity: past.length ? 1 : 0.5, cursor: past.length ? "pointer" : "not-allowed" }}
                >
                  Undo
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.99 }}
                  className="btn ghost"
                  onClick={redo}
                  disabled={!future.length}
                  style={{ opacity: future.length ? 1 : 0.5, cursor: future.length ? "pointer" : "not-allowed" }}
                >
                  Redo
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.99 }}
                  className="btn danger"
                  onClick={clearAll}
                  disabled={!nodes.length}
                  style={{
                    gridColumn: "1 / -1",
                    opacity: nodes.length ? 1 : 0.5,
                    cursor: nodes.length ? "pointer" : "not-allowed",
                  }}
                >
                  Clear list
                </motion.button>
              </div>

              <div className="hint">
                Tip: positions are 0‑indexed. Use <strong>/</strong> to focus value input.
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Visualization</h2>
              <small>HEAD → … → NULL</small>
            </div>
            <div className="card-body">
              <div className="viz-wrap">
                <div className="viz-strip">
                  <div ref={stripRef} className="viz-scroll" role="list" aria-label="Linked list nodes">
                    <span className="badge">HEAD</span>
                    {nodes.length === 0 ? (
                      <div className="empty">
                        Your list is empty. Insert a value to begin — you’ll see nodes animate into place.
                      </div>
                    ) : (
                      <AnimatePresence initial={false}>
                        {nodes.map((n, idx) => (
                          <React.Fragment key={n.id}>
                            <motion.div
                              layout
                              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                              transition={{ type: "spring", stiffness: 520, damping: 34 }}
                              className={`node ${highlightId === n.id ? "highlight" : ""}`}
                              data-node-id={n.id}
                              role="listitem"
                            >
                              <div className="cap">
                                <span className="pill">node</span>
                                <span className="pill">#{idx}</span>
                              </div>
                              <div className="value" title={n.value}>
                                {n.value}
                              </div>
                            </motion.div>
                            <span className="arrow" aria-hidden="true" />
                          </React.Fragment>
                        ))}
                        <motion.span
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="badge"
                        >
                          NULL
                        </motion.span>
                      </AnimatePresence>
                    )}
                  </div>
                </div>
                <div className="hint">
                  {nodes.length ? (
                    <>
                      Current head: <strong>{nodeById.get(nodes[0].id)?.value}</strong>
                    </>
                  ) : (
                    <>Current head: <strong>null</strong></>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Operation log</h2>
              <small>{logItems.length ? "Newest first" : "No actions yet"}</small>
            </div>
            <div className="card-body">
              {logItems.length ? (
                <div className="log">
                  {logItems.slice(0, 26).map((it) => (
                    <div key={it.id} className="log-item">
                      <div className="log-meta">
                        <span>
                          <strong style={{ color: "rgba(255,255,255,0.88)" }}>{it.op}</strong> ·{" "}
                          <span>{it.time}</span>
                        </span>
                        <span style={{ color: it.kind === "warn" ? "rgba(255,214,10,0.8)" : it.kind === "ok" ? "rgba(48,209,88,0.85)" : "rgba(255,255,255,0.45)" }}>
                          {it.kind}
                        </span>
                      </div>
                      <div className="log-msg">{it.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">Run an operation to start building a history.</div>
              )}

              <div className="btn-grid" style={{ marginTop: 12 }}>
                <motion.button
                  whileTap={{ scale: 0.99 }}
                  className="btn ghost"
                  onClick={() => setLogItems([])}
                  disabled={!logItems.length}
                  style={{
                    gridColumn: "1 / -1",
                    opacity: logItems.length ? 1 : 0.5,
                    cursor: logItems.length ? "pointer" : "not-allowed",
                  }}
                >
                  Clear log
                </motion.button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        Built with React + motion. Apple‑style dark UI, responsive layout, and keyboard-first controls.
      </footer>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            transition={{ duration: 0.18 }}
            role="status"
            aria-live="polite"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

