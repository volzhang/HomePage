import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";

export const Tile_context_menu =
    ({

         handleOpenInNewTab,
         handleOpenInCurrentTab,
         handleEdit,
         children
     }: {

        handleOpenInNewTab: () => void
        handleOpenInCurrentTab: () => void
        handleEdit: () => void
        children: React.ReactNode
    }) => {
        return (
            <>
                <ContextMenu>
                    <ContextMenuTrigger>
                        {children}
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem onClick={handleOpenInNewTab}>
                            新标签打开
                        </ContextMenuItem>
                        <ContextMenuItem onClick={handleOpenInCurrentTab}>
                            此页打开
                        </ContextMenuItem>
                        <ContextMenuItem onClick={handleEdit}>
                            编辑
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            </>
        )
    }