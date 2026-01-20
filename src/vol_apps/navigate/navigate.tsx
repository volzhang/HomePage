
import {useBgStore} from "@/vol_apps/bg_zustand/bg_store";
import {useTileStore} from "@/vol_apps/tile_zustand/tile_store";
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

export const Navigation = () => {
	const {setBgUiVisible} = useBgStore();
	const {addTile} = useTileStore()
	return (
		// 注意，viewport 表示是否在移动端
		<NavigationMenu viewport={false}>
			<NavigationMenuList className="flex-wrap">
				<NavigationMenuItem className="hidden md:block">
					<NavigationMenuTrigger className={"bg-transparent text-white"}>
						菜单
					</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-[200px] gap-4">
							<li>
								<NavigationMenuLink asChild>
									<a href="#" onClick={() => {
										setBgUiVisible(true);
									}}>设置背景</a>
								</NavigationMenuLink>
								<NavigationMenuLink asChild>
									<a href="#" onClick={async () => {await localforageBackup();}}>下载备份</a>
								</NavigationMenuLink>
								<NavigationMenuLink asChild>
									<a href="#" onClick={async () => {await localforageRestore(await jsonFilePickerAPI());}}>备份恢复</a>
								</NavigationMenuLink>
								<NavigationMenuLink asChild>
									<a href="#" onClick={addTile}>新增瓷砖</a>
								</NavigationMenuLink>
							</li>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
};

// function ListItem({
// 					  title,
// 					  children,
// 					  href,
// 					  ...props
// 				  }: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
// 	return (
// 		<li {...props}>
// 			<NavigationMenuLink asChild>
// 				<a href={href}>
// 					<div className="text-sm leading-none font-medium">{title}</div>
// 					<p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
// 						{children}
// 					</p>
// 				</a>
// 			</NavigationMenuLink>
// 		</li>
// 	);
// }
