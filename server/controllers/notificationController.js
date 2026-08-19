const { pool } = require("../config/db");

/* ------------------------------------------------------------------ */
/* 1. GET LOGGED-IN USER NOTIFICATIONS                                */
/* Endpoint: GET /api/notifications                                   */
/* ------------------------------------------------------------------ */
exports.getUserNotifications = async (req, res) => {
	const userId = req.user.userId;

	const result = await pool.query(
		`SELECT 
            n.*,
            u.name AS actor_name,
            u.avatar_url AS actor_avatar,
            p.name AS project_name,
            t.task_key,
            t.title AS task_title
         FROM public.notifications n
         LEFT JOIN public.users u ON n.actor_id = u.id
         LEFT JOIN public.projects p ON n.project_id = p.id
         LEFT JOIN public.tasks t ON n.task_id = t.id
         WHERE n.user_id = $1
         ORDER BY n.created_at DESC
         LIMIT 50`,
		[userId],
	);

	const unreadCountRes = await pool.query(
		"SELECT COUNT(*)::INT AS unread_count FROM public.notifications WHERE user_id = $1 AND is_read = FALSE",
		[userId],
	);

	res.status(200).json({
		notifications: result.rows,
		unreadCount: unreadCountRes.rows[0]?.unread_count || 0,
	});
};

/* ------------------------------------------------------------------ */
/* 2. MARK SINGLE NOTIFICATION AS READ                                */
/* Endpoint: PATCH /api/notifications/:id/read                        */
/* ------------------------------------------------------------------ */
exports.markAsRead = async (req, res) => {
	const { id } = req.params;
	const userId = req.user.userId;

	const result = await pool.query(
		"UPDATE public.notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *",
		[id, userId],
	);

	if (result.rows.length === 0) {
		return res.status(404).json({ message: "Notification not found" });
	}

	res.status(200).json(result.rows[0]);
};

/* ------------------------------------------------------------------ */
/* 3. MARK ALL NOTIFICATIONS AS READ                                  */
/* Endpoint: PATCH /api/notifications/read-all                        */
/* ------------------------------------------------------------------ */
exports.markAllAsRead = async (req, res) => {
	const userId = req.user.userId;

	await pool.query(
		"UPDATE public.notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE",
		[userId],
	);

	res.status(200).json({ message: "All notifications marked as read" });
};
