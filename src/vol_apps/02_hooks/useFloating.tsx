// hooks/useFloating.ts
import { useLayoutEffect, useRef, useState, useCallback } from "react";
import type { AnchorDirection } from "@/vol_apps/00_types/Types";

/**
 * 统一处理浮层定位与进出动画的 Hook。
 * 返回锚点 ref 以及一个可直接应用于浮层容器的 style 对象，
 * 所有定位、层级、动画均由内联样式控制，无需额外组件包裹。
 *
 * @param open - 控制浮层是否打开。打开时会计算并跟随锚点位置。
 * @param direction - 浮层相对锚点的弹出方向，默认 `"bottom"`
 * @param align - 浮层相对锚点元素的对其方式，默认 `"start"`
 * @param scale - 隐藏时的缩放百分比，例如 95 表示 scale(0.95)，默认 95
 * @param duration - 入场动画时长（毫秒），默认 200
 * @param exitDuration - 出场动画时长（毫秒），默认 150
 * @param zIndex - 堆叠层级，默认 1
 * @param offset - 浮层与锚点之间的间距（像素），默认 4
 * @returns `{ anchorRef, floatingStyle }`
 * - `anchorRef`：需绑定到触发元素上的 Ref
 * - `floatingStyle`：包含 `position: fixed`、`top`、`left`、`transition`、`opacity`、`transform` 等完整样式的对象
 */

export function useFloating({
                                open,
                                direction = "bottom",
                                align = "start",
                                scale = 95,
                                duration = 200,
                                exitDuration = 150,
                                zIndex = 1,
                                offset = 4,
                            }: {
    open: boolean;
    direction?: AnchorDirection;
    align?: "start" | "center" | "end";
    scale?: number;
    duration?: number;
    exitDuration?: number;
    zIndex?: number;
    offset?: number;
}) {
    const anchorRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // ------ 位置计算（根据 direction 和 align）------
    const calculatePosition = useCallback(() => {
        if (!anchorRef.current) return;
        const rect = anchorRef.current.getBoundingClientRect();
        let top = 0, left = 0;

        switch (direction) {
            case "bottom":
                top = rect.bottom + offset;
                if (align === "end") left = rect.right;
                else if (align === "center") left = rect.left + rect.width / 2;
                else left = rect.left; // start
                break;
            case "top":
                top = rect.top - offset;
                if (align === "end") left = rect.right;
                else if (align === "center") left = rect.left + rect.width / 2;
                else left = rect.left;
                break;
            case "left":
                left = rect.left - offset;
                if (align === "end") top = rect.bottom;
                else if (align === "center") top = rect.top + rect.height / 2;
                else top = rect.top;
                break;
            case "right":
                left = rect.right + offset;
                if (align === "end") top = rect.bottom;
                else if (align === "center") top = rect.top + rect.height / 2;
                else top = rect.top;
                break;
            default:
                top = rect.bottom + offset;
                left = rect.left;
        }
        setPosition({ top, left });
    }, [direction, align, offset]);

    useLayoutEffect(() => {
        if (!open) return;
        calculatePosition();
        window.addEventListener("resize", calculatePosition);
        window.addEventListener("scroll", calculatePosition, true);
        return () => {
            window.removeEventListener("resize", calculatePosition);
            window.removeEventListener("scroll", calculatePosition, true);
        };
    }, [open, calculatePosition]);

    // ------ 动画与对齐 transform ------
    const getTransform = (): string => {
        const s = open ? 1 : scale / 100;

        // 方向性的微小位移动画（隐藏时出现）
        const pixDisplace = {
            top: { x: 0, y: 4 },
            bottom: { x: 0, y: -4 },
            left: { x: 4, y: 0 },
            right: { x: -4, y: 0 },
            center: { x: 0, y: 0 },
        }[direction] ?? { x: 0, y: 0 };

        const dx = open ? 0 : pixDisplace.x;
        const dy = open ? 0 : pixDisplace.y;

        // 对齐偏移（百分比，用于居中或右/下对齐）
        let alignX = 0, alignY = 0;
        if (direction === "bottom" || direction === "top") {
            if (align === "center") alignX = -50;
            else if (align === "end") alignX = -100;
        } else if (direction === "left" || direction === "right") {
            if (align === "center") alignY = -50;
            else if (align === "end") alignY = -100;
        }

        // // 构建 transform 字符串（先 scale 后 translate）
        // return `scale(${s}) translate(${dx}px${alignX ? `, ${alignX}%` : ""}) translate(${alignX ? `${alignX === -100 ? "-100" : "-50"}` : "0"}%, ${dy}px${alignY ? ` ${alignY === -50 ? "-50" : alignY === -100 ? "-100" : "0"}` : ""})`;

        // 更清晰的做法：拆成独立函数
        return [
            `scale(${s})`,
            `translate(${dx}px, ${dy}px)`,
            alignX ? `translateX(${alignX}%)` : "",
            alignY ? `translateY(${alignY}%)` : "",
        ]
            .filter(Boolean)
            .join(" ");
    };

    const activeDuration = open ? duration : exitDuration;
    const transition = `opacity ${activeDuration}ms ease-in-out, transform ${activeDuration}ms ease-in-out`;

    const floatingStyle: React.CSSProperties = {
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex,
        transition,
        opacity: open ? 1 : 0,
        transform: getTransform(),
        pointerEvents: open ? "auto" : "none",
    };

    return { anchorRef, floatingStyle };
}