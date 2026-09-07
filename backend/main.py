from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from datetime import datetime
import json
import os

from backend.database import get_db_connection, init_db
from backend.models import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    ExpenseSummaryResponse,
    MonthlySummaryItem,
    CategorySummaryItem
)

app = FastAPI(
    title="Personal Expense Tracker & Multi-Agent Development System API",
    version="1.0.0",
    description="Backend API supporting Personal Expense Tracker application and Developer Agent Phase 1 interfaces."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SQLite database on startup
@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Personal Expense Tracker API (FastAPI + SQLite)",
        "phase": "PHASE_1_DEVELOPER_AGENT",
        "timestamp": datetime.utcnow().isoformat()
    }

# ==========================================
# EXPENSE TRACKER REST API
# ==========================================

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

@app.get("/api/expenses/categories", response_model=List[str])
def get_categories():
    return ALLOWED_CATEGORIES

@app.get("/api/expenses", response_model=List[ExpenseResponse])
def get_expenses(
    category: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    sort_by: str = Query("date", regex="^(date|amount|category)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$")
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT id, amount, category, date, description, notes, created_at, updated_at FROM expenses WHERE 1=1"
    params = []
    
    if category and category.lower() != "all":
        query += " AND category = ?"
        params.append(category)
        
    if search:
        query += " AND (description LIKE ? OR notes LIKE ?)"
        search_term = f"%{search}%"
        params.extend([search_term, search_term])
        
    if start_date:
        query += " AND date >= ?"
        params.append(start_date)
        
    if end_date:
        query += " AND date <= ?"
        params.append(end_date)
        
    order_clause = f" ORDER BY {sort_by} {'DESC' if sort_order.lower() == 'desc' else 'ASC'}, id DESC"
    query += order_clause
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    return [
        ExpenseResponse(
            id=row["id"],
            amount=row["amount"],
            category=row["category"],
            date=row["date"],
            description=row["description"],
            notes=row["notes"],
            created_at=row["created_at"],
            updated_at=row["updated_at"]
        ) for row in rows
    ]

@app.post("/api/expenses", response_model=ExpenseResponse, status_code=201)
def create_expense(expense: ExpenseCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    now = datetime.utcnow().isoformat()
    cursor.execute("""
        INSERT INTO expenses (amount, category, date, description, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (expense.amount, expense.category, expense.date, expense.description, expense.notes, now, now))
    
    expense_id = cursor.lastrowid
    conn.commit()
    
    cursor.execute("SELECT id, amount, category, date, description, notes, created_at, updated_at FROM expenses WHERE id = ?", (expense_id,))
    row = cursor.fetchone()
    conn.close()
    
    return ExpenseResponse(
        id=row["id"],
        amount=row["amount"],
        category=row["category"],
        date=row["date"],
        description=row["description"],
        notes=row["notes"],
        created_at=row["created_at"],
        updated_at=row["updated_at"]
    )

@app.get("/api/expenses/summary", response_model=ExpenseSummaryResponse)
def get_summary():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Total sum and count
    cursor.execute("SELECT COUNT(*), COALESCE(SUM(amount), 0.0) FROM expenses")
    count_row = cursor.fetchone()
    total_count = count_row[0]
    total_amount = round(count_row[1], 2)
    
    # Current month total
    current_month = datetime.utcnow().strftime("%Y-%m")
    cursor.execute("SELECT COALESCE(SUM(amount), 0.0) FROM expenses WHERE substr(date, 1, 7) = ?", (current_month,))
    current_month_total = round(cursor.fetchone()[0], 2)
    
    # Monthly breakdown
    cursor.execute("""
        SELECT substr(date, 1, 7) as month, SUM(amount) as total, COUNT(*) as count
        FROM expenses
        GROUP BY substr(date, 1, 7)
        ORDER BY month DESC
        LIMIT 12
    """)
    monthly_rows = cursor.fetchall()
    monthly_breakdown = [
        MonthlySummaryItem(
            month=row["month"],
            total=round(row["total"], 2),
            count=row["count"]
        ) for row in monthly_rows
    ]
    
    # Category breakdown
    cursor.execute("""
        SELECT category, SUM(amount) as total, COUNT(*) as count
        FROM expenses
        GROUP BY category
        ORDER BY total DESC
    """)
    cat_rows = cursor.fetchall()
    category_breakdown = [
        CategorySummaryItem(
            category=row["category"],
            total=round(row["total"], 2),
            count=row["count"],
            percentage=round((row["total"] / total_amount * 100) if total_amount > 0 else 0, 1)
        ) for row in cat_rows
    ]
    
    conn.close()
    return ExpenseSummaryResponse(
        total_amount=total_amount,
        total_count=total_count,
        current_month_total=current_month_total,
        monthly_breakdown=monthly_breakdown,
        category_breakdown=category_breakdown
    )

@app.get("/api/expenses/{expense_id}", response_model=ExpenseResponse)
def get_expense(expense_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, amount, category, date, description, notes, created_at, updated_at FROM expenses WHERE id = ?", (expense_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail=f"Expense with id {expense_id} not found")
        
    return ExpenseResponse(
        id=row["id"],
        amount=row["amount"],
        category=row["category"],
        date=row["date"],
        description=row["description"],
        notes=row["notes"],
        created_at=row["created_at"],
        updated_at=row["updated_at"]
    )

@app.put("/api/expenses/{expense_id}", response_model=ExpenseResponse)
def update_expense(expense_id: int, updates: ExpenseUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM expenses WHERE id = ?", (expense_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail=f"Expense with id {expense_id} not found")
        
    fields = []
    params = []
    
    if updates.amount is not None:
        fields.append("amount = ?")
        params.append(updates.amount)
    if updates.category is not None:
        fields.append("category = ?")
        params.append(updates.category)
    if updates.date is not None:
        fields.append("date = ?")
        params.append(updates.date)
    if updates.description is not None:
        fields.append("description = ?")
        params.append(updates.description)
    if updates.notes is not None:
        fields.append("notes = ?")
        params.append(updates.notes)
        
    if not fields:
        conn.close()
        raise HTTPException(status_code=400, detail="No fields provided for update")
        
    now = datetime.utcnow().isoformat()
    fields.append("updated_at = ?")
    params.append(now)
    
    params.append(expense_id)
    query = f"UPDATE expenses SET {', '.join(fields)} WHERE id = ?"
    
    cursor.execute(query, params)
    conn.commit()
    
    cursor.execute("SELECT id, amount, category, date, description, notes, created_at, updated_at FROM expenses WHERE id = ?", (expense_id,))
    row = cursor.fetchone()
    conn.close()
    
    return ExpenseResponse(
        id=row["id"],
        amount=row["amount"],
        category=row["category"],
        date=row["date"],
        description=row["description"],
        notes=row["notes"],
        created_at=row["created_at"],
        updated_at=row["updated_at"]
    )

@app.delete("/api/expenses/{expense_id}")
def delete_expense(expense_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM expenses WHERE id = ?", (expense_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail=f"Expense with id {expense_id} not found")
        
    cursor.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
    conn.commit()
    conn.close()
    
    return {"status": "success", "message": f"Expense {expense_id} deleted successfully"}

# ==========================================
# AGENT SYSTEM (PHASE 1 DEVELOPER AGENT) API
# ==========================================

AGENT_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "agent_system", "tasks_log.json")

@app.get("/api/agent/status")
def get_agent_system_status():
    return {
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
    }

@app.get("/api/agent/artifacts")
def get_developer_artifacts():
    if os.path.exists(AGENT_DATA_PATH):
        try:
            with open(AGENT_DATA_PATH, "r") as f:
                data = json.load(f)
                return data
        except Exception as e:
            return {"error": str(e), "artifacts": []}
    return {"artifacts": []}
