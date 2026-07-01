import React, {useEffect, useState} from "react";
import {useDoubleRaf} from "@/vol_apps/02_hooks/raf/useDoubleRaf";
import {createPortal} from "react-dom";

/**
 * ================================================================
 * 挂载与生命周期管理 (useBetterPortal.ts)
 * ================================================================
 *
 * 【中心思想】
 * 分离“DOM 存在”和“样式可见”，让退出动画有机会播放。
 *
 * 常规写法 `{open && <Modal />}` 会在 open 为 false 时立即销毁 DOM，
 * CSS 过渡动画来不及执行。这个 Hook 用两个状态解决这个问题：
 *   - mounted: DOM 是否挂载（控制 createPortal 是否执行）
 *   - visible: 样式是否可见（控制 opacity/transform 等）
 *
 * 【设计思路】
 * 1. 双轨状态：
 *    - open 变为 true  → 立即 mounted（DOM 挂载），下一帧 visible（样式显现）
 *    - open 变为 false → 立即 visible（样式隐藏），延迟 mounted（DOM 卸载）
 *
 * 2. 双重 RAF（requestAnimationFrame）：
 *    入场时，mounted 后不能立即 setVisible(true)，否则浏览器会把
 *    opacity: 0 → 1 的变化合并到同一帧，过渡失效。
 *    用 useDoubleRaf 确保在“下一帧的下一帧”才切换样式，给浏览器留出初始渲染的时间。
 *
 * 3. 延迟卸载：
 *    退场时，setVisible(false) 触发 CSS 过渡动画，
 *    等待 exitDuration 毫秒后再 setMounted(false) 移除 DOM。
 *
 * 【使用方法】
 * const { portal, visible } = useBetterPortal({ open, exitDuration: 200 })
 *
 * // 用 portal 包裹浮层内容
 * portal(<div style={{ opacity: visible ? 1 : 0 }}>内容</div>)
 *
 * // visible 可用于驱动其他样式（如动画状态）
 *
 * 【返回值】
 *   - visible: 当前是否“可见”（用于驱动样式）
 *   - portal: 函数 (node, container?) => ReactPortal | null
 *             只在 mounted 为 true 时渲染 Portal
 *
 * ================================================================
 */

export const useBetterPortal = (
    {open, exitDuration = 0}: { open: boolean; exitDuration?: number }) => {

    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);

    const doubleRaf = useDoubleRaf();

    useEffect(() => {
        if (open) {
            setMounted(true);
            doubleRaf(() => setVisible(true))
        } else {
            setVisible(false);
            const id = setTimeout(() => setMounted(false), exitDuration);
            return () => {
                clearTimeout(id)
            }
        }
    }, [open]);

    const portal = (
        node: React.ReactNode | null | undefined,
        container: HTMLElement | DocumentFragment = document.body,
    ) => {
        if (!mounted || node == null) return null;
        return createPortal(node, container);
    };

    return {visible, portal,};
};

