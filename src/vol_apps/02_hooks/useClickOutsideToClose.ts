// hooks/useClickOutsideToClose.ts
import {useEffect, useRef} from "react";
import {useCallbackRef} from "@/vol_apps/02_hooks/00_useCallbackRef";

/**
 * 监听容器外部的点击/触摸，触发关闭。
 * @param open - 仅当为 true 时启用监听
 * @param onClose - 关闭回调
 * @returns `anchorRef` - 回调 ref，绑定到容器元素（不限制元素类型）
 */
export function useClickOutsideToClose({
                                           open,
                                           onClose,
                                       }: {
    open: boolean;
    onClose: () => void;
}) {
    const [anchorRef, internalRef] = useCallbackRef();

    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!open) return;

        const handler = (e: MouseEvent | TouchEvent) => {
            const target = e.target as Node;
            if (!internalRef.current || internalRef.current.contains(target)) return;
            onCloseRef.current();
        };

        document.addEventListener("mousedown", handler);
        document.addEventListener("touchstart", handler);
        return () => {
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("touchstart", handler);
        };
    }, [open, internalRef]);

    return {clickOutsideRef: anchorRef};
}