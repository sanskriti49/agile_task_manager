import React, { useState, useEffect } from "react";
import { X, Rocket } from "lucide-react";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { FOCUS_RING } from "../../data/constants";

export default function CreateWorkspaceModal({ isOpen, onClose }) {
	const [workspaceName, setWorkspaceName] = useState("");
	const [description, setDescription] = useState("");

	const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);

	useEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	function handleSubmit(e) {
		e.preventDefault();
		if (!workspaceName.trim()) return;

		createWorkspace({ workspaceName, description });

		setWorkspaceName("");
		setDescription("");
		onClose();
	}

	return (
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
			onClick={onClose}
		>
			<form
				onClick={(e) => e.stopPropagation()}
				onSubmit={handleSubmit}
				className="card-enter w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
			>
				<div className="h-1.5 bg-teal-500" />

				<div className="p-6">
					<div className="mb-6 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500">
								<Rocket className="h-5 w-5 text-white" />
							</div>
							<h3 className="display text-lg font-semibold tracking-tight text-slate-900">
								Create workspace
							</h3>
						</div>
						<button
							type="button"
							onClick={onClose}
							aria-label="Close"
							className={`rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 ${FOCUS_RING}`}
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					<div className="space-y-5">
						<div>
							<label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
								Workspace name
							</label>
							<input
								value={workspaceName}
								onChange={(e) => setWorkspaceName(e.target.value)}
								autoFocus
								required
								placeholder="e.g. Design Team"
								className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-1 focus:ring-teal-100"
							/>
						</div>
						<div>
							<label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
								Description{" "}
								<span className="font-normal normal-case text-slate-300">
									(optional)
								</span>
							</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={2}
								placeholder="What is this workspace for?"
								className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-1 focus:ring-teal-100"
							/>
						</div>
					</div>

					<div className="mt-8 flex items-center justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							className={`rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 ${FOCUS_RING}`}
						>
							Cancel
						</button>
						<button
							type="submit"
							className={`rounded-lg bg-teal-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-teal-600 ${FOCUS_RING}`}
						>
							Create workspace
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}
