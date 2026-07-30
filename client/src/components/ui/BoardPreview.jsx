import {
	AlertCircle,
	Check,
	CheckSquare,
	ChevronRight,
	Clock,
	Command,
	Flame,
	MessageSquare,
	Play,
	RotateCcw,
	Search,
	Sparkles,
	X,
	Zap,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

// Custom styles for animations and scrollbars
const customStyles = `
    @keyframes popIn {
        0% { opacity: 0; transform: scale(0.96) translateY(4px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes slideInRight {
        0% { opacity: 0; transform: translateX(16px); }
        100% { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
    }
    .board-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .board-scroll::-webkit-scrollbar-track { background: transparent; }
    .board-scroll::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.5); border-radius: 4px; }
    .board-scroll::-webkit-scrollbar-thumb:hover { background: rgba(71, 85, 105, 0.8); }
`;

const TAG_STYLES = {
	Feature: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
	Performance: "bg-amber-500/10 text-amber-400 border-amber-500/30",
	Realtime: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
	"UI/UX": "bg-purple-500/10 text-purple-400 border-purple-500/30",
	Fix: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

const INITIAL_BOARD = {
	Backlog: [
		{
			id: "SYNC-101",
			title: "Add OAuth2 provider support for GitHub Enterprise",
			tag: "Feature",
			comments: 3,
			assignee: { initials: "AK", name: "Alex K.", color: "bg-emerald-500" },
			priority: "High",
			subtasks: { completed: 2, total: 4 },
			estimate: "3d",
			description:
				"Allow enterprise users to authenticate using self-hosted GitHub Enterprise Server OAuth instances.",
		},
		{
			id: "SYNC-102",
			title: "Optimize board render for 10,000+ virtualized cards",
			tag: "Performance",
			comments: 7,
			assignee: { initials: "SL", name: "Sarah L.", color: "bg-indigo-500" },
			priority: "Urgent",
			subtasks: { completed: 5, total: 5 },
			estimate: "1d",
			description:
				"Implement DOM virtualization using windowing algorithms for smooth 60fps rendering.",
		},
	],
	"In Progress": [
		{
			id: "SYNC-104",
			title: "Live multi-cursor canvas sync via WebSockets",
			tag: "Realtime",
			comments: 12,
			assignee: { initials: "MD", name: "Maya D.", color: "bg-rose-500" },
			priority: "Urgent",
			subtasks: { completed: 3, total: 4 },
			estimate: "5d",
			description:
				"Broadcast cursor coordinates and card drag offsets across active WebSocket peer rooms.",
		},
		{
			id: "SYNC-105",
			title: "Subtask collapse animation and keyboard shortcuts",
			tag: "UI/UX",
			comments: 2,
			assignee: { initials: "JL", name: "John L.", color: "bg-amber-500" },
			priority: "Medium",
			subtasks: { completed: 1, total: 3 },
			estimate: "2d",
			description:
				"Add quick hotkeys ('C' create, 'M' move, 'Cmd+K' palette) and buttery smooth height collapse.",
		},
	],
	Done: [
		{
			id: "SYNC-108",
			title: "Safari 17 touch gesture drop-target event handler fix",
			tag: "Fix",
			comments: 5,
			assignee: { initials: "AK", name: "Alex K.", color: "bg-emerald-500" },
			priority: "Low",
			subtasks: { completed: 2, total: 2 },
			estimate: "0.5d",
			description:
				"Resolved touch event preventDefault collision on iOS WebKit drag boundaries.",
		},
	],
};

const PRIORITY_CONFIG = {
	Urgent: {
		icon: Flame,
		color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
	},
	High: {
		icon: AlertCircle,
		color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
	},
	Medium: {
		icon: Zap,
		color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
	},
	Low: {
		icon: Clock,
		color: "text-slate-400 bg-slate-500/10 border-slate-500/30",
	},
};

const TicketCard = memo(function TicketCard({
	ticket,
	isActive,
	onSelect,
	onMoveNext,
}) {
	const PriorityIcon = PRIORITY_CONFIG[ticket.priority]?.icon || Zap;
	const priorityStyle =
		PRIORITY_CONFIG[ticket.priority]?.color || "text-slate-400";

	return (
		<div
			onClick={() => onSelect(ticket.id)}
			className={`group relative rounded-xl border p-3.5 cursor-pointer select-none transition-all duration-300 ease-out
                ${
									isActive
										? "border-cyan-500/60 bg-slate-900/80 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
										: "border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
								}`}
			style={{ animation: "popIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)" }}
		>
			{/* Hover Gradient Accent Line */}
			<div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />

			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<span className="font-mono text-[11px] font-semibold text-slate-500 tracking-wider transition-colors group-hover:text-cyan-400">
						{ticket.id}
					</span>
					<span
						className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-semibold border ${priorityStyle}`}
					>
						<PriorityIcon className="w-2.5 h-2.5" />
						{ticket.priority}
					</span>
				</div>

				<button
					onClick={(e) => {
						e.stopPropagation();
						onMoveNext(ticket.id);
					}}
					title="Move to next status"
					className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 transition-all font-mono text-[10px] flex items-center gap-1"
				>
					<span>Move</span>
					<ChevronRight className="w-3 h-3" />
				</button>
			</div>

			<p className="mt-2 text-[13.5px] leading-snug text-slate-200 font-medium group-hover:text-white transition-colors">
				{ticket.title}
			</p>

			<div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-slate-800/60">
				<span
					className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border ${TAG_STYLES[ticket.tag] || "bg-slate-800 text-slate-300 border-slate-700"}`}
				>
					{ticket.tag}
				</span>

				<div className="flex items-center gap-3">
					{ticket.subtasks && (
						<span className="flex items-center gap-1 font-mono text-[10.5px] text-slate-400">
							<CheckSquare className="w-3 h-3 text-slate-500" />
							{ticket.subtasks.completed}/{ticket.subtasks.total}
						</span>
					)}
					{ticket.comments > 0 && (
						<span className="flex items-center gap-1 font-mono text-[10.5px] text-slate-400">
							<MessageSquare className="w-3 h-3 text-slate-500" />
							{ticket.comments}
						</span>
					)}
					<span
						className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-slate-950 ${ticket.assignee.color}`}
					>
						{ticket.assignee.initials}
					</span>
				</div>
			</div>
		</div>
	);
});

function IssueInspector({ ticket, onClose, onStatusChange }) {
	if (!ticket) return null;
	const progress = (ticket.subtasks.completed / ticket.subtasks.total) * 100;

	return (
		<div
			className="absolute inset-y-0 right-0 z-30 w-full sm:w-[400px] bg-slate-950/90 border-l border-slate-800/80 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col justify-between"
			style={{ animation: "slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)" }}
		>
			<div className="p-6 overflow-y-auto board-scroll">
				<div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
					<div className="flex items-center gap-2">
						<span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
							{ticket.id}
						</span>
						<span className="text-slate-600">/</span>
						<span className="text-xs text-slate-400 font-mono">
							Issue Inspector
						</span>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				<h3 className="mt-5 text-lg font-bold text-white leading-tight">
					{ticket.title}
				</h3>
				<p className="mt-2 text-sm text-slate-400 leading-relaxed">
					{ticket.description}
				</p>

				<div className="mt-6 space-y-2">
					<label className="text-[10.5px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
						Status Workflow
					</label>
					<div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono">
						{["Backlog", "In Progress", "Done"].map((status) => (
							<button
								key={status}
								onClick={() => onStatusChange(ticket.id, status)}
								className={`py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${
									ticket.status === status
										? "bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
										: "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
								}`}
							>
								{status}
							</button>
						))}
					</div>
				</div>

				<div className="mt-6 space-y-3 text-xs border-t border-slate-800/80 pt-6">
					<div className="flex items-center justify-between py-1.5">
						<span className="text-slate-500 font-mono">Assignee</span>
						<div className="flex items-center gap-2 text-slate-200 font-medium">
							<span
								className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white ${ticket.assignee.color}`}
							>
								{ticket.assignee.initials}
							</span>
							<span>{ticket.assignee.name}</span>
						</div>
					</div>
					<div className="flex items-center justify-between py-1.5">
						<span className="text-slate-500 font-mono">Priority</span>
						<span
							className={`font-semibold flex items-center gap-1.5 px-2 py-1 rounded-md border ${PRIORITY_CONFIG[ticket.priority].color}`}
						>
							<Flame className="w-3 h-3" /> {ticket.priority}
						</span>
					</div>
					<div className="flex items-center justify-between py-1.5">
						<span className="text-slate-500 font-mono">Estimate</span>
						<span className="font-mono text-slate-300 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
							{ticket.estimate}
						</span>
					</div>
				</div>

				<div className="mt-6 border-t border-slate-800/80 pt-6">
					<div className="flex items-center justify-between mb-3">
						<span className="text-[10.5px] font-mono text-slate-500 uppercase tracking-wider">
							Subtasks Progress
						</span>
						<span className="text-xs font-mono text-cyan-400 font-bold">
							{ticket.subtasks.completed}/{ticket.subtasks.total} Done
						</span>
					</div>
					<div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
						<div
							className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500 ease-out"
							style={{ width: `${progress}%` }}
						/>
					</div>
					<div className="space-y-2">
						<div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs text-slate-300">
							<Check className="w-3.5 h-3.5 text-emerald-400" />
							<span>WebSocket handshake & auth token validation</span>
						</div>
						<div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs text-slate-300">
							<Check className="w-3.5 h-3.5 text-emerald-400" />
							<span>Optimistic UI state update handler</span>
						</div>
					</div>
				</div>
			</div>

			<div className="p-4 border-t border-slate-800/80 bg-slate-950/50 text-[11px] font-mono text-slate-500 text-center flex items-center justify-center gap-2">
				<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
				Synced via WebSockets across all peers
			</div>
		</div>
	);
}

export default function BoardPreview() {
	const [board, setBoard] = useState(INITIAL_BOARD);
	const [selectedTicketId, setSelectedTicketId] = useState(null);
	const [commandOpen, setCommandOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isSimulating, setIsSimulating] = useState(false);
	const [liveActivity, setLiveActivity] = useState([
		{ id: 1, text: "Maya D. moved SYNC-104 to In Progress", time: "Just now" },
		{ id: 2, text: "Alex K. added comment on SYNC-101", time: "1m ago" },
	]);

	const boardRef = useRef(board);
	useEffect(() => {
		boardRef.current = board;
	}, [board]);

	// Reactively derive the selected ticket along with its current status
	const selectedTicket = useMemo(() => {
		if (!selectedTicketId) return null;
		for (const [col, items] of Object.entries(board)) {
			const found = items.find((t) => t.id === selectedTicketId);
			if (found) return { ...found, status: col };
		}
		return null;
	}, [selectedTicketId, board]);

	const moveCardToStatus = useCallback((id, targetStatus) => {
		setBoard((prev) => {
			let card = null;
			const newBoard = { ...prev };

			for (const [col, items] of Object.entries(newBoard)) {
				const found = items.find((i) => i.id === id);
				if (found) {
					card = found;
					newBoard[col] = items.filter((i) => i.id !== id);
					break;
				}
			}

			if (!card || !targetStatus) return prev;
			newBoard[targetStatus] = [card, ...prev[targetStatus]];
			return newBoard;
		});

		setLiveActivity((prev) => [
			{
				id: Date.now(),
				text: `Ticket ${id} moved to ${targetStatus}`,
				time: "Just now",
			},
			...prev.slice(0, 3),
		]);
	}, []);

	const moveCardNext = useCallback(
		(id) => {
			const currentBoard = boardRef.current;
			let sourceCol = null;

			for (const [col, items] of Object.entries(currentBoard)) {
				if (items.some((i) => i.id === id)) {
					sourceCol = col;
					break;
				}
			}

			if (!sourceCol) return;
			const cols = Object.keys(currentBoard);
			const nextCol = cols[(cols.indexOf(sourceCol) + 1) % cols.length];
			moveCardToStatus(id, nextCol);
		},
		[moveCardToStatus],
	);

	const handleResetBoard = useCallback(() => {
		const freshBoard = JSON.parse(JSON.stringify(INITIAL_BOARD));
		setIsSimulating(true);
		setBoard(freshBoard);
		setSelectedTicketId(null);
		setLiveActivity([
			{
				id: 1,
				text: "Maya D. moved SYNC-104 to In Progress",
				time: "Just now",
			},
			{ id: 2, text: "Alex K. added comment on SYNC-101", time: "1m ago" },
		]);
	}, []);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setCommandOpen((prev) => !prev);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	useEffect(() => {
		if (!isSimulating) return;
		const timer = setInterval(() => {
			const currentBoard = boardRef.current;
			const allCards = [];
			Object.entries(currentBoard).forEach(([col, tickets]) => {
				tickets.forEach((t) => allCards.push({ id: t.id, col }));
			});
			if (allCards.length > 0) {
				const randomCard =
					allCards[Math.floor(Math.random() * allCards.length)];
				const cols = Object.keys(currentBoard);
				const nextCol = cols[(cols.indexOf(randomCard.col) + 1) % cols.length];
				moveCardToStatus(randomCard.id, nextCol);
			}
		}, 4500);
		return () => clearInterval(timer);
	}, [isSimulating, moveCardToStatus]);

	return (
		<div className="relative rounded-2xl border border-slate-800/80 bg-slate-950/90 shadow-[0_0_80px_-20px_rgba(6,182,212,0.2)] backdrop-blur-xl p-4 sm:p-6 overflow-hidden text-slate-100">
			<style>{customStyles}</style>

			{/* Ambient Background Glows */}
			<div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
			<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

			<div className="relative flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-1.5">
						<div className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors"></div>
						<div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors"></div>
						<div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors"></div>
					</div>
					<div className="h-4 w-px bg-slate-700"></div>
					<span className="font-mono text-xs font-medium text-slate-400">
						flux-workspace <span className="text-slate-600">/</span>{" "}
						<span className="text-slate-200">sprint-24</span>
					</span>
				</div>

				<div className="flex items-center gap-2">
					<button
						onClick={() => setCommandOpen(true)}
						className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-all duration-200"
					>
						<Search className="w-3.5 h-3.5 text-cyan-400" />
						<span className="hidden sm:inline">Search or command...</span>
						<span className="sm:hidden">Search...</span>
						<kbd className="hidden sm:flex px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
							⌘K
						</kbd>
					</button>

					<button
						onClick={handleResetBoard}
						className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-200 border bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-rose-400 hover:border-rose-500/30"
						title="Reset Board State"
					>
						<RotateCcw className="w-3 h-3" />
						<span className="hidden sm:inline">Reset</span>
					</button>

					<button
						onClick={() => setIsSimulating(!isSimulating)}
						className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-200 border ${
							isSimulating
								? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
								: "bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800"
						}`}
					>
						{isSimulating ? (
							<>
								<span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
								<span>Live Syncing</span>
							</>
						) : (
							<>
								<Play className="w-3 h-3" />
								<span>Simulate</span>
							</>
						)}
					</button>
				</div>
			</div>

			{commandOpen && (
				<div
					className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 sm:p-8 flex items-start justify-center"
					style={{ animation: "fadeIn 0.2s ease-out" }}
					onClick={() => setCommandOpen(false)}
				>
					<div
						className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
						onClick={(e) => e.stopPropagation()}
						style={{ animation: "popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
					>
						<div className="p-4 border-b border-slate-800 flex items-center gap-3">
							<Search className="w-4 h-4 text-cyan-400" />
							<input
								type="text"
								autoFocus
								placeholder="Type a command or jump to issue..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
							/>
							<button
								onClick={() => setCommandOpen(false)}
								className="text-slate-500 hover:text-white text-xs font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700"
							>
								ESC
							</button>
						</div>
						<div className="p-2 space-y-1 text-xs font-mono text-slate-300">
							<div
								onClick={() => {
									moveCardNext("SYNC-104");
									setCommandOpen(false);
								}}
								className="p-2.5 rounded-lg hover:bg-cyan-500/10 hover:text-cyan-300 cursor-pointer flex items-center justify-between transition-colors"
							>
								<span className="flex items-center gap-2">
									<Zap className="w-3.5 h-3.5 text-cyan-400" />
									Move SYNC-104 to Next Column
								</span>
								<span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
									↵
								</span>
							</div>
							<div
								onClick={() => {
									setSelectedTicketId("SYNC-104");
									setCommandOpen(false);
								}}
								className="p-2.5 rounded-lg hover:bg-cyan-500/10 hover:text-cyan-300 cursor-pointer flex items-center justify-between transition-colors"
							>
								<span className="flex items-center gap-2">
									<Search className="w-3.5 h-3.5 text-cyan-400" />
									Inspect SYNC-104 Issue Panel
								</span>
								<span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
									↵
								</span>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="relative mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
				{Object.entries(board).map(([column, tickets]) => (
					<div
						key={column}
						className="min-w-0 flex flex-col bg-slate-900/30 rounded-xl p-3 border border-slate-800/60"
					>
						<div className="flex items-center justify-between pb-3 px-1">
							<div className="flex items-center gap-2">
								<h4 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
									{column}
								</h4>
								<span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-[10px] font-mono font-bold text-slate-400 border border-slate-700/50">
									{tickets.length}
								</span>
							</div>

							{column === "In Progress" && (
								<span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
									<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
									Active
								</span>
							)}
						</div>

						<div className="space-y-2.5 flex-1 min-h-[160px]">
							{tickets.length === 0 ? (
								<div className="h-28 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-xs font-mono text-slate-600">
									No issues
								</div>
							) : (
								tickets.map((ticket) => (
									<TicketCard
										key={ticket.id}
										ticket={ticket}
										isActive={selectedTicketId === ticket.id}
										onSelect={setSelectedTicketId}
										onMoveNext={moveCardNext}
									/>
								))
							)}
						</div>
					</div>
				))}
			</div>

			<IssueInspector
				ticket={selectedTicket}
				onClose={() => setSelectedTicketId(null)}
				onStatusChange={(id, status) => moveCardToStatus(id, status)}
			/>

			<div className="relative mt-5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
				<div className="flex items-center gap-2 text-slate-300">
					<Sparkles className="w-3.5 h-3.5 text-cyan-400" />
					<span>
						Click any card to open the{" "}
						<strong className="font-bold text-white">
							Live Issue Inspector
						</strong>
					</span>
				</div>

				<div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800/60">
					<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
					<span>
						{liveActivity[0]?.text}{" "}
						<span className="text-slate-600">({liveActivity[0]?.time})</span>
					</span>
				</div>
			</div>
		</div>
	);
}
