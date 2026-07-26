import React from "react";
import { Inbox, Plus } from "lucide-react";
import TicketCard from "./TicketCard";

export default function Column({
	col,
	colTickets,
	draggedId,
	dragOverCol,
	justDropped,
	setDraggedId,
	setSelectedId,
	setNewTicketCol,
	setDragOverCol,
	handleDrop,
}) {
	const isOver = dragOverCol === col.id;

	return (
		<div
			key={col.id}
			onDragOver={(e) => {
				e.preventDefault();
				setDragOverCol(col.id);
			}}
			onDragLeave={() => setDragOverCol((c) => (c === col.id ? null : c))}
			onDrop={() => handleDrop(col.id)}
			className={`flex-shrink-0 w-full sm:w-[310px] flex flex-col rounded-2xl border transition-colors duration-200 min-h-0 sm:h-full ${
				isOver
					? "border-teal-300 bg-teal-50/50"
					: "border-slate-200/70 bg-white/60"
			} ${justDropped === col.id ? "drop-flash" : ""}`}
		>
			<div className="flex items-center gap-2 px-3.5 py-3.5 shrink-0">
				<span className={`h-2 w-2 rounded-full ${col.dot}`} />
				<span className="font-semibold text-sm text-slate-700 tracking-tight">
					{col.label}
				</span>
				<span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
					{colTickets.length}
				</span>
				<div className="flex-1" />
				<button
					onClick={() => setNewTicketCol(col.id)}
					className="p-1 rounded-md text-slate-400 hover:text-teal-600 hover:bg-white transition-all duration-150"
					aria-label="Add ticket"
				>
					<Plus className="h-4 w-4" />
				</button>
			</div>

			<div className="flex-1 px-2.5 pb-3 space-y-2 sm:overflow-y-auto">
				{colTickets.length === 0 && (
					<div className="flex flex-col items-center justify-center gap-1.5 border border-dashed border-slate-300 rounded-xl text-center py-8 px-3">
						<Inbox className="h-4 w-4 text-slate-300" />
						<span className="text-xs text-slate-400">No matching issues</span>
					</div>
				)}
				{colTickets.map((t, i) => (
					<TicketCard
						key={t.id}
						t={t}
						i={i}
						draggedId={draggedId}
						setDraggedId={setDraggedId}
						setSelectedId={setSelectedId}
					/>
				))}
			</div>
		</div>
	);
}
