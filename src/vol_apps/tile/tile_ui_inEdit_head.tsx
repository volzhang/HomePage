import {cn} from "@/lib/utils";
import {LoaderCircle, Search} from "lucide-react";
import type {TileLogic} from "@/vol_apps/tile/useTileLogic";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {Spinner} from "@/components/ui/spinner";
import {ImgFilePickerBtn} from "@/vol_apps/tile/ImgFilePickerBtn";
import {TextareaField} from "@/vol_apps/tile/TextareaField";
import {enhanceUrl} from "@/vol_apps/tool/action/enhanceUrl";


const CLASS_BASE_OUTLINE = "flex flex-col px-0 mx-6 mb-12 mt-2 gap-4"
const CLASS_BASE = "flex w-full";
const CLASS_P = "flex items-center justify-start font-bold text-lg w-16 shrink-0"; // 左侧固定宽度
const CLASS_OUTLINE = cn("flex py-2 pl-3 pr-1 border rounded-md flex-1",
    "focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:border-transparent",
    "transition-ring duration-300 ease-in-out"
); // 中间自适应
const CLASS_INFO = "flex w-fit items-center text-md ml-auto"; // 右侧固定宽度
const CLASS_INNER = "w-full h-[28px] text-lg";
const CLASS_TEXTAREA = cn("resize-none outline-none overflow-hidden bg-background text-foreground", CLASS_INNER);

export const Tile_ui_inEdit_head = (
    {
        t,
        isFetchingIcon,
        handleAutoFetchIcon,
        handleSearchIcon,

        link, setLink, try_handle_name, try_handle_icon, link_ref,
        name, setName,

        iconFileName, handleIconFilePick,

        tag, handleTagChange,

        ok_ref,
    }
    : TileLogic
) => {
    return (
        <div className={CLASS_BASE_OUTLINE}>
            {/* LINK */}
            <div className={CLASS_BASE}>
                <p className={CLASS_P}>{t("Link")}</p>
                <div className={CLASS_OUTLINE}>
                    <TextareaField ref={link_ref}
                                   className={cn(CLASS_TEXTAREA, "break-all")}
                                   placeholder="https://"
                                   transform={enhanceUrl}
                                   onLiveChange={setLink}
                                   onCommit={async (v) => {
                                       setLink(v)
                                       try_handle_name(v)
                                       await try_handle_icon()
                                   }}
                                   enterFocusRef={ok_ref}
                                   value={link}
                    />
                </div>

                <div className={cn(CLASS_INFO, "pl-4 pr-2 gap-4")}>
                    <HoverCard openDelay={0} closeDelay={0}>
                        <HoverCardTrigger asChild>
                            {
                                isFetchingIcon
                                    ? <Spinner strokeWidth={3} className={"size-7 text-sBlue"}></Spinner>
                                    : <LoaderCircle strokeWidth={3} className={"size-7 hover:text-sBlue"}
                                                    onClick={handleAutoFetchIcon}/>
                            }
                        </HoverCardTrigger>
                        <HoverCardContent className="w-auto" side="top" sideOffset={18}>
                            <div className="text-[13px]">
                                {t("Auto-fetch icon")}
                            </div>
                        </HoverCardContent>
                    </HoverCard>

                    <HoverCard openDelay={0} closeDelay={0}>
                        <HoverCardTrigger asChild>
                            <Search
                                onClick={handleSearchIcon}
                                strokeWidth={3}
                                className="hover:text-sBlue size-7"/>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-auto" side="top" sideOffset={18}>
                            <div className="text-[13px]">
                                {t("Search Bing for icon")}
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                </div>
            </div>

            {/* NAME */}
            <div className={CLASS_BASE}>
                <p className={CLASS_P}>{t("Name")}</p>
                <div className={CLASS_OUTLINE}>
                    <TextareaField
                        className={cn(CLASS_TEXTAREA, "break-all")}
                        value={name}
                        onCommit={setName}
                        onLiveChange={setName}
                        enterFocusRef={ok_ref}
                    />
                </div>
            </div>

            {/* TAG */}

            <div className={CLASS_BASE}>
                <HoverCard openDelay={0} closeDelay={0}>
                    <HoverCardTrigger asChild>
                        <p className={CLASS_P}>{t("Tags")}</p>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-auto" side="left" sideOffset={18}>
                        <div className="text-[13px]">
                            {t("Tags (space-separated)")}
                        </div>
                    </HoverCardContent>
                </HoverCard>

                <div className={CLASS_OUTLINE}>
                    <TextareaField
                        className={cn(CLASS_TEXTAREA, "wrap-break-word")}
                        placeholder="Display Name"
                        value={tag}
                        onCommit={handleTagChange}
                        enterFocusRef={ok_ref}
                    />
                </div>
            </div>

            {/* ICON */}

            <div className={cn(CLASS_BASE, "")}>
                <p className={CLASS_P}>{t("Icon")}</p>
                <ImgFilePickerBtn
                    className={CLASS_OUTLINE}
                    inputClassName={cn(CLASS_TEXTAREA, "break-all")}
                    fileName={iconFileName}
                    onFilePick={handleIconFilePick}
                />
            </div>
        </div>
    )
}