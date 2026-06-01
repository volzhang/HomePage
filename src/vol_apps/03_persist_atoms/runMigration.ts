import { get, set } from "idb-keyval";

const MIGRATION_FLAGS_KEY = "_migration_flags";
let flags: Record<string, boolean> = {};
let hydratePromise: Promise<void> | null = null;
const running = new Map<string, Promise<void>>();

// 追踪还有多少个迁移任务正在执行
let activeTaskCount = 0;
let flushPromise: Promise<void> | null = null;

// --------------------
// 水合
// --------------------
const ensureHydrated = async () => {
    if (hydratePromise) return hydratePromise;
    hydratePromise = (async () => {
        const stored = await get<Record<string, boolean>>(MIGRATION_FLAGS_KEY);
        flags = stored && typeof stored === "object" ? stored : {};
    })();
    return hydratePromise;
};

// --------------------
// 写入 IDB
// --------------------
const flushFlags = async () => {
    // 如果已经有写入操作在进行，直接返回该 Promise，避免重复写入
    if (flushPromise) return flushPromise;
    flushPromise = (async () => {
        await set(MIGRATION_FLAGS_KEY, { ...flags });
        flushPromise = null;
    })();
    return flushPromise;
};

// --------------------
// 迁移入口
// --------------------
export const runMigration = async (
    key: string,
    migration: () => Promise<void> | void,
) => {
    await ensureHydrated();

    const existing = running.get(key);
    if (existing) return existing;

    const task = (async () => {
        // 增加活跃任务计数
        activeTaskCount++;

        try {
            if (flags[key]) return; // 已迁移过，直接返回

            await migration();
            flags[key] = true;      // 更新内存中的标志
        } finally {
            activeTaskCount--;

            // 如果所有任务都已完成，且 flags 有更新，则一次性写入 IDB
            if (activeTaskCount === 0) {
                await flushFlags();
            }
        }
    })();

    running.set(key, task);

    try {
        await task;
    } finally {
        running.delete(key);
    }
};