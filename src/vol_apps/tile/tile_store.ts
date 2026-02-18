import defaultIcon from "@/assets/icon.png";
import {blobToString} from "@/vol_apps/tool/isType";
import localforage from "localforage";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";

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
	id: number; //必须唯一，且尽量等于index
	url: string;
	meta: Meta;
}

export type Tag = {
	id: number; //唯一
	name: string;
	checked: boolean;
}

type TileStoreState = {
	//基本
	tiles: Tile[],
	tileUiVisible: boolean,
	tileInEditId: Tile["id"],

	//tag系统
	tags: Tag[];
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

	//进阶API
	// 自动填充 tags，后续根据剪切板文本，如果是合法的url自动补全URL和name
	addTile_auto: (tags: string[]) => void;

	//tag系统
	setTags: (tags: TileStoreState["tags"]) => void;
	updateTag: (id: Tag["id"], updates: Partial<Tag>) => void;
	toggleTag: (id: Tag["id"]) => void;

	allTags: () => Tag["name"][];
	selectedTags: () => Tag["name"][];
}

const defaultTile = {
	id: 0, url: "", meta: {name: "", alt: "", icon: defaultIconBase64, tags: [],}
};

const TutorialsTiles: Tile[] = [
	{
		id: 0, url: "",
		meta: {
			name: "Long Press to Drag",
			alt: "Tutorial: Long press and drag to rearrange tiles",
			icon: defaultIconBase64,
			tags: ["tutorial", "step1"],
		},
	},
	{
		id: 1, url: "",
		meta: {
			name: "Right-Click Me",
			alt: "Tutorial: Right-click (desktop) to edit tile",
			icon: defaultIconBase64,
			tags: ["tutorial", "step2"],
		},
	},
	{
		id: 2, url: "",
		meta: {
			name: "Right-Click Beside",
			alt: "Tutorial: Click beside the tile to open the context menu",
			icon: defaultIconBase64,
			tags: ["tutorial", "step3"],
		},
	},
	{
		id: 3, url: "https://github.com/volzhang/HomePage",
		meta: {
			name: "Click Me to Open",
			alt: "Tutorial: Click the tile to open link in a new tab",
			icon: defaultIconBase64,
			tags: ["tutorial", "step4"],
		},
	},
];

type TileStore = TileStoreState & TileStoreActions;

export const useTileStore = create<TileStore>()(
	persist(
		(set, get) => ({
			tiles: TutorialsTiles,
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
			},

			addTile_auto: (tags) => set((state) => {
				const id = state.tiles.length;
				const newTiles = [...state.tiles, {...defaultTile, id, meta: {...defaultTile.meta, tags: tags}}];
				return {tiles: newTiles};
			}),

			tags: [],

			setTags: (tags) => set({tags}),
			updateTag: (id, updates) => set((state) => {
				const tags = state.tags.map((tag) => tag.id === id ? {...tag, ...updates} : tag);
				return {tags};
			}),
			toggleTag: (id) => set((state) => {
				const tags = state.tags.map((tag) => tag.id === id ? {...tag, checked: !tag.checked} : tag);
				return {tags};
			}),

			allTags: () => get().tags.map((tag) => tag.name),
			selectedTags: () => {
				const tags = get().tags.filter((tag) => tag.checked) || [];
				return tags.map((tag) => tag.name);
			},

		}),
		{
			name: "tile",
			storage: createJSONStorage(() => localforage)

			//zustand的持久化有个特点，键保留了引号，值保留了引号甚至还有斜杠，内部数据合理trim压缩完全牺牲了可读性。
			//当然，最重要的是，值必须天然支持文本化，所以只能是基本类型。
			//除此之外，没有其他吐槽点。
		}
	)
);