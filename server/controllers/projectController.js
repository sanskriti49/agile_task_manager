const { pool } = require("../config/db");
const ActivityLog = require("../models/ActivityLog");

/* ------------------------------------------------------------------ */
/* 1. GET ALL PROJECTS FOR LOGGED-IN USER (Dashboard Command Center)   */
/* Endpoint: GET /api/projects                                         */
/* ------------------------------------------------------------------ */
exports.getUserProjects = async (req, res) => {
	const userId = req.user.userId;

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

	if (!name || !name.trim()) {
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

		// C. Set default WIP limits
		const defaultLimits = [
			{ col: 'todo', limit: 10 },
			{ col: 'inprogress', limit: 4 },
			{ col: 'done', limit: 20 },
			{ col: 'backlog', limit: 30 },
		];
		for (const d of defaultLimits) {
			await client.query(
				"INSERT INTO public.project_wip_limits (project_id, column_id, wip_limit) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
				[newProject.id, d.col, d.limit],
			);
		}

		await client.query("COMMIT");

		// D. Log Activity in MongoDB
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
			message: `Created workspace "${newProject.name}"`,
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
                json_agg(DISTINCT jsonb_build_object('id', u.id, 'name', u.name, 'email', u.email, 'avatar', u.avatar_url, 'role', pm.role)) AS members
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

	// B. Fetch all Tasks with subtasks counts, comments counts, and blockers
	const tasksRes = await pool.query(
		`SELECT 
            t.*,
            u.name AS assignee_name,
            u.avatar_url AS assignee_avatar,
            s.name AS sprint_name,
            s.status AS sprint_status,
            COUNT(DISTINCT st.id)::INT AS total_subtasks,
            COUNT(DISTINCT CASE WHEN st.is_completed = TRUE THEN st.id END)::INT AS completed_subtasks,
            COUNT(DISTINCT c.id)::INT AS comments_count,
            COUNT(DISTINCT td.id)::INT AS blockers_count
         FROM public.tasks t
         LEFT JOIN public.users u ON t.assigned_to = u.id
         LEFT JOIN public.sprints s ON t.sprint_id = s.id
         LEFT JOIN public.subtasks st ON t.id = st.task_id
         LEFT JOIN public.comments c ON t.id = c.task_id
         LEFT JOIN public.task_dependencies td ON t.id = td.depends_on_task_id AND td.dependency_type = 'blocks'
         WHERE t.project_id = $1
         GROUP BY t.id, u.name, u.avatar_url, s.name, s.status
         ORDER BY t.position ASC, t.created_at DESC`,
		[projectId],
	);

	// C. Fetch WIP limits
	const wipRes = await pool.query(
		"SELECT column_id, wip_limit FROM public.project_wip_limits WHERE project_id = $1",
		[projectId],
	);
	const wipLimits = {};
	wipRes.rows.forEach((r) => {
		wipLimits[r.column_id] = r.wip_limit;
	});

	// D. Fetch Active Sprint
	const sprintRes = await pool.query(
		"SELECT * FROM public.sprints WHERE project_id = $1 AND status = 'active' LIMIT 1",
		[projectId],
	);

	res.status(200).json({
		...project,
		tasks: tasksRes.rows,
		wipLimits,
		activeSprint: sprintRes.rows[0] || null,
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

	const userRes = await pool.query(
		"SELECT id, name, email, avatar_url FROM public.users WHERE email = $1",
		[email.toLowerCase().trim()],
	);

	if (userRes.rows.length === 0) {
		return res.status(404).json({ message: "No user found with this email" });
	}

	const targetUser = userRes.rows[0];

	const existingMember = await pool.query(
		"SELECT * FROM public.projects_members WHERE project_id = $1 AND user_id = $2",
		[projectId, targetUser.id],
	);

	if (existingMember.rows.length > 0) {
		return res
			.status(409)
			.json({ message: "User is already a member of this project" });
	}

	await pool.query(
		"INSERT INTO public.projects_members (project_id, user_id, role) VALUES ($1, $2, $3)",
		[projectId, targetUser.id, role],
	);

	const actorRes = await pool.query(
		"SELECT name FROM public.users WHERE id = $1",
		[actorId],
	);
	const actorName = actorRes.rows[0]?.name || "Admin";

	// Notification to target user
	await pool.query(
		`INSERT INTO public.notifications (user_id, actor_id, project_id, type, title, message)
         VALUES ($1, $2, $3, 'assignment', $4, $5)`,
		[
			targetUser.id,
			actorId,
			projectId,
			"Added to Project",
			`${actorName} added you to the project as ${role}.`,
		],
	);

	await ActivityLog.create({
		projectId,
		userId: actorId,
		userName: actorName,
		action: "PROJECT_MEMBER_ADDED",
		message: `Added ${targetUser.name} to the project as ${role}`,
		newValue: { addedUserId: targetUser.id, role },
	}).catch((err) => console.error("MongoDB ActivityLog Error:", err));

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

/* ------------------------------------------------------------------ */
/* 6. SET WIP LIMITS                                                  */
/* Endpoint: PUT /api/projects/:projectId/wip-limits                   */
/* ------------------------------------------------------------------ */
exports.setWipLimits = async (req, res) => {
	const { projectId } = req.params;
	const { columnId, limit } = req.body;

	if (!columnId || limit === undefined) {
		return res.status(400).json({ message: "columnId and limit are required" });
	}

	await pool.query(
		`INSERT INTO public.project_wip_limits (project_id, column_id, wip_limit)
         VALUES ($1, $2, $3)
         ON CONFLICT (project_id, column_id) DO UPDATE SET wip_limit = EXCLUDED.wip_limit`,
		[projectId, columnId, parseInt(limit, 10)],
	);

	res.status(200).json({ message: "WIP limit updated", columnId, limit });
};

/* ------------------------------------------------------------------ */
/* 7. REMOVE MEMBER FROM PROJECT                                      */
/* Endpoint: DELETE /api/projects/:projectId/members/:userId          */
/* ------------------------------------------------------------------ */
exports.removeProjectMember = async (req, res) => {
	const { projectId, userId } = req.params;
	const actorId = req.user.userId;

	const memberCheck = await pool.query(
		"SELECT role FROM public.projects_members WHERE project_id = $1 AND user_id = $2",
		[projectId, userId],
	);

	if (memberCheck.rows.length === 0) {
		return res.status(404).json({ message: "Member not found in this project" });
	}

	if (memberCheck.rows[0].role === "owner") {
		return res.status(400).json({ message: "Cannot remove project owner" });
	}

	await pool.query(
		"DELETE FROM public.projects_members WHERE project_id = $1 AND user_id = $2",
		[projectId, userId],
	);

	// Unassign any tasks in this project
	await pool.query(
		"UPDATE public.tasks SET assigned_to = NULL WHERE project_id = $1 AND assigned_to = $2",
		[projectId, userId],
	);

	const io = req.app.get("io");
	if (io) {
		io.to(projectId).emit("member_removed", { projectId, userId });
	}

	res.status(200).json({ message: "Member removed from workspace", userId });
};

/* ------------------------------------------------------------------ */
/* 8. UPDATE MEMBER ROLE                                              */
/* Endpoint: PATCH /api/projects/:projectId/members/:userId           */
/* ------------------------------------------------------------------ */
exports.updateMemberRole = async (req, res) => {
	const { projectId, userId } = req.params;
	const { role } = req.body;

	if (!role || !["owner", "admin", "member", "viewer"].includes(role)) {
		return res.status(400).json({ message: "Invalid role specified" });
	}

	await pool.query(
		"UPDATE public.projects_members SET role = $1 WHERE project_id = $2 AND user_id = $3",
		[role, projectId, userId],
	);

	res.status(200).json({ message: "Role updated successfully", userId, role });
};

/* ------------------------------------------------------------------ */
/* 9. DELETE PROJECT / WORKSPACE                                      */
/* Endpoint: DELETE /api/projects/:projectId                          */
/* ------------------------------------------------------------------ */
exports.deleteProject = async (req, res) => {
	const { projectId } = req.params;
	const userId = req.user.userId;

	const memberRes = await pool.query(
		"SELECT role FROM public.projects_members WHERE project_id = $1 AND user_id = $2",
		[projectId, userId],
	);

	if (
		memberRes.rows.length === 0 ||
		!["owner", "admin"].includes(memberRes.rows[0].role)
	) {
		return res.status(403).json({
			message: "Only workspace owners/admins can delete a workspace",
		});
	}

	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		await client.query(
			"DELETE FROM public.task_dependencies WHERE task_id IN (SELECT id FROM public.tasks WHERE project_id = $1)",
			[projectId],
		);
		await client.query(
			"DELETE FROM public.subtasks WHERE task_id IN (SELECT id FROM public.tasks WHERE project_id = $1)",
			[projectId],
		);
		await client.query("DELETE FROM public.comments WHERE project_id = $1", [
			projectId,
		]);
		await client.query("DELETE FROM public.notifications WHERE project_id = $1", [
			projectId,
		]);
		await client.query("DELETE FROM public.project_wip_limits WHERE project_id = $1", [
			projectId,
		]);
		await client.query("DELETE FROM public.tasks WHERE project_id = $1", [
			projectId,
		]);
		await client.query("DELETE FROM public.sprints WHERE project_id = $1", [
			projectId,
		]);
		await client.query("DELETE FROM public.projects_members WHERE project_id = $1", [
			projectId,
		]);
		await client.query("DELETE FROM public.projects WHERE id = $1", [
			projectId,
		]);
		await client.query("COMMIT");

		res.status(200).json({ message: "Workspace deleted successfully", projectId });
	} catch (err) {
		await client.query("ROLLBACK");
		throw err;
	} finally {
		client.release();
	}
};

/* ------------------------------------------------------------------ */
/* 10. SEARCH ALL PLATFORM USERS (For Member Invitations)             */
/* Endpoint: GET /api/projects/users/search                           */
/* ------------------------------------------------------------------ */
exports.searchAllUsers = async (req, res) => {
	const q = req.query.q || "";
	const result = await pool.query(
		`SELECT id, name, email, avatar_url 
         FROM public.users 
         WHERE name ILIKE $1 OR email ILIKE $1 
         ORDER BY name ASC 
         LIMIT 20`,
		[`%${q.trim()}%`],
	);
	res.status(200).json(result.rows);
};
