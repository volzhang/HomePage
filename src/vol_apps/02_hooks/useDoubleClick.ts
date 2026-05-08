import {useEffect, useRef} from "react";

export function useDoubleClick(
    open: boolean,
    handle: () => void,
) {
    const handleRef = useRef(handle);
    handleRef.current = handle;
    useEffect(() => {
        if (!open) return;
        const html = document.documentElement;
        const onDoubleClick = () => handleRef.current();
        html.addEventListener("dblclick", onDoubleClick);
        return () => html.removeEventListener("dblclick", onDoubleClick);
    }, [open]);
}