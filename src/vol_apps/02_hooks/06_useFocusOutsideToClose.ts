import {useEffect, useRef} from "react";
import {useCallbackRef} from "@/vol_apps/02_hooks/00_useCallbackRef";

interface UseFocusOutsideToCloseOptions {
    open: boolean;
    onClose: () => void;
}

export function useFocusOutsideToClose({
                                           open,
                                           onClose,
                                       }: UseFocusOutsideToCloseOptions) {
    const [focusOutsideRef, containerDOM] = useCallbackRef();
    const [ignoreRef, ignoreDOM] = useCallbackRef();

    const autoFocusRef = useRef<HTMLElement>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!open) return;

        const el = containerDOM.current;
        if (!el) return;

        const handleFocusOut = (e: FocusEvent) => {
            const relatedTarget = e.relatedTarget as Node | null;
            if (!relatedTarget) return;
            if (el.contains(relatedTarget)) return;
            if (ignoreDOM.current?.contains(relatedTarget)) return;
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
    }, [open, containerDOM, ignoreDOM]);

    return {
        focusOutsideRef,
        focusOutsideIgnoreRef: ignoreRef,
        autoFocusRef,
    };
}