// import React, { useState, useMemo, useEffect } from "react";
// import {
// 	Plus,
// 	ArrowRight,
// 	Search,
// 	LayoutGrid,
// 	Ticket,
// 	Users,
// 	Activity,
// 	FolderKanban,
// 	Clock,
// 	Sparkles,
// 	Loader2,
// } from "lucide-react";
// import { Link } from "react-router-dom";
// import { ACTIVITY_ICON, initialActivity } from "../data/constants";
// import { workspaceMeta } from "../components/utils/workspaceMeta";
// import PulseStrip from "../components/PulseStrip";
// import SegmentedMeter from "../components/SegmentedMeter.jsx";
// import MemberAvatar from "../components/MemberAvatar";
// import { useWorkspaceStore } from "../store/useWorkspaceStore";
// import { useAuthStore } from "../store/useAuthStore";
// import { StatSegment } from "../components/StatSegment";
// import { PEOPLE_NAMES } from "../data/people";
// import { activityText } from "../data/activity.jsx";
// import CreateWorkspaceModal from "../components/modals/CreateWorkspaceModal.jsx";

// const FOCUS_RING =
// 	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2";

// function ActivityLogItem({ item, isLast }) {
// 	const style =
// 		{
// 			moved: "bg-amber-50 text-amber-600",
// 			created: "bg-violet-50 text-violet-600",
// 			commented: "bg-teal-50 text-teal-600",
// 		}[item.type] || "bg-stone-100 text-stone-500";
// 	const Icon = ACTIVITY_ICON[item.type] || Clock;

// 	return (
// 		<div className="flex gap-3">
// 			<div className="flex flex-col items-center">
// 				<span
// 					className={`z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${style}`}
// 				>
// 					<Icon className="h-3 w-3" />
// 				</span>
// 				{!isLast && <span className="mt-1 w-px flex-1 bg-stone-200" />}
// 			</div>
// 			<div className="min-w-0 flex-1 pb-5">
// 				<p className="text-sm leading-snug text-stone-600">
// 					<span className="font-medium text-stone-900">{item.actor}</span>{" "}
// 					{activityText(item)}
// 				</p>
// 				<p className="font-mono-ui mt-1 text-xs text-stone-400">{item.time}</p>
// 			</div>
// 		</div>
// 	);
// }

// function WorkspaceCard({ ws }) {
// 	const {
// 		progress,
// 		active,
// 		palette,
// 		monogram,
// 		lastActivity,
// 		pulse,
// 		memberNames,
// 	} = workspaceMeta(ws);
// 	return (
// 		<Link
// 			key={ws.id}
// 			to={`/workspace/${ws.id}`}
// 			aria-label={ws.name}
// 			className={`group flex flex-col rounded-lg border border-stone-200 bg-white p-5 transition-colors hover:border-teal-600 ${FOCUS_RING}`}
// 		>
// 			<div className="flex items-start justify-between">
// 				<div className="flex items-center gap-3">
// 					<div
// 						className={`font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-semibold ${palette.tint} ${palette.text}`}
// 					>
// 						{monogram}
// 					</div>
// 					<div>
// 						<h3 className="font-display text-base font-semibold text-stone-900">
// 							{ws.name}
// 						</h3>
// 						<p className="font-mono-ui mt-0.5 flex items-center gap-1.5 text-xs text-stone-400">
// 							<span className={`h-1.5 w-1.5 rounded-full ${palette.dot}`} />
// 							{lastActivity
// 								? `updated ${lastActivity.time}`
// 								: "no recent activity"}
// 						</p>
// 					</div>
// 				</div>
// 				<ArrowRight className="h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600" />
// 			</div>

// 			<div className="font-mono-ui mt-4 flex items-baseline gap-1.5 text-sm">
// 				<span className="font-semibold text-amber-600">{active}</span>
// 				<span className="text-stone-400">active</span>
// 				<span className="text-stone-300">/</span>
// 				<span className="font-semibold text-stone-700">{ws.tickets}</span>
// 				<span className="text-stone-400">total</span>
// 			</div>

// 			<div className="mt-4">
// 				<div className="mb-1.5 flex items-center justify-between">
// 					<span className="text-xs font-medium text-stone-500">Completion</span>
// 					<span className="font-mono-ui text-xs font-semibold text-stone-900">
// 						{progress}%
// 					</span>
// 				</div>
// 				<SegmentedMeter progress={progress} palette={palette} />
// 			</div>

// 			<div className="mt-4 flex items-end justify-between">
// 				<div>
// 					<p className="font-mono-ui mb-1 text-xs uppercase tracking-wide text-stone-300">
// 						Last 10 days
// 					</p>
// 					<PulseStrip pulse={pulse} palette={palette} />
// 				</div>
// 				<div className="flex items-center gap-2">
// 					<div className="flex -space-x-1.5">
// 						{memberNames.map((name) => (
// 							<MemberAvatar key={name} name={name} />
// 						))}
// 					</div>
// 					<span className="font-mono-ui text-xs text-stone-400">
// 						{memberNames.length} members
// 					</span>
// 				</div>
// 			</div>
// 		</Link>
// 	);
// }

// function FeaturedBanner({ ws }) {
// 	const { progress, active, palette, monogram, lastActivity, memberNames } =
// 		workspaceMeta(ws);
// 	return (
// 		<a
// 			href="#"
// 			onClick={(e) => e.preventDefault()}
// 			className={`group relative flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white p-6 transition-colors hover:border-teal-600 sm:p-8 ${FOCUS_RING}`}
// 		>
// 			<span
// 				className={`font-display pointer-events-none absolute -right-4 -top-6 select-none text-9xl font-bold leading-none opacity-5 ${palette.text}`}
// 			>
// 				{monogram}
// 			</span>

// 			<div className="relative flex items-start justify-between">
// 				<div>
// 					<span className="font-mono-ui flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-teal-700">
// 						<Sparkles className="h-3.5 w-3.5" />
// 						Continue where you left off
// 					</span>
// 					<h3 className="font-display mt-2 text-xl font-semibold text-stone-900">
// 						{ws.name}
// 					</h3>
// 					<p className="font-mono-ui mt-1 text-xs text-stone-400">
// 						{lastActivity
// 							? `${lastActivity.actor} ${activityLabel(lastActivity)} · ${lastActivity.time}`
// 							: "No recent activity"}
// 					</p>
// 				</div>
// 				<ArrowRight className="h-5 w-5 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600" />
// 			</div>

// 			<div className="relative mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
// 				<div className="font-mono-ui flex gap-8">
// 					<div>
// 						<p className="text-xs text-stone-400">Active</p>
// 						<p className="text-2xl font-semibold text-amber-600">{active}</p>
// 					</div>
// 					<div>
// 						<p className="text-xs text-stone-400">Total</p>
// 						<p className="text-2xl font-semibold text-stone-800">
// 							{ws.tickets}
// 						</p>
// 					</div>
// 					<div>
// 						<p className="text-xs text-stone-400">Members</p>
// 						<div className="mt-1 flex -space-x-1.5">
// 							{memberNames.map((name) => (
// 								<MemberAvatar key={name} name={name} size="h-7 w-7" />
// 							))}
// 						</div>
// 					</div>
// 				</div>
// 				<div className="w-full sm:max-w-xs">
// 					<div className="mb-1.5 flex items-center justify-between">
// 						<span className="text-xs font-medium text-stone-500">
// 							Completion
// 						</span>
// 						<span className="font-mono-ui text-xs font-semibold text-stone-900">
// 							{progress}%
// 						</span>
// 					</div>
// 					<SegmentedMeter progress={progress} palette={palette} segments={16} />
// 				</div>
// 			</div>
// 		</a>
// 	);
// }

// function activityLabel(item) {
// 	if (item.type === "moved") return "moved a ticket";
// 	if (item.type === "created") return "opened a ticket";
// 	if (item.type === "commented") return "commented";
// 	return "updated a ticket";
// }

// function NewWorkspaceTile() {
// 	const workspaces = useWorkspaceStore((state) => state.workspaces);

// 	// Subscribe to store state & setter
// 	const isCreateWorkspaceModalOpen = useWorkspaceStore(
// 		(state) => state.isCreateWorkspaceModalOpen,
// 	);
// 	const setIsCreateWorkspaceModalOpen = useWorkspaceStore(
// 		(state) => state.setIsCreateWorkspaceModalOpen,
// 	);

// 	return (
// 		<button
// 			type="button"
// 			onClick={() => setIsCreateWorkspaceModalOpen(true)}
// 			className={`group flex min-h-60 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-5 text-stone-400 transition-colors hover:border-teal-600 hover:bg-teal-50 hover:text-teal-700 ${FOCUS_RING}`}
// 		>
// 			<div className="flex h-10 w-10 items-center justify-center rounded-md border border-stone-300 transition-colors group-hover:border-teal-600 group-hover:bg-white">
// 				<Plus className="h-5 w-5" />
// 			</div>
// 			<span className="font-mono-ui text-xs font-medium uppercase tracking-wide">
// 				New workspace
// 			</span>
// 		</button>
// 	);
// }

// function EmptyState() {
// 	return (
// 		<div className="rounded-lg border border-stone-200 bg-white py-16 text-center">
// 			<FolderKanban className="mx-auto mb-4 h-10 w-10 text-stone-300" />
// 			<h3 className="font-display text-lg font-semibold text-stone-700">
// 				No workspaces yet
// 			</h3>
// 			<p className="mt-1 text-sm text-stone-500">
// 				Create your first workspace to get started.
// 			</p>
// 		</div>
// 	);
// }

// export default function WorkspacesDashboard() {
// 	const user = useAuthStore((state) => state.user);
// 	const workspaces = useWorkspaceStore((state) => state.workspaces);

// 	// Subscribe to store state & setter
// 	const isCreateWorkspaceModalOpen = useWorkspaceStore(
// 		(state) => state.isCreateWorkspaceModalOpen,
// 	);
// 	const setIsCreateWorkspaceModalOpen = useWorkspaceStore(
// 		(state) => state.setIsCreateWorkspaceModalOpen,
// 	);

// 	const fetchWorkspaces = useWorkspaceStore((state) => state.fetchWorkspaces);
// 	const loading = useWorkspaceStore((state) => state.loading);

// 	const [search, setSearch] = useState("");
// 	const [isModalOpen, setIsModalOpen] = useState(false);

// 	useEffect(() => {
// 		fetchWorkspaces();
// 	}, [fetchWorkspaces]);

// 	const currentUserFirstName = user?.name
// 		? user.name.split(" ")[0]
// 		: "Developer";
// 	const totalTickets = useMemo(
// 		() => workspaces.reduce((a, ws) => a + (ws.tickets || 0), 0),
// 		[workspaces],
// 	);
// 	const activeWorkspaces = useMemo(
// 		() => workspaces.filter((ws) => ws.tickets > 0).length,
// 		[workspaces],
// 	);

// 	const filteredWorkspaces = useMemo(() => {
// 		if (!search) return workspaces;
// 		return workspaces.filter((ws) =>
// 			ws.name.toLowerCase().includes(search.toLowerCase()),
// 		);
// 	}, [workspaces, search]);

// 	// const { featured, rest } = useMemo(() => {
// 	// 	const mostRecentWsId = TICKET_WORKSPACE[initialActivity[0]?.ticketId];
// 	// 	const featuredWs =
// 	// 		filteredWorkspaces.find((ws) => ws.id === mostRecentWsId) || null;
// 	// 	return {
// 	// 		featured: featuredWs,
// 	// 		rest: featuredWs
// 	// 			? filteredWorkspaces.filter((ws) => ws.id !== featuredWs.id)
// 	// 			: filteredWorkspaces,
// 	// 	};
// 	// }, [filteredWorkspaces]);

// 	return (
// 		<div className="sy-root w-full bg-stone-50">
// 			<style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
//         .sy-root { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
//         .font-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
//         .font-mono-ui { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace; font-variant-numeric: tabular-nums; }
//         @media (prefers-reduced-motion: reduce) { .sy-root * { transition: none !important; } }
//       `}</style>

// 			<main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
// 				{/* Greeting */}
// 				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
// 					<div>
// 						<span className="font-mono-ui text-xs font-medium uppercase tracking-wide text-teal-600">
// 							Welcome back, {currentUserFirstName}
// 						</span>
// 						<h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
// 							Your command center
// 						</h1>
// 						<p className="mt-1.5 text-sm text-stone-500">
// 							{workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}{" "}
// 							· {totalTickets} open ticket{totalTickets !== 1 ? "s" : ""}
// 						</p>
// 					</div>
// 					<div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
// 						<div className="relative w-full sm:w-56">
// 							<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
// 							<input
// 								value={search}
// 								onChange={(e) => setSearch(e.target.value)}
// 								placeholder="Search workspaces"
// 								className={`font-mono-ui w-full rounded-md border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm text-stone-700 placeholder:text-stone-400 focus:border-teal-600 ${FOCUS_RING}`}
// 							/>
// 						</div>
// 						<button
// 							onClick={() => setIsModalOpen(true)}
// 							className={`flex items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 ${FOCUS_RING}`}
// 						>
// 							<Plus className="h-4 w-4" />
// 							New workspace
// 						</button>
// 					</div>
// 				</div>

// 				{/* Stat ledger */}
// 				<div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:gap-0 sm:overflow-hidden sm:rounded-lg sm:border sm:border-stone-200 sm:divide-x sm:divide-stone-200">
// 					<StatSegment
// 						icon={LayoutGrid}
// 						label="Workspaces"
// 						value={workspaces.length}
// 					/>
// 					<StatSegment
// 						icon={Ticket}
// 						label="Open tickets"
// 						value={totalTickets}
// 						emphasized
// 					/>
// 					<StatSegment
// 						icon={Users}
// 						label="Teammates"
// 						value={PEOPLE_NAMES.length}
// 					/>
// 					<StatSegment
// 						icon={Activity}
// 						label="Active"
// 						value={activeWorkspaces}
// 					/>
// 				</div>

// 				<div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
// 					{/* <div className="lg:col-span-2">
// 						{workspaces.length === 0 ? (
// 							<EmptyState />
// 						) : filteredWorkspaces.length === 0 ? (
// 							<div className="py-16 text-center text-sm text-stone-400">
// 								No workspaces match "{search}".
// 							</div>
// 						) : (
// 							<>
// 								{featured && (
// 									<section>
// 										<FeaturedBanner ws={featured} />
// 									</section>
// 								)}
// 								<section className="mt-10">
// 									<span className="font-mono-ui text-xs font-medium uppercase tracking-wide text-stone-400">
// 										All workspaces
// 									</span>
// 									<div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2">
// 										<NewWorkspaceTile onClick={() => setIsModalOpen(true)} />
// 										{rest.map((ws) => (
// 											<WorkspaceCard key={ws.id} ws={ws} />
// 										))}
// 									</div>
// 								</section>
// 							</>
// 						)}
// 					</div> */}
// 					{loading && workspaces.length === 0 ? (
// 						<div className="flex flex-col items-center justify-center py-20 text-stone-400">
// 							<Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
// 							<span className="font-mono-ui text-xs">
// 								Loading command center from PostgreSQL...
// 							</span>
// 						</div>
// 					) : workspaces.length === 0 ? (
// 						<div className="mt-10">
// 							<EmptyState onOpenModal={() => setIsModalOpen(true)} />
// 						</div>
// 					) : (
// 						<section className="mt-10">
// 							<span className="font-mono-ui text-xs font-medium uppercase tracking-wide text-stone-400">
// 								All workspaces ({filteredWorkspaces.length})
// 							</span>
// 							<div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
// 								<NewWorkspaceTile onClick={() => setIsModalOpen(true)} />
// 								{filteredWorkspaces.map((ws) => (
// 									<WorkspaceCard key={ws.id} ws={ws} />
// 								))}
// 							</div>
// 						</section>
// 					)}

// 					<div className="lg:col-span-1">
// 						<div className="sticky top-6 rounded-lg border border-stone-200 bg-white p-5">
// 							<div className="mb-5 flex items-center gap-2">
// 								<Clock className="h-4 w-4 text-teal-600" />
// 								<h3 className="font-display font-semibold text-stone-900">
// 									Recent activity
// 								</h3>
// 							</div>
// 							{initialActivity.length === 0 ? (
// 								<p className="py-4 text-sm text-stone-400">
// 									No recent activity.
// 								</p>
// 							) : (
// 								<div>
// 									{initialActivity.map((item, i) => (
// 										<ActivityLogItem
// 											key={item.id}
// 											item={item}
// 											isLast={i === initialActivity.length - 1}
// 										/>
// 									))}
// 								</div>
// 							)}
// 							<button className="font-mono-ui mt-1 text-xs font-medium text-teal-600 transition-colors hover:text-teal-700">
// 								View all activity →
// 							</button>
// 						</div>
// 					</div>
// 				</div>
// 			</main>
// 			<CreateWorkspaceModal
// 				isOpen={isCreateWorkspaceModalOpen}
// 				onClose={() => setIsCreateWorkspaceModalOpen(false)}
// 			/>
// 		</div>
// 	);
// }
import React, { useState, useMemo, useEffect } from "react";
import {
	Plus,
	ArrowRight,
	Search,
	LayoutGrid,
	Ticket,
	Users,
	Activity,
	FolderKanban,
	Clock,
	Sparkles,
	Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ACTIVITY_ICON, initialActivity } from "../data/constants";
import { workspaceMeta } from "../components/utils/workspaceMeta";
import PulseStrip from "../components/PulseStrip";
import SegmentedMeter from "../components/SegmentedMeter.jsx";
import MemberAvatar from "../components/MemberAvatar";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { useAuthStore } from "../store/useAuthStore";
import { StatSegment } from "../components/StatSegment";
import { PEOPLE_NAMES } from "../data/people";
import { activityText } from "../data/activity.jsx";
import CreateWorkspaceModal from "../components/modals/CreateWorkspaceModal.jsx";

const FOCUS_RING =
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2";

function ActivityLogItem({ item, isLast }) {
	const style =
		{
			moved: "bg-amber-50 text-amber-600",
			created: "bg-violet-50 text-violet-600",
			commented: "bg-teal-50 text-teal-600",
		}[item.type] || "bg-stone-100 text-stone-500";
	const Icon = ACTIVITY_ICON[item.type] || Clock;

	return (
		<div className="flex gap-3">
			<div className="flex flex-col items-center">
				<span
					className={`z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${style}`}
				>
					<Icon className="h-3 w-3" />
				</span>
				{!isLast && <span className="mt-1 w-px flex-1 bg-stone-200" />}
			</div>
			<div className="min-w-0 flex-1 pb-5">
				<p className="text-sm leading-snug text-stone-600">
					<span className="font-medium text-stone-900">{item.actor}</span>{" "}
					{activityText(item)}
				</p>
				<p className="font-mono-ui mt-1 text-xs text-stone-400">{item.time}</p>
			</div>
		</div>
	);
}

function WorkspaceCard({ ws }) {
	const {
		progress,
		active,
		palette,
		monogram,
		lastActivity,
		pulse,
		memberNames,
	} = workspaceMeta(ws);
	return (
		<Link
			key={ws.id}
			to={`/workspace/${ws.id}`}
			aria-label={ws.name}
			className={`group flex flex-col rounded-lg border border-stone-200 bg-white p-5 transition-colors hover:border-teal-600 ${FOCUS_RING}`}
		>
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-3">
					<div
						className={`font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-semibold ${palette.tint} ${palette.text}`}
					>
						{monogram}
					</div>
					<div>
						<h3 className="font-display text-base font-semibold text-stone-900">
							{ws.name}
						</h3>
						<p className="font-mono-ui mt-0.5 flex items-center gap-1.5 text-xs text-stone-400">
							<span className={`h-1.5 w-1.5 rounded-full ${palette.dot}`} />
							{lastActivity
								? `updated ${lastActivity.time}`
								: "no recent activity"}
						</p>
					</div>
				</div>
				<ArrowRight className="h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600" />
			</div>

			<div className="font-mono-ui mt-4 flex items-baseline gap-1.5 text-sm">
				<span className="font-semibold text-amber-600">{active}</span>
				<span className="text-stone-400">active</span>
				<span className="text-stone-300">/</span>
				<span className="font-semibold text-stone-700">{ws.tickets}</span>
				<span className="text-stone-400">total</span>
			</div>

			<div className="mt-4">
				<div className="mb-1.5 flex items-center justify-between">
					<span className="text-xs font-medium text-stone-500">Completion</span>
					<span className="font-mono-ui text-xs font-semibold text-stone-900">
						{progress}%
					</span>
				</div>
				<SegmentedMeter progress={progress} palette={palette} />
			</div>

			<div className="mt-4 flex items-end justify-between">
				<div>
					<p className="font-mono-ui mb-1 text-xs uppercase tracking-wide text-stone-300">
						Last 10 days
					</p>
					<PulseStrip pulse={pulse} palette={palette} />
				</div>
				<div className="flex items-center gap-2">
					<div className="flex -space-x-1.5">
						{memberNames.map((name) => (
							<MemberAvatar key={name} name={name} />
						))}
					</div>
					<span className="font-mono-ui text-xs text-stone-400">
						{memberNames.length} members
					</span>
				</div>
			</div>
		</Link>
	);
}

function NewWorkspaceTile() {
	const setIsCreateWorkspaceModalOpen = useWorkspaceStore(
		(state) => state.setIsCreateWorkspaceModalOpen,
	);

	return (
		<button
			type="button"
			onClick={() => setIsCreateWorkspaceModalOpen(true)}
			className={`group flex min-h-60 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-5 text-stone-400 transition-colors hover:border-teal-600 hover:bg-teal-50 hover:text-teal-700 ${FOCUS_RING}`}
		>
			<div className="flex h-10 w-10 items-center justify-center rounded-md border border-stone-300 transition-colors group-hover:border-teal-600 group-hover:bg-white">
				<Plus className="h-5 w-5" />
			</div>
			<span className="font-mono-ui text-xs font-medium uppercase tracking-wide">
				New workspace
			</span>
		</button>
	);
}

function EmptyState() {
	const setIsCreateWorkspaceModalOpen = useWorkspaceStore(
		(state) => state.setIsCreateWorkspaceModalOpen,
	);

	return (
		<div className="rounded-lg border border-stone-200 bg-white py-16 text-center">
			<FolderKanban className="mx-auto mb-4 h-10 w-10 text-stone-300" />
			<h3 className="font-display text-lg font-semibold text-stone-700">
				No workspaces yet
			</h3>
			<p className="mt-1 text-sm text-stone-500">
				Create your first workspace to get started.
			</p>
			<button
				onClick={() => setIsCreateWorkspaceModalOpen(true)}
				className="mt-4 inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
			>
				<Plus className="h-4 w-4" /> Create Workspace
			</button>
		</div>
	);
}

export default function WorkspacesDashboard() {
	const user = useAuthStore((state) => state.user);
	const workspaces = useWorkspaceStore((state) => state.workspaces);
	const isCreateWorkspaceModalOpen = useWorkspaceStore(
		(state) => state.isCreateWorkspaceModalOpen,
	);
	const setIsCreateWorkspaceModalOpen = useWorkspaceStore(
		(state) => state.setIsCreateWorkspaceModalOpen,
	);
	const fetchWorkspaces = useWorkspaceStore((state) => state.fetchWorkspaces);
	const loading = useWorkspaceStore((state) => state.loading);

	const [search, setSearch] = useState("");

	useEffect(() => {
		fetchWorkspaces();
	}, [fetchWorkspaces]);

	const currentUserFirstName = user?.name
		? user.name.split(" ")[0]
		: "Developer";
	const totalTickets = useMemo(
		() => workspaces.reduce((a, ws) => a + (ws.tickets || 0), 0),
		[workspaces],
	);
	const activeWorkspaces = useMemo(
		() => workspaces.filter((ws) => ws.tickets > 0).length,
		[workspaces],
	);

	const filteredWorkspaces = useMemo(() => {
		if (!search) return workspaces;
		return workspaces.filter((ws) =>
			ws.name.toLowerCase().includes(search.toLowerCase()),
		);
	}, [workspaces, search]);

	return (
		<div className="sy-root w-full bg-stone-50">
			<style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
                .sy-root { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
                .font-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
                .font-mono-ui { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace; font-variant-numeric: tabular-nums; }
                @media (prefers-reduced-motion: reduce) { .sy-root * { transition: none !important; } }
            `}</style>

			<main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
				{/* Greeting */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<span className="font-mono-ui text-xs font-medium uppercase tracking-wide text-teal-600">
							Welcome back, {currentUserFirstName}
						</span>
						<h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
							Your command center
						</h1>
						<p className="mt-1.5 text-sm text-stone-500">
							{workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}{" "}
							· {totalTickets} open ticket{totalTickets !== 1 ? "s" : ""}
						</p>
					</div>
					<div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
						<div className="relative w-full sm:w-56">
							<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
							<input
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search workspaces"
								className={`font-mono-ui w-full rounded-md border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm text-stone-700 placeholder:text-stone-400 focus:border-teal-600 ${FOCUS_RING}`}
							/>
						</div>
						<button
							onClick={() => setIsCreateWorkspaceModalOpen(true)}
							className={`flex items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 ${FOCUS_RING}`}
						>
							<Plus className="h-4 w-4" />
							New workspace
						</button>
					</div>
				</div>

				{/* Stat Ledger */}
				<div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:gap-0 sm:overflow-hidden sm:rounded-lg sm:border sm:border-stone-200 sm:divide-x sm:divide-stone-200">
					<StatSegment
						icon={LayoutGrid}
						label="Workspaces"
						value={workspaces.length}
					/>
					<StatSegment
						icon={Ticket}
						label="Open tickets"
						value={totalTickets}
						emphasized
					/>
					<StatSegment
						icon={Users}
						label="Teammates"
						value={PEOPLE_NAMES.length}
					/>
					<StatSegment
						icon={Activity}
						label="Active"
						value={activeWorkspaces}
					/>
				</div>

				<div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
					{loading && workspaces.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-20 text-stone-400 lg:col-span-2">
							<Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
							<span className="font-mono-ui text-xs">
								Loading command center from PostgreSQL...
							</span>
						</div>
					) : workspaces.length === 0 ? (
						<div className="mt-10 lg:col-span-2">
							<EmptyState />
						</div>
					) : (
						<section className="mt-10 lg:col-span-2">
							<span className="font-mono-ui text-xs font-medium uppercase tracking-wide text-stone-400">
								All workspaces ({filteredWorkspaces.length})
							</span>
							<div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
								<NewWorkspaceTile />
								{filteredWorkspaces.map((ws) => (
									<WorkspaceCard key={ws.id} ws={ws} />
								))}
							</div>
						</section>
					)}

					{/* Activity Feed */}
					<div className="lg:col-span-1">
						<div className="sticky top-6 rounded-lg border border-stone-200 bg-white p-5">
							<div className="mb-5 flex items-center gap-2">
								<Clock className="h-4 w-4 text-teal-600" />
								<h3 className="font-display font-semibold text-stone-900">
									Recent activity
								</h3>
							</div>
							{initialActivity.length === 0 ? (
								<p className="py-4 text-sm text-stone-400">
									No recent activity.
								</p>
							) : (
								<div>
									{initialActivity.map((item, i) => (
										<ActivityLogItem
											key={item.id}
											item={item}
											isLast={i === initialActivity.length - 1}
										/>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
