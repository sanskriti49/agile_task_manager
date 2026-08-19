import React, { useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, Clock, MessageSquare, ArrowRight, UserPlus, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

const NOTIF_ICONS = {
	assignment: UserPlus,
	status_change: ArrowRight,
	comment: MessageSquare,
	mention: Zap,
	sprint_start: Zap,
	sprint_complete: CheckCheck,
};

export default function NotificationBell() {
	const navigate = useNavigate();
	const notifications = useWorkspaceStore((state) => state.notifications);
	const unreadCount = useWorkspaceStore((state) => state.unreadCount);
	const fetchNotifications = useWorkspaceStore((state) => state.fetchNotifications);
	const markNotificationRead = useWorkspaceStore((state) => state.markNotificationRead);
	const markAllNotificationsRead = useWorkspaceStore((state) => state.markAllNotificationsRead);
	const notificationsOpen = useWorkspaceStore((state) => state.notificationsOpen);
	const setNotificationsOpen = useWorkspaceStore((state) => state.setNotificationsOpen);
	const setSelectedTicket = useWorkspaceStore((state) => state.setSelectedTicket);

	const dropdownRef = useRef(null);

	useEffect(() => {
		fetchNotifications();
		const interval = setInterval(fetchNotifications, 20000);
		return () => clearInterval(interval);
	}, [fetchNotifications]);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setNotificationsOpen(false);
			}
		};
		if (notificationsOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [notificationsOpen, setNotificationsOpen]);

	const handleNotificationClick = async (notif) => {
		if (!notif.is_read) {
			await markNotificationRead(notif.id);
		}
		setNotificationsOpen(false);

		if (notif.project_id) {
			navigate(`/workspace/${notif.project_id}`);
			if (notif.task_id) {
				setTimeout(() => {
					setSelectedTicket({ id: notif.task_id });
				}, 200);
			}
		}
	};

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				type="button"
				onClick={() => setNotificationsOpen(!notificationsOpen)}
				aria-label="Notifications"
				className={`relative rounded-xl p-2 transition-all duration-200 ${
					notificationsOpen
						? "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 ring-2 ring-teal-300 dark:ring-teal-700"
						: "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
				}`}
			>
				<Bell className="h-4 w-4" />
				{unreadCount > 0 && (
					<span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 font-mono-ui text-[10px] font-bold text-white shadow-xs animate-pulse">
						{unreadCount > 9 ? "9+" : unreadCount}
					</span>
				)}
			</button>

			{notificationsOpen && (
				<div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[480px]">
					{/* Header */}
					<div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
						<div className="flex items-center gap-2">
							<span className="display text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
								Notifications
							</span>
							{unreadCount > 0 && (
								<span className="rounded-full bg-teal-100 dark:bg-teal-950 px-2 py-0.5 font-mono-ui text-[10px] font-bold text-teal-700 dark:text-teal-400">
									{unreadCount} new
								</span>
							)}
						</div>

						{unreadCount > 0 && (
							<button
								type="button"
								onClick={markAllNotificationsRead}
								className="flex items-center gap-1 text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline"
							>
								<Check className="h-3 w-3" /> Mark all read
							</button>
						)}
					</div>

					{/* List */}
					<div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
						{notifications.length === 0 ? (
							<div className="p-8 text-center text-slate-400 dark:text-slate-500 font-mono-ui text-xs">
								You're all caught up! No notifications.
							</div>
						) : (
							notifications.map((n) => {
								const Icon = NOTIF_ICONS[n.type] || Bell;
								return (
									<div
										key={n.id}
										onClick={() => handleNotificationClick(n)}
										className={`p-3.5 flex gap-3 cursor-pointer transition-colors duration-150 ${
											!n.is_read
												? "bg-teal-50/40 dark:bg-teal-950/20 hover:bg-teal-50 dark:hover:bg-teal-950/40"
												: "hover:bg-slate-50 dark:hover:bg-slate-800/50"
										}`}
									>
										<div
											className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
												!n.is_read
													? "bg-teal-500 text-white shadow-xs"
													: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
											}`}
										>
											<Icon className="h-3.5 w-3.5" />
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-baseline justify-between gap-1">
												<p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
													{n.title}
												</p>
												<span className="font-mono-ui text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
													{n.created_at
														? new Date(n.created_at).toLocaleTimeString([], {
																hour: "2-digit",
																minute: "2-digit",
															})
														: "Just now"}
												</span>
											</div>
											<p className="text-[12px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
												{n.message}
											</p>
											{n.project_name && (
												<span className="inline-block mt-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
													{n.project_name}
												</span>
											)}
										</div>

										{!n.is_read && (
											<span className="h-2 w-2 rounded-full bg-teal-500 self-center shrink-0" />
										)}
									</div>
								);
							})
						)}
					</div>
				</div>
			)}
		</div>
	);
}
