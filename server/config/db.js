const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
	console.log("✅ PostgreSQL connected");
});

pool.on("error", (err) => {
	console.error("Unexpected error on idle client", err);
	process.exit(-1);
});

const ensureUUIDExtension = async () => {
	try {
		await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
		console.log("UUID extension ready");
	} catch (err) {
		console.warn(
			"Could not create uuid-ossp extension – maybe already exists or not needed.",
		);
	}
};

module.exports = { pool, ensureUUIDExtension };
