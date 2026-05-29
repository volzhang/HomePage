import {cn} from "@/lib/utils";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {useTagStyleStore} from "@/vol_apps/tag/tag_style_store";
import {TagItem} from "@/vol_apps/tag/TagItem";
import {TagItem_Untagged} from "@/vol_apps/tag/TagItem_Untagged";

// export const BroadMatches = ({isBroadMatches, handleOnClick}: {
//     isBroadMatches: boolean,
//     handleOnClick?: () => void,
// }) => {
//     const {t} = useLanguageStore("tagBar");
//     return (
//         <HoverCard openDelay={0} closeDelay={0}>
//             <HoverCardTrigger asChild>
//                 <BookmarkIcon onClick={handleOnClick}
//                               className={cn(
//                                   "size-6",
//                                   "hover:-translate-y-px transition-transform duration-250",
//                                   isBroadMatches
//                                       ? "dark:text-border dark:fill-border text-border/20 fill-border/20"
//                                       : "text-sBlue fill-sBlue",
//                               )}/>
//             </HoverCardTrigger>
//             <HoverCardContent className="w-auto" side="bottom" sideOffset={18}>
//                 <div className="text-[13px]">
//                     {(isBroadMatches
//                         ? t("Left-click a tag to select only this one." +
//                             "\nRight-click a tag to open menu for more operations." +
//                             "\nClick me to toggle mode." +
//                             "\nCurrently: tiles match ANY selected tags")
//                         : t("Left-click a tag to select only this one." +
//                             "\nRight-click a tag to open menu for more operations." +
//                             "\nClick me to toggle mode." +
//                             "\nCurrently: tiles match ALL selected tags"))
//                         .split("\n").map((line, i) => (
//                             <div key={i}>{line.trim()}</div>
//                         ))}
//                 </div>
//             </HoverCardContent>
//         </HoverCard>
//     );
// };

export const TagComponent = () => {
    const {
        toggleTag, deleteTag, hasUntaggedTiles,
        // isBroadMatches, setIsBroadMatches,
        untaggedChecked, tags,
        deleteTilesWithOnlyThisTag, deleteUntaggedTiles, setUntaggedChecked,
        renameTag, checkOnlyThisTag, checkOnlyUntagged,
    } = useTileStore();

    const {
        font, fontSize, fontWeight,
        textColor, textOpacity,
        textPadding, radius,
        backgroundColor, backgroundOpacity,
    } = useTagStyleStore();

    const {gap, visible} = useTagStyleStore()

    const Tags = tags.map(tag => (
        <TagItem key={tag.id}
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

    const UntaggedWithMenu =
        <TagItem_Untagged
            hasUntaggedTiles={hasUntaggedTiles()}
            untaggedChecked={untaggedChecked}
            setUntaggedChecked={setUntaggedChecked}
            deleteUntaggedTiles={deleteUntaggedTiles}
            checkOnlyUntagged={checkOnlyUntagged}
            tagStyles={{
                font, fontSize, fontWeight, textColor, textOpacity, textPadding,
                backgroundColor, backgroundOpacity, radius
            }}
        />

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
                {/*<BroadMatches isBroadMatches={isBroadMatches} handleOnClick={*/}
                {/*    () => setIsBroadMatches(!isBroadMatches)*/}
                {/*}/>*/}
            </div>
        </>
    );
};
