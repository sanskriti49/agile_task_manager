import { memo, useEffect, useState, useCallback, useRef } from "react";
import { ArrowRight, Check, Zap } from "lucide-react";

const GlobalStyles = () => (
	<style>{`
        @keyframes popIn {
            0% { opacity: 0; transform: scale(0.95) translateY(8px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideInRight {
            0% { opacity: 0; transform: translateX(20px); }
            100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
        @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        .animated-gradient {
            background-size: 200% 200%;
            animation: gradientShift 4s ease infinite;
        }
    `}</style>
);

export default function Hero({
	PRODUCT_NAME = "Flux",
	onGetStarted,
	FOCUS_RING = "",
}) {
	const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

	const handleMouseMove = (e) => {
		const rect = e.currentTarget.getBoundingClientRect();
		setMousePos({
			x: ((e.clientX - rect.left) / rect.width) * 100,
			y: ((e.clientY - rect.top) / rect.height) * 100,
		});
	};

	return (
		<>
			<GlobalStyles />
			<section
				id="product"
				onMouseMove={handleMouseMove}
				className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden bg-[#070b14] text-white"
			>
				{/* Dynamic Mouse Glow */}
				<div
					className="absolute inset-0 pointer-events-none transition-opacity duration-300"
					style={{
						background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(6, 182, 212, 0.08), transparent 40%)`,
					}}
				/>
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

				<div className="relative max-w-6xl mx-auto px-5 sm:px-8 z-10">
					<div className="flex justify-center mb-6">
						<span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-slate-900/80 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest backdrop-blur-md shadow-lg shadow-cyan-500/10">
							<Zap className="w-3.5 h-3.5 text-cyan-400 fill-current" />
							<span>REAL-TIME COLLABORATION REIMAGINED</span>
						</span>
					</div>

					<div className="text-center max-w-3xl mx-auto">
						<h1 className="display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.06]">
							Built for teams
							<br className="hidden sm:inline" />
							that never stop
							<span className="animated-gradient bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
								{" "}
								moving.
							</span>
						</h1>

						<p className="onest mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
							From sprint planning to deployment, Flux keeps every task, update,
							and conversation perfectly synchronized.{" "}
						</p>

						<div className="mt-8 flex flex-wrap items-center justify-center gap-4">
							<button
								onClick={onGetStarted}
								className={`group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-7 py-4 text-base font-semibold text-white shadow-xl shadow-cyan-500/20 transition-all duration-300 ease-out hover:shadow-cyan-500/35 hover:-translate-y-0.5 ${FOCUS_RING}`}
							>
								<span>Start Building</span>
								<ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
							</button>

							<a
								href="#workflow"
								className={`inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 px-6 py-4 text-sm font-semibold text-slate-300 hover:text-white transition-all duration-200 backdrop-blur-md ${FOCUS_RING}`}
							>
								<span>Take the Tour</span>
							</a>
						</div>

						<div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
							<div className="flex items-center gap-2">
								<Check className="w-4 h-4 text-cyan-400" />
								<span>&lt;20ms Realtime Sync</span>
							</div>
							<div className="flex items-center gap-2">
								<Check className="w-4 h-4 text-cyan-400" />
								<span>Full Keyboard Shortcuts (⌘K)</span>
							</div>
							<div className="flex items-center gap-2">
								<Check className="w-4 h-4 text-cyan-400" />
								<span>GitHub 2-Way Sync</span>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
