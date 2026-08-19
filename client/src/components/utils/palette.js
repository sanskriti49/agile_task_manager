export const PALETTES = [
	{
		dot: "bg-teal-500",
		text: "text-teal-700 dark:text-teal-300",
		tint: "bg-teal-50 dark:bg-teal-950/70 border border-teal-200/60 dark:border-teal-800/60",
		fill: "bg-teal-500",
	},
	{
		dot: "bg-amber-500",
		text: "text-amber-700 dark:text-amber-300",
		tint: "bg-amber-50 dark:bg-amber-950/70 border border-amber-200/60 dark:border-amber-800/60",
		fill: "bg-amber-500",
	},
	{
		dot: "bg-indigo-500",
		text: "text-indigo-700 dark:text-indigo-300",
		tint: "bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/60",
		fill: "bg-indigo-500",
	},
	{
		dot: "bg-rose-500",
		text: "text-rose-700 dark:text-rose-300",
		tint: "bg-rose-50 dark:bg-rose-950/70 border border-rose-200/60 dark:border-rose-800/60",
		fill: "bg-rose-500",
	},
];

export function paletteFromColor(colorStr = "") {
	if (colorStr.includes("teal") || colorStr.includes("cyan"))
		return PALETTES[0];
	if (colorStr.includes("amber") || colorStr.includes("orange"))
		return PALETTES[1];
	if (colorStr.includes("violet") || colorStr.includes("purple") || colorStr.includes("indigo"))
		return PALETTES[2];
	return PALETTES[3];
}
