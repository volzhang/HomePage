import {blobToString} from "@/vol_apps/tool/isType";
import localforage from "localforage";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";

import defaultIcon from "@/assets/icon.png";

const response = await fetch(defaultIcon);
const blob = await response.blob();
export const defaultIconBase64 = await blobToString(blob);

export type Meta = {
	name: string;
	alt: string;
	icon: string;
	tags: string[];
}

export type Tile = {
	id: number; //必须位移，且尽量等于index
	url: string;
	meta: Meta;
}

type TileStoreState = {
	tiles: Tile[],
	tileUiVisible: boolean,
	tileInEditId: Tile["id"],
}

type TileStoreActions = {
	//基本API
	updateTile: (id: Tile["id"], updates: Partial<Tile>) => void;
	addTile: () => void;
	removeTile: (id: Tile["id"]) => void;
	setTiles: (newTiles: TileStoreState["tiles"]) => void;

	//选择视图
	tilesByTag: (tags: Meta["tags"], mode: "AND" | "ANY") => TileStoreState["tiles"] | undefined;

	//Ui相关
	setTileUiVisible: (value: TileStoreState["tileUiVisible"]) => void;
	setTileInEditId: (value: TileStoreState["tileInEditId"]) => void;
}

const defaultTile = {
	id: 0, url: "", meta: {name: "", alt: "", icon: defaultIconBase64, tags: [],}
};

type TileStore = TileStoreState & TileStoreActions;

export const useTileStore = create<TileStore>()(
	persist(
		(set, get) => ({
			tiles: [defaultTile],
			tileUiVisible: false,
			tileInEditId: 0,
			updateTile: (id, updates) => set((state) => {
				const newTiles = state.tiles.map((tile) => (tile.id === id ? {...tile, ...updates} : tile));
				return {tiles: newTiles};
			}),
			addTile: () => set((state) => {
				const id = state.tiles.length;
				const newTiles = [...state.tiles, {...defaultTile, id}];
				return {tiles: newTiles};
			}),
			//考虑到东西不多，所以小函数也尽量无依赖
			removeTile: (id) => set((state) => {
				let newTiles = state.tiles.filter((tile) => tile.id !== id);
				if (newTiles.length === 0) {
					newTiles = [defaultTile];
				} else {
					newTiles = newTiles.map((tile, index) => ({...tile, id: index}));
				}
				return {tiles: newTiles};
			}),
			setTiles: (newTiles) => set({tiles: newTiles}),
			setTileUiVisible: (tileUiVisible) => set({tileUiVisible}),
			setTileInEditId: (tileInEditId) => set({tileInEditId}),

			tilesByTag: (tags, mode = "ANY") => {
				const tiles = get().tiles;
				if (!tags || tags.length === 0) return tiles;
				return tiles.filter((tile) => {
					if (mode === "AND") {
						return tags.every((tag) => tile.meta.tags.includes(tag));
					} else {
						return tags.some((tag) => tile.meta.tags.includes(tag));
					}
				});
			}
		}),
		{
			name: "tile",
			storage: createJSONStorage(() => localforage),
			//zustand的持久化有个特点，键保留了引号，值保留了引号甚至还有斜杠，内部数据合理trim压缩完全牺牲了可读性。
			//当然，最重要的是，值必须天然支持文本化，所以只能是基本类型。
			//除此之外，没有其他吐槽点。
		}
	)
);