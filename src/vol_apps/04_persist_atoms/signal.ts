// noinspection DuplicatedCode
import {useSyncExternalStore} from "react";
import {del, get, set} from "idb-keyval";
import type {
    Derived, Empty, Expanded, Listener, Signal, SignalSlot, Store, StoreHub, StoreName,
} from "@/vol_apps/04_persist_atoms/types.ts";
import {deepEqual} from "@/vol_apps/03_utils/deepEqual.ts";
import {capitalize} from "@/vol_apps/03_utils/capitalize.ts";
import {createDebouncedSet} from "@/vol_apps/03_utils/createDebouncedSet.ts";

// 全局信号数量注册
export const STORE_CONFIG = {
    theme: 2,
    language: 2,
    search: 2,
    search2: 10,
    searchStyle: 2,
    tagStyle: 20,
    ts: 20,
    cm: 20,
    bg: 12,
};

export const EMPTY = Symbol("empty");

// @formatter:off
// 单信号
export const createSignal = <T>(initialValue: T): Signal<T> => {
    let value = initialValue;
    const listeners = new Set<Listener>();
    const emit = () => listeners.forEach(fn => fn());
    const subscribe = (l: Listener) => {listeners.add(l);return () => listeners.delete(l);};
    const get = () => value;
    const use = () => useSyncExternalStore(subscribe, get);
    const set = (next: T) => {if (deepEqual(get(), next)) return;value = next;emit();};
    return {use, set, get, subscribe};
};

// 派生信号
const createDerivedSignal = <T>(
    compute: () => T,
    deps: Array<Signal<any>> | Array<Derived<any>> | Array<Expanded<any>>,
): Derived<T> => {
    let value = compute();
    const listeners = new Set<Listener>();
    const emit = () => listeners.forEach(fn => fn());
    const subscribe = (l: Listener) => {listeners.add(l);return () => listeners.delete(l);};
    const get = () => value;
    const use = () => useSyncExternalStore(subscribe, get);
    deps.forEach(dep => {dep.subscribe(() => {const next = compute();if (deepEqual(get(), next)) return;value = next;emit();});});
    return {use, get, subscribe};
};

// @formatter:off
const createExpandedSignal = <T>(
    value: T,
): Expanded<T> => {
    const valueSignal = createSignal<T>(value);

    const defaultValueSignal = createSignal<T|Empty>(EMPTY)
    const changed = createDerivedSignal<boolean>(()=>{
        // 这里并不优雅和逻辑严密
        if (defaultValueSignal.get() === EMPTY) return false;
        else {return !deepEqual(valueSignal.get(), defaultValueSignal.get())}
    }, [valueSignal, defaultValueSignal]);

    const setDefault = (value: T) => {
        if (defaultValueSignal.get() === EMPTY) defaultValueSignal.set(value)
    }
    const getDefault = defaultValueSignal.get

    const reset = () => {
        const defaultValue = getDefault()
        if (defaultValue !== EMPTY) valueSignal.set(defaultValue)
    }

    const isChanged = changed.get
    const useChanged = changed.use

    const hydrated = createSignal<boolean>(false)
    const isHydrated = hydrated.get
    const useHydrated = hydrated.use
    const hydrate = (next?: T) => {
        if (!hydrated.get()) {
            hydrated.set(true)
            if (next !== undefined) valueSignal.set(next)
        }
    }

    return {...valueSignal, isHydrated, useHydrated, hydrate, isChanged, useChanged, setDefault, reset, getDefault, defaultValueSignal};
}
// @formatter:on

const createStore = (storeName: StoreName, maxSlots: number,): Store => {
    const slots: SignalSlot<unknown>[] = Array.from({length: maxSlots}, () => ({
        signal: createExpandedSignal<any>(EMPTY),
        fieldName: EMPTY,
    }));

    const activateSignal = (name: string, defaultValue: any): Expanded<any> | undefined => {
        const existing = slots.find(s => s.fieldName === name);
        if (existing) {
            // defaultValue 由useSignal设置，先到先得。建议使用统一props。
            existing.signal.setDefault(defaultValue)

            if (!existing.signal.isHydrated()) {
                existing.signal.set(defaultValue)       // 如果没有水合过，设置值
                // existing.signal.emit()
            } else {
                if (existing.signal.get() === EMPTY) {
                    existing.signal.set(defaultValue)           // 水合过但是没有设置值，设置值
                }
            }
            return existing.signal;
        }

        const free = slots.find(s => s.fieldName === EMPTY);
        if (!free) return undefined;

        free.fieldName = name;
        // defaultValue 由useSignal设置，先到先得。建议使用统一props。
        free.signal.setDefault(defaultValue)
        free.signal.set(defaultValue)

        return free.signal;
    };

    const getSignal = (name: string): Expanded<any> | undefined =>
        slots.find(s => s.fieldName === name)?.signal;

    const valueSignalsArray = slots.map(slot => slot.signal);
    const defaultValueSignalsArray = slots.map(slot => slot.signal.defaultValueSignal);


    // 监控全量state，排除无初始值的signal
    const stateSignal = createDerivedSignal(() => {
            const snapshot: Record<string, any> = {};
            slots
                .filter(s => ((s.fieldName !== EMPTY) && (s.signal.getDefault() !== EMPTY)))
                .forEach(s => {
                    snapshot[s.fieldName as string] = s.signal.get();
                })
            return snapshot;
        }, [...valueSignalsArray, ...defaultValueSignalsArray]
    );

    // 全量合法 State
    const getState = () => stateSignal.get()

    // 用于恢复存档
    const setState = (state: Record<string, any>) => {
        const kvArray = Object.entries(state)
        if (kvArray.length === 0) return;
        for (const [key, value] of kvArray) {
            const existingSlot = slots.find(s => s.fieldName === key);
            if (existingSlot) existingSlot.signal.set(value);
            else {
                const free = slots.find(s => s.fieldName === EMPTY);
                if (!free) {
                    console.log(`[Store:${storeName}] 槽位已满，无法恢复字段 "${key}"`);
                    continue;
                }
                free.fieldName = key;
                free.signal.set(value);
            }
        }
    }

    // 变化部分的State
    const getChangedState = (): Record<string, any> => {
        const currentState = stateSignal.get();
        const changed: Record<string, any> = {};
        for (const [key, value] of Object.entries(currentState)) {
            const slot = slots.find(s => s.fieldName === key);
            if (slot && (slot.signal.isChanged() === true)) {
                changed[key] = value;
            }
        }
        return changed;
    };

    // 写库方法：策略，防抖+最小化写入
    const debouncedPersist = createDebouncedSet(() => {
        const changed = getChangedState();
        if (Object.keys(changed).length === 0) {
            return del(storeName);
        }
        return set(storeName, {state: changed, version: 1.0});
    }, 500);

    // 订阅写库方法
    stateSignal.subscribe(() => debouncedPersist());

    const hydratedSignal = createDerivedSignal<boolean>(
        () => slots.filter(s => (s.fieldName !== EMPTY))
            .every(s => s.signal.isHydrated())
        , [...valueSignalsArray, ...defaultValueSignalsArray])

    const changedSignal = createDerivedSignal<boolean>(
        () => slots.filter(s => (s.fieldName !== EMPTY))
            .some(s => s.signal.isChanged())
        , [...valueSignalsArray, ...defaultValueSignalsArray])

    const useStoreChanged = () => changedSignal.use()
    const getStoreChanged = () => changedSignal.get()
    const reset = () => {
        if (!changedSignal.get()) return
        slots.filter(s => s.fieldName !== EMPTY)
            .forEach((s) => s.signal.reset())
    }

    const useStoreHydrated = () => hydratedSignal.use()
    const hydrate = (state?: Record<string, any>) => {
        if (state !== undefined) {
            for (const [fieldName, value] of Object.entries(state)) {
                const existingSlot = slots.find(s => s.fieldName === fieldName);
                if (existingSlot) existingSlot.signal.hydrate(value);
                else {
                    const free = slots.find(s => s.fieldName === EMPTY);
                    if (!free) {
                        console.log(`[Store:${storeName}] 槽位已满，水合失败: "${fieldName}"`);
                        continue;
                    }
                    free.fieldName = fieldName;
                    free.signal.hydrate(value);
                }
            }
        }
        slots.forEach(slot => slot.signal.hydrate());
    };

    return {
        activateSignal, getSignal,

        useStoreChanged,
        getStoreChanged,
        useStoreHydrated,

        getState,
        setState,

        hydrate,
        reset,

        slots,
        persisit: debouncedPersist
    };
};

const createStoreHub = (): StoreHub => {
    const stores: Record<StoreName, Store> = {} as Record<StoreName, Store>;

    Object.entries(STORE_CONFIG).forEach(([name, maxSlots]) => {
        const store = createStore(
            name as StoreName,
            maxSlots
        );

        stores[name as StoreName] = store;

        const doHydration = async () => {
            try {
                const saved = await get(name);
                if (saved && saved.state && typeof saved.state === 'object') store.hydrate(saved.state);
                else store.hydrate();
            } catch {
                store.hydrate();
            }
        }
        void doHydration()
    });

    const getStore = (storeName: StoreName) => stores[storeName]

    return {
        resolveSignal: (storeName, fieldName, defaultValue) => {
            const store = getStore(storeName);
            const signal = store.activateSignal(fieldName, defaultValue);
            if (!signal) throw new Error(`[${storeName}] no slot available for ${fieldName}`);
            return signal;
        },

        // 下载存档专用的方法
        getStores: () => {
            const result: Record<StoreName, Store> = {} as Record<StoreName, Store>
            Object.entries(stores).forEach(([storeName, store]) => {
                const state = store.getState();
                if (Object.entries(state).length === 0) return
                if (!store.getStoreChanged()) return;
                result[storeName as StoreName] = store;
            })
            return result
        },

        getStore,

        stores,
    }
};

export const storeHub = createStoreHub();

// export const useSignal = <T, F extends string>(
//     storeName: StoreName, fieldName: F, defaultValue: T,
// ) => {
//     const signal = storeHub.resolveSignal(storeName, fieldName, defaultValue);
//     const setterName = `set${capitalize(fieldName)}` as const;
//     const hydratedName = `${fieldName}Hydrated` as const;
//     return {
//         [fieldName]: signal.use(),
//         [setterName]: signal.set,
//         [hydratedName]: signal.useHydrated(),
//     } as {
//         [K in F]: T;
//     } & {
//         [K in F as `set${Capitalize<K>}`]: (value: T) => void;
//     } & {
//         [K in F as `${K}Hydrated`]: boolean;
//     };
// };

type UseSignal = {
    <T, F extends string>(storeName: StoreName, fieldName: F, defaultValue: T): {
        [K in F]: T;
    } & {
        [K in F as `set${Capitalize<K>}`]: (value: T) => void;
    } & {
        [K in F as `${K}Hydrated`]: boolean;
    };
    <T, F extends string>(tuple: [StoreName, F, T]): {
        [K in F]: T;
    } & {
        [K in F as `set${Capitalize<K>}`]: (value: T) => void;
    } & {
        [K in F as `${K}Hydrated`]: boolean;
    };
};

export const useSignal: UseSignal = (...args: any[]) => {
    let storeName: StoreName;
    let fieldName: string;
    let defaultValue: any;

    if (Array.isArray(args[0])) {
        [storeName, fieldName, defaultValue] = args[0];
    } else {
        [storeName, fieldName, defaultValue] = args;
    }

    const signal = storeHub.resolveSignal(storeName, fieldName, defaultValue);

    const setterName = `set${capitalize(fieldName)}` as const;
    const hydratedName = `${fieldName}Hydrated` as const;

    return {
        [fieldName]: signal.use(),
        [setterName]: signal.set,
        [hydratedName]: signal.useHydrated(),
    };
};

// export const getSignal = <T>(
//     storeName: StoreName,
//     fieldName: string,
//     defaultValue: T,
// ) => {
//     return storeHub.resolveSignal(
//         storeName,
//         fieldName,
//         defaultValue
//     );
// };

type GetSignal = {
    <T, F extends string>(
        storeName: StoreName,
        fieldName: F,
        defaultValue: T,
    ): Expanded<T>;

    <T, F extends string>(
        tuple: [StoreName, F, T],
    ): Expanded<T>;
};

export const getSignal: GetSignal = (...args: any[]) => {
    let storeName: StoreName;
    let fieldName: string;
    let defaultValue: any;

    if (Array.isArray(args[0])) {
        [storeName, fieldName, defaultValue] = args[0];
    } else {
        [storeName, fieldName, defaultValue] = args;
    }

    return storeHub.resolveSignal(
        storeName,
        fieldName,
        defaultValue,
    );
};

export const initStoreState =
    <TFields extends Record<string, any>>(
        config: {
            storeName: StoreName;
            fields: TFields;
        }
    ) => {
        return <K extends keyof TFields>(fieldName: K): [StoreName, K, TFields[K]] => {
            return [config.storeName, fieldName, config.fields[fieldName]];
        };
    };