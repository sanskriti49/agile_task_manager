// src/components/ui/BrandPanel.jsx

import { LayoutGrid } from "lucide-react";
import { PRODUCT_NAME } from "../../data/constants";
import { Link, NavLink } from "react-router-dom";
import Logo from "./Logo";

function MiniBoardPreview() {
	const cols = [
		{
			name: "Backlog",
			cards: [
				{
					id: "ENG-101",
					tag: "infra",
					tint: "bg-rose-50 text-rose-600 ring-rose-200",
				},
			],
		},
		{
			name: "In Progress",
			cards: [
				{
					id: "ENG-104",
					tag: "api",
					tint: "bg-teal-50 text-teal-600 ring-teal-200",
				},
				{
					id: "ENG-105",
					tag: "ui",
					tint: "bg-violet-50 text-violet-600 ring-violet-200",
				},
			],
		},
		{
			name: "Done",
			cards: [
				{
					id: "ENG-108",
					tag: "ship",
					tint: "bg-amber-50 text-amber-600 ring-amber-200",
				},
			],
		},
	];
	return (
		<div className="rounded-2xl ring-1 ring-white/10 bg-slate-800/60 backdrop-blur p-4">
			<div className="mb-3 flex items-center gap-2">
				<span className="h-2 w-2 rounded-full bg-rose-300/80" />
				<span className="h-2 w-2 rounded-full bg-amber-300/80" />
				<span className="h-2 w-2 rounded-full bg-teal-400/80" />
				<span className="font-mono-ui ml-2 text-[10px] text-slate-400">
					workspace / product-team
				</span>
			</div>
			<div className="grid grid-cols-3 gap-3">
				{cols.map((col) => (
					<div key={col.name}>
						<div className="mb-2 flex items-center gap-1.5">
							<span className="font-mono-ui text-[10px] text-slate-400">
								{col.name}
							</span>
							{col.name === "In Progress" && (
								<span className="flex items-center gap-1">
									<span className="relative flex h-1.5 w-1.5">
										<span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400 opacity-75" />
										<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
									</span>
								</span>
							)}
						</div>
						<div className="space-y-2">
							{col.cards.map((c) => (
								<div
									key={c.id}
									className="rounded-lg bg-white/[0.04] ring-1 ring-white/10 p-2.5"
								>
									<div className="font-mono-ui text-[10px] text-slate-500">
										{c.id}
									</div>
									<div className="mt-1.5 h-2 w-3/4 rounded bg-white/15" />
									<div className="mt-2 flex items-center justify-between">
										<span
											className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ring-1 ${c.tint}`}
										>
											{c.tag}
										</span>
										<span className="h-4 w-4 rounded-full bg-teal-600" />
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default function BrandPanel({ headline, sub }) {
	return (
		<div className="relative hidden h-full overflow-hidden bg-slate-900 lg:flex lg:flex-col lg:p-10">
			{/* backgrounds */}
			<div className="absolute inset-0 dot-grid opacity-[0.06]" />
			<div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />
			<div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-teal-700/10 blur-3xl" />

			<Logo
				to="/"
				showText={true}
				className="w-7 h-7 transition-transform duration-300 group-hover:scale-110"
			/>
			<div className="relative mt-12 flex-1">
				<h2 className="display text-3xl font-semibold text-white">
					{headline}
				</h2>
				<p className="inter mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
					{sub}
				</p>
				<div className="mt-7">
					<MiniBoardPreview />
				</div>
			</div>

			{/* 3. Footer — always at the bottom */}
			<div className="relative flex shrink-0 items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="flex -space-x-1.5">
						<span className="h-6 w-6 rounded-full bg-violet-500 ring-2 ring-slate-900" />
						<span className="h-6 w-6 rounded-full bg-sky-500 ring-2 ring-slate-900" />
						<span className="h-6 w-6 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
					</div>
					<span className="font-mono-ui text-[11px] text-slate-400">
						1,480 teams shipping this week
					</span>
				</div>
				<span className="font-mono-ui text-[11px] text-slate-500">
					2026 · live
				</span>
			</div>
		</div>
	);
}
