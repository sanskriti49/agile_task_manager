import { create } from "zustand";
import { toast } from "sonner";
import { useAuthStore } from "./useAuthStore";

const API_BASE = "http://localhost:5000/api";

const getAuthHeaders = () => {
	const token = useAuthStore.getState().token;
	return {
		"Content-Type": "application/json",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
	};
};

export const useWorkspaceStore = create((set, get) => ({
	workspaces: [],
	currentWorkspace: null,
	tickets: [],
	loading: false,
	error: null,

	// Modal & Drawer Global State
	isCreateWorkspaceModalOpen: false,
	setIsCreateWorkspaceModalOpen: (isOpen) =>
		set({ isCreateWorkspaceModalOpen: isOpen }),

	isTimeTravelOpen: false,
	setIsTimeTravelOpen: (isOpen) => set({ isTimeTravelOpen: isOpen }),

	// 👈 Added AI Copilot Decompose Modal State
	isAiDecomposeOpen: false,
	setIsAiDecomposeOpen: (isOpen) => set({ isAiDecomposeOpen: isOpen }),

	selectedTicket: null,
	activityOpen: false,
	activityLogs: [],

	setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),
	setActivityOpen: (isOpen) => set({ activityOpen: isOpen }),

	newTicketCol: null,
	setNewTicketCol: (colId) => set({ newTicketCol: colId }),

	fetchActivityLogs: async (projectId) => {
		try {
			const res = await fetch(`${API_BASE}/activity-logs/${projectId}`, {
				headers: getAuthHeaders(),
			});
			const data = await res.json();
			if (res.ok) set({ activityLogs: data });
		} catch (err) {
			console.error("Fetch activity logs error:", err);
		}
	},

	/* ------------------------------------------------------------------ */
	/* FETCH ALL WORKSPACES (Command Center)                             */
	/* ------------------------------------------------------------------ */
	fetchWorkspaces: async () => {
		set({ loading: true, error: null });
		try {
			const res = await fetch(`${API_BASE}/projects`, {
				headers: getAuthHeaders(),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || "Failed to fetch workspaces");
			}

			const normalized = data.map((ws) => ({
				id: ws.id,
				name: ws.name,
				description: ws.description,
				tickets: ws.total_tickets || 0,
				activeTickets: ws.active_tickets || 0,
				completedTickets: ws.completed_tickets || 0,
				color: ws.color || "from-teal-500 to-cyan-500",
				role: ws.role || "member",
				createdAt: ws.created_at,
			}));

			set({ workspaces: normalized, loading: false });
		} catch (err) {
			console.error("Fetch workspaces error:", err);
			set({ error: err.message, loading: false });
			toast.error(err.message || "Could not connect to server");
		}
	},

	/* ------------------------------------------------------------------ */
	/* FETCH SINGLE WORKSPACE + BOARD TASKS                              */
	/* ------------------------------------------------------------------ */
	fetchWorkspaceById: async (projectId) => {
		set({ loading: true, error: null });
		try {
			const res = await fetch(`${API_BASE}/projects/${projectId}`, {
				headers: getAuthHeaders(),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || "Failed to load board details");
			}
			const workspaceTickets = data.tasks || data.tickets || [];
			set({
				currentWorkspace: data,
				tickets: workspaceTickets,
				loading: false,
			});
			return data;
		} catch (err) {
			console.error("Fetch workspace error:", err);
			set({ error: err.message, loading: false });
			toast.error(err.message || "Unable to load workspace");
		}
	},

	/* ------------------------------------------------------------------ */
	/* CREATE WORKSPACE                                                   */
	/* ------------------------------------------------------------------ */
	createWorkspace: async ({ workspaceName, description }) => {
		const previousWorkspaces = get().workspaces;

		const tempId = `temp-${Date.now()}`;
		const tempWorkspace = {
			id: tempId,
			name: workspaceName,
			description: description || "",
			tickets: 0,
			activeTickets: 0,
			completedTickets: 0,
			role: "owner",
		};

		set((state) => ({
			workspaces: [tempWorkspace, ...state.workspaces],
			isCreateWorkspaceModalOpen: false,
		}));

		try {
			const res = await fetch(`${API_BASE}/projects`, {
				method: "POST",
				headers: getAuthHeaders(),
				body: JSON.stringify({
					name: workspaceName,
					description,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || "Failed to create workspace");
			}

			set((state) => ({
				workspaces: state.workspaces.map((ws) =>
					ws.id === tempId
						? {
								id: data.id,
								name: data.name,
								description: data.description,
								tickets: 0,
								activeTickets: 0,
								completedTickets: 0,
								role: "owner",
								createdAt: data.created_at,
							}
						: ws,
				),
			}));

			toast.success(`Workspace "${data.name}" created successfully!`);
			return data;
		} catch (err) {
			console.error("Create workspace error:", err);
			set({ workspaces: previousWorkspaces });
			toast.error(err.message || "Failed to create workspace on server");
		}
	},

	/* ------------------------------------------------------------------ */
	/* UPDATE WORKSPACE NAME                                              */
	/* ------------------------------------------------------------------ */
	updateWorkspace: async (id, newName) => {
		const previousWorkspaces = get().workspaces;
		const previousCurrent = get().currentWorkspace;

		set((state) => ({
			workspaces: state.workspaces.map((ws) =>
				ws.id === id ? { ...ws, name: newName } : ws,
			),
			currentWorkspace:
				state.currentWorkspace?.id === id
					? { ...state.currentWorkspace, name: newName }
					: state.currentWorkspace,
		}));

		try {
			const res = await fetch(`${API_BASE}/projects/${id}`, {
				method: "PATCH",
				headers: getAuthHeaders(),
				body: JSON.stringify({ name: newName }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || "Failed to update workspace name");
			}

			toast.success("Workspace renamed successfully");
		} catch (err) {
			console.error("Update workspace error:", err);
			set({
				workspaces: previousWorkspaces,
				currentWorkspace: previousCurrent,
			});
			toast.error(err.message || "Could not rename workspace");
		}
	},

	/* ------------------------------------------------------------------ */
	/* ADD MEMBER TO WORKSPACE                                            */
	/* ------------------------------------------------------------------ */
	addMember: async (projectId, email, role = "member") => {
		try {
			const res = await fetch(`${API_BASE}/projects/${projectId}/members`, {
				method: "POST",
				headers: getAuthHeaders(),
				body: JSON.stringify({ email, role }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || "Failed to add team member");
			}

			toast.success(`Added ${data.member.name} to workspace!`);

			if (get().currentWorkspace?.id === projectId) {
				get().fetchWorkspaceById(projectId);
			}

			return data;
		} catch (err) {
			console.error("Add member error:", err);
			toast.error(err.message || "Could not add team member");
		}
	},

	/* ------------------------------------------------------------------ */
	/* CREATE TICKET                                                      */
	/* ------------------------------------------------------------------ */
	createTicket: async (ticketData) => {
		const currWs = get().currentWorkspace;
		if (!currWs) return;

		try {
			const res = await fetch(`${API_BASE}/tickets`, {
				method: "POST",
				headers: getAuthHeaders(), // 👈 FIX 1: Call function getAuthHeaders() with parentheses!
				body: JSON.stringify({
					projectId: currWs.id,
					...ticketData,
				}),
			});
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || "Failed to create ticket");
			}
			toast.success(`Ticket ${data.task_key || ""} created successfully`);
			set((state) => ({
				currentWorkspace: state.currentWorkspace
					? {
							...state.currentWorkspace,
							tasks: [data, ...(state.currentWorkspace.tasks || [])],
						}
					: null,
			}));
			return data;
		} catch (err) {
			console.error("Create ticket error:", err);
			toast.error(err.message || "Could not create ticket");
		}
	},

	/* ------------------------------------------------------------------ */
	/* ADD COMMENT TO TICKET                                              */
	/* ------------------------------------------------------------------ */
	addComment: async (taskId, text) => {
		if (!text || !text.trim()) return;
		const currentWorkspaceId = get().currentWorkspace?.id;
		try {
			const res = await fetch(`${API_BASE}/tickets/${taskId}/comments`, {
				method: "POST",
				headers: getAuthHeaders(),
				body: JSON.stringify({
					body: text.trim(),
					projectId: currentWorkspaceId,
				}),
			});

			// Safe JSON Parsing Guard
			const contentType = res.headers.get("content-type");
			const isJson = contentType && contentType.includes("application/json");
			const data = isJson ? await res.json() : null;

			if (!res.ok) {
				const errorMsg =
					data?.message || `Server returned ${res.status} status`;
				throw new Error(errorMsg);
			}

			toast.success("Comment added");

			set((state) => {
				if (!state.currentWorkspace) return state;

				const updatedTasks = state.currentWorkspace.tasks.map((task) => {
					if (task.id === taskId) {
						const comments = task.comments || [];
						return {
							...task,
							comments: [...comments, data],
						};
					}
					return task;
				});

				return {
					currentWorkspace: {
						...state.currentWorkspace,
						tasks: updatedTasks,
					},
				};
			});

			return data;
		} catch (err) {
			console.error("Add comment error:", err);
			toast.error(err.message || "Could not post comment");
		}
	},
}));
