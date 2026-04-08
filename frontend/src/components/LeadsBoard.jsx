import { useState } from "react";

const STAGES = ["New Lead", "Estimating", "Meeting Scheduled", "Proposal Sent", "Site Survey", "Contract Sent", "Closed Won", "Closed Lost"];

const DEAL_TYPES = ["Roof Solar", "Roof Solar + Storage", "Storage", "Service", "SPAN + Storage"];

const DEAL_TYPE_COLORS = {
  "Roof Solar": { bg: "#0d9488", text: "#fff" },
  "Roof Solar + Storage": { bg: "#1e3a8a", text: "#fff" },
  "Storage": { bg: "#f59e0b", text: "#fff" },
  "Service": { bg: "#ef4444", text: "#fff" },
  "SPAN + Storage": { bg: "#7c3aed", text: "#fff" },
};

const STAGE_COLORS = {
  "New Lead": { bg: "#f3f4f6", text: "#374151" },
  "Estimating": { bg: "#dbeafe", text: "#1d4ed8" },
  "Meeting Scheduled": { bg: "#fef3c7", text: "#92400e" },
  "Proposal Sent": { bg: "#ede9fe", text: "#6d28d9" },
  "Site Survey": { bg: "#ffedd5", text: "#9a3412" },
  "Contract Sent": { bg: "#cffafe", text: "#155e75" },
  "Closed Won": { bg: "#dcfce7", text: "#16a34a" },
  "Closed Lost": { bg: "#fee2e2", text: "#dc2626" },
};

const fmt = (n) => "$" + Number(n).toLocaleString();

export default function LeadsBoard({ theme, leads, setLeads }) {
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [collapsed, setCollapsed] = useState({});
  const [previewLead, setPreviewLead] = useState(null);
  const [activePreviewTab, setActivePreviewTab] = useState("Information");
  const [notes, setNotes] = useState({});
  const [newNote, setNewNote] = useState("");
  const [form, setForm] = useState({ name: "", amount: "", closeDate: "", dealType: "Roof Solar", stage: "New Lead", contact: "" });

  const stageLeads = (stage) => leads.filter(l => l.stage === stage);
  const stageTotal = (stage) => leads.filter(l => l.stage === stage).reduce((s, l) => s + Number(l.amount), 0);

  const toggleCollapse = (stage) => setCollapsed(c => ({ ...c, [stage]: !c[stage] }));

  const openPreview = (lead, e) => {
    e.stopPropagation();
    setPreviewLead(lead);
    setActivePreviewTab("Information");
  };

  const openAdd = () => {
    setEditingLead(null);
    setForm({ name: "", amount: "", closeDate: "", dealType: "Roof Solar", stage: "New Lead", contact: "" });
    setShowModal(true);
  };

  const openEdit = (lead, e) => {
    e.stopPropagation();
    setEditingLead(lead);
    setForm({ name: lead.name, amount: lead.amount, closeDate: lead.closeDate, dealType: lead.dealType, stage: lead.stage, contact: lead.contact });
    setShowModal(true);
    setPreviewLead(null);
  };

  const saveForm = () => {
    if (!form.name.trim()) return;
    if (editingLead) {
      setLeads(ls => ls.map(l => l.id === editingLead.id ? { ...l, ...form, amount: Number(form.amount) } : l));
    } else {
      setLeads(ls => [...ls, { id: Date.now(), ...form, amount: Number(form.amount) }]);
    }
    setShowModal(false);
  };

  const deleteLead = (id, e) => {
    e.stopPropagation();
    setLeads(ls => ls.filter(l => l.id !== id));
    if (previewLead?.id === id) setPreviewLead(null);
  };

  const moveLead = (lead, dir, e) => {
    e?.stopPropagation();
    const idx = STAGES.indexOf(lead.stage);
    const next = STAGES[idx + dir];
    if (!next) return;
    setLeads(ls => ls.map(l => l.id === lead.id ? { ...l, stage: next } : l));
    if (previewLead?.id === lead.id) setPreviewLead(v => ({ ...v, stage: next }));
  };

  const moveLeadToStage = (lead, stage) => {
    setLeads(ls => ls.map(l => l.id === lead.id ? { ...l, stage } : l));
    setPreviewLead(v => ({ ...v, stage }));
  };

  const addNote = (leadId) => {
    if (!newNote.trim()) return;
    setNotes(n => ({ ...n, [leadId]: [...(n[leadId] || []), { id: Date.now(), text: newNote, date: new Date().toLocaleDateString() }] }));
    setNewNote("");
  };

  const onDragStart = (lead) => setDragging(lead);
  const onDrop = (stage) => {
    if (dragging) setLeads(ls => ls.map(l => l.id === dragging.id ? { ...l, stage } : l));
    setDragging(null);
    setDragOver(null);
  };

  const inputStyle = {
    width: "100%", padding: "8px 10px", borderRadius: "8px",
    border: `1px solid ${theme.border}`, background: theme.bg,
    color: theme.text, fontSize: "14px", outline: "none",
  };
  const labelStyle = { fontSize: "12px", fontWeight: 600, color: theme.subtext, marginBottom: "4px", display: "block" };

  const previewTabs = ["Information", "Activity", "Notes"];

  return (
    <div style={{ display: "flex", gap: "0", height: "100%", position: "relative" }}>

      {/* MAIN BOARD */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "180px" }}>
            <input placeholder="Search leads..." style={{ ...inputStyle, paddingLeft: "32px" }} />
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: theme.subtext, fontSize: "14px" }}>🔍</span>
          </div>
          <button onClick={openAdd} style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: "8px", padding: "9px 18px", cursor: "pointer", fontWeight: 700, fontSize: "14px", whiteSpace: "nowrap" }}>
            + Add Lead
          </button>
        </div>

        {/* Kanban Board */}
        <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "12px", alignItems: "flex-start" }}>
          {STAGES.map(stage => {
            const isCollapsed = collapsed[stage];
            const count = stageLeads(stage).length;
            const total = stageTotal(stage);

            if (isCollapsed) {
              return (
                <div key={stage}
                  style={{ flexShrink: 0, width: "36px", background: theme.panelSoft, borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: "8px", cursor: "pointer", minHeight: "200px" }}
                  onClick={() => toggleCollapse(stage)}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: theme.subtext, writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap" }}>
                    {stage} ({count})
                  </div>
                </div>
              );
            }

            return (
              <div key={stage}
                style={{ flexShrink: 0, width: "240px", background: theme.panelSoft, borderRadius: "12px", overflow: "hidden", border: dragOver === stage ? `2px solid ${theme.accent}` : `2px solid transparent` }}
                onDragOver={e => { e.preventDefault(); setDragOver(stage); }}
                onDrop={() => onDrop(stage)}
                onDragLeave={() => setDragOver(null)}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: `1px solid ${theme.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 700, fontSize: "13px", color: theme.text }}>{stage}</span>
                    <span style={{ background: theme.border, color: theme.subtext, borderRadius: "20px", padding: "1px 7px", fontSize: "11px", fontWeight: 600 }}>{count}</span>
                  </div>
                  <button onClick={() => toggleCollapse(stage)} style={{ background: "none", border: "none", cursor: "pointer", color: theme.subtext, fontSize: "16px", padding: "0 4px" }}>‹</button>
                </div>

                <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "8px", minHeight: "100px" }}>
                  {stageLeads(stage).map(lead => {
                    const dt = DEAL_TYPE_COLORS[lead.dealType] || { bg: "#6b7280", text: "#fff" };
                    const isSelected = previewLead?.id === lead.id;
                    return (
                      <div key={lead.id} draggable onDragStart={() => onDragStart(lead)}
                        onClick={(e) => openPreview(lead, e)}
                        style={{ background: theme.panel, borderRadius: "10px", border: isSelected ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`, padding: "12px", cursor: "pointer", transition: "border 0.15s" }}>
                        <div style={{ fontWeight: 700, fontSize: "13px", color: theme.accent, marginBottom: "5px" }}>{lead.name}</div>
                        <div style={{ fontSize: "11px", color: theme.subtext, marginBottom: "2px" }}>Amount: <span style={{ color: theme.text, fontWeight: 600 }}>{fmt(lead.amount)}</span></div>
                        <div style={{ fontSize: "11px", color: theme.subtext, marginBottom: "6px" }}>Close: {lead.closeDate}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ background: dt.bg, color: dt.text, padding: "2px 7px", borderRadius: "4px", fontSize: "10px", fontWeight: 600 }}>{lead.dealType}</span>
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button onClick={(e) => { e.stopPropagation(); moveLead(lead, -1, e); }} style={{ background: "none", border: `1px solid ${theme.border}`, borderRadius: "4px", padding: "2px 6px", cursor: "pointer", color: theme.subtext, fontSize: "11px" }}>←</button>
                            <button onClick={(e) => { e.stopPropagation(); moveLead(lead, 1, e); }} style={{ background: "none", border: `1px solid ${theme.border}`, borderRadius: "4px", padding: "2px 6px", cursor: "pointer", color: theme.subtext, fontSize: "11px" }}>→</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ padding: "8px 14px", borderTop: `1px solid ${theme.border}`, fontSize: "11px", color: theme.subtext }}>
                  <span style={{ fontWeight: 700, color: theme.text }}>{fmt(total)}</span> | Total
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SLIDE-OUT PREVIEW PANEL */}
      {previewLead && (() => {
        const lead = leads.find(l => l.id === previewLead.id) || previewLead;
        const dt = DEAL_TYPE_COLORS[lead.dealType] || { bg: "#6b7280", text: "#fff" };
        const sc = STAGE_COLORS[lead.stage] || { bg: "#f3f4f6", text: "#374151" };
        const leadNotes = notes[lead.id] || [];
        const initials = lead.contact ? lead.contact.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : lead.name.slice(0, 2).toUpperCase();

        return (
          <div style={{ width: "320px", flexShrink: 0, marginLeft: "16px", background: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", overflow: "hidden", maxHeight: "80vh", position: "sticky", top: "0" }}>

            {/* Preview Header */}
            <div style={{ padding: "20px", borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: theme.subtext }}>Preview</div>
                <button onClick={() => setPreviewLead(null)} style={{ background: "none", border: "none", cursor: "pointer", color: theme.subtext, fontSize: "18px", lineHeight: 1 }}>×</button>
              </div>

              {/* Avatar + Name */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: theme.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "16px", color: theme.accent, flexShrink: 0 }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "16px", color: theme.text }}>{lead.contact || lead.name}</div>
                  <div style={{ fontSize: "12px", color: theme.subtext, marginTop: "2px" }}>{lead.name}</div>
                </div>
              </div>

              {/* Key stats */}
              <div style={{ display: "grid", gap: "6px", marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: theme.subtext }}>Amount</span>
                  <span style={{ fontWeight: 700, color: theme.accent }}>{fmt(lead.amount)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: theme.subtext }}>Close Date</span>
                  <span style={{ fontWeight: 600 }}>{lead.closeDate || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: theme.subtext }}>Pipeline</span>
                  <span style={{ fontWeight: 600 }}>Sales Pipeline</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                  <span style={{ color: theme.subtext }}>Deal Stage</span>
                  <span style={{ background: sc.bg, color: sc.text, padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600 }}>{lead.stage}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                  <span style={{ color: theme.subtext }}>Deal Type</span>
                  <span style={{ background: dt.bg, color: dt.text, padding: "2px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 }}>{lead.dealType}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                {[
                  { icon: "✏️", label: "Edit", action: (e) => openEdit(lead, e) },
                  { icon: "📧", label: "Email", action: () => {} },
                  { icon: "📞", label: "Call", action: () => {} },
                  { icon: "📋", label: "Task", action: () => {} },
                  { icon: "🗑", label: "Delete", action: (e) => deleteLead(lead.id, e), danger: true },
                ].map(btn => (
                  <button key={btn.label} onClick={btn.action}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", background: "none", border: `1px solid ${theme.border}`, borderRadius: "8px", padding: "6px 8px", cursor: "pointer", color: btn.danger ? theme.danger : theme.subtext, fontSize: "16px", flex: 1 }}>
                    <span>{btn.icon}</span>
                    <span style={{ fontSize: "9px", fontWeight: 600 }}>{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Move stage */}
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: theme.subtext, marginBottom: "8px" }}>MOVE TO STAGE</div>
              <select
                value={lead.stage}
                onChange={e => moveLeadToStage(lead, e.target.value)}
                style={{ ...inputStyle, fontSize: "12px", padding: "6px 10px" }}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${theme.border}` }}>
              {previewTabs.map(t => (
                <button key={t} onClick={() => setActivePreviewTab(t)}
                  style={{ flex: 1, padding: "10px 4px", background: "none", border: "none", borderBottom: activePreviewTab === t ? `2px solid ${theme.accent}` : "2px solid transparent", cursor: "pointer", fontSize: "12px", fontWeight: activePreviewTab === t ? 700 : 500, color: activePreviewTab === t ? theme.accent : theme.subtext }}>
                  {t}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>

              {/* INFORMATION */}
              {activePreviewTab === "Information" && (
                <div style={{ display: "grid", gap: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: theme.subtext, marginBottom: "4px" }}>CONTACT INFO</div>
                  {[
                    { label: "Contact Name", value: lead.contact || "—" },
                    { label: "Deal Name", value: lead.name },
                    { label: "Amount", value: fmt(lead.amount) },
                    { label: "Deal Type", value: lead.dealType },
                    { label: "Stage", value: lead.stage },
                    { label: "Close Date", value: lead.closeDate || "—" },
                    { label: "Assigned To", value: "Minh Nguyen" },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${theme.border}` }}>
                      <span style={{ fontSize: "12px", color: theme.subtext }}>{row.label}</span>
                      <span style={{ fontSize: "12px", fontWeight: 600, textAlign: "right", maxWidth: "160px" }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ACTIVITY */}
              {activePreviewTab === "Activity" && (
                <div style={{ display: "grid", gap: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: theme.subtext, marginBottom: "4px" }}>RECENT ACTIVITY</div>
                  {[
                    { icon: "🔵", text: `Lead created — ${lead.name}`, date: "Today" },
                    { icon: "📋", text: `Stage set to ${lead.stage}`, date: "Today" },
                    { icon: "💰", text: `Amount set to ${fmt(lead.amount)}`, date: "Today" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
                      <span style={{ fontSize: "14px" }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: "12px", color: theme.text }}>{item.text}</div>
                        <div style={{ fontSize: "11px", color: theme.subtext, marginTop: "2px" }}>{item.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* NOTES */}
              {activePreviewTab === "Notes" && (
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: theme.subtext, marginBottom: "10px" }}>PINNED ACTIVITY</div>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                    <input
                      style={{ ...inputStyle, fontSize: "12px", padding: "6px 10px" }}
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      onKeyDown={e => e.key === "Enter" && addNote(lead.id)}
                    />
                    <button onClick={() => addNote(lead.id)}
                      style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: "12px", whiteSpace: "nowrap" }}>
                      + Add
                    </button>
                  </div>
                  {leadNotes.length === 0 ? (
                    <div style={{ textAlign: "center", color: theme.subtext, fontSize: "12px", padding: "20px 0" }}>
                      No notes yet
                    </div>
                  ) : leadNotes.map(n => (
                    <div key={n.id} style={{ background: theme.panelSoft, borderRadius: "8px", padding: "10px", marginBottom: "8px" }}>
                      <div style={{ fontSize: "12px", color: theme.text }}>{n.text}</div>
                      <div style={{ fontSize: "10px", color: theme.subtext, marginTop: "4px" }}>{n.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: theme.panel, borderRadius: "16px", padding: "28px", width: "420px", border: `1px solid ${theme.border}` }}>
            <h2 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: 700 }}>{editingLead ? "Edit Lead" : "Add Lead"}</h2>
            <div style={{ display: "grid", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Deal name" />
              </div>
              <div>
                <label style={labelStyle}>Contact</label>
                <input style={inputStyle} value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="Contact person" />
              </div>
              <div>
                <label style={labelStyle}>Amount ($)</label>
                <input style={inputStyle} type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
              </div>
              <div>
                <label style={labelStyle}>Close Date</label>
                <input style={inputStyle} value={form.closeDate} onChange={e => setForm(f => ({ ...f, closeDate: e.target.value }))} placeholder="MM/DD/YYYY" />
              </div>
              <div>
                <label style={labelStyle}>Deal Type</label>
                <select style={inputStyle} value={form.dealType} onChange={e => setForm(f => ({ ...f, dealType: e.target.value }))}>
                  {DEAL_TYPES.map(dt => <option key={dt}>{dt}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Stage</label>
                <select style={inputStyle} value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: `1px solid ${theme.border}`, background: "none", color: theme.text, cursor: "pointer", fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={saveForm}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: theme.accent, color: "#fff", cursor: "pointer", fontWeight: 700 }}>
                {editingLead ? "Save Changes" : "Add Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}