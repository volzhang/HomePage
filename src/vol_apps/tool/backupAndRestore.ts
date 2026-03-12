import {persistedStoresRehydrate, persistedStores} from "@/vol_apps/tool/createPersistedStore";
import {download, timeStamp} from "@/vol_apps/tool/download";
import type {JsonFile} from "@/vol_apps/tool/filePicker";
import {
	isPlainObject, isValidTypeExt, type ValidTypeExt, validTypeStringify
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

// ------------------ 恢复 ------------------
/*
 * 只恢复备份文件中存在的、且当前已注册的 persistedStores 的 key
 */

export const localforageRestore = async (
	file: JsonFile,
	clearFirst: boolean = false
): Promise<void> => {
	const text = await file.text();
	const backupData = await JSON.parse(text);
	if (!isPlainObject(backupData)) throw new Error("invalid backupData");

	// const registeredKeys = new Set(persistedStores.keys()); // 已注册的 store 名称集合

	// 已注册的 store 信息（包含 storageType）
	const registered = new Map(persistedStores); // name → { store, storageType }
	// if (clearFirst) await Promise.all(Array.from(registeredKeys).map(key => localforage.removeItem(key)));

	// 先清空（只清已注册的）
	if (clearFirst) {
		await Promise.all(
			Array.from(registered.keys()).map(async (key) => {
				const { storageType } = registered.get(key)!;
				if (storageType === 'localforage') {
					await localforage.removeItem(key);
				} else if (storageType === 'localStorage') {
					localStorage.removeItem(key);
				}
			})
		);
	}

	const tryParsedValue = (value:any)=>{
		let result
		if (typeof value === "string") {
			try {
				result = JSON.parse(value);
			} catch {
				result = value;
			}
		}
		return result;
	}

	const restorePromises = Object.entries(backupData)
		.filter(([key]) => registered.has(key))
		.map(async ([key, value]) => {
			if (!isValidTypeExt(value)) return;
			const { storageType } = registered.get(key)!;
			//这段需要解释下，原则上，我们默认使用localforage
			//少数情况下，用户数据会从localforage迁移到localStorage，那么
			//localStorage的set需要注意，先把old——value解析后再JSON.stringify存入，否则，格式会无法识别
			//存在\斜杠

			//反过来，我们不用处理localforage的set，因为，不存在localStorage到localforage的数据迁移
			if (storageType === 'localforage') {
				await localforage.setItem(key, value);
			} else if (storageType === 'localStorage') {
				const parsedValue = tryParsedValue(value);
				localStorage.setItem(key, JSON.stringify(parsedValue));
			}
		});


	// const restorePromises = Object.entries(backupData)
	// 	.filter(([key]) => registeredKeys.has(key))        // 只处理已注册的
	// 	.map(async ([key, value]) => {
	// 		if (isValidTypeExt(value)) await localforage.setItem(key, value);
	// 	});

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
// export const localforageBackup_old = async (): Promise<void> => {
// 	const registeredKeys = Array.from(persistedStores.keys()); // 所有注册过的 store name 就是 key 前缀
//
// 	const result: Record<string, any> = {};
//
// 	// 只迭代我们关心的 key
// 	await Promise.all(
// 		registeredKeys.map(async (key) => {
// 			const value = await localforage.getItem(key);
// 			if (value !== null && isValidTypeExt(value)) {
// 				result[key] = value;
// 			}
// 		})
// 	);
//
// 	// 如果没有任何数据，也生成一个空备份（视需求可调整）
// 	const version = await fetchVersion();
// 	const filename = `DB[${version}]${timeStamp()}.json`;
// 	await downloadAsJsonFile(result, filename);
// };

// ------------------ 备份 ------------------

/**
 * 只备份已注册到 persistedStores 的那些 key
 * 根据 storageType 从 localforage 或 localStorage 分别读取
 */
export const localforageBackup = async (): Promise<void> => {
	const registered = new Map(persistedStores); // name → { store, storageType }

	const result: Record<string, any> = {};

	// 遍历所有已注册的 store，根据类型从对应存储读取
	await Promise.all(
		Array.from(registered.entries()).map(async ([key, { storageType }]) => {
			let value: any = null;

			if (storageType === 'localforage') {
				value = await localforage.getItem(key);
			} else if (storageType === 'localStorage') {
				const raw = localStorage.getItem(key);
				value = raw ? JSON.parse(raw ?? 'null') : null;
			}
			if (value !== null) result[key] = value;
		})
	);

	// 如果没有任何数据，也生成一个空备份（视需求可调整）
	const version = await fetchVersion();
	const filename = `DB[${version}]${timeStamp()}.json`;
	await downloadAsJsonFile(result, filename);
};