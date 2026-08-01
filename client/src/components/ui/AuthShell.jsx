import { LayoutGrid } from "lucide-react";
import { PRODUCT_NAME } from "../../data/constants";
import Logo from "./Logo";
import { NavLink } from "react-router-dom";

export default function AuthShell({ children, panel }) {
	return (
		<div className="sy-root flex min-h-screen bg-stone-50">
			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .sy-root { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .sy-root .font-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
        .sy-root .font-mono-ui { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace; font-variant-numeric: tabular-nums; }
        @media (prefers-reduced-motion: reduce) { .sy-root * { transition: none !important; animation: none !important; } }
      `}</style>

			{/* Left brand side (desktop only) */}
			<aside className="hidden w-[46%] xl:w-[42%] lg:block">
				<div className="h-full">{panel}</div>
			</aside>

			{/* Right form side */}
			<main className="relative flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
				<div className="absolute inset-0 dot-grid opacity-[0.5] pointer-events-none" />
				<div className="absolute inset-0 bg-gradient-to-b from-white via-white/70 to-stone-50 pointer-events-none" />

				<div className="relative w-full max-w-md">{children}</div>
			</main>
		</div>
	);
}
