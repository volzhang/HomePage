// noinspection PointlessBooleanExpressionJS,DuplicatedCode

import {useSyncExternalStore} from "react";
import {createStore, get, set} from "idb-keyval";
import {createDebouncedSet} from "@/vol_apps/03_utils/createDebouncedSet.ts";
import {isMigrated, runMigration} from "@/vol_apps/04_persist_atoms/runMigration";
import {type BaseSchema, safeParse} from "valibot";
import * as v from "valibot";
import {deepEqual} from "@/vol_apps/03_utils/deepEqual.ts";

// type Data<T extends State> = { state: T, version: number }
type State = Record<string, unknown>;
type Listener = () => void;
type Subscriber = (listener: () => void) => () => void
type MigrationResult<T extends State> = { success: boolean; state?: T }
type Migration<T extends State> = () => Promise<MigrationResult<T>>;
type Setter<T> = (v: T) => void;

type AtomEntry<T extends State = State> = {
    key: string;
    dataSchema: BaseSchema<T, any, any>;
    getState: () => T;
    setState: (s: T) => void;
};

export const atoms = new Map<string, AtomEntry<any>>();
const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1)

// @formatter:off
// 单信号工厂
const createSignal = <T>(initialValue: T) => {
    let value = initialValue;
    const listeners = new Set<Listener>();
    const emit = () => listeners.forEach(fn => fn());
    const subscribe = (l: Listener) => {listeners.add(l);return () => listeners.delete(l);};
    const get = () => value;
    const useSignal = () => useSyncExternalStore(subscribe, get);
    const set = (next: T) => {if (Object.is(value, next)) return;value = next;emit();};
    return {useSignal, set, get, subscribe};
};

// 派生信号
const createDerivedSignal = <T>(
    compute: () => T,
    deps: Array<{ subscribe: Subscriber }>
) => {
    let value = compute();
    const listeners = new Set<Listener>();
    const emit = () => listeners.forEach(fn => fn());
    const subscribe = (l: Listener) => {listeners.add(l);return () => listeners.delete(l);};
    const get = () => value;
    const useSignal = () => useSyncExternalStore(subscribe, get);
    deps.forEach(dep => {dep.subscribe(() => {const next = compute();if (!Object.is(value, next)) {value = next;emit();}});});
    return {useSignal, get, subscribe};
};
// @formatter:on

// @formatter:on
const createExpandedSignal = <T>(initialValue: T) => {
    const valueSignal = createSignal(initialValue);

    let callback: Setter<T> | undefined = undefined
    const onSet = (fn: Setter<T>) => callback = fn

    const changedSignal = createDerivedSignal<boolean>(
        () => !deepEqual(valueSignal.get(), initialValue),
        [valueSignal]
    );

    const hydratedSignal = createSignal<boolean>(false);

    // 这里的方法尽可能不相互依赖
    const hydrate = (value?: T) => {
        if (value !== undefined) valueSignal.set(value);
        hydratedSignal.set(true);
    };

    const set = (next: T) => {
        if (Object.is(valueSignal.get(), next)) return
        valueSignal.set(next);
        callback?.(next)
    };

    const reset = () => {
        valueSignal.set(initialValue)
    };

    const signalHook = () => {
        return {
            useSignal: valueSignal.useSignal,
            set,
            get: valueSignal.get,
            subscribe: valueSignal.subscribe,
        };
    }

    signalHook.onSet = onSet

    signalHook.isHydrated = hydratedSignal.get;
    signalHook.useHydrated = hydratedSignal.useSignal;
    signalHook.hydrate = hydrate;

    signalHook.isChanged = changedSignal.get;
    signalHook.useChanged = changedSignal.useSignal;
    signalHook.reset = reset;

    signalHook.subscribeToHydrated = hydratedSignal.subscribe;
    signalHook.subscribeToChanged = changedSignal.subscribe;

    return signalHook
};
// @formatter:on

// 一次创建多个信号
export const createAtom = <T extends State>({initState}: {
    initState: T
}) => {

    const signals = new Map<string, ReturnType<typeof createExpandedSignal>>();
    for (const [key, value] of Object.entries(initState)) signals.set(key, createExpandedSignal(value));

    const signalsArray = Array.from(signals.values());

    const hydratableDeps = signalsArray.map(s => ({subscribe: s.subscribeToHydrated}));
    const hydratedSignal = createDerivedSignal(
        () => signalsArray.every(s => s.isHydrated())
        , hydratableDeps)

    const changeableDeps = signalsArray.map(s => ({subscribe: s.subscribeToChanged}));
    const changedSignal = createDerivedSignal(
        () => signalsArray.some(s => s.isChanged())
        , changeableDeps);

    const fullStateDeps = signalsArray.map(s => ({subscribe: s().subscribe}));
    const fullState = createDerivedSignal(
        () => {
            const state: State = {};
            signals.forEach((signal, key) => state[key] = signal().get());
            return state as T;
        }
        , fullStateDeps);

    const setAtom = (newState: T) => {
        for (const [key, value] of Object.entries(newState)) {
            const signal = signals.get(key);
            if (signal) signal().set(value);
        }
    };

    // 塑形：返回个人比较舒适的接口, 默认是全量的setters
    // 形如 {setColor(fuc), setSize(fuc)...}
    // 手动订阅单颗粒的signal，以隔离重渲染
    const useAtomSetters = () => {
        const result: Record<string, unknown> = {};
        for (const [key, signal] of signals) result[`set${capitalize(key)}`] = signal().set;
        return result as {
            [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
        };
    };

    // 按字段精准订阅
    const useField = <K extends keyof T>(name: K) => {
        const s = signals.get(name as string);
        if (!s) throw new Error(`Field not found: ${String(name)}`);

        const value = s().useSignal() as T[K];
        const setter = s().set as (v: T[K]) => void;
        const fieldHydrated = s.useHydrated();

        const result = {
            [name as string]: value,
            [`set${capitalize(name as string)}`]: setter,
            [`${name as string}Hydrated`]: fieldHydrated,
        } as unknown;

        return result as {
            [P in K]: T[P];
        } & {
            [P in K as `set${Capitalize<string & P>}`]: (value: T[P]) => void;
        } & {
            [P in K as `${string & P}Hydrated`]: boolean;
        };
    };

    // 挂载
    useAtomSetters.signals = signals;
    useAtomSetters.useField = useField;

    useAtomSetters.atomChanged = changedSignal.useSignal
    useAtomSetters.reset = () => signals.forEach(s => s.reset());

    useAtomSetters.atomHydrated = hydratedSignal.useSignal;

    useAtomSetters.useAtom = fullState.useSignal;
    useAtomSetters.getAtom = fullState.get;
    useAtomSetters.setAtom = setAtom;

    return useAtomSetters
};

const getDataSchema = <T>(schema: BaseSchema<T, any, any>) => {
    return v.object({state: schema, version: v.number()});
}

const buildData = <T>(state: T) => {
    return {state, version: 1.0 as const};
}

const idbStore = createStore("localforage", "keyvaluepairs")

const createMigration = <T extends State>({
                                              key,
                                              stateSchema,
                                              legacyDb,
                                          }: {
    key: string;
    stateSchema: BaseSchema<T, any, any>;
    legacyDb: "idb" | "localstorage"
}): Migration<T> => {

    const getLegacy = legacyDb === "idb"
        ? async () => get(key, idbStore)
        : () => localStorage.getItem(key)

    return async () => {
        const raw = await getLegacy();
        if (raw == null) return {success: true};

        let data: unknown;
        if (typeof raw === "string") {
            try {
                data = JSON.parse(raw);
            } catch (e) {
                console.warn("Migration: JSON parsee failed", key, e);
                return {success: false};
            }
        } else if (typeof raw === "object" && raw !== null) {
            data = raw;
        } else {
            console.warn("Migration: failed to parsee data", key)
            return {success: false};
        }

        const dataSchema = getDataSchema(stateSchema)
        const parseData = safeParse(dataSchema, data);
        if (!parseData.success) {
            console.warn("Migration: failed to parse data schema", key, parseData.issues);
            return {success: false};
        }

        const state = parseData.output.state;
        const parseState = safeParse(stateSchema, state);

        if (!parseState.success) {
            console.error("Migration: failed to parse state schema", key, parseState.issues);
            return {success: false};
        }

        const writeIDB = createDebouncedSet(set)
        try {
            await writeIDB(key, buildData(state));
            return {
                success: true,
                state: state
            };
        } catch (error) {
            console.error("Migration: failed to writeIDB", key, error);
            return {success: false};
        }
    };
};

// 支持迁移数据
export const createPersitAtom = <T extends State>(config: {
    key: string;
    initState: T;
    stateSchema: BaseSchema<T, any, any>;
    migration?: Migration<T>;         // 可用处理迁移旧数据
}) => {
    const {initState, key, migration, stateSchema} = config;

    const useAtom = createAtom({initState});
    const signals = useAtom.signals;

    // 水合
    const doHydration = async () => {
        try {
            const saved = await get(key);
            signals.forEach((signal, key) => {
                signal.hydrate(saved?.state?.[key]);
            });
        } catch (error) {
            console.error("Hydration failed:", key, error);
            signals.forEach(signal => {
                if (!signal.isHydrated()) signal.hydrate();
            });
        }
    }

    void doHydration();

    // 持久化：注册写库方法
    const writeDebounced = createDebouncedSet(set, 500);

    const persist = () => {
        const fullState: State = {};
        signals.forEach((signal, k) => {
            fullState[k] = signal().get();
        });
        void writeDebounced(config.key, {state: fullState, version: 1.0});
    };

    signals.forEach(signal => signal.onSet(persist))

    // 恢复数据
    const setState = (nextState: State) => {
        for (const [key, value] of Object.entries(nextState)) {
            const signal = signals.get(key)
            if (!signal) continue;
            signal().set(value);
        }
    }

    const doMigration = async () => {
        if (migration === undefined) return;
        if (await isMigrated(key)) return;

        const result = await runMigration(key, migration);
        const nextState = result.state;
        if (!result.success || nextState === undefined) return

        setState(nextState);
    }

    void doMigration();

    atoms.set(key, {
        key,
        dataSchema: getDataSchema(stateSchema),
        getState: useAtom.getAtom,
        setState: useAtom.setAtom,
    });

    return useAtom
}

export const createMigratePersistAtom = <T extends State>(
    config: {
        key: string;
        initState: T;
        stateSchema: BaseSchema<T, any, any>;
        legacyDb: "idb" | "localstorage"
    }
) => {
    const {key, initState, stateSchema, legacyDb} = config
    const migration = createMigration({key, stateSchema, legacyDb})
    return createPersitAtom({key, initState, migration, stateSchema})
}