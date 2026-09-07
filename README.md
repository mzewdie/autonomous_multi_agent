# Autonomous Multi-Agent Software Development System

> **Google AI Studio & Google ADK Experimental Framework**  
> **Phase 1: Developer Agent Foundation & Personal Expense Tracker Target Application**

---

## 1. Project Vision & Architecture

The long-term objective of this project is to construct an autonomous multi-agent software development system where a human can describe software goals in natural language, and a coordinated team of specialized AI agents collaboratively develops, tests, verifies, debugs, and improves the codebase with progressively less human intervention.

### The Multi-Agent Hierarchy

The system operates under the umbrella of Google AI Studio's master environment. Our system is structured as follows:

```
                      +----------------------------------+
                      |              HUMAN               |
                      |   (Requirements, Review, Git)    |
                      +-----------------+----------------+
                                        |
                                        v
                      +----------------------------------+
                      |   AI STUDIO MASTER DEV AGENT     |
                      | (Translates user intent & tools) |
                      +-----------------+----------------+
                                        |
                                        v
                      +----------------------------------+
                      |   OUR MULTI-AGENT DEV SYSTEM     |
                      +-----------------+----------------+
                                        |
                                        v
                      +----------------------------------+
                      |        ORCHESTRATOR AGENT        |
                      |    (Phase 2 Interface Prepared)  |
                      +--------+----------------+--------+
                               |                |
                +--------------+                +--------------+
                |                                              |
                v                                              v
+-------------------------------+              +-------------------------------+
|        DEVELOPER AGENT        | <----------> |         TESTER AGENT          |
|    (Phase 1 - ACTIVE)         |  (Phase 5    |    (Phase 3 Interface         |
| Writes code, SQLite schema,   |   Autonomous |     Prepared)                 |
| self-verifies, logs artifacts |    Feedback) | Validates APIs, tests logic,  |
+-------------------------------+              | reports structured bugs       |
                                               +-------------------------------+
```

---

## 2. Phase 1 Scope & Boundary Discipline

To build a reliable system, development is strictly incremental. **Phase 1** focuses on establishing the **Developer Agent** capability and building a realistic target application: the **Personal Expense Tracker**.

### What Phase 1 Implements
- **Target Application**: Complete, functional Personal Expense Tracker (React 18 + Tailwind CSS frontend; Python 3 + SQLite database backend).
- **Developer Agent Engine**: Automated task definition, self-verification against SQLite and endpoints, and structured artifact logging.
- **Contract Interfaces for Future Phases**: Strict schemas defining how the Developer Agent hands off tasks to the Orchestrator (Phase 2) and Tester (Phase 3).
- **Inspector Drawer**: An in-app agent status viewer displaying the multi-agent hierarchy, artifact history, and interface contracts.

### What is Deliberately Excluded from Phase 1
- **Phase 2 (Orchestrator Agent)**: Workflow coordination, automated task dispatching, and cycle scheduling.
- **Phase 3 (Tester Agent)**: Independent, unprompted automated testing and bug ticket generation.
- **Phase 4 (Human Check-in & Bug Lifecycle)**: Automated bug triage queues and severity matrices.
- **Phase 5 (Autonomous Dev ↔ Test Cycles)**: Self-healing loops where test failures automatically trigger developer fixes.
- **Phase 6 (Cycle Limits & Checkpoints)**: Circuit breakers and quota recovery mechanisms.
- **Phase 7 (Central Dashboard)**: Cross-project metrics and system telemetry.

### Human Supervision Policy in Phase 1
In Phase 1, the human retains direct operational authority:
1. **Git Synchronization**: The human uses AI Studio's repository controls to commit and push changes. The agents do not execute autonomous Git operations.
2. **Review & Guidance**: The human evaluates UI behavior and inspects Developer Agent artifacts.
3. **Execution Control**: The human prompts the next actions and approves phase transitions.

---

## 3. System Architecture & File Hierarchy

```
.
├── README.md                      # Comprehensive project documentation
├── metadata.json                  # AI Studio applet metadata & permissions
├── package.json                   # Node.js dependencies & scripts
├── tsconfig.json                  # TypeScript compiler configuration
├── vite.config.ts                 # Vite setup with Tailwind CSS & /api proxy
│
├── agent_system/                  # Multi-Agent Core Engine & Contracts
│   ├── __init__.py                # Python module initializer
│   ├── schemas.py                 # Pydantic models for tasks, artifacts, & contracts
│   ├── developer_agent.py         # Developer Agent implementation & self-verification
│   ├── tasks_log.json             # Immutable audit log of developer artifacts
│   └── types.ts                   # TypeScript mirror types for agent contracts
│
├── backend/                       # Python & SQLite REST Backend
│   ├── __init__.py                # Python package initializer
│   ├── database.py                # SQLite schema definition, migrations, & seeding
│   ├── expenses.db                # SQLite database file (auto-generated on init)
│   ├── models.py                  # Pydantic models for expense CRUD & summaries
│   ├── main.py                    # FastAPI application implementation
│   └── api_server.py              # Zero-dependency Python 3 standard library REST server
│
├── src/                           # React Frontend (Vite + Tailwind CSS)
│   ├── main.tsx                   # React root entry point
│   ├── App.tsx                    # Main application coordinator & API integration
│   ├── index.css                  # Global Tailwind CSS styles
│   ├── types.ts                   # TypeScript interfaces for expenses & filters
│   └── components/
│       ├── Navbar.tsx             # Header navigation, branding, & action triggers
│       ├── Dashboard.tsx          # Key metrics cards, monthly bars, & category breakdown
│       ├── ExpenseList.tsx        # Search, filters, sort, and responsive expense list
│       ├── ExpenseModal.tsx       # Add / Edit modal dialog with validation
│       └── AgentStatusDrawer.tsx  # In-app agent architecture & artifact inspector
```

---

## 4. Target Application: Personal Expense Tracker

The Personal Expense Tracker provides a real-world testing ground for agent capabilities.

### SQLite Database Schema (`backend/database.py`)

The database uses SQLite 3 with WAL (Write-Ahead Logging) and foreign key enforcement:

```sql
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'USD',  -- Supported: USD ($), EUR (€), extensible to GBP, CHF, CAD, JPY
    category TEXT NOT NULL,
    date TEXT NOT NULL,          -- Format: YYYY-MM-DD
    description TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,    -- ISO-8601 UTC
    updated_at TEXT NOT NULL     -- ISO-8601 UTC
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
```

#### Taxonomy Categories
`Food & Dining`, `Transportation`, `Housing`, `Utilities`, `Entertainment`, `Healthcare`, `Shopping`, `Education`, `Personal`, `Other`.

#### Supported Currencies & Extensibility
Primary currencies are **$ (USD)** and **€ (EUR)**. The currency module in `src/utils/currency.ts` and `/api/currencies` is designed to be easily extensible:
- `SUPPORTED_CURRENCIES` registry with symbol, ISO code, display position (prefix/suffix), and decimal precision.
- Persistent user preference saved in `localStorage`.
- Per-expense currency tracking in SQLite schema with backwards-compatible migration.
- Extensible presets already provisioned for `GBP (£)`, `CHF (CHF)`, `CAD (CA$)`, and `JPY (¥)`.

### REST API Reference

All endpoints are served from the backend (port `8000`) and proxied by Vite on `/api/*`.

| Method | Endpoint | Description | Sample Query / Body |
|---|---|---|---|
| `GET` | `/api/health` | Service health & active agent phase | None |
| `GET` | `/api/currencies` | Returns supported currencies registry | None |
| `GET` | `/api/expenses/categories` | Returns allowed category list | None |
| `GET` | `/api/expenses/summary` | Aggregated totals, monthly bars, category percentages | None |
| `GET` | `/api/expenses` | Query-filtered list of expenses | `?category=Food%20%26%20Dining&search=lunch&sort_by=amount&sort_order=desc` |
| `POST` | `/api/expenses` | Create new expense | `{"amount": 42.50, "currency": "USD", "category": "Food & Dining", "date": "2026-09-07", "description": "Team Lunch"}` |
| `GET` | `/api/expenses/{id}` | Retrieve single expense by ID | None |
| `PUT` | `/api/expenses/{id}` | Update existing expense | `{"amount": 45.00, "currency": "EUR", "description": "Team Lunch (updated)"}` |
| `DELETE`| `/api/expenses/{id}` | Delete expense record | None |
| `GET` | `/api/agent/status` | Current multi-agent system status | None |
| `GET` | `/api/agent/artifacts`| Audit history of developer artifacts | None |

---

## 5. Developer Agent Architecture & Contracts

The Developer Agent is designed around **evidence-based implementation**. When a task is executed, it must not only write code, but also generate verifiable proof of correctness and prepare handoff contracts.

### Pydantic Data Contracts (`agent_system/schemas.py`)

#### 1. `DeveloperTask`
Represents an incoming requirement assigned to the Developer Agent:
- `task_id`: Unique identifier (e.g., `TASK-001`).
- `title`: Short task description.
- `description`: Detailed specification.
- `scope`: Affected layers (`backend`, `frontend`, `database`, `fullstack`).
- `requirements`: List of verifiable acceptance criteria.

#### 2. `VerificationEvidence`
Proof generated by the Developer Agent during self-testing:
- `sqlite_verified`: Boolean confirming database read/write integrity.
- `api_routes_verified`: Boolean confirming endpoint HTTP 200 responses.
- `build_passed`: Boolean confirming frontend TypeScript build cleanliness.
- `verification_log`: Execution logs and terminal output.

#### 3. `TesterContract` (Prepared for Phase 3)
Informs the future **Tester Agent** how to validate the work:
- `ready_for_testing`: `true` when Developer Agent finishes.
- `suggested_test_types`: Protocols to execute (e.g., `api_contract`, `sqlite_crud`, `date_boundary`, `ui_modal_input_validation`).
- `affected_endpoints`: Specific URLs the Tester Agent must probe.
- `known_edge_cases`: Boundary vulnerabilities flagged by the developer (e.g., negative amounts, SQL injection attempts, leap-year dates).

#### 4. `OrchestratorContract` (Prepared for Phase 2)
Informs the future **Orchestrator Agent** about task status:
- `ready_for_review`: `true` when Developer Agent yields control.
- `orchestrator_handoff_state`: `IMPLEMENTATION_READY_FOR_ORCHESTRATION`.
- `blockers`: List of any environmental or dependency constraints encountered.
- `recommended_next_step`: Concrete next phase recommendation.

---

## 6. Day 1 Developer Quickstart & Runbook

Follow these instructions to run and test the project locally or in any Linux/Docker environment.

### Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **Python**: v3.10 or higher (`python3 --version`)
- **SQLite3**: Built-in with Python 3

### Step 1: Initialize the SQLite Database
Run the standalone database script. This creates `backend/expenses.db` with the schema and seed data:
```bash
python3 -m backend.database
```
*Expected Output:*
```
Database initialized at .../backend/expenses.db
```

### Step 2: Start the Python Backend API Server
The backend can be run using either Python's standard library server (`backend/api_server.py`, zero dependencies) or FastAPI (`backend/main.py`):
```bash
# Zero-dependency standard library server:
python3 backend/api_server.py
```
*The server will start listening on `http://127.0.0.1:8000`.*

### Step 3: Start the Vite Development Server
In a separate terminal, start the frontend:
```bash
npm run dev
```
*The Vite dev server will run on `http://0.0.0.0:3000` with `/api` proxying requests to port `8000`.*

### Step 4: Run Developer Agent Self-Verification
Execute the Developer Agent runner to perform end-to-end self-testing and log an artifact:
```bash
python3 -m agent_system.developer_agent
```
*Expected Output:*
```
[DEVELOPER AGENT] Task registered: TASK-001 - Personal Expense Tracker Foundation
[DEVELOPER AGENT] Initializing & testing SQLite database...
[DEVELOPER AGENT] Database verified: 6 records loaded.
[DEVELOPER AGENT] Artifact saved to agent_system/tasks_log.json
[DEVELOPER AGENT] Status: IMPLEMENTATION_VERIFIED
```

### Step 5: Verify the Build & Code Quality
```bash
# Run TypeScript static type checking
npm run lint

# Run production Vite build
npm run build
```

---

## 7. The 7-Phase Roadmap

| Phase | Name | Description | Status |
|---|---|---|---|
| **Phase 1** | **Developer Agent Foundation** | Personal Expense Tracker, SQLite DB, Developer Agent runner, contracts | **ACTIVE / COMPLETE** |
| **Phase 2** | **Orchestrator Agent** | Workflow coordinator; dispatches tasks to Developer Agent based on `OrchestratorContract` | **INTERFACE PREPARED** |
| **Phase 3** | **Tester Agent** | Independent automated test execution using `TesterContract` requirements | **INTERFACE PREPARED** |
| **Phase 4** | **Human Check-in & Bugs** | Structured bug lifecycle, severity levels, and human checkpoint gates | **PLANNED** |
| **Phase 5** | **Dev ↔ Test Feedback Loops** | Autonomous bug resolution cycles without human intervention | **PLANNED** |
| **Phase 6** | **Limits & Checkpointing** | Quota protection, maximum iteration breakers, and state checkpointing | **PLANNED** |
| **Phase 7** | **Central Dashboard** | Multi-project oversight, cross-agent telemetry, and health reporting | **PLANNED** |

---

## 8. Guidance for Day 1 Developers Starting Phase 2

If you are beginning work on **Phase 2 (Orchestrator Agent)**, follow these principles:
1. **Do Not Rewrite Phase 1**: The Developer Agent and Expense Tracker are fully functional. Build the Orchestrator on top of them.
2. **Ingest the Contracts**: Use `agent_system/schemas.py` (`OrchestratorContract`) as the foundation for the Orchestrator's state machine.
3. **Manage Lifecycle States**: Implement the state transitions:
   `TASK_RECEIVED` → `ORCHESTRATOR_DISPATCH` → `DEV_IN_PROGRESS` → `DEV_HANDOFF` → `HUMAN_CHECKPOINT`.
4. **Preserve Human Control**: Keep Git operations manual. The Orchestrator should coordinate development tasks and present clear review points for the human.
