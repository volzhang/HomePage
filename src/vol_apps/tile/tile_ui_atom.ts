import {createAtom} from "@/vol_apps/atomStorage/atomStorage";
import {useAtom} from "jotai";

const atom_tile_ui_visible = await createAtom<boolean>("atom_tile_ui_visible", false);
const atom_tile_ui_inEdit_id = await createAtom<number>("atom_tile_ui_inEdit_id", 0);

export const useTileUiStore = () => {
	const [tileUiVisible, setTileUiVisible] = useAtom(atom_tile_ui_visible);
	const [tileUiInEditId, setTileUiInEditId] = useAtom(atom_tile_ui_inEdit_id);
	return {
		tileUiVisible, setTileUiVisible,
		tileUiInEditId, setTileUiInEditId,
	} as const;
};