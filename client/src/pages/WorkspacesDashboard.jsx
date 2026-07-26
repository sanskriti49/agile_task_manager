import React, { useState, useMemo } from "react";
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
	MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";

const CURRENT_USER = "Sanskriti Gupta";
const FOCUS_RING =
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2";

const USER_WORKSPACES = [
	{
		id: "ws-1",
		name: "E-Commerce Platform",
		color: "from-teal-500 to-cyan-500",
		tickets: 12,
	},
	{
		id: "ws-2",
		name: "Marketing Website",
		color: "from-violet-500 to-purple-600",
		tickets: 5,
	},
	{
		id: "ws-3",
		name: "Mobile App v2",
		color: "from-amber-500 to-orange-600",
		tickets: 8,
	},
];

const PEOPLE = {
	"Aria Chen": { initials: "AC", color: "bg-violet-500" },
	"Rohan Mehta": { initials: "RM", color: "bg-sky-500" },
	"Priya Nair": { initials: "PN", color: "bg-emerald-500" },
	"Sanskriti Gupta": { initials: "SG", color: "bg-indigo-500" },
};
const ONLINE_NOW = new Set(["Aria Chen", "Priya Nair"]);
const PEOPLE_NAMES = Object.keys(PEOPLE);

const initialTickets = [
	{ id: "ENG-101", workspaceId: "ws-1", assignee: "Aria Chen" },
	{ id: "ENG-102", workspaceId: "ws-1", assignee: "Rohan Mehta" },
	{ id: "ENG-103", workspaceId: "ws-1", assignee: "Priya Nair" },
	{ id: "ENG-104", workspaceId: "ws-2", assignee: "Rohan Mehta" },
	{ id: "ENG-105", workspaceId: "ws-2", assignee: "Sanskriti Gupta" },
	{ id: "ENG-106", workspaceId: "ws-2", assignee: "Aria Chen" },
	{ id: "ENG-107", workspaceId: "ws-3", assignee: "Rohan Mehta" },
	{ id: "ENG-108", workspaceId: "ws-3", assignee: "Priya Nair" },
];

const initialActivity = [
	{
		id: "a1",
		type: "moved",
		ticketId: "ENG-105",
		ticketTitle: "Build checkout API",
		actor: "Sanskriti Gupta",
		detail: "To Do → In Progress",
		time: "2m ago",
	},
	{
		id: "a2",
		type: "commented",
		ticketId: "ENG-105",
		ticketTitle: "Build checkout API",
		actor: "Aria Chen",
		detail: "Added the edge-case list to the ticket description.",
		time: "40m ago",
	},
	{
		id: "a3",
		type: "commented",
		ticketId: "ENG-104",
		ticketTitle: "Create product API",
		actor: "Sanskriti Gupta",
		detail: "Let's version this under /api/v1 from the start.",
		time: "6h ago",
	},
	{
		id: "a4",
		type: "created",
		ticketId: "ENG-104",
		ticketTitle: "Create product API",
		actor: "Rohan Mehta",
		detail: "Created the issue",
		time: "1d ago",
	},
	{
		id: "a5",
		type: "moved",
		ticketId: "ENG-108",
		ticketTitle: "Deploy staging environment",
		actor: "Priya Nair",
		detail: "In Progress → Done",
		time: "4d ago",
	},
];

const ACTIVITY_ICON = {
	moved: ArrowRight,
	created: Plus,
	commented: MessageSquare,
};

const TICKET_WORKSPACE = Object.fromEntries(
	initialTickets.map((t) => [t.id, t.workspaceId]),
);

function lastActivityForWorkspace(wsId) {
	return initialActivity.find((a) => TICKET_WORKSPACE[a.ticketId] === wsId);
}

const PALETTES = [
	{
		dot: "bg-teal-600",
		text: "text-teal-700",
		tint: "bg-teal-50",
		fill: "bg-teal-600",
	},
	{
		dot: "bg-amber-500",
		text: "text-amber-700",
		tint: "bg-amber-50",
		fill: "bg-amber-500",
	},
	{
		dot: "bg-violet-500",
		text: "text-violet-700",
		tint: "bg-violet-50",
		fill: "bg-violet-500",
	},
	{
		dot: "bg-rose-500",
		text: "text-rose-700",
		tint: "bg-rose-50",
		fill: "bg-rose-500",
	},
];
function paletteFromColor(colorStr = "") {
	if (colorStr.includes("teal") || colorStr.includes("cyan"))
		return PALETTES[0];
	if (colorStr.includes("amber") || colorStr.includes("orange"))
		return PALETTES[1];
	if (colorStr.includes("violet") || colorStr.includes("purple"))
		return PALETTES[2];
	return PALETTES[3];
}

function hashString(str) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i);
		hash |= 0;
	}
	return Math.abs(hash);
}

function pickMembers(seed, count) {
	const n = Math.min(count, PEOPLE_NAMES.length);
	const start = seed % PEOPLE_NAMES.length;
	return Array.from(
		{ length: n },
		(_, i) => PEOPLE_NAMES[(start + i) % PEOPLE_NAMES.length],
	);
}

function workspaceMeta(ws) {
	const seed = hashString(ws.id);

	const done = Math.round(((seed % 10) / 10) * ws.tickets);
	const progress = ws.tickets > 0 ? Math.round((done / ws.tickets) * 100) : 0;
	const active = Math.max(ws.tickets - done - 1, 0);

	const palette = paletteFromColor(ws.color);
	const monogram = ws.name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const lastActivity = lastActivityForWorkspace(ws.id);

	const pulse = Array.from({ length: 10 }, (_, i) => {
		const v = ((seed * (i * 13 + 7)) % 97) / 97;
		return Math.max(v, 0.12);
	});

	const memberCount = (seed % 3) + 2;
	const memberNames = pickMembers(seed, memberCount);

	return {
		done,
		progress,
		active,
		palette,
		monogram,
		lastActivity,
		pulse,
		memberNames,
	};
}

function SegmentedMeter({ progress, palette, segments = 10 }) {
	const filled = Math.round((progress / 100) * segments);
	return (
		<div className="flex gap-0.5">
			{Array.from({ length: segments }).map((_, i) => (
				<span
					key={i}
					className={`h-1.5 flex-1 rounded-sm ${i < filled ? palette.fill : "bg-stone-100"}`}
				/>
			))}
		</div>
	);
}

function PulseStrip({ pulse, palette }) {
	return (
		<div className="flex h-6 items-end gap-0.5">
			{pulse.map((v, i) => (
				<span
					key={i}
					className={`w-1 rounded-sm ${palette.fill} opacity-70`}
					style={{ height: `${Math.max(v * 100, 14)}%` }}
				/>
			))}
		</div>
	);
}

function TicketTag({ children }) {
	return (
		<span className="font-mono-ui rounded bg-stone-100 px-1 py-0.5 text-xs text-stone-600">
			{children}
		</span>
	);
}

function MemberAvatar({ name, size = "h-6 w-6" }) {
	const person = PEOPLE[name];
	if (!person) return null;
	const online = ONLINE_NOW.has(name);
	return (
		<div
			className={`relative flex ${size} items-center justify-center rounded-full ${person.color} text-xs font-semibold text-white ring-2 ring-white`}
		>
			{person.initials}
			{online && (
				<span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
			)}
		</div>
	);
}

function activityText(item) {
	switch (item.type) {
		case "moved":
			return (
				<>
					moved <TicketTag>{item.ticketId}</TicketTag> · {item.detail}
				</>
			);
		case "commented":
			return (
				<>
					commented on <TicketTag>{item.ticketId}</TicketTag>
				</>
			);
		case "created":
			return (
				<>
					opened <TicketTag>{item.ticketId}</TicketTag>
				</>
			);
		default:
			return (
				<>
					updated <TicketTag>{item.ticketId}</TicketTag>
				</>
			);
	}
}

function StatSegment({ icon: Icon, label, value, emphasized }) {
	return (
		<div
			className={`rounded-lg border border-stone-200 bg-white px-4 py-3 sm:flex-1 sm:rounded-none sm:border-0 sm:px-5 sm:py-4 ${emphasized ? "bg-teal-50 sm:bg-teal-50" : ""}`}
		>
			<div className="flex items-center gap-1.5 text-stone-400">
				<Icon className="h-3.5 w-3.5" />
				<span className="font-mono-ui text-xs uppercase tracking-wide">
					{label}
				</span>
			</div>
			<p
				className={`font-display mt-1.5 text-2xl font-semibold ${emphasized ? "text-teal-700" : "text-stone-900"}`}
			>
				{value}
			</p>
		</div>
	);
}

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

function FeaturedBanner({ ws }) {
	const { progress, active, palette, monogram, lastActivity, memberNames } =
		workspaceMeta(ws);
	return (
		<a
			href="#"
			onClick={(e) => e.preventDefault()}
			className={`group relative flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white p-6 transition-colors hover:border-teal-600 sm:p-8 ${FOCUS_RING}`}
		>
			<span
				className={`font-display pointer-events-none absolute -right-4 -top-6 select-none text-9xl font-bold leading-none opacity-5 ${palette.text}`}
			>
				{monogram}
			</span>

			<div className="relative flex items-start justify-between">
				<div>
					<span className="font-mono-ui flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-teal-700">
						<Sparkles className="h-3.5 w-3.5" />
						Continue where you left off
					</span>
					<h3 className="font-display mt-2 text-xl font-semibold text-stone-900">
						{ws.name}
					</h3>
					<p className="font-mono-ui mt-1 text-xs text-stone-400">
						{lastActivity
							? `${lastActivity.actor} ${activityLabel(lastActivity)} · ${lastActivity.time}`
							: "No recent activity"}
					</p>
				</div>
				<ArrowRight className="h-5 w-5 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600" />
			</div>

			<div className="relative mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
				<div className="font-mono-ui flex gap-8">
					<div>
						<p className="text-xs text-stone-400">Active</p>
						<p className="text-2xl font-semibold text-amber-600">{active}</p>
					</div>
					<div>
						<p className="text-xs text-stone-400">Total</p>
						<p className="text-2xl font-semibold text-stone-800">
							{ws.tickets}
						</p>
					</div>
					<div>
						<p className="text-xs text-stone-400">Members</p>
						<div className="mt-1 flex -space-x-1.5">
							{memberNames.map((name) => (
								<MemberAvatar key={name} name={name} size="h-7 w-7" />
							))}
						</div>
					</div>
				</div>
				<div className="w-full sm:max-w-xs">
					<div className="mb-1.5 flex items-center justify-between">
						<span className="text-xs font-medium text-stone-500">
							Completion
						</span>
						<span className="font-mono-ui text-xs font-semibold text-stone-900">
							{progress}%
						</span>
					</div>
					<SegmentedMeter progress={progress} palette={palette} segments={16} />
				</div>
			</div>
		</a>
	);
}

function activityLabel(item) {
	if (item.type === "moved") return "moved a ticket";
	if (item.type === "created") return "opened a ticket";
	if (item.type === "commented") return "commented";
	return "updated a ticket";
}

function NewWorkspaceTile({ onClick }) {
	return (
		<button
			type="button"
			onClick={onClick}
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
	return (
		<div className="rounded-lg border border-stone-200 bg-white py-16 text-center">
			<FolderKanban className="mx-auto mb-4 h-10 w-10 text-stone-300" />
			<h3 className="font-display text-lg font-semibold text-stone-700">
				No workspaces yet
			</h3>
			<p className="mt-1 text-sm text-stone-500">
				Create your first workspace to get started.
			</p>
		</div>
	);
}

export default function WorkspacesDashboard() {
	const workspaces = USER_WORKSPACES;
	const [search, setSearch] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);

	const totalTickets = useMemo(
		() => workspaces.reduce((a, ws) => a + ws.tickets, 0),
		[workspaces],
	);
	const totalMembers = PEOPLE_NAMES.length;
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

	const { featured, rest } = useMemo(() => {
		const mostRecentWsId = TICKET_WORKSPACE[initialActivity[0]?.ticketId];
		const featuredWs =
			filteredWorkspaces.find((ws) => ws.id === mostRecentWsId) || null;
		return {
			featured: featuredWs,
			rest: featuredWs
				? filteredWorkspaces.filter((ws) => ws.id !== featuredWs.id)
				: filteredWorkspaces,
		};
	}, [filteredWorkspaces]);

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
							Welcome back, {CURRENT_USER.split(" ")[0]}
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
							onClick={() => setIsModalOpen(true)}
							className={`flex items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 ${FOCUS_RING}`}
						>
							<Plus className="h-4 w-4" />
							New workspace
						</button>
					</div>
				</div>

				{/* Stat ledger */}
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
					<StatSegment icon={Users} label="Teammates" value={totalMembers} />
					<StatSegment
						icon={Activity}
						label="Active"
						value={activeWorkspaces}
					/>
				</div>

				{/* Main layout */}
				<div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
					<div className="lg:col-span-2">
						{workspaces.length === 0 ? (
							<EmptyState />
						) : filteredWorkspaces.length === 0 ? (
							<div className="py-16 text-center text-sm text-stone-400">
								No workspaces match "{search}".
							</div>
						) : (
							<>
								{featured && (
									<section>
										<FeaturedBanner ws={featured} />
									</section>
								)}
								<section className="mt-10">
									<span className="font-mono-ui text-xs font-medium uppercase tracking-wide text-stone-400">
										All workspaces
									</span>
									<div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2">
										<NewWorkspaceTile onClick={() => setIsModalOpen(true)} />
										{rest.map((ws) => (
											<WorkspaceCard key={ws.id} ws={ws} />
										))}
									</div>
								</section>
							</>
						)}
					</div>

					{/* Activity log */}
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
							<button className="font-mono-ui mt-1 text-xs font-medium text-teal-600 transition-colors hover:text-teal-700">
								View all activity →
							</button>
						</div>
					</div>
				</div>
			</main>

			{isModalOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4"
					onClick={() => setIsModalOpen(false)}
				>
					<div
						className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-6"
						onClick={(e) => e.stopPropagation()}
					>
						<h3 className="font-display text-lg font-semibold text-stone-900">
							Create workspace
						</h3>
						<p className="mt-1 text-sm text-stone-500">
							This is a placeholder — wire your real CreateWorkspaceModal here.
						</p>
						<button
							onClick={() => setIsModalOpen(false)}
							className={`font-mono-ui mt-5 w-full rounded-md bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700 ${FOCUS_RING}`}
						>
							Close
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
