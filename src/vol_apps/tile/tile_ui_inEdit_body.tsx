import { Button } from "@/components/ui/button";
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
    }: TileLogic & {children: React.ReactNode}
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
                            className={cn("absolute bottom-2 right-2 opacity-50",
                                "hover:opacity-100",
                                "hover:bg-sBlue",
                            )}
                            onClick={() => setStylesIsOpen(!stylesIsOpen)}
                    >
                        {stylesIsOpen
                            ? <PanelRightClose/>
                            : <PanelRightOpen /> }
                    </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-auto" side="top" sideOffset={18}>
                    <div className="text-[13px]">
                        {t("Tile Global Styles")}
                    </div>
                </HoverCardContent>
            </HoverCard>

            {hasStyleChanges && (
                <HoverCard openDelay={0} closeDelay={0}>
                    <HoverCardTrigger asChild>
                        <Button variant="secondary" size="icon"
                                className={cn("absolute bottom-2 right-13 opacity-50",
                                    "hover:opacity-100 hover:bg-sBlue",
                                )} onClick={handleResetStyles}>
                            <RotateCcw/>
                        </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-auto" side="top" sideOffset={18}>
                        <div className="text-[13px]">
                            {t("Reset Default Styles")}
                        </div>
                    </HoverCardContent>
                </HoverCard>
            )}

            <HoverCard openDelay={0} closeDelay={0}>
                <HoverCardTrigger asChild>
                    <Button variant="secondary" size="icon"
                            className={cn("absolute bottom-2 left-2 opacity-50",
                                "hover:opacity-100",
                                "hover:bg-red-500",
                            )}
                            onClick={handleRemoveTile}
                    >
                        <Trash2 />
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

