import {persistedStoresRehydrate, persistedStores} from "@/vol_apps/tool/createPersistedStore";
import {download, timeStamp} from "@/vol_apps/tool/download";
import {
	isPlainObject, isValidTypeExt, type ValidTypeExt, validTypeStringify
} from "@/vol_apps/tool/isType";
import {fetchVersion} from "@/vol_apps/version/version";
import { type Tile } from "@/vol_apps/tile/tile_store";
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
	file: File,
	clearFirst: boolean = false,
	mergeTileTiles: boolean = true,
): Promise<void> => {
	const text = await file.text();
	const backupData = await JSON.parse(text);
	if (!isPlainObject(backupData)) throw new Error("invalid backupData");

	// 已注册的 store 信息（包含 storageType）
	const registered = new Map(persistedStores);

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


	// ------------------ 普通恢复 ------------------
	await Promise.all(restorePromises);

	// ------------------ 可选 tile 补丁 ------------------
	if (mergeTileTiles && backupData["tile"]) {
		try {
			let raw: any = backupData["tile"];

			// 第一层解析
			if (typeof raw === "string") raw = JSON.parse(raw);
			if (!raw || typeof raw !== "object") return;

			// 提取 state
			let backupState = raw.state ?? raw;
			if (typeof backupState === "string") backupState = JSON.parse(backupState);
			if (!Array.isArray(backupState.tiles)) return;

			const tileEntry = persistedStores.get("tile");
			if (!tileEntry) return;

			const store = tileEntry.store;
			const currentTiles = store.getState().tiles;
			const incomingTiles = backupState.tiles as Tile[];

			// 稳定的序列化（排序键）
			const stableStringify = (obj: any): string => {
				if (obj && typeof obj === "object" && !Array.isArray(obj)) {
					const sortedKeys = Object.keys(obj).sort();
					const sortedObj: any = {};
					sortedKeys.forEach(key => {
						sortedObj[key] = stableStringify(obj[key]);
					});
					return JSON.stringify(sortedObj);
				}
				return JSON.stringify(obj);
			};

			// 去重：忽略 id，比较其他所有字段（属性顺序无关）
			const currentSet = new Set(
				currentTiles.map((t: Tile) => {
					const { id, ...rest } = t;
					return stableStringify(rest);
				})
			);

			const appended = incomingTiles.filter((t: Tile) => {
				const { id, ...rest } = t;
				return !currentSet.has(stableStringify(rest));
			});

			if (appended.length > 0) {
				const merged = [...currentTiles, ...appended].map((t, i) => ({
					...t,
					id: i,
				}));
				store.getState().setTiles(merged);

				// 将合并后的完整存储对象写回 localforage
				const newRaw = JSON.parse(JSON.stringify(raw));
				if (newRaw.state) {
					newRaw.state.tiles = merged;
				} else {
					newRaw.tiles = merged;
				}
				await localforage.setItem("tile", newRaw);
			}
		} catch (err) {
			// 静默失败
		}
	}

	// ------------------ 完成后触发 rehydrate ------------------
	await persistedStoresRehydrate();
};

//zustand的持久化有个特点，键保留了引号，值保留了引号甚至还有斜杠，内部数据合理trim压缩完全牺牲了可读性。
//当然，最重要的是，值必须天然支持文本化，所以只能是基本类型。
//除此之外，没有其他吐槽点。

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