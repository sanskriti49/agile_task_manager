import React, { useState, useEffect } from "react";
import {
	X,
	ShieldCheck,
	FileText,
	Lock,
	ExternalLink,
	Printer,
	Search,
} from "lucide-react";
import Logo from "../ui/Logo";
import { useLayoutEffect } from "react";
import { useRef } from "react";
import gsap from "gsap";

/**
 * FLUX — Modern Legal Modal Component
 *
 * Provides instant in-context preview of Terms of Service & Privacy Policy
 * without forcing the user to leave the Login / Sign In flow.
 */
export default function LegalModal({
	isOpen = false,
	onClose,
	initialTab = "terms", // "terms" | "privacy"
}) {
	const [activeTab, setActiveTab] = useState(initialTab);
	const [isRendered, setIsRendered] = useState(isOpen);
	const [searchQuery, setSearchQuery] = useState("");

	const backdropRef = useRef(null);
	const cardRef = useRef(null);
	const contentRef = useRef(null);
	useEffect(() => {
		setActiveTab(initialTab);
	}, [initialTab]);
	useEffect(() => {
		if (isOpen) setIsRendered(true);
	}, [isOpen]);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape") onClose?.();
		};
		if (isOpen) {
			window.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
		}
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	// 🎭 GSAP Entrance Timeline
	useLayoutEffect(() => {
		if (!isRendered) return;
		const ctx = gsap.context(() => {
			if (isOpen) {
				document.body.style.overflow = "hidden";
				gsap
					.timeline()
					.fromTo(
						backdropRef.current,
						{ opacity: 0, backdropFilter: "blur(0px)" },
						{
							opacity: 1,
							backdropFilter: "blur(12px)",
							duration: 0.35,
							ease: "power2.out",
						},
					)
					.fromTo(
						cardRef.current,
						{ opacity: 0, scale: 0.92, y: 24 },
						{
							opacity: 1,
							scale: 1,
							y: 0,
							duration: 0.45,
							ease: "back.out(1.4)",
						},
						"-=0.25",
					);
			}
		});
		return () => ctx.revert();
	}, [isOpen, isRendered]);
	// 🚪 GSAP Smooth Close
	const handleClose = () => {
		gsap
			.timeline({
				onComplete: () => {
					document.body.style.overflow = "unset";
					setIsRendered(false);
					onClose?.();
				},
			})
			.to(cardRef.current, {
				opacity: 0,
				scale: 0.94,
				y: 16,
				duration: 0.25,
				ease: "power2.in",
			})
			.to(
				backdropRef.current,
				{
					opacity: 0,
					backdropFilter: "blur(0px)",
					duration: 0.2,
					ease: "power2.in",
				},
				"-=0.15",
			);
	};
	// 🔄 GSAP Tab Cross-Fade
	const handleTabSwitch = (newTab) => {
		if (newTab === activeTab || !contentRef.current) return;
		gsap.to(contentRef.current, {
			opacity: 0,
			y: -12,
			duration: 0.15,
			ease: "power2.in",
			onComplete: () => {
				setActiveTab(newTab);
				gsap.fromTo(
					contentRef.current,
					{ opacity: 0, y: 12 },
					{ opacity: 1, y: 0, duration: 0.3, ease: "power3.out" },
				);
			},
		});
	};
	if (!isRendered) return null;

	if (!isOpen) return null;

	const handlePrint = () => {
		window.print();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 selection:bg-teal-500/30">
			{/* Backdrop overlay */}
			<div
				ref={backdropRef}
				className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
				onClick={handleClose}
			/>

			{/* Modal Dialog Content */}
			<div
				ref={cardRef}
				className="relative w-full max-w-4xl max-h-[88vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-teal-500/10 text-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 z-10"
			>
				{/* Modal Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
					<div className="flex items-center gap-3">
						<Logo to={false} showText={true} className="w-6 h-6" />
						<span className="text-slate-600 font-mono text-xs">/</span>
						<span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
							Legal Documentation
						</span>
					</div>

					<div className="flex items-center gap-2">
						<button
							onClick={handlePrint}
							title="Print document"
							className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
						>
							<Printer className="w-4 h-4" />
						</button>

						<button
							onClick={onClose}
							title="Close modal (Esc)"
							className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>

				{/* Tab Controls & Search Bar */}
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 border-b border-slate-800/80 bg-slate-950/40">
					<div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
						<button
							onClick={() => handleTabSwitch("terms")}
							className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
								activeTab === "terms"
									? "bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold shadow-sm"
									: "text-slate-400 hover:text-slate-200"
							}`}
						>
							<FileText className="w-3.5 h-3.5" />
							Terms of Service
						</button>

						<button
							onClick={() => handleTabSwitch("privacy")}
							className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
								activeTab === "privacy"
									? "bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold shadow-sm"
									: "text-slate-400 hover:text-slate-200"
							}`}
						>
							<Lock className="w-3.5 h-3.5" />
							Privacy Policy
						</button>
					</div>

					{/* Quick Search */}
					<div ref={contentRef} className="relative flex-1 max-w-xs">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
						<input
							type="text"
							placeholder="Search legal clauses..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-colors"
						/>
					</div>
				</div>

				{/* Modal Scrollable Body */}
				<div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 space-y-6 text-slate-300 text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
					<div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
						<div>
							<h2 className="onest text-xl font-semibold text-white">
								{activeTab === "terms"
									? "Terms of Service"
									: "Privacy Policy & Data Security"}
							</h2>
							<p className="text-xs text-slate-400 font-mono mt-1">
								Effective Date: August 1, 2026 • Version 2.4 (Agile Sprint
								Edition)
							</p>
						</div>
						<span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
							<ShieldCheck className="w-3.5 h-3.5" /> GDPR & CCPA Compliant
						</span>
					</div>

					{/* DOCUMENT CONTENT */}
					{activeTab === "terms" ? (
						<div className="space-y-5 text-slate-300">
							<section>
								<h3 className="text-base font-semibold text-teal-300 mb-2">
									1. Agreement to Terms
								</h3>
								<p>
									By accessing or using{" "}
									<strong className="text-white">FLUX</strong> ("Service"),
									provided by FLUX Technologies Inc., you agree to be bound by
									these Terms of Service. FLUX is a real-time Agile Project
									Management platform leveraging WebSockets and polyglot
									database infrastructure. If you do not agree to these terms,
									do not access or use the Service.
								</p>
							</section>

							<section>
								<h3 className="text-base font-semibold text-teal-300 mb-2">
									2. Account Registration & Realtime Collaboration
								</h3>
								<p>
									You must maintain the confidentiality of your account
									credentials. You are responsible for all activities, ticket
									movements, and API calls performed under your account
									workspace. Real-time board state changes are broadcast via
									secure Socket.io WebSocket channels across authorized active
									clients.
								</p>
							</section>

							<section>
								<h3 className="text-base font-semibold text-teal-300 mb-2">
									3. Acceptable Use Policy
								</h3>
								<p>
									You agree not to misuse the FLUX platform. Prohibited actions
									include:
								</p>
								<ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400 text-xs">
									<li>
										Interfering with WebSocket message channels or attempting
										unauthorized room access.
									</li>
									<li>
										Automating excessive synthetic ticket creation exceeding
										fair API usage rate limits.
									</li>
									<li>
										Reverse engineering FLUX virtualized rendering algorithms or
										proprietary backend code.
									</li>
								</ul>
							</section>

							<section>
								<h3 className="text-base font-semibold text-teal-300 mb-2">
									4. Data Ownership & Storage Architecture
								</h3>
								<p>
									Your workspace data remains your property. Relational project
									schema and permissions are stored in encrypted PostgreSQL
									databases, while high-volume audit logs and activity streams
									are ingested into MongoDB collections. We grant you a
									non-exclusive license to use FLUX during your subscription
									term.
								</p>
							</section>

							<section>
								<h3 className="text-base font-semibold text-teal-300 mb-2">
									5. Service Level Agreement & Termination
								</h3>
								<p>
									FLUX strives for 99.9% real-time uptime. You may cancel your
									subscription at any time from your Workspace Settings. Upon
									termination, export tools are available to retrieve your data
									within 30 days.
								</p>
							</section>
						</div>
					) : (
						<div className="space-y-5 text-slate-300">
							<section>
								<h3 className="onest text-base font-semibold text-teal-300 mb-2">
									1. Information We Collect
								</h3>
								<p>
									To provide seamless agile workflow synchronization, FLUX
									collects:
								</p>
								<ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400 text-xs">
									<li>
										<strong className="text-slate-200">
											Account Information:
										</strong>{" "}
										Name, email address, avatar, and authentication provider
										tokens (GitHub/OAuth).
									</li>
									<li>
										<strong className="text-slate-200">
											Workspace Telemetry:
										</strong>{" "}
										Kanban card movements, sprint assignments, comments, and
										subtask completion status.
									</li>
									<li>
										<strong className="text-slate-200">Audit Logs:</strong>{" "}
										High-volume event logs stored in MongoDB for security, undo
										history, and team activity feeds.
									</li>
								</ul>
							</section>

							<section>
								<h3 className="onest text-base font-semibold text-teal-300 mb-2">
									2. How We Use Data & WebSockets Sync
								</h3>
								<p>
									Your data is strictly utilized to operate and sync workspace
									states. We broadcast real-time drag-and-drop offsets and
									cursor coordinates to active team members in your WebSocket
									room. We never sell your personal data to third parties.
								</p>
							</section>

							<section>
								<h3 className="onest text-base font-semibold text-teal-300 mb-2">
									3. Polyglot Encryption & Security Standards
								</h3>
								<p>
									All data in transit is encrypted using TLS 1.3. Relational
									data in PostgreSQL and audit records in MongoDB are encrypted
									at rest using AES-256 standards. OAuth2 provider credentials
									are stored with salted hash tokens.
								</p>
							</section>

							<section>
								<h3 className="onest text-base font-semibold text-teal-300 mb-2">
									4. Your Rights (GDPR & CCPA)
								</h3>
								<p>
									You have the right to request a complete export of your
									workspace logs or request permanent account deletion. Contact
									our Privacy Officer at{" "}
									<span className="text-teal-400 font-mono">
										privacy@fluxapp.dev
									</span>
									.
								</p>
							</section>
						</div>
					)}
				</div>

				{/* Modal Footer Actions */}
				<div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80 backdrop-blur text-xs">
					<div className="flex items-center gap-2 text-slate-400">
						<ShieldCheck className="w-4 h-4 text-emerald-400" />
						<span>End-to-End Workspace Protection</span>
					</div>

					<div className="flex items-center gap-3">
						<a
							href={activeTab === "terms" ? "/terms" : "/privacy"}
							target="_blank"
							rel="noopener noreferrer"
							className="hidden sm:inline-flex items-center gap-1 text-slate-400 hover:text-teal-300 transition-colors"
						>
							Open in full page <ExternalLink className="w-3 h-3" />
						</a>

						<button
							onClick={onClose}
							className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold transition-colors shadow-lg shadow-teal-500/20"
						>
							I Understand & Agree
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
