import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { useAuthStore } from "../../store/useAuthStore";
import Logo from "../ui/Logo";

const FOCUS_RING_DARK =
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

export default function Sidebar() {
	const [isExpanded, setIsExpanded] = useState(true);

	const location = useLocation();
	const user = useAuthStore((state) => state.user);

	// Safe default arrays to prevent undefined filter crashes
	const workspaces = useWorkspaceStore((state) => state.workspaces) || [];
	const tickets = useWorkspaceStore((state) => state.tickets) || [];

	const setIsCreateWorkspaceModalOpen = useWorkspaceStore(
		(state) => state.setIsCreateWorkspaceModalOpen,
	);
	const setIsTimeTravelOpen = useWorkspaceStore(
		(state) => state.setIsTimeTravelOpen,
	);
	const setIsAiDecomposeOpen = useWorkspaceStore(
		(state) => state.setIsAiDecomposeOpen,
	);

	const currentUserFirstName = user?.name
		? user.name.split(" ")[0]
		: "Developer";
	const myAssignedTicketsCount = tickets.filter(
		(t) =>
			(t.assignee && t.assignee.includes(currentUserFirstName)) ||
			t.assigned_to === user?.id,
	).length;

	const mainNav = [
		{
			id: "dashboard",
			label: "Dashboard",
			icon: LayoutGrid,
			path: "/dashboard",
		},
		{
			id: "my-issues",
			label: "My Issues",
			icon: CheckSquare,
			path: "/dashboard",
			badge: myAssignedTicketsCount || 3,
		},
		{
			id: "analytics",
			label: "Sprint Analytics",
			icon: BarChart3,
			path: "/dashboard",
		},
	];

	const innovationNav = [
		{
			id: "ai-copilot",
			label: "AI Copilot",
			icon: Sparkles,
			action: () => setIsAiDecomposeOpen && setIsAiDecomposeOpen(true),
			gradient: "text-amber-300",
		},
		{
			id: "time-travel",
			label: "Audit Replay",
			icon: History,
			action: () => setIsTimeTravelOpen && setIsTimeTravelOpen(true),
			gradient: "text-teal-400",
		},
	];

	return (
		<aside
			className={`relative z-40 flex h-full shrink-0 flex-col gap-2 border-r border-slate-800/80 bg-slate-950/95 py-4 backdrop-blur-xl transition-[width] duration-300 ease-in-out ${
				isExpanded ? "w-64 px-3" : "w-16 items-center px-0"
			}`}
		>
			{/* Brand Header */}
			<div
				className={`mb-3 flex items-center ${isExpanded ? "justify-between px-1" : "flex-col gap-2"}`}
			>
				<div className="flex items-center gap-2.5">
					<Logo showText={false} />
					{isExpanded && (
						<div className="z-99 flex items-center gap-1.5">
							<span
								className={`text-xl font-extrabold tracking-wider uppercase transition-all duration-300`}
								style={{
									fontFamily: "'onest', system-ui, sans-serif",
								}}
							>
								<span
									className={`bg-clip-text text-transparent bg-gradient-to-r from-white via-teal-100 to-cyan-200`}
								>
									FLU
								</span>
								<span
									className={`bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-400 group-hover:from-cyan-300 group-hover:to-teal-300`}
								>
									X
								</span>
							</span>
						</div>
					)}
				</div>

				<button
					type="button"
					onClick={() => setIsExpanded((v) => !v)}
					aria-label={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
					className={`flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white ${FOCUS_RING_DARK}`}
				>
					<ChevronLeft
						className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "" : "rotate-180"}`}
					/>
				</button>
			</div>

			{/* New Workspace Trigger CTA */}
			<button
				type="button"
				onClick={() =>
					setIsCreateWorkspaceModalOpen && setIsCreateWorkspaceModalOpen(true)
				}
				className={`onest group relative mb-2 flex items-center gap-3 rounded-xl border border-teal-500/20 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 py-2.5 font-display text-xs font-bold text-teal-300 transition-all hover:border-teal-500/40 hover:bg-teal-500/20 hover:text-white ${FOCUS_RING_DARK} ${
					isExpanded ? "w-full px-3.5" : "h-10 w-10 justify-center"
				}`}
			>
				<Plus className="h-4 w-4 shrink-0 transition-transform group-hover:rotate-90" />
				{isExpanded ? (
					<span>New Workspace</span>
				) : (
					<span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-sm font-medium text-white shadow-xl ring-1 ring-slate-800 group-hover:block">
						New Workspace
					</span>
				)}
			</button>

			<div
				className={`h-px bg-slate-800/80 ${isExpanded ? "w-full" : "w-8"}`}
			/>

			{/* Core Navigation */}
			<nav
				className={`flex flex-col gap-1 ${isExpanded ? "w-full" : "items-center"}`}
			>
				{mainNav.map((item) => {
					const Icon = item.icon;
					const isActive =
						location.pathname === item.path && item.id === "dashboard";
					return (
						<Link
							key={item.id}
							to={item.path}
							className={`display group relative flex items-center gap-3 rounded-xl py-2.5 text-[13px] font-medium transition-all ${
								isExpanded ? "w-full px-3.5" : "h-10 w-10 justify-center"
							} ${
								isActive
									? "border-l-2 border-teal-400 bg-gradient-to-r from-teal-500/20 to-transparent text-teal-300"
									: "text-slate-400 hover:bg-slate-800/60 hover:text-white"
							}`}
						>
							<Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
							{isExpanded ? (
								<div className="flex flex-1 items-center justify-between">
									<span>{item.label}</span>
									{item.badge !== undefined && (
										<span className="rounded-full bg-slate-800 px-2 py-0.5 font-mono-ui text-[10px] font-bold text-slate-300">
											{item.badge}
										</span>
									)}
								</div>
							) : (
								<span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white shadow-xl ring-1 ring-slate-800 group-hover:block">
									{item.label}
								</span>
							)}
						</Link>
					);
				})}
			</nav>

			{/* Innovation Quick Triggers */}
			<div
				className={`h-px bg-slate-800/80 my-1 ${isExpanded ? "w-full" : "w-8"}`}
			/>
			{isExpanded && (
				<span className="onest px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
					AI & History Tools
				</span>
			)}
			<div
				className={`flex flex-col gap-1 ${isExpanded ? "w-full" : "items-center"}`}
			>
				{innovationNav.map((item) => {
					const Icon = item.icon;
					return (
						<button
							key={item.id}
							onClick={item.action}
							className={`display group relative flex items-center gap-3 rounded-xl py-2.5 text-[13px] font-medium text-slate-400 transition-all hover:bg-slate-800/60 hover:text-white ${
								isExpanded ? "w-full px-3.5" : "h-10 w-10 justify-center"
							}`}
						>
							<Icon className={`h-4 w-4 shrink-0 ${item.gradient}`} />
							{isExpanded ? (
								<span>{item.label}</span>
							) : (
								<span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white shadow-xl ring-1 ring-slate-800 group-hover:block">
									{item.label}
								</span>
							)}
						</button>
					);
				})}
			</div>

			<div
				className={`h-px bg-slate-800/80 my-1 ${isExpanded ? "w-full" : "w-8"}`}
			/>

			{/* Workspaces List */}
			<div
				className={`flex-1 overflow-y-auto ${isExpanded ? "w-full" : "flex flex-col items-center gap-1"}`}
			>
				{isExpanded && (
					<span className="onest mb-1.5 block px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
						Workspaces ({workspaces.length})
					</span>
				)}
				{workspaces.map((ws) => {
					const isActive = location.pathname === `/workspace/${ws.id}`;
					return (
						<Link
							key={ws.id}
							to={`/workspace/${ws.id}`}
							className={`display group relative flex items-center gap-3 rounded-xl py-2.5 text-[13px] font-medium transition-all ${
								isExpanded ? "w-full px-3.5" : "h-10 w-10 justify-center"
							} ${
								isActive
									? "border-l-2 border-teal-400 bg-gradient-to-r from-teal-500/20 to-transparent text-teal-300"
									: "text-slate-400 hover:bg-slate-800/60 hover:text-white"
							}`}
						>
							<FolderKanban className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110 text-teal-500" />
							{isExpanded ? (
								<div className="flex flex-1 items-center justify-between min-w-0">
									<span className="truncate">{ws.name}</span>
									<span className="font-mono-ui text-[10px] text-slate-500">
										{ws.tickets || 0}
									</span>
								</div>
							) : (
								<span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white shadow-xl ring-1 ring-slate-800 group-hover:block">
									{ws.name}
								</span>
							)}
						</Link>
					);
				})}
			</div>

			{/* Footer: User Profile Badge */}
			<div
				className={`mt-auto flex flex-col gap-1 ${isExpanded ? "w-full" : "items-center"}`}
			>
				<div
					className={`h-px bg-slate-800/80 my-1 ${isExpanded ? "w-full" : "w-8"}`}
				/>

				<div
					className={`flex items-center gap-3 py-2 ${isExpanded ? "w-full px-3.5" : "h-10 w-10 justify-center"}`}
				>
					<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-mono-ui text-xs font-bold text-white ring-2 ring-indigo-500/30">
						{currentUserFirstName.slice(0, 2).toUpperCase()}
					</div>
					{isExpanded && (
						<div className="flex flex-1 flex-col min-w-0">
							<span className="truncate text-xs font-bold text-white">
								{currentUserFirstName}
							</span>
							<span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono-ui">
								<ShieldCheck className="h-3 w-3 text-emerald-400" /> Lead
								Engineer
							</span>
						</div>
					)}
				</div>
			</div>
		</aside>
	);
}
