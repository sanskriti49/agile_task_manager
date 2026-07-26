import { ArrowRight, GripVertical, MessageSquare } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { BOARD_DATA, TAG_STYLES } from "../data/constants";

const TicketCard = memo(function TicketCard({ ticket, index, flashed }) {
	return (
		<div
			// 🚀 PERF: Use transition-transform instead of transition-all to avoid repainting shadows/borders on hover
			className={
				"group rounded-xl bg-white ring-1 ring-slate-200/80 p-3 card-elevated card-enter transition-transform ease-premium duration-300 hover:-translate-y-0.5 " +
				(ticket.justMoved && flashed ? " drop-flash" : "")
			}
			style={{ animationDelay: `${index * 70}ms`, willChange: "transform" }}
		>
			<div className="flex items-start justify-between gap-2">
				<span className="mono text-[11px] tracking-wide text-slate-400">
					{ticket.id}
				</span>
				<GripVertical className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
			</div>
			<p className="mt-1.5 text-[13px] leading-snug text-slate-700 font-medium">
				{ticket.title}
			</p>
			<div className="mt-3 flex items-center justify-between">
				<span
					className={
						"px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 " +
						TAG_STYLES[ticket.tag]
					}
				>
					{ticket.tag}
				</span>
				<div className="flex items-center gap-2">
					{ticket.comments > 0 && (
						<span className="flex items-center gap-1 text-[11px] text-slate-400">
							<MessageSquare className="h-3 w-3" />
							{ticket.comments}
						</span>
					)}
					<span
						className={
							"h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-semibold text-white " +
							ticket.assignee.color
						}
					>
						{ticket.assignee.initials}
					</span>
				</div>
			</div>
		</div>
	);
});

function BoardPreview() {
	const [flashed, setFlashed] = useState(false);

	useEffect(() => {
		const t = setTimeout(() => setFlashed(true), 1400);
		return () => clearTimeout(t);
	}, []);

	const columns = Object.entries(BOARD_DATA);
	const order = {};
	let i = 0;
	columns.forEach(([, tickets]) => {
		tickets.forEach((ticket) => {
			order[ticket.id] = i;
			i += 1;
		});
	});

	return (
		<div className="board-preview panel-elevated rounded-2xl bg-white/95 ring-1 ring-slate-200/70 p-4 sm:p-5">
			<div className="flex items-center justify-between px-1 pb-4">
				<div className="flex items-center gap-2">
					<div className="h-2.5 w-2.5 rounded-full bg-rose-300" />
					<div className="h-2.5 w-2.5 rounded-full bg-amber-300" />
					<div className="h-2.5 w-2.5 rounded-full bg-teal-400" />
				</div>
				<span className="mono text-[11px] text-slate-400">
					workspace / product-team
				</span>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				{columns.map(([column, tickets]) => (
					<div key={column} className="min-w-0">
						<div className="flex items-center gap-2 px-1 pb-2.5">
							<h4 className="display text-[13px] font-semibold text-slate-700">
								{column}
							</h4>
							<span className="mono text-[10px] text-slate-400">
								{tickets.length}
							</span>
							{column === "In Progress" && (
								<span className="ml-auto flex items-center gap-1.5">
									<span className="relative flex h-2 w-2">
										<span className="pulse-dot absolute inline-flex h-2 w-2 rounded-full bg-emerald-400" />
										<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
									</span>
									<span className="text-[10px] font-medium text-emerald-600">
										Live
									</span>
								</span>
							)}
						</div>
						<div className="space-y-2.5">
							{tickets.map((ticket) => (
								<TicketCard
									key={ticket.id}
									ticket={ticket}
									index={order[ticket.id]}
									flashed={flashed}
								/>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
export default function Hero({ PRODUCT_NAME, onGetStarted, FOCUS_RING }) {
	return (
		<section
			id="product"
			className="relative pt-10 pb-14 sm:pt-18 sm:pb-12 dot-grid overflow-hidden"
		>
			<div className="absolute inset-0 bg-gradient-to-b from-white via-white/60 to-slate-50 pointer-events-none" />
			<div className="relative max-w-6xl mx-auto px-5 sm:px-8">
				<div className="grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
					<div className="max-w-2xl">
						<span className="hero-badge mono inline-flex items-center gap-2 rounded-full bg-teal-50 ring-1 ring-teal-200 px-3 py-1 text-[11px] font-medium text-teal-700 tracking-wide">
							<span className="relative flex h-1.5 w-1.5">
								<span className="pulse-dot absolute inline-flex h-1.5 w-1.5 rounded-full bg-teal-400" />
								<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-500" />
							</span>
							WORKSPACES, LIVE
						</span>
						<h1 className="hero-title display mt-6 text-[2.75rem] sm:text-6xl font-semibold tracking-tight text-slate-900 leading-[1.05]">
							Move a card.
							<br />
							Everyone sees it <span className="text-teal-500">move.</span>
						</h1>
						<p className="onest hero-desc mt-6 text-lg text-slate-500 leading-relaxed max-w-lg">
							{PRODUCT_NAME} is the board for teams who'd rather ship than sit
							in status meetings. Drag a ticket, and the whole workspace updates
							before you let go of the mouse.
						</p>
						<div className="onest hero-actions mt-9 flex flex-wrap items-center gap-4">
							<button
								onClick={onGetStarted}
								className={`group inline-flex items-center gap-2 rounded-full bg-teal-500 hover:bg-teal-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition duration-300 ease-premium hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5 ${FOCUS_RING}`}
							>
								Create a workspace
								<ArrowRight className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-0.5" />
							</button>
							<a
								href="#features"
								className={`text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-md px-3 py-2 ${FOCUS_RING}`}
							>
								See how it works
							</a>
						</div>
					</div>

					<div className="hero-image relative hidden lg:block">
						{/* 🚀 PERF: Add width/height to prevent layout shift & fetchpriority for faster LCP */}
						<img
							src="/images/hero.png"
							alt=""
							className="w-full h-auto rounded-2xl"
							width={600}
							height={450}
							fetchpriority="high"
						/>
					</div>
				</div>

				{/* 🚀 PERF: Added will-change to hint the browser about the GSAP parallax animation */}
				<div
					className="hero-board mt-16 sm:mt-20"
					style={{ willChange: "transform" }}
				>
					<BoardPreview />
				</div>
			</div>
		</section>
	);
}
