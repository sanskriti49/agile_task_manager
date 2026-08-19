import React from "react";
import {
	createBrowserRouter,
	RouterProvider,
	Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";
import { useAuthStore } from "./store/useAuthStore";
import LandingPage from "./pages/LandingPage";
import WorkspacesDashboard from "./pages/WorkspacesDashboard";
import MyWorkPage from "./pages/MyWorkPage";
import ProjectDashboardPage from "./pages/ProjectDashboardPage";
import SprintManagementPage from "./pages/SprintManagementPage";
import MainLayout from "./layouts/MainLayout";
import Board from "./components/board/Board";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import RootLayout from "./layouts/RootLayout";
import LegalPage from "./pages/LegalPage";
import ErrorBoundary from "./components/common/ErrorBoundary";

function ProtectedRoute({ children }) {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	if (!isAuthenticated) return <Navigate to="/" replace />;
	return children;
}

const router = createBrowserRouter(
	[
		{
			element: <RootLayout />,
			errorElement: <ErrorBoundary />,
			children: [
				{ path: "/", element: <LandingPage /> },
				{ path: "/login", element: <LoginPage /> },
				{ path: "/signup", element: <SignupPage /> },
				{ path: "/terms", element: <LegalPage defaultTab="terms" /> },
				{ path: "/privacy", element: <LegalPage defaultTab="privacy" /> },
				{
					element: (
						<ProtectedRoute>
							<MainLayout />
						</ProtectedRoute>
					),
					children: [
						{ path: "dashboard", element: <WorkspacesDashboard /> },
						{ path: "my-work", element: <MyWorkPage /> },
						{ path: "workspace/:id", element: <Board /> },
						{
							path: "workspace/:id/dashboard",
							element: <ProjectDashboardPage />,
						},
						{
							path: "workspace/:id/sprints",
							element: <SprintManagementPage />,
						},
					],
				},
				{ path: "*", element: <Navigate to="/" replace /> },
			],
		},
	],
	{
		future: {
			v7_startTransition: true,
			v7_relativeSplatPath: true,
		},
	},
);

export default function App() {
	return (
		<GoogleOAuthProvider
			clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "google-client-id"}
		>
			<Toaster position="top-right" richColors closeButton />
			<RouterProvider router={router} />
		</GoogleOAuthProvider>
	);
}
