import { create, type StateCreator } from "zustand";
import { createJSONStorage, persist, type PersistOptions, type StateStorage} from "zustand/middleware";
import {createStore, del, get, set } from "idb-keyval";

type StorageType = "idb" | "localStorage";

/**
 * idb使用过去的 localforage 遗留库。为了简单，后续不做迁移了。
 */
const idbStore = createStore("localforage", "keyvaluepairs")

const idbKeyValStorage: StateStorage = {
	getItem: async (key) => {
		const value = await get<string>(key, idbStore);
		return value ?? null;
	},
	setItem: async (key, value) => {
		await set(key, value, idbStore);
	},
	removeItem: async (key) => {
		await del(key, idbStore);
	},
};

/**
 * 这里故意只抽象出当前项目真正依赖的 persist 能力：
 * - rehydrate: restore 后手动回拉内存
 * - hasHydrated / onHydrate / onFinishHydration: 提供 hydration 状态给 UI
 *
 * 不把整个 zustand store 类型写死，后续如果要扩展 persist 相关能力，
 * 只需要在这里补充最小接口，不必把外部实现细节传染到全局。
 */

// version 1.1, //清除垃圾KV
export const LatestStoreVersion = 1.1

type PersistController = {
	rehydrate: () => void | Promise<void>;
	hasHydrated: () => boolean;
	onHydrate?: (fn: () => void) => () => void;
	onFinishHydration: (fn: () => void) => () => void;
};

export type PersistStoreLike = {
	persist: PersistController;
	getState: () => Record<string, unknown>;
};

type PersistedStoreEntry = {
	store: PersistStoreLike;
	storageType: StorageType;
};

type CreatePersistedStoreOptions<S> =
	Partial<Omit<PersistOptions<S, Partial<S>>, "name" | "storage">> & {
	storageType?: StorageType;
};

const isPromise = (value: unknown): value is Promise<unknown> =>
	!!value && typeof (value as Promise<unknown>).then === "function";

export const persistedStores = new Map<string, PersistedStoreEntry>();

export const persistedStoresRehydrate = async (): Promise<void> => {
	const promises: Promise<unknown>[] = [];
	for (const entry of persistedStores.values()) {
		const result = entry.store.persist.rehydrate();
		if (isPromise(result)) promises.push(result);
	}
	if (promises.length > 0) await Promise.all(promises);
};

export function createPersistedStore<S>(
	name: string,
	initializer: StateCreator<S, [], [], S>,
	options: CreatePersistedStoreOptions<S> = {},
) {
	const { storageType = "idb", ...restPersistOptions } = options;

	const storage =
		storageType === "idb"
			? createJSONStorage<Partial<S>>(() => idbKeyValStorage)
			: createJSONStorage<Partial<S>>(() => localStorage);

	const persistConfig = {
		name,
		storage,
		...restPersistOptions,
	} as PersistOptions<S, Partial<S>>;

	const store = create<S>()(
		persist(initializer, persistConfig),
	);

	persistedStores.set(name, {
		store: store as PersistStoreLike,
		storageType,
	});

	return store;
}