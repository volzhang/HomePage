import {VERSION} from "@/vol_apps/tool/action/fetch";
import {persistedStores} from "@/vol_apps/tool/createPersistedStore";
import {download, timeStamp} from "@/vol_apps/tool/action/download";
import {isValidType, tryStringify, type ValidType} from "@/vol_apps/tool/isType/isValidType";
import {type Tile} from "@/vol_apps/tile/tile_store";
import localforage from "localforage";

export const downloadAsJsonFile = async (
	obj: ValidType,
	file_name = timeStamp(),
): Promise<void> => {
	const jsonContent = tryStringify(obj);
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

// ------------------ 恢复 ------------------
/*
 * 只恢复备份文件中存在的、且当前已注册的 persistedStores 的 key
 */
export const localforageRestore = async (
	file: File,
	clearFirst: boolean = false,
	mergeTileTiles: boolean = false,
): Promise<void> => {
	const text = await file.text();
	const backupData = await JSON.parse(text);
	if (!isValidType(backupData)) {
		console.error("invalid backupData");
	}

	// 已注册的 store 信息（包含 storageType）
	const registered = new Map(persistedStores);

	// 先清空（只清已注册的）
	if (clearFirst) {
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

	const tryParsedValue = (value: any) => {
		let result;
		if (typeof value === "string") {
			try {
				result = JSON.parse(value);
			} catch {
				result = value;
			}
		}
		return result;
	};

	const restorePromises = Object.entries(backupData)
		.filter(([key]) => registered.has(key))
		.map(async ([key, value]) => {
			if (!isValidType(value)) return;
			const { storageType } = registered.get(key)!;

			if (storageType === "localforage") {
				await localforage.setItem(key, value);
			} else if (storageType === "localStorage") {
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
			if (typeof raw === "string") raw = JSON.parse(raw);
			if (!raw || typeof raw !== "object") return;

			let backupState = raw.state ?? raw;
			if (typeof backupState === "string") backupState = JSON.parse(backupState);
			if (!Array.isArray(backupState.tiles)) return;

			const tileEntry = persistedStores.get("tile");
			if (!tileEntry) return;

			const store = tileEntry.store;
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

	// ------------------ localStorage 再写一遍，破坏缓存判断 ------------------
	for (const [key, { storageType }] of registered.entries()) {
		if (storageType === "localStorage") {
			const value = localStorage.getItem(key);
			if (value !== null) {
				localStorage.removeItem(key);
				localStorage.setItem(key, value);
			}
		}
	}

	// ------------------ 核心：触发 _restoreSignal ------------------
	for (const [key, { store }] of registered.entries()) {
		const value = backupData[key];
		if (!value) continue;

		let parsed = value;
		if (typeof parsed === "string") {
			try {
				parsed = JSON.parse(parsed);
			} catch {}
		}
		if (parsed?.state) parsed = parsed.state;

		if (parsed && typeof parsed === "object") {
			store.setState((prev: any) => ({
				...prev,
				...parsed,
				_restoreSignal: (prev._restoreSignal || 0) + 1 // 🚨 增量触发刷新
			}), true);
		}
	}
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