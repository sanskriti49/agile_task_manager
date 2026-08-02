export default function PulseStrip({ pulse, palette }) {
	return (
		<div className="flex h-6 items-end gap-0.5">
			{pulse.map((v, i) => (
				<span
					key={i}
					className={`w-1 rounded-sm ${palette.fill} opacity-70`}
					style={{ height: `${Math.max(v * 100, 14)}%` }}
				/>
			))}
		</div>
	);
}
