import {
    Menubar,
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
    MenubarSub,
    MenubarSubTrigger,
    MenubarSubContent
} from "@/components/ui/menubar";
import {cn} from "@/lib/utils";
import {useBgStore} from "@/vol_apps/bg/bg_store";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {openLinkInNewTab} from "@/vol_apps/tool/action/openLink";
import {persistedStoresBackup, persistedStoresRestore} from "@/vol_apps/tool/backupAndRestore";
import {bookmarkFilePickerAPI, jsonFilePickerAPI} from "@/vol_apps/tool/action/filePicker";
import {
	bookmarksToTiles,
	buildBackupFileFromBookmarks,
	netscapeBookmarkFilePhaser
} from "@/vol_apps/tool/isType/isLikelyBookmarkFile.js";
import {useLanguageStore} from "@/vol_apps/language/language_store";

//这里手动复制了Button的secondary样式
const cn_str = "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50";

export function Menu() {
    const {setBgUiVisible} = useBgStore();
    const {tilesVisible, setTilesVisible} = useTileStore();

    const {tiles, addTile, setTileInEditId, setTileUiVisible} = useTileStore();
    const {t} = useLanguageStore()

    const OnAddTile = () => {
        const newTileId = tiles.length;
        addTile();
        setTileInEditId(newTileId);
        setTileUiVisible(true);
    };

    const handleImportFromBookmarkFile = async () => {
		const file = await bookmarkFilePickerAPI()
		const data = await netscapeBookmarkFilePhaser(file);
		const tiles = bookmarksToTiles(data);
		const fakeBackupFile = buildBackupFileFromBookmarks(tiles);
		await persistedStoresRestore(fakeBackupFile, true);
    }

    return (
        <Menubar className={cn("w-24 flex justify-center", cn_str, "animate-fade-in-scale")}>
            <MenubarMenu>
                <MenubarTrigger className={cn(cn_str, "border-none! bg-transparent! w-24 h-9 px-7")}>
                    {t("Menu")}
                </MenubarTrigger>
                <MenubarContent side={"bottom"} align={"center"} sideOffset={3.5} className={"ml-2"}>
                    <MenubarGroup>
                        {
                            tilesVisible
                                ?
                                <MenubarSub>
                                    <MenubarSubTrigger>{t("Tiles")}</MenubarSubTrigger>
                                    <MenubarSubContent>
                                        <MenubarGroup>
                                            <MenubarItem onClick={OnAddTile} disabled={!tilesVisible}>
                                                {t("Add Tile")}
                                            </MenubarItem>
                                            <MenubarItem onClick={() => setTilesVisible(!tilesVisible)}>
                                                {
                                                    tilesVisible
                                                        ? t("Hide Tiles")
                                                        : t("Show Tiles")
                                                }
                                            </MenubarItem>
                                        </MenubarGroup>
                                    </MenubarSubContent>
                                </MenubarSub>
                                :
                                <MenubarItem onClick={() => setTilesVisible(!tilesVisible)}>
                                    {t("Show Tiles")}
                                </MenubarItem>
                        }
                        <MenubarSub>
                            <MenubarSubTrigger>{t("Backup")}</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarGroup>
                                    <MenubarItem onClick={async () => await persistedStoresBackup()}>
                                        {t("Download Backup")}
                                    </MenubarItem>
                                    <MenubarItem
                                        onClick={async () => await persistedStoresRestore(await jsonFilePickerAPI())}>
                                        {t("Import Backup")}
                                    </MenubarItem>
                                </MenubarGroup>
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarSub>
                            <MenubarSubTrigger>{t("Chrome/Edge Bookmarks")}</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarGroup>
                                    <MenubarItem onClick={handleImportFromBookmarkFile}>
                                        {t("Import links from an HTML bookmarks file")}
                                    </MenubarItem>
                                </MenubarGroup>
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarItem onClick={() => setBgUiVisible(true)}>
                            {t("Set Background")}
                        </MenubarItem>
                        <MenubarItem onClick={() => openLinkInNewTab("privacy.html")}>
                            {t("Privacy Policy")}
                        </MenubarItem>
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    );
}
