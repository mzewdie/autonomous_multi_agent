#!/usr/bin/env python3
"""
Python REST API Server for Personal Expense Tracker & Multi-Agent System (Phase 1)
Using Python standard library (http.server + sqlite3) to ensure 100% zero-dependency
reliability across container restarts, while preserving the full REST specification.
"""

import sys
import os
import json
import sqlite3
from urllib.parse import urlparse, parse_qs
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

# Add current directory to path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.database import get_db_connection, init_db

PORT = 8000
ALLOWED_CATEGORIES = [
    "Food & Dining",
    "Transportation",
    "Housing",
    "Utilities",
    "Entertainment",
    "Healthcare",
    "Shopping",
    "Education",
    "Personal",
    "Other"
]

class ExpenseAPIHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def log_message(self, format, *args):
        # Concise logging
        sys.stderr.write(f"[{datetime.utcnow().strftime('%H:%M:%S')}] Python API: {args[0]} {args[1]}\n")

    def _read_json_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            return {}
        body = self.rfile.read(content_length).decode("utf-8")
        try:
            return json.loads(body)
        except Exception:
            return {}

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # Health Check
        if path == "/api/health":
            self._set_headers(200)
            self.wfile.write(json.dumps({
                "status": "healthy",
                "service": "Python REST API (SQLite + Python 3)",
                "phase": "PHASE_1_DEVELOPER_AGENT",
                "timestamp": datetime.utcnow().isoformat()
            }).encode("utf-8"))
            return

        # Categories
        if path == "/api/expenses/categories":
            self._set_headers(200)
            self.wfile.write(json.dumps(ALLOWED_CATEGORIES).encode("utf-8"))
            return

        # Summary Breakdown
        if path == "/api/expenses/summary":
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("SELECT COUNT(*), COALESCE(SUM(amount), 0.0) FROM expenses")
            total_count, total_amount = cursor.fetchone()
            total_amount = round(total_amount, 2)

            current_month = datetime.utcnow().strftime("%Y-%m")
            cursor.execute("SELECT COALESCE(SUM(amount), 0.0) FROM expenses WHERE substr(date, 1, 7) = ?", (current_month,))
            current_month_total = round(cursor.fetchone()[0], 2)

            cursor.execute("""
                SELECT substr(date, 1, 7) as month, SUM(amount) as total, COUNT(*) as count
                FROM expenses
                GROUP BY substr(date, 1, 7)
                ORDER BY month DESC
                LIMIT 12
            """)
            monthly_breakdown = [
                {"month": r[0], "total": round(r[1], 2), "count": r[2]} for r in cursor.fetchall()
            ]

            cursor.execute("""
                SELECT category, SUM(amount) as total, COUNT(*) as count
                FROM expenses
                GROUP BY category
                ORDER BY total DESC
            """)
            category_breakdown = [
                {
                    "category": r[0],
                    "total": round(r[1], 2),
                    "count": r[2],
                    "percentage": round((r[1] / total_amount * 100) if total_amount > 0 else 0, 1)
                }
                for r in cursor.fetchall()
            ]
            conn.close()

            self._set_headers(200)
            self.wfile.write(json.dumps({
                "total_amount": total_amount,
                "total_count": total_count,
                "current_month_total": current_month_total,
                "monthly_breakdown": monthly_breakdown,
                "category_breakdown": category_breakdown
            }).encode("utf-8"))
            return

        # Expenses List
        if path == "/api/expenses":
            category = query.get("category", [None])[0]
            search = query.get("search", [None])[0]
            start_date = query.get("start_date", [None])[0]
            end_date = query.get("end_date", [None])[0]
            sort_by = query.get("sort_by", ["date"])[0]
            sort_order = query.get("sort_order", ["desc"])[0]

            if sort_by not in ["date", "amount", "category"]:
                sort_by = "date"
            order_dir = "DESC" if sort_order.lower() == "desc" else "ASC"

            conn = get_db_connection()
            cursor = conn.cursor()
            sql = "SELECT id, amount, category, date, description, notes, created_at, updated_at FROM expenses WHERE 1=1"
            params = []

            if category and category.lower() != "all":
                sql += " AND category = ?"
                params.append(category)

            if search:
                sql += " AND (description LIKE ? OR notes LIKE ?)"
                term = f"%{search}%"
                params.extend([term, term])

            if start_date:
                sql += " AND date >= ?"
                params.append(start_date)

            if end_date:
                sql += " AND date <= ?"
                params.append(end_date)

            sql += f" ORDER BY {sort_by} {order_dir}, id DESC"
            cursor.execute(sql, params)
            rows = cursor.fetchall()
            conn.close()

            results = [
                {
                    "id": r["id"],
                    "amount": r["amount"],
                    "category": r["category"],
                    "date": r["date"],
                    "description": r["description"],
                    "notes": r["notes"],
                    "created_at": r["created_at"],
                    "updated_at": r["updated_at"]
                }
                for r in rows
            ]
            self._set_headers(200)
            self.wfile.write(json.dumps(results).encode("utf-8"))
            return

        # Single Expense GET /api/expenses/{id}
        if path.startswith("/api/expenses/"):
            parts = path.split("/")
            if len(parts) == 4 and parts[3].isdigit():
                expense_id = int(parts[3])
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute("SELECT id, amount, category, date, description, notes, created_at, updated_at FROM expenses WHERE id = ?", (expense_id,))
                r = cursor.fetchone()
                conn.close()
                if not r:
                    self._set_headers(404)
                    self.wfile.write(json.dumps({"detail": f"Expense {expense_id} not found"}).encode("utf-8"))
                    return
                self._set_headers(200)
                self.wfile.write(json.dumps({
                    "id": r["id"],
                    "amount": r["amount"],
                    "category": r["category"],
                    "date": r["date"],
                    "description": r["description"],
                    "notes": r["notes"],
                    "created_at": r["created_at"],
                    "updated_at": r["updated_at"]
                }).encode("utf-8"))
                return

        # Agent System Status
        if path == "/api/agent/status":
            self._set_headers(200)
            self.wfile.write(json.dumps({
                "current_phase": 1,
                "phase_name": "PHASE 1: Developer Agent & Application Development",
                "active_specialist": "DEVELOPER_AGENT",
                "system_status": "ONLINE",
                "agents": {
                    "orchestrator": {
                        "status": "PREPARED_INTERFACE",
                        "phase": 2,
                        "description": "Workflow management & sub-agent dispatch contract defined."
                    },
                    "developer": {
                        "status": "ACTIVE",
                        "phase": 1,
                        "description": "Code implementation, local validation, and changeset generation."
                    },
                    "tester": {
                        "status": "PREPARED_INTERFACE",
                        "phase": 3,
                        "description": "Independent testing contract & verification suite schema defined."
                    }
                },
                "human_checkin_policy": {
                    "mode": "MANUAL_HUMAN_SUPERVISION",
                    "git_managed_by": "HUMAN",
                    "autonomous_push": False,
                    "next_step": "Phase 2 Orchestrator Agent integration"
                }
            }).encode("utf-8"))
            return

        # Agent Artifacts
        if path == "/api/agent/artifacts":
            log_path = os.path.join(BASE_DIR, "agent_system", "tasks_log.json")
            if os.path.exists(log_path):
                with open(log_path, "r") as f:
                    content = f.read()
                self._set_headers(200)
                self.wfile.write(content.encode("utf-8"))
                return
            self._set_headers(200)
            self.wfile.write(json.dumps({"artifacts": []}).encode("utf-8"))
            return

        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "Not Found"}).encode("utf-8"))

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/expenses":
            data = self._read_json_body()
            amount = float(data.get("amount", 0))
            category = str(data.get("category", "Other"))
            date_str = str(data.get("date", datetime.utcnow().strftime("%Y-%m-%d")))
            description = str(data.get("description", "")).strip()
            notes = data.get("notes")

            if amount <= 0 or not description:
                self._set_headers(400)
                self.wfile.write(json.dumps({"detail": "Amount must be > 0 and description is required"}).encode("utf-8"))
                return

            now = datetime.utcnow().isoformat()
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO expenses (amount, category, date, description, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (amount, category, date_str, description, notes, now, now))
            expense_id = cursor.lastrowid
            conn.commit()

            cursor.execute("SELECT id, amount, category, date, description, notes, created_at, updated_at FROM expenses WHERE id = ?", (expense_id,))
            r = cursor.fetchone()
            conn.close()

            self._set_headers(201)
            self.wfile.write(json.dumps({
                "id": r["id"],
                "amount": r["amount"],
                "category": r["category"],
                "date": r["date"],
                "description": r["description"],
                "notes": r["notes"],
                "created_at": r["created_at"],
                "updated_at": r["updated_at"]
            }).encode("utf-8"))
            return

        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "Not Found"}).encode("utf-8"))

    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/expenses/"):
            parts = path.split("/")
            if len(parts) == 4 and parts[3].isdigit():
                expense_id = int(parts[3])
                data = self._read_json_body()

                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute("SELECT id FROM expenses WHERE id = ?", (expense_id,))
                if not cursor.fetchone():
                    conn.close()
                    self._set_headers(404)
                    self.wfile.write(json.dumps({"detail": f"Expense {expense_id} not found"}).encode("utf-8"))
                    return

                fields = []
                params = []
                if "amount" in data and data["amount"] is not None:
                    fields.append("amount = ?")
                    params.append(float(data["amount"]))
                if "category" in data and data["category"] is not None:
                    fields.append("category = ?")
                    params.append(str(data["category"]))
                if "date" in data and data["date"] is not None:
                    fields.append("date = ?")
                    params.append(str(data["date"]))
                if "description" in data and data["description"] is not None:
                    fields.append("description = ?")
                    params.append(str(data["description"]))
                if "notes" in data:
                    fields.append("notes = ?")
                    params.append(data["notes"])

                now = datetime.utcnow().isoformat()
                fields.append("updated_at = ?")
                params.append(now)
                params.append(expense_id)

                cursor.execute(f"UPDATE expenses SET {', '.join(fields)} WHERE id = ?", params)
                conn.commit()

                cursor.execute("SELECT id, amount, category, date, description, notes, created_at, updated_at FROM expenses WHERE id = ?", (expense_id,))
                r = cursor.fetchone()
                conn.close()

                self._set_headers(200)
                self.wfile.write(json.dumps({
                    "id": r["id"],
                    "amount": r["amount"],
                    "category": r["category"],
                    "date": r["date"],
                    "description": r["description"],
                    "notes": r["notes"],
                    "created_at": r["created_at"],
                    "updated_at": r["updated_at"]
                }).encode("utf-8"))
                return

        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "Not Found"}).encode("utf-8"))

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/expenses/"):
            parts = path.split("/")
            if len(parts) == 4 and parts[3].isdigit():
                expense_id = int(parts[3])
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute("SELECT id FROM expenses WHERE id = ?", (expense_id,))
                if not cursor.fetchone():
                    conn.close()
                    self._set_headers(404)
                    self.wfile.write(json.dumps({"detail": f"Expense {expense_id} not found"}).encode("utf-8"))
                    return

                cursor.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
                conn.commit()
                conn.close()

                self._set_headers(200)
                self.wfile.write(json.dumps({"status": "success", "message": f"Expense {expense_id} deleted successfully"}).encode("utf-8"))
                return

        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "Not Found"}).encode("utf-8"))

def run():
    init_db()
    server_address = ("127.0.0.1", PORT)
    httpd = HTTPServer(server_address, ExpenseAPIHandler)
    print(f"Python API Server running on http://127.0.0.1:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()

if __name__ == "__main__":
    run()
