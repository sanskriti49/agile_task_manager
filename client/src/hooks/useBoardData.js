import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
	COLUMNS,
	initialTickets,
	initialActivity,
	CURRENT_USER,
} from "../data/constants";

export function useBoardData() {
	const [tickets, setTickets] = useState(initialTickets);
	const [activity, setActivity] = useState(initialActivity);
	const [query, setQuery] = useState("");
	const [priorityFilter, setPriorityFilter] = useState("all");
	const [assigneeFilter, setAssigneeFilter] = useState("all");
	const [draggedId, setDraggedId] = useState(null);
	const [dragOverCol, setDragOverCol] = useState(null);
	const [justDropped, setJustDropped] = useState(null);
	const [selectedId, setSelectedId] = useState(null);
	const [activityOpen, setActivityOpen] = useState(false);
	const [newTicketCol, setNewTicketCol] = useState(null);
	const [commentDraft, setCommentDraft] = useState("");

	const idCounter = useRef(
		initialTickets.reduce((max, t) => {
			const num = parseInt(t.id.replace("ENG-", ""), 10);
			return num > max ? num : max;
		}, 108) + 1,
	);

	const searchRef = useRef(null);

	const selected = useMemo(
		() => tickets.find((t) => t.id === selectedId) || null,
		[tickets, selectedId],
	);

	const filtered = useMemo(() => {
		return tickets.filter((t) => {
			const matchesQuery = t.title.toLowerCase().includes(query.toLowerCase());
			const matchesPriority =
				priorityFilter === "all" || t.priority === priorityFilter;
			const matchesAssignee =
				assigneeFilter === "all" || t.assignee === assigneeFilter;
			return matchesQuery && matchesPriority && matchesAssignee;
		});
	}, [tickets, query, priorityFilter, assigneeFilter]);

	const logActivity = useCallback((entry) => {
		setActivity((prev) => [
			{ id: `a${Date.now()}`, time: "Just now", ...entry },
			...prev,
		]);
	}, []);

	const handleDrop = useCallback(
		(colId) => {
			if (draggedId == null) return;
			const ticket = tickets.find((t) => t.id === draggedId);
			if (!ticket || ticket.status === colId) {
				setDraggedId(null);
				setDragOverCol(null);
				return;
			}
			const fromLabel = COLUMNS.find((c) => c.id === ticket.status)?.label;
			const toLabel = COLUMNS.find((c) => c.id === colId)?.label;
			setTickets((prev) =>
				prev.map((t) => (t.id === draggedId ? { ...t, status: colId } : t)),
			);
			logActivity({
				type: "moved",
				ticketId: ticket.id,
				ticketTitle: ticket.title,
				actor: CURRENT_USER,
				detail: `${fromLabel} → ${toLabel}`,
			});
			setDraggedId(null);
			setDragOverCol(null);
			setJustDropped(colId);
			setTimeout(() => setJustDropped(null), 550);
		},
		[draggedId, tickets, logActivity],
	);

	const handleCreateTicket = useCallback(
		(e) => {
			e.preventDefault();
			const form = e.currentTarget;
			const title = form.elements.namedItem("title").value.trim();
			if (!title) return;
			const id = `ENG-${idCounter.current++}`;
			const ticket = {
				id,
				title,
				status: newTicketCol,
				priority: form.elements.namedItem("priority").value,
				assignee: form.elements.namedItem("assignee").value,
				tags: form.elements.namedItem("tags")?.value
					? form.elements.namedItem("tags").value.split(",").filter(Boolean)
					: [],
				due: form.elements.namedItem("due")?.value || "—",
				description: form.elements.namedItem("description")?.value || "",
				comments: [],
			};
			setTickets((prev) => [...prev, ticket]);
			logActivity({
				type: "created",
				ticketId: id,
				ticketTitle: title,
				actor: CURRENT_USER,
				detail: "Created the issue",
			});
			setNewTicketCol(null);
		},
		[newTicketCol, logActivity],
	);

	const handleAddComment = useCallback(() => {
		if (!commentDraft.trim() || !selected) return;
		const text = commentDraft.trim();
		setTickets((prev) =>
			prev.map((t) =>
				t.id === selected.id
					? {
							...t,
							comments: [
								...t.comments,
								{ author: CURRENT_USER, text, time: "Just now" },
							],
						}
					: t,
			),
		);
		logActivity({
			type: "commented",
			ticketId: selected.id,
			ticketTitle: selected.title,
			actor: CURRENT_USER,
			detail: text,
		});
		setCommentDraft("");
	}, [commentDraft, selected, logActivity]);

	const clearFilters = useCallback(() => {
		setQuery("");
		setPriorityFilter("all");
		setAssigneeFilter("all");
	}, []);

	useEffect(() => {
		const handleKeyDown = (e) => {
			const meta = e.metaKey || e.ctrlKey;
			if (meta && e.key.toLowerCase() === "k") {
				e.preventDefault();
				searchRef.current?.focus();
				return;
			}
			if (e.key === "Escape") {
				if (newTicketCol) setNewTicketCol(null);
				else if (selectedId) setSelectedId(null);
				else if (activityOpen) setActivityOpen(false);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [newTicketCol, selectedId, activityOpen]);

	const filtersActive =
		query || priorityFilter !== "all" || assigneeFilter !== "all";

	return {
		tickets,
		activity,
		query,
		setQuery,
		priorityFilter,
		setPriorityFilter,
		assigneeFilter,
		setAssigneeFilter,
		draggedId,
		setDraggedId,
		dragOverCol,
		setDragOverCol,
		justDropped,
		selectedId,
		setSelectedId,
		activityOpen,
		setActivityOpen,
		newTicketCol,
		setNewTicketCol,
		commentDraft,
		setCommentDraft,
		searchRef,
		selected,
		filtered,
		handleDrop,
		handleCreateTicket,
		handleAddComment,
		clearFilters,
		filtersActive,
	};
}
