const bcrypt = require("bcryptjs");
const { pool, runMigrations } = require("../config/db");
const connectMongo = require("../config/mongo");
const ActivityLog = require("../models/ActivityLog");
require("dotenv").config();

async function seed() {
	console.log("🌱 Starting Database Seed...");

	// 1. Run migrations first
	await runMigrations();

	// 2. Connect to Mongo
	try {
		await connectMongo();
	} catch (e) {
		console.warn("MongoDB connection failed, proceeding with Postgres seeding:", e.message);
	}

	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		// Clean old data in safe cascade order
		await client.query("DELETE FROM public.notifications");
		await client.query("DELETE FROM public.comments");
		await client.query("DELETE FROM public.task_dependencies");
		await client.query("DELETE FROM public.subtasks");
		await client.query("DELETE FROM public.task_labels");
		await client.query("DELETE FROM public.labels");
		await client.query("DELETE FROM public.tasks");
		await client.query("DELETE FROM public.sprints");
		await client.query("DELETE FROM public.project_wip_limits");
		await client.query("DELETE FROM public.projects_members");
		await client.query("DELETE FROM public.projects");
		await client.query("DELETE FROM public.users");

		console.log("🧹 Cleaned existing PostgreSQL records.");

		// 3. Create Demo Users
		const hashedPassword = await bcrypt.hash("password123", 10);

		const usersData = [
			{ name: "Sanskriti Gupta", email: "sanskriti@flux.dev" },
			{ name: "Aria Chen", email: "aria@flux.dev" },
			{ name: "Rohan Mehta", email: "rohan@flux.dev" },
			{ name: "Priya Nair", email: "priya@flux.dev" },
		];

		const createdUsers = [];
		for (const u of usersData) {
			const res = await client.query(
				"INSERT INTO public.users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
				[u.name, u.email, hashedPassword],
			);
			createdUsers.push(res.rows[0]);
		}
		console.log(`👤 Seeded ${createdUsers.length} Users (Default password: password123)`);

		const [sanskriti, aria, rohan, priya] = createdUsers;

		// 4. Create Demo Projects
		const projectsData = [
			{
				name: "Flux Core Platform",
				description: "Next-generation collaborative Agile Project Management SaaS platform",
				created_by: sanskriti.id,
			},
			{
				name: "Mobile App NextGen",
				description: "iOS and Android client built with React Native and real-time offline sync",
				created_by: aria.id,
			},
			{
				name: "Analytics & AI Pipeline",
				description: "Burndown intelligence, forecasting, and velocity estimation engine",
				created_by: rohan.id,
			},
		];

		const createdProjects = [];
		for (const p of projectsData) {
			const res = await client.query(
				"INSERT INTO public.projects (name, description, created_by) VALUES ($1, $2, $3) RETURNING *",
				[p.name, p.description, p.created_by],
			);
			createdProjects.push(res.rows[0]);
		}

		const [fluxProject, mobileProject, aiProject] = createdProjects;

		// 5. Add Members & WIP limits to Projects
		for (const p of createdProjects) {
			for (const u of createdUsers) {
				const role = u.id === p.created_by ? "owner" : "member";
				await client.query(
					"INSERT INTO public.projects_members (project_id, user_id, role) VALUES ($1, $2, $3)",
					[p.id, u.id, role],
				);
			}

			// WIP Limits
			await client.query(
				`INSERT INTO public.project_wip_limits (project_id, column_id, wip_limit)
                 VALUES ($1, 'backlog', 20), ($1, 'todo', 10), ($1, 'inprogress', 4), ($1, 'done', 30)
                 ON CONFLICT DO NOTHING`,
				[p.id],
			);
		}
		console.log(`📁 Seeded ${createdProjects.length} Projects with Team Memberships & WIP Limits`);

		// 6. Create Sprints for Flux Project
		const sprint1Res = await client.query(
			`INSERT INTO public.sprints (project_id, name, goal, start_date, end_date, status)
             VALUES ($1, 'Sprint 1 - Foundation & Architecture', 'Deliver PostgreSQL schema, JWT auth, and basic board', NOW() - INTERVAL '21 days', NOW() - INTERVAL '7 days', 'completed')
             RETURNING *`,
			[fluxProject.id],
		);
		const sprint1 = sprint1Res.rows[0];

		const sprint2Res = await client.query(
			`INSERT INTO public.sprints (project_id, name, goal, start_date, end_date, status)
             VALUES ($1, 'Sprint 2 - Real-Time Collaboration & Sprints', 'Deliver burndown analytics, Socket.io sync, and @mentions', NOW() - INTERVAL '6 days', NOW() + INTERVAL '8 days', 'active')
             RETURNING *`,
			[fluxProject.id],
		);
		const sprint2 = sprint2Res.rows[0];

		const sprint3Res = await client.query(
			`INSERT INTO public.sprints (project_id, name, goal, start_date, end_date, status)
             VALUES ($1, 'Sprint 3 - Enterprise Integrations & AI', 'Integrate GitHub webhooks, AI issue decomposition, and reporting', NOW() + INTERVAL '9 days', NOW() + INTERVAL '23 days', 'planned')
             RETURNING *`,
			[fluxProject.id],
		);
		const sprint3 = sprint3Res.rows[0];

		console.log("🔥 Seeded 3 Sprints (Completed, Active, Planned)");

		// 7. Seed Tasks for Flux Project
		const today = new Date();
		const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
		const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
		const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
		const pastDate = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);

		const tasksData = [
			{
				project_id: fluxProject.id,
				title: "Implement PostgreSQL schema migrations & constraints",
				description: "Write SQL migrations for sprints, subtasks, dependencies, and indexes.",
				status: "done",
				priority: "high",
				assigned_to: sanskriti.id,
				created_by: sanskriti.id,
				sprint_id: sprint1.id,
				story_points: 5,
				task_key: "FLUX-101",
				due_date: pastDate,
				tags: ["Backend", "PostgreSQL"],
			},
			{
				project_id: fluxProject.id,
				title: "Socket.io real-time presence & live room broadcasts",
				description: "Track online collaborators and synchronize task updates across clients.",
				status: "done",
				priority: "high",
				assigned_to: aria.id,
				created_by: sanskriti.id,
				sprint_id: sprint2.id,
				story_points: 8,
				task_key: "FLUX-102",
				due_date: pastDate,
				tags: ["Realtime", "Socket.io"],
			},
			{
				project_id: fluxProject.id,
				title: "Build Sprint Backlog & Burndown Chart Visualizer",
				description: "Calculate ideal vs actual remaining story points across active sprint days.",
				status: "inprogress",
				priority: "high",
				assigned_to: sanskriti.id,
				created_by: sanskriti.id,
				sprint_id: sprint2.id,
				story_points: 5,
				task_key: "FLUX-103",
				due_date: today,
				tags: ["Frontend", "Agile", "Charts"],
			},
			{
				project_id: fluxProject.id,
				title: "In-app notifications system with @mention triggers",
				description: "Parse @Username in comments and deliver persistent + live socket notifications.",
				status: "inprogress",
				priority: "medium",
				assigned_to: rohan.id,
				created_by: aria.id,
				sprint_id: sprint2.id,
				story_points: 5,
				task_key: "FLUX-104",
				due_date: tomorrow,
				tags: ["Fullstack", "Notifications"],
			},
			{
				project_id: fluxProject.id,
				title: "Personal My Work command center view",
				description: "Group assigned tasks by project, due date, and overdue status.",
				status: "todo",
				priority: "medium",
				assigned_to: priya.id,
				created_by: sanskriti.id,
				sprint_id: sprint2.id,
				story_points: 3,
				task_key: "FLUX-105",
				due_date: nextWeek,
				tags: ["Frontend", "UI/UX"],
			},
			{
				project_id: fluxProject.id,
				title: "Command Palette (Ctrl + K) & Keyboard Navigation",
				description: "Add keyboard-driven quick actions modal for rapid navigation and search.",
				status: "todo",
				priority: "medium",
				assigned_to: aria.id,
				created_by: rohan.id,
				sprint_id: sprint2.id,
				story_points: 3,
				task_key: "FLUX-106",
				due_date: tomorrow,
				tags: ["Frontend", "Accessibility"],
			},
			{
				project_id: fluxProject.id,
				title: "Overdue task alert and email digest worker",
				description: "Cron worker to flag tasks past due date and notify assignees.",
				status: "todo",
				priority: "high",
				assigned_to: sanskriti.id,
				created_by: sanskriti.id,
				sprint_id: sprint2.id,
				story_points: 5,
				task_key: "FLUX-107",
				due_date: pastDate, // Overdue task!
				tags: ["Backend", "Worker"],
			},
			{
				project_id: fluxProject.id,
				title: "Export project analytics reports to CSV / PDF",
				description: "Generate downloadable summary reports for team velocity and burndown.",
				status: "backlog",
				priority: "low",
				assigned_to: priya.id,
				created_by: rohan.id,
				sprint_id: null,
				story_points: 2,
				task_key: "FLUX-108",
				due_date: nextWeek,
				tags: ["Analytics", "Export"],
			},
			{
				project_id: fluxProject.id,
				title: "Design dark mode theme tokens & CSS variables",
				description: "Ensure high contrast, clean slate colors, and smooth transition across all cards.",
				status: "done",
				priority: "low",
				assigned_to: priya.id,
				created_by: sanskriti.id,
				sprint_id: sprint1.id,
				story_points: 3,
				task_key: "FLUX-109",
				due_date: pastDate,
				tags: ["Design", "Theme"],
			},
		];

		const createdTasks = [];
		for (const t of tasksData) {
			const res = await client.query(
				`INSERT INTO public.tasks 
                    (project_id, title, description, status, priority, assigned_to, created_by, sprint_id, story_points, task_key, due_date, tags)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                 RETURNING *`,
				[
					t.project_id,
					t.title,
					t.description,
					t.status,
					t.priority,
					t.assigned_to,
					t.created_by,
					t.sprint_id,
					t.story_points,
					t.task_key,
					t.due_date,
					t.tags,
				],
			);
			createdTasks.push(res.rows[0]);
		}
		console.log(`📋 Seeded ${createdTasks.length} Agile Tasks`);

		// 8. Seed Subtasks
		const task103 = createdTasks[2]; // Burndown Chart
		const subtasksData = [
			{ title: "Query sprint date range and story points", is_completed: true },
			{ title: "Compute ideal burndown guideline slope", is_completed: true },
			{ title: "Aggregate daily task completion events", is_completed: false },
			{ title: "Render responsive SVG bar chart with tooltips", is_completed: false },
		];

		for (let i = 0; i < subtasksData.length; i++) {
			await client.query(
				"INSERT INTO public.subtasks (task_id, title, is_completed, position) VALUES ($1, $2, $3, $4)",
				[task103.id, subtasksData[i].title, subtasksData[i].is_completed, i],
			);
		}

		// 9. Seed Task Dependencies (Task 103 is blocked by Task 101)
		await client.query(
			"INSERT INTO public.task_dependencies (task_id, depends_on_task_id, dependency_type) VALUES ($1, $2, 'blocked_by')",
			[task103.id, createdTasks[0].id],
		);

		// 10. Seed Comments & Mentions
		const commentsData = [
			{
				task_id: task103.id,
				author_id: rohan.id,
				body: "@Sanskriti please make sure burndown computes actual points remaining per day rather than just count.",
			},
			{
				task_id: task103.id,
				author_id: sanskriti.id,
				body: "Great point @Rohan! I updated the backend query to sum story_points for completed tasks.",
			},
			{
				task_id: createdTasks[3].id,
				author_id: aria.id,
				body: "@Priya please check the notification badge on mobile viewport.",
			},
		];

		for (const c of commentsData) {
			await client.query(
				"INSERT INTO public.comments (task_id, author_id, body) VALUES ($1, $2, $3)",
				[c.task_id, c.author_id, c.body],
			);
		}

		// 11. Seed In-App Notifications
		await client.query(
			`INSERT INTO public.notifications (user_id, actor_id, project_id, task_id, type, title, message, is_read)
             VALUES 
             ($1, $2, $3, $4, 'mention', 'Mentioned in Burndown Chart', 'Rohan Mehta mentioned you: "@Sanskriti please make sure burndown computes actual points"', FALSE),
             ($1, $2, $3, $4, 'sprint_start', 'Sprint 2 Started', 'Sprint "Sprint 2 - Real-Time Collaboration & Sprints" is now active.', TRUE),
             ($5, $1, $3, $6, 'assignment', 'Assigned to Command Palette', 'Sanskriti Gupta assigned you to FLUX-106: Command Palette', FALSE)`,
			[sanskriti.id, rohan.id, fluxProject.id, task103.id, aria.id, createdTasks[5].id],
		);

		await client.query("COMMIT");
		console.log("💬 Seeded Comments, Subtasks, Dependencies, and Notifications");

		// 12. Seed MongoDB Activity Logs
		try {
			await ActivityLog.deleteMany({});
			await ActivityLog.create([
				{
					projectId: fluxProject.id,
					taskId: task103.id,
					userId: sanskriti.id,
					userName: "Sanskriti Gupta",
					action: "STATUS_CHANGE",
					message: 'Moved "Build Sprint Backlog & Burndown Chart Visualizer" from todo to inprogress',
					oldValue: { status: "todo" },
					newValue: { status: "inprogress" },
				},
				{
					projectId: fluxProject.id,
					userId: sanskriti.id,
					userName: "Sanskriti Gupta",
					action: "SPRINT_STARTED",
					message: 'Started sprint "Sprint 2 - Real-Time Collaboration & Sprints"',
					newValue: sprint2,
				},
				{
					projectId: fluxProject.id,
					taskId: createdTasks[1].id,
					userId: aria.id,
					userName: "Aria Chen",
					action: "STATUS_CHANGE",
					message: 'Moved "Socket.io real-time presence & live room broadcasts" to done',
					oldValue: { status: "inprogress" },
					newValue: { status: "done" },
				},
				{
					projectId: fluxProject.id,
					taskId: task103.id,
					userId: rohan.id,
					userName: "Rohan Mehta",
					action: "COMMENT_ADDED",
					message: 'Added comment with mention to @Sanskriti',
				},
			]);
			console.log("📜 Seeded MongoDB Activity Logs");
		} catch (mongoErr) {
			console.warn("MongoDB ActivityLog seed skipped:", mongoErr.message);
		}

		console.log("✨ Seeding Completed Successfully!");
		console.log("\n🔑 Demo Logins:");
		console.log("  Email: sanskriti@flux.dev | Password: password123 (Lead Engineer)");
		console.log("  Email: aria@flux.dev      | Password: password123 (Product Designer)");
		console.log("  Email: rohan@flux.dev     | Password: password123 (Backend Architect)");
		console.log("  Email: priya@flux.dev     | Password: password123 (Frontend Specialist)\n");
	} catch (err) {
		await client.query("ROLLBACK");
		console.error("❌ Seeding failed:", err);
	} finally {
		client.release();
		process.exit(0);
	}
}

seed();
