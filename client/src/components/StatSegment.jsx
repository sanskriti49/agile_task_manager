export function StatSegment({ icon: Icon, label, value, emphasized }) {
	return (
		<div
			className={`rounded-lg border border-stone-200 bg-white px-4 py-3 sm:flex-1 sm:rounded-none sm:border-0 sm:px-5 sm:py-4 ${emphasized ? "bg-teal-50 sm:bg-teal-50" : ""}`}
		>
			<div className="flex items-center gap-1.5 text-stone-400">
				<Icon className="h-3.5 w-3.5" />
				<span className="font-mono-ui text-xs uppercase tracking-wide">
					{label}
				</span>
			</div>
			<p
				className={`font-display mt-1.5 text-2xl font-semibold ${emphasized ? "text-teal-700" : "text-stone-900"}`}
			>
				{value}
			</p>
		</div>
	);
}
