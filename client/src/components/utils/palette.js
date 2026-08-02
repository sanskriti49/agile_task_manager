export const PALETTES = [
	{
		dot: "bg-teal-600",
		text: "text-teal-700",
		tint: "bg-teal-50",
		fill: "bg-teal-600",
	},
	{
		dot: "bg-amber-500",
		text: "text-amber-700",
		tint: "bg-amber-50",
		fill: "bg-amber-500",
	},
	{
		dot: "bg-violet-500",
		text: "text-violet-700",
		tint: "bg-violet-50",
		fill: "bg-violet-500",
	},
	{
		dot: "bg-rose-500",
		text: "text-rose-700",
		tint: "bg-rose-50",
		fill: "bg-rose-500",
	},
];

export function paletteFromColor(colorStr = "") {
	if (colorStr.includes("teal") || colorStr.includes("cyan"))
		return PALETTES[0];
	if (colorStr.includes("amber") || colorStr.includes("orange"))
		return PALETTES[1];
	if (colorStr.includes("violet") || colorStr.includes("purple"))
		return PALETTES[2];
	return PALETTES[3];
}
