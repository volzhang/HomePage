import {useTileStore} from "@/vol_apps/tile/tile_store";
import {SortableTiles} from "./dnd/dndProvider";
import {TileComponent} from "@/vol_apps/tile/tile_component.js";
import type {Tile} from "@/vol_apps/tile/tile_store_types.js";

export const SortableTilesWrapper = ({showTiles}: { showTiles?: Tile[] }) => {
    const {setTileInEditId, setTileUiVisible} = useTileStore();

    const handleRightClick = (tileId: number) => {
        setTileInEditId(tileId);
        setTileUiVisible(true);
    };

    return (
        <SortableTiles
            showTiles={showTiles}
            TileComponent={TileComponent}
            onRightClick={handleRightClick}
        />
    );
};

// 保持向后兼容的导出
export {SortableTilesWrapper as SortableTiles};
