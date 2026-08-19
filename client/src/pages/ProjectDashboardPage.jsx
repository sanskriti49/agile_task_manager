import React, { useEffect } from "react";
import {
	BarChart3,
	PieChart,
	TrendingUp,
	Users,
	CheckCircle2,
	Clock,
	AlertTriangle,
	Flame,
	ArrowLeft,
	Loader2,
	Target,
	Award,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { avatarColor } from "../components/utils/avatarColor";

import AppLoader from "../components/common/AppLoader";

export default function ProjectDashboardPage() {
	const { id: projectId } = useParams();
	const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
	const fetchWorkspaceById = useWorkspaceStore(
		(state) => state.fetchWorkspaceById,
	);
	const projectAnalytics = useWorkspaceStore((state) => state.projectAnalytics);
	const analyticsLoading = useWorkspaceStore((state) => state.analyticsLoading);
	const fetchProjectAnalytics = useWorkspaceStore(
		(state) => state.fetchProjectAnalytics,
	);

	useEffect(() => {
		if (projectId) {
			fetchWorkspaceById(projectId);
			fetchProjectAnalytics(projectId);
		}
	}, [projectId, fetchWorkspaceById, fetchProjectAnalytics]);

	if (analyticsLoading && !projectAnalytics) {
		return (
			<AppLoader
				text="Computing delivery metrics and velocity analytics..."
				type="ring"
				minH="min-h-[500px]"
			/>
		);
	}

	const summary = projectAnalytics?.summary || {};
	const byPriority = projectAnalytics?.byPriority || [];
	const byStatus = projectAnalytics?.byStatus || [];
	const workload = projectAnalytics?.workload || [];
	const completedOverTime = projectAnalytics?.completedOverTime || [];
	const activeSprint = projectAnalytics?.activeSprint || null;

	const totalTasks = summary.total_tasks || 0;
	const completedTasks = summary.completed_tasks || 0;
	const completionRate = summary.completion_percentage || 0;

	return (
		<div className="w-full bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100">
			<main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
				{/* Top Bar */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800">
					<div>
						<Link
							to={`/workspace/${projectId}`}
							className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline mb-1"
						>
							<ArrowLeft className="h-3.5 w-3.5" /> Back to Board
						</Link>
						<h1 className="display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
							{currentWorkspace?.name || "Project"} Analytics
						</h1>
						<p className="work-sans text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono-ui">
							Real-time delivery metrics, velocity charts, and workload
							distribution
						</p>
					</div>

					<div className="flex items-center gap-2 font-mono-ui">
						<Link
							to={`/workspace/${projectId}/sprints`}
							className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
						>
							<Flame className="h-3.5 w-3.5 text-amber-500" /> Sprints &
							Burndown
						</Link>
					</div>
				</div>

				{/* KPI Highlights */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 font-mono-ui">
					{/* Completion Rate */}
					<div className="onest bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
						<div className="flex items-center justify-between text-teal-600 mb-2">
							<span className="text-xs font-bold uppercase tracking-wider">
								Completion
							</span>
							<CheckCircle2 className="h-4 w-4" />
						</div>
						<div className="flex items-baseline gap-2">
							<span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
								{completionRate}%
							</span>
							<span className="text-xs text-slate-400">
								({completedTasks}/{totalTasks})
							</span>
						</div>
						<div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
							<div
								className="h-full bg-teal-500 transition-all duration-500 rounded-full"
								style={{ width: `${completionRate}%` }}
							/>
						</div>
					</div>

					{/* In Progress / Active */}
					<div className="onest bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
						<div className="flex items-center justify-between text-amber-500 mb-2">
							<span className="text-xs font-bold uppercase tracking-wider">
								In Progress
							</span>
							<Clock className="h-4 w-4" />
						</div>
						<span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
							{summary.in_progress_tasks || 0}
						</span>
						<p className="work-sans text-xs text-slate-400 mt-2">
							Active development items
						</p>
					</div>

					{/* High Priority */}
					<div className="onest bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
						<div className="flex items-center justify-between text-rose-500 mb-2">
							<span className="text-xs font-bold uppercase tracking-wider">
								High Priority
							</span>
							<AlertTriangle className="h-4 w-4" />
						</div>
						<span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
							{summary.high_priority_tasks || 0}
						</span>
						<p className="work-sans text-xs text-slate-400 mt-2">
							Critical blockers & urgent fixes
						</p>
					</div>

					{/* Overdue */}
					<div className="onest bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
						<div className="flex items-center justify-between text-rose-600 mb-2">
							<span className="text-xs font-bold uppercase tracking-wider">
								Overdue
							</span>
							<Clock className="h-4 w-4" />
						</div>
						<span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
							{summary.overdue_tasks || 0}
						</span>
						<p className="work-sans text-xs text-slate-400 mt-2">
							Tasks past deadline
						</p>
					</div>
				</div>

				{/* Active Sprint Banner if any */}
				{activeSprint && (
					<div className="mb-8 rounded-2xl border border-amber-300 dark:border-amber-900/60 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-5 shadow-xs">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
									<Flame className="h-5 w-5" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<span className="text-[10px] font-bold uppercase bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
											Active Sprint
										</span>
										<h3 className="display font-bold text-base text-slate-900 dark:text-slate-100">
											{activeSprint.name}
										</h3>
									</div>
									<p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
										{activeSprint.goal || "Sprint in progress"}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-4 text-xs">
								<div>
									<span className="text-slate-400">Progress: </span>
									<span className="font-bold text-slate-800 dark:text-slate-200">
										{activeSprint.sprint_completed_tasks || 0}/
										{activeSprint.sprint_tasks || 0} tasks
									</span>
								</div>
								<Link
									to={`/workspace/${projectId}/sprints`}
									className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xs text-xs"
								>
									View Burndown →
								</Link>
							</div>
						</div>
					</div>
				)}

				{/* 2x2 Charts Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 font-mono-ui">
					{/* Chart 1: Tasks by Status */}
					<div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<PieChart className="h-4 w-4 text-teal-600 dark:text-teal-400" />
								<h3 className="display font-bold text-sm text-slate-900 dark:text-slate-100">
									Tasks by Status
								</h3>
							</div>
							<span className="onest text-xs text-slate-400">
								{totalTasks} total
							</span>
						</div>

						<div className="space-y-3">
							{byStatus.map((item) => {
								const pct =
									totalTasks > 0
										? Math.round((item.count / totalTasks) * 100)
										: 0;
								const colorMap = {
									backlog: "bg-slate-400",
									todo: "bg-indigo-500",
									inprogress: "bg-amber-500",
									in_progress: "bg-amber-500",
									done: "bg-emerald-500",
								};
								const barColor = colorMap[item.status] || "bg-teal-500";

								return (
									<div key={item.status}>
										<div className="flex items-center justify-between text-xs mb-1">
											<span className="font-semibold uppercase text-slate-600 dark:text-slate-300">
												{item.status}
											</span>
											<span className="text-slate-400">
												{item.count} ({pct}%)
											</span>
										</div>
										<div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
											<div
												className={`h-full ${barColor} rounded-full transition-all duration-500`}
												style={{ width: `${pct}%` }}
											/>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Chart 2: Tasks by Priority */}
					<div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<BarChart3 className="h-4 w-4 text-amber-500" />
								<h3 className="display font-bold text-sm text-slate-900 dark:text-slate-100">
									Tasks by Priority
								</h3>
							</div>
						</div>

						<div className="space-y-3">
							{["high", "medium", "low"].map((prio) => {
								const match = byPriority.find(
									(p) => (p.priority || "").toLowerCase() === prio,
								);
								const count = match ? match.count : 0;
								const pct =
									totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
								const color =
									prio === "high"
										? "bg-rose-500"
										: prio === "medium"
											? "bg-amber-500"
											: "bg-sky-500";

								return (
									<div key={prio}>
										<div className="inter flex items-center justify-between text-xs mb-1">
											<span className="font-semibold uppercase text-slate-600 dark:text-slate-300">
												{prio} Priority
											</span>
											<span className="text-slate-400">
												{count} ({pct}%)
											</span>
										</div>
										<div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
											<div
												className={`h-full ${color} rounded-full transition-all duration-500`}
												style={{ width: `${pct}%` }}
											/>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Chart 3: Velocity / Tasks Completed Over Time */}
					<div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<TrendingUp className="h-4 w-4 text-emerald-500" />
								<h3 className="display font-bold text-sm text-slate-900 dark:text-slate-100">
									Completed Over Time (Last 14 Days)
								</h3>
							</div>
						</div>

						{completedOverTime.length === 0 ? (
							<div className="py-12 text-center text-xs text-slate-400 font-mono-ui">
								No tasks marked done in the last 14 days. Complete issues to see
								velocity trends!
							</div>
						) : (
							<div className="h-40 flex items-end gap-2 pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
								{completedOverTime.map((d, i) => {
									const maxCount = Math.max(
										1,
										...completedOverTime.map((x) => x.count),
									);
									const heightPercent = Math.max(
										15,
										Math.round((d.count / maxCount) * 100),
									);

									return (
										<div
											key={i}
											className="flex-1 flex flex-col items-center gap-1 group relative"
										>
											<div
												className="w-full bg-emerald-500/80 hover:bg-emerald-500 rounded-t-md transition-all cursor-pointer"
												style={{ height: `${heightPercent}%` }}
											/>
											<span className="text-[10px] text-slate-400 truncate w-full text-center">
												{d.date.slice(5)}
											</span>

											{/* Hover Tooltip */}
											<div className="pointer-events-none absolute -top-8 hidden group-hover:block bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-bold shadow-lg z-20 whitespace-nowrap">
												{d.count} task(s) on {d.date}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>

					{/* Chart 4: Team Workload Distribution */}
					<div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
								<h3 className="display font-bold text-sm text-slate-900 dark:text-slate-100">
									Team Workload Distribution
								</h3>
							</div>
							<span className="onest text-xs text-slate-400">
								{workload.length} member(s)
							</span>
						</div>

						<div className=" space-y-3 max-h-56 overflow-y-auto pr-1">
							{workload.map((m) => {
								const initials = (m.name || "User")
									.split(" ")
									.slice(0, 2)
									.map((p) => p[0])
									.join("")
									.toUpperCase();

								return (
									<div
										key={m.user_id}
										className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60"
									>
										<div className="flex items-center gap-2.5 min-w-0">
											<div
												className={`h-7 w-7 rounded-full ${avatarColor(
													m.name,
												)} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}
											>
												{initials}
											</div>
											<div className="min-w-0">
												<p className="onest text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
													{m.name}
												</p>
												<span className="work-sans text-[10px] text-slate-400 uppercase">
													{m.role}
												</span>
											</div>
										</div>

										<div className="onest flex items-center gap-3 text-xs">
											<span className="text-amber-600 dark:text-amber-400 font-bold">
												{m.active_tasks} active
											</span>
											<span className="text-slate-300 dark:text-slate-700">
												|
											</span>
											<span className="text-emerald-600 dark:text-emerald-400 font-bold">
												{m.completed_tasks} done
											</span>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
