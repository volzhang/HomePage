// import {get, set} from "idb-keyval";
// import {createDebouncedSet} from "@/vol_apps/03_utils/createDebouncedSet.ts";
//
// const MIGRATION_FLAGS_KEY = "_migration_flags";
//
// // type Migration = () => Promise<{ success: boolean; state?: unknown }>
//
// let flags: Record<string, boolean> = {};
// let hydrated = false;
// let initPromise: Promise<void> | null = null;
// const pending: Record<string, {
//     migration: () => Promise<{ success: boolean; state?: unknown }>;
//     resolve: (value: { success: boolean; state?: any }) => void;
// }> = {};
//
// // 初始化
// const initFlags = async () => {
//     const stored = await get<Record<string, boolean>>(MIGRATION_FLAGS_KEY);
//     flags = stored && typeof stored === "object" ? stored : {};
//     hydrated = true
//     void runPending()
// };
//
// const ensureInit = () => {
//     if (!initPromise) initPromise = initFlags();
//     return initPromise;
// };
//
// void ensureInit();
//
// export const isMigrated = async (key: string): Promise<boolean> => {
//     await ensureInit();
//     return flags[key] === true;
// };
//
// const DebouncedSet = createDebouncedSet(set)
// const flushFlags = () => DebouncedSet(MIGRATION_FLAGS_KEY, {...flags})
//
// export const runMigration = async <T>(
//     key:string,
//     migration: () => Promise<{ success: boolean; state?: T }>
// ) : Promise<{ success: boolean; state?: T }> => {
//
//     if (!hydrated) {
//         // 暂存并返回一个 Promise，等 init 完成后由 runPending 解决
//         return new Promise(resolve => {
//             pending[key] = { migration, resolve };
//         });
//     }
//
//     return migration().then(result => {
//         flags[key] = result.success;
//         void flushFlags();
//         return result;
//     });
//
// };
//
// const runPending = async () => {
//     const items = Object.entries(pending);
//     for (const [key, { migration, resolve }] of items) {
//         try {
//             const result = await migration();
//             flags[key] = result.success;
//             resolve(result);      // 将结果传回调用者
//         } catch (err) {
//             resolve({ success: false });
//         }
//         delete pending[key];
//     }
//     if (items.length > 0) {
//         void flushFlags();   // 批量完成后延迟写入
//     }
// };