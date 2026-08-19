const { pool } = require("../config/db");
const ActivityLog = require("../models/ActivityLog");

/* ------------------------------------------------------------------ */
/* 1. GET TASK DETAILS (Full Data with Subtasks, Deps, Comments)      */
/* Endpoint: GET /api/tickets/:taskId                                 */
/* ------------------------------------------------------------------ */
exports.getTaskById = async (req, res) => {
	const { taskId } = req.params;

	const taskRes = await pool.query(
		`SELECT 
            t.*,
            u.name AS assignee_name,
            u.avatar_url AS assignee_avatar,
            u.email AS assignee_email,
            c.name AS creator_name,
            s.name AS sprint_name,
            s.status AS sprint_status
         FROM public.tasks t
         LEFT JOIN public.users u ON t.assigned_to = u.id
         LEFT JOIN public.users c ON t.created_by = c.id
         LEFT JOIN public.sprints s ON t.sprint_id = s.id
         WHERE t.id = $1`,
		[taskId],
	);

	if (taskRes.rows.length === 0) {
		return res.status(404).json({ message: "Task not found" });
	}

	const task = taskRes.rows[0];

	// Subtasks
	const subtasksRes = await pool.query(
		"SELECT * FROM public.subtasks WHERE task_id = $1 ORDER BY position ASC, created_at ASC",
		[taskId],
	);

	// Comments
	const commentsRes = await pool.query(
		`SELECT 
            c.*,
            u.name AS author_name,
            u.avatar_url AS author_avatar
         FROM public.comments c
         JOIN public.users u ON c.author_id = u.id
         WHERE c.task_id = $1
         ORDER BY c.created_at ASC`,
		[taskId],
	);

	// Dependencies
	const depsRes = await pool.query(
		`SELECT 
            td.id,
            td.task_id,
            td.depends_on_task_id,
            td.dependency_type,
            t2.title AS depends_on_title,
            t2.task_key AS depends_on_key,
            t2.status AS depends_on_status
         FROM public.task_dependencies td
         JOIN public.tasks t2 ON td.depends_on_task_id = t2.id
         WHERE td.task_id = $1`,
		[taskId],
	);

	// Reverse dependencies (Tasks that block this task or are blocked by this task)
	const blockedByRes = await pool.query(
		`SELECT 
            td.id,
            td.task_id AS blocker_task_id,
            td.depends_on_task_id,
            td.dependency_type,
            t2.title AS blocker_title,
            t2.task_key AS blocker_key,
            t2.status AS blocker_status
         FROM public.task_dependencies td
         JOIN public.tasks t2 ON td.task_id = t2.id
         WHERE td.depends_on_task_id = $1`,
		[taskId],
	);

	res.status(200).json({
		...task,
		subtasks: subtasksRes.rows,
		comments: commentsRes.rows,
		dependencies: depsRes.rows,
		blockedBy: blockedByRes.rows,
	});
};

/* ------------------------------------------------------------------ */
/* 2. CREATE A NEW TASK / TICKET                                      */
/* Endpoint: POST /api/tickets                                        */
/* ------------------------------------------------------------------ */
exports.createTicket = async (req, res) => {
	const {
		projectId,
		title,
		description,
		status = "todo",
		priority = "medium",
		assigned_to = null,
		sprint_id = null,
		story_points = 0,
		due_date = null,
		tags = [],
	} = req.body;
	const userId = req.user.userId;

	if (!projectId || !title || !title.trim()) {
		return res
			.status(400)
			.json({ message: "Project ID and title are required" });
	}

	// 1. Generate Task Key
	const countRes = await pool.query(
		"SELECT COUNT(*)::INT FROM public.tasks WHERE project_id = $1",
		[projectId],
	);
	const taskNumber = (countRes.rows[0].count || 0) + 101;
	const taskKey = `ENG-${taskNumber}`;

	// Normalize tags array
	const cleanTags = Array.isArray(tags) ? tags : typeof tags === "string" && tags.trim() ? tags.split(",").map((s) => s.trim()) : [];

	// 2. Insert into PostgreSQL
	const insertRes = await pool.query(
		`INSERT INTO public.tasks 
            (project_id, title, description, status, priority, assigned_to, created_by, task_key, sprint_id, story_points, due_date, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
		[
			projectId,
			title.trim(),
			description || "",
			status,
			priority,
			assigned_to || null,
			userId,
			taskKey,
			sprint_id || null,
			parseInt(story_points, 10) || 0,
			due_date || null,
			cleanTags,
		],
	);

	const newTask = insertRes.rows[0];

	// 3. Fetch creator & assignee details
	const userRes = await pool.query(
		"SELECT name FROM public.users WHERE id = $1",
		[userId],
	);
	const userName = userRes.rows[0]?.name || "Developer";

	let assigneeDetails = null;
	if (assigned_to) {
		const assignRes = await pool.query(
			"SELECT id, name, email, avatar_url FROM public.users WHERE id = $1",
			[assigned_to],
		);
		assigneeDetails = assignRes.rows[0];

		// If assigned to someone else, create notification
		if (assigned_to !== userId) {
			await pool.query(
				`INSERT INTO public.notifications (user_id, actor_id, project_id, task_id, type, title, message)
                 VALUES ($1, $2, $3, $4, 'assignment', $5, $6)`,
				[
					assigned_to,
					userId,
					projectId,
					newTask.id,
					`Assigned to task: ${newTask.title}`,
					`${userName} assigned you to ${taskKey}: "${newTask.title}".`,
				],
			);
		}
	}

	const taskWithDetails = {
		...newTask,
		assignee_name: assigneeDetails?.name || null,
		assignee_avatar: assigneeDetails?.avatar_url || null,
		subtasks: [],
		comments: [],
	};

	// 4. Log to MongoDB ActivityLog
	await ActivityLog.create({
		projectId,
		taskId: newTask.id,
		userId,
		userName,
		action: "TASK_CREATED",
		message: `Created ticket ${taskKey}: "${newTask.title}"`,
		newValue: taskWithDetails,
	}).catch((err) => console.error("MongoDB ActivityLog Error:", err));

	// 5. Emit Real-time Socket Event
	const io = req.app.get("io");
	if (io) {
		io.to(projectId).emit("ticket_created", taskWithDetails);
	}

	res.status(201).json(taskWithDetails);
};

/* ------------------------------------------------------------------ */
/* 3. UPDATE TICKET DETAILS                                           */
/* Endpoint: PATCH /api/tickets/:taskId                               */
/* ------------------------------------------------------------------ */
exports.updateTicket = async (req, res) => {
	const { taskId } = req.params;
	const userId = req.user.userId;
	const {
		title,
		description,
		status,
		priority,
		assigned_to,
		sprint_id,
		story_points,
		due_date,
		tags,
	} = req.body;

	// 1. Get current task
	const currRes = await pool.query("SELECT * FROM public.tasks WHERE id = $1", [taskId]);
	if (currRes.rows.length === 0) {
		return res.status(404).json({ message: "Task not found" });
	}

	const prev = currRes.rows[0];

	// 2. Perform Update
	const updateRes = await pool.query(
		`UPDATE public.tasks 
         SET 
            title = COALESCE($1::TEXT, title),
            description = COALESCE($2::TEXT, description),
            status = COALESCE($3::VARCHAR, status),
            priority = COALESCE($4::VARCHAR, priority),
            assigned_to = CASE WHEN $5::TEXT = 'unassigned' THEN NULL WHEN $5::UUID IS NOT NULL THEN $5::UUID ELSE assigned_to END,
            sprint_id = CASE WHEN $6::TEXT = 'unassigned' THEN NULL WHEN $6::UUID IS NOT NULL THEN $6::UUID ELSE sprint_id END,
            story_points = COALESCE($7::INTEGER, story_points),
            due_date = CASE WHEN $8::TEXT = 'clear' THEN NULL WHEN $8::TIMESTAMPTZ IS NOT NULL THEN $8::TIMESTAMPTZ ELSE due_date END,
            tags = COALESCE($9::TEXT[], tags),
            updated_at = NOW()
         WHERE id = $10::UUID
         RETURNING *`,
		[
			title !== undefined ? title.trim() : null,
			description !== undefined ? description : null,
			status || null,
			priority || null,
			assigned_to !== undefined
				? assigned_to === "" || assigned_to === "unassigned"
					? "unassigned"
					: assigned_to
				: null,
			sprint_id !== undefined ? sprint_id : null,
			story_points !== undefined ? parseInt(story_points, 10) : null,
			due_date !== undefined ? due_date : null,
			tags !== undefined ? (Array.isArray(tags) ? tags : []) : null,
			taskId,
		],
	);

	const updated = updateRes.rows[0];

	// Fetch assignee details for full object
	let assigneeName = null;
	let assigneeAvatar = null;
	if (updated.assigned_to) {
		const uRes = await pool.query("SELECT name, avatar_url FROM public.users WHERE id = $1", [updated.assigned_to]);
		assigneeName = uRes.rows[0]?.name;
		assigneeAvatar = uRes.rows[0]?.avatar_url;
	}

	const fullUpdatedTask = {
		...updated,
		assignee_name: assigneeName,
		assignee_avatar: assigneeAvatar,
	};

	// 3. User details for audit log
	const actorRes = await pool.query("SELECT name FROM public.users WHERE id = $1", [userId]);
	const actorName = actorRes.rows[0]?.name || "Team Member";

	// 4. Determine primary action for ActivityLog & Notifications
	let action = "TASK_UPDATED";
	let message = `Updated task "${updated.title}"`;

	if (status && status !== prev.status) {
		action = "STATUS_CHANGE";
		message = `Moved "${updated.title}" from ${prev.status} to ${status}`;

		// Notify assignee if not the actor
		if (updated.assigned_to && updated.assigned_to !== userId) {
			await pool.query(
				`INSERT INTO public.notifications (user_id, actor_id, project_id, task_id, type, title, message)
                 VALUES ($1, $2, $3, $4, 'status_change', $5, $6)`,
				[
					updated.assigned_to,
					userId,
					updated.project_id,
					taskId,
					`Status Changed: ${updated.title}`,
					`${actorName} updated status to "${status}".`,
				],
			);
		}
	} else if (priority && priority !== prev.priority) {
		action = "PRIORITY_CHANGE";
		message = `Changed priority of "${updated.title}" to ${priority}`;
	} else if (assigned_to !== undefined && assigned_to !== prev.assigned_to) {
		action = "ASSIGNMENT_CHANGE";
		message = assigneeName ? `Assigned "${updated.title}" to ${assigneeName}` : `Unassigned "${updated.title}"`;

		if (updated.assigned_to && updated.assigned_to !== userId) {
			await pool.query(
				`INSERT INTO public.notifications (user_id, actor_id, project_id, task_id, type, title, message)
                 VALUES ($1, $2, $3, $4, 'assignment', $5, $6)`,
				[
					updated.assigned_to,
					userId,
					updated.project_id,
					taskId,
					`Assigned to task: ${updated.title}`,
					`${actorName} assigned you to "${updated.title}".`,
				],
			);
		}
	}

	await ActivityLog.create({
		projectId: updated.project_id,
		taskId,
		userId,
		userName: actorName,
		action,
		message,
		oldValue: prev,
		newValue: fullUpdatedTask,
	}).catch((err) => console.error("MongoDB ActivityLog Error:", err));

	// 5. Emit Socket event
	const io = req.app.get("io");
	if (io) {
		io.to(updated.project_id).emit("ticket_updated", fullUpdatedTask);
	}

	res.status(200).json(fullUpdatedTask);
};

/* ------------------------------------------------------------------ */
/* 4. DELETE TICKET                                                   */
/* Endpoint: DELETE /api/tickets/:taskId                              */
/* ------------------------------------------------------------------ */
exports.deleteTicket = async (req, res) => {
	const { taskId } = req.params;
	const userId = req.user.userId;

	const taskRes = await pool.query("SELECT * FROM public.tasks WHERE id = $1", [taskId]);
	if (taskRes.rows.length === 0) {
		return res.status(404).json({ message: "Task not found" });
	}

	const task = taskRes.rows[0];

	// Delete from PostgreSQL
	await pool.query("DELETE FROM public.tasks WHERE id = $1", [taskId]);

	// User details
	const actorRes = await pool.query("SELECT name FROM public.users WHERE id = $1", [userId]);
	const actorName = actorRes.rows[0]?.name || "Team Member";

	// ActivityLog
	await ActivityLog.create({
		projectId: task.project_id,
		taskId,
		userId,
		userName: actorName,
		action: "TASK_DELETED",
		message: `Deleted task "${task.title}"`,
		oldValue: task,
	}).catch((err) => console.error("MongoDB ActivityLog Error:", err));

	// Socket.io
	const io = req.app.get("io");
	if (io) {
		io.to(task.project_id).emit("ticket_deleted", { taskId, projectId: task.project_id });
	}

	res.status(200).json({ message: "Task deleted successfully", taskId });
};

/* ------------------------------------------------------------------ */
/* 5. MOVE TASK (Kanban Drag and Drop Handler)                        */
/* Endpoint: PATCH /api/tickets/:taskId/move                          */
/* ------------------------------------------------------------------ */
exports.moveTask = async (req, res) => {
	const { taskId } = req.params;
	const { projectId, toStatus, position } = req.body;
	const userId = req.user.userId;

	const currentTaskRes = await pool.query(
		"SELECT * FROM public.tasks WHERE id = $1",
		[taskId],
	);
	const currentTask = currentTaskRes.rows[0];

	if (!currentTask) {
		return res.status(404).json({ message: "Task not found" });
	}

	const fromStatus = currentTask.status;

	const updateRes = await pool.query(
		`UPDATE public.tasks 
         SET status = $1, position = $2, updated_at = NOW() 
         WHERE id = $3 RETURNING *`,
		[toStatus, position, taskId],
	);

	const updatedTask = updateRes.rows[0];

	const userRes = await pool.query(
		"SELECT name FROM public.users WHERE id = $1",
		[userId],
	);
	const userName = userRes.rows[0]?.name || "Team Member";

	await ActivityLog.create({
		projectId,
		taskId,
		userId,
		userName,
		action: "STATUS_CHANGE",
		message: `Moved "${updatedTask.title}" from ${fromStatus} to ${toStatus}`,
		oldValue: { status: fromStatus },
		newValue: { status: toStatus, position },
	}).catch((err) => console.error("MongoDB ActivityLog Error:", err));

	const io = req.app.get("io");
	if (io) {
		io.to(projectId).emit("ticket_moved", {
			taskId,
			fromStatus,
			toStatus,
			position,
			actor: userName,
			task: updatedTask,
		});
	}

	res.status(200).json(updatedTask);
};

/* ------------------------------------------------------------------ */
/* 6. ADD COMMENT & MENTIONS                                          */
/* Endpoint: POST /api/tickets/:taskId/comments                       */
/* ------------------------------------------------------------------ */
exports.addComment = async (req, res) => {
	const { taskId } = req.params;
	const { body } = req.body;
	const userId = req.user.userId;

	if (!body || !body.trim()) {
		return res.status(400).json({ message: "Comment body cannot be empty" });
	}

	const taskRes = await pool.query(
		`SELECT t.*, p.name AS project_name 
         FROM public.tasks t
         JOIN public.projects p ON t.project_id = p.id
         WHERE t.id = $1`,
		[taskId],
	);
	const task = taskRes.rows[0];

	if (!task) {
		return res.status(404).json({ message: "Task not found" });
	}

	const userRes = await pool.query(
		"SELECT id, name, avatar_url FROM public.users WHERE id = $1",
		[userId],
	);
	const author = userRes.rows[0];
	const authorName = author?.name || "Team Member";

	const commentRes = await pool.query(
		`INSERT INTO public.comments (task_id, author_id, body, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id, task_id, author_id, body, created_at`,
		[taskId, userId, body.trim()],
	);

	const newComment = {
		...commentRes.rows[0],
		author_name: authorName,
		author_avatar: author?.avatar_url,
	};

	// 1. Detect @mentions in comment body
	// Example: @Sanskriti or @Sanskriti Gupta
	const projectMembersRes = await pool.query(
		`SELECT u.id, u.name, u.email 
         FROM public.projects_members pm
         JOIN public.users u ON pm.user_id = u.id
         WHERE pm.project_id = $1`,
		[task.project_id],
	);

	const mentionedUserIds = new Set();
	const commentText = body.toLowerCase();

	projectMembersRes.rows.forEach((member) => {
		if (member.id !== userId) {
			const firstName = member.name.split(" ")[0].toLowerCase();
			const fullName = member.name.toLowerCase();
			if (
				commentText.includes(`@${fullName}`) ||
				commentText.includes(`@${firstName}`)
			) {
				mentionedUserIds.add(member.id);
			}
		}
	});

	// Create notifications for mentioned users
	for (const mentionedId of mentionedUserIds) {
		await pool.query(
			`INSERT INTO public.notifications (user_id, actor_id, project_id, task_id, type, title, message)
             VALUES ($1, $2, $3, $4, 'mention', $5, $6)`,
			[
				mentionedId,
				userId,
				task.project_id,
				taskId,
				`Mentioned in comment: ${task.title}`,
				`${authorName} mentioned you in "${task.title}": "${body.trim().substring(0, 80)}"`,
			],
		);
	}

	// Notify task assignee if not mentioned and not author
	if (
		task.assigned_to &&
		task.assigned_to !== userId &&
		!mentionedUserIds.has(task.assigned_to)
	) {
		await pool.query(
			`INSERT INTO public.notifications (user_id, actor_id, project_id, task_id, type, title, message)
             VALUES ($1, $2, $3, $4, 'comment', $5, $6)`,
			[
				task.assigned_to,
				userId,
				task.project_id,
				taskId,
				`New comment on your task: ${task.title}`,
				`${authorName} commented: "${body.trim().substring(0, 80)}"`,
			],
		);
	}

	// Log to MongoDB ActivityLog
	await ActivityLog.create({
		projectId: task.project_id,
		taskId,
		userId,
		userName: authorName,
		action: "COMMENT_ADDED",
		message: `Commented on "${task.title}": "${body.trim().substring(0, 50)}..."`,
	}).catch((err) => console.error("MongoDB ActivityLog Error:", err));

	// Real-time Socket broadcast
	const io = req.app.get("io");
	if (io) {
		io.to(task.project_id).emit("comment_added", {
			taskId,
			comment: newComment,
		});
	}

	res.status(201).json(newComment);
};

/* ------------------------------------------------------------------ */
/* 7. SUBTASKS HANDLERS                                               */
/* ------------------------------------------------------------------ */
exports.addSubtask = async (req, res) => {
	const { taskId } = req.params;
	const { title } = req.body;

	if (!title || !title.trim()) {
		return res.status(400).json({ message: "Subtask title is required" });
	}

	const insertRes = await pool.query(
		`INSERT INTO public.subtasks (task_id, title, is_completed)
         VALUES ($1, $2, FALSE)
         RETURNING *`,
		[taskId, title.trim()],
	);

	const subtask = insertRes.rows[0];

	// Emit socket event
	const taskRes = await pool.query("SELECT project_id FROM public.tasks WHERE id = $1", [taskId]);
	const projectId = taskRes.rows[0]?.project_id;
	const io = req.app.get("io");
	if (io && projectId) {
		io.to(projectId).emit("subtask_updated", { taskId, subtask, action: "added" });
	}

	res.status(201).json(subtask);
};

exports.updateSubtask = async (req, res) => {
	const { taskId, subtaskId } = req.params;
	const { title, is_completed } = req.body;

	const updateRes = await pool.query(
		`UPDATE public.subtasks 
         SET 
            title = COALESCE($1, title),
            is_completed = COALESCE($2, is_completed)
         WHERE id = $3 AND task_id = $4
         RETURNING *`,
		[title ? title.trim() : null, is_completed !== undefined ? is_completed : null, subtaskId, taskId],
	);

	if (updateRes.rows.length === 0) {
		return res.status(404).json({ message: "Subtask not found" });
	}

	const subtask = updateRes.rows[0];

	const taskRes = await pool.query("SELECT project_id FROM public.tasks WHERE id = $1", [taskId]);
	const projectId = taskRes.rows[0]?.project_id;
	const io = req.app.get("io");
	if (io && projectId) {
		io.to(projectId).emit("subtask_updated", { taskId, subtask, action: "updated" });
	}

	res.status(200).json(subtask);
};

exports.deleteSubtask = async (req, res) => {
	const { taskId, subtaskId } = req.params;

	await pool.query("DELETE FROM public.subtasks WHERE id = $1 AND task_id = $2", [subtaskId, taskId]);

	const taskRes = await pool.query("SELECT project_id FROM public.tasks WHERE id = $1", [taskId]);
	const projectId = taskRes.rows[0]?.project_id;
	const io = req.app.get("io");
	if (io && projectId) {
		io.to(projectId).emit("subtask_updated", { taskId, subtaskId, action: "deleted" });
	}

	res.status(200).json({ message: "Subtask deleted successfully", subtaskId });
};

/* ------------------------------------------------------------------ */
/* 8. TASK DEPENDENCIES HANDLERS                                      */
/* ------------------------------------------------------------------ */
exports.addDependency = async (req, res) => {
	const { taskId } = req.params;
	const { dependsOnTaskId, dependencyType = "blocks" } = req.body;

	if (!dependsOnTaskId) {
		return res.status(400).json({ message: "Target dependency task ID is required" });
	}

	if (taskId === dependsOnTaskId) {
		return res.status(400).json({ message: "A task cannot depend on itself" });
	}

	// Cycle Check: Does dependsOnTaskId directly depend on taskId?
	const cycleCheck = await pool.query(
		"SELECT id FROM public.task_dependencies WHERE task_id = $1 AND depends_on_task_id = $2",
		[dependsOnTaskId, taskId],
	);

	if (cycleCheck.rows.length > 0) {
		return res.status(400).json({
			message: "Invalid dependency: A circular dependency between these two tasks would be created.",
		});
	}

	const insertRes = await pool.query(
		`INSERT INTO public.task_dependencies (task_id, depends_on_task_id, dependency_type)
         VALUES ($1, $2, $3)
         ON CONFLICT (task_id, depends_on_task_id, dependency_type) DO UPDATE SET dependency_type = EXCLUDED.dependency_type
         RETURNING *`,
		[taskId, dependsOnTaskId, dependencyType],
	);

	const dependency = insertRes.rows[0];

	// Get title of target
	const targetRes = await pool.query("SELECT title, task_key, status FROM public.tasks WHERE id = $1", [dependsOnTaskId]);
	const targetTask = targetRes.rows[0];

	const fullDependency = {
		...dependency,
		depends_on_title: targetTask?.title,
		depends_on_key: targetTask?.task_key,
		depends_on_status: targetTask?.status,
	};

	res.status(201).json(fullDependency);
};

exports.removeDependency = async (req, res) => {
	const { taskId, dependencyId } = req.params;

	await pool.query(
		"DELETE FROM public.task_dependencies WHERE id = $1 AND (task_id = $2 OR depends_on_task_id = $2)",
		[dependencyId, taskId],
	);

	res.status(200).json({ message: "Dependency removed successfully", dependencyId });
};
