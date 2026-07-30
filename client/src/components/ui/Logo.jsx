// export const LogoKanban = ({ size = 32, className = "" }) => (
// 	<div
// 		className={`rounded-lg  flex items-center justify-center transition-colors duration-500 ease-premium group-hover:bg-teal-500 ${className}`}
// 		style={{ width: size, height: size }}
// 	>
// 		<div className="relative w-[18px] h-[18px]">
// 			{/* Back card */}
// 			<div className="absolute top-0 left-0 w-3.5 h-3.5 rounded-md border-2 border-teal-500/40 group-hover:border-white/40"></div>
// 			{/* Front card (mini board) */}
// 			<div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-md bg-teal-500 group-hover:bg-white p-1 flex gap-0.5">
// 				<span className="w-0.5 h-full bg-slate-900/30 rounded-full group-hover:bg-teal-500/30"></span>
// 				<span className="w-0.5 h-2/3 bg-slate-900/60 rounded-full group-hover:bg-teal-500/60 self-end"></span>
// 			</div>
// 		</div>
// 	</div>
// );

// export default function Logo({ className = "w-8 h-8" }) {
// 	return (
// 		<svg
// 			className={className}
// 			viewBox="0 0 32 32"
// 			fill="none"
// 			xmlns="http://www.w3.org/2000/svg"
// 		>
// 			<defs>
// 				<linearGradient
// 					id="flux-gradient"
// 					x1="0%"
// 					y1="0%"
// 					x2="100%"
// 					y2="100%"
// 					gradientUnits="userSpaceOnUse"
// 				>
// 					<stop stopColor="#22D3EE" /> {/* Cyan 400 */}
// 					<stop offset="1" stopColor="#10B981" /> {/* Emerald 500 */}
// 				</linearGradient>
// 			</defs>

// 			{/* Vertical Stem */}
// 			<path
// 				d="M8 5 L8 27"
// 				stroke="url(#flux-gradient)"
// 				strokeWidth="3.5"
// 				strokeLinecap="round"
// 			/>

// 			{/* Top Horizontal Bar */}
// 			<path
// 				d="M8 5 L19 5"
// 				stroke="url(#flux-gradient)"
// 				strokeWidth="3.5"
// 				strokeLinecap="round"
// 			/>

// 			{/* Middle 'Flux' Swoosh replacing the middle bar */}
// 			<path
// 				d="M8 16 C13 16, 16 17, 19 20 C22 23, 24 26, 25 28"
// 				stroke="url(#flux-gradient)"
// 				strokeWidth="3.5"
// 				strokeLinecap="round"
// 			/>

// 			{/* Subtle node at the end of the flux line for a "tech/sync" feel */}
// 			<circle cx="25" cy="28" r="2.5" fill="url(#flux-gradient)" />
// 		</svg>
// 	);
// }

import React, { useId } from "react";
import { PRODUCT_NAME } from "../../data/constants";

export default function Logo({
	isScrolled,
	size = "md",
	withText = true,
	gradientText = false,
}) {
	// Generates a unique ID for the SVG gradient to prevent DOM collisions
	const gradientId = useId();

	const sizes = {
		sm: { container: "w-8 h-8", text: "text-xl" },
		md: { container: "w-10 h-10", text: "text-2xl" },
		lg: { container: "w-12 h-12", text: "text-3xl" },
		xl: { container: "w-16 h-16", text: "text-4xl" },
	};

	const currentSize = sizes[size] || sizes.md;

	return (
		<div className="flex items-center gap-2.5 select-none">
			{/* Logo Mark */}
			<svg
				className={`${currentSize.container} drop-shadow-[0_4px_6px_rgba(0,0,0,0.05)] dark:drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]`}
				viewBox="0 0 64 64"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#6366F1" /> {/* Indigo 500 */}
						<stop offset="100%" stopColor="#D946EF" /> {/* Fuchsia 500 */}
					</linearGradient>
				</defs>

				{/* Squircle Background */}
				<rect
					x="2"
					y="2"
					width="60"
					height="60"
					rx="18"
					className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-700"
					strokeWidth="1"
				/>

				{/* Fluid Ribbon 'F' */}
				{/* Main spine curving from top right to bottom left */}
				<path
					d="M42 16 C 30 16, 24 22, 24 32 V 48"
					stroke={`url(#${gradientId})`}
					strokeWidth="7"
					strokeLinecap="round"
					fill="none"
				/>
				{/* Top horizontal swoosh */}
				<path
					d="M24 28 C 28 28, 35 24, 42 16"
					stroke={`url(#${gradientId})`}
					strokeWidth="7"
					strokeLinecap="round"
					fill="none"
				/>
				{/* Middle sweeping arm */}
				<path
					d="M24 36 C 28 36, 32 34, 35 32"
					stroke={`url(#${gradientId})`}
					strokeWidth="6"
					strokeLinecap="round"
					fill="none"
					opacity="0.7" /* Slight transparency adds depth */
				/>
			</svg>

			{/* Wordmark */}
			{withText && (
				<span
					className={`display text-[17.5px] font-semibold tracking-tight transition-colors duration-300 ${
						isScrolled ? "text-slate-900" : "text-white"
					}`}
				>
					{PRODUCT_NAME}
				</span>
			)}
		</div>
	);
}
