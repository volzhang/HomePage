import React, {useEffect, useState} from "react";
import {useDoubleRaf} from "@/vol_apps/02_hooks/raf/useDoubleRaf";
import {createPortal} from "react-dom";

export const useBetterPortal = (
    {open, exitDuration = 0}: { open: boolean; exitDuration?: number }) => {

    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);

    const doubleRaf = useDoubleRaf();

    useEffect(() => {
        if (open) {
            setMounted(true);
            doubleRaf(() => setVisible(true))
        } else {
            setVisible(false);
            const id = setTimeout(() => setMounted(false), exitDuration);
            return () => {
                clearTimeout(id)
            }
        }
    }, [open]);

    const portal = (
        node: React.ReactNode | null | undefined,
        container: HTMLElement | DocumentFragment = document.body,
    ) => {
        if (!mounted || node == null) return null;
        return createPortal(node, container);
    };

    return {visible, portal,};
};