import defaultIcon from "@/assets/icon-100.png";
import {blobToString} from "@/vol_apps/tool/a2b/blobToString";
import {createPersistedStore} from "@/vol_apps/tool/createPersistedStore";

const response = await fetch(defaultIcon);
const blob = await response.blob();
export const defaultIconBase64 = await blobToString(blob);

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
			name: "Right-Click Nearby",
			alt: "Tutorial: Right-click beside the tile to open the context menu",
			icon: defaultIconBase64,
			tags: ["tutorial", "step3"],
		},
	},
	{
		id: 3, url: "https://github.com/volzhang/HomePage",
		meta: {
			name: "Click Me to Link",
			alt: "Tutorial: Click the tile to open link in a new tab",
			icon: defaultIconBase64,
			tags: ["tutorial", "step4"],
		},
	},
];

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
	tilesVisible: boolean,
	tileUiVisible: boolean,
	tileInEditId: Tile["id"],

	//tag系统
	tags: Tag[],
	isBroadMatches: boolean,

	//查看无标签tile
	untaggedChecked:boolean,
}

type TileStoreActions = {
	//基本API
	setTilesVisible: (value: TileStoreState["tilesVisible"]) => void,

	updateTile: (id: Tile["id"], updates: Partial<Tile>) => void;
	removeTile: (id: Tile["id"]) => void;
	setTiles: (newTiles: TileStoreState["tiles"]) => void;

	appendTiles: (newTiles: TileStoreState["tiles"]) => void;

	updateTags: (newTiles:TileStoreState["tiles"]) => void;

	//选择视图
	selectedTags: () => Tag["name"][];
	effectiveTags:() => Tag["name"][];
	hasUntaggedTiles: () => boolean;
	tilesByTag: (mode: "ALL" | "ANY") => TileStoreState["tiles"];

	//查看无标签tile
	setUntaggedChecked: (isChecked:boolean)=>void;
	tilesNoTag: () => TileStoreState["tiles"];

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

}

export type TileStore = TileStoreState & TileStoreActions;

export const useTileStore = createPersistedStore<TileStore>(
	"tile",
	(set, get) => ({
		tiles: TutorialsTiles,
		tilesVisible: true,
		tileInEditId: 0,

		tags: [],
		untaggedChecked:false,
		isBroadMatches: true,

		tileUiVisible: false,
		setTilesVisible: (tilesVisible) => set({tilesVisible}),

		// 所有修改tiles的函数，都植入updateTags
		updateTags: (newTiles)=>set((state)=>{
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

			return {tags:newTags};
		}),

		//Tiles的修改函数，都依赖setTiles
		setTiles: (newTiles) => set((state)=>{
			//处理tags依赖！
			state.updateTags(newTiles);
			return {tiles: newTiles};
		}),

		// 衍生入口
		updateTile: (id, updates) => {
			const newTiles = get().tiles.map((tile) => (tile.id === id ? {...tile, ...updates} : tile));
			get().setTiles(newTiles);
		},

		addTile: () => {
			const id = get().tiles.length;
			const tags = get().selectedTags();
			const newTiles = [...get().tiles, {...defaultTile, id, meta: {...defaultTile.meta, tags: tags}}];
			get().setTiles(newTiles);
		},

		removeTile: (id) =>{
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

			const merged = [...currentTiles, ...appended].map((t, i) => ({ ...t, id: i }));
			store.setTiles(merged); // 自动更新 tags
		},

		// changeTagName: (id, newName) => {},

		setTileUiVisible: (tileUiVisible) => set({tileUiVisible}),
		setTileInEditId: (tileInEditId) => set({tileInEditId}),

		//真实标签
		selectedTags: () => get().tags.filter(tag => tag.checked).map(tag => tag.name),
		//考虑虚拟标签
		effectiveTags:()=>{
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
		setUntaggedChecked:(untaggedChecked)=>set({untaggedChecked}),

		tilesNoTag: () => {
			const tiles = get().tiles;
			return tiles.filter((tile)=> (tile.meta.tags.length === 0))
		},

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

		setIsBroadMatches: (isChecked)=>set({isBroadMatches: isChecked}),

	}),
	{

		// 水和后立即更新tags，不要用useEffect了
		onRehydrateStorage: (_state) => (hydratedState) => {
			// _state 是水合前的状态，
			// hydratedState 是水合后的状态
			if (hydratedState) {
				hydratedState.updateTags(hydratedState.tiles);
			}
		}
	}
);

//zustand的持久化有个特点，键保留了引号，值保留了引号甚至还有斜杠，内部数据合理trim压缩完全牺牲了可读性。
//当然，最重要的是，值必须天然支持文本化，所以只能是基本类型。
//除此之外，没有其他吐槽点。