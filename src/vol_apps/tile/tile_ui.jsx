import {Button}                                                         from "@/components/ui/button";
import {Input}                                                          from "@/components/ui/input";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group";
import {Tooltip, TooltipContent, TooltipTrigger}                        from "@/components/ui/tooltip";
import {cn}                                                             from "@/lib/utils";
import {Tile}                                                           from "@/vol_apps/tile/tile";
import {useTileStore}                                                   from "@/vol_apps/tile/tile_atom";
import {useTileUiStore}                                                 from "@/vol_apps/tile/tile_ui_atom";
import {enhanceUrl}                                                     from "@/vol_apps/tool/enhanceUrl";
import {ImgFilePickerBtn}                                               from "@/vol_apps/tool/filePicker";
import {fileToBase64, isBlobString, stringToBlob}                       from "@/vol_apps/tool/isType";
import {Info, ImageUp, Trash2}                                          from "lucide-react";

import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {useEffect, useState}                                                  from "react";

export function TileUi() {
	const {tiles, updateTile, removeTile} = useTileStore();
	const {tileUiVisible, setTileUiVisible, tileUiInEditId, setTileUiInEditId} = useTileUiStore();
	const currentTile = tiles.find(tile => tile.id === tileUiInEditId);

	const [displayBase64, setDisplayBase64] = useState("");
	useEffect(() => {
		if (currentTile.meta.icon) {
			fileToBase64(currentTile.meta.icon).then(setDisplayBase64);
		}
	}, [currentTile?.id, currentTile?.meta.icon]);

	const handleWebUrlChange = (e) => {
		const url = e.target.value;
		const url_enhanced = enhanceUrl(url);
		updateTile(tileUiInEditId, {href: url_enhanced});
	};

	const handleNameChange = (e) => {
		updateTile(tileUiInEditId,
			{
				name: e.currentTarget.value, meta: {...currentTile.meta, alt: e.currentTarget.value},
			}
		);
	};

	const handleTagChange = (e) => {
		updateTile(tileUiInEditId, {meta: {...currentTile.meta, tags: e.currentTarget.value.split(" "),},});
	};

	const handleBase64Change = async (e) => {
		const value = e.currentTarget.value;
		if (isBlobString(value)) {
			const blob = stringToBlob(value);
			updateTile(tileUiInEditId, {meta: {...currentTile.meta, icon: blob},});
		}
	};

	const handleIconChange = async (file) => {
		updateTile(tileUiInEditId, {meta: {...currentTile.meta, icon: file}});
	};

	const handleRemove = async () => {
		setTileUiVisible(false);
		setTileUiInEditId(0);
		await removeTile(tileUiInEditId);
	};

	const handleSubmit = () => {
		setTileUiVisible(false);
	};

	return (
		<Dialog defaultOpen={false} open={tileUiVisible} onOpenChange={(open) => {
			setTileUiVisible(open);
		}}>
			<form>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader className={"hidden"}>
						<DialogTitle>none.</DialogTitle>
						<DialogDescription>none.</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col items-start gap-6 pt-4 px-4">
						{/* 这里是网址 */}
						<InputGroup className={"h-12! placeholder:text-base"}>
							<InputGroupInput
								className="pl-1! text-[20px]! placeholder:text-base"
								onChange={handleWebUrlChange}
								value={currentTile.href} //href
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
									<TooltipContent>填写瓷砖网址</TooltipContent>
								</Tooltip>
							</InputGroupAddon>
						</InputGroup>
						{/* 这里是名字 */}
						<InputGroup className={"h-12! placeholder:text-base"}>
							<InputGroupInput
								className="pl-1! text-[20px]! placeholder:text-base"
								value={currentTile.name}
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
								   onChange={handleBase64Change}
								   value={displayBase64}
								// placeholder = {currentTile.meta.icon}
								   className="text-gray-400 h-12! text-[16px]! pl-4"
							/>

							<ImgFilePickerBtn onPick={(file) => (handleIconChange(file))} children={
								<Button type="button" className={"text-[15px] hover:text-primary-foreground h-[46px] bg-[#0078d7] w-full"}>
									<ImageUp/>上传图标
								</Button>
							}/>

						</div>
						<div className="pt-2"/>
						{/*这里是预览*/}
						<Tile tile={currentTile} isPreview={true}/>
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
