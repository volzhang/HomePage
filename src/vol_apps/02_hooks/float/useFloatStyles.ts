import type {FloatingDirection, UseFloatAnimationOptions} from "@/vol_apps/00_types/Types";
import {useEffect, useState} from "react";

export function useFloatStyles({
                                   open,
                                   direction = "bottom",
                                   scale = 95,
                                   duration = 200,
                                   exitDuration = 200,
                                   offset = 4,
                               }: UseFloatAnimationOptions) {

    const microMap: Record<FloatingDirection, [number, number]> = {
        top: [0, 1],
        bottom: [0, -1],
        left: [1, 0],
        right: [-1, 0],
    };
    const [x, y] = open ? [0, 0] : microMap[direction];

    // 可见性延迟隐藏
    const [visible, setVisible] = useState(open);

    useEffect(() => {
        if (open) {
            setVisible(true)
        } else {
            const id = setTimeout(() => setVisible(false), exitDuration)
            return () => clearTimeout(id)
        }
    }, [open]);

    return {
        opacity: open ? 1 : 0,
        pointerEvents: (open ? "auto" : "none") as "auto" | "none",
        visibility: (open || visible) ? "visible" : "hidden" as "visible" | "hidden",
        transform: `scale(${open ? 1 : scale / 100}) 
        translate(${x * offset}px, ${y * offset}px)`,
        transition: `opacity ${open ? duration : exitDuration}ms ease-in-out,
        transform ${open ? duration : exitDuration}ms ease-in-out`
    };
}

