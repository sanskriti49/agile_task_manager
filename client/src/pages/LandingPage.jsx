import React, {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	memo,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
	LayoutGrid,
	PanelRight,
	Activity,
	Users,
	ArrowRight,
	GripVertical,
	MessageSquare,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import { FOCUS_RING } from "../data/constants";

gsap.registerPlugin(ScrollTrigger);

const PRODUCT_NAME = "Syncro";

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

// 🚀 PERF: Memoize the card so it doesn't re-render when parent state changes

function Header({ onGetStarted }) {
	const headerRef = useRef(null);

	useEffect(() => {
		// 🚀 PERF: Bypass React state entirely on scroll. Manipulate DOM classes directly
		// to prevent React reconciliation on every scroll frame.
		const headerEl = headerRef.current;
		if (!headerEl) return;

		let ticking = false;
		const onScroll = () => {
			if (!ticking) {
				requestAnimationFrame(() => {
					if (window.scrollY > 20) {
						headerEl.classList.add(
							"glass-header",
							"border-slate-200/70",
							"shadow-sm",
						);
						headerEl.classList.remove("bg-transparent", "border-transparent");
					} else {
						headerEl.classList.remove(
							"glass-header",
							"border-slate-200/70",
							"shadow-sm",
						);
						headerEl.classList.add("bg-transparent", "border-transparent");
					}
					ticking = false;
				});
				ticking = true;
			}
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header
			ref={headerRef}
			className="fixed top-0 inset-x-0 z-40 py-3 border-b transition-colors duration-500 ease-premium bg-transparent border-transparent"
		>
			<div className="max-w-6xl mx-auto px-5 sm:px-8 h-10 flex items-center justify-between">
				<div className="flex items-center gap-2.5 group cursor-pointer">
					<div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center transition-colors duration-500 ease-premium group-hover:bg-teal-500">
						<LayoutGrid className="h-4 w-4 text-white" strokeWidth={2.5} />
					</div>
					<span className="display text-[17.5px] font-semibold tracking-tight text-slate-900">
						{PRODUCT_NAME}
					</span>
				</div>
				<nav className="hidden md:flex items-center gap-2">
					{["Features", "Workflow", "Product"].map((item) => (
						<a
							key={item}
							href={`#${item.toLowerCase()}`}
							className="relative px-3 py-2 text-sm text-slate-500 hover:text-slate-900 transition-colors group"
						>
							{item}
							<span className="absolute bottom-1 left-3 right-3 h-px bg-teal-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-premium origin-left"></span>
						</a>
					))}
				</nav>
				<div className="flex items-center gap-3">
					<button
						onClick={onGetStarted}
						className={`hidden sm:inline text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors rounded-md ${FOCUS_RING}`}
					>
						Sign in
					</button>
					<button
						onClick={onGetStarted}
						className={`group inline-flex items-center gap-1.5 rounded-full bg-slate-900 hover:bg-teal-500 px-4 py-2 text-sm font-medium text-white transition duration-300 ease-premium ${FOCUS_RING} hover:shadow-lg hover:shadow-teal-500/30`}
					>
						Start free
						<ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-premium group-hover:translate-x-0.5" />
					</button>
				</div>
			</div>
		</header>
	);
}

function Features() {
	return (
		<section id="features" className="py-24 sm:py-28 bg-white">
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

function ShowcasePanel() {
	return (
		<section className="py-24 sm:py-28 bg-slate-900 relative overflow-hidden">
			<div className="absolute inset-0 dot-grid opacity-[0.06]" />
			<div className="relative max-w-6xl mx-auto px-5 sm:px-8">
				<div className="max-w-xl">
					<span className="mono text-[11px] font-medium tracking-wide text-teal-400">
						THE WHOLE WORKSPACE
					</span>
					<h2 className="display mt-3 text-3xl sm:text-4xl font-semibold text-white tracking-tight">
						One screen. Sidebar, board, and detail, all in sync.
					</h2>
					<p className="onest mt-4 text-slate-400 leading-relaxed">
						No modals stacked on modals. Open a ticket and the panel slides in
						beside the board you were just looking at.
					</p>
				</div>
				<div className="mt-14 rounded-2xl ring-1 ring-white/10 bg-slate-800/60 backdrop-blur overflow-hidden shadow-2xl">
					<div className="flex h-[360px] sm:h-[420px]">
						<div className="hidden sm:flex w-16 flex-col items-center gap-4 py-6 border-r border-white/10 bg-slate-900/40">
							<div className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center">
								<LayoutGrid className="h-4 w-4 text-white" />
							</div>
							{[Users, Activity, PanelRight].map((Icon, idx) => (
								<div
									key={idx}
									className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-teal-400 hover:bg-white/5 transition-colors"
								>
									<Icon className="h-4 w-4" />
								</div>
							))}
						</div>
						<div className="flex-1 grid grid-cols-2 gap-3 p-5 min-w-0">
							{["Backlog", "In Progress"].map((col) => (
								<div key={col}>
									<p className="mono text-[10px] text-slate-500 mb-2.5">
										{col}
									</p>
									<div className="space-y-2">
										{[1, 2, 3].map((n) => (
											<div
												key={n}
												className="h-14 rounded-lg bg-white/[0.04] ring-1 ring-white/10"
											/>
										))}
									</div>
								</div>
							))}
						</div>
						<div className="hidden md:flex w-64 flex-col gap-3 border-l border-white/10 bg-slate-900/50 p-5">
							<span className="mono text-[10px] text-teal-400">LOOP-114</span>
							<div className="h-3 w-3/4 rounded bg-white/15" />
							<div className="h-2.5 w-full rounded bg-white/[0.06]" />
							<div className="h-2.5 w-5/6 rounded bg-white/[0.06]" />
							<div className="h-2.5 w-2/3 rounded bg-white/[0.06]" />
							<div className="mt-4 flex items-center gap-2">
								<span className="h-5 w-5 rounded-full bg-teal-600" />
								<div className="h-2.5 w-24 rounded bg-white/[0.06]" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function ProcessSection() {
	return (
		<section id="workflow" className="py-24 sm:py-28 bg-white">
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
			className="bg-white text-slate-800 antialiased"
			style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
		>
			<Header onGetStarted={handleGetStarted} />
			<main>
				<Hero PRODUCT_NAME={PRODUCT_NAME} onGetStarted={handleGetStarted} />
				<Features />
				<ShowcasePanel />
				<ProcessSection />
				<CTASection onGetStarted={handleGetStarted} />
			</main>
			<Footer PRODUCT_NAME={PRODUCT_NAME} />
		</div>
	);
}
