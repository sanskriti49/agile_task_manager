import React from "react";

const FOCUS_RING_DARK =
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

export default function SidebarIcon({
	icon: Icon,
	label,
	active = false,
	isExpanded,
	onClick,
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			aria-current={active ? "page" : undefined}
			className={`group relative flex items-center gap-3 rounded-lg py-2 transition-colors duration-200 ease-premium ${FOCUS_RING_DARK} ${
				isExpanded ? "w-full px-3" : "h-10 w-10 justify-center"
			} ${
				active
					? "bg-teal-500/10 text-teal-400"
					: "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
			}`}
		>
			{active && (
				<span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-teal-400" />
			)}
			<Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
			{isExpanded && (
				<span className="truncate text-sm font-medium">{label}</span>
			)}
			{!isExpanded && (
				<span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg ring-1 ring-slate-800 transition-all duration-200 ease-premium -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 z-40">
					{label}
				</span>
			)}
		</button>
	);
}
