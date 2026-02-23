import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {ScrollArea} from "@/components/ui/scroll-area";
import {cn} from "@/lib/utils";
import {useBgStore} from "@/vol_apps/bg/bg_store";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {localforageBackup, localforageRestore} from "@/vol_apps/tool/backupAndRestore";
import {jsonFilePickerAPI} from "@/vol_apps/tool/filePicker";

import {Plus, Download, Upload, Image} from "lucide-react";
import type {PropsWithChildren} from "react";
import {useTranslation} from "react-i18next";

export function ContextMenuComponent({children}: PropsWithChildren) {
	const {tiles, addTile, setTileInEditId, setTileUiVisible} = useTileStore();
	const {setBgUiVisible} = useBgStore();
	const {t} = useTranslation("contextMenu");

	const OnAddTile = () => {
		const newTileId = tiles.length;
		addTile();
		setTileInEditId(newTileId);
		setTileUiVisible(true);
	};

	return (
		<>
			<style>{`
                .mask-fade {
  					mask-image: linear-gradient(
    					to bottom,
						transparent,
						rgba(0,0,0,0.0) 2px,
						rgba(0,0,0,0.2) 8px,
						rgba(0,0,0,0.4) 12px,
						rgba(0,0,0,0.6) 16px,
						rgba(0,0,0,0.8) 20px,
						black 24px,
						black calc(100% - 24px),
						rgba(0,0,0,0.8) calc(100% - 20px),
						rgba(0,0,0,0.6) calc(100% - 16px),
						rgba(0,0,0,0.4) calc(100% - 12px),
						rgba(0,0,0,0.2) calc(100% - 8px),
						rgba(0,0,0,0.0) calc(100% - 2px),
						transparent 100%
				  );
				}
            `}</style>

			<ContextMenu>
				<ContextMenuTrigger className= {cn(
					"flex mx-auto items-center justify-center ",
					"border border-border rounded-xl",
					"max-h-[70vh] max-w-[85%]")}>
					<ScrollArea
						type="scroll"
						scrollHideDelay={600}
						viewportClassName={"mask-fade max-h-[70vh] min-h-[192px]"}
					>
						{children}
					</ScrollArea>

				</ContextMenuTrigger>
				<ContextMenuContent className="w-48">
					<ContextMenuItem inset onClick={OnAddTile} className={"h-10"}>
						{t("Add Tile")}
						<Plus className="ml-auto"/>
					</ContextMenuItem>
					<ContextMenuSub>
						<ContextMenuSubTrigger inset className={"h-10"}>
							{t("Backup")}
						</ContextMenuSubTrigger>
						<ContextMenuSubContent className="w-44">
							<ContextMenuItem onClick={localforageBackup} className={"h-10"}>
								{t("Download")}
								<Download className={"ml-auto"}/>
							</ContextMenuItem>
							<ContextMenuItem onClick={() => jsonFilePickerAPI().then(file => localforageRestore(file))} className={`h-10`}>
								{t("Import")}
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
