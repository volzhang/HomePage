import {VERSION} from "@/vol_apps/tool/action/fetch";
import {persistedStores, persistedStoresRehydrate} from "@/vol_apps/tool/createPersistedStore";
import {downloadAsJsonFile, timeStamp} from "@/vol_apps/tool/action/download";
import {isPlainObject} from "@/vol_apps/tool/isType/isPlainObject";
import {isValidType} from "@/vol_apps/tool/isType/isValidType";
import {type Tile, useTileStore} from "@/vol_apps/tile/tile_store";
import localforage from "localforage";

export const clearRegisteredKV = async (): Promise<void> => {
	const registered = new Map(persistedStores);
	await Promise.all(
		Array.from(registered.keys()).map(async (key) => {
			const {storageType} = registered.get(key)!;
			if (storageType === "localforage") {
				await localforage.removeItem(key);
			} else if (storageType === "localStorage") {
				localStorage.removeItem(key);
			}
		})
	);
};

export const clearAllDBKV = async (): Promise<void> => {
	await localforage.clear();
	localStorage.clear();
};

type StorageType = "localforage" | "localStorage";

/**
 * 兼容两种备份格式：
 *
 * 新备份：
 * search: { state: {...}, version: 0 }
 *
 * 旧备份：
 * search: "{\"state\":{...},\"version\":0}"
 *
 * 这个函数的目标很简单：
 * 不管传进来是哪种格式，尽量转成正常对象，
 * 方便后面的业务逻辑统一处理。
 */
const parseBackupSnapshot = (value: any) => {
	if (typeof value !== "string") return value;

	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
};

/**
 * 把备份里的值，转成“真正要写回存储”的格式。
 *
 * 注意：
 * 这里不能只看备份文件长什么样，
 * 还要看 zustand 在不同存储里原本是怎么保存的。
 *
 * 当前项目里：
 * - localStorage 里保存的是 JSON string
 * - localforage 里历史上也保存成了 JSON string
 *
 * 所以恢复时，要写回和它们原本一致的格式，
 * 这样 rehydrate 才会稳定。
 */
const toPersistedStorageValue = (
	backupValue: any,
	storageType: StorageType,
) => {
	const snapshot = parseBackupSnapshot(backupValue);

	if (storageType === "localStorage") {
		return JSON.stringify(snapshot);
	}

	if (storageType === "localforage") {
		// 兼容旧备份：
		// 如果备份里本来就是旧的 string，就直接复用；
		// 如果是新的干净对象，就转成 string 再写入。
		return typeof backupValue === "string"
			? backupValue
			: JSON.stringify(snapshot);
	}

	return backupValue;
};

/**
 * 给业务逻辑使用的备份值。
 *
 * 例如 tile merge 这种逻辑，
 * 需要拿到对象后再去读 state.tiles，
 * 所以这里返回“可直接操作的对象格式”。
 */
const toRuntimeSnapshot = (backupValue: any) => {
	return parseBackupSnapshot(backupValue);
};

// ------------------ 恢复 ------------------
/*
 * 只恢复备份文件中存在、且当前已注册到 persistedStores 的 key
 */
export const localforageRestore = async (
	file: File,
	mergeTileTiles: boolean = false,
): Promise<void> => {
	const text = await file.text();
	const backupData = JSON.parse(text);

	if (!isPlainObject(backupData)) {
		console.error("invalid backupData");
		return;
	}

	const registered = new Map(persistedStores);

	// 这一份数据专门给“恢复后的业务逻辑”使用，比如 tile merge。
	// 这里始终保存对象格式，不关心最终写入 storage 时是不是 string。
	const runtimeSnapshots: Record<string, any> = {};

	const restorePromises = Object.entries(backupData)
		.filter(([key]) => registered.has(key))
		.map(async ([key, value]) => {
			if (!isValidType(value)) return;

			const {storageType} = registered.get(key)!;

			// 一份给业务逻辑使用，一份给存储层写回使用。
			// 两者职责不同，不要混用。
			const runtimeSnapshot = toRuntimeSnapshot(value);
			const persistedValue = toPersistedStorageValue(value, storageType);

			runtimeSnapshots[key] = runtimeSnapshot;

			if (storageType === "localforage") {
				await localforage.setItem(key, persistedValue);
			} else if (storageType === "localStorage") {
				localStorage.setItem(key, persistedValue);
			}
		});

	// 先把所有持久化数据写回去，再统一触发 zustand rehydrate
	await Promise.all(restorePromises);
	await persistedStoresRehydrate();

	// tile merge 读的是“对象格式的备份数据”
	// 不是 storage/localforage 里最终保存的字符串
	if (mergeTileTiles && runtimeSnapshots["tile"]) {
		try {
			let raw: any = runtimeSnapshots["tile"];
			if (!raw || typeof raw !== "object") return;

			let backupState = raw.state ?? raw;
			if (typeof backupState === "string") backupState = JSON.parse(backupState);
			if (!Array.isArray(backupState.tiles)) return;

			const store = useTileStore;
			const currentTiles = store.getState().tiles;
			const incomingTiles = backupState.tiles as Tile[];

			const stableStringify = (obj: any): string => {
				if (obj && typeof obj === "object" && !Array.isArray(obj)) {
					const sortedKeys = Object.keys(obj).sort();
					const sortedObj: any = {};
					sortedKeys.forEach((key) => {
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

				// 合并完成后，按 localforage 当前兼容的落库格式写回去
				await localforage.setItem("tile", JSON.stringify(newRaw));
			}
		} catch {
			// 静默失败，避免 tile 补丁影响主恢复流程
		}
	}
};

// ------------------ 备份 ------------------

/*
 * 备份时不再读取 storage/localforage 里的旧值，
 * 而是直接从当前 store 的内存状态生成快照。
 *
 * 这样导出的数据一定是当前版本的 state，
 * 不会把历史遗留字段一起带出去。
 */
export const localforageBackup = async (): Promise<void> => {
	const registered = new Map(persistedStores);
	const result: Record<string, any> = {};

	for (const [key] of registered.entries()) {
		const snapshot = getCurrentPersistedSnapshot(key);
		if (snapshot !== null) {
			result[key] = snapshot;
		}
	}

	const filename = `DB[${VERSION}]${timeStamp()}.json`;
	await downloadAsJsonFile(result, filename);
};

/*
 * 从当前 store 里拿到可持久化的 state，
 * 去掉函数后，组装成 zustand persist 的标准结构：
 * { state: ..., version: 0 }
 */
const getCurrentPersistedSnapshot = (storeKey: string) => {
	const entry = persistedStores.get(storeKey);
	if (!entry) return null;

	const currentState = entry.store.getState();

	const plainState = Object.fromEntries(
		Object.entries(currentState).filter(([, value]) => typeof value !== "function")
	);

	return {
		state: plainState,
		version: 0,
	};
};