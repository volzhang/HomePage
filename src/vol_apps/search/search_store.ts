import {createPersistedStore, LatestStoreVersion} from "@/vol_apps/tool/createPersistedStore";

type Engine = {
    id: number;			//标识
	pos: number;		//排序位置
    name: string;
    url: string;
    param: string;
	homeUrl: string;
}

type SearchStoreState = {
    engineInUseId: Engine["id"]
}

type SearchStoreActions = {
    setEngineInUseByID: (id: Engine["id"]) => void
    setEngineInUseByName: (name: Engine["name"]) => void
    getEngineInUse: () => Engine
}

type SearchStore = SearchStoreState & SearchStoreActions;

export const SEARCH_ENGINES: Engine[] = [
	{id: 0, pos: 1, name: "Bing",       url: "https://www.bing.com/search",      param: "q",   homeUrl: "https://www.bing.com/"},
	{id: 1, pos: 2, name: "Google",     url: "https://www.google.com/search",    param: "q",   homeUrl: "https://www.google.com/"},
	{id: 2, pos: 5, name: "DuckDuckGo", url: "https://duckduckgo.com/",          param: "q",   homeUrl: "https://duckduckgo.com/"},
	{id: 3, pos: 3, name: "Yandex",     url: "https://yandex.com/search",        param: "text",homeUrl: "https://yandex.com/"},
	{id: 4, pos: 8, name: "Baidu",      url: "https://www.baidu.com/s",          param: "wd",  homeUrl: "https://www.baidu.com/"},
	{id: 5, pos: 4, name: "Yahoo!",     url: "https://search.yahoo.com/search",  param: "p",   homeUrl: "https://search.yahoo.com/"},
	{id: 6, pos: 6, name: "Brave",      url: "https://search.brave.com/search",  param: "q",   homeUrl: "https://search.brave.com/"},
	{id: 7, pos: 7, name: "Ecosia",     url: "https://www.ecosia.org/search",    param: "q",   homeUrl: "https://www.ecosia.org/"},
] as const;

const INITIAL_STATE = {
    engineInUseId: 0,
}

export const useSearchStore = createPersistedStore<SearchStore>(
    "search",
    (set, get) => ({
        ...INITIAL_STATE,

        setEngineInUseByID: (engineInUseId: Engine["id"]) =>
            set({engineInUseId}),

        setEngineInUseByName: (engineInUseName: Engine["name"]) => {
            const engine = SEARCH_ENGINES.find((e) => e.name === engineInUseName);
            if (engine) {
                set({engineInUseId: engine.id});
            }
        },

        getEngineInUse: () => {
            const inUseId = get().engineInUseId;
            return SEARCH_ENGINES.find((e) => e.id === inUseId) || SEARCH_ENGINES[0];
        },
    }),

    {
        version: LatestStoreVersion,  //清除垃圾KV
        migrate: (persistedState) => {
            if (!persistedState || typeof persistedState !== "object") return {};
            const allowed = new Set(Object.keys(INITIAL_STATE));
            return Object.fromEntries(
                Object.entries(persistedState).filter(([key]) => allowed.has(key))
            );
        },
    }
);