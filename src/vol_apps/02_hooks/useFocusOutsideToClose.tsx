// useFocusOutsideToClose.ts
import {useEffect, useRef} from "react";
import {useCallbackRef} from "@/vol_apps/02_hooks/00_useCallbackRef";

/**
 * Triggers close when focus moves outside the container.
 * @param open - Listening enabled only when true.
 * @param onClose - Callback to close.
 * @returns focusOutsideRef - A ref to attach to the container element.
 */
export const useFocusOutsideToClose = (
    {
        open,
        onClose
    }: {
        open: boolean,
        onClose: () => void
    }) => {

    const [anchorRef, internalRef] = useCallbackRef();

    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!open) return;

        const handleFocusOut = (e: FocusEvent) => {
            const container = internalRef.current;
            if (container && !container.contains(e.relatedTarget as Node)) {
                onCloseRef.current();
            }
        };

        const el = internalRef.current;
        el?.addEventListener("focusout", handleFocusOut);

        if (el) {
            el.tabIndex = -1;
            el.focus({preventScroll: true});
        }

        return () => {
            el?.removeEventListener("focusout", handleFocusOut);
        };
    }, [open]);

    return {focusOutsideRef: anchorRef};
};