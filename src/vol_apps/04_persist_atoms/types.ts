import {EMPTY, type STORE_CONFIG} from "@/vol_apps/04_persist_atoms/signal.ts";

export type Listener = () => void;
export type Subscriber = (listener: Listener) => () => void;

export type Signal<T> = {
    use: () => T;
    set: (next: T) => void;
    get: () => T;
    subscribe: Subscriber;
};

export type Derived<T> = {
    use: () => T;
    get: () => T;
    subscribe: Subscriber
}

export type Expanded<T> = Signal<T> & {
    isHydrated: () => boolean
    useHydrated: () => boolean
    hydrate: (next?: T) => void
};

export type SignalSlot<T> = {
    signal: Expanded<T>;
    name: string | Empty;
    defaultValue: T | Empty;
};

export type Store = {
    activateSignal: (filedName: string, defaultValue: any) => Expanded<any> | undefined;
    getSignal: (filedName: string) => Expanded<any> | undefined;

    getState: () => Record<string, any>,
    setState: (state: Record<string, any>) => void;

    useStoreChanged: () => boolean,
    getStoreChanged: () => boolean,
    useStoreHydrated: () => boolean,

    hydrate: (state?: Record<string, any>) => void;
    reset: () => void;
}

export type StoreName = keyof typeof STORE_CONFIG;

export type Empty = typeof EMPTY

export type StoreHub = {
    resolveSignal: <T>(storeName: StoreName, fieldName: string, defaultValue: T) => Expanded<T>;
    getStores: () => Record<StoreName, Store>
    getStore: (storeName: StoreName) => Store,
};

export type SignalConfig<
    S extends StoreName,
    F extends string,
    T
> = readonly [S, F, T];
