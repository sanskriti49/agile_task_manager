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
	// Workspaces & Board
	workspaces: [],
	currentWorkspace: null,
	tickets: [],
	wipLimits: {},
	loading: false,
	error: null,

	// Sprints
	sprints: [],
	activeSprint: null,
	burndownData: null,
	sprintsLoading: false,

	// Analytics & My Work
	projectAnalytics: null,
	analyticsLoading: false,
	myWorkData: null,
	myWorkLoading: false,

	// Notifications
	notifications: [],
	unreadCount: 0,
	notificationsOpen: false,
	setNotificationsOpen: (open) => set({ notificationsOpen: open }),

	// Real-time Collaborator Presence
	onlineCollaborators: [],
	setOnlineCollaborators: (collaborators) => set({ onlineCollaborators: collaborators || [] }),

	// Global Search
	searchResults: { projects: [], tasks: [], comments: [], members: [] },
	isSearching: false,

	// Modals & Panels Global State
	isCreateWorkspaceModalOpen: false,
	setIsCreateWorkspaceModalOpen: (isOpen) => set({ isCreateWorkspaceModalOpen: isOpen }),

	isCreateSprintModalOpen: false,
	setIsCreateSprintModalOpen: (isOpen) => set({ isCreateSprintModalOpen: isOpen }),

	isCommandPaletteOpen: false,
	setIsCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),

	isShortcutsOpen: false,
	setIsShortcutsOpen: (isOpen) => set({ isShortcutsOpen: isOpen }),

	isWipLimitModalOpen: false,
	setIsWipLimitModalOpen: (isOpen) => set({ isWipLimitModalOpen: isOpen }),

	isTimeTravelOpen: false,
	setIsTimeTravelOpen: (isOpen) => set({ isTimeTravelOpen: isOpen }),

	isAiDecomposeOpen: false,
	setIsAiDecomposeOpen: (isOpen) => set({ isAiDecomposeOpen: isOpen }),

	selectedTicket: null,
	activityOpen: false,
	activityLogs: [],
	activityTotal: 0,
	activityPage: 1,

	setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),
	setActivityOpen: (isOpen) => set({ activityOpen: isOpen }),

	newTicketCol: null,
	setNewTicketCol: (colId) => set({ newTicketCol: colId }),

	/* ------------------------------------------------------------------ */
	/* 1. FETCH ALL WORKSPACES                                            */
	/* ------------------------------------------------------------------ */
	fetchWorkspaces: async () => {
		set({ loading: true, error: null });
		try {
			const res = await fetch(`${API_BASE}/projects`, {
				headers: getAuthHeaders(),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to fetch workspaces");

			const normalized = data.map((ws) => ({
				id: ws.id,
				name: ws.name,
				description: ws.description,
				tickets: ws.total_tickets || 0,
				activeTickets: ws.active_tickets || 0,
				completedTickets: ws.completed_tickets || 0,
				role: ws.role || "member",
				createdAt: ws.created_at,
			}));

			set({ workspaces: normalized, loading: false });
		} catch (err) {
			console.error("Fetch workspaces error:", err);
			set({ error: err.message, loading: false });
		}
	},

	/* ------------------------------------------------------------------ */
	/* 2. FETCH SINGLE WORKSPACE + BOARD DATA                             */
	/* ------------------------------------------------------------------ */
	fetchWorkspaceById: async (projectId) => {
		set({ loading: true, error: null });
		try {
			const res = await fetch(`${API_BASE}/projects/${projectId}`, {
				headers: getAuthHeaders(),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to load board details");

			const workspaceTickets = data.tasks || [];
			set({
				currentWorkspace: data,
				tickets: workspaceTickets,
				wipLimits: data.wipLimits || {},
				activeSprint: data.activeSprint || null,
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
	/* 3. CREATE & UPDATE WORKSPACE                                       */
	/* ------------------------------------------------------------------ */
	createWorkspace: async ({ workspaceName, description }) => {
		try {
			const res = await fetch(`${API_BASE}/projects`, {
				method: "POST",
				headers: getAuthHeaders(),
				body: JSON.stringify({ name: workspaceName, description }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to create workspace");

			toast.success(`Workspace "${data.name}" created!`);
			get().fetchWorkspaces();
			set({ isCreateWorkspaceModalOpen: false });
			return data;
		} catch (err) {
			console.error("Create workspace error:", err);
			toast.error(err.message || "Failed to create workspace");
		}
	},

	updateWorkspace: async (id, newName) => {
		try {
			const res = await fetch(`${API_BASE}/projects/${id}`, {
				method: "PATCH",
				headers: getAuthHeaders(),
				body: JSON.stringify({ name: newName }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to rename workspace");

			toast.success("Workspace renamed successfully");
			get().fetchWorkspaces();
			if (get().currentWorkspace?.id === id) {
				set((state) => ({
					currentWorkspace: { ...state.currentWorkspace, name: newName },
				}));
			}
		} catch (err) {
			console.error("Update workspace error:", err);
			toast.error(err.message || "Could not rename workspace");
		}
	},

	addMember: async (projectId, email, role = "member") => {
		try {
			const res = await fetch(`${API_BASE}/projects/${projectId}/members`, {
				method: "POST",
				headers: getAuthHeaders(),
				body: JSON.stringify({ email, role }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to add member");

			toast.success(`Added ${data.member.name} to workspace!`);
			if (get().currentWorkspace?.id === projectId) {
				get().fetchWorkspaceById(projectId);
			}
			return data;
		} catch (err) {
			console.error("Add member error:", err);
			toast.error(err.message || "Could not add member");
		}
	},

	setWipLimit: async (projectId, columnId, limit) => {
		try {
			const res = await fetch(`${API_BASE}/projects/${projectId}/wip-limits`, {
				method: "PUT",
				headers: getAuthHeaders(),
				body: JSON.stringify({ columnId, limit }),
			});
			if (res.ok) {
				set((state) => ({
					wipLimits: { ...state.wipLimits, [columnId]: parseInt(limit, 10) },
				}));
				toast.success(`WIP limit for ${columnId} updated to ${limit}`);
			}
		} catch (err) {
			console.error("Set WIP limit error:", err);
		}
	},

	/* ------------------------------------------------------------------ */
	/* 4. SPRINT MANAGEMENT                                               */
	/* ------------------------------------------------------------------ */
	fetchSprints: async (projectId) => {
		set({ sprintsLoading: true });
		try {
			const res = await fetch(`${API_BASE}/projects/${projectId}/sprints`, {
				headers: getAuthHeaders(),
			});
			const data = await res.json();
			if (res.ok) {
				const active = data.find((s) => s.status === "active") || null;
				set({ sprints: data, activeSprint: active, sprintsLoading: false });
			}
		} catch (err) {
			console.error("Fetch sprints error:", err);
			set({ sprintsLoading: false });
		}
	},

	createSprint: async (projectId, sprintData) => {
		try {
			const res = await fetch(`${API_BASE}/projects/${projectId}/sprints`, {
				method: "POST",
				headers: getAuthHeaders(),
				body: JSON.stringify(sprintData),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to create sprint");

			toast.success(`Sprint "${data.name}" created!`);
			get().fetchSprints(projectId);
			set({ isCreateSprintModalOpen: false });
			return data;
		} catch (err) {
			console.error("Create sprint error:", err);
			toast.error(err.message || "Could not create sprint");
		}
	},

	startSprint: async (projectId, sprintId) => {
		try {
			const res = await fetch(`${API_BASE}/projects/${projectId}/sprints/${sprintId}/start`, {
				method: "PATCH",
				headers: getAuthHeaders(),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to start sprint");

			toast.success(`Sprint "${data.name}" is now Active! 🚀`);
			get().fetchSprints(projectId);
			get().fetchWorkspaceById(projectId);
			return data;
		} catch (err) {
			console.error("Start sprint error:", err);
			toast.error(err.message || "Could not start sprint");
		}
	},

	completeSprint: async (projectId, sprintId) => {
		try {
			const res = await fetch(`${API_BASE}/projects/${projectId}/sprints/${sprintId}/complete`, {
				method: "PATCH",
				headers: getAuthHeaders(),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to complete sprint");

			toast.success(`Sprint "${data.name}" marked Completed! 🎉`);
			get().fetchSprints(projectId);
			get().fetchWorkspaceById(projectId);
			return data;
		} catch (err) {
			console.error("Complete sprint error:", err);
			toast.error(err.message || "Could not complete sprint");
		}
	},

	fetchSprintBurndown: async (projectId, sprintId) => {
		try {
			const res = await fetch(`${API_BASE}/projects/${projectId}/sprints/${sprintId}/burndown`, {
				headers: getAuthHeaders(),
			});
			const data = await res.json();
			if (res.ok) {
				set({ burndownData: data });
				return data;
			}
		} catch (err) {
			console.error("Fetch burndown error:", err);
		}
	},

	/* ------------------------------------------------------------------ */
	/* 5. TASK OPERATIONS                                                 */
	/* ------------------------------------------------------------------ */
	createTicket: async (ticketData) => {
		const currWs = get().currentWorkspace;
		if (!currWs) return;

		try {
			const res = await fetch(`${API_BASE}/tickets`, {
				method: "POST",
				headers: getAuthHeaders(),
				body: JSON.stringify({
					projectId: currWs.id,
					...ticketData,
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to create ticket");

			toast.success(`Issue ${data.task_key || ""} created successfully`);
			set((state) => ({
				currentWorkspace: state.currentWorkspace
					? {
							...state.currentWorkspace,
							tasks: [data, ...(state.currentWorkspace.tasks || [])],
						}
					: null,
				tickets: [data, ...state.tickets],
			}));
			return data;
		} catch (err) {
			console.error("Create ticket error:", err);
			toast.error(err.message || "Could not create ticket");
		}
	},

	updateTicket: async (taskId, updates) => {
		try {
			const res = await fetch(`${API_BASE}/tickets/${taskId}`, {
				method: "PATCH",
				headers: getAuthHeaders(),
				body: JSON.stringify(updates),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to update ticket");

			toast.success("Task updated");

			// Update in state
			set((state) => {
				const updateList = (list) =>
					(list || []).map((t) => (t.id === taskId ? { ...t, ...data } : t));

				const updatedSelected =
					state.selectedTicket?.id === taskId
						? { ...state.selectedTicket, ...data }
						: state.selectedTicket;

				return {
					tickets: updateList(state.tickets),
					selectedTicket: updatedSelected,
					currentWorkspace: state.currentWorkspace
						? {
								...state.currentWorkspace,
								tasks: updateList(state.currentWorkspace.tasks),
							}
						: null,
				};
			});

			return data;
		} catch (err) {
			console.error("Update ticket error:", err);
			toast.error(err.message || "Could not update task");
		}
	},

	deleteTicket: async (taskId) => {
		try {
			const res = await fetch(`${API_BASE}/tickets/${taskId}`, {
				method: "DELETE",
				headers: getAuthHeaders(),
			});
			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || "Failed to delete task");
			}

			toast.success("Task deleted");

			set((state) => ({
				selectedTicket: null,
				tickets: state.tickets.filter((t) => t.id !== taskId),
				currentWorkspace: state.currentWorkspace
					? {
							...state.currentWorkspace,
							tasks: (state.currentWorkspace.tasks || []).filter((t) => t.id !== taskId),
						}
					: null,
			}));
		} catch (err) {
			console.error("Delete task error:", err);
			toast.error(err.message || "Could not delete task");
		}
	},

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
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Could not post comment");

			toast.success("Comment added");

			set((state) => {
				const appendComment = (task) => {
					if (task.id === taskId) {
						return {
							...task,
							comments: [...(task.comments || []), data],
						};
					}
					return task;
				};

				return {
					selectedTicket:
						state.selectedTicket?.id === taskId
							? appendComment(state.selectedTicket)
							: state.selectedTicket,
					currentWorkspace: state.currentWorkspace
						? {
								...state.currentWorkspace,
								tasks: (state.currentWorkspace.tasks || []).map(appendComment),
							}
						: null,
				};
			});

			return data;
		} catch (err) {
			console.error("Add comment error:", err);
			toast.error(err.message || "Could not post comment");
		}
	},

	/* ------------------------------------------------------------------ */
	/* 6. SUBTASKS                                                        */
	/* ------------------------------------------------------------------ */
	addSubtask: async (taskId, title) => {
		try {
			const res = await fetch(`${API_BASE}/tickets/${taskId}/subtasks`, {
				method: "POST",
				headers: getAuthHeaders(),
				body: JSON.stringify({ title }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to add subtask");

			set((state) => {
				if (state.selectedTicket?.id === taskId) {
					return {
						selectedTicket: {
							...state.selectedTicket,
							subtasks: [...(state.selectedTicket.subtasks || []), data],
						},
					};
				}
				return state;
			});
			return data;
		} catch (err) {
			console.error("Add subtask error:", err);
			toast.error(err.message || "Could not add subtask");
		}
	},

	toggleSubtask: async (taskId, subtaskId, isCompleted) => {
		try {
			const res = await fetch(`${API_BASE}/tickets/${taskId}/subtasks/${subtaskId}`, {
				method: "PATCH",
				headers: getAuthHeaders(),
				body: JSON.stringify({ is_completed: isCompleted }),
			});
			const data = await res.json();
			if (res.ok && get().selectedTicket?.id === taskId) {
				set((state) => ({
					selectedTicket: {
						...state.selectedTicket,
						subtasks: (state.selectedTicket.subtasks || []).map((s) =>
							s.id === subtaskId ? { ...s, is_completed: isCompleted } : s,
						),
					},
				}));
			}
		} catch (err) {
			console.error("Toggle subtask error:", err);
		}
	},

	deleteSubtask: async (taskId, subtaskId) => {
		try {
			await fetch(`${API_BASE}/tickets/${taskId}/subtasks/${subtaskId}`, {
				method: "DELETE",
				headers: getAuthHeaders(),
			});
			if (get().selectedTicket?.id === taskId) {
				set((state) => ({
					selectedTicket: {
						...state.selectedTicket,
						subtasks: (state.selectedTicket.subtasks || []).filter((s) => s.id !== subtaskId),
					},
				}));
			}
		} catch (err) {
			console.error("Delete subtask error:", err);
		}
	},

	/* ------------------------------------------------------------------ */
	/* 7. DEPENDENCIES                                                    */
	/* ------------------------------------------------------------------ */
	addDependency: async (taskId, dependsOnTaskId, dependencyType = "blocks") => {
		try {
			const res = await fetch(`${API_BASE}/tickets/${taskId}/dependencies`, {
				method: "POST",
				headers: getAuthHeaders(),
				body: JSON.stringify({ dependsOnTaskId, dependencyType }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to add dependency");

			toast.success("Dependency link created");
			if (get().selectedTicket?.id === taskId) {
				set((state) => ({
					selectedTicket: {
						...state.selectedTicket,
						dependencies: [...(state.selectedTicket.dependencies || []), data],
					},
				}));
			}
			return data;
		} catch (err) {
			console.error("Add dependency error:", err);
			toast.error(err.message || "Could not add dependency");
		}
	},

	removeDependency: async (taskId, dependencyId) => {
		try {
			await fetch(`${API_BASE}/tickets/${taskId}/dependencies/${dependencyId}`, {
				method: "DELETE",
				headers: getAuthHeaders(),
			});
			toast.success("Dependency removed");
			if (get().selectedTicket?.id === taskId) {
				set((state) => ({
					selectedTicket: {
						...state.selectedTicket,
						dependencies: (state.selectedTicket.dependencies || []).filter(
							(d) => d.id !== dependencyId,
						),
						blockedBy: (state.selectedTicket.blockedBy || []).filter(
							(d) => d.id !== dependencyId,
						),
					},
				}));
			}
		} catch (err) {
			console.error("Remove dependency error:", err);
		}
	},

	/* ------------------------------------------------------------------ */
	/* 8. NOTIFICATIONS                                                   */
	/* ------------------------------------------------------------------ */
	fetchNotifications: async () => {
		try {
			const res = await fetch(`${API_BASE}/notifications`, {
				headers: getAuthHeaders(),
			});
			const data = await res.json();
			if (res.ok) {
				set({
					notifications: data.notifications || [],
					unreadCount: data.unreadCount || 0,
				});
			}
		} catch (err) {
			console.error("Fetch notifications error:", err);
		}
	},

	markNotificationRead: async (id) => {
		try {
			await fetch(`${API_BASE}/notifications/${id}/read`, {
				method: "PATCH",
				headers: getAuthHeaders(),
			});
			set((state) => ({
				notifications: state.notifications.map((n) =>
					n.id === id ? { ...n, is_read: true } : n,
				),
				unreadCount: Math.max(0, state.unreadCount - 1),
			}));
		} catch (err) {
			console.error("Mark notification read error:", err);
		}
	},

	markAllNotificationsRead: async () => {
		try {
			await fetch(`${API_BASE}/notifications/read-all`, {
				method: "PATCH",
				headers: getAuthHeaders(),
			});
			set((state) => ({
				notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
				unreadCount: 0,
			}));
			toast.success("All notifications marked as read");
		} catch (err) {
			console.error("Mark all read error:", err);
		}
	},

	/* ------------------------------------------------------------------ */
	/* 9. ANALYTICS & MY WORK                                             */
	/* ------------------------------------------------------------------ */
	fetchProjectAnalytics: async (projectId) => {
		set({ analyticsLoading: true });
		try {
			const res = await fetch(`${API_BASE}/analytics/projects/${projectId}/analytics`, {
				headers: getAuthHeaders(),
			});
			const data = await res.json();
			if (res.ok) {
				set({ projectAnalytics: data });
				return data;
			}
		} catch (err) {
			console.error("Fetch analytics error:", err);
		} finally {
			set({ analyticsLoading: false });
		}
	},

	fetchMyWork: async () => {
		set({ myWorkLoading: true });
		try {
			const res = await fetch(`${API_BASE}/analytics/my-work`, {
				headers: getAuthHeaders(),
			});
			const data = await res.json();
			if (res.ok) {
				set({ myWorkData: data });
				return data;
			}
		} catch (err) {
			console.error("Fetch my work error:", err);
		} finally {
			set({ myWorkLoading: false });
		}
	},

	/* ------------------------------------------------------------------ */
	/* 10. GLOBAL SEARCH                                                  */
	/* ------------------------------------------------------------------ */
	searchGlobal: async (query) => {
		if (!query || query.trim().length < 2) {
			set({ searchResults: { projects: [], tasks: [], comments: [], members: [] } });
			return;
		}

		set({ isSearching: true });
		try {
			const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query.trim())}`, {
				headers: getAuthHeaders(),
			});
			const data = await res.json();
			if (res.ok) {
				set({ searchResults: data, isSearching: false });
			}
		} catch (err) {
			console.error("Search error:", err);
			set({ isSearching: false });
		}
	},

	/* ------------------------------------------------------------------ */
	/* 11. ACTIVITY LOGS                                                  */
	/* ------------------------------------------------------------------ */
	fetchActivityLogs: async (projectId, page = 1) => {
		try {
			const res = await fetch(`${API_BASE}/activity-logs/${projectId}?page=${page}&limit=30`, {
				headers: getAuthHeaders(),
			});
			const data = await res.json();
			if (res.ok) {
				set({
					activityLogs: data.activities || [],
					activityTotal: data.total || 0,
					activityPage: data.page || 1,
				});
			}
		} catch (err) {
			console.error("Fetch activity logs error:", err);
		}
	},
}));
