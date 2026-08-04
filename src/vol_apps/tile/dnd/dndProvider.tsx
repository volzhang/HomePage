import React, {useEffect, useMemo, useState} from "react";
import {SortableProvider} from "@/vol_apps/tile/dnd/Sortable";
import {cn} from "@/lib/utils.js";

import {useTileLogic} from "../useTileLogic";
import {Tile_component} from "../Tile_component";
import {useTileContextMenuStore} from "@/vol_apps/tile/tile_ui_contexmenu";
import {searchBarValueSignal} from "@/vol_apps/search/search.tsx";
import {useSignal} from "@/vol_apps/04_persist_atoms";
import {searchStore} from "@/vol_apps/search/searchSignal.ts";
import {createDebouncedSet} from "@/vol_apps/03_utils/createDebouncedSet.ts";

const highlightMatch = (text: string, keyword: string): React.ReactNode => {
    if (!keyword) return text;

    const lowerText = text.toLowerCase();
    const lowerKey = keyword.toLowerCase();
    const index = lowerText.indexOf(lowerKey);

    if (index === -1) return text;

    return (
        <>
            {text.slice(0, index)}
            <span className="text-sBlue font-black">{text.slice(index, index + keyword.length)}</span>
            {text.slice(index + keyword.length)}
        </>
    );
};

export const SortableTiles = () => {
    const Logic = useTileLogic();
    const {displayTiles, handleDragEnd} = Logic;

    const {setContextMenuPosition, setContextMenuOpen} = useTileContextMenuStore()

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

    const rawKeyword = searchBarValueSignal.use();
    const [debouncedKeyword, setDebouncedKeyword] = useState(rawKeyword);

    const debouncedSetKeyword = useMemo(
        () => createDebouncedSet(
            (value: string) => setDebouncedKeyword(value),
            75
        ), []
    );
    useEffect(() => {
        void debouncedSetKeyword(rawKeyword.trim().toLowerCase());
        return () => debouncedSetKeyword.cancel();
    }, [rawKeyword]);


    const {enableTileFilter} = useSignal(searchStore("enableTileFilter"));
    const keyword = debouncedKeyword;
    const enabled = enableTileFilter && keyword;

    const filteredTiles = useMemo(() => {
        if (!enabled) return displayTiles;

        // 带上原始下标，保证同级稳定排序
        return displayTiles
            .map((tile, index) => {
                const name = tile.meta.name.toLowerCase();
                const matchIndex = name.indexOf(keyword); // -1 = 不匹配
                return {tile, index, matchIndex};
            })
            .sort((a, b) => {
                // 1. 匹配的排在不匹配的前面
                const aMatch = a.matchIndex !== -1;
                const bMatch = b.matchIndex !== -1;
                if (aMatch !== bMatch) return aMatch ? -1 : 1;

                // 2. 都匹配时，匹配位置越靠前越优先
                if (aMatch && bMatch && a.matchIndex !== b.matchIndex) {
                    return a.matchIndex - b.matchIndex;
                }

                // 3. 同级保持原顺序
                return a.index - b.index;
            })
            .map(item => item.tile);
    }, [keyword, enableTileFilter, displayTiles]);

    const items = useMemo(() => {
        return filteredTiles.map((tile, index) => ({
            id: tile.id,
            index,
            content: (
                <div className={cn({"animate-fade-in-scale": allowFadeIn})}>
                    <Tile_component
                        tileId={tile.id}
                        link={tile.url}
                        name={
                            enabled
                                ? highlightMatch(tile.meta.name, keyword)
                                : tile.meta.name
                        }
                        icon={tile.meta.icon}
                        isFetchingIcon={false}
                        onTileRightClick={(e) => {
                            Logic.setTileInEditId(tile.id)
                            setContextMenuPosition({x: e.clientX, y: e.clientY})
                            setContextMenuOpen(true);
                        }}
                    />
                </div>
            )
        }));
    }, [displayTiles, Logic, allowFadeIn]);

    return (
        <div id={"tiles_beside"} className={"flex flex-wrap pl-6 pr-1 py-6 gap-7"}>
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