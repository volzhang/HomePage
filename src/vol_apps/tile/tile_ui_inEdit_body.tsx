import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {PanelRightClose, PanelRightOpen, RotateCcw, Trash2} from "lucide-react";
import type {TileLogic} from "@/vol_apps/tile/useTileLogic";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";

export const Tile_ui_inEdit_body = (
    {
        t,
        handleRemoveTile,
        handleResetStyles,
        hasStyleChanges,
        bgImg,
        stylesIsOpen,
        setStylesIsOpen,
        children,
    }: TileLogic & { children: React.ReactNode }
) => {
    return (
        <>
            <div className={cn("flex items-center justify-center",
                "h-full w-full rounded-lg", "relative")}
                 style={{
                     backgroundImage: `url(${bgImg})`,
                     backgroundRepeat: "repeat",
                     backgroundPosition: "center",
                 }}>
                {children}
            </div>

            <HoverCard openDelay={0} closeDelay={0}>
                <HoverCardTrigger asChild>
                    <Button variant="secondary" size="icon"
                            className={cn("absolute bottom-2 right-2",
                                "opacity-60 hover:opacity-100",
                                "hover:bg-sBlue hover:text-white",
                            )}
                            onClick={() => setStylesIsOpen(!stylesIsOpen)}
                    >
                        {stylesIsOpen
                            ? <PanelRightClose className={"scale-130"}/>
                            : <PanelRightOpen className={"scale-130"}/>}
                    </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-auto" side="top" sideOffset={18}>
                    <div className="text-[13px]">
                        {t("Tile Global Styles")}
                    </div>
                </HoverCardContent>
            </HoverCard>


            {/* 重置样式设置 */}
            {hasStyleChanges && (
                <HoverCard openDelay={0} closeDelay={0}>
                    <HoverCardTrigger asChild>
                        <Button variant="secondary" size="icon"
                                className={cn("absolute bottom-2 right-13",
                                    "opacity-60 hover:opacity-100",
                                    "hover:bg-sBlue hover:text-white",
                                )}
                                onClick={handleResetStyles}>
                            <RotateCcw className={"scale-130"}/>
                        </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-auto" side="top" sideOffset={18}>
                        <div className="text-[13px]">
                            {t("Reset Default Styles")}
                        </div>
                    </HoverCardContent>
                </HoverCard>
            )}


            {/*删除瓷砖*/}
            <HoverCard openDelay={0} closeDelay={0}>
                <HoverCardTrigger asChild>
                    <Button variant="secondary" size="icon"
                            className={cn("absolute bottom-2 left-2",
                                "opacity-60 hover:opacity-100",
                                "hover:bg-red-500 hover:text-white",
                            )}
                            onClick={handleRemoveTile}
                    >
                        <Trash2 className={"scale-130"}/>
                    </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-auto" side="top" sideOffset={18}>
                    <div className="text-[13px] text-red-500 font-medium">
                        {t("Delete This Tile")}
                    </div>
                </HoverCardContent>
            </HoverCard>
        </>
    )
}

