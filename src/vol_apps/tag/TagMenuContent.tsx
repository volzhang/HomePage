import {
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuGroup, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent
} from "@/components/ui/context-menu";
import {TriangleAlert} from "lucide-react";
import type {Tag} from "@/vol_apps/tile/tile_store_types";
import {useSettingStore} from "@/vol_apps/settings/setting_store";
import {useLanguageAtom} from "@/vol_apps/language/languageAtom.ts";

export const TagMenuContent = (
    {
        tag,

        toggleTag,
        deleteTag,
        setInEdit,
        deleteTilesWithOnlyThisTag,
    }: {
        tag: Tag;

        toggleTag: (id:Tag["id"])=>void;
        deleteTag: (id:Tag["id"])=>void;
        setInEdit: (s:boolean)=>void;
        deleteTilesWithOnlyThisTag: (id:Tag["id"])=>void;
    }
) => {
    const {t} = useLanguageAtom("tagBar")
    const {openSetting} = useSettingStore();
    return (
            <ContextMenuContent avoidCollisions={false} alignOffset={18}>
                <ContextMenuGroup>
                    <ContextMenuLabel className="text-sBlue font-bold">
                        {tag.name}
                    </ContextMenuLabel>
                    <ContextMenuItem onClick={() => toggleTag(tag.id)}>{t("Toggle selection")}</ContextMenuItem>
                    <ContextMenuItem onClick={() => setInEdit(true)}>{t("Rename")}</ContextMenuItem>
                    <ContextMenuItem onClick={() => openSetting("tags")}>{t("Setting")}</ContextMenuItem>
                    <ContextMenuSub>
                        <ContextMenuSubTrigger className={""}>
                            {t("Delete")}
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="">
                            <ContextMenuItem onClick={() => deleteTag(tag.id)}>
                                <TriangleAlert className={"mr-2 text-red-500"}/>
                                {t("Delete Tag: Note, it will delete this tag from all tiles without deleting the tiles themselves")}
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => deleteTilesWithOnlyThisTag(tag.id)} className={""}>
                                <TriangleAlert className={"mr-2 text-red-500"}/>
                                {t("Delete Tiles: Note, it will delete tiles with only this tag")}
                            </ContextMenuItem>
                        </ContextMenuSubContent>
                    </ContextMenuSub>
                </ContextMenuGroup>
            </ContextMenuContent>
    )
}

export const UntaggedMenuContent = (
    {
        untaggedChecked,
        setUntaggedChecked,
        deleteUntaggedTiles,
    }:{
        untaggedChecked: boolean
        setUntaggedChecked: (s:boolean) => void
        deleteUntaggedTiles: ()=>void
    }
) => {

    const {t} = useLanguageAtom("tagBar")
    const {openSetting} = useSettingStore()

    return (
        <>
            <ContextMenuContent avoidCollisions={false} alignOffset={18}>
                <ContextMenuGroup>
                    <ContextMenuLabel className="text-sBlue font-bold">
                        {t("UntaggedTiles")}
                    </ContextMenuLabel>
                    <ContextMenuItem onClick={() => setUntaggedChecked(!untaggedChecked)}>
                        {t("Toggle selection")}
                    </ContextMenuItem>
                    <ContextMenuItem onClick={()=> openSetting("tags")}>{t("Setting")}</ContextMenuItem>
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
        </>
    )
}