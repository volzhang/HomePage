import {isPlainObject} from "@/vol_apps/tool/isType/isPlainObject";
import {addBootstrapTask} from "@/vol_apps/bootstrap/bootstrap";

export const fetchJson = async (url: string) => {
	const res = await fetch(url);
	return await res.json();
};

const manifestJson = async () => {
	const manifestJson = await fetchJson("/manifest.json");
	return isPlainObject(manifestJson)
		? manifestJson?.version
		: "unknown";
};

export let VERSION = "unknown";

addBootstrapTask(async () => {
	VERSION = await manifestJson(); // 原来的异步逻辑照搬
});

