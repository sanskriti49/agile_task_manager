import React, { useEffect, useState } from "react";
import {
	Flame,
	Plus,
	Play,
	CheckCircle2,
	Calendar,
	Target,
	TrendingDown,
	ArrowLeft,
	Loader2,
	ChevronRight,
	AlertCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { PRIORITY } from "../data/constants";
import AppLoader from "../components/common/AppLoader";

export default function SprintManagementPage() {
	const { id: projectId } = useParams();
	const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
	const sprints = useWorkspaceStore((state) => state.sprints) || [];
	const activeSprint = useWorkspaceStore((state) => state.activeSprint);
	const sprintsLoading = useWorkspaceStore((state) => state.sprintsLoading);
	const burndownData = useWorkspaceStore((state) => state.burndownData);
	const fetchSprints = useWorkspaceStore((state) => state.fetchSprints);
	const startSprint = useWorkspaceStore((state) => state.startSprint);
	const completeSprint = useWorkspaceStore((state) => state.completeSprint);
	const fetchSprintBurndown = useWorkspaceStore(
		(state) => state.fetchSprintBurndown,
	);
	const fetchWorkspaceById = useWorkspaceStore(
		(state) => state.fetchWorkspaceById,
	);
	const setIsCreateSprintModalOpen = useWorkspaceStore(
		(state) => state.setIsCreateSprintModalOpen,
	);
	const setSelectedTicket = useWorkspaceStore(
		(state) => state.setSelectedTicket,
	);
	const updateTicket = useWorkspaceStore((state) => state.updateTicket);

	const [selectedSprintForBurndown, setSelectedSprintForBurndown] =
		useState(null);

	useEffect(() => {
		if (projectId) {
			fetchWorkspaceById(projectId);
			fetchSprints(projectId);
		}
	}, [projectId, fetchWorkspaceById, fetchSprints]);

	useEffect(() => {
		if (activeSprint) {
			setSelectedSprintForBurndown(activeSprint.id);
			fetchSprintBurndown(projectId, activeSprint.id);
		} else if (sprints.length > 0) {
			setSelectedSprintForBurndown(sprints[0].id);
			fetchSprintBurndown(projectId, sprints[0].id);
		}
	}, [activeSprint, sprints, projectId, fetchSprintBurndown]);

	const allTasks = currentWorkspace?.tasks || [];
	const backlogTasks = allTasks.filter((t) => !t.sprint_id);

	const handleAssignSprint = async (taskId, sprintId) => {
		await updateTicket(taskId, { sprint_id: sprintId || "unassigned" });
		fetchSprints(projectId);
		fetchWorkspaceById(projectId);
	};

	if (sprintsLoading && sprints.length === 0) {
		return (
			<AppLoader
				text="Loading sprint backlog and cycles..."
				type="ring"
				minH="min-h-[500px]"
			/>
		);
	}

	const plannedSprints = sprints.filter((s) => s.status === "planned");
	const completedSprints = sprints.filter((s) => s.status === "completed");

	return (
		<div className="w-full bg-slate-50 dark:bg-slate-950 min-h-full text-slate-900 dark:text-slate-100">
			<main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
				{/* Header */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800">
					<div>
						<Link
							to={`/workspace/${projectId}`}
							className="inter inline-flex items-center gap-1 text-xs inter font-semibold text-teal-600 dark:text-teal-400 hover:underline mb-1"
						>
							<ArrowLeft className="h-3.5 w-3.5" /> Back to Board
						</Link>
						<h1 className="display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
							Sprint Management & Backlog
						</h1>
						<p className="work-sans text-sm text-slate-500 dark:text-slate-400 mt-1 ">
							Scrum planning, sprint commitments, velocity metrics, and burndown
							charts
						</p>
					</div>

					<button
						type="button"
						onClick={() => setIsCreateSprintModalOpen(true)}
						className="display flex items-center gap-1.5 self-start sm:self-auto px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-xs transition-colors"
					>
						<Plus className="h-4 w-4" /> Create Sprint
					</button>
				</div>

				{/* 1. Active Sprint Showcase */}
				{activeSprint ? (
					<section className="my-8 rounded-2xl border border-amber-300 dark:border-amber-900/80 bg-white dark:bg-slate-900 shadow-md overflow-hidden">
						<div className="p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-b border-slate-100 dark:border-slate-800">
							<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
								<div>
									<div className="flex items-center gap-2">
										<span className="inline-flex items-center gap-1 bg-amber-500 text-white  text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
											<Flame className="h-3 w-3" /> Active Sprint
										</span>
										<h2 className="display text-xl font-bold text-slate-900 dark:text-slate-100">
											{activeSprint.name}
										</h2>
									</div>

									<p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-2xl leading-relaxed">
										{activeSprint.goal || "No sprint goal defined."}
									</p>

									<div className="flex flex-wrap items-center gap-4 mt-4 text-xs  text-slate-500 dark:text-slate-400">
										{activeSprint.start_date && (
											<span className="flex items-center gap-1">
												<Calendar className="h-3.5 w-3.5" />
												{new Date(
													activeSprint.start_date,
												).toLocaleDateString()}{" "}
												–{" "}
												{activeSprint.end_date
													? new Date(activeSprint.end_date).toLocaleDateString()
													: "Ongoing"}
											</span>
										)}
										<span>
											{activeSprint.total_tasks || 0} issues committed (
											{activeSprint.total_points || 0} story points)
										</span>
									</div>
								</div>

								<div className="flex items-center gap-2 self-end sm:self-start">
									<button
										type="button"
										onClick={() => completeSprint(projectId, activeSprint.id)}
										className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors "
									>
										<CheckCircle2 className="h-4 w-4" /> Complete Sprint
									</button>
								</div>
							</div>

							{/* Progress Meter */}
							<div className="mt-6 ">
								<div className="flex items-center justify-between text-xs mb-1.5">
									<span className="font-semibold text-slate-700 dark:text-slate-300">
										Sprint Completion Progress
									</span>
									<span className="font-bold text-slate-900 dark:text-slate-100">
										{activeSprint.completed_tasks || 0}/
										{activeSprint.total_tasks || 0} tasks (
										{activeSprint.total_tasks > 0
											? Math.round(
													(activeSprint.completed_tasks /
														activeSprint.total_tasks) *
														100,
												)
											: 0}
										%)
									</span>
								</div>
								<div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
									<div
										className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
										style={{
											width: `${
												activeSprint.total_tasks > 0
													? (activeSprint.completed_tasks /
															activeSprint.total_tasks) *
														100
													: 0
											}%`,
										}}
									/>
								</div>
							</div>
						</div>

						{/* Active Sprint Tasks List */}
						<div className="p-6">
							<h3 className="display font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
								Committed Tasks in this Sprint
							</h3>
							{allTasks.filter((t) => t.sprint_id === activeSprint.id)
								.length === 0 ? (
								<p className="onest text-xs text-slate-400  py-4">
									No tasks assigned to active sprint. Drag or assign tasks
									below.
								</p>
							) : (
								<div className="divide-y divide-slate-100 dark:divide-slate-800">
									{allTasks
										.filter((t) => t.sprint_id === activeSprint.id)
										.map((task) => (
											<div
												key={task.id}
												onClick={() => setSelectedTicket(task)}
												className="flex items-center justify-between py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl cursor-pointer"
											>
												<div className="flex items-center gap-3 min-w-0">
													<span className="font-mono text-xs font-bold text-slate-400">
														{task.task_key || task.id.slice(0, 7)}
													</span>
													<p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
														{task.title}
													</p>
												</div>

												<div className="flex items-center gap-3 shrink-0  text-xs">
													{task.story_points > 0 && (
														<span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded text-[11px] font-bold">
															{task.story_points} pts
														</span>
													)}
													<span
														className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
															task.status === "done"
																? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
																: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
														}`}
													>
														{task.status}
													</span>
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															handleAssignSprint(task.id, null);
														}}
														className="text-[11px] text-rose-500 hover:underline"
													>
														Remove
													</button>
												</div>
											</div>
										))}
								</div>
							)}
						</div>
					</section>
				) : (
					<div className="my-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
						<Flame className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
						<h3 className="display font-bold text-base text-slate-800 dark:text-slate-200">
							No Active Sprint
						</h3>
						<p className="onest text-xs text-slate-400  mt-1 max-w-sm mx-auto">
							Start a planned sprint below or create a new sprint to begin an
							Agile cycle.
						</p>
					</div>
				)}

				{/* 2. Burndown Chart Section */}
				{burndownData && burndownData.burndownData && (
					<section className="my-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
							<div>
								<div className="flex items-center gap-2">
									<TrendingDown className="h-4 w-4 text-teal-600 dark:text-teal-400" />
									<h3 className="display font-bold text-base text-slate-900 dark:text-slate-100">
										Sprint Burndown Chart
									</h3>
								</div>
								<p className="text-xs text-slate-400  mt-0.5">
									Ideal burndown guideline vs Actual remaining story points
								</p>
							</div>

							{/* Sprint selector */}
							{sprints.length > 0 && (
								<select
									value={selectedSprintForBurndown || ""}
									onChange={(e) => {
										setSelectedSprintForBurndown(e.target.value);
										fetchSprintBurndown(projectId, e.target.value);
									}}
									className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs  text-slate-700 dark:text-slate-200 outline-none"
								>
									{sprints.map((s) => (
										<option key={s.id} value={s.id}>
											{s.name} ({s.status})
										</option>
									))}
								</select>
							)}
						</div>

						{/* Chart Visualization */}
						<div className="h-48 flex items-end gap-2 border-b border-l border-slate-200 dark:border-slate-800 pt-6 px-4 pb-2 ">
							{burndownData.burndownData.map((d, index) => {
								const maxPts = Math.max(1, burndownData.totalStoryPoints);
								const idealHeight = Math.max(
									5,
									Math.round((d.idealPoints / maxPts) * 100),
								);
								const actualHeight =
									d.actualPoints !== null
										? Math.max(5, Math.round((d.actualPoints / maxPts) * 100))
										: null;

								return (
									<div
										key={index}
										className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
									>
										<div className="w-full flex items-end justify-center gap-1 h-full">
											{/* Ideal Bar */}
											<div
												className="w-1/2 bg-slate-200 dark:bg-slate-700 rounded-t-sm"
												style={{ height: `${idealHeight}%` }}
												title={`Ideal: ${d.idealPoints} pts`}
											/>
											{/* Actual Bar */}
											{actualHeight !== null && (
												<div
													className="w-1/2 bg-teal-500 rounded-t-sm"
													style={{ height: `${actualHeight}%` }}
													title={`Actual: ${d.actualPoints} pts`}
												/>
											)}
										</div>

										<span className="text-[10px] text-slate-400 truncate w-full text-center">
											{d.day}
										</span>

										{/* Tooltip */}
										<div className="pointer-events-none absolute -top-12 hidden group-hover:block bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-bold shadow-lg z-20 whitespace-nowrap">
											{d.day} ({d.date}): Ideal {d.idealPoints} pts | Actual{" "}
											{d.actualPoints !== null
												? `${d.actualPoints} pts`
												: "N/A"}
										</div>
									</div>
								);
							})}
						</div>

						<div className="flex items-center justify-center gap-6 mt-4 text-xs ">
							<div className="flex items-center gap-2">
								<span className="h-3 w-3 rounded-sm bg-slate-300 dark:bg-slate-700" />
								<span className="text-slate-500">Ideal Burndown</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="h-3 w-3 rounded-sm bg-teal-500" />
								<span className="text-slate-700 dark:text-slate-300 font-semibold">
									Actual Remaining Points
								</span>
							</div>
						</div>
					</section>
				)}

				{/* 3. Planned Sprints */}
				{plannedSprints.length > 0 && (
					<section className="my-8">
						<h3 className="display font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">
							Planned Sprints ({plannedSprints.length})
						</h3>

						<div className="space-y-4">
							{plannedSprints.map((sprint) => {
								const sprintTasks = allTasks.filter(
									(t) => t.sprint_id === sprint.id,
								);

								return (
									<div
										key={sprint.id}
										className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs"
									>
										<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
											<div>
												<h4 className="display font-bold text-base text-slate-900 dark:text-slate-100">
													{sprint.name}
												</h4>
												<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
													{sprint.goal || "No goal set"}
												</p>
											</div>

											<button
												type="button"
												onClick={() => startSprint(projectId, sprint.id)}
												className="flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors "
											>
												<Play className="h-3.5 w-3.5" /> Start Sprint
											</button>
										</div>

										<div className="mt-3">
											<span className=" text-[11px] text-slate-400">
												{sprintTasks.length} task(s) planned
											</span>

											<div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
												{sprintTasks.map((task) => (
													<div
														key={task.id}
														onClick={() => setSelectedTicket(task)}
														className="flex items-center justify-between py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg cursor-pointer"
													>
														<span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
															{task.task_key}: {task.title}
														</span>
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																handleAssignSprint(task.id, null);
															}}
															className="text-[11px] text-rose-500  hover:underline"
														>
															Remove
														</button>
													</div>
												))}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</section>
				)}

				{/* 4. Sprint Backlog */}
				<section className="my-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs">
					<div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
						<div>
							<h3 className="display font-bold text-base text-slate-900 dark:text-slate-100">
								Project Backlog
							</h3>
							<p className="work-sans  text-xs text-slate-400  mt-0.5">
								Tasks waiting to be assigned to a sprint cycle
							</p>
						</div>
						<span className="onest text-[12px] font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-300">
							{backlogTasks.length} unassigned
						</span>
					</div>

					{backlogTasks.length === 0 ? (
						<div className="onest py-12 text-center text-xs text-slate-400 ">
							Backlog is clear! All tasks are currently scheduled in sprints.
						</div>
					) : (
						<div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
							{backlogTasks.map((task) => (
								<div
									key={task.id}
									onClick={() => setSelectedTicket(task)}
									className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl cursor-pointer gap-2"
								>
									<div className="flex items-center gap-3 min-w-0">
										<span className="font-mono text-xs font-bold text-slate-400">
											{task.task_key || task.id.slice(0, 7)}
										</span>
										<p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
											{task.title}
										</p>
									</div>

									<div className="flex items-center gap-2 self-end sm:self-auto  text-xs">
										{/* Sprint Assignment Dropdown */}
										<select
											value=""
											onClick={(e) => e.stopPropagation()}
											onChange={(e) =>
												handleAssignSprint(task.id, e.target.value)
											}
											className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-[11px] text-slate-700 dark:text-slate-200 outline-none"
										>
											<option value="" disabled>
												Move to Sprint...
											</option>
											{sprints
												.filter((s) => s.status !== "completed")
												.map((s) => (
													<option key={s.id} value={s.id}>
														{s.name} ({s.status})
													</option>
												))}
										</select>
									</div>
								</div>
							))}
						</div>
					)}
				</section>
			</main>
		</div>
	);
}
