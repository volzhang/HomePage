import {useEffect, useRef} from "react";

/**
 * 焦点移出容器外部时关闭。
 * @returns
 * - focusOutsideRef     – 绑定到容器元素
 * - focusOutsideIgnoreRef – 绑定到需要忽略的元素（如 Trigger），焦点移到该元素不会触发关闭
 * - autoFocusRef        – 可选，指定焦点移入时的目标元素（默认聚焦到容器自身）
 */
export function useFocusOutsideToClose({
                                           open,
                                           onClose,
                                       }: {
    open: boolean;
    onClose: () => void;
}) {
    const focusOutsideRef = useRef<HTMLElement | null>(null);
    const ignoreRef = useRef<HTMLElement | null>(null);
    const autoFocusRef = useRef<HTMLElement | null>(null);

    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!open) return;

        const el = focusOutsideRef.current;
        if (!el) return;

        const handleFocusOut = (e: FocusEvent) => {
            const relatedTarget = e.relatedTarget as Node | null;
            if (!relatedTarget) return;
            if (el.contains(relatedTarget)) return;
            if (ignoreRef.current?.contains(relatedTarget)) return;
            onCloseRef.current();
        };

        el.addEventListener("focusout", handleFocusOut);

        // 决定焦点目标
        const customTarget = autoFocusRef.current;
        let target: HTMLElement | null;

        if (customTarget && (customTarget === el || el.contains(customTarget))) {
            target = customTarget;
        } else {
            // 回退到容器自身
            if (!el.hasAttribute("tabindex")) el.tabIndex = -1;
            target = el;
        }

        target?.focus({preventScroll: true});

        return () => {
            el.removeEventListener("focusout", handleFocusOut);
        };
    }, [open]);

    return {
        focusOutsideRef,
        focusOutsideIgnoreRef: ignoreRef,
        autoFocusRef,
    };
}