// useEscapeClose.ts
import {useEffect, useRef} from "react";
import {useCallbackRef} from "@/vol_apps/02_hooks/00_useCallbackRef";

/**
 * 监听 Escape 键关闭浮层
 * @param open - 浮层当前是否打开（为 true 时才启用监听）
 * @param onClose - 关闭回调
 */

export const useKeyEscapeToClose = (open: boolean, onClose: () => void) => {
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onCloseRef.current();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open]);
};

/**
 * 当浮层关闭（open=false）且绑定元素聚焦时，按 Enter 触发打开
 * @param open - 浮层当前是否打开（为 false 时才启用监听）
 * @param onOpenChange - 切换
 * @returns 回调 ref，绑定到需要监听的元素上
 */

export const useKeyEnterToToggle = (open: boolean, onOpenChange: (state:boolean) => void) => {
    const [enterRef, internalRef] = useCallbackRef();
    const onOpenRef = useRef(onOpenChange);
    onOpenRef.current = onOpenChange;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && document.activeElement === internalRef.current) {
                e.preventDefault();
                onOpenRef.current(!open);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, internalRef]);

    return enterRef
};

/**
 * 当浮层关闭（open=false）且绑定元素聚焦时，按 Space 触发打开
 * @param open - 浮层当前是否打开
 * @param onOpenChange - 切换
 * @returns 回调 ref，绑定到需要监听的元素上
 */

export const useKeySpaceToToggle = (open: boolean, onOpenChange: (state:boolean) => void) => {
    const [spaceRef, internalRef] = useCallbackRef();
    const onOpenRef = useRef(onOpenChange);
    onOpenRef.current = onOpenChange;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === " " && document.activeElement === internalRef.current) {
                e.preventDefault(); // 防止页面滚动
                onOpenRef.current(!open);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, internalRef]);

    return spaceRef
};