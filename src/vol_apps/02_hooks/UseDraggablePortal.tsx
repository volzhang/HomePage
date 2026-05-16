import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function useDraggablePortal({ open }: { open: boolean }) {
    const [container, setContainer] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const el = document.createElement("div");
        document.body.appendChild(el);
        setContainer(el);
        return () => {
            el.remove();
            setContainer(null);
        };
    }, [open]);

    const Portal = ({ children }: { children: React.ReactNode }) => {
        if (!container) return null;
        return createPortal(children, container);
    };

    return { Portal };
}