const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

// FIX: Destructure { pool } from ../config/db to match module.exports = { pool, ensureUUIDExtension }
const { pool } = require("../config/db");

const router = express.Router();
const googleClient = new OAuth2Client();
/* ------------------------------------------------------------------ */
/* 1. GOOGLE OAUTH LOGIN/SIGNUP                                       */
/* Endpoint: POST /api/auth/google                                    */
/* ------------------------------------------------------------------ */
router.post("/google", async (req, res) => {
	const { token } = req.body;

	if (!token) {
		return res.status(400).json({ message: "Token is required" });
	}

	try {
		const ticket = await googleClient.verifyIdToken({
			idToken: token,
			audience: process.env.GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload();
		const { sub: googleId, email, name, picture } = payload;
		const cleanEmail = email.toLowerCase().trim();

		let userResult = await pool.query(
			"SELECT * FROM public.users WHERE email = $1",
			[cleanEmail],
		);
		let user = userResult.rows[0];

		if (!user) {
			const newUser = await pool.query(
				`INSERT INTO public.users (name, email, google_id, avatar_url) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING id, name, email, avatar_url`,
				[name.trim(), cleanEmail, googleId, picture],
			);
			user = newUser.rows[0];
		} else if (!user.google_id) {
			const updatedUser = await pool.query(
				`UPDATE public.users 
                 SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) 
                 WHERE id = $3 
                 RETURNING id, name, email, avatar_url`,
				[googleId, picture, user.id],
			);
			user = updatedUser.rows[0];
		}

		const appToken = jwt.sign(
			{ userId: user.id, email: user.email },
			process.env.JWT_SECRET,
			{ expiresIn: "7d" },
		);

		return res.status(200).json({
			message: "Authentication successful",
			token: appToken,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				avatar: user.avatar_url,
			},
		});
	} catch (error) {
		console.error("Google token verification error:", error);
		return res.status(401).json({ message: "Invalid Google token" });
	}
});

/* ------------------------------------------------------------------ */
/* 2. STANDARD EMAIL/PASSWORD SIGNUP                                 */
/* Endpoint: POST /api/auth/signup                                   */
/* ------------------------------------------------------------------ */
router.post("/signup", async (req, res) => {
	const { name, email, password } = req.body;

	if (!name || !email || !password) {
		return res
			.status(400)
			.json({ message: "Name, email, and password are required" });
	}

	const cleanEmail = email.toLowerCase().trim();

	try {
		const existingUser = await pool.query(
			"SELECT id FROM public.users WHERE email = $1",
			[cleanEmail],
		);
		if (existingUser.rows.length > 0) {
			return res
				.status(409)
				.json({ message: "An account with this email already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = await pool.query(
			`INSERT INTO public.users (name, email, password) 
             VALUES ($1, $2, $3) 
             RETURNING id, name, email, avatar_url`,
			[name.trim(), cleanEmail, hashedPassword],
		);

		const user = newUser.rows[0];
		const token = jwt.sign(
			{ userId: user.id, email: user.email },
			process.env.JWT_SECRET,
			{ expiresIn: "7d" },
		);

		return res.status(201).json({
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				avatar: user.avatar_url,
			},
		});
	} catch (error) {
		console.error("Signup error:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
});

/* ------------------------------------------------------------------ */
/* 3. STANDARD EMAIL/PASSWORD LOGIN                                  */
/* Endpoint: POST /api/auth/login                                    */
/* ------------------------------------------------------------------ */
router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ message: "Email and password are required" });
	}

	const cleanEmail = email.toLowerCase().trim();

	try {
		const result = await pool.query(
			"SELECT * FROM public.users WHERE email = $1",
			[cleanEmail],
		);
		const user = result.rows[0];

		if (!user) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		if (!user.password) {
			return res.status(400).json({
				message:
					"This account was created with Google. Please sign in using Google.",
			});
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		const token = jwt.sign(
			{ userId: user.id, email: user.email },
			process.env.JWT_SECRET,
			{ expiresIn: "7d" },
		);

		return res.status(200).json({
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				avatar: user.avatar_url,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
});

module.exports = router;
