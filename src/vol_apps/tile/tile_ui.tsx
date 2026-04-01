import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group";
import {Spinner} from "@/components/ui/spinner";
import {cn} from "@/lib/utils";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {blobToString, isBlobString} from "@/vol_apps/tool/a2b/blobToString";
import {openLinkInNewTab} from "@/vol_apps/tool/action/openLink";
import {apiFaviconVemetric} from "@/vol_apps/tool/api/apiFaviconVemetric";
import {isDomain} from "@/vol_apps/tool/isType/isDomain";
import {enhanceUrl, extractMainDomain} from "@/vol_apps/tool/action/enhanceUrl";
import {ImgFilePickerBtn} from "@/vol_apps/tool/action/filePicker";
import {HoverCard, HoverCardContent, HoverCardTrigger,} from "@/components/ui/hover-card";
import {ImageUp, Info, Trash2, FileSearchCorner} from "lucide-react";
import {TileComponent} from "@/vol_apps/tile/tile_component.js"
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

    const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        if (URL.canParse(url)) {
            updateTile(tileInEditId, {url});
        } else {
            updateTile(tileInEditId, {url: enhanceUrl(url)});
        }
    };

    // name
    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        updateTile(tileInEditId, {meta: {name: e.currentTarget.value}});
    };
    // tag
    const handleTagChange = (e: ChangeEvent<HTMLInputElement>) => {
        //input组件输入一个string值时，至少输入的是""，
        //不会输入完全的空值
        const splitString = " ";
        let newTags = e.target.value.split(splitString);
        const inputIsEmpty = (newTags.length === 1 && newTags[0] === "")
        if (inputIsEmpty) newTags = []
        updateTile(tileInEditId, {meta: {tags: newTags}});
    };

    // icon
    const handleIconBase64Change = (e: ChangeEvent<HTMLInputElement>) => {
        const stringValue = e.currentTarget.value;
        if (isBlobString(stringValue)) updateTile(tileInEditId,
            {meta: {icon: stringValue}});
    };
    const handleIconUpload = async (file: File) => {
        const blobString: string = await blobToString(file);
        updateTile(tileInEditId, {meta: {icon: blobString}});
    };

    // remove
    const handleRemove = () => {
        setTileUiVisible(false);
        removeTile(tileInEditId);
    };

    // close
    const handleSubmit = () => setTileUiVisible(false);

    // get_icon
    const try_handle_name = (url: string) => {
        if (URL.canParse(url)) {
            const name = extractMainDomain(url);
            updateTile(tileInEditId, {meta: {name}});
        }
    };

    const try_handle_icon = async (url: string) => {

        if (urlChanged) {
            if (!URL.canParse(url) || !isDomain(url)) return;
            setIsFetchingIcon(true);
            try {
                const icon = await apiFaviconVemetric(url, 96);
                if (icon) updateTile(tileInEditId, {meta: {icon}});
            } finally {
                setUrlChanged(false);
                setIsFetchingIcon(false);
            }
        }

    };

    // patch:原组件不支持enter后自动提交并关闭。
    // 在焦点在input中，先聚焦btn。
    // 当焦点在btn时，触发提交和关闭。
    const ref_url = useRef<HTMLInputElement | null>(null);
    const ref_name = useRef<HTMLInputElement | null>(null);
    const ref_tags = useRef<HTMLInputElement | null>(null);
    const ref_icon = useRef<HTMLInputElement | null>(null);

    const ref_ok = useRef<HTMLButtonElement | null>(null);

    const handleEnterKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (document.activeElement === ref_url.current
                || document.activeElement === ref_name.current
                || document.activeElement === ref_tags.current
                || document.activeElement === ref_icon.current
            ) {
                ref_ok.current!.focus();
            } else {
                handleSubmit();
            }
        }
    };

    // 用于 fetch icon 时的状态
    const [isFetchingIcon, setIsFetchingIcon] = useState<boolean>(false);
    const [urlChanged, setUrlChanged] = useState<boolean>(false);
    // const bg_and_text_color = "bg-secondary text-secondary-foreground"

    return (
        <Dialog defaultOpen={false} open={tileUiVisible}
                onOpenChange={(open) => setTileUiVisible(open)}>
            <form onKeyDown={(e) => handleEnterKeyDown(e)}>
                <DialogContent className={cn("sm:max-w-[700px]",
                    // 这里是UI颜色
                    "bg-card text-card-foreground"
                )}>
                    <DialogHeader className={"hidden"}>
                        <DialogTitle></DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-start gap-6 pt-6 px-4">
                        {/* 这里是网址 */}
                        <InputGroup className={"h-12! placeholder:text-base"}>
                            <InputGroupInput
                                ref={ref_url}
                                className="pl-4! text-[20px]!"
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
                            <InputGroupAddon align="inline-end">
                                <HoverCard openDelay={0} closeDelay={0}>
                                    <HoverCardTrigger asChild>
                                        <InputGroupButton className="rounded-full" size="icon-xs">
                                            <Info/>
                                        </InputGroupButton>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-auto"
                                                      side="right"
                                                      sideOffset={6}>
                                        <div className={"text-[13px]"}>
                                            {t("Link")}
                                        </div>
                                    </HoverCardContent>
                                </HoverCard>
                            </InputGroupAddon>
                        </InputGroup>
                        {/* 这里是名字 */}
                        <InputGroup className={"h-12! placeholder:text-base"}>
                            <InputGroupInput
                                ref={ref_name}
                                className="pl-4! text-[20px]!"
                                value={currentTile.meta.name}
                                onChange={handleNameChange}
                                placeholder=
                                    {t("Display Name")}
                            />
                            <InputGroupAddon align="inline-end">
                                <HoverCard openDelay={0} closeDelay={0}>
                                    <HoverCardTrigger asChild>
                                        <InputGroupButton className="rounded-full" size="icon-xs">
                                            <Info/>
                                        </InputGroupButton>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-auto"
                                                      side="right"
                                                      sideOffset={6}>
                                        <div className={"text-[13px]"}>
                                            {t("Display Name")}
                                        </div>
                                    </HoverCardContent>
                                </HoverCard>
                            </InputGroupAddon>
                        </InputGroup>
                        {/* 这里处理tags */}
                        <InputGroup className={"h-12! placeholder:text-base"}>
                            <InputGroupInput
                                ref={ref_tags}
                                className="pl-4! text-[20px]!"
                                value={currentTile.meta?.tags?.join(" ") || ""}
                                onChange={handleTagChange}
                                placeholder={t("tag1 tag2 tag3 ...")}
                            />
                            <InputGroupAddon align="inline-end">
                                <HoverCard openDelay={0} closeDelay={0}>
                                    <HoverCardTrigger asChild>
                                        <InputGroupButton className="rounded-full" size="icon-xs">
                                            <Info/>
                                        </InputGroupButton>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-auto"
                                                      side="right"
                                                      sideOffset={6}>
                                        <div className={"text-[13px]"}>
                                            {t("Tags (space-separated)")}
                                        </div>
                                    </HoverCardContent>
                                </HoverCard>
                            </InputGroupAddon>
                        </InputGroup>
                        {/* 这里处理Icon */}
                        <div className="grid grid-cols-[1fr_minmax(150px,auto)] gap-3 w-full">
                            <Input
                                // placeholder="base64"
                                ref={ref_icon}
                                onClick={(e) => e.currentTarget.select()}
                                onChange={handleIconBase64Change}
                                placeholder={currentTile.meta.icon}
                                className="text-gray-400 h-12! text-[16px]! pl-4"
                            />

                            <ImgFilePickerBtn onPick={(file) => (handleIconUpload(file))} children={
                                <Button type="button" variant={"secondary"} className={cn(
                                    "text-[15px] h-[46px] w-full",
                                    "hover:bg-sBlue",
                                    "hover:text-white",)
                                }>
                                    <ImageUp/>
                                    {t("Upload Icon")}
                                </Button>
                            }/>

                        </div>
                        <div className="pt-2"/>
                        {/*这里是预览*/}
                        <TileComponent
                            tile={currentTile}
                            interactive={false}
                            iconSlot={isFetchingIcon ? <Spinner className="size-24 text-[#0078d7]"/> : undefined}
                            nameSlot={isFetchingIcon ? <div>{t("Fetching Icon")}</div> : undefined}
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
                                                      openLinkInNewTab(`https://www.bing.com/images/search?pq=icon+${name}&q=icon+${name}&qft=+filterui:imagesize-small&first=1`);
                                                  }}

                                                  className={cn("absolute right-12 bottom-44 opacity-10",
                                                      "transition-all duration-200",
                                                      "hover:opacity-100",
                                                      "hover:text-[#0078d7]",
                                                      "hover:scale-120"
                                                  )}/>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-auto" side={"top"} sideOffset={16}>
                                <div className={"text-gray-400 text-[13px]"}>
                                    {t("Search Icon")}
                                </div>
                            </HoverCardContent>
                        </HoverCard>

                        <div className="pt-4"/>
                        <Button type="submit" variant={"secondary"} onClick={handleSubmit}
                                autoFocus={true}
                                ref={ref_ok}
                                className={cn("text-[17px]! h-[46px]! w-full!",
                                    "hover:bg-[#0078d7]",
                                    "hover:text-white",)}>
                            {t("OK")}
                        </Button>
                        <div className="pd-[1px]"/>
                    </div>
                </DialogContent>
            </form>
        </Dialog>
    );
};
