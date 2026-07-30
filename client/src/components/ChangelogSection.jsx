import React, { useState } from "react";
import {
	Sparkles,
	Zap,
	Bug,
	Check,
	Copy,
	Heart,
	Rocket,
	Flame,
	GitPullRequest,
	Search,
	ChevronDown,
	ShieldCheck,
} from "lucide-react";

export const UPDATES = [
	{
		id: "v2.4.0",
		version: "v2.4.0",
		date: "Apr 24, 2025",
		tag: "Feature",
		icon: Sparkles,
		title: "GitHub Two-Way Sync",
		body: "Connect a repo and watch PRs automatically move tickets to 'In Review' and 'Done'. No more manual updates.",
		isLatest: true,
		reactions: { rocket: 142, heart: 89, fire: 56 },
		demoType: "github-sync",
		details: [
			"Automatic status transitions based on PR merge/open events",
			"Custom branch mapping rules for monorepos",
			"Bi-directional comment syncing between GitHub PRs and cards",
		],
	},
	{
		id: "v2.3.2",
		version: "v2.3.2",
		date: "Apr 10, 2025",
		tag: "Performance",
		icon: Zap,
		title: "Board render speed: 3x faster",
		body: "We virtualized the column lists. You can now open a workspace with 5,000 tickets without breaking a sweat.",
		reactions: { rocket: 98, heart: 114, fire: 72 },
		demoType: "perf-bar",
		details: [
			"DOM nodes reduced from ~25,000 to under 200 visible rows",
			"Zero drop in framerate during fast horizontal scrolling",
			"Memory consumption cut by 64% on large boards",
		],
	},
	{
		id: "v2.3.0",
		version: "v2.3.0",
		date: "Mar 28, 2025",
		tag: "Fix",
		icon: Bug,
		title: "Drag-and-drop on Safari",
		body: "Fixed an edge case where cards would snap back to their original position in Safari 17.",
		reactions: { rocket: 45, heart: 67, fire: 31 },
		demoType: "safari-fix",
		details: [
			"Resolved touch event preventDefault collision on iOS WebKit",
			"Eliminated drop-target ghost outline flickering",
			"Added haptic feedback for mobile drag gestures",
		],
	},
];

const TAG_CONFIG = {
	Feature: {
		badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
		nodeBg: "from-emerald-500 to-teal-500",
		glow: "shadow-[0_0_20px_rgba(16,185,129,0.25)]",
	},
	Performance: {
		badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
		nodeBg: "from-amber-500 to-orange-500",
		glow: "shadow-[0_0_20px_rgba(245,158,11,0.25)]",
	},
	Fix: {
		badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
		nodeBg: "from-indigo-500 to-purple-500",
		glow: "shadow-[0_0_20px_rgba(99,102,241,0.25)]",
	},
};

export function ChangelogSection() {
	const [activeTab, setActiveTab] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [copiedId, setCopiedId] = useState(null);
	const [reactionsState, setReactionsState] = useState(
		UPDATES.reduce(
			(acc, item) => ({ ...acc, [item.id]: { ...item.reactions } }),
			{},
		),
	);
	const [expandedCard, setExpandedCard] = useState(null);

	const filteredUpdates = UPDATES.filter((item) => {
		const matchesTab = activeTab === "All" || item.tag === activeTab;
		const matchesSearch =
			item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.version.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesTab && matchesSearch;
	});

	const handleCopy = (update) => {
		navigator.clipboard.writeText(
			`${update.version} (${update.date}) - ${update.title}: ${update.body}`,
		);
		setCopiedId(update.id);
		setTimeout(() => setCopiedId(null), 2000);
	};

	const handleReaction = (id, type) => {
		setReactionsState((prev) => ({
			...prev,
			[id]: { ...prev[id], [type]: prev[id][type] + 1 },
		}));
	};

	return (
		<section
			id="changelog"
			className="py-24 sm:py-32 relative transition-colors duration-500 overflow-hidden bg-slate-900 text-slate-100"
		>
			{/* Background dot-grid and glow */}
			<div className="absolute inset-0 dot-grid opacity-[0.06]" />
			<div className="absolute top-20 left-1/2 -translate-x-1/2 h-[300px] w-[600px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

			<div className="max-w-4xl mx-auto px-5 sm:px-8 relative z-10">
				{/* Header */}
				<div className="text-center max-w-2xl mx-auto">
					<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium tracking-wide shadow-sm backdrop-blur-md mb-4 bg-slate-800/50 border-white/10 text-teal-400">
						<span className="relative flex h-2 w-2">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
						</span>
						<span className="mono text-[11px] font-medium tracking-wide">
							SHIP LOG • WEEKLY RELEASES
						</span>
					</div>

					<h2 className="display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
						We ship every week.
					</h2>
					<p className="onest mt-4 text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl mx-auto">
						No surprise overhauls. Just constant, transparent, and high-velocity
						improvements.
					</p>

					{/* Interactive Controls Bar */}
					<div className="mt-8 flex flex-wrap items-center justify-between gap-4 p-2.5 rounded-2xl border bg-slate-800/50 backdrop-blur border-white/10 shadow-xl">
						<div className="onest flex items-center gap-1 overflow-x-auto p-1 bg-slate-900/50 rounded-xl text-xs font-medium">
							{["All", "Feature", "Performance", "Fix"].map((tab) => (
								<button
									key={tab}
									onClick={() => setActiveTab(tab)}
									className={`px-3 py-1.5 rounded-lg transition-all capitalize whitespace-nowrap ${
										activeTab === tab
											? "bg-slate-700 text-white shadow-sm font-semibold"
											: "text-slate-400 hover:text-slate-100"
									}`}
								>
									{tab === "All" ? "All Updates" : tab}
								</button>
							))}
						</div>

						<div className="relative">
							<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
							<input
								type="text"
								placeholder="Filter updates..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="mono pl-8 pr-3 py-1.5 text-xs rounded-xl border bg-slate-900/50 border-white/10 text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 w-36 sm:w-44 transition-all"
							/>
						</div>
					</div>
				</div>

				{/* Timeline Stream */}
				<div className="mt-16 relative">
					{/* Vertical Line */}
					<div className="absolute left-4 sm:left-1/2 top-4 bottom-4 w-1 sm:-translate-x-1/2 rounded-full overflow-hidden bg-white/10">
						<div className="w-full h-full bg-gradient-to-b from-teal-500 via-indigo-500 to-purple-500 animate-pulse" />
					</div>

					<div className="space-y-12 sm:space-y-16 relative">
						{filteredUpdates.map((update, index) => {
							const Icon = update.icon;
							const config = TAG_CONFIG[update.tag] || TAG_CONFIG.Feature;
							const isExpanded = expandedCard === update.id;
							const isEven = index % 2 === 0;

							return (
								<div
									key={update.id}
									className="relative flex flex-col sm:flex-row items-start group"
								>
									{/* Center Orb Node */}
									<div
										className={`absolute left-0 sm:left-1/2 sm:-translate-x-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 border-2 border-white/10 shadow-xl group-hover:scale-110 transition-all duration-300 ${config.glow}`}
									>
										<div
											className={`w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br ${config.nodeBg} text-white`}
										>
											<Icon className="h-4 w-4 drop-shadow" />
										</div>
									</div>

									{/* Bento Card Container */}
									<div
										className={`w-full pl-12 sm:pl-0 sm:w-1/2 ${isEven ? "sm:pr-14 sm:text-right" : "sm:pl-14 sm:ml-auto"}`}
									>
										<div
											className={`flex items-center gap-2 mb-2 ${isEven ? "sm:justify-end" : "sm:justify-start"}`}
										>
											{update.isLatest && (
												<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase tracking-wider animate-pulse">
													Latest Release
												</span>
											)}
											<span className="mono text-xs font-semibold text-slate-400">
												{update.version} • {update.date}
											</span>
										</div>

										<div className="rounded-2xl border p-5 text-left transition-all duration-300 shadow-lg relative overflow-hidden backdrop-blur-xl bg-slate-800/60 border-white/10 hover:border-white/20 hover:shadow-teal-500/10">
											<div
												className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.nodeBg} opacity-80`}
											/>

											<div className="flex items-center justify-between gap-2 mb-3">
												<span
													className={`onest inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${config.badge}`}
												>
													<Icon className="w-3 h-3" />
													{update.tag}
												</span>

												<button
													onClick={() => handleCopy(update)}
													className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors"
													title="Copy release note"
												>
													{copiedId === update.id ? (
														<span className="flex items-center gap-1 text-xs text-emerald-400">
															<Check className="w-3.5 h-3.5" /> Copied
														</span>
													) : (
														<Copy className="w-3.5 h-3.5" />
													)}
												</button>
											</div>

											<h3 className="display text-lg font-bold text-white tracking-tight group-hover:text-teal-400 transition-colors">
												{update.title}
											</h3>

											<p className="onest mt-2 text-sm text-slate-400 leading-relaxed">
												{update.body}
											</p>

											{/* Interactive Feature Demo Snippets */}
											{update.demoType === "github-sync" && (
												<div className="mt-4 p-3 rounded-xl bg-slate-900/50 border border-white/5 text-xs space-y-2">
													<div className="flex items-center justify-between text-slate-400 mono text-[11px]">
														<span className="flex items-center gap-1 text-purple-400">
															<GitPullRequest className="w-3.5 h-3.5" /> PR #428
															Merged
														</span>
														<span className="text-emerald-400 font-semibold">
															Auto-Synced ✓
														</span>
													</div>
													<div className="flex items-center gap-2 p-2 rounded bg-slate-950/60 border border-white/5">
														<span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
														<span className="text-slate-400 text-[11px]">
															Ticket #1049 moved to{" "}
														</span>
														<span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 mono text-[10px] border border-emerald-500/20">
															Done
														</span>
													</div>
												</div>
											)}

											{update.demoType === "perf-bar" && (
												<div className="mt-4 p-3 rounded-xl bg-slate-900/50 border border-white/5 text-xs">
													<div className="flex items-center justify-between text-slate-400 mb-1.5 mono text-[11px]">
														<span>Render Benchmark (5,000 cards)</span>
														<span className="text-amber-400 font-bold">
															3.1x Faster
														</span>
													</div>
													<div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
														<div className="bg-amber-500 h-full w-[92%] transition-all duration-1000 rounded-full" />
													</div>
												</div>
											)}

											{update.demoType === "safari-fix" && (
												<div className="mt-4 p-3 rounded-xl bg-slate-900/50 border border-white/5 text-xs flex items-center justify-between">
													<div className="flex items-center gap-2 text-slate-400">
														<ShieldCheck className="w-4 h-4 text-indigo-400" />
														<span>WebKit 17 Drag API Handlers</span>
													</div>
													<span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 mono text-[10px] font-bold border border-indigo-500/20">
														Verified
													</span>
												</div>
											)}

											{/* Collapsible Deep Dive */}
											{isExpanded && update.details && (
												<div className="mt-4 pt-3 border-t border-white/5 text-xs space-y-1.5">
													<span className="text-[11px] mono text-slate-500 uppercase tracking-wider block mb-1">
														Technical Notes:
													</span>
													{update.details.map((detail, idx) => (
														<div
															key={idx}
															className="flex items-start gap-2 text-slate-400"
														>
															<Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
															<span>{detail}</span>
														</div>
													))}
												</div>
											)}

											{/* Card Footer */}
											<div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
												<div className="flex items-center gap-1.5">
													<button
														onClick={() => handleReaction(update.id, "rocket")}
														className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/50 hover:bg-slate-700/50 text-slate-400 transition-colors"
													>
														<Rocket className="w-3 h-3 text-teal-400" />
														<span className="mono text-[11px]">
															{reactionsState[update.id]?.rocket}
														</span>
													</button>
													<button
														onClick={() => handleReaction(update.id, "heart")}
														className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/50 hover:bg-slate-700/50 text-slate-400 transition-colors"
													>
														<Heart className="w-3 h-3 text-rose-400" />
														<span className="mono text-[11px]">
															{reactionsState[update.id]?.heart}
														</span>
													</button>
													<button
														onClick={() => handleReaction(update.id, "fire")}
														className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/50 hover:bg-slate-700/50 text-slate-400 transition-colors"
													>
														<Flame className="w-3 h-3 text-amber-400" />
														<span className="mono text-[11px]">
															{reactionsState[update.id]?.fire}
														</span>
													</button>
												</div>

												<button
													onClick={() =>
														setExpandedCard(isExpanded ? null : update.id)
													}
													className="flex items-center gap-1 text-slate-400 hover:text-teal-400 font-medium text-[11px]"
												>
													<span>{isExpanded ? "Hide" : "Deep Dive"}</span>
													<ChevronDown
														className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
													/>
												</button>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
