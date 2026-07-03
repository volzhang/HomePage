import {memo, type ReactNode} from "react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {PanelRightClose, PanelRightOpen, RotateCcw, Trash2} from "lucide-react";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";

import {useTileStore} from "@/vol_apps/tile/tile_store";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";
import {storeHub, useSignal} from "@/vol_apps/04_persist_atoms";
import {bgStore} from "@/vol_apps/bg/bg_atom.ts";

interface TileUiInEditBodyProps {
    children: ReactNode;
    stylesIsOpen: boolean;
    setStylesIsOpen: (open: boolean) => void;
}

export const Tile_ui_inEdit_body = memo(({
                                             children,
                                             stylesIsOpen,
                                             setStylesIsOpen,
                                         }: TileUiInEditBodyProps) => {
    const {t} = useLanguage();
    const {bgImg} = useSignal(bgStore("bgImg"))

    const {removeTile, tileInEditId, setTileUiVisible} = useTileStore();

    const atomChanged = storeHub.getStore("ts").useStoreChanged() // 整体是否有改动
    const resetStyles = storeHub.getStore("ts").reset

    const handleRemoveTile = () => {
        setTileUiVisible(false)
        removeTile(tileInEditId);
    };

    return (
        <>
            <div
                className={cn(
                    "flex items-center justify-center",
                    "h-full w-full rounded-lg",
                    "relative"
                )}
                style={{
                    backgroundImage: `url(${bgImg})`,
                    backgroundRepeat: "repeat",
                    backgroundPosition: "center",
                }}
            >
                {children}
            </div>

            {/* 切换样式面板按钮 */}
            <HoverCard openDelay={0} closeDelay={0}>
                <HoverCardTrigger asChild>
                    <Button
                        variant="secondary"
                        size="icon"
                        className={cn(
                            "absolute bottom-2 right-2",
                            "opacity-60 hover:opacity-100",
                            "hover:bg-sBlue hover:text-white"
                        )}
                        onClick={() => setStylesIsOpen(!stylesIsOpen)}
                    >
                        {stylesIsOpen ? (
                            <PanelRightClose className="scale-130"/>
                        ) : (
                            <PanelRightOpen className="scale-130"/>
                        )}
                    </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-auto" side="top" sideOffset={18}>
                    <div className="text-[13px]">{t("Tile Global Styles")}</div>
                </HoverCardContent>
            </HoverCard>

            {/* 重置样式按钮（仅在有改动时显示） */}
            {atomChanged && (
                <HoverCard openDelay={0} closeDelay={0}>
                    <HoverCardTrigger asChild>
                        <Button
                            variant="secondary"
                            size="icon"
                            className={cn(
                                "absolute bottom-2 right-13",
                                "opacity-60 hover:opacity-100",
                                "hover:bg-sBlue hover:text-white"
                            )}
                            onClick={resetStyles}
                        >
                            <RotateCcw className="scale-130"/>
                        </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-auto" side="top" sideOffset={18}>
                        <div className="text-[13px]">{t("Reset Default Styles")}</div>
                    </HoverCardContent>
                </HoverCard>
            )}

            {/* 删除磁贴按钮 */}
            <HoverCard openDelay={0} closeDelay={0}>
                <HoverCardTrigger asChild>
                    <Button
                        variant="secondary"
                        size="icon"
                        className={cn(
                            "absolute bottom-2 left-2",
                            "opacity-60 hover:opacity-100",
                            "hover:bg-red-500 hover:text-white"
                        )}
                        onClick={handleRemoveTile}
                    >
                        <Trash2 className="scale-130"/>
                    </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-auto" side="top" sideOffset={18}>
                    <div className="text-[13px] text-red-500 font-medium">
                        {t("Delete This Tile")}
                    </div>
                </HoverCardContent>
            </HoverCard>
        </>
    );
});