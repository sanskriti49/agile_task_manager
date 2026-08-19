const { pool } = require("../config/db");
const ActivityLog = require("../models/ActivityLog");

/* ------------------------------------------------------------------ */
/* 1. GET ALL SPRINTS FOR A PROJECT                                    */
/* Endpoint: GET /api/projects/:projectId/sprints                     */
/* ------------------------------------------------------------------ */
exports.getProjectSprints = async (req, res) => {
	const { projectId } = req.params;

	const query = `
        SELECT 
            s.*,
            COUNT(t.id)::INT AS total_tasks,
            COUNT(CASE WHEN t.status = 'done' THEN 1 END)::INT AS completed_tasks,
            COALESCE(SUM(t.story_points), 0)::INT AS total_points,
            COALESCE(SUM(CASE WHEN t.status = 'done' THEN t.story_points ELSE 0 END), 0)::INT AS completed_points
        FROM public.sprints s
        LEFT JOIN public.tasks t ON s.id = t.sprint_id
        WHERE s.project_id = $1
        GROUP BY s.id
        ORDER BY 
            CASE s.status 
                WHEN 'active' THEN 1 
                WHEN 'planned' THEN 2 
                ELSE 3 
            END,
            s.created_at DESC;
    `;

	const result = await pool.query(query, [projectId]);
	res.status(200).json(result.rows);
};

/* ------------------------------------------------------------------ */
/* 2. CREATE A NEW SPRINT                                             */
/* Endpoint: POST /api/projects/:projectId/sprints                    */
/* ------------------------------------------------------------------ */
exports.createSprint = async (req, res) => {
	const { projectId } = req.params;
	const { name, goal, start_date, end_date } = req.body;
	const userId = req.user.userId;

	if (!name || !name.trim()) {
		return res.status(400).json({ message: "Sprint name is required" });
	}

	const insertRes = await pool.query(
		`INSERT INTO public.sprints (project_id, name, goal, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, 'planned')
         RETURNING *`,
		[
			projectId,
			name.trim(),
			goal || "",
			start_date || null,
			end_date || null,
		],
	);

	const newSprint = insertRes.rows[0];

	// Get actor name
	const userRes = await pool.query("SELECT name FROM public.users WHERE id = $1", [userId]);
	const userName = userRes.rows[0]?.name || "Team Member";

	// MongoDB Activity
	await ActivityLog.create({
		projectId,
		userId,
		userName,
		action: "SPRINT_CREATED",
		message: `Created sprint "${newSprint.name}"`,
		newValue: newSprint,
	}).catch((err) => console.error("MongoDB ActivityLog Error:", err));

	// Socket.io
	const io = req.app.get("io");
	if (io) {
		io.to(projectId).emit("sprint_created", newSprint);
	}

	res.status(201).json(newSprint);
};

/* ------------------------------------------------------------------ */
/* 3. START SPRINT                                                    */
/* Endpoint: PATCH /api/projects/:projectId/sprints/:sprintId/start   */
/* ------------------------------------------------------------------ */
exports.startSprint = async (req, res) => {
	const { projectId, sprintId } = req.params;
	const userId = req.user.userId;

	// Check if another sprint is currently active in this project
	const activeCheck = await pool.query(
		"SELECT id, name FROM public.sprints WHERE project_id = $1 AND status = 'active' AND id != $2",
		[projectId, sprintId],
	);

	if (activeCheck.rows.length > 0) {
		return res.status(400).json({
			message: `Cannot start sprint: Sprint "${activeCheck.rows[0].name}" is already active. Please complete it first.`,
		});
	}

	const updateRes = await pool.query(
		`UPDATE public.sprints 
         SET status = 'active', start_date = COALESCE(start_date, NOW()), updated_at = NOW() 
         WHERE id = $1 AND project_id = $2 
         RETURNING *`,
		[sprintId, projectId],
	);

	if (updateRes.rows.length === 0) {
		return res.status(404).json({ message: "Sprint not found" });
	}

	const activeSprint = updateRes.rows[0];

	// Actor name
	const userRes = await pool.query("SELECT name FROM public.users WHERE id = $1", [userId]);
	const userName = userRes.rows[0]?.name || "Team Member";

	// Log Activity
	await ActivityLog.create({
		projectId,
		userId,
		userName,
		action: "SPRINT_STARTED",
		message: `Started sprint "${activeSprint.name}"`,
		newValue: activeSprint,
	}).catch((err) => console.error("MongoDB ActivityLog Error:", err));

	// Create notifications for all project members
	const membersRes = await pool.query(
		"SELECT user_id FROM public.projects_members WHERE project_id = $1 AND user_id != $2",
		[projectId, userId],
	);

	for (const m of membersRes.rows) {
		await pool.query(
			`INSERT INTO public.notifications (user_id, actor_id, project_id, type, title, message)
             VALUES ($1, $2, $3, 'sprint_start', $4, $5)`,
			[
				m.user_id,
				userId,
				projectId,
				`Sprint Started: ${activeSprint.name}`,
				`${userName} started sprint "${activeSprint.name}".`,
			],
		);
	}

	// Socket.io
	const io = req.app.get("io");
	if (io) {
		io.to(projectId).emit("sprint_started", activeSprint);
		io.to(projectId).emit("sprint_updated", activeSprint);
	}

	res.status(200).json(activeSprint);
};

/* ------------------------------------------------------------------ */
/* 4. COMPLETE SPRINT                                                 */
/* Endpoint: PATCH /api/projects/:projectId/sprints/:sprintId/complete*/
/* ------------------------------------------------------------------ */
exports.completeSprint = async (req, res) => {
	const { projectId, sprintId } = req.params;
	const userId = req.user.userId;

	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		// 1. Mark sprint completed
		const updateRes = await client.query(
			`UPDATE public.sprints 
             SET status = 'completed', end_date = NOW(), updated_at = NOW() 
             WHERE id = $1 AND project_id = $2 
             RETURNING *`,
			[sprintId, projectId],
		);

		if (updateRes.rows.length === 0) {
			await client.query("ROLLBACK");
			return res.status(404).json({ message: "Sprint not found" });
		}

		const completedSprint = updateRes.rows[0];

		// 2. Unassign incomplete tasks back to backlog
		await client.query(
			`UPDATE public.tasks 
             SET sprint_id = NULL, updated_at = NOW() 
             WHERE sprint_id = $1 AND status != 'done'`,
			[sprintId],
		);

		await client.query("COMMIT");

		// Actor name
		const userRes = await pool.query("SELECT name FROM public.users WHERE id = $1", [userId]);
		const userName = userRes.rows[0]?.name || "Team Member";

		// Log Activity
		await ActivityLog.create({
			projectId,
			userId,
			userName,
			action: "SPRINT_COMPLETED",
			message: `Completed sprint "${completedSprint.name}"`,
			newValue: completedSprint,
		}).catch((err) => console.error("MongoDB ActivityLog Error:", err));

		// Notifications
		const membersRes = await pool.query(
			"SELECT user_id FROM public.projects_members WHERE project_id = $1 AND user_id != $2",
			[projectId, userId],
		);

		for (const m of membersRes.rows) {
			await pool.query(
				`INSERT INTO public.notifications (user_id, actor_id, project_id, type, title, message)
                 VALUES ($1, $2, $3, 'sprint_complete', $4, $5)`,
				[
					m.user_id,
					userId,
					projectId,
					`Sprint Completed: ${completedSprint.name}`,
					`${userName} completed sprint "${completedSprint.name}".`,
				],
			);
		}

		// Socket.io
		const io = req.app.get("io");
		if (io) {
			io.to(projectId).emit("sprint_completed", completedSprint);
			io.to(projectId).emit("sprint_updated", completedSprint);
		}

		res.status(200).json(completedSprint);
	} catch (err) {
		await client.query("ROLLBACK");
		throw err;
	} finally {
		client.release();
	}
};

/* ------------------------------------------------------------------ */
/* 5. GET SPRINT BURNDOWN METRICS                                     */
/* Endpoint: GET /api/projects/:projectId/sprints/:sprintId/burndown  */
/* ------------------------------------------------------------------ */
exports.getSprintBurndown = async (req, res) => {
	const { projectId, sprintId } = req.params;

	const sprintRes = await pool.query(
		"SELECT * FROM public.sprints WHERE id = $1 AND project_id = $2",
		[sprintId, projectId],
	);

	if (sprintRes.rows.length === 0) {
		return res.status(404).json({ message: "Sprint not found" });
	}

	const sprint = sprintRes.rows[0];

	// Fetch all tasks that were assigned to this sprint or completed in this sprint
	const tasksRes = await pool.query(
		`SELECT id, title, status, story_points, created_at, updated_at 
         FROM public.tasks 
         WHERE sprint_id = $1 OR (project_id = $2 AND updated_at >= $3 AND ($4::TIMESTAMPTZ IS NULL OR updated_at <= $4))`,
		[sprintId, projectId, sprint.start_date || sprint.created_at, sprint.end_date],
	);

	const tasks = tasksRes.rows;
	const totalStoryPoints = tasks.reduce((sum, t) => sum + (t.story_points || 1), 0);
	const totalTasksCount = tasks.length;

	// Calculate ideal vs actual burndown points across sprint timeline
	const start = new Date(sprint.start_date || sprint.created_at);
	const end = sprint.end_date ? new Date(sprint.end_date) : new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);
	const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

	const days = [];
	for (let i = 0; i <= totalDays; i++) {
		const dayDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
		const idealRemaining = Math.max(0, totalStoryPoints - (totalStoryPoints / totalDays) * i);

		// Compute actual remaining on this day
		const completedUpToDay = tasks.filter((t) => {
			if (t.status !== "done") return false;
			const updatedAt = new Date(t.updated_at);
			return updatedAt <= dayDate;
		});

		const completedPoints = completedUpToDay.reduce((sum, t) => sum + (t.story_points || 1), 0);
		const actualRemaining = Math.max(0, totalStoryPoints - completedPoints);

		days.push({
			day: `Day ${i}`,
			date: dayDate.toISOString().split("T")[0],
			idealPoints: Math.round(idealRemaining * 10) / 10,
			actualPoints: dayDate <= new Date() ? Math.round(actualRemaining * 10) / 10 : null,
		});
	}

	res.status(200).json({
		sprint,
		totalStoryPoints,
		totalTasksCount,
		burndownData: days,
	});
};
