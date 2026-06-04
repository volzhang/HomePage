import * as v from "valibot";
import search_bing from "@/assets/search_bing.svg";
import search_google from "@/assets/search_google.png";
import search_duckduckgo from "@/assets/search_duckduckgo.svg";
import search_yandex from "@/assets/search_yandex.png";
import search_baidu from "@/assets/search_baidu.png";
import search_yahoo from "@/assets/search_yahoo.png";
import search_brave from "@/assets/search_brave.svg";
import search_ecosia from "@/assets/search_ecosia.svg";
import {createMigratePersistAtom} from "@/vol_apps/04_persist_atoms/signal.ts";

type Engine = {
    id: number;			//标识
    pos: number;		//排序位置
    name: string;
    url: string;
    param: string;
    homeUrl: string;
    icon?: string
}

export const SEARCH_ENGINES: Engine[] = [
    {id: 0, pos: 1, name: "Bing",       url: "https://www.bing.com/search",      param: "q",   homeUrl: "https://www.bing.com/", icon: search_bing},
    {id: 1, pos: 2, name: "Google",     url: "https://www.google.com/search",    param: "q",   homeUrl: "https://www.google.com/", icon: search_google},
    {id: 2, pos: 5, name: "DuckDuckGo", url: "https://duckduckgo.com/",          param: "q",   homeUrl: "https://duckduckgo.com/", icon: search_duckduckgo},
    {id: 3, pos: 3, name: "Yandex",     url: "https://yandex.com/search",        param: "text",homeUrl: "https://yandex.com/", icon: search_yandex},
    {id: 4, pos: 8, name: "Baidu",      url: "https://www.baidu.com/s",          param: "wd",  homeUrl: "https://www.baidu.com/", icon: search_baidu},
    {id: 5, pos: 4, name: "Yahoo!",     url: "https://search.yahoo.com/search",  param: "p",   homeUrl: "https://search.yahoo.com/", icon: search_yahoo},
    {id: 6, pos: 6, name: "Brave",      url: "https://search.brave.com/search",  param: "q",   homeUrl: "https://search.brave.com/", icon: search_brave},
    {id: 7, pos: 7, name: "Ecosia",     url: "https://www.ecosia.org/search",    param: "q",   homeUrl: "https://www.ecosia.org/", icon: search_ecosia},
] as const;

const searchSchema = v.object({
    engineInUseId: v.number()
})

const searchKey = "search"
const searchDefault = {engineInUseId: 0}

const searchAtom = createMigratePersistAtom({
    key: searchKey,
    stateSchema: searchSchema,
    initState: searchDefault,
    legacyDb: "idb",
})

export const useSearchAtom = () => {
    const {engineInUseId, setEngineInUseId} = searchAtom.useField("engineInUseId")

    const  setEngineInUseByName = (engineInUseName: Engine["name"]) => {
            const engine = SEARCH_ENGINES.find((e) => e.name === engineInUseName);
            if (engine) setEngineInUseId(engine.id)
        }

    const getEngineInUse =  () => SEARCH_ENGINES.find((e) => e.id === engineInUseId) || SEARCH_ENGINES[0];

    return {
        setEngineInUseByName,
        getEngineInUse,
    }
}