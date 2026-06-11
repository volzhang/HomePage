import {useTileStore, useTileStoreBase} from "@/vol_apps/tile/tile_store";
import {useStoreHydrated} from "@/vol_apps/tool/useStoreHydrated";
// import {FaviconVemetricProvider} from "@/vol_apps/tanStackQuery/Api_FaviconVemetric";
import {TagComponent} from "@/vol_apps/tag/TagBar";
import {ScrollAreaForTiles} from "./ScrollAreaForTiles";
import {GlobalContextMenu} from "@/vol_apps/cMenu/globalContextMenu";
import {SortableTiles} from "@/vol_apps/tile/dnd/dndProvider";
import {Ui_inEdit_menu} from "@/vol_apps/tile/tile_ui_inEdit";
import {UiContextMenu} from "@/vol_apps/tile/tile_ui_contexmenu";

export const Tile_app = () => {

    const {tilesVisible} = useTileStore();
    const hydrated = useStoreHydrated(useTileStoreBase)

    return (
        <>
            {hydrated && tilesVisible
                ? <>
                    {/* 标签 */}
                    <TagComponent/>
                    {/* 瓷砖墙 */}
                    <ScrollAreaForTiles>
                        <GlobalContextMenu>
                            <SortableTiles/>
                        </GlobalContextMenu>
                    </ScrollAreaForTiles>
                    {/* 编辑模态 */}
                    <UiContextMenu/>
                    <Ui_inEdit_menu/>
                </>
                : null
            }
        </>

    )
}