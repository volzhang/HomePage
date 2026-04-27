// useEscapeClose.ts
import {useEffect, useRef} from "react";

/**
 * Listens for Escape key to close when `open` is true.
 * @param open - Whether the element is open (listening enabled).
 * @param onClose - Callback to close
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