import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group";
import {Spinner} from "@/components/ui/spinner";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {cn} from "@/lib/utils";
import {TileComponent} from "@/vol_apps/tile/tile";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {apiFaviconVemetric} from "@/vol_apps/tool/apiFaviconVemetric";
import {enhanceUrl, extractMainDomain, looksLikeDomain, openInNewTab} from "@/vol_apps/tool/enhanceUrl";
import {ImgFilePickerBtn} from "@/vol_apps/tool/filePicker";
import {blobToString, isBlobString} from "@/vol_apps/tool/isType";
import {HoverCard, HoverCardContent, HoverCardTrigger,} from "@/components/ui/hover-card";
import {ImageUp, Info, Trash2, FileSearchCorner} from "lucide-react";

import {type ChangeEvent, type KeyboardEvent, useRef, useState} from "react";
import {useTranslation} from "react-i18next";

export const TileUi = () => {
	// i18n
	const {t} = useTranslation("tile");

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
		const url = e.target.value;
		if (URL.canParse(url)) {
			updateTile(tileInEditId, {...currentTile, url});
		} else {
			updateTile(tileInEditId, {...currentTile, url: enhanceUrl(url)});
		}
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

	// get_icon
	const try_handle_name = (url: string) => {
		if (URL.canParse(url)) {
			const name = extractMainDomain(url);
			const latestTile = useTileStore.getState().tiles.find(t => t.id === tileInEditId);
			updateTile(tileInEditId, {meta: {...latestTile!.meta, name}});
		}
	};

	const try_handle_icon = async (url: string) => {

		if (urlChanged){
			if (!URL.canParse(url) || !looksLikeDomain(url)) return;
			setIsFetchingIcon(true);
			try {
				const icon = await apiFaviconVemetric(url, 96);
				if (icon) {
					const latestTile = useTileStore.getState().tiles.find(t => t.id === tileInEditId);
					updateTile(tileInEditId, {meta: {...latestTile!.meta, icon}});
				}
			} finally {
				setUrlChanged(false);
				setIsFetchingIcon(false);
			}
		}


	};

	// patch:原组件不支持enter后自动提交并关闭。
	// 在焦点在input中，先聚焦btn。
	// 当焦点在btn时，触发提交和关闭。
	const ref = useRef<HTMLButtonElement | null>(null);
	const handleEnterKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (document.activeElement === ref.current) {
				handleSubmit();
			} else {
				ref.current!.focus();
			}
		}
	};

	// 用于 fetch icon 时的状态
	const [isFetchingIcon, setIsFetchingIcon] = useState<boolean>(false);
	const [urlChanged, setUrlChanged] = useState<boolean>(false);

	return (
		<Dialog defaultOpen={false} open={tileUiVisible}
				onOpenChange={(open) => setTileUiVisible(open)}>
			<form onKeyDown={(e) => handleEnterKeyDown(e)}>
				<DialogContent className="sm:max-w-[700px]">
					<DialogHeader className={"hidden"}>
						<DialogTitle>none.</DialogTitle>
						<DialogDescription>none.</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col items-start gap-6 pt-6 px-4">
						{/* 这里是网址 */}
						<InputGroup className={"h-12! placeholder:text-base"}>
							<InputGroupInput
								className="pl-1! text-[20px]! placeholder:text-base"
								onChange={(e) => {
									handleUrlChange(e);
									try_handle_name(e.target.value);
									setUrlChanged(true);
								}}
								onBlur={async () => {
									await try_handle_icon(currentTile.url);
								}}
								value={currentTile.url}
								placeholder={"https://..."}
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
									<TooltipContent>
										{t("Link")}
									</TooltipContent>
								</Tooltip>
							</InputGroupAddon>
						</InputGroup>
						{/* 这里是名字 */}
						<InputGroup className={"h-12! placeholder:text-base"}>
							<InputGroupInput
								className="pl-1! text-[20px]! placeholder:text-base"
								value={currentTile.meta.name}
								onChange={handleNameChange}
								placeholder=
									{t("Display Name")}
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
									<TooltipContent>
										{t("Display Name")}
									</TooltipContent>
								</Tooltip>
							</InputGroupAddon>
						</InputGroup>
						{/* 这里处理tags */}
						<InputGroup className={"h-12! placeholder:text-base"}>
							<InputGroupInput
								className="pl-1! text-[20px]! placeholder:text-base"
								value={currentTile.meta?.tags?.join(" ") || ""}
								onChange={handleTagChange}
								placeholder={t("tag1 tag2 tag3 ...")}
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
									<TooltipContent>{t("Tags (space-separated)")}</TooltipContent>
								</Tooltip>
							</InputGroupAddon>
						</InputGroup>
						{/* 这里处理Icon */}
						<div className="grid grid-cols-[1fr_minmax(150px,auto)] gap-3 w-full">
							<Input
								// placeholder="base64"
								onClick={(e) => e.currentTarget.select()}
								onChange={handleIconBase64Change}
								placeholder={currentTile.meta.icon}
								className="text-gray-400 h-12! text-[16px]! pl-4"
							/>

							<ImgFilePickerBtn onPick={(file) => (handleIconUpload(file))} children={
								<Button type="button" className={"text-[15px] hover:text-primary-foreground h-[46px] bg-[#0078d7] w-full"}>
									<ImageUp/>{t("Upload Icon")}
								</Button>
							}/>

						</div>
						<div className="pt-2"/>
						{/*这里是预览*/}
						<TileComponent tile={currentTile} isPreview={true}
									   customIcon={isFetchingIcon ? <Spinner className={"size-24 text-[#0078d7]"}/> : null}
									   customName={isFetchingIcon ? t("Fetching Icon") : ""}
						/>
						{/*这里是删除按钮*/}
						<HoverCard openDelay={0} closeDelay={0}>
							<HoverCardTrigger asChild>
								<Trash2 size={26}
										onClick={handleRemove}
										className={cn("absolute left-12 bottom-44 opacity-10",
											"transition-all duration-200",
											"hover:opacity-100",
											"hover:text-red-500",
											"hover:scale-125"
										)}/>
							</HoverCardTrigger>
							<HoverCardContent className="w-auto" side="top" sideOffset={16}>
								<div className={"text-gray-400 text-[13px]"}>
									{t("Delete Tile")}
								</div>
							</HoverCardContent>
						</HoverCard>
						{/*这里是自动获取icon按钮*/}
						<HoverCard openDelay={0} closeDelay={0}>
							<HoverCardTrigger asChild>
								<FileSearchCorner size={26}
												  onClick={async () => {
													  const name = currentTile.meta.name;
													  // window.open(`https://www.bing.com/images/search?pq=icon+${name}&q=icon+${name}&qft=+filterui:imagesize-small&first=1`);
													  openInNewTab(`https://www.bing.com/images/search?pq=icon+${name}&q=icon+${name}&qft=+filterui:imagesize-small&first=1`);
												  }}

												  className={cn("absolute right-12 bottom-44 opacity-10",
													  "transition-all duration-200",
													  "hover:opacity-100",
													  "hover:text-[#0078d7]",
													  "hover:scale-120"
												  )}/>
							</HoverCardTrigger>
							<HoverCardContent className="w-auto" side="top" sideOffset={16}>
								<div className={"text-gray-400 text-[13px]"}>
									{t("Search Icon")}
								</div>
							</HoverCardContent>
						</HoverCard>

						<div className="pt-4"/>
						<Button type="submit" variant="default" onClick={handleSubmit}
								autoFocus={true} // 默认焦点
								ref={ref}
								className={"bg-[#0078d7] text-[17px] h-[46px] w-full"}>
							{t("OK")}
						</Button>
						<div className="pd-[1px]"/>


					</div>
				</DialogContent>
			</form>
		</Dialog>
	);
};
