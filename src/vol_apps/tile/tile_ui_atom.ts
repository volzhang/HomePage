import {createAtom} from "@/vol_apps/atomStorage/atomStorage";
import {useAtom} from "jotai";

const atom_tile_ui_visible = await createAtom<boolean>("atom_tile_ui_visible", false);
const atom_tile_ui_inEdit = await createAtom<number>("atom_tile_ui_inEdit", 0);

export const useTileUiStore = () => {
	const [tileUiVisible, setTileUiVisible] = useAtom(atom_tile_ui_visible);
	const [tileUiInEdit, setTileUiInEdit] = useAtom(atom_tile_ui_inEdit);
	return {
		tileUiVisible, setTileUiVisible,
		tileUiInEdit, setTileUiInEdit
	} as const;
};