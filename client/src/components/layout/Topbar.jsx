import React, { useState } from "react";
import { ChevronRight, Search, XCircle, Command, Bell } from "lucide-react";
import Avatar from "../ui/Avatar";
import { PEOPLE } from "../../data/constants";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { useParams } from "react-router-dom";

export default function Topbar({ boardData }) {
	const {
		query,
		setQuery,
		priorityFilter,
		setPriorityFilter,
		assigneeFilter,
		setAssigneeFilter,
		filtersActive,
		clearFilters,
		activityOpen,
		setActivityOpen,
		searchRef,
	} = boardData;

	//const [title, setTitle] = useState("E-Commerce Platform");
	const [isEditing, setIsEditing] = useState(false);
	const [editingTitle, setEditingTitle] = useState("");

	const { id: workspaceId } = useParams();
	const workspaces = useWorkspaceStore((state) => state.workspaces);
	const updateWorkspace = useWorkspaceStore((state) => state.updateWorkspace);

	const currentWorkspace = workspaces.find((ws) => ws.id === workspaceId);
	const workspaceName = currentWorkspace?.name || "Untitled Workspace";

	const handleStartEdit = () => {
		setEditingTitle(workspaceName);
		setIsEditing(true);
	};
	const handleSaveEdit = () => {
		const trimmed = editingTitle.trim();
		if (trimmed) {
			updateWorkspace(workspaceId, trimmed);
		}
		setIsEditing(false);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" || e.key === "Escape") {
			if (!title.trim()) {
				setTitle("Untitled Project");
			}
			setIsEditing(false);
		}
	};

	return (
		<header className="h-16 shrink-0 border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-4 md:px-6 flex items-center gap-3 sticky top-0 z-20">
			<div className="flex items-center gap-1.5 min-w-0">
				<span className="text-sm text-slate-400 truncate">Workspace</span>
				<ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
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
						className="font-semibold text-slate-900 tracking-tight bg-slate-100 rounded px-2 py-1 outline-none ring-2 ring-teal-400 text-sm md:text-base max-w-[200px] md:max-w-[300px]"
					/>
				) : (
					<span
						onClick={handleStartEdit}
						title="Click to edit project title"
						className="font-semibold text-slate-900 truncate tracking-tight cursor-pointer hover:bg-slate-100 px-2 py-1 rounded transition-colors duration-150"
					>
						{workspaceName}
					</span>
				)}
			</div>

			<div className="flex-1" />

			<div className="flex items-center gap-2">
				<div className="relative hidden md:block">
					<Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
					<input
						ref={searchRef}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search issues"
						className="pl-9 pr-16 py-2 w-56 rounded-lg bg-slate-100/80 border border-transparent focus:border-teal-300 focus:bg-white focus:ring-4 focus:ring-teal-100 outline-none text-sm transition-all duration-200"
						aria-label="Search issues"
					/>
					{query ? (
						<button
							onClick={() => setQuery("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							aria-label="Clear search"
						>
							<XCircle className="h-4 w-4" />
						</button>
					) : (
						<span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-medium text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5">
							<Command className="h-2.5 w-2.5" />K
						</span>
					)}
				</div>

				<div className="hidden lg:flex items-center gap-0.5 bg-slate-100/80 rounded-lg p-1">
					{["all", "high", "medium", "low"].map((p) => (
						<button
							key={p}
							onClick={() => setPriorityFilter(p)}
							className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all duration-200 ${
								priorityFilter === p
									? "bg-white text-teal-700 shadow-sm"
									: "text-slate-500 hover:text-slate-700"
							}`}
							aria-label={`Filter by ${p}`}
						>
							{p}
						</button>
					))}
				</div>

				<select
					value={assigneeFilter}
					onChange={(e) => setAssigneeFilter(e.target.value)}
					className="hidden md:block text-xs py-2 px-2 rounded-lg bg-slate-100/80 border border-transparent focus:border-teal-300 focus:bg-white outline-none transition-all duration-200"
					aria-label="Filter by assignee"
				>
					<option value="all">All assignees</option>
					{Object.keys(PEOPLE).map((p) => (
						<option key={p} value={p}>
							{p}
						</option>
					))}
				</select>

				{filtersActive && (
					<button
						onClick={clearFilters}
						className="text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors duration-150"
						aria-label="Clear filters"
					>
						Clear
					</button>
				)}
			</div>

			<div className="flex items-center -space-x-2 pl-1">
				{["Aria Chen", "Rohan Mehta", "Priya Nair"].map((n) => (
					<Avatar key={n} name={n} presence />
				))}
			</div>

			<button
				onClick={() => setActivityOpen((v) => !v)}
				className={`relative p-2 rounded-lg transition-all duration-200 ${
					activityOpen
						? "bg-teal-50 text-teal-600"
						: "text-slate-500 hover:bg-slate-100"
				}`}
				title="Activity"
				aria-label="Toggle activity"
			>
				<Bell className="h-4 w-4" />
				<span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
			</button>
		</header>
	);
}
