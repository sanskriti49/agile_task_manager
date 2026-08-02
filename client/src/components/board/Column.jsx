import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Inbox, Plus } from "lucide-react";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

export default function Column({ col, colTickets = [] }) {
	const setSelectedTicket = useWorkspaceStore(
		(state) => state.setSelectedTicket,
	);
	const setNewTicketCol = useWorkspaceStore((state) => state.setNewTicketCol);

	return (
		<div className="flex-shrink-0 w-80 flex flex-col rounded-2xl border border-slate-200/70 bg-white/60 p-4 min-h-[500px] h-[calc(100vh-140px)]">
			{/* Column Header */}
			<div className="flex items-center justify-between mb-3 shrink-0">
				<div className="flex items-center gap-2">
					<span
						className={`h-2.5 w-2.5 rounded-full ${col.dot || "bg-slate-400"}`}
					/>
					<span className="display font-semibold text-sm text-slate-700">
						{col.label}
					</span>
					<span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
						{colTickets.length}
					</span>
				</div>
				<button
					type="button"
					onClick={() => setNewTicketCol(col.id)}
					className="p-1 rounded-md text-slate-400 hover:text-teal-600 hover:bg-slate-100 transition-colors"
					aria-label={`Add ticket to ${col.label}`}
				>
					<Plus className="h-4 w-4" />
				</button>
			</div>

			{/* Droppable Container */}
			<Droppable droppableId={String(col.id)} ignoreContainerClipping={true}>
				{(provided, snapshot) => (
					<div
						ref={provided.innerRef}
						{...provided.droppableProps}
						className={`flex-1 space-y-2 overflow-y-auto min-h-0 rounded-xl p-1 transition-colors duration-200 ${
							snapshot.isDraggingOver
								? "bg-teal-50/50 border border-teal-200"
								: ""
						}`}
					>
						{colTickets.length === 0 && (
							<div className="flex flex-col items-center justify-center gap-1.5 border border-dashed border-slate-300 rounded-xl text-center py-8 px-3">
								<Inbox className="h-4 w-4 text-slate-300" />
								<span className="onest text-xs text-slate-400">
									No issues in {col.label}
								</span>
							</div>
						)}

						{colTickets.map((t, index) => (
							<Draggable
								key={String(t.id)}
								draggableId={String(t.id)}
								index={index}
							>
								{(provided, snapshot) => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										{...provided.dragHandleProps}
										style={{
											...provided.draggableProps.style,
										}}
										onClick={() => {
											if (!snapshot.isDragging) {
												setSelectedTicket(t);
											}
										}}
										className={`p-4 bg-white border border-stone-200 rounded-xl shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
											snapshot.isDragging
												? "shadow-xl ring-2 ring-teal-500 z-50 scale-[1.02]"
												: ""
										}`}
									>
										<p className="onest text-sm font-medium text-stone-800 leading-snug">
											{t.title}
										</p>
										<div className="mt-2 flex items-center justify-between">
											<span className="text-xs font-mono text-stone-400">
												{t.task_key || t.id}
											</span>
											{(t.assignee_name || t.assignee) && (
												<span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
													{t.assignee_name || t.assignee}
												</span>
											)}
										</div>
									</div>
								)}
							</Draggable>
						))}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</div>
	);
}
