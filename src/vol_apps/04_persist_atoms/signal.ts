// noinspection DuplicatedCode
import {useSyncExternalStore} from "react";
import {del, get, set} from "idb-keyval";
import type {
    Derived, Expanded, Listener, Signal, SignalSlot, Store, StoreHub, StoreName,
} from "@/vol_apps/04_persist_atoms/types.ts";
import {deepEqual} from "@/vol_apps/03_utils/deepEqual.ts";
import {capitalize} from "@/vol_apps/03_utils/capitalize.ts";
import {createDebouncedSet} from "@/vol_apps/03_utils/createDebouncedSet.ts";

export const STORE_CONFIG = {
    theme: 2,
    language: 2,
    search: 2,
    searchStyle: 2,
    tagStyle: 20,
    ts: 20,
    // bg: 20,
};

export const EMPTY = Symbol("empty");

// @formatter:off
// 单信号
const createSignal = <T>(initialValue: T): Signal<T> => {
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
    defaultValue: T,
): Expanded<T> => {
    const valueSignal = createSignal<T>(defaultValue);
    const hydrated = createSignal<boolean>(false)

    const isHydrated = hydrated.get
    const useHydrated = hydrated.use
    const hydrate = (next?: T) => {
        if (!hydrated.get()) {
            if (next !== undefined) valueSignal.set(next)
            hydrated.set(true)
        }
    }
    return {...valueSignal, isHydrated, useHydrated, hydrate,}
}
// @formatter:on

const createStore = (storeName: StoreName, maxSlots: number,): Store => {
    const slots: SignalSlot<unknown>[] = Array.from({length: maxSlots}, () => ({
        signal: createExpandedSignal<any>(EMPTY),
        name: EMPTY,
        defaultValue: EMPTY,
    }));

    const activateSignal = (name: string, defaultValue: any): Expanded<any> | undefined => {
        const existing = slots.find(s => s.name === name);
        if (existing) {
            // 有可能水合注册，需要补初始值
            if (existing.defaultValue === EMPTY) existing.defaultValue = defaultValue
            if (existing.signal.get() === EMPTY) existing.signal.set(defaultValue)  //实际应该不可能，先留着
            return existing.signal;
        }

        const free = slots.find(s => s.name === EMPTY);
        if (!free) return undefined;

        free.name = name;
        if (free.defaultValue === EMPTY) free.defaultValue = defaultValue;
        // defaultValue 由useSignal设置，先到先得。建议使用统一props。
        free.signal.set(defaultValue);

        return free.signal;
    };

    const getSignal = (name: string): Expanded<any> | undefined =>
        slots.find(s => s.name === name)?.signal;

    const signalsArray = slots.map(slot => slot.signal);

    const stateSignal = createDerivedSignal(() => {
            const snapshot: Record<string, any> = {};
            slots
                .filter(s => (s.name !== EMPTY) && (s.defaultValue !== EMPTY))
                .forEach(s => {
                    snapshot[s.name as string] = s.signal.get();
                })
            return snapshot;
        }, signalsArray
    );

    // 全量合法 State
    const getState = () => stateSignal.get()

    const setState = (state: Record<string, any>) => {
        for (const [key, value] of Object.entries(state)) {
            const existingSlot = slots.find(s => s.name === key);
            if (existingSlot) existingSlot.signal.set(value);
            else {
                const free = slots.find(s => s.name === EMPTY);
                if (!free) {
                    console.log(`[Store:${storeName}] 槽位已满，无法恢复字段 "${key}"`);
                    continue;
                }
                free.name = key;
                free.signal.set(value);
            }
        }
    }

    // 变化部分的State
    const getChangedState = (): Record<string, any> => {
        const currentState = stateSignal.get();
        const changed: Record<string, any> = {};
        for (const [key, value] of Object.entries(currentState)) {
            const slot = slots.find(s => s.name === key);
            if (slot && slot.defaultValue !== EMPTY && !deepEqual(value, slot.defaultValue)) {
                changed[key] = value;
            }
        }
        return changed;
    };

    const debouncedPersist = createDebouncedSet(() => {
        const changed = getChangedState();
        if (Object.keys(changed).length === 0) {
            return del(storeName);
        }
        return set(storeName, {state: changed, version: 1.0});
    }, 500);

    stateSignal.subscribe(() => debouncedPersist());

    const hydratedSignal = createDerivedSignal<boolean>(
        () => slots.filter(s => (s.name !== EMPTY))
            .every(s => s.signal.isHydrated())
        , signalsArray)

    const changedSignal = createDerivedSignal<boolean>(
        () => slots.filter(s => (s.name !== EMPTY) && (s.defaultValue !== EMPTY))
            .some(s => !deepEqual(s.signal.get(), s.defaultValue))
        , signalsArray)

    const useStoreChanged = () => changedSignal.use()
    const getStoreChanged = () => changedSignal.get()
    const useStoreHydrated = () => hydratedSignal.use()

    const reset = () => {
        if (!changedSignal.get()) return
        slots.filter(s => s.name !== EMPTY && (s.defaultValue !== EMPTY))
            .forEach((s) => s.signal.set(s.defaultValue))
    }

    const hydrate = (state?: Record<string, any>) => {
        if (state !== undefined) {
            for (const [fieldName, value] of Object.entries(state)) {
                const existingSlot = slots.find(s => s.name === fieldName);
                if (existingSlot) existingSlot.signal.hydrate(value);
                else {
                    const free = slots.find(s => s.name === EMPTY);
                    if (!free) {
                        console.log(`[Store:${storeName}] 槽位已满，水合失败: "${fieldName}"`);
                        continue;
                    }
                    free.name = fieldName;
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


export const useSignal = <T, F extends string>(
    storeName: StoreName, fieldName: F, defaultValue: T,
) => {
    const signal = storeHub.resolveSignal(storeName, fieldName, defaultValue);
    const setterName = `set${capitalize(fieldName)}` as const;
    const hydratedName = `${fieldName}Hydrated` as const;
    return {
        [fieldName]: signal.use(),
        [setterName]: signal.set,
        [hydratedName]: signal.useHydrated(),
    } as {
        [K in F]: T;
    } & {
        [K in F as `set${Capitalize<K>}`]: (value: T) => void;
    } & {
        [K in F as `${K}Hydrated`]: boolean;
    };
};

export const getSignal = <T>(
    storeName: StoreName,
    fieldName: string,
    defaultValue: T,
) => {
    return storeHub.resolveSignal(
        storeName,
        fieldName,
        defaultValue
    );
};

export const createStoreConfig =
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