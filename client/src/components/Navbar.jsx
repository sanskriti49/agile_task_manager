import { ArrowRight, LayoutGrid, CheckSquare, User } from "lucide-react";
import { useEffect, useState } from "react";
import { FOCUS_RING, PRODUCT_NAME } from "../data/constants";
import { NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import Logo from "./ui/Logo";

export default function Navbar({ onGetStarted }) {
	const [isScrolled, setIsScrolled] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const user = useAuthStore((state) => state.user);
	const firstName = user?.name ? user.name.split(" ")[0] : "Dashboard";

	useEffect(() => {
		const onScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const navItems = [
		{ name: "Features", path: "/", hash: "features" },
		{ name: "Workflow", path: "/", hash: "workflow" },
		{ name: "Changelog", path: "/", hash: "changelog" },
		{ name: "Pricing", path: "/", hash: "pricing" },
	];

	const handleNavClick = (e, path, hash) => {
		e.preventDefault();

		if (location.pathname === path) {
			// Already on the correct page, just scroll and update URL hash
			const el = document.getElementById(hash);
			if (el) {
				el.scrollIntoView({ behavior: "smooth" });
				// Update the URL without jumping or reloading
				window.history.replaceState(null, "", `#${hash}`);
			}
		} else {
			// Navigate to the landing page first
			navigate(path);

			// Wait 500ms for the heavy landing page components to mount
			setTimeout(() => {
				const el = document.getElementById(hash);
				if (el) {
					el.scrollIntoView({ behavior: "smooth" });
					window.history.replaceState(null, "", `#${hash}`);
				}
			}, 500);
		}
	};

	return (
		<header
			className={`fixed top-0 inset-x-0 z-40 py-3 border-b transition-all duration-500 ease-premium ${
				isScrolled
					? "bg-white/90 backdrop-blur-lg border-slate-200/70 shadow-sm"
					: "bg-transparent border-transparent"
			}`}
		>
			<div className="max-w-6xl mx-auto px-5 sm:px-8 h-10 flex items-center justify-between">
				<Logo
					to="/"
					isScrolled={isScrolled}
					showText={true}
					className="w-7 h-7 transition-transform duration-300 group-hover:scale-105"
				/>
				<nav className="hidden md:flex items-center gap-2">
					{navItems.map((item) => (
						<a
							key={item.name}
							href={`#${item.hash}`}
							onClick={(e) => handleNavClick(e, item.path, item.hash)}
							className={`inter relative px-3 py-2 text-sm transition-colors group ${
								isScrolled
									? "text-slate-500 hover:text-slate-900"
									: "text-slate-300 hover:text-white"
							}`}
						>
							{item.name}
							<span className="absolute bottom-1 left-3 right-3 h-px bg-teal-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-premium origin-left"></span>
						</a>
					))}
				</nav>

				{/* Right Side Actions: Authenticated vs Guest */}
				<div className="flex items-center gap-3">
					{isAuthenticated ? (
						<div className="flex items-center gap-2">
							<Link
								to="/my-work"
								className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 transition-colors rounded-lg ${
									isScrolled
										? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
										: "text-slate-300 hover:text-white hover:bg-slate-800/60"
								}`}
							>
								<CheckSquare className="h-3.5 w-3.5 text-teal-400" />
								<span>My Work</span>
							</Link>

							<Link
								to="/dashboard"
								className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition duration-300 ease-premium ${FOCUS_RING} ${
									isScrolled
										? "bg-slate-900 hover:bg-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/20"
										: "bg-teal-500 hover:bg-teal-400 text-white hover:shadow-lg hover:shadow-teal-500/30"
								}`}
							>
								<LayoutGrid className="h-3.5 w-3.5" />
								<span>Go to Dashboard</span>
								<ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-premium group-hover:translate-x-0.5" />
							</Link>
						</div>
					) : (
						<>
							<NavLink
								to="/login"
								className={`hidden sm:inline text-sm font-medium px-3 py-2 transition-colors rounded-md ${FOCUS_RING} ${
									isScrolled
										? "text-slate-600 hover:text-slate-900"
										: "text-slate-300 hover:text-white"
								}`}
							>
								Log in
							</NavLink>
							<NavLink
								to="/signup"
								className={`group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition duration-300 ease-premium ${FOCUS_RING} ${
									isScrolled
										? "bg-slate-900 hover:bg-teal-500 text-white hover:shadow-lg hover:shadow-teal-500/30"
										: "bg-white text-slate-900 hover:bg-teal-500 hover:text-white"
								}`}
							>
								Start free
								<ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-premium group-hover:translate-x-0.5" />
							</NavLink>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
