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
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

function ProtectedRoute({ children }) {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	if (!isAuthenticated) return <Navigate to="/" replace />;
	return children;
}

function createAppRouter(boardData) {
	return createBrowserRouter(
		[
			{
				path: "/",
				element: <LandingPage />,
			},
			{
				path: "/login",
				element: <LoginPage />,
			},
			{
				path: "/sign-up",
				element: <SignUpPage />,
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
