import { lastActivityForWorkspace, pickMembers } from "../../data/workspaces";
import { hashString } from "./hash";
import { paletteFromColor } from "./palette";

export function workspaceMeta(ws) {
	const seed = hashString(ws.id);

	const done = Math.round(((seed % 10) / 10) * ws.tickets);
	const progress = ws.tickets > 0 ? Math.round((done / ws.tickets) * 100) : 0;
	const active = Math.max(ws.tickets - done - 1, 0);

	const palette = paletteFromColor(ws.color);
	const monogram = ws.name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const lastActivity = lastActivityForWorkspace(ws.id);

	const pulse = Array.from({ length: 10 }, (_, i) => {
		const v = ((seed * (i * 13 + 7)) % 97) / 97;
		return Math.max(v, 0.12);
	});

	const memberCount = (seed % 3) + 2;
	const memberNames = pickMembers(seed, memberCount);

	return {
		done,
		progress,
		active,
		palette,
		monogram,
		lastActivity,
		pulse,
		memberNames,
	};
}
