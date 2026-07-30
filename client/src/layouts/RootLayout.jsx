import { useEffect, useRef } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import gsap from "gsap";

export default function RootLayout() {
	const location = useLocation();
	const outlet = useOutlet();
	const pageRef = useRef(null);

	useEffect(() => {
		if (pageRef.current) {
			// Animate the new page in
			gsap.fromTo(
				pageRef.current,
				{
					opacity: 0,
					y: 20, // Slight slide up
				},
				{
					opacity: 1,
					y: 0,
					duration: 0.5,
					ease: "power2.out",
					clearProps: "all", // Clears transform/opacity after animation to prevent layout bugs
				},
			);
		}
	}, [location.pathname]); // Trigger on route change

	return (
		<div ref={pageRef} key={location.pathname} className="min-h-screen w-full">
			{/* 
        The key forces React to treat this as a brand new element 
        when the URL changes, triggering a fresh mount.
      */}
			{outlet}
		</div>
	);
}
