import { useEffect, useRef } from "react";

interface UseDoubleClickOptions {
    open: boolean;
    handle: () => void;
    containerSelector?: string | string[];
}

export const useDoubleClick = ({
                                   open,
                                   handle,
                                   containerSelector = [
                                       "#root", "#tiles_beside",
                                       'body', 'html'],
                               }: UseDoubleClickOptions) => {
    const handleRef = useRef(handle);
    handleRef.current = handle;
    const selector = Array.isArray(containerSelector)
        ? containerSelector.join(",")
        : containerSelector;
    useEffect(() => {
        if (!open) return;
        const onDoubleClick = (e: MouseEvent) => {
            if (!(e.target instanceof Element)) return;
            if (!e.target.matches(selector)) return;
            handleRef.current();
        };
        document.addEventListener("dblclick", onDoubleClick);
        return () => {
            document.removeEventListener("dblclick", onDoubleClick);
        };
    }, [open, selector]);
};