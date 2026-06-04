// noinspection PointlessBooleanExpressionJS
// import {useMemo, useSyncExternalStore} from "react";
// import {createStore, get, set} from "idb-keyval";
// import * as v from "valibot";
// import {type BaseSchema, safeParse} from "valibot";
// import {isMigrated, runMigration} from "@/vol_apps/04_persist_atoms/runMigration";
// import {createDebouncedSet} from "@/vol_apps/03_utils/createDebouncedSet.ts";
//
//
// import type {BaseSchema} from "valibot";
//
// type AtomEntry = {
//     key: string;
//     stateSchema: BaseSchema<any, any, any>;
//     dataSchema: BaseSchema<any, any, any>;
//
//     getValue: () => unknown;
//     setValue: (value: unknown) => void;
//     setMemoryValue: (value: unknown) => void;
// };
// //
// const atoms = new Map<string, AtomEntry>();

//
// type Listener = () => void;
//
// type State = Record<string, unknown>
//

//
// const getDataSchema = <T>(schema: BaseSchema<T, any, any>) => {
//     return v.object({state: schema, version: v.number()});
// }
//
// const buildData = <T>(state: T) => {
//     return {state, version: 1.0 as const};
// }
//
// export const createMigration = <T>({
//                                        key,
//                                        stateSchema,
//                                        getLegacy,
//                                    }: {
//     key: string;
//     stateSchema: BaseSchema<T, any, any>;
//     getLegacy: () => Promise<unknown> | unknown | undefined;
// }): () => Promise<{
//     success: boolean
//     state?: T
// }> => {
//     return async () => {
//
//         const raw = await getLegacy();
//         if (raw == null) return {success: true};
//
//         let data: unknown;
//         if (typeof raw === "string") {
//             try {
//                 data = JSON.parse(raw);
//             } catch (e) {
//                 console.warn("Migration: failed to JSON parsee", key, e);
//                 return {success: false};
//             }
//         } else if (typeof raw === "object" && raw !== null) {
//             data = raw;
//         } else {
//             console.warn("Migration: failed to JSON parsee data", key)
//             return {success: false};
//         }
//
//         const dataSchema = getDataSchema(stateSchema)
//         const parseData = safeParse(dataSchema, data);
//         if (!parseData.success) {
//             console.warn("Migration: failed to parse data schema", key, parseData.issues);
//             return {success: false};
//         }
//
//         const state = parseData.output.state;
//         const parseState = safeParse(stateSchema, state);
//
//         if (!parseState.success) {
//             console.error("Migration: failed to parse state schema", key, parseState.issues);
//             return {success: false};
//         }
//
//         const writeIDB = createDebouncedSet(set)
//         try {
//
//             await writeIDB(key, buildData(state));
//             return {
//                 success: true,
//                 state: state
//             };
//         } catch (error) {
//             console.error("Migration: failed to writeIDB", key, error);
//             return {success: false};
//         }
//     };
// };
//
// type AtomHook<T extends State> = {
//     (): readonly [T, (next: T) => void, boolean];
//     useSelector: <R>(
//         selector: (state: T) => R
//     ) => R;
// };
//
// export const createAtom = <T extends State>({
//                                                 key,
//                                                 stateSchema,
//                                                 initState,
//                                                 migration,
//                                             }: {
//     key: string;
//     stateSchema: BaseSchema<T, any, any>;
//     initState: T;
//     migration?: () => Promise<{ success: boolean, state?: T }>;
// }): AtomHook<T> => {
//
//     const dataSchema = getDataSchema(stateSchema);
//     let state: T = initState;
//     let hydrated = false;
//
//     const listeners = new Set<Listener>();
//     const emit = () => listeners.forEach(fn => fn());
//
//     // 异步水合
//     const doHydration = async () => {
//         try {
//             const saved = await get(key);
//             if (saved?.state !== undefined) {
//                 // 不做验证(更快)，注释的是验证版本
//                 state = saved.state;
//                 // const parseSchema = safeParse(dataSchema, saved)
//                 //     if (parseSchema.success) {
//                 //         state = parseSchema.output.state;
//                 //     } else {
//                 //         console.error("hydration: failed to parse state", key, parseSchema.issues);
//                 //     }
//             }
//         } catch (error) {
//             console.error("hydration failed", key, error);
//         } finally {
//             hydrated = true;
//             emit();
//         }
//     };
//
//     // 异步迁移
//     // const doMigration = async () => {
//     //     if (migration && !(await isMigrated(key))) void runMigration(key, migration);
//     // };
//
//     const doMigration = async () => {
//         if (migration && !(await isMigrated(key))) {
//             const result = await runMigration(key, migration);
//             if (result.success && result.state !== undefined) {
//                 const next = result.state;
//                 if (Object.is(state, next)) return;
//                 state = next;
//                 emit();
//             }
//         }
//     };
//
//     // 启动水合和迁移，都不阻塞，实测最快，缺点是，如果migration实际发生并完成时，闪屏一次，
//     void doHydration();
//     void doMigration();
//
//     const getValue = (): T => state;
//     const getHydrated = () => hydrated;
//
//     const writeIDB = createDebouncedSet(set, 500)
//
//     const setValue = (next: T) => {
//         if (Object.is(state, next)) return;
//         if (!hydrated) return;      // 极端一点，必须先水合
//         state = next;
//         emit();
//         void writeIDB(key, buildData(state));
//     };
//
//     const subscribe = (listener: Listener) => {
//         listeners.add(listener);
//         return () => listeners.delete(listener);
//     };
//
//     const useAtom = () => {
//         const value = useSyncExternalStore(subscribe, getValue);
//         const hydrated = useSyncExternalStore(subscribe, getHydrated);
//         return useMemo(() => {
//             return [value, setValue, hydrated] as const
//         }, [value, hydrated]);
//     };
//
//     // useSelector没有实际用处，需要重写 createAtom 使其天然支持所有属性独立订阅（写库保持合并）
//     const useSelector = <R>(selector: (state: T) => R): R => {
//         return useSyncExternalStore(subscribe, () => selector(state));
//     };
//
//     const atomHook: AtomHook<T> = Object.assign(useAtom, {useSelector});
//
//     // 注册 atoms
//     const setMemoryValue = (next: T) => {
//         if (Object.is(state, next)) return;
//         state = next;
//         emit();
//     };
//
//     atoms.set(key, {
//         key,
//         stateSchema,
//         dataSchema,
//         getValue,
//         setValue: setValue as (value: unknown) => void,
//         setMemoryValue: setMemoryValue as (value: unknown) => void,
//     });
//
//     return atomHook;
// }
//
// const idbStore = createStore("localforage", "keyvaluepairs")

// export const createMigrationAtom = <T extends State>({
//                                                          key,
//                                                          stateSchema,
//                                                          initState,
//                                                          legacy = "idb"
//                                                      }: {
//     key: string;
//     stateSchema: BaseSchema<T, any, any>;
//     initState: T;
//     legacy: "idb" | "localstorage"
// }): AtomHook<T> => {
//     const getLegacy = legacy === "idb"
//         ? async () => get(key, idbStore)
//         : () => localStorage.getItem(key)
//     const migration = createMigration<T>({key, stateSchema, getLegacy});
//     return createAtom<T>({key, stateSchema, initState, migration});
// };

// export const useField = <T extends State>(
//     useAtomHook: () => readonly [T, (next: T) => void, boolean]
// ) => {
//     return () => {
//         const [state, setState, hydrated] = useAtomHook();
//
//         const field = useCallback((key: keyof T) => {
//             const setter = (value: T[typeof key]) => setState({...state, [key]: value});
//             return [state[key], setter] as const
//         }, [state])
//
//         return {state, setState, hydrated, field};
//     }
// }

// type AutoProps<T extends State> = {
//     [K in keyof T]: T[K];
// } & {
//     [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
// }

// type ExpandedReturn<T extends Record<string, unknown>> = AutoProps<T>
//     & { hydrated: boolean };

// export const useAutoFields = <T extends Record<string, unknown>>(
//     useAtomHook: AtomHook<T>
// ) => {
//     return () => {
//         const [state, setState, hydrated] = useAtomHook();
//         const autoProps = useMemo(() => {
//             const props: Record<string, unknown> = {};
//             for (const key of Object.keys(state) as (keyof T)[]) {
//                 props[key as string] = state[key];
//                 const setterKey = `set${String(key)[0].toUpperCase()}${String(key).slice(1)}`;
//                 props[setterKey] = (value: T[typeof key]) => {
//                     setState({...state, [key]: value});
//                 };
//             }
//             return props as AutoProps<T>;
//         }, [state, setState]);
//         return {state, setState, hydrated, ...autoProps}
//         // as ExpandedReturn<T>;
//     }
// };

// export const createAutoMigrationAtom = <T extends State>(props: {
//     key: string;
//     stateSchema: BaseSchema<T, any, any>;
//     initState: T;
//     legacy: "idb" | "localstorage"
// }) => {
//
//     const useAtom = createMigrationAtom(props);
//     const useAutoHook = useAutoFields(useAtom);
//
//     return Object.assign(
//         useAutoHook,
//         {
//             useAtomHook: useAtom,
//             useSelector: useAtom.useSelector,
//         }
//     )
// }

