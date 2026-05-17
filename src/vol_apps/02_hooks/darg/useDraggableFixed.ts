import {useCallback, useRef, useEffect} from "react";
import { useFixedPositionFlush } from "@/vol_apps/02_hooks/darg/useFixedPositionFlush";
import { useRafThrottle } from "@/vol_apps/02_hooks/throttle/useRafThrottle";
import { useDragState } from "@/vol_apps/02_hooks/darg/useDragState";
import type { FixedPosition } from "@/vol_apps/00_types/Types";
import {useMergeRefs} from "@/vol_apps/02_hooks/01_useMergeRefs";

export const useDraggableFixed = ({
                                      initialLeft = 100,
                                      initialTop = 100,
                                      onPositionChange,
                                  }: {
    initialLeft?: number;
    initialTop?: number;
    onPositionChange?: (position: FixedPosition) => void;
} = {}) => {
    const positionRef = useRef<FixedPosition>({
        left: initialLeft,
        top: initialTop,
    });

    const { anchorRef: fixedAnchorRef, flush } = useFixedPositionFlush({ positionRef });
    const throttledFlush = useRafThrottle(flush);

    const dragStartRef = useRef<FixedPosition & { mx: number; my: number }>({
        left: 0,
        top: 0,
        mx: 0,
        my: 0,
    });

    useEffect(() => {
        const rafId = requestAnimationFrame(() => flush());
        return () => cancelAnimationFrame(rafId);
    }, [flush]);

    const { anchorRef: dragAnchorRef, dragging } = useDragState({
        onDragStart: (e) => {
            const pos = positionRef.current;
            dragStartRef.current = {
                left: pos.left,
                top: pos.top,
                mx: e.clientX,
                my: e.clientY,
            };
        },

        onDragging: (e) => {
            const start = dragStartRef.current;
            const newPos: FixedPosition = {
                left: start.left + (e.clientX - start.mx),
                top: start.top + (e.clientY - start.my),
            };

            positionRef.current = newPos;
            throttledFlush();
            onPositionChange?.(newPos);
        },
    });

    const anchorRef = useMergeRefs(dragAnchorRef, fixedAnchorRef)

    const setPosition = useCallback((newPos: FixedPosition) => {
        positionRef.current = { ...newPos }; // 避免引用问题
        flush();
    }, [flush]);

    return {
        anchorRef,
        dragging,
        position: positionRef.current,
        setPosition,
    };
};