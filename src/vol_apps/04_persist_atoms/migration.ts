// migration.ts
import {createStore, get, set} from "idb-keyval";
import { safeParse, object, number, type BaseSchema } from "valibot";
import { createDebouncedSet } from "@/vol_apps/03_utils/createDebouncedSet.ts";
import {EMPTY, storeHub} from "@/vol_apps/04_persist_atoms/signal.ts";
import * as v from "valibot";
import type {StoreName} from "@/vol_apps/04_persist_atoms/types.ts";

// ────────── 迁移标志管理──────────
const MIGRATION_FLAGS_KEY = "_migration_flags";

let flags: Record<string, boolean> = {};
let hydrated = false;
let initPromise: Promise<void> | null = null;
const pending: Record<string, {
    migration: () => Promise<{ success: boolean; state?: any }>;
    resolve: (value: { success: boolean; state?: any }) => void;
}> = {};

const initFlags = async () => {
    const stored = await get<Record<string, boolean>>(MIGRATION_FLAGS_KEY);
    flags = stored && typeof stored === "object" ? stored : {};
    hydrated = true;
    void runPending();
};

const ensureInit = () => {
    if (!initPromise) initPromise = initFlags();
    return initPromise;
};

void ensureInit();

const DebouncedSet = createDebouncedSet(set);
const flushFlags = () => DebouncedSet(MIGRATION_FLAGS_KEY, { ...flags });

const isMigrated = async (key: string): Promise<boolean> => {
    await ensureInit();
    return flags[key] === true;
};

const runMigration = async <T>(
    key: string,
    migration: () => Promise<{ success: boolean; state?: T }>
): Promise<{ success: boolean; state?: T }> => {
    if (!hydrated) {
        return new Promise(resolve => {
            pending[key] = { migration, resolve };
        });
    }

    return migration().then(result => {
        flags[key] = result.success;
        void flushFlags();
        return result;
    });
};

const runPending = async () => {
    const items = Object.entries(pending);
    for (const [key, { migration, resolve }] of items) {
        try {
            const result = await migration();
            flags[key] = result.success;
            resolve(result);
        } catch {
            resolve({ success: false });
        }
        delete pending[key];
    }
    if (items.length > 0) {
        void flushFlags();
    }
};

const getDataSchema = <T>(stateSchema: BaseSchema<T, any, any>) =>
    object({ state: stateSchema, version: number() });

const createStoreMigration = <T extends Record<string, unknown>>({
                                                                     storeName,
                                                                     stateSchema,
                                                                     legacyDb,
                                                                 }: {
    storeName: string;
    stateSchema: BaseSchema<T, any, any>;
    legacyDb: "idb" | "localstorage";
}): (() => Promise<{ success: boolean; state?: T }>) => {
    // 不管怎么样，只迁移一次，必定返回 success:true
    const getLegacy =
        legacyDb === "idb"
            ? () => get(storeName, createStore("localforage", "keyvaluepairs"))
            : () => {
                const raw = localStorage.getItem(storeName);
                return raw ? JSON.parse(raw) : null;
            };

    return async () => {
        try {
            const raw = await getLegacy();
            if (raw == null) return { success: true };

            let data: unknown;
            if (typeof raw === "string") {
                try {
                    data = JSON.parse(raw);
                } catch (e) {
                    console.warn("Migration: JSON parsee failed", storeName, e);
                    return {success: true};
                }
            } else if (typeof raw === "object" && raw !== null) {
                data = raw;
            } else {
                console.warn("Migration: failed to parsee data", storeName)
                return {success: true};
            }

            const dataSchema = getDataSchema(stateSchema);
            const parsedData = safeParse(dataSchema, data);

            if (!parsedData.success) {
                console.warn(`Migration: outer schema mismatch for "${storeName}"`, parsedData.issues);
                return { success: true };
            }

            const state = parsedData.output.state;
            const parsedState = safeParse(stateSchema, state);

            if (!parsedState.success) {
                console.warn(`Migration: state schema mismatch for "${storeName}"`, parsedState.issues);
                return { success: true };
            }

            return { success: true, state: parsedState.output };
        } catch (err) {
            console.error(`Migration: unexpected error for "${storeName}"`, err);
            return { success: true };
        }
    };
};

// ────────── 迁移配置──────────
// const colorStringSchema = v.pipe(v.string(),
//     v.regex(/^#[0-9a-fA-F]{6}$/, '必须是有效的十六进制颜色（如 #ffffff）'))

const colorStringSchema = v.string()

const themeSchema = v.object({theme: v.picklist(['light', 'dark'])})
const languageSchema = v.object({language: v.picklist(['en', 'cn'])})
const searchSchema = v.object({engineInUseId: v.number()})
const searchStyleSchema = v.object({visible: v.boolean()})
const tagStyleSchema = v.object({
    visible: v.boolean(),
    height: v.number(),
    radius: v.number(),
    gap: v.object({x: v.number(), y: v.number(),}),
    backgroundColor: colorStringSchema,
    backgroundOpacity: v.number(),
    textOpacity: v.number(),
    textColor: colorStringSchema,
    textPadding: v.object({x: v.number(), y: v.number(),}),
    fontSize: v.number(),
    fontWeight: v.number(),
    font: v.object({fullName: v.string(), family: v.string(),})
});

const tileStyleSchema = v.object({
    backgroundColor: colorStringSchema,
    backgroundOpacity: v.number(),
    tileSize: v.number(),
    tileRadius: v.number(),
    tileOutlineThickness: v.number(),
    tileOutlineColor: colorStringSchema,
    tileOutlineOpacity: v.number(),
    iconBorderSize: v.number(),
    iconBorderOffset: v.object({x: v.number(), y: v.number()}),
    iconSize: v.number(),
    iconOffset: v.object({x: v.number(), y: v.number()}),
    fontSize: v.number(),
    fontWeight: v.number(),
    font: v.object({fullName: v.string(), family: v.string()}),
    textOffset: v.object({x: v.number(), y: v.number()}),
    textColor: colorStringSchema,
    textOpacity: v.number(),
})


type CONFIGS = {
    storeName:StoreName,
    stateSchema:BaseSchema<any, any, any>,
    legacyDb:"localstorage"|"idb"
}[]

export const MIGRATION_CONFIGS:CONFIGS = [
    { storeName: "theme" as const, stateSchema: themeSchema, legacyDb: "localstorage" as const },
    { storeName: "language" as const, stateSchema: languageSchema, legacyDb: "localstorage" as const },
    { storeName: "search" as const, stateSchema: searchSchema, legacyDb: "idb" as const },
    { storeName: "searchStyle" as const, stateSchema: searchStyleSchema, legacyDb: "idb" as const },
    { storeName: "tagStyle" as const, stateSchema: tagStyleSchema, legacyDb: "idb" as const },
    { storeName: "ts" as const, stateSchema: tileStyleSchema, legacyDb: "idb" as const },
];

void (async function executeMigrations() {
    for (const cfg of MIGRATION_CONFIGS) {
        if (await isMigrated(cfg.storeName)) continue;

        const migrationFn = createStoreMigration(cfg);
        await runMigration(cfg.storeName, async () => {
            const result = await migrationFn();
            if (!result.success || !result.state) return result;
            const storeName = cfg.storeName
            const store = storeHub.getStore(storeName);
            const slots = store.slots;
            const state = result.state

            // console.log(state)
            for (const [field, value] of Object.entries(state)) {

                const existing = slots.find(s => s.fieldName === field);
                if (existing) {
                    const signal = existing.signal;
                    signal.hydrate(value)
                    signal.set(value)
                } else {
                    const free = slots.find(s => s.fieldName === EMPTY);
                    if (!free) continue;
                    free.fieldName = field;
                    free.signal.hydrate(value)
                    free.signal.set(value)
                }
            }
            return result;
        });
    }
})();