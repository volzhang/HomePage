import {isPlainObject} from "@/vol_apps/tool/isType/isPlainObject";

export const fetchJson = async (url: string) => {
	const res = await fetch(url);
	return await res.json();
};

export const manifestJson = async () => {
	const manifestJson = await fetchJson("/manifest.json");
	return isPlainObject(manifestJson)
		? manifestJson?.version
		: "unknown";
};


