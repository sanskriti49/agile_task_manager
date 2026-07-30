import {
	LayoutGrid,
	Users,
	Activity,
	PanelRight,
	MessageSquare,
	GripVertical,
	Check,
} from "lucide-react";
import BoardPreview from "../components/ui/BoardPreview";

function WorkspaceSection() {
	return (
		<section
			id="workflow"
			className="scroll-mt-24 py-24 sm:py-32 bg-slate-900 relative overflow-hidden"
		>
			<div className="absolute inset-0 dot-grid opacity-[0.06]" />

			<div className="absolute top-20 left-1/2 -translate-x-1/2 h-[300px] w-[600px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

			<div className="relative max-w-6xl mx-auto px-5 sm:px-8">
				<div className="max-w-xl">
					<span className="mono inline-flex items-center gap-2 text-[11px] font-medium tracking-wide text-teal-400">
						<span className="relative flex h-1.5 w-1.5">
							<span className="pulse-dot absolute inline-flex h-1.5 w-1.5 rounded-full bg-teal-400" />
							<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-500" />
						</span>
						THE WHOLE WORKSPACE
					</span>
					<h2 className="display mt-3 text-3xl sm:text-4xl font-semibold text-white tracking-tight">
						One screen. Sidebar, board, and detail, all in sync.
					</h2>
					<p className="onest mt-4 text-slate-400 leading-relaxed">
						No modals stacked on modals. Open a ticket and the panel slides in
						beside the board you were just looking at.
					</p>
				</div>

				{/* <div className="mt-14 relative rounded-2xl ring-1 ring-white/10 bg-slate-950/60 backdrop-blur overflow-hidden shadow-2xl shadow-teal-900/20">
					<div className="flex items-center justify-between px-4 h-10 border-b border-white/10 bg-slate-900/80">
						<div className="flex items-center gap-2">
							<div className="h-2.5 w-2.5 rounded-full bg-rose-400/80"></div>
							<div className="h-2.5 w-2.5 rounded-full bg-amber-400/80"></div>
							<div className="h-2.5 w-2.5 rounded-full bg-teal-400/80"></div>
						</div>
						<span className="mono text-[11px] text-slate-500">
							workspace / ecommerce-app
						</span>
						<div className="w-12"></div>
					</div>

					<div className="flex h-[440px]">
						<div className="hidden sm:flex w-16 flex-col items-center gap-4 py-6 border-r border-white/10 bg-slate-900/40">
							<div className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
								<LayoutGrid className="h-4 w-4 text-white" />
							</div>
							<div className="w-8 h-px bg-white/5 my-1"></div>
							{[Users, Activity, PanelRight].map((Icon, idx) => (
								<div
									key={idx}
									className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-teal-400 hover:bg-white/5 transition-colors cursor-pointer"
								>
									<Icon className="h-4 w-4" />
								</div>
							))}
							<div className="mt-auto h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 ring-2 ring-slate-900 flex items-center justify-center text-[10px] font-semibold text-white">
								SG
							</div>
						</div>

						<div className="flex-1 grid grid-cols-2 gap-4 p-5 min-w-0 overflow-hidden">
							<div className="flex flex-col">
								<div className="flex items-center gap-2 mb-3 px-1">
									<span className="h-2 w-2 rounded-full bg-rose-400"></span>
									<h4 className="mono text-[11px] font-medium text-slate-300 uppercase tracking-wide">
										Backlog
									</h4>
									<span className="mono text-[10px] text-slate-500 bg-white/5 px-1.5 rounded-full">
										4
									</span>
								</div>
								<div className="space-y-3">
									<div className="group rounded-lg bg-slate-800/80 ring-1 ring-white/5 p-3 hover:ring-white/10 transition-all hover:-translate-y-0.5 cursor-pointer">
										<div className="flex items-center justify-between mb-2">
											<span className="mono text-[10px] text-slate-500">
												ENG-101
											</span>
											<GripVertical className="h-3.5 w-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition" />
										</div>
										<p className="text-[13px] font-medium text-slate-200 leading-tight">
											Refactor auth flow for SSO
										</p>
										<div className="mt-3 flex items-center justify-between">
											<span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
												bug
											</span>
											<div className="h-5 w-5 rounded-full bg-indigo-500 ring-2 ring-slate-800 flex items-center justify-center text-[9px] text-white font-bold">
												AC
											</div>
										</div>
									</div>

									<div className="group rounded-lg bg-slate-800/80 ring-1 ring-white/5 p-3 hover:ring-white/10 transition-all hover:-translate-y-0.5 cursor-pointer">
										<div className="flex items-center justify-between mb-2">
											<span className="mono text-[10px] text-slate-500">
												ENG-102
											</span>
											<GripVertical className="h-3.5 w-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition" />
										</div>
										<p className="text-[13px] font-medium text-slate-200 leading-tight">
											Update API rate limits
										</p>
										<div className="mt-3 flex items-center justify-between">
											<span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
												api
											</span>
											<div className="flex items-center gap-1.5">
												<MessageSquare className="h-3 w-3 text-slate-500" />
												<span className="mono text-[10px] text-slate-500">
													2
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="flex flex-col">
								<div className="flex items-center gap-2 mb-3 px-1">
									<span className="relative flex h-2 w-2">
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
										<span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
									</span>
									<h4 className="mono text-[11px] font-medium text-slate-300 uppercase tracking-wide">
										In Progress
									</h4>
									<span className="mono text-[10px] text-slate-500 bg-white/5 px-1.5 rounded-full">
										2
									</span>
								</div>
								<div className="space-y-3">
									<div className="rounded-lg bg-slate-800/80 ring-1 ring-teal-500/30 p-3 shadow-lg shadow-teal-500/5 cursor-pointer">
										<div className="flex items-center justify-between mb-2">
											<span className="mono text-[10px] text-teal-400">
												ENG-104
											</span>
											<GripVertical className="h-3.5 w-3.5 text-slate-600" />
										</div>
										<p className="text-[13px] font-medium text-white leading-tight">
											Build checkout UI components
										</p>
										<div className="mt-3 flex items-center justify-between">
											<div className="flex gap-1">
												<span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20">
													ui
												</span>
												<span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
													urgent
												</span>
											</div>
											<div className="flex -space-x-1">
												<div className="h-5 w-5 rounded-full bg-emerald-500 ring-2 ring-slate-800 flex items-center justify-center text-[9px] text-white font-bold">
													PN
												</div>
												<div className="h-5 w-5 rounded-full bg-sky-500 ring-2 ring-slate-800 flex items-center justify-center text-[9px] text-white font-bold">
													RM
												</div>
											</div>
										</div>
									</div>

									<div className="group rounded-lg bg-slate-800/80 ring-1 ring-white/5 p-3 hover:ring-white/10 transition-all hover:-translate-y-0.5 cursor-pointer">
										<div className="flex items-center justify-between mb-2">
											<span className="mono text-[10px] text-slate-500">
												ENG-105
											</span>
											<GripVertical className="h-3.5 w-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition" />
										</div>
										<p className="text-[13px] font-medium text-slate-200 leading-tight">
											Database schema migration
										</p>
										<div className="mt-3 flex items-center justify-between">
											<span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/20 text-slate-400 ring-1 ring-slate-500/30">
												infra
											</span>
											<div className="h-5 w-5 rounded-full bg-rose-500 ring-2 ring-slate-800 flex items-center justify-center text-[9px] text-white font-bold">
												SG
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="hidden lg:flex w-72 flex-col border-l border-white/10 bg-slate-900/60 overflow-hidden">
							<div className="p-5 border-b border-white/5">
								<div className="flex items-center justify-between mb-3">
									<span className="mono text-[11px] text-teal-400">
										ENG-104
									</span>
									<span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20">
										In Progress
									</span>
								</div>
								<h3 className="display text-base font-semibold text-white">
									Build checkout UI components
								</h3>
								<div className="mt-3 flex items-center gap-3">
									<div className="flex items-center gap-1.5">
										<div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] text-white font-bold">
											PN
										</div>
										<span className="text-xs text-slate-400">Priya N.</span>
									</div>
									<span className="text-slate-600">·</span>
									<span className="mono text-[11px] text-slate-500">
										Due Apr 24
									</span>
								</div>
							</div>

							<div className="p-5 space-y-4 flex-1 overflow-y-auto">
								<div>
									<p className="mono text-[10px] uppercase tracking-wide text-slate-500 mb-1.5">
										Description
									</p>
									<div className="space-y-1.5">
										<div className="h-2 w-full rounded bg-white/5"></div>
										<div className="h-2 w-5/6 rounded bg-white/5"></div>
										<div className="h-2 w-2/3 rounded bg-white/5"></div>
									</div>
								</div>

								<div>
									<p className="mono text-[10px] uppercase tracking-wide text-slate-500 mb-2">
										Subtasks (1/2)
									</p>
									<div className="space-y-2.5">
										<div className="flex items-center gap-2">
											<span className="h-3.5 w-3.5 rounded bg-teal-500 flex items-center justify-center">
												<Check
													className="h-2.5 w-2.5 text-white"
													strokeWidth={3}
												/>
											</span>
											<span className="text-xs text-slate-500 line-through">
												Build Button component
											</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="h-3.5 w-3.5 rounded border border-slate-600"></span>
											<span className="text-xs text-slate-300">
												Add form validation
											</span>
										</div>
									</div>
								</div>
							</div>

							<div className="p-5 border-t border-white/5 bg-slate-950/40">
								<p className="mono text-[10px] uppercase tracking-wide text-slate-500 mb-2">
									Activity
								</p>
								<div className="flex items-start gap-2">
									<div className="h-5 w-5 rounded-full bg-violet-500 mt-0.5 shrink-0 flex items-center justify-center text-[9px] text-white font-bold">
										AC
									</div>
									<div className="flex-1">
										<p className="text-xs text-slate-300">
											<span className="font-medium text-white">Aria</span> moved
											this to In Progress
										</p>
										<p className="mono text-[10px] text-slate-500 mt-0.5">
											2m ago
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div> */}
				<div className="mt-14 sm:mt-18 max-w-5xl mx-auto">
					<BoardPreview />
				</div>
			</div>
		</section>
	);
}

export default WorkspaceSection;
