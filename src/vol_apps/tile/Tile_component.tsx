import type {TileLogic} from "@/vol_apps/tile/useTileLogic";
import {cn} from "@/lib/utils";
import {Spinner} from "@/components/ui/spinner";
import {openLinkInNewTab} from "@/vol_apps/tool/action/openLink";
import {Tilt_3D} from "./Tile_3D";
import {Clock} from "@/vol_apps/NixieClock/Clock";
import {memo,} from "react";
import {defaultIconBase64} from "@/vol_apps/tile/tile_store_types";

export type TileComponentProps = TileLogic & {
    // anchorProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
    disableClick?: boolean;
    isFetchingIcon?: boolean;
    iconBorderOutline?: boolean;
    onTileRightClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
};

const ValidUrlTile = (
    {
        t,
        link,
        icon,
        name,
        isFetchingIcon,
        disableClick,
        onTileRightClick,
        backgroundRGBAColor,
        tileSize,
        tileOutlineThickness,
        tileOutlineRGBAColor,
        tileRadius,
        iconBorderSize,
        iconBorderOffset,
        iconSize,
        iconOffset,
        fontSize,
        fontWeight,
        font,
        textOffset,
        textRGBAColor,
        iconBorderOutline,
    }: TileComponentProps
) => {
    return <>
        <a
            draggable={false}
            href={link}
            className={cn("flex flex-col items-center justify-between",
                {"cursor-auto": disableClick},
                "transition-all duration-300 delay-0 ease-linear",
                "hover:shadow-sBlue/50 hover:shadow-xl",
            )}
            onClick={(e) => {
                e.preventDefault()
                if (!disableClick) openLinkInNewTab(link)
            }}
            onContextMenu={(e) => {
                e.preventDefault()
                onTileRightClick?.(e)
            }}
            style={{
                backgroundColor: backgroundRGBAColor,
                width: `${tileSize}px`,
                height: `${tileSize}px`,
                borderRadius: `${tileRadius}px`,
                outline: `${tileOutlineThickness}px solid ${tileOutlineRGBAColor}`,
            }}>
            {/* icon border */}
            <div className={cn("relative shrink-0", !isFetchingIcon && "overflow-hidden")}
                 style={{
                     width: `${iconBorderSize}px`,
                     height: `${iconBorderSize}px`,
                     outline: `${iconBorderOutline ? "1px dashed rgba(0,0,0,0.4)" : ""}`,
                     transform: `translate(${iconBorderOffset.x}px, ${iconBorderOffset.y}px)`,
                 }}>
                {/* icon */}
                {isFetchingIcon ?
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                            <Spinner style={{
                                width: `${iconBorderSize}px`,
                                height: `${iconBorderSize}px`,
                            }}
                                     className="text-sBlue"
                            />
                            {(iconBorderSize > 49) ? <p
                                className={cn(
                                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                                    "font-semibold text-center",
                                    "bg-transparent text-sBlue"
                                )}
                                style={{
                                    fontSize: `${iconBorderSize / 7}px`,
                                }}
                            >
                                {t("Fetching")}
                            </p> : null}
                        </div>
                    </div>
                    : <img
                        // draggable={false}
                        className="absolute max-w-none select-none" style={{
                        width: `${iconSize}px`,
                        height: `${iconSize}px`,
                        left: "50%",
                        top: "50%",
                        transform: `translate(calc(-50% + ${iconOffset.x}px), calc(-50% + ${iconOffset.y}px))`,
                    }}
                           src={icon || defaultIconBase64}
                           alt="icon"
                    />
                }
            </div>
            {/* text */}
            <p
                className="w-full text-center my-auto break-all whitespace-pre-wrap select-none"
                style={{
                    fontSize: `${fontSize}px`,
                    fontWeight: fontWeight,
                    fontFamily: font.family,
                    transform: `translate(${textOffset.x}px, ${textOffset.y}px)`,
                    color: textRGBAColor,
                }}
            >
                {name}
            </p>
        </a>
    </>
}

const ComponentTile = (
    {
        link,
        disableClick,
        onTileRightClick,
        backgroundRGBAColor,
        tileSize,
        tileOutlineThickness,
        tileOutlineRGBAColor,
        tileRadius,
    }: TileComponentProps
) => {


    return (
        <a
            href={link}
            className={cn("flex flex-col items-center justify-between",
                {"cursor-auto": disableClick},
                "transition-all duration-300 delay-0 ease-linear",
                "hover:shadow-sBlue/50 hover:shadow-xl",
                "hover:bg-background",
                "overflow-hidden",
                "border border-background/10"
            )}
            onClick={(e) => {
                e.preventDefault()
                if (!disableClick) openLinkInNewTab(link)
            }}
            onContextMenu={(e) => {
                e.preventDefault()
                onTileRightClick?.(e)
            }}
            style={{
                backgroundColor: `${backgroundRGBAColor}`,
                width: `${tileSize}px`,
                height: `${tileSize}px`,
                borderRadius: `${tileRadius}px`,
                outline: `${tileOutlineThickness}px solid ${tileOutlineRGBAColor}`,
            }}>
            <Clock size={tileSize}/>
        </a>
    )
}

export const Tile_component = memo((props: TileComponentProps) => {
    return (
        <Tilt_3D radius={props.tileRadius}>
            {
                (props.link.startsWith("https://flipclock.info/"))
                    ? <ComponentTile {...props}/>
                    : <ValidUrlTile {...props}/>
            }
        </Tilt_3D>)
})