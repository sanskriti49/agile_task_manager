import React from "react";
import { useRouteError, Link } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
export default function ErrorBoundary() {
	const error = useRouteError();
	const errorMessage =
		error?.message ||
		error?.statusText ||
		"An unexpected application error occurred.";
	console.error("ErrorBoundary caught:", error);
	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-slate-900 dark:text-slate-100 font-mono-ui">
			<div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
				<div className="h-12 w-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
					<AlertTriangle className="h-6 w-6" />
				</div>
				<h2 className="display text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
					Something Went Wrong
				</h2>
				<p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
					{errorMessage}
				</p>
				<div className="flex items-center justify-center gap-3 mt-6">
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
					>
						<RefreshCw className="h-3.5 w-3.5" /> Reload Page
					</button>
					<Link
						to="/dashboard"
						className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-xs font-bold text-white transition-colors shadow-2xs"
					>
						<Home className="h-3.5 w-3.5" /> Go to Dashboard
					</Link>
				</div>
			</div>
		</div>
	);
}
