import { useCallbackRef } from "@/vol_apps/02_hooks/00_useCallbackRef";
import { useBetterPortal } from "./useBetterPortal";
import { usePureFloatStyles } from "./usePureFloatStyles";
import { useLayoutEffect, useState, useCallback, type CSSProperties } from "react";
import type { Delta } from "@/vol_apps/00_types/Types";

interface UseCenteredFloatingOptions {
    open: boolean;
    zIndex?: number;
    duration?: number;
    exitDuration?: number;
    scale?: number;
}

export function useCenteredFloating({
                                        open,
                                        zIndex = 1000,
                                        duration = 200,
                                        exitDuration = 150,
                                        scale = 95,
                                    }: UseCenteredFloatingOptions) {
    // 1. 复用你的 Portal 逻辑（动画结束后卸载 DOM）
    const { portal, visible } = useBetterPortal({ open, exitDuration });

    // 2. 获取浮层 DOM（只为了量尺寸）
    const [floatingRef, fRef] = useCallbackRef();

    // 3. 定位坐标
    const [position, setPosition] = useState<Delta>({ top: 0, left: 0 });

    // 4. 复用动画样式（opacity, transform, transition）
    const animStyles = usePureFloatStyles({
        open: visible,
        direction: "bottom",
        scale,
        duration,
        exitDuration,
        offset: 0,
    });

    // 5. 计算居中的核心逻辑（纯数学，一目了然）
    const calculateCenter = useCallback(() => {
        const el = fRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        setPosition({
            top: (vh - rect.height) / 2,
            left: (vw - rect.width) / 2,
        });
    }, [fRef]);

    // 6. 在浮层显示后、尺寸变化时重新计算
    useLayoutEffect(() => {
        if (!visible) return;
        calculateCenter();

        // 窗口缩放时重新居中
        window.addEventListener("resize", calculateCenter);
        return () => window.removeEventListener("resize", calculateCenter);
    }, [visible, calculateCenter]);

    // 7. 组装最终的 Style
    const floatingStyle: CSSProperties = {
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex,
        opacity: animStyles.opacity,
        transform: animStyles.transform,
        transition: animStyles.transition,
        transformOrigin: "center center",
    };

    return { floatingRef, floatingStyle, floatingPortal: portal };
}