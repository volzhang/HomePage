import {useCallbackRef} from "@/vol_apps/02_hooks/00_useCallbackRef";
import {useCallback, useLayoutEffect, useState} from "react";
import type {FloatingDirection, FloatingAnchorType, Delta} from "@/vol_apps/00_types/Types";
import {getPostionFromAnchorToTarget} from "@/vol_apps/02_hooks/float/computeOffsetDelta";

interface UseAnchorPositionProps {
    open: boolean;
    direction: FloatingDirection;
    anchorType: FloatingAnchorType;
    offset: number;
}

export const useAnchorPosition =
    ({open, direction, anchorType, offset}: UseAnchorPositionProps) => {
        const [anchorRef, aRef] = useCallbackRef();
        const [floatingRef, fRef] = useCallbackRef();

        const [position, setPosition] = useState<Delta>({top: 0, left: 0});

        const calculate = useCallback(() => {
            if (!aRef.current || !fRef.current) return;

            const aRect = aRef.current.getBoundingClientRect();
            const anchorPosition = {
                top: aRect.top,
                left: aRect.left,
            }
            const anchorSize = {
                width: aRef.current.offsetWidth,
                height: aRef.current.offsetHeight,
            }
            const targetSize = {
                width: fRef.current.offsetWidth,
                height: fRef.current.offsetHeight,
            }

            const fixedPosition = getPostionFromAnchorToTarget({
                anchorPosition,
                anchorSize, targetSize, direction, anchorType, offset,
            })

            setPosition(fixedPosition)
        }, [direction, anchorType, offset])

        useLayoutEffect(() => {
            if (!open) return;
            calculate();

            window.addEventListener("resize", calculate);
            window.addEventListener("scroll", calculate, true);
            return () => {
                window.removeEventListener("resize", calculate);
                window.removeEventListener("scroll", calculate, true);
            };
        }, [open, calculate])

        return {anchorRef, floatingRef, fixedPosition: position} as const;
    }
