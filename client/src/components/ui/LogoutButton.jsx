import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { LogOut } from "lucide-react";
import { FOCUS_RING } from "../../data/constants";

export default function LogoutButton() {
	const navigate = useNavigate();
	const logout = useAuthStore((state) => state.logout);
	return (
		<button
			onClick={() => {
				logout();
				navigate("/");
			}}
			className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600 ${FOCUS_RING}`}
		>
			<LogOut className="h-4 w-4" />
			<span className="hidden sm:block">Logout</span>
		</button>
	);
}
