const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const { pool, runMigrations } = require("./config/db");
const connectMongo = require("./config/mongo");
const { errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const searchRoutes = require("./routes/searchRoutes");
const activityRoutes = require("./routes/activityRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: [
			"http://localhost:5173",
			"http://localhost:3000",
			"http://127.0.0.1:5173",
		],
		methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
		credentials: true,
	},
});

// Attach Socket.io instance to Express App instance for controller access
app.set("io", io);

app.use(cors());
app.use(express.json());

/* ------------------------------------------------------------------ */
/* Real-Time Presence & Collaboration State Management                */
/* ------------------------------------------------------------------ */
// Map: workspaceId -> Map(socketId -> { userId, name, avatar })
const workspacePresence = new Map();
const socketWorkspaceMap = new Map();

io.on("connection", (socket) => {
	// 1. Join Workspace Room with User Presence
	socket.on("join_workspace", ({ workspaceId, user } = {}) => {
		if (!workspaceId) return;

		socket.join(workspaceId);
		socketWorkspaceMap.set(socket.id, workspaceId);

		if (!workspacePresence.has(workspaceId)) {
			workspacePresence.set(workspaceId, new Map());
		}

		if (user && user.id) {
			workspacePresence.get(workspaceId).set(socket.id, {
				id: user.id,
				name: user.name || "Collaborator",
				avatar: user.avatar || user.avatar_url || null,
			});
		}

		// Broadcast updated presence list to everyone in this workspace room
		const currentCollaborators = Array.from(
			workspacePresence.get(workspaceId).values(),
		);

		// Deduplicate collaborators by user id
		const uniqueCollaborators = [];
		const seen = new Set();
		for (const c of currentCollaborators) {
			if (!seen.has(c.id)) {
				seen.add(c.id);
				uniqueCollaborators.push(c);
			}
		}

		io.to(workspaceId).emit("presence_update", {
			workspaceId,
			collaborators: uniqueCollaborators,
			count: uniqueCollaborators.length,
		});
	});

	// 2. Leave Workspace Room
	socket.on("leave_workspace", (workspaceId) => {
		socket.leave(workspaceId);
		if (workspacePresence.has(workspaceId)) {
			workspacePresence.get(workspaceId).delete(socket.id);
			const remaining = Array.from(workspacePresence.get(workspaceId).values());
			const unique = [];
			const seen = new Set();
			for (const c of remaining) {
				if (!seen.has(c.id)) {
					seen.add(c.id);
					unique.push(c);
				}
			}
			io.to(workspaceId).emit("presence_update", {
				workspaceId,
				collaborators: unique,
				count: unique.length,
			});
		}
		socketWorkspaceMap.delete(socket.id);
	});

	// 3. Disconnect
	socket.on("disconnect", () => {
		const workspaceId = socketWorkspaceMap.get(socket.id);
		if (workspaceId && workspacePresence.has(workspaceId)) {
			workspacePresence.get(workspaceId).delete(socket.id);
			const remaining = Array.from(workspacePresence.get(workspaceId).values());
			const unique = [];
			const seen = new Set();
			for (const c of remaining) {
				if (!seen.has(c.id)) {
					seen.add(c.id);
					unique.push(c);
				}
			}
			io.to(workspaceId).emit("presence_update", {
				workspaceId,
				collaborators: unique,
				count: unique.length,
			});
		}
		socketWorkspaceMap.delete(socket.id);
	});
});

/* ------------------------------------------------------------------ */
/* REST API Routes                                                    */
/* ------------------------------------------------------------------ */
app.use("/api/auth", authRoutes);
app.use("/api/tickets", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/activity-logs", activityRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
	res.status(200).json({ status: "healthy", timestamp: new Date() });
});

app.use(errorHandler);

const startServer = async () => {
	await runMigrations();
	await connectMongo();

	const PORT = process.env.PORT || 5000;
	server.listen(PORT, () => {
		console.log(`🚀 Production-Grade Agile Server running on port ${PORT}`);
	});
};

if (require.main === module) {
	startServer().catch((err) => {
		console.error("Failed to start server:", err);
	});
}

module.exports = { app, server, startServer };
