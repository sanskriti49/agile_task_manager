import React, { useState } from "react";
import { X, Flame, Calendar, Target, Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

export default function CreateSprintModal() {
	const { id: routeProjectId } = useParams();
	const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
	const projectId = routeProjectId || currentWorkspace?.id;

	const isOpen = useWorkspaceStore((state) => state.isCreateSprintModalOpen);
	const setIsOpen = useWorkspaceStore((state) => state.setIsCreateSprintModalOpen);
	const createSprint = useWorkspaceStore((state) => state.createSprint);

	const [name, setName] = useState("");
	const [goal, setGoal] = useState("");
	const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
	const [endDate, setEndDate] = useState(
		new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
	);
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (!isOpen) return null;

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!name.trim() || isSubmitting || !projectId) return;

		setIsSubmitting(true);
		try {
			await createSprint(projectId, {
				name: name.trim(),
				goal: goal.trim(),
				start_date: startDate,
				end_date: endDate,
			});
			setName("");
			setGoal("");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div
			className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
			onClick={(e) => {
				if (e.target === e.currentTarget) setIsOpen(false);
			}}
		>
			<div
				className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 overflow-hidden flex flex-col"
				style={{ animation: "cardIn 0.2s cubic-bezier(0.16,1,0.3,1)" }}
			>
				<div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
					<div className="flex items-center gap-2">
						<div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
							<Flame className="h-4 w-4" />
						</div>
						<div>
							<h3 className="display font-bold text-base text-slate-900 dark:text-slate-100">
								Create New Agile Sprint
							</h3>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								Plan iterative work cycles with defined goals
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={() => setIsOpen(false)}
						className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4 mt-4 font-mono-ui">
					<div>
						<label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
							Sprint Name *
						</label>
						<input
							type="text"
							required
							placeholder="e.g. Sprint 1 - Auth & Core API"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-950"
						/>
					</div>

					<div>
						<label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
							Sprint Goal
						</label>
						<textarea
							rows={3}
							placeholder="What is the key deliverable or business objective for this sprint?"
							value={goal}
							onChange={(e) => setGoal(e.target.value)}
							className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-950 resize-none"
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
								Start Date
							</label>
							<input
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-slate-900 dark:text-slate-100 outline-none focus:border-teal-500"
							/>
						</div>
						<div>
							<label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
								End Date
							</label>
							<input
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-slate-900 dark:text-slate-100 outline-none focus:border-teal-500"
							/>
						</div>
					</div>

					<div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting || !name.trim()}
							className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 transition-colors"
						>
							{isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Flame className="h-3.5 w-3.5" />}
							{isSubmitting ? "Creating..." : "Create Sprint"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
