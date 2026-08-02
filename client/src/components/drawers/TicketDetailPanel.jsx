import React, { useState, useEffect } from "react";
import { X, Flag, Send } from "lucide-react";
import Avatar from "../ui/Avatar";
import { PRIORITY, COLUMNS } from "../../data/constants";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

export default function TicketDetailPanel({ boardData = {} }) {
	// 1. Fine-grained Zustand Selectors (Prevents extra re-renders)
	const selectedTicketStore = useWorkspaceStore(
		(state) => state.selectedTicket,
	);
	const setSelectedTicketStore = useWorkspaceStore(
		(state) => state.setSelectedTicket,
	);
	const addCommentToStore = useWorkspaceStore((state) => state.addComment);
	const workspaceTasks = useWorkspaceStore(
		(state) => state.currentWorkspace?.tasks,
	);

	// 2. Resolve Ticket & Callbacks with prop fallbacks
	const tasksList = workspaceTasks || boardData.tickets || [];
	let rawSelected = boardData.selected ?? selectedTicketStore;

	const selected =
		typeof rawSelected === "string"
			? tasksList.find(
					(t) => t.id === rawSelected || t.task_key === rawSelected,
				) || null
			: rawSelected;

	const handleClose = () => {
		if (boardData.setSelectedId) {
			boardData.setSelectedId(null);
		}
		setSelectedTicketStore(null);
	};

	// 3. Managed Controlled Comment Draft State
	const [localCommentDraft, setLocalCommentDraft] = useState("");
	const commentDraft = boardData.commentDraft ?? localCommentDraft;
	const setCommentDraft = boardData.setCommentDraft || setLocalCommentDraft;

	// Reset local draft when selected ticket changes
	useEffect(() => {
		setLocalCommentDraft("");
	}, [selected?.id]);

	// 4. Safe Lookups & Configs
	const priorityKey = selected?.priority?.toLowerCase() || "medium";
	const priorityConfig = PRIORITY[priorityKey] || {
		label: "Medium",
		chip: "bg-sky-50 text-sky-700 border-sky-200",
	};

	const commentsList = selected?.comments || [];
	const currentStatusLabel =
		COLUMNS.find((c) => c.id === selected?.status)?.label || "To Do";

	// 5. Submit Handler
	const onSubmitComment = async () => {
		const trimmed = commentDraft?.trim();
		if (!trimmed) return;

		if (boardData.handleAddComment) {
			boardData.handleAddComment();
		} else if (selected?.id) {
			await addCommentToStore(selected.id, trimmed);
			setCommentDraft("");
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			onSubmitComment();
		}
	};

	return (
		<aside
			className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-slate-200 panel-elevated z-50 ease-premium transition-transform duration-300 ${
				selected ? "translate-x-0" : "translate-x-full"
			}`}
			role="dialog"
			aria-label="Ticket details"
			aria-hidden={!selected}
		>
			{selected && (
				<>
					<div className="h-1 brand-gradient" />

					{/* Panel Header */}
					<div className="h-16 border-b border-slate-200 flex items-center px-5 gap-3">
						<span className="mono text-xs font-semibold text-slate-400">
							{selected.task_key || selected.id}
						</span>
						<span
							className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${priorityConfig.chip}`}
						>
							{priorityConfig.label}
						</span>
						<div className="flex-1" />
						<button
							onClick={handleClose}
							className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors"
							aria-label="Close ticket details"
						>
							<X className="h-4 w-4" />
						</button>
					</div>

					{/* Panel Content Body */}
					<div className="overflow-y-auto h-[calc(100%-4.25rem)] px-5 py-4">
						<h2 className="display font-semibold text-lg text-slate-900 leading-snug tracking-tight">
							{selected.title}
						</h2>
						<p className="onest text-sm text-slate-500 mt-2 leading-relaxed whitespace-pre-wrap">
							{selected.description || "No description provided."}
						</p>

						{/* Assignee & Status Row */}
						<div className="flex items-center gap-3 mt-4 pb-4 border-b border-slate-100">
							<div className="flex items-center gap-1.5">
								<Avatar
									name={
										selected.assignee_name || selected.assignee || "Unassigned"
									}
									size="h-6 w-6 text-[10px]"
									presence
								/>
								<span className="onest text-xs text-slate-600 font-medium">
									{selected.assignee_name || selected.assignee || "Unassigned"}
								</span>
							</div>
							<div className="cursor-pointer display flex items-center gap-1 text-xs text-slate-400">
								<Flag className="h-3 w-3" />
								{currentStatusLabel}
							</div>
						</div>

						{/* Comments Section */}
						<p className="inter text-xs font-semibold text-slate-400 uppercase tracking-wide mt-4 mb-4">
							Comments ({commentsList.length})
						</p>

						<div className="onest space-y-3">
							{commentsList.length === 0 ? (
								<p className="text-xs text-slate-400 italic py-2">
									No comments yet. Start the discussion below.
								</p>
							) : (
								commentsList.map((c, i) => {
									const authorName = c.author_name || c.author || "Team Member";
									const commentTime = c.created_at
										? new Date(c.created_at).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})
										: c.time || "Just now";

									return (
										<div key={c.id || i} className="flex gap-2">
											<Avatar name={authorName} size="h-6 w-6 text-[10px]" />
											<div className="onest bg-slate-50 rounded-lg px-3 py-2 flex-1 border border-slate-100">
												<div className="flex items-baseline justify-between gap-2">
													<span className="text-xs font-medium text-slate-700">
														{authorName}
													</span>
													<span className="mono text-[10px] text-slate-400">
														{commentTime}
													</span>
												</div>
												<p className="text-xs text-slate-600 mt-1 leading-relaxed">
													{c.body || c.text}
												</p>
											</div>
										</div>
									);
								})
							)}
						</div>

						{/* Comment Input */}
						<div className="onest flex items-center gap-2 mt-4 pt-2">
							<input
								value={commentDraft}
								onChange={(e) => setCommentDraft(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="Add a comment..."
								className="flex-1 text-xs px-3 py-2 rounded-lg bg-slate-100 border border-transparent focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all duration-200"
								aria-label="Comment text"
							/>
							<button
								onClick={onSubmitComment}
								className="p-2 rounded-lg brand-gradient bg-teal-500 text-white hover:brightness-110 transition-all duration-200 shadow-sm shadow-indigo-200"
								aria-label="Send comment"
							>
								<Send className="h-3.5 w-3.5" />
							</button>
						</div>
					</div>
				</>
			)}
		</aside>
	);
}
