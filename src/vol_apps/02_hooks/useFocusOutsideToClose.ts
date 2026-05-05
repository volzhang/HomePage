import { useEffect, useRef } from "react";
import { useCallbackRef } from "@/vol_apps/02_hooks/00_useCallbackRef";

interface UseFocusOutsideToCloseOptions {
    open: boolean;
    onClose: () => void;
}

/**
 * 焦点移出容器时关闭。
 * @returns
 * - focusOutsideRef  – 绑定到容器元素
 * - ignoreRef         – 绑定到需要忽略的元素，焦点移入时不会触发关闭
 */
export function useFocusOutsideToClose({ open, onClose }: UseFocusOutsideToCloseOptions) {
    const [focusOutsideRef, containerDOM] = useCallbackRef();
    const [ignoreRef, ignoreDOM] = useCallbackRef();
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!open) return;

        const handleFocusOut = (e: FocusEvent) => {
            const relatedTarget = e.relatedTarget as Node | null;
            if (!relatedTarget) return;
            if (containerDOM.current?.contains(relatedTarget)) return;
            if (ignoreDOM.current?.contains(relatedTarget)) return;
            onCloseRef.current();
        };

        const el = containerDOM.current;
        el?.addEventListener("focusout", handleFocusOut);

        if (el) {
            el.tabIndex = -1;
            el.focus({ preventScroll: true });
        }

        return () => {
            el?.removeEventListener("focusout", handleFocusOut);
        };
    }, [open, containerDOM, ignoreDOM]);

    return { focusOutsideRef, focusOutsideIgnoreRef:ignoreRef };
}