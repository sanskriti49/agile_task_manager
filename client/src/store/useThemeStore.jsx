import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
	persist(
		(set, get) => ({
			theme: "light", // 'light' | 'dark'

			toggleTheme: () => {
				const nextTheme = get().theme === "light" ? "dark" : "light";
				set({ theme: nextTheme });
				if (nextTheme === "dark") {
					document.documentElement.classList.add("dark");
				} else {
					document.documentElement.classList.remove("dark");
				}
			},

			setTheme: (theme) => {
				set({ theme });
				if (theme === "dark") {
					document.documentElement.classList.add("dark");
				} else {
					document.documentElement.classList.remove("dark");
				}
			},

			initTheme: () => {
				const current = get().theme;
				if (current === "dark") {
					document.documentElement.classList.add("dark");
				} else {
					document.documentElement.classList.remove("dark");
				}
			},
		}),
		{
			name: "flux-theme-storage",
		},
	),
);
