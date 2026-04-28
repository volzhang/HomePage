// useFocusOutsideToClose.ts
import {useEffect, useRef} from "react";

/**
 * Triggers close when focus moves outside the container.
 * @param open - Listening enabled only when true.
 * @param onClose - Callback to close.
 * @returns containerRef - A ref to attach to the container element.
 */
export const useFocusOutsideToClose = (open: boolean, onClose: () => void) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!open) return;

        const handleFocusOut = (e: FocusEvent) => {
            const container = containerRef.current;
            if (container && !container.contains(e.relatedTarget as Node)) {
                onCloseRef.current();
            }
        };

        const el = containerRef.current;
        el?.addEventListener("focusout", handleFocusOut);

        if (el) {
            el.tabIndex = -1;
            el.focus({preventScroll: true});
        }

        return () => {
            el?.removeEventListener("focusout", handleFocusOut);
        };
    }, [open]);

    return containerRef;
};