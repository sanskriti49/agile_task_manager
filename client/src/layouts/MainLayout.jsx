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

	useEffect(() => {
		// Animate the page content in whenever the route (location.pathname) changes
		if (pageRef.current) {
			gsap.fromTo(
				pageRef.current,
				{
					opacity: 0,
					y: 20, // Slight slide up
				},
				{
					opacity: 1,
					y: 0,
					duration: 0.4,
					ease: "power2.out",
				},
			);
		}
	}, [location.pathname]); // Trigger animation on path change

	return (
		<div
			className="h-[100dvh] w-full flex overflow-hidden bg-slate-50 text-slate-800 min-h-0"
			style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
		>
			{/* Persistent Sidebar */}
			<Sidebar />

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col min-w-0 min-h-0 relative overflow-y-auto">
				{/* 
                    Using key={location.pathname} forces React to treat this as a brand new element 
                    when the URL changes, triggering a fresh mount. 
                */}
				<div
					ref={pageRef}
					key={location.pathname}
					className="flex-1 flex flex-col min-w-0"
				>
					{outlet}
				</div>
			</div>

			{/* Persistent Drawers */}
			<ActivityDrawer
				activity={activity}
				activityOpen={activityOpen}
				setActivityOpen={setActivityOpen}
			/>
			<TicketDetailPanel boardData={boardData} />

			{/* Overlay for drawers */}
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
