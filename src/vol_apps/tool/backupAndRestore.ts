import {VERSION} from "@/vol_apps/tool/action/fetch";
import {persistedStores, persistedStoresRehydrate} from "@/vol_apps/tool/createPersistedStore";
import {downloadAsJsonFile, timeStamp} from "@/vol_apps/tool/action/download";
import {isValidType} from "@/vol_apps/tool/isType/isValidType";
import {type Tile, useTileStore} from "@/vol_apps/tile/tile_store";
import localforage from "localforage";

export const clearRegisteredKV = async () : Promise<void>=>{
	const registered = new Map(persistedStores);
	await Promise.all(
		Array.from(registered.keys()).map(async (key) => {
			const { storageType } = registered.get(key)!;
			if (storageType === "localforage") {
				await localforage.removeItem(key);
			} else if (storageType === "localStorage") {
				localStorage.removeItem(key);
			}
		})
	);
}

export const clearAllDBKV = async (): Promise<void> => {
	await localforage.clear();
	localStorage.clear();
};

// ------------------ 恢复 ------------------
/*
 * 只恢复备份文件中存在的、且当前已注册的 persistedStores 的 key
 */

export const localforageRestore = async (
	file: File,
	mergeTileTiles: boolean = false,
): Promise<void> => {
	const text = await file.text();
	const backupData = await JSON.parse(text);
	if (!isValidType(backupData)) {
		console.error("invalid backupData");
	}

	// 已注册的 store 信息（包含 storageType）
	const registered = new Map(persistedStores);

	const tryParsedValue = (value: any) => {
		if (typeof value !== "string") return value;

		try {
			return JSON.parse(value);
		} catch {
			return value;
		}
	};

	const restorePromises = Object.entries(backupData)
		.filter(([key]) => registered.has(key))
		.map(async ([key, value]) => {
			if (!isValidType(value)) return;
			const {storageType} = registered.get(key)!;

			if (storageType === "localforage") {
				await localforage.setItem(key, value);
			} else if (storageType === "localStorage") {
				const parsedValue = tryParsedValue(value);
				localStorage.setItem(key, JSON.stringify(parsedValue));
			}
		});

	// ------------------ 普通恢复 ------------------
	await Promise.all(restorePromises);
	await persistedStoresRehydrate();

	// ------------------ 可选 tile 补丁 ------------------
	if (mergeTileTiles && backupData["tile"]) {
		try {
			let raw: any = backupData["tile"];
			if (typeof raw === "string") raw = JSON.parse(raw);
			if (!raw || typeof raw !== "object") return;

			let backupState = raw.state ?? raw;
			if (typeof backupState === "string") backupState = JSON.parse(backupState);
			if (!Array.isArray(backupState.tiles)) return;

			// const tileEntry = persistedStores.get("tile");
			// if (!tileEntry) return;
			// const store = tileEntry.store;
			// const currentTiles = store.getState().tiles;
			const store = useTileStore;
			const currentTiles = store.getState().tiles;

			const incomingTiles = backupState.tiles as Tile[];

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

			const currentSet = new Set(
				currentTiles.map((t: Tile) => {
					const {id, ...rest} = t;
					return stableStringify(rest);
				})
			);

			const appended = incomingTiles.filter((t: Tile) => {
				const {id, ...rest} = t;
				return !currentSet.has(stableStringify(rest));
			});

			if (appended.length > 0) {
				const merged = [...currentTiles, ...appended].map((t, i) => ({
					...t,
					id: i,
				}));
				store.getState().setTiles(merged);

				const newRaw = JSON.parse(JSON.stringify(raw));
				if (newRaw.state) {
					newRaw.state.tiles = merged;
				} else {
					newRaw.tiles = merged;
				}
				await localforage.setItem("tile", newRaw);
			}
		} catch {
			// 静默失败
		}
	}
}

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
		Array.from(registered.entries()).map(async ([key, {storageType}]) => {
			let value: any = null;

			if (storageType === "localforage") {
				value = await localforage.getItem(key);
			} else if (storageType === "localStorage") {
				const raw = localStorage.getItem(key);
				value = raw ? JSON.parse(raw ?? "null") : null;
			}
			if (value !== null) result[key] = value;
		})
	);

	// 如果没有任何数据，也生成一个空备份（视需求可调整）
	const filename = `DB[${VERSION}]${timeStamp()}.json`;
	await downloadAsJsonFile(result, filename);
};