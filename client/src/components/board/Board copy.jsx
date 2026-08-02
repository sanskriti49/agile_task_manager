import React from "react";
import Column from "./Column";
import { COLUMNS } from "../../data/constants";
import Topbar from "../layout/Topbar";
import { useParams } from "react-router-dom";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import NewTicketModal from "../modals/NewTicketModal";

export default function Board({ boardData }) {
	const { id } = useParams();

	const workspaces = useWorkspaceStore((state) => state.workspaces);
	const currentWorkspace = workspaces.find((ws) => ws.id === id);

	const {
		filtered,
		draggedId,
		dragOverCol,
		justDropped,
		setDraggedId,
		setSelectedId,
		setNewTicketCol,
		setDragOverCol,
		handleDrop,
		newTicketCol,
		handleCreateTicket,
	} = boardData;

	if (currentWorkspace && currentWorkspace.tickets === 0) {
		return (
			<div className="flex flex-col h-full min-h-0">
				<Topbar boardData={boardData} />
				<div className="flex-1 flex items-center justify-center min-h-0 p-4">
					<div className="text-center p-8 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
						<h2 className="text-xl font-semibold text-slate-700">
							This board is empty
						</h2>
						<p className="text-slate-500 mt-1 mb-4">
							Create your first ticket to get started!
						</p>
						<button className="px-4 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors">
							+ Add Ticket
						</button>
					</div>
				</div>
				<NewTicketModal
					newTicketCol={newTicketCol}
					setNewTicketCol={setNewTicketCol}
					handleCreateTicket={handleCreateTicket}
				/>
			</div>
		);
	}

	const workspaceTickets = filtered.filter((t) => t.workspaceId === id);

	return (
		<div className="flex flex-col h-full min-h-0">
			<Topbar boardData={boardData} />

			<div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto sm:overflow-y-hidden px-4 md:px-6 py-5 dot-grid ">
				<div className="flex flex-col sm:flex-row gap-4 h-auto min-h-0 pb-4 sm:pb-0">
					{COLUMNS.map((col) => {
						const colTickets = workspaceTickets.filter(
							(t) => t.status === col.id,
						);
						return (
							<Column
								key={col.id}
								col={col}
								colTickets={colTickets}
								draggedId={draggedId}
								dragOverCol={dragOverCol}
								justDropped={justDropped}
								setDraggedId={setDraggedId}
								setSelectedId={setSelectedId}
								setNewTicketCol={setNewTicketCol}
								setDragOverCol={setDragOverCol}
								handleDrop={handleDrop}
							/>
						);
					})}
				</div>
			</div>
			<NewTicketModal
				newTicketCol={newTicketCol}
				setNewTicketCol={setNewTicketCol}
				handleCreateTicket={handleCreateTicket}
			/>
		</div>
	);
}
