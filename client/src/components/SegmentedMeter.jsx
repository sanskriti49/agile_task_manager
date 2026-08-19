import React from "react";

export default function SegmentedMeter({
	progress = 0,
	palette = { fill: "bg-teal-500" },
	segments = 10,
}) {
	const safeProgress = Math.min(Math.max(progress, 0), 100);
	const filled = Math.round((safeProgress / 100) * segments);

	return (
		<div className="flex gap-0.5">
			{Array.from({ length: segments }).map((_, i) => (
				<span
					key={i}
					className={`h-1.5 flex-1 rounded-sm transition-colors ${
						i < filled
							? palette?.fill || "bg-teal-500"
							: "bg-slate-100 dark:bg-slate-800"
					}`}
				/>
			))}
		</div>
	);
}
