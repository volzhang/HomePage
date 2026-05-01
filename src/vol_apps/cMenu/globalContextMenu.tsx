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
import {useLanguageStore} from "@/vol_apps/language/language_store";

export function GlobalContextMenu({children}: PropsWithChildren) {
    const {tilesVisible, addTile, setTileInEditId, setTileUiVisible, setTilesVisible} = useTileStore();
    const {setBgUiVisible} = useBgStore();
    const {t} = useLanguageStore()

    const onAddTile = () => {
        const newTileId = addTile();
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
                {/*<ContextMenuTrigger className= {"fixed inset-0 z-0 border-5 border-red-900"}>*/}
                <ContextMenuTrigger className= {"w-fit h-fit z-0"}>
                    {children}
                </ContextMenuTrigger>
                <ContextMenuContent key={contentKey} className="w-48">
                        {tilesVisible
                            ?
                            <ContextMenuSub>
                                <ContextMenuSubTrigger>
                                    {t("Tiles")}
                                </ContextMenuSubTrigger>
                                <ContextMenuSubContent className="w-44">
                                    <ContextMenuItem inset onClick={onAddTile} disabled={!tilesVisible}>
                                        {t("Add Tile")}
                                        <Plus className="ml-auto"/>
                                    </ContextMenuItem>
                                    <ContextMenuItem inset className={""}
                                                     onClick={()=> setTilesVisible(!tilesVisible)} >
                                        {tilesVisible ? t("Hide Tiles") : t("Show Tiles")}
                                    </ContextMenuItem>
                                </ContextMenuSubContent>
                            </ContextMenuSub>
                            :
                            <ContextMenuItem onClick={()=> setTilesVisible(!tilesVisible)} >
                                {t("Show Tiles")}
                            </ContextMenuItem>
                        }
                    <ContextMenuSub>
                        <ContextMenuSubTrigger>
                            {t("Backup")}
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-44">
                            <ContextMenuItem onClick={persistedStoresBackup}>
                                {t("Download Backup")}
                                <Download className={"ml-auto"}/>
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => jsonFilePickerAPI().then(file => persistedStoresRestore(file))}>
                                {t("Import Backup")}
                                <Upload className={"ml-auto"}/>
                            </ContextMenuItem>
                        </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuItem onClick={() => {
                        setBgUiVisible(true);
                    }} className={""}>
                        {t("Set Background")}
                        <Image className="ml-auto"/>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </>
    );
}
