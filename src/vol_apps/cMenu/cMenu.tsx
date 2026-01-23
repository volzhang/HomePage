import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {useBgStore} from "@/vol_apps/bg_zustand/bg_store";
import {useTileStore} from "@/vol_apps/tile_zustand/tile_store";
import {localforageBackup, localforageRestore} from "@/vol_apps/tool/backupAndRestore";
import {jsonFilePickerAPI} from "@/vol_apps/tool/filePicker";

import {Plus, Download, Upload, Image} from "lucide-react";
import type {PropsWithChildren} from "react";
import { useTranslation } from 'react-i18next';

export function ContextMenuComponent({children}: PropsWithChildren) {
	const {addTile} = useTileStore();
	const {setBgUiVisible} = useBgStore();
	const { t } = useTranslation("contextMenu");

	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<div className={"flex w-[85%] mx-auto border border-[white]/25 rounded-xl"}>
					{children}
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent className="w-48">
				<ContextMenuItem inset onClick={addTile} className={`h-10`}>
					{t("Add Tile")}
					<Plus className="ml-auto"/>
				</ContextMenuItem>
				<ContextMenuSub>
					<ContextMenuSubTrigger inset className={`h-10`}>
						{t('Backup')}
					</ContextMenuSubTrigger>
					<ContextMenuSubContent className="w-44">
						<ContextMenuItem onClick={localforageBackup} className={`h-10`}>
							{t("Download")}
							<Download className={`ml-auto`}/>
						</ContextMenuItem>
						<ContextMenuItem onClick={() => jsonFilePickerAPI().then(file => localforageRestore(file))} className={`h-10`}>
							{t("Restore")}
							<Upload className={`ml-auto`}/>
						</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>
				<ContextMenuItem inset onClick={() => {
					setBgUiVisible(true);
				}} className={`h-10`}>
					{t("Set Background")}
					<Image className="ml-auto"/>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
