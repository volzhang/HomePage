import {initStoreState, useSignal} from "@/vol_apps/04_persist_atoms";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";
import {toast} from "sonner";
import search_bing from "@/assets/search_bing.svg";
import search_google from "@/assets/search_google.png";
import search_yandex from "@/assets/search_yandex.png";
import search_yahoo from "@/assets/search_yahoo.png";
import search_duckduckgo from "@/assets/search_duckduckgo.svg";
import search_brave from "@/assets/search_brave.svg";
import search_ecosia from "@/assets/search_ecosia.svg";
import search_baidu from "@/assets/search_baidu.png";

export type SearchEngine = {
    id: number;
    queryStringPrefix: string;      // search engine queryStringPrefix, for example, https://www.bing.com/search?q=
    homepageUrl: string;        // search engine homepage url, for example, https://www.bing.com/
    name: string;
    icon: string;       //base64 string(img type), default ""
};

export const defaultEngines: SearchEngine[] = [
    {id: 0, name: "Bing", queryStringPrefix: "https://www.bing.com/search?q=", homepageUrl: "https://www.bing.com/", icon: search_bing},
    {id: 1, name: "Google", queryStringPrefix: "https://www.google.com/search?q=", homepageUrl: "https://www.google.com/", icon: search_google},
    {id: 3, name: "Yandex", queryStringPrefix: "https://yandex.com/search?text=", homepageUrl: "https://yandex.com/", icon: search_yandex},
    {id: 5, name: "Yahoo!", queryStringPrefix: "https://search.yahoo.com/search?p=", homepageUrl: "https://search.yahoo.com/", icon: search_yahoo},
    {id: 2, name: "DuckDuckGo", queryStringPrefix: "https://duckduckgo.com/?q=", homepageUrl: "https://duckduckgo.com/", icon: search_duckduckgo},
    {id: 6, name: "Brave", queryStringPrefix: "https://search.brave.com/search?q=", homepageUrl: "https://search.brave.com/", icon: search_brave},
    {id: 7, name: "Ecosia", queryStringPrefix: "https://www.ecosia.org/search?q=", homepageUrl: "https://www.ecosia.org/", icon: search_ecosia},
    {id: 4, name: "Baidu", queryStringPrefix: "https://www.baidu.com/s?wd=", homepageUrl: "https://www.baidu.com/", icon: search_baidu},
]

export const searchStore = initStoreState({
    storeName: "search",
    fields: {
        engineInUseId: 0,
        customEngines: [] as SearchEngine[],
        visible: true,

        enableTileFilter:true,
    }
})

export const useSearchStore = () => {
    const {engineInUseId, setEngineInUseId} = useSignal(searchStore("engineInUseId"))
    const {customEngines, setCustomEngines} = useSignal(searchStore("customEngines"))

    const getEngines = (): SearchEngine[] => {
        const engines: SearchEngine[] = []
        defaultEngines.forEach(engine => {
            engines.push(engine)
        })
        customEngines.forEach(engine => {
            engines.push(engine)
        })
        return engines;
    }

    const getEngineById = (id: number): SearchEngine | null => {
        const custom = customEngines.find(e => e.id === id);
        if (custom) return custom;
        const def = defaultEngines.find(e => e.id === id);
        if (def) return def;
        console.error("no engine found", id, "fallback to bing");
        return null
    }

    const getCurrentEngine = (): SearchEngine | null => {
        return getEngineById(engineInUseId)
    }

    const getCurrentEngineName = (): string => {
        const engine = getCurrentEngine()
        if (engine) return engine.name
        return t("unknown")
    }

    const generateNewEngineId = (): number => {
        const usedIds = new Set<number>();
        defaultEngines.forEach(e => usedIds.add(e.id));
        customEngines.forEach(e => usedIds.add(e.id));
        return Math.max(...usedIds) + 1;
    };

    // 只能修改自定义引擎
    const updateEngineById = (id: number, updates: Partial<SearchEngine>): void => {
        if (Object.keys(updates).length === 0) return;

        // 只能修改自定义引擎
        const baseEngine = customEngines.find(e => e.id === id);
        if (!baseEngine) return

        const updatedEngine = {...baseEngine, ...updates};

        const existingIndex = customEngines.findIndex(e => e.id === id);
        let newEngines: SearchEngine[];
        if (existingIndex !== -1) {
            newEngines = [...customEngines];
            newEngines[existingIndex] = updatedEngine;
        } else {
            newEngines = [...customEngines, updatedEngine];
        }
        setCustomEngines(newEngines)
    }

    const {t} = useLanguage()
    const creatNewengine = (): number => {
        const newId = generateNewEngineId();
        const n = newId - defaultEngines.length

        const newEngine: SearchEngine = {
            id: newId,
            name: `${t("Custom Search")} ${n === 0 ? "" : n}`,
            queryStringPrefix: "",
            homepageUrl: "",
            icon: "",
        };
        setCustomEngines([...customEngines, newEngine]);
        setEngineInUseId(newId)
        return newId;
    }

    const deleteEngineById = (id: number): void => {
        // 只能删除自定义引擎
        const baseEngine = customEngines.find(e => e.id === id);
        if (!baseEngine) return;

        const newEngines = customEngines.filter(e => e.id !== id);
        setCustomEngines(newEngines);

        if (engineInUseId === id) {
            toast.info(t("fallback to default search engine Bing"));
            setEngineInUseId(0);
        }
    }

    return {
        engineInUseId, setEngineInUseId,
        customEngines, setCustomEngines,
        getEngines,
        getCurrentEngine,
        getCurrentEngineName,
        getEngineById,
        generateNewEngineId,
        updateEngineById,
        creatNewengine,
        deleteEngineById,
    }
}