<<<<<<< HEAD
# Hackathon
=======
# Smart Personal Finance Tracker

AI-powered expense analysis and budget recommendations.
Built with Flask + React (Vite) — single deployment.

## Setup

### 1. Clone / extract project
```
finance-tracker/
├── app.py
├── requirements.txt
├── data/              ← auto-created on first run
└── frontend/
```

### 2. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 3. Install frontend dependencies and build
```bash
cd frontend
npm install
npm run build
cd ..
```

### 4. Set your API key (optional — required for AI features)
```bash
# Windows
set ANTHROPIC_API_KEY=sk-ant-...

# Mac/Linux
export ANTHROPIC_API_KEY=sk-ant-...
```

### 5. Run the app
```bash
python app.py
```

Open http://localhost:5000

---

## Development mode (hot reload)

Run Flask and Vite dev server separately:

**Terminal 1 — Flask:**
```bash
python app.py
```

**Terminal 2 — Vite (proxies /api to Flask):**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173

---

## Features

- **Dashboard** — spending metrics, category pie chart, daily bar chart, recent transactions
- **Add expense** — manual entry with AI auto-categorization (Claude classifies from description)
- **Budget** — per-category monthly limits with progress bars and rule-based anomaly detection
- **AI analysis** — Claude-powered insights, anomaly detection, free-form Q&A

## Tech stack

- Backend: Flask, flask-cors, anthropic SDK
- Frontend: React 18, Vite, Recharts
- Storage: CSV (transactions) + JSON (budgets) — no database needed
- AI: Claude claude-sonnet-4-20250514 via Anthropic API
>>>>>>> d171e9b (your message)
