import {UnorderedList} from "@/vol_apps/01_components/UnorderedList";
import {type TileLogic, useTileLogic} from "@/vol_apps/tile/useTileLogic";

import {useKeyEscapeToClose} from "@/vol_apps/02_hooks/useKeys";
import {useClickOutsideToClose} from "../02_hooks/05_useClickOutsideToClose";
import {useFocusOutsideToClose} from "../02_hooks/06_useFocusOutsideToClose";
import {useMergeRefs} from "@/vol_apps/02_hooks/01_useMergeRefs";
import {useFloatStyles} from "@/vol_apps/02_hooks/float/useFloatStyles";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";
import {createSignal} from "@/vol_apps/04_persist_atoms";
import React from "react";

const contextMenuOpenSig = createSignal<boolean>(false)
const contextMenuPositionSig = createSignal<{ x: number, y: number }>({x: 0, y: 0})

export const useTileContextMenuStore = () => {
    const contextMenuOpen = contextMenuOpenSig.use()
    const contextMenuPosition = contextMenuPositionSig.use()
    const setContextMenuOpen = (o: boolean) => contextMenuOpenSig.set(o)
    const setContextMenuPosition = (p: { x: number, y: number }) => contextMenuPositionSig.set(p)

    return {
        contextMenuOpen, contextMenuPosition,
        setContextMenuOpen, setContextMenuPosition,
    }
}

const ContextMenu = (
    {contextMenuOptions}: TileLogic
) => {
    const {t} = useLanguage()

    const {contextMenuOpen, contextMenuPosition, setContextMenuOpen} = useTileContextMenuStore()
    const floatingStyle = useFloatStyles({
        open: contextMenuOpen, direction: "right", offset: 0,
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



