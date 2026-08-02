import React from "react";
import { Link } from "react-router-dom";

export default function Logo({
	isScrolled = false,
	className = "w-7 h-7",
	showText = true,
	textClassName = "",
	to = "/",
	onClick,
	...props
}) {
	const idPrefix = React.useId().replace(/:/g, "");
	const gradientPrimary = `flux-grad-primary-${idPrefix}`;
	const gradientSecondary = `flux-grad-secondary-${idPrefix}`;
	const gradientAccent = `flux-grad-accent-${idPrefix}`;
	const glowFilter = `flux-glow-${idPrefix}`;

	const tealStart = isScrolled ? "#0D9488" : "#2DD4BF";
	const cyanMid = isScrolled ? "#0284C7" : "#38BDF8";
	const accentViolet = isScrolled ? "#4F46E5" : "#818CF8";

	const logoContent = (
		<>
			<svg
				viewBox="0 0 40 40"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className={`relative select-none transform-gpu transition-transform duration-300 group-hover:scale-105 ${className}`}
				aria-label="FLUX Logo"
			>
				<defs>
					<linearGradient
						id={gradientPrimary}
						x1="2"
						y1="2"
						x2="38"
						y2="38"
						gradientUnits="userSpaceOnUse"
					>
						<stop offset="0%" stopColor={tealStart} />
						<stop offset="100%" stopColor={cyanMid} />
					</linearGradient>
					<linearGradient
						id={gradientSecondary}
						x1="38"
						y1="2"
						x2="2"
						y2="38"
						gradientUnits="userSpaceOnUse"
					>
						<stop offset="0%" stopColor={accentViolet} />
						<stop offset="100%" stopColor={tealStart} />
					</linearGradient>
					<linearGradient id={gradientAccent} x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stopColor="#10B981" />
						<stop offset="100%" stopColor="#34D399" />
					</linearGradient>
					<filter id={glowFilter} x="-20%" y="-20%" width="140%" height="140%">
						<feDropShadow
							dx="0"
							dy="2"
							stdDeviation="2.5"
							floodColor={isScrolled ? "#0F766E" : "#2DD4BF"}
							floodOpacity={isScrolled ? "0.2" : "0.5"}
						/>
					</filter>
				</defs>

				<g filter={`url(#${glowFilter})`}>
					<rect
						x="5"
						y="13"
						width="8.5"
						height="21"
						rx="4.25"
						fill={`url(#${gradientPrimary})`}
						opacity="0.85"
						className="transition-transform duration-300 group-hover:-translate-y-1"
					/>
					<rect
						x="15.75"
						y="6"
						width="8.5"
						height="28"
						rx="4.25"
						fill={`url(#${gradientPrimary})`}
						className="transition-transform duration-300 group-hover:translate-y-0.5"
					/>
					<rect
						x="26.5"
						y="15"
						width="8.5"
						height="15"
						rx="4.25"
						fill={`url(#${gradientSecondary})`}
						opacity="0.95"
						className="transition-transform duration-300 group-hover:-translate-y-1"
					/>
					<path
						d="M 9.5 22.5 L 20 12 L 30.5 22.5"
						stroke={isScrolled ? "#FFFFFF" : "#0F172A"}
						strokeWidth="2.75"
						strokeLinecap="round"
						strokeLinejoin="round"
						opacity="0.95"
						className="transition-all duration-300 group-hover:scale-110 transform-gpu origin-center"
					/>
					<circle
						cx="30.75"
						cy="9.5"
						r="3.5"
						fill={`url(#${gradientAccent})`}
						className="animate-pulse"
					/>
					<circle cx="30.75" cy="9.5" r="1.5" fill="#FFFFFF" />
				</g>
			</svg>

			{showText && (
				<div className="z-99 flex items-center gap-1.5 font-sans tracking-tight">
					<span
						className={`text-xl font-extrabold tracking-wider uppercase transition-all duration-300 ${textClassName}`}
						style={{
							fontFamily: "'onest', system-ui, sans-serif",
						}}
					>
						<span
							className={`bg-clip-text text-transparent bg-gradient-to-r ${isScrolled ? "from-slate-900 via-teal-800 to-sky-800" : "from-white via-teal-100 to-cyan-200"}`}
						>
							FLU
						</span>
						<span
							className={`bg-clip-text text-transparent bg-gradient-to-r ${isScrolled ? "from-teal-600 to-sky-600" : "from-teal-400 via-cyan-300 to-indigo-400 group-hover:from-cyan-300 group-hover:to-teal-300"}`}
						>
							X
						</span>
					</span>
				</div>
			)}
		</>
	);

	const containerClasses =
		"inline-flex items-center gap-2.5 group selection:bg-none cursor-pointer no-underline focus:outline-none";

	// If `to` is set to false/null, render as a div (when wrapped in outer NavLink)
	if (!to) {
		return (
			<div className={containerClasses} onClick={onClick} {...props}>
				{logoContent}
			</div>
		);
	}

	// Default: Render as React Router <Link to={to}>
	return (
		<Link to={to} className={containerClasses} onClick={onClick} {...props}>
			{logoContent}
		</Link>
	);
}
