import {type RefObject, useCallback} from "react";
import {useCallbackRef} from "@/vol_apps/02_hooks/00_useCallbackRef";
import type {FixedPosition} from "@/vol_apps/00_types/Types";

export const useFixedPositionFlush = (
    {
        positionRef,
    }: {
        positionRef: RefObject<FixedPosition>;
    }
) => {
    const [anchorRef, internalRef] = useCallbackRef<HTMLElement>();

    const flush = useCallback(() => {
        const el = internalRef.current;
        const pos = positionRef.current;
        if (!el || !pos) return;
        el.style.top = `${pos.top}px`;
        el.style.left = `${pos.left}px`;
    }, []);

    return {
        anchorRef,
        flush,
    };
};