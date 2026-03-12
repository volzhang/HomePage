import { create, type StateCreator, type StoreApi } from "zustand";
import { persist, createJSONStorage, type PersistOptions } from "zustand/middleware";
import localforage from "localforage";

// 用于收集所有 persist store 实例
export const persistedStores = new Map<string, {
	store: any;
	storageType: "localforage" | "localStorage";
}>();

// 统一 rehydrate 给 localforageRestore 使用
export const persistedStoresRehydrate = async () => {
	const promises: Promise<void>[] = [];
	for (const entry of persistedStores.values()) {
		const result = entry.store.persist.rehydrate();
		if (result && typeof result.then === "function") promises.push(result);
	}
	if (promises.length) await Promise.all(promises);
};

// ==================== 带 _hydrated 的状态类型 ====================
type StateWithHydrated<S> = S & { _hydrated: boolean };

// 类型守卫：判断是否为 Promise
function isPromise<T>(obj: any): obj is Promise<T> {
	return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

type ExtraOptions = {
	storageType?: "localforage" | "localStorage";
	migrateFromLocalForage?: boolean;
};

type CreatePersistedStoreOptions<S> =
	ExtraOptions &
	Partial<Omit<PersistOptions<S, Partial<S>>, "name" | "storage">>;

// ==================== 主工厂 ====================
export function createPersistedStore<S>(
	name: string,
	initializer: StateCreator<StateWithHydrated<S>, [], [], S>,
	options: CreatePersistedStoreOptions<S> = {}
) {
	const {
		storageType = "localforage",
		migrateFromLocalForage = false,
		onRehydrateStorage: userOnRehydrateStorage,
		partialize: userPartialize,
		merge: userMerge,                           // [FIXED] 提取用户 merge
		...restPersistOptions                        // 剩余选项（不包含 merge）
	} = options;

	let storeSet!: StoreApi<StateWithHydrated<S>>["setState"];

	// 包装 initializer，注入 _hydrated: false，并捕获 storeSet
	const wrappedInitializer: StateCreator<StateWithHydrated<S>, [], [], StateWithHydrated<S>> = (set, get, api) => {
		storeSet = set;
		const userState = initializer(set, get, api);
		return { ...userState, _hydrated: false };
	};

	// ==================== 核心：onRehydrateStorage 处理 ====================
	const combinedOnRehydrateStorage = (preState: StateWithHydrated<S>) => {
		const userPostFn = userOnRehydrateStorage?.(preState as unknown as S);

		return async (state?: StateWithHydrated<S>, error?: unknown) => {
			// 1. 迁移逻辑：localforage → localStorage
			if (storageType === "localStorage" && migrateFromLocalForage) {
				if (localStorage.getItem(name) === null) {
					try {
						const legacyRaw = await localforage.getItem(name);
						if (legacyRaw !== null) {
							let legacyState: any = legacyRaw;

							if (typeof legacyRaw === "string") {
								try {
									const parsed = JSON.parse(legacyRaw);
									if (parsed && typeof parsed === "object" && "state" in parsed) {
										legacyState = parsed.state;
									} else {
										legacyState = parsed;
									}
								} catch {
									// ignore parse error
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

			// 2. 强制写入存储（确保存储键存在）
			const storageEmpty =
				storageType === "localStorage"
					? localStorage.getItem(name) === null
					: true; // localforage 无法同步检查

			if (state && storageEmpty) {
				storeSet((s) => ({ ...s }));
			}

			// 3. 调用用户自定义的 post-rehydration 函数（传入 S 部分），并等待其异步完成（如果返回 Promise）
			if (userPostFn) {
				const result = userPostFn(state as unknown as S, error);
				if (isPromise(result)) {
					await result;
				}
			}

			// 4. 最后设置 _hydrated = true，以匹配 v1 行为（在用户 post 函数之后）
			storeSet((current) => ({ ...current, _hydrated: true }));
		};
	};

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

	// 构建 storage，显式指定泛型为 Partial<S> 以解决类型错误
	const storage =
		storageType === "localforage"
			? createJSONStorage<Partial<S>>(() => localforage)
			: createJSONStorage<Partial<S>>(() => localStorage);

	// 创建 partialize 函数，自动排除 _hydrated
	const partialize = (state: StateWithHydrated<S>): Partial<S> => {
		const { _hydrated, ...rest } = state;
		return userPartialize ? userPartialize(rest as S) : (rest as Partial<S>);
	};

	// [FIXED] 包装用户提供的 merge 函数，使其适配 StateWithHydrated<S>
	const merge = userMerge
		? (persistedState: unknown, currentState: StateWithHydrated<S>): StateWithHydrated<S> => {
			const mergedUserState = userMerge(persistedState, currentState as unknown as S);
			return {
				...mergedUserState,
				_hydrated: currentState._hydrated, // 保留原有的 _hydrated 状态
			} as StateWithHydrated<S>;
		}
		: undefined;

	// 构建 persist 配置，只包含需要的选项
	const persistConfig: PersistOptions<StateWithHydrated<S>, Partial<S>> = {
		name,
		storage,
		partialize,
		onRehydrateStorage: combinedOnRehydrateStorage,
		...(merge !== undefined && { merge }),      // 有条件地加入包装后的 merge
		...restPersistOptions,                       // 其余选项（version, migrate, serialize, deserialize 等）
	};

	// 创建 store
	const store = create<StateWithHydrated<S>>()(
		persist(wrappedInitializer, persistConfig)
	);

	// 收集实例
	persistedStores.set(name, { store, storageType });

	return store;
}