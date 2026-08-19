# ⚡ FLUX Agile — Enterprise Collaborative Project Management Platform

> An enterprise-grade, real-time Agile Project Management & Collaboration Platform inspired by **Linear**, **Jira**, and **Trello**, built with a high-performance **Polyglot Database Architecture** (PostgreSQL + MongoDB), **Socket.io** live presence synchronization, and **React 19** frontend.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Tier (React 19 + Tailwind CSS + Zustand)"]
        UI[Modern Linear-Style UI]
        Theme[Dark / Light Mode Engine]
        CmdK[Command Palette & Shortcuts]
        Kanban[Drag & Drop Kanban Board]
        Sprints[Sprint Backlog & Burndown]
        Analytics[Smart Project Analytics]
        MyWork[Personal My Work View]
        Presence[Live Collaborator Presence]
    end

    subgraph API ["Server Tier (Node.js + Express)"]
        Auth[JWT Auth & RBAC Guard]
        TaskCtrl[Task & Subtask Manager]
        DepCtrl[Cycle-Safe Dependencies Engine]
        SprintCtrl[Scrum Sprint Lifecycle]
        SearchCtrl[Global Search Engine]
        NotifyCtrl[In-App Mentions & Notification Engine]
        SocketServer[Socket.io Real-Time Hub]
    end

    subgraph Data ["Polyglot Storage Tier"]
        Postgres[(PostgreSQL 17/18 - ACID Relational Data)]
        Mongo[(MongoDB - Event Sourcing & Audit Logs)]
    end

    UI --> SocketServer
    UI --> Auth
    Auth --> Postgres
    TaskCtrl --> Postgres
    DepCtrl --> Postgres
    SprintCtrl --> Postgres
    SearchCtrl --> Postgres
    NotifyCtrl --> Postgres
    TaskCtrl --> Mongo
    SprintCtrl --> Mongo
    SocketServer --> UI
```

---

## 💎 Key Features & Capabilities

### 1. 📊 Smart Project Analytics Dashboard
- **Delivery Velocity & Burndown**: Computed directly from PostgreSQL timestamps and story points.
- **Visual Status & Priority Distribution**: Dynamic SVG charts breakdown issues by backlog, todo, in_progress, done, and high/med/low priority.
- **Team Workload Matrix**: Instant visibility into active vs. completed tasks per engineer.
- **Active Sprint Health**: Single-click sprint burndown progression tracking.

### 2. 🔥 Sprints & Agile Scrum Management
- **Single-Active Sprint Constraint**: Guarantees sprint cycle integrity by preventing multiple concurrent active sprints per project.
- **Burndown Chart Visualizer**: Day-by-day ideal burndown guideline vs. actual remaining story points.
- **Sprint Lifecycle**: Smooth transitions from `planned` ➔ `active` ➔ `completed` with uncompleted task rollover to backlog.

### 3. 🛡️ Kanban Board with Configurable WIP Limits
- **Column WIP Limit Safeguards**: Enforces Lean workflow discipline by highlighting exceeded column limits in real-time.
- **Smooth Drag-and-Drop**: Multi-column DnD with optimistic client-side transitions and rollback on network errors.
- **Multi-Dimensional Filters**: Instant client-side & server-side filtering by Assignee, Priority, Sprint, Label, and Due Date.

### 4. 🔗 Subtasks & Circular Dependency Prevention
- **Subtask Checklists**: Interactive nested subtask items with completion percentages.
- **Dependencies Manager**: Link tasks as **Blocks** or **Blocked By** with cycle detection algorithms preventing deadlocks.

### 5. 🔔 In-App Notifications & `@Mention` Triggers
- **Rich Comments with `@User` Highlights**: Type `@Name` in task comments to trigger real-time notifications for teammates.
- **Notification Dropdown**: Instant unread badge counter, mark-as-read triggers, and direct navigation.

### 6. 👤 Personal "My Work" Command Center
- **Unified Assignee Hub**: All issues assigned to the logged-in user across all projects grouped by Due Date, Overdue status, and Priority.

### 7. 👥 Real-Time Collaborator Presence & Heartbeat
- **Live User Avatars**: Active teammates viewing a project board are displayed in real-time via Socket.io presence rooms.

### 8. ⌨️ Command Palette (`Ctrl + K`) & Keyboard Shortcuts (`?`)
- **Frictionless Navigation**: Instant global search, quick actions, theme toggle, and keyboard shortcuts modal.

### 9. 🌓 First-Class Dark Mode
- Seamless Slate / Zinc dark theme persisted in localStorage with system preference fallback.

---

## 🗄️ Polyglot Database Architecture

| Database | Technology | Purpose & Data Responsibility |
| :--- | :--- | :--- |
| **Relational Core** | **PostgreSQL** | • Users, Projects, Project Memberships (RBAC)<br>• Sprints, Tasks, Subtasks<br>• Task Dependencies (with foreign key constraints)<br>• Notifications & WIP Limits |
| **Event / Audit Log** | **MongoDB** | • Append-only historical event stream (`ActivityLog`)<br>• Fast paginated audit queries for project drawers<br>• Schema-agnostic metadata changes (`oldValue`, `newValue`) |

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js**: v18.x or v20+
- **PostgreSQL**: Local instance running on port `5432`
- **MongoDB**: Local instance running on port `27017`

### 2. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/sanskriti49/agile_task_manager.git
cd agile-task-manager

# Install Backend Dependencies
cd server
npm install

# Install Frontend Dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables

**`server/.env`**:
```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=agile_task_manager
DATABASE_URL=postgresql://postgres:your_postgres_password@127.0.0.1:5432/agile_task_manager
MONGO_URI=mongodb://127.0.0.1:27017/agile_logs
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_client_id
```

**`client/.env`**:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Run Migrations & Seed Sample Data
```bash
cd server

# Run PostgreSQL Migrations & Seed Demo Data
node scripts/seed.js
```

### 5. Start Development Servers

In terminal 1 (Backend):
```bash
cd server
npm run dev
```

In terminal 2 (Frontend):
```bash
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Lead Engineer** | Sanskriti Gupta | `sanskriti@flux.dev` | `password123` |
| **Product Designer** | Aria Chen | `aria@flux.dev` | `password123` |
| **Backend Architect** | Rohan Mehta | `rohan@flux.dev` | `password123` |
| **Frontend Specialist**| Priya Nair | `priya@flux.dev` | `password123` |

---

## 🧪 Automated Test Suite

The platform includes an automated end-to-end API test suite validating authentication, RBAC authorization, sprint single-active constraints, circular dependency prevention, subtasks CRUD, and global search:

```bash
cd server
node tests/api.test.js
```

**Test Output:**
```
🧪 Starting Automated Agile API Tests...

✅ PostgreSQL connected
✅ Applied migration: 0001_create_tables.sql
✅ Applied migration: 0002_agile_features.sql
✅ MongoDB connected
📡 Test server listening at http://127.0.0.1:50637

▶ 1. Testing Authentication (Signup, Login, Validation)...
  ✅ Authentication passed

▶ 2. Testing Authorization & RBAC Guard...
  ✅ Authorization guard passed

▶ 3. Testing Project/Workspace Creation & Membership...
  ✅ Projects creation & listing passed

▶ 4. Testing Sprint Lifecycle & Single Active Sprint Rule...
  ✅ Sprint lifecycle & active constraint passed

▶ 5. Testing Task Creation, Story Points, Tags, & Status Updates...
  ✅ Task creation & updates passed

▶ 6. Testing Task Dependencies & Cycle Prevention...
  ✅ Task dependencies & cycle checks passed

▶ 7. Testing Subtasks CRUD...
  ✅ Subtasks operations passed

▶ 8. Testing Global Search & Analytics Endpoints...
  ✅ Search & Analytics passed

🎉 ALL 8 TEST SUITES PASSED WITH 100% SUCCESS!
```

---

## 📄 License
This project is open-source and available under the [ISC License](LICENSE).
