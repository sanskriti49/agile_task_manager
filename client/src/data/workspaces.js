import { initialActivity, initialTickets } from "./constants";
import { PEOPLE_NAMES } from "./people";

export const TICKET_WORKSPACE = Object.fromEntries(
	initialTickets.map((t) => [t.id, t.workspaceId]),
);
export function pickMembers(seed, count) {
	const n = Math.min(count, PEOPLE_NAMES.length);
	const start = seed % PEOPLE_NAMES.length;
	return Array.from(
		{ length: n },
		(_, i) => PEOPLE_NAMES[(start + i) % PEOPLE_NAMES.length],
	);
}

export function lastActivityForWorkspace(wsId) {
	return initialActivity.find((a) => TICKET_WORKSPACE[a.ticketId] === wsId);
}
