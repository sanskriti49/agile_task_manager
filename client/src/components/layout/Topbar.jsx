import React, { useState } from "react";
import {
	ChevronRight,
	Search,
	XCircle,
	Command,
	Bell,
	Pencil,
	LayoutGrid,
	Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PEOPLE } from "../../data/people";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

function Avatar({ name }) {
	const person = PEOPLE[name] || {
		initials: name?.slice(0, 2) || "??",
		color: "bg-slate-500",
	};
	return (
		<div
			className={`relative flex h-6 w-6 items-center justify-center rounded-full ${person.color} font-mono-ui text-[10px] font-bold text-white shadow-xs ring-2 ring-white`}
			title={name}
		>
			{person.initials}
			<span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
		</div>
	);
}

export default function Topbar({
	searchQuery = "",
	setSearchQuery = () => {},
	priorityFilter = "all",
	setPriorityFilter = () => {},
	assigneeFilter = "all",
	setAssigneeFilter = () => {},
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [editingTitle, setEditingTitle] = useState("");

	const { id: workspaceId } = useParams();
	const workspaces = useWorkspaceStore((state) => state.workspaces);
	const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
	const updateWorkspace = useWorkspaceStore((state) => state.updateWorkspace);

	const foundWorkspace = workspaces.find((ws) => ws.id === workspaceId);
	const activityOpen = useWorkspaceStore((state) => state.activityOpen);
	const setActivityOpen = useWorkspaceStore((state) => state.setActivityOpen);

	const workspaceName =
		currentWorkspace?.name || foundWorkspace?.name || "Untitled Workspace";

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
		searchQuery || priorityFilter !== "all" || assigneeFilter !== "all";

	const clearFilters = () => {
		setSearchQuery("");
		setPriorityFilter("all");
		setAssigneeFilter("all");
	};

	return (
		<header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-xl transition-all md:px-6">
			{/* Left: Interactive Breadcrumb Navigation & Editable Workspace Title */}
			<div className="flex items-center gap-2 min-w-0">
				<Link
					to="/dashboard"
					className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono-ui text-xs font-semibold text-slate-500 transition-all hover:bg-slate-100 hover:text-teal-600"
					title="Click to go back to Dashboard"
				>
					<LayoutGrid className="h-4 w-4 text-slate-400 transition-transform group-hover:scale-110 group-hover:text-teal-600" />
					<span className="text-[13.5px]">Workspaces</span>
				</Link>

				<ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />

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
						className="display max-w-[220px] rounded-lg border border-teal-400 bg-teal-50/50 px-2.5 py-1 text-sm font-bold tracking-tight text-slate-900 shadow-sm outline-none ring-2 ring-teal-200 md:max-w-[320px]"
					/>
				) : (
					<button
						type="button"
						onClick={handleStartEdit}
						title="Click to rename workspace"
						className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-left transition-colors hover:bg-slate-100/80"
					>
						<h1 className="display truncate text-[14.5px] font-bold tracking-tight text-slate-900 md:text-base">
							{workspaceName}
						</h1>
						<Pencil className="h-3 w-3 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
					</button>
				)}
			</div>

			{/* Right: Search, Priority Filters, Assignee Selector, & Activity Bell */}
			<div className="flex items-center gap-3">
				{/* Search Input */}
				<div className="relative hidden md:block">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
					<input
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search tickets..."
						className="font-mono-ui w-48 rounded-xl border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-8 text-xs text-slate-800 transition-all placeholder:text-slate-400 focus:w-60 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-100"
						aria-label="Search issues"
					/>
					{searchQuery ? (
						<button
							onClick={() => setSearchQuery("")}
							className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
						>
							<XCircle className="h-3.5 w-3.5" />
						</button>
					) : (
						<span className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded border border-slate-200 bg-white px-1 py-0.5 font-mono-ui text-[10px] text-slate-400 shadow-2xs">
							<Command className="h-2.5 w-2.5" />K
						</span>
					)}
				</div>

				{/* Priority Filter Segmented Tabs */}
				<div className="hidden items-center rounded-xl bg-slate-100/80 p-1 font-mono-ui text-xs lg:flex">
					{[
						{ id: "all", label: "All" },
						{ id: "high", label: "High", dot: "bg-rose-500" },
						{ id: "medium", label: "Med", dot: "bg-amber-500" },
						{ id: "low", label: "Low", dot: "bg-sky-500" },
					].map((item) => (
						<button
							key={item.id}
							onClick={() => setPriorityFilter(item.id)}
							className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
								priorityFilter === item.id
									? "bg-white text-teal-700 shadow-xs"
									: "text-slate-500 hover:text-slate-800"
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
				<div className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-1 font-mono-ui text-xs md:flex">
					<Users className="h-3 w-3 text-slate-400" />
					<select
						value={assigneeFilter}
						onChange={(e) => setAssigneeFilter(e.target.value)}
						className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
					>
						<option value="all">All assignees</option>
						{PEOPLE &&
							Object.keys(PEOPLE).map((p) => (
								<option key={p} value={p}>
									{p}
								</option>
							))}
					</select>
				</div>

				{/* Clear Filters Quick Action */}
				{filtersActive && (
					<button
						onClick={clearFilters}
						className="font-mono-ui text-xs font-semibold text-teal-600 hover:text-teal-700"
					>
						Clear
					</button>
				)}

				<div className="h-4 w-px bg-slate-200 mx-0.5" />

				{/* Teammate Avatars */}
				<div className="hidden sm:flex items-center -space-x-2">
					{["Aria Chen", "Rohan Mehta", "Priya Nair"].map((n) => (
						<Avatar key={n} name={n} />
					))}
				</div>

				{/* Activity Bell Drawer Button */}
				<button
					onClick={() => setActivityOpen(!activityOpen)}
					className={`relative rounded-xl p-2 transition-all ${
						activityOpen
							? "bg-teal-50 text-teal-600 ring-2 ring-teal-200"
							: "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
					}`}
					title="Activity Log Stream"
				>
					<Bell className="h-4 w-4" />
					<span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
				</button>
			</div>
		</header>
	);
}
