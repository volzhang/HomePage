import {get, set} from "idb-keyval";
import {createDebouncedSet} from "@/vol_apps/04_utils/createDebouncedSet.ts";

const MIGRATION_FLAGS_KEY = "_migration_flags";

let flags: Record<string, boolean> = {};
let hydrated = false;
let initPromise: Promise<void> | null = null;
const pending: Record<string, ()=>Promise<boolean>> = {};

// 初始化
const initFlags = async () => {
    const stored = await get<Record<string, boolean>>(MIGRATION_FLAGS_KEY);
    flags = stored && typeof stored === "object" ? stored : {};
    hydrated = true
    void runPending()
};

const ensureInit = () => {
    if (!initPromise) initPromise = initFlags();
    return initPromise;
};

void ensureInit();

export const isMigrated = async (key: string): Promise<boolean> => {
    await ensureInit();
    return flags[key] === true;
};

const DebouncedSet = createDebouncedSet(set)
const flushFlags = () => DebouncedSet(MIGRATION_FLAGS_KEY, {...flags})

export const runMigration = async (key:string, migration: () => Promise<boolean>) => {
    if (!hydrated) pending[key] = migration;
    else {
        flags[key] = await migration()
        void flushFlags();
    }
};

export const runPending = async () => {
    const items = Object.entries(pending);
    for (const [key, migration] of items) {
        flags[key] = await migration();
        delete pending[key];
    }
    if (items.length > 0) {
        void flushFlags();   // 批量完成后延迟写入
    }
};