import React, { useState } from "react";
import {
	ChevronRight,
	Search,
	XCircle,
	Command,
	Pencil,
	LayoutGrid,
	Users,
	Sun,
	Moon,
	HelpCircle,
	Flame,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { useThemeStore } from "../../store/useThemeStore";
import NotificationBell from "../notifications/NotificationBell";
import CollaboratorPresence from "../presence/CollaboratorPresence";

export default function Topbar({
	searchQuery = "",
	setSearchQuery = () => {},
	priorityFilter = "all",
	setPriorityFilter = () => {},
	assigneeFilter = "all",
	setAssigneeFilter = () => {},
	sprintFilter = "all",
	setSprintFilter = () => {},
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [editingTitle, setEditingTitle] = useState("");

	const { id: workspaceId } = useParams();
	const workspaces = useWorkspaceStore((state) => state.workspaces) || [];
	const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
	const updateWorkspace = useWorkspaceStore((state) => state.updateWorkspace);
	const sprints = useWorkspaceStore((state) => state.sprints) || [];
	const setIsCommandPaletteOpen = useWorkspaceStore((state) => state.setIsCommandPaletteOpen);
	const setIsShortcutsOpen = useWorkspaceStore((state) => state.setIsShortcutsOpen);

	const theme = useThemeStore((state) => state.theme);
	const toggleTheme = useThemeStore((state) => state.toggleTheme);

	const foundWorkspace = workspaces.find((ws) => ws.id === workspaceId);
	const workspaceName =
		currentWorkspace?.name || foundWorkspace?.name || "Untitled Workspace";

	const members = currentWorkspace?.members || [];

	const handleStartEdit = () => {
		setEditingTitle(workspaceName);
		setIsEditing(true);
	};

	const handleSaveEdit = () => {
		const trimmed = editingTitle.trim();
		if (trimmed && workspaceId && trimmed !== workspaceName) {
			updateWorkspace(workspaceId, trimmed);
		}
		setIsEditing(false);
	};

	const filtersActive =
		searchQuery ||
		priorityFilter !== "all" ||
		assigneeFilter !== "all" ||
		sprintFilter !== "all";

	const clearFilters = () => {
		setSearchQuery("");
		setPriorityFilter("all");
		setAssigneeFilter("all");
		setSprintFilter("all");
	};

	return (
		<header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 px-4 backdrop-blur-xl transition-all md:px-6">
			{/* Left: Breadcrumb & Editable Workspace Title */}
			<div className="flex items-center gap-2 min-w-0">
				<Link
					to="/dashboard"
					className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono-ui text-xs font-semibold text-slate-500 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400"
					title="Go to Dashboard"
				>
					<LayoutGrid className="h-4 w-4 text-slate-400 group-hover:text-teal-600" />
					<span className="hidden sm:inline">Workspaces</span>
				</Link>

				<ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-700" />

				{isEditing ? (
					<input
						type="text"
						value={editingTitle}
						onChange={(e) => setEditingTitle(e.target.value)}
						onBlur={handleSaveEdit}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleSaveEdit();
							if (e.key === "Escape") {
								setEditingTitle(workspaceName);
								setIsEditing(false);
							}
						}}
						autoFocus
						className="display max-w-[200px] sm:max-w-[320px] rounded-lg border border-teal-400 bg-teal-50/50 dark:bg-teal-950/40 px-2.5 py-1 text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 shadow-sm outline-none ring-2 ring-teal-200 dark:ring-teal-800"
					/>
				) : (
					<button
						type="button"
						onClick={handleStartEdit}
						title="Click to rename workspace"
						className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-left transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/80 max-w-[180px] sm:max-w-[280px]"
					>
						<h1 className="display truncate text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
							{workspaceName}
						</h1>
						<Pencil className="h-3 w-3 shrink-0 text-slate-300 dark:text-slate-600 opacity-0 transition-opacity group-hover:opacity-100" />
					</button>
				)}
			</div>

			{/* Right: Search, Sprint & Priority Filters, Presence, Notifications, Dark Mode */}
			<div className="flex items-center gap-2 sm:gap-3">
				{/* Search Input & Command Palette Trigger */}
				<div className="relative hidden md:block">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
					<input
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search tasks (Ctrl+K)..."
						className="font-mono-ui w-44 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 py-1.5 pl-8 pr-8 text-xs text-slate-800 dark:text-slate-200 transition-all placeholder:text-slate-400 focus:w-56 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900"
					/>
					{searchQuery ? (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
						>
							<XCircle className="h-3.5 w-3.5" />
						</button>
					) : (
						<button
							type="button"
							onClick={() => setIsCommandPaletteOpen(true)}
							className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1 py-0.5 font-mono-ui text-[10px] text-slate-400"
							title="Open Command Palette"
						>
							<Command className="h-2.5 w-2.5" />K
						</button>
					)}
				</div>

				{/* Priority Tabs */}
				<div className="hidden lg:flex items-center rounded-xl bg-slate-100/80 dark:bg-slate-800/80 p-1 font-mono-ui text-xs">
					{[
						{ id: "all", label: "All" },
						{ id: "high", label: "High", dot: "bg-rose-500" },
						{ id: "medium", label: "Med", dot: "bg-amber-500" },
						{ id: "low", label: "Low", dot: "bg-sky-500" },
					].map((item) => (
						<button
							key={item.id}
							type="button"
							onClick={() => setPriorityFilter(item.id)}
							className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${
								priorityFilter === item.id
									? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs"
									: "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
							}`}
						>
							{item.dot && (
								<span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
							)}
							{item.label}
						</button>
					))}
				</div>

				{/* Assignee Filter Dropdown */}
				{members.length > 0 && (
					<div className="hidden xl:flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-2 py-1 font-mono-ui text-xs">
						<Users className="h-3 w-3 text-slate-400" />
						<select
							value={assigneeFilter}
							onChange={(e) => setAssigneeFilter(e.target.value)}
							className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
						>
							<option value="all">All Assignees</option>
							{members.map((m) => (
								<option key={m.id} value={m.name}>
									{m.name}
								</option>
							))}
						</select>
					</div>
				)}

				{/* Sprint Filter */}
				{sprints.length > 0 && (
					<div className="hidden sm:flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-2 py-1 font-mono-ui text-xs">
						<Flame className="h-3 w-3 text-amber-500" />
						<select
							value={sprintFilter}
							onChange={(e) => setSprintFilter(e.target.value)}
							className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
						>
							<option value="all">All Sprints</option>
							<option value="active">Active Sprint</option>
							<option value="backlog">Backlog Only</option>
							{sprints.map((s) => (
								<option key={s.id} value={s.id}>
									{s.name}
								</option>
							))}
						</select>
					</div>
				)}

				{/* Clear Filters Action */}
				{filtersActive && (
					<button
						type="button"
						onClick={clearFilters}
						className="font-mono-ui text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
					>
						Clear
					</button>
				)}

				<div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 hidden sm:block" />

				{/* Live Collaborator Presence Indicator */}
				<CollaboratorPresence />

				{/* In-App Notifications Bell */}
				<NotificationBell />

				{/* Dark Mode Toggle */}
				<button
					type="button"
					onClick={toggleTheme}
					aria-label="Toggle Theme"
					className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
					title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
				>
					{theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
				</button>
			</div>
		</header>
	);
}
