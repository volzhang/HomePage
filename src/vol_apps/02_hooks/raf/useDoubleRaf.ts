import {useCallback, useEffect, useRef} from "react";

export const useDoubleRaf = () => {
    const id1 = useRef(0);
    const id2 = useRef(0);

    const clear = useCallback(() => {
        cancelAnimationFrame(id1.current);
        cancelAnimationFrame(id2.current);
    }, []);

    const doubleRaf = useCallback((callback: () => void) => {
        clear();
        id1.current = requestAnimationFrame(() => {
            id2.current = requestAnimationFrame(() => {
                callback();
            });
        });
    }, [clear]);
    useEffect(() => clear, [clear]);
    return doubleRaf;
};