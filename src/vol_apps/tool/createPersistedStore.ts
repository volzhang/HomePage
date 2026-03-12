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
		const result = entry.store.persist.rehydrate();
		if (result && typeof result.then === "function") promises.push(result);
	}
	if (promises.length) await Promise.all(promises);
};

// 自定义的额外选项（可以按需扩展）
type ExtraOptions = {
	storageType?: "localforage" | "localStorage";
	migrateFromLocalForage?: boolean;
};

type CreatePersistedStoreOptions<S> =
	ExtraOptions &
	Partial<Omit<PersistOptions<S, Partial<S>>, "name" | "storage">>;

// export function createPersistedStore<S>(
// 	name: string,
// 	initializer: StateCreator<S, [], [], S>,
// 	options: CreatePersistedStoreOptions<S> = {}
// ) {
// 	const {
// 		storageType = "localforage",
// 		migrateFromLocalForage = false,
// 		onRehydrateStorage: userOnRehydrateStorage,
// 		...persistOptions
// 	} = options;
//
// 	// 使用 StoreApi<S>['setState'] 和 StoreApi<S>['getState'] 精确定义类型
// 	let storeSet!: StoreApi<S>["setState"];
//
// 	// 包装 initializer 以捕获 set 和 get
// 	const wrappedInitializer: StateCreator<S, [], [], S> = (set, get, api) => {
// 		storeSet = set;
// 		return initializer(set, get, api);
// 	};
//
// 	// 组合后的 onRehydrateStorage
// 	const combinedOnRehydrateStorage = (preState: S) => {
// 		// 用户提供的 post-rehydration 函数（可能为 undefined）
// 		let userPostRehydration: (() => void | Promise<void>) | undefined;
//
// 		if (userOnRehydrateStorage) {
// 			const maybeFunc = userOnRehydrateStorage(preState);
// 			if (typeof maybeFunc === "function") {
// 				userPostRehydration = maybeFunc;
// 			}
// 		}
//
// 		// 返回一个异步函数，在 rehydrate 完成后执行
// 		return async () => {
// 			// 1. 执行迁移逻辑（如果需要）
// 			if (storageType === "localStorage" && migrateFromLocalForage) {
// 				// 检查 localStorage 中是否已有该 key
// 				if (!localStorage.hasOwnProperty(name)) {
// 					try {
// 						const legacyRaw = await localforage.getItem(name);
// 						if (legacyRaw !== null) {
// 							let legacyState: any = legacyRaw;
//
// 							// 尝试解析字符串（可能是 persist 格式）
// 							if (typeof legacyRaw === "string") {
// 								try {
// 									const parsed = JSON.parse(legacyRaw);
// 									// 如果解析后是对象且包含 state 属性，取 state（Zustand persist 标准格式）
// 									if (parsed && typeof parsed === "object" && "state" in parsed) {
// 										legacyState = parsed.state;
// 									} else {
// 										legacyState = parsed; // 普通对象
// 									}
// 								} catch {
// 									// 解析失败，保持原字符串（但通常是对象，忽略）
// 								}
// 							}
//
// 							if (legacyState && typeof legacyState === "object") {
// 								// 使用 updater 函数形式，避免类型问题
// 								storeSet((state) => ({
// 									...state,
// 									...legacyState,
// 								}));
// 							}
// 						}
// 					} catch (error) {
// 						console.error(`Failed to migrate from localforage for store "${name}":`, error);
// 					}
// 				}
// 			}
//
// 			// 1.5 执行写入db逻辑, 不论是否迁移，都要显式把正确值写入db。
// 			storeSet((state) => ({...state}));
//
// 			// 2. 执行用户提供的 post-rehydration 函数
// 			if (userPostRehydration) {
// 				await userPostRehydration();
// 			}
// 		};
// 	};
//
// 	const storage =
// 		storageType === "localforage"
// 			? createJSONStorage(() => localforage)
// 			: createJSONStorage(() => localStorage);
//
// 	const store = create<S>()(
// 		persist(
// 			wrappedInitializer,
// 			{
// 				name,
// 				storage,
// 				onRehydrateStorage: combinedOnRehydrateStorage,
// 				...persistOptions,
// 			}
// 		)
// 	);
//
// 	persistedStores.set(name, {store, storageType});
// 	return store;
// }

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

	let storeSet!: StoreApi<S>["setState"];

	const wrappedInitializer: StateCreator<S, [], [], S> = (set, get, api) => {
		storeSet = set;
		return initializer(set, get, api);
	};

	// ==================== 【核心修复：正确的 onRehydrateStorage】 ====================
	const combinedOnRehydrateStorage = (preState: S) => {
		const userPostFn = userOnRehydrateStorage?.(preState);

		return async (state?: S, error?: unknown) => {

			/* -------------------------------------------------- */
			/* migration: localforage → localStorage               */
			/* -------------------------------------------------- */

			if (storageType === "localStorage" && migrateFromLocalForage) {
				if (localStorage.getItem(name) === null) {
					try {
						const legacyRaw = await localforage.getItem(name);

						if (legacyRaw !== null) {
							let legacyState: any = legacyRaw;

							// 处理 persist 标准格式 { state, version }
							if (typeof legacyRaw === "string") {
								try {
									const parsed = JSON.parse(legacyRaw);

									if (parsed && typeof parsed === "object" && "state" in parsed) {
										legacyState = parsed.state;
									} else {
										legacyState = parsed;
									}
								} catch {
									/* ignore parse error */
								}
							}

							if (legacyState && typeof legacyState === "object") {
								storeSet((current) => ({
									...current,
									...legacyState,
								}));
							}
						}
					} catch (err) {
						console.error(`Persist migration failed for "${name}"`, err);
					}
				}
			}

			/* -------------------------------------------------- */
			/* ensure storage initialization                       */
			/* -------------------------------------------------- */

			/**
			 * IMPORTANT: DO NOT REMOVE THIS BLOCK.
			 *
			 * Zustand persist will NOT write to storage if:
			 *   - the store only contains its default initializer state
			 *   - no setState has occurred yet
			 *
			 * In this project we REQUIRE that every persisted store
			 * always exists in storage even when it only contains default values.
			 *
			 * Reasons:
			 *   1. backup / restore infrastructure depends on key existence
			 *   2. migration logic depends on storage presence
			 *   3. store registry inspection relies on deterministic storage keys
			 *
			 * Without this forced write, a freshly initialized store would:
			 *   - exist in memory
			 *   - but NOT exist in storage
			 *
			 * This leads to inconsistent behavior in restore/migration systems.
			 *
			 * Therefore, we intentionally trigger a no-op setState
			 * to force persist middleware to write the current state to storage.
			 *
			 * NOTE:
			 *   We ONLY do this when the storage key does not exist,
			 *   to avoid unnecessary writes on every hydration.
			 */

			const storageEmpty =
				storageType === "localStorage"
					? localStorage.getItem(name) === null
					: true; // localforage async storage cannot be checked synchronously

			if (state && storageEmpty) {
				storeSet((s) => ({...s}));
			}

			/* -------------------------------------------------- */
			/* user hook                                           */
			/* -------------------------------------------------- */

			if (userPostFn) {
				userPostFn(state, error);
			}
		};
	};

	const storage =
		storageType === "localforage"
			? createJSONStorage(() => localforage)
			: createJSONStorage(() => localStorage);

	// 构建 persist 配置，并确保 migrate 函数存在
	// const persistConfig: PersistOptions<S, Partial<S>> = {
	// 	name,
	// 	storage,
	// 	onRehydrateStorage: combinedOnRehydrateStorage,
	// 	...persistOptions, // 用户传入的其他选项（如 version, partialize 等）
	// };

	// 如果没有提供 migrate，则添加一个默认的迁移函数（直接返回原状态）
	// if (!options.migrate) {
	// 	options.migrate = (persistedState: any, version: number) => persistedState;
	// }

	// const store = create<S>()(persist(wrappedInitializer, persistConfig));

	const store = create<S>()(
		persist(wrappedInitializer, {
			name,
			storage,
			onRehydrateStorage: combinedOnRehydrateStorage,
			...persistOptions,
		})
	);

	persistedStores.set(name, {store, storageType});

	return store;
}