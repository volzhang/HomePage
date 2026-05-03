// hooks/useFloating.ts
import {useAnchorPosition} from "@/vol_apps/02_hooks/02_useAnchorPosition";
import {useFloatAnimation} from "@/vol_apps/02_hooks/useFloatAnimation";
import type {FloatingAlign, FloatingDirection} from "@/vol_apps/00_types/Types";

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
export function useFloating({
                                open,
                                direction = "bottom",
                                align = "start",
                                scale = 95,
                                duration = 200,
                                exitDuration = 200,
                                zIndex = 10,
                                offset = 4,
                            }: {
    open: boolean;
    direction?: FloatingDirection;
    align?: FloatingAlign;
    scale?: number;
    duration?: number;
    exitDuration?: number;
    zIndex?: number;
    offset?: number;
}) {

    const {anchorRef, floatingRef, fixedPosition} = useAnchorPosition({open, direction, align, offset});
    const anim = useFloatAnimation({ open, direction, scale, duration, exitDuration });

    const floatingStyle: React.CSSProperties = {
        zIndex,
        position: "fixed",
        top: fixedPosition.top,
        left: fixedPosition.left,
        transform: anim.transform,
        opacity: anim.opacity,
        visibility: anim.visibility,
        pointerEvents: anim.pointerEvents,
        transition: anim.transition,
    };

    return { anchorRef, floatingRef, floatingStyle };
}


//后续的改进方向
//1. 定位计算的时机问题
// 当前在 open 变为 true 时立即 useLayoutEffect 执行 calculate，但此时浮层可能还没完成布局（尤其是含图片、异步内容、flex 等情况）。
// tsxuseLayoutEffect(() => {
//     if (!open) return;
//     const raf = requestAnimationFrame(() => {
//         calculate();
//         // 再多测一次，兼容部分复杂布局
//         requestAnimationFrame(calculate);
//     });
//     // ...
// }, [open, calculate]);
// 2. 浮层尺寸测量时机
// 目前浮层在 open=false 时可能被 visibility: hidden 或 opacity:0，但 offsetWidth 仍然能读到，这算是运气好。但更健壮的做法是：
// 浮层始终挂载（display: none 时不测量）
// 或者在 open 后使用 useLayoutEffect + ResizeObserver 监听浮层自身尺寸变化
// 3. 边界处理缺失（生产环境痛点）
// 当前没有做 flip（方向翻转）和 shift（自动偏移避免超出视口）。这是这类 Hook 最容易被诟病的地方。
// 建议至少加上一个简单的 fallback 策略，比如 bottom 放不下就尝试 top。
// 4. 支持 Portal
// 5. 性能
// resize 和 scroll 建议加节流（requestAnimationFrame 或 lodash throttle）。


