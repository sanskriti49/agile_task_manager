const { pool } = require("../config/db");

/* ------------------------------------------------------------------ */
/* GLOBAL SEARCH ACROSS PROJECTS, TASKS, COMMENTS, MEMBERS            */
/* Endpoint: GET /api/search?q=searchTerm                             */
/* ------------------------------------------------------------------ */
exports.globalSearch = async (req, res) => {
	const userId = req.user.userId;
	const q = req.query.q ? req.query.q.trim() : "";

	if (!q || q.length < 2) {
		return res.status(200).json({
			projects: [],
			tasks: [],
			comments: [],
			members: [],
		});
	}

	const searchPattern = `%${q}%`;

	// 1. Search User's Projects
	const projectsRes = await pool.query(
		`SELECT p.id, p.name, p.description, pm.role, COUNT(t.id)::INT AS task_count
         FROM public.projects p
         JOIN public.projects_members pm ON p.id = pm.project_id
         LEFT JOIN public.tasks t ON p.id = t.project_id
         WHERE pm.user_id = $1 AND (p.name ILIKE $2 OR p.description ILIKE $2)
         GROUP BY p.id, pm.role
         ORDER BY p.name ASC
         LIMIT 6`,
		[userId, searchPattern],
	);

	// 2. Search Tasks in User's Projects
	const tasksRes = await pool.query(
		`SELECT 
            t.id, t.project_id, t.title, t.description, t.status, t.priority, 
            t.task_key, t.story_points, t.due_date,
            p.name AS project_name,
            u.name AS assignee_name,
            u.avatar_url AS assignee_avatar
         FROM public.tasks t
         JOIN public.projects p ON t.project_id = p.id
         JOIN public.projects_members pm ON p.id = pm.project_id
         LEFT JOIN public.users u ON t.assigned_to = u.id
         WHERE pm.user_id = $1 AND (
             t.title ILIKE $2 
             OR t.description ILIKE $2 
             OR t.task_key ILIKE $2
             OR $3 = ANY(t.tags)
         )
         ORDER BY t.created_at DESC
         LIMIT 10`,
		[userId, searchPattern, q],
	);

	// 3. Search Comments in User's Projects
	const commentsRes = await pool.query(
		`SELECT 
            c.id, c.task_id, c.body, c.created_at,
            t.title AS task_title, t.task_key, t.project_id,
            p.name AS project_name,
            u.name AS author_name, u.avatar_url AS author_avatar
         FROM public.comments c
         JOIN public.tasks t ON c.task_id = t.id
         JOIN public.projects p ON t.project_id = p.id
         JOIN public.projects_members pm ON p.id = pm.project_id
         JOIN public.users u ON c.author_id = u.id
         WHERE pm.user_id = $1 AND c.body ILIKE $2
         ORDER BY c.created_at DESC
         LIMIT 6`,
		[userId, searchPattern],
	);

	// 4. Search Project Members in User's Projects
	const membersRes = await pool.query(
		`SELECT DISTINCT 
            u.id, u.name, u.email, u.avatar_url,
            p.id AS project_id, p.name AS project_name, pm.role
         FROM public.users u
         JOIN public.projects_members pm ON u.id = pm.user_id
         JOIN public.projects p ON pm.project_id = p.id
         WHERE pm.project_id IN (
             SELECT project_id FROM public.projects_members WHERE user_id = $1
         ) AND (u.name ILIKE $2 OR u.email ILIKE $2)
         LIMIT 6`,
		[userId, searchPattern],
	);

	res.status(200).json({
		query: q,
		projects: projectsRes.rows,
		tasks: tasksRes.rows,
		comments: commentsRes.rows,
		members: membersRes.rows,
	});
};
