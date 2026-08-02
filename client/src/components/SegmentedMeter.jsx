import React from "react";

export default function SegmentedMeter({
	progress = 0,
	palette = { fill: "bg-teal-600" },
	segments = 10,
}) {
	const safeProgress = Math.min(Math.max(progress, 0), 100);
	const filled = Math.round((safeProgress / 100) * segments);

	return (
		<div className="flex gap-0.5">
			{Array.from({ length: segments }).map((_, i) => (
				<span
					key={i}
					className={`h-1.5 flex-1 rounded-sm ${i < filled ? palette?.fill || "bg-teal-600" : "bg-stone-100"}`}
				/>
			))}
		</div>
	);
}
