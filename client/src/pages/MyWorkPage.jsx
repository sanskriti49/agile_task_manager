import React, { useEffect, useState, useMemo } from "react";
import {
	CheckSquare,
	AlertCircle,
	Calendar,
	Clock,
	CheckCircle2,
	FolderKanban,
	Flag,
	Filter,
	Sparkles,
	Loader2,
	ChevronRight,
	Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { useAuthStore } from "../store/useAuthStore";
import { PRIORITY } from "../data/constants";
import AppLoader from "../components/common/AppLoader";

export default function MyWorkPage() {
	const user = useAuthStore((state) => state.user);
	const myWorkData = useWorkspaceStore((state) => state.myWorkData);
	const myWorkLoading = useWorkspaceStore((state) => state.myWorkLoading);
	const fetchMyWork = useWorkspaceStore((state) => state.fetchMyWork);
	const updateTicket = useWorkspaceStore((state) => state.updateTicket);
	const setSelectedTicket = useWorkspaceStore(
		(state) => state.setSelectedTicket,
	);
	const setNewTicketCol = useWorkspaceStore((state) => state.setNewTicketCol);

	const [statusTab, setStatusTab] = useState("all"); // 'all' | 'due-today' | 'overdue' | 'inprogress' | 'completed'
	const [priorityFilter, setPriorityFilter] = useState("all");
	const [projectFilter, setProjectFilter] = useState("all");

	useEffect(() => {
		fetchMyWork();
	}, [fetchMyWork]);

	const allTasks = myWorkData?.allTasks || [];
	const stats = myWorkData?.stats || {
		totalAssigned: 0,
		completed: 0,
		inProgress: 0,
		dueToday: 0,
		overdue: 0,
		completionRate: 0,
	};

	// Unique projects list for filter
	const projectsList = useMemo(() => {
		const map = new Map();
		allTasks.forEach((t) => {
			if (t.project_id && !map.has(t.project_id)) {
				map.set(t.project_id, t.project_name || "Project");
			}
		});
		return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
	}, [allTasks]);

	const getDueDayStr = (d) => {
		if (!d) return "";
		if (typeof d === "string") return d.split("T")[0];
		if (d instanceof Date) return d.toISOString().split("T")[0];
		return "";
	};

	// Filter tasks
	const filteredTasks = useMemo(() => {
		const now = new Date();
		const todayStr = now.toISOString().split("T")[0];

		return allTasks.filter((t) => {
			const dueDay = getDueDayStr(t.due_date);

			// Tab filtering
			if (statusTab === "due-today") {
				if (t.status === "done" || !dueDay || dueDay !== todayStr) return false;
			} else if (statusTab === "overdue") {
				if (
					t.status === "done" ||
					!t.due_date ||
					new Date(t.due_date) >= now ||
					dueDay === todayStr
				)
					return false;
			} else if (statusTab === "inprogress") {
				if (t.status !== "inprogress" && t.status !== "in_progress")
					return false;
			} else if (statusTab === "completed") {
				if (t.status !== "done") return false;
			}

			// Priority filter
			if (
				priorityFilter !== "all" &&
				t.priority?.toLowerCase() !== priorityFilter
			) {
				return false;
			}

			// Project filter
			if (projectFilter !== "all" && t.project_id !== projectFilter) {
				return false;
			}

			return true;
		});
	}, [allTasks, statusTab, priorityFilter, projectFilter]);

	// Group filtered tasks by project
	const groupedByProject = useMemo(() => {
		const map = {};
		filteredTasks.forEach((t) => {
			if (!map[t.project_id]) {
				map[t.project_id] = {
					id: t.project_id,
					name: t.project_name || "Workspace",
					tasks: [],
				};
			}
			map[t.project_id].tasks.push(t);
		});
		return Object.values(map);
	}, [filteredTasks]);

	const handleToggleDone = async (task, e) => {
		e.stopPropagation();
		const nextStatus = task.status === "done" ? "todo" : "done";
		await updateTicket(task.id, { status: nextStatus });
		fetchMyWork();
	};

	if (myWorkLoading && !myWorkData) {
		return (
			<AppLoader
				text="Loading your personal tasks..."
				type="ring"
				minH="min-h-[500px]"
			/>
		);
	}

	return (
		<div className="w-full bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100">
			<main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
				{/* Top Header */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800">
					<div>
						<div className="flex items-center gap-2 text-teal-600 dark:text-teal-400  text-xs font-semibold uppercase tracking-wider">
							<CheckSquare className="h-4 w-4" /> Personal Workspace
						</div>
						<h1 className="display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
							My Work
						</h1>
						<p className="work-sans text-xs text-slate-500 dark:text-slate-400 mt-1 ">
							{stats.totalAssigned} tasks assigned across {projectsList.length}{" "}
							workspace(s)
						</p>
					</div>

					<button
						type="button"
						onClick={() => setNewTicketCol("todo")}
						className="flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors"
					>
						<Plus className="h-4 w-4" /> Quick Task
					</button>
				</div>

				{/* KPI Cards Strip */}
				<div className="work-sans grid grid-cols-2 sm:grid-cols-5 gap-3 my-6">
					<div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
						<div className="flex items-center justify-between text-slate-400 mb-1">
							<span className="text-[11px] font-semibold uppercase">
								Assigned
							</span>
							<CheckSquare className="h-3.5 w-3.5" />
						</div>
						<span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
							{stats.totalAssigned}
						</span>
					</div>

					<div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
						<div className="flex items-center justify-between text-amber-500 mb-1">
							<span className="text-[11px] font-semibold uppercase">
								In Progress
							</span>
							<Clock className="h-3.5 w-3.5" />
						</div>
						<span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
							{stats.inProgress}
						</span>
					</div>

					<div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-200/80 dark:border-rose-950/60 bg-rose-50/20 shadow-2xs">
						<div className="flex items-center justify-between text-rose-500 mb-1">
							<span className="text-[11px] font-semibold uppercase">
								Overdue
							</span>
							<AlertCircle className="h-3.5 w-3.5" />
						</div>
						<span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
							{stats.overdue}
						</span>
					</div>

					<div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
						<div className="flex items-center justify-between text-sky-500 mb-1">
							<span className="onest text-[11px] font-semibold uppercase">
								Due Today
							</span>
							<Calendar className="h-3.5 w-3.5" />
						</div>
						<span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
							{stats.dueToday}
						</span>
					</div>

					<div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-950/60 bg-emerald-50/20 shadow-2xs col-span-2 sm:col-span-1">
						<div className="flex items-center justify-between text-emerald-600 mb-1">
							<span className="text-[11px] font-semibold uppercase">
								Completed
							</span>
							<CheckCircle2 className="h-3.5 w-3.5" />
						</div>
						<span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
							{stats.completed} ({stats.completionRate}%)
						</span>
					</div>
				</div>

				{/* Filters & Tabs */}
				<div className="onest flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 mb-6 ">
					{/* Status Tabs */}
					<div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
						{[
							{ id: "all", label: "All Tasks", count: stats.totalAssigned },
							{
								id: "due-today",
								label: "Due Today",
								count: stats.dueToday,
								alert: true,
							},
							{
								id: "overdue",
								label: "Overdue",
								count: stats.overdue,
								danger: true,
							},
							{
								id: "inprogress",
								label: "In Progress",
								count: stats.inProgress,
							},
							{ id: "completed", label: "Completed", count: stats.completed },
						].map((tab) => (
							<button
								key={tab.id}
								type="button"
								onClick={() => setStatusTab(tab.id)}
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
									statusTab === tab.id
										? "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 ring-1 ring-teal-300 dark:ring-teal-700"
										: "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
								}`}
							>
								<span>{tab.label}</span>
								<span
									className={`text-[10px] px-1.5 py-0.2 rounded-full ${
										tab.danger && tab.count > 0
											? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
											: "bg-slate-100 dark:bg-slate-800 text-slate-500"
									}`}
								>
									{tab.count}
								</span>
							</button>
						))}
					</div>

					{/* Secondary Filters */}
					<div className="flex items-center gap-2 self-end sm:self-auto text-xs">
						{/* Priority Filter */}
						<select
							value={priorityFilter}
							onChange={(e) => setPriorityFilter(e.target.value)}
							className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-200 outline-none text-xs"
						>
							<option value="all">All Priorities</option>
							<option value="high">High Priority</option>
							<option value="medium">Medium Priority</option>
							<option value="low">Low Priority</option>
						</select>

						{/* Project Filter */}
						<select
							value={projectFilter}
							onChange={(e) => setProjectFilter(e.target.value)}
							className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-200 outline-none text-xs"
						>
							<option value="all">All Workspaces</option>
							{projectsList.map((p) => (
								<option key={p.id} value={p.id}>
									{p.name}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Task List Grouped by Project */}
				{groupedByProject.length === 0 ? (
					<div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center">
						<CheckSquare className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
						<h3 className="display font-bold text-base text-slate-800 dark:text-slate-200">
							No tasks found
						</h3>
						<p className="text-xs text-slate-400  mt-1">
							No tasks match your selected view or filters.
						</p>
					</div>
				) : (
					<div className="space-y-6">
						{groupedByProject.map((group) => (
							<div
								key={group.id}
								className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs"
							>
								{/* Project Header */}
								<div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800">
									<div className="flex items-center gap-2">
										<FolderKanban className="h-4 w-4 text-teal-600 dark:text-teal-400" />
										<Link
											to={`/workspace/${group.id}`}
											className="display font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-teal-600 transition-colors"
										>
											{group.name}
										</Link>
										<span className=" text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
											{group.tasks.length} task
											{group.tasks.length !== 1 ? "s" : ""}
										</span>
									</div>

									<Link
										to={`/workspace/${group.id}`}
										className="work-sans text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
									>
										Open Board <ChevronRight className="h-3.5 w-3.5" />
									</Link>
								</div>

								{/* Tasks Table */}
								<div className="work-sans divide-y divide-slate-100 dark:divide-slate-800/60">
									{group.tasks.map((task) => {
										const isDone = task.status === "done";
										const isOverdue =
											!isDone &&
											task.due_date &&
											new Date(task.due_date) < new Date();
										const priorityCfg =
											PRIORITY[task.priority?.toLowerCase()] || PRIORITY.medium;

										return (
											<div
												key={task.id}
												onClick={() => setSelectedTicket(task)}
												className={`flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors duration-150 ${
													isDone
														? "opacity-60 bg-slate-50/30 dark:bg-slate-950/20"
														: ""
												}`}
											>
												<div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
													{/* Checkbox toggle */}
													<button
														type="button"
														onClick={(e) => handleToggleDone(task, e)}
														className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
															isDone
																? "bg-emerald-500 border-emerald-500 text-white"
																: "border-slate-300 dark:border-slate-600 hover:border-teal-500"
														}`}
													>
														{isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
													</button>

													<div className="min-w-0">
														<div className="flex items-center gap-2">
															<span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
																{task.task_key || task.id.slice(0, 7)}
															</span>
															<h4
																className={`text-xs sm:text-sm font-semibold truncate ${
																	isDone
																		? "line-through text-slate-400 dark:text-slate-500"
																		: "text-slate-800 dark:text-slate-200"
																}`}
															>
																{task.title}
															</h4>
														</div>
														{task.sprint_name && (
															<span className="inline-block mt-0.5 text-[10px]  font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.2 rounded">
																Sprint: {task.sprint_name}
															</span>
														)}
													</div>
												</div>

												{/* Right Badges */}
												<div className="flex items-center gap-3 shrink-0  text-xs">
													{/* Priority */}
													<span
														className={`hidden sm:inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-full border ${priorityCfg.chip}`}
													>
														{priorityCfg.label}
													</span>

													{/* Due Date */}
													{task.due_date && (
														<span
															className={`flex items-center gap-1 text-[12px] font-medium ${
																isOverdue
																	? "text-rose-600 dark:text-rose-400 font-bold"
																	: "text-slate-400 dark:text-slate-500"
															}`}
														>
															<Calendar className="h-3 w-3" />
															{new Date(task.due_date).toLocaleDateString(
																undefined,
																{ month: "short", day: "numeric" },
															)}
														</span>
													)}

													{/* Status badge */}
													<span
														className={`text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
															isDone
																? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
																: task.status === "inprogress"
																	? "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
																	: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
														}`}
													>
														{task.status}
													</span>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						))}
					</div>
				)}
			</main>
		</div>
	);
}
