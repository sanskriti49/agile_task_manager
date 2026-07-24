```markdown
# 🚀 Agile Task Manager

A full‑stack Kanban‑style project management tool built for real‑time team collaboration.  
Drag tasks across columns, chat via comments, and see every change appear instantly – all while leveraging a polyglot database architecture (PostgreSQL for structured data, MongoDB for activity logs).

---

## ✨ Features

- **User Authentication** – Register/Login with JWT‑based auth.
- **Project Management** – Create projects and invite team members (Admin/Member roles).
- **Kanban Board** – Visualise tasks in **Backlog**, **To Do**, **In Progress**, and **Done** columns.
- **Drag & Drop** – Seamless reordering and status updates using `@hello-pangea/dnd` with **optimistic UI**.
- **Real‑time Sync** – WebSocket (Socket.io) broadcasts task moves, comments, and activity instantly to all connected clients.
- **Activity Logs** – Every action (create, move, assign, comment) is stored in a MongoDB collection for full audit history.
- **Role‑Based Access Control (RBAC)** – Admins can delete tasks and manage members; Members can create and move tasks.
- **Polyglot Persistence** – PostgreSQL for relational core data, MongoDB for high‑volume unstructured logs.

---

## 🛠 Tech Stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| Frontend     | React, `@hello-pangea/dnd`, Socket.io Client    |
| Backend      | Node.js, Express, Socket.io                     |
| Databases    | PostgreSQL (main data), MongoDB (activity logs) |
| Auth         | JSON Web Tokens, bcryptjs                       |
| ORM / Driver | `pg` (raw SQL), Mongoose                        |

---

## 📁 Project Structure
```

agile-task-manager/
├── client/ # React app
│ ├── public/
│ └── src/
│ ├── components/ # Board, Card, ActivityFeed, Modals...
│ ├── hooks/ # useSocket, useOptimistic...
│ ├── services/ # API calls, socket client
│ └── ...
├── server/
│ ├── config/
│ │ ├── db.js # PostgreSQL pool
│ │ └── mongo.js # Mongoose connection
│ ├── models/
│ │ └── ActivityLog.js # Mongoose schema for logs
│ ├── routes/
│ │ ├── auth.js
│ │ ├── projects.js
│ │ ├── tasks.js
│ │ └── comments.js
│ ├── controllers/
│ ├── middleware/ # auth middleware, rbac
│ ├── socket.js # Socket.io event handlers
│ └── index.js # Entry point
├── .env
└── README.md

````

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **PostgreSQL** (v13+ recommended for `gen_random_uuid()`)
- **MongoDB** (v6+)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/agile-task-manager.git
   cd agile-task-manager
````

2. **Install backend dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**  
   Create a `.env` file inside the `server/` directory:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://youruser:yourpassword@localhost:5432/agile_db
   MONGO_URI=mongodb://localhost:27017/agile_logs
   JWT_SECRET=your_super_secret_key_change_me
   ```

### Database Setup

#### PostgreSQL

1. Create a new database (e.g. `agile_db`).
2. Run the following SQL to create the required tables:

   ```sql
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";

   CREATE TABLE users (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       name VARCHAR(100) NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       created_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE TABLE projects (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       name VARCHAR(100) NOT NULL,
       description TEXT,
       created_by UUID REFERENCES users(id) ON DELETE SET NULL,
       created_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE TABLE projects_members (
       project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
       user_id UUID REFERENCES users(id) ON DELETE CASCADE,
       role VARCHAR(20) DEFAULT 'member',
       joined_at TIMESTAMPTZ DEFAULT NOW(),
       PRIMARY KEY (project_id, user_id)
   );

   CREATE TABLE tasks (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
       title VARCHAR(255) NOT NULL,
       description TEXT,
       status VARCHAR(30) DEFAULT 'todo',
       priority VARCHAR(20) DEFAULT 'medium',
       assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
       created_by UUID REFERENCES users(id) ON DELETE SET NULL,
       position INTEGER DEFAULT 0,
       created_at TIMESTAMPTZ DEFAULT NOW(),
       updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE TABLE comments (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
       author_id UUID REFERENCES users(id) ON DELETE CASCADE,
       body TEXT NOT NULL,
       created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

#### MongoDB

Make sure MongoDB is running. The first time you start the server, Mongoose will automatically create the `activitylogs` collection.

### Running the App

1. **Start the backend**

   ```bash
   cd server
   npm run dev      # starts with nodemon (or node index.js)
   ```

2. **Start the frontend**
   ```bash
   cd client
   npm start        # runs on http://localhost:3000
   ```

Open [http://localhost:3000](http://localhost:3000) and you’re ready to collaborate!

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             | Description        |
| ------ | -------------------- | ------------------ |
| POST   | `/api/auth/register` | Create new user    |
| POST   | `/api/auth/login`    | Login, returns JWT |

### Projects

| Method | Endpoint                    | Description                       |
| ------ | --------------------------- | --------------------------------- |
| GET    | `/api/projects`             | Get all projects for current user |
| POST   | `/api/projects`             | Create a new project              |
| GET    | `/api/projects/:id`         | Get project details + members     |
| POST   | `/api/projects/:id/members` | Add a member (admin only)         |

### Tasks

| Method | Endpoint                  | Description                          |
| ------ | ------------------------- | ------------------------------------ |
| GET    | `/api/projects/:id/tasks` | Get tasks (can filter by `?status=`) |
| POST   | `/api/projects/:id/tasks` | Create a new task                    |
| PATCH  | `/api/tasks/:id`          | Update status / position / assignee  |
| DELETE | `/api/tasks/:id`          | Delete a task (admin only)           |

### Comments

| Method | Endpoint                  | Description      |
| ------ | ------------------------- | ---------------- |
| GET    | `/api/tasks/:id/comments` | Get all comments |
| POST   | `/api/tasks/:id/comments` | Add a comment    |

### Activity

| Method | Endpoint                     | Description                         |
| ------ | ---------------------------- | ----------------------------------- |
| GET    | `/api/projects/:id/activity` | Retrieve activity logs from MongoDB |

---

## 📡 Real‑time Events (Socket.io)

Clients join a room named `project-{projectId}` after opening a project.

**Emitted by server:**

- `task:updated` – task moved/edited
- `task:created` – new task added
- `task:deleted` – task removed
- `comment:added` – new comment
- `activity:new` – new activity log entry

**Emitted by client:**

- `join-project` – joins the room

---

## 🧪 How to Use

1. **Register** and **login**.
2. Create a new project and invite team members (by email).
3. The board is initially empty. Add tasks using the “+ New Task” button.
4. **Drag tasks** between columns to update their status. The change saves instantly.
5. Click on a task to see details, comments, and assignment.
6. The right‑side activity feed shows a live log of everything happening in the project.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and open a Pull Request with your improvements.

---

## 📄 License

This project is licensed under the MIT License – feel free to use it for your own learning or portfolio.

---

## 🙋‍♂️ Resume‑worthy Highlights

> **Agile Task Manager** | _React, Node.js, Express, PostgreSQL, MongoDB, Socket.io_
>
> - Engineered a full‑stack project management tool with a drag‑and‑drop Kanban board using React and `@hello-pangea/dnd`.
> - Designed a polyglot database architecture: PostgreSQL for relational data, MongoDB for unstructured audit logs.
> - Implemented real‑time synchronisation via WebSockets (Socket.io) for instant task updates and activity feeds.
> - Added Role‑Based Access Control (RBAC) to restrict project management actions to Admin users.

```

This README is ready to drop into your project root. Let me know if you’d like any section expanded or tailored!
```
