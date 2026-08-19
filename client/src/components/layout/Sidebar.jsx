import React, { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
	LayoutGrid,
	CheckSquare,
	BarChart3,
	Sparkles,
	History,
	Users,
	Settings,
	Plus,
	ChevronLeft,
	FolderKanban,
	ShieldCheck,
	Flame,
	Command,
	HelpCircle,
	LogOut,
	Moon,
	Sun,
	Kanban,
} from "lucide-react";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";
import Logo from "../ui/Logo";

export default function Sidebar() {
	const [isExpanded, setIsExpanded] = useState(true);
	const location = useLocation();
	const navigate = useNavigate();

	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);

	const workspaces = useWorkspaceStore((state) => state.workspaces) || [];
	const setIsCreateWorkspaceModalOpen = useWorkspaceStore(
		(state) => state.setIsCreateWorkspaceModalOpen,
	);
	const setIsCommandPaletteOpen = useWorkspaceStore(
		(state) => state.setIsCommandPaletteOpen,
	);
	const setIsShortcutsOpen = useWorkspaceStore(
		(state) => state.setIsShortcutsOpen,
	);
	const setActivityOpen = useWorkspaceStore((state) => state.setActivityOpen);
	const activityOpen = useWorkspaceStore((state) => state.activityOpen);

	const theme = useThemeStore((state) => state.theme);
	const toggleTheme = useThemeStore((state) => state.toggleTheme);

	const currentWorkspaceId = location.pathname.startsWith("/workspace/")
		? location.pathname.split("/")[2]
		: null;

	const currentUserFirstName = user?.name
		? user.name.split(" ")[0]
		: "Developer";

	return (
		<aside
			className={`relative z-40 flex h-full shrink-0 flex-col gap-2 border-r border-slate-800/80 bg-slate-950/95 py-4 backdrop-blur-xl transition-[width] duration-300 ease-in-out font-mono-ui ${
				isExpanded ? "w-64 px-3" : "w-16 items-center px-0"
			}`}
		>
			{/* Brand Header */}
			<div
				className={`mb-3 flex items-center ${
					isExpanded ? "justify-between px-1" : "flex-col gap-2"
				}`}
			>
				<div className="flex items-center gap-2.5">
					<Logo showText={false} />
					{isExpanded && (
						<div className="flex items-center gap-1.5">
							<span className="text-xl font-extrabold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-400">
								FLUX
							</span>
						</div>
					)}
				</div>

				<button
					type="button"
					onClick={() => setIsExpanded((v) => !v)}
					aria-label={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
					className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
				>
					<ChevronLeft
						className={`h-4 w-4 transition-transform duration-300 ${
							isExpanded ? "" : "rotate-180"
						}`}
					/>
				</button>
			</div>

			{/* New Workspace Trigger CTA */}
			<button
				type="button"
				onClick={() => setIsCreateWorkspaceModalOpen(true)}
				className={`group relative mb-2 flex items-center gap-2.5 rounded-xl border border-teal-500/20 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 py-2 text-xs font-bold text-teal-300 transition-all hover:border-teal-500/40 hover:bg-teal-500/20 hover:text-white ${
					isExpanded ? "w-full px-3" : "h-10 w-10 justify-center"
				}`}
			>
				<Plus className="h-4 w-4 shrink-0 transition-transform group-hover:rotate-90" />
				{isExpanded ? (
					<span className="onest ">New Workspace</span>
				) : (
					<span className="onest pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs text-white shadow-xl group-hover:block">
						New Workspace
					</span>
				)}
			</button>

			<div
				className={`h-px bg-slate-800/80 ${isExpanded ? "w-full" : "w-8"}`}
			/>

			{/* Main Global Navigation */}
			<nav
				className={`display flex flex-col gap-1 ${isExpanded ? "w-full" : "items-center"}`}
			>
				<Link
					to="/dashboard"
					className={` flex items-center gap-3 rounded-xl py-2 text-xs font-medium transition-all ${
						isExpanded ? "w-full px-3" : "h-10 w-10 justify-center"
					} ${
						location.pathname === "/dashboard"
							? "border-l-2 border-teal-400 bg-gradient-to-r from-teal-500/20 to-transparent text-teal-300 font-bold"
							: "text-slate-400 hover:bg-slate-800/60 hover:text-white"
					}`}
				>
					<LayoutGrid className="h-4 w-4 shrink-0 text-slate-400" />
					{isExpanded ? <span>Dashboard</span> : null}
				</Link>

				<Link
					to="/my-work"
					className={`flex items-center gap-3 rounded-xl py-2 text-xs font-medium transition-all ${
						isExpanded ? "w-full px-3" : "h-10 w-10 justify-center"
					} ${
						location.pathname === "/my-work"
							? "border-l-2 border-teal-400 bg-gradient-to-r from-teal-500/20 to-transparent text-teal-300 font-bold"
							: "text-slate-400 hover:bg-slate-800/60 hover:text-white"
					}`}
				>
					<CheckSquare className="h-4 w-4 shrink-0 text-teal-400" />
					{isExpanded ? <span>My Work</span> : null}
				</Link>
			</nav>

			{/* Active Project Navigation (if inside a project) */}
			{currentWorkspaceId && (
				<>
					<div
						className={`h-px bg-slate-800/80 my-1 ${isExpanded ? "w-full" : "w-8"}`}
					/>
					{isExpanded && (
						<span className="display px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
							Active Project Views
						</span>
					)}
					<div
						className={`onest flex flex-col gap-1 ${isExpanded ? "w-full" : "items-center"}`}
					>
						<Link
							to={`/workspace/${currentWorkspaceId}`}
							className={`flex items-center gap-3 rounded-xl py-2 text-xs font-medium transition-all ${
								isExpanded ? "w-full px-3" : "h-10 w-10 justify-center"
							} ${
								location.pathname === `/workspace/${currentWorkspaceId}`
									? "border-l-2 border-teal-400 bg-gradient-to-r from-teal-500/20 to-transparent text-teal-300 font-bold"
									: "text-slate-400 hover:bg-slate-800/60 hover:text-white"
							}`}
						>
							<Kanban className="h-4 w-4 shrink-0 text-cyan-400" />
							{isExpanded ? <span>Kanban Board</span> : null}
						</Link>

						<Link
							to={`/workspace/${currentWorkspaceId}/sprints`}
							className={`flex items-center gap-3 rounded-xl py-2 text-xs font-medium transition-all ${
								isExpanded ? "w-full px-3" : "h-10 w-10 justify-center"
							} ${
								location.pathname.includes("/sprints")
									? "border-l-2 border-teal-400 bg-gradient-to-r from-teal-500/20 to-transparent text-teal-300 font-bold"
									: "text-slate-400 hover:bg-slate-800/60 hover:text-white"
							}`}
						>
							<Flame className="h-4 w-4 shrink-0 text-amber-400" />
							{isExpanded ? <span>Sprints & Burndown</span> : null}
						</Link>

						<Link
							to={`/workspace/${currentWorkspaceId}/dashboard`}
							className={`flex items-center gap-3 rounded-xl py-2 text-xs font-medium transition-all ${
								isExpanded ? "w-full px-3" : "h-10 w-10 justify-center"
							} ${
								location.pathname.includes("/dashboard") &&
								location.pathname !== "/dashboard"
									? "border-l-2 border-teal-400 bg-gradient-to-r from-teal-500/20 to-transparent text-teal-300 font-bold"
									: "text-slate-400 hover:bg-slate-800/60 hover:text-white"
							}`}
						>
							<BarChart3 className="h-4 w-4 shrink-0 text-emerald-400" />
							{isExpanded ? <span>Project Analytics</span> : null}
						</Link>

						<Link
							to={`/workspace/${currentWorkspaceId}/settings`}
							className={`flex items-center gap-3 rounded-xl py-2 text-xs font-medium transition-all ${
								isExpanded ? "w-full px-3" : "h-10 w-10 justify-center"
							} ${
								location.pathname.includes("/settings")
									? "border-l-2 border-teal-400 bg-gradient-to-r from-teal-500/20 to-transparent text-teal-300 font-bold"
									: "text-slate-400 hover:bg-slate-800/60 hover:text-white"
							}`}
						>
							<Settings className="h-4 w-4 shrink-0 text-violet-400" />
							{isExpanded ? <span>Settings & Team</span> : null}
						</Link>
					</div>
				</>
			)}

			<div
				className={`h-px bg-slate-800/80 my-1 ${isExpanded ? "w-full" : "w-8"}`}
			/>

			{/* Workspaces Scrollable List */}
			<div
				className={`flex-1 overflow-y-auto ${
					isExpanded ? "w-full" : "flex flex-col items-center gap-1"
				}`}
			>
				{isExpanded && (
					<span className="display mb-1.5 block px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
						Workspaces ({workspaces.length})
					</span>
				)}
				{workspaces.map((ws) => {
					const isActive = location.pathname.startsWith(`/workspace/${ws.id}`);
					return (
						<Link
							key={ws.id}
							to={`/workspace/${ws.id}`}
							className={`display group relative flex items-center gap-3 rounded-xl py-2 text-xs font-medium transition-all ${
								isExpanded ? "w-full px-3" : "h-10 w-10 justify-center"
							} ${
								isActive
									? "border-l-2 border-teal-400 bg-gradient-to-r from-teal-500/20 to-transparent text-teal-300"
									: "text-slate-400 hover:bg-slate-800/60 hover:text-white"
							}`}
						>
							<FolderKanban className="h-4 w-4 shrink-0 text-teal-500" />
							{isExpanded ? (
								<div className="flex flex-1 items-center justify-between min-w-0">
									<span className="truncate">{ws.name}</span>
									<span className="text-[10px] text-slate-500">
										{ws.tickets || 0}
									</span>
								</div>
							) : (
								<span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs text-white shadow-xl group-hover:block">
									{ws.name}
								</span>
							)}
						</Link>
					);
				})}
			</div>

			{/* Tools Quick Triggers */}
			<div
				className={`flex flex-col gap-1 ${isExpanded ? "w-full" : "items-center"}`}
			>
				<button
					type="button"
					onClick={() => setIsCommandPaletteOpen(true)}
					className={`flex items-center gap-3 rounded-xl py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${
						isExpanded ? "w-full px-3" : "h-9 w-9 justify-center"
					}`}
					title="Command Palette (Ctrl + K)"
				>
					<Command className="h-4 w-4 text-slate-400" />
					{isExpanded ? (
						<div className="display flex items-center justify-between flex-1">
							<span>Command Palette</span>
							<kbd className="text-[10px] bg-slate-900 px-1 rounded text-slate-500">
								⌘K
							</kbd>
						</div>
					) : null}
				</button>

				{/* Shortcuts Trigger */}
				<button
					type="button"
					onClick={() => setIsShortcutsOpen(true)}
					className={`display flex items-center gap-3 rounded-xl py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${
						isExpanded ? "w-full px-3" : "h-9 w-9 justify-center"
					}`}
					title="Keyboard Shortcuts (?)"
				>
					<HelpCircle className="h-4 w-4 text-slate-400" />
					{isExpanded ? (
						<div className="flex items-center justify-between flex-1">
							<span>Shortcuts</span>
							<kbd className="text-[10px] bg-slate-900 px-1 rounded text-slate-500">
								?
							</kbd>
						</div>
					) : null}
				</button>
			</div>

			{/* Footer: User Profile Badge & Logout */}
			<div
				className={`onest mt-auto flex flex-col gap-1 ${isExpanded ? "w-full" : "items-center"}`}
			>
				<div
					className={`h-px bg-slate-800/80 my-1 ${isExpanded ? "w-full" : "w-8"}`}
				/>

				<div
					className={`flex items-center justify-between py-2 ${
						isExpanded ? "w-full px-3" : "h-10 w-10 justify-center"
					}`}
				>
					<div className="flex items-center gap-2.5 min-w-0">
						<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 font-mono-ui text-xs font-bold text-white shadow-xs">
							{currentUserFirstName.slice(0, 2).toUpperCase()}
						</div>
						{isExpanded && (
							<div className="flex flex-1 flex-col min-w-0">
								<span className="truncate text-xs font-bold text-white">
									{user?.name || "Developer"}
								</span>
								<span className="flex items-center gap-1 text-[10px] text-slate-400">
									<ShieldCheck className="h-3 w-3 text-emerald-400" /> Agile
									Member
								</span>
							</div>
						)}
					</div>

					{isExpanded && (
						<button
							type="button"
							onClick={() => {
								logout();
								navigate("/");
							}}
							className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
							title="Log out"
						>
							<LogOut className="h-4 w-4" />
						</button>
					)}
				</div>
			</div>
		</aside>
	);
}
