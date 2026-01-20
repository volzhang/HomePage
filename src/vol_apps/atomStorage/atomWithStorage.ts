import {atom, type WritableAtom} from "jotai";
import localforage from "localforage";

//提供两个个API
//const p = creatPersist(key:string, initValue:T) 创建并注册持久化atom，新API
//const [v, setV] = useAtom(p) 在组件中使用atom，原生方法
//const v = useAtomRef(key:string) 在组件中使用atom的引用，依赖安全，新API

type PersistAtomType = WritableAtom<any, any[], any>

const atomRegistry = new Map<string, PersistAtomType>();

export const creatPersist = <T>(key: string, initialValue: T): PersistAtomType => {
	if (atomRegistry.has(key)) {
		console.log(`键名:"${key}"重复，创建失败`);
		return atomRegistry.get(key) as PersistAtomType;
	} else {
		const baseAtom = atom<T>(initialValue);
		const persistAtom = atom(
			(get) => get(baseAtom),
			async (_get, set, newValue: T) => {
				await localforage.setItem(key, newValue);
				set(baseAtom, newValue);
			}
		) as PersistAtomType;

		persistAtom.onMount = (setAtom) => {
			(async () => {
					const keys = await localforage.keys();
					if (keys.includes(key)) {
						const stored = await localforage.getItem(key) as T;
						setAtom(stored);
					}
				}
			)();
		};
		atomRegistry.set(key, persistAtom);
		return persistAtom;
	}
};

// export const usePersist = (key: string) => {
// 	if (!atomRegistry.has(key)) {
// 		console.log(`未找到键"${key}"对应的atom`);
// 		return undefined;
// 	}
// 	const persistAtom = atomRegistry.get(key) as WritableAtom<any, any, any>;
// 	const [value, setValue] = useAtom(persistAtom);
// 	return [value, setValue];
// };