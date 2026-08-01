import React, { useState, useRef, useLayoutEffect } from "react";
import {
	ShieldCheck,
	FileText,
	Lock,
	ArrowLeft,
	Search,
	Check,
	ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import Logo from "../components/ui/Logo";

/**
 * FLUX — GSAP-Animated Dedicated Legal Page Route Component (/terms and /privacy)
 *
 * Full-page legal hub featuring GSAP cross-fade tab switching, smooth scroll jumps,
 * and clean glassmorphism dark mode aesthetic.
 */
export default function LegalPage({ defaultTab = "terms" }) {
	const [activeTab, setActiveTab] = useState(defaultTab);
	const [activeSection, setActiveSection] = useState("section-1");

	// GSAP Animation Refs
	const mainContentRef = useRef(null);
	const headerRef = useRef(null);

	const termsSections = [
		{ id: "section-1", title: "1. Acceptance of Terms" },
		{ id: "section-2", title: "2. Realtime Workspace Usage" },
		{ id: "section-3", title: "3. Polyglot Data Architecture" },
		{ id: "section-4", title: "4. Acceptable Usage & Limits" },
		{ id: "section-5", title: "5. Termination & Export" },
	];

	const privacySections = [
		{ id: "section-1", title: "1. Data Collection & Logs" },
		{ id: "section-2", title: "2. WebSockets Telemetry" },
		{ id: "section-3", title: "3. Encryption & Storage" },
		{ id: "section-4", title: "4. User Rights & Compliance" },
	];

	const currentSections =
		activeTab === "terms" ? termsSections : privacySections;

	// Initial Page Entrance Animation
	useLayoutEffect(() => {
		const ctx = gsap.context(() => {
			gsap.fromTo(
				headerRef.current,
				{ y: -20, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
			);

			gsap.fromTo(
				mainContentRef.current,
				{ opacity: 0, y: 15 },
				{ opacity: 1, y: 0, duration: 0.5, ease: "power3.out", delay: 0.1 },
			);
		});
		return () => ctx.revert();
	}, []);

	// GSAP Tab Switch Cross-Fade
	const handleTabSwitch = (newTab) => {
		if (newTab === activeTab || !mainContentRef.current) return;

		gsap.to(mainContentRef.current, {
			opacity: 0,
			y: -10,
			duration: 0.15,
			ease: "power2.in",
			onComplete: () => {
				setActiveTab(newTab);
				setActiveSection("section-1");
				gsap.fromTo(
					mainContentRef.current,
					{ opacity: 0, y: 10 },
					{ opacity: 1, y: 0, duration: 0.35, ease: "power3.out" },
				);
			},
		});
	};

	const scrollToSection = (id) => {
		setActiveSection(id);
		const el = document.getElementById(id);
		if (el) {
			const yOffset = -100;
			const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
			window.scrollTo({ top: y, behavior: "smooth" });
		}
	};

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500/30">
			{/* Top Header Navigation */}
			<header
				ref={headerRef}
				className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between"
			>
				<div className="flex items-center gap-4">
					<Link
						to="/"
						className="onest flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors duration-200"
					>
						<ArrowLeft className="w-6 h-6" />
					</Link>
					<div className="h-4 w-px bg-slate-800" />
					<Logo to="/" showText={true} className="w-6 h-6" />
				</div>

				{/* Animated Tab Switcher */}
				<div className="onest flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
					<button
						onClick={() => handleTabSwitch("terms")}
						className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
							activeTab === "terms"
								? "bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30"
								: "text-slate-400 hover:text-slate-200"
						}`}
					>
						<FileText className="w-3.5 h-3.5" /> Terms of Service
					</button>

					<button
						onClick={() => handleTabSwitch("privacy")}
						className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
							activeTab === "privacy"
								? "bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30"
								: "text-slate-400 hover:text-slate-200"
						}`}
					>
						<Lock className="w-3.5 h-3.5" /> Privacy Policy
					</button>
				</div>
			</header>

			{/* Main Legal Content Container */}
			<div className="onest max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-10">
				{/* Sticky Table of Contents Sidebar */}
				<aside className="lg:col-span-1 hidden lg:block">
					<div className="sticky top-24 space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur">
						<h3 className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
							On this page
						</h3>

						<nav className="space-y-1">
							{currentSections.map((sec) => (
								<button
									key={sec.id}
									onClick={() => scrollToSection(sec.id)}
									className={`w-full flex items-center justify-between text-left text-xs px-3 py-2 rounded-lg transition-all ${
										activeSection === sec.id
											? "bg-teal-500/10 text-teal-300 font-semibold border border-teal-500/20"
											: "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
									}`}
								>
									<span className="truncate">{sec.title}</span>
									{activeSection === sec.id && (
										<ChevronRight className="w-3 h-3 text-teal-400 shrink-0" />
									)}
								</button>
							))}
						</nav>

						<div className="pt-4 border-t border-slate-800/80">
							<div className="flex items-center gap-2 text-xs text-slate-400">
								<ShieldCheck className="w-4 h-4 text-emerald-400" />
								<span>GDPR &amp; CCPA Ready</span>
							</div>
						</div>
					</div>
				</aside>

				{/* Legal Text Reader Column (GSAP Target Ref) */}
				<main ref={mainContentRef} className="lg:col-span-3 space-y-10">
					<div className="border-b border-slate-800 pb-6">
						<h1 className="display text-3xl sm:text-4xl font-bold text-white">
							{activeTab === "terms"
								? "Terms of Service"
								: "Privacy Policy & Security"}
						</h1>

						<p className="mt-3 text-slate-400 text-sm">
							Last updated:{" "}
							<span className="text-slate-200 font-mono">August 1, 2026</span> •
							Applies to all FLUX Cloud &amp; Self-Hosted Workspaces.
						</p>
					</div>

					{/* DOCUMENT BODY */}
					{activeTab === "terms" ? (
						<div className="space-y-8 text-slate-300 leading-relaxed">
							<section id="section-1" className="scroll-mt-28 space-y-3">
								<h2 className="text-xl font-semibold text-white">
									1. Acceptance of Terms
								</h2>
								<p className="inter">
									By creating an account or accessing the FLUX Agile Task
									Management service ("Service"), provided by FLUX Technologies
									Inc., you agree to be bound by these Terms of Service. These
									terms govern all workspace operations, real-time board
									updates, and API interactions.
								</p>
							</section>

							<section id="section-2" className="scroll-mt-28 space-y-3">
								<h2 className="text-xl font-semibold text-white">
									2. Realtime Workspace Usage
								</h2>
								<p className="inter">
									FLUX utilizes WebSockets (Socket.io) to synchronize
									drag-and-drop ticket movements instantly across connected
									clients. You are responsible for ensuring that only authorized
									team members gain access to your active workspace rooms.
								</p>
							</section>

							<section id="section-3" className="scroll-mt-28 space-y-3">
								<h2 className="text-xl font-semibold text-white">
									3. Polyglot Data Architecture
								</h2>
								<p className="inter">
									FLUX employs a dual-database architecture: PostgreSQL for
									structured relational business data (users, permissions,
									boards) and MongoDB for high-volume audit logging and activity
									streams. Data stored within your workspace remains your
									exclusive property.
								</p>
							</section>

							<section id="section-4" className="scroll-mt-28 space-y-3">
								<h2 className="text-xl font-semibold text-white">
									4. Acceptable Usage & Limits
								</h2>
								<p className="inter">
									You agree not to exploit rate limits, flood WebSocket message
									servers, or attempt unauthorized cross-tenant data extraction.
								</p>
							</section>

							<section id="section-5" className="scroll-mt-28 space-y-3">
								<h2 className="text-xl font-semibold text-white">
									5. Termination & Data Export
								</h2>
								<p className="inter">
									You may close your account at any time. Upon termination, FLUX
									provides automated export tools to retrieve your project
									history in standard JSON/CSV formats.
								</p>
							</section>
						</div>
					) : (
						<div className="space-y-8 text-slate-300 leading-relaxed">
							<section id="section-1" className="scroll-mt-28 space-y-3">
								<h2 className="text-xl font-semibold text-white">
									1. Data Collection & Logs
								</h2>
								<p className="inter">
									We collect account identifiers (email, name, OAuth avatar) and
									workspace telemetry required to operate Kanban boards and
									sprint metrics. High-volume audit logs are stored securely in
									MongoDB collections.
								</p>
							</section>

							<section id="section-2" className="scroll-mt-28 space-y-3">
								<h2 className="text-xl font-semibold text-white">
									2. WebSockets Telemetry
								</h2>
								<p className="inter">
									Real-time cursor positions and card movement offsets are
									transmitted over TLS-encrypted WebSocket rooms and are never
									sold or shared with third-party advertisers.
								</p>
							</section>

							<section id="section-3" className="scroll-mt-28 space-y-3">
								<h2 className="text-xl font-semibold text-white">
									3. Encryption & Storage
								</h2>
								<p className="inter">
									All data in transit is encrypted using TLS 1.3. Databases are
									encrypted at rest using AES-256 standards with automated
									multi-region backups.
								</p>
							</section>

							<section id="section-4" className="scroll-mt-28 space-y-3">
								<h2 className="text-xl font-semibold text-white">
									4. User Rights & Compliance
								</h2>
								<p className="inter">
									FLUX complies fully with GDPR and CCPA guidelines. To request
									data deletion or privacy inquiries, contact{" "}
									<span className="text-teal-400 font-mono">
										privacy@fluxapp.dev
									</span>
									.
								</p>
							</section>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
