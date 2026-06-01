import {cn} from "@/lib/utils";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {TagItem} from "@/vol_apps/tag/TagItem";
import {useTagStyleAtom} from "@/vol_apps/tag/TagStyleAtom.ts";

export const TagComponent = () => {
    const {
        toggleTag, deleteTag, hasUntaggedTiles,
        untaggedChecked, tags,
        deleteTilesWithOnlyThisTag, deleteUntaggedTiles, setUntaggedChecked,
        renameTag, checkOnlyThisTag, checkOnlyUntagged,
    } = useTileStore();

    const tagStyles = useTagStyleAtom();

    const Tags = tags.map(tag => (
        <TagItem key={tag.id}
                 type={"tag"}
                 tag={tag}
                 checkOnlyThisTag={checkOnlyThisTag}
                 toggleTag={toggleTag}
                 deleteTag={deleteTag}
                 renameTag={renameTag}
                 deleteTilesWithOnlyThisTag={deleteTilesWithOnlyThisTag}
                 tagStyles={tagStyles}/>
    ));

    const Untagged = hasUntaggedTiles() && <TagItem type={"untagged"}
                                      tagStyles={tagStyles}
                                      untaggedChecked={untaggedChecked}
                                      setUntaggedChecked={setUntaggedChecked}
                                      deleteUntaggedTiles={deleteUntaggedTiles}
                                      checkOnlyUntagged={checkOnlyUntagged}/>

    return (
        <>
            <div className={cn(
                "animate-fade-in-scale",
                "flex flex-wrap items-center px-8 py-4 mx-auto",
                "w-[88%] min-h-18! select-none",
                !tagStyles.visible && "hidden",
            )}
                 style={{
                     rowGap: `${tagStyles.gap.y}px`,
                     columnGap: `${tagStyles.gap.x}px`,
                 }}
            >
                {Tags}
                {Untagged}
            </div>
        </>
    );
};
