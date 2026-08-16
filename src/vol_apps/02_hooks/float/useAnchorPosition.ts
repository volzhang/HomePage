import {useCallback, useLayoutEffect, useRef, useState} from "react";
import type {FloatingDirection, FloatingAnchorType, Delta} from "@/vol_apps/00_types/Types";
import {getPostionFromAnchorToTarget} from "@/vol_apps/02_hooks/float/computeOffsetDelta";

/**
 * ================================================================
 * 锚点定位 Hook (useAnchorPosition)
 * ================================================================
 *
 * 连接 DOM 测量与定位计算引擎的桥梁。
 *
 * 负责：
 *   1. 获取锚点元素和浮层元素的 DOM 引用（通过 ref 对象）
 *   2. 在适当时机测量两者的尺寸和位置
 *   3. 调用定位引擎 getPostionFromAnchorToTarget 计算出浮层的固定定位坐标
 *   4. 响应窗口变化（resize/scroll）重新计算
 *
 * 【使用方法】
 * const { anchorRef, floatingRef, fixedPosition } = useAnchorPosition({
 *     open,
 *     direction,
 *     anchorType,
 *     offset,
 * })
 *
 * // 锚点元素（触发按钮）
 * <button ref={anchorRef}>点击</button>
 *
 * // 浮层元素
 * <div ref={floatingRef} style={{ position: 'fixed', top: fixedPosition.top, left: fixedPosition.left }}>
 *     浮层内容
 * </div>
 *
 * 【返回值】
 *   - anchorRef:     ref 对象，绑定到锚点元素
 *   - floatingRef:   ref 对象，绑定到浮层元素
 *   - fixedPosition: 计算出的 { top, left }，用于浮层的 position: fixed 定位
 *
 * ================================================================
 */
export const useAnchorPosition = ({
                                      open,
                                      direction,
                                      anchorType,
                                      offset,
                                  }: {
    open: boolean;
    direction: FloatingDirection;
    anchorType: FloatingAnchorType;
    offset: number;
}) => {
    const anchorRef = useRef<HTMLElement | null>(null);
    const floatingRef = useRef<HTMLElement | null>(null);
    const [position, setPosition] = useState<Delta>({top: 0, left: 0});

    const calculate = useCallback(() => {
        if (!anchorRef.current || !floatingRef.current) return;

        const aRect = anchorRef.current.getBoundingClientRect();
        const anchorPosition = {
            top: aRect.top,
            left: aRect.left,
        };
        const anchorSize = {
            width: anchorRef.current.offsetWidth,
            height: anchorRef.current.offsetHeight,
        };
        const targetSize = {
            width: floatingRef.current.offsetWidth,
            height: floatingRef.current.offsetHeight,
        };

        const fixedPosition = getPostionFromAnchorToTarget({
            anchorPosition,
            anchorSize,
            targetSize,
            direction,
            anchorType,
            offset,
        });

        setPosition(fixedPosition);
    }, [direction, anchorType, offset]);

    useLayoutEffect(() => {
        if (!open) return;
        calculate();

        window.addEventListener("resize", calculate);
        window.addEventListener("scroll", calculate, true);
        return () => {
            window.removeEventListener("resize", calculate);
            window.removeEventListener("scroll", calculate, true);
        };
    }, [open, calculate]);

    return {anchorRef, floatingRef, fixedPosition: position} as const;
};