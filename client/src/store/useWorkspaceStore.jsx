import { create } from "zustand";
import { USER_WORKSPACES } from "../data/constants";

function normalizeWorkspaces(list) {
	const seen = new Set();
	return list.map((ws, index) => {
		let id = ws.id != null && ws.id !== "" ? String(ws.id) : `ws-${index}`;
		if (seen.has(id)) id = `${id}-${index}`;
		seen.add(id);
		return { ...ws, id };
	});
}
export const useWorkspaceStore = create((set) => ({
	workspaces: normalizeWorkspaces(USER_WORKSPACES),
	createWorkspace: ({ workspaceName, description }) => {
		set((state) => ({
			workspaces: [
				...state.workspaces,
				{
					id: Date.now().toString(),
					name: workspaceName,
					description: description,
					tickets: 0,
				},
			],
		}));
	},
	updateWorkspace: (id, newName) => {
		set((state) => ({
			workspaces: state.workspaces.map((ws) =>
				ws.id === id ? { ...ws, name: newName } : ws,
			),
		}));
	},
}));
