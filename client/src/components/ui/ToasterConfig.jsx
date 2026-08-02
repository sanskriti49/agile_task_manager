import React from "react";
import { Toaster } from "sonner";

export default function ToasterConfig() {
	return (
		<Toaster
			position="bottom-right"
			expand={false}
			richColors
			closeButton
			toastOptions={{
				style: {
					background: "#ffffff",
					border: "1px solid #e2e8f0",
					borderRadius: "0.75rem",
					padding: "0.75rem 1rem",
					fontSize: "0.75rem",
					color: "#0f172a",
					boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
				},
				className: "font-sans",
			}}
		/>
	);
}
