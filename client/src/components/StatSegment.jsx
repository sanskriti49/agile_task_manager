import React from "react";

export function StatSegment({ icon: Icon, label, value, emphasized }) {
	return (
		<div
			className={`rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 sm:flex-1 sm:rounded-none sm:border-0 sm:px-5 sm:py-4 transition-colors ${
				emphasized
					? "bg-teal-50/50 sm:bg-teal-50/50 dark:bg-teal-950/40 sm:dark:bg-teal-950/40"
					: ""
			}`}
		>
			<div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
				<Icon className="h-3.5 w-3.5" />
				<span className="font-mono-ui text-xs font-semibold uppercase tracking-wide">
					{label}
				</span>
			</div>
			<p
				className={`font-mono-ui mt-1.5 text-2xl font-bold ${
					emphasized
						? "text-teal-600 dark:text-teal-400"
						: "text-slate-900 dark:text-slate-100"
				}`}
			>
				{value}
			</p>
		</div>
	);
}
