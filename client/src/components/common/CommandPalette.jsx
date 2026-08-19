import React, { useState, useEffect, useRef } from "react";
import {
	Search,
	Plus,
	CheckSquare,
	BarChart3,
	LayoutGrid,
	Moon,
	Sun,
	Zap,
	LogOut,
	HelpCircle,
	FolderKanban,
	Flame,
	ArrowRight,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";

export default function CommandPalette() {
	const navigate = useNavigate();
	const { id: currentWorkspaceId } = useParams();

	const isCommandPaletteOpen = useWorkspaceStore((state) => state.isCommandPaletteOpen);
	const setIsCommandPaletteOpen = useWorkspaceStore((state) => state.setIsCommandPaletteOpen);
	const setIsCreateWorkspaceModalOpen = useWorkspaceStore((state) => state.setIsCreateWorkspaceModalOpen);
	const setIsCreateSprintModalOpen = useWorkspaceStore((state) => state.setIsCreateSprintModalOpen);
	const setIsShortcutsOpen = useWorkspaceStore((state) => state.setIsShortcutsOpen);
	const setNewTicketCol = useWorkspaceStore((state) => state.setNewTicketCol);
	const workspaces = useWorkspaceStore((state) => state.workspaces) || [];
	const searchResults = useWorkspaceStore((state) => state.searchResults);
	const searchGlobal = useWorkspaceStore((state) => state.searchGlobal);
	const setSelectedTicket = useWorkspaceStore((state) => state.setSelectedTicket);

	const logout = useAuthStore((state) => state.logout);
	const theme = useThemeStore((state) => state.theme);
	const toggleTheme = useThemeStore((state) => state.toggleTheme);

	const [query, setQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const inputRef = useRef(null);

	// Debounced search
	useEffect(() => {
		const timer = setTimeout(() => {
			if (query.trim().length >= 2) {
				searchGlobal(query);
			}
		}, 200);
		return () => clearTimeout(timer);
	}, [query, searchGlobal]);

	// Global Keyboard listener for Ctrl+K / Cmd+K and Esc
	useEffect(() => {
		const handleKeyDown = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setIsCommandPaletteOpen(!isCommandPaletteOpen);
			}
			if (e.key === "Escape" && isCommandPaletteOpen) {
				setIsCommandPaletteOpen(false);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

	useEffect(() => {
		if (isCommandPaletteOpen) {
			setQuery("");
			setSelectedIndex(0);
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [isCommandPaletteOpen]);

	if (!isCommandPaletteOpen) return null;

	const defaultActions = [
		{
			id: "create-task",
			label: "Create New Issue",
			category: "Actions",
			icon: Plus,
			shortcut: "C",
			action: () => {
				setIsCommandPaletteOpen(false);
				setNewTicketCol("todo");
			},
		},
		{
			id: "create-sprint",
			label: "Create Agile Sprint",
			category: "Actions",
			icon: Flame,
			action: () => {
				setIsCommandPaletteOpen(false);
				setIsCreateSprintModalOpen(true);
			},
		},
		{
			id: "my-work",
			label: "Go to My Work Space",
			category: "Navigation",
			icon: CheckSquare,
			action: () => {
				setIsCommandPaletteOpen(false);
				navigate("/my-work");
			},
		},
		{
			id: "dashboard",
			label: "Go to Workspaces Dashboard",
			category: "Navigation",
			icon: LayoutGrid,
			action: () => {
				setIsCommandPaletteOpen(false);
				navigate("/dashboard");
			},
		},
		...(currentWorkspaceId
			? [
					{
						id: "sprints-view",
						label: "Open Sprint Planning & Burndown",
						category: "Navigation",
						icon: Flame,
						action: () => {
							setIsCommandPaletteOpen(false);
							navigate(`/workspace/${currentWorkspaceId}/sprints`);
						},
					},
					{
						id: "analytics-view",
						label: "Open Project Analytics Dashboard",
						category: "Navigation",
						icon: BarChart3,
						action: () => {
							setIsCommandPaletteOpen(false);
							navigate(`/workspace/${currentWorkspaceId}/dashboard`);
						},
					},
				]
			: []),
		{
			id: "toggle-theme",
			label: `Switch to ${theme === "light" ? "Dark" : "Light"} Mode`,
			category: "Preferences",
			icon: theme === "light" ? Moon : Sun,
			action: () => {
				toggleTheme();
				setIsCommandPaletteOpen(false);
			},
		},
		{
			id: "shortcuts",
			label: "Show Keyboard Shortcuts",
			category: "Help",
			icon: HelpCircle,
			shortcut: "?",
			action: () => {
				setIsCommandPaletteOpen(false);
				setIsShortcutsOpen(true);
			},
		},
		{
			id: "logout",
			label: "Log Out",
			category: "Account",
			icon: LogOut,
			action: () => {
				setIsCommandPaletteOpen(false);
				logout();
				navigate("/");
			},
		},
	];

	// Filtered items based on query
	let filteredItems = [];

	if (query.trim().length >= 2) {
		const taskMatches = (searchResults.tasks || []).map((t) => ({
			id: `task-${t.id}`,
			label: `${t.task_key || ""}: ${t.title}`,
			subtext: `${t.project_name || "Task"} · ${t.status}`,
			category: "Tasks",
			icon: Zap,
			action: () => {
				setIsCommandPaletteOpen(false);
				navigate(`/workspace/${t.project_id}`);
				setTimeout(() => setSelectedTicket(t), 250);
			},
		}));

		const projectMatches = (searchResults.projects || []).map((p) => ({
			id: `project-${p.id}`,
			label: p.name,
			subtext: `${p.task_count || 0} issues`,
			category: "Workspaces",
			icon: FolderKanban,
			action: () => {
				setIsCommandPaletteOpen(false);
				navigate(`/workspace/${p.id}`);
			},
		}));

		filteredItems = [...taskMatches, ...projectMatches, ...defaultActions.filter((a) =>
			a.label.toLowerCase().includes(query.toLowerCase()),
		)];
	} else {
		filteredItems = defaultActions;
	}

	const handleKeyDown = (e) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((i) => (i + 1) % filteredItems.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length);
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (filteredItems[selectedIndex]) {
				filteredItems[selectedIndex].action();
			}
		}
	};

	return (
		<div
			className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
			onClick={(e) => {
				if (e.target === e.currentTarget) setIsCommandPaletteOpen(false);
			}}
		>
			<div
				className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col"
				style={{ animation: "cardIn 0.18s cubic-bezier(0.16,1,0.3,1)" }}
			>
				{/* Search Bar */}
				<div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
					<Search className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
					<input
						ref={inputRef}
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							setSelectedIndex(0);
						}}
						onKeyDown={handleKeyDown}
						placeholder="Type a command or search tasks, projects..."
						className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
					/>
					<kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono-ui text-[10px] text-slate-400">
						ESC to close
					</kbd>
				</div>

				{/* Results List */}
				<div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100/50 dark:divide-slate-800/40">
					{filteredItems.length === 0 ? (
						<div className="py-12 text-center text-xs text-slate-400 font-mono-ui">
							No matching commands or items found for "{query}".
						</div>
					) : (
						filteredItems.map((item, index) => {
							const Icon = item.icon;
							const isSelected = index === selectedIndex;
							return (
								<button
									key={item.id}
									type="button"
									onClick={item.action}
									onMouseEnter={() => setSelectedIndex(index)}
									className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-100 ${
										isSelected
											? "bg-teal-500 text-white shadow-xs"
											: "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70"
									}`}
								>
									<div className="flex items-center gap-3 min-w-0">
										<div
											className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
												isSelected
													? "bg-white/20 text-white"
													: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
											}`}
										>
											<Icon className="h-3.5 w-3.5" />
										</div>
										<div className="min-w-0">
											<p className="text-xs font-semibold truncate">
												{item.label}
											</p>
											{item.subtext && (
												<p
													className={`text-[11px] truncate ${
														isSelected ? "text-teal-100" : "text-slate-400 dark:text-slate-500"
													}`}
												>
													{item.subtext}
												</p>
											)}
										</div>
									</div>

									<div className="flex items-center gap-2 shrink-0">
										<span
											className={`text-[10px] font-mono-ui uppercase tracking-wide px-1.5 py-0.5 rounded ${
												isSelected
													? "bg-white/20 text-white"
													: "bg-slate-100 dark:bg-slate-800 text-slate-400"
											}`}
										>
											{item.category}
										</span>
										{item.shortcut && (
											<kbd
												className={`px-1.5 py-0.5 rounded text-[10px] font-mono-ui font-bold ${
													isSelected
														? "bg-white/20 text-white"
														: "bg-slate-100 dark:bg-slate-800 text-slate-500"
												}`}
											>
												{item.shortcut}
											</kbd>
										)}
									</div>
								</button>
							);
						})
					)}
				</div>
			</div>
		</div>
	);
}
