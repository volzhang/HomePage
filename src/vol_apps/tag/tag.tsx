import {Button} from "@/components/ui/button";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {cn} from "@/lib/utils";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {BookmarkIcon, TriangleAlert} from "lucide-react";

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuLabel,
    ContextMenuGroup, ContextMenuSubTrigger, ContextMenuSubContent, ContextMenuSub
} from "@/components/ui/context-menu";

import {useLanguageStore} from "@/vol_apps/language/language_store";
import {useTagStyleStore} from "@/vol_apps/tag/tag_style_store";
import {NewTagItem} from "@/vol_apps/tag/TagItem";

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
        renameTag, checkOnlyThisTag,
    } = useTileStore();

    const {
        font, fontSize, fontWeight,
        textColor, textOpacity,
        textPadding, radius,
        backgroundColor, backgroundOpacity,
    } = useTagStyleStore();

    const {gap, visible} = useTagStyleStore()

    const Tags = tags.map(tag => (
        <NewTagItem key={tag.id}
                    tag={tag}
                    checkOnlyThisTag={checkOnlyThisTag}
                    toggleTag={toggleTag}
                    deleteTag={deleteTag}
                    renameTag={renameTag}
                    deleteTilesWithOnlyThisTag={deleteTilesWithOnlyThisTag}
                    tagStyles={{
                        font, fontSize, fontWeight, textColor, textOpacity, textPadding,
                        backgroundColor, backgroundOpacity, radius
                    }}
        />
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
                "w-[88%] min-h-18! select-none",
                !visible && "hidden",
            )}
                 style={{
                     rowGap: `${gap.y}px`,
                     columnGap: `${gap.x}px`,
                 }}
            >
                {Tags}
                {UntaggedWithMenu}
                <BroadMatches isBroadMatches={isBroadMatches} handleOnClick={
                    () => setIsBroadMatches(!isBroadMatches)
                }/>
            </div>
        </>
    );
};
