import React, { useState, useEffect, useRef } from "react";
import {
	X,
	Flag,
	Send,
	Trash2,
	Calendar,
	CheckSquare,
	ShieldAlert,
	Flame,
	Plus,
	Tag as TagIcon,
	Clock,
	Check,
	User,
	Hash,
	AlertCircle,
} from "lucide-react";
import Avatar from "../ui/Avatar";
import { PRIORITY, COLUMNS } from "../../data/constants";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { avatarColor } from "../utils/avatarColor";

export default function TicketDetailPanel() {
	const selected = useWorkspaceStore((state) => state.selectedTicket);
	const setSelectedTicket = useWorkspaceStore((state) => state.setSelectedTicket);
	const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
	const sprints = useWorkspaceStore((state) => state.sprints) || [];

	const updateTicket = useWorkspaceStore((state) => state.updateTicket);
	const deleteTicket = useWorkspaceStore((state) => state.deleteTicket);
	const addComment = useWorkspaceStore((state) => state.addComment);
	const addSubtask = useWorkspaceStore((state) => state.addSubtask);
	const toggleSubtask = useWorkspaceStore((state) => state.toggleSubtask);
	const deleteSubtask = useWorkspaceStore((state) => state.deleteSubtask);
	const addDependency = useWorkspaceStore((state) => state.addDependency);
	const removeDependency = useWorkspaceStore((state) => state.removeDependency);

	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [titleDraft, setTitleDraft] = useState("");
	const [descDraft, setDescDraft] = useState("");
	const [isEditingDesc, setIsEditingDesc] = useState(false);

	const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
	const [depTargetId, setDepTargetId] = useState("");
	const [depType, setDepType] = useState("blocks");
	const [commentDraft, setCommentDraft] = useState("");
	const [activeTab, setActiveTab] = useState("details"); // 'details' | 'comments' | 'subtasks' | 'deps'

	// Sync local drafts when selected ticket changes
	useEffect(() => {
		if (selected) {
			setTitleDraft(selected.title || "");
			setDescDraft(selected.description || "");
			setCommentDraft("");
			setNewSubtaskTitle("");
			setIsEditingTitle(false);
			setIsEditingDesc(false);
		}
	}, [selected?.id]);

	if (!selected) return null;

	const members = currentWorkspace?.members || [];
	const otherTasks = (currentWorkspace?.tasks || []).filter((t) => t.id !== selected.id);

	const priorityKey = selected.priority?.toLowerCase() || "medium";
	const priorityCfg = PRIORITY[priorityKey] || PRIORITY.medium;
	const commentsList = selected.comments || [];
	const subtasksList = selected.subtasks || [];
	const dependenciesList = selected.dependencies || [];

	const handleSaveTitle = async () => {
		if (titleDraft.trim() && titleDraft !== selected.title) {
			await updateTicket(selected.id, { title: titleDraft.trim() });
		}
		setIsEditingTitle(false);
	};

	const handleSaveDesc = async () => {
		if (descDraft !== selected.description) {
			await updateTicket(selected.id, { description: descDraft });
		}
		setIsEditingDesc(false);
	};

	const handleAddSubtaskSubmit = async (e) => {
		e.preventDefault();
		if (!newSubtaskTitle.trim()) return;
		await addSubtask(selected.id, newSubtaskTitle.trim());
		setNewSubtaskTitle("");
	};

	const handleAddDependencySubmit = async (e) => {
		e.preventDefault();
		if (!depTargetId) return;
		await addDependency(selected.id, depTargetId, depType);
		setDepTargetId("");
	};

	const handleSendComment = async (e) => {
		e.preventDefault();
		if (!commentDraft.trim()) return;
		await addComment(selected.id, commentDraft.trim());
		setCommentDraft("");
	};

	const handleDelete = async () => {
		if (window.confirm(`Are you sure you want to delete "${selected.title}"?`)) {
			await deleteTicket(selected.id);
		}
	};

	// Helper to highlight @mentions in comments
	const renderCommentText = (text = "") => {
		const parts = text.split(/(@[A-Za-z0-9_.\s]+?)(?=[,\s!?]|$)/g);
		return parts.map((part, idx) => {
			if (part.startsWith("@")) {
				return (
					<span
						key={idx}
						className="inline-block bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold px-1 rounded mx-0.5"
					>
						{part}
					</span>
				);
			}
			return part;
		});
	};

	return (
		<aside
			className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col ease-premium transition-transform duration-300 overflow-hidden text-slate-900 dark:text-slate-100"
			role="dialog"
			aria-label="Ticket details panel"
		>
			{/* Top Brand Stripe */}
			<div className="h-1 brand-gradient shrink-0" />

			{/* Panel Header */}
			<div className="h-16 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-6 gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-950/40 font-mono-ui">
				<div className="flex items-center gap-2">
					<span className="text-xs font-bold text-slate-400 dark:text-slate-500">
						{selected.task_key || selected.id.slice(0, 7)}
					</span>
					<span
						className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityCfg.chip}`}
					>
						{priorityCfg.label}
					</span>
				</div>

				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={handleDelete}
						className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
						title="Delete task"
					>
						<Trash2 className="h-4 w-4" />
					</button>
					<button
						type="button"
						onClick={() => setSelectedTicket(null)}
						className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
						title="Close panel (Esc)"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* Scrollable Content Body */}
			<div className="flex-1 overflow-y-auto p-6 space-y-6">
				{/* Title Field */}
				<div>
					{isEditingTitle ? (
						<input
							type="text"
							value={titleDraft}
							onChange={(e) => setTitleDraft(e.target.value)}
							onBlur={handleSaveTitle}
							onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
							autoFocus
							className="w-full text-lg font-bold display rounded-xl border border-teal-500 bg-teal-50/30 dark:bg-teal-950/30 px-3 py-1.5 outline-none"
						/>
					) : (
						<h2
							onClick={() => setIsEditingTitle(true)}
							className="display text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 p-1 rounded-lg transition-colors"
							title="Click to rename"
						>
							{selected.title}
						</h2>
					)}
				</div>

				{/* Properties Grid */}
				<div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 font-mono-ui text-xs">
					{/* Status */}
					<div>
						<label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
							Status
						</label>
						<select
							value={selected.status || "todo"}
							onChange={(e) => updateTicket(selected.id, { status: e.target.value })}
							className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-semibold text-xs outline-none"
						>
							{COLUMNS.map((c) => (
								<option key={c.id} value={c.id}>
									{c.label}
								</option>
							))}
						</select>
					</div>

					{/* Priority */}
					<div>
						<label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
							Priority
						</label>
						<select
							value={selected.priority?.toLowerCase() || "medium"}
							onChange={(e) =>
								updateTicket(selected.id, { priority: e.target.value })
							}
							className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-semibold text-xs outline-none"
						>
							<option value="high">🔴 High</option>
							<option value="medium">🟡 Medium</option>
							<option value="low">🔵 Low</option>
						</select>
					</div>

					{/* Assignee */}
					<div>
						<label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
							Assignee
						</label>
						<select
							value={selected.assigned_to || "unassigned"}
							onChange={(e) =>
								updateTicket(selected.id, { assigned_to: e.target.value })
							}
							className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-semibold text-xs outline-none"
						>
							<option value="unassigned">Unassigned</option>
							{members.map((m) => (
								<option key={m.id} value={m.id}>
									{m.name}
								</option>
							))}
						</select>
					</div>

					{/* Sprint */}
					<div>
						<label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
							Sprint
						</label>
						<select
							value={selected.sprint_id || "unassigned"}
							onChange={(e) =>
								updateTicket(selected.id, { sprint_id: e.target.value })
							}
							className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-semibold text-xs outline-none"
						>
							<option value="unassigned">Backlog (No Sprint)</option>
							{sprints.map((s) => (
								<option key={s.id} value={s.id}>
									{s.name} ({s.status})
								</option>
							))}
						</select>
					</div>

					{/* Story Points */}
					<div>
						<label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
							Story Points (Effort)
						</label>
						<input
							type="number"
							min="0"
							max="100"
							value={selected.story_points || 0}
							onChange={(e) =>
								updateTicket(selected.id, {
									story_points: parseInt(e.target.value, 10) || 0,
								})
							}
							className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-semibold text-xs outline-none"
						/>
					</div>

					{/* Due Date */}
					<div>
						<label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
							Due Date
						</label>
						<input
							type="date"
							value={
								selected.due_date ? selected.due_date.split("T")[0] : ""
							}
							onChange={(e) =>
								updateTicket(selected.id, {
									due_date: e.target.value || "clear",
								})
							}
							className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-semibold text-xs outline-none"
						/>
					</div>
				</div>

				{/* Description Section */}
				<div>
					<label className="display text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
						Description
					</label>
					{isEditingDesc ? (
						<div className="space-y-2">
							<textarea
								rows={4}
								value={descDraft}
								onChange={(e) => setDescDraft(e.target.value)}
								className="w-full text-xs font-mono-ui rounded-xl border border-teal-500 bg-teal-50/20 dark:bg-teal-950/20 p-3 text-slate-800 dark:text-slate-200 outline-none"
							/>
							<div className="flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setIsEditingDesc(false)}
									className="px-3 py-1 rounded-lg text-xs text-slate-500 font-mono-ui"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={handleSaveDesc}
									className="px-3 py-1 rounded-lg bg-teal-600 text-white font-bold text-xs font-mono-ui"
								>
									Save
								</button>
							</div>
						</div>
					) : (
						<p
							onClick={() => setIsEditingDesc(true)}
							className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap hover:bg-slate-50 dark:hover:bg-slate-800/60 p-3 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 cursor-pointer font-mono-ui"
						>
							{selected.description || "No description provided. Click to add details."}
						</p>
					)}
				</div>

				{/* Subtasks Checklist */}
				<div className="border-t border-slate-100 dark:border-slate-800 pt-4">
					<div className="flex items-center justify-between mb-3">
						<label className="display text-xs font-bold text-slate-400 uppercase tracking-wider">
							Subtasks ({subtasksList.filter((s) => s.is_completed).length}/{subtasksList.length})
						</label>
					</div>

					<div className="space-y-2 font-mono-ui text-xs">
						{subtasksList.map((st) => (
							<div
								key={st.id}
								className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60"
							>
								<label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
									<input
										type="checkbox"
										checked={st.is_completed}
										onChange={(e) =>
											toggleSubtask(selected.id, st.id, e.target.checked)
										}
										className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
									/>
									<span
										className={`truncate ${
											st.is_completed
												? "line-through text-slate-400"
												: "text-slate-800 dark:text-slate-200 font-medium"
										}`}
									>
										{st.title}
									</span>
								</label>
								<button
									type="button"
									onClick={() => deleteSubtask(selected.id, st.id)}
									className="text-slate-400 hover:text-rose-500 p-1"
								>
									<X className="h-3 w-3" />
								</button>
							</div>
						))}

						{/* Add Subtask Form */}
						<form onSubmit={handleAddSubtaskSubmit} className="flex gap-2 mt-2">
							<input
								type="text"
								placeholder="Add a subtask..."
								value={newSubtaskTitle}
								onChange={(e) => setNewSubtaskTitle(e.target.value)}
								className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 outline-none focus:border-teal-500"
							/>
							<button
								type="submit"
								disabled={!newSubtaskTitle.trim()}
								className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs disabled:opacity-40"
							>
								Add
							</button>
						</form>
					</div>
				</div>

				{/* Task Dependencies (Blocks / Blocked by) */}
				<div className="border-t border-slate-100 dark:border-slate-800 pt-4">
					<label className="display text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
						Task Dependencies
					</label>

					<div className="space-y-2 font-mono-ui text-xs">
						{dependenciesList.map((dep) => (
							<div
								key={dep.id}
								className="flex items-center justify-between p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40"
							>
								<div className="flex items-center gap-2 min-w-0">
									<ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
									<span className="font-bold text-amber-800 dark:text-amber-300 uppercase text-[10px]">
										{dep.dependency_type === "blocks" ? "Blocks" : "Blocked by"}
									</span>
									<span className="truncate text-slate-700 dark:text-slate-200">
										{dep.depends_on_key || ""}: {dep.depends_on_title}
									</span>
								</div>
								<button
									type="button"
									onClick={() => removeDependency(selected.id, dep.id)}
									className="text-slate-400 hover:text-rose-500 p-1"
								>
									<X className="h-3 w-3" />
								</button>
							</div>
						))}

						{/* Add Dependency */}
						{otherTasks.length > 0 && (
							<form
								onSubmit={handleAddDependencySubmit}
								className="flex flex-col sm:flex-row gap-2 mt-2"
							>
								<select
									value={depType}
									onChange={(e) => setDepType(e.target.value)}
									className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 outline-none font-bold"
								>
									<option value="blocks">Blocks</option>
									<option value="blocked_by">Blocked by</option>
								</select>

								<select
									value={depTargetId}
									onChange={(e) => setDepTargetId(e.target.value)}
									className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 outline-none"
								>
									<option value="">Select target task...</option>
									{otherTasks.map((t) => (
										<option key={t.id} value={t.id}>
											{t.task_key || t.id.slice(0, 7)}: {t.title}
										</option>
									))}
								</select>

								<button
									type="submit"
									disabled={!depTargetId}
									className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs disabled:opacity-40"
								>
									Link
								</button>
							</form>
						)}
					</div>
				</div>

				{/* Comments & Mentions Section */}
				<div className="border-t border-slate-100 dark:border-slate-800 pt-4">
					<label className="display text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
						Comments ({commentsList.length})
					</label>

					<div className="space-y-3 font-mono-ui">
						{commentsList.length === 0 ? (
							<p className="text-xs text-slate-400 italic py-2">
								No comments yet. Type <span className="font-bold text-teal-600">@Name</span> to mention team members.
							</p>
						) : (
							commentsList.map((c, idx) => (
								<div
									key={c.id || idx}
									className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
								>
									<div className="flex items-center justify-between text-xs mb-1.5">
										<span className="font-bold text-slate-800 dark:text-slate-200">
											{c.author_name || "Team Member"}
										</span>
										<span className="text-[10px] text-slate-400">
											{c.created_at
												? new Date(c.created_at).toLocaleTimeString([], {
														hour: "2-digit",
														minute: "2-digit",
													})
												: "Just now"}
										</span>
									</div>
									<p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
										{renderCommentText(c.body || c.text)}
									</p>
								</div>
							))
						)}

						{/* Comment Box */}
						<form onSubmit={handleSendComment} className="flex gap-2 pt-2">
							<input
								type="text"
								placeholder="Add a comment... Type @Name to notify"
								value={commentDraft}
								onChange={(e) => setCommentDraft(e.target.value)}
								className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 outline-none focus:border-teal-500"
							/>
							<button
								type="submit"
								disabled={!commentDraft.trim()}
								className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-40 shadow-xs"
								title="Post comment"
							>
								<Send className="h-4 w-4" />
							</button>
						</form>
					</div>
				</div>
			</div>
		</aside>
	);
}
