import { useState } from "react";

const PROJECT_STAGES = ["Bidding", "Engineering", "Permitting", "Unscheduled", "Started", "Completed"];

const STAGE_COLORS = {
  Bidding: { bg: "#fef3c7", text: "#92400e" },
  Engineering: { bg: "#fee2e2", text: "#991b1b" },
  Permitting: { bg: "#ede9fe", text: "#6d28d9" },
  Unscheduled: { bg: "#f3f4f6", text: "#374151" },
  Started: { bg: "#dbeafe", text: "#1d4ed8" },
  Completed: { bg: "#dcfce7", text: "#16a34a" },
};

const fmt = (n) => "$" + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PLACEHOLDER_PHOTOS = [
  { id: 1, label: "Site Overview", color: "#1e3a8a", icon: "🏠" },
  { id: 2, label: "Roof Assessment", color: "#0d9488", icon: "📐" },
  { id: 3, label: "Panel Layout", color: "#7c3aed", icon: "⚡" },
  { id: 4, label: "Electrical Panel", color: "#b45309", icon: "🔌" },
  { id: 5, label: "Installation Day 1", color: "#065f46", icon: "🔧" },
  { id: 6, label: "Completion Photos", color: "#1d4ed8", icon: "✅" },
];

export default function ProjectsPage({ theme, projects, setProjects, leads }) {
  const [viewing, setViewing] = useState(null);
  const [activeTab, setActiveTab] = useState("Summary");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // Notes / todos / permits state per project (keyed by project id)
  const [notes, setNotes] = useState({});
  const [todos, setTodos] = useState({});
  const [permits, setPermits] = useState({});
  const [newNote, setNewNote] = useState("");
  const [newTodo, setNewTodo] = useState("");
  const [newPermit, setNewPermit] = useState("");

  const tabs = ["Summary", "Details", "Financial", "Documents", "Files & Photos"];

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.projectNumber.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || (filter === "Open" && p.stage !== "Completed") || (filter === "Completed" && p.stage === "Completed");
    return matchSearch && matchFilter;
  });

  const updateStage = (projectId, stage) => {
    setProjects(ps => ps.map(p => p.id === projectId ? { ...p, stage } : p));
    if (viewing?.id === projectId) setViewing(v => ({ ...v, stage }));
  };

  const inputStyle = {
    width: "100%", padding: "8px 10px", borderRadius: "8px",
    border: `1px solid ${theme.border}`, background: theme.bg,
    color: theme.text, fontSize: "14px", outline: "none",
  };

  const addNote = (pid) => {
    if (!newNote.trim()) return;
    setNotes(n => ({ ...n, [pid]: [...(n[pid] || []), { id: Date.now(), text: newNote, date: new Date().toLocaleDateString() }] }));
    setNewNote("");
  };

  const addTodo = (pid) => {
    if (!newTodo.trim()) return;
    setTodos(t => ({ ...t, [pid]: [...(t[pid] || []), { id: Date.now(), text: newTodo, done: false }] }));
    setNewTodo("");
  };

  const addPermit = (pid) => {
    if (!newPermit.trim()) return;
    setPermits(p => ({ ...p, [pid]: [...(p[pid] || []), { id: Date.now(), text: newPermit, status: "Pending" }] }));
    setNewPermit("");
  };

  const toggleTodo = (pid, tid) => {
    setTodos(t => ({ ...t, [pid]: (t[pid] || []).map(x => x.id === tid ? { ...x, done: !x.done } : x) }));
  };

  // ── PROJECT DETAIL VIEW ──
  if (viewing) {
    const p = projects.find(x => x.id === viewing.id) || viewing;
    const stageIdx = PROJECT_STAGES.indexOf(p.stage);
    const sellPrice = p.sellPrice || 0;
    const estCost = p.estCost || 0;
    const grossProfit = sellPrice - estCost;
    const grossProfitPct = sellPrice > 0 ? ((grossProfit / sellPrice) * 100).toFixed(1) : 0;
    const paid = p.paid || 0;
    const remaining = sellPrice - paid;
    const pNotes = notes[p.id] || [];
    const pTodos = todos[p.id] || [];
    const pPermits = permits[p.id] || [];

    return (
      <div style={{ display: "flex", flexDirection: "column" }}>

        {/* Back */}
        <button onClick={() => setViewing(null)}
          style={{ alignSelf: "flex-start", marginBottom: "16px", cursor: "pointer", background: "none", border: `1px solid ${theme.border}`, borderRadius: "8px", padding: "6px 14px", color: theme.text, fontSize: "14px", fontWeight: 600 }}>
          ← Back to Projects
        </button>

        {/* Header */}
        <div style={{ background: theme.panel, borderRadius: "16px 16px 0 0", border: `1px solid ${theme.border}`, borderBottom: "none", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: theme.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "16px", color: theme.accent }}>
                {p.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: "20px", fontWeight: 800 }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                  <span style={{ background: STAGE_COLORS[p.stage]?.bg, color: STAGE_COLORS[p.stage]?.text, padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>{p.stage}</span>
                  <span style={{ color: theme.subtext, fontSize: "13px" }}>{p.projectNumber}</span>
                </div>
              </div>
            </div>

            {/* Stage pipeline */}
            <div style={{ display: "flex", alignItems: "center", gap: "3px", flexWrap: "wrap" }}>
              {PROJECT_STAGES.map((s, i) => {
                const isActive = s === p.stage;
                const isPast = stageIdx > i;
                const sc = STAGE_COLORS[s];
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center" }}>
                    <button onClick={() => updateStage(p.id, s)}
                      style={{ padding: "5px 10px", borderRadius: "20px", cursor: "pointer", fontSize: "11px", fontWeight: 600, border: "none", background: isActive ? sc.bg : isPast ? "#f0fdf4" : theme.panelSoft, color: isActive ? sc.text : isPast ? "#16a34a" : theme.subtext, outline: isActive ? `2px solid ${sc.text}` : "none" }}>
                      {s}
                    </button>
                    {i < PROJECT_STAGES.length - 1 && <div style={{ width: "14px", height: "2px", background: theme.border }} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "flex", border: `1px solid ${theme.border}`, borderRadius: "0 0 16px 16px", overflow: "hidden", background: theme.panel, minHeight: "520px" }}>

          {/* Sidebar */}
          <div style={{ width: "180px", borderRight: `1px solid ${theme.border}`, padding: "16px 0", flexShrink: 0, background: theme.panelSoft }}>
            {tabs.map(t => (
              <div key={t} onClick={() => setActiveTab(t)}
                style={{ padding: "12px 20px", cursor: "pointer", fontSize: "14px", fontWeight: activeTab === t ? 700 : 500, color: activeTab === t ? theme.accent : theme.text, background: activeTab === t ? theme.accentSoft : "transparent", borderLeft: activeTab === t ? `3px solid ${theme.accent}` : "3px solid transparent" }}>
                {t}
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>

            {/* SUMMARY */}
            {activeTab === "Summary" && (
              <div style={{ display: "grid", gap: "20px" }}>
                {/* KPI cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                  {[
                    { label: "Gross Profit", value: fmt(grossProfit), sub: `${grossProfitPct}%`, color: theme.success },
                    { label: "Project Manager", value: p.pm || "Minh Nguyen", sub: "PM", color: theme.accent },
                    { label: "Schedule Completed", value: p.stage === "Completed" ? "100%" : stageIdx > 0 ? `${Math.round((stageIdx / (PROJECT_STAGES.length - 1)) * 100)}%` : "0%", sub: p.stage, color: theme.warning },
                  ].map(card => (
                    <div key={card.label} style={{ background: theme.panelSoft, borderRadius: "12px", padding: "18px" }}>
                      <div style={{ fontSize: "12px", color: theme.subtext, marginBottom: "6px" }}>{card.label}</div>
                      <div style={{ fontSize: "22px", fontWeight: 800, color: card.color }}>{card.value}</div>
                      <div style={{ fontSize: "12px", color: theme.subtext, marginTop: "4px" }}>{card.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Project Summary financials */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "20px" }}>
                    <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "16px" }}>Project Summary</div>
                    {[
                      { label: "Original Contract Amount", value: fmt(sellPrice), color: theme.success },
                      { label: "Change Orders", value: fmt(0) },
                      { label: "Total Project Amount", value: fmt(sellPrice), bold: true },
                      { label: "Customer Payments", value: fmt(paid), color: theme.danger },
                      { label: "Unpaid Invoices", value: fmt(remaining > 0 ? remaining : 0) },
                      { label: "Remaining to Invoice", value: fmt(remaining > 0 ? remaining : 0), bold: true },
                    ].map((row, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
                        <span style={{ fontSize: "13px", color: theme.subtext }}>{row.label}</span>
                        <span style={{ fontSize: "13px", fontWeight: row.bold ? 800 : 600, color: row.color || theme.text }}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bar chart */}
                  <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "20px" }}>
                    <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "16px" }}>Summary Percentages</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", height: "140px", paddingBottom: "8px" }}>
                      {[
                        { label: "Est. Cost", value: estCost, max: sellPrice, color: "#f59e0b" },
                        { label: "Sell Price", value: sellPrice, max: sellPrice, color: "#1e3a8a" },
                        { label: "Paid", value: paid, max: sellPrice, color: "#22c55e" },
                        { label: "Profit", value: grossProfit, max: sellPrice, color: "#7c3aed" },
                      ].map(bar => {
                        const pct = sellPrice > 0 ? Math.max(4, Math.round((bar.value / bar.max) * 100)) : 4;
                        return (
                          <div key={bar.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%", justifyContent: "flex-end" }}>
                            <div style={{ fontSize: "10px", color: theme.subtext }}>{pct}%</div>
                            <div style={{ width: "100%", height: `${pct}%`, background: bar.color, borderRadius: "4px 4px 0 0", minHeight: "8px" }} />
                            <div style={{ fontSize: "10px", color: theme.subtext, textAlign: "center" }}>{bar.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Customer card */}
                <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "20px" }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "12px" }}>Customer</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: theme.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px", color: theme.accent }}>
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "15px" }}>{p.name}</div>
                      <div style={{ fontSize: "12px", color: theme.subtext }}>Customer · {p.dealType || "Solar"}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DETAILS */}
            {activeTab === "Details" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "20px" }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "16px" }}>Project Details</div>
                  {[
                    { label: "Project Number", value: p.projectNumber },
                    { label: "Customer", value: p.name },
                    { label: "Deal Type", value: p.dealType || "—" },
                    { label: "Stage", value: p.stage },
                    { label: "Start Date", value: p.startDate || "—" },
                    { label: "End Date", value: p.endDate || "—" },
                    { label: "Close Date", value: p.closeDate || "—" },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
                      <span style={{ fontSize: "13px", color: theme.subtext }}>{row.label}</span>
                      <span style={{ fontSize: "13px", fontWeight: 600 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "20px" }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "16px" }}>Assignees</div>
                  {[
                    { label: "Project Manager", value: p.pm || "Minh Nguyen" },
                    { label: "Site Manager", value: p.siteManager || "—" },
                    { label: "Estimator", value: "Minh Nguyen" },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
                      <span style={{ fontSize: "13px", color: theme.subtext }}>{row.label}</span>
                      <span style={{ fontSize: "13px", fontWeight: 600 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FINANCIAL */}
            {activeTab === "Financial" && (
              <div style={{ display: "grid", gap: "16px" }}>
                {/* Estimates */}
                <div style={{ background: theme.panel, borderRadius: "12px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: theme.panelSoft, borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontWeight: 700 }}>Estimates (1)</div>
                    <div style={{ fontWeight: 700, color: theme.accent }}>{fmt(sellPrice)}</div>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={{ background: theme.panelSoft }}>
                      {["#", "Date", "Title", "Status", "Total"].map(h => <th key={h} style={{ padding: "10px 16px", fontSize: "11px", color: theme.subtext, fontWeight: 600, textAlign: "left" }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      <tr style={{ borderTop: `1px solid ${theme.border}` }}>
                        <td style={{ padding: "12px 16px", fontSize: "13px" }}>EST. #{p.estimateId || "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: "13px" }}>{new Date().toLocaleDateString()}</td>
                        <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 600 }}>{p.name}</td>
                        <td style={{ padding: "12px 16px" }}><span style={{ background: "#dcfce7", color: "#16a34a", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>Approved</span></td>
                        <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 700 }}>{fmt(sellPrice)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Invoices */}
                <div style={{ background: theme.panel, borderRadius: "12px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: theme.panelSoft, borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontWeight: 700 }}>Invoices</div>
                    <button style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: "6px", padding: "5px 12px", cursor: "pointer", fontWeight: 600, fontSize: "12px" }}>+ Invoice</button>
                  </div>
                  <div style={{ padding: "24px", textAlign: "center", color: theme.subtext, fontSize: "13px" }}>No invoices yet</div>
                </div>

                {/* Payments */}
                <div style={{ background: theme.panel, borderRadius: "12px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: theme.panelSoft, borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontWeight: 700 }}>Payments</div>
                    <button style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: "6px", padding: "5px 12px", cursor: "pointer", fontWeight: 600, fontSize: "12px" }}>+ Payment</button>
                  </div>
                  <div style={{ padding: "24px", textAlign: "center", color: theme.subtext, fontSize: "13px" }}>No payments recorded yet</div>
                </div>

                {/* Cost summary */}
                <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "20px" }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "14px" }}>Cost Summary</div>
                  {[
                    { label: "Estimated Cost", value: fmt(estCost), color: theme.warning },
                    { label: "Sell Price", value: fmt(sellPrice), color: theme.accent },
                    { label: "Gross Profit", value: fmt(grossProfit), color: theme.success },
                    { label: "Profit Margin", value: `${grossProfitPct}%`, color: theme.success },
                    { label: "Committed Cost", value: fmt(0) },
                    { label: "Actual Cost", value: fmt(0) },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
                      <span style={{ fontSize: "13px", color: theme.subtext }}>{row.label}</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: row.color || theme.text }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DOCUMENTS */}
            {activeTab === "Documents" && (
              <div style={{ display: "grid", gap: "16px" }}>
                {/* Notes */}
                <div style={{ background: theme.panel, borderRadius: "12px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", fontWeight: 700, borderBottom: `1px solid ${theme.border}`, background: theme.panelSoft, display: "flex", justifyContent: "space-between" }}>
                    <span>Project Notes ({pNotes.length})</span>
                  </div>
                  <div style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                      <input style={inputStyle} value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." />
                      <button onClick={() => addNote(p.id)} style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}>+ Note</button>
                    </div>
                    {pNotes.length === 0 ? <div style={{ color: theme.subtext, fontSize: "13px" }}>No notes yet</div> :
                      pNotes.map(n => (
                        <div key={n.id} style={{ padding: "10px 14px", background: theme.panelSoft, borderRadius: "8px", marginBottom: "8px" }}>
                          <div style={{ fontSize: "13px" }}>{n.text}</div>
                          <div style={{ fontSize: "11px", color: theme.subtext, marginTop: "4px" }}>{n.date}</div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* To-Do's */}
                <div style={{ background: theme.panel, borderRadius: "12px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", fontWeight: 700, borderBottom: `1px solid ${theme.border}`, background: theme.panelSoft }}>
                    To-Do's ({pTodos.length})
                  </div>
                  <div style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                      <input style={inputStyle} value={newTodo} onChange={e => setNewTodo(e.target.value)} placeholder="Add a to-do..." />
                      <button onClick={() => addTodo(p.id)} style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}>+ To-Do</button>
                    </div>
                    {pTodos.length === 0 ? <div style={{ color: theme.subtext, fontSize: "13px" }}>No to-dos yet</div> :
                      pTodos.map(t => (
                        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
                          <input type="checkbox" checked={t.done} onChange={() => toggleTodo(p.id, t.id)} />
                          <span style={{ fontSize: "13px", textDecoration: t.done ? "line-through" : "none", color: t.done ? theme.subtext : theme.text }}>{t.text}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Permits */}
                <div style={{ background: theme.panel, borderRadius: "12px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", fontWeight: 700, borderBottom: `1px solid ${theme.border}`, background: theme.panelSoft }}>
                    Permits ({pPermits.length})
                  </div>
                  <div style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                      <input style={inputStyle} value={newPermit} onChange={e => setNewPermit(e.target.value)} placeholder="Add permit info..." />
                      <button onClick={() => addPermit(p.id)} style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}>+ Permit</button>
                    </div>
                    {pPermits.length === 0 ? <div style={{ color: theme.subtext, fontSize: "13px" }}>No permits yet</div> :
                      pPermits.map(pm => (
                        <div key={pm.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: theme.panelSoft, borderRadius: "8px", marginBottom: "8px" }}>
                          <span style={{ fontSize: "13px" }}>{pm.text}</span>
                          <span style={{ fontSize: "12px", background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "20px", fontWeight: 600 }}>{pm.status}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Inspections */}
                <div style={{ background: theme.panel, borderRadius: "12px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", fontWeight: 700, borderBottom: `1px solid ${theme.border}`, background: theme.panelSoft, display: "flex", justifyContent: "space-between" }}>
                    <span>Inspections (0)</span>
                    <button style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontWeight: 600, fontSize: "12px" }}>+ Inspection</button>
                  </div>
                  <div style={{ padding: "24px", textAlign: "center", color: theme.subtext, fontSize: "13px" }}>No inspections scheduled</div>
                </div>
              </div>
            )}

            {/* FILES & PHOTOS */}
            {activeTab === "Files & Photos" && (
              <div style={{ display: "grid", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: "15px" }}>All Folders</div>
                  <button style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: "8px", padding: "7px 14px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>+ New Folder</button>
                </div>

                {/* Folder */}
                <div style={{ background: theme.panelSoft, borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", border: `1px solid ${theme.border}` }}>
                  <span style={{ fontSize: "18px" }}>📁</span>
                  <span style={{ fontSize: "14px", fontWeight: 600 }}>Plans</span>
                  <span style={{ fontSize: "12px", color: theme.subtext, marginLeft: "auto" }}>0 files</span>
                </div>

                {/* Placeholder photo grid */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "12px", color: theme.subtext }}>Site Photos (Sample)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                    {PLACEHOLDER_PHOTOS.map(photo => (
                      <div key={photo.id} style={{ background: photo.color, borderRadius: "12px", aspectRatio: "4/3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", opacity: 0.9 }}>
                        <span style={{ fontSize: "32px" }}>{photo.icon}</span>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>{photo.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Drag & drop zone */}
                <div style={{ border: `2px dashed ${theme.border}`, borderRadius: "12px", padding: "40px", textAlign: "center", color: theme.subtext }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>☁️</div>
                  <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "4px" }}>Click & Drag to Upload Files & Photos</div>
                  <div style={{ fontSize: "12px" }}>Supports JPG, PNG, PDF, and more</div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "12px", fontSize: "12px", color: theme.subtext, padding: "8px 0" }}>
          Created: {new Date().toLocaleDateString()} · by Minh Nguyen · Project {p.projectNumber}
        </div>
      </div>
    );
  }

  // ── PROJECT LIST VIEW ──
  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px 12px 8px 32px", borderRadius: "8px", border: `1px solid ${theme.border}`, background: theme.panel, color: theme.text, fontSize: "14px", outline: "none" }} />
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: theme.subtext }}>🔍</span>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {["Open", "Completed", "All"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${theme.border}`, cursor: "pointer", fontWeight: filter === f ? 700 : 500, background: filter === f ? theme.accent : theme.panel, color: filter === f ? "#fff" : theme.text, fontSize: "13px" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: theme.panelSoft, textAlign: "left" }}>
              {["Project", "Project #", "Stage", "Sell Price", "Est. Cost", "Gross Profit", "PM", "Customer", "Type"].map(h => (
                <th key={h} style={{ padding: "12px 14px", fontSize: "11px", color: theme.subtext, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: "40px", textAlign: "center", color: theme.subtext }}>
                {projects.length === 0 ? "No projects yet — projects are created when a lead moves to Closed Won" : "No projects match your search"}
              </td></tr>
            ) : filtered.map(p => {
              const sc = STAGE_COLORS[p.stage] || {};
              const profit = (p.sellPrice || 0) - (p.estCost || 0);
              return (
                <tr key={p.id} onClick={() => { setViewing(p); setActiveTab("Summary"); }}
                  style={{ borderTop: `1px solid ${theme.border}`, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.panelSoft}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "14px", fontSize: "14px", fontWeight: 700 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: sc.text || theme.accent, flexShrink: 0 }} />
                      {p.name}
                    </div>
                  </td>
                  <td style={{ padding: "14px", fontSize: "13px", color: theme.subtext }}>{p.projectNumber}</td>
                  <td style={{ padding: "14px" }}>
                    <span style={{ background: sc.bg, color: sc.text, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600 }}>{p.stage}</span>
                  </td>
                  <td style={{ padding: "14px", fontSize: "13px", fontWeight: 700 }}>{fmt(p.sellPrice)}</td>
                  <td style={{ padding: "14px", fontSize: "13px" }}>{fmt(p.estCost)}</td>
                  <td style={{ padding: "14px", fontSize: "13px", fontWeight: 700, color: profit >= 0 ? theme.success : theme.danger }}>{fmt(profit)}</td>
                  <td style={{ padding: "14px" }}>
                    <span style={{ background: theme.accentSoft, color: theme.accent, borderRadius: "50%", width: "28px", height: "28px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700 }}>MN</span>
                  </td>
                  <td style={{ padding: "14px", fontSize: "13px" }}>{p.name}</td>
                  <td style={{ padding: "14px", fontSize: "12px", color: theme.subtext }}>{p.dealType || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
