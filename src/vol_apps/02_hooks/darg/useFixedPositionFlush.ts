import {type RefObject, useRef} from "react";
import type {Delta} from "@/vol_apps/00_types/Types";

/**
 * 将 positionRef 中的坐标应用到 DOM 元素的 style 上。
 * @param positionRef - 包含 { top, left } 的 ref 对象
 * @returns
 * - anchorRef – 绑定到要定位的浮层元素
 * - flush     – 手动调用将坐标应用到元素
 */
export const useFixedPositionFlush = ({
                                          positionRef,
                                      }: {
    positionRef: RefObject<Delta>;
}) => {
    const anchorRef = useRef<HTMLElement | null>(null);

    const flush = () => {
        const el = anchorRef.current;
        const pos = positionRef.current;
        if (!el || !pos) return;
        el.style.top = `${pos.top}px`;
        el.style.left = `${pos.left}px`;
    }

    return {
        anchorRef,
        flush,
    };
};