import {UnorderedList} from "@/vol_apps/01_components/UnorderedList";
import {type TileLogic, useTileLogic} from "@/vol_apps/tile/useTileLogic";
import {create} from "zustand";
import {useLanguageStore} from "@/vol_apps/language/language_store";
import {useKeyEscapeToClose} from "@/vol_apps/02_hooks/useKeys";
import {useClickOutsideToClose} from "@/vol_apps/02_hooks/useClickOutsideToClose";
import {useFocusOutsideToClose} from "@/vol_apps/02_hooks/useFocusOutsideToClose";
import {useMergeRefs} from "@/vol_apps/02_hooks/01_useMergeRefs";
import {useFloatAnimation} from "@/vol_apps/02_hooks/useFloatAnimation";

type ContextMenuStore = {
    contextMenuOpen: boolean
    contextMenuPosition: { x: number, y: number }
    setContextMenuOpen: (contextMenuOpen: boolean) => void
    setContextMenuPosition: (contextMenuPosition: { x: number, y: number }) => void
}

const TileContextMenuStore = create<ContextMenuStore>((set) => ({
    contextMenuOpen: false,
    contextMenuPosition: {x: 0, y: 0},
    setContextMenuOpen: (contextMenuOpen: boolean) => set({contextMenuOpen}),
    setContextMenuPosition: (contextMenuPosition: { x: number, y: number }) => set({contextMenuPosition}),
}))

export const useTileContextMenuStore = () => TileContextMenuStore()

const ContextMenu = (
    {contextMenuOptions}: TileLogic
) => {
    const {t} = useLanguageStore()

    const {contextMenuOpen, contextMenuPosition, setContextMenuOpen} = useTileContextMenuStore()
    const floatingStyle = useFloatAnimation({
        open: contextMenuOpen, direction: "right", slideDistance: 0,
        duration: 10, exitDuration: 10
    })

    const style: React.CSSProperties = {
        position: "fixed",
        top: contextMenuPosition.y,
        left: contextMenuPosition.x,
        zIndex: 10,
        ...floatingStyle,
    }

    useKeyEscapeToClose(contextMenuOpen, () => setContextMenuOpen(false))

    const {clickOutsideRef} = useClickOutsideToClose({open: contextMenuOpen, onClose: () => setContextMenuOpen(false)})
    const {focusOutsideRef} = useFocusOutsideToClose({open: contextMenuOpen, onClose: () => setContextMenuOpen(false)})
    const rootRef = useMergeRefs(clickOutsideRef, focusOutsideRef)

    const options = contextMenuOptions.map((option, index) => ({
        value: index.toString(),
        label: t(option.label),
    }));

    return (
        <div ref={rootRef} className="flex w-fit h-fit">
            <UnorderedList options={options} style={style}
                           menu_className={"w-40"}
                           handleSelect={(value) => {
                               setContextMenuOpen(false)
                               contextMenuOptions[Number(value)].handler()
                           }}
                           checkIcon_className={"hidden"}
            />
        </div>
    )
}

export const UiContextMenu = () => {
    const Logic = useTileLogic()
    return <ContextMenu {...Logic} />
}



