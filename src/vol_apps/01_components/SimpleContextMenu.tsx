import {type ReactNode, useState} from "react";
import {usePositionFloating} from "../02_hooks/usePositionFloating";
import {UnorderedList} from "@/vol_apps/01_components/UnorderedList";
import {useContext} from "@/vol_apps/02_hooks/useContext";
import {useKeyEscapeToClose} from "../02_hooks/useKeys";
import {useClickOutsideToClose} from "@/vol_apps/02_hooks/useClickOutsideToClose";

export const SimpleContextMenu = (
    {
        open,
        onOpenChange,
        options,
        trigger,
    }: {
        open: boolean,
        onOpenChange: (open: boolean) => void
        options:
            {
                label: ReactNode
                handler: () => void
            }[]
        trigger: ReactNode
    }
) => {
    const {anchorRef, position} = useContext({onOpenChange})
    const {floatingStyle} = usePositionFloating({open, position, zIndex: 50})

    useKeyEscapeToClose(open, () => onOpenChange(false))
    const {clickOutsideRef} = useClickOutsideToClose({open, onClose: () => onOpenChange(false)})
    // const {focusOutsideRef} = useFocusOutsideToClose({open, onClose: () => onOpenChange(false)})
    const mergeRef = clickOutsideRef
        // useMergeRefs(clickOutsideRef, focusOutsideRef)

    const menuValue = "0";
    const menuOptions = options.map((option, index) => ({
        value: index.toString(),
        label: option.label,
    }));

    return (
        <div className={"w-fit h-fit"}>
            <div className={"w-fit h-fit"} ref={anchorRef}>
                {trigger}
            </div>
            <div ref={mergeRef}>
                <UnorderedList value={menuValue} options={menuOptions} style={floatingStyle}
                               handleSelect={(value) => {
                                   onOpenChange(false)
                                   options[Number(value)].handler()
                               }}
                               checkIcon_className={"hidden"}
                />
            </div>
        </div>
    )
}

export const Demo = () => {
    const [open, setOpen] = useState(false)
    return (
        <>
            <SimpleContextMenu open={open} onOpenChange={setOpen}
                               options={
                                   [
                                       {
                                           label: "Option 1", handler: () => {
                                           }
                                       },
                                       {
                                           label: "Option 2", handler: () => {
                                           }
                                       }
                                   ]
                               } trigger={
                <div className={"w-40 h-40 border"}></div>
            }/>
        </>
    )
}