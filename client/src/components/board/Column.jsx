import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Inbox, Plus, AlertCircle, Calendar, CheckSquare, ShieldAlert, Tag as TagIcon } from "lucide-react";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { PRIORITY } from "../../data/constants";

export default function Column({ col, colTickets = [], wipLimit = 0 }) {
	const setSelectedTicket = useWorkspaceStore((state) => state.setSelectedTicket);
	const setNewTicketCol = useWorkspaceStore((state) => state.setNewTicketCol);

	const isWipExceeded = wipLimit > 0 && colTickets.length > wipLimit;

	return (
		<div
			className={`flex-shrink-0 w-80 flex flex-col rounded-2xl border transition-all duration-200 p-4 min-h-[520px] h-[calc(100vh-140px)] ${
				isWipExceeded
					? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900 ring-1 ring-rose-400/40"
					: "bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800"
			}`}
		>
			{/* Column Header */}
			<div className="flex items-center justify-between mb-2 shrink-0">
				<div className="flex items-center gap-2 min-w-0">
					<span className={`h-2.5 w-2.5 rounded-full shrink-0 ${col.dot || "bg-slate-400"}`} />
					<span className="display font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
						{col.label}
					</span>
					<span
						className={`text-[11px] font-bold rounded-full px-2 py-0.5 min-w-[1.25rem] text-center font-mono-ui ${
							isWipExceeded
								? "bg-rose-500 text-white animate-pulse"
								: "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800"
						}`}
					>
						{colTickets.length}
						{wipLimit > 0 && <span className="text-[10px] opacity-75">/{wipLimit}</span>}
					</span>
				</div>

				<button
					type="button"
					onClick={() => setNewTicketCol(col.id)}
					className="p-1 rounded-lg text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
					aria-label={`Add issue to ${col.label}`}
					title="Quick add issue"
				>
					<Plus className="h-4 w-4" />
				</button>
			</div>

			{/* WIP Limit Exceeded Warning */}
			{isWipExceeded && (
				<div className="mb-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100/80 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-[11px] font-mono-ui font-semibold text-rose-700 dark:text-rose-300">
					<AlertCircle className="h-3.5 w-3.5 shrink-0" />
					<span>WIP Limit exceeded ({colTickets.length}/{wipLimit})</span>
				</div>
			)}

			{/* Droppable Container */}
			<Droppable droppableId={String(col.id)} ignoreContainerClipping={true}>
				{(provided, snapshot) => (
					<div
						ref={provided.innerRef}
						{...provided.droppableProps}
						className={`flex-1 space-y-2.5 overflow-y-auto min-h-0 rounded-xl p-1 transition-colors duration-200 ${
							snapshot.isDraggingOver
								? "bg-teal-50/60 dark:bg-teal-950/30 border border-teal-300 dark:border-teal-700"
								: ""
						}`}
					>
						{colTickets.length === 0 && (
							<div className="flex flex-col items-center justify-center gap-1.5 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-center py-12 px-3">
								<Inbox className="h-5 w-5 text-slate-300 dark:text-slate-600" />
								<span className="font-mono-ui text-xs text-slate-400 dark:text-slate-500">
									No issues in {col.label}
								</span>
							</div>
						)}

						{colTickets.map((t, index) => {
							const priorityCfg = PRIORITY[t.priority?.toLowerCase()] || PRIORITY.medium;
							const isOverdue =
								t.status !== "done" &&
								t.due_date &&
								new Date(t.due_date) < new Date();

							const tagsArray = Array.isArray(t.tags)
								? t.tags
								: typeof t.tags === "string" && t.tags.length > 0
									? t.tags.replace(/[{}]/g, "").split(",").filter(Boolean)
									: [];

							return (
								<Draggable
									key={String(t.id)}
									draggableId={String(t.id)}
									index={index}
								>
									{(provided, snapshot) => (
										<div
											ref={provided.innerRef}
											{...provided.draggableProps}
											{...provided.dragHandleProps}
											style={{
												...provided.draggableProps.style,
											}}
											onClick={() => {
												if (!snapshot.isDragging) {
													setSelectedTicket(t);
												}
											}}
											className={`group p-3.5 bg-white dark:bg-slate-900 border rounded-xl shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none ${
												snapshot.isDragging
													? "shadow-2xl ring-2 ring-teal-500 z-50 scale-[1.02] border-teal-400 bg-white dark:bg-slate-800"
													: "border-slate-200/80 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700"
											}`}
										>
											{/* Top Row: Task Key & Priority */}
											<div className="flex items-center justify-between gap-2 mb-1.5">
												<span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500">
													{t.task_key || t.id.slice(0, 7)}
												</span>

												<div className="flex items-center gap-1.5">
													{t.story_points > 0 && (
														<span className="font-mono-ui text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded">
															{t.story_points} pts
														</span>
													)}
													<span
														className={`h-2 w-2 rounded-full ${priorityCfg.dot}`}
														title={`Priority: ${priorityCfg.label}`}
													/>
												</div>
											</div>

											{/* Task Title */}
											<p className="display text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
												{t.title}
											</p>

											{/* Tags / Labels */}
											{tagsArray.length > 0 && (
												<div className="flex flex-wrap gap-1 mt-2">
													{tagsArray.slice(0, 3).map((tag, tagIdx) => (
														<span
															key={tagIdx}
															className="font-mono-ui text-[10px] font-medium bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 px-1.5 py-0.2 rounded"
														>
															{tag}
														</span>
													))}
												</div>
											)}

											{/* Bottom Meta Row */}
											<div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-slate-400 font-mono-ui text-[11px]">
												{/* Left Badges (Subtasks & Blockers & Due Date) */}
												<div className="flex items-center gap-2">
													{t.total_subtasks > 0 && (
														<span
															className="flex items-center gap-0.5"
															title={`Subtasks: ${t.completed_subtasks || 0}/${t.total_subtasks}`}
														>
															<CheckSquare className="h-3 w-3" />
															<span>
																{t.completed_subtasks || 0}/{t.total_subtasks}
															</span>
														</span>
													)}

													{t.blockers_count > 0 && (
														<span
															className="flex items-center gap-0.5 text-rose-500 font-bold"
															title="Blocks other tasks"
														>
															<ShieldAlert className="h-3 w-3" />
														</span>
													)}

													{t.due_date && (
														<span
															className={`flex items-center gap-0.5 ${
																isOverdue ? "text-rose-500 font-bold" : ""
															}`}
															title={`Due: ${new Date(t.due_date).toLocaleDateString()}`}
														>
															<Calendar className="h-3 w-3" />
															<span>
																{new Date(t.due_date).toLocaleDateString(undefined, {
																	month: "short",
																	day: "numeric",
																})}
															</span>
														</span>
													)}
												</div>

												{/* Right: Assignee */}
												{(t.assignee_name || t.assignee) && (
													<span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md truncate max-w-[80px]">
														{(t.assignee_name || t.assignee).split(" ")[0]}
													</span>
												)}
											</div>
										</div>
									)}
								</Draggable>
							);
						})}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</div>
	);
}
