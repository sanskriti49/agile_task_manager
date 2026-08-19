const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const isSSLRequired =
	process.env.DATABASE_URL &&
	(process.env.DATABASE_URL.includes("neon.tech") ||
		process.env.DATABASE_URL.includes("sslmode=require") ||
		process.env.NODE_ENV === "production");

const pool = new Pool({
	connectionString:
		process.env.DATABASE_URL ||
		"postgresql://postgres:SANSKWERTY@127.0.0.1:5432/agile_task_manager",
	connectionTimeoutMillis: 10000,
	ssl: isSSLRequired ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => {
	console.log("✅ PostgreSQL connected");
});

pool.on("error", (err) => {
	console.error("Unexpected error on idle client", err);
	process.exit(-1);
});

const fs = require("fs");

const ensureUUIDExtension = async () => {
	try {
		await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
		await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
	} catch (err) {
		// ignore if already exists
	}
};

const runMigrations = async () => {
	try {
		await ensureUUIDExtension();
		const migrationsDir = path.join(__dirname, "../migrations");
		if (fs.existsSync(migrationsDir)) {
			const files = fs.readdirSync(migrationsDir).sort();
			for (const file of files) {
				if (file.endsWith(".sql")) {
					const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
					await pool.query(sql);
					console.log(`✅ Applied migration: ${file}`);
				}
			}
		}
	} catch (err) {
		console.error("Migration error:", err.message);
	}
};

module.exports = { pool, ensureUUIDExtension, runMigrations };
