// hooks/useFloating.ts
import { useLayoutEffect, useState, useCallback } from "react";
import {useCallbackRef} from "@/vol_apps/02_hooks/00_useCallbackRef";

export type FloatingDirection = "top" | "bottom" | "left" | "right";
export type FloatingAlign = "start" | "center" | "end";

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
 * - `floatingStyle`：包含定位、动画、层级等内联样式
 * - `position`：纯坐标 `{ top: number, left: number }`
 */
export function useFloating({
                                open,
                                direction = "bottom",
                                align = "start",
                                scale = 95,
                                duration = 200,
                                exitDuration = 150,
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

    const [anchorRef, elementRef] = useCallbackRef();
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // ---------- 位置计算 ----------
    const calculatePosition = useCallback(() => {
        const el = elementRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        let top = 0,
            left = 0;

        switch (direction) {
            case "bottom":
                top = rect.bottom + offset;
                if (align === "center") left = rect.left + rect.width / 2;
                else if (align === "end") left = rect.right;
                else left = rect.left;
                break;
            case "top":
                top = rect.top - offset;
                if (align === "center") left = rect.left + rect.width / 2;
                else if (align === "end") left = rect.right;
                else left = rect.left;
                break;
            case "right":
                left = rect.right + offset;
                if (align === "center") top = rect.top + rect.height / 2;
                else if (align === "end") top = rect.bottom;
                else top = rect.top;
                break;
            case "left":
                left = rect.left - offset;
                if (align === "center") top = rect.top + rect.height / 2;
                else if (align === "end") top = rect.bottom;
                else top = rect.top;
                break;
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

    // ---------- 动画与对齐 transform ----------
    const getTransform = (): string => {
        const s = open ? 1 : scale / 100;
        const scalePart = `scale(${s})`;

        // 方向性微动
        const getAnimOffset = (dir: FloatingDirection, isOpen: boolean): string => {
            if (isOpen) return "";
            switch (dir) {
                case "top":    return "translate(0px, 4px)";
                case "bottom": return "translate(0px, -4px)";
                case "left":   return "translate(4px, 0px)";
                case "right":  return "translate(-4px, 0px)";
                default:       return "";
            }
        };
        const animPart = getAnimOffset(direction, open);

        // 对齐 + 方向定位偏移
        const getAlignmentTransform = (
            dir: FloatingDirection,
            al: FloatingAlign
        ): string => {
            switch (dir) {
                case "bottom":
                    if (al === "center") return "translateX(-50%)";
                    if (al === "end")    return "translateX(-100%)";
                    return "";
                case "top":
                    if (al === "center") return "translateY(-100%) translateX(-50%)";
                    if (al === "end")    return "translateY(-100%) translateX(-100%)";
                    return "translateY(-100%)";
                case "left":
                    if (al === "center") return "translateX(-100%) translateY(-50%)";
                    if (al === "end")    return "translateX(-100%) translateY(-100%)";
                    return "translateX(-100%)";
                case "right":
                    if (al === "center") return "translateY(-50%)";
                    if (al === "end")    return "translateY(-100%)";
                    return "";
                default:
                    return "";
            }
        };
        const alignmentPart = getAlignmentTransform(direction, align);

        return [scalePart, animPart, alignmentPart].filter(Boolean).join(" ");
    };

    const floatingStyle: React.CSSProperties = {
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex,
        transition: `opacity ${open ? duration : exitDuration}ms ease-in-out, transform ${open ? duration : exitDuration}ms ease-in-out`,
        opacity: open ? 1 : 0,
        transform: getTransform(),
        pointerEvents: open ? "auto" : "none",
        visibility: open ? "visible" : "hidden",
    };

    return { anchorRef, floatingStyle, position };
}