import React from "react";
import {
	createBrowserRouter,
	RouterProvider,
	Navigate,
} from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import LandingPage from "./pages/LandingPage";
import WorkspacesDashboard from "./pages/WorkspacesDashboard";
import MainLayout from "./layouts/MainLayout";
import Board from "./components/board/Board";
import { useBoardData } from "./hooks/useBoardData";
import AuthPages, { LoginPage, SignupPage } from "./pages/AuthPages";
import RootLayout from "./layouts/RootLayout"; // <-- Import the new layout

function ProtectedRoute({ children }) {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	if (!isAuthenticated) return <Navigate to="/" replace />;
	return children;
}

function createAppRouter(boardData) {
	return createBrowserRouter(
		[
			{
				// Wrap everything in RootLayout so GSAP handles all transitions
				element: <RootLayout />,
				children: [
					{
						path: "/",
						element: <LandingPage />,
					},
					{
						path: "/login",
						element: <LoginPage />,
					},
					{
						path: "/signup",
						element: <SignupPage />,
					},
					{
						element: (
							<ProtectedRoute>
								<MainLayout boardData={boardData} />
							</ProtectedRoute>
						),
						children: [
							{
								path: "dashboard",
								element: <WorkspacesDashboard />,
							},
							{
								path: "workspace/:id",
								element: <Board boardData={boardData} />,
							},
						],
					},
					{
						path: "*",
						element: <Navigate to="/" replace />,
					},
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
}

export default function App() {
	const boardData = useBoardData();
	const router = createAppRouter(boardData);

	return <RouterProvider router={router} />;
}
