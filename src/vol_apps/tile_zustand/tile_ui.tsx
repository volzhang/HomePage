import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {cn} from "@/lib/utils";
import {TileComponent} from "@/vol_apps/tile_zustand/tile";
import {useTileStore} from "@/vol_apps/tile_zustand/tile_store";
import {enhanceUrl} from "@/vol_apps/tool/enhanceUrl";
import {ImgFilePickerBtn} from "@/vol_apps/tool/filePicker";
import {blobToString, isBlobString} from "@/vol_apps/tool/isType";
import {ImageUp, Info, Trash2} from "lucide-react";
import {type ChangeEvent, type KeyboardEvent} from "react";

export const TileUi = () => {
	const {
		tiles,
		updateTile,
		removeTile,
		tileInEditId,
		tileUiVisible, setTileUiVisible
	} = useTileStore();
	// global var
	const currentTile = tiles.find(tile => tile.id === tileInEditId) || tiles[0];
	const currentMeta = currentTile.meta;
	// url
	const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
		updateTile(tileInEditId, {url: enhanceUrl(e.target.value)});
	};
	// name
	const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
		updateTile(tileInEditId, {meta: {...currentMeta, name: e.currentTarget.value}});
	};
	// tag
	const handleTagChange = (e: ChangeEvent<HTMLInputElement>) => {
		const splitString = " ";
		updateTile(tileInEditId, {meta: {...currentMeta, tags: e.currentTarget.value.split(splitString)}});
	};
	// icon
	const iconBase64 = currentTile.meta.icon;
	const handleIconBase64Change = (e: ChangeEvent<HTMLInputElement>) => {
		const stringValue = e.currentTarget.value;
		if (isBlobString(stringValue)) updateTile(tileInEditId,
			{meta: {...currentMeta, icon: stringValue}});
	};
	const handleIconUpload = async (file: File) => {
		const blobString: string = await blobToString(file);
		updateTile(tileInEditId, {meta: {...currentMeta, icon: blobString}});
	};
	// remove
	const handleRemove = () => {
		setTileUiVisible(false);
		removeTile(tileInEditId);
	};
	// close
	const handleSubmit = () => {
		setTileUiVisible(false);
	};

	// patch:原组件不支持enter后自动提交并关闭。
	const handleEnterKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
		}
	};

	return (
		<Dialog defaultOpen={false} open={tileUiVisible}
				onOpenChange={(open) => setTileUiVisible(open)}>
			<form onKeyDown={(e) => handleEnterKeyDown(e)}>
				<DialogContent className="sm:max-w-[700px]">
					<DialogHeader className={"hidden"}>
						<DialogTitle>none.</DialogTitle>
						<DialogDescription>none.</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col items-start gap-6 pt-4 px-4">
						{/* 这里是网址 */}
						<InputGroup className={"h-12! placeholder:text-base"}>
							<InputGroupInput
								className="pl-1! text-[20px]! placeholder:text-base"
								onChange={handleUrlChange}
								value={currentTile.url}
								placeholder={"https://"}
							/>
							<InputGroupAddon>
								{/*<InputGroupText className={`text-[16px]`}>https://</InputGroupText>*/}
							</InputGroupAddon>
							<InputGroupAddon align="inline-end">
								<Tooltip>
									<TooltipTrigger asChild>
										<InputGroupButton className="rounded-full" size="icon-xs">
											<Info/>
										</InputGroupButton>
									</TooltipTrigger>
									<TooltipContent>跳转地址</TooltipContent>
								</Tooltip>
							</InputGroupAddon>
						</InputGroup>
						{/* 这里是名字 */}
						<InputGroup className={"h-12! placeholder:text-base"}>
							<InputGroupInput
								className="pl-1! text-[20px]! placeholder:text-base"
								value={currentTile.meta.name}
								onChange={handleNameChange}
								placeholder={"显示名"}
							/>
							<InputGroupAddon>
							</InputGroupAddon>
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
						{/* 这里处理tags */}
						<InputGroup className={"h-12! placeholder:text-base"}>
							<InputGroupInput
								className="pl-1! text-[20px]! placeholder:text-base"
								value={currentTile.meta?.tags?.join(" ") || ""}
								onChange={handleTagChange}
								placeholder={"标签1 标签2 ..."}
							/>
							<InputGroupAddon>
							</InputGroupAddon>
							<InputGroupAddon align="inline-end">
								<Tooltip>
									<TooltipTrigger asChild>
										<InputGroupButton className="rounded-full" size="icon-xs">
											<Info/>
										</InputGroupButton>
									</TooltipTrigger>
									<TooltipContent>填写标签，使用空格分隔</TooltipContent>
								</Tooltip>
							</InputGroupAddon>
						</InputGroup>
						{/* 这里处理Icon */}
						<div className="grid grid-cols-[1fr_minmax(150px,auto)] gap-3 w-full">
							<Input placeholder="图片资源 base64"
								   onChange={handleIconBase64Change}
								   value={iconBase64}
								// placeholder = {currentTile.meta.icon}
								   className="text-gray-400 h-12! text-[16px]! pl-4"
							/>

							<ImgFilePickerBtn onPick={(file) => (handleIconUpload(file))} children={
								<Button type="button" className={"text-[15px] hover:text-primary-foreground h-[46px] bg-[#0078d7] w-full"}>
									<ImageUp/>上传图标
								</Button>
							}/>

						</div>
						<div className="pt-2"/>
						{/*这里是预览*/}
						<TileComponent tile={currentTile} isPreview={true}/>
						{/*这里是删除按钮*/}
						<Trash2 size={26}
								onClick={handleRemove}
								className={cn("absolute left-12 bottom-44 opacity-10",
									"transition-all duration-200",
									"hover:opacity-100",
									"hover:text-red-500",
									"hover:scale-120"
								)}/>

						<div className="pt-4"/>
						<Button type="submit" variant="default" onClick={handleSubmit}
								autoFocus={true} // 默认焦点
								className={"bg-[#0078d7] text-[17px] h-[46px] w-full"}>
							确定
						</Button>
						<div className="pd-[1px]"/>
					</div>
				</DialogContent>
			</form>
		</Dialog>
	);
};