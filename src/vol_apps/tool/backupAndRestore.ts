import {persistedStoresRehydrate, persistedStores} from "@/vol_apps/tool/createPersistedStore";
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

// export const localforageRestore_old = async (file: JsonFile, clearFirst: boolean = false): Promise<void> => {
// 	const text = await file.text();
// 	const obj = await validTypeParse(text);
// 	// const obj = JSON.parse(text);
//
// 	if (isPlainObject(obj)) {
// 		if (clearFirst) await localforage.clear();
// 		await Promise.all(Array.from(Object.entries(obj), ([k, v]) => localforage.setItem(k, v)));
// 	}
//
// 	await persistedStoresRehydrate();
// };

// ------------------ 恢复 ------------------
/*
 * 只恢复备份文件中存在的、且当前已注册的 persistedStores 的 key
 */

export const localforageRestore = async (
	file: JsonFile,
	clearFirst: boolean = false
): Promise<void> => {
	const text = await file.text();
	const backupData = await validTypeParse(text);
	if (!isPlainObject(backupData)) throw new Error("invalid backupData");

	const registeredKeys = new Set(persistedStores.keys()); // 已注册的 store 名称集合
	if (clearFirst) await Promise.all(Array.from(registeredKeys).map(key => localforage.removeItem(key)));

	const restorePromises = Object.entries(backupData)
		.filter(([key]) => registeredKeys.has(key))        // 只处理已注册的
		.map(async ([key, value]) => {
			if (isValidTypeExt(value)) await localforage.setItem(key, value);
		});

	await Promise.all(restorePromises);
	await persistedStoresRehydrate();
};

//zustand的持久化有个特点，键保留了引号，值保留了引号甚至还有斜杠，内部数据合理trim压缩完全牺牲了可读性。
//当然，最重要的是，值必须天然支持文本化，所以只能是基本类型。
//除此之外，没有其他吐槽点。

// export const localforageBackup_old = async (): Promise<void> => {
// 	const result: Record<string, any> = {};
// 	await localforage.iterate((value, key) => {
// 		if (isValidTypeExt(value)) {
// 			result[key] = value;
// 		}
// 	});
//
// 	const version = await fetchVersion();
// 	const filename = `DB[${version}]${timeStamp()}.json`;
// 	await downloadAsJsonFile(result, filename);
// };

// ------------------ 备份 ------------------

/**
 * 只备份已注册到 persistedStores 的那些 key
 */
export const localforageBackup = async (): Promise<void> => {
	const registeredKeys = Array.from(persistedStores.keys()); // 所有注册过的 store name 就是 key 前缀

	const result: Record<string, any> = {};

	// 只迭代我们关心的 key
	await Promise.all(
		registeredKeys.map(async (key) => {
			const value = await localforage.getItem(key);
			if (value !== null && isValidTypeExt(value)) {
				result[key] = value;
			}
		})
	);

	// 如果没有任何数据，也生成一个空备份（视需求可调整）
	const version = await fetchVersion();
	const filename = `DB[${version}]${timeStamp()}.json`;
	await downloadAsJsonFile(result, filename);
};