import React from "react";
import {
	X,
	Activity as ActivityIcon,
	ArrowRight,
	Plus,
	MessageSquare,
	Clock,
} from "lucide-react";

// Default Icon Map Fallback
const DEFAULT_ICONS = {
	moved: ArrowRight,
	created: Plus,
	commented: MessageSquare,
	STATUS_CHANGE: ArrowRight,
	TASK_CREATED: Plus,
	COMMENT_ADDED: MessageSquare,
};

export default function ActivityDrawer({
	activity = [], // FIX 1: Provide default empty array
	activityOpen,
	setActivityOpen,
}) {
	// Ensure activity is always an array
	const safeActivity = Array.isArray(activity) ? activity : [];

	return (
		<div
			className={`fixed top-0 right-0 h-full w-80 z-99 bg-white border-l border-slate-200 panel-elevated z-40 ease-premium transition-transform duration-300 ${
				activityOpen ? "translate-x-0" : "translate-x-full"
			}`}
			role="dialog"
			aria-label="Activity log"
		>
			<div className="h-1 brand-gradient" />
			<div className="h-16 border-b border-slate-200 flex items-center px-4 gap-2">
				<ActivityIcon className="h-4 w-4 text-indigo-600" />
				<span className="display font-semibold text-sm">Activity Log</span>
				<div className="flex-1" />
				<button
					onClick={() => setActivityOpen(false)}
					className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors"
					aria-label="Close activity"
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			<div className="overflow-y-auto h-[calc(100%-4.25rem)] px-4 py-3 space-y-4">
				{safeActivity.length === 0 ? (
					<div className="onest text-center py-10 text-slate-400 text-xs font-mono-ui">
						No activity recorded yet.
					</div>
				) : (
					safeActivity.map((a, index) => {
						// Support both legacy Mock formats and real MongoDB ActivityLog formats
						const actionType = a.action || a.type || "TASK_UPDATED";
						const Icon = DEFAULT_ICONS[actionType] || Clock;
						const actorName = a.userName || a.actor || "Team Member";
						const detailText = a.message || a.detail || "";
						const displayTime = a.createdAt
							? new Date(a.createdAt).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})
							: a.time || "Just now";

						return (
							<div key={a._id || a.id || index} className="flex gap-2.5">
								<div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
									<Icon className="h-3.5 w-3.5 text-slate-500" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-xs text-slate-700 leading-snug">
										<span className="font-medium text-slate-900">
											{actorName}
										</span>{" "}
										{actionType === "STATUS_CHANGE" || actionType === "moved"
											? "moved a ticket"
											: actionType === "TASK_CREATED" ||
												  actionType === "created"
												? "created a ticket"
												: actionType === "COMMENT_ADDED" ||
													  actionType === "commented"
													? "commented on"
													: "updated"}
									</p>
									{detailText && (
										<p className="text-[11px] text-slate-500 mt-0.5 truncate">
											{detailText}
										</p>
									)}
									<p className="font-mono-ui text-[10px] text-slate-400 mt-0.5">
										{displayTime}
									</p>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
