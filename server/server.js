const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const { pool, ensureUUIDExtension } = require("./config/db");
const connectMongo = require("./config/mongo");
const { errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
	cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});
// Attach Socket.io instance to Express App instance for controller access
app.set("io", io);

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
	socket.on("join_workspace", (workspaceId) => {
		socket.join(workspaceId);
	});
	socket.on("disconnect", () => {});
});

app.use("/api/auth", authRoutes);
app.use("/api/tickets", taskRoutes);
app.use("/api/projects", projectRoutes);

app.use(errorHandler);

const startServer = async () => {
	await ensureUUIDExtension();
	await connectMongo();

	server.listen(process.env.PORT || 5000, () => {
		console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
	});
};

startServer().catch((err) => {
	console.error("Failed to start server:", err);
});
