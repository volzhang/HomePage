import {getDefaultStore, type WritableAtom} from "jotai";
import {atomWithStorage} from "jotai/utils";
import localforage from "localforage";

type BaseAtom = WritableAtom<any, any, any>;

type AtomRegistryItem  = {
	atom: BaseAtom;
	initialValue: unknown;
}

const atomRegistry = new Map<string, AtomRegistryItem>();

// 在json恢复数据后刷新
// export const refreshAtoms = async (): Promise<void> => {
// 	const store = getDefaultStore();
// 	const allKeys = await localforage.keys();
//
// 	const entries = Array.from(atomRegistry.entries());
// 	const promises = entries.map(async ([key, {atom}]) => {
// 		if (allKeys.includes(key)) {
// 			const freshValue = await localforage.getItem(key);
// 			store.set(atom, freshValue);
// 		}
// 	});
// 	await Promise.all(promises);
//
// };

// 刷新单个 atom
export const refreshAtom = async (atom_key_name: string): Promise<void> => {
	const store = getDefaultStore();
	const freshValue = await localforage.getItem(atom_key_name);
	const item = atomRegistry.get(atom_key_name);
	if (item) store.set(item.atom, freshValue);
};

// 初始化存储（第一次使用时写入默认值）
const initializeStorage = async <T>(key: string, initialValue: T): Promise<void> => {
	const Keys = await localforage.keys();
	if (Keys.includes(key)) return;
	await localforage.setItem(key, initialValue);
};

// noinspection JSUnusedGlobalSymbols
const storage = {
	//不使用兜底值，保持组件逻辑简单，正确性靠流程保证
	getItem: async (key: string) => await localforage.getItem(key),
	setItem: async (key: string, value: unknown) => await localforage.setItem(key, value),
	removeItem: async (key: string) => await localforage.removeItem(key),
};

// 优先级
// 1.使用localforage缓存
// 2.使用initialValue初始值
export const creatPersist = async <T>(key: string, initialValue: T) => {
	await initializeStorage<T>(key, initialValue);
	const atom: BaseAtom = atomWithStorage(key, initialValue, storage);
	atomRegistry.set(key, {atom: atom, initialValue: initialValue});
	// await refreshAtoms();
	// 页面刷新后， bg-ui部分会显示初始值,不知道为什么，手动刷新全部后可以解决
	await refreshAtom(key) // 待测试
	return atom;
};

