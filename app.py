try:
    import ollama
    OLLAMA_AVAILABLE = True
except:
    OLLAMA_AVAILABLE = False
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import csv
import os
import json
from datetime import datetime

app = Flask(__name__, static_folder="frontend/dist", static_url_path="")
CORS(app)
@app.route("/")
def serve():
    return send_from_directory(
        app.static_folder,
        "index.html"
    )
@app.route("/<path:path>")
def static_proxy(path):
    return send_from_directory(
        app.static_folder,
        path
    )

DATA_FILE = "data/transactions.csv"
BUDGET_FILE = "data/budgets.json"
FIELDNAMES = ["id", "desc", "amount", "type", "cat", "date", "recurring"]


# ── helpers ──────────────────────────────────────────────────────────────────

def ensure_files():
    os.makedirs("data", exist_ok=True)
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
            writer.writeheader()
            # seed data
            seed = [
                {"id": 1, "desc": "Zomato dinner",     "amount": 450,   "type": "expense", "cat": "Food",          "date": "2026-04-18"},
                {"id": 2, "desc": "Uber to office",     "amount": 120,   "type": "expense", "cat": "Transport",     "date": "2026-04-19"},
                {"id": 3, "desc": "Electricity bill",   "amount": 1800,  "type": "expense", "cat": "Bills",         "date": "2026-04-15"},
                {"id": 4, "desc": "Amazon purchase",    "amount": 2200,  "type": "expense", "cat": "Shopping",      "date": "2026-04-14"},
                {"id": 5, "desc": "Salary",             "amount": 55000, "type": "income",  "cat": "Other",         "date": "2026-04-01"},
                {"id": 6, "desc": "Swiggy lunch",       "amount": 380,   "type": "expense", "cat": "Food",          "date": "2026-04-20"},
                {"id": 7, "desc": "Metro card",         "amount": 200,   "type": "expense", "cat": "Transport",     "date": "2026-04-17"},
                {"id": 8, "desc": "Movie tickets",      "amount": 600,   "type": "expense", "cat": "Entertainment", "date": "2026-04-21"},
                {"id": 9, "desc": "Pharmacy",           "amount": 340,   "type": "expense", "cat": "Health",        "date": "2026-04-16"},
                {"id":10, "desc": "Grocery store",      "amount": 1200,  "type": "expense", "cat": "Food",          "date": "2026-04-22"},
            ]
            writer.writerows(seed)
    if not os.path.exists(BUDGET_FILE):
        budgets = {"Food": 3000, "Transport": 1000, "Bills": 2500,
                   "Shopping": 3000, "Health": 1000, "Entertainment": 1500, "Other": 1000}
        with open(BUDGET_FILE, "w") as f:
            json.dump(budgets, f)

def read_transactions():
    with open(DATA_FILE, newline="") as f:
        return list(csv.DictReader(f))

def write_transactions(rows):
    with open(DATA_FILE, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)

def next_id(rows):
    if not rows:
        return 1
    return max(int(r["id"]) for r in rows) + 1

def read_budgets():
    with open(BUDGET_FILE) as f:
        return json.load(f)

def write_budgets(data):
    with open(BUDGET_FILE, "w") as f:
        json.dump(data, f)

# ── transaction routes ────────────────────────────────────────────────────────

@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    rows = read_transactions()
    for r in rows:
        r["amount"] = float(r["amount"])
    return jsonify(rows)

@app.route("/api/transactions", methods=["POST"])
def add_transaction():
    data = request.json
    rows = read_transactions()
    new_row = {
        "id":     next_id(rows),
        "desc":   data["desc"],
        "amount": float(data["amount"]),
        "type":   data["type"],
        "cat":    data.get("cat", "Other"),
        "date":   data.get("date", datetime.today().strftime("%Y-%m-%d")),
        "recurring": data.get("recurring", False),
    }
    rows.append(new_row)
    write_transactions(rows)
    return jsonify(new_row), 201

@app.route("/api/transactions/<int:txn_id>", methods=["DELETE"])
def delete_transaction(txn_id):
    rows = read_transactions()
    rows = [r for r in rows if int(r["id"]) != txn_id]
    write_transactions(rows)
    return jsonify({"deleted": txn_id})

# ── budget routes ─────────────────────────────────────────────────────────────

@app.route("/api/budgets", methods=["GET"])
def get_budgets():
    return jsonify(read_budgets())

@app.route("/api/budgets", methods=["POST"])
def save_budgets():
    write_budgets(request.json)
    return jsonify({"status": "saved"})

# ── summary route ─────────────────────────────────────────────────────────────

@app.route("/api/summary", methods=["GET"])
def get_summary():
    rows = read_transactions()
    expenses = [r for r in rows if r["type"] == "expense"]
    income   = [r for r in rows if r["type"] == "income"]

    total_exp = sum(float(r["amount"]) for r in expenses)
    total_inc = sum(float(r["amount"]) for r in income)

    cat_totals = {}
    for r in expenses:
        cat_totals[r["cat"]] = cat_totals.get(r["cat"], 0) + float(r["amount"])

    # daily totals (last 7 days)
    from collections import defaultdict
    daily = defaultdict(float)
    for r in expenses:
        daily[r["date"]] += float(r["amount"])
# spending forecast
    days_gone = max(datetime.today().day, 1)
    forecast  = round((total_exp / days_gone) * 30, 2)

    # last month
    from datetime import timedelta
    last_ym  = (datetime.today().replace(day=1) - timedelta(days=1)).strftime("%Y-%m")
    last_exp = sum(float(r["amount"]) for r in expenses if r["date"].startswith(last_ym))
    last_inc = sum(float(r["amount"]) for r in income   if r["date"].startswith(last_ym))

    return jsonify({
        "total_expenses": total_exp,
        "total_income":   total_inc,
        "balance":        total_inc - total_exp,
        "cat_totals":     cat_totals,
        "daily":          dict(daily),
        "forecast":       forecast,
        "last_month":     {"expenses": last_exp, "income": last_inc},
    })
# ── AI routes ─────────────────────────────────────────────────────────────────

@app.route("/api/ai/categorize", methods=["POST"])
def ai_categorize():
    desc = request.json.get("desc", "").lower()

    if "zomato" in desc or "swiggy" in desc or "food" in desc:
        cat = "Food"

    elif "uber" in desc or "metro" in desc or "bus" in desc:
        cat = "Transport"

    elif "electricity" in desc or "bill" in desc:
        cat = "Bills"

    elif "amazon" in desc or "shopping" in desc:
        cat = "Shopping"

    elif "medicine" in desc or "pharmacy" in desc:
        cat = "Health"

    else:
        cat = "Other"

    return jsonify({"cat": cat})
@app.route("/api/ai/analyze", methods=["POST"])
def ai_analyze():

    data = request.json

    summary = f"""
Analyze the following financial summary and provide short insights.

Total income: ₹{data.get('total_income', 0)}
Total expenses: ₹{data.get('total_expenses', 0)}
Category totals: {data.get('cat_totals', {})}
Budgets: {data.get('budgets', {})}

Keep the response very short.
"""

    if not OLLAMA_AVAILABLE:
        return jsonify({
            "result": "AI analysis unavailable in cloud deployment."
        })

    response = ollama.chat(
        model="tinyllama",
        messages=[
            {
                "role": "user",
                "content": summary
            }
        ]
    )

    return jsonify({
        "result": response["message"]["content"]
    })
@app.route("/api/ai/anomalies", methods=["POST"])
def ai_anomalies():

    data = request.json

    transactions_text = "\n".join(
        f"{t['date']}: {t['desc']} ₹{t['amount']} ({t['cat']})"
        for t in data["transactions"]
        if t["type"] == "expense"
    )

    prompt = f"""
Review these transactions and identify any unusual or suspicious spending.

Transactions:
{transactions_text}

Budgets:
{data['budgets']}

Keep the response very short.
"""

    if not OLLAMA_AVAILABLE:
        return jsonify({
            "result": "AI unavailable in cloud deployment."
        })

    response = ollama.chat(
        model="tinyllama",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return jsonify({
        "result": response["message"]["content"]
    })
@app.route("/api/ai/ask", methods=["POST"])
def ai_ask():

    data = request.json

    question = data.get("question", "")
    total_income = data.get("total_income", 0)
    total_expenses = data.get("total_expenses", 0)
    cat_totals = data.get("cat_totals", {})
    budgets = data.get("budgets", {})

    context = f"""
Financial context:

Total income: ₹{total_income}
Total expenses: ₹{total_expenses}
Category spending: {cat_totals}
Budgets: {budgets}

User question:
{question}

Answer clearly in 1 sentence.
"""

    if not OLLAMA_AVAILABLE:
        return jsonify({
            "result": "AI assistant unavailable in cloud deployment."
        })

    response = ollama.chat(
        model="tinyllama",
        messages=[
            {
                "role": "user",
                "content": context
            }
        ]
    )

    return jsonify({
        "result": response["message"]["content"]
    })
# ── export CSV ────────────────────────────────────────────────────────────────

from flask import Response

@app.route("/api/export/csv", methods=["GET"])
def export_csv():
    rows = read_transactions()
    def generate():
        yield "id,date,description,amount,type,category\n"
        for r in rows:
            yield f"{r['id']},{r['date']},\"{r['desc']}\",{r['amount']},{r['type']},{r['cat']}\n"
    return Response(generate(), mimetype="text/csv",
                    headers={"Content-Disposition": "attachment;filename=transactions.csv"})

# ── spending forecast ─────────────────────────────────────────────────────────

# NOTE: Also update your get_summary() to include forecast (see below)

# ── goals ─────────────────────────────────────────────────────────────────────

GOALS_FILE = "data/goals.json"

def ensure_goals():
    if not os.path.exists(GOALS_FILE):
        with open(GOALS_FILE, "w") as f:
            json.dump([], f)

@app.route("/api/goals", methods=["GET"])
def get_goals():
    ensure_goals()
    with open(GOALS_FILE) as f:
        return jsonify(json.load(f))

@app.route("/api/goals", methods=["POST"])
def add_goal():
    ensure_goals()
    with open(GOALS_FILE) as f:
        goals = json.load(f)
    g = request.json
    g["id"]      = max((x["id"] for x in goals), default=0) + 1
    g["saved"]   = float(g.get("saved", 0))
    g["target"]  = float(g["target"])
    g["created"] = datetime.today().strftime("%Y-%m-%d")
    goals.append(g)
    with open(GOALS_FILE, "w") as f:
        json.dump(goals, f)
    return jsonify(g), 201

@app.route("/api/goals/<int:gid>", methods=["PUT"])
def update_goal(gid):
    ensure_goals()
    with open(GOALS_FILE) as f:
        goals = json.load(f)
    for g in goals:
        if g["id"] == gid:
            g.update(request.json)
    with open(GOALS_FILE, "w") as f:
        json.dump(goals, f)
    return jsonify({"status": "updated"})

@app.route("/api/goals/<int:gid>", methods=["DELETE"])
def delete_goal(gid):
    ensure_goals()
    with open(GOALS_FILE) as f:
        goals = json.load(f)
    goals = [g for g in goals if g["id"] != gid]
    with open(GOALS_FILE, "w") as f:
        json.dump(goals, f)
    return jsonify({"deleted": gid})

# ── monthly comparison ────────────────────────────────────────────────────────

from collections import defaultdict as _dd

@app.route("/api/monthly", methods=["GET"])
def get_monthly():
    rows    = read_transactions()
    monthly = _dd(lambda: {"expenses": 0, "income": 0})
    for r in rows:
        ym = r["date"][:7]
        if r["type"] == "expense":
            monthly[ym]["expenses"] += float(r["amount"])
        else:
            monthly[ym]["income"] += float(r["amount"])
    result = []
    for ym in sorted(monthly)[-6:]:
        result.append({
            "month":    ym,
            "expenses": round(monthly[ym]["expenses"], 2),
            "income":   round(monthly[ym]["income"],   2),
        })
    return jsonify(result)

# ── splits ────────────────────────────────────────────────────────────────────

SPLITS_FILE = "data/splits.json"

def ensure_splits():
    if not os.path.exists(SPLITS_FILE):
        with open(SPLITS_FILE, "w") as f:
            json.dump([], f)

@app.route("/api/splits", methods=["GET"])
def get_splits():
    ensure_splits()
    with open(SPLITS_FILE) as f:
        return jsonify(json.load(f))

@app.route("/api/splits", methods=["POST"])
def add_split():
    ensure_splits()
    with open(SPLITS_FILE) as f:
        splits = json.load(f)
    s = request.json
    s["id"]      = max((x["id"] for x in splits), default=0) + 1
    s["date"]    = s.get("date", datetime.today().strftime("%Y-%m-%d"))
    s["settled"] = False
    s["amount"]  = float(s["amount"])
    splits.append(s)
    with open(SPLITS_FILE, "w") as f:
        json.dump(splits, f)
    return jsonify(s), 201

@app.route("/api/splits/<int:sid>/settle", methods=["PUT"])
def settle_split(sid):
    ensure_splits()
    with open(SPLITS_FILE) as f:
        splits = json.load(f)
    for s in splits:
        if s["id"] == sid:
            s["settled"] = True
    with open(SPLITS_FILE, "w") as f:
        json.dump(splits, f)
    return jsonify({"status": "settled"})

@app.route("/api/splits/<int:sid>", methods=["DELETE"])
def delete_split(sid):
    ensure_splits()
    with open(SPLITS_FILE) as f:
        splits = json.load(f)
    splits = [s for s in splits if s["id"] != sid]
    with open(SPLITS_FILE, "w") as f:
        json.dump(splits, f)
    return jsonify({"deleted": sid})

# ── recurring / reminders ─────────────────────────────────────────────────────

@app.route("/api/recurring", methods=["GET"])
def get_recurring():
    rows = read_transactions()
    for r in rows:
        r["amount"] = float(r["amount"])
    return jsonify([r for r in rows if r.get("recurring")])

@app.route("/api/reminders", methods=["GET"])
def get_reminders():
    rows  = read_transactions()
    today = datetime.today()
    seen  = {}
    for r in rows:
        if r.get("recurring") == "monthly" and r["desc"] not in seen:
            seen[r["desc"]] = r
    out = []
    for desc, r in seen.items():
        last     = datetime.strptime(r["date"], "%Y-%m-%d")
        day      = last.day
        nm       = today.month if today.day < day else (today.month % 12) + 1
        ny       = today.year + (1 if nm == 1 and today.month == 12 else 0)
        try:
            next_due = today.replace(year=ny, month=nm, day=day)
        except:
            next_due = today
        days_left = (next_due - today).days
        out.append({
            "desc": desc, "amount": float(r["amount"]), "cat": r["cat"],
            "next_due": next_due.strftime("%Y-%m-%d"),
            "days_left": days_left, "overdue": days_left < 0,
        })
    out.sort(key=lambda x: x["days_left"])
    return jsonify(out)

# ── SMS parse ─────────────────────────────────────────────────────────────────

import re

@app.route("/api/ai/sms-parse", methods=["POST"])
def ai_sms_parse():
    sms   = request.json.get("sms", "")
    today = datetime.today().strftime("%Y-%m-%d")

    # regex fallback first
    am = re.search(r'(?:INR|Rs\.?|₹)\s*([\d,]+\.?\d*)', sms, re.IGNORECASE)
    amount = float(am.group(1).replace(",", "")) if am else 0

    # try ollama for merchant + category
    try:
        response = ollama.chat(
            model="tinyllama",
            messages=[{"role": "user", "content":
                f'Extract merchant name and category from this SMS: "{sms}"\n'
                f'Categories: Food, Transport, Bills, Shopping, Health, Entertainment, Other\n'
                f'Reply in this exact format only:\nMERCHANT: name\nCATEGORY: category'}]
        )
        text     = response["message"]["content"]
        merchant = re.search(r'MERCHANT:\s*(.+)', text)
        category = re.search(r'CATEGORY:\s*(\w+)', text)
        desc     = merchant.group(1).strip() if merchant else "UPI Payment"
        cat      = category.group(1).strip() if category else "Other"
        CATS     = ["Food","Transport","Bills","Shopping","Health","Entertainment","Other"]
        cat      = cat if cat in CATS else "Other"
    except:
        desc, cat = "UPI Payment", "Other"

    return jsonify({"amount": amount, "desc": desc, "cat": cat,
                    "type": "expense", "date": today})
# ── serve React ───────────────────────────────────────────────────────────────

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    dist = os.path.join(app.static_folder)
    if path and os.path.exists(os.path.join(dist, path)):
        return send_from_directory(dist, path)
    return send_from_directory(dist, "index.html")

# ─────────────────────────────────────────────────────────────────────────────
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=True
    )