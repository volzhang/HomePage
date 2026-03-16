import {
	Menubar,
	MenubarContent,
	MenubarGroup,
	MenubarItem,
	MenubarMenu,
	MenubarTrigger,
} from "@/components/ui/menubar";
import {cn} from "@/lib/utils";
import {useBgStore} from "@/vol_apps/bg/bg_store";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {localforageBackup, localforageRestore} from "@/vol_apps/tool/backupAndRestore";
import {jsonFilePickerAPI} from "@/vol_apps/tool/filePicker";
import {useTranslation} from "react-i18next";

//这里手动复制了Button的secondary样式
const cn_str = "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50";

export function Menu() {
	const {setBgUiVisible} = useBgStore();
	const {tiles, addTile, setTileInEditId, setTileUiVisible} = useTileStore();
	const {t} = useTranslation("navigation");

	const OnAddTile = () => {
		const newTileId = tiles.length;
		addTile();
		setTileInEditId(newTileId);
		setTileUiVisible(true);
	};
	return (
		<Menubar className={cn("w-24 flex justify-center", cn_str, "animate-fade-in-scale")}>
			<MenubarMenu>
				<MenubarTrigger className={cn(cn_str, "border-none! bg-transparent!")}>
					{t("Menu")}
				</MenubarTrigger>
				<MenubarContent side={"bottom"} align={"center"} className={"ml-2"}>
					<MenubarGroup>
						<MenubarItem onClick={() => setBgUiVisible(true)}>
							{t("Set Background")}
						</MenubarItem>
						<MenubarItem onClick={async () => await localforageBackup()}>
							{t("Download Backup")}
						</MenubarItem>
						<MenubarItem onClick={async () => await localforageRestore(await jsonFilePickerAPI())}>
							{t("Import Backup")}
						</MenubarItem>
						<MenubarItem onClick={OnAddTile}>
							{t("Add Tile")}
						</MenubarItem>
						<MenubarItem>
							<a href="privacy.html" target={"_blank"}>{t("Privacy Policy")}</a>
						</MenubarItem>
					</MenubarGroup>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}
