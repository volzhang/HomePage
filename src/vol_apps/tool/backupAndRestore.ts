import {useTileStoreBase} from "@/vol_apps/tile/tile_store";
import { VERSION } from "@/vol_apps/tool/action/fetch";
import {persistedStores, LatestStoreVersion} from "@/vol_apps/tool/createPersistedStore";
import { downloadAsJsonFile, timeStamp } from "@/vol_apps/tool/action/download";
import { isPlainObject } from "@/vol_apps/tool/isType/isPlainObject";
import {atoms} from "@/vol_apps/03_persist_atoms/createAtom";
import {safeParse} from "valibot";

// ----------------------------------------------------------------------
// 工具函数：解析备份值，兼容旧备份中字符串化存储的情况
// ----------------------------------------------------------------------
/**
 * 兼容两种备份格式：
 *
 * 新备份（直接保存对象）：
 * search: { state: {...}, version: 0 }
 *
 * 旧备份（字符串化保存）：
 * search: "{\"state\":{...},\"version\":0}"
 *
 * 该函数的作用：
 * 将任何可能的字符串形式还原为对象，方便后续统一处理。
 */
const parseBackupValue = (value: any) => {
	if (typeof value !== "string") return value;

	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
};

// ------------------ 恢复 ------------------
/**
 * 从 JSON 备份文件恢复应用状态。
 *
 * 工作流程：
 * 1. 读取并解析备份文件，确保根对象为普通对象。
 * 2. 遍历当前已注册的持久化 store（通过 persistedStores 记录）。
 * 3. 对于备份文件中存在的 key，获取对应的备份值。
 * 4. 调用 parseBackupValue 将可能为字符串的旧备份值转为对象。
 * 5. 从对象中取出 state 字段（标准备份格式为 { state: {...}, version: 0 }）。
 * 6. 调用对应 store 的 setState 方法，将状态直接写入内存。
 * 7. 恢复完成后不调用 rehydrate，因为内存状态已经是最终状态。
 *
 * 注意：
 * - 仅恢复备份文件中存在且当前已注册的 store。
 * - 如果备份文件中某个 key 的 state 字段缺失，会给出警告并跳过。
 *
 * @param file - 用户选择的 JSON 备份文件
 * @param mergeTileTiles - 恢复存档时，tiles使用追加模式，默认关
 */

export const persistedStoresRestore = async (file: File, mergeTileTiles: boolean = false): Promise<void> => {
	const text = await file.text();
	let backupData: any;

	try {
		backupData = JSON.parse(text);
	} catch (e) {
		console.error("Invalid JSON backup file", e);
		return;
	}

	if (!isPlainObject(backupData)) {
		console.error("Backup data is not an object");
		return;
	}

	// 合并 atoms 数据
	for (const [key, atom] of atoms) {
		if (!(key in backupData)) continue;
		const parsed = safeParse(atom.schema, backupData[key]);
		if (!parsed.success) {
			console.error(`Unable to restore atom: `, key, parsed.issues);
			continue;
		}
		atom.setMemoryValue(parsed.output);
	}

	const registered = new Map(persistedStores);

	for (const [key, entry] of registered) {
		if (!Object.prototype.hasOwnProperty.call(backupData, key)) continue;

		const value = backupData[key];
		const runtimeSnapshot = parseBackupValue(value);
		const stateToRestore = runtimeSnapshot.state;

		if (!stateToRestore) {
			console.warn(`Missing "state" field in backup for key "${key}"`);
			continue;
		}

		const store = entry.store as any;

		// 特殊处理 tile 合并模式
		if (key === "tile" && mergeTileTiles && Array.isArray(stateToRestore.tiles)) {
			useTileStoreBase.getState().appendTiles(stateToRestore.tiles);
		} else {
			store.setState(stateToRestore);
		}
	}
};

// ------------------ 备份 ------------------
/**
 * 将当前所有持久化 store 的状态导出为 JSON 备份文件。
 *
 * 工作流程：
 * 1. 遍历 persistedStores 中记录的所有 store。
 * 2. 对每个 store，调用 getCurrentPersistedSnapshot 获取当前内存中的状态快照。
 * 3. 将快照组装成对象，key 为 store 名称，value 为 { state: ..., version: 0 }。
 * 4. 生成带版本号和时间戳的文件名，并下载为 JSON 文件。
 *
 * 注意：
 * - 导出的备份文件格式为标准格式 { state: {...}, version: 0 }，供恢复时使用。
 * - 版本号目前固定为 0，后续如需升级可在此处调整。
 */

export const persistedStoresBackup = async (): Promise<void> => {
	const registered = new Map(persistedStores);
	const result: Record<string, any> = {};

	for (const [key] of registered.entries()) {
		const snapshot = getCurrentPersistedSnapshot(key);
		if (snapshot !== null) {
			result[key] = snapshot;
		}
	}

	// 合并 atoms，后续逐步迁移
	for (const [key, atom] of atoms) {
		result[key] = atom.getValue();
	}

	const filename = `DB[${VERSION}]${timeStamp()}.json`;
	await downloadAsJsonFile(result, filename);
};

/**
 * 从指定 store 获取当前内存状态，并过滤掉不可持久化的数据。
 *
 * 返回格式：
 * {
 *   state: { ...过滤后的状态字段... },
 *   version: 0
 * }
 *
 * @param storeKey - store 在 persistedStores 中的注册名称
 * @returns 标准化的备份快照对象，若 store 未注册则返回 null
 */

const getCurrentPersistedSnapshot = (storeKey: string) => {
	const entry = persistedStores.get(storeKey);
	if (!entry) return null;

	const currentState = entry.store.getState();

	// 过滤掉函数类型，因为函数无法被 JSON.stringify 正常序列化
	const plainState = Object.fromEntries(
		Object.entries(currentState).filter(([, value]) => typeof value !== "function")
	);

	return {
		state: plainState,
		version: LatestStoreVersion,
	};
};