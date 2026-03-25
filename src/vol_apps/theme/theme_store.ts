import {createPersistedStore} from "@/vol_apps/tool/createPersistedStore";

type ThemeStoreState = {
	theme: "light" | "dark"
}

type ThemeStoreActions = {
	setTheme: (theme: ThemeStoreState["theme"]) => void;
}

type ThemeStore = ThemeStoreState & ThemeStoreActions;

const default_theme = "dark";

//测试用//
// await localforage.setItem("theme", "{\"state\":{\"theme\":\"light\"},\"version\":0}")
//-----//

export const useThemeStore = createPersistedStore<ThemeStore>(
	"theme",
	(set) => {
		return {
			theme: default_theme,
			setTheme: (theme) => set({theme}),
		};
	},
	{
		storageType: "localStorage",
		// migrateFromLocalForage: true,
	}
);