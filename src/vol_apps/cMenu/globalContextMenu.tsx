import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,} from "@/components/ui/context-menu";
import {useBgStore} from "@/vol_apps/bg/bg_store";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {persistedStoresBackup, persistedStoresRestore} from "@/vol_apps/tool/backupAndRestore";
import {jsonFilePickerAPI} from "@/vol_apps/tool/action/filePicker";

import {Plus, Download, Upload, Image} from "lucide-react";
import {useState, type PropsWithChildren} from "react";
import {useTranslation} from "react-i18next";

export function GlobalContextMenu({children}: PropsWithChildren) {
    const {tiles, tilesVisible, addTile, setTileInEditId, setTileUiVisible, setTilesVisible} = useTileStore();
    const {setBgUiVisible} = useBgStore();
    const {t} = useTranslation("contextMenu");

    const OnAddTile = () => {
        const newTileId = tiles.length;
        addTile();
        setTileInEditId(newTileId);
        setTileUiVisible(true);
    };


    const [contentKey, setContentKey] = useState(0);

    const handleOpenChange = (open: boolean) => {
        if (!open) setContentKey(prev => prev + 1);
    };

    return (
        <>
            <ContextMenu onOpenChange={handleOpenChange}>
                <ContextMenuTrigger className= {"fixed inset-0 z-0"}>
                    {children}
                </ContextMenuTrigger>
                <ContextMenuContent key={contentKey} className="w-48">
                        {tilesVisible
                            ?
                            <ContextMenuSub>
                                <ContextMenuSubTrigger inset className={"h-10"}>
                                    {t("Tiles")}
                                </ContextMenuSubTrigger>
                                <ContextMenuSubContent className="w-44">
                                    <ContextMenuItem inset onClick={OnAddTile} className={"h-10"} disabled={!tilesVisible}>
                                        {t("Add Tile")}
                                        <Plus className="ml-auto"/>
                                    </ContextMenuItem>
                                    <ContextMenuItem inset className={"h-10"}
                                                     onClick={()=> setTilesVisible(!tilesVisible)} >
                                        {tilesVisible ? t("Hide Tiles") : t("Show Tiles")}
                                    </ContextMenuItem>
                                </ContextMenuSubContent>
                            </ContextMenuSub>
                            :
                            <ContextMenuItem inset className={"h-10"} onClick={()=> setTilesVisible(!tilesVisible)} >
                                {t("Show Tiles")}
                            </ContextMenuItem>
                        }
                    <ContextMenuSub>
                        <ContextMenuSubTrigger inset className={"h-10"}>
                            {t("Backup")}
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-44">
                            <ContextMenuItem onClick={persistedStoresBackup} className={"h-10"}>
                                {t("Download Backup")}
                                <Download className={"ml-auto"}/>
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => jsonFilePickerAPI().then(file => persistedStoresRestore(file))} className={`h-10`}>
                                {t("Import Backup")}
                                <Upload className={"ml-auto"}/>
                            </ContextMenuItem>
                        </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuItem inset onClick={() => {
                        setBgUiVisible(true);
                    }} className={"h-10"}>
                        {t("Set Background")}
                        <Image className="ml-auto"/>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </>
    );
}
