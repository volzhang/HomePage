import {useSyncExternalStore} from "react";
import {get, set} from "idb-keyval";
import {createDebouncedSet} from "@/vol_apps/03_utils/createDebouncedSet.ts";

// type Data<T extends State> = { state: T, version: number }
// type MigrationResult<S extends State> = { success: boolean; state?: S }
// type Migration<S extends State> = () => Promise<MigrationResult<S>>;

type State = Record<string, unknown>;
type Listener = () => void;

const capitalize = (s: string) => s ? s[0].toUpperCase() + s.slice(1) : s;

// 单信号工厂
const createSignal = <T>(initialValue: T) => {
    let value = initialValue;
    const listeners = new Set<Listener>();
    const subscribe = (l: Listener) => {
        listeners.add(l);
        return () => listeners.delete(l);
    };

    const useSignal = () => useSyncExternalStore(subscribe, () => value);

    const set = (next: T) => {
        if (Object.is(value, next)) return;
        value = next;
        listeners.forEach(fn => fn());
    };

    const get = () => value;
    return { useSignal, set, get };
};

// 增加 持久化能力：写库/水合
const createHydratableSignal = <T>(
    initialValue: T,
) => {
    const valueSignal = createSignal(initialValue);
    const hydratedSignal = createSignal(false);

    const callback: Array<(value: T) => void> = [];

    const hydrate = (value?: T) => {
        if (value !== undefined) valueSignal.set(value);
        hydratedSignal.set(true);
    };

    const set = (next: T) => {
        // if (!hydratedSignal.get()) return    //如有需求，可以UI层写
        if (Object.is(valueSignal.get(), next)) return;
        valueSignal.set(next);
        callback.forEach(fn => fn(next));
    };

    const onChange = (fn: (value:T)=>void) => {
        callback.push(fn);
    };

    return {
        // 值的接口
        useValue: valueSignal.useSignal,
        set,
        get: valueSignal.get,
        // set回调注册接口
        onChange,
        // 水合状态接口
        hydrate,
        useHydrated: hydratedSignal.useSignal,
        isHydrated: hydratedSignal.get,
    };
};

// 输入 initState，输出可直接解构字段的 Hook
const createBaseAtom = <T extends State>(initState: T) => {
    const signals = new Map<string, ReturnType<typeof createHydratableSignal>>();

    for (const [key, value] of Object.entries(initState)) {
        signals.set(key, createHydratableSignal(value));
    }

    const useAtom = () => {
        const result: Record<string, unknown> = {};
        for (const [key, signal] of signals) {
            result[key] = signal.useValue();
            result[`set${capitalize(key)}`] = signal.set;
        }
        return result as {
            [K in keyof T]: T[K];
        } & {
            [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
        };
    };

    // 挂载 signals
    useAtom.signals = signals;

    // 挂载 全局水合标志
    const hydratedSignal = createSignal(false);
    useAtom.useHydrated = hydratedSignal.useSignal;
    useAtom.isHydrated = hydratedSignal.get;
    useAtom.hydrate = () => hydratedSignal.set(true);

    return useAtom;
};

export const createAtom = <T extends State>(config: {
    key: string;
    initState: T;
    stateSchema?: any;      // 可用于将来校验
    migration?:any;         // 可用处理迁移旧数据
}) => {
    const BaseAtom = createBaseAtom(config.initState);
    const signals = BaseAtom.signals;

    const writeDebounced = createDebouncedSet(set, 500);
    const persist = () => {
        const fullState: Record<string, unknown> = {};
        signals.forEach((sig, k) => {
            fullState[k] = sig.get();
        });
        void writeDebounced(config.key, { state: fullState, version: 1.0 });
    };

    signals.forEach(signal => signal.onChange(persist));

    const doHydration = async () => {
        try {
            const saved = await get(config.key);
            signals.forEach((signal, key) => {
                signal.hydrate(saved?.state?.[key]);
            });
        } catch (error) {
            console.error("Hydration failed:", config.key, error);
            signals.forEach(signal => {
                if (!signal.isHydrated()) signal.hydrate();
            });
        } finally {
            BaseAtom.hydrate()
        }
    }

    void doHydration();

    return {hydrated:BaseAtom.useHydrated, ...BaseAtom};
}