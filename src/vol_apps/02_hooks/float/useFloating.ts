// hooks/useFloating.ts
import {useAnchorPosition} from "./useAnchorPosition";
import type {FloatingAnchorType, UseFloatAnimationOptions} from "@/vol_apps/00_types/Types";
import {useBetterPortal} from "@/vol_apps/02_hooks/float/useBetterPortal";
import {usePureFloatStyles} from "@/vol_apps/02_hooks/float/usePureFloatStyles";

/**
 * 统一处理浮层定位与进出动画的 Hook。
 * 返回锚点 ref（可绑定到任意 HTML 元素）、完整 style 对象以及原始坐标。
 *
 * @param open - 控制浮层是否打开
 * @param direction - 弹出方向，默认 "bottom"
 * @param align - 对齐方式，默认 "start"
 * @param scale - 隐藏时缩放百分比，默认 95
 * @param duration - 入场动画时长 (ms)，默认 200
 * @param exitDuration - 出场动画时长 (ms)，默认 150
 * @param zIndex - 堆叠层级，默认 1
 * @param offset - 浮层与锚点间距 (px)，默认 4
 *
 * @returns `{ anchorRef, floatingStyle, position }`
 * - `anchorRef`：回调 ref，直接赋给任意元素的 `ref` 即可（不挑元素类型）
 * - `floatingRef`: 回调 ref，直接赋给任意元素的 `ref` 即可（不挑元素类型）
 * - `floatingStyle`：包含定位、动画、层级等内联样式
 */

type useFloatingOptions = UseFloatAnimationOptions & {
    align?: FloatingAnchorType;
    zIndex?: number;
}

export function useFloating({
                                open,
                                direction = "bottom",
                                align = "start",
                                scale = 95,
                                duration = 200,
                                exitDuration = 200,
                                zIndex = 10,
                                offset = 4,
                            }: useFloatingOptions) {

    const {portal, visible} = useBetterPortal({open, exitDuration})

    const styles = usePureFloatStyles({
        open: visible,
        direction,
        scale,
        duration,
        exitDuration,
        offset,
    })

    const {anchorRef, floatingRef, fixedPosition} = useAnchorPosition({
        open: visible,
        direction,
        anchorType: align,
        offset
    });

    const floatingStyle: React.CSSProperties = {
        zIndex,
        position: "fixed",
        top: fixedPosition.top,
        left: fixedPosition.left,
        transform: styles.transform,
        opacity: styles.opacity,
        // visibility: anim.visibility,
        // pointerEvents: anim.pointerEvents,
        transition: styles.transition,
    };

    return {anchorRef, floatingRef, floatingStyle, floatingPortal: portal};
}


