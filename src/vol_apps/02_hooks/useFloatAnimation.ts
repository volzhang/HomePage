import type {FloatingDirection} from "@/vol_apps/00_types/Types";
import {useEffect, useState} from "react";
import {useTimeout} from "@/vol_apps/02_hooks/03_useTimeout";

interface UseFloatAnimationOptions {
    open: boolean;
    direction: FloatingDirection;
    scale?: number;
    duration?: number;
    exitDuration?: number;
    slideDistance?: number;
}

export function useFloatAnimation({
                                      open,
                                      direction,
                                      scale = 95,
                                      duration = 200,
                                      exitDuration = 200,
                                      slideDistance = 4,
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
    useTimeout(() => setVisible(false), open ? null : exitDuration);
    useEffect(() => {if (open) setVisible(true)}, [open]);

    return {
        opacity: open ? 1 : 0,
        pointerEvents: (open ? "auto" : "none") as "auto" | "none",
        visibility: (open || visible) ? "visible" : "hidden" as "visible" | "hidden",
        transform: `scale(${open ? 1 : scale / 100}) 
        translate(${x * slideDistance}px, ${y * slideDistance}px)`,
        // 慎用 transition all 主要不是性能问题 而是可能引入意外的属性变化动画，比如位置变化
        // transition: `all ${open ? duration : exitDuration}ms ease-in-out`
        transition: `opacity ${open ? duration : exitDuration}ms ease-in-out,
        transform ${open ? duration : exitDuration}ms ease-in-out`
    };
}

