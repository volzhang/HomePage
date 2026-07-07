// tile_signal.ts
import {type Tag, type Tile, TutorialsTiles, type TileUpdate, defaultTile, tutorialTags} from "@/vol_apps/tile/tile_store_types.ts";
import {initStoreState, useSignal, getSignal, storeHub} from "@/vol_apps/04_persist_atoms";

// 初始化 store（已存在）
const TileStore = initStoreState({
    storeName: 'tile',
    fields: {
        tiles: TutorialsTiles as Tile[],
        tilesVisible: true,
        tileUiVisible: false,
        tileInEditId: 0,
        tags: tutorialTags as Tag[],
        untaggedChecked: false,
        isBroadMatches: true,
    }
});

// 辅助函数（与原版一致）
const ensureAtLeastOneTile = (tiles: Tile[]): Tile[] => {
    return tiles.length > 0 ? tiles : [{...defaultTile, id: 0}];
};

export const useTileStore = () => {
    // -------- 获取响应式状态值（用于渲染）--------
    const {tiles} = useSignal(TileStore("tiles"));
    const {tilesVisible} = useSignal(TileStore("tilesVisible"));
    const {tileUiVisible} = useSignal(TileStore("tileUiVisible"));
    const {tileInEditId} = useSignal(TileStore("tileInEditId"));
    const {tags} = useSignal(TileStore("tags"));
    const {untaggedChecked} = useSignal(TileStore("untaggedChecked"));
    const {isBroadMatches} = useSignal(TileStore("isBroadMatches"));

    // -------- 获取信号对象（用于 actions 中读写最新值）--------
    const tilesSig = getSignal(TileStore("tiles"));
    const tilesVisibleSig = getSignal(TileStore("tilesVisible"));
    const tileUiVisibleSig = getSignal(TileStore("tileUiVisible"));
    const tileInEditIdSig = getSignal(TileStore("tileInEditId"));
    const tagsSig = getSignal(TileStore("tags"));
    const untaggedCheckedSig = getSignal(TileStore("untaggedChecked"));
    const isBroadMatchesSig = getSignal(TileStore("isBroadMatches"));

    // -------- 核心更新函数（包含 updateTags 逻辑）--------
    const updateTags = (newTiles?: Tile[]) => {
        const targetTiles = newTiles ?? tilesSig.get();
        const names = [
            ...new Set(
                targetTiles.flatMap(tile => tile.meta.tags || [])
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

    const setTiles = (newTiles: Tile[]) => {
        const safeTiles = ensureAtLeastOneTile(newTiles);
        const currentEditId = tileInEditIdSig.get();
        const nextEditId = safeTiles.some(t => t.id === currentEditId)
            ? currentEditId
            : safeTiles[0]?.id ?? 0;

        tilesSig.set(safeTiles);
        updateTags(safeTiles);      // 同步更新 tags
        tileInEditIdSig.set(nextEditId);
    };

    // -------- 其他 actions（使用信号对象保证最新值）--------
    const updateTile = (id: number, updates: TileUpdate) => {
        const currentTiles = tilesSig.get();
        const newTiles = currentTiles.map((tile) => {
            if (tile.id !== id) return tile;
            const nextMeta = updates.meta
                ? {...tile.meta, ...updates.meta}
                : tile.meta;
            return {...tile, ...updates, meta: nextMeta};
        });
        setTiles(newTiles);
    };

    const removeTile = (id: number) => {
        const currentTiles = tilesSig.get();
        const newTiles = currentTiles.filter(tile => tile.id !== id);
        setTiles(newTiles);
    };

    const appendTiles = (newTiles: Tile[]) => {
        const currentTiles = tilesSig.get();
        const appended = newTiles.filter(
            t => !currentTiles.some(c => c.url === t.url && c.meta.name === t.meta.name)
        );
        if (appended.length === 0) return;

        const startId = currentTiles.length === 0
            ? 0
            : Math.max(...currentTiles.map(t => t.id)) + 1;

        const appendedWithIds = appended.map((tile, index) => ({
            ...tile,
            id: startId + index,
        }));

        const merged = [...currentTiles, ...appendedWithIds];
        setTiles(merged);
    };

    const addTile = (): number => {
        const currentTiles = tilesSig.get();
        const nextId = currentTiles.length === 0
            ? 0
            : Math.max(...currentTiles.map(t => t.id)) + 1;

        const selected = selectedTags(); // 使用当前选中的 tags
        const newTile = {
            ...defaultTile,
            id: nextId,
            meta: {...defaultTile.meta, tags: selected},
        };
        const newTiles = [...currentTiles, newTile];
        setTiles(newTiles);
        return nextId;
    };

    // -------- 计算属性（直接读取最新值）--------
    const selectedTags = (): string[] => {
        return tagsSig.get().filter(tag => tag.checked).map(tag => tag.name);
    };

    const effectiveTags = (): string[] => {
        const selected = selectedTags();
        const showUntagged = untaggedCheckedSig.get();
        return showUntagged ? [...selected, "__UNTAGGED__"] : selected;
    };

    const hasUntaggedTiles = (): boolean => {
        return tilesSig.get().some(tile => tile.meta.tags.length === 0);
    };

    const tilesByTag = (mode: "ALL" | "ANY"): Tile[] => {
        const currentTiles = tilesSig.get();
        const effective = effectiveTags();
        if (effective.length === 0) return currentTiles;

        return currentTiles.filter(tile => {
            const isUntagged = tile.meta.tags.length === 0;
            const matchesAny = effective.some(tag =>
                tag === "__UNTAGGED__" ? isUntagged : tile.meta.tags.includes(tag)
            );
            const matchesAll = effective.every(tag =>
                tag === "__UNTAGGED__" ? isUntagged : tile.meta.tags.includes(tag)
            );
            return mode === "ALL" ? matchesAll : matchesAny;
        });
    };

    // -------- tag 系统 actions（直接使用信号 set）--------
    const setTags = (newTags: Tag[]) => tagsSig.set(newTags);

    const updateTag = (id: number, updates: Partial<Tag>) => {
        const currentTags = tagsSig.get();
        const newTags = currentTags.map(tag =>
            tag.id === id ? {...tag, ...updates} : tag
        );
        tagsSig.set(newTags);
    };

    const toggleTag = (id: number) => {
        const currentTags = tagsSig.get();
        const newTags = currentTags.map(tag =>
            tag.id === id ? {...tag, checked: !tag.checked} : tag
        );
        tagsSig.set(newTags);
    };

    // -------- 新增 actions（2026.3.31 及 5.28）--------
    const deleteTag = (id: number) => {
        const tag = tagsSig.get().find(t => t.id === id);
        if (!tag) return;
        const currentTiles = tilesSig.get();
        const newTiles = currentTiles.map(tile => ({
            ...tile,
            meta: {
                ...tile.meta,
                tags: tile.meta.tags.filter(t => t !== tag.name)
            }
        }));
        setTiles(newTiles);
    };

    const renameTag = (id: number, name: string) => {
        const tag = tagsSig.get().find(t => t.id === id);
        if (!tag) return;
        if (!name.trim()) {
            deleteTag(id);
            return;
        }
        const oldName = tag.name;
        if (oldName === name) return;

        const wasChecked = tag.checked;
        const currentTiles = tilesSig.get();
        const newTiles = currentTiles.map(tile => ({
            ...tile,
            meta: {
                ...tile.meta,
                tags: tile.meta.tags.map(t => t === oldName ? name : t)
            }
        }));
        setTiles(newTiles);

        // 恢复 checked 状态（setTiles 会触发 updateTags 重建 tags）
        const newTag = tagsSig.get().find(t => t.name === name);
        if (newTag && wasChecked) {
            updateTag(newTag.id, {checked: true});
        }
    };

    const deleteTilesWithTag = (id: number) => {
        const tag = tagsSig.get().find(t => t.id === id);
        if (!tag) return;
        const currentTiles = tilesSig.get();
        const newTiles = currentTiles.filter(tile => !tile.meta.tags.includes(tag.name));
        setTiles(newTiles);
    };

    const deleteTilesWithOnlyThisTag = (id: number) => {
        const tag = tagsSig.get().find(t => t.id === id);
        if (!tag) return;
        const currentTiles = tilesSig.get();
        const newTiles = currentTiles.filter(tile => {
            const tags = tile.meta.tags;
            return !(tags.length === 1 && tags[0] === tag.name);
        });
        setTiles(newTiles);
    };

    const deleteUntaggedTiles = () => {
        const currentTiles = tilesSig.get();
        const newTiles = currentTiles.filter(tile => tile.meta.tags.length > 0);
        setTiles(newTiles);
    };

    const checkOnlyThisTag = (id: number) => {
        const currentTags = tagsSig.get();
        const newTags = currentTags.map(tag => ({
            ...tag,
            checked: tag.id === id,
        }));
        tagsSig.set(newTags);
        untaggedCheckedSig.set(false);
    };

    const checkOnlyUntagged = () => {
        const currentTags = tagsSig.get();
        const newTags = currentTags.map(tag => ({
            ...tag,
            checked: false,
        }));
        tagsSig.set(newTags);
        untaggedCheckedSig.set(true);
    };

    // -------- 返回完整 store（状态 + actions）--------
    return {
        // 状态（响应式）
        tiles,
        tilesVisible,
        tileUiVisible,
        tileInEditId,
        tags,
        untaggedChecked,
        isBroadMatches,

        // 简单 setter（直接使用信号 set）
        setTilesVisible: (value: boolean) => tilesVisibleSig.set(value),
        setTileUiVisible: (value: boolean) => tileUiVisibleSig.set(value),
        setTileInEditId: (value: number) => tileInEditIdSig.set(value),
        setUntaggedChecked: (value: boolean) => untaggedCheckedSig.set(value),
        setIsBroadMatches: (value: boolean) => isBroadMatchesSig.set(value),

        // 核心 actions
        setTiles,          // 自定义（含 updateTags 逻辑）
        updateTile,
        removeTile,
        appendTiles,
        addTile,
        updateTags,        // 暴露 updateTags

        // 计算属性
        selectedTags,
        effectiveTags,
        hasUntaggedTiles,
        tilesByTag,

        // tag 系统
        setTags,
        updateTag,
        toggleTag,
        deleteTag,
        renameTag,
        deleteTilesWithTag,
        deleteTilesWithOnlyThisTag,
        deleteUntaggedTiles,
        checkOnlyThisTag,
        checkOnlyUntagged,

        // 全局水合标志
        hydrated: storeHub.getStore("tile").useStoreHydrated()
    };
};