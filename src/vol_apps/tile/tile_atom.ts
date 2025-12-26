import default_img from "@/assets/icon.png";
import {createAtom} from "@/vol_apps/atomStorage/atomStorage";
import type {ValidType} from "@/vol_apps/tool/isType";
import {useAtom} from "jotai";

type TileType = {
	id: number; //必须唯一
	name: string;
	href: string;
	meta: ValidType; //这里用于扩展功能的信息
}

export const defaultTile: TileType = {
	id: 0,
	name: "",
	href: "https://bilibili.com",
	meta: {
		alt: "BiliBili",
		icon: default_img,
	},
};

// 测试数据，不用在意
const defaultTiles: TileType[] = [
	{...defaultTile, id: 0, name: "0"},
	{...defaultTile, id: 1, name: "1"},
	{...defaultTile, id: 2, name: "2"},
	{...defaultTile, id: 3, name: "3"},
	{...defaultTile, id: 4, name: "4"},
	{...defaultTile, id: 5, name: "5"},
	{...defaultTile, id: 6, name: "6"},
];

const atom_tiles = await createAtom<TileType[]>("atom_tiles", defaultTiles);

export const useTileStore = () => {
	const [tiles, setTiles] = useAtom(atom_tiles);

	const addTile = () => {
		const newTiles = [...tiles, {...defaultTile, id: tiles.length}];
		setTiles(newTiles);
	};

	const removeTile = (id: number) => {
		const newTiles = tiles.filter((tile: TileType) => tile.id !== id);
		if (newTiles.length === 0) {addTile()}
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

	return (
		{tiles, setTiles, addTile, removeTile, updateTile, reorderTiles} as const
	);
};

