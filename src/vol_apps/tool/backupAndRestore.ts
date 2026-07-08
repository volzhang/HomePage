import {downloadAsJsonFile, timeStamp} from "@/vol_apps/tool/action/download";
import {isPlainObject} from "@/vol_apps/tool/isType/isPlainObject";
import {getSignal, storeHub} from "@/vol_apps/04_persist_atoms";
import {VERSION} from "@/main.tsx";
import {tileStore} from "@/vol_apps/tile/tile_signal.ts";
import type {Tile} from "@/vol_apps/tile/tile_store_types.ts";

// ------------------ 辅助：处理 tile2 的追加合并 ------------------

/**
 * 合并 tiles 的逻辑，与 useTileStore2 中的 appendTiles 一致。
 * 使用信号对象直接操作，避免依赖 React hook。
 */

const appendTilesToTileStore = (newTiles: Tile[]) => {
    // 获取 tiles 信号
    const tilesSig = getSignal(tileStore("tiles"))
    const current = tilesSig.get();

    // 去重：避免 url 和 name 都相同的重复项
    const appended = newTiles.filter(
        t => !current.some(c => c.url === t.url && c.meta.name === t.meta.name)
    );
    if (appended.length === 0) return;

    // 计算新的 id
    const startId = current.length === 0 ? 0 : Math.max(...current.map(t => t.id)) + 1;
    const appendedWithIds = appended.map((tile, index) => ({
        ...tile,
        id: startId + index,
    }));

    const merged = [...current, ...appendedWithIds];
    tilesSig.set(merged);

    // 更新 tags（类似 setTiles 内部调用的 updateTags）
    // 因为 tile store 的 updateTags 逻辑是独立的，我们在此手动执行

    const tagsSig = getSignal(tileStore("tags"))

    const names = [
        ...new Set(
            merged.flatMap(tile => tile.meta.tags || [])
        )
    ].filter(Boolean);
    const oldMap = new Map(
        tagsSig.get().map(tag => [tag.name, tag.checked])
    );
    const newTags = names.map((name, index) => ({
        id: index,
        name,
        checked: oldMap.get(name) ?? false
    }));
    tagsSig.set(newTags);
};


// ------------------ 恢复 ------------------
export const persistedStoresRestore = async (file: File, mergeTileTiles: boolean = false): Promise<void> => {
    const text = await file.text();
    let backupData: any;

    try {
        backupData = JSON.parse(text);
    } catch (e) {
        console.error("Invalid JSON backup file", e);
        return;
    }

    if (!isPlainObject(backupData)) {
        console.error("Backup data is not an object");
        return;
    }

    // 合并storeHub 数据
    // 没有办法验证数据格式，有一定风险
    Object.entries(storeHub.stores).forEach(([storeName, store]) => {
        // find storeName
        if (!(storeName in backupData)) return
        const state = backupData[storeName]?.state;
        if (storeName === "tile" && mergeTileTiles && Array.isArray(state.tiles)) {
            appendTilesToTileStore(state.tiles);
        } else {
            store.setState(state)
        }
    })

};

// ------------------ 备份 ------------------

export const getPersistedStoresBackupData = (): Record<string, any> => {
    // const registered = new Map(persistedStores);
    const result: Record<string, any> = {};

    // 合并 storeHub
    Object.entries(storeHub.getStores()).forEach(([storeName, store]) => {
        result[storeName] = {
            state: store.getState(),
            version: 1.0
        }
    })

    return result;
};

export const persistedStoresBackup = async (): Promise<void> => {
    const result = getPersistedStoresBackupData();
    const filename = `DB[${VERSION}]${timeStamp()}.json`;
    await downloadAsJsonFile(result, filename);
};