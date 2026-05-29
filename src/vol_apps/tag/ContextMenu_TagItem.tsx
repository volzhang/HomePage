import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuGroup, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent
} from "@/components/ui/context-menu";
import {TriangleAlert} from "lucide-react";
import {useLanguageStore} from "@/vol_apps/language/language_store";
import type {Tag} from "@/vol_apps/tile/tile_store_types";
import type {ReactNode} from "react";
import {useSettingStore} from "@/vol_apps/settings/setting_store";

export const ContextMenu_TagItem = (
    {
        tag,
        children,
        toggleTag,
        deleteTag,
        setInEdit,
        deleteTilesWithOnlyThisTag,
    }: {
        tag: Tag;
        children: ReactNode;
        toggleTag: (id:Tag["id"])=>void;
        deleteTag: (id:Tag["id"])=>void;
        setInEdit: (s:boolean)=>void;
        deleteTilesWithOnlyThisTag: (id:Tag["id"])=>void;
    }
) => {
    const {t} = useLanguageStore("tagBar")
    const {openSetting} = useSettingStore();
    return (
        <ContextMenu>
            <ContextMenuTrigger>
                {children}
            </ContextMenuTrigger>
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
        </ContextMenu>
    )
}