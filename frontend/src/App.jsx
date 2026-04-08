import { useState } from "react";
import EstimateEditor from './components/EstimateEditor';
import LeadsBoard from './components/LeadsBoard';
import ProjectsPage from './components/ProjectsPage';
import InvoicesPage from './components/InvoicesPage';
import PaymentsPage from './components/PaymentsPage';

const initialLeads = [
  { id: 1, name: "Tom Johnson", amount: 10000, closeDate: "05/02/2026", dealType: "Roof Solar", stage: "New Lead", contact: "Tom Johnson" },
  { id: 2, name: "Alex Owen", amount: 22649, closeDate: "05/02/2026", dealType: "Roof Solar", stage: "Proposal Sent", contact: "Alex B." },
  { id: 3, name: "Alex Owen", amount: 3000, closeDate: "05/02/2026", dealType: "Service", stage: "Proposal Sent", contact: "Alex B." },
  { id: 4, name: "Roy Robinson", amount: 6200, closeDate: "05/02/2026", dealType: "Service", stage: "Proposal Sent", contact: "Roy Robinson" },
  { id: 5, name: "Matthew Whites", amount: 70000, closeDate: "05/02/2026", dealType: "Roof Solar + Storage", stage: "Site Survey", contact: "Matthew W." },
  { id: 6, name: "John Brown", amount: 69482, closeDate: "04/10/2026", dealType: "Roof Solar + Storage", stage: "Site Survey", contact: "John B." },
  { id: 7, name: "Gordon Millers", amount: 50710, closeDate: "03/28/2026", dealType: "SPAN + Storage", stage: "Closed Won", contact: "Gordon M." },
  { id: 8, name: "Mark Davis", amount: 36750, closeDate: "03/11/2026", dealType: "Storage", stage: "Closed Won", contact: "Mark D." },
  { id: 9, name: "Sarah Jennings", amount: 15500, closeDate: "05/15/2026", dealType: "Roof Solar", stage: "New Lead", contact: "Sarah J." },
];

const initialEstimates = [
  { id: 357, title: "Battery", customer: "Eddy Garcia", leadId: null, total: 0, estimateStatus: "Estimating", items: [] },
  { id: 356, title: "Solar Removal - Owen", customer: "Alex Owen", leadId: 2, total: 2750, estimateStatus: "Estimating", items: [] },
  { id: 355, title: "Carol Williams - Lift and Replace", customer: "Carol Williams", leadId: null, total: 7668, estimateStatus: "Approved", items: [] },
];

const initialProjects = [
  { id: 101, name: "Gordon Millers", projectNumber: "PRJ-001", stage: "Engineering", sellPrice: 50710, estCost: 36325, paid: 0, dealType: "SPAN + Storage", closeDate: "03/28/2026", leadId: 7, estimateId: 336, pm: "Min Nguyen" },
  { id: 102, name: "Mark Davis", projectNumber: "PRJ-002", stage: "Bidding", sellPrice: 36750, estCost: 24300, paid: 3675, dealType: "Storage", closeDate: "03/11/2026", leadId: 8, estimateId: null, pm: "Min Nguyen" },
];

const initialInvoices = [
  {
    id: 1, invoiceNumber: "345-1", projectName: "David Rodriguez", projectId: 101,
    customer: "David Rodriguez", invoiceDate: "03/30/2026", dueDate: "03/30/2026",
    total: 485, paid: 485, status: "Paid",
    description: "Scope of Work: Tesla Inverter Commissioning & System Review\nKilo Hollow Energy will perform a site visit to evaluate, commission, and attempt activation of the existing Tesla solar inverter system.",
    terms: "Full-payment is due within 30 days of receiving this invoice unless other terms have been agreed upon.",
    items: [{ id: 1, type: "Labor", name: "System Inspection - Tesla Solar", costCode: "-", qty: 1, unitCost: 485, unit: "Project" }],
    payments: [{ id: 1, date: "03/30/2026", type: "Check", notes: "-", amount: 485, status: "Received" }],
  },
  {
    id: 2, invoiceNumber: "333-1", projectName: "Owen Daly - Solar Lift + Reinstall", projectId: null,
    customer: "Owen Daly", invoiceDate: "03/17/2026", dueDate: "03/19/2026",
    total: 8750.01, paid: 4375, status: "Submitted",
    description: "Solar Lift and Reinstall project - partial payment invoice.",
    terms: "Full-payment is due within 30 days of receiving this invoice unless other terms have been agreed upon.",
    items: [
      { id: 1, type: "Labor", name: "Lift and Replace (Nate price - M...)", costCode: "-", qty: 24, unitCost: 200, unit: "panel" },
      { id: 2, type: "Labor", name: "TRAVEL OVER 2 HOURS FROM...", costCode: "-", qty: 2, unitCost: 74.71, unit: "Trip" },
    ],
    payments: [{ id: 1, date: "03/24/2026", type: "Check", notes: "-", amount: 4375, status: "Received" }],
  },
  {
    id: 3, invoiceNumber: "313-1", projectName: "-", projectId: null,
    customer: "Blue Water Marine Construction", invoiceDate: "03/29/2026", dueDate: "03/30/2026",
    total: 7692.50, paid: 0, status: "Draft",
    description: "", terms: "Full-payment is due within 30 days of receiving this invoice unless other terms have been agreed upon.",
    items: [], payments: [],
  },
  {
    id: 4, invoiceNumber: "330-1", projectName: "Mark Davis - Powerwall 3", projectId: 102,
    customer: "Mark Davis", invoiceDate: "03/16/2026", dueDate: "03/16/2026",
    total: 36750.50, paid: 3675, status: "Submitted",
    description: "Powerwall 3 installation - deposit invoice.",
    terms: "Full-payment is due within 30 days of receiving this invoice unless other terms have been agreed upon.",
    items: [{ id: 1, type: "Material", name: "Powerwall 3 Installation", costCode: "-", qty: 1, unitCost: 36750.50, unit: "Project" }],
    payments: [{ id: 1, date: "03/16/2026", type: "Check", notes: "-", amount: 3675, status: "Received" }],
  },
];

let projectCounter = 103;

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [viewingEstimate, setViewingEstimate] = useState(null);
  const [leads, setLeads] = useState(initialLeads);
  const [estimates, setEstimates] = useState(initialEstimates);
  const [projects, setProjects] = useState(initialProjects);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [showAddEstimate, setShowAddEstimate] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", leadId: "", customCustomer: "" });
  const [dashboardPopup, setDashboardPopup] = useState(null); // ← fixed: inside component

  const theme = {
    bg: darkMode ? "#0f172a" : "#f5f7fb",
    panel: darkMode ? "#111827" : "#ffffff",
    panelSoft: darkMode ? "#1f2937" : "#eef2f7",
    text: darkMode ? "#f8fafc" : "#111827",
    subtext: darkMode ? "#94a3b8" : "#6b7280",
    border: darkMode ? "#334155" : "#e5e7eb",
    accent: "#1e3a8a",
    accentSoft: darkMode ? "#1e293b" : "#e0e7ff",
    success: "#22c55e",
    danger: "#ef4444",
    warning: "#f59e0b",
  };

  const setLeadsWithProjectSync = (updater) => {
    setLeads(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      next.forEach(lead => {
        if (lead.stage === "Closed Won") {
          setProjects(ps => {
            const exists = ps.find(p => p.leadId === lead.id);
            if (!exists) {
              const newProject = {
                id: projectCounter++,
                name: lead.contact || lead.name,
                projectNumber: `PRJ-${String(projectCounter).padStart(3, "0")}`,
                stage: "Bidding",
                sellPrice: lead.amount,
                estCost: Math.round(lead.amount * 0.7),
                paid: 0,
                dealType: lead.dealType,
                closeDate: lead.closeDate,
                leadId: lead.id,
                estimateId: null,
                pm: "Min Nguyen",
              };
              return [...ps, newProject];
            }
            return ps;
          });
        }
      });
      return next;
    });
  };

  const closedWonTotal = leads.filter(l => l.stage === "Closed Won").reduce((s, l) => s + Number(l.amount), 0);
  const closedLostTotal = leads.filter(l => l.stage === "Closed Lost").reduce((s, l) => s + Number(l.amount), 0);
  const totalPipeline = closedWonTotal + closedLostTotal;

  const pipelineStats = [
    { label: "Closed Won", amount: "$" + closedWonTotal.toLocaleString(), color: theme.success, pct: totalPipeline > 0 ? Math.round((closedWonTotal / totalPipeline) * 100) + "%" : "0%" },
    { label: "Closed Lost", amount: "$" + closedLostTotal.toLocaleString(), color: theme.danger, pct: totalPipeline > 0 ? Math.round((closedLostTotal / totalPipeline) * 100) + "%" : "0%" },
  ];

  const estimateStatusBars = (() => {
    const statuses = ["On Hold", "Estimating", "Pending Approval", "Approved", "Completed"];
    const total = estimates.length || 1;
    return statuses.map(s => ({
      label: s, count: estimates.filter(e => e.estimateStatus === s).length,
      color: { "On Hold": "#94a3b8", "Estimating": "#3b82f6", "Pending Approval": "#7c3aed", "Approved": "#22c55e", "Completed": "#15803d" }[s],
      pct: Math.round((estimates.filter(e => e.estimateStatus === s).length / total) * 100) + "%",
    }));
  })();

  const statusColor = (status) => {
    if (status === "Approved") return { bg: "#dcfce7", text: "#16a34a" };
    if (status === "Rejected" || status === "On Hold") return { bg: "#fee2e2", text: "#dc2626" };
    if (status === "Estimating") return { bg: "#dbeafe", text: "#1d4ed8" };
    if (status === "Pending Approval") return { bg: "#ede9fe", text: "#6d28d9" };
    if (status === "Completed") return { bg: "#f0fdf4", text: "#15803d" };
    return { bg: "#f3f4f6", text: "#6b7280" };
  };

  const createEstimate = () => {
    if (!addForm.title.trim()) return;
    const lead = leads.find(l => l.id === Number(addForm.leadId));
    const customer = lead ? lead.contact || lead.name : addForm.customCustomer;
    const newEst = {
      id: Math.max(...estimates.map(e => e.id), 357) + 1,
      title: addForm.title, customer, leadId: lead ? lead.id : null,
      total: 0, estimateStatus: "Estimating", items: [],
    };
    setEstimates(prev => [newEst, ...prev]);
    if (lead) setLeadsWithProjectSync(ls => ls.map(l => l.id === lead.id ? { ...l, stage: "Estimating" } : l));
    setShowAddEstimate(false);
    setAddForm({ title: "", leadId: "", customCustomer: "" });
    setViewingEstimate(newEst);
    setActiveTab("Estimates");
  };

  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.paid, 0);

  const navItems = ["Dashboard", "Leads", "Estimates", "Projects", "Invoices", "Payments"];
  const dashboardStages = ["New Lead", "Site Survey", "Proposal Sent"];

  const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: "8px", border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: "14px", outline: "none" };
  const labelStyle = { fontSize: "12px", fontWeight: 600, color: theme.subtext, marginBottom: "4px", display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* SIDEBAR */}
        <aside style={{ width: "260px", background: theme.panel, borderRight: `1px solid ${theme.border}`, padding: "24px", flexShrink: 0 }}>
          <div style={{ marginBottom: "32px" }}>
            <img src={darkMode ? "/logo-white.png" : "/logo-black.png"} alt="Kilo Hollow Energy" style={{ width: "150px" }} />
            <div style={{ fontWeight: 900, fontSize: "22px", marginTop: "6px", color: theme.text }}>OS</div>
          </div>
          <nav style={{ display: "grid", gap: "6px" }}>
            {navItems.map((item) => (
              <div key={item} onClick={() => { setActiveTab(item); setViewingEstimate(null); }}
                style={{ padding: "12px 16px", borderRadius: "12px", cursor: "pointer", background: activeTab === item ? theme.accentSoft : "transparent", color: activeTab === item ? theme.accent : theme.text, fontWeight: activeTab === item ? 700 : 500, fontSize: "15px", transition: "background 0.15s", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {item}
                {item === "Projects" && projects.length > 0 && (
                  <span style={{ background: theme.accent, color: "#fff", borderRadius: "20px", padding: "1px 8px", fontSize: "11px", fontWeight: 700 }}>{projects.length}</span>
                )}
                {item === "Invoices" && invoices.filter(i => i.paid < i.total).length > 0 && (
                  <span style={{ background: theme.danger, color: "#fff", borderRadius: "20px", padding: "1px 8px", fontSize: "11px", fontWeight: 700 }}>{invoices.filter(i => i.paid < i.total).length}</span>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, padding: "30px", overflowY: "auto" }}>

          {/* HEADER */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800 }}>{activeTab}</h1>
            <div style={{ display: "flex", gap: "10px" }}>
              {activeTab === "Estimates" && !viewingEstimate && (
                <button onClick={() => setShowAddEstimate(true)}
                  style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: "8px", padding: "8px 18px", cursor: "pointer", fontWeight: 700, fontSize: "14px" }}>
                  + Estimate
                </button>
              )}
              <button onClick={() => setDarkMode(!darkMode)}
                style={{ cursor: "pointer", background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "8px", padding: "8px 14px", color: theme.text, fontSize: "18px" }}>
                {darkMode ? "☀️" : "🌙"}
              </button>
            </div>
          </div>

          {/* ── DASHBOARD ── */}
          {activeTab === "Dashboard" && (
            <div style={{ display: "grid", gap: "28px" }}>

              {/* Stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
                {pipelineStats.map(stat => (
                  <div key={stat.label} style={{ background: theme.panel, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                    <div style={{ color: theme.subtext, fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>{stat.label}</div>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: stat.color, marginBottom: "16px" }}>{stat.amount}</div>
                    <div style={{ height: "6px", background: theme.panelSoft, borderRadius: "10px" }}>
                      <div style={{ width: stat.pct, height: "100%", background: stat.color, borderRadius: "10px" }} />
                    </div>
                  </div>
                ))}
                <div style={{ background: theme.panel, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                  <div style={{ color: theme.subtext, fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Active Projects</div>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: theme.accent, marginBottom: "8px" }}>{projects.filter(p => p.stage !== "Completed").length}</div>
                  <div style={{ fontSize: "12px", color: theme.subtext }}>{projects.filter(p => p.stage === "Completed").length} completed</div>
                </div>
                <div style={{ background: theme.panel, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                  <div style={{ color: theme.subtext, fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Total Collected</div>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: theme.success, marginBottom: "8px" }}>${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                  <div style={{ fontSize: "12px", color: theme.subtext }}>${(totalInvoiced - totalCollected).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} outstanding</div>
                </div>
              </div>

              {/* Recent Leads */}
              <div>
                <h3 style={{ marginBottom: "14px", fontWeight: 700, fontSize: "16px" }}>Recent Leads</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
                  {dashboardStages.map(stage => (
                    <div key={stage} style={{ background: theme.panelSoft, padding: "15px", borderRadius: "12px", minHeight: "150px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: theme.subtext, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {stage} ({leads.filter(l => l.stage === stage).length})
                      </div>
                      {leads.filter(l => l.stage === stage).slice(0, 3).map(lead => (
                        <div key={lead.id}
                          onClick={() => setDashboardPopup(lead)}
                          onMouseEnter={e => e.currentTarget.style.border = `1px solid ${theme.accent}`}
                          onMouseLeave={e => e.currentTarget.style.border = `1px solid ${theme.border}`}
                          style={{ background: theme.panel, padding: "12px", borderRadius: "8px", marginBottom: "8px", border: `1px solid ${theme.border}`, cursor: "pointer", transition: "border 0.15s" }}>
                          <div style={{ fontWeight: 700, fontSize: "14px" }}>{lead.name}</div>
                          <div style={{ color: theme.subtext, fontSize: "13px", marginTop: "4px" }}>${Number(lead.amount).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Estimates by Status */}
              <div style={{ background: theme.panel, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "20px" }}>Estimates by Status</div>
                {estimateStatusBars.map(s => (
                  <div key={s.label} style={{ marginBottom: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "130px", fontSize: "13px", color: theme.text, flexShrink: 0 }}>{s.label} ({s.count})</div>
                    <div style={{ flex: 1, height: "8px", background: theme.panelSoft, borderRadius: "10px" }}>
                      <div style={{ width: s.pct, height: "100%", background: s.color, borderRadius: "10px" }} />
                    </div>
                    <div style={{ width: "48px", fontSize: "12px", color: theme.subtext, textAlign: "right" }}>{s.pct}</div>
                  </div>
                ))}
              </div>

              {/* Recent Estimates */}
              <div style={{ background: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                <div style={{ padding: "18px 24px", fontWeight: 700, fontSize: "16px", borderBottom: `1px solid ${theme.border}` }}>Recent Estimates</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: theme.panelSoft, textAlign: "left" }}>
                    {["EST #", "TITLE", "CUSTOMER", "TOTAL", "STATUS"].map(h => <th key={h} style={{ padding: "12px 16px", fontSize: "12px", color: theme.subtext, fontWeight: 600 }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {estimates.slice(0, 5).map(e => {
                      const sc = statusColor(e.estimateStatus);
                      return (
                        <tr key={e.id} onClick={() => { setViewingEstimate(e); setActiveTab("Estimates"); }} style={{ borderTop: `1px solid ${theme.border}`, cursor: "pointer" }}>
                          <td style={{ padding: "14px 16px", fontSize: "14px" }}>{e.id}</td>
                          <td style={{ padding: "14px 16px", fontWeight: 600 }}>{e.title}</td>
                          <td style={{ padding: "14px 16px" }}>{e.customer}</td>
                          <td style={{ padding: "14px 16px", fontWeight: 700 }}>${Number(e.total).toLocaleString()}</td>
                          <td style={{ padding: "14px 16px" }}><span style={{ background: sc.bg, color: sc.text, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>{e.estimateStatus}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Active Projects */}
              {projects.length > 0 && (
                <div style={{ background: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                  <div style={{ padding: "18px 24px", fontWeight: 700, fontSize: "16px", borderBottom: `1px solid ${theme.border}` }}>Active Projects</div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={{ background: theme.panelSoft, textAlign: "left" }}>
                      {["Project", "Project #", "Stage", "Sell Price", "Gross Profit"].map(h => <th key={h} style={{ padding: "12px 16px", fontSize: "12px", color: theme.subtext, fontWeight: 600 }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {projects.filter(p => p.stage !== "Completed").slice(0, 5).map(p => {
                        const profit = (p.sellPrice || 0) - (p.estCost || 0);
                        const sc = { Bidding: { bg: "#fef3c7", text: "#92400e" }, Engineering: { bg: "#fee2e2", text: "#991b1b" }, Permitting: { bg: "#ede9fe", text: "#6d28d9" }, Unscheduled: { bg: "#f3f4f6", text: "#374151" }, Started: { bg: "#dbeafe", text: "#1d4ed8" }, Completed: { bg: "#dcfce7", text: "#16a34a" } }[p.stage] || {};
                        return (
                          <tr key={p.id} onClick={() => setActiveTab("Projects")} style={{ borderTop: `1px solid ${theme.border}`, cursor: "pointer" }}>
                            <td style={{ padding: "14px 16px", fontWeight: 700 }}>{p.name}</td>
                            <td style={{ padding: "14px 16px", fontSize: "13px", color: theme.subtext }}>{p.projectNumber}</td>
                            <td style={{ padding: "14px 16px" }}><span style={{ background: sc.bg, color: sc.text, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600 }}>{p.stage}</span></td>
                            <td style={{ padding: "14px 16px", fontWeight: 700 }}>${(p.sellPrice || 0).toLocaleString()}</td>
                            <td style={{ padding: "14px 16px", fontWeight: 700, color: profit >= 0 ? theme.success : theme.danger }}>${profit.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Recent Invoices */}
              <div style={{ background: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                <div style={{ padding: "18px 24px", fontWeight: 700, fontSize: "16px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between" }}>
                  <span>Recent Invoices</span>
                  <span style={{ fontSize: "13px", color: theme.subtext, fontWeight: 400 }}>{invoices.filter(i => i.paid < i.total).length} unpaid</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: theme.panelSoft, textAlign: "left" }}>
                    {["Invoice #", "Customer", "Total", "Balance", "Status"].map(h => <th key={h} style={{ padding: "12px 16px", fontSize: "12px", color: theme.subtext, fontWeight: 600 }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {invoices.slice(0, 4).map(inv => {
                      const balance = inv.total - inv.paid;
                      const sc = { Paid: { bg: "#dcfce7", text: "#16a34a" }, Draft: { bg: "#dbeafe", text: "#1d4ed8" }, Submitted: { bg: "#ede9fe", text: "#6d28d9" }, "On Hold": { bg: "#fef3c7", text: "#92400e" } }[inv.status] || {};
                      return (
                        <tr key={inv.id} onClick={() => setActiveTab("Invoices")} style={{ borderTop: `1px solid ${theme.border}`, cursor: "pointer" }}>
                          <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 700 }}>{inv.invoiceNumber}</td>
                          <td style={{ padding: "12px 16px", fontSize: "13px" }}>{inv.customer}</td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 700 }}>${inv.total.toLocaleString()}</td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 700, color: balance > 0 ? theme.danger : theme.success }}>${balance.toLocaleString()}</td>
                          <td style={{ padding: "12px 16px" }}><span style={{ background: sc.bg, color: sc.text, padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>{inv.status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ── LEADS ── */}
          {activeTab === "Leads" && (
            <LeadsBoard theme={theme} leads={leads} setLeads={setLeadsWithProjectSync} />
          )}

          {/* ── ESTIMATES ── */}
          {activeTab === "Estimates" && !viewingEstimate && (
            <div style={{ background: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: theme.panelSoft, textAlign: "left" }}>
                  <tr>{["EST #", "TITLE", "CUSTOMER", "TOTAL", "STATUS"].map(h => <th key={h} style={{ padding: "14px 16px", fontSize: "12px", color: theme.subtext, fontWeight: 600 }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {estimates.map(e => {
                    const sc = statusColor(e.estimateStatus);
                    return (
                      <tr key={e.id} onClick={() => setViewingEstimate(e)} style={{ borderTop: `1px solid ${theme.border}`, cursor: "pointer" }}>
                        <td style={{ padding: "16px" }}>{e.id}</td>
                        <td style={{ padding: "16px", fontWeight: 600 }}>{e.title}</td>
                        <td style={{ padding: "16px" }}>{e.customer}</td>
                        <td style={{ padding: "16px", fontWeight: 700 }}>${Number(e.total).toLocaleString()}</td>
                        <td style={{ padding: "16px" }}><span style={{ background: sc.bg, color: sc.text, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>{e.estimateStatus}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "Estimates" && viewingEstimate && (
            <EstimateEditor viewingEstimate={viewingEstimate} setViewingEstimate={setViewingEstimate} theme={theme} leads={leads} setLeads={setLeadsWithProjectSync} />
          )}

          {/* ── PROJECTS ── */}
          {activeTab === "Projects" && (
            <ProjectsPage theme={theme} projects={projects} setProjects={setProjects} leads={leads} />
          )}

          {/* ── INVOICES ── */}
          {activeTab === "Invoices" && (
            <InvoicesPage theme={theme} projects={projects} estimates={estimates} invoices={invoices} setInvoices={setInvoices} />
          )}

          {/* ── PAYMENTS ── */}
          {activeTab === "Payments" && (
            <PaymentsPage theme={theme} invoices={invoices} setInvoices={setInvoices} />
          )}

        </main>
      </div>

      {/* Add Estimate Modal */}
      {showAddEstimate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: theme.panel, borderRadius: "16px", padding: "28px", width: "460px", border: `1px solid ${theme.border}` }}>
            <h2 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: 700 }}>Add Estimate</h2>
            <div style={{ display: "grid", gap: "14px" }}>
              <div><label style={labelStyle}>Title *</label><input style={inputStyle} value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} placeholder="Estimate title" /></div>
              <div>
                <label style={labelStyle}>Link to Lead (optional)</label>
                <select style={inputStyle} value={addForm.leadId} onChange={e => setAddForm(f => ({ ...f, leadId: e.target.value }))}>
                  <option value="">— Select a lead or enter customer below —</option>
                  {leads.map(l => <option key={l.id} value={l.id}>{l.name} · {l.contact} · {l.stage}</option>)}
                </select>
              </div>
              {!addForm.leadId && (
                <div><label style={labelStyle}>Customer Name *</label><input style={inputStyle} value={addForm.customCustomer} onChange={e => setAddForm(f => ({ ...f, customCustomer: e.target.value }))} placeholder="Enter customer name" /></div>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={() => setShowAddEstimate(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: `1px solid ${theme.border}`, background: "none", color: theme.text, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={createEstimate} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: theme.accent, color: "#fff", cursor: "pointer", fontWeight: 700 }}>Create Estimate</button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Lead Popup */}
      {dashboardPopup && (
        <div onClick={() => setDashboardPopup(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: theme.panel, borderRadius: "16px", padding: "24px", width: "320px", border: `1px solid ${theme.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: theme.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "14px", color: theme.accent, flexShrink: 0 }}>
                  {(dashboardPopup.contact || dashboardPopup.name).slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "15px", color: theme.text }}>{dashboardPopup.contact || dashboardPopup.name}</div>
                  <div style={{ fontSize: "12px", color: theme.subtext, marginTop: "2px" }}>{dashboardPopup.name}</div>
                </div>
              </div>
              <button onClick={() => setDashboardPopup(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: theme.subtext, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: "grid", gap: "2px", marginBottom: "16px" }}>
              {[
                { label: "Amount", value: `$${Number(dashboardPopup.amount).toLocaleString()}`, color: theme.accent },
                { label: "Stage", value: dashboardPopup.stage },
                { label: "Deal Type", value: dashboardPopup.dealType },
                { label: "Close Date", value: dashboardPopup.closeDate || "—" },
                { label: "Assigned To", value: "Min Nguyen" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
                  <span style={{ fontSize: "13px", color: theme.subtext }}>{row.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: row.color || theme.text }}>{row.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { setDashboardPopup(null); setActiveTab("Leads"); }}
              style={{ width: "100%", background: theme.accent, color: "#fff", border: "none", borderRadius: "8px", padding: "10px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>
              View in Leads →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}