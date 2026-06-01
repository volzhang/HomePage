import {useMemo, useSyncExternalStore} from "react";
import {get, set} from "idb-keyval";
import {safeParse, type BaseSchema,} from "valibot";
import * as v from "valibot"
import {runMigration} from "@/vol_apps/03_persist_atoms/runMigration.ts";

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

// type State = Record<string, unknown>;
//
// type Data = {
//     state: State
//     version: number
// }

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
}) => {
    return async () => {
        const raw = await getLegacy();
        if (raw == null) return;

        let data: unknown;

        if (typeof raw === "string") {
            try {
                data = JSON.parse(raw);
            } catch (e) {
                console.warn("Migration: failed to JSON parsee", key, e);
                return;
            }
        } else if (typeof raw === "object" && raw !== null) {
            data = raw;
        } else {
            console.warn("Migration: failed to JSON parsee", key)
            return;
        }

        const dataSchema = getDataSchema(stateSchema)
        const parseData = safeParse(dataSchema, data);
        if (!parseData.success) {
            console.warn("Migration: failed to parse data", key, parseData.issues);
            return;
        }

        const state = parseData.output.state;
        const parseState = safeParse(stateSchema, state);

        if (!parseState.success) {
            console.error("Migration: failed to parse state", key, parseState.issues);
            return;
        }

        await set(key, buildData(state));
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
    migration?: () => Promise<void> | void;
}) => {

    const dataSchema = getDataSchema(stateSchema);
    let state: T = initState;
    let hydrated = false;

    const listeners = new Set<Listener>();
    const emit = () => listeners.forEach(fn => fn());

    const migration_and_hydration = async () => {
        try {
            // 1.迁移
            if (migration) await runMigration(key, migration);

            // 2.水合
            const saved = await get(key);
            if (saved !== undefined) {     // 如果不存在则跳过
                const parseSchema = safeParse(dataSchema, saved)
                if (parseSchema.success) {
                    state = parseSchema.output.state;
                } else {
                    console.error("hydration: failed to parse state", key, parseSchema.issues);
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

    const getValue = (): T => state;
    const getHydrated = () => hydrated;

    const setValue = (next: T) => {
        if (Object.is(state, next)) return;
        if (!hydrated) return;      // 极端一点，必须先水合
        state = next;
        emit();
        void set(key, buildData(state));
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
    const migration = createMigration<T>({key, stateSchema, getLegacy,
    });
    return createAtom<T>({key, stateSchema, initState, migration});
};
