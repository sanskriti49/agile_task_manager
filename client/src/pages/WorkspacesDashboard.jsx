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
	CheckSquare,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ACTIVITY_ICON } from "../data/constants";
import { workspaceMeta } from "../components/utils/workspaceMeta";
import PulseStrip from "../components/PulseStrip";
import SegmentedMeter from "../components/SegmentedMeter.jsx";
import MemberAvatar from "../components/MemberAvatar";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { useAuthStore } from "../store/useAuthStore";
import { StatSegment } from "../components/StatSegment";
import { PEOPLE_NAMES } from "../data/people";
import { activityText } from "../data/activity.jsx";
import AppLoader from "../components/common/AppLoader";

const FOCUS_RING =
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2";

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
			className={`group flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-all hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md ${FOCUS_RING}`}
		>
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-3">
					<div
						className={`display flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${palette.tint} ${palette.text}`}
					>
						{monogram}
					</div>
					<div>
						<h3 className="display text-base font-bold text-slate-900 dark:text-slate-100">
							{ws.name}
						</h3>
						<p className="work-sans mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
							<span className={`h-1.5 w-1.5 rounded-full ${palette.dot}`} />
							{ws.role ? `Role: ${ws.role}` : "Member"}
						</p>
					</div>
				</div>
				<ArrowRight className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600" />
			</div>

			<div className="onest mt-4 flex items-baseline gap-1.5 text-sm">
				<span className="font-bold text-amber-600 dark:text-amber-400">
					{active}
				</span>
				<span className="text-slate-400">active</span>
				<span className="text-slate-300 dark:text-slate-700">/</span>
				<span className="font-bold text-slate-700 dark:text-slate-300">
					{ws.tickets}
				</span>
				<span className="text-slate-400">total</span>
			</div>

			<div className="mt-4">
				<div className="mb-1.5 flex items-center justify-between font-mono-ui">
					<span className="onest text-xs font-medium text-slate-500">
						Completion
					</span>
					<span className="text-xs font-bold text-slate-900 dark:text-slate-100">
						{progress}%
					</span>
				</div>
				<SegmentedMeter progress={progress} palette={palette} />
			</div>

			<div className="mt-4 flex items-end justify-between">
				<div>
					<p className="display mb-1 text-[10px] uppercase tracking-wide text-slate-400">
						Activity Pulse
					</p>
					<PulseStrip pulse={pulse} palette={palette} />
				</div>
				<div className="flex items-center gap-2">
					<div className="flex -space-x-1.5">
						{memberNames.slice(0, 3).map((name) => (
							<MemberAvatar key={name} name={name} />
						))}
					</div>
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
			className={`group flex min-h-60 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-5 text-slate-400 transition-all hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 hover:text-teal-600 ${FOCUS_RING}`}
		>
			<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 transition-colors group-hover:border-teal-600 group-hover:bg-white dark:group-hover:bg-slate-800">
				<Plus className="h-5 w-5" />
			</div>
			<span className="onest text-sm font-bold">New Workspace</span>
		</button>
	);
}

function EmptyState() {
	const setIsCreateWorkspaceModalOpen = useWorkspaceStore(
		(state) => state.setIsCreateWorkspaceModalOpen,
	);

	return (
		<div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-16 text-center">
			<FolderKanban className="mx-auto mb-4 h-10 w-10 text-slate-300 dark:text-slate-600" />
			<h3 className="display text-lg font-bold text-slate-800 dark:text-slate-200">
				No workspaces yet
			</h3>
			<p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-mono-ui">
				Create your first project workspace to get started.
			</p>
			<button
				onClick={() => setIsCreateWorkspaceModalOpen(true)}
				className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 shadow-xs"
			>
				<Plus className="h-4 w-4" /> Create Workspace
			</button>
		</div>
	);
}

export default function WorkspacesDashboard() {
	const user = useAuthStore((state) => state.user);
	const workspaces = useWorkspaceStore((state) => state.workspaces) || [];
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
		<div className="w-full bg-slate-50 dark:bg-slate-950 min-h-full text-slate-900 dark:text-slate-100">
			<main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
				{/* Greeting & Header */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800">
					<div>
						<span className="inter text-xs font-bold uppercase tracking-wide text-teal-600 dark:text-teal-400">
							Welcome back, {currentUserFirstName}
						</span>
						<h1 className="display mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
							Command Center
						</h1>
						<p className="onest mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono-ui">
							{workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}{" "}
							· {totalTickets} total tasks
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-3">
						<div className="relative w-full sm:w-60">
							<Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
							<input
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search workspaces..."
								className="work-sans w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900"
							/>
						</div>
						<button
							onClick={() => setIsCreateWorkspaceModalOpen(true)}
							className="onest flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors shadow-xs"
						>
							<Plus className="h-4 w-4" /> New Workspace
						</button>
					</div>
				</div>

				{/* Stat Ledger */}
				<div className="mt-6 onest grid grid-cols-2 gap-3 sm:flex sm:gap-0 sm:overflow-hidden sm:rounded-2xl sm:border sm:border-slate-200/80 dark:sm:border-slate-800 sm:divide-x sm:divide-slate-200/80 dark:sm:divide-slate-800 bg-white dark:bg-slate-900 shadow-2xs font-mono-ui">
					<StatSegment
						icon={LayoutGrid}
						label="Workspaces"
						value={workspaces.length}
					/>
					<StatSegment
						icon={Ticket}
						label="Total Issues"
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
						label="Active Projects"
						value={activeWorkspaces}
					/>
				</div>

				{/* Workspaces Grid */}
				{loading && workspaces.length === 0 ? (
					<AppLoader
						text="Loading workspaces..."
						type="ring"
						minH="min-h-[300px]"
					/>
				) : workspaces.length === 0 ? (
					<div className="mt-8">
						<EmptyState />
					</div>
				) : (
					<section className="mt-8">
						<span className="display text-xs font-bold uppercase tracking-wide text-slate-400 mb-4 block">
							All Workspaces ({filteredWorkspaces.length})
						</span>
						<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
							<NewWorkspaceTile />
							{filteredWorkspaces.map((ws) => (
								<WorkspaceCard key={ws.id} ws={ws} />
							))}
						</div>
					</section>
				)}
			</main>
		</div>
	);
}
