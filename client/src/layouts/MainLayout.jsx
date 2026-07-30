import React, { useRef, useEffect } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import gsap from "gsap";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import ActivityDrawer from "../components/drawers/ActivityDrawer";
import TicketDetailPanel from "../components/drawers/TicketDetailPanel";

export default function MainLayout({ boardData }) {
	const { activity, activityOpen, selected, setActivityOpen, setSelectedId } =
		boardData;

	const location = useLocation();
	const outlet = useOutlet();
	const pageRef = useRef(null);
	const isFirstRender = useRef(true);

	useEffect(() => {
		// Skip the very first render of MainLayout, because RootLayout
		// is already handling the entrance animation for the whole page.
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		// Only animate if we are switching between dashboard inner-pages
		if (pageRef.current) {
			gsap.fromTo(
				pageRef.current,
				{
					opacity: 0,
					y: 12, // Slightly smaller slide for inner transitions
				},
				{
					opacity: 1,
					y: 0,
					duration: 0.3,
					ease: "power2.out",
					clearProps: "all",
				},
			);
		}
	}, [location.pathname]);

	return (
		<div
			className="h-[100dvh] w-full flex overflow-hidden bg-slate-50 text-slate-800 min-h-0"
			style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
		>
			<Sidebar />

			<div className="flex-1 flex flex-col min-w-0 min-h-0 relative overflow-y-auto">
				<div
					ref={pageRef}
					key={location.pathname}
					className="flex-1 flex flex-col min-w-0"
				>
					{outlet}
				</div>
			</div>

			<ActivityDrawer
				activity={activity}
				activityOpen={activityOpen}
				setActivityOpen={setActivityOpen}
			/>
			<TicketDetailPanel boardData={boardData} />

			{(activityOpen || selected) && (
				<div
					className="fixed inset-0 bg-slate-900/10 z-20 transition-opacity duration-300"
					onClick={() => {
						setActivityOpen(false);
						setSelectedId(null);
					}}
				/>
			)}
		</div>
	);
}
