// // 统一包装
// import {ScrollAreaForTiles} from "@/vol_apps/tile/scrollAreaForTiles.js";
// import {TagComponent} from "@/vol_apps/tag/tag";
// import {SortableTiles} from "@/vol_apps/tile/tile";
// import {useTileStore, useTileStoreBase} from "@/vol_apps/tile/tile_store";
// // import {TileUi} from "@/vol_apps/tile/tile_ui";
// import {FaviconVemetricProvider} from "@/vol_apps/tanStackQuery/Api_FaviconVemetric";
// import {useStoreHydrated} from "@/vol_apps/tool/useStoreHydrated";
// import {GlobalContextMenu} from "@/vol_apps/cMenu/globalContextMenu";
// import {Ui_inEdit_menu} from "@/vol_apps/tile/tile_ui_inEdit/tile_ui_inEdit";
//
// export const TileApp = () => {
//     const {tilesVisible} = useTileStore();
//     const hydrated = useStoreHydrated(useTileStoreBase)
//
//     return (
//         <>
//             <FaviconVemetricProvider>
//                 {hydrated && tilesVisible
//                     ? <>
//                         <TagComponent/>
//                         <ScrollAreaForTiles>
//                             <GlobalContextMenu>
//                                 <SortableTiles/>
//                             </GlobalContextMenu>
//                         </ScrollAreaForTiles>
//                         <Ui_inEdit_menu />
//                     </>
//                     : null
//                 }
//             </FaviconVemetricProvider>
//
//         </>
//     )
// }