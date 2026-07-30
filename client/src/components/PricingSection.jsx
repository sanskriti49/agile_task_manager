import { ArrowRight, Check } from "lucide-react";

const TIERS = [
	{
		name: "Hacker",
		price: "$0",
		cadence: "forever",
		desc: "For solo builders and tiny teams just getting started.",
		cta: "Start free",
		features: [
			"Up to 5 members",
			"Unlimited tickets",
			"3 Workspaces",
			"Basic activity log",
		],
		highlight: false,
	},
	{
		name: "Team",
		price: "$8",
		cadence: "per user / month",
		desc: "For growing teams that need automation and integrations.",
		cta: "Start 14-day trial",
		features: [
			"Unlimited members",
			"Unlimited workspaces",
			"GitHub & Slack sync",
			"Advanced audit log",
			"Custom ticket fields",
		],
		highlight: true,
	},
	{
		name: "Enterprise",
		price: "Custom",
		cadence: "contact us",
		desc: "For organizations that need security, control, and SSO.",
		cta: "Book a demo",
		features: [
			"SAML / SSO",
			"Role-based access control",
			"Dedicated support engineer",
			"On-prem hosting option",
		],
		highlight: false,
	},
];

export function PricingSection() {
	return (
		<section id="pricing" className="py-24 sm:py-28 bg-stone-50">
			<div className="max-w-6xl mx-auto px-5 sm:px-8">
				<div className="max-w-xl mx-auto text-center">
					<span className="font-mono text-[11px] font-medium tracking-wide text-teal-600">
						PRICING
					</span>
					<h2 className="display mt-3 text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
						Pricing that scales with your team.
					</h2>
					<p className="onest mt-4 text-slate-500 leading-relaxed">
						Free forever for small teams. No hidden fees, cancel anytime.
					</p>
				</div>

				<div className="onest mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
					{TIERS.map((tier) => (
						<div
							key={tier.name}
							className={`relative flex flex-col rounded-2xl p-7 transition-transform ease-premium duration-300 hover:-translate-y-1 ${
								tier.highlight
									? "bg-slate-900 ring-2 ring-teal-500 shadow-2xl shadow-teal-900/10"
									: "bg-white ring-1 ring-stone-200"
							}`}
						>
							{tier.highlight && (
								<span className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono-ui rounded-full bg-teal-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
									Most Popular
								</span>
							)}

							<h3
								className={`font-display text-lg font-semibold ${tier.highlight ? "text-white" : "text-slate-900"}`}
							>
								{tier.name}
							</h3>

							<div className="mt-4 flex items-baseline gap-1.5">
								<span
									className={`font-display text-4xl font-semibold ${tier.highlight ? "text-white" : "text-slate-900"}`}
								>
									{tier.price}
								</span>
								<span
									className={`font-mono-ui text-xs ${tier.highlight ? "text-slate-400" : "text-slate-500"}`}
								>
									{tier.cadence}
								</span>
							</div>

							<p
								className={`onest mt-3 text-sm leading-relaxed ${tier.highlight ? "text-slate-400" : "text-slate-600"}`}
							>
								{tier.desc}
							</p>

							<button
								className={`group mt-6 inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition duration-300 ease-premium ${
									tier.highlight
										? "bg-teal-500 hover:bg-teal-600 text-white"
										: "bg-slate-100 hover:bg-slate-200 text-slate-900"
								}`}
							>
								{tier.cta}
								<ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-premium group-hover:translate-x-0.5" />
							</button>

							<ul
								className={`mt-7 space-y-3 border-t pt-6 ${tier.highlight ? "border-white/10" : "border-stone-100"}`}
							>
								{tier.features.map((f) => (
									<li
										key={f}
										className={`flex items-center gap-2.5 text-sm ${tier.highlight ? "text-slate-300" : "text-slate-700"}`}
									>
										<Check
											className={`h-4 w-4 ${tier.highlight ? "text-teal-400" : "text-teal-600"}`}
											strokeWidth={2.5}
										/>
										{f}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
