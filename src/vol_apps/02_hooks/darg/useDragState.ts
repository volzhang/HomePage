import {useEffect, useRef, useState} from "react";
import {useCallbackRef} from "@/vol_apps/02_hooks/00_useCallbackRef";

export const useDragState =
    ({
         open = true,
         onDragStart,
         onDragging,
         onDragEnd,
     }: {
         open?: boolean;
         onDragStart?: (e: PointerEvent) => void,
         onDragging?: (e: PointerEvent) => void,
         onDragEnd?: (e: PointerEvent) => void,
     } = {}
    ) => {
        const [dragging, setDragging] = useState(false)
        const [anchorRef, internalRef] = useCallbackRef<HTMLElement>()

        const pointerIdRef = useRef<number | null>(null);

        const onDragStartRef = useRef(onDragStart);
        const onDragEndRef = useRef(onDragEnd);
        const onDraggingRef = useRef(onDragging);

        onDragStartRef.current = onDragStart;
        onDragEndRef.current = onDragEnd;
        onDraggingRef.current = onDragging;

        const cleanupPointer = (pointerId?: number) => {
            const el = internalRef.current;
            if (el && pointerId !== undefined && el.hasPointerCapture?.(pointerId)) {
                el.releasePointerCapture(pointerId);
            }
            pointerIdRef.current = null;
        };

        const handlePointerDown = (e: PointerEvent) => {
            if (e.button !== 0) return;
            if (pointerIdRef.current !== null) return;
            const el = internalRef.current;
            if (!el) return;
            el.setPointerCapture(e.pointerId);
            pointerIdRef.current = e.pointerId;
            setDragging(true);
            onDragStartRef.current?.(e);
        };

        const handlePointerUp = (e: PointerEvent) => {
            if (e.pointerId !== pointerIdRef.current) return;
            cleanupPointer(e.pointerId);
            onDragEndRef.current?.(e);
            setDragging(false);
        };

        const handlePointerCancel = (e: PointerEvent) => {
            if (e.pointerId !== pointerIdRef.current) return;
            cleanupPointer(e.pointerId);
            onDragEndRef.current?.(e);
            setDragging(false);
        };


        useEffect(() => {
            const el = internalRef.current;

            if (!open || !el) {
                setDragging(false);
                return;
            }

            el.addEventListener("pointerdown", handlePointerDown);
            el.addEventListener("pointerup", handlePointerUp);
            el.addEventListener("pointercancel", handlePointerCancel);

            return () => {
                cleanupPointer(pointerIdRef.current ?? undefined);
                el.removeEventListener("pointerdown", handlePointerDown);
                el.removeEventListener("pointerup", handlePointerUp);
                el.removeEventListener("pointercancel", handlePointerCancel);
            };
        }, [open]);

        useEffect(() => {
            const el = internalRef.current;
            if (!open || !el || !dragging) return;

            const handleDragging = (e: PointerEvent) => {
                if (e.pointerId !== pointerIdRef.current) return;
                onDraggingRef.current?.(e);
            };

            el.addEventListener("pointermove", handleDragging);
            return () => el.removeEventListener("pointermove", handleDragging);
        }, [open, dragging]);

        return {anchorRef, dragging};
    }