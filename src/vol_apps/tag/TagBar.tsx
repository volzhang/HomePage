import {cn} from "@/lib/utils";
import {TagItem} from "@/vol_apps/tag/TagItem";
import {useSignal} from "@/vol_apps/04_persist_atoms";
import {tagStyleConfig} from "@/vol_apps/tag/TagStyleAtom.ts";
import {useTileStore} from "@/vol_apps/tile/tile_signal.ts";

export const TagComponent = () => {
    const {
        toggleTag, deleteTag, hasUntaggedTiles,
        untaggedChecked, tags,
        deleteTilesWithOnlyThisTag, deleteUntaggedTiles, setUntaggedChecked,
        renameTag, checkOnlyThisTag, checkOnlyUntagged,
    } = useTileStore();

    const { visible } = useSignal(...tagStyleConfig("visible"))
    const { gap } = useSignal(...tagStyleConfig("gap"))

    const Tags = tags.map(tag => (
        <TagItem
            key={tag.id}
            type={"tag"}
            tag={tag}
            checkOnlyThisTag={checkOnlyThisTag}
            toggleTag={toggleTag}
            deleteTag={deleteTag}
            renameTag={renameTag}
            deleteTilesWithOnlyThisTag={deleteTilesWithOnlyThisTag}
        />
    ));

    const Untagged = hasUntaggedTiles() && (
        <TagItem
            type={"untagged"}
            untaggedChecked={untaggedChecked}
            setUntaggedChecked={setUntaggedChecked}
            deleteUntaggedTiles={deleteUntaggedTiles}
            checkOnlyUntagged={checkOnlyUntagged}
        />
    );

    return (
        <div
            className={cn(
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
    );
};
