import {useEffect, useMemo, useState} from "react";
import {SortableProvider} from "@/vol_apps/tile/dnd/Sortable";
import {cn} from "@/lib/utils.js";

import {useTileLogic} from "../useTileLogic";
import {Tile_component} from "../Tile_component";
import {Tile_context_menu} from "@/vol_apps/tile/tile_context_menu";

export const SortableTiles = () => {
    const Logic = useTileLogic();
    const {displayTiles, handleDragEnd} = Logic;

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
                    <Tile_context_menu
                        // name={tile.meta.name}
                        handleOpenInNewTab={() => Logic.handleOpenInNewTab(tile.id)}
                        handleEdit={() => Logic.handleEdit(tile.id)}
                        handleOpenInCurrentTab={() => Logic.handleOpenInCurrentTab(tile.id)}
                    >
                        <Tile_component
                            {...Logic}
                            link={tile.url}
                            name={tile.meta.name}
                            icon={tile.meta.icon}
                        />
                    </Tile_context_menu>

                </div>
            )
        }));
    }, [displayTiles, Logic, allowFadeIn]);

    return (
        <div className="flex flex-wrap pl-6 pr-1 py-6 gap-7">
            {
                items.length === 0
                    ? (<div className={cn(
                        "flex mx-auto items-center justify-center text-3xl text-muted-foreground h-36",
                        "animate-fade-in-scale")}>{Logic.t("No matched tile")}</div>)
                    : (<SortableProvider items={items} onDragEnd={handleDragEnd}/>)
            }
        </div>
    );
};