import {Button}                                                                         from "@/components/ui/button";
import {Input}                                                                          from "@/components/ui/input";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText} from "@/components/ui/input-group";
import {Tooltip, TooltipContent, TooltipTrigger}                                        from "@/components/ui/tooltip";
import {cn}                                                                             from "@/lib/utils";
import {Tile}                                                                           from "@/vol_apps/tile/tile";
import {useTileStore}                                                                   from "@/vol_apps/tile/tile_atom";
import {useTileUiStore}                                                                 from "@/vol_apps/tile/tile_ui_atom";
import {ImgFilePickerBtn}                                                               from "@/vol_apps/tool/filePicker";
import {Info, ImageUp, Trash2}                                                          from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,

} from "@/components/ui/dialog";

export function TileUi() {
	const {tiles, updateTile, removeTile} = useTileStore();
	const {tileUiVisible, setTileUiVisible, tileUiInEdit, setTileUiInEdit} = useTileUiStore();

	const currentTile = tiles.find(tile => tile.id === tileUiInEdit);

	const handleWebUrlChange = (e) => {
		updateTile(tileUiInEdit, {href: e.currentTarget.value});
	};

	const handleNameChange = (e) => {
		updateTile(tileUiInEdit, {name: e.currentTarget.value});
	};

	const handleIconChange = (file) => {
		const currentMeta = currentTile.meta;
		const oldObjectUrl = currentMeta.icon;
		if (oldObjectUrl.startsWith("blob:")) URL.revokeObjectURL(oldObjectUrl);
		const newObjectUrl = URL.createObjectURL(file);
		updateTile(tileUiInEdit, {meta: {...currentMeta, icon: newObjectUrl}});
	};

	const handleRemove = () => {
		removeTile(tileUiInEdit);
		setTileUiInEdit(0);
		setTileUiVisible(false);
	}

	const handleSubmit = () => {
		setTileUiVisible(false);
	};

	return (
		<Dialog defaultOpen={false} open={tileUiVisible} onOpenChange={(open)=>{setTileUiVisible(open)}}>
			<form>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader className={"hidden"}>
						<DialogTitle>Edit profile</DialogTitle>
						<DialogDescription>
							Make changes to your profile here. Click save when you&apos;re
							done.
						</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col items-start gap-6 pt-4 px-4">
						<InputGroup className={"h-12! placeholder:text-base"}>
							<InputGroupInput
								className="pl-1! text-[20px]! placeholder:text-base"
								onChange={handleWebUrlChange}
								value={currentTile.href} //href
								// ref={ready_focus_ref}
							/>
							<InputGroupAddon>
								<InputGroupText className={`text-[16px]`}>https://</InputGroupText>
							</InputGroupAddon>
							<InputGroupAddon align="inline-end">
								<Tooltip>
									<TooltipTrigger asChild>
										<InputGroupButton className="rounded-full" size="icon-xs">
											<Info/>
										</InputGroupButton>
									</TooltipTrigger>
									<TooltipContent>只支持协议 https</TooltipContent>
								</Tooltip>
							</InputGroupAddon>
						</InputGroup>
						<InputGroup className={"h-12!"}>
							<InputGroupInput
								className="pl-1! text-[20px]! placeholder:text-base"
								value={currentTile.name}
								onChange={handleNameChange}
							/>
							<InputGroupAddon align="inline-end">
								<Tooltip>
									<TooltipTrigger asChild>
										<InputGroupButton className="rounded-full" size="icon-xs">
											<Info/>
										</InputGroupButton>
									</TooltipTrigger>
									<TooltipContent>填写瓷砖显示</TooltipContent>
								</Tooltip>
							</InputGroupAddon>
						</InputGroup>
						<div className="grid grid-cols-[1fr_minmax(150px,auto)] gap-3 w-full">
							<Input placeholder="填写base64图片资源"
								// onChange={handleFileUrlChange}
								//    value={currentTile.meta.icon}
								//    placeholder = {currentTile.meta.icon}
								   className="text-gray-400 h-12!"
							/>

							<ImgFilePickerBtn onPick={(file) => (handleIconChange(file))} children={
								<Button type="button" className={"text-[15px] hover:text-primary-foreground h-[46px] bg-[#0078d7] w-full"}>
									<ImageUp/>上传图标
								</Button>
							}/>

						</div>
						<div className="pt-2"/>
						<Tile tile={currentTile} isPreview={true}/>
						<Trash2 size={26}
								onClick={handleRemove}
								className={cn("absolute left-12 bottom-44 opacity-10",
									"transition-all duration-200",
									"hover:opacity-100",
									"hover:text-red-500",
									"hover:scale-120"
								)}/>

						<div className="pt-4"/>
						<Button type="submit" variant="default"
								className={"bg-[#0078d7] text-[17px] h-[46px] w-full"}
								onClick={handleSubmit}
						>确定</Button>
						<div className="pd-[1px]"/>
					</div>
				</DialogContent>
			</form>
		</Dialog>
	);
}
