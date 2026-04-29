// useClickOutsideToClose.ts
import { useEffect, useRef } from "react";

/**
 * Triggers close when a click occurs outside the container.
 * @param open - Listening enabled only when true.
 * @param onClose - Callback to close.
 * @returns insideRef - Attach this ref to the container element.
 */
export const useClickOutsideToClose = ({open, onClose}:{open: boolean, onClose: () => void}) => {
    const insideRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!open) return;

        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (insideRef.current?.contains(target)) return;
            onCloseRef.current();
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return {insideRef};
};