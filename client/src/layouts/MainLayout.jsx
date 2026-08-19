import React, { useRef, useEffect } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import gsap from "gsap";
import Sidebar from "../components/layout/Sidebar";
import ActivityDrawer from "../components/drawers/ActivityDrawer";
import TicketDetailPanel from "../components/drawers/TicketDetailPanel";
import CreateWorkspaceModal from "../components/modals/CreateWorkspaceModal";
import NewTicketModal from "../components/modals/NewTicketModal";
import CommandPalette from "../components/common/CommandPalette";
import ShortcutsModal from "../components/common/ShortcutsModal";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { useThemeStore } from "../store/useThemeStore";

export default function MainLayout() {
	const location = useLocation();
	const outlet = useOutlet();
	const pageRef = useRef(null);
	const isFirstRender = useRef(true);

	const initTheme = useThemeStore((state) => state.initTheme);

	const activityLogs = useWorkspaceStore((state) => state.activityLogs);
	const activityOpen = useWorkspaceStore((state) => state.activityOpen);
	const setActivityOpen = useWorkspaceStore((state) => state.setActivityOpen);
	const selectedTicket = useWorkspaceStore((state) => state.selectedTicket);
	const setSelectedTicket = useWorkspaceStore((state) => state.setSelectedTicket);

	const isCreateWorkspaceModalOpen = useWorkspaceStore(
		(state) => state.isCreateWorkspaceModalOpen,
	);
	const setIsCreateWorkspaceModalOpen = useWorkspaceStore(
		(state) => state.setIsCreateWorkspaceModalOpen,
	);

	useEffect(() => {
		initTheme();
	}, [initTheme]);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		if (pageRef.current) {
			gsap.fromTo(
				pageRef.current,
				{ opacity: 0, y: 10 },
				{
					opacity: 1,
					y: 0,
					duration: 0.25,
					ease: "power2.out",
					clearProps: "all",
				},
			);
		}
	}, [location.pathname]);

	return (
		<div className="h-[100dvh] w-full flex overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-0">
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
				activity={activityLogs}
				activityOpen={activityOpen}
				setActivityOpen={setActivityOpen}
			/>
			<TicketDetailPanel />

			<CreateWorkspaceModal
				isOpen={isCreateWorkspaceModalOpen}
				onClose={() => setIsCreateWorkspaceModalOpen(false)}
			/>
			<NewTicketModal />
			<CommandPalette />
			<ShortcutsModal />

			{(activityOpen || selectedTicket) && (
				<div
					className="fixed inset-0 bg-slate-900/30 dark:bg-slate-950/60 z-40 transition-opacity duration-300 backdrop-blur-xs"
					onClick={() => {
						setActivityOpen(false);
						setSelectedTicket(null);
					}}
				/>
			)}
		</div>
	);
}
