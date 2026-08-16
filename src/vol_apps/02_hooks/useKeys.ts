import {useEffect, useRef} from "react";

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