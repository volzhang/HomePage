import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuItem,
    ContextMenuLabel, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger,
    ContextMenuTrigger
} from "@/components/ui/context-menu";
import {TriangleAlert} from "lucide-react";
import {useLanguageStore} from "@/vol_apps/language/language_store";
import {useSettingStore} from "@/vol_apps/settings/setting_store";

export const ContextMenu_Untagged = (
    {
        untaggedChecked,
        setUntaggedChecked,
        deleteUntaggedTiles,
        children
    }:{
        untaggedChecked: boolean
        setUntaggedChecked: (s:boolean) => void
        deleteUntaggedTiles: ()=>void
        children: React.ReactNode
    }
) => {

    const {t} = useLanguageStore("tagBar")
    const {openSetting} = useSettingStore()

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger>
                    {children}
                </ContextMenuTrigger>
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
            </ContextMenu>
        </>
    )
}