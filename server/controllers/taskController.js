const { pool } = require("../config/db");
const ActivityLog = require("../models/ActivityLog");

// Move Task (Drag and Drop Handler)
exports.moveTask = async (req, res) => {
	const { taskId } = req.params;
	const { projectId, toStatus, position } = req.body;
	const userId = req.user.userId;

	// 1. Fetch current task state
	const currentTaskRes = await pool.query(
		"SELECT * FROM public.tasks WHERE id = $1",
		[taskId],
	);
	const currentTask = currentTaskRes.rows[0];

	if (!currentTask) {
		return res.status(404).json({ message: "Task not found" });
	}

	const fromStatus = currentTask.status;

	// 2. Update status and position in PostgreSQL
	const updateRes = await pool.query(
		`UPDATE public.tasks 
         SET status = $1, position = $2, updated_at = NOW() 
         WHERE id = $3 RETURNING *`,
		[toStatus, position, taskId],
	);

	const updatedTask = updateRes.rows[0];

	// 3. Fetch user details for audit log
	const userRes = await pool.query(
		"SELECT name FROM public.users WHERE id = $1",
		[userId],
	);
	const userName = userRes.rows[0]?.name || "Team Member";

	// 4. Log to MongoDB ActivityLog
	await ActivityLog.create({
		projectId,
		taskId,
		userId,
		userName,
		action: "STATUS_CHANGE",
		message: `Moved task from ${fromStatus} to ${toStatus}`,
		oldValue: { status: fromStatus },
		newValue: { status: toStatus, position },
	});

	// 5. Emit real-time Socket.io broadcast to connected workspace room
	const io = req.app.get("io");
	if (io) {
		io.to(projectId).emit("ticket_moved", {
			taskId,
			fromStatus,
			toStatus,
			position,
			actor: userName,
		});
	}

	res.status(200).json(updatedTask);
};

/* ------------------------------------------------------------------ */
/* CREATE A NEW TASK / TICKET                                         */
/* Endpoint: POST /api/tickets                                        */
/* ------------------------------------------------------------------ */
exports.createTicket = async (req, res) => {
	const {
		projectId,
		title,
		description,
		status,
		priority,
		assigned_to,
		due_date,
	} = req.body;
	const userId = req.user.userId;

	if (!projectId || !title || !title.trim()) {
		return res
			.status(400)
			.json({ message: "Project ID and title are required" });
	}

	// A. Generate Task Key (e.g. ENG-101 based on count)
	const countRes = await pool.query(
		"SELECT COUNT(*)::INT FROM public.tasks WHERE project_id = $1",
		[projectId],
	);
	const taskNumber = (countRes.rows[0].count || 0) + 101;
	const taskKey = `ENG-${taskNumber}`;

	// B. Insert into PostgreSQL
	const insertRes = await pool.query(
		`INSERT INTO public.tasks (project_id, title, description, status, priority, assigned_to, created_by, task_key, due_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
		[
			projectId,
			title.trim(),
			description || "",
			status || "todo",
			priority || "medium",
			assigned_to || null,
			userId,
			taskKey,
			due_date || null,
		],
	);

	const newTask = insertRes.rows[0];

	// C. Get creator name for audit log
	const userRes = await pool.query(
		"SELECT name FROM public.users WHERE id = $1",
		[userId],
	);
	const userName = userRes.rows[0]?.name || "Developer";

	// D. Log to MongoDB ActivityLog
	await ActivityLog.create({
		projectId,
		taskId: newTask.id,
		userId,
		userName,
		action: "TASK_CREATED",
		message: `Created ticket ${taskKey}: "${newTask.title}"`,
		newValue: newTask,
	}).catch((err) => console.error("MongoDB ActivityLog Error:", err));

	// E. Emit Real-time Socket Event
	const io = req.app.get("io");
	if (io) {
		io.to(projectId).emit("ticket_created", newTask);
	}

	res.status(201).json(newTask);
};

/* ------------------------------------------------------------------ */
/* ADD COMMENT TO TICKET                                             */
/* Endpoint: POST /api/tickets/:taskId/comments                      */
/* ------------------------------------------------------------------ */
exports.addComment = async (req, res) => {
	const { taskId } = req.params;
	const { body } = req.body;
	const userId = req.user.userId;

	if (!body || !body.trim()) {
		return res.status(400).json({ message: "Comment body cannot be empty" });
	}

	// 1. Check if task exists
	const taskRes = await pool.query(
		"SELECT project_id FROM public.tasks WHERE id = $1",
		[taskId],
	);
	const task = taskRes.rows[0];

	if (!task) {
		return res.status(404).json({ message: "Task not found" });
	}

	// 2. Fetch author details
	const userRes = await pool.query(
		"SELECT name FROM public.users WHERE id = $1",
		[userId],
	);
	const authorName = userRes.rows[0]?.name || "Team Member";

	// 3. Insert comment into DB (assuming public.comments table exists)
	// If you store comments in PostgreSQL:
	const commentRes = await pool.query(
		`INSERT INTO public.comments (task_id, author_id, body, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id, task_id, author_id, body, created_at`,
		[taskId, userId, body.trim()],
	);

	const newComment = {
		...commentRes.rows[0],
		author_name: authorName,
	};

	// 4. Log to MongoDB ActivityLog
	await ActivityLog.create({
		projectId: task.project_id,
		taskId,
		userId,
		userName: authorName,
		action: "COMMENT_ADDED",
		message: `Added a comment: "${body.trim().substring(0, 50)}..."`,
	}).catch((err) => console.error("MongoDB ActivityLog Error:", err));

	// 5. Real-time Socket broadcast
	const io = req.app.get("io");
	if (io) {
		io.to(task.project_id).emit("comment_added", {
			taskId,
			comment: newComment,
		});
	}

	res.status(201).json(newComment);
};
