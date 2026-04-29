import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    // ContextMenuLabel,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {useLanguageStore} from "@/vol_apps/language/language_store";

export const Tile_context_menu =
    ({
         handleOpenInNewTab,
         handleOpenInCurrentTab,
         handleEdit,
         children,
        // name,
     }: {

        handleOpenInNewTab: () => void
        handleOpenInCurrentTab: () => void
        handleEdit: () => void
        children: React.ReactNode,
        // name:string
    }) => {
        const {t} = useLanguageStore()

        return (
            <>
                <ContextMenu>
                    <ContextMenuTrigger>
                        {children}
                    </ContextMenuTrigger>
                    <ContextMenuContent className={"overflow-hidden w-56 my-3"}>
                        {/*<ContextMenuLabel className={"text-sBlue text-lg font-bold truncate"}>*/}
                        {/*    {name}*/}
                        {/*</ContextMenuLabel>*/}
                        <ContextMenuItem onClick={handleOpenInNewTab}>
                            {t("Open in new tab")}
                        </ContextMenuItem>
                        <ContextMenuItem onClick={handleOpenInCurrentTab}>
                            {t("Open")}
                        </ContextMenuItem>
                        <ContextMenuItem onClick={handleEdit}>
                            {t("Edit")}
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            </>
        )
    }