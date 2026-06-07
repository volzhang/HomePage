import {EMPTY, type STORE_CONFIG} from "@/vol_apps/04_persist_atoms/signal/signal.ts";

export type Listener = () => void;
export type Subscriber = (listener: Listener) => () => void;
export type Setter<T> = (next: T) => void;
export type Getter<T> = () => T;

export type Signal<T> = {
    use: () => T;
    set: Setter<T>;
    get: Getter<T>;
    subscribe: Subscriber;
};

export type Derived<T> = {
    use: () => T;
    get: Getter<T>;
    subscribe: Subscriber
}

export type Expanded<T> = Signal<T> & {
    isHydrated: () => boolean
    useHydrated: () => boolean
    hydrate: (next?: T) => void
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
};

export type SignalConfig<
    S extends StoreName,
    F extends string,
    T
> = readonly [S, F, T];
