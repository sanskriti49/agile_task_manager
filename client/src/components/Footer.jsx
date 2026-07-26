import { Heart, LayoutGrid } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faGithub,
	faTwitter,
	faLinkedin,
} from "@fortawesome/free-brands-svg-icons";

export default function Footer({ PRODUCT_NAME }) {
	return (
		<footer className="relative mt-auto border-t border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-[0_-1px_2px_rgba(0,0,0,0.02)]">
			{/* Subtle gradient line above the footer */}
			<div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

			<div className="max-w-6xl mx-auto px-6 py-10">
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
					{/* Brand section */}
					<div className="flex items-center gap-4">
						<div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center shadow-md shadow-indigo-200/40">
							<LayoutGrid className="h-4.5 w-4.5 text-white" />
						</div>
						<div>
							<span className="display text-base font-semibold text-slate-800 tracking-tight">
								{PRODUCT_NAME}
							</span>
							<p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
								Built for teams who ship
							</p>
						</div>
					</div>

					{/* Middle: subtle decorative divider (hidden on small screens) */}
					<div className="hidden md:block h-8 w-px bg-slate-200/80" />

					{/* Right side: copyright + social/legal links */}
					<div className="flex flex-col items-start md:items-end gap-3">
						<div className="flex items-center gap-5 text-xs text-slate-500">
							<span className="mono text-[11px] font-medium text-slate-400 tracking-wide">
								© {new Date().getFullYear()} {PRODUCT_NAME}. All rights
								reserved.
							</span>
							<span className="hidden sm:inline-block h-3 w-px bg-slate-300/60" />
							<div className="hidden sm:flex items-center gap-4 text-slate-400">
								<a href="#" className="hover:text-indigo-600 transition-colors">
									Privacy
								</a>
								<a href="#" className="hover:text-indigo-600 transition-colors">
									Terms
								</a>
							</div>
						</div>

						{/* Social links – subtle icons */}
						<div className="flex items-center gap-3 text-slate-400">
							<a
								href="#"
								className="hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-indigo-50"
								aria-label="GitHub"
							>
								<FontAwesomeIcon icon={faGithub} className="h-4 w-4" />
							</a>
							<a
								href="#"
								className="hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-indigo-50"
								aria-label=""
							>
								<FontAwesomeIcon icon={faTwitter} className="h-4 w-4" />
							</a>
							<a
								href="#"
								className="hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-indigo-50"
								aria-label="LinkedIn"
							>
								<FontAwesomeIcon icon={faLinkedin} className="h-4 w-4" />
							</a>
							<span className="h-4 w-px bg-slate-300/60 mx-1" />
							<span className="flex items-center gap-1.5 text-[11px] text-slate-400">
								Made with{" "}
								<Heart className="h-3 w-3 text-rose-400 fill-rose-400/20" /> by
								your team
							</span>
						</div>
					</div>
				</div>
				{/* Bottom decorative line – adds a polished touch */}
				<div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
					<div className="flex items-center gap-3 text-[10px] text-slate-400">
						<span className="mono">v2.0</span>
						<span className="h-2 w-px bg-slate-300/40" />
						<span className="flex items-center gap-1">
							<span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
							All systems operational
						</span>
					</div>
					<div className="flex items-center gap-2 text-[10px] text-slate-400">
						<span>✨</span>
						<span className="mono">Last deployed: 2h ago</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
