import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
	LayoutGrid,
	Settings,
	Plus,
	ChevronLeft,
	FolderKanban,
} from "lucide-react";
import SidebarIcon from "../ui/SidebarIcon";
import Avatar from "../ui/Avatar";
import { CURRENT_USER } from "../../data/constants";
import CreateWorkspaceModal from "../modals/CreateWorkspaceModal";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

const PRODUCT_NAME = "Flux";
const FOCUS_RING_DARK =
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

export default function Sidebar() {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const location = useLocation();

	const workspaces = useWorkspaceStore((state) => state.workspaces);

	return (
		<>
			<aside
				className={`relative z-40 flex h-full shrink-0 flex-col gap-2 bg-slate-950 py-4 transition-[width] duration-300 ease-premium ${
					isExpanded ? "w-64 items-stretch px-3" : "w-16 items-center px-0"
				}`}
			>
				<div
					className={`mb-3 flex items-center ${isExpanded ? "justify-between px-1" : "flex-col gap-2"}`}
				>
					<Link
						to="/dashboard"
						aria-label={`${PRODUCT_NAME} home`}
						className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500 transition-colors duration-200 ease-premium hover:bg-teal-400 ${FOCUS_RING_DARK}`}
					>
						<LayoutGrid className="h-4 w-4 text-white" strokeWidth={2.5} />
					</Link>

					{isExpanded && (
						<span className="display flex-1 truncate px-2 text-[15px] font-semibold text-white">
							{PRODUCT_NAME}
						</span>
					)}

					<button
						type="button"
						onClick={() => setIsExpanded((v) => !v)}
						aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
						className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors duration-200 ease-premium hover:bg-slate-800 hover:text-slate-200 ${FOCUS_RING_DARK}`}
					>
						<ChevronLeft
							className={`h-4 w-4 transition-transform duration-300 ease-premium ${isExpanded ? "" : "rotate-180"}`}
						/>
					</button>
				</div>

				<button
					type="button"
					onClick={() => setIsModalOpen(true)}
					aria-label="New workspace"
					className={`group relative mb-2 flex items-center gap-3 rounded-lg py-2.5 text-slate-300 ring-1 ring-slate-800 transition-colors duration-200 ease-premium hover:bg-slate-800 hover:text-white hover:ring-slate-700 ${FOCUS_RING_DARK} ${
						isExpanded ? "w-full px-3" : "h-10 w-10 justify-center"
					}`}
				>
					<Plus className="h-[18px] w-[18px] shrink-0" />
					{isExpanded ? (
						<span className="text-sm font-medium">New workspace</span>
					) : (
						<span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg ring-1 ring-slate-800 transition-all duration-200 ease-premium -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 z-40">
							New workspace
						</span>
					)}
				</button>

				<div className={`h-px bg-slate-800 ${isExpanded ? "w-full" : "w-8"}`} />

				<nav
					className={`flex flex-col gap-1 ${isExpanded ? "w-full" : "items-center"}`}
				>
					<Link
						to="/dashboard"
						className={`flex items-center gap-3 rounded-lg py-2.5 text-slate-400 transition-colors duration-200 ease-premium hover:bg-slate-800 hover:text-white ${FOCUS_RING_DARK} ${
							isExpanded ? "w-full px-3" : "h-10 w-10 justify-center"
						} ${location.pathname === "/dashboard" ? "bg-slate-800 text-white" : ""}`}
					>
						<LayoutGrid className="h-[18px] w-[18px] shrink-0" />
						{isExpanded && (
							<span className="text-sm font-medium">Dashboard</span>
						)}
					</Link>
				</nav>

				<div
					className={`h-px bg-slate-800 my-2 ${isExpanded ? "w-full" : "w-8"}`}
				/>

				<div
					className={`flex-1 overflow-y-auto ${isExpanded ? "w-full pr-1" : "flex flex-col items-center gap-1"}`}
				>
					{isExpanded && (
						<span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
							Workspaces
						</span>
					)}
					{workspaces.map((ws) => {
						const isActive = location.pathname === `/workspace/${ws.id}`;
						return (
							<Link
								key={ws.id}
								to={`/workspace/${ws.id}`}
								aria-label={ws.name}
								className={`group relative flex items-center gap-3 rounded-lg py-2.5 text-slate-400 transition-colors duration-200 ease-premium hover:bg-slate-800 hover:text-white ${
									isExpanded ? "w-full px-3" : "h-10 w-10 justify-center"
								} ${isActive ? "bg-slate-800 text-white" : ""}`}
							>
								<FolderKanban className="h-[18px] w-[18px] shrink-0" />
								{isExpanded ? (
									<span className="text-sm font-medium truncate">
										{ws.name}
									</span>
								) : (
									!isActive && (
										<span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg ring-1 ring-slate-800 transition-all duration-200 ease-premium -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 z-40">
											{ws.name}
										</span>
									)
								)}
							</Link>
						);
					})}
				</div>

				<div
					className={`flex flex-col gap-1 ${isExpanded ? "w-full" : "items-center"}`}
				>
					<div
						className={`my-1 h-px bg-slate-800 ${isExpanded ? "w-full" : "w-8"}`}
					/>
					<button
						className={`flex items-center gap-3 rounded-lg py-2.5 text-slate-400 transition-colors duration-200 ease-premium hover:bg-slate-800 hover:text-white w-full ${isExpanded ? "px-3" : "justify-center"}`}
					>
						<Settings className="h-[18px] w-[18px] shrink-0" />
						{isExpanded && (
							<span className="text-sm font-medium">Settings</span>
						)}
					</button>

					<div
						className={`flex items-center gap-3 py-2 ${isExpanded ? "w-full px-3" : "h-10 w-10 justify-center"}`}
					>
						<Avatar name={CURRENT_USER} />
						{isExpanded && (
							<div className="flex min-w-0 flex-col">
								<span className="truncate text-xs font-medium text-white">
									{CURRENT_USER}
								</span>
								<span className="text-[10px] text-slate-500">Free plan</span>
							</div>
						)}
					</div>
				</div>
			</aside>

			<CreateWorkspaceModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</>
	);
}
