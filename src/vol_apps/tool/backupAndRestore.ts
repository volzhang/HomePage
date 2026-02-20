import {persistedStoresRehydrate} from "@/vol_apps/tool/createPersistedStore";
import {download, timeStamp} from "@/vol_apps/tool/download";
import type {JsonFile} from "@/vol_apps/tool/filePicker";
import {
	isPlainObject, isValidTypeExt, type ValidTypeExt, validTypeParse,
	// validTypeParse,
	validTypeStringify
} from "@/vol_apps/tool/isType";
import {fetchVersion} from "@/vol_apps/version/version";
import localforage from "localforage";

export const downloadAsJsonFile = async (
	obj: ValidTypeExt,
	file_name = timeStamp(),
): Promise<void> => {
	const jsonContent = await validTypeStringify(obj);
	const blob = new Blob([jsonContent], {
		type: "application/json;charset=utf-8",
	});
	if (!file_name.endsWith(".json")) file_name += ".json";
	const url = URL.createObjectURL(blob);
	try {
		download(url, file_name);
	} finally {
		URL.revokeObjectURL(url);
	}
};

export const localforageRestore = async (file: JsonFile, clearFirst: boolean = false): Promise<void> => {
	const text = await file.text();
	const obj = await validTypeParse(text);
	// const obj = JSON.parse(text);

	if (isPlainObject(obj)) {
		if (clearFirst) await localforage.clear();
		await Promise.all(Array.from(Object.entries(obj), ([k, v]) => localforage.setItem(k, v)));
	}

	await persistedStoresRehydrate();
};

//zustand的持久化有个特点，键保留了引号，值保留了引号甚至还有斜杠，内部数据合理trim压缩完全牺牲了可读性。
//当然，最重要的是，值必须天然支持文本化，所以只能是基本类型。
//除此之外，没有其他吐槽点。

export const localforageBackup = async (): Promise<void> => {
	const result: Record<string, any> = {};
	await localforage.iterate((value, key) => {
		if (isValidTypeExt(value)) {
			result[key] = value;
		}
	});

	const version = await fetchVersion();
	const filename = `DB[${version}]${timeStamp()}.json`;
	await downloadAsJsonFile(result, filename);
};