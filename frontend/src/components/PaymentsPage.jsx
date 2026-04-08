import { useState } from "react";

const PAYMENT_STAGES = ["Received", "Verified", "In Review"];

const STAGE_COLORS = {
  Received: { bg: "#dbeafe", text: "#1d4ed8" },
  Verified: { bg: "#dcfce7", text: "#16a34a" },
  "In Review": { bg: "#fef3c7", text: "#92400e" },
};

const PAYMENT_TYPES = ["Check", "ACH", "Credit Card", "Cash", "Wire Transfer", "Zelle"];

const fmt = (n) => "$" + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TYPE_ICONS = { Check: "🖊", ACH: "🏦", "Credit Card": "💳", Cash: "💵", "Wire Transfer": "🔁", Zelle: "⚡" };

export default function PaymentsPage({ theme, invoices: externalInvoices = [], setInvoices: setExternalInvoices }) {
  // Seed from invoice payments
  const seedPayments = () => {
    const all = [];
    externalInvoices.forEach(inv => {
      (inv.payments || []).forEach(p => {
        all.push({
          id: `${inv.id}-${p.id}`,
          date: p.date,
          customer: inv.customer,
          project: inv.projectName !== "-" ? inv.projectName : "-",
          invoiceNumber: inv.invoiceNumber,
          invoiceId: inv.id,
          invoiceTotal: inv.total,
          invoicePaid: inv.paid,
          amount: p.amount,
          type: p.type || "Check",
          status: p.status || "Received",
          notes: p.notes || "",
          reference: p.reference || "",
        });
      });
    });
    // Add some seed data if empty
    if (all.length === 0) {
      return [
        { id: "s1", date: "04/03/2026", customer: "Lyudmila Pankova", project: "-", invoiceNumber: "310-1", invoiceId: null, invoiceTotal: 9000, invoicePaid: 77.30, amount: 77.30, type: "ACH", status: "Received", notes: "", reference: "" },
        { id: "s2", date: "03/31/2026", customer: "Andrew Alvis", project: "-", invoiceNumber: "335-1", invoiceId: null, invoiceTotal: 8451.50, invoicePaid: 4225.75, amount: 4225.75, type: "ACH", status: "Received", notes: "", reference: "" },
        { id: "s3", date: "03/30/2026", customer: "Bonnie Owens", project: "Bonnie Owens", invoiceNumber: "345-1", invoiceId: null, invoiceTotal: 485, invoicePaid: 485, amount: 485, type: "Check", status: "Received", notes: "", reference: "" },
        { id: "s4", date: "03/24/2026", customer: "Donald Ritter", project: "-", invoiceNumber: "335", invoiceId: null, invoiceTotal: 879.32, invoicePaid: 879.32, amount: 879.32, type: "Credit Card", status: "Verified", notes: "", reference: "" },
        { id: "s5", date: "03/22/2026", customer: "Andrew Alvis", project: "-", invoiceNumber: "335-1", invoiceId: null, invoiceTotal: 8451.50, invoicePaid: 4225.75, amount: 4225.75, type: "ACH", status: "Verified", notes: "", reference: "" },
        { id: "s6", date: "03/19/2026", customer: "Owen Daly", project: "Owen Daly - Solar Lift + Reinstall", invoiceNumber: "333-1", invoiceId: null, invoiceTotal: 8750.01, invoicePaid: 4375, amount: 4375, type: "Credit Card", status: "Verified", notes: "M1 Payment (50%) - Visa *9303", reference: "" },
        { id: "s7", date: "03/16/2026", customer: "Mark Rolufs", project: "Rolufs - Powerwall 3", invoiceNumber: "330-1", invoiceId: null, invoiceTotal: 36750.50, invoicePaid: 3675, amount: 3675.05, type: "ACH", status: "Verified", notes: "", reference: "" },
        { id: "s8", date: "03/10/2026", customer: "Brian Flamm", project: "Brian Flamm", invoiceNumber: "320-1", invoiceId: null, invoiceTotal: 62871.95, invoicePaid: 6277.20, amount: 6277.20, type: "Credit Card", status: "Verified", notes: "", reference: "" },
      ];
    }
    return all;
  };

  const [payments, setPayments] = useState(seedPayments);
  const [viewing, setViewing] = useState(null);
  const [activeTab, setActiveTab] = useState("Details");
  const [filter, setFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("Today");
  const [search, setSearch] = useState("");
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [addForm, setAddForm] = useState({ date: new Date().toLocaleDateString(), amount: "", type: "Check", status: "Received", invoiceId: "", notes: "", reference: "" });

  const filtered = payments.filter(p => {
    const matchSearch = p.customer.toLowerCase().includes(search.toLowerCase()) || p.invoiceNumber.includes(search);
    const matchFilter = filter === "All" || p.status === filter;
    return matchSearch && matchFilter;
  });

  const totalReceived = payments.filter(p => p.status === "Received").reduce((s, p) => s + p.amount, 0);
  const toVerify = payments.filter(p => p.status === "Received");
  const recentPayments = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const byType = PAYMENT_TYPES.map(t => ({
    type: t,
    total: payments.filter(p => p.type === t).reduce((s, p) => s + p.amount, 0),
    count: payments.filter(p => p.type === t).length,
  })).filter(t => t.count > 0);

  const createPayment = () => {
    if (!addForm.amount) return;
    const inv = externalInvoices.find(i => i.id === Number(addForm.invoiceId));
    const newPayment = {
      id: Date.now(),
      date: addForm.date,
      customer: inv ? inv.customer : "Manual Entry",
      project: inv ? inv.projectName : "-",
      invoiceNumber: inv ? inv.invoiceNumber : "—",
      invoiceId: inv ? inv.id : null,
      invoiceTotal: inv ? inv.total : 0,
      invoicePaid: inv ? inv.paid + Number(addForm.amount) : Number(addForm.amount),
      amount: Number(addForm.amount),
      type: addForm.type,
      status: addForm.status,
      notes: addForm.notes,
      reference: addForm.reference,
    };
    setPayments(prev => [newPayment, ...prev]);
    // Also update the invoice if linked
    if (inv && setExternalInvoices) {
      setExternalInvoices(invs => invs.map(i => {
        if (i.id !== inv.id) return i;
        const newPaid = i.paid + Number(addForm.amount);
        return {
          ...i, paid: newPaid,
          status: newPaid >= i.total ? "Paid" : i.status,
          payments: [...i.payments, { id: Date.now(), date: addForm.date, type: addForm.type, notes: addForm.notes, amount: Number(addForm.amount), status: addForm.status }],
        };
      }));
    }
    setShowAddPayment(false);
    setAddForm({ date: new Date().toLocaleDateString(), amount: "", type: "Check", status: "Received", invoiceId: "", notes: "", reference: "" });
    setViewing(newPayment);
  };

  const changeStatus = (paymentId, status) => {
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status } : p));
    setViewing(v => ({ ...v, status }));
  };

  const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: "8px", border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: "14px", outline: "none" };
  const labelStyle = { fontSize: "12px", fontWeight: 600, color: theme.subtext, marginBottom: "4px", display: "block" };

  // ── PAYMENT DETAIL VIEW ──
  if (viewing) {
    const p = payments.find(x => x.id === viewing.id) || viewing;
    const stageIdx = PAYMENT_STAGES.indexOf(p.status);
    const balance = p.invoiceTotal - p.invoicePaid;

    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <button onClick={() => setViewing(null)}
          style={{ alignSelf: "flex-start", marginBottom: "16px", cursor: "pointer", background: "none", border: `1px solid ${theme.border}`, borderRadius: "8px", padding: "6px 14px", color: theme.text, fontSize: "14px", fontWeight: 600 }}>
          ← Back to Payments
        </button>

        {/* Header */}
        <div style={{ background: theme.panel, borderRadius: "16px 16px 0 0", border: `1px solid ${theme.border}`, borderBottom: "none", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: theme.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                💳
              </div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 800 }}>{p.customer}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <span style={{ fontSize: "13px", color: theme.subtext }}>{TYPE_ICONS[p.type]} {p.type}</span>
                  <span style={{ background: STAGE_COLORS[p.status]?.bg, color: STAGE_COLORS[p.status]?.text, padding: "2px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>{p.status}</span>
                </div>
              </div>
            </div>
            {/* Pipeline */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {PAYMENT_STAGES.map((s, i) => {
                const isActive = s === p.status;
                const isPast = stageIdx > i;
                const sc = STAGE_COLORS[s];
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center" }}>
                    <button onClick={() => changeStatus(p.id, s)}
                      style={{ padding: "6px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: 600, border: "none", background: isActive ? sc.bg : isPast ? "#f0fdf4" : theme.panelSoft, color: isActive ? sc.text : isPast ? "#16a34a" : theme.subtext, outline: isActive ? `2px solid ${sc.text}` : "none" }}>
                      {s}
                    </button>
                    {i < PAYMENT_STAGES.length - 1 && <div style={{ width: "20px", height: "2px", background: theme.border }} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "flex", border: `1px solid ${theme.border}`, borderRadius: "0 0 16px 16px", overflow: "hidden", background: theme.panel, minHeight: "400px" }}>
          {/* Sidebar */}
          <div style={{ width: "160px", borderRight: `1px solid ${theme.border}`, padding: "16px 0", flexShrink: 0, background: theme.panelSoft }}>
            {["Details", "Notes"].map(t => (
              <div key={t} onClick={() => setActiveTab(t)}
                style={{ padding: "12px 20px", cursor: "pointer", fontSize: "14px", fontWeight: activeTab === t ? 700 : 500, color: activeTab === t ? theme.accent : theme.text, background: activeTab === t ? theme.accentSoft : "transparent", borderLeft: activeTab === t ? `3px solid ${theme.accent}` : "3px solid transparent" }}>
                {t}
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
            {activeTab === "Details" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Details card */}
                <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "20px" }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "16px" }}>Details</div>
                  {[
                    { label: "Payment Date", value: p.date },
                    { label: "Amount", value: fmt(p.amount) },
                    { label: "Invoice #", value: `Inv. #${p.invoiceNumber} (${fmt(p.invoiceTotal)}) - ${p.customer}` },
                    { label: "Reference #", value: p.reference || "—" },
                    { label: "Payment Type", value: `${TYPE_ICONS[p.type] || ""} ${p.type}` },
                    { label: "Notes", value: p.notes || "—" },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${theme.border}`, gap: "12px" }}>
                      <span style={{ fontSize: "13px", color: theme.subtext, flexShrink: 0 }}>{row.label}</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, textAlign: "right" }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Invoice payment history */}
                <div>
                  <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div style={{ fontWeight: 700, fontSize: "15px" }}>Invoice Payment History</div>
                      <span style={{ background: balance <= 0 ? "#dcfce7" : "#fee2e2", color: balance <= 0 ? "#16a34a" : "#dc2626", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                        Balance Due: {fmt(Math.max(0, balance))}
                      </span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: theme.panelSoft }}>
                          {["Payment Date", "Type", "Note", "Amount", "Status"].map(h => (
                            <th key={h} style={{ padding: "8px 10px", fontSize: "11px", color: theme.subtext, fontWeight: 600, textAlign: "left" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderTop: `1px solid ${theme.border}` }}>
                          <td style={{ padding: "10px", fontSize: "12px" }}>📅 {p.date}</td>
                          <td style={{ padding: "10px", fontSize: "12px" }}>{TYPE_ICONS[p.type]}</td>
                          <td style={{ padding: "10px", fontSize: "12px", color: theme.subtext }}>{p.notes || "—"}</td>
                          <td style={{ padding: "10px", fontSize: "12px", fontWeight: 700 }}>{fmt(p.amount)}</td>
                          <td style={{ padding: "10px" }}>
                            <span style={{ background: STAGE_COLORS[p.status]?.bg, color: STAGE_COLORS[p.status]?.text, padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: 600 }}>{p.status}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Notes" && (
              <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "20px" }}>
                <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "10px" }}>Payment Notes</div>
                <textarea style={{ ...inputStyle, height: "200px", resize: "vertical", fontFamily: "inherit" }} defaultValue={p.notes} placeholder="Add notes..." />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: "12px", color: theme.subtext, marginTop: "12px" }}>
          Created: {p.date} · by Min Nguyen
        </div>
      </div>
    );
  }

  // ── PAYMENTS LIST VIEW ──
  return (
    <div style={{ display: "grid", gap: "24px" }}>

      {/* Top summary panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* Received Payments */}
        <div style={{ background: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontWeight: 700, fontSize: "15px" }}>Received Payments</div>
            <div style={{ display: "flex", gap: "6px" }}>
              {["Today", "This Week"].map(t => (
                <button key={t} onClick={() => setTimeFilter(t)}
                  style={{ padding: "5px 12px", borderRadius: "6px", border: `1px solid ${theme.border}`, cursor: "pointer", fontWeight: timeFilter === t ? 700 : 500, background: timeFilter === t ? theme.accentSoft : "none", color: timeFilter === t ? theme.accent : theme.text, fontSize: "12px" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: theme.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>💰</div>
            <div style={{ fontSize: "36px", fontWeight: 900, color: theme.accent }}>{fmt(totalReceived)}</div>
          </div>

          {/* Payments to Verify */}
          <div style={{ marginTop: "20px" }}>
            <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "10px" }}>Payments to Verify</div>
            {toVerify.length === 0 ? (
              <div style={{ color: theme.subtext, fontSize: "13px" }}>All caught up!</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ background: theme.panelSoft }}>
                  {["Date", "Invoice #", "Type", "Amount"].map(h => <th key={h} style={{ padding: "6px 10px", fontSize: "11px", color: theme.subtext, fontWeight: 600, textAlign: "left" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {toVerify.slice(0, 5).map(p => (
                    <tr key={p.id} style={{ borderTop: `1px solid ${theme.border}`, cursor: "pointer" }} onClick={() => setViewing(p)}>
                      <td style={{ padding: "8px 10px", fontSize: "12px" }}>📅 {p.date}</td>
                      <td style={{ padding: "8px 10px", fontSize: "12px" }}>{p.invoiceNumber}</td>
                      <td style={{ padding: "8px 10px", fontSize: "12px" }}>{TYPE_ICONS[p.type]}</td>
                      <td style={{ padding: "8px 10px", fontSize: "12px", fontWeight: 700 }}>{fmt(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Payments by Type + Recent */}
        <div style={{ display: "grid", gap: "16px" }}>
          <div style={{ background: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, padding: "20px" }}>
            <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "14px" }}>Payments by Type</div>
            {byType.length === 0 ? <div style={{ color: theme.subtext, fontSize: "13px" }}>No payments yet</div> :
              byType.map(t => (
                <div key={t.type} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${theme.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                    <span>{TYPE_ICONS[t.type]}</span> {t.type}
                    <span style={{ fontSize: "11px", color: theme.subtext }}>({t.count})</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700 }}>{fmt(t.total)}</span>
                </div>
              ))
            }
          </div>

          <div style={{ background: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, padding: "20px" }}>
            <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "14px" }}>Recent Payments</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: theme.panelSoft }}>
                {["Date", "Invoice #", "Amount"].map(h => <th key={h} style={{ padding: "6px 10px", fontSize: "11px", color: theme.subtext, fontWeight: 600, textAlign: "left" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {recentPayments.map(p => (
                  <tr key={p.id} style={{ borderTop: `1px solid ${theme.border}`, cursor: "pointer" }} onClick={() => setViewing(p)}>
                    <td style={{ padding: "8px 10px", fontSize: "12px" }}>📅 {p.date}</td>
                    <td style={{ padding: "8px 10px", fontSize: "12px" }}>{p.invoiceNumber}</td>
                    <td style={{ padding: "8px 10px", fontSize: "12px", fontWeight: 700 }}>{fmt(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <input placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px 12px 8px 32px", borderRadius: "8px", border: `1px solid ${theme.border}`, background: theme.panel, color: theme.text, fontSize: "14px", outline: "none" }} />
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: theme.subtext }}>🔍</span>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {["Received", "Review", "Verified", "All"].map(f => (
            <button key={f} onClick={() => setFilter(f === "Review" ? "In Review" : f)}
              style={{ padding: "8px 14px", borderRadius: "8px", border: `1px solid ${theme.border}`, cursor: "pointer", fontWeight: (filter === f || (f === "Review" && filter === "In Review")) ? 700 : 500, background: (filter === f || (f === "Review" && filter === "In Review")) ? theme.accent : theme.panel, color: (filter === f || (f === "Review" && filter === "In Review")) ? "#fff" : theme.text, fontSize: "13px" }}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAddPayment(true)}
          style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: "8px", padding: "9px 18px", cursor: "pointer", fontWeight: 700, fontSize: "14px" }}>
          + Payment
        </button>
      </div>

      {/* Payments table */}
      <div style={{ background: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: theme.panelSoft, textAlign: "left" }}>
              {["Date", "Customer", "Project", "Invoice #", "Amount", "Type", "Status"].map(h => (
                <th key={h} style={{ padding: "12px 14px", fontSize: "11px", color: theme.subtext, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: theme.subtext }}>No payments found</td></tr>
            ) : filtered.map(p => {
              const sc = STAGE_COLORS[p.status] || {};
              return (
                <tr key={p.id} onClick={() => setViewing(p)}
                  style={{ borderTop: `1px solid ${theme.border}`, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.panelSoft}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "13px 14px", fontSize: "13px" }}>📅 {p.date}</td>
                  <td style={{ padding: "13px 14px", fontSize: "13px", fontWeight: 600 }}>{p.customer}</td>
                  <td style={{ padding: "13px 14px", fontSize: "13px", color: theme.subtext }}>{p.project}</td>
                  <td style={{ padding: "13px 14px", fontSize: "13px" }}>Inv #{p.invoiceNumber}</td>
                  <td style={{ padding: "13px 14px", fontSize: "13px", fontWeight: 700 }}>{fmt(p.amount)}</td>
                  <td style={{ padding: "13px 14px", fontSize: "18px" }}>{TYPE_ICONS[p.type] || p.type}</td>
                  <td style={{ padding: "13px 14px" }}>
                    <span style={{ background: sc.bg, color: sc.text, padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>{p.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Payment Modal */}
      {showAddPayment && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: theme.panel, borderRadius: "16px", padding: "28px", width: "500px", border: `1px solid ${theme.border}` }}>
            <h2 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: 700 }}>Add Payment</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Payment Date *</label>
                <input type="date" style={inputStyle} value={addForm.date} onChange={e => setAddForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Amount *</label>
                <input type="number" style={inputStyle} value={addForm.amount} onChange={e => setAddForm(f => ({ ...f, amount: e.target.value }))} placeholder="$0.00" />
              </div>
              <div>
                <label style={labelStyle}>Payment Type *</label>
                <select style={inputStyle} value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}>
                  {PAYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Payment Status *</label>
                <select style={inputStyle} value={addForm.status} onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))}>
                  {PAYMENT_STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Invoice # (select unpaid invoice)</label>
                <select style={inputStyle} value={addForm.invoiceId} onChange={e => setAddForm(f => ({ ...f, invoiceId: e.target.value }))}>
                  <option value="">— Manual entry (no invoice) —</option>
                  {externalInvoices.filter(i => i.paid < i.total).map(i => (
                    <option key={i.id} value={i.id}>Inv. #{i.invoiceNumber} — {i.customer} — Balance: {fmt(i.total - i.paid)}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Payment Notes</label>
                <textarea style={{ ...inputStyle, height: "80px", resize: "vertical", fontFamily: "inherit" }} value={addForm.notes} onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. M1 Payment (50%) - Visa *9303" />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Reference #</label>
                <input style={inputStyle} value={addForm.reference} onChange={e => setAddForm(f => ({ ...f, reference: e.target.value }))} placeholder="Check #, ACH ref, etc." />
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={() => setShowAddPayment(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: `1px solid ${theme.border}`, background: "none", color: theme.text, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={createPayment} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: theme.accent, color: "#fff", cursor: "pointer", fontWeight: 700 }}>Create Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
