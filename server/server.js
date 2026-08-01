const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const { pool, ensureUUIDExtension } = require("./config/db");
const connectMongo = require("./config/mongo");

const authRoutes = require("./routes/auth");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

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
