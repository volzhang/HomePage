import {createLocalStoragePersistedStore} from "@/vol_apps/tool/createPersistedStore";

type ThemeStoreState = {
	theme: "light" | "dark"
}

type ThemeStoreActions = {
	setTheme: (theme: ThemeStoreState["theme"]) => void;
}

type SearchStore = ThemeStoreState & ThemeStoreActions;

export const useThemeStore = createLocalStoragePersistedStore<SearchStore>(
	"theme",
	(set) => ({
		theme: "dark",
		setTheme: (theme) => set({theme}),
	})
);