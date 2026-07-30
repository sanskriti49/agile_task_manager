const PROCESS = [
	{
		n: "01",
		title: "Capture",
		body: "Turn a Slack message, a bug report, or a stray idea into a ticket in one line.",
	},
	{
		n: "02",
		title: "Organize",
		body: "Drop it into the right column, assign it, tag it. The board stays honest about what's actually next.",
	},
	{
		n: "03",
		title: "Ship",
		body: "Drag to Done. The activity feed \u2014 and your team \u2014 see it the second you let go.",
	},
];
export default function ProcessSection() {
	return (
		<section className="py-24 sm:py-28 bg-white">
			<div className="max-w-6xl mx-auto px-5 sm:px-8">
				<div className="max-w-xl">
					<span className="mono text-[11px] font-medium tracking-wide text-teal-600">
						HOW IT WORKS
					</span>
					<h2 className="display mt-3 text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
						From idea to done, in three moves.
					</h2>
				</div>
				<div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-0 sm:divide-x sm:divide-slate-200">
					{PROCESS.map((step) => (
						<div key={step.n} className="sm:px-8 sm:first:pl-0 sm:last:pr-0">
							<span className="mono text-3xl font-medium text-teal-500/30">
								{step.n}
							</span>
							<h3 className="display mt-3 text-lg font-semibold text-slate-900">
								{step.title}
							</h3>
							<p className="onest mt-2 text-[14px] leading-relaxed text-slate-500">
								{step.body}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
