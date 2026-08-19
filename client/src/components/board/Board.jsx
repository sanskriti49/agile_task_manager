import React, { useEffect, useState, useMemo } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import { COLUMNS } from "../../data/constants";
import { useAuthStore } from "../../store/useAuthStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { toast } from "sonner";
import Column from "./Column";
import Topbar from "../layout/Topbar";
import { Loader2, Flame, Sliders, BarChart3, Plus } from "lucide-react";
import WipLimitModal from "../modals/WipLimitModal";
import CreateSprintModal from "../modals/CreateSprintModal";

const socket = io("http://localhost:5000", {
	autoConnect: true,
	reconnectionAttempts: 5,
	reconnectionDelay: 2000,
	transports: ["websocket", "polling"],
});

export default function Board() {
	const { id: workspaceId } = useParams();
	const token = useAuthStore((state) => state.token);
	const user = useAuthStore((state) => state.user);

	const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
	const fetchWorkspaceById = useWorkspaceStore(
		(state) => state.fetchWorkspaceById,
	);
	const loading = useWorkspaceStore((state) => state.loading);
	const wipLimits = useWorkspaceStore((state) => state.wipLimits) || {};
	const activeSprint = useWorkspaceStore((state) => state.activeSprint);
	const setOnlineCollaborators = useWorkspaceStore(
		(state) => state.setOnlineCollaborators,
	);
	const setIsWipLimitModalOpen = useWorkspaceStore(
		(state) => state.setIsWipLimitModalOpen,
	);
	const setIsCreateSprintModalOpen = useWorkspaceStore(
		(state) => state.setIsCreateSprintModalOpen,
	);
	const setNewTicketCol = useWorkspaceStore((state) => state.setNewTicketCol);

	// Advanced Multi-Filtering States
	const [searchQuery, setSearchQuery] = useState("");
	const [priorityFilter, setPriorityFilter] = useState("all");
	const [assigneeFilter, setAssigneeFilter] = useState("all");
	const [sprintFilter, setSprintFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");

	// 1. Fetch Board Data
	useEffect(() => {
		if (workspaceId) {
			fetchWorkspaceById(workspaceId);
		}
	}, [workspaceId, fetchWorkspaceById]);

	// 2. Real-Time Collaboration & Presence Sync
	useEffect(() => {
		if (!workspaceId) return;

		// Join workspace room with presence payload
		socket.emit("join_workspace", {
			workspaceId,
			user: {
				id: user?.id,
				name: user?.name,
				avatar: user?.avatar || user?.avatar_url,
			},
		});

		// Listen to presence updates
		socket.on("presence_update", (data) => {
			if (data.workspaceId === workspaceId) {
				setOnlineCollaborators(data.collaborators);
			}
		});

		// Listen to board updates
		socket.on("ticket_moved", () => {
			fetchWorkspaceById(workspaceId);
		});

		socket.on("ticket_created", () => {
			fetchWorkspaceById(workspaceId);
		});

		socket.on("ticket_updated", () => {
			fetchWorkspaceById(workspaceId);
		});

		socket.on("ticket_deleted", () => {
			fetchWorkspaceById(workspaceId);
		});

		socket.on("sprint_updated", () => {
			fetchWorkspaceById(workspaceId);
		});

		return () => {
			socket.emit("leave_workspace", workspaceId);
			socket.off("presence_update");
			socket.off("ticket_moved");
			socket.off("ticket_created");
			socket.off("ticket_updated");
			socket.off("ticket_deleted");
			socket.off("sprint_updated");
		};
	}, [workspaceId, user, fetchWorkspaceById, setOnlineCollaborators]);

	// 3. Drag End with Optimistic Rollback
	const onDragEnd = async (result) => {
		const { destination, source, draggableId } = result;

		if (!destination) return;
		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		)
			return;

		const fromStatus = source.droppableId;
		const toStatus = destination.droppableId;
		const originalWorkspace = currentWorkspace;

		// Optimistic UI update
		useWorkspaceStore.setState((state) => {
			if (!state.currentWorkspace) return state;
			const updatedTasks = state.currentWorkspace.tasks.map((task) =>
				String(task.id) === String(draggableId)
					? { ...task, status: toStatus }
					: task,
			);
			return {
				currentWorkspace: {
					...state.currentWorkspace,
					tasks: updatedTasks,
				},
			};
		});

		// Persist update
		try {
			const res = await fetch(
				`http://localhost:5000/api/tickets/${draggableId}/move`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						projectId: workspaceId,
						fromStatus,
						toStatus,
						position: destination.index,
					}),
				},
			);

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || "Failed to persist move");
			}
		} catch (err) {
			console.error("Failed to sync drag movement:", err);
			useWorkspaceStore.setState({ currentWorkspace: originalWorkspace });
			toast.error(err.message || "Could not sync ticket move");
		}
	};

	const rawTasks = currentWorkspace?.tasks || [];

	// Advanced Multi-Filtering
	const filteredTasks = useMemo(() => {
		return rawTasks.filter((t) => {
			const matchesQuery = searchQuery
				? t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					(t.task_key &&
						t.task_key.toLowerCase().includes(searchQuery.toLowerCase()))
				: true;

			const matchesPriority =
				priorityFilter === "all" ||
				t.priority?.toLowerCase() === priorityFilter.toLowerCase();

			const matchesAssignee =
				assigneeFilter === "all" ||
				t.assignee_name === assigneeFilter ||
				t.assignee === assigneeFilter;

			const matchesSprint =
				sprintFilter === "all"
					? true
					: sprintFilter === "active"
						? t.sprint_id === activeSprint?.id
						: sprintFilter === "backlog"
							? !t.sprint_id
							: t.sprint_id === sprintFilter;

			const matchesStatus =
				statusFilter === "all" || String(t.status) === String(statusFilter);

			return (
				matchesQuery &&
				matchesPriority &&
				matchesAssignee &&
				matchesSprint &&
				matchesStatus
			);
		});
	}, [
		rawTasks,
		searchQuery,
		priorityFilter,
		assigneeFilter,
		sprintFilter,
		statusFilter,
		activeSprint,
	]);

	if (loading && !currentWorkspace) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400">
				<Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
				<span className="font-mono-ui text-xs">Loading board tasks...</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
			{/* Render Topbar with Filters & Search */}
			<Topbar
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				priorityFilter={priorityFilter}
				setPriorityFilter={setPriorityFilter}
				assigneeFilter={assigneeFilter}
				setAssigneeFilter={setAssigneeFilter}
				sprintFilter={sprintFilter}
				setSprintFilter={setSprintFilter}
			/>

			{/* Sub-header Bar (Active Sprint, WIP Limits Config, Quick Actions) */}
			<div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-white/60 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md font-mono-ui text-xs">
				<div className="flex items-center gap-3">
					{/* Active Sprint Indicator */}
					{activeSprint ? (
						<Link
							to={`/workspace/${workspaceId}/sprints`}
							className="inter inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold hover:bg-amber-100 transition-colors"
						>
							<Flame className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
							<span>Active Sprint: {activeSprint.name}</span>
						</Link>
					) : (
						<button
							type="button"
							onClick={() => setIsCreateSprintModalOpen(true)}
							className="onest inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600 font-semibold"
						>
							<Flame className="h-3.5 w-3.5 text-slate-400" /> Start a Sprint
						</button>
					)}

					<span className="text-slate-300 dark:text-slate-700">|</span>

					<span className="onest text-slate-500 dark:text-slate-400">
						{filteredTasks.length} issue{filteredTasks.length !== 1 ? "s" : ""}{" "}
						on board
					</span>
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setIsWipLimitModalOpen(true)}
						className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
						title="Set column WIP limits"
					>
						<Sliders className="h-3.5 w-3.5 text-slate-400" /> WIP Limits
					</button>

					<Link
						to={`/workspace/${workspaceId}/dashboard`}
						className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
					>
						<BarChart3 className="h-3.5 w-3.5 text-teal-600" /> Analytics
					</Link>

					<button
						type="button"
						onClick={() => setNewTicketCol("todo")}
						className="flex items-center gap-1 px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors shadow-2xs"
					>
						<Plus className="h-3.5 w-3.5" /> New Issue
					</button>
				</div>
			</div>

			{/* Kanban Columns */}
			<DragDropContext onDragEnd={onDragEnd}>
				<div className="flex gap-4 p-6 flex-1 min-w-max overflow-x-auto">
					{COLUMNS.map((col) => {
						const colTickets = filteredTasks.filter(
							(t) => String(t.status) === String(col.id),
						);
						return (
							<Column
								key={col.id}
								col={col}
								colTickets={colTickets}
								wipLimit={wipLimits[col.id] || 0}
							/>
						);
					})}
				</div>
			</DragDropContext>

			<WipLimitModal />
			<CreateSprintModal />
		</div>
	);
}
