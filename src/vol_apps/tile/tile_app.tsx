// 统一包装
import {ContextMenuComponent} from "@/vol_apps/cMenu/cMenu";
import {TagComponent} from "@/vol_apps/tag/tag";
import {SortableTiles} from "@/vol_apps/tile/tile";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {TileUi} from "@/vol_apps/tile/tile_ui";

export const TileApp = ()=>{
	const {_hydrated, tilesVisible} = useTileStore();

	return(
		<>
			{_hydrated && tilesVisible
				? <>
					<TagComponent/>
					<ContextMenuComponent children={
						<SortableTiles/>
					}/>
					<TileUi/>
				</>
				: null
			}
		</>
	)
}