import React, { useEffect, useLayoutEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
	LayoutGrid,
	PanelRight,
	Activity,
	Users,
	ArrowRight,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import { FOCUS_RING } from "../data/constants";
import Navbar from "../components/Navbar";
import { ChangelogSection } from "../components/ChangelogSection";
import { PricingSection } from "../components/PricingSection";
import ProcessSection from "../components/ProcessSection";
import WorkspaceSection from "../components/WorkspaceSection";

gsap.registerPlugin(ScrollTrigger);

const PRODUCT_NAME = "Flux";

const FEATURES = [
	{
		icon: LayoutGrid,
		title: "Boards that flex to the work",
		body: "Drag tickets across Backlog, In Progress, and Done. Columns and cards animate into place, so nothing feels like it teleported.",
	},
	{
		icon: PanelRight,
		title: "A detail panel for every ticket",
		body: "Open any card into a full panel \u2014 description, subtasks, comments \u2014 without ever losing the board underneath.",
	},
	{
		icon: Activity,
		title: "Activity, not archaeology",
		body: "A live drawer logs who moved what and when, so standups stop starting with \u2018wait, who changed this?\u2019",
	},
	{
		icon: Users,
		title: "Workspaces for every team",
		body: "Spin up a workspace per team or project, and switch between them from one sidebar. No page reloads, no context lost.",
	},
];

// 🚀 PERF: Memoize the card so it doesn't re-render when parent state changes

function Features() {
	return (
		<section id="features" className="scroll-mt-24 py-24 sm:py-28 bg-white">
			<div className="max-w-6xl mx-auto px-5 sm:px-8">
				<div className="max-w-xl">
					<span className="mono text-[11px] font-medium tracking-wide text-teal-600">
						WHAT'S ON THE BOARD
					</span>
					<h2 className="display mt-3 text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
						Everything a ticket needs, nothing it doesn't.
					</h2>
				</div>
				<div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-5">
					{FEATURES.map((feature, idx) => {
						const Icon = feature.icon;
						return (
							<div
								key={feature.title}
								className="card-enter card-elevated rounded-2xl ring-1 ring-slate-200/80 bg-white p-6 sm:p-7 transition-transform ease-premium duration-300 hover:-translate-y-1"
								style={{
									animationDelay: `${idx * 90}ms`,
									willChange: "transform",
								}}
							>
								<div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center">
									<Icon className="h-5 w-5 text-teal-600" strokeWidth={2} />
								</div>
								<h3 className="display mt-5 text-[17px] font-semibold text-slate-900">
									{feature.title}
								</h3>
								<p className="mt-2 text-[14px] leading-relaxed text-slate-500">
									{feature.body}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

function CTASection({ onGetStarted }) {
	return (
		<section className="relative py-24 sm:py-28 bg-teal-500 overflow-hidden">
			<div className="absolute inset-0 dot-grid opacity-[0.12]" />
			<div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
				<h2 className="display text-3xl sm:text-4xl font-semibold text-white tracking-tight">
					Your next sprint starts on one board.
				</h2>
				<p className="onest mt-4 text-teal-50/90 text-[15px]">
					Free for teams of up to five. No credit card, no setup call.
				</p>
				<button
					onClick={onGetStarted}
					className={`group mt-8 inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-slate-800 px-6 py-3.5 text-sm font-medium text-white transition duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-xl ${FOCUS_RING}`}
				>
					Create a workspace — it's free
					<ArrowRight className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-0.5" />
				</button>
			</div>
		</section>
	);
}

export default function LandingPage() {
	const navigate = useNavigate();
	const login = useAuthStore((state) => state.login);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const root = useRef(null);

	useLayoutEffect(() => {
		let ctx = gsap.context(() => {
			const tl = gsap.timeline({
				defaults: { ease: "power3.out", duration: 1 },
			});
			tl.from(".hero-badge", { y: 20, opacity: 0, duration: 0.8 })
				.from(".hero-title", { y: 30, opacity: 0, duration: 1 }, "-=0.5")
				.from(".hero-desc", { y: 20, opacity: 0, duration: 0.8 }, "-=0.7")
				.from(".hero-actions", { y: 20, opacity: 0, duration: 0.8 }, "-=0.6")
				.from(".hero-image", { opacity: 0, scale: 0.96, duration: 1 }, "-=0.8")
				.from(".hero-board", { y: 40, opacity: 0, duration: 1.2 }, "-=0.6");

			gsap.to(".hero-board", {
				yPercent: -10,
				ease: "none",
				scrollTrigger: {
					trigger: ".hero-board",
					start: "top bottom",
					end: "bottom top",
					scrub: 0.5,
				},
			});
		}, root);
		return () => ctx.revert();
	}, []);

	function handleGetStarted() {
		if (!isAuthenticated && typeof login === "function") {
			login();
		}
		navigate("/dashboard");
	}

	return (
		<div
			ref={root}
			className="bg-white text-slate-800 antialiased overflow-x-hidden w-full relative"
			style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
		>
			<Navbar onGetStarted={handleGetStarted} />
			<main>
				<Hero PRODUCT_NAME={PRODUCT_NAME} onGetStarted={handleGetStarted} />
				<Features />
				<WorkspaceSection />
				<ProcessSection />
				<ChangelogSection />
				<PricingSection />
				<CTASection onGetStarted={handleGetStarted} />
			</main>
			<Footer PRODUCT_NAME={PRODUCT_NAME} />
		</div>
	);
}
