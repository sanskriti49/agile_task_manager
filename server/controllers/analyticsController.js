const { pool } = require("../config/db");
const ActivityLog = require("../models/ActivityLog");

/* ------------------------------------------------------------------ */
/* 1. GET PROJECT ANALYTICS DASHBOARD DATA                            */
/* Endpoint: GET /api/projects/:projectId/analytics                  */
/* ------------------------------------------------------------------ */
exports.getProjectAnalytics = async (req, res) => {
	const { projectId } = req.params;
	const currentUserId = req.user.userId;

	// 1. Overall Task Metrics
	const metricsRes = await pool.query(
		`SELECT 
            COUNT(*)::INT AS total_tasks,
            COUNT(CASE WHEN status = 'done' THEN 1 END)::INT AS completed_tasks,
            COUNT(CASE WHEN status = 'inprogress' OR status = 'in_progress' THEN 1 END)::INT AS in_progress_tasks,
            COUNT(CASE WHEN status = 'todo' THEN 1 END)::INT AS todo_tasks,
            COUNT(CASE WHEN status = 'backlog' THEN 1 END)::INT AS backlog_tasks,
            COUNT(CASE WHEN priority = 'high' AND status != 'done' THEN 1 END)::INT AS high_priority_tasks,
            COUNT(CASE WHEN assigned_to = $2 AND status != 'done' THEN 1 END)::INT AS my_assigned_tasks,
            COUNT(CASE WHEN due_date IS NOT NULL AND due_date < NOW() AND status != 'done' THEN 1 END)::INT AS overdue_tasks,
            COALESCE(SUM(story_points), 0)::INT AS total_story_points,
            COALESCE(SUM(CASE WHEN status = 'done' THEN story_points ELSE 0 END), 0)::INT AS completed_story_points
         FROM public.tasks 
         WHERE project_id = $1`,
		[projectId, currentUserId],
	);

	const metrics = metricsRes.rows[0];
	const totalTasks = metrics.total_tasks || 0;
	const completedTasks = metrics.completed_tasks || 0;
	const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

	// 2. Tasks by Priority
	const priorityRes = await pool.query(
		`SELECT 
            COALESCE(priority, 'medium') AS priority, 
            COUNT(*)::INT AS count
         FROM public.tasks 
         WHERE project_id = $1 
         GROUP BY priority`,
		[projectId],
	);

	// 3. Tasks by Status
	const statusRes = await pool.query(
		`SELECT 
            status, 
            COUNT(*)::INT AS count
         FROM public.tasks 
         WHERE project_id = $1 
         GROUP BY status`,
		[projectId],
	);

	// 4. Team Workload Distribution
	const workloadRes = await pool.query(
		`SELECT 
            u.id AS user_id,
            u.name,
            u.email,
            u.avatar_url AS avatar,
            pm.role,
            COUNT(t.id)::INT AS total_tasks,
            COUNT(CASE WHEN t.status = 'done' THEN 1 END)::INT AS completed_tasks,
            COUNT(CASE WHEN t.status != 'done' THEN 1 END)::INT AS active_tasks,
            COALESCE(SUM(CASE WHEN t.status != 'done' THEN t.story_points ELSE 0 END), 0)::INT AS active_story_points
         FROM public.projects_members pm
         JOIN public.users u ON pm.user_id = u.id
         LEFT JOIN public.tasks t ON pm.project_id = t.project_id AND pm.user_id = t.assigned_to
         WHERE pm.project_id = $1
         GROUP BY u.id, u.name, u.email, u.avatar_url, pm.role
         ORDER BY active_tasks DESC`,
		[projectId],
	);

	// 5. Tasks Completed Over Time (Last 14 days)
	const historyRes = await pool.query(
		`SELECT 
            DATE(updated_at)::TEXT AS date,
            COUNT(*)::INT AS count,
            COALESCE(SUM(story_points), 0)::INT AS points
         FROM public.tasks 
         WHERE project_id = $1 AND status = 'done' AND updated_at >= NOW() - INTERVAL '14 days'
         GROUP BY DATE(updated_at)
         ORDER BY DATE(updated_at) ASC`,
		[projectId],
	);

	// 6. Active Sprint summary
	const activeSprintRes = await pool.query(
		`SELECT 
            s.*,
            COUNT(t.id)::INT AS sprint_tasks,
            COUNT(CASE WHEN t.status = 'done' THEN 1 END)::INT AS sprint_completed_tasks,
            COALESCE(SUM(t.story_points), 0)::INT AS sprint_total_points,
            COALESCE(SUM(CASE WHEN t.status = 'done' THEN t.story_points ELSE 0 END), 0)::INT AS sprint_completed_points
         FROM public.sprints s
         LEFT JOIN public.tasks t ON s.id = t.sprint_id
         WHERE s.project_id = $1 AND s.status = 'active'
         GROUP BY s.id`,
		[projectId],
	);

	// 7. Recent Activity Logs from MongoDB
	let recentActivity = [];
	try {
		recentActivity = await ActivityLog.find({ projectId })
			.sort({ createdAt: -1 })
			.limit(10)
			.lean();
	} catch (err) {
		console.error("Failed to fetch MongoDB ActivityLog:", err);
	}

	res.status(200).json({
		summary: {
			...metrics,
			completion_percentage: completionPercentage,
		},
		byPriority: priorityRes.rows,
		byStatus: statusRes.rows,
		workload: workloadRes.rows,
		completedOverTime: historyRes.rows,
		activeSprint: activeSprintRes.rows[0] || null,
		recentActivity,
	});
};

/* ------------------------------------------------------------------ */
/* 2. GET PERSONAL "MY WORK" WORKSPACE DATA                           */
/* Endpoint: GET /api/analytics/my-work                               */
/* ------------------------------------------------------------------ */
exports.getMyWork = async (req, res) => {
	const userId = req.user.userId;

	// All tasks assigned to current user across accessible projects
	const tasksRes = await pool.query(
		`SELECT 
            t.*,
            p.name AS project_name,
            s.name AS sprint_name,
            u.name AS assignee_name,
            u.avatar_url AS assignee_avatar
         FROM public.tasks t
         JOIN public.projects p ON t.project_id = p.id
         JOIN public.projects_members pm ON p.id = pm.project_id AND pm.user_id = $1
         LEFT JOIN public.sprints s ON t.sprint_id = s.id
         LEFT JOIN public.users u ON t.assigned_to = u.id
         WHERE t.assigned_to = $1
         ORDER BY 
            CASE 
                WHEN t.status != 'done' AND t.due_date IS NOT NULL AND t.due_date < NOW() THEN 1
                WHEN t.status != 'done' AND t.due_date IS NOT NULL AND DATE(t.due_date) = CURRENT_DATE THEN 2
                WHEN t.status = 'inprogress' THEN 3
                WHEN t.status = 'todo' THEN 4
                ELSE 5
            END,
            t.updated_at DESC`,
		[userId],
	);

	const allTasks = tasksRes.rows;

	const now = new Date();
	const todayStr = now.toISOString().split("T")[0];

	const formatDateStr = (d) => {
		if (!d) return null;
		if (typeof d === "string") return d.split("T")[0];
		if (d instanceof Date) return d.toISOString().split("T")[0];
		return null;
	};

	const overdueTasks = allTasks.filter((t) => {
		if (t.status === "done" || !t.due_date) return false;
		const dueDate = new Date(t.due_date);
		const dueStr = formatDateStr(t.due_date);
		return dueDate < now && dueStr !== todayStr;
	});

	const dueTodayTasks = allTasks.filter((t) => {
		if (t.status === "done" || !t.due_date) return false;
		return formatDateStr(t.due_date) === todayStr;
	});

	const inProgressTasks = allTasks.filter(
		(t) => t.status === "inprogress" || t.status === "in_progress",
	);

	const completedRecently = allTasks.filter((t) => t.status === "done");

	// Group tasks by project
	const byProject = {};
	allTasks.forEach((t) => {
		if (!byProject[t.project_id]) {
			byProject[t.project_id] = {
				projectId: t.project_id,
				projectName: t.project_name,
				tasks: [],
			};
		}
		byProject[t.project_id].tasks.push(t);
	});

	const total = allTasks.length;
	const completed = completedRecently.length;
	const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

	res.status(200).json({
		stats: {
			totalAssigned: total,
			completed,
			inProgress: inProgressTasks.length,
			dueToday: dueTodayTasks.length,
			overdue: overdueTasks.length,
			completionRate,
		},
		allTasks,
		overdueTasks,
		dueTodayTasks,
		inProgressTasks,
		completedRecently,
		groupedByProject: Object.values(byProject),
	});
};
