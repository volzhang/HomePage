// noinspection DuplicatedCode
import {useSyncExternalStore} from "react";
import {get, set} from "idb-keyval";
import type {
    Derived, Empty, Expanded, Listener, Signal, Store, StoreHub, StoreName,
} from "@/vol_apps/04_persist_atoms/signal/types.ts";
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

type SignalSlot<T> = {
    signal: Expanded<T>;
    name: string | Empty;
    defaultValue: T | Empty;  // 修正拼写
};

const createStore = (storeName: StoreName, maxSlots: number,): Store => {
    const slots: SignalSlot<unknown>[] = Array.from({length: maxSlots}, () => ({
        signal: createExpandedSignal<any>(EMPTY),
        name: EMPTY,
        defaultValue: EMPTY,
    }));

    const activateSignal = (name: string, defaultValue: any): Expanded<any> | undefined => {
        const existing = slots.find(s => s.name === name);
        if (existing) return existing.signal;
        const free = slots.find(s => s.name === EMPTY);
        if (!free) return undefined;
        free.name = name;

        // defaultValue 由useSignal设置，先到先得，没有问题。
        if (free.defaultValue === EMPTY) free.defaultValue = defaultValue;

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

    const debouncedPersist = createDebouncedSet(() => {
        const state = stateSignal.get();
        return set(storeName, {state, version: 1.0});
    }, 500);

    stateSignal.subscribe(() => debouncedPersist());

    const hydratedSignal = createDerivedSignal<boolean>(
        () => slots.filter(s => (s.name !== EMPTY))
            .every(s => s.signal.isHydrated())
        , signalsArray)

    const changedSignal = createDerivedSignal<boolean>(
        () => slots.filter(s => (s.name !== EMPTY) && (s.defaultValue !== EMPTY))
            .some(s => s.signal.get() !== s.defaultValue)
        , signalsArray)

    const useStoreChanged = () => changedSignal.use()
    const useStoreHydrated = () => hydratedSignal.use()

    const reset = () => {
        if (!changedSignal.get()) return
        slots.filter(s => s.name !== EMPTY && (s.defaultValue !== EMPTY))
            .forEach((s) => s.signal.set(s.defaultValue))
    }

    const hydrate = (data: Record<string, any>) => {
        // 1. 恢复已知字段
        for (const [key, value] of Object.entries(data)) {
            const existingSlot = slots.find(s => s.name === key);
            if (existingSlot) {
                existingSlot.signal.hydrate(value);
            } else {
                const free = slots.find(s => s.name === EMPTY);
                if (!free) {
                    console.log(`[Store:${storeName}] 槽位已满，无法恢复字段 "${key}"`);
                    continue;
                }
                free.name = key;
                free.signal.hydrate(value);
            }
        }
        // 2. 无论是否恢复成功，标记所有槽位（包括未激活）已水合
        slots.forEach(slot => slot.signal.hydrate());
    };

    return {
        activateSignal, getSignal,

        useStoreChanged,
        useStoreHydrated,

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
                if (saved && saved.state && typeof saved.state === 'object') {
                    store.hydrate(saved.state);
                } else {
                    store.hydrate({});
                }
            } catch {
                store.hydrate({});
            }
        }

        void doHydration()
    });

    return {
        resolveSignal: (storeName, fieldName, defaultValue) => {
            const existing = stores[storeName]?.getSignal(fieldName);
            if (existing) return existing;
            const newSignal = stores[storeName]?.activateSignal(fieldName, defaultValue);
            if (!newSignal) throw new Error(
                `"${fieldName}" 注册失败：Store "${storeName}" 槽位已满。`
            );
            return newSignal;
        },
    };
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

