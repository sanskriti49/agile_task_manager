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
	User,
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
					className={
						i < level ? "fill-current" : "fill-slate-200 dark:fill-slate-700"
					}
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
			className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[12px] font-mono-ui font-medium border transition-all duration-150 outline-none ${
				active
					? "bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 shadow-2xs"
					: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600"
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
			} bottom-[calc(100%+6px)] ${width} max-h-56 overflow-auto bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl p-1.5 z-30 font-mono-ui`}
		>
			{children}
		</div>
	);
}

function PopoverItem({ children, selected, onClick }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
				selected
					? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300"
					: "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
			}`}
		>
			<span className="flex items-center gap-2 truncate">{children}</span>
			{selected && <Check className="h-3 w-3 text-teal-600 shrink-0" />}
		</button>
	);
}

export default function NewTicketModal() {
	const newTicketCol = useWorkspaceStore((state) => state.newTicketCol);
	const setNewTicketCol = useWorkspaceStore((state) => state.setNewTicketCol);
	const createTicket = useWorkspaceStore((state) => state.createTicket);
	const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

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
		setAssigneeId(null);
		setAssigneeName("Unassigned");
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
			className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
			role="dialog"
			aria-modal="true"
			aria-label="Create new ticket"
			onKeyDown={handleKeyDown}
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) setNewTicketCol(null);
			}}
		>
			<form
				ref={formRef}
				onSubmit={handleSubmit}
				className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
			>
				<div className="h-1 brand-gradient rounded-t-2xl shrink-0" />

				<div className="p-5 pb-4">
					{/* Column context & close button */}
					<div className="flex items-center justify-between mb-3 font-mono-ui">
						<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
							<span className={`h-2 w-2 rounded-full ${colMeta?.dot}`} />
							<span>
								New issue in{" "}
								<strong className="text-slate-800 dark:text-slate-200">
									{colMeta?.label}
								</strong>
							</span>
						</div>
						<button
							type="button"
							onClick={() => setNewTicketCol(null)}
							className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
						>
							<X className="h-4 w-4" />
						</button>
					</div>

					{/* Templates shortcut */}
					<div className="flex items-center gap-1.5 mb-3 flex-wrap font-mono-ui">
						{TEMPLATES.map((tpl) => {
							const Icon = tpl.icon;
							return (
								<button
									key={tpl.id}
									type="button"
									onClick={() => applyTemplate(tpl)}
									className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
								>
									<Icon className="h-3 w-3" /> {tpl.label}
								</button>
							);
						})}
					</div>

					{/* Title & Description Inputs */}
					<div className="space-y-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200/80 dark:border-slate-800 focus-within:border-teal-500 dark:focus-within:border-teal-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
						<input
							ref={titleRef}
							name="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Issue title..."
							className="w-full display text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none bg-transparent"
							required
						/>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Add description, acceptance criteria, or context..."
							rows={3}
							className="w-full font-mono-ui text-xs text-slate-600 dark:text-slate-300 placeholder:text-slate-400 outline-none resize-none leading-relaxed bg-transparent"
						/>
					</div>

					{/* Tags list */}
					{tags.length > 0 && (
						<div className="flex flex-wrap gap-1.5 mt-2 mb-1">
							{tags.map((t) => (
								<span
									key={t}
									className="font-mono-ui inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60"
								>
									{t}
									<button
										type="button"
										onClick={() => removeTag(t)}
										className="hover:text-rose-500 p-0.5"
									>
										<X className="h-2.5 w-2.5" />
									</button>
								</span>
							))}
						</div>
					)}

					{/* Meta Controls Row */}
					<div
						ref={popoverRef}
						className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800"
					>
						{/* Priority Popover */}
						<div className="relative">
							<MetaButton
								active={openPopover === "priority"}
								onClick={() =>
									setOpenPopover((p) => (p === "priority" ? null : "priority"))
								}
							>
								<PriorityBars
									level={activePriority.level}
									className={`h-3 w-3.5 ${activePriority.color}`}
								/>
								<span>{activePriority.label}</span>
							</MetaButton>
							{openPopover === "priority" && (
								<PopoverPanel width="w-36">
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

						{/* Assignee Popover */}
						<div className="relative">
							<MetaButton
								active={openPopover === "assignee"}
								onClick={() =>
									setOpenPopover((p) => (p === "assignee" ? null : "assignee"))
								}
							>
								{assigneeName !== "Unassigned" ? (
									<span
										className={`h-4 w-4 rounded-full ${avatarColor(
											assigneeName,
										)} font-mono-ui text-[9px] font-bold text-white flex items-center justify-center shrink-0`}
									>
										{initials(assigneeName)}
									</span>
								) : (
									<User className="h-3.5 w-3.5 text-slate-400" />
								)}
								<span className="truncate max-w-[110px]">{assigneeName}</span>
							</MetaButton>
							{openPopover === "assignee" && (
								<PopoverPanel width="w-52">
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

						{/* Due Date Popover */}
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
											className="w-full text-left px-2.5 py-1.5 font-mono-ui text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg mt-1"
										>
											Clear date
										</button>
									)}
								</PopoverPanel>
							)}
						</div>

						{/* Story Points Input */}
						<div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 font-mono-ui text-xs text-slate-700 dark:text-slate-200">
							<span className="text-slate-400 text-[10px] uppercase font-bold">
								Pts:
							</span>
							<input
								type="number"
								min="0"
								max="100"
								value={storyPoints}
								onChange={(e) =>
									setStoryPoints(parseInt(e.target.value, 10) || 0)
								}
								className="w-8 bg-transparent text-xs font-bold outline-none text-center"
							/>
						</div>

						{/* Label / Tag Input */}
						<div className="relative">
							<MetaButton
								active={openPopover === "tags"}
								onClick={() =>
									setOpenPopover((p) => (p === "tags" ? null : "tags"))
								}
							>
								<TagIcon className="h-3.5 w-3.5 text-slate-400" />
								<span>Label</span>
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
										placeholder="Label + Press Enter"
										className="w-full font-mono-ui text-xs rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 outline-none focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800"
									/>
								</PopoverPanel>
							)}
						</div>
					</div>
				</div>

				{/* Modal Footer */}
				<div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 font-mono-ui text-xs shrink-0">
					<span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
						<kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
							Ctrl
						</kbd>
						+
						<kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
							Enter
						</kbd>
						to create
					</span>

					<div className="flex items-center gap-2 ml-auto">
						<button
							type="button"
							onClick={() => setNewTicketCol(null)}
							className="px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 font-semibold transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold disabled:opacity-50 shadow-2xs transition-colors"
						>
							{isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
							{isSubmitting ? "Creating..." : "Create Issue"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}
