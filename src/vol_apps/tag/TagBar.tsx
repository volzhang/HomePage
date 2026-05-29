import {cn} from "@/lib/utils";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {useTagStyleStore} from "@/vol_apps/tag/tag_style_store";
import {TagItem} from "@/vol_apps/tag/TagItem";

export const TagComponent = () => {
    const {
        toggleTag, deleteTag, hasUntaggedTiles,
        untaggedChecked, tags,
        deleteTilesWithOnlyThisTag, deleteUntaggedTiles, setUntaggedChecked,
        renameTag, checkOnlyThisTag, checkOnlyUntagged,
    } = useTileStore();

    const tagStyles = useTagStyleStore();
    const {gap, visible} = useTagStyleStore()

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
                !visible && "hidden",
            )}
                 style={{
                     rowGap: `${gap.y}px`,
                     columnGap: `${gap.x}px`,
                 }}
            >
                {Tags}
                {Untagged}
            </div>
        </>
    );
};
