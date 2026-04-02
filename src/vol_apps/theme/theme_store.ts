import {createPersistedStore, LatestStoreVersion} from "@/vol_apps/tool/createPersistedStore";

type ThemeStoreState = {
    theme: "light" | "dark"
}

type ThemeStoreActions = {
    setTheme: (theme: ThemeStoreState["theme"]) => void;
}

type ThemeStore = ThemeStoreState & ThemeStoreActions;

const default_theme = "dark";

const INITIAL_STATE = {
    theme: default_theme,
}

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
        version: LatestStoreVersion,
        // version 1.1, //清除垃圾KV
        migrate: (persistedState) => {
            if (!persistedState || typeof persistedState !== "object") return {};
            const allowed = new Set(Object.keys(INITIAL_STATE));
            return Object.fromEntries(
                Object.entries(persistedState).filter(([key]) => allowed.has(key))
            );
        },
    }
);