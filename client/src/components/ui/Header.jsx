import { LayoutGrid, Search } from "lucide-react";
import { CURRENT_USER, PRODUCT_NAME } from "../../data/constants";
import Avatar from "./Avatar";
import LogoutButton from "./LogoutButton";

export default function Header({ search, setSearch }) {
	return (
		<header className="glass-header sticky top-0 z-20 h-16 border-b border-slate-200/70 px-5 sm:px-8 bg-white/80 backdrop-blur-md">
			<div className="mx-auto flex h-full max-w-7xl items-center justify-between">
				<div className="flex items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500">
						<LayoutGrid className="h-4 w-4 text-white" strokeWidth={2.5} />
					</div>
					<span className="text-[17px] font-semibold text-slate-900">
						{PRODUCT_NAME}
					</span>
				</div>

				{/* Functional Search Bar */}
				<div className="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-400 ring-1 ring-slate-200/70 transition-colors focus-within:bg-white focus-within:ring-teal-400 md:flex">
					<Search className="h-3.5 w-3.5" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search workspaces…"
						className="w-56 bg-transparent text-sm text-slate-700 outline-none placeholder-slate-400"
					/>
				</div>

				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<Avatar name={CURRENT_USER} size="h-8 w-8 text-xs" />
						<span className="hidden text-sm font-medium text-slate-700 sm:block">
							{CURRENT_USER}
						</span>
					</div>
					<LogoutButton />
				</div>
			</div>
		</header>
	);
}
