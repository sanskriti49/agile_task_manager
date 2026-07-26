import { X, Flag, Send } from "lucide-react";
import Avatar from "../ui/Avatar";
import { PRIORITY, COLUMNS } from "../../data/constants";

export default function TicketDetailPanel({ boardData }) {
	const {
		selected,
		setSelectedId,
		commentDraft,
		setCommentDraft,
		handleAddComment,
	} = boardData;

	return (
		<div
			className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-slate-200 panel-elevated z-40 ease-premium transition-transform duration-300 ${
				selected ? "translate-x-0" : "translate-x-full"
			}`}
			role="dialog"
			aria-label="Ticket details"
		>
			{selected && (
				<>
					<div className="h-1 brand-gradient" />
					<div className="h-16 border-b border-slate-200 flex items-center px-5 gap-3">
						<span className="mono text-xs text-slate-400">{selected.id}</span>
						<span
							className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${PRIORITY[selected.priority].chip}`}
						>
							{PRIORITY[selected.priority].label}
						</span>
						<div className="flex-1" />
						<button
							onClick={() => setSelectedId(null)}
							className="p-1 rounded hover:bg-slate-100 text-slate-400"
							aria-label="Close ticket details"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
					<div className="overflow-y-auto h-[calc(100%-4.25rem)] px-5 py-4">
						<h2 className="display font-semibold text-lg text-slate-900 leading-snug tracking-tight">
							{selected.title}
						</h2>
						<p className="text-sm text-slate-500 mt-2 leading-relaxed">
							{selected.description || "No description yet."}
						</p>

						<div className="flex items-center gap-3 mt-4 pb-4 border-b border-slate-100">
							<div className="flex items-center gap-1.5">
								<Avatar
									name={selected.assignee}
									size="h-6 w-6 text-[10px]"
									presence
								/>
								<span className="text-xs text-slate-500">
									{selected.assignee}
								</span>
							</div>
							<div className="flex items-center gap-1 text-xs text-slate-400">
								<Flag className="h-3 w-3" />{" "}
								{COLUMNS.find((c) => c.id === selected.status)?.label}
							</div>
						</div>

						<p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-4 mb-2">
							Comments
						</p>
						<div className="space-y-3">
							{selected.comments.length === 0 && (
								<p className="text-xs text-slate-400">No comments yet.</p>
							)}
							{selected.comments.map((c, i) => (
								<div key={i} className="flex gap-2">
									<Avatar name={c.author} size="h-6 w-6 text-[10px]" />
									<div className="bg-slate-50 rounded-lg px-3 py-2 flex-1">
										<div className="flex items-baseline gap-2">
											<span className="text-xs font-medium text-slate-700">
												{c.author}
											</span>
											<span className="mono text-[10px] text-slate-300">
												{c.time}
											</span>
										</div>
										<p className="text-xs text-slate-600 mt-0.5">{c.text}</p>
									</div>
								</div>
							))}
						</div>

						<div className="flex items-center gap-2 mt-4">
							<input
								value={commentDraft}
								onChange={(e) => setCommentDraft(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
								placeholder="Add a comment"
								className="flex-1 text-xs px-3 py-2 rounded-lg bg-slate-100 border border-transparent focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none ease-premium transition-all duration-200"
								aria-label="Comment text"
							/>
							<button
								onClick={handleAddComment}
								className="p-2 rounded-lg brand-gradient text-white hover:brightness-110 ease-premium transition-all duration-150 shadow-sm shadow-indigo-200"
								aria-label="Send comment"
							>
								<Send className="h-3.5 w-3.5" />
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
