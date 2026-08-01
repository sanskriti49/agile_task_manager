import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
	persist(
		(set) => ({
			user: null,
			token: null,
			isAuthenticated: false,

			// Single method used by both Google Login and Standard Email Login
			setAuth: (user, token) => {
				set({
					user,
					token,
					isAuthenticated: true,
				});
			},

			// Clears auth state and local storage on logout
			logout: () => {
				set({
					user: null,
					token: null,
					isAuthenticated: false,
				});
			},
		}),
		{
			name: "auth-storage", // Key used in localStorage to persist auth on page refresh
		},
	),
);
