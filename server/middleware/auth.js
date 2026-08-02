const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const authenticate = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ message: "Unauthorized: Missing token" });
	}

	const token = authHeader.split(" ")[1];
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded; // Contains userId and email
		next();
	} catch (err) {
		return res.status(401).json({ message: "Unauthorized: Invalid token" });
	}
};

const requireProjectMember = async (req, res, next) => {
	let projectId =
		req.params.projectId || req.body.projectId || req.query.projectId;

	const userId = req.user.userId;
	// Fallback: If no explicit projectId passed but taskId exists in params
	if (!projectId && req.params.taskId) {
		const taskRes = await pool.query(
			"SELECT project_id FROM public.tasks WHERE id = $1",
			[req.params.taskId],
		);
		projectId = taskRes.rows[0]?.project_id;
	}

	if (!projectId) {
		return res.status(400).json({ message: "Project ID is required" });
	}

	try {
		const memberResult = await pool.query(
			"SELECT role FROM public.projects_members WHERE project_id = $1 AND user_id = $2",
			[projectId, userId],
		);

		if (memberResult.rows.length === 0) {
			return res
				.status(403)
				.json({ message: "Forbidden: You are not a member of this project" });
		}

		req.projectRole = memberResult.rows[0].role;
		next();
	} catch (err) {
		next(err);
	}
};

module.exports = { authenticate, requireProjectMember };
