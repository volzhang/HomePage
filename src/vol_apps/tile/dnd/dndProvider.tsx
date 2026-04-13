import {useTileStore} from "@/vol_apps/tile/tile_store";
import {type ComponentType, useEffect, useMemo, useState} from "react";
import {SortableProvider} from "@/vol_apps/tile/dnd/Sortable";
import {isSortable} from "@dnd-kit/react/sortable";
import {cn} from "@/lib/utils.js";
import {useTranslation} from "react-i18next";
import {type TileProps} from "@/vol_apps/tile/tile_component.js";
import type {Tile} from "@/vol_apps/tile/tile_store_types.js";

export interface SortableTilesProps {
    showTiles?: Tile[];
    TileComponent: ComponentType<TileProps>;
    onRightClick?: (tileId: number) => void;
}

export const SortableTiles = ({
                                  showTiles,
                                  TileComponent,
                                  onRightClick,
                              }: SortableTilesProps) => {

    const {t} = useTranslation("tile")

    const {tiles, setTiles, tilesByTag, isBroadMatches} = useTileStore();

    const displayTiles = showTiles ?? tilesByTag(isBroadMatches ? "ANY" : "ALL")!

    // 缓存当前视图 id 顺序，方便找到左邻居
    const currentIdOrder = useMemo(() => displayTiles.map(t => t.id), [displayTiles]);

    const handleDragEnd = (event: any) => {
        const {operation, canceled} = event;
        if (canceled || !operation?.source) return;

        const {source} = operation;
        if (!isSortable(source)) return;

        const draggedId = source.id;               // 被拖拽 tile 的 id
        const toIndex = source.sortable.index;    // 目标视图位置

        // 左邻居 id：如果拖到最前面就是 null
        const filteredMap = currentIdOrder.filter(id => id !== draggedId);
        const neighborId = toIndex > 0 ? filteredMap[toIndex - 1] : null;

        // 复制 tiles，保证新数组
        const newTiles = [...tiles];

        // 删除被拖拽 tile
        const removeIndex = newTiles.findIndex(t => t.id === draggedId);
        if (removeIndex === -1) return;
        const [removed] = newTiles.splice(removeIndex, 1);

        // 决定插入位置
        let insertIndex = 0;
        if (neighborId !== null) {
            const idx = newTiles.findIndex(t => t.id === neighborId);
            insertIndex = idx !== -1 ? idx + 1 : newTiles.length;
        }

        // 插入
        newTiles.splice(insertIndex, 0, removed);

        // 更新 store
        setTiles(newTiles);
    };

    // 动画相关
    const currentDisplayIds = useMemo(
        () => displayTiles.map(tile => tile.id).sort((a, b) => a - b).join(","),
        [displayTiles],
    );
    const [allowFadeIn, setAllowFadeIn] = useState(true);
    useEffect(() => {
        setAllowFadeIn(true);
        const timer = setTimeout(() => {
            setAllowFadeIn(false);
        }, 800);
        return () => clearTimeout(timer);
    }, [currentDisplayIds]);

    const items = useMemo(() => {
        return displayTiles.map((tile, index) => ({
            id: tile.id,
            index,
            content: (
                <div className={cn({"animate-fade-in-scale": allowFadeIn})}>
                    <TileComponent
                        tile={tile}
                        onRightClick={() => {
                            onRightClick?.(tile.id);
                        }}
                    />
                </div>
            )
        }));
    }, [displayTiles, TileComponent, onRightClick, allowFadeIn]);


    return (
        <div className="flex flex-wrap px-6 py-6 gap-7">
            {

                items.length === 0
                    ? (<div className={cn(
                        "flex mx-auto items-center justify-center text-3xl text-muted-foreground h-36",
                        "animate-fade-in-scale")}>{t("No matched tile")}</div>)
                    : (<SortableProvider items={items} onDragEnd={handleDragEnd}/>)
            }
        </div>
    );
};