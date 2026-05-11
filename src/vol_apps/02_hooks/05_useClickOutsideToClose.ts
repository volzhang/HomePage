import {useEffect, useRef} from "react";
import { useCallbackRef } from "@/vol_apps/02_hooks/00_useCallbackRef";

interface UseClickOutsideToCloseOptions {
    open: boolean;
    onClose: () => void;
}

/**
 * 点击容器外部时关闭。
 * @returns
 * - clickOutsideRef  – 绑定到容器元素
 * - ignoreRef         – 绑定到需要忽略的元素（如 Trigger），点击该元素不会触发关闭
 */

export function useClickOutsideToClose({ open, onClose }: UseClickOutsideToCloseOptions) {
    const [clickOutsideRef, containerDOM] = useCallbackRef();
    const [ignoreRef, ignoreDOM] = useCallbackRef();

    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!open) return;

        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (!containerDOM.current) return;
            if (containerDOM.current.contains(target)) return;
            if (ignoreDOM.current?.contains(target)) return;
            onCloseRef.current();
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open, containerDOM, ignoreDOM]);

    return { clickOutsideRef, clickOutsideIgnoreRef:ignoreRef };
}