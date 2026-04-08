# Kilo Hollow Energy — Operations System

A full-stack contractor operations platform built for Kilo Hollow Energy, a Virginia-based residential and commercial solar, battery, and generator company. This system replicates and improves upon Contractor Foreman workflows, integrated with HubSpot CRM data.

Built as part of a Database Systems course (CMSC608) at Virginia Commonwealth University.

---

## Features

- **Leads** — HubSpot-style kanban board with 8 pipeline stages, drag & drop, deal type badges, column totals
- **Estimates** — Full estimate editor with line items, price book (real Greentech Renewables pricing), status pipeline, linked to leads
- **Projects** — Auto-created when a lead closes, with Summary, Financial, Documents, and Files tabs
- **Invoices** — Full invoice management with line items, payment posting, balance tracking
- **Payments** — Payment log with Received / Verified / In Review pipeline, linked to invoices
- **Dashboard** — Live stats pulling from all modules — Closed Won/Lost, active projects, recent estimates, invoices

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Styling | Inline JSX styles with dark mode support |
| Backend | Node.js + Express |
| Database | MySQL (in progress) |
| Version Control | Git + GitHub |

---

## Project Structure

```
kilohollow-os/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LeadsBoard.jsx
│   │   │   ├── EstimateEditor.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── InvoicesPage.jsx
│   │   │   └── PaymentsPage.jsx
│   │   └── App.jsx
│   └── package.json
├── backend/
│   └── server.js
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/blijminnetje/kilohollow-os.git
cd kilohollow-os

# Install frontend dependencies
cd frontend
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## Database Integration (In Progress)

The frontend currently uses hardcoded seed data. MySQL integration is planned with the following tables:

```sql
leads
estimates
estimate_items
projects
invoices
invoice_items
payments
vendors
price_book
```

Each React state array maps directly to a MySQL table. The backend will expose REST API endpoints that replace the hardcoded `useState` initial values.

---

## Team

- Minh Nguyen — VCU CMSC608

---

## Status

✅ Frontend complete  
🔄 MySQL backend in progress  
⬜ Deployment (Vercel + PlanetScale)