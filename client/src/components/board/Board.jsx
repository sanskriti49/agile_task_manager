import React, { useEffect, useState, useMemo } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { COLUMNS } from "../../data/constants";
import { useAuthStore } from "../../store/useAuthStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { toast } from "sonner";
import Column from "./Column";
import Topbar from "../layout/Topbar";
import { Loader2 } from "lucide-react";

const socket = io("http://localhost:5000");

export default function Board() {
	const { id: workspaceId } = useParams();
	const token = useAuthStore((state) => state.token);
	const user = useAuthStore((state) => state.user);

	// Consume Zustand global state
	const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
	const fetchWorkspaceById = useWorkspaceStore(
		(state) => state.fetchWorkspaceById,
	);
	const loading = useWorkspaceStore((state) => state.loading);

	// Local Search & Filter States for Topbar
	const [searchQuery, setSearchQuery] = useState("");
	const [priorityFilter, setPriorityFilter] = useState("all");
	const [assigneeFilter, setAssigneeFilter] = useState("all");

	// 1. Fetch Board Data from PostgreSQL on Mount or Workspace Change
	useEffect(() => {
		if (workspaceId) {
			fetchWorkspaceById(workspaceId);
		}
	}, [workspaceId, fetchWorkspaceById]);

	// 2. Socket.io Room Isolation & Real-Time Sync
	useEffect(() => {
		if (!workspaceId) return;

		socket.emit("join_workspace", workspaceId);

		socket.on("ticket_moved", () => {
			fetchWorkspaceById(workspaceId);
		});

		return () => {
			socket.off("ticket_moved");
		};
	}, [workspaceId, fetchWorkspaceById]);

	// 3. Handle Drag End with Optimistic Rollback & Express Persistence
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

		// Optimistic UI update in Zustand (String comparison fix)
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

		// Persist update via Authenticated API
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
						actor: user?.name || "Developer",
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
			toast.error(err.message || "Could not sync ticket move to server");
		}
	};

	const rawTasks = currentWorkspace?.tasks || [];

	// Filter tasks based on search, priority, and assignee settings from Topbar
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

			return matchesQuery && matchesPriority && matchesAssignee;
		});
	}, [rawTasks, searchQuery, priorityFilter, assigneeFilter]);

	if (loading && !currentWorkspace) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[500px] text-stone-400">
				<Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
				<span className="font-mono-ui text-xs">Loading board tasks...</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full w-full min-h-screen bg-stone-50">
			{/* Render Topbar */}
			<Topbar
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				priorityFilter={priorityFilter}
				setPriorityFilter={setPriorityFilter}
				assigneeFilter={assigneeFilter}
				setAssigneeFilter={setAssigneeFilter}
			/>

			{/* Kanban Drag & Drop Columns */}
			<DragDropContext onDragEnd={onDragEnd}>
				<div className="flex gap-4 p-6 flex-1 min-w-max">
					{COLUMNS.map((col) => {
						const colTickets = filteredTasks.filter(
							(t) => String(t.status) === String(col.id),
						);
						return <Column key={col.id} col={col} colTickets={colTickets} />;
					})}
				</div>
			</DragDropContext>
		</div>
	);
}
