import { useEffect, useRef } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import gsap from "gsap";

export default function RootLayout() {
	const location = useLocation();
	const outlet = useOutlet();
	const pageRef = useRef(null);

	useEffect(() => {
		if (pageRef.current) {
			// Subtle opacity fade without vertical offset expansion
			gsap.fromTo(
				pageRef.current,
				{
					opacity: 0,
				},
				{
					opacity: 1,
					duration: 0.35,
					ease: "power2.out",
					clearProps: "all",
				},
			);
		}
	}, [location.pathname]); // Trigger on route change

	return (
		<div
			ref={pageRef}
			key={location.pathname}
			className="min-h-screen w-full overflow-x-hidden flex flex-col"
		>
			{outlet}
		</div>
	);
}
