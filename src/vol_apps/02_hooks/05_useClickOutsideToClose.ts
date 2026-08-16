import {useEffect, useRef} from "react";

/**
 * 点击容器外部时关闭。
 * @returns
 * - clickOutsideRef  – 绑定到容器元素
 * - ignoreRef         – 绑定到需要忽略的元素（如 Trigger），点击该元素不会触发关闭
 */

export function useClickOutsideToClose({open, onClose}: {
    open: boolean,
    onClose: () => void;
}) {

    const clickOutsideRef = useRef<HTMLElement | null>(null); // 容器
    const ignoreRef = useRef<HTMLElement | null>(null);   // 忽略区

    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!open) return;

        const handler = (e: MouseEvent) => {
            const target = e.target as Node;

            if (!clickOutsideRef.current) return;
            if (clickOutsideRef.current.contains(target)) return;
            if (ignoreRef.current && ignoreRef.current.contains(target)) return;

            onCloseRef.current();
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open])

    return {clickOutsideRef, clickOutsideIgnoreRef: ignoreRef};
}