import React, { useState } from "react";
import { X, History, Play, Pause, RotateCcw, Database } from "lucide-react";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

export default function TimeTravelModal() {
	const { isTimeTravelOpen, setIsTimeTravelOpen, activityLog } =
		useWorkspaceStore();

	const [stepIndex, setStepIndex] = useState(activityLog.length - 1);
	const [isPlaying, setIsPlaying] = useState(false);

	if (!isTimeTravelOpen) return null;

	const currentEvent = activityLog[stepIndex] || activityLog[0];
	const maxSteps = activityLog.length - 1;

	const handlePlayToggle = () => {
		if (isPlaying) {
			setIsPlaying(false);
			return;
		}

		setIsPlaying(true);
		let curr = stepIndex;

		const interval = setInterval(() => {
			curr -= 1;
			if (curr < 0) {
				curr = maxSteps;
			}
			setStepIndex(curr);
		}, 1500);

		// Save interval cleanup via window state reference
		window._timeTravelInterval = interval;
	};

	const handleClose = () => {
		if (window._timeTravelInterval) clearInterval(window._timeTravelInterval);
		setIsPlaying(false);
		setIsTimeTravelOpen(false);
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4"
			onClick={handleClose}
		>
			<div
				className="w-full max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl transition-all"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between pb-4 border-b border-stone-100">
					<div className="flex items-center gap-2">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md">
							<History className="h-5 w-5" />
						</div>
						<div>
							<h3 className="font-display text-lg font-bold text-stone-900 flex items-center gap-2">
								Time-Travel Audit Replay Engine
								<span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono-ui text-[10px] font-semibold text-emerald-700">
									MongoDB Stream
								</span>
							</h3>
							<p className="text-xs text-stone-500">
								Scrub through historical board state changes stored in MongoDB
								time-series collection.
							</p>
						</div>
					</div>
					<button
						onClick={handleClose}
						className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Current Replay Snapshot Card */}
				<div className="my-6 rounded-xl border border-teal-200 bg-teal-50/60 p-4">
					<div className="flex items-center justify-between font-mono-ui text-xs text-teal-800 mb-2">
						<span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
							<Database className="h-3.5 w-3.5" />
							Event #{maxSteps - stepIndex + 1} of {maxSteps + 1}
						</span>
						<span>{currentEvent?.time}</span>
					</div>

					<div className="space-y-1">
						<p className="text-sm font-bold text-stone-900">
							{currentEvent?.actor}{" "}
							<span className="font-normal text-stone-600">
								{currentEvent?.type}
							</span>{" "}
							{currentEvent?.ticketId}
						</p>
						<p className="text-xs text-stone-600 font-mono-ui">
							Detail:{" "}
							<span className="font-semibold text-teal-900">
								{currentEvent?.detail}
							</span>
						</p>
						<p className="text-[11px] text-stone-400">
							Ticket: "{currentEvent?.ticketTitle || "Task Item"}"
						</p>
					</div>
				</div>

				{/* Timeline Range Scrubber */}
				<div className="space-y-3">
					<div className="flex items-center justify-between text-xs font-mono-ui font-semibold text-stone-600">
						<span>Latest Event</span>
						<span>Oldest Event</span>
					</div>
					<input
						type="range"
						min="0"
						max={maxSteps}
						value={stepIndex}
						onChange={(e) => setStepIndex(Number(e.target.value))}
						className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
					/>
				</div>

				{/* Playback Controllers */}
				<div className="mt-6 flex items-center justify-between pt-4 border-t border-stone-100">
					<div className="flex items-center gap-2">
						<button
							onClick={handlePlayToggle}
							className={`flex items-center gap-1.5 rounded-lg px-4 py-2 font-mono-ui text-xs font-semibold text-white transition-colors ${
								isPlaying
									? "bg-amber-600 hover:bg-amber-700"
									: "bg-teal-600 hover:bg-teal-700"
							}`}
						>
							{isPlaying ? (
								<Pause className="h-3.5 w-3.5" />
							) : (
								<Play className="h-3.5 w-3.5" />
							)}
							{isPlaying ? "Pause Replay" : "Auto Play Replay"}
						</button>
						<button
							onClick={() => setStepIndex(activityLog.length - 1)}
							className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 font-mono-ui text-xs font-medium text-stone-700 hover:bg-stone-100"
						>
							<RotateCcw className="h-3.5 w-3.5 text-stone-500" />
							Reset to Latest
						</button>
					</div>
					<button
						onClick={handleClose}
						className="rounded-lg px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100"
					>
						Close Engine
					</button>
				</div>
			</div>
		</div>
	);
}
