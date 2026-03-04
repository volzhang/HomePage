import { create, type StateCreator } from "zustand";
import { persist, createJSONStorage, type PersistOptions} from "zustand/middleware";
import localforage from "localforage";

// 用于收集所有 persist store 实例
export const persistedStores = new Map<string, {
	store: any;
	storageType: 'localforage' | 'localStorage';
}>();

// 统一rehydrate 给localforageRestore用的
export const persistedStoresRehydrate = async () => {
	const promises: Promise<void>[] = [];

	for (const entry of persistedStores.values()) {
		const rehydrateResult = entry.store.persist.rehydrate();
		if (rehydrateResult instanceof Promise) {
			promises.push(rehydrateResult);
		}
	}

	if (promises.length > 0) {
		await Promise.all(promises);
	}
};

type CreatePersistedStoreOptions<S> = Partial<
	Omit<PersistOptions<S, Partial<S>>, "name" | "storage">
>;

// 主工厂函数
export function createPersistedStore<S>(
	name: string,
	initializer: StateCreator<S, [], [], S>,
	//支持第二个参数的复写
	options: CreatePersistedStoreOptions<S> = {}
) {
	const store = create<S>()(
		persist(
			initializer,
			{
				name,
				storage: createJSONStorage(() => localforage),
				...options,
			}
		)
	);
	persistedStores.set(name, { store, storageType: 'localforage' });
	return store;
}

// 小数据专用 - localStorage 版本
export const createLocalStoragePersistedStore = <S>(
	name: string,
	initializer: StateCreator<S, [], [], S>,
	options: CreatePersistedStoreOptions<S> = {}
) => {
	const store = create<S>()(
		persist(
			initializer,
			{
				name,
				storage: createJSONStorage(() => localStorage),
				...options,
			}
		)
	);

	// 复用已有的 persistedStores（类型兼容，rehydrate 可用）
	persistedStores.set(name, { store, storageType: 'localStorage' });
	return store;
};