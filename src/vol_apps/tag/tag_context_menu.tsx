import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuGroup, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent
} from "@/components/ui/context-menu";
import {TriangleAlert} from "lucide-react";

export const Tag_context_menu = (
    {
        t,
        tag,
        children,
        toggleTag,
        deleteTag,
        setInputString,
        setInEdit,
        deleteTilesWithOnlyThisTag,
    }: any
) => {
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
                    <ContextMenuItem onClick={() => {
                        setInputString(tag.name)
                        setInEdit(true)
                    }}>
                        {t("Rename")}
                    </ContextMenuItem>
                    <ContextMenuSub>
                        <ContextMenuSubTrigger className={""}>
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
    )
}