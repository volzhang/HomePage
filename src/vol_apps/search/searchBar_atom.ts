type SearchEngines = Record<string, SearchEngineCfg>;
type SearchEngineCfg = {
	name: string;
	url: string;
	param: string;
};
export const SEARCH_ENGINES: SearchEngines = {
	bing: {name: "Bing", url: "https://www.bing.com/search", param: "q"},
	google: {name: "Google", url: "https://www.google.com/search", param: "q"},
	baidu: {name: "Baidu", url: "https://www.baidu.com/s", param: "wd"},
	duckduckgo: {name: "DuckDuckGo", url: "https://duckduckgo.com/", param: "q"},
} as const;