import React, { useState } from "react";
import { X, Sliders, Check } from "lucide-react";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { COLUMNS } from "../../data/constants";

export default function WipLimitModal() {
	const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
	const wipLimits = useWorkspaceStore((state) => state.wipLimits) || {};
	const setWipLimit = useWorkspaceStore((state) => state.setWipLimit);
	const isOpen = useWorkspaceStore((state) => state.isWipLimitModalOpen);
	const setIsOpen = useWorkspaceStore((state) => state.setIsWipLimitModalOpen);

	const [limits, setLimits] = useState({
		backlog: wipLimits.backlog || 20,
		todo: wipLimits.todo || 10,
		inprogress: wipLimits.inprogress || 4,
		done: wipLimits.done || 30,
	});

	if (!isOpen || !currentWorkspace) return null;

	const handleSave = async () => {
		for (const [col, limit] of Object.entries(limits)) {
			await setWipLimit(currentWorkspace.id, col, limit);
		}
		setIsOpen(false);
	};

	return (
		<div
			className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
			onClick={(e) => {
				if (e.target === e.currentTarget) setIsOpen(false);
			}}
		>
			<div
				className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-5 overflow-hidden"
				style={{ animation: "cardIn 0.18s cubic-bezier(0.16,1,0.3,1)" }}
			>
				<div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
					<div className="flex items-center gap-2">
						<Sliders className="h-4 w-4 text-teal-600 dark:text-teal-400" />
						<h3 className="display font-bold text-sm text-slate-900 dark:text-slate-100">
							Configure Column WIP Limits
						</h3>
					</div>
					<button
						type="button"
						onClick={() => setIsOpen(false)}
						className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<p className="text-xs text-slate-500 dark:text-slate-400 mt-2 inter leading-relaxed">
					Set Work-In-Progress (WIP) limits per column. Visual warning banners
					appear when tasks exceed these thresholds.
				</p>

				<div className="space-y-3 mt-4 onest">
					{COLUMNS.map((col) => (
						<div key={col.id} className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className={`h-2 w-2 rounded-full ${col.dot}`} />
								<span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
									{col.label}
								</span>
							</div>
							<input
								type="number"
								min="1"
								max="100"
								value={limits[col.id] || 5}
								onChange={(e) =>
									setLimits({
										...limits,
										[col.id]: parseInt(e.target.value, 10) || 1,
									})
								}
								className="w-20 text-center text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-slate-900 dark:text-slate-100 outline-none focus:border-teal-500"
							/>
						</div>
					))}
				</div>

				<div className="onest flex justify-end gap-2 mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 duration:200">
					<button
						type="button"
						onClick={() => setIsOpen(false)}
						className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800  duration:200"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleSave}
						className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700  duration:200 text-white shadow-xs"
					>
						<Check className="h-3.5 w-3.5" /> Save Limits
					</button>
				</div>
			</div>
		</div>
	);
}
