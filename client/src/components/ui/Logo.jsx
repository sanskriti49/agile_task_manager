import React from "react";
import { Link } from "react-router-dom";

export default function Logo({
	isScrolled = false,
	className = "w-7 h-7",
	showText = true,
	textClassName = "",
	to = "/",
	onClick,
	variant = "auto", // "auto" | "light" | "dark" | "sidebar"
	...props
}) {
	const idPrefix = React.useId().replace(/:/g, "");
	const gradientPrimary = `flux-grad-primary-${idPrefix}`;
	const gradientSecondary = `flux-grad-secondary-${idPrefix}`;
	const gradientAccent = `flux-grad-accent-${idPrefix}`;
	const glowFilter = `flux-glow-${idPrefix}`;

	const isLightContext = variant === "light" || (variant === "auto" && isScrolled);

	return (
		<Link
			to={to || undefined}
			as={!to ? "div" : undefined}
			className="inline-flex items-center gap-2.5 group selection:bg-none cursor-pointer no-underline focus:outline-none"
			onClick={onClick}
			{...props}
		>
			<svg
				viewBox="0 0 40 40"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className={`relative select-none transform-gpu transition-all duration-300 group-hover:scale-105 ${className}`}
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
						<stop offset="0%" stopColor="#2DD4BF" />
						<stop offset="50%" stopColor="#06B6D4" />
						<stop offset="100%" stopColor="#6366F1" />
					</linearGradient>
					<linearGradient
						id={gradientSecondary}
						x1="38"
						y1="2"
						x2="2"
						y2="38"
						gradientUnits="userSpaceOnUse"
					>
						<stop offset="0%" stopColor="#818CF8" />
						<stop offset="50%" stopColor="#38BDF8" />
						<stop offset="100%" stopColor="#2DD4BF" />
					</linearGradient>
					<linearGradient id={gradientAccent} x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stopColor="#34D399" />
						<stop offset="100%" stopColor="#10B981" />
					</linearGradient>
					<filter id={glowFilter} x="-20%" y="-20%" width="140%" height="140%">
						<feDropShadow
							dx="0"
							dy="2"
							stdDeviation="2"
							floodColor="#0D9488"
							floodOpacity="0.35"
						/>
					</filter>
				</defs>

				{/* Kanban Flow Columns */}
				<g filter={`url(#${glowFilter})`}>
					<rect
						x="5"
						y="13"
						width="8.5"
						height="21"
						rx="4.25"
						fill={`url(#${gradientPrimary})`}
						opacity="0.85"
						className="transition-transform duration-300 group-hover:-translate-y-0.5"
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
						className="transition-transform duration-300 group-hover:-translate-y-0.5"
					/>
					{/* Velocity Spark Chevron */}
					<path
						d="M 9.5 22.5 L 20 12 L 30.5 22.5"
						stroke="#FFFFFF"
						strokeWidth="2.75"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="transition-all duration-300 group-hover:scale-105 transform-gpu origin-center drop-shadow-sm"
					/>
					<circle
						cx="30.75"
						cy="9.5"
						r="3"
						fill={`url(#${gradientAccent})`}
						className="animate-pulse"
					/>
					<circle cx="30.75" cy="9.5" r="1.2" fill="#FFFFFF" />
				</g>
			</svg>

			{showText && (
				<div className="z-10 flex items-center gap-1 font-sans tracking-tight">
					<span
						className={`text-xl font-black tracking-wider uppercase transition-all duration-300 ${textClassName}`}
						style={{
							fontFamily: "'onest', system-ui, sans-serif",
						}}
					>
						<span
							className={`bg-clip-text text-transparent ${
								isLightContext
									? "bg-gradient-to-r from-slate-900 to-teal-900"
									: "bg-gradient-to-r from-white via-slate-100 to-teal-200"
							}`}
						>
							FLU
						</span>
						<span
							className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400 group-hover:from-cyan-300 group-hover:to-teal-300"
						>
							X
						</span>
					</span>
				</div>
			)}
		</Link>
	);
}

