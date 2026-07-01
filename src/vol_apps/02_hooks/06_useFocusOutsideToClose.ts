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

// import { useCallbackRef } from "@/vol_apps/02_hooks/00_useCallbackRef";
// import { useLayoutEffect, useRef } from "react";
//
// interface UseFocusOutsideToCloseOptions {
//     open: boolean;
//     onClose: () => void;
//     isReady: boolean; // 来自 useBetterPortal 的 visible
// }
//
// export function useFocusOutsideToClose({
//                                            open,
//                                            onClose,
//                                            isReady,
//                                        }: UseFocusOutsideToCloseOptions) {
//     const [focusOutsideRef, containerDOM] = useCallbackRef();
//     const [ignoreRef, ignoreDOM] = useCallbackRef();
//     const autoFocusRef = useRef<HTMLElement>(null);
//     const onCloseRef = useRef(onClose);
//     onCloseRef.current = onClose;
//
//     // 只在浮层完全可见时绑定事件和设置焦点
//     useLayoutEffect(() => {
//         if (!isReady) return;
//
//         const el = containerDOM.current;
//         if (!el) return;
//
//         // 1. 设置焦点
//         const target = autoFocusRef.current && el.contains(autoFocusRef.current)
//             ? autoFocusRef.current
//             : (el.tabIndex = -1, el);
//
//         target.focus({ preventScroll: true });
//
//         // 2. 监听焦点离开
//         const handleFocusOut = (e: FocusEvent) => {
//             const relatedTarget = e.relatedTarget as Node | null;
//             const target = e.target as Node;
//             if (!el.contains(target)) return;
//             if (relatedTarget) {
//                 if (el.contains(relatedTarget)) return;
//                 if (ignoreDOM.current?.contains(relatedTarget)) return;
//             }
//             onCloseRef.current();
//         };
//
//         el.addEventListener('focusout', handleFocusOut);
//         return () => {
//             el.removeEventListener('focusout', handleFocusOut);
//         };
//     }, [isReady, containerDOM, ignoreDOM]);
//
//     return {
//         focusOutsideRef,
//         focusOutsideIgnoreRef: ignoreRef,
//         autoFocusRef,
//     };
// }