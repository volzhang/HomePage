import type {TileLogic} from "@/vol_apps/tile/useTileLogic";
import {cn} from "@/lib/utils";
import {Spinner} from "@/components/ui/spinner";
import {openLinkInNewTab} from "@/vol_apps/tool/action/openLink";
import {Tilt_3D} from "./Tile_3D";


export type TileComponentProps = TileLogic & {
    anchorProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
    disableClick?: boolean;
    isFetchingIcon?: boolean;
    iconBorderOutline?: boolean;
};

export const Tile_component = (
    {
        t,

        anchorProps,
        disableClick = false,
        isFetchingIcon = false,
        iconBorderOutline = true,

        // Logic 里的当前编辑 tile 数据（编辑预览时用）
        name,
        link,
        icon,
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

    }: TileComponentProps
) => {

    const handleClick = () => openLinkInNewTab(link)

    return (
        <Tilt_3D radius={tileRadius}>
            {/* tile */}
            <a
                {...anchorProps}
                href={anchorProps?.href || link}
                className={cn("flex flex-col items-center justify-between",
                    {"cursor-auto": disableClick},
                    "transition-[shadow, transform] duration-250 delay-0 ease-linear",
                    "hover:shadow-sBlue/50 hover:shadow-xl",
                    anchorProps?.className,
                )}
                onClick={(e) => {
                    e.preventDefault()
                    if (!disableClick) handleClick?.()
                    anchorProps?.onClick?.(e)
                }}
                style={{
                    backgroundColor: backgroundRGBAColor,
                    width: `${tileSize}px`,
                    height: `${tileSize}px`,
                    borderRadius: `${tileRadius}px`,
                    outline: `${tileOutlineThickness}px solid ${tileOutlineRGBAColor}`,
                    ...anchorProps?.style
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
                                {(iconBorderSize  > 49) ? <p
                                    className={cn(
                                        "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                                        "font-semibold text-center",
                                        "bg-transparent text-sBlue"
                                    )}
                                    style={{
                                        fontSize: `${iconBorderSize/7}px`,
                                    }}
                                >
                                    {t("Fetching")}
                                </p> : null }
                            </div>
                        </div>
                        : <img className="absolute max-w-none" style={{
                            width: `${iconSize}px`,
                            height: `${iconSize}px`,
                            left: "50%",
                            top: "50%",
                            transform: `translate(calc(-50% + ${iconOffset.x}px), calc(-50% + ${iconOffset.y}px))`,
                        }}
                               src={icon}
                               alt="icon"
                        />
                    }
                </div>
                {/* text */}
                <p
                    className="w-full text-center my-auto break-all whitespace-pre-wrap"
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
        </Tilt_3D>)
}