import {Button} from "@/components/ui/button";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {Spinner} from "@/components/ui/spinner";
import {cn} from "@/lib/utils";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {BookmarkIcon, LoaderCircle, TriangleAlert } from "lucide-react";
import {useEffect, useRef, useState} from "react";
import {type Tag} from "@/vol_apps/tile/tile_store_types.js"

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuLabel,
    ContextMenuGroup, ContextMenuSubTrigger, ContextMenuSubContent, ContextMenuSub
} from "@/components/ui/context-menu";

import {AutoWidthInput} from "@/vol_apps/tool/component/input.js";
import {useLanguageStore} from "@/vol_apps/language/language_store";

export const BroadMatches = ({isBroadMatches, handleOnClick}: {
    isBroadMatches: boolean,
    handleOnClick?: () => void,
}) => {
    const {t} = useLanguageStore();
    return (
        <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
                <BookmarkIcon onClick={handleOnClick}
                              className={cn(
                                  "size-6",
                                  isBroadMatches
                                      ? "text-ring hover:text-sBlue"
                                      : "text-sBlue fill-sBlue",
                              )}/>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto" side="bottom" sideOffset={18}>
                <div className="text-[13px]">
                    {(isBroadMatches
                        ? t("Left-click a tag to select only this one." +
                            "\nRight-click a tag to open menu for more operations." +
                            "\nClick me to toggle mode." +
                            "\nCurrently: tiles match ANY selected tags")
                        : t("Left-click a tag to select only this one." +
                            "\nRight-click a tag to open menu for more operations." +
                            "\nClick me to toggle mode." +
                            "\nCurrently: tiles match ALL selected tags"))
                        .split("\n").map((line, i) => (
                            <div key={i}>{line.trim()}</div>
                        ))}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

export const TagUpdate = () => {
    const {t} = useLanguageStore()
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
                    ? <Spinner className={"size-6 text-sBlue"}></Spinner>
                    : <LoaderCircle className={"size-6 text-ring hover:text-sBlue"} onClick={handleClick}/>}
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
    const {t} = useLanguageStore();

    const {
        updateTag, toggleTag, deleteTag, hasUntaggedTiles, isBroadMatches,
        untaggedChecked,  tags,
        setIsBroadMatches, deleteTilesWithOnlyThisTag,deleteUntaggedTiles,setUntaggedChecked,renameTag
    } = useTileStore();

    const TagItem = ({tag}: { tag: Tag }) => {

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
                            className={cn({"text-white! bg-sBlue!": tag.checked},)}
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
                            <ContextMenuLabel className="text-sBlue font-bold">
                                {tag.name}
                            </ContextMenuLabel>
                            <ContextMenuItem onClick={() => toggleTag(tag.id)}>{t("Toggle selection")}</ContextMenuItem>
                            <ContextMenuItem onClick={() => {
                                setInputString(tag.name)
                                setInEdit(true)
                            }}>
                                {t("Rename")}
                            </ContextMenuItem>
                            <ContextMenuSub>
                                <ContextMenuSubTrigger className={""}>
                                    {/*<TriangleAlert className={"mr-2 text-red-500"}/>*/}
                                    {t("Delete")}
                                </ContextMenuSubTrigger>
                                <ContextMenuSubContent className="">
                                    <ContextMenuItem onClick={() => deleteTag(tag.id)}>
                                        <TriangleAlert className={"mr-2 text-red-500"}/>
                                        {t("Delete this tag from tiles")}
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => deleteTilesWithOnlyThisTag(tag.id)} className={""}>
                                        <TriangleAlert className={"mr-2 text-red-500"}/>
                                        {t("Delete Tiles with only this tag")}
                                    </ContextMenuItem>
                                </ContextMenuSubContent>
                            </ContextMenuSub>
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
                    ? "text-white bg-sBlue hover:bg-sBlue border-none select-none"
                    : "border-none"
                )
                }>
            {t("UntaggedTiles")}
        </Button>
        : null

    const UntaggedWithMenu = (<>
        <ContextMenu>
            <ContextMenuTrigger>
                {Untagged}
            </ContextMenuTrigger>
            <ContextMenuContent avoidCollisions={false} alignOffset={18}>
                <ContextMenuGroup>
                    <ContextMenuLabel className="text-sBlue font-bold">
                        {t("UntaggedTiles")}
                    </ContextMenuLabel>
                    <ContextMenuItem onClick={() => setUntaggedChecked(!untaggedChecked)}>
                        {t("Toggle selection")}
                    </ContextMenuItem>
                    <ContextMenuSub>
                        <ContextMenuSubTrigger className={""}>
                            {/*<TriangleAlert className={"mr-2 text-red-500"}/>*/}
                            {t("Delete")}
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="">
                            <ContextMenuItem onClick={() => deleteUntaggedTiles()}>
                                <TriangleAlert className={"mr-2 text-red-500"}/>
                                {t("Delete Untagged Tiles")}
                            </ContextMenuItem>
                        </ContextMenuSubContent>
                    </ContextMenuSub>
                </ContextMenuGroup>
            </ContextMenuContent>
        </ContextMenu>
    </>)

    return (
        <>
            <div className={cn(
                "animate-fade-in-scale",
                "flex flex-wrap items-center px-8 py-4 gap-4 mx-auto",
                "w-[88%] min-h-18!",
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
