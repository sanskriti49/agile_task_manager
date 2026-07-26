import { X, Activity as ActivityIcon } from "lucide-react";
import { ACTIVITY_ICON } from "../../data/constants";

export default function ActivityDrawer({
	activity,
	activityOpen,
	setActivityOpen,
}) {
	return (
		<div
			className={`fixed top-0 right-0 h-full w-80 bg-white border-l border-slate-200 panel-elevated z-30 ease-premium transition-transform duration-300 ${
				activityOpen ? "translate-x-0" : "translate-x-full"
			}`}
			role="dialog"
			aria-label="Activity log"
		>
			<div className="h-1 brand-gradient" />
			<div className="h-16 border-b border-slate-200 flex items-center px-4 gap-2">
				<ActivityIcon className="h-4 w-4 text-indigo-600" />
				<span className="display font-semibold text-sm tracking-tight">
					Activity
				</span>
				<div className="flex-1" />
				<button
					onClick={() => setActivityOpen(false)}
					className="p-1 rounded hover:bg-slate-100 text-slate-400"
					aria-label="Close activity"
				>
					<X className="h-4 w-4" />
				</button>
			</div>
			<div className="overflow-y-auto h-[calc(100%-4.25rem)] px-4 py-3 space-y-4">
				{activity.map((a) => {
					const Icon = ACTIVITY_ICON[a.type];
					return (
						<div key={a.id} className="flex gap-2.5">
							<div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
								<Icon className="h-3.5 w-3.5 text-slate-500" />
							</div>
							<div className="min-w-0">
								<p className="text-xs text-slate-700 leading-snug">
									<span className="font-medium">{a.actor}</span>{" "}
									{a.type === "moved"
										? "moved"
										: a.type === "created"
											? "created"
											: "commented on"}{" "}
									<span className="font-medium">{a.ticketTitle}</span>
								</p>
								<p className="text-[11px] text-slate-400 mt-0.5 truncate">
									{a.detail}
								</p>
								<p className="mono text-[10px] text-slate-300 mt-0.5">
									{a.time}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
