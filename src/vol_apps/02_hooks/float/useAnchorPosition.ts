import {useCallbackRef} from "@/vol_apps/02_hooks/00_useCallbackRef";
import {useCallback, useLayoutEffect, useState} from "react";
import type {FloatingDirection, FloatingAnchorType, Delta} from "@/vol_apps/00_types/Types";
import {getPostionFromAnchorToTarget} from "@/vol_apps/02_hooks/float/computeOffsetDelta";


/**
 * ================================================================
 * 锚点定位 Hook (useAnchorPosition.ts)
 * ================================================================
 *
 * 【中心思想】
 * 连接 DOM 测量与定位计算引擎的桥梁。
 *
 * 负责：
 *   1. 获取锚点元素和浮层元素的 DOM 引用（通过回调 ref）
 *   2. 在适当时机测量两者的尺寸和位置
 *   3. 调用定位引擎 getPostionFromAnchorToTarget 计算出浮层的固定定位坐标
 *   4. 响应窗口变化（resize/scroll）重新计算
 *
 * 【设计思路】
 *
 * 2. useLayoutEffect 测量：
 *    在 DOM 更新后、浏览器绘制前同步执行测量，避免闪烁。
 *    只在 open 为 true 时启用，避免不必要的计算。
 *
 * 3. 事件监听：
 *    - resize：窗口大小变化时重算
 *    - scroll（捕获阶段）：监听滚动事件，确保浮层跟随锚点移动
 *      注意：这里只监听了 window 滚动，若锚点在滚动容器内需另行处理。
 *
 * 4. 依赖控制：
 *    calculate 依赖 direction / anchorType / offset，
 *    当这些参数变化时自动重新计算（即使 open 未变）。
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
 *   - anchorRef:    回调 ref，绑定到锚点元素
 *   - floatingRef:  回调 ref，绑定到浮层元素
 *   - fixedPosition: 计算出的 { top, left }，用于浮层的 position: fixed 定位
 *
 * 【注意事项】
 * - 必须同时绑定两个 ref，否则无法计算。
 * - 浮层样式需要 position: fixed，坐标直接应用 fixedPosition。
 * - 若浮层内容异步加载导致尺寸变化，当前不会自动重算（需配合 ResizeObserver 改进）。
 *
 * ================================================================
 */

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
