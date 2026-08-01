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
import MainLayout from "./layouts/MainLayout";
import Board from "./components/board/Board";
import { useBoardData } from "./hooks/useBoardData";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import RootLayout from "./layouts/RootLayout";
import LegalPage from "./pages/LegalPage";

function ProtectedRoute({ children }) {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	if (!isAuthenticated) return <Navigate to="/" replace />;
	return children;
}

function createAppRouter(boardData) {
	return createBrowserRouter(
		[
			{
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
					// 👈 Added Legal Routes
					{
						path: "/terms",
						element: <LegalPage defaultTab="terms" />,
					},
					{
						path: "/privacy",
						element: <LegalPage defaultTab="privacy" />,
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

	return (
		<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
			<Toaster
				position="top-right"
				richColors
				closeButton
				toastOptions={{
					style: {
						borderRadius: "12px",
						fontFamily: "var(--font-mono-ui, monospace)",
						fontSize: "13px",
					},
				}}
			/>
			<RouterProvider router={router} />
		</GoogleOAuthProvider>
	);
}
