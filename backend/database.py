import sqlite3
import os
from datetime import datetime

DB_PATH = os.environ.get("EXPENSE_DB_PATH", os.path.join(os.path.dirname(__file__), "expenses.db"))

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    """)

    # Check if table is empty, if so, seed sample realistic data for validation
    cursor.execute("SELECT COUNT(*) FROM expenses")
    count = cursor.fetchone()[0]
    if count == 0:
        sample_expenses = [
            (42.50, "Food & Dining", "2026-09-01", "Grocery shopping at Market", "Weekly essentials and produce"),
            (14.99, "Entertainment", "2026-09-02", "Streaming Service Subscription", "Monthly recurring"),
            (120.00, "Utilities", "2026-09-03", "Electric and Power Bill", "August billing cycle"),
            (35.20, "Transportation", "2026-09-04", "Metro Transit Pass & Fuel", "Commute fare"),
            (85.00, "Food & Dining", "2026-09-05", "Team Dinner with Colleagues", "Italian bistro"),
            (65.00, "Healthcare", "2026-09-06", "Prescription & Pharmacy", "Vitamins and allergy medication"),
            (49.99, "Shopping", "2026-09-06", "Ergonomic Desk Accessories", "Keyboard wrist rest"),
            (8.75, "Food & Dining", "2026-09-07", "Morning Espresso and Pastry", "Corner Cafe"),
            (150.00, "Utilities", "2026-08-15", "High-speed Fiber Internet", "Home office broadband"),
            (95.40, "Food & Dining", "2026-08-20", "Family Grocery Haul", "Supermarket bulk items"),
            (210.00, "Shopping", "2026-08-24", "Fall Apparel & Shoes", "Seasonal essentials"),
            (45.00, "Transportation", "2026-08-28", "Fuel & Vehicle Maintenance", "Tire pressure and wash")
        ]
        now = datetime.utcnow().isoformat()
        cursor.executemany("""
        INSERT INTO expenses (amount, category, date, description, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, [(exp[0], exp[1], exp[2], exp[3], exp[4], now, now) for exp in sample_expenses])
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print(f"Database initialized at {DB_PATH}")
