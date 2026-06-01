import {useMemo, useSyncExternalStore} from "react";
import {get, set} from "idb-keyval";
import {safeParse, type BaseSchema, object, record, number, string, unknown} from "valibot";

type AtomEntry = {
    key: string;
    schema: BaseSchema<any, any, any>;
    getValue: () => unknown;
    setValue: (value: unknown) => void;
    setMemoryValue: (value: unknown) => void;
};

type Listener = () => void;

export const atoms = new Map<string, AtomEntry>();

const MIGRATION_FLAGS_KEY = "_migration_flags";

export const runMigration = async (
    key: string,
    migration: () => Promise<void> | void
) => {
    const flags: Record<string, boolean> = (await get(MIGRATION_FLAGS_KEY)) ?? {};
    if (flags[key]) return
    await migration();
    await set(MIGRATION_FLAGS_KEY, {...flags, [key]: true});
};

/**
 * 旧存储的数据结构示例：
 * {
 *   "state": { "theme": "dark" },
 *   "version": 1.2
 * }
 */

const oldDataSchema = object({
    state: record(string(), unknown()),  // 键是字符串，值类型未知
    version: number(),
});

export const createMigration = <T>(
    {
        key,
        schema,
        getLegacy,
        setCurrent,
        version = 1,
    }: {
        key: string;
        schema: BaseSchema<T, any, any>;
        getLegacy: () => Promise<unknown> | unknown | undefined;
        setCurrent: (key: string, value: T) => Promise<void> | void;
        version?: 1 | 2
    }
) => {

    return async () => {
        const raw = await getLegacy();
        if (raw == null) return;

        let json: unknown;

        if (typeof raw === "string") {
            try {
                json = JSON.parse(raw);
            } catch (e) {
                console.warn(`Migration: failed to parse JSON for key "${key}"`, e);
                return;
            }
        } else if (typeof raw === "object" && raw !== null) {
            json = raw;
        } else {
            console.warn(`Migration: old data invalid for key "${key}"`);
            return;
        }

        const oldResult = safeParse(oldDataSchema, json);

        if (!oldResult.success) {
            console.warn(`Migration: old data invalid for key "${key}"`, oldResult.issues);
            return;
        }

        let value: unknown;

        if (version === 1) {
            // 旧结构：state[key]
            value = oldResult.output.state[key];
        }

        else if (version === 2) {
            // 新结构：state 整体就是 value
            value = oldResult.output.state;
        }

        // else if (version === 3) {
        //     // 完全原样
        //     value = json;
        // }

        if (value === undefined) {
            console.warn(`Migration: key "${key}" not found in old state`);
            return;
        }

        const result = safeParse(schema, value);

        if (!result.success) {
            console.error(`Migration failed for key "${key}":`, result.issues);
            return;
        }

        await setCurrent(key, result.output);
    };
};


export const createAtom = <T>(
    {key, schema, defaultValue, migration}: {
        key: string;
        schema: BaseSchema<T, any, any>;
        defaultValue: T;
        migration?: () => Promise<void> | void;
    }
) => {

    let value: T = defaultValue;
    let hydrated: boolean = false;

    const listeners = new Set<Listener>();
    const emit = () => listeners.forEach(fn => fn());

    const restore = async () => {
        try {

            // 先迁移
            if (migration) await runMigration(key, migration);

            const saved = await get<unknown>(key);
            if (saved !== undefined) {      // 如果不存在则跳过
                const parsed = safeParse(schema, saved)
                if (parsed.success) {
                    value = parsed.output;
                } else {
                    console.error("Unable to parse state: ", key, parsed.issues);
                }
            }
        } catch (error) {
            console.error("Unable to restore state: ", error);
        } finally {
            hydrated = true;
            emit();
        }
    };

    void restore();

    const getValue = () => value;
    const getHydrated = () => hydrated;

    const setValue = (next: T) => {
        if (Object.is(value, next)) return;
        value = next;
        emit();
        set(key, next).catch(console.error);
    };

    const subscribe = (listener: Listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };

    const useAtom = () => {
        const value = useSyncExternalStore(subscribe, getValue);
        const hydrated = useSyncExternalStore(subscribe, getHydrated);
        return useMemo(
            () => [value, setValue, hydrated] as const,
            [value, hydrated]
        );
    };

    // 注册 atoms
    const setMemoryValue = (next: T) => {
        if (Object.is(value, next)) return;
        value = next;
        emit();
    };

    atoms.set(key, {
        key,
        schema,
        getValue,
        setValue: setValue as (value: unknown) => void,
        setMemoryValue: setMemoryValue as (value: unknown) => void,
    });

    return useAtom;
}


export const createMigrationAtom = <T>(
    {
        key, schema, defaultValue, getLegacy, version = 1
    }: {
        key: string;
        schema: BaseSchema<T, any, any>
        defaultValue: T;

        getLegacy: () => Promise<unknown> | unknown | undefined;
        version?: 1 | 2
    }
) => {
    const migration = createMigration({key, schema, getLegacy, setCurrent: set, version})
    return createAtom({key, schema, defaultValue, migration})
}
