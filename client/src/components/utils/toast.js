import { toast as sonnerToast } from "sonner";
import { CheckCircle2, AlertCircle, Info, Loader2 } from "lucide-react";

export const notify = {
	success: (message, description) => {
		sonnerToast.custom((t) => (
			<div className="flex items-start gap-3 w-full bg-white border border-slate-200 shadow-lg shadow-slate-200/50 rounded-xl p-3.5 transition-all">
				<CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
				<div className="flex-1 min-w-0">
					<p className="text-xs font-semibold text-slate-800">{message}</p>
					{description && (
						<p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
							{description}
						</p>
					)}
				</div>
			</div>
		));
	},

	error: (message, description) => {
		sonnerToast.custom((t) => (
			<div className="flex items-start gap-3 w-full bg-white border border-rose-200 shadow-lg shadow-rose-100 rounded-xl p-3.5 transition-all">
				<AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
				<div className="flex-1 min-w-0">
					<p className="text-xs font-semibold text-slate-800">{message}</p>
					{description && (
						<p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
							{description}
						</p>
					)}
				</div>
			</div>
		));
	},

	info: (message, description) => {
		sonnerToast.custom((t) => (
			<div className="flex items-start gap-3 w-full bg-white border border-sky-200 shadow-lg shadow-sky-100 rounded-xl p-3.5 transition-all">
				<Info className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
				<div className="flex-1 min-w-0">
					<p className="text-xs font-semibold text-slate-800">{message}</p>
					{description && (
						<p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
							{description}
						</p>
					)}
				</div>
			</div>
		));
	},

	promise: (promise, { loading, success, error }) => {
		return sonnerToast.promise(promise, {
			loading: loading || "Processing...",
			success: (data) => success(data) || "Operation completed successfully!",
			error: (err) => error(err) || "Something went wrong.",
		});
	},
};
