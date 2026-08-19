import React, { useEffect } from "react";
import { X, Keyboard } from "lucide-react";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

export default function ShortcutsModal() {
	const isShortcutsOpen = useWorkspaceStore((state) => state.isShortcutsOpen);
	const setIsShortcutsOpen = useWorkspaceStore((state) => state.setIsShortcutsOpen);
	const setNewTicketCol = useWorkspaceStore((state) => state.setNewTicketCol);
	const setIsCommandPaletteOpen = useWorkspaceStore((state) => state.setIsCommandPaletteOpen);

	// Global hotkeys listener (guarding against typing inside inputs or textareas)
	useEffect(() => {
		const handleKeyDown = (e) => {
			const activeTag = document.activeElement?.tagName?.toLowerCase();
			if (activeTag === "input" || activeTag === "textarea" || document.activeElement?.isContentEditable) {
				return;
			}

			if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
				e.preventDefault();
				setIsShortcutsOpen(!isShortcutsOpen);
			} else if (e.key.toLowerCase() === "c" && !e.metaKey && !e.ctrlKey) {
				e.preventDefault();
				setNewTicketCol("todo");
			} else if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
				e.preventDefault();
				setIsCommandPaletteOpen(true);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isShortcutsOpen, setIsShortcutsOpen, setNewTicketCol, setIsCommandPaletteOpen]);

	if (!isShortcutsOpen) return null;

	const shortcuts = [
		{ key: "Ctrl + K / ⌘K", desc: "Open Command Palette & Global Search" },
		{ key: "C", desc: "Create a new issue / task" },
		{ key: "/", desc: "Quick search tasks & workspaces" },
		{ key: "?", desc: "Open this keyboard shortcuts cheat sheet" },
		{ key: "Esc", desc: "Close any modal, drawer, or dialog" },
		{ key: "Enter (in modal)", desc: "Submit form / Confirm action" },
	];

	return (
		<div
			className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
			onClick={(e) => {
				if (e.target === e.currentTarget) setIsShortcutsOpen(false);
			}}
		>
			<div
				className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-5 overflow-hidden"
				style={{ animation: "cardIn 0.18s cubic-bezier(0.16,1,0.3,1)" }}
			>
				<div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
					<div className="flex items-center gap-2">
						<Keyboard className="h-4 w-4 text-teal-600 dark:text-teal-400" />
						<h3 className="display font-bold text-sm text-slate-900 dark:text-slate-100">
							Keyboard Shortcuts
						</h3>
					</div>
					<button
						type="button"
						onClick={() => setIsShortcutsOpen(false)}
						className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-3 font-mono-ui">
					{shortcuts.map((s, idx) => (
						<div key={idx} className="flex items-center justify-between py-2.5">
							<span className="text-xs text-slate-600 dark:text-slate-300">
								{s.desc}
							</span>
							<kbd className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
								{s.key}
							</kbd>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
