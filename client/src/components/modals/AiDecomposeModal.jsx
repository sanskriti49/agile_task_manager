import React, { useState, useEffect } from "react";
import { X, Sparkles, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

export default function AiDecomposeModal() {
	const {
		isAiDecomposeOpen,
		setIsAiDecomposeOpen,
		selectedTicketForAi,
		createTicket,
	} = useWorkspaceStore();

	const [prompt, setPrompt] = useState("");
	const [isDecomposing, setIsDecomposing] = useState(false);
	const [subtasks, setSubtasks] = useState(null);

	useEffect(() => {
		if (selectedTicketForAi) {
			setPrompt(`Decompose feature: ${selectedTicketForAi.title}`);
		} else {
			setPrompt("Design & Implement Redis Caching Layer for API Endpoints");
		}
	}, [selectedTicketForAi]);

	if (!isAiDecomposeOpen) return null;

	const handleDecompose = async () => {
		if (!prompt.trim()) return;
		setIsDecomposing(true);

		try {
			// Check for Gemini API key env variable
			const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
			if (apiKey) {
				const ai = new GoogleGenAI({ apiKey });
				const response = await ai.models.generateContent({
					model: "gemini-2.5-flash",
					contents: `You are an expert Agile Scrum Master. Decompose this feature request into 3 concrete technical sub-tasks: "${prompt}". Return ONLY JSON array of objects with format: [{"title": "...", "priority": "high"|"medium"|"low", "tags": ["..."], "storyPoints": 3}]`,
				});
				const text = response.text;
				const parsed = JSON.parse(text.replace(/```json|```/g, ""));
				setSubtasks(parsed);
			} else {
				// Fallback intelligent breakdown simulation
				await new Promise((r) => setTimeout(r, 1200));
				setSubtasks([
					{
						title: `Architect DB Schema for ${prompt.slice(0, 25)}...`,
						priority: "high",
						tags: ["Architecture", "Database"],
						storyPoints: 5,
					},
					{
						title: `Implement REST/GraphQL endpoints with validation`,
						priority: "high",
						tags: ["Backend", "API"],
						storyPoints: 3,
					},
					{
						title: `Write unit tests & integrate with Kanban Dashboard`,
						priority: "medium",
						tags: ["Testing", "Frontend"],
						storyPoints: 2,
					},
				]);
			}
		} catch (err) {
			console.error("AI Generation error:", err);
			// Fallback
			setSubtasks([
				{
					title: `Setup baseline configuration for ${prompt.slice(0, 20)}`,
					priority: "high",
					tags: ["Setup"],
					storyPoints: 3,
				},
				{
					title: `Build implementation logic & state handlers`,
					priority: "medium",
					tags: ["Feature"],
					storyPoints: 3,
				},
			]);
		} finally {
			setIsDecomposing(false);
		}
	};

	const handleAddAllToBoard = () => {
		if (!subtasks) return;
		subtasks.forEach((item) => {
			createTicket({
				workspaceId: selectedTicketForAi?.workspaceId || "ws-1",
				title: item.title,
				status: "todo",
				priority: item.priority,
				assignee: "Sanskriti Gupta",
				tags: item.tags || ["AI-Generated"],
				due: `${item.storyPoints} Story Points`,
			});
		});
		setIsAiDecomposeOpen(false);
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4"
			onClick={() => setIsAiDecomposeOpen(false)}
		>
			<div
				className="w-full max-w-lg rounded-2xl border border-indigo-200 bg-white p-6 shadow-2xl transition-all"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between pb-4 border-b border-indigo-100">
					<div className="flex items-center gap-2.5">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
							<Sparkles className="h-5 w-5 text-amber-300" />
						</div>
						<div>
							<h3 className="font-display text-lg font-bold text-stone-900">
								AI Sprint Copilot
							</h3>
							<p className="text-xs text-stone-500 font-mono-ui">
								Gemini 2.5 Auto-Decomposition & Estimation
							</p>
						</div>
					</div>
					<button
						onClick={() => setIsAiDecomposeOpen(false)}
						className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="mt-4 space-y-4">
					<div>
						<label className="block text-xs font-semibold text-stone-700 mb-1">
							Feature Prompt / Epic Goal
						</label>
						<textarea
							rows={2}
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
							placeholder="Describe the feature you want to decompose..."
							className="w-full rounded-lg border border-stone-200 p-3 text-xs text-stone-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono-ui"
						/>
					</div>

					<button
						onClick={handleDecompose}
						disabled={isDecomposing || !prompt.trim()}
						className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:brightness-110 disabled:opacity-50"
					>
						{isDecomposing ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin text-white" />
								Decomposing with Gemini AI...
							</>
						) : (
							<>
								<Sparkles className="h-4 w-4 text-amber-300" />
								Generate Sub-tasks & Estimates
							</>
						)}
					</button>

					{/* Generated Sub-tasks preview */}
					{subtasks && (
						<div className="mt-4 space-y-3">
							<span className="font-mono-ui text-xs font-bold uppercase tracking-wider text-indigo-900">
								Generated Actionable Sub-tasks:
							</span>
							<div className="space-y-2 max-h-56 overflow-y-auto pr-1">
								{subtasks.map((task, idx) => (
									<div
										key={idx}
										className="flex items-start justify-between rounded-xl border border-indigo-100 bg-indigo-50/40 p-3"
									>
										<div className="space-y-1">
											<p className="text-xs font-semibold text-stone-900 leading-snug">
												{task.title}
											</p>
											<div className="flex items-center gap-2 text-[10px] font-mono-ui text-stone-500">
												<span className="rounded bg-indigo-100 px-1.5 py-0.5 text-indigo-700 font-bold">
													{task.storyPoints} Story Pts
												</span>
												<span className="uppercase text-amber-700 font-semibold">
													{task.priority} Priority
												</span>
											</div>
										</div>
										<CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
									</div>
								))}
							</div>

							<div className="pt-2 flex items-center justify-end gap-2">
								<button
									onClick={() => setIsAiDecomposeOpen(false)}
									className="rounded-lg px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100"
								>
									Discard
								</button>
								<button
									onClick={handleAddAllToBoard}
									className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-sm"
								>
									Add Sub-tasks to Board
									<ArrowRight className="h-3.5 w-3.5" />
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
