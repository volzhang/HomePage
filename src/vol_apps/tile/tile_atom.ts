import default_img from "@/assets/icon.png";
import {createAtom, refreshAtoms} from "@/vol_apps/atomStorage/atomStorage";
import {type TagType, useTagStore} from "@/vol_apps/tag/tag_atom";
import {useAtom} from "jotai";

export type TileType = {
	id: number; //必须唯一
	name: string;
	href: string;
	meta: { //这里用于扩展功能的信息, 为什么加这个meta，因为存档json可以折叠2级信息，方便人类阅读
		alt: string;
		icon: Blob,
		tags?: string[],
	};
}

const response = await fetch(default_img);
const defaultIconBlob = await response.blob();

// 默认 tile
const createDefaultTile = async (
	id: number,
	name: string = "",
	href: string = "",
	tags: string[] = []
): Promise<TileType> => {
	const icon = defaultIconBlob;
	return {
		id, name, href,
		meta: {alt: name, icon, tags,},
	};
};

const defaultTiles: TileType[] = await Promise.all([createDefaultTile(0),]);

const atom_tiles = await createAtom<TileType[]>("atom_tiles", defaultTiles);

export const useTileStore = () => {
	const [tiles, setTiles] = useAtom(atom_tiles);

	const addTile = async () => {
		const newTile = await createDefaultTile(tiles.length);
		// setTiles((prevTiles:TileType[]) => [...prevTiles, newTile]);
		await setTiles([...tiles, newTile]);
		await refreshAtoms()
	};

	const removeTile = async (id: number) => {
		let newTiles:TileType[] = tiles.filter((tile: TileType) => tile.id !== id);
		if (newTiles.length === 0) {
			const newDefaultTile = await createDefaultTile(0);
			newTiles = [newDefaultTile];
		}
		reorderTiles(newTiles);
	};

	const updateTile = (id: number, updates: Partial<TileType>) => {
		const newTiles = tiles.map((tile: TileType) => tile.id === id ? {...tile, ...updates} : tile);
		setTiles(newTiles);
	};

	// 设置并排序（只在必要时使用，比如removeTile）
	const reorderTiles = (newTiles: TileType[]) => {
		const normalizedTiles = newTiles.map((tile, index) => ({
			...tile,
			id: index,
		}));
		setTiles(normalizedTiles);
	};

	// 返回一个安全接口，根据atom_tag 的selectTags 过滤并返回tile
	// 后续尝试直接从localforage中获取最新值，更安全，避免耦合。
	// 如果atom_tag不存在（当前不支持吧）或为空（这个支持），则返回tiles
	const {selectTags} = useTagStore();
	const tilesSelectedByTag = () => {
		const selectedNames = selectTags.map((tag: TagType) => tag.name);
		if (selectedNames.length === 0) return tiles;
		const selectedTags = tiles.filter((tile: TileType) => {
			return tile.meta?.tags?.some(item => selectedNames.includes(item));
		});
		if (selectedTags.length === 0) return tiles;
		return selectedTags;
	};

	return (
		{
			tiles, setTiles,
			addTile, removeTile, updateTile, reorderTiles,
			tilesSelectedByTag,
		} as const
	);
};

