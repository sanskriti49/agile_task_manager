import React, { useState } from "react";
import LegalModal from "../components/modals/LegalModal";

export default function AuthTermsNotice({
	mode = "signin",
	useModal = true,
	className = "",
}) {
	const [modalOpen, setModalOpen] = useState(false);
	const [initialTab, setInitialTab] = useState("terms");

	const openTerms = (e) => {
		e.preventDefault();
		if (useModal) {
			setInitialTab("terms");
			setModalOpen(true);
		} else {
			window.open("/terms", "_blank");
		}
	};

	const openPrivacy = (e) => {
		e.preventDefault();
		if (useModal) {
			setInitialTab("privacy");
			setModalOpen(true);
		} else {
			window.open("/privacy", "_blank");
		}
	};

	return (
		<>
			{/* Renders in-context modal overlay */}
			{useModal && (
				<LegalModal
					isOpen={modalOpen}
					onClose={() => setModalOpen(false)}
					initialTab={initialTab}
				/>
			)}
		</>
	);
}
