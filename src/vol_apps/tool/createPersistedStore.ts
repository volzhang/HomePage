import {create, type StateCreator, type StoreApi} from "zustand";
import {persist, createJSONStorage, type PersistOptions} from "zustand/middleware";
import localforage from "localforage";

// 用于收集所有 persist store 实例
export const persistedStores = new Map<string, {
	store: any;
	storageType: "localforage" | "localStorage";
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

// 自定义的额外选项（可以按需扩展）
type ExtraOptions = {
	storageType?: "localforage" | "localStorage";
	migrateFromLocalForage?: boolean;  // 新增开关
};

// 工厂函数的 options 类型：自定义 + persist 原生选项
type CreatePersistedStoreOptions<S> =
	ExtraOptions &
	Partial<Omit<PersistOptions<S, Partial<S>>, "name" | "storage">>;

export function createPersistedStore<S>(
	name: string,
	initializer: StateCreator<S, [], [], S>,
	options: CreatePersistedStoreOptions<S> = {}
) {
	const {
		storageType = "localforage",
		migrateFromLocalForage = false,
		onRehydrateStorage: userOnRehydrateStorage,
		...persistOptions
	} = options;

	// 使用 StoreApi<S>['setState'] 和 StoreApi<S>['getState'] 精确定义类型
	let storeSet!: StoreApi<S>["setState"];

	// 包装 initializer 以捕获 set 和 get
	const wrappedInitializer: StateCreator<S, [], [], S> = (set, get, api) => {
		storeSet = set;
		return initializer(set, get, api);
	};

	// 组合后的 onRehydrateStorage
	const combinedOnRehydrateStorage = (preState: S) => {
		// 用户提供的 post-rehydration 函数（可能为 undefined）
		let userPostRehydration: (() => void | Promise<void>) | undefined;

		if (userOnRehydrateStorage) {
			const maybeFunc = userOnRehydrateStorage(preState);
			if (typeof maybeFunc === "function") {
				userPostRehydration = maybeFunc;
			}
		}

		// 返回一个异步函数，在 rehydrate 完成后执行
		return async () => {
			// 1. 执行迁移逻辑（如果需要）
			if (storageType === "localStorage" && migrateFromLocalForage) {
				// 检查 localStorage 中是否已有该 key
				if (!localStorage.hasOwnProperty(name)) {
					try {
						const legacyRaw = await localforage.getItem(name);
						if (legacyRaw !== null) {
							let legacyState: any = legacyRaw;

							// 尝试解析字符串（可能是 persist 格式）
							if (typeof legacyRaw === "string") {
								try {
									const parsed = JSON.parse(legacyRaw);
									// 如果解析后是对象且包含 state 属性，取 state（Zustand persist 标准格式）
									if (parsed && typeof parsed === "object" && "state" in parsed) {
										legacyState = parsed.state;
									} else {
										legacyState = parsed; // 普通对象
									}
								} catch {
									// 解析失败，保持原字符串（但通常是对象，忽略）
								}
							}

							if (legacyState && typeof legacyState === "object") {
								// 使用 updater 函数形式，避免类型问题
								storeSet((state) => ({
									...state,
									...legacyState,
								}));
							}
						}
					} catch (error) {
						console.error(`Failed to migrate from localforage for store "${name}":`, error);
					}
				}
			}

			// 1.5 执行写入db逻辑, 不论是否迁移，都要显式把正确值写入db。
			storeSet((state) => ({...state}));

			// 2. 执行用户提供的 post-rehydration 函数
			if (userPostRehydration) {
				await userPostRehydration();
			}
		};
	};

	const storage =
		storageType === "localforage"
			? createJSONStorage(() => localforage)
			: createJSONStorage(() => localStorage);

	const store = create<S>()(
		persist(
			wrappedInitializer,
			{
				name,
				storage,
				onRehydrateStorage: combinedOnRehydrateStorage,
				...persistOptions,
			}
		)
	);

	persistedStores.set(name, {store, storageType});
	return store;
}
