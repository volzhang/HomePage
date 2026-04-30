import {useEffect, useState} from "react";
import {useCallbackRef} from "@/vol_apps/02_hooks/00_useCallbackRef";

export const useContext = ({onOpenChange}: { onOpenChange: (open: boolean) => void }) => {

    const [anchorRef, innerRef] = useCallbackRef()
    const [position, setPosition] = useState({x: 0, y: 0})

    useEffect(() => {
        const el = innerRef.current
        if (!el) return
        const handler = (e: MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            setPosition({x: e.clientX, y: e.clientY})
            onOpenChange(true)
        }
        el.addEventListener("contextmenu", handler)
        return () => el.removeEventListener("contextmenu", handler)
    }, [])

    return {anchorRef, position}
}