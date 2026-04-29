import {useEffect, useRef, useState} from "react";

export const useContext = ({onOpenChange}:{onOpenChange: (open: boolean) => void}) => {
    const anchorRef = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const el = anchorRef.current
        if (!el) return
        const handler = (e: MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            setPosition({ x: e.clientX, y: e.clientY })
            onOpenChange(true)
        }
        el.addEventListener('contextmenu', handler)
        return () => el.removeEventListener('contextmenu', handler)
    }, [])

    return { anchorRef, position }
}