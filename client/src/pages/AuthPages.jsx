// src/pages/AuthPages.jsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	ArrowRight,
	Mail,
	Lock,
	User,
	Eye,
	EyeOff,
	Check,
	Sparkles,
} from "lucide-react";
import AuthShell from "../components/ui/AuthShell";
import BrandPanel from "../components/ui/BrandPanel";

const FOCUS_RING =
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2";

/* ------------------------------------------------------------------ */
/*  Shared atoms                                                      */
/* ------------------------------------------------------------------ */

function FieldLabel({ children }) {
	return (
		<span className="font-mono-ui text-[11px] font-medium uppercase tracking-wide text-slate-500">
			{children}
		</span>
	);
}

function TextField({
	id,
	type = "text",
	label,
	value,
	onChange,
	placeholder,
	autoComplete,
	trailing,
}) {
	return (
		<label htmlFor={id} className="block">
			<span className="mb-1.5 flex items-center justify-between">
				<FieldLabel>{label}</FieldLabel>
			</span>
			<div className="relative">
				<input
					id={id}
					type={type}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					autoComplete={autoComplete}
					className={`font-mono-ui w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 transition-colors hover:border-stone-300 focus:border-teal-600 ${FOCUS_RING}`}
				/>
				{trailing}
			</div>
		</label>
	);
}

function PasswordField({
	id,
	label,
	value,
	onChange,
	placeholder,
	autoComplete,
}) {
	const [visible, setVisible] = useState(false);
	return (
		<label htmlFor={id} className="block">
			<span className="mb-1.5 flex items-center justify-between">
				<FieldLabel>{label}</FieldLabel>
				<Link
					to="/forgot"
					className="font-mono-ui text-[11px] font-medium text-teal-600 hover:text-teal-700"
				>
					Forgot?
				</Link>
			</span>
			<div className="relative">
				<Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
				<input
					id={id}
					type={visible ? "text" : "password"}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					autoComplete={autoComplete}
					className={`font-mono-ui w-full rounded-lg border border-stone-200 bg-white py-2.5 pl-9 pr-10 text-sm text-stone-800 placeholder:text-stone-400 transition-colors hover:border-stone-300 focus:border-teal-600 ${FOCUS_RING}`}
				/>
				<button
					type="button"
					onClick={() => setVisible((v) => !v)}
					aria-label={visible ? "Hide password" : "Show password"}
					className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-stone-400 hover:text-stone-700 ${FOCUS_RING}`}
				>
					{visible ? (
						<EyeOff className="h-4 w-4" />
					) : (
						<Eye className="h-4 w-4" />
					)}
				</button>
			</div>
		</label>
	);
}

function SegmentedMeter({ progress, segments = 8 }) {
	const filled = Math.round((progress / 100) * segments);
	const color =
		progress < 34
			? "bg-rose-500"
			: progress < 67
				? "bg-amber-500"
				: "bg-teal-600";
	return (
		<div className="flex gap-0.5">
			{Array.from({ length: segments }).map((_, i) => (
				<span
					key={i}
					className={`h-1 flex-1 rounded-sm ${i < filled ? color : "bg-stone-200"}`}
				/>
			))}
		</div>
	);
}

function scorePassword(pw = "") {
	let s = 0;
	if (pw.length >= 8) s += 25;
	if (pw.length >= 12) s += 15;
	if (/[A-Z]/.test(pw)) s += 15;
	if (/[a-z]/.test(pw)) s += 15;
	if (/[0-9]/.test(pw)) s += 15;
	if (/[^A-Za-z0-9]/.test(pw)) s += 15;
	return Math.min(s, 100);
}

function SocialButtons() {
	return (
		<div className="grid grid-cols-2 gap-3">
			<button
				type="button"
				className={`flex items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50 ${FOCUS_RING}`}
			>
				<svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
					<path
						fill="#4285F4"
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
					/>
					<path
						fill="#34A853"
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
					/>
					<path
						fill="#FBBC05"
						d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
					/>
					<path
						fill="#EA4335"
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
					/>
				</svg>
				Google
			</button>
		</div>
	);
}

function Divider() {
	return (
		<div className="flex items-center gap-3 py-1">
			<span className="h-px flex-1 bg-stone-200" />
			<span className="font-mono-ui text-[11px] uppercase tracking-wide text-stone-400">
				or
			</span>
			<span className="h-px flex-1 bg-stone-200" />
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Login page                                                        */
/* ------------------------------------------------------------------ */

export function LoginPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [remember, setRemember] = useState(true);

	function onSubmit(e) {
		e.preventDefault();
		// TODO: wire to auth store
		navigate("/dashboard");
	}

	return (
		<AuthShell
			panel={
				<BrandPanel
					headline="The work didn't pause. Jump back in."
					sub="Authenticate to pull the latest board state. Your tickets are exactly where you left them."
				/>
			}
		>
			<span className="font-mono-ui text-[11px] font-medium uppercase tracking-wide text-teal-600">
				Authenticate
			</span>
			<h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-stone-900">
				Reconnect to the flow.
			</h1>
			<p className="mt-1.5 text-sm text-stone-500">
				New here?{" "}
				<Link
					to="/signup"
					className="font-medium text-teal-600 hover:text-teal-700"
				>
					Create account
				</Link>
			</p>

			<form onSubmit={onSubmit} className="mt-8 space-y-4">
				<TextField
					id="email"
					type="email"
					label="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="you@company.com"
					autoComplete="email"
					trailing={
						<Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
					}
				/>
				<PasswordField
					id="password"
					label="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="••••••••"
					autoComplete="current-password"
				/>

				<div className="flex items-center justify-between pt-1">
					<label
						htmlFor="remember"
						className={`flex items-center gap-2 text-sm text-stone-600 ${FOCUS_RING} rounded cursor-pointer`}
					>
						<span
							className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
								remember
									? "border-teal-600 bg-teal-600 text-white"
									: "border-stone-300 bg-white"
							}`}
						>
							{remember && <Check className="h-3 w-3" strokeWidth={3} />}
						</span>
						<input
							id="remember"
							type="checkbox"
							className="sr-only"
							checked={remember}
							onChange={(e) => setRemember(e.target.checked)}
						/>
						Keep me signed in
					</label>
				</div>

				<button
					type="submit"
					className={`group mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 px-5 py-3 text-sm font-medium text-white transition duration-300 ease-premium hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/30 ${FOCUS_RING}`}
				>
					Sign in
					<ArrowRight className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-0.5" />
				</button>
			</form>

			<div className="mt-6">
				<Divider />
				<div className="mt-4">
					<SocialButtons />
				</div>
			</div>

			<p className="font-mono-ui mt-8 text-center text-[11px] text-stone-400">
				By signing in you agree to our{" "}
				<a href="#" className="text-stone-500 hover:text-stone-700">
					Terms
				</a>{" "}
				&{" "}
				<a href="#" className="text-stone-500 hover:text-stone-700">
					Privacy Policy
				</a>
				.
			</p>
		</AuthShell>
	);
}

/* ------------------------------------------------------------------ */
/*  Signup page                                                       */
/* ------------------------------------------------------------------ */

export function SignupPage() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [agree, setAgree] = useState(false);

	const score = useMemo(() => scorePassword(password), [password]);
	const strengthLabel =
		score < 34 ? "Weak" : score < 67 ? "Okay" : score === 0 ? "" : "Strong";

	function onSubmit(e) {
		e.preventDefault();
		if (!agree) return;
		// TODO: wire to auth store
		navigate("/dashboard");
	}

	return (
		<AuthShell
			panel={
				<BrandPanel
					headline="Provision a space where things actually ship."
					sub="Two clicks to your first board. Invite the team, grab a card, and skip the standup."
				/>
			}
		>
			<span className="font-mono-ui inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-teal-600">
				<Sparkles className="h-3.5 w-3.5" />
				Claim Access
			</span>
			<h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-stone-900">
				Spin up your kanban board.
			</h1>
			<p className="mt-1.5 text-sm text-stone-500">
				Already in the network?{" "}
				<Link
					to="/login"
					className="font-medium text-teal-600 hover:text-teal-700"
				>
					Sign in
				</Link>
			</p>

			<form onSubmit={onSubmit} className="mt-8 space-y-4">
				<TextField
					id="name"
					label="Full name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="John"
					autoComplete="name"
					trailing={
						<User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
					}
				/>
				<TextField
					id="email"
					type="email"
					label="Work email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="you@company.com"
					autoComplete="email"
					trailing={
						<Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
					}
				/>

				<div>
					<PasswordField
						id="new-password"
						label="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="At least 8 characters"
						autoComplete="new-password"
					/>
					{password.length > 0 && (
						<div className="mt-2 flex items-center gap-3">
							<div className="flex-1">
								<SegmentedMeter progress={score} segments={8} />
							</div>
							<span
								className={`font-mono-ui text-[11px] font-medium ${
									score < 34
										? "text-rose-600"
										: score < 67
											? "text-amber-600"
											: "text-teal-600"
								}`}
							>
								{strengthLabel}
							</span>
						</div>
					)}
				</div>

				<label
					className={`flex items-start gap-2.5 pt-1 text-sm text-stone-600 ${FOCUS_RING} rounded cursor-pointer`}
				>
					<span
						className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
							agree
								? "border-teal-600 bg-teal-600 text-white"
								: "border-stone-300 bg-white"
						}`}
					>
						{agree && <Check className="h-3 w-3" strokeWidth={3} />}
					</span>
					<input
						type="checkbox"
						className="sr-only"
						checked={agree}
						onChange={(e) => setAgree(e.target.checked)}
					/>
					<span>
						I agree to the{" "}
						<a
							href="#"
							className="font-medium text-stone-800 hover:text-teal-700"
							onClick={(e) => e.stopPropagation()}
						>
							Terms of Service
						</a>{" "}
						and{" "}
						<a
							href="#"
							className="font-medium text-stone-800 hover:text-teal-700"
							onClick={(e) => e.stopPropagation()}
						>
							Privacy Policy
						</a>
						.
					</span>
				</label>

				<button
					type="submit"
					disabled={!agree}
					className={`group mt-2 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white transition duration-300 ease-premium ${
						agree
							? "bg-teal-600 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/30"
							: "cursor-not-allowed bg-stone-300"
					} ${FOCUS_RING}`}
				>
					Create account
					<ArrowRight className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-0.5" />
				</button>
			</form>

			<div className="mt-6">
				<Divider />
				<div className="mt-4">
					<SocialButtons />
				</div>
			</div>

			<p className="font-mono-ui mt-8 text-center text-[11px] text-stone-400">
				Free for teams of up to five · No credit card required
			</p>
		</AuthShell>
	);
}

export default SignupPage;
