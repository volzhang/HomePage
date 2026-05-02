import {useCallbackRef} from "@/vol_apps/02_hooks/00_useCallbackRef";
import {useCallback, useLayoutEffect, useState} from "react";
import type {FloatingDirection, FloatingAlign, FixedPosition} from "@/vol_apps/00_types/Types";

interface UseAnchorPositionProps {
    open: boolean;
    direction: FloatingDirection;
    align: FloatingAlign;
    offset: number;
}

export const useAnchorPosition =
    ({open, direction, align, offset}: UseAnchorPositionProps) => {
        const [anchorRef, aRef] = useCallbackRef();
        const [floatingRef, fRef] = useCallbackRef();

        const [position, setPosition] = useState<FixedPosition>({top: 0, left: 0});

        const calculate = useCallback(() => {
            if (!aRef.current || !fRef.current) return;
            // const aRect = aRef.current.getBoundingClientRect();
            // const fRect = fRef.current.getBoundingClientRect();
            //
            // //问题的关键是这个，需要拿到真实宽高而不是测量
            // //为了简单，我们可以修改aRect的类型，能传宽高就行
            // //aRect也应该修改，虽然当前没有BUG，但是必须拿到真实default常态宽高

            // 1. 锚点：用 getBoundingClientRect 拿视觉位置（left/top）
            const aRect = aRef.current.getBoundingClientRect();
            // 锚点的宽高也一并替换为 offset，以防将来锚点有动画
            const anchor = {
                left: aRect.left,
                top: aRect.top,
                right: aRect.left + aRef.current.offsetWidth,
                bottom: aRect.top + aRef.current.offsetHeight,
                width: aRef.current.offsetWidth,
                height: aRef.current.offsetHeight,
            } as DOMRect;

            // 2. 浮层：只关心布局宽高，位置随手给 0（因为不会被使用）
            const floating = {
                // left: 0,
                // top: 0,
                right: fRef.current.offsetWidth,
                bottom: fRef.current.offsetHeight,
                width: fRef.current.offsetWidth,
                height: fRef.current.offsetHeight,
            } as DOMRect;

            const fixedPosition = computeAnchorPosition(anchor, floating, direction, align, offset)
            setPosition(fixedPosition)
        }, [direction, align, offset])

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

const getBaseOffset = {
    top: (r: DOMRect, o: number) => ({left: r.left, top: r.top - o}),
    bottom: (r: DOMRect, o: number) => ({left: r.left, top: r.bottom + o}),
    left: (r: DOMRect, o: number) => ({left: r.left - o, top: r.top}),
    right: (r: DOMRect, o: number) => ({left: r.right + o, top: r.top}),
};

const getAlignOffset = {
    top: (aR: DOMRect, fR: DOMRect, a: FloatingAlign) =>
        a === "start" ? 0 : a === "center"
            ? aR.width / 2 - fR.width / 2
            : aR.width - fR.width,
    bottom: (aR: DOMRect, fR: DOMRect, a: FloatingAlign) =>
        a === "start" ? 0 : a === "center"
            ? aR.width / 2 - fR.width / 2
            : aR.width - fR.width,
    left: (aR: DOMRect, fR: DOMRect, a: FloatingAlign) =>
        a === "start" ? 0 : a === "center"
            ? aR.height / 2 - fR.height / 2
            : aR.height - fR.height,
    right: (aR: DOMRect, fR: DOMRect, a: FloatingAlign) =>
        a === "start" ? 0 : a === "center"
            ? aR.height / 2 - fR.height / 2
            : aR.height - fR.height,
};

const applyAlign = {
    top: (p: FixedPosition, o: number) => ({...p, left: p.left + o}),
    bottom: (p: FixedPosition, o: number) => ({...p, left: p.left + o}),
    left: (p: FixedPosition, o: number) => ({...p, top: p.top + o}),
    right: (p: FixedPosition, o: number) => ({...p, top: p.top + o}),
};

export const computeAnchorPosition = (
    aRect: DOMRect,
    fRect: DOMRect,
    direction: FloatingDirection,
    align: FloatingAlign,
    offset: number
): FixedPosition => {
    const baseOffset = getBaseOffset[direction](aRect, offset);
    const alignOffset = getAlignOffset[direction](aRect, fRect, align);
    const {top, left} = applyAlign[direction](baseOffset, alignOffset);

    return {top, left};
}