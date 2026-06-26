import type {FloatingDirection, UseFloatAnimationOptions} from "@/vol_apps/00_types/Types";

/**
 * ================================================================
 * 纯样式动画 (usePureFloatStyles.ts)
 * ================================================================
 *
 * 【中心思想】
 * 这是一个“纯 CSS 样式生成器”，不控制 DOM 挂载，只负责生成“动起来”的样式。
 *
 * 组合：
 *   1. 透明度 (opacity)：0 ↔ 1
 *   2. 变换 (transform)：scale(缩放) + translate(微位移)
 *
 * 【设计细节】
 * 1. 缩放（Scale）：
 *    入场时从 95%（或自定义）放大到 100%，退场时缩回 95%。
 *    模拟元素从焦点中心“生长”或“收缩”的效果。
 *
 * 2. 微位移（Micro-translation）：
 *    退场时沿着弹出方向的“反方向”偏移几个像素。
 *    例如：向下弹出（bottom）时，退场会向上偏移（y = -offset）。
 *    模拟浮层“缩回”到锚点的视觉牵引感。
 *
 * 3. 过渡（Transition）：
 *    入场和出场使用不同的时长（duration vs exitDuration），
 *
 * 【使用方法】
 * 传入动画配置参数，直接解构出样式对象，合并到浮层的 style 中：
 *
 * const animStyles = usePureFloatStyles({ open, direction, scale, duration, exitDuration, offset })
 *
 * return <div style={{ ...positionStyles, ...animStyles }}>浮层</div>
 *
 * ================================================================
 */

export function usePureFloatStyles({
                                       open,
                                       direction = "bottom",
                                       scale = 95,
                                       duration = 200,
                                       exitDuration = 200,
                                       offset = 4,
                                   }: UseFloatAnimationOptions) {

    const microMap: Record<FloatingDirection, [number, number]> = {
        top: [0, 1],
        bottom: [0, -1],
        left: [1, 0],
        right: [-1, 0],
    };

    const [x, y] = open ? [0, 0] : microMap[direction];

    return {
        opacity: open ? 1 : 0,
        transform: `scale(${open ? 1 : scale / 100}) 
        translate(${x * offset}px, ${y * offset}px)`,
        transition: `opacity ${open ? duration : exitDuration}ms ease-in-out,
        transform ${open ? duration : exitDuration}ms ease-in-out`
    };
}