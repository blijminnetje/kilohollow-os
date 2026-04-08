import { useState } from "react";

const ESTIMATE_STAGES = ["On Hold", "Estimating", "Pending Approval", "Approved", "Completed"];

const LEAD_STATUS_MAP = {
  "Estimating": "Estimating",
  "Pending Approval": "Proposal Sent",
  "Approved": "Closed Won",
  "Completed": "Closed Won",
  "On Hold": "On Hold",
};

const COST_TYPES = ["Material", "Labor", "Equipment", "Subcontractor", "Other"];

const COST_COLORS = {
  Material: "#f59e0b",
  Labor: "#3b82f6",
  Equipment: "#06b6d4",
  Subcontractor: "#22c55e",
  Other: "#6366f1",
};

const PRICE_BOOK = {
  Material: [
    { id: "pb1", name: "MAXEON SPR-MAX3-410-BLK Solar Panel 410W", sku: "SPR-MAX3-410-BLK-R-DC25-US", unit: "Each", unitCost: 254.20 },
    { id: "pb2", name: "TESLA 7.6KW String Inverter w/ Site Controller", sku: "1538000-45-X", unit: "Each", unitCost: 2073.17 },
    { id: "pb3", name: "TESLA MCI/RSD Gen 2 15A", sku: "1879359-15-X", unit: "Each", unitCost: 45.00 },
    { id: "pb4", name: "IRIDG Rail XR100 Med 14ft Black", sku: "XR-100-168B", unit: "Each", unitCost: 60.39 },
    { id: "pb5", name: "IRIDG XR100 Splice Bar Bonded", sku: "XR100-BOSS-01-M1", unit: "Each", unitCost: 7.25 },
    { id: "pb6", name: "IRIDG UFO Clamp Black Bulk (Universal Module Clamp)", sku: "UFO-CL-01-B1", unit: "Each", unitCost: 3.35 },
    { id: "pb7", name: "IRIDG End Clamp 30-40MM Black", sku: "UFO-END-01-B1", unit: "Each", unitCost: 4.53 },
    { id: "pb8", name: "IRIDG Grounding Lug Low Profile", sku: "XR-LUG-04-A1", unit: "Each", unitCost: 7.00 },
    { id: "pb9", name: "IRIDG SimpleGrip Base Mount Mill", sku: "QM-SG-BASE-01-M1", unit: "Each", unitCost: 10.97 },
    { id: "pb10", name: "IRIDG SimpleGrip Base Mount Adhesive Bottom", sku: "QM-SG-ADH-B01-M1", unit: "Each", unitCost: 5.36 },
    { id: "pb11", name: "IRIDG SimpleGrip Base Mount Adhesive Top", sku: "QM-SG-ADH-T01-M1", unit: "Each", unitCost: 5.36 },
    { id: "pb12", name: "IRIDG Deck Screw #15 3.0L Mill", sku: "HW-DS1530-01-M1", unit: "Each", unitCost: 1.05 },
    { id: "pb13", name: "IRIDG L-Foot GF1 Black", sku: "QM-GF1-LFT-01-B1", unit: "Each", unitCost: 4.57 },
    { id: "pb14", name: "IRIDG Square-Bolt Bonding Hardware", sku: "BHW-SQ-03-A1", unit: "Each", unitCost: 1.93 },
    { id: "pb15", name: "PV Wire #10 Black 2000V CU (per ft)", sku: "2KVPV10STRBLK500", unit: "Each", unitCost: 0.59 },
    { id: "pb16", name: "PV Wire #10 Red 2000V CU (per ft)", sku: "2KVPV10STRRED500", unit: "Each", unitCost: 0.59 },
    { id: "pb17", name: "200A EATON Breaker", sku: "EATON-200A", unit: "Each", unitCost: 160.00 },
    { id: "pb18", name: "AMPS 415W Black Mono PERC Solar Panel", sku: "AMPS-415W", unit: "Each", unitCost: 185.00 },
    { id: "pb19", name: "Backup Switch Kit", sku: "BACKUP-SW", unit: "Each", unitCost: 326.92 },
    { id: "pb20", name: "BB-3 Three Terminal Bus Bar (1 Pos/1 Neg)", sku: "BB3-BUS", unit: "Each", unitCost: 224.00 },
    { id: "pb21", name: "Breaker (General)", sku: "BREAKER-GEN", unit: "Each", unitCost: 140.00 },
    { id: "pb22", name: "Chemlink Sealant Clear", sku: "CHEMLINK-CLR", unit: "Each", unitCost: 6.78 },
    { id: "pb23", name: "Conduit", sku: "CONDUIT", unit: "Each", unitCost: 180.00 },
    { id: "pb24", name: "Disconnect", sku: "DISCONNECT", unit: "Each", unitCost: 300.00 },
    { id: "pb25", name: "Discover AES 48-48-5120-H Heated Rackmount Battery", sku: "AES-5120-H", unit: "Each", unitCost: 1800.00 },
    { id: "pb26", name: "DISCOVER 950-0053 AES Rackmount ESS 30KWH Slimline", sku: "AES-30KWH", unit: "Each", unitCost: 1990.00 },
    { id: "pb27", name: "EATON BR215", sku: "EATON-BR215", unit: "Each", unitCost: 18.50 },
    { id: "pb28", name: "EATON BR220", sku: "EATON-BR220", unit: "Each", unitCost: 18.50 },
    { id: "pb29", name: "EATON DG222NRB", sku: "EATON-DG222", unit: "Each", unitCost: 120.96 },
    { id: "pb30", name: "EATON DG223NRB", sku: "EATON-DG223", unit: "Each", unitCost: 163.29 },
    { id: "pb31", name: "EATON DG224NRK", sku: "EATON-DG224", unit: "Each", unitCost: 268.00 },
    { id: "pb32", name: "Drywall & Insulate Estimated 12x14 Space", sku: "DRYWALL-12X14", unit: "Project", unitCost: 450.00 },
    { id: "pb33", name: "Electrical Material - Powerwall", sku: "ELEC-MAT-PW", unit: "Project", unitCost: 2500.00 },
    { id: "pb34", name: "Electrical Material (General)", sku: "ELEC-MAT-GEN", unit: "Project", unitCost: 3000.00 },
    { id: "pb35", name: "Electrical from Solar Array to Sol-Arks", sku: "ELEC-SOLAR-SOLARKS", unit: "Each", unitCost: 301.00 },
  ],
  Labor: [
    { id: "lb1", name: "Solar Installation Labor", sku: "LABOR-SOLAR", unit: "Hour", unitCost: 110.00 },
    { id: "lb2", name: "Electrical Labor", sku: "LABOR-ELEC", unit: "Hour", unitCost: 110.00 },
    { id: "lb3", name: "Battery Storage Installation Labor", sku: "LABOR-BATTERY", unit: "Hour", unitCost: 110.00 },
    { id: "lb4", name: "Roof Work Labor", sku: "LABOR-ROOF", unit: "Hour", unitCost: 110.00 },
    { id: "lb5", name: "General Labor", sku: "LABOR-GEN", unit: "Hour", unitCost: 110.00 },
    { id: "lb6", name: "Project Management", sku: "LABOR-PM", unit: "Project", unitCost: 110.00 },
  ],
  Equipment: [
    { id: "eq1", name: "Lift/Crane Rental", sku: "EQUIP-LIFT", unit: "Day", unitCost: 500.00 },
    { id: "eq2", name: "Safety Equipment", sku: "EQUIP-SAFETY", unit: "Project", unitCost: 250.00 },
    { id: "eq3", name: "Tool Rental", sku: "EQUIP-TOOL", unit: "Day", unitCost: 150.00 },
  ],
  Subcontractor: [
    { id: "sc1", name: "Electrical Subcontractor", sku: "SUB-ELEC", unit: "Project", unitCost: 0.00 },
    { id: "sc2", name: "Roofing Subcontractor", sku: "SUB-ROOF", unit: "Project", unitCost: 0.00 },
    { id: "sc3", name: "Inspection / Permit Service", sku: "SUB-PERMIT", unit: "Project", unitCost: 0.00 },
  ],
  Other: [
    { id: "ot1", name: "Permit Fee", sku: "OTHER-PERMIT", unit: "Each", unitCost: 0.00 },
    { id: "ot2", name: "Freight / Shipping", sku: "OTHER-FREIGHT", unit: "Project", unitCost: 0.00 },
    { id: "ot3", name: "Miscellaneous", sku: "OTHER-MISC", unit: "Each", unitCost: 0.00 },
  ],
};

const fmt = (n) => "$" + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const statusColors = {
  "On Hold": { bg: "#fef3c7", text: "#92400e" },
  "Estimating": { bg: "#dbeafe", text: "#1d4ed8" },
  "Pending Approval": { bg: "#ede9fe", text: "#6d28d9" },
  "Approved": { bg: "#dcfce7", text: "#16a34a" },
  "Completed": { bg: "#f0fdf4", text: "#15803d" },
};

export default function EstimateEditor({ viewingEstimate, setViewingEstimate, theme, leads, setLeads }) {
  const [activeSection, setActiveSection] = useState("Details");
  const [status, setStatus] = useState(viewingEstimate.estimateStatus || "Estimating");
  const [items, setItems] = useState(viewingEstimate.items || []);
  const [terms, setTerms] = useState(viewingEstimate.terms || "Please review the following terms and estimate due-date prior to work beginning.");
  const [inclusions, setInclusions] = useState(viewingEstimate.inclusions || "");
  const [exclusions, setExclusions] = useState(viewingEstimate.exclusions || "");
  const [scopeSummary, setScopeSummary] = useState(viewingEstimate.scopeSummary || "");
  const [scopeItems, setScopeItems] = useState(viewingEstimate.scopeItems || []);
  const [newScopeItem, setNewScopeItem] = useState("");
  const [expiration, setExpiration] = useState(viewingEstimate.expiration || "");
  const [projectType, setProjectType] = useState(viewingEstimate.projectType || "");
  const [notes, setNotes] = useState(viewingEstimate.notes || "");
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showManual, setShowManual] = useState(false);

  // Picker state
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState("Material");
  const [pickerSearch, setPickerSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  // pickerOverrides: { [itemId]: { qty, price, markup } }
  const [pickerOverrides, setPickerOverrides] = useState({});

  // Manual item form
  const [newItem, setNewItem] = useState({ description: "", costType: "Material", qty: 1, unitCost: 0, markup: 0 });

  const totalCost = items.reduce((s, i) => s + i.qty * i.unitCost, 0);
  const totalMarkup = items.reduce((s, i) => s + (i.qty * i.unitCost * i.markup / 100), 0);
  const totalPrice = totalCost + totalMarkup;

  const costByType = COST_TYPES.reduce((acc, t) => {
    acc[t] = items.filter(i => i.costType === t).reduce((s, i) => s + i.qty * i.unitCost, 0);
    return acc;
  }, {});

  const addManualItem = () => {
    if (!newItem.description.trim()) return;
    setItems(prev => [...prev, { ...newItem, id: Date.now(), qty: Number(newItem.qty), unitCost: Number(newItem.unitCost), markup: Number(newItem.markup) }]);
    setNewItem({ description: "", costType: "Material", qty: 1, unitCost: 0, markup: 0 });
    setShowManual(false);
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const togglePickerItem = (item) => {
    setSelectedItems(prev =>
      prev.find(s => s.id === item.id)
        ? prev.filter(s => s.id !== item.id)
        : [...prev, item]
    );
    // Init overrides with catalog price when first selecting
    setPickerOverrides(o => ({
      ...o,
      [item.id]: o[item.id] || { qty: 1, price: item.unitCost, markup: 0 }
    }));
  };

  const updateOverride = (itemId, field, value) => {
    setPickerOverrides(o => ({ ...o, [itemId]: { ...o[itemId], [field]: value } }));
  };

  const importSelected = () => {
    const toAdd = selectedItems.map(item => {
      const ov = pickerOverrides[item.id] || {};
      return {
        id: Date.now() + Math.random(),
        description: item.name,
        costType: pickerTab,
        qty: Number(ov.qty || 1),
        unitCost: Number(ov.price ?? item.unitCost),
        markup: Number(ov.markup || 0),
        sku: item.sku,
      };
    });
    setItems(prev => [...prev, ...toAdd]);
    setSelectedItems([]);
    setPickerOverrides({});
    setShowPicker(false);
  };

  const changeStatus = (newStatus) => {
    setStatus(newStatus);
    const leadStage = LEAD_STATUS_MAP[newStatus];
    if (leadStage && viewingEstimate.leadId) {
      setLeads(ls => ls.map(l =>
        l.id === viewingEstimate.leadId
          ? { ...l, stage: leadStage, amount: totalPrice || l.amount }
          : l
      ));
    }
  };

  const handleSubmit = () => {
    changeStatus("Pending Approval");
    setShowSubmitConfirm(false);
  };

  const filteredItems = (PRICE_BOOK[pickerTab] || []).filter(i =>
    i.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
    i.sku.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  const inputStyle = {
    width: "100%", padding: "8px 10px", borderRadius: "8px",
    border: `1px solid ${theme.border}`, background: theme.bg,
    color: theme.text, fontSize: "14px", outline: "none",
  };
  const labelStyle = { fontSize: "12px", fontWeight: 600, color: theme.subtext, marginBottom: "4px", display: "block" };
  const smallInput = { padding: "4px 6px", borderRadius: "6px", border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: "13px", outline: "none" };

  const sections = ["Details", "Items", "Terms", "Scope of Work", "Notes"];

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* Back */}
      <button onClick={() => setViewingEstimate(null)}
        style={{ alignSelf: "flex-start", marginBottom: "16px", cursor: "pointer", background: "none", border: `1px solid ${theme.border}`, borderRadius: "8px", padding: "6px 14px", color: theme.text, fontSize: "14px", fontWeight: 600 }}>
        ← Back to Estimates
      </button>

      {/* Header */}
      <div style={{ background: theme.panel, borderRadius: "16px 16px 0 0", border: `1px solid ${theme.border}`, borderBottom: "none", padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800 }}>{viewingEstimate.title}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
              <span style={{ background: statusColors[status]?.bg, color: statusColors[status]?.text, padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>{status}</span>
              <span style={{ color: theme.subtext, fontSize: "13px" }}>EST. #{viewingEstimate.id}</span>
              <span style={{ color: theme.subtext, fontSize: "13px" }}>· {viewingEstimate.customer}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
            {ESTIMATE_STAGES.map((s, i) => {
              const isActive = s === status;
              const isPast = ESTIMATE_STAGES.indexOf(status) > i;
              const sc = statusColors[s];
              return (
                <div key={s} style={{ display: "flex", alignItems: "center" }}>
                  <button onClick={() => changeStatus(s)}
                    style={{ padding: "6px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: 600, border: "none", background: isActive ? sc.bg : isPast ? "#f0fdf4" : theme.panelSoft, color: isActive ? sc.text : isPast ? "#16a34a" : theme.subtext, outline: isActive ? `2px solid ${sc.text}` : "none" }}>
                    {s}
                  </button>
                  {i < ESTIMATE_STAGES.length - 1 && <div style={{ width: "16px", height: "2px", background: theme.border, margin: "0 2px" }} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", border: `1px solid ${theme.border}`, borderRadius: "0 0 16px 16px", overflow: "hidden", background: theme.panel, minHeight: "500px" }}>

        {/* Sidebar */}
        <div style={{ width: "180px", borderRight: `1px solid ${theme.border}`, padding: "16px 0", flexShrink: 0, background: theme.panelSoft }}>
          {sections.map(s => (
            <div key={s} onClick={() => setActiveSection(s)}
              style={{ padding: "12px 20px", cursor: "pointer", fontSize: "14px", fontWeight: activeSection === s ? 700 : 500, color: activeSection === s ? theme.accent : theme.text, background: activeSection === s ? theme.accentSoft : "transparent", borderLeft: activeSection === s ? `3px solid ${theme.accent}` : "3px solid transparent" }}>
              {s}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>

          {/* DETAILS */}
          {activeSection === "Details" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div style={{ display: "grid", gap: "16px" }}>
                <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "20px" }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "16px" }}>Details</div>
                  <div style={{ display: "grid", gap: "12px" }}>
                    <div><label style={labelStyle}>Customer</label><div style={{ fontSize: "14px", fontWeight: 600, color: theme.accent }}>{viewingEstimate.customer}</div></div>
                    <div><label style={labelStyle}>Estimate Date</label><div style={{ fontSize: "14px" }}>{new Date().toLocaleDateString()}</div></div>
                    <div><label style={labelStyle}>Expiration Date</label><input type="date" style={inputStyle} value={expiration} onChange={e => setExpiration(e.target.value)} /></div>
                    <div>
                      <label style={labelStyle}>Project Type</label>
                      <select style={inputStyle} value={projectType} onChange={e => setProjectType(e.target.value)}>
                        <option value="">Select Type</option>
                        {["Roof Solar", "Roof Solar + Storage", "Storage", "Service", "SPAN + Storage"].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "20px" }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "12px" }}>Assignees</div>
                  {["Project Manager", "Estimator", "Sales Rep"].map(r => (
                    <div key={r} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", color: theme.subtext }}>{r}</span>
                      <span style={{ fontSize: "13px", fontWeight: 600 }}>Minh Nguyen</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gap: "16px", alignContent: "start" }}>
                <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "20px" }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "12px" }}>Financials</div>
                  {[
                    { label: "Total Cost", value: fmt(totalCost) },
                    { label: "Total Markup", value: fmt(totalMarkup) },
                    { label: "Total Price", value: fmt(totalPrice), bold: true },
                    { label: "Profit", value: fmt(totalMarkup), color: theme.success },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: `1px solid ${theme.border}`, marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", color: theme.subtext }}>{row.label}</span>
                      <span style={{ fontSize: "13px", fontWeight: row.bold ? 800 : 600, color: row.color || theme.text }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "20px" }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "8px" }}>Vendor</div>
                  <div style={{ fontSize: "13px", color: theme.subtext }}>Greentech Renewables Virginia</div>
                  <div style={{ fontSize: "12px", color: theme.subtext, marginTop: "4px" }}>4273 Carolina Ave, Richmond VA 23222</div>
                  <div style={{ fontSize: "12px", color: theme.subtext }}>(804) 767-1360 · Contact: Kordell Burgess</div>
                </div>
              </div>
            </div>
          )}

          {/* ITEMS */}
          {activeSection === "Items" && (
            <div style={{ display: "grid", gap: "20px" }}>

              {/* Summary bar */}
              <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "12px" }}>
                  Estimate Financial Summary
                  <span style={{ float: "right", color: theme.accent, fontWeight: 800 }}>Total: {fmt(totalPrice)}</span>
                </div>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  {COST_TYPES.map(t => {
                    const val = costByType[t];
                    const pct = totalCost > 0 ? Math.round((val / totalCost) * 100) : 0;
                    return (
                      <div key={t} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                        <div style={{ width: "32px", height: "8px", borderRadius: "4px", background: COST_COLORS[t] }} />
                        {t} ({pct}%)
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => { setShowPicker(true); setPickerTab("Material"); setPickerSearch(""); setSelectedItems([]); setPickerOverrides({}); }}
                  style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: "8px", padding: "9px 18px", cursor: "pointer", fontWeight: 700, fontSize: "14px" }}>
                  📦 Add from Price Book
                </button>
                <button onClick={() => setShowManual(m => !m)}
                  style={{ background: "none", border: `1px solid ${theme.border}`, borderRadius: "8px", padding: "9px 18px", cursor: "pointer", fontWeight: 600, fontSize: "14px", color: theme.text }}>
                  + Add Manual Item
                </button>
              </div>

              {/* Manual form */}
              {showManual && (
                <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "16px" }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "12px" }}>Manual Line Item</div>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto", gap: "8px", alignItems: "end" }}>
                    <div><label style={labelStyle}>Description</label><input style={inputStyle} value={newItem.description} onChange={e => setNewItem(f => ({ ...f, description: e.target.value }))} placeholder="Item description" /></div>
                    <div><label style={labelStyle}>Type</label><select style={inputStyle} value={newItem.costType} onChange={e => setNewItem(f => ({ ...f, costType: e.target.value }))}>{COST_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                    <div><label style={labelStyle}>Qty</label><input type="number" style={inputStyle} value={newItem.qty} onChange={e => setNewItem(f => ({ ...f, qty: e.target.value }))} /></div>
                    <div><label style={labelStyle}>Unit Cost ($)</label><input type="number" style={inputStyle} value={newItem.unitCost} onChange={e => setNewItem(f => ({ ...f, unitCost: e.target.value }))} /></div>
                    <div><label style={labelStyle}>Markup %</label><input type="number" style={inputStyle} value={newItem.markup} onChange={e => setNewItem(f => ({ ...f, markup: e.target.value }))} /></div>
                    <button onClick={addManualItem} style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: "8px", padding: "9px 16px", cursor: "pointer", fontWeight: 700 }}>+ Add</button>
                  </div>
                </div>
              )}

              {/* Items table */}
              <div style={{ background: theme.panel, borderRadius: "12px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: theme.panelSoft }}>
                      {["Description", "SKU", "Type", "Qty", "Unit Cost", "Markup %", "Total", ""].map(h => (
                        <th key={h} style={{ padding: "10px 12px", fontSize: "11px", color: theme.subtext, fontWeight: 600, textAlign: "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: theme.subtext }}>No items yet — click "Add from Price Book" to get started</td></tr>
                    ) : items.map(item => {
                      const lineTotal = item.qty * item.unitCost * (1 + item.markup / 100);
                      return (
                        <tr key={item.id} style={{ borderTop: `1px solid ${theme.border}` }}>
                          <td style={{ padding: "10px 12px", fontSize: "13px" }}>{item.description}</td>
                          <td style={{ padding: "10px 12px", fontSize: "11px", color: theme.subtext }}>{item.sku || "—"}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ background: COST_COLORS[item.costType] + "22", color: COST_COLORS[item.costType], padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 }}>{item.costType}</span>
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: "13px" }}>{item.qty}</td>
                          <td style={{ padding: "10px 12px", fontSize: "13px" }}>{fmt(item.unitCost)}</td>
                          <td style={{ padding: "10px 12px", fontSize: "13px" }}>{item.markup}%</td>
                          <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 700 }}>{fmt(lineTotal)}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: theme.danger, fontSize: "16px" }}>🗑</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {items.length > 0 && (
                    <tfoot>
                      <tr style={{ borderTop: `2px solid ${theme.border}`, background: theme.panelSoft }}>
                        <td colSpan={6} style={{ padding: "12px", fontWeight: 700, fontSize: "13px" }}>Total</td>
                        <td style={{ padding: "12px", fontWeight: 800, fontSize: "15px", color: theme.accent }}>{fmt(totalPrice)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* TERMS */}
          {activeSection === "Terms" && (
            <div style={{ display: "grid", gap: "20px" }}>
              {[
                { label: "Terms", value: terms, setter: setTerms },
                { label: "Inclusions", value: inclusions, setter: setInclusions },
                { label: "Exclusions", value: exclusions, setter: setExclusions },
              ].map(field => (
                <div key={field.label} style={{ background: theme.panelSoft, borderRadius: "12px", padding: "16px" }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "10px" }}>{field.label}</div>
                  <textarea style={{ ...inputStyle, height: "120px", resize: "vertical", fontFamily: "inherit" }} value={field.value} onChange={e => field.setter(e.target.value)} placeholder={`Start typing ${field.label.toLowerCase()}...`} />
                  <div style={{ fontSize: "11px", color: theme.subtext, marginTop: "4px", textAlign: "right" }}>
                    Words: {field.value.trim() ? field.value.trim().split(/\s+/).length : 0} · Characters: {field.value.length}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SCOPE OF WORK */}
          {activeSection === "Scope of Work" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "10px" }}>Summary</div>
                <textarea style={{ ...inputStyle, height: "200px", resize: "vertical", fontFamily: "inherit" }} value={scopeSummary} onChange={e => setScopeSummary(e.target.value)} placeholder="Start typing..." />
                <div style={{ fontSize: "11px", color: theme.subtext, marginTop: "4px", textAlign: "right" }}>Characters: {scopeSummary.length} / 2000</div>
              </div>
              <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "10px" }}>Scope Items (checked items show on PDF)</div>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <input style={inputStyle} value={newScopeItem} onChange={e => setNewScopeItem(e.target.value)} placeholder="Add scope item..." />
                  <button onClick={() => { if (newScopeItem.trim()) { setScopeItems(s => [...s, { id: Date.now(), text: newScopeItem, checked: false }]); setNewScopeItem(""); } }}
                    style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontWeight: 700 }}>+</button>
                </div>
                {scopeItems.map(si => (
                  <div key={si.id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <input type="checkbox" checked={si.checked} onChange={() => setScopeItems(s => s.map(x => x.id === si.id ? { ...x, checked: !x.checked } : x))} />
                    <span style={{ fontSize: "13px" }}>{si.text}</span>
                    <button onClick={() => setScopeItems(s => s.filter(x => x.id !== si.id))} style={{ background: "none", border: "none", cursor: "pointer", color: theme.danger, marginLeft: "auto" }}>×</button>
                  </div>
                ))}
                {scopeItems.length === 0 && <div style={{ color: theme.subtext, fontSize: "13px" }}>No scope items yet</div>}
              </div>
            </div>
          )}

          {/* NOTES */}
          {activeSection === "Notes" && (
            <div style={{ background: theme.panelSoft, borderRadius: "12px", padding: "16px" }}>
              <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "10px" }}>Notes</div>
              <textarea style={{ ...inputStyle, height: "200px", resize: "vertical", fontFamily: "inherit" }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add internal notes..." />
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "16px 0" }}>
        <div style={{ fontSize: "12px", color: theme.subtext }}>Created: {new Date().toLocaleDateString()} · by Minh Nguyen</div>
        <div style={{ display: "flex", gap: "10px" }}>
          {status === "Approved" && (
            <button onClick={() => changeStatus("Completed")} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontWeight: 700 }}>Mark Completed</button>
          )}
          {status !== "Approved" && status !== "Completed" && (
            <>
              <button onClick={() => changeStatus("On Hold")} style={{ background: "none", border: `1px solid ${theme.border}`, borderRadius: "8px", padding: "10px 20px", cursor: "pointer", color: theme.text, fontWeight: 600 }}>Put On Hold</button>
              <button onClick={() => setShowSubmitConfirm(true)} style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontWeight: 700 }}>Review & Submit →</button>
            </>
          )}
          {status === "Pending Approval" && (
            <>
              <button onClick={() => changeStatus("Approved")} style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontWeight: 700 }}>✓ Mark Approved</button>
              <button onClick={() => {
                changeStatus("On Hold");
                if (viewingEstimate.leadId) setLeads(ls => ls.map(l => l.id === viewingEstimate.leadId ? { ...l, stage: "Closed Lost" } : l));
              }} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontWeight: 700 }}>✗ Mark Rejected</button>
            </>
          )}
        </div>
      </div>

      {/* Submit confirm */}
      {showSubmitConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: theme.panel, borderRadius: "16px", padding: "28px", width: "380px", border: `1px solid ${theme.border}` }}>
            <h2 style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: 700 }}>Submit Estimate?</h2>
            <p style={{ color: theme.subtext, fontSize: "14px", marginBottom: "20px" }}>
              This will send the estimate to <strong>{viewingEstimate.customer}</strong> and move the lead to <strong>Proposal Sent</strong>.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowSubmitConfirm(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: `1px solid ${theme.border}`, background: "none", color: theme.text, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={handleSubmit} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: theme.accent, color: "#fff", cursor: "pointer", fontWeight: 700 }}>Submit Estimate</button>
            </div>
          </div>
        </div>
      )}

      {/* PRICE BOOK PICKER */}
      {showPicker && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: theme.panel, borderRadius: "16px", width: "960px", maxWidth: "95vw", height: "82vh", display: "flex", flexDirection: "column", border: `1px solid ${theme.border}`, overflow: "hidden" }}>

            {/* Modal header */}
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "18px" }}>Select Items</div>
              <button onClick={() => setShowPicker(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: theme.subtext }}>×</button>
            </div>

            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

              {/* Category tabs */}
              <div style={{ width: "150px", borderRight: `1px solid ${theme.border}`, padding: "16px 0", background: theme.panelSoft, flexShrink: 0 }}>
                {COST_TYPES.map(t => (
                  <div key={t} onClick={() => { setPickerTab(t); setPickerSearch(""); setSelectedItems([]); setPickerOverrides({}); }}
                    style={{ padding: "12px 16px", cursor: "pointer", fontSize: "14px", fontWeight: pickerTab === t ? 700 : 500, color: pickerTab === t ? theme.accent : theme.text, background: pickerTab === t ? theme.accentSoft : "transparent", borderLeft: pickerTab === t ? `3px solid ${theme.accent}` : "3px solid transparent" }}>
                    {t}
                  </div>
                ))}
              </div>

              {/* Item list */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${theme.border}` }}>
                  <input
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: "14px", outline: "none" }}
                    placeholder={`Search ${pickerTab}...`}
                    value={pickerSearch}
                    onChange={e => setPickerSearch(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1, overflowY: "auto" }}>
                  {filteredItems.map(item => {
                    const isSelected = !!selectedItems.find(s => s.id === item.id);
                    const ov = pickerOverrides[item.id] || { qty: 1, price: item.unitCost, markup: 0 };
                    return (
                      <div key={item.id} onClick={() => togglePickerItem(item)}
                        style={{ padding: "12px 16px", borderBottom: `1px solid ${theme.border}`, cursor: "pointer", background: isSelected ? theme.accentSoft : "transparent", display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "14px", fontWeight: isSelected ? 700 : 500, color: isSelected ? theme.accent : theme.text }}>{item.name}</div>
                          <div style={{ fontSize: "11px", color: theme.subtext, marginTop: "2px" }}>{item.sku} · per {item.unit}</div>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: theme.text, whiteSpace: "nowrap" }}>{fmt(item.unitCost)}/{item.unit}</div>

                        {/* Qty / Price / Markup inputs — only when selected */}
                        {isSelected && (
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                              <span style={{ fontSize: "10px", color: theme.subtext }}>Qty</span>
                              <input type="number" min="1"
                                style={{ ...smallInput, width: "55px" }}
                                value={ov.qty}
                                onChange={e => updateOverride(item.id, "qty", e.target.value)}
                              />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                              <span style={{ fontSize: "10px", color: theme.subtext }}>Price ($)</span>
                              <input type="number" min="0"
                                style={{ ...smallInput, width: "75px" }}
                                value={ov.price}
                                onChange={e => updateOverride(item.id, "price", e.target.value)}
                              />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                              <span style={{ fontSize: "10px", color: theme.subtext }}>MU%</span>
                              <input type="number" min="0"
                                style={{ ...smallInput, width: "55px" }}
                                value={ov.markup}
                                onChange={e => updateOverride(item.id, "markup", e.target.value)}
                              />
                            </div>
                          </div>
                        )}

                        <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: `2px solid ${isSelected ? theme.accent : theme.border}`, background: isSelected ? theme.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {isSelected && <span style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Currently selected panel */}
              <div style={{ width: "220px", borderLeft: `1px solid ${theme.border}`, padding: "16px", background: theme.panelSoft, display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "12px" }}>Currently Selected</div>
                {selectedItems.length === 0 ? (
                  <div style={{ fontSize: "12px", color: theme.subtext }}>Selected items will appear here</div>
                ) : (
                  <div style={{ flex: 1, overflowY: "auto", display: "grid", gap: "8px" }}>
                    {selectedItems.map(item => {
                      const ov = pickerOverrides[item.id] || { qty: 1, price: item.unitCost, markup: 0 };
                      const lineTotal = Number(ov.qty || 1) * Number(ov.price ?? item.unitCost) * (1 + Number(ov.markup || 0) / 100);
                      return (
                        <div key={item.id} style={{ background: theme.panel, borderRadius: "8px", padding: "8px 10px", border: `1px solid ${theme.border}` }}>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: theme.accent }}>{item.name}</div>
                          <div style={{ fontSize: "11px", color: theme.subtext, marginTop: "4px" }}>
                            Qty: {ov.qty || 1} · @{fmt(ov.price ?? item.unitCost)}
                          </div>
                          <div style={{ fontSize: "12px", fontWeight: 700, color: theme.text, marginTop: "2px" }}>
                            = {fmt(lineTotal)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${theme.border}`, fontSize: "13px", fontWeight: 700, color: theme.accent }}>
                  Subtotal: {fmt(selectedItems.reduce((s, item) => {
                    const ov = pickerOverrides[item.id] || { qty: 1, price: item.unitCost, markup: 0 };
                    return s + Number(ov.qty || 1) * Number(ov.price ?? item.unitCost) * (1 + Number(ov.markup || 0) / 100);
                  }, 0))}
                </div>
                <button onClick={importSelected} disabled={selectedItems.length === 0}
                  style={{ marginTop: "12px", background: selectedItems.length > 0 ? theme.accent : theme.border, color: "#fff", border: "none", borderRadius: "8px", padding: "12px", cursor: selectedItems.length > 0 ? "pointer" : "not-allowed", fontWeight: 700, fontSize: "14px" }}>
                  Import ({selectedItems.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}