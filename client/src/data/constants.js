import { ArrowRight, Plus, MessageSquare } from "lucide-react";

export const PRODUCT_NAME = "SYNCRO";
export const BOARD_DATA = {
	Backlog: [
		{
			id: "LOOP-118",
			title: "Redesign empty states for ticket search",
			tag: "design",
			assignee: { initials: "MK", color: "bg-violet-500" },
			comments: 2,
		},
		{
			id: "LOOP-121",
			title: "Audit keyboard focus across board columns",
			tag: "chore",
			assignee: { initials: "RS", color: "bg-slate-500" },
			comments: 0,
		},
	],
	"In Progress": [
		{
			id: "LOOP-114",
			title: "Fix drag ghost offset on Safari",
			tag: "bug",
			assignee: { initials: "AL", color: "bg-teal-600" },
			comments: 4,
			justMoved: true,
		},
		{
			id: "LOOP-109",
			title: "Add mention autocomplete to comments",
			tag: "feature",
			assignee: { initials: "DP", color: "bg-amber-500" },
			comments: 1,
		},
	],
	Done: [
		{
			id: "LOOP-102",
			title: "Ship activity drawer read receipts",
			tag: "feature",
			assignee: { initials: "MK", color: "bg-violet-500" },
			comments: 6,
		},
		{
			id: "LOOP-097",
			title: "Migrate ticket IDs to new scheme",
			tag: "chore",
			assignee: { initials: "RS", color: "bg-slate-500" },
			comments: 0,
		},
	],
};
export const FOCUS_RING =
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2";
export const TAG_STYLES = {
	bug: "bg-rose-50 text-rose-600 ring-rose-200",
	feature: "bg-teal-50 text-teal-700 ring-teal-200",
	chore: "bg-slate-100 text-slate-600 ring-slate-200",
	design: "bg-violet-50 text-violet-600 ring-violet-200",
};
export const COLUMNS = [
	{
		id: "backlog",
		label: "Backlog",
		dot: "bg-slate-400",
		tint: "text-slate-500",
	},
	{ id: "todo", label: "To Do", dot: "bg-indigo-500", tint: "text-indigo-600" },
	{
		id: "inprogress",
		label: "In Progress",
		dot: "bg-amber-500",
		tint: "text-amber-600",
	},
	{
		id: "done",
		label: "Done",
		dot: "bg-emerald-500",
		tint: "text-emerald-600",
	},
];

export const PRIORITY = {
	high: {
		label: "High",
		chip: "bg-rose-50 text-rose-700 border-rose-200",
		border: "border-rose-500",
		dot: "bg-rose-500",
	},
	medium: {
		label: "Medium",
		chip: "bg-amber-50 text-amber-700 border-amber-200",
		border: "border-amber-400",
		dot: "bg-amber-400",
	},
	low: {
		label: "Low",
		chip: "bg-sky-50 text-sky-700 border-sky-200",
		border: "border-sky-400",
		dot: "bg-sky-400",
	},
};

export const PEOPLE = {
	"Aria Chen": { initials: "AC", color: "bg-violet-500" },
	"Rohan Mehta": { initials: "RM", color: "bg-sky-500" },
	"Priya Nair": { initials: "PN", color: "bg-emerald-500" },
	"Sanskriti Gupta": { initials: "SG", color: "bg-indigo-500" },
};

export const CURRENT_USER = "Sanskriti Gupta";

export const ONLINE_NOW = new Set(["Aria Chen", "Priya Nair"]);

export const initialTickets = [
	{
		id: "ENG-101",
		workspaceId: "ws-1",
		title: "Design login page",
		status: "backlog",
		priority: "medium",
		assignee: "Aria Chen",
		tags: ["Design"],
		due: "Aug 3",
		description:
			"High-fidelity mockups for login and password-reset, including error and loading states.",
		comments: [
			{
				author: "Priya Nair",
				text: "Should we support Google OAuth in v1, or push to phase 2?",
				time: "2d ago",
			},
		],
	},
	{
		id: "ENG-102",
		workspaceId: "ws-1",
		title: "Create database schema",
		status: "backlog",
		priority: "high",
		assignee: "Rohan Mehta",
		tags: ["Backend"],
		due: "Aug 5",
		description:
			"Define tables for users, projects, tickets, and comments with proper foreign keys.",
		comments: [],
	},
	{
		id: "ENG-103",
		workspaceId: "ws-1",
		title: "Build navbar component",
		status: "todo",
		priority: "low",
		assignee: "Priya Nair",
		tags: ["Frontend"],
		due: "Aug 6",
		description:
			"Responsive top navigation with workspace switcher and user menu.",
		comments: [],
	},
	{
		id: "ENG-104",
		workspaceId: "ws-2",
		title: "Create product API",
		status: "todo",
		priority: "medium",
		assignee: "Rohan Mehta",
		tags: ["Backend", "API"],
		due: "Aug 8",
		description:
			"REST endpoints for listing, filtering, and paginating products.",
		comments: [
			{
				author: "Sanskriti Gupta",
				text: "Let's version this under /api/v1 from the start.",
				time: "6h ago",
			},
		],
	},
	{
		id: "ENG-105",
		workspaceId: "ws-2",
		title: "Build checkout API",
		status: "inprogress",
		priority: "high",
		assignee: "Sanskriti Gupta",
		tags: ["Backend"],
		due: "Jul 29",
		description:
			"Cart pricing, tax calculation, and order-creation endpoint with idempotency keys.",
		comments: [
			{
				author: "Rohan Mehta",
				text: "Double check rounding on tax — finance flagged it last sprint.",
				time: "1h ago",
			},
			{
				author: "Aria Chen",
				text: "Added the edge-case list to the ticket description.",
				time: "40m ago",
			},
		],
	},
	{
		id: "ENG-106",
		workspaceId: "ws-2",
		title: "Fix auth token refresh",
		status: "inprogress",
		priority: "high",
		assignee: "Aria Chen",
		tags: ["Bug", "Backend"],
		due: "Jul 27",
		description:
			"Refresh tokens silently expire under clock skew > 30s. Repro steps attached.",
		comments: [],
	},
	{
		id: "ENG-107",
		workspaceId: "ws-3",
		title: "Set up PostgreSQL instance",
		status: "done",
		priority: "medium",
		assignee: "Rohan Mehta",
		tags: ["Infra"],
		due: "Jul 18",
		description: "Provisioned managed Postgres with automated daily backups.",
		comments: [],
	},
	{
		id: "ENG-108",
		workspaceId: "ws-3",
		title: "Deploy staging environment",
		status: "done",
		priority: "low",
		assignee: "Priya Nair",
		tags: ["DevOps"],
		due: "Jul 20",
		description: "CI pipeline deploys main branch to staging on every merge.",
		comments: [],
	},
];

export const initialActivity = [
	{
		id: "a1",
		type: "moved",
		ticketId: "ENG-105",
		ticketTitle: "Build checkout API",
		actor: "Sanskriti Gupta",
		detail: "To Do → In Progress",
		time: "2m ago",
	},
	{
		id: "a2",
		type: "commented",
		ticketId: "ENG-105",
		ticketTitle: "Build checkout API",
		actor: "Aria Chen",
		detail: "Added the edge-case list to the ticket description.",
		time: "40m ago",
	},
	{
		id: "a3",
		type: "commented",
		ticketId: "ENG-104",
		ticketTitle: "Create product API",
		actor: "Sanskriti Gupta",
		detail: "Let's version this under /api/v1 from the start.",
		time: "6h ago",
	},
	{
		id: "a4",
		type: "created",
		ticketId: "ENG-104",
		ticketTitle: "Create product API",
		actor: "Rohan Mehta",
		detail: "Created the issue",
		time: "1d ago",
	},
	{
		id: "a5",
		type: "moved",
		ticketId: "ENG-108",
		ticketTitle: "Deploy staging environment",
		actor: "Priya Nair",
		detail: "In Progress → Done",
		time: "4d ago",
	},
];

export const ACTIVITY_ICON = {
	moved: ArrowRight,
	created: Plus,
	commented: MessageSquare,
};

export const USER_WORKSPACES = [
	{
		id: "ws-1",
		name: "E-Commerce Platform",
		color: "from-teal-500 to-cyan-500",
		tickets: 12,
	},
	{
		id: "ws-2",
		name: "Marketing Website",
		color: "from-violet-500 to-purple-600",
		tickets: 5,
	},
	{
		id: "ws-3",
		name: "Mobile App v2",
		color: "from-amber-500 to-orange-600",
		tickets: 8,
	},
];
