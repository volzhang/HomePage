import {createPersistedStore} from "@/vol_apps/tool/createPersistedStore";

type Engine = {
	id: number;
	name: string;
	url: string;
	param: string;
}

type SearchStoreState = {
	engines: Engine[]
	engineInUseId: Engine["id"]
}

type SearchStoreActions = {
	setEngineInUseByID: (id: Engine["id"]) => void
	setEngineInUseByName: (name: Engine["name"]) => void
	getEngineInUse: () => Engine
}

type SearchStore = SearchStoreState & SearchStoreActions;

const SEARCH_ENGINES: Engine[] = [
	{id: 0, name: "Bing", url: "https://www.bing.com/search", param: "q"},
	{id: 1, name: "Google", url: "https://www.google.com/search", param: "q"},
	{id: 2, name: "DuckDuckGo", url: "https://duckduckgo.com/", param: "q"},
	{id: 3, name: "Yandex", url: "https://yandex.com/search", param: "text"},
	{id: 4, name: "Baidu", url: "https://www.baidu.com/s", param: "wd"},
] as const;

export const useSearchStore = createPersistedStore<SearchStore>(
	"search",
	(set, get) => ({
		engines: SEARCH_ENGINES,
		engineInUseId: 0,

		setEngineInUseByID: (engineInUseId: Engine["id"]) =>
			set({ engineInUseId }),

		setEngineInUseByName: (engineInUseName: Engine["name"]) => {
			const engine = get().engines.find((e) => e.name === engineInUseName);
			if (engine) {
				set({ engineInUseId: engine.id });
			}
		},

		getEngineInUse: () => {
			const inUseId = get().engineInUseId;
			return get().engines.find((e) => e.id === inUseId) || SEARCH_ENGINES[0];
		},
	})
);