import { memo } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { openLinkInNewTab } from "@/vol_apps/tool/action/openLink";
import { Tilt_3D } from "./Tile_3D";
import { defaultIconBase64 } from "@/vol_apps/tile/tile_store_types";
import { tileStyleAtom } from "@/vol_apps/tile/tile_style_atom";
import { useLanguageAtom } from "@/vol_apps/language/languageAtom";
import {useTileBackgroundColor, useTileOutlineColor, useTileTextColor } from "@/vol_apps/tile/tile_style_hooks.ts"

type TileComponentProps = {
    tileId: number;
    link: string;
    icon: string;
    name: string;
    isFetchingIcon: boolean;
    disableClick?: boolean;
    iconBorderOutline?: boolean;
    onTileRightClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

const ValidUrlTile = ({
                          link,
                          icon,
                          name,
                          isFetchingIcon,
                          disableClick,
                          onTileRightClick,
                          iconBorderOutline,
                      }: TileComponentProps) => {
    const { t } = useLanguageAtom(); // 国际化直接在内部获取

    // ---- 样式字段精准订阅 ----
    const { tileSize } = tileStyleAtom.useField("tileSize");
    const { tileRadius } = tileStyleAtom.useField("tileRadius");
    const { tileOutlineThickness } = tileStyleAtom.useField("tileOutlineThickness");
    const { iconBorderSize } = tileStyleAtom.useField("iconBorderSize");
    const { iconBorderOffset } = tileStyleAtom.useField("iconBorderOffset");
    const { iconSize } = tileStyleAtom.useField("iconSize");
    const { iconOffset } = tileStyleAtom.useField("iconOffset");
    const { fontSize } = tileStyleAtom.useField("fontSize");
    const { fontWeight } = tileStyleAtom.useField("fontWeight");
    const { font } = tileStyleAtom.useField("font");
    const { textOffset } = tileStyleAtom.useField("textOffset");

    const backgroundRGBAColor = useTileBackgroundColor();
    const tileOutlineRGBAColor = useTileOutlineColor();
    const textRGBAColor = useTileTextColor();

    return (
        <a
            draggable={false}
            href={link}
            className={cn(
                "flex flex-col items-center justify-between",
                { "cursor-auto": disableClick },
                "transition-all duration-300 delay-0 ease-linear",
                "hover:shadow-sBlue/50 hover:shadow-xl"
            )}
            onClick={(e) => {
                e.preventDefault();
                if (!disableClick) openLinkInNewTab(link);
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                onTileRightClick?.(e);
            }}
            style={{
                backgroundColor: backgroundRGBAColor,
                width: `${tileSize}px`,
                height: `${tileSize}px`,
                borderRadius: `${tileRadius}px`,
                outline: `${tileOutlineThickness}px solid ${tileOutlineRGBAColor}`,
            }}
        >
            {/* icon border */}
            <div
                className={cn("relative shrink-0", !isFetchingIcon && "overflow-hidden")}
                style={{
                    width: `${iconBorderSize}px`,
                    height: `${iconBorderSize}px`,
                    outline: `${iconBorderOutline ? "1px dashed rgba(0,0,0,0.4)" : ""}`,
                    transform: `translate(${iconBorderOffset.x}px, ${iconBorderOffset.y}px)`,
                }}
            >
                {/* icon */}
                {isFetchingIcon ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                            <Spinner
                                style={{
                                    width: `${iconBorderSize}px`,
                                    height: `${iconBorderSize}px`,
                                }}
                                className="text-sBlue"
                            />
                            {iconBorderSize > 49 && (
                                <p
                                    className={cn(
                                        "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                                        "font-semibold text-center",
                                        "bg-transparent text-sBlue"
                                    )}
                                    style={{ fontSize: `${iconBorderSize / 7}px` }}
                                >
                                    {t("Fetching")}
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <img
                        className="absolute max-w-none select-none"
                        style={{
                            width: `${iconSize}px`,
                            height: `${iconSize}px`,
                            left: "50%",
                            top: "50%",
                            transform: `translate(calc(-50% + ${iconOffset.x}px), calc(-50% + ${iconOffset.y}px))`,
                        }}
                        src={icon || defaultIconBase64}
                        alt="icon"
                    />
                )}
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
    );
};

export const Tile_component = memo((props: TileComponentProps) => {
    const { tileRadius } = tileStyleAtom.useField("tileRadius");
    return (
        <Tilt_3D radius={tileRadius}>
            <ValidUrlTile {...props} />
        </Tilt_3D>
    );
});