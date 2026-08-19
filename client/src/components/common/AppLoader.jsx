import React from "react";

/**
 * Centralized App Loader inspired by David Hu's React Spinners (davidhu.io/react-spinners)
 * Features: RingLoader, SyncLoader, ClipLoader with display font typography and full dark mode support.
 */

// 1. RingLoader (Concentric Interlocking Orbiting Rings)
function RingSpinner({ size = 48, color = "rgb(13, 148, 136)" }) {
	const borderSize = Math.max(size / 10, 2);
	return (
		<div
			className="relative flex items-center justify-center"
			style={{ width: `${size}px`, height: `${size}px` }}
		>
			<style>{`
				@keyframes ringSpin1 {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}
				@keyframes ringSpin2 {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(-360deg); }
				}
				.ring-inner {
					position: absolute;
					inset: 0;
					border-radius: 50%;
					border: ${borderSize}px solid ${color};
					opacity: 0.85;
					animation: ringSpin1 1.6s cubic-bezier(0.5, 0, 0.5, 1) infinite;
					border-bottom-color: transparent;
					border-left-color: transparent;
				}
				.ring-outer {
					position: absolute;
					inset: ${size * 0.15}px;
					border-radius: 50%;
					border: ${borderSize}px solid ${color};
					opacity: 0.6;
					animation: ringSpin2 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
					border-top-color: transparent;
					border-right-color: transparent;
				}
			`}</style>
			<div className="ring-inner" />
			<div className="ring-outer" />
		</div>
	);
}

// 2. SyncLoader (3 Bouncing Pulsing Wave Dots)
function SyncSpinner({ size = 10, color = "rgb(13, 148, 136)" }) {
	return (
		<div className="flex items-center gap-2">
			<style>{`
				@keyframes syncBounce {
					0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
					40% { transform: scale(1.2); opacity: 1; }
				}
				.sync-dot {
					border-radius: 50%;
					background-color: ${color};
					animation: syncBounce 1.2s infinite ease-in-out both;
				}
				.sync-dot-1 { animation-delay: -0.32s; }
				.sync-dot-2 { animation-delay: -0.16s; }
				.sync-dot-3 { animation-delay: 0s; }
			`}</style>
			<div
				className="sync-dot sync-dot-1"
				style={{ width: `${size}px`, height: `${size}px` }}
			/>
			<div
				className="sync-dot sync-dot-2"
				style={{ width: `${size}px`, height: `${size}px` }}
			/>
			<div
				className="sync-dot sync-dot-3"
				style={{ width: `${size}px`, height: `${size}px` }}
			/>
		</div>
	);
}

// 3. ClipLoader (Clean Sleek 360 Radial Spinner)
function ClipSpinner({ size = 28, color = "rgb(13, 148, 136)" }) {
	const borderSize = Math.max(size / 8, 2);
	return (
		<div
			className="rounded-full animate-spin"
			style={{
				width: `${size}px`,
				height: `${size}px`,
				borderWidth: `${borderSize}px`,
				borderColor: color,
				borderTopColor: "transparent",
				borderRightColor: "transparent",
			}}
		/>
	);
}

export default function AppLoader({
	text = "Loading...",
	type = "ring", // "ring" | "sync" | "clip"
	size,
	color = "#0d9488",
	fullScreen = false,
	minH = "min-h-[400px]",
	className = "",
}) {
	const renderSpinner = () => {
		switch (type) {
			case "sync":
				return <SyncSpinner size={size || 10} color={color} />;
			case "clip":
				return <ClipSpinner size={size || 28} color={color} />;
			case "ring":
			default:
				return <RingSpinner size={size || 46} color={color} />;
		}
	};

	if (fullScreen) {
		return (
			<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xs text-slate-900 dark:text-slate-100 font-mono-ui">
				{renderSpinner()}
				{text && (
					<p className="display mt-4 text-sm sm:text-base font-bold tracking-tight text-slate-700 dark:text-slate-200 animate-pulse">
						{text}
					</p>
				)}
			</div>
		);
	}

	return (
		<div
			className={`flex flex-col items-center justify-center ${minH} p-6 text-center text-slate-900 dark:text-slate-100 ${className}`}
		>
			{renderSpinner()}
			{text && (
				<p className="display mt-4 text-xs sm:text-sm font-bold tracking-tight text-slate-600 dark:text-slate-300">
					{text}
				</p>
			)}
		</div>
	);
}
