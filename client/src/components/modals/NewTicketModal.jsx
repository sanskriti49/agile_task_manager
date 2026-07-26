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
} from "lucide-react";
import { COLUMNS, PEOPLE, CURRENT_USER } from "../../data/constants";

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

const AVATAR_COLORS = [
	"bg-violet-500",
	"bg-sky-500",
	"bg-emerald-500",
	"bg-amber-500",
	"bg-rose-500",
	"bg-indigo-500",
	"bg-teal-500",
	"bg-fuchsia-500",
];

function avatarColor(name = "") {
	let hash = 0;
	for (let i = 0; i < name.length; i++)
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

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
		{ id: "today", label: "Today", value: formatShort(today) },
		{ id: "tomorrow", label: "Tomorrow", value: formatShort(tomorrow) },
		{ id: "nextweek", label: "Next week", value: formatShort(nextWeek) },
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
				className={`h-3 w-3 opacity-40 transition-transform duration-200 ${active ? "rotate-180" : ""}`}
			/>
		</button>
	);
}

// Changed to open upwards (bottom) so it doesn't overlap the modal footer
function PopoverPanel({ children, width = "w-44", align = "left" }) {
	return (
		<div
			className={`absolute ${align === "right" ? "right-0" : "left-0"} bottom-[calc(100%+6px)] ${width} max-h-56 overflow-auto bg-white rounded-lg border border-slate-200 shadow-xl p-1 z-30`}
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

export default function NewTicketModal({
	newTicketCol,
	setNewTicketCol,
	handleCreateTicket,
}) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState("medium");
	const [assignee, setAssignee] = useState(CURRENT_USER);
	const [due, setDue] = useState(null);
	const [tags, setTags] = useState([]);
	const [tagDraft, setTagDraft] = useState("");
	const [openPopover, setOpenPopover] = useState(null);

	const titleRef = useRef(null);
	const formRef = useRef(null);
	const popoverRef = useRef(null);

	// Reset the form fresh every time the modal opens for a (possibly new) column
	useEffect(() => {
		if (!newTicketCol) return;
		setTitle("");
		setDescription("");
		setPriority("medium");
		setAssignee(CURRENT_USER);
		setDue(null);
		setTags([]);
		setTagDraft("");
		setOpenPopover(null);
		const raf = requestAnimationFrame(() => titleRef.current?.focus());
		return () => cancelAnimationFrame(raf);
	}, [newTicketCol]);

	// Close any open property popover on outside click
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

	const col = COLUMNS.find((c) => c.id === newTicketCol);
	const people = Object.keys(PEOPLE);
	const activePriority = PRIORITIES.find((p) => p.id === priority);
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
		setTitle((t) => (t.startsWith(tpl.prefix) ? t : tpl.prefix + t));
		setPriority(tpl.priority);
		titleRef.current?.focus();
	}

	function handleKeyDown(e) {
		if (e.key === "Escape" && openPopover) {
			e.stopPropagation();
			setOpenPopover(null);
			return;
		}
		if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
			e.preventDefault();
			formRef.current?.requestSubmit();
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
					onSubmit={handleCreateTicket}
					className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col"
					style={{ animation: "cardIn 0.22s cubic-bezier(0.16,1,0.3,1)" }}
				>
					<div className="h-1 brand-gradient rounded-t-2xl shrink-0" />

					<div className="p-5 pb-4">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
								<span className={`h-1.5 w-1.5 rounded-full ${col?.dot}`} />
								New issue in{" "}
								<span className="text-slate-700 font-semibold">
									{col?.label}
								</span>
							</div>
							<button
								type="button"
								onClick={() => setNewTicketCol(null)}
								className="p-1 rounded hover:bg-slate-100 text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
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
										className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
									>
										<Icon className="h-3 w-3" /> {tpl.label}
									</button>
								);
							})}
						</div>

						<div className="rounded-lg -mx-1 px-1 py-1 focus-within:ring-2 focus-within:ring-indigo-100 transition-shadow duration-150">
							<input
								ref={titleRef}
								name="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="e.g. Fix pagination on orders table"
								className="w-full text-[15px] font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none"
								required
							/>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Add a description…"
								rows={2}
								className="w-full text-[13px] text-slate-600 placeholder:text-slate-400 outline-none resize-none leading-relaxed mt-1"
							/>
						</div>

						{tags.length > 0 && (
							<div className="flex flex-wrap gap-1.5 mt-2 mb-1">
								{tags.map((t) => (
									<span
										key={t}
										className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-600"
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
							className="flex flex-wrap items-center gap-1.5 pt-3 mt-2 border-t border-slate-100"
						>
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
									{activePriority.label}
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
												{p.label}
											</PopoverItem>
										))}
									</PopoverPanel>
								)}
							</div>

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
										className={`h-4 w-4 rounded-full ${avatarColor(assignee)} text-white text-[9px] font-semibold flex items-center justify-center shrink-0`}
									>
										{initials(assignee)}
									</span>
									<span className="max-w-[90px] truncate">{assignee}</span>
								</MetaButton>
								{openPopover === "assignee" && (
									<PopoverPanel width="w-44">
										{people.map((p) => (
											<PopoverItem
												key={p}
												selected={assignee === p}
												onClick={() => {
													setAssignee(p);
													setOpenPopover(null);
												}}
											>
												<span
													className={`h-4 w-4 rounded-full ${avatarColor(p)} text-white text-[9px] font-semibold flex items-center justify-center shrink-0`}
												>
													{initials(p)}
												</span>
												{p}
											</PopoverItem>
										))}
									</PopoverPanel>
								)}
							</div>

							<div className="relative">
								<MetaButton
									active={openPopover === "due"}
									onClick={() =>
										setOpenPopover((p) => (p === "due" ? null : "due"))
									}
								>
									<Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
									{due ? due.label : "Due date"}
								</MetaButton>
								{openPopover === "due" && (
									<PopoverPanel width="w-44" align="right">
										{duePresets.map((d) => (
											<PopoverItem
												key={d.id}
												selected={due?.id === d.id}
												meta={d.value}
												onClick={() => {
													setDue(d);
													setOpenPopover(null);
												}}
											>
												{d.label}
											</PopoverItem>
										))}
										{due && (
											<button
												type="button"
												onClick={() => {
													setDue(null);
													setOpenPopover(null);
												}}
												className="w-full text-left px-2 py-1.5 rounded-md text-[12px] text-rose-500 hover:bg-rose-50 mt-0.5"
											>
												Clear date
											</button>
										)}
									</PopoverPanel>
								)}
							</div>

							<div className="relative">
								<MetaButton
									active={openPopover === "tags"}
									onClick={() =>
										setOpenPopover((p) => (p === "tags" ? null : "tags"))
									}
								>
									<TagIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
									Label
								</MetaButton>
								{openPopover === "tags" && (
									<PopoverPanel width="w-48" align="right">
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
											placeholder="Type & press Enter"
											className="w-full px-2 py-1.5 text-[12px] rounded-md bg-slate-100 outline-none focus:ring-2 focus:ring-indigo-200"
										/>
									</PopoverPanel>
								)}
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between gap-3 px-5 py-3 bg-slate-50 border-t border-slate-100 rounded-b-2xl shrink-0">
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
								className="px-4 py-1.5 rounded-lg brand-gradient text text-sm font-medium bg-teal-400/90 text-white ease-premium transition-all duration-150 shadow-sm shadow-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
							>
								Create issue
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
