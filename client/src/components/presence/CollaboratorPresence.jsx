import React from "react";
import { Users } from "lucide-react";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { avatarColor } from "../utils/avatarColor";

export default function CollaboratorPresence() {
	const collaborators = useWorkspaceStore((state) => state.onlineCollaborators) || [];

	if (collaborators.length === 0) return null;

	return (
		<div
			className="flex items-center gap-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 px-2.5 py-1 text-xs text-emerald-800 dark:text-emerald-300 font-mono-ui shadow-2xs"
			title={`${collaborators.length} team member(s) online`}
		>
			<span className="relative flex h-2 w-2">
				<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
				<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
			</span>

			<span className="font-semibold text-[11px] hidden sm:inline">
				{collaborators.length} online
			</span>

			{/* Avatars Strip */}
			<div className="flex items-center -space-x-1.5 ml-1">
				{collaborators.slice(0, 4).map((c) => {
					const initials = (c.name || "User")
						.split(" ")
						.slice(0, 2)
						.map((n) => n[0])
						.join("")
						.toUpperCase();

					return (
						<div
							key={c.id}
							className={`h-5 w-5 rounded-full ${avatarColor(
								c.name,
							)} flex items-center justify-center text-[9px] font-bold text-white ring-1.5 ring-white dark:ring-slate-900`}
							title={c.name}
						>
							{initials}
						</div>
					);
				})}
				{collaborators.length > 4 && (
					<div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300 ring-1.5 ring-white dark:ring-slate-900">
						+{collaborators.length - 4}
					</div>
				)}
			</div>
		</div>
	);
}
