import localforage from "localforage";
import tiles_v2 from "./tiles_1768993791262.json";

export const backup_trans = async (): Promise<void> => {

	const tiles = tiles_v2.map((tile) => (
			{
				id: tile.id,
				url: tile.href,
				meta: {
					name: tile.name,
					alt: tile.alt,
					icon: tile.img.data,
					tags: [],
				}
			}
		)
	);

	const persisted = {
		state: {
			tiles: tiles,
			tileUiVisible: false,
			tileInEditId: 0,
		},
		version: 0,
	};

	const jsonString = JSON.stringify(persisted);
	await localforage.setItem("tile", jsonString);

	// await downloadAsJsonFile({tiles:tiles});
};