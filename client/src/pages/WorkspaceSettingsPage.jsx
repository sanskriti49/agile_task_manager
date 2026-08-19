import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
	Settings,
	Users,
	Sliders,
	Trash2,
	UserPlus,
	Shield,
	Mail,
	ArrowLeft,
	Save,
	Check,
	AlertTriangle,
	Loader2,
	X,
	FolderKanban,
	UserCheck,
} from "lucide-react";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { useAuthStore } from "../store/useAuthStore";
import { avatarColor } from "../components/utils/avatarColor";
import { toast } from "sonner";
import AppLoader from "../components/common/AppLoader";

function initials(name = "") {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((p) => p[0].toUpperCase())
		.join("");
}

export default function WorkspaceSettingsPage() {
	const { id: projectId } = useParams();
	const navigate = useNavigate();

	const user = useAuthStore((state) => state.user);
	const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
	const fetchWorkspaceById = useWorkspaceStore(
		(state) => state.fetchWorkspaceById,
	);
	const updateWorkspace = useWorkspaceStore((state) => state.updateWorkspace);
	const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);
	const addMember = useWorkspaceStore((state) => state.addMember);
	const removeMember = useWorkspaceStore((state) => state.removeMember);
	const updateMemberRole = useWorkspaceStore((state) => state.updateMemberRole);
	const setWipLimit = useWorkspaceStore((state) => state.setWipLimit);
	const searchPlatformUsers = useWorkspaceStore(
		(state) => state.searchPlatformUsers,
	);

	const [activeTab, setActiveTab] = useState("members"); // "general" | "members" | "wip" | "danger"
	const [workspaceName, setWorkspaceName] = useState("");
	const [workspaceDesc, setWorkspaceDesc] = useState("");
	const [isSavingGeneral, setIsSavingGeneral] = useState(false);

	// Invite Member Modal State
	const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState("member");
	const [isInviting, setIsInviting] = useState(false);
	const [userSearchResults, setUserSearchResults] = useState([]);
	const [isSearchingUsers, setIsSearchingUsers] = useState(false);

	// WIP limits state
	const [localWipLimits, setLocalWipLimits] = useState({
		todo: 10,
		inprogress: 4,
		done: 25,
		backlog: 30,
	});

	// Delete Confirmation Modal
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [confirmName, setConfirmName] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		if (projectId) {
			fetchWorkspaceById(projectId);
		}
	}, [projectId, fetchWorkspaceById]);

	useEffect(() => {
		if (currentWorkspace) {
			setWorkspaceName(currentWorkspace.name || "");
			setWorkspaceDesc(currentWorkspace.description || "");
			if (currentWorkspace.wipLimits) {
				setLocalWipLimits((prev) => ({
					...prev,
					...currentWorkspace.wipLimits,
				}));
			}
		}
	}, [currentWorkspace]);

	// Search platform users on invite input
	useEffect(() => {
		if (!inviteEmail.trim() || inviteEmail.includes("@")) {
			setUserSearchResults([]);
			return;
		}
		const timer = setTimeout(async () => {
			setIsSearchingUsers(true);
			const res = await searchPlatformUsers(inviteEmail);
			// Filter out already added members
			const currentMemberIds = new Set(
				(currentWorkspace?.members || []).map((m) => m.id),
			);
			setUserSearchResults(res.filter((u) => !currentMemberIds.has(u.id)));
			setIsSearchingUsers(false);
		}, 300);

		return () => clearTimeout(timer);
	}, [inviteEmail, searchPlatformUsers, currentWorkspace]);

	if (!currentWorkspace) {
		return (
			<AppLoader
				text="Loading workspace settings..."
				type="ring"
				minH="min-h-[500px]"
			/>
		);
	}

	const members = currentWorkspace.members || [];
	const currentUserRole =
		members.find((m) => m.id === user?.userId || m.id === user?.id)?.role ||
		"member";
	const isOwnerOrAdmin =
		currentUserRole === "owner" || currentUserRole === "admin";

	const handleSaveGeneral = async (e) => {
		e.preventDefault();
		if (!workspaceName.trim()) return;
		setIsSavingGeneral(true);
		try {
			await updateWorkspace(projectId, {
				name: workspaceName.trim(),
				description: workspaceDesc,
			});
		} finally {
			setIsSavingGeneral(false);
		}
	};

	const handleInviteSubmit = async (e) => {
		e.preventDefault();
		if (!inviteEmail.trim()) return;
		setIsInviting(true);
		try {
			await addMember(projectId, inviteEmail.trim(), inviteRole);
			setInviteEmail("");
			setIsInviteModalOpen(false);
		} finally {
			setIsInviting(false);
		}
	};

	const handleRoleChange = async (userId, newRole) => {
		await updateMemberRole(projectId, userId, newRole);
	};

	const handleRemoveMember = async (userId, memberName) => {
		if (
			window.confirm(
				`Are you sure you want to remove ${memberName} from this workspace?`,
			)
		) {
			await removeMember(projectId, userId);
		}
	};

	const handleSaveWipLimit = async (col, val) => {
		const parsed = parseInt(val, 10) || 0;
		setLocalWipLimits((prev) => ({ ...prev, [col]: parsed }));
		await setWipLimit(projectId, col, parsed);
	};

	const handleDeleteWorkspace = async () => {
		if (confirmName !== currentWorkspace.name) return;
		setIsDeleting(true);
		try {
			await deleteWorkspace(projectId);
			navigate("/dashboard");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="w-full bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 font-mono-ui">
			<main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
				{/* Back Link & Header */}
				<div className="pb-6 border-b border-slate-200/80 dark:border-slate-800">
					<Link
						to={`/workspace/${projectId}`}
						className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline mb-2"
					>
						<ArrowLeft className="h-3.5 w-3.5" /> Back to Board
					</Link>

					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="h-11 w-11 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-300">
								<Settings className="h-5 w-5" />
							</div>
							<div>
								<h1 className="display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
									Workspace Settings
								</h1>
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
									Manage members, roles, WIP limits, and workspace preferences for{" "}
									<strong className="text-slate-800 dark:text-slate-200">
										{currentWorkspace.name}
									</strong>
								</p>
							</div>
						</div>

						<span className="self-start sm:self-auto px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize">
							Your Role: {currentUserRole}
						</span>
					</div>
				</div>

				{/* Settings Tabs Navigation */}
				<div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 mt-6 overflow-x-auto text-xs font-bold">
					{[
						{ id: "members", label: "Team Members", icon: Users, count: members.length },
						{ id: "general", label: "General", icon: FolderKanban },
						{ id: "wip", label: "WIP Limits", icon: Sliders },
						{ id: "danger", label: "Danger Zone", icon: Trash2, danger: true },
					].map((tab) => {
						const Icon = tab.icon;
						const active = activeTab === tab.id;
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
									active
										? tab.danger
											? "border-rose-500 text-rose-600 dark:text-rose-400"
											: "border-teal-500 text-teal-600 dark:text-teal-400"
										: "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
								}`}
							>
								<Icon className="h-4 w-4" />
								<span>{tab.label}</span>
								{tab.count !== undefined && (
									<span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
										{tab.count}
									</span>
								)}
							</button>
						);
					})}
				</div>

				{/* ------------------------------------------------------------------ */}
				{/* TAB 1: TEAM MEMBERS MANAGEMENT                                    */}
				{/* ------------------------------------------------------------------ */}
				{activeTab === "members" && (
					<div className="py-6 space-y-6">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
							<div>
								<h3 className="display text-base font-bold text-slate-900 dark:text-slate-100">
									Collaborators & Team Members
								</h3>
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
									Manage workspace access, assign tasks, and adjust collaborator roles.
								</p>
							</div>

							{isOwnerOrAdmin && (
								<button
									type="button"
									onClick={() => setIsInviteModalOpen(true)}
									className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
								>
									<UserPlus className="h-4 w-4" /> Add Team Member
								</button>
							)}
						</div>

						{/* Members List Table */}
						<div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
							<div className="divide-y divide-slate-100 dark:divide-slate-800">
								{members.map((m) => {
									const isCurrentUser = m.id === user?.userId || m.id === user?.id;
									const isOwner = m.role === "owner";

									return (
										<div
											key={m.id}
											className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
										>
											<div className="flex items-center gap-3 min-w-0">
												<span
													className={`h-9 w-9 rounded-full ${avatarColor(
														m.name,
													)} font-bold text-xs text-white flex items-center justify-center shrink-0`}
												>
													{initials(m.name)}
												</span>
												<div className="min-w-0">
													<div className="flex items-center gap-2">
														<h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
															{m.name}
														</h4>
														{isCurrentUser && (
															<span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold">
																You
															</span>
														)}
													</div>
													<p className="text-xs text-slate-400 truncate">
														{m.email}
													</p>
												</div>
											</div>

											<div className="flex items-center gap-3 self-end sm:self-auto">
												{/* Role selector */}
												{isOwner ? (
													<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
														<Shield className="h-3 w-3" /> Owner
													</span>
												) : isOwnerOrAdmin ? (
													<select
														value={m.role || "member"}
														onChange={(e) =>
															handleRoleChange(m.id, e.target.value)
														}
														className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
													>
														<option value="admin">Admin</option>
														<option value="member">Member</option>
														<option value="viewer">Viewer</option>
													</select>
												) : (
													<span className="text-xs font-semibold text-slate-500 capitalize">
														{m.role || "member"}
													</span>
												)}

												{/* Remove button */}
												{isOwnerOrAdmin && !isOwner && !isCurrentUser && (
													<button
														type="button"
														onClick={() => handleRemoveMember(m.id, m.name)}
														className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
														title="Remove from workspace"
													>
														<Trash2 className="h-4 w-4" />
													</button>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				)}

				{/* ------------------------------------------------------------------ */}
				{/* TAB 2: GENERAL SETTINGS                                           */}
				{/* ------------------------------------------------------------------ */}
				{activeTab === "general" && (
					<div className="py-6">
						<form
							onSubmit={handleSaveGeneral}
							className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-5"
						>
							<div>
								<h3 className="display text-base font-bold text-slate-900 dark:text-slate-100">
									Workspace Profile
								</h3>
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
									Update your project workspace display title and description.
								</p>
							</div>

							<div className="space-y-1.5">
								<label className="text-xs font-bold uppercase tracking-wider text-slate-500">
									Workspace Name
								</label>
								<input
									value={workspaceName}
									onChange={(e) => setWorkspaceName(e.target.value)}
									required
									placeholder="e.g. Core SaaS Platform"
									className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900"
								/>
							</div>

							<div className="space-y-1.5">
								<label className="text-xs font-bold uppercase tracking-wider text-slate-500">
									Description
								</label>
								<textarea
									value={workspaceDesc}
									onChange={(e) => setWorkspaceDesc(e.target.value)}
									rows={3}
									placeholder="Briefly describe the purpose of this project..."
									className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900 resize-none leading-relaxed"
								/>
							</div>

							<button
								type="submit"
								disabled={isSavingGeneral}
								className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
							>
								{isSavingGeneral ? (
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
								) : (
									<Save className="h-3.5 w-3.5" />
								)}
								{isSavingGeneral ? "Saving Changes..." : "Save Changes"}
							</button>
						</form>
					</div>
				)}

				{/* ------------------------------------------------------------------ */}
				{/* TAB 3: WIP LIMITS CONFIGURATION                                   */}
				{/* ------------------------------------------------------------------ */}
				{activeTab === "wip" && (
					<div className="py-6">
						<div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-6">
							<div>
								<h3 className="display text-base font-bold text-slate-900 dark:text-slate-100">
									Kanban Work-In-Progress (WIP) Limits
								</h3>
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
									Prevent multitasking bottlenecks by capping the maximum concurrent tickets per column.
								</p>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{[
									{ key: "todo", label: "To Do Column", default: 10 },
									{ key: "inprogress", label: "In Progress Column", default: 4 },
									{ key: "done", label: "Done Column", default: 25 },
									{ key: "backlog", label: "Backlog Column", default: 30 },
								].map((col) => (
									<div
										key={col.key}
										className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
									>
										<div>
											<h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
												{col.label}
											</h4>
											<span className="text-[11px] text-slate-400">
												Max tickets: {localWipLimits[col.key] || col.default}
											</span>
										</div>

										<input
											type="number"
											min="1"
											max="100"
											value={localWipLimits[col.key] || col.default}
											onChange={(e) =>
												handleSaveWipLimit(col.key, e.target.value)
											}
											className="w-16 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-center text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
										/>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{/* ------------------------------------------------------------------ */}
				{/* TAB 4: DANGER ZONE                                                */}
				{/* ------------------------------------------------------------------ */}
				{activeTab === "danger" && (
					<div className="py-6">
						<div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200/80 dark:border-rose-950/60 p-6 shadow-2xs space-y-4">
							<div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
								<AlertTriangle className="h-4 w-4" /> Danger Zone
							</div>

							<p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
								Permanently delete this workspace and all associated tasks, sprints, subtasks, and dependency graphs. This action cannot be undone.
							</p>

							{isOwnerOrAdmin ? (
								<button
									type="button"
									onClick={() => setIsDeleteModalOpen(true)}
									className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
								>
									<Trash2 className="h-4 w-4" /> Delete Workspace
								</button>
							) : (
								<p className="text-xs font-semibold text-rose-500">
									Only workspace owners and admins have permission to delete this project.
								</p>
							)}
						</div>
					</div>
				)}
			</main>

			{/* ------------------------------------------------------------------ */}
			{/* INVITE TEAM MEMBER MODAL                                           */}
			{/* ------------------------------------------------------------------ */}
			{isInviteModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
					<div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
						<button
							type="button"
							onClick={() => setIsInviteModalOpen(false)}
							className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
						>
							<X className="h-4 w-4" />
						</button>

						<div className="flex items-center gap-2 mb-4">
							<div className="h-9 w-9 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-300 flex items-center justify-center">
								<UserPlus className="h-4 w-4" />
							</div>
							<div>
								<h3 className="display text-base font-bold text-slate-900 dark:text-slate-100">
									Add Team Member
								</h3>
								<p className="text-xs text-slate-400">
									Invite collaborators by email or username
								</p>
							</div>
						</div>

						<form onSubmit={handleInviteSubmit} className="space-y-4">
							<div>
								<label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
									Email or Username
								</label>
								<input
									value={inviteEmail}
									onChange={(e) => setInviteEmail(e.target.value)}
									placeholder="e.g. aria@flux.dev"
									required
									autoFocus
									className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800"
								/>

								{/* Platform search autocomplete dropdown */}
								{userSearchResults.length > 0 && (
									<div className="mt-1 max-h-36 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 shadow-lg">
										{userSearchResults.map((u) => (
											<button
												key={u.id}
												type="button"
												onClick={() => {
													setInviteEmail(u.email);
													setUserSearchResults([]);
												}}
												className="w-full flex items-center justify-between p-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
											>
												<span className="font-bold text-slate-800 dark:text-slate-200">
													{u.name}
												</span>
												<span className="text-[11px] text-slate-400">
													{u.email}
												</span>
											</button>
										))}
									</div>
								)}
							</div>

							<div>
								<label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
									Role
								</label>
								<select
									value={inviteRole}
									onChange={(e) => setInviteRole(e.target.value)}
									className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
								>
									<option value="admin">Admin (Full project control)</option>
									<option value="member">Member (Create & edit tickets)</option>
									<option value="viewer">Viewer (Read-only access)</option>
								</select>
							</div>

							<div className="flex items-center justify-end gap-2 pt-2">
								<button
									type="button"
									onClick={() => setIsInviteModalOpen(false)}
									className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isInviting}
									className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold disabled:opacity-50 shadow-xs"
								>
									{isInviting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
									{isInviting ? "Adding..." : "Add Member"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* ------------------------------------------------------------------ */}
			{/* DELETE CONFIRMATION MODAL                                          */}
			{/* ------------------------------------------------------------------ */}
			{isDeleteModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
					<div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
						<h3 className="display text-base font-bold text-rose-600 dark:text-rose-400 mb-2">
							Delete Workspace
						</h3>
						<p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
							Please type{" "}
							<strong className="text-slate-800 dark:text-slate-200">
								{currentWorkspace.name}
							</strong>{" "}
							to confirm deletion.
						</p>

						<input
							value={confirmName}
							onChange={(e) => setConfirmName(e.target.value)}
							placeholder={currentWorkspace.name}
							className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none mb-4"
						/>

						<div className="flex items-center justify-end gap-2">
							<button
								type="button"
								onClick={() => setIsDeleteModalOpen(false)}
								className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
							>
								Cancel
							</button>
							<button
								type="button"
								disabled={confirmName !== currentWorkspace.name || isDeleting}
								onClick={handleDeleteWorkspace}
								className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-40 shadow-xs"
							>
								{isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
								{isDeleting ? "Deleting..." : "Permanently Delete"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
