import { create, type StateCreator } from "zustand";
import { persist, createJSONStorage, type PersistOptions} from "zustand/middleware";
import localforage from "localforage";

// 用于收集所有 persist store 实例
const persistedStores = new Map<string, any>();

// 统一rehydrate 给localforageRestore用的
export const persistedStoresRehydrate = async () => {
	const promises: Promise<void>[] = [];

	for (const store of persistedStores.values()) {
		const result = store.persist.rehydrate();
		if (result instanceof Promise) {
			promises.push(result);
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
	persistedStores.set(name, store);
	return store;
}