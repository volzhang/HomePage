import {useMemo, useSyncExternalStore} from "react";
import {get, set} from "idb-keyval";
import {safeParse, type BaseSchema,} from "valibot";
import * as v from "valibot"
import {runMigration, isMigrated} from "@/vol_apps/03_persist_atoms/runMigration";
import {createDebouncedSet} from "@/vol_apps/04_utils/createDebouncedSet.ts";

type AtomEntry = {
    key: string;
    stateSchema: BaseSchema<any, any, any>;
    dataSchema: BaseSchema<any, any, any>;

    getValue: () => unknown;
    setValue: (value: unknown) => void;
    setMemoryValue: (value: unknown) => void;
};

type Listener = () => void;

export const atoms = new Map<string, AtomEntry>();

const getDataSchema = <T>(schema: BaseSchema<T, any, any>) => {
    return v.object({state: schema, version: v.number()});
}

const buildData = <T>(state: T) => {
    return {state, version: 1.0 as const};
}

export const createMigration = <T>({
                                       key,
                                       stateSchema,
                                       getLegacy,
                                   }: {
    key: string;
    stateSchema: BaseSchema<T, any, any>;
    getLegacy: () => Promise<unknown> | unknown | undefined;
}): () => Promise<boolean> => {
    return async (): Promise<boolean> => {

        const raw = await getLegacy();
        if (raw == null) return true;

        let data: unknown;
        if (typeof raw === "string") {
            try {
                data = JSON.parse(raw);
            } catch (e) {
                console.warn("Migration: failed to JSON parsee", key, e);
                return false;
            }
        } else if (typeof raw === "object" && raw !== null) {
            data = raw;
        } else {
            console.warn("Migration: failed to JSON parsee", key)
            return false;
        }

        const dataSchema = getDataSchema(stateSchema)
        const parseData = safeParse(dataSchema, data);
        if (!parseData.success) {
            console.warn("Migration: failed to parse data", key, parseData.issues);
            return false;
        }

        const state = parseData.output.state;
        const parseState = safeParse(stateSchema, state);

        if (!parseState.success) {
            console.error("Migration: failed to parse state", key, parseState.issues);
            return false;
        }

        const writeIDB = createDebouncedSet(set)
        try {
            await writeIDB(key, buildData(state));
            return true;
        } catch (error) {
            console.error("Migration: failed to save", key, error);
            return false;
        }
    };
};

export const createAtom = <T>({
                                  key,
                                  stateSchema,
                                  initState,
                                  migration,
                              }: {
    key: string;
    stateSchema: BaseSchema<T, any, any>;
    initState: T;
    migration?: () => Promise<boolean>;
}) => {

    const dataSchema = getDataSchema(stateSchema);
    let state: T = initState;
    let hydrated = false;

    const listeners = new Set<Listener>();
    const emit = () => listeners.forEach(fn => fn());

    // 异步水合
    const doHydration = async () => {
        try {
            const saved = await get(key);
            if (saved?.state !== undefined) {
                // 不做验证(更快)，注释的是验证版本
                state = saved.state;
                // const parseSchema = safeParse(dataSchema, saved)
                //     if (parseSchema.success) {
                //         state = parseSchema.output.state;
                //     } else {
                //         console.error("hydration: failed to parse state", key, parseSchema.issues);
                //     }
            }
        } catch (error) {
            console.error("hydration failed", key, error);
        } finally {
            hydrated = true;
            emit();
        }
    };

    // 异步迁移
    const doMigration = async () => {
        if (migration && !(await isMigrated(key))) void runMigration(key, migration);
    };

    // 启动水合和迁移，都不阻塞，实测最快，缺点是，如果migration实际发生并完成时，闪屏一次，
    void doHydration();
    void doMigration();

    const getValue = (): T => state;
    const getHydrated = () => hydrated;

    const writeIDB = createDebouncedSet(set)

    const setValue = (next: T) => {
        if (Object.is(state, next)) return;
        if (!hydrated) return;      // 极端一点，必须先水合
        state = next;
        emit();
        void writeIDB(key, buildData(state));
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
        if (Object.is(state, next)) return;
        state = next;
        emit();
    };

    atoms.set(key, {
        key,
        stateSchema,
        dataSchema,
        getValue,
        setValue: setValue as (value: unknown) => void,
        setMemoryValue: setMemoryValue as (value: unknown) => void,
    });

    return useAtom;
}


export const createMigrationAtom = <T>({
                                           key,
                                           stateSchema,
                                           initState,
                                           getLegacy,
                                       }: {
    key: string;
    stateSchema: BaseSchema<T, any, any>;
    initState: T;
    getLegacy: () => Promise<unknown> | unknown | undefined;
}) => {
    const migration = createMigration<T>({key, stateSchema, getLegacy});
    return createAtom<T>({key, stateSchema, initState, migration});
};
