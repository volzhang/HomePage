import {type Tile} from "@/vol_apps/tile/tile_store.js";
import {type MouseEvent, type ReactNode} from "react";
import {openLinkInNewTab} from "@/vol_apps/tool/action/openLink.js";
import {cn} from "@/lib/utils.js";

export interface TileProps {
    tile: Tile;
    interactive?: boolean;
    onClick?: (e: MouseEvent) => void;
    onRightClick?: (e: MouseEvent) => void;

    iconSlot?: ReactNode;
    nameSlot?: ReactNode;
}

export const TileComponent = ({
                                  tile,
                                  interactive = true,

                                  onClick,
                                  onRightClick,

                                  iconSlot,
                                  nameSlot,
                              }: TileProps) => {
    return (
        <div
            draggable={false}
            onClick={(e) => {
                if (!interactive) return;
                openLinkInNewTab(tile.url);
                onClick?.(e);
            }}
            onContextMenu={(e) => {
                if (!interactive) return;
                e.preventDefault();
                onRightClick?.(e);
            }}
            className={cn(
                "border border-[#eeeeee] bg-[#f9f9f9]",
                "text-black text-[13.5px] font-[550]",
                "select-none w-36 h-36 mx-auto",
                "rounded-[10%] flex flex-col items-center justify-between pt-2 pb-px",
                "transition-[shadow, transform] duration-250 delay-0 ease-linear",
                "hover:shadow-[#0078d7]/50 hover:shadow-xl",
            )}
        >
            {iconSlot ?? (
                <img
                    draggable={false}
                    className="mx-auto w-24 h-24 object-contain"
                    src={tile.meta.icon}
                    alt={tile.meta.alt}
                />
            )}
            {nameSlot ?? (
                <div className="w-fit h-fit">{tile.meta.name}</div>
            )}
        </div>
    );
};