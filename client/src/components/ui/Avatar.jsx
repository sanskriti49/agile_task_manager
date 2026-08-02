import React from "react";
import { PEOPLE, ONLINE_NOW } from "../../data/people";

// Map flat colors from constants to rich, premium gradients
const GRADIENT_MAP = {
	"bg-violet-500": "bg-gradient-to-br from-violet-500 to-fuchsia-600",
	"bg-sky-500": "bg-gradient-to-br from-sky-400 to-blue-600",
	"bg-emerald-500": "bg-gradient-to-br from-emerald-400 to-teal-600",
	"bg-indigo-500": "bg-gradient-to-br from-indigo-500 to-blue-700",
	"bg-slate-400": "bg-gradient-to-br from-slate-400 to-slate-600",
};

export default function Avatar({
	name,
	size = "h-7 w-7 text-[11px]",
	presence = false,
}) {
	const p = PEOPLE[name] || { initials: "?", color: "bg-slate-400" };
	const isOnline = presence && ONLINE_NOW.has(name);

	// Use gradient if mapped, otherwise fall back to the flat color
	const colorClass = GRADIENT_MAP[p.color] || p.color;

	return (
		<div className="relative shrink-0 group">
			<div
				className={`${size} ${colorClass} rounded-full flex items-center justify-center font-bold text-white ring-2 ring-white shadow-sm shadow-slate-400/50 ring-inset ring-white/20 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:shadow-md cursor-default`}
				title={name}
			>
				<span className="drop-shadow-sm tracking-tight">{p.initials}</span>
			</div>

			{/* Live Online Indicator with Ping Animation */}
			{isOnline && (
				<span className="absolute bottom-0 right-0 flex h-2.5 w-2.5 items-center justify-center">
					{/* The radiating ping */}
					<span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
					{/* The solid dot core */}
					<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
				</span>
			)}
		</div>
	);
}
