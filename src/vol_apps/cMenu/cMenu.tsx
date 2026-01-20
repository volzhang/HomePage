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

export function ContextMenuComponent({children}: PropsWithChildren) {
	const {addTile} = useTileStore();
	const {setBgUiVisible} = useBgStore();
	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<div className={"fixed left-8/100 right-8/100 border border-[white]/25 rounded-xl"}>
					{children}
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent className="w-48">
				<ContextMenuItem inset onClick={addTile} className={`h-10`}>
					添加瓷砖
					<Plus className="ml-auto"/>
				</ContextMenuItem>
				<ContextMenuSub>
					<ContextMenuSubTrigger inset className={`h-10`}>存档</ContextMenuSubTrigger>
					<ContextMenuSubContent className="w-44">
						<ContextMenuItem onClick={localforageBackup} className={`h-10`}>下载 <Download className={`ml-auto`}/></ContextMenuItem>
						<ContextMenuItem onClick={() => jsonFilePickerAPI().then(file => localforageRestore(file))} className={`h-10`}>上传 <Upload
							className={`ml-auto`}/></ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>
				<ContextMenuItem inset onClick={() => {
					setBgUiVisible(true);
				}} className={`h-10`}>
					设置背景
					<Image className="ml-auto"/>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
