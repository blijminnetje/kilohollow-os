import { useState } from "react";

const INVOICE_STAGES = ["Draft", "On Hold", "Paid", "Submitted"];

const STAGE_COLORS = {
  Draft: { bg: "#dbeafe", text: "#1d4ed8" },
  "On Hold": { bg: "#fef3c7", text: "#92400e" },
  Paid: { bg: "#dcfce7", text: "#16a34a" },
  Submitted: { bg: "#ede9fe", text: "#6d28d9" },
};

const PAYMENT_TYPES = ["Check", "ACH", "Credit Card", "Cash", "Wire Transfer", "Zelle"];

const fmt = (n) => "$" + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const initialInvoices = [
  {
    id: 1, invoiceNumber: "345-1", projectName: "Bonnie Owens", projectId: 101,
    customer: "Bonnie Owens", invoiceDate: "03/30/2026", dueDate: "03/30/2026",
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
    customer: "Ballard Marine Construction", invoiceDate: "03/29/2026", dueDate: "03/30/2026",
    total: 7692.50, paid: 0, status: "Draft",
    description: "", terms: "Full-payment is due within 30 days of receiving this invoice unless other terms have been agreed upon.",
    items: [], payments: [],
  },
  {
    id: 4, invoiceNumber: "330-1", projectName: "Rolufs - Powerwall 3", projectId: 102,
    customer: "Mark Rolufs", invoiceDate: "03/16/2026", dueDate: "03/16/2026",
    total: 36750.50, paid: 3675, status: "Submitted",
    description: "Powerwall 3 installation - deposit invoice.",
    terms: "Full-payment is due within 30 days of receiving this invoice unless other terms have been agreed upon.",
    items: [{ id: 1, type: "Material", name: "Powerwall 3 Installation", costCode: "-", qty: 1, unitCost: 36750.50, unit: "Project" }],
    payments: [{ id: 1, date: "03/16/2026", type: "Check", notes: "-", amount: 3675, status: "Received" }],
  },
];

export default function InvoicesPage({ theme, projects, estimates, invoices, setInvoices }) {
  const [viewing, setViewing] = useState(null);
  const [activeTab, setActiveTab] = useState("Details");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [showPostPayment, setShowPostPayment] = useState(false);
  const [addForm, setAddForm] = useState({ projectId: "", customer: "", invoiceDate: new Date().toLocaleDateString(), dueDate: "", terms: "Net 30", invNumber: "" });
  const [paymentForm, setPaymentForm] = useState({ date: new Date().toLocaleDateString(), amount: "", type: "Check", status: "Received", notes: "", reference: "" });

  const tabs = ["Details", "Items", "Terms", "Payments", "Notes"];

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.customer.toLowerCase().includes(search.toLowerCase()) || inv.invoiceNumber.includes(search);
    const matchFilter = filter === "All" || (filter === "Unpaid" && inv.paid < inv.total) || (filter === "Paid" && inv.paid >= inv.total);
    return matchSearch && matchFilter;
  });

  const statusCounts = ["Paid", "Draft", "Submitted", "On Hold"].map(s => ({
    status: s,
    count: invoices.filter(i => i.status === s).length,
    amount: invoices.filter(i => i.status === s).reduce((sum, i) => sum + i.total, 0),
  }));

  const recentPayments = invoices.flatMap(inv => inv.payments.map(p => ({ ...p, invoiceNumber: inv.invoiceNumber, customer: inv.customer }))).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const createInvoice = () => {
    const proj = projects?.find(p => p.id === Number(addForm.projectId));
    const newInv = {
      id: Date.now(),
      invoiceNumber: addForm.invNumber || `INV-${invoices.length + 1}`,
      projectName: proj ? proj.name : "-",
      projectId: proj ? proj.id : null,
      customer: addForm.customer || (proj ? proj.name : ""),
      invoiceDate: addForm.invoiceDate,
      dueDate: addForm.dueDate,
      total: proj ? proj.sellPrice : 0,
      paid: 0,
      status: "Draft",
      description: "",
      terms: "Full-payment is due within 30 days of receiving this invoice unless other terms have been agreed upon.",
      items: proj && estimates ? (estimates.find(e => e.leadId === proj.leadId)?.items || []).map((item, i) => ({
        id: i + 1, type: item.costType, name: item.description, costCode: item.sku || "-", qty: item.qty, unitCost: item.unitCost, unit: "Each"
      })) : [],
      payments: [],
    };
    setInvoices(prev => [newInv, ...prev]);
    setShowAddInvoice(false);
    setAddForm({ projectId: "", customer: "", invoiceDate: new Date().toLocaleDateString(), dueDate: "", terms: "Net 30", invNumber: "" });
    setViewing(newInv);
    setActiveTab("Details");
  };

  const postPayment = () => {
    if (!paymentForm.amount) return;
    const amount = Number(paymentForm.amount);
    const newPayment = { id: Date.now(), date: paymentForm.date, type: paymentForm.type, notes: paymentForm.notes, amount, status: paymentForm.status, reference: paymentForm.reference };
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== viewing.id) return inv;
      const newPaid = inv.paid + amount;
      const newStatus = newPaid >= inv.total ? "Paid" : inv.status;
      return { ...inv, paid: newPaid, status: newStatus, payments: [...inv.payments, newPayment] };
    }));
    setViewing(v => {
      const newPaid = v.paid + amount;
      return { ...v, paid: newPaid, status: newPaid >= v.total ? "Paid" : v.status, payments: [...v.payments, newPayment] };
    });
    setShowPostPayment(false);
    setPaymentForm({ date: new Date().toLocaleDateString(), amount: "", type: "Check", status: "Received", notes: "", reference: "" });
  };

  const changeStatus = (invId, status) => {
    setInvoices(prev => prev.map(i => i.id === invId ? { ...i, status } : i));
    setViewing(v => ({ ...v, status }));
  };

  const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: "8px", border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: "14px", outline: "none" };
  const labelStyle = { fontSize: "12px", fontWeight: 600, color: theme.subtext, marginBottom: "4px", display: "block" };

  // ── INVOICE DETAIL VIEW ──
  if (viewing) {
    const inv = invoices.find(i => i.id === viewing.id) || viewing;
    const balance = inv.total - inv.paid;
    const stageIdx = INVOICE_STAGES.indexOf(inv.status);

    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <button onClick={() => setViewing(null)}
          style={{ alignSelf: "flex-start", marginBottom: "16px", cursor: "pointer", background: "none", border: `1px solid ${theme.border}`, borderRadius: "8px", padding: "6px 14px", color: theme.text, fontSize: "14px", fontWeight: 600 }}>
          ← Back to Invoices
        </button>

        {/* Header */}
        <div style={{ background: theme.panel, borderRadius: "16px 16px 0 0", border: `1px solid ${theme.border}`, borderBottom: "none", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: theme.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "14px", color: theme.accent }}>
                {inv.customer.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 800 }}>{inv.customer}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <span style={{ background: STAGE_COLORS[inv.status]?.bg, color: STAGE_COLORS[inv.status]?.text, padding: "2px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>{inv.status}</span>
                  {balance > 0 && <span style={{ background: "#fee2e2", color: "#dc2626", padding: "2px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>Past Due</span>}
                  <span style={{ color: theme.subtext, fontSize: "13px" }}>Inv. #{inv.invoiceNumber}</span>
                </div>
              </div>
            </div>
            {/* Pipeline */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {INVOICE_STAGES.map((s, i) => {
                const isActive = s === inv.status;
                const isPast = stageIdx > i;
                const sc = STAGE_COLORS[s];
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center" }}>
                    <button onClick={() => changeStatus(inv.id, s)}
                      style={{ padding: "6px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: 600, border: "none", background: isActive ? sc.bg : isPast ? "#f0fdf4" : theme.panelSoft, color: isActive ? sc.text : isPast ? "#16a34a" : theme.subtext, outline: isActive ? `2px solid ${sc.text}` : "none" }}>
                      {s}
                    </button>
                    {i < INVOICE_STAGES.length - 1 && <div style={{ width: "20px", height: "2px", background: theme.border }} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "flex", border: `1px solid ${theme.border}`, borderRadius: "0 0 16px 16px", overflow: "hidden", background: theme.panel, minHeight: "500px" }}>
          {/* Sidebar */}
          <div style={{ width: "160px", borderRight: `1px solid ${theme.border}`, padding: "16px 0", flexShrink: 0, background: theme.panelSoft }}>
            {tabs.map(t => (
              <div key={t} onClick={() => setActiveTab(t)}
                style={{ padding: "12px 20px", cursor: "pointer", fontSize: "14px", fontWeight: activeTab === t ? 700 : 500, color: activeTab === t ? theme.accent : theme.text, background: activeTab === t ? theme.accentSoft : "transparent", borderLeft: activeTab === t ? `3px solid ${theme.accent}` : "3px solid transparent" }}>
                {t}
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>

            {/* DETAILS */}
            {activeTab === "Details" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div>
                  <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                    <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
                      Details
                      <span style={{ background: STAGE_COLORS[inv.status]?.bg, color: STAGE_COLORS[inv.status]?.text, padding: "3px 10px", borderRadius: "20px", fontSize: "12px" }}>{inv.status}</span>
                    </div>
                    {[
                      { label: "Invoice Date", value: inv.invoiceDate },
                      { label: "Due Date", value: inv.dueDate },
                      { label: "Project", value: inv.projectName },
                      { label: "Invoiced To", value: inv.customer },
                      { label: "Approved By", value: inv.customer },
                    ].map(row => (
                      <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
                        <span style={{ fontSize: "13px", color: theme.subtext }}>{row.label}</span>
                        <span style={{ fontSize: "13px", fontWeight: 600 }}>{row.value || "—"}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "20px" }}>
                    <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "10px" }}>Description</div>
                    <textarea
                      style={{ ...inputStyle, height: "160px", resize: "vertical", fontFamily: "inherit" }}
                      value={inv.description}
                      onChange={e => { setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, description: e.target.value } : i)); setViewing(v => ({ ...v, description: e.target.value })); }}
                      placeholder="Enter invoice description..."
                    />
                    <div style={{ fontSize: "11px", color: theme.subtext, marginTop: "4px", textAlign: "right" }}>
                      Words: {inv.description?.trim().split(/\s+/).filter(Boolean).length || 0}
                    </div>
                  </div>
                </div>
                <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "20px", alignSelf: "start" }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "16px" }}>Terms</div>
                  {[
                    { label: "Due Date", value: inv.dueDate },
                    { label: "Terms", value: "Net 30" },
                    { label: "Period Start/End", value: "—" },
                    { label: "Retainage %", value: "0%" },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
                      <span style={{ fontSize: "13px", color: theme.subtext }}>{row.label}</span>
                      <span style={{ fontSize: "13px", fontWeight: 600 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ITEMS */}
            {activeTab === "Items" && (
              <div style={{ display: "grid", gap: "20px" }}>
                {/* Total bar */}
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ background: "#dcfce7", color: "#16a34a", padding: "8px 16px", borderRadius: "8px", fontWeight: 700, fontSize: "14px" }}>Total: {fmt(inv.total)}</div>
                  <span style={{ color: theme.subtext }}>—</span>
                  <div style={{ background: "#fee2e2", color: "#dc2626", padding: "8px 16px", borderRadius: "8px", fontWeight: 700, fontSize: "14px" }}>Paid: {fmt(inv.paid)}</div>
                  <span style={{ color: theme.subtext }}>=</span>
                  <div style={{ background: theme.panelSoft, color: theme.text, padding: "8px 16px", borderRadius: "8px", fontWeight: 700, fontSize: "14px", border: `1px solid ${theme.border}` }}>Balance: {fmt(balance)}</div>
                </div>

                {/* Items table */}
                <div style={{ background: theme.panel, borderRadius: "12px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", fontWeight: 700, fontSize: "14px", background: theme.panelSoft, borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between" }}>
                    <span>Estimate Items — {inv.projectName}</span>
                    <span style={{ color: theme.accent }}>{fmt(inv.total)}</span>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: theme.panelSoft }}>
                        {["Type", "Item Name", "Cost Code", "QTY", "Unit Cost", "Unit", "Total"].map(h => (
                          <th key={h} style={{ padding: "10px 14px", fontSize: "11px", color: theme.subtext, fontWeight: 600, textAlign: "left" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {inv.items.length === 0 ? (
                        <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: theme.subtext }}>No items — add manually or import from estimate</td></tr>
                      ) : inv.items.map(item => (
                        <tr key={item.id} style={{ borderTop: `1px solid ${theme.border}` }}>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ fontSize: "11px", background: theme.accentSoft, color: theme.accent, padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>{item.type}</span>
                          </td>
                          <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 500 }}>{item.name}</td>
                          <td style={{ padding: "12px 14px", fontSize: "12px", color: theme.subtext }}>{item.costCode}</td>
                          <td style={{ padding: "12px 14px", fontSize: "13px" }}>{item.qty}</td>
                          <td style={{ padding: "12px 14px", fontSize: "13px" }}>{fmt(item.unitCost)}</td>
                          <td style={{ padding: "12px 14px", fontSize: "13px", color: theme.subtext }}>{item.unit}</td>
                          <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 700 }}>{fmt(item.qty * item.unitCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tax / Total summary */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ width: "320px", background: theme.panelSoft, borderRadius: "12px", padding: "20px" }}>
                    <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "12px" }}>Tax / Amount</div>
                    {[
                      { label: "Sub Total", value: fmt(inv.total), color: theme.success },
                      { label: "Tax (0%)", value: "$0.00", color: theme.success },
                    ].map(row => (
                      <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                        <span style={{ fontSize: "13px", color: theme.subtext }}>{row.label}</span>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: row.color }}>{row.value}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: `2px solid ${theme.border}`, margin: "10px 0", paddingTop: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700 }}>Total</span>
                        <span style={{ fontSize: "14px", fontWeight: 800, color: theme.accent }}>{fmt(inv.total)}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                      <span style={{ fontSize: "13px", color: theme.subtext }}>Payment</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: theme.danger }}>-{fmt(inv.paid)}</span>
                    </div>
                    <div style={{ borderTop: `2px solid ${theme.border}`, margin: "10px 0", paddingTop: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700 }}>Balance Due</span>
                        <span style={{ fontSize: "14px", fontWeight: 800, color: balance > 0 ? theme.danger : theme.success }}>{fmt(balance)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TERMS */}
            {activeTab === "Terms" && (
              <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "20px" }}>
                <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>Terms and Conditions</div>
                <div style={{ fontSize: "12px", color: theme.subtext, marginBottom: "16px" }}>The multiple Terms fields have been consolidated into one easy-to-use Terms field.</div>
                <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                  <span>Terms</span>
                  <span style={{ fontSize: "12px", color: theme.accent, cursor: "pointer" }}>Default Terms ▾</span>
                </div>
                <textarea
                  style={{ ...inputStyle, height: "160px", resize: "vertical", fontFamily: "inherit" }}
                  value={inv.terms}
                  onChange={e => { setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, terms: e.target.value } : i)); setViewing(v => ({ ...v, terms: e.target.value })); }}
                />
                <div style={{ fontSize: "11px", color: theme.subtext, marginTop: "4px", textAlign: "right" }}>
                  Words: {inv.terms?.trim().split(/\s+/).filter(Boolean).length || 0} · Characters: {inv.terms?.length || 0}
                </div>
              </div>
            )}

            {/* PAYMENTS */}
            {activeTab === "Payments" && (
              <div style={{ display: "grid", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: "16px" }}>Payment History</div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span style={{ background: balance <= 0 ? "#dcfce7" : "#fee2e2", color: balance <= 0 ? "#16a34a" : "#dc2626", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>
                      Balance Due: {fmt(balance)}
                    </span>
                    {balance > 0 && (
                      <button onClick={() => { setPaymentForm(f => ({ ...f, amount: balance.toFixed(2) })); setShowPostPayment(true); }}
                        style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>
                        + Post Payment
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ background: theme.panel, borderRadius: "12px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: theme.panelSoft }}>
                        {["Payment Date", "Type", "Notes", "Amount", "Status"].map(h => (
                          <th key={h} style={{ padding: "10px 16px", fontSize: "11px", color: theme.subtext, fontWeight: 600, textAlign: "left" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {inv.payments.length === 0 ? (
                        <tr><td colSpan={5} style={{ padding: "32px", textAlign: "center", color: theme.subtext }}>No payments yet</td></tr>
                      ) : inv.payments.map(p => (
                        <tr key={p.id} style={{ borderTop: `1px solid ${theme.border}` }}>
                          <td style={{ padding: "12px 16px", fontSize: "13px" }}>📅 {p.date}</td>
                          <td style={{ padding: "12px 16px", fontSize: "13px" }}>{p.type}</td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", color: theme.subtext }}>{p.notes || "—"}</td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 700 }}>{fmt(p.amount)}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>{p.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* NOTES */}
            {activeTab === "Notes" && (
              <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "20px" }}>
                <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "10px" }}>Invoice Notes</div>
                <textarea style={{ ...inputStyle, height: "200px", resize: "vertical", fontFamily: "inherit" }} placeholder="Add internal notes..." />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
          <div style={{ fontSize: "12px", color: theme.subtext }}>Created: {inv.invoiceDate} · by Minh Nguyen</div>
          <div style={{ display: "flex", gap: "10px" }}>
            {balance > 0 && (
              <button onClick={() => { setPaymentForm(f => ({ ...f, amount: balance.toFixed(2) })); setShowPostPayment(true); setActiveTab("Payments"); }}
                style={{ background: theme.success, color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontWeight: 700 }}>
                💳 Post Payment
              </button>
            )}
            <button style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontWeight: 700 }}>
              ✈ Submit to Client
            </button>
          </div>
        </div>

        {/* Post Payment Modal */}
        {showPostPayment && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: theme.panel, borderRadius: "16px", padding: "28px", width: "500px", border: `1px solid ${theme.border}` }}>
              <h2 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: 700 }}>Post Payment to Invoice</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Payment Date *</label>
                  <input type="date" style={inputStyle} value={paymentForm.date} onChange={e => setPaymentForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Amount *</label>
                  <input type="number" style={inputStyle} value={paymentForm.amount} onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Payment Type *</label>
                  <select style={inputStyle} value={paymentForm.type} onChange={e => setPaymentForm(f => ({ ...f, type: e.target.value }))}>
                    {PAYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Approval Status *</label>
                  <select style={inputStyle} value={paymentForm.status} onChange={e => setPaymentForm(f => ({ ...f, status: e.target.value }))}>
                    {["Received", "Verified", "In Review"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={labelStyle}>Payment Notes</label>
                  <textarea style={{ ...inputStyle, height: "80px", resize: "vertical", fontFamily: "inherit" }} value={paymentForm.notes} onChange={e => setPaymentForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={labelStyle}>Reference #</label>
                  <input style={inputStyle} value={paymentForm.reference} onChange={e => setPaymentForm(f => ({ ...f, reference: e.target.value }))} placeholder="Check #, ACH ref, etc." />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                <button onClick={() => setShowPostPayment(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: `1px solid ${theme.border}`, background: "none", color: theme.text, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                <button onClick={postPayment} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: theme.accent, color: "#fff", cursor: "pointer", fontWeight: 700 }}>Apply Payment</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── INVOICE LIST VIEW ──
  return (
    <div style={{ display: "grid", gap: "24px" }}>

      {/* Top summary panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>

        {/* Invoices by Status */}
        <div style={{ background: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", fontWeight: 700, fontSize: "15px", borderBottom: `1px solid ${theme.border}` }}>Invoices by Status</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: theme.panelSoft }}>
              {["Status", "#", "Amount"].map(h => <th key={h} style={{ padding: "8px 14px", fontSize: "11px", color: theme.subtext, fontWeight: 600, textAlign: "left" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {statusCounts.map(s => (
                <tr key={s.status} style={{ borderTop: `1px solid ${theme.border}` }}>
                  <td style={{ padding: "10px 14px", fontSize: "13px", fontWeight: 600 }}>{s.status}</td>
                  <td style={{ padding: "10px 14px", fontSize: "13px" }}>{s.count}</td>
                  <td style={{ padding: "10px 14px", fontSize: "13px", fontWeight: 700 }}>{fmt(s.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Payments */}
        <div style={{ background: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", fontWeight: 700, fontSize: "15px", borderBottom: `1px solid ${theme.border}` }}>Recent Payments</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: theme.panelSoft }}>
              {["Date", "Invoice #", "Amount"].map(h => <th key={h} style={{ padding: "8px 14px", fontSize: "11px", color: theme.subtext, fontWeight: 600, textAlign: "left" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {recentPayments.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: "20px", textAlign: "center", color: theme.subtext, fontSize: "12px" }}>No payments yet</td></tr>
              ) : recentPayments.map((p, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${theme.border}` }}>
                  <td style={{ padding: "10px 14px", fontSize: "12px" }}>📅 {p.date}</td>
                  <td style={{ padding: "10px 14px", fontSize: "12px" }}>{p.invoiceNumber}</td>
                  <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 700 }}>{fmt(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoices Coming Due */}
        <div style={{ background: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", fontWeight: 700, fontSize: "15px", borderBottom: `1px solid ${theme.border}` }}>Invoices Coming Due</div>
          {invoices.filter(i => i.paid < i.total).length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: theme.subtext, fontSize: "13px" }}>No invoices coming due</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: theme.panelSoft }}>
                {["Due", "Invoice #", "Amount", "Balance"].map(h => <th key={h} style={{ padding: "8px 14px", fontSize: "11px", color: theme.subtext, fontWeight: 600, textAlign: "left" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {invoices.filter(i => i.paid < i.total).slice(0, 4).map(inv => (
                  <tr key={inv.id} style={{ borderTop: `1px solid ${theme.border}` }}>
                    <td style={{ padding: "10px 14px", fontSize: "12px" }}>{inv.dueDate}</td>
                    <td style={{ padding: "10px 14px", fontSize: "12px" }}>{inv.invoiceNumber}</td>
                    <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 700 }}>{fmt(inv.total)}</td>
                    <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 700, color: theme.danger }}>{fmt(inv.total - inv.paid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <input placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px 12px 8px 32px", borderRadius: "8px", border: `1px solid ${theme.border}`, background: theme.panel, color: theme.text, fontSize: "14px", outline: "none" }} />
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: theme.subtext }}>🔍</span>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {["Unpaid", "Paid", "All"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${theme.border}`, cursor: "pointer", fontWeight: filter === f ? 700 : 500, background: filter === f ? theme.accent : theme.panel, color: filter === f ? "#fff" : theme.text, fontSize: "13px" }}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAddInvoice(true)}
          style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: "8px", padding: "9px 18px", cursor: "pointer", fontWeight: 700, fontSize: "14px" }}>
          + Invoice
        </button>
      </div>

      {/* Invoice table */}
      <div style={{ background: theme.panel, borderRadius: "16px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: theme.panelSoft, textAlign: "left" }}>
              {["Invoice #", "Project", "Customer", "Invoice Date", "Due Date", "Total", "Balance", "Status"].map(h => (
                <th key={h} style={{ padding: "12px 14px", fontSize: "11px", color: theme.subtext, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => {
              const balance = inv.total - inv.paid;
              const sc = STAGE_COLORS[inv.status] || {};
              return (
                <tr key={inv.id} onClick={() => { setViewing(inv); setActiveTab("Details"); }}
                  style={{ borderTop: `1px solid ${theme.border}`, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.panelSoft}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "14px", fontSize: "13px", fontWeight: 700 }}>{inv.invoiceNumber}</td>
                  <td style={{ padding: "14px", fontSize: "13px" }}>{inv.projectName}</td>
                  <td style={{ padding: "14px", fontSize: "13px" }}>{inv.customer}</td>
                  <td style={{ padding: "14px", fontSize: "13px" }}>📅 {inv.invoiceDate}</td>
                  <td style={{ padding: "14px", fontSize: "13px" }}>📅 {inv.dueDate}</td>
                  <td style={{ padding: "14px", fontSize: "13px", fontWeight: 700 }}>{fmt(inv.total)}</td>
                  <td style={{ padding: "14px", fontSize: "13px", fontWeight: 700, color: balance > 0 ? theme.danger : theme.success }}>{fmt(balance)}</td>
                  <td style={{ padding: "14px" }}>
                    <span style={{ background: sc.bg, color: sc.text, padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>{inv.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Invoice Modal */}
      {showAddInvoice && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: theme.panel, borderRadius: "16px", padding: "28px", width: "480px", border: `1px solid ${theme.border}` }}>
            <h2 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: 700 }}>Add Invoice</h2>
            <div style={{ display: "grid", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Project (optional)</label>
                <select style={inputStyle} value={addForm.projectId} onChange={e => {
                  const proj = projects?.find(p => p.id === Number(e.target.value));
                  setAddForm(f => ({ ...f, projectId: e.target.value, customer: proj ? proj.name : f.customer }));
                }}>
                  <option value="">— No project —</option>
                  {(projects || []).map(p => <option key={p.id} value={p.id}>{p.name} · {p.projectNumber}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Customer *</label>
                <input style={inputStyle} value={addForm.customer} onChange={e => setAddForm(f => ({ ...f, customer: e.target.value }))} placeholder="Customer name" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Invoice Date *</label>
                  <input type="date" style={inputStyle} value={addForm.invoiceDate} onChange={e => setAddForm(f => ({ ...f, invoiceDate: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Due Date</label>
                  <input type="date" style={inputStyle} value={addForm.dueDate} onChange={e => setAddForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Terms</label>
                  <select style={inputStyle} value={addForm.terms} onChange={e => setAddForm(f => ({ ...f, terms: e.target.value }))}>
                    {["Net 30", "Net 15", "Net 60", "Due on Receipt"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Invoice # *</label>
                  <input style={inputStyle} value={addForm.invNumber} onChange={e => setAddForm(f => ({ ...f, invNumber: e.target.value }))} placeholder="e.g. 358-1" />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={() => setShowAddInvoice(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: `1px solid ${theme.border}`, background: "none", color: theme.text, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={createInvoice} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: theme.accent, color: "#fff", cursor: "pointer", fontWeight: 700 }}>Create Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}