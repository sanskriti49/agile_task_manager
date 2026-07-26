import { Flag, MessageSquare, Clock } from "lucide-react";
import Avatar from "../ui/Avatar";
import { PRIORITY } from "../../data/constants";

export default function TicketCard({
	t,
	i,
	draggedId,
	setDraggedId,
	setSelectedId,
}) {
	return (
		<div
			key={t.id}
			draggable
			onDragStart={() => setDraggedId(t.id)}
			onDragEnd={() => setDraggedId(null)}
			onClick={() => setSelectedId(t.id)}
			style={{ animationDelay: `${i * 35}ms` }}
			className={`group relative cursor-pointer bg-white rounded-xl border border-slate-200/80 hover:border-teal-300 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden ${
				draggedId === t.id ? "opacity-40 scale-[0.98]" : ""
			} ${t.priority === "high" ? "border-t-4 border-t-rose-400" : t.priority === "medium" ? "border-t-4 border-t-amber-400" : "border-t-4 border-t-sky-400"}`}
			role="button"
			tabIndex={0}
			aria-label={`Ticket ${t.id}: ${t.title}`}
		>
			<div className="p-4">
				<div className="flex items-start justify-between gap-2">
					<p className="text-sm font-semibold text-slate-800 leading-snug">
						{t.title}
					</p>
					<span
						className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${PRIORITY[t.priority].chip}`}
					>
						<Flag className="h-2.5 w-2.5" />
					</span>
				</div>
				<p className="text-[11px] text-slate-400 mt-1 font-mono">{t.id}</p>

				{t.tags.length > 0 && (
					<div className="flex flex-wrap gap-1 mt-3">
						{t.tags.map((tag) => (
							<span
								key={tag}
								className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
							>
								{tag}
							</span>
						))}
					</div>
				)}

				<div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
					<div className="flex items-center gap-3 text-slate-400">
						{t.comments.length > 0 && (
							<span className="flex items-center gap-1 text-[11px] font-medium">
								<MessageSquare className="h-3.5 w-3.5" /> {t.comments.length}
							</span>
						)}
						<span className="flex items-center gap-1 text-[11px] font-medium">
							<Clock className="h-3.5 w-3.5" /> {t.due}
						</span>
					</div>
					<Avatar name={t.assignee} size="h-6 w-6 text-[10px]" />
				</div>
			</div>
		</div>
	);
}
