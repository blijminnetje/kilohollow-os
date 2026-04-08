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

const fmt = (n) => "$" + Number(n).toLocaleString();

// leads and setLeads now come from App.jsx — no local state for leads
export default function LeadsBoard({ theme, leads, setLeads }) {
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [collapsed, setCollapsed] = useState({});
  const [form, setForm] = useState({ name: "", amount: "", closeDate: "", dealType: "Roof Solar", stage: "New Lead", contact: "" });

  const stageLeads = (stage) => leads.filter(l => l.stage === stage);
  const stageTotal = (stage) => leads.filter(l => l.stage === stage).reduce((s, l) => s + Number(l.amount), 0);

  const toggleCollapse = (stage) => setCollapsed(c => ({ ...c, [stage]: !c[stage] }));

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
  };

  const moveLead = (lead, dir) => {
    const idx = STAGES.indexOf(lead.stage);
    const next = STAGES[idx + dir];
    if (!next) return;
    setLeads(ls => ls.map(l => l.id === lead.id ? { ...l, stage: next } : l));
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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

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

      {/* Board */}
      <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "12px", alignItems: "flex-start" }}>
        {STAGES.map(stage => {
          const isCollapsed = collapsed[stage];
          const count = stageLeads(stage).length;
          const total = stageTotal(stage);

          if (isCollapsed) {
            return (
              <div key={stage}
                style={{ flexShrink: 0, width: "36px", background: theme.panelSoft, borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: "8px", cursor: "pointer", minHeight: "200px" }}
                onClick={() => toggleCollapse(stage)}
              >
                <div style={{ fontSize: "11px", fontWeight: 700, color: theme.subtext, writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap" }}>
                  {stage} ({count})
                </div>
              </div>
            );
          }

          return (
            <div key={stage}
              style={{ flexShrink: 0, width: "260px", background: theme.panelSoft, borderRadius: "12px", overflow: "hidden",
                border: dragOver === stage ? `2px solid ${theme.accent}` : `2px solid transparent` }}
              onDragOver={e => { e.preventDefault(); setDragOver(stage); }}
              onDrop={() => onDrop(stage)}
              onDragLeave={() => setDragOver(null)}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: `1px solid ${theme.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: 700, fontSize: "14px", color: theme.text }}>{stage}</span>
                  <span style={{ background: theme.border, color: theme.subtext, borderRadius: "20px", padding: "1px 8px", fontSize: "12px", fontWeight: 600 }}>{count}</span>
                </div>
                <button onClick={() => toggleCollapse(stage)} style={{ background: "none", border: "none", cursor: "pointer", color: theme.subtext, fontSize: "16px", padding: "0 4px" }}>‹</button>
              </div>

              <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "8px", minHeight: "100px" }}>
                {stageLeads(stage).map(lead => {
                  const dt = DEAL_TYPE_COLORS[lead.dealType] || { bg: "#6b7280", text: "#fff" };
                  return (
                    <div key={lead.id} draggable onDragStart={() => onDragStart(lead)}
                      style={{ background: theme.panel, borderRadius: "10px", border: `1px solid ${theme.border}`, padding: "12px", cursor: "grab" }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "14px", color: theme.accent, marginBottom: "6px" }}>{lead.name}</div>
                      <div style={{ fontSize: "12px", color: theme.subtext, marginBottom: "2px" }}>Amount: <span style={{ color: theme.text, fontWeight: 600 }}>{fmt(lead.amount)}</span></div>
                      <div style={{ fontSize: "12px", color: theme.subtext, marginBottom: "2px" }}>Close date: {lead.closeDate}</div>
                      <div style={{ fontSize: "12px", color: theme.subtext, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                        Deal type: <span style={{ background: dt.bg, color: dt.text, padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 }}>{lead.dealType}</span>
                      </div>
                      <div style={{ display: "flex", gap: "6px", borderTop: `1px solid ${theme.border}`, paddingTop: "8px", marginTop: "4px" }}>
                        <button onClick={() => moveLead(lead, -1)} title="Move left"
                          style={{ flex: 1, background: "none", border: `1px solid ${theme.border}`, borderRadius: "6px", padding: "4px", cursor: "pointer", color: theme.subtext, fontSize: "13px" }}>←</button>
                        <button onClick={() => moveLead(lead, 1)} title="Move right"
                          style={{ flex: 1, background: "none", border: `1px solid ${theme.border}`, borderRadius: "6px", padding: "4px", cursor: "pointer", color: theme.subtext, fontSize: "13px" }}>→</button>
                        <button onClick={(e) => openEdit(lead, e)} title="Edit"
                          style={{ flex: 1, background: "none", border: `1px solid ${theme.border}`, borderRadius: "6px", padding: "4px", cursor: "pointer", color: theme.subtext, fontSize: "13px" }}>✏️</button>
                        <button onClick={(e) => deleteLead(lead.id, e)} title="Delete"
                          style={{ flex: 1, background: "none", border: `1px solid ${theme.border}`, borderRadius: "6px", padding: "4px", cursor: "pointer", color: theme.danger, fontSize: "13px" }}>🗑</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ padding: "10px 14px", borderTop: `1px solid ${theme.border}`, fontSize: "12px", color: theme.subtext }}>
                <span style={{ fontWeight: 700, color: theme.text }}>{fmt(total)}</span> | Total amount
              </div>
            </div>
          );
        })}
      </div>

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