import {createPersistedStore, LatestStoreVersion} from "@/vol_apps/tool/createPersistedStore";
import {
    defaultTile, TutorialsTiles,
    type Tag, type Tile, type TileUpdate,
} from "@/vol_apps/tile/tile_store_types.js";

type TileStoreState = {
    //基本
    tiles: Tile[],
    tilesVisible: boolean,
    tileUiVisible: boolean,
    tileInEditId: Tile["id"],

    //tag系统
    tags: Tag[],
    isBroadMatches: boolean,

    //查看无标签tile
    untaggedChecked: boolean,
}

type TileStoreActions = {
    //基本API
    setTilesVisible: (value: TileStoreState["tilesVisible"]) => void,

    updateTile: (id: Tile["id"], updates: TileUpdate) => void;
    removeTile: (id: Tile["id"]) => void;
    setTiles: (newTiles: TileStoreState["tiles"]) => void;

    appendTiles: (newTiles: TileStoreState["tiles"]) => void;

    updateTags: (newTiles: TileStoreState["tiles"]) => void;

    //选择视图
    selectedTags: () => Tag["name"][];
    effectiveTags: () => Tag["name"][];
    hasUntaggedTiles: () => boolean;
    tilesByTag: (mode: "ALL" | "ANY") => TileStoreState["tiles"];

    //查看无标签tile
    setUntaggedChecked: (isChecked: boolean) => void;

    //Ui相关
    setTileUiVisible: (value: TileStoreState["tileUiVisible"]) => void;
    setTileInEditId: (value: TileStoreState["tileInEditId"]) => void;

    //进阶API
    // 自动填充 tags，后续根据剪切板文本，如果是合法的url自动补全URL和name
    addTile: () => void;

    //tag系统
    setTags: (tags: TileStoreState["tags"]) => void;
    updateTag: (id: Tag["id"], updates: Partial<Tag>) => void;
    toggleTag: (id: Tag["id"]) => void;

    setIsBroadMatches: (isBroadMatches: boolean) => void;

    //新增
    deleteTag: (id: Tag["id"]) => void
    renameTag: (id: Tag["id"], name: Tag["name"]) => void
    deleteTilesWithTag: (id: Tag["id"]) => void
    deleteTilesWithOnlyThisTag: (id: Tag["id"]) => void
    deleteUntaggedTiles: () => void
}

export type TileStore = TileStoreState & TileStoreActions;

const INITIAL_STATE = {
    tiles: TutorialsTiles,
    tilesVisible: true,
    tileInEditId: 0,

    tags: [],
    untaggedChecked: false,
    isBroadMatches: true,

    tileUiVisible: false,
}

export const useTileStore = createPersistedStore<TileStore>(
    "tile",
    (set, get) => ({
        ...INITIAL_STATE,

        setTilesVisible: (tilesVisible) => set({tilesVisible}),

        // 所有修改tiles的函数，都植入updateTags
        updateTags: (newTiles) => set((state) => {
            const allUniqueTags = [
                ...new Set(
                    newTiles.flatMap((tile: Tile) => tile.meta.tags || [])
                )
            ].filter((name) => name !== "");
            //上面之所有删除了""，就是因为两种情况，
            //1，不做处理时，input输入string，至少输入一个""
            //2，“tag1 tag2 ”会生成3个元素的数组["tag1","tag2",""], 其中包含一个""
            const newTags = allUniqueTags.map((name, id) => {
                const checked = state.selectedTags().includes(name);
                return {id, name, checked};
            });

            return {tags: newTags};
        }),

        //Tiles的修改函数，都依赖setTiles
        setTiles: (newTiles) => set((state) => {
            //处理tags依赖！
            state.updateTags(newTiles);
            return {tiles: newTiles};
        }),

        // 衍生入口
        updateTile: (id, updates) => {
            const newTiles = get().tiles.map(
                (tile) => {
                    if (tile.id !== id) return tile;
                    const nextMeta = updates.meta
                        ? {...tile.meta, ...updates.meta}
                        : tile.meta;
                    return {...tile, ...updates, meta: nextMeta,};
                }
            );
            get().setTiles(newTiles);
        },

        addTile: () => {
            const id = get().tiles.length;
            const tags = get().selectedTags();
            const newTiles = [...get().tiles, {...defaultTile, id, meta: {...defaultTile.meta, tags: tags}}];
            get().setTiles(newTiles);
        },

        removeTile: (id) => {
            let newTiles = get().tiles.filter((tile) => tile.id !== id);
            if (newTiles.length === 0) {
                newTiles = [defaultTile];
            } else {
                newTiles = newTiles.map((tile, index) => ({...tile, id: index}));
            }
            get().setTiles(newTiles);
        },

        appendTiles: (newTiles: Tile[]) => {
            const store = get();
            const currentTiles = store.tiles;

            const appended = newTiles.filter(
                t => !currentTiles.some(c => c.url === t.url && c.meta.name === t.meta.name)
            );
            if (appended.length === 0) return;

            const merged = [...currentTiles, ...appended].map((t, i) => ({...t, id: i}));
            store.setTiles(merged); // 自动更新 tags
        },

        setTileUiVisible: (tileUiVisible) => set({tileUiVisible}),
        setTileInEditId: (tileInEditId) => set({tileInEditId}),

        //真实标签
        selectedTags: () => get().tags.filter(tag => tag.checked).map(tag => tag.name),
        //考虑虚拟标签
        effectiveTags: () => {
            const selectedRealTags = get().selectedTags()
            const showUntagged = get().untaggedChecked;
            return showUntagged
                ? [...selectedRealTags, "__UNTAGGED__"]
                : selectedRealTags;
        },

        hasUntaggedTiles: () => get().tiles.some(tile => tile.meta.tags.length === 0),

        // 重写这个视图，加入tilesNoTagChecked
        tilesByTag: (mode: "ALL" | "ANY") => {
            const tiles = get().tiles;
            const effectiveTags = get().effectiveTags();
            if (effectiveTags.length === 0) return tiles;

            return tiles.filter(tile => {
                const isUntagged = (tile.meta.tags.length === 0);
                const matchesAny = effectiveTags.some(tag =>
                    tag === "__UNTAGGED__" ? isUntagged : tile.meta.tags.includes(tag)
                );

                const matchesAll = effectiveTags.every(tag =>
                    tag === "__UNTAGGED__" ? isUntagged : tile.meta.tags.includes(tag)
                );

                return mode === "ALL" ? matchesAll : matchesAny;
            });
        },

        //查看无标签tile
        setUntaggedChecked: (untaggedChecked) => set({untaggedChecked}),

        //核心tag函数
        setTags: (tags) => set({tags}),

        //派生修改
        updateTag: (id, updates) => {
            const tags = get().tags.map((tag) => tag.id === id ? {...tag, ...updates} : tag);
            get().setTags(tags);
        },

        toggleTag: (id) => {
            const tags = get().tags.map((tag) => tag.id === id ? {...tag, checked: !tag.checked} : tag);
            get().setTags(tags);
        },

        setIsBroadMatches: (isChecked) => set({isBroadMatches: isChecked}),

        // 2026.3.31 新增
        deleteTag: (id) => {
            const store = get();
            const tagName = store.tags.find(t => t.id === id);
            if (!tagName) return;

            const newTiles = store.tiles.map(tile => ({
                ...tile,
                meta: {
                    ...tile.meta,
                    tags: tile.meta.tags.filter(t => t !== tagName.name)
                }
            }));
            store.setTiles(newTiles); // 会自动刷新 tags
        },

        renameTag: (id, name) => {
            const store = get();
            const tag = store.tags.find(t => t.id === id);
            if (!tag) return;

            const oldName = tag.name;
            if (oldName === name) return;

            const newTiles = store.tiles.map(tile => ({
                ...tile,
                meta: {
                    ...tile.meta,
                    tags: tile.meta.tags.map(t => t === oldName ? name : t)
                }
            }));
            store.setTiles(newTiles);
        },

        deleteTilesWithTag: (id) => {
            const store = get();
            const tag = store.tags.find(t => t.id === id);
            if (!tag) return;

            const name = tag.name;
            const newTiles = store.tiles.filter(tile => (
                !tile.meta.tags.includes(name)
            ));
            store.setTiles(newTiles);
        },

        deleteTilesWithOnlyThisTag: (id) => {
            const store = get();
            const tag = store.tags.find(t => t.id === id);
            if (!tag) return;

            const name = tag.name;
            const newTiles = store.tiles.filter(tile => {
                const tags = tile.meta.tags;
                return !(tags.length === 1 && tags[0] === name);
            });
            store.setTiles(newTiles);
        },

        deleteUntaggedTiles: () => {
            const store = get();
            const newTiles = store.tiles.filter(tile => tile.meta.tags.length > 0);
            store.setTiles(newTiles);
        }
    }),
    {
        // 水和后立即更新tags，不要用useEffect了
        onRehydrateStorage: (_state) => (hydratedState) => {
            // _state 是水合前的状态，
            // hydratedState 是水合后的状态
            if (hydratedState) {
                hydratedState.updateTags(hydratedState.tiles);
            }
        },

        version: LatestStoreVersion,  //清除垃圾KV
        migrate: (persistedState) => {
            if (!persistedState || typeof persistedState !== "object") return {};
            const allowed = new Set(Object.keys(INITIAL_STATE));
            return Object.fromEntries(
                Object.entries(persistedState).filter(([key]) => allowed.has(key))
            );
        },

    }
);