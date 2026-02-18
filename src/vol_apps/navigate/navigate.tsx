
import {useBgStore} from "@/vol_apps/bg/bg_store";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {localforageBackup, localforageRestore} from "@/vol_apps/tool/backupAndRestore";
import {jsonFilePickerAPI} from "@/vol_apps/tool/filePicker";


import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,

} from "@/components/ui/navigation-menu";
import {useTranslation} from "react-i18next";
// import {backup_trans} from "@/vol_apps/tool_backup/backup_trans";

export const Navigation = () => {
	const {setBgUiVisible} = useBgStore();
	const {tiles, addTile_auto, setTileInEditId, setTileUiVisible} = useTileStore()
	const {selectedTags} = useTileStore()
	const {t} = useTranslation("navigation");

	const OnAddTile = () => {
		const newTileId = tiles.length
		addTile_auto(selectedTags())
		setTileInEditId(newTileId)
		setTileUiVisible(true)
	}


	return (
		// 注意，viewport 表示是否在移动端
		<NavigationMenu viewport={false}>
			<NavigationMenuList className="flex-wrap">
				<NavigationMenuItem className="hidden md:block">
					<NavigationMenuTrigger className={"bg-transparent text-white"}>
						{t("Menu")}
					</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-[200px] gap-4">
							<li>
								<NavigationMenuLink asChild>
									<a href="#" onClick={() => {
										setBgUiVisible(true);
									}}>
										{t("Set Background")}
									</a>
								</NavigationMenuLink>
								<NavigationMenuLink asChild>
									<a href="#" onClick={async () => {await localforageBackup();}}>
										{t("Download Backup")}
									</a>
								</NavigationMenuLink>
								<NavigationMenuLink asChild>
									<a href="#" onClick={async () => {await localforageRestore(await jsonFilePickerAPI());}}>
										{t("Import Backup")}
									</a>
								</NavigationMenuLink>
								<NavigationMenuLink asChild>
									<a href="#" onClick={OnAddTile}>{t("Add Tile")}</a>
								</NavigationMenuLink>

								<NavigationMenuLink asChild>
									<a href="privacy.html" target={"_blank"}>{t("Privacy Policy")}</a>
								</NavigationMenuLink>

								{/*<NavigationMenuLink asChild>*/}
								{/*	<a href="#" onClick={backup_trans}>使用V2存档【dev only】</a>*/}
								{/*</NavigationMenuLink>*/}
							</li>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
};

