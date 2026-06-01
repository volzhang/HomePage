import {useMemo, useSyncExternalStore} from "react";
import {get, set} from "idb-keyval";
import {safeParse, type BaseSchema, object, record, number, string, unknown} from "valibot";

type AtomEntry = {
    key: string;
    valueSchema: BaseSchema<any, any, any>;
    dataSchema: BaseSchema<any, any, any>;

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
 *   "version": 1.0
 * }
 */

export const oldDataSchema = object({
    state: record(string(), unknown()),  // 键是字符串，值类型未知
    version: number(),
});


export const createMigration = <T>(
    {
        key,
        valueSchema,
        getLegacy,
        setCurrent,
    }: {
        key: string;
        valueSchema: BaseSchema<T, any, any>;
        getLegacy: () => Promise<unknown> | unknown | undefined;
        setCurrent: (key: string, value: T) => Promise<void> | void;
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

        const parseOld = safeParse(oldDataSchema, json);

        if (!parseOld.success) {
            console.warn(`Migration: old data invalid for key "${key}"`, parseOld.issues);
            return;
        }

        const value = parseOld.output.state;

        if (value === undefined) {
            console.warn(`Migration: key "${key}" not found in old state`);
            return;
        }

        const parseValue = safeParse(valueSchema, value);

        if (!parseValue.success) {
            console.error(`Migration failed for key "${key}":`, parseValue.issues);
            return;
        }

        await setCurrent(key, parseValue.output);
    };
};


export const createAtom = <T>(
    {key, valueSchema, defaultValue, migration}: {
        key: string;
        valueSchema: BaseSchema<T, any, any>;
        defaultValue: T;
        migration?: () => Promise<void> | void;
    }
) => {

    // version 没有实际作用，只为保持新旧数据schema对齐
    const newDataSchema = object({
        state: valueSchema,
        version: number(),
    })

    let value: T = defaultValue;
    let hydrated: boolean = false;

    const listeners = new Set<Listener>();
    const emit = () => listeners.forEach(fn => fn());

    const migration_and_hydration = async () => {
        try {
            // 1.迁移
            if (migration) await runMigration(key, migration);

            // 2.水合
            const saved = await get(key);
            if (saved !== undefined) {     // 如果不存在则跳过
                const parseSchema = safeParse(newDataSchema, saved)
                if (parseSchema.success) {
                    value = parseSchema.output.state;

                } else {
                    console.error("hydration: failed to parse schema: ", key, parseSchema.issues);
                }
            }
        } catch (error) {
            console.error("migration_and_hydration: failed", error);
        } finally {
            hydrated = true;
            emit();
        }
    };

    void migration_and_hydration();

    const getValue = () => value;
    const getHydrated = () => hydrated;

    const setValue = (next: T) => {
        if (Object.is(value, next)) return;
        if (!hydrated) return;      // 极端一点，必须先水合
        value = next;
        emit();
        void set(key, {state: next, version: 1.0,})
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
        valueSchema,
        dataSchema: newDataSchema,

        getValue,
        setValue: setValue as (value: unknown) => void,
        setMemoryValue: setMemoryValue as (value: unknown) => void,
    });

    return useAtom;
}


export const createMigrationAtom = <T>(
    {
        key, schema, defaultValue, getLegacy
    }: {
        key: string;
        schema: BaseSchema<T, any, any>
        defaultValue: T;

        getLegacy: () => Promise<unknown> | unknown | undefined;
    }
) => {
    const migration = createMigration({key, valueSchema: schema, getLegacy, setCurrent: set})
    return createAtom({key, valueSchema: schema, defaultValue, migration})
}
