const { pool } = require("../config/db");
const ActivityLog = require("../models/ActivityLog");

/* ------------------------------------------------------------------ */
/* 1. GET ALL PROJECTS FOR LOGGED-IN USER (Dashboard Command Center)   */
/* Endpoint: GET /api/projects                                         */
/* ------------------------------------------------------------------ */
exports.getUserProjects = async (req, res) => {
	const userId = req.user.userId;

	// Fetch projects where the user is a member, along with active & total task counts
	const query = `
        SELECT 
            p.id,
            p.name,
            p.description,
            p.created_at,
            pm.role,
            COUNT(t.id)::INT AS total_tickets,
            COUNT(CASE WHEN t.status != 'done' THEN 1 END)::INT AS active_tickets,
            COUNT(CASE WHEN t.status = 'done' THEN 1 END)::INT AS completed_tickets
        FROM public.projects p
        JOIN public.projects_members pm ON p.id = pm.project_id
        LEFT JOIN public.tasks t ON p.id = t.project_id
        WHERE pm.user_id = $1
        GROUP BY p.id, pm.role
        ORDER BY p.created_at DESC;
    `;

	const result = await pool.query(query, [userId]);
	res.status(200).json(result.rows);
};

/* ------------------------------------------------------------------ */
/* 2. CREATE A NEW PROJECT / WORKSPACE                                */
/* Endpoint: POST /api/projects                                       */
/* ------------------------------------------------------------------ */
exports.createProject = async (req, res) => {
	const { name, description } = req.body;
	const userId = req.user.userId;

	if (!name) {
		return res.status(400).json({ message: "Project name is required" });
	}

	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		// A. Insert Project
		const projectRes = await client.query(
			`INSERT INTO public.projects (name, description, created_by) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
			[name.trim(), description || "", userId],
		);
		const newProject = projectRes.rows[0];

		// B. Add Creator as 'owner' in projects_members
		await client.query(
			`INSERT INTO public.projects_members (project_id, user_id, role) 
             VALUES ($1, $2, 'owner')`,
			[newProject.id, userId],
		);

		await client.query("COMMIT");

		// C. Log Activity in MongoDB
		const userRes = await pool.query(
			"SELECT name FROM public.users WHERE id = $1",
			[userId],
		);
		const userName = userRes.rows[0]?.name || "User";

		await ActivityLog.create({
			projectId: newProject.id,
			userId,
			userName,
			action: "PROJECT_MEMBER_ADDED",
			message: `Created project "${newProject.name}"`,
			newValue: { role: "owner" },
		}).catch((err) => console.error("MongoDB ActivityLog Error:", err));

		res.status(201).json(newProject);
	} catch (error) {
		await client.query("ROLLBACK");
		throw error;
	} finally {
		client.release();
	}
};

/* ------------------------------------------------------------------ */
/* 3. GET SINGLE PROJECT DETAILS & BOARD DATA                          */
/* Endpoint: GET /api/projects/:projectId                             */
/* ------------------------------------------------------------------ */
exports.getProjectById = async (req, res) => {
	const { projectId } = req.params;

	// A. Fetch Project details and member list
	const projectRes = await pool.query(
		`SELECT p.*, 
                json_agg(json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'avatar', u.avatar_url, 'role', pm.role)) AS members
         FROM public.projects p
         JOIN public.projects_members pm ON p.id = pm.project_id
         JOIN public.users u ON pm.user_id = u.id
         WHERE p.id = $1
         GROUP BY p.id`,
		[projectId],
	);

	if (projectRes.rows.length === 0) {
		return res.status(404).json({ message: "Project not found" });
	}

	const project = projectRes.rows[0];

	// B. Fetch all Tasks associated with this project
	const tasksRes = await pool.query(
		`SELECT t.*, u.name AS assignee_name, u.avatar_url AS assignee_avatar
         FROM public.tasks t
         LEFT JOIN public.users u ON t.assigned_to = u.id
         WHERE t.project_id = $1
         ORDER BY t.position ASC, t.created_at DESC`,
		[projectId],
	);

	res.status(200).json({
		...project,
		tasks: tasksRes.rows,
	});
};

/* ------------------------------------------------------------------ */
/* 4. ADD A MEMBER TO A PROJECT                                       */
/* Endpoint: POST /api/projects/:projectId/members                    */
/* ------------------------------------------------------------------ */
exports.addProjectMember = async (req, res) => {
	const { projectId } = req.params;
	const { email, role = "member" } = req.body;
	const actorId = req.user.userId;

	if (!email) {
		return res.status(400).json({ message: "User email is required" });
	}

	// A. Find user by email
	const userRes = await pool.query(
		"SELECT id, name, email, avatar_url FROM public.users WHERE email = $1",
		[email.toLowerCase().trim()],
	);

	if (userRes.rows.length === 0) {
		return res.status(404).json({ message: "No user found with this email" });
	}

	const targetUser = userRes.rows[0];

	// B. Check if user is already a member
	const existingMember = await pool.query(
		"SELECT * FROM public.projects_members WHERE project_id = $1 AND user_id = $2",
		[projectId, targetUser.id],
	);

	if (existingMember.rows.length > 0) {
		return res
			.status(409)
			.json({ message: "User is already a member of this project" });
	}

	// C. Add user to projects_members
	await pool.query(
		"INSERT INTO public.projects_members (project_id, user_id, role) VALUES ($1, $2, $3)",
		[projectId, targetUser.id, role],
	);

	// D. Fetch actor name for audit log
	const actorRes = await pool.query(
		"SELECT name FROM public.users WHERE id = $1",
		[actorId],
	);
	const actorName = actorRes.rows[0]?.name || "Admin";

	// E. Log Activity in MongoDB
	await ActivityLog.create({
		projectId,
		userId: actorId,
		userName: actorName,
		action: "PROJECT_MEMBER_ADDED",
		message: `Added ${targetUser.name} to the project as ${role}`,
		newValue: { addedUserId: targetUser.id, role },
	}).catch((err) => console.error("MongoDB ActivityLog Error:", err));

	// F. Emit Socket.io event if connected
	const io = req.app.get("io");
	if (io) {
		io.to(projectId).emit("member_added", {
			projectId,
			user: targetUser,
			role,
		});
	}

	res.status(201).json({
		message: "Member added successfully",
		member: { ...targetUser, role },
	});
};

/* ------------------------------------------------------------------ */
/* 5. UPDATE PROJECT (Rename Workspace)                               */
/* Endpoint: PATCH /api/projects/:projectId                           */
/* ------------------------------------------------------------------ */
exports.updateProject = async (req, res) => {
	const { projectId } = req.params;
	const { name, description } = req.body;

	if (!name || !name.trim()) {
		return res.status(400).json({ message: "Project name cannot be empty" });
	}

	const result = await pool.query(
		`UPDATE public.projects 
         SET name = COALESCE($1, name), 
             description = COALESCE($2, description)
         WHERE id = $3 
         RETURNING *`,
		[name.trim(), description, projectId],
	);

	if (result.rows.length === 0) {
		return res.status(404).json({ message: "Project not found" });
	}

	res.status(200).json(result.rows[0]);
};
