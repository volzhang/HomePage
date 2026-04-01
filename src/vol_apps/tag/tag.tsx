import {Button} from "@/components/ui/button";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {Spinner} from "@/components/ui/spinner";
import {cn} from "@/lib/utils";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {BookmarkIcon, LoaderCircle,} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {type Tag} from "@/vol_apps/tile/tile_store_types.js"

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuLabel,
    ContextMenuGroup
} from "@/components/ui/context-menu";

import {t} from "i18next";
import {AutoWidthInput} from "@/vol_apps/tool/component/input.js";

export const BroadMatches = ({isBroadMatches, handleOnClick}: {
    isBroadMatches: boolean,
    handleOnClick?: () => void,
}) => {
    const {t} = useTranslation("tag");
    return (
        <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
                <BookmarkIcon onClick={handleOnClick}
                              className={cn(
                                  "size-6",
                                  isBroadMatches
                                      ? "text-ring hover:text-[#0078d7]"
                                      : "text-[#0078d7] fill-[#0078d7]",
                              )}/>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto" side="bottom" sideOffset={18}>
                <div className="text-[13px]">
                    {t(
                        "Left-click a tag to select only this one.\nRight-click a tag to open menu for more operations.\nClick me to toggle mode.\nCurrently: tiles match {{mode}} selected tags",
                        {mode: isBroadMatches ? t("ANY") : t("ALL")}
                    )
                        .split("\n").map((line, i) => (
                            <div key={i}>{line.trim()}</div>
                        ))}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

export const TagUpdate = () => {
    const {t} = useTranslation("tag");
    const {tiles, updateTags} = useTileStore();
    const [isUpdate, setIsUpdate] = useState<boolean>(false);

    const handleClick = () => {
        setIsUpdate(true);
        const timerPromise = new Promise(resolve => setTimeout(resolve, 1000));
        const updatePromise = Promise.resolve().then(() => updateTags(tiles));
        Promise.all([timerPromise, updatePromise]).finally(() => {
            setIsUpdate(false);
        });
    };

    return (
        <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
                {isUpdate
                    ? <Spinner className={"size-6 text-[#0078d7]"}></Spinner>
                    : <LoaderCircle className={"size-6 text-ring hover:text-[#0078d7]"} onClick={handleClick}/>}
            </HoverCardTrigger>
            <HoverCardContent className="w-auto" side="bottom" sideOffset={18}>
                <div className="text-[13px]">
                    {t("Click to sync tags")}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

export const TagComponent = () => {

    const {
        updateTag, toggleTag, deleteTag, hasUntaggedTiles, isBroadMatches,
        untaggedChecked, setUntaggedChecked, renameTag, tags, setIsBroadMatches,
    } = useTileStore();

    const TagItem = ({tag}: { tag: Tag }) => {
        const {t} = useTranslation("tag");

        const [inputString, setInputString] = useState<string>(tag.name)
        const [inEdit, setInEdit] = useState<boolean>(false);
        const inputRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
            if (inEdit) {
                // 延迟一点，确保 AutoWidthInput 已经渲染
                const id = setTimeout(() => {
                    inputRef.current?.focus();
                    const len = inputString.length;
                    inputRef.current?.setSelectionRange(len, len);
                }, 300);
                return () => clearTimeout(id);
            }
        }, [inEdit, inputString]);

        return (
            <>
                <ContextMenu>
                    <ContextMenuTrigger>
                        <AutoWidthInput
                            ref={inputRef}
                            inputValue={inputString}
                            onValueChange={setInputString}
                            handleOnClick={() => {
                                if (!inEdit) {
                                    tags.forEach(item => updateTag(item.id, {checked: item.id === tag.id}));
                                    if (untaggedChecked) setUntaggedChecked(false);
                                }
                            }}
                            inEdit={inEdit}
                            className={cn({"text-white! bg-[#0078d7]!": tag.checked},)}
                            inputProps={
                                {

                                    onBlur: () => {
                                        renameTag(tag.id, inputString)
                                        setInEdit(false)
                                    },
                                    onKeyDown: (e) => {
                                        if (e.key === "Enter") {
                                            e.currentTarget.blur();
                                        }
                                        if (e.key === "Escape") {
                                            setInputString(tag.name);
                                            setInEdit(false);
                                        }
                                    },
                                }
                            }
                        />
                    </ContextMenuTrigger>
                    <ContextMenuContent avoidCollisions={false} alignOffset={18}>
                        <ContextMenuGroup>
                            <ContextMenuLabel className="text-[#0078d7] font-bold">
                                {tag.name}
                            </ContextMenuLabel>
                            <ContextMenuItem onClick={() => toggleTag(tag.id)}>{t("Toggle selection")}</ContextMenuItem>
                            <ContextMenuItem onClick={() => {
                                setInputString(tag.name)
                                setInEdit(true)
                            }}>
                                {t("Rename")}
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => deleteTag(tag.id)}>{t("Delete")}</ContextMenuItem>
                        </ContextMenuGroup>
                    </ContextMenuContent>
                </ContextMenu>
            </>

        );
    };

    const Tags = tags.map(tag => (
        <TagItem key={tag.id} tag={tag}/>
    ));

    const Untagged = hasUntaggedTiles() || untaggedChecked ?
        <Button variant={untaggedChecked ? "default" : "outline"}
                onClick={() => {
                    setUntaggedChecked(true)
                    tags.map(items => {
                        updateTag(items.id, {checked: false})
                    });
                }}
                className={cn(untaggedChecked
                    ? "text-white bg-[#0078d7] hover:bg-[#0078d7] border-none select-none"
                    : "border-none"
                )
                }>
            {t("Untagged")}
        </Button>
        : null

    const UntaggedWithMenu = (<>
        <ContextMenu>
            <ContextMenuTrigger>
                {Untagged}
            </ContextMenuTrigger>
            <ContextMenuContent avoidCollisions={false} alignOffset={18}>
                <ContextMenuGroup>
                    <ContextMenuLabel className="text-[#0078d7] font-bold">
                        {t("Untagged")}
                    </ContextMenuLabel>
                    <ContextMenuItem onClick={() => setUntaggedChecked(!untaggedChecked)}>
                        {t("Toggle selection")}
                    </ContextMenuItem>
                    <ContextMenuItem disabled={true}>{t("Rename")}</ContextMenuItem>
                    <ContextMenuItem disabled={true}>{t("Delete")}</ContextMenuItem>
                </ContextMenuGroup>
            </ContextMenuContent>
        </ContextMenu>
    </>)

    return (
        <>
            <div className={cn(
                "animate-fade-in-scale",
                "flex flex-wrap items-center px-8 py-4 gap-4 mx-auto",
                "w-[85%] min-h-18!",
                "select-none",
            )}>
                {Tags}
                {UntaggedWithMenu}
                <BroadMatches isBroadMatches={isBroadMatches} handleOnClick={
                    () => setIsBroadMatches(!isBroadMatches)
                }/>
                <TagUpdate/>

            </div>
        </>

    );
};