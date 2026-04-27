# Finance Tracker Project Overview

This is a full-stack personal finance tracker with a Python backend and a React frontend.

## Backend (`app.py`)
- Built with `Flask` and `flask-cors`.
- Serves the frontend from `frontend/dist` when the app is built.
- Uses local files for storage:
  - `data/transactions.csv` for transaction records
  - `data/budgets.json` for budget values
- Includes API routes:
  - `GET /api/transactions` — list all transactions
  - `POST /api/transactions` — add a transaction
  - `DELETE /api/transactions/<id>` — delete a transaction
  - `GET /api/budgets` — read budgets
  - `POST /api/budgets` — save budgets
  - `GET /api/summary` — compute totals, category spend, forecast, last month summary
  - `POST /api/ai/categorize` — simple rule-based category prediction
  - `POST /api/ai/analyze` — AI-generated financial insights via `ollama`
  - `POST /api/ai/anomalies` — AI anomaly detection on expenses via `ollama`

## Frontend (`frontend/`)
- Built with React and Vite.
- Main entry point: `frontend/src/App.jsx`.
- App UI is organized into tabs:
  - Dashboard
  - Add transaction
  - Budget
  - Goals
  - Recurring
  - Monthly comparison
  - Splits
  - AI analysis
- Fetches the backend APIs for transactions, budgets, and summary data.
- Renders analytics and charts in a modern dashboard style.

## Data flow
- Frontend sends requests to Flask APIs for reading and writing data.
- Backend persists data in CSV/JSON files instead of using a database.
- AI features use `ollama.chat` locally with a compact model to generate insights and detect anomalies.

## Setup and deployment
- Install Python dependencies from `requirements.txt`.
- Install frontend dependencies and build the app in `frontend/`.
- Run the app with `python app.py`.

## Notes
- The app is designed as a single-deployment project: Flask serves the built React app.
- Storage is lightweight and file-based, so it is best suited for small personal use rather than large-scale production.
- The AI functionality is experimental and depends on the local `ollama` integration.
