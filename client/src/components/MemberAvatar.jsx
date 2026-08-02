import { ONLINE_NOW, PEOPLE } from "../data/people";

export default function MemberAvatar({ name, size = "h-6 w-6" }) {
	const person = PEOPLE[name];
	if (!person) return null;
	const online = ONLINE_NOW.has(name);
	return (
		<div
			className={`relative flex ${size} items-center justify-center rounded-full ${person.color} text-xs font-semibold text-white ring-2 ring-white`}
		>
			{person.initials}
			{online && (
				<span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
			)}
		</div>
	);
}
