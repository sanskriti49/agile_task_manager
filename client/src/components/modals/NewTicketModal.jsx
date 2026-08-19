import React, { useState, useRef, useEffect } from "react";
import {
	X,
	Calendar,
	Tag as TagIcon,
	ChevronDown,
	Check,
	Bug,
	Sparkles,
	Wrench,
	Loader2,
} from "lucide-react";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { COLUMN_DEFAULTS } from "../../data/constants";
import { avatarColor } from "../utils/avatarColor";

const PRIORITIES = [
	{ id: "low", label: "Low", level: 1, color: "text-sky-500" },
	{ id: "medium", label: "Medium", level: 2, color: "text-amber-500" },
	{ id: "high", label: "High", level: 3, color: "text-rose-500" },
];

const TEMPLATES = [
	{ id: "bug", label: "Bug", icon: Bug, prefix: "[Bug] ", priority: "high" },
	{
		id: "feature",
		label: "Feature",
		icon: Sparkles,
		prefix: "[Feature] ",
		priority: "medium",
	},
	{
		id: "chore",
		label: "Chore",
		icon: Wrench,
		prefix: "[Chore] ",
		priority: "low",
	},
];

function initials(name = "") {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((p) => p[0].toUpperCase())
		.join("");
}

function formatShort(d) {
	return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getDuePresets() {
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(today.getDate() + 1);
	const nextWeek = new Date(today);
	nextWeek.setDate(today.getDate() + 7);

	return [
		{
			id: "today",
			label: "Today",
			display: formatShort(today),
			value: today.toISOString(),
		},
		{
			id: "tomorrow",
			label: "Tomorrow",
			display: formatShort(tomorrow),
			value: tomorrow.toISOString(),
		},
		{
			id: "nextweek",
			label: "Next week",
			display: formatShort(nextWeek),
			value: nextWeek.toISOString(),
		},
	];
}

function PriorityBars({ level, className = "" }) {
	return (
		<svg viewBox="0 0 14 12" className={className} fill="none">
			{[0, 1, 2].map((i) => (
				<rect
					key={i}
					x={i * 5}
					y={12 - (i + 1) * 3.5}
					width="3"
					height={(i + 1) * 3.5}
					rx="0.5"
					className={i < level ? "fill-current" : "fill-slate-200"}
				/>
			))}
		</svg>
	);
}

function MetaButton({ active, onClick, children }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
				active
					? "bg-indigo-50 border-indigo-200 text-indigo-700"
					: "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
			}`}
		>
			{children}
			<ChevronDown
				className={`h-3 w-3 opacity-40 transition-transform duration-200 ${
					active ? "rotate-180" : ""
				}`}
			/>
		</button>
	);
}

function PopoverPanel({ children, width = "w-44", align = "left" }) {
	return (
		<div
			className={`absolute ${
				align === "right" ? "right-0" : "left-0"
			} bottom-[calc(100%+6px)] ${width} max-h-56 overflow-auto bg-white rounded-lg border border-slate-200 shadow-xl p-1 z-30`}
			style={{ animation: "popIn 0.15s cubic-bezier(0.16,1,0.3,1)" }}
		>
			{children}
		</div>
	);
}

function PopoverItem({ children, meta, selected, onClick }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] font-medium transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
				selected
					? "bg-indigo-50 text-indigo-700"
					: "text-slate-600 hover:bg-slate-50"
			}`}
		>
			<span className="flex items-center gap-2 flex-1 min-w-0 truncate">
				{children}
			</span>
			{meta && (
				<span className="text-[11px] text-slate-400 shrink-0">{meta}</span>
			)}
			{selected && <Check className="h-3 w-3 text-indigo-500 shrink-0" />}
		</button>
	);
}

export default function NewTicketModal() {
	const newTicketCol = useWorkspaceStore((state) => state.newTicketCol);
	const setNewTicketCol = useWorkspaceStore((state) => state.setNewTicketCol);
	const createTicket = useWorkspaceStore((state) => state.createTicket);
	const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

	// Safe fallback function to prevent "setIsAiDecomposeOpen is not a function" error
	const setIsAiDecomposeOpen = useWorkspaceStore(
		(state) => state.setIsAiDecomposeOpen || (() => {}),
	);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState("medium");
	const [assigneeId, setAssigneeId] = useState(null);
	const [assigneeName, setAssigneeName] = useState("Unassigned");
	const [storyPoints, setStoryPoints] = useState(1);
	const [due, setDue] = useState(null);
	const [tags, setTags] = useState([]);
	const [tagDraft, setTagDraft] = useState("");
	const [openPopover, setOpenPopover] = useState(null);

	const [isSubmitting, setIsSubmitting] = useState(false);

	const titleRef = useRef(null);
	const formRef = useRef(null);
	const popoverRef = useRef(null);

	const membersList = currentWorkspace?.members || [];

	useEffect(() => {
		if (!newTicketCol) return;
		setTitle("");
		setDescription("");
		setPriority("medium");
		setAssigneeId(membersList[0]?.id || null);
		setAssigneeName(membersList[0]?.name || "Unassigned");
		setStoryPoints(1);
		setDue(null);
		setTags([]);
		setTagDraft("");
		setOpenPopover(null);
		const raf = requestAnimationFrame(() => titleRef.current?.focus());
		return () => cancelAnimationFrame(raf);
	}, [newTicketCol]);

	useEffect(() => {
		function onClick(e) {
			if (popoverRef.current && !popoverRef.current.contains(e.target)) {
				setOpenPopover(null);
			}
		}
		document.addEventListener("mousedown", onClick);
		return () => document.removeEventListener("mousedown", onClick);
	}, []);

	if (!newTicketCol) return null;

	const colMeta = COLUMN_DEFAULTS[newTicketCol] || {
		label: newTicketCol.replace("_", " ").toUpperCase(),
		dot: "bg-teal-500",
	};

	const activePriority =
		PRIORITIES.find((p) => p.id === priority) || PRIORITIES[1];

	const duePresets = getDuePresets();

	function addTag() {
		const v = tagDraft.trim();
		if (v && !tags.includes(v)) setTags((t) => [...t, v]);
		setTagDraft("");
	}

	function removeTag(t) {
		setTags((ts) => ts.filter((x) => x !== t));
	}

	function applyTemplate(tpl) {
		setTitle((currentTitle) => {
			let cleanTitle = currentTitle;
			TEMPLATES.forEach((t) => {
				if (cleanTitle.startsWith(t.prefix)) {
					cleanTitle = cleanTitle.slice(t.prefix.length);
				}
			});

			return tpl.prefix + cleanTitle;
		});

		setPriority(tpl.priority);
		titleRef.current?.focus();
	}

	function handleKeyDown(e) {
		if (e.key === "Escape") {
			if (openPopover) {
				e.stopPropagation();
				setOpenPopover(null);
			} else {
				setNewTicketCol(null);
			}
		}
		if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
			e.preventDefault();
			formRef.current?.requestSubmit();
		}
	}

	async function handleSubmit(e) {
		e.preventDefault();
		if (!title.trim() || isSubmitting) return;

		setIsSubmitting(true);
		try {
			await createTicket({
				title: title.trim(),
				description,
				status: newTicketCol,
				priority,
				assigned_to: assigneeId,
				story_points: storyPoints,
				tags,
				due_date: due ? due.value : null,
			});
			setNewTicketCol(null);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div
			className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/30 backdrop-blur-sm"
			role="dialog"
			aria-modal="true"
			aria-label="Create new ticket"
			onKeyDown={handleKeyDown}
		>
			<div
				className="min-h-full flex items-center justify-center p-4"
				onMouseDown={(e) => {
					if (e.target === e.currentTarget) setNewTicketCol(null);
				}}
			>
				<form
					ref={formRef}
					onSubmit={handleSubmit}
					className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col"
					style={{ animation: "cardIn 0.22s cubic-bezier(0.16,1,0.3,1)" }}
				>
					<div className="h-1 brand-gradient rounded-t-2xl shrink-0" />

					<div className="p-5 pb-4">
						<div className="flex items-center justify-between mb-3">
							<div className="onest flex items-center gap-1.5 text-xs font-medium text-slate-500">
								<span className={`h-1.5 w-1.5 rounded-full ${colMeta?.dot}`} />
								New issue in{" "}
								<span className="display text-slate-700 font-semibold">
									{colMeta?.label}
								</span>
							</div>
							<button
								type="button"
								onClick={() => setNewTicketCol(null)}
								className="p-1 rounded hover:bg-slate-100 text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
								aria-label="Cancel"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<div className="flex items-center gap-1.5 mb-3 flex-wrap">
							{TEMPLATES.map((tpl) => {
								const Icon = tpl.icon;
								return (
									<button
										key={tpl.id}
										type="button"
										onClick={() => applyTemplate(tpl)}
										className="display flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
									>
										<Icon className="h-3 w-3" /> {tpl.label}
									</button>
								);
							})}
						</div>

						<div className="onest space-y-2 rounded-xl bg-slate-50/80 p-3.5 border border-slate-200/80 focus-within:border-teal-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-100 transition-all">
							<input
								ref={titleRef}
								name="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Issue title..."
								className="w-full font-display text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none"
								required
							/>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Add a detailed description or sub-tasks..."
								rows={3}
								className="w-full font-mono-ui text-[13px] text-slate-600 placeholder:text-slate-400 outline-none resize-none leading-relaxed"
							/>
						</div>

						{tags.length > 0 && (
							<div className="flex flex-wrap gap-1.5 mt-2 mb-1">
								{tags.map((t) => (
									<span
										key={t}
										className="mono inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-600"
									>
										{t}
										<button
											type="button"
											onClick={() => removeTag(t)}
											className="hover:bg-indigo-100 rounded-full p-0.5"
											aria-label={`Remove ${t}`}
										>
											<X className="h-2.5 w-2.5" />
										</button>
									</span>
								))}
							</div>
						)}

						<div
							ref={popoverRef}
							className="onest flex flex-wrap items-center gap-2 pt-4 mt-3 border-t border-slate-100"
						>
							{/* Priority */}
							<div className="relative">
								<MetaButton
									active={openPopover === "priority"}
									onClick={() =>
										setOpenPopover((p) =>
											p === "priority" ? null : "priority",
										)
									}
								>
									<PriorityBars
										level={activePriority.level}
										className={`h-3 w-3.5 ${activePriority.color}`}
									/>
									<span>{activePriority.label}</span>
								</MetaButton>
								{openPopover === "priority" && (
									<PopoverPanel width="w-40">
										{PRIORITIES.map((p) => (
											<PopoverItem
												key={p.id}
												selected={priority === p.id}
												onClick={() => {
													setPriority(p.id);
													setOpenPopover(null);
												}}
											>
												<PriorityBars
													level={p.level}
													className={`h-3 w-3.5 ${p.color}`}
												/>
												<span>{p.label}</span>
											</PopoverItem>
										))}
									</PopoverPanel>
								)}
							</div>

							{/* Assignee */}
							<div className="relative">
								<MetaButton
									active={openPopover === "assignee"}
									onClick={() =>
										setOpenPopover((p) =>
											p === "assignee" ? null : "assignee",
										)
									}
								>
									<span
										className={`h-4 w-4 rounded-full ${avatarColor(
											assigneeName,
										)} font-mono-ui text-[9px] font-bold text-white flex items-center justify-center shrink-0`}
									>
										{initials(assigneeName)}
									</span>
									<span className="truncate max-w-[100px]">{assigneeName}</span>
								</MetaButton>
								{openPopover === "assignee" && (
									<PopoverPanel width="w-48">
										<PopoverItem
											selected={!assigneeId}
											onClick={() => {
												setAssigneeId(null);
												setAssigneeName("Unassigned");
												setOpenPopover(null);
											}}
										>
											<span className="text-slate-400">Unassigned</span>
										</PopoverItem>
										{(membersList.length > 0
											? membersList
											: [
													{ id: "u1", name: "Sanskriti Gupta" },
													{ id: "u2", name: "Aria Chen" },
													{ id: "u3", name: "Rohan Mehta" },
													{ id: "u4", name: "Priya Nair" },
												]
										).map((m) => (
											<PopoverItem
												key={m.id}
												selected={assigneeId === m.id || assigneeName === m.name}
												onClick={() => {
													setAssigneeId(m.id);
													setAssigneeName(m.name);
													setOpenPopover(null);
												}}
											>
												<span
													className={`h-4 w-4 rounded-full ${avatarColor(
														m.name,
													)} font-mono-ui text-[9px] font-bold text-white flex items-center justify-center shrink-0`}
												>
													{initials(m.name)}
												</span>
												<span>{m.name}</span>
											</PopoverItem>
										))}
									</PopoverPanel>
								)}
							</div>

							{/* Due Date */}
							<div className="relative">
								<MetaButton
									active={openPopover === "due"}
									onClick={() =>
										setOpenPopover((p) => (p === "due" ? null : "due"))
									}
								>
									<Calendar className="h-3.5 w-3.5 text-slate-400" />
									<span>{due ? due.label : "Due date"}</span>
								</MetaButton>
								{openPopover === "due" && (
									<PopoverPanel width="w-44" align="right">
										{duePresets.map((d) => (
											<PopoverItem
												key={d.id}
												selected={due?.id === d.id}
												onClick={() => {
													setDue(d);
													setOpenPopover(null);
												}}
											>
												<span>{d.label}</span>
											</PopoverItem>
										))}
										{due && (
											<button
												type="button"
												onClick={() => {
													setDue(null);
													setOpenPopover(null);
												}}
												className="w-full text-left px-2.5 py-1.5 font-mono-ui text-xs font-semibold text-rose-500 hover:bg-rose-50 rounded-lg mt-1"
											>
												Clear date
											</button>
										)}
									</PopoverPanel>
								)}
							</div>

							{/* Tag Input */}
							<div className="relative">
								<MetaButton
									active={openPopover === "tags"}
									onClick={() =>
										setOpenPopover((p) => (p === "tags" ? null : "tags"))
									}
								>
									<TagIcon className="h-3.5 w-3.5 text-slate-400" />
									<span>Add Label</span>
								</MetaButton>
								{openPopover === "tags" && (
									<PopoverPanel width="w-52" align="right">
										<input
											autoFocus
											value={tagDraft}
											onChange={(e) => setTagDraft(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === ",") {
													e.preventDefault();
													addTag();
												}
											}}
											placeholder="Label name + Press Enter"
											className="w-full font-mono-ui text-xs rounded-lg bg-slate-100 px-3 py-1.5 outline-none focus:ring-2 focus:ring-teal-200"
										/>
									</PopoverPanel>
								)}
							</div>
						</div>

						<div className="onest mt-4 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
							<div className="flex items-center gap-2">
								<Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
								<span className="font-mono-ui text-xs font-semibold text-indigo-950">
									Need AI Sub-Task Breakdown?
								</span>
							</div>
							<button
								type="button"
								onClick={() => {
									setNewTicketCol(null);
									setIsAiDecomposeOpen(true);
								}}
								className="display rounded-lg bg-indigo-600 px-3 py-1 font-mono-ui text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
							>
								Use AI Copilot
							</button>
						</div>
					</div>

					<div className="onest flex items-center justify-between gap-3 px-5 py-3 bg-slate-50 border-t border-slate-100 rounded-b-2xl shrink-0">
						<span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
							<kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-sans">
								⌘
							</kbd>
							<kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-sans">
								Enter
							</kbd>
							to create
						</span>
						<div className="flex items-center gap-2 ml-auto">
							<button
								type="button"
								onClick={() => setNewTicketCol(null)}
								className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={isSubmitting}
								className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
							>
								{isSubmitting && (
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
								)}
								{isSubmitting ? "Creating..." : "Create issue"}
							</button>
						</div>
					</div>

					<input type="hidden" name="priority" value={priority} />
					<input type="hidden" name="assignee" value={assignee} />
					<input type="hidden" name="description" value={description} />
					<input type="hidden" name="tags" value={tags.join(",")} />
					<input type="hidden" name="due" value={due ? due.value : ""} />
				</form>
			</div>
		</div>
	);
}
