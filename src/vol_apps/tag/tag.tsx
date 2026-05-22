import {Button} from "@/components/ui/button";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
// import {Spinner} from "@/components/ui/spinner";
import {cn} from "@/lib/utils";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {
    BookmarkIcon, TriangleAlert,
    // LoaderCircle,
} from "lucide-react";
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
import {useTagStyleStore} from "@/vol_apps/tag/tag_style_store";
import {Tag_context_menu} from "@/vol_apps/tag/tag_context_menu";

export const BroadMatches = ({isBroadMatches, handleOnClick}: {
    isBroadMatches: boolean,
    handleOnClick?: () => void,
}) => {
    const {t} = useLanguageStore("tagBar");
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

export const TagComponent = () => {
    const {t} = useLanguageStore("tagBar");

    const {
        updateTag, toggleTag, deleteTag, hasUntaggedTiles,
        isBroadMatches, untaggedChecked, tags,
        setIsBroadMatches, deleteTilesWithOnlyThisTag, deleteUntaggedTiles, setUntaggedChecked,
        renameTag
    } = useTileStore();

    const {gap, visible} = useTagStyleStore()

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
                <Tag_context_menu
                    tag={tag}
                    t={t}
                    toggleTag = {toggleTag}
                    deleteTag = {deleteTag}
                    setInputString = {setInputString}
                    setInEdit = {setInEdit}
                    deleteTilesWithOnlyThisTag = {deleteTilesWithOnlyThisTag}
                >
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
                        className={cn({"text-white! bg-sBlue!": tag.checked})}
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
                </Tag_context_menu>
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
                "flex flex-wrap items-center px-8 py-4 mx-auto",
                "w-[88%] min-h-18!",
                "select-none",
                !visible && "hidden",
            )}
                 style={{
                     rowGap: `${gap.x}px`,
                     columnGap: `${gap.y}px`,
                 }}
            >
                {Tags}
                {UntaggedWithMenu}
                <BroadMatches isBroadMatches={isBroadMatches} handleOnClick={
                    () => setIsBroadMatches(!isBroadMatches)
                }/>
                {/*<TagUpdate/>*/}
            </div>
        </>

    );
};
