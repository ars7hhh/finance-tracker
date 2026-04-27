# Finance Tracker Project Overview

This is a single-deployment personal finance tracker built with a Flask backend and a React + Vite frontend.

## Backend (`app.py`)
- Built with `Flask` and `flask-cors`.
- Serves the production frontend from `frontend/dist` and exposes JSON APIs.
- Uses lightweight file storage under `data/`:
  - `data/transactions.csv` — transaction history
  - `data/budgets.json` — category budgets
  - `data/goals.json` — savings goals
  - `data/splits.json` — shared payment splits
- Seeds sample transactions and budgets on first run.
- Includes API routes for:
  - `GET /api/transactions` — list all transactions
  - `POST /api/transactions` — add a transaction
  - `DELETE /api/transactions/<id>` — delete a transaction
  - `GET /api/budgets` — read budgets
  - `POST /api/budgets` — save budgets
  - `GET /api/summary` — totals, category spend, daily activity, forecast, last month summary
  - `GET /api/monthly` — recent monthly income/expense comparisons
  - `GET /api/goals` — read goals
  - `POST /api/goals` — create a goal
  - `PUT /api/goals/<id>` — update a goal
  - `DELETE /api/goals/<id>` — remove a goal
  - `GET /api/splits` — read split transactions
  - `POST /api/splits` — add a split
  - `PUT /api/splits/<id>/settle` — mark a split settled
  - `DELETE /api/splits/<id>` — remove a split
  - `GET /api/recurring` — recurring expenses
  - `GET /api/reminders` — upcoming recurring reminders
  - `GET /api/export/csv` — download transaction CSV export
  - `POST /api/ai/categorize` — rule-based category suggestion
  - `POST /api/ai/analyze` — AI financial insights via `ollama`
  - `POST /api/ai/anomalies` — AI anomaly detection via `ollama`
  - `POST /api/ai/ask` — AI Q&A assistant via `ollama`
  - `POST /api/ai/sms-parse` — SMS expense parsing and categorization via `ollama`
- AI endpoints work when `ollama` is installed and available locally; otherwise they return a fallback message.

## Frontend (`frontend/`)
- Built with React, Vite, and custom UI components.
- Main entry point: `frontend/src/App.jsx`.
- User interface is organized into tabs:
  - Dashboard
  - Add transaction
  - Budget
  - Goals
  - Recurring
  - Monthly comparison
  - Splits
  - AI
- Provides theme toggle, CSV export, and live data refresh.
- Fetches backend data for transactions, budgets, summary, goals, splits, recurring items, and AI features.

## Data flow
- Frontend sends fetch requests to Flask API endpoints.
- Backend reads and writes CSV/JSON files instead of using a database.
- AI features are optional and rely on local `ollama` support.

## Setup and deployment
- Install Python dependencies:
  ```bash
  pip install -r requirements.txt
  ```
- Install frontend dependencies and build:
  ```bash
  cd frontend
  npm install
  npm run build
  cd ..
  ```
- Run the app:
  ```bash
  python app.py
  ```
- Open http://localhost:5000 in a browser.

## Development mode
- Run Flask and Vite dev server separately:
  - `python app.py`
  - `cd frontend && npm run dev`
- Use the Vite dev server for hot reload while the backend serves API requests.

## Notes
- Designed for lightweight personal finance tracking, not large-scale production.
- The app supports file-based storage, budgeting, goals, split payments, recurring reminders, and AI-assisted insights.
