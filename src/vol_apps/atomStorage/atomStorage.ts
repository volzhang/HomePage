import {getDefaultStore, type WritableAtom} from "jotai";
import {atomWithStorage} from "jotai/utils";
import localforage from "localforage";

type BaseAtom = WritableAtom<any, any, any>;

interface AtomRegistryItem {
	atom: BaseAtom;
	initialValue: unknown;
}

const atomRegistry = new Map<string, AtomRegistryItem>();

// 在json恢复数据后刷新
export const refreshAtoms = async (): Promise<void> => {
	const store = getDefaultStore();
	const allKeys = await localforage.keys();
	const entries = Array.from(atomRegistry.entries());
	const promises = entries.map(async ([key, {atom}]) => {
		if (allKeys.includes(key)) {
			const freshValue = await localforage.getItem(key);
			store.set(atom, freshValue);
		}
	});
	await Promise.all(promises);
};

// 确保每个key 一定有DB初始值（第一次使用时写入）
const initializeStorage = async <T>(key: string, initialValue: T): Promise<void> => {
	const Keys = await localforage.keys();
	if (Keys.includes(key)) return;
	await localforage.setItem(key, initialValue);
};

// noinspection JSUnusedGlobalSymbols
const storage = {
	getItem: async (key: string) => {
		return await localforage.getItem(key); //不使用兜底值，保持组件逻辑简单，正确性靠流程保证
	},
	setItem: async (key: string, value: unknown) => {
		await localforage.setItem(key, value);
	},
	removeItem: async (key: string) => {
		await localforage.removeItem(key);
	},
};

export const createAtom = async <T>(key: string, initialValue: T): Promise<BaseAtom> => {
	await initializeStorage<T>(key, initialValue);
	const baseAtom: BaseAtom = atomWithStorage(key, initialValue, storage);
	atomRegistry.set(key, {atom: baseAtom, initialValue: initialValue});
	await refreshAtoms(); //如果这里不手动刷新，页面刷新后,bg-ui部分会显示初始值（数据库缓存和bg显示都正确，只是ui状态不对，是初始值，不知道为什么）
	return baseAtom;
};

